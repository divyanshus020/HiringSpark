import express from 'express';
import { protect, isAdmin } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';
import * as adminCtrl from '../controllers/adminController.js';
import { addCandidate, updateCandidateFeedback } from '../controllers/candidateController.js';

const router = express.Router();

// All routes here are protected and Admin-only
router.use(protect, isAdmin);

router.get('/jobs', adminCtrl.getAllJobsMaster);
// 1. HR Management (RUD)
router.get('/hrs', adminCtrl.getAllHRs);
router.get('/hrs/:id', adminCtrl.getHRById);
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