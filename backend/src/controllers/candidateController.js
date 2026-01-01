import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';

// @desc    Add candidate to job (admin only)
// @route   POST /api/candidates
export const addCandidate = async (req, res) => {
  try {
    const { jobId, name, email, phoneNumber, source } = req.body;
    
    // Check if job exists and belongs to HR
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    
    // Handle file upload
    const resumeUrl = req.file ? `/uploads/resumes/${req.file.filename}` : null;
    
    if (!resumeUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Resume file is required' 
      });
    }
    
    // Create candidate
    const candidate = await Candidate.create({
      jobId,
      addedBy: req.user.id,
      name,
      email,
      phoneNumber,
      resumeUrl,
      source,
      hrFeedback: 'PENDING'
    });
    
    res.status(201).json({
      success: true,
      candidate
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get candidates for a job
// @route   GET /api/candidates/job/:jobId
export const getCandidatesByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Check if job exists and belongs to HR
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    const candidates = await Candidate.find({ jobId })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: candidates.length,
      candidates
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update candidate feedback
// @route   PUT /api/candidates/:id/feedback
export const updateCandidateFeedback = async (req, res) => {
  try {
    const { hrFeedback } = req.body;
    const validFeedback = ['PENDING', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED'];
    
    if (!validFeedback.includes(hrFeedback)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid feedback status' 
      });
    }
    
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId', 'hrId');
    
    if (!candidate) {
      return res.status(404).json({ 
        success: false, 
        message: 'Candidate not found' 
      });
    }
    // Check if HR owns the job
    if (candidate.addedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    candidate.hrFeedback = hrFeedback;
    await candidate.save();
    
    res.json({
      success: true,
      candidate
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
