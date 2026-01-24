import { Partner } from '../models/Partner.js';
import jwt from 'jsonwebtoken';
import { env } from '../../shared/config/env.js';

// @desc    Register new partner
// @route   POST /api/partner/auth/register
export const registerPartner = async (req, res) => {
    try {
        const { partnerName, organizationName, email, password, phone } = req.body;

        // Check if partner already exists
        const existingPartner = await Partner.findOne({ email: email.toLowerCase() });
        if (existingPartner) {
            return res.status(400).json({
                success: false,
                message: 'Partner with this email already exists'
            });
        }

        // Handle resume upload
        const resumeUrl = req.file ? `/uploads/partners/resumes/${req.file.filename}` : null;

        if (!resumeUrl) {
            return res.status(400).json({
                success: false,
                message: 'Resume file is required'
            });
        }

        // Create partner
        const partner = await Partner.create({
            partnerName,
            organizationName,
            email: email.toLowerCase(),
            password,
            phone,
            resumeUrl,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Registration submitted successfully. We will review and approve your account shortly.',
            partner: {
                id: partner._id,
                partnerName: partner.partnerName,
                organizationName: partner.organizationName,
                email: partner.email,
                status: partner.status
            }
        });
    } catch (error) {
        console.error('Partner registration error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Partner login
// @route   POST /api/partner/auth/login
export const loginPartner = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find partner
        const partner = await Partner.findOne({ email: email.toLowerCase() });
        if (!partner) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await partner.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if approved
        if (partner.status === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval. Please wait for admin approval.'
            });
        }

        if (partner.status === 'rejected') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been rejected.',
                reason: partner.rejectionReason
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: partner._id,
                email: partner.email,
                type: 'partner'
            },
            env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
            partner: {
                id: partner._id,
                partnerName: partner.partnerName,
                organizationName: partner.organizationName,
                email: partner.email,
                phone: partner.phone,
                status: partner.status
            }
        });
    } catch (error) {
        console.error('Partner login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get partner profile
// @route   GET /api/partner/auth/profile
export const getPartnerProfile = async (req, res) => {
    try {
        const partner = await Partner.findById(req.partner.id).select('-password');

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
