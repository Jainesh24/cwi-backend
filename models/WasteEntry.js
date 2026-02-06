const mongoose = require('mongoose');

const wasteEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
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
  wasteType: {
    type: String,
    required: true,
    enum: ['Infectious', 'Pharmaceutical', 'Sharps', 'Chemical', 'Radioactive', 'General', 'Recyclable']
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  procedureCategory: {
    type: String,
    required: true,
    enum: ['Routine Care', 'Minor Procedure', 'Major Surgery', 'Diagnostic', 'Treatment', 'Emergency Response', 'Chemotherapy', 'Dialysis']
  },
  disposalMethod: {
    type: String,
    required: true,
    enum: ['Incineration', 'Autoclave', 'Chemical Treatment', 'Secure Landfill', 'Recycling', 'Special Handling']
  },
  shift: {
    type: String,
    required: true,
    enum: ['Morning', 'Afternoon', 'Night']
  },
  notes: {
    type: String,
    default: ''
  },
  aiAnalysis: {
    riskScore: {
      type: Number,
      min: 0,
      max: 100
    },
    anomalyDetected: {
      type: Boolean,
      default: false
    },
    assessment: String,
    recommendedAction: String,
    alertMessage: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
wasteEntrySchema.index({ organizationId: 1, timestamp: -1 });
wasteEntrySchema.index({ department: 1, timestamp: -1 });
wasteEntrySchema.index({ 'aiAnalysis.anomalyDetected': 1 });

const WasteEntry = mongoose.model('WasteEntry', wasteEntrySchema);

module.exports = WasteEntry;
