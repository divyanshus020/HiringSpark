import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Platform } from '../models/Platform.js';
import { Job } from '../models/Job.js';
import { Candidate } from '../models/Candidate.js';

// --- ADMIN DASHBOARD STATS ---
export const getAdminStats = async (req, res) => {
  try {
    // Get current date and calculate date ranges
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Total counts
    const totalHRs = await User.countDocuments({ role: 'HR' });
    const totalJobs = await Job.countDocuments();
    const totalCandidates = await Candidate.countDocuments();
    const pendingJobsCount = await Job.countDocuments({ status: 'pending' });

    // Current month counts
    const currentMonthHRs = await User.countDocuments({
      role: 'HR',
      createdAt: { $gte: currentMonthStart }
    });
    const currentMonthJobs = await Job.countDocuments({
      createdAt: { $gte: currentMonthStart }
    });
    const currentMonthCandidates = await Candidate.countDocuments({
      createdAt: { $gte: currentMonthStart }
    });

    // Last month counts
    const lastMonthHRs = await User.countDocuments({
      role: 'HR',
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    const lastMonthJobs = await Job.countDocuments({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    const lastMonthCandidates = await Candidate.countDocuments({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });

    // Calculate percentage trends
    const calculateTrend = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0; // If no previous data, show 100% increase if there's current data
      }
      return Math.round(((current - previous) / previous) * 100);
    };

    const hrTrend = calculateTrend(currentMonthHRs, lastMonthHRs);
    const jobTrend = calculateTrend(currentMonthJobs, lastMonthJobs);
    const candidateTrend = calculateTrend(currentMonthCandidates, lastMonthCandidates);

    res.json({
      success: true,
      data: {
        totalHRs,
        totalJobs,
        totalCandidates,
        pendingJobsCount,
        trends: {
          hrTrend,
          jobTrend,
          candidateTrend
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// --- HR USER MANAGEMENT (RUD) ---
export const getAllHRs = async (req, res) => {
  try {
    const hrs = await User.find({ role: 'HR' }).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: hrs.length, hrs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHRById = async (req, res) => {
  try {
    const hr = await User.findOne({ _id: req.params.id, role: 'HR' }).select('-password');
    if (!hr) return res.status(404).json({ success: false, message: 'HR not found' });
    res.json({ success: true, hr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateHR = async (req, res) => {
  try {
    const { isActive, fullName, orgName, address } = req.body;
    const hr = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'HR' },
      { isActive, fullName, orgName, address },
      { new: true }
    ).select('-password');

    if (!hr) return res.status(404).json({ success: false, message: 'HR not found' });
    res.json({ success: true, hr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteHRAndData = async (req, res) => {
  try {
    const hrId = req.params.id;

    // 1. Check if HR exists
    const hr = await User.findOne({ _id: hrId, role: 'HR' });
    if (!hr) return res.status(404).json({ success: false, message: "HR not found" });

    // 2. Find all jobs by this HR to clean up candidates
    const hrJobs = await Job.find({ userId: hrId });
    const jobIds = hrJobs.map(job => job._id);

    // 3. Delete all candidates associated with those jobs
    await Candidate.deleteMany({ jobId: { $in: jobIds } });

    // 4. Delete all jobs associated with this HR
    await Job.deleteMany({ userId: hrId });

    // 5. Finally, delete the HR user
    await User.findByIdAndDelete(hrId);

    res.json({
      success: true,
      message: `HR ${hr.email} and all associated jobs/candidates deleted successfully.`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- PLATFORM MANAGEMENT (CRUD) ---
export const updatePlatform = async (req, res) => {
  try {
    const { currentPrice, isActive, name, unit } = req.body;
    const platform = await Platform.findByIdAndUpdate(
      req.params.id,
      { currentPrice, isActive, name, unit },
      { new: true }
    );
    if (!platform) return res.status(404).json({ success: false, message: 'Platform not found' });
    res.json({ success: true, platform });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- GLOBAL VIEW (Master Read) ---
export const getAllCandidatesMaster = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .populate('jobId', 'jobTitle companyName')
      .populate('addedBy', 'fullName')
      .sort({ createdAt: -1 });
    const formattedCandidates = candidates.map(c => ({
      ...c._doc,
      status: c.hrFeedback
    }));
    res.json({ success: true, count: candidates.length, candidates: formattedCandidates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getAllJobsMaster = async (req, res) => {
  try {
    // Admin sees only pending/posted jobs from every HR (not drafts)
    const jobs = await Job.find({ status: { $ne: 'draft' } })
      .populate('userId', 'fullName email orgName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all jobs for a specific HR (including drafts)
// @route   GET /api/admin/hrs/:hrId/jobs
export const getJobsByHR = async (req, res) => {
  try {
    const { hrId } = req.params;

    // Verify HR exists
    const hr = await User.findOne({ _id: hrId, role: 'HR' });
    if (!hr) {
      return res.status(404).json({ success: false, message: 'HR not found' });
    }

    // Get all jobs for this HR with candidate count using aggregation
    const jobs = await Job.aggregate([
      // Match jobs for this HR
      {
        $match: {
          userId: new mongoose.Types.ObjectId(hrId)
        }
      },
      // Lookup candidates for each job
      {
        $lookup: {
          from: 'candidates',
          localField: '_id',
          foreignField: 'jobId',
          as: 'candidates'
        }
      },
      // Add candidate count field
      {
        $addFields: {
          candidateCount: { $size: '$candidates' }
        }
      },
      // Remove the candidates array, keep only the count
      {
        $project: {
          candidates: 0
        }
      },
      // Sort by creation date
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) return res.status(404).json({ success: false, message: 'Not found' });

    // In a real app, you'd also delete the file from /uploads/resumes/ here
    await candidate.deleteOne();
    res.json({ success: true, message: 'Candidate deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update job status (Approve/Reject)
// @route   PUT /api/admin/jobs/:id/status
export const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'active', 'rejected', 'posted'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'fullName email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Send email notification to HR when job is approved
    if (status === 'active' || status === 'posted') {
      try {
        const { transporter } = await import('../config/mail.js');
        const { jobApprovedEmailTemplate } = await import('../utils/emailTemplates.js');
        const { env } = await import('../config/env.js');

        if (transporter && env.EMAIL_USER) {
          const hrEmail = job.userId.email;
          const hrName = job.userId.fullName;
          const jobTitle = job.jobTitle;
          const jobLocation = job.location;
          const jobType = job.jobType;
          const postedDate = new Date(job.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          const emailHtml = jobApprovedEmailTemplate(
            hrName,
            jobTitle,
            jobLocation,
            jobType,
            postedDate
          );

          await transporter.sendMail({
            from: `"HiringBazaar Admin" <${env.EMAIL_USER}>`,
            to: hrEmail,
            subject: `✅ Job Approved - ${jobTitle}`,
            html: emailHtml
          });

          console.log(`✅ Job approval email sent to HR: ${hrEmail} for job: ${jobTitle}`);
        } else {
          console.log('⚠️ Transporter or EMAIL_USER not configured. Skipping job approval email.');
        }
      } catch (emailError) {
        console.error('❌ Error sending job approval email:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: `Job status updated to ${status}`,
      job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete any job (Admin)
// @route   DELETE /api/admin/jobs/:id
export const deleteJobAdmin = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

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
