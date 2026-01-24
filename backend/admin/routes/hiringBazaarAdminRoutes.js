import express from 'express';
import { protect, isAdmin } from '../../hiringBazaar/middlewares/auth.js';
import { upload } from '../../shared/middlewares/upload.js';
import * as adminCtrl from '../controllers/hiringBazaarAdminController.js';
import { addCandidate, updateCandidateFeedback } from '../../hiringBazaar/controllers/candidateController.js';

const router = express.Router();

// All routes here are protected and Admin-only
router.use(protect, isAdmin);

// Admin Dashboard Stats
router.get('/stats', adminCtrl.getAdminStats);

router.get('/jobs', adminCtrl.getAllJobsMaster);

// 1. HR Management (RUD)
router.get('/hrs', adminCtrl.getAllHRs);
router.get('/hrs/:id', adminCtrl.getHRById);
router.get('/hrs/:hrId/jobs', adminCtrl.getJobsByHR); // Get all jobs for specific HR
router.put('/jobs/:id/status', adminCtrl.updateJobStatus); // Approve/Reject job
router.delete('/jobs/:id', adminCtrl.deleteJobAdmin); // Delete job
router.put('/hrs/:id', adminCtrl.updateHR);

// 2. Candidate Master CRUD
router.get('/candidates', adminCtrl.getAllCandidatesMaster); // See all
router.post('/candidates', upload.single('resume'), addCandidate); // Admin creates
router.put('/candidates/:id', updateCandidateFeedback); // Admin/HR updates
router.delete('/hrs/:id', adminCtrl.deleteHRAndData);

// 3. Platform & Pricing
router.put('/platforms/:id', adminCtrl.updatePlatform);

router.delete('/candidates/:id', adminCtrl.deleteCandidate);

export default router;
