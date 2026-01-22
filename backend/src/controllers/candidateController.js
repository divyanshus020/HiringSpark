import { Candidate } from '../models/Candidate.js';
import { Job } from '../models/Job.js';
import { User } from '../models/User.js';
import { transporter } from '../config/mail.js';
import { env } from '../config/env.js';
import { candidateAddedEmailTemplate, candidateShortlistedEmailTemplate } from '../utils/emailTemplates.js';



// @desc    Add candidate to job (admin only)
// @route   POST /api/candidates
export const addCandidate = async (req, res) => {
  try {
    const { jobId, name, email, phoneNumber, source } = req.body;

    // Check if job exists and belongs to HR
    const job = await Job.findById(jobId).populate('userId', 'fullName email');
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

    // Send email notification to HR
    try {
      if (transporter && env.EMAIL_USER) {
        const hrEmail = job.userId.email;
        const hrName = job.userId.fullName;
        const jobTitle = job.jobTitle;

        const emailHtml = candidateAddedEmailTemplate(
          hrName,
          name,
          jobTitle,
          email,
          phoneNumber
        );

        await transporter.sendMail({
          from: `"HireSpark Admin" <${env.EMAIL_USER}>`,
          to: hrEmail,
          subject: `🎯 New Candidate Added - ${jobTitle}`,
          html: emailHtml
        });

        console.log(`✅ Email sent to HR: ${hrEmail} for candidate: ${name}`);
      } else {
        console.log('⚠️ Transporter or EMAIL_USER not configured. Skipping email notification.');
      }
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      // Don't fail the request if email fails
    }

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

// @desc    Bulk upload candidates to job (admin only)
// @route   POST /api/candidates/bulk
export const bulkUploadCandidates = async (req, res) => {
  try {
    const { jobId, source } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No resumes uploaded'
      });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const results = [];
    const { pdfQueue } = await import('../services/queueService.js');

    for (const file of files) {
      const resumeUrl = `/uploads/resumes/${file.filename}`;

      const candidate = await Candidate.create({
        jobId,
        addedBy: req.user.id,
        name: file.originalname.split('.')[0], // Placeholder name until parsed
        email: 'pending@parsing.com', // Placeholder
        resumeUrl,
        source: source || 'BULK_UPLOAD',
        parsingStatus: 'PENDING'
      });
      // Add to queue
      await pdfQueue.add('process-resume', {
        candidateId: candidate._id,
      });

      results.push(candidate);
    }
    console.log(results);

    res.status(201).json({
      success: true,
      message: `${files.length} candidates uploaded and queued for parsing`,
      candidates: results
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

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Return all candidates to both Admin and HR
    const filter = { jobId };

    const candidates = await Candidate.find(filter)
      .sort({ atsScore: -1, createdAt: -1 });

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
  try {
    const { feedback } = req.body;
    const validFeedback = ['PENDING', 'INTERVIEW_SCHEDULED', 'HIRED', 'REJECTED', 'Pending Review', 'Shortlisted by HB', 'Engaged', 'Taken', 'Shortlisted by HR', 'Interviewed', 'Rejected', 'Hired', 'SHORTLISTED'];
    if (!validFeedback.includes(feedback)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid feedback status'
      });
    }
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

    // Send email notification to candidate if SHORTLISTED
    if (feedback === 'SHORTLISTED' && candidate.email) {
      try {
        if (transporter && env.EMAIL_USER) {
          // Check if jobId is populated
          const jobTitle = candidate.jobId && candidate.jobId.jobTitle
            ? candidate.jobId.jobTitle
            : 'the position';

          const emailHtml = candidateShortlistedEmailTemplate(
            candidate.name,
            jobTitle,
            'HireSpark'
          );

          await transporter.sendMail({
            from: `"HireSpark Team" <${env.EMAIL_USER}>`,
            to: candidate.email,
            subject: `🎉 Application Update: Shortlisted for ${jobTitle}`,
            html: emailHtml
          });

          console.log(`✅ Shortlist email sent to candidate: ${candidate.email}`);
        }
      } catch (emailError) {
        console.error('❌ Error sending shortlist email:', emailError);
        // Continue execution to return response even if email fails
      }
    }

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
    const myJobs = await Job.find({ userId: req.user.id });
    const jobIds = myJobs.map(job => job._id);

    // HR sees all candidates associated with those jobs
    const candidates = await Candidate.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'jobTitle')
      .sort({ atsScore: -1, createdAt: -1 });

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
