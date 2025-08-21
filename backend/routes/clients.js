


const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth, authorize } = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');
const Client = require('../models/Client');

const router = express.Router();


// Multer config for client documents
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads/clients', req.params.id);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const type = req.body.type || file.fieldname;
    cb(null, `${type}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// @route   POST /api/clients/:id/documents
// @desc    Upload a document (CIN, permis, etc.) for a client
// @access  Private
router.post('/:id/documents', auth, upload.single('document'), async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    const type = req.body.type; // 'license' ou 'nationalId'
    if (!['license', 'nationalId'].includes(type)) return res.status(400).json({ message: 'Invalid document type' });
    client.documents[type] = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      uploadDate: new Date()
    };
    await client.save();
    res.json({ message: 'Document uploaded', document: client.documents[type] });
  } catch (err) {
    console.error('Upload client document error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients/:id/documents/:type
// @desc    Download/view a client document
// @access  Private
router.get('/:id/documents/:type', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    const type = req.params.type;
    if (!client.documents[type] || !client.documents[type].path) return res.status(404).json({ message: 'Document not found' });
    res.sendFile(path.resolve(client.documents[type].path));
  } catch (err) {
    console.error('Get client document error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clients/:id/documents/:type
// @desc    Delete a client document
// @access  Private
router.delete('/:id/documents/:type', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    const type = req.params.type;
    if (!client.documents[type] || !client.documents[type].path) return res.status(404).json({ message: 'Document not found' });
    // Remove file from disk
    fs.unlinkSync(client.documents[type].path);
    client.documents[type] = undefined;
    await client.save();
    res.json({ message: 'Document deleted' });
  } catch (err) {
    console.error('Delete client document error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



// @route   GET /api/clients
// @desc    Get all clients with filtering and pagination
// @access  Private
router.get('/', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['active', 'blacklisted', 'suspended']).withMessage('Invalid status')
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
    if (req.query.search) {
      filter.$or = [
        { firstName: new RegExp(req.query.search, 'i') },
        { lastName: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') },
        { phone: new RegExp(req.query.search, 'i') },
        { nationalId: new RegExp(req.query.search, 'i') },
        { licenseNumber: new RegExp(req.query.search, 'i') }
      ];
    }

    const clients = await Client.find(filter)
      .select('-documents') // Exclude documents for list view
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Client.countDocuments(filter);

    res.json({
      clients,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients/:id
// @desc    Get client by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client);
  } catch (error) {
    console.error('Get client error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/clients
// @desc    Create a new client
// @access  Private
router.post('/', auth, [
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').notEmpty().trim().withMessage('Phone number is required'),
  body('dateOfBirth').isISO8601().withMessage('Invalid date of birth'),
  body('nationalId').notEmpty().trim().withMessage('National ID is required'),
  body('licenseNumber').notEmpty().trim().withMessage('License number is required'),
  body('licenseExpiryDate').isISO8601().withMessage('Invalid license expiry date'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.postalCode').optional().trim(),
  body('address.country').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName, lastName, email, phone, dateOfBirth, nationalId,
      licenseNumber, licenseExpiryDate, address, notes
    } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({
      $or: [{ email }, { nationalId }, { licenseNumber }]
    });

    if (existingClient) {
      let field = 'email';
      if (existingClient.nationalId === nationalId) field = 'national ID';
      if (existingClient.licenseNumber === licenseNumber) field = 'license number';
      
      return res.status(400).json({
        message: `Client already exists with this ${field}`
      });
    }

    // Check if client is at least 21 years old
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 21) {
      return res.status(400).json({
        message: 'Client must be at least 21 years old'
      });
    }

    // Check if license is not expired
    if (new Date(licenseExpiryDate) <= new Date()) {
      return res.status(400).json({
        message: 'License is expired'
      });
    }

    const client = new Client({
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationalId,
      licenseNumber,
      licenseExpiryDate,
      address,
      notes
    });

    await client.save();

    res.status(201).json({
      message: 'Client created successfully',
      client
    });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clients/:id
// @desc    Update client
// @access  Private
router.put('/:id', auth, [
  body('firstName').optional().notEmpty().trim().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('phone').optional().notEmpty().trim().withMessage('Phone number cannot be empty'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('nationalId').optional().notEmpty().trim().withMessage('National ID cannot be empty'),
  body('licenseNumber').optional().notEmpty().trim().withMessage('License number cannot be empty'),
  body('licenseExpiryDate').optional().isISO8601().withMessage('Invalid license expiry date'),
  body('status').optional().isIn(['active', 'blacklisted', 'suspended']).withMessage('Invalid status'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.postalCode').optional().trim(),
  body('address.country').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check for duplicate email, nationalId, or licenseNumber if being updated
    if (req.body.email || req.body.nationalId || req.body.licenseNumber) {
      const duplicateQuery = { _id: { $ne: req.params.id } };
      const orConditions = [];
      
      if (req.body.email && req.body.email !== client.email) {
        orConditions.push({ email: req.body.email });
      }
      if (req.body.nationalId && req.body.nationalId !== client.nationalId) {
        orConditions.push({ nationalId: req.body.nationalId });
      }
      if (req.body.licenseNumber && req.body.licenseNumber !== client.licenseNumber) {
        orConditions.push({ licenseNumber: req.body.licenseNumber });
      }

      if (orConditions.length > 0) {
        duplicateQuery.$or = orConditions;
        const existingClient = await Client.findOne(duplicateQuery);
        
        if (existingClient) {
          let field = 'email';
          if (req.body.nationalId && existingClient.nationalId === req.body.nationalId) field = 'national ID';
          if (req.body.licenseNumber && existingClient.licenseNumber === req.body.licenseNumber) field = 'license number';
          
          return res.status(400).json({
            message: `Another client already exists with this ${field}`
          });
        }
      }
    }

    // Validate age if date of birth is being updated
    if (req.body.dateOfBirth) {
      const birthDate = new Date(req.body.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 21) {
        return res.status(400).json({
          message: 'Client must be at least 21 years old'
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key === 'address' && typeof req.body[key] === 'object') {
        // Merge address object
        client.address = { ...client.address, ...req.body[key] };
      } else {
        client[key] = req.body[key];
      }
    });

    await client.save();

    res.json({
      message: 'Client updated successfully',
      client
    });
  } catch (error) {
    console.error('Update client error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/clients/:id
// @desc    Delete client
// @access  Private (Admin only)
router.delete('/:id', [auth, authorize('admin')], async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Check if client has active reservations
    const Reservation = require('../models/Reservation');
    const activeReservations = await Reservation.countDocuments({
      client: req.params.id,
      status: { $in: ['confirmed', 'active'] }
    });

    if (activeReservations > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete client with active reservations' 
      });
    }

    await Client.findByIdAndDelete(req.params.id);

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/clients/:id/rental-history
// @desc    Get client rental history
// @access  Private
router.get('/:id/rental-history', auth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const Reservation = require('../models/Reservation');
    const reservations = await Reservation.find({ client: req.params.id })
      .populate('vehicle', 'brand model licensePlate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Reservation.countDocuments({ client: req.params.id });

    res.json({
      client: {
        id: client._id,
        fullName: client.fullName,
        totalRentals: client.totalRentals,
        totalSpent: client.totalSpent
      },
      reservations,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error('Get client history error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/clients/:id/blacklist
// @desc    Blacklist or unblacklist a client
// @access  Private (Manager/Admin only)
router.put('/:id/blacklist', [auth, authorize('admin', 'manager')], [
  body('blacklist').isBoolean().withMessage('Blacklist must be a boolean'),
  body('reason').optional().isString().trim().withMessage('Reason must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const { blacklist, reason } = req.body;

    if (blacklist) {
      client.status = 'blacklisted';
      client.blacklistReason = reason || 'No reason provided';
    } else {
      client.status = 'active';
      client.blacklistReason = undefined;
    }

    await client.save();

    res.json({
      message: `Client ${blacklist ? 'blacklisted' : 'removed from blacklist'} successfully`,
      client
    });
  } catch (error) {
    console.error('Blacklist client error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid client ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

