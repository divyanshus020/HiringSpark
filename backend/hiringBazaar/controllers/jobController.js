import mongoose from 'mongoose';
import { Job } from '../models/Job.js';
import { Platform } from '../models/Platform.js';
import { User } from '../models/User.js';
import * as aiService from '../../shared/services/aiService.js';


// @desc    Create new job draft
// @route   POST /api/jobs/draft
export const createJobDraft = async (req, res) => {
  try {
    const job = await Job.create({
      userId: req.user._id.toString(),
      status: 'draft',
      currentStep: 1
    });

    res.status(201).json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job step 1 (Job Details)
// @route   PUT /api/jobs/:id/step1
export const updateJobStep1 = async (req, res) => {
  try {
    const {
      jobTitle,
      companyName,
      location,
      jobType,
      minExp,
      maxExp,
      openings,
      minSalary,
      maxSalary,
      description,
      requirements,
      skills
    } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update job details
    Object.assign(job, {
      jobTitle,
      companyName,
      location,
      jobType,
      minExp,
      maxExp,
      openings,
      minSalary,
      maxSalary,
      description,
      requirements,
      skills,
      currentStep: 2
    });

    await job.save();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job step 2 (Plan Selection)
// @route   PUT /api/jobs/:id/step2
export const updateJobStep2 = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!['basic', 'premium'].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan type'
      });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    job.plan = plan;
    job.currentStep = plan === 'basic' ? 3 : 4; // Skip pricing for premium

    await job.save();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job step 3 (Pricing for basic plan)
// @route   PUT /api/jobs/:id/step3
export const updateJobStep3 = async (req, res) => {
  try {
    const { pricing } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (job.plan !== 'basic') {
      return res.status(400).json({
        success: false,
        message: 'Pricing only required for basic plan'
      });
    }

    // Calculate total amount
    const totalAmount = pricing.reduce((sum, item) => sum + item.total, 0);

    job.pricing = pricing;
    job.totalAmount = totalAmount;
    job.currentStep = 4;

    await job.save();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update job step 4 (Contact Information and Finalize)
// @route   PUT /api/jobs/:id/step4
export const updateJobStep4 = async (req, res) => {
  try {
    const { contactPerson, companyEmail, preferredDate, note } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update contact info
    Object.assign(job, {
      contactPerson,
      companyEmail,
      preferredDate,
      note,
      currentStep: 4,
      status: 'pending' // Ready for posting
    });

    await job.save();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all jobs for user
// @route   GET /api/jobs
// @desc    Get all jobs for user (with limited fields)
// @route   GET /api/jobs
// @desc    Get all jobs for user with aggregation
// @route   GET /api/jobs
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.aggregate([
      // Step 1: Match jobs for current user
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id)
        }
      },

      // Step 2: Lookup to get candidate count
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: 'jobId',
          as: 'candidates'
        }
      },

      // Step 3: Add fields for candidate count and formatted dates
      {
        $addFields: {
          applications: { $size: '$candidates' },
          createdAtFormatted: {
            $dateToString: {
              format: "%d %b %Y",
              date: "$createdAt",
              timezone: "Asia/Kolkata"
            }
          },
          updatedAtFormatted: {
            $dateToString: {
              format: "%d %b %Y",
              date: "$updatedAt",
              timezone: "Asia/Kolkata"
            }
          },
          postedDate: {
            $cond: {
              if: { $eq: ["$status", "posted"] },
              then: {
                $dateToString: {
                  format: "%d %b %Y",
                  date: "$updatedAt",
                  timezone: "Asia/Kolkata"
                }
              },
              else: "Not Posted Yet"
            }
          }
        }
      },

      // Step 4: Sort by latest updated (Move before projection for correct timestamp sorting)
      {
        $sort: { updatedAt: -1 }
      },

      // Step 5: Project only required fields
      {
        $project: {
          _id: 1,
          jobTitle: 1,
          companyName: 1,
          status: 1,
          currentStep: 1,
          createdAt: "$createdAtFormatted",
          updatedAt: "$updatedAtFormatted",
          postedDate: 1,
          applications: 1,
          // Additional fields if needed
          plan: 1,
          totalAmount: 1,
          location: 1, // Added for UI consistency if needed
          jobType: 1
        }
      }
    ]);

    // Map status to readable format
    const statusMap = {
      'draft': 'Draft',
      'pending': 'Pending Review',
      'active': 'Active',
      'rejected': 'Rejected',
      'posted': 'Active' // Legacy support
    };

    const formattedJobs = jobs.map(job => ({
      ...job,
      statusText: statusMap[job.status] || job.status,
      // Add status color for frontend
      statusColor: job.status === 'draft' ? 'gray' :
        job.status === 'pending' ? 'orange' :
          job.status === 'active' || job.status === 'posted' ? 'green' : 'red'
    }));

    res.json({
      success: true,
      count: formattedJobs.length,
      jobs: formattedJobs
    });
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
export const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this job'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Post job (change status to posted)
// @route   PUT /api/jobs/:id/post
export const postJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (job.status !== 'pending' && job.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Job must be in pending or draft status to submit for approval'
      });
    }

    job.status = 'pending';
    await job.save();

    res.json({
      success: true,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
// @desc    Delete job
// @route   DELETE /api/jobs/:id
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate job description using AI
// @route   POST /api/jobs/generate-description
export const generateJobDescriptionAI = async (req, res) => {
  try {
    const { jobTitle, companyName, location, jobType } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Job title is required'
      });
    }

    const result = await aiService.generateJobDescription(jobTitle, companyName, location, jobType);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

