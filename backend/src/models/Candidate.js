import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: String,
  resumeUrl: { type: String, required: true },
  source: String,

  isParsed: { type: Boolean, default: false },
  parsingStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },

  // AI Extracted Data
  basicInfo: {
    fullName: String,
    jobTitle: String,
    location: String,
    email: String,
    phone: String,
    experienceYears: Number
  },
  executiveSummary: String,
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  workExperience: [{
    role: String,
    company: String,
    startDate: String,
    endDate: String,
    responsibilities: [String]
  }],
  skills: {
    technicalSkills: {
      advanced: [String],
      intermediate: [String],
      beginner: [String]
    },
    softSkills: [String]
  },
  aiAssessment: {
    technicalFit: Number,
    culturalFit: Number,
    overallScore: Number,
    strengths: [String],
    areasForGrowth: [String]
  },
  atsScore: { type: Number, default: 0 },
  certifications: [String],

  hrFeedback: {
    type: String,
    enum: ['PENDING', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED', 'Pending Review', 'Shortlisted by HB', 'Engaged', 'Taken', 'Shortlisted by HR', 'Interviewed', 'Rejected', 'Hired', 'SHORTLISTED'],
    default: 'Pending Review'
  }
}, { timestamps: true });

export const Candidate = mongoose.model('Candidate', candidateSchema);