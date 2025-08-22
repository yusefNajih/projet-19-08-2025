const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationNumber: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  dailyRate: {
    type: Number,
    required: true,
    min: 0
  },
  totalDays: {
    type: Number,
    required: true,
    min: 1
  },
  baseAmount: {
    type: Number,
    required: true,
    min: 0
  },
  additionalFees: [{
    type: {
      type: String,
      enum: ['fuel', 'insurance', 'damage', 'late_return', 'cleaning', 'other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deposit: {
    amount: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    paidDate: Date
  },
  pickupLocation: {
    type: String,
    trim: true
  },
  returnLocation: {
    type: String,
    trim: true
  },
  mileageStart: {
    type: Number,
    min: 0
  },
  mileageEnd: {
    type: Number,
    min: 0
  },
  fuelLevelStart: {
    type: String,
    enum: ['empty', 'quarter', 'half', 'three_quarters', 'full']
  },
  fuelLevelEnd: {
    type: String,
    enum: ['empty', 'quarter', 'half', 'three_quarters', 'full']
  },
  notes: {
    type: String,
    trim: true
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: String,
    enum: ['client', 'company'],
    trim: true
  },
  cancelledDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
// reservationSchema.index({ reservationNumber: 1 });
// reservationSchema.index({ client: 1 });
// reservationSchema.index({ vehicle: 1 });
// reservationSchema.index({ status: 1 });
// reservationSchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware to generate reservation number
reservationSchema.pre('validate', async function(next) {
  if (!this.reservationNumber) {
    const count = await this.constructor.countDocuments();
    const year = new Date().getFullYear();
    this.reservationNumber = `RES-${year}-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Pre-save middleware to calculate total amount
reservationSchema.pre('save', function(next) {
  // Calculate base amount
  this.baseAmount = this.dailyRate * this.totalDays;
  
  // Calculate additional fees total
  const additionalFeesTotal = this.additionalFees.reduce((total, fee) => total + fee.amount, 0);
  
  // Calculate total amount
  this.totalAmount = this.baseAmount + additionalFeesTotal;
  
  next();
});

// Method to check if reservation conflicts with another reservation
reservationSchema.statics.checkConflict = async function(vehicleId, startDate, endDate, excludeReservationId = null) {
  const query = {
    vehicle: vehicleId,
    status: { $in: ['confirmed', 'active'] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ]
  };
  
  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }
  
  const conflictingReservation = await this.findOne(query);
  return conflictingReservation;
};

// Method to calculate duration in days
reservationSchema.methods.getDuration = function() {
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Method to check if reservation is overdue
reservationSchema.methods.isOverdue = function() {
  if (this.status !== 'active') return false;
  return new Date() > new Date(this.endDate);
};

module.exports = mongoose.model('Reservation', reservationSchema);

