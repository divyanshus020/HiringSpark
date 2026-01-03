import express from 'express';
import {
  addCandidate,
  getCandidatesByJob,
  updateCandidateFeedback,
  getMyCandidates
} from '../controllers/candidateController.js';
import { protect, isAdmin, isHR } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = express.Router();

// router.use(protect, isAdmin);

router.post('/', upload.single('resume'), protect, isAdmin, addCandidate);
router.get('/my-candidates', protect, getMyCandidates);
router.get('/job/:jobId', protect, getCandidatesByJob);
router.put('/:id/feedback', protect, updateCandidateFeedback);


export default router;