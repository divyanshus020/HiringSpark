import express from 'express';
import {
  addCandidate,
  bulkUploadCandidates,
  getCandidatesByJob,
  updateCandidateFeedback,
  getMyCandidates,
  deleteCandidate,
  getCandidateById
} from '../controllers/candidateController.js';

import { protect, isAdmin, isHR } from '../middlewares/auth.js';
import { upload } from '../../shared/middlewares/upload.js';

const router = express.Router();

// router.use(protect, isAdmin);

router.post('/', upload.single('resume'), protect, isAdmin, addCandidate);
router.post('/bulk', upload.array('resumes', 100), protect, isAdmin, bulkUploadCandidates);
router.get('/my-candidates', protect, getMyCandidates);
router.get('/job/:jobId', protect, getCandidatesByJob);
router.get('/:id', protect, getCandidateById);
router.put('/:id/feedback', protect, updateCandidateFeedback);

router.delete('/:id', protect, isAdmin, deleteCandidate);



export default router;