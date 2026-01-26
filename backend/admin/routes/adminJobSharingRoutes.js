import express from 'express';
import { protect, isAdmin } from '../../hiringBazaar/middlewares/auth.js';
import {
    shareJobWithPartners,
    getJobPartners,
    removeJobSharing,
    getAvailableJobsForSharing,
    getAllJobAssignments
} from '../controllers/jobSharingController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, isAdmin);

// @route   GET /api/admin/job-sharing/available-jobs
// @desc    Get all jobs that can be shared
router.get('/available-jobs', getAvailableJobsForSharing);

// @route   GET /api/admin/job-sharing/assignments
// @desc    Get all active job pairs
router.get('/assignments', getAllJobAssignments);

// @route   POST /api/admin/job-sharing/:jobId/share
// @desc    Share job with partners
router.post('/:jobId/share', shareJobWithPartners);

// @route   GET /api/admin/job-sharing/:jobId/partners
// @desc    Get partners for a job
router.get('/:jobId/partners', getJobPartners);

// @route   DELETE /api/admin/job-sharing/:jobId/partners/:partnerId
// @desc    Remove job sharing with partner
router.delete('/:jobId/partners/:partnerId', removeJobSharing);

export default router;
