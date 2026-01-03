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

    // Check if job is active
    if (job.status !== 'active' && job.status !== 'posted') {
      return res.status(400).json({
        success: false,
        message: 'This job is not active. Candidates can only be added to active/approved jobs.'
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

    const formattedCandidates = candidates.map(c => ({
      ...c._doc,
      status: c.hrFeedback
    }));

    res.json({
      success: true,
      count: candidates.length,
      candidates: formattedCandidates
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
  console.log(req.body);
  try {
    const { feedback } = req.body;
    const validFeedback = ['PENDING', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED', 'Pending Review', 'Shortlisted by HB', 'Engaged', 'Taken', 'Shortlisted by HR', 'Interviewed', 'Rejected', 'Hired'];
    console.log(validFeedback);
    if (!validFeedback.includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback status'
      });
    }
    console.log(feedback);
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobId', 'userId');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    // Check if HR owns the job or is Admin
    const isOwner = candidate.jobId && candidate.jobId.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }
    candidate.hrFeedback = feedback;
    await candidate.save();

    res.json({
      success: true,
      candidate: {
        ...candidate._doc,
        status: candidate.hrFeedback
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Get all candidates for current user's jobs
// @route   GET /api/candidates/my-candidates
export const getMyCandidates = async (req, res) => {
  try {
    // 1. Find all jobs belonging to this HR
    const myJobs = await Job.find({ userId: req.user.id });
    const jobIds = myJobs.map(job => job._id);

    // 2. Find all candidates associated with those jobs
    const candidates = await Candidate.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'jobTitle')
      .sort({ createdAt: -1 });

    const formattedCandidates = candidates.map(c => ({
      ...c._doc,
      status: c.hrFeedback
    }));

    res.json({
      success: true,
      count: candidates.length,
      candidates: formattedCandidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
