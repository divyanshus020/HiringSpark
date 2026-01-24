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
        const { name, email, phoneNumber, source } = req.body;

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

        // Check if job exists
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Handle file upload
        const resumeUrl = req.file ? `/uploads/candidates/partner/${req.file.filename}` : null;

        if (!resumeUrl) {
            return res.status(400).json({
                success: false,
                message: 'Resume file is required'
            });
        }

        // Get partner details
        const partner = await Partner.findById(partnerId);

        // Create candidate with partner source tracking
        const candidate = await Candidate.create({
            jobId,
            addedBy: partnerId,
            name,
            email,
            phoneNumber,
            resumeUrl,
            source: source || 'PARTNER_UPLOAD',
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

        // Add to parsing queue
        const { pdfQueue } = await import('../../shared/services/queueService.js');
        await pdfQueue.add('process-resume', {
            candidateId: candidate._id
        });

        res.status(201).json({
            success: true,
            message: 'Resume uploaded successfully and queued for processing',
            candidate: {
                id: candidate._id,
                name: candidate.name,
                email: candidate.email,
                jobId: candidate.jobId,
                uploadSource: candidate.uploadSource,
                uploaderDetails: candidate.uploaderDetails
            }
        });
    } catch (error) {
        console.error('Partner resume upload error:', error);
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
