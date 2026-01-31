import { JobPartnerMapping } from '../models/JobPartnerMapping.js';
import { Job } from '../../hiringBazaar/models/Job.js';
import { Candidate } from '../../hiringBazaar/models/Candidate.js';
import { Partner } from '../models/Partner.js';

// @desc    Get jobs shared with partner
// @route   GET /api/partner/jobs
export const getSharedJobs = async (req, res) => {
    try {
        const partnerId = req.partner.id;

        // Find all job mappings for this partner
        const mappings = await JobPartnerMapping.find({
            partnerId,
            isActive: true
        }).populate({
            path: 'jobId',
            match: { status: { $in: ['active', 'posted'] } },
            populate: {
                path: 'userId',
                select: 'fullName email'
            }
        });

        // Filter out null jobs (deleted or inactive)
        const jobs = mappings
            .filter(m => m.jobId !== null)
            .map(m => ({
                ...m.jobId._doc,
                sharedAt: m.createdAt
            }));

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        console.error('Get shared jobs error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single job details
// @route   GET /api/partner/jobs/:jobId
export const getJobDetails = async (req, res) => {
    try {
        const { jobId } = req.params;
        const partnerId = req.partner.id;

        // Verify partner has access to this job
        const mapping = await JobPartnerMapping.findOne({
            jobId,
            partnerId,
            isActive: true
        });

        if (!mapping) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this job'
            });
        }

        const job = await Job.findById(jobId).populate('userId', 'fullName email');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
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

// @desc    Upload resume for a job
// @route   POST /api/partner/jobs/:jobId/upload
export const uploadResumeForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const partnerId = req.partner.id;
        const { source } = req.body;
        const files = req.files; // Expecting multiple files from multer

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No resumes provided'
            });
        }

        // 1. Security Check: Verify partner has access to this job
        const mapping = await JobPartnerMapping.findOne({
            jobId,
            partnerId,
            isActive: true
        });

        if (!mapping) {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to share candidates for this job'
            });
        }

        // 2. Data Check: Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // 3. Setup Queue and Partner Info
        const { pdfQueue } = await import('../../shared/services/queueService.js');
        const partner = await Partner.findById(partnerId);
        const results = [];

        // 4. Loop through files and create candidates
        for (const file of files) {
            const resumeUrl = `/uploads/candidates/partner/${file.filename}`;

            const candidate = await Candidate.create({
                jobId,
                addedBy: partnerId,
                // Placeholders: AI worker will overwrite these
                name: file.originalname.split('.')[0], 
                email: `pending_${Date.now()}_${Math.random().toString(36).substring(7)}@parsing.com`,
                phoneNumber: '0000000000',
                resumeUrl,
                source: source || 'PARTNER_BULK_UPLOAD',
                uploadSource: 'partner',
                uploaderId: partnerId,
                uploaderModel: 'Partner',
                uploaderDetails: {
                    name: partner.partnerName,
                    organizationName: partner.organizationName,
                    uploaderType: 'partner'
                },
                parsingStatus: 'PENDING',
                hrFeedback: 'Pending Review'
            });

            // 5. Add specific candidate to AI Parsing Queue
            await pdfQueue.add('process-resume', {
                candidateId: candidate._id
            });

            results.push({
                id: candidate._id,
                fileName: file.originalname,
                status: 'QUEUED'
            });
        }

        res.status(201).json({
            success: true,
            message: `${files.length} resumes uploaded and queued for AI parsing`,
            results
        });

    } catch (error) {
        console.error('Partner Bulk Upload Error:', error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get partner's uploaded candidates
// @route   GET /api/partner/uploads
export const getPartnerUploads = async (req, res) => {
    try {
        const partnerId = req.partner.id;

        const candidates = await Candidate.find({
            uploaderId: partnerId,
            uploaderModel: 'Partner'
        })
            .populate('jobId', 'jobTitle')
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


// controllers/candidate.controller.js

export const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const partnerId = req.partner.id; // From your auth middleware

    const candidate = await Candidate.findOne({ 
      _id: id, 
      uploaderId: partnerId // Security: Only fetch if this partner uploaded them
    }).populate('jobId', 'jobTitle companyName');

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found or unauthorized access" });
    }

    res.json({ success: true, candidate });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Server error" });
  }
};