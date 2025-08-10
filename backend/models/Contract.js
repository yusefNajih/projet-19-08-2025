const mongoose = require('mongoose');

const ContractSchema = new mongoose.Schema({
  clientName: String,
  clientEmail: String,
  clientPhone: String,
  vehicle: {
    make: String,
    model: String,
    plate: String
  },
  startDate: Date,
  endDate: Date,
  pricePerDay: Number,
  total: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Contract', ContractSchema);