const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Morocco'
    }
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  nationalId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licenseExpiryDate: {
    type: Date,
    required: true
  },
  documents: {
    license: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    nationalId: {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  status: {
    type: String,
    enum: ['active', 'blacklisted', 'suspended'],
    default: 'active'
  },
  blacklistReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  totalRentals: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// // Index for efficient queries
// clientSchema.index({ email: 1 });
// clientSchema.index({ nationalId: 1 });
// clientSchema.index({ licenseNumber: 1 });
// clientSchema.index({ status: 1 });
// clientSchema.index({ firstName: 1, lastName: 1 });

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
clientSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Method to check if license is expiring soon
clientSchema.methods.isLicenseExpiringSoon = function(daysAhead = 30) {
  if (!this.licenseExpiryDate) return false;
  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() + daysAhead);
  return this.licenseExpiryDate <= checkDate;
};

// Method to check if client is eligible for rental
clientSchema.methods.isEligibleForRental = function() {
  if (this.status !== 'active') return false;
  if (this.licenseExpiryDate <= new Date()) return false;
  if (this.age < 21) return false; // Minimum age requirement
  return true;
};

module.exports = mongoose.model('Client', clientSchema);

