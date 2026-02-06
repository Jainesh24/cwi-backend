const mongoose = require('mongoose');

const baselineSchema = new mongoose.Schema({
  organizationId: {
    type: String,
    required: true,
    index: true
  },
  department: {
    type: String,
    required: true,
    enum: ['Emergency', 'Surgery', 'ICU', 'Pediatrics', 'Oncology', 'Radiology', 'Laboratory', 'Pharmacy', 'General Ward', 'Outpatient']
  },
  expectedDaily: {
    type: Number,
    required: true,
    min: 0
  },
  riskThreshold: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 70
  },
  infectiousRatio: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 30
  },
  sharpsRatio: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 15
  },
  costPerKg: {
    type: Number,
    required: true,
    min: 0,
    default: 2.5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique department per organization
baselineSchema.index({ organizationId: 1, department: 1 }, { unique: true });

const Baseline = mongoose.model('Baseline', baselineSchema);

module.exports = Baseline;
