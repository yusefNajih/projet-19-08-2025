const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const Client = require('../models/Client');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reservations
// @desc    Get all reservations with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.startDate && req.query.endDate) {
      filter.startDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    const reservations = await Reservation.find(filter)
      .populate('client', 'firstName lastName email phone')
      .populate('vehicle', 'brand model licensePlate dailyPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reservation.countDocuments(filter);

    res.json({
      reservations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get reservation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('client')
      .populate('vehicle');
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    console.error('Get reservation error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private
router.post('/', auth, [
  body('client').isMongoId().withMessage('Invalid client ID'),
  body('vehicle').isMongoId().withMessage('Invalid vehicle ID'),
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
  body('pickupLocation').optional().trim(),
  body('returnLocation').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      client: clientId, vehicle: vehicleId, startDate, endDate,
      pickupLocation, returnLocation, notes
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    if (start < now) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    // Check if client exists and is eligible
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    if (!client.isEligibleForRental()) {
      return res.status(400).json({ 
        message: 'Client is not eligible for rental',
        reasons: [
          client.status !== 'active' ? `Client status: ${client.status}` : null,
          client.licenseExpiryDate <= new Date() ? 'License expired' : null,
          client.age < 21 ? 'Client under 21 years old' : null
        ].filter(Boolean)
      });
    }

    // Check if vehicle exists and is available
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status !== 'available') {
      return res.status(400).json({ 
        message: `Vehicle is not available (status: ${vehicle.status})` 
      });
    }

    // Check for conflicting reservations
    const conflict = await Reservation.checkConflict(vehicleId, start, end);
    if (conflict) {
      return res.status(400).json({ 
        message: 'Vehicle is already reserved for this period',
        conflictingReservation: conflict.reservationNumber
      });
    }

    // Calculate duration and total amount
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const dailyRate = vehicle.dailyPrice;
    const baseAmount = dailyRate * totalDays;

    const reservation = new Reservation({
      client: clientId,
      vehicle: vehicleId,
      startDate: start,
      endDate: end,
      dailyRate,
      totalDays,
      baseAmount,
      totalAmount: baseAmount, // Will be recalculated by pre-save middleware
      pickupLocation,
      returnLocation,
      notes
    });

    await reservation.save();

    // Update vehicle status
    vehicle.status = 'rented';
    await vehicle.save();

    // Populate the reservation for response
    await reservation.populate('client', 'firstName lastName email phone');
    await reservation.populate('vehicle', 'brand model licensePlate');

    res.status(201).json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reservations/:id
// @desc    Update reservation
// @access  Private
router.put('/:id', auth, [
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('status').optional().isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('pickupLocation').optional().trim(),
  body('returnLocation').optional().trim(),
  body('mileageStart').optional().isInt({ min: 0 }).withMessage('Start mileage must be a positive number'),
  body('mileageEnd').optional().isInt({ min: 0 }).withMessage('End mileage must be a positive number'),
  body('fuelLevelStart').optional().isIn(['empty', 'quarter', 'half', 'three_quarters', 'full']).withMessage('Invalid fuel level'),
  body('fuelLevelEnd').optional().isIn(['empty', 'quarter', 'half', 'three_quarters', 'full']).withMessage('Invalid fuel level'),
  body('notes').optional().trim(),
  body('additionalFees').optional().isArray().withMessage('Additional fees must be an array'),
  body('additionalFees.*.type').optional().isIn(['fuel', 'insurance', 'damage', 'late_return', 'cleaning', 'other']).withMessage('Invalid fee type'),
  body('additionalFees.*.description').optional().notEmpty().withMessage('Fee description is required'),
  body('additionalFees.*.amount').optional().isFloat({ min: 0 }).withMessage('Fee amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Validate date changes
    if (req.body.startDate || req.body.endDate) {
      const newStartDate = req.body.startDate ? new Date(req.body.startDate) : reservation.startDate;
      const newEndDate = req.body.endDate ? new Date(req.body.endDate) : reservation.endDate;

      if (newStartDate >= newEndDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }

      // Check for conflicts if dates are changing
      if (req.body.startDate || req.body.endDate) {
        const conflict = await Reservation.checkConflict(
          reservation.vehicle,
          newStartDate,
          newEndDate,
          reservation._id
        );
        
        if (conflict) {
          return res.status(400).json({ 
            message: 'Vehicle is already reserved for this period',
            conflictingReservation: conflict.reservationNumber
          });
        }

        // Recalculate duration and amounts if dates changed
        const diffTime = Math.abs(newEndDate - newStartDate);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        reservation.totalDays = totalDays;
        reservation.startDate = newStartDate;
        reservation.endDate = newEndDate;
      }
    }

    // Handle status changes
    if (req.body.status && req.body.status !== reservation.status) {
      const vehicle = await Vehicle.findById(reservation.vehicle);
      
      if (req.body.status === 'active' && reservation.status === 'confirmed') {
        // Starting the rental
        reservation.actualStartDate = new Date();
        if (req.body.mileageStart) {
          vehicle.mileage = req.body.mileageStart;
        }
      } else if (req.body.status === 'completed' && reservation.status === 'active') {
        // Completing the rental
        reservation.actualEndDate = new Date();
        if (req.body.mileageEnd) {
          vehicle.mileage = req.body.mileageEnd;
        }
        vehicle.status = 'available';
        
        // Update client statistics
        const client = await Client.findById(reservation.client);
        client.totalRentals += 1;
        client.totalSpent += reservation.totalAmount;
        await client.save();
      } else if (req.body.status === 'cancelled') {
        // Cancelling the reservation
        vehicle.status = 'available';
        reservation.cancelledDate = new Date();
        if (req.body.cancellationReason) {
          reservation.cancellationReason = req.body.cancellationReason;
        }
      }
      
      await vehicle.save();
    }

    // Update other fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'startDate' && key !== 'endDate') {
        reservation[key] = req.body[key];
      }
    });

    await reservation.save();

    // Populate the reservation for response
    await reservation.populate('client', 'firstName lastName email phone');
    await reservation.populate('vehicle', 'brand model licensePlate');

    res.json({
      message: 'Reservation updated successfully',
      reservation
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Delete reservation
// @access  Private (Admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Only allow deletion of pending or cancelled reservations
    if (!['pending', 'cancelled'].includes(reservation.status)) {
      return res.status(400).json({ 
        message: 'Can only delete pending or cancelled reservations' 
      });
    }

    // If reservation was confirmed or active, make vehicle available again
    if (['confirmed', 'active'].includes(reservation.status)) {
      const vehicle = await Vehicle.findById(reservation.vehicle);
      vehicle.status = 'available';
      await vehicle.save();
    }

    await Reservation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid reservation ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reservations/calendar-view
// @desc    Get reservations for calendar view
// @access  Private
router.get('/calendar-view', auth, [
  query('start').isISO8601().withMessage('Invalid start date'),
  query('end').isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { start, end } = req.query;

    const reservations = await Reservation.find({
      $or: [
        {
          startDate: { $gte: new Date(start), $lte: new Date(end) }
        },
        {
          endDate: { $gte: new Date(start), $lte: new Date(end) }
        },
        {
          startDate: { $lte: new Date(start) },
          endDate: { $gte: new Date(end) }
        }
      ],
      status: { $in: ['confirmed', 'active'] }
    })
    .populate('client', 'firstName lastName')
    .populate('vehicle', 'brand model licensePlate')
    .select('reservationNumber startDate endDate status client vehicle');

    // Format for calendar
    const events = reservations.map(reservation => ({
      id: reservation._id,
      title: `${reservation.vehicle.brand} ${reservation.vehicle.model} - ${reservation.client.firstName} ${reservation.client.lastName}`,
      start: reservation.startDate,
      end: reservation.endDate,
      status: reservation.status,
      reservationNumber: reservation.reservationNumber,
      vehicle: reservation.vehicle,
      client: reservation.client
    }));

    res.json(events);
  } catch (error) {
    console.error('Get calendar reservations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reservations/overdue-list
// @desc    Get overdue reservations
// @access  Private
router.get('/overdue-list', auth, async (req, res) => {
  try {
    const overdueReservations = await Reservation.find({
      status: 'active',
      endDate: { $lt: new Date() }
    })
    .populate('client', 'firstName lastName email phone')
    .populate('vehicle', 'brand model licensePlate')
    .sort({ endDate: 1 });

    res.json(overdueReservations);
  } catch (error) {
    console.error('Get overdue reservations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

