import { JobPartnerMapping } from '../../partnerHB/models/JobPartnerMapping.js';
import { Job } from '../../hiringBazaar/models/Job.js';
import { Partner } from '../../partnerHB/models/Partner.js';
import { transporter } from '../../shared/config/mail.js';
import { env } from '../../shared/config/env.js';

// @desc    Share job with partners
// @route   POST /api/admin/job-sharing/:jobId/share
export const shareJobWithPartners = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { partnerIds } = req.body;

        if (!partnerIds || !Array.isArray(partnerIds) || partnerIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one partner ID'
            });
        }

        // Check if job exists and is approved
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.status !== 'active' && job.status !== 'posted') {
            return res.status(400).json({
                success: false,
                message: 'Only active/approved jobs can be shared with partners'
            });
        }

        const results = [];
        const errors = [];

        for (const partnerId of partnerIds) {
            try {
                // Check if partner exists and is approved
                const partner = await Partner.findById(partnerId);
                if (!partner) {
                    errors.push({ partnerId, error: 'Partner not found' });
                    continue;
                }

                if (partner.status !== 'approved') {
                    errors.push({ partnerId, error: 'Partner is not approved' });
                    continue;
                }

                // Check if mapping already exists
                const existingMapping = await JobPartnerMapping.findOne({
                    jobId,
                    partnerId
                });

                if (existingMapping) {
                    if (!existingMapping.isActive) {
                        // Reactivate if it was deactivated
                        existingMapping.isActive = true;
                        existingMapping.sharedBy = req.user.id;
                        await existingMapping.save();
                        results.push({ partnerId, status: 'reactivated' });
                    } else {
                        errors.push({ partnerId, error: 'Job already shared with this partner' });
                    }
                    continue;
                }

                // Create new mapping
                const mapping = await JobPartnerMapping.create({
                    jobId,
                    partnerId,
                    sharedBy: req.user.id,
                    isActive: true
                });

                results.push({ partnerId, status: 'shared', mappingId: mapping._id });

                // Send email notification to partner
                try {
                    if (transporter && env.EMAIL_USER) {
                        const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2196F3;">🎯 New Job Opportunity Available!</h2>
                <p>Dear ${partner.partnerName},</p>
                <p>A new job has been shared with you:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0;">${job.jobTitle}</h3>
                  <p style="margin: 5px 0;"><strong>Location:</strong> ${job.location || 'Not specified'}</p>
                  <p style="margin: 5px 0;"><strong>Experience:</strong> ${job.experience || 'Not specified'}</p>
                </div>
                <p>You can now view this job and upload candidate resumes through your partner portal.</p>
                <div style="margin: 30px 0;">
                  <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/partner/jobs" 
                     style="background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                    View Job Details
                  </a>
                </div>
                <p>Best regards,<br>HiringBazaar Team</p>
              </div>
            `;

                        await transporter.sendMail({
                            from: `"HiringBazaar" <${env.EMAIL_USER}>`,
                            to: partner.email,
                            subject: `🎯 New Job Shared: ${job.jobTitle}`,
                            html: emailHtml
                        });

                        console.log(`✅ Job sharing email sent to partner: ${partner.email}`);
                    }
                } catch (emailError) {
                    console.error('❌ Error sending job sharing email:', emailError);
                }
            } catch (error) {
                errors.push({ partnerId, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Job shared with ${results.length} partner(s)`,
            results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get partners for a job
// @route   GET /api/admin/job-sharing/:jobId/partners
export const getJobPartners = async (req, res) => {
    try {
        const { jobId } = req.params;

        const mappings = await JobPartnerMapping.find({ jobId, isActive: true })
            .populate('partnerId', 'partnerName organizationName email phone status')
            .populate('sharedBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: mappings.length,
            partners: mappings.map(m => ({
                ...m.partnerId._doc,
                sharedAt: m.createdAt,
                sharedBy: m.sharedBy
            }))
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Remove job sharing with partner
// @route   DELETE /api/admin/job-sharing/:jobId/partners/:partnerId
export const removeJobSharing = async (req, res) => {
    try {
        const { jobId, partnerId } = req.params;

        const mapping = await JobPartnerMapping.findOne({ jobId, partnerId });

        if (!mapping) {
            return res.status(404).json({
                success: false,
                message: 'Job sharing not found'
            });
        }

        // Soft delete - just deactivate
        mapping.isActive = false;
        await mapping.save();

        res.json({
            success: true,
            message: 'Job sharing removed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all jobs that can be shared
// @route   GET /api/admin/job-sharing/available-jobs
export const getAvailableJobsForSharing = async (req, res) => {
    try {
        const jobs = await Job.find({
            status: { $in: ['active', 'posted'] }
        })
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: jobs.length,
            jobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
