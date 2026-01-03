import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Section 1: Job Details (Draft ke liye optional)
  jobTitle: {
    type: String,
    required: false,  // ✅ Change to false for draft
    default: ''
  },
  companyName: {
    type: String,
    required: false,  // ✅ Change to false
    default: ''
  },
  location: {
    type: String,
    required: false,  // ✅ Change to false
    default: ''
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship'],
    required: false,  // ✅ Change to false
    default: 'full-time'
  },
  minExp: {
    type: Number,
    required: false,  // ✅ Change to false
    default: 0
  },
  maxExp: {
    type: Number,
    required: false,  // ✅ Change to false
    default: 0
  },
  openings: {
    type: Number,
    required: false,  // ✅ Change to false
    default: 1
  },
  minSalary: {
    type: Number,
    required: false,  // ✅ Change to false
    default: 0
  },
  maxSalary: {
    type: Number,
    required: false,  // ✅ Change to false
    default: 0
  },
  description: {
    type: String,
    required: false,  // ✅ Change to false
    default: ''
  },
  requirements: [{
    type: String
  }],
  skills: [{
    type: String
  }],

  // Section 2: Plan
  plan: {
    type: String,
    enum: ['basic', 'premium'],
    required: false,  // ✅ Change to false
    default: 'basic'
  },

  // Section 3: Pricing
  pricing: [{
    platform: { type: String },
    pricePerDay: { type: Number },
    days: { type: Number },
    total: { type: Number }
  }],

  // Section 4: Contact Information
  contactPerson: {
    type: String,
    required: false,  // ✅ Change to false
    default: ''
  },
  companyEmail: {
    type: String,
    required: false,  // ✅ Change to false
    default: ''
  },
  preferredDate: {
    type: Date
  },
  note: {
    type: String
  },

  // Status and Progress
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'rejected', 'posted'],
    default: 'draft'
  },
  currentStep: {
    type: Number,
    min: 1,
    max: 4,
    default: 1
  },
  totalAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export const Job = mongoose.model('Job', jobSchema);