
const express = require('express');
const { query, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Client = require('../models/Client');
const Reservation = require('../models/Reservation');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/dashboard/reset-revenue
// @desc    Reset total revenue (set all completed reservations' totalAmount to 0)
// @access  Private, Admin only, DEV only
router.post('/reset-revenue', auth, authorize('admin'), async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ message: 'Not allowed in production' });
  }
  try {
    const result = await Reservation.updateMany(
      { status: 'completed' },
      { $set: { totalAmount: 0 } }
    );
    res.json({ message: 'Total revenue reset', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Reset revenue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // Get basic counts
    const totalVehicles = await Vehicle.countDocuments();
    const totalClients = await Client.countDocuments({ status: 'active' });
    const activeRentals = await Reservation.countDocuments({ status: 'active' });
    
    // Get vehicle status breakdown
    const vehicleStatusStats = await Vehicle.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get total revenue from completed reservations
    const revenueStats = await Reservation.aggregate([
      {
        $match: { status: { $in: ['active', 'completed'] } }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalReservations: { $sum: 1 }
        }
      }
    ]);

    // Get monthly revenue for the current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await Reservation.aggregate([
      {
        $match: {
          status: 'completed',
          actualEndDate: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$actualEndDate' },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    // Get top clients by total spent
    const topClients = await Client.find({ status: 'active' })
      .sort({ totalSpent: -1 })
      .limit(5)
      .select('firstName lastName totalSpent totalRentals');

    // Get recent reservations
    const recentReservations = await Reservation.find()
      .populate('client', 'firstName lastName')
      .populate('vehicle', 'brand model licensePlate')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('reservationNumber status startDate endDate client vehicle');

    // Get overdue reservations count
    const overdueCount = await Reservation.countDocuments({
      status: 'active',
      endDate: { $lt: new Date() }
    });

    // Get expiring documents count (next 30 days)
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);
    
    const expiringDocuments = await Vehicle.find({
      $or: [
        { 'documents.registration.expiryDate': { $lte: expiringDate } },
        { 'documents.insurance.expiryDate': { $lte: expiringDate } },
        { 'documents.inspection.expiryDate': { $lte: expiringDate } }
      ]
    }).countDocuments();

    // Total des cautions en cours (réservations actives ou confirmed)
    const depositStats = await Reservation.aggregate([
      {
        $match: { status: { $in: ['active', 'confirmed'] }, 'deposit.amount': { $gt: 0 } }
      },
      {
        $group: {
          _id: null,
          totalDeposit: { $sum: '$deposit.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overview: {
        totalVehicles,
        totalClients,
        activeRentals,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        overdueCount,
        expiringDocuments,
        totalDeposit: depositStats[0]?.totalDeposit || 0,
        depositCount: depositStats[0]?.count || 0
      },
      vehicleStatus: vehicleStatusStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: item._id,
        revenue: item.revenue,
        count: item.count
      })),
      topClients,
      recentReservations
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/revenue
// @desc    Get revenue analytics
// @access  Private
router.get('/revenue', auth, [
  query('period').optional().isIn(['week', 'month', 'quarter', 'year']).withMessage('Invalid period'),
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Invalid year')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || 'month';
    const year = parseInt(req.query.year) || new Date().getFullYear();

    let groupBy, startDate, endDate;

    switch (period) {
      case 'week':
        groupBy = { $week: '$actualEndDate' };
        startDate = new Date(year, 0, 1);
        endDate = new Date(year + 1, 0, 1);
        break;
      case 'quarter':
        groupBy = { $ceil: { $divide: [{ $month: '$actualEndDate' }, 3] } };
        startDate = new Date(year, 0, 1);
        endDate = new Date(year + 1, 0, 1);
        break;
      case 'year':
        groupBy = { $year: '$actualEndDate' };
        startDate = new Date(year - 5, 0, 1);
        endDate = new Date(year + 1, 0, 1);
        break;
      default: // month
        groupBy = { $month: '$actualEndDate' };
        startDate = new Date(year, 0, 1);
        endDate = new Date(year + 1, 0, 1);
    }

    const revenueData = await Reservation.aggregate([
      {
        $match: {
          status: 'completed',
          actualEndDate: {
            $gte: startDate,
            $lt: endDate
          }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 },
          avgRevenue: { $avg: '$totalAmount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      period,
      year,
      data: revenueData
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/alerts
// @desc    Get system alerts and notifications
// @access  Private
router.get('/alerts', auth, async (req, res) => {
  try {
    const alerts = [];

    // Overdue reservations
    const overdueReservations = await Reservation.find({
      status: 'active',
      endDate: { $lt: new Date() }
    })
    .populate('client', 'firstName lastName phone')
    .populate('vehicle', 'brand model licensePlate')
    .select('reservationNumber endDate client vehicle');

    overdueReservations.forEach(reservation => {
      const daysOverdue = Math.ceil((new Date() - reservation.endDate) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'overdue',
        priority: 'high',
        title: 'Overdue Rental',
        message: `${reservation.vehicle.brand} ${reservation.vehicle.model} (${reservation.vehicle.licensePlate}) is ${daysOverdue} day(s) overdue`,
        data: {
          reservationNumber: reservation.reservationNumber,
          client: reservation.client,
          vehicle: reservation.vehicle,
          daysOverdue
        }
      });
    });

    // Expiring vehicle documents
    const expiringDate = new Date();
    expiringDate.setDate(expiringDate.getDate() + 30);

    const vehiclesWithExpiringDocs = await Vehicle.find({
      $or: [
        { 'documents.registration.expiryDate': { $lte: expiringDate } },
        { 'documents.insurance.expiryDate': { $lte: expiringDate } },
        { 'documents.inspection.expiryDate': { $lte: expiringDate } }
      ]
    });

    vehiclesWithExpiringDocs.forEach(vehicle => {
      const expiringDocs = vehicle.getExpiringDocuments(30);
      expiringDocs.forEach(doc => {
        const daysUntilExpiry = Math.ceil((doc.expiryDate - new Date()) / (1000 * 60 * 60 * 24));
        alerts.push({
          type: 'document_expiry',
          priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
          title: 'Document Expiring',
          message: `${vehicle.brand} ${vehicle.model} ${doc.type} expires in ${daysUntilExpiry} day(s)`,
          data: {
            vehicle: {
              id: vehicle._id,
              brand: vehicle.brand,
              model: vehicle.model,
              licensePlate: vehicle.licensePlate
            },
            documentType: doc.type,
            expiryDate: doc.expiryDate,
            daysUntilExpiry
          }
        });
      });
    });

    // Expiring client licenses
    const clientsWithExpiringLicenses = await Client.find({
      status: 'active',
      licenseExpiryDate: { $lte: expiringDate }
    });

    clientsWithExpiringLicenses.forEach(client => {
      const daysUntilExpiry = Math.ceil((client.licenseExpiryDate - new Date()) / (1000 * 60 * 60 * 24));
      alerts.push({
        type: 'license_expiry',
        priority: daysUntilExpiry <= 7 ? 'high' : 'medium',
        title: 'Client License Expiring',
        message: `${client.firstName} ${client.lastName}'s license expires in ${daysUntilExpiry} day(s)`,
        data: {
          client: {
            id: client._id,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email
          },
          expiryDate: client.licenseExpiryDate,
          daysUntilExpiry
        }
      });
    });

    // Sort alerts by priority and date
    alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    res.json({
      alerts,
      summary: {
        total: alerts.length,
        high: alerts.filter(a => a.priority === 'high').length,
        medium: alerts.filter(a => a.priority === 'medium').length,
        low: alerts.filter(a => a.priority === 'low').length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

