import { Partner } from '../../partnerHB/models/Partner.js';
import { transporter } from '../../shared/config/mail.js';
import { env } from '../../shared/config/env.js';

// @desc    Get all pending partners
// @route   GET /api/admin/partners/pending
export const getPendingPartners = async (req, res) => {
    try {
        const partners = await Partner.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .select('-password');

        res.json({
            success: true,
            count: partners.length,
            partners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all approved partners
// @route   GET /api/admin/partners/approved
export const getApprovedPartners = async (req, res) => {
    try {
        const partners = await Partner.find({ status: 'approved' })
            .sort({ approvedAt: -1 })
            .select('-password');

        res.json({
            success: true,
            count: partners.length,
            partners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all partners
// @route   GET /api/admin/partners
export const getAllPartners = async (req, res) => {
    try {
        const partners = await Partner.find()
            .sort({ createdAt: -1 })
            .select('-password');

        res.json({
            success: true,
            count: partners.length,
            partners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single partner details
// @route   GET /api/admin/partners/:id
export const getPartnerById = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id).select('-password');

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
        }

        res.json({
            success: true,
            partner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve partner
// @route   POST /api/admin/partners/:id/approve
export const approvePartner = async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
        }

        if (partner.status === 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Partner is already approved'
            });
        }

        partner.status = 'approved';
        partner.approvedBy = req.user.id;
        partner.approvedAt = new Date();
        await partner.save();

        // Send approval email
        try {
            if (transporter && env.EMAIL_USER) {
                const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">🎉 Your Partner Account is Active!</h2>
            <p>Dear ${partner.partnerName},</p>
            <p>Great news! Your partner account for <strong>${partner.organizationName}</strong> has been approved.</p>
            <p>You can now log in and start accessing shared job postings.</p>
            <div style="margin: 30px 0;">
              <a href="${env.FRONTEND_URL || 'http://localhost:3000'}/partner/login" 
                 style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Login to Your Account
              </a>
            </div>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>HiringBazaar Team</p>
          </div>
        `;

                await transporter.sendMail({
                    from: `"HiringBazaar Admin" <${env.EMAIL_USER}>`,
                    to: partner.email,
                    subject: '✅ Your Partner Account is Active',
                    html: emailHtml
                });

                console.log(`✅ Approval email sent to partner: ${partner.email}`);
            }
        } catch (emailError) {
            console.error('❌ Error sending approval email:', emailError);
        }

        res.json({
            success: true,
            message: 'Partner approved successfully',
            partner: {
                id: partner._id,
                partnerName: partner.partnerName,
                organizationName: partner.organizationName,
                status: partner.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject partner
// @route   POST /api/admin/partners/:id/reject
export const rejectPartner = async (req, res) => {
    try {
        const { reason } = req.body;
        const partner = await Partner.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({
                success: false,
                message: 'Partner not found'
            });
        }

        partner.status = 'rejected';
        partner.rejectionReason = reason || 'Not specified';
        await partner.save();

        // Send rejection email
        try {
            if (transporter && env.EMAIL_USER) {
                const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f44336;">Application Status Update</h2>
            <p>Dear ${partner.partnerName},</p>
            <p>Thank you for your interest in partnering with HiringBazaar.</p>
            <p>After careful review, we regret to inform you that we are unable to approve your partner account at this time.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you have any questions or would like to discuss this further, please contact us.</p>
            <p>Best regards,<br>HiringBazaar Team</p>
          </div>
        `;

                await transporter.sendMail({
                    from: `"HiringBazaar Admin" <${env.EMAIL_USER}>`,
                    to: partner.email,
                    subject: 'Partner Application Status',
                    html: emailHtml
                });

                console.log(`✅ Rejection email sent to partner: ${partner.email}`);
            }
        } catch (emailError) {
            console.error('❌ Error sending rejection email:', emailError);
        }

        res.json({
            success: true,
            message: 'Partner rejected',
            partner: {
                id: partner._id,
                partnerName: partner.partnerName,
                status: partner.status
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
