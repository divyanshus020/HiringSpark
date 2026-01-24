import jwt from 'jsonwebtoken';
import { Partner } from '../models/Partner.js';
import { env } from '../../shared/config/env.js';

// Protect partner routes
export const protectPartner = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, env.JWT_SECRET || 'your_jwt_secret');

            // Check if it's a partner token
            if (decoded.type !== 'partner') {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized as partner'
                });
            }

            // Get partner from token
            const partner = await Partner.findById(decoded.id).select('-password');

            if (!partner) {
                return res.status(401).json({
                    success: false,
                    message: 'Partner not found'
                });
            }

            // Check if partner is approved
            if (partner.status !== 'approved') {
                return res.status(403).json({
                    success: false,
                    message: 'Partner account is not approved'
                });
            }

            req.partner = partner;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
