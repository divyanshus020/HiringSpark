import express from 'express';
import { protect, isAdmin } from '../../hiringBazaar/middlewares/auth.js';
import {
    getPendingPartners,
    getApprovedPartners,
    getAllPartners,
    getPartnerById,
    approvePartner,
    rejectPartner
} from '../controllers/partnerApprovalController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, isAdmin);

// @route   GET /api/admin/partners/pending
// @desc    Get all pending partners
router.get('/pending', getPendingPartners);

// @route   GET /api/admin/partners/approved
// @desc    Get all approved partners
router.get('/approved', getApprovedPartners);

// @route   GET /api/admin/partners
// @desc    Get all partners
router.get('/', getAllPartners);

// @route   GET /api/admin/partners/:id
// @desc    Get single partner details
router.get('/:id', getPartnerById);

// @route   POST /api/admin/partners/:id/approve
// @desc    Approve partner
router.post('/:id/approve', approvePartner);

// @route   POST /api/admin/partners/:id/reject
// @desc    Reject partner
router.post('/:id/reject', rejectPartner);

export default router;
