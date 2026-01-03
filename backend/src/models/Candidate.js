import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: String,
  resumeUrl: { type: String, required: true },
  source: String,

  hrFeedback: {
    type: String,
    enum: ['PENDING', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED', 'Pending Review', 'Shortlisted by HB', 'Engaged', 'Taken', 'Shortlisted by HR', 'Interviewed', 'Rejected', 'Hired'],
    default: 'Pending Review'
  }
}, { timestamps: true });

export const Candidate = mongoose.model('Candidate', candidateSchema);