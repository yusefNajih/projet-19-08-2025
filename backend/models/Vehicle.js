const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['essence', 'diesel', 'electric', 'hybrid']
  },
  dailyPrice: {
    type: Number,
    required: true,
    min: 200
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['available', 'rented', 'maintenance', 'out_of_service'],
    default: 'available'
  },
  color: {
    type: String,
    trim: true
  },
  transmission: {
    type: String,
    enum: ['manual', 'automatic'],
    default: 'manual'
  },
  seats: {
    type: Number,
    min: 2,
    max: 50,
    default: 5
  },
  image: { 
    type: String
  },
  images: [{
    filename: String,
    originalName: String,
    path: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  documents: {
    registration: {
      filename: String,
      originalName: String,
      path: String,
      expiryDate: Date,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    insurance: {
      filename: String,
      originalName: String,
      path: String,
      expiryDate: Date,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    },
    inspection: {
      filename: String,
      originalName: String,
      path: String,
      expiryDate: Date,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
// vehicleSchema.index({ status: 1 });
// vehicleSchema.index({ brand: 1, model: 1 });
// vehicleSchema.index({ licensePlate: 1 });

// Virtual for full name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.brand} ${this.model} (${this.licensePlate})`;
});

// Method to check if documents are expiring soon
vehicleSchema.methods.getExpiringDocuments = function(daysAhead = 30) {
  const expiringDocs = [];
  const checkDate = new Date();
  checkDate.setDate(checkDate.getDate() + daysAhead);

  if (this.documents.registration?.expiryDate && this.documents.registration.expiryDate <= checkDate) {
    expiringDocs.push({ type: 'registration', expiryDate: this.documents.registration.expiryDate });
  }
  if (this.documents.insurance?.expiryDate && this.documents.insurance.expiryDate <= checkDate) {
    expiringDocs.push({ type: 'insurance', expiryDate: this.documents.insurance.expiryDate });
  }
  if (this.documents.inspection?.expiryDate && this.documents.inspection.expiryDate <= checkDate) {
    expiringDocs.push({ type: 'inspection', expiryDate: this.documents.inspection.expiryDate });
  }

  return expiringDocs;
};

module.exports = mongoose.model('Vehicle', vehicleSchema);

