import express from 'express';
import {
  createJobDraft,
  updateJobStep1,
  updateJobStep2,
  updateJobStep3,
  updateJobStep4,
  getMyJobs,
  getJob,
  postJob,
  deleteJob,
  generateJobDescriptionAI
} from '../controllers/jobController.js';
import { protect, isHR } from '../middlewares/auth.js';

const router = express.Router();

// AI generation
router.post('/generate-description', protect, isHR, generateJobDescriptionAI);

// Job creation and management

router.post('/draft', protect, isHR, createJobDraft);
router.put('/:id/step1', protect, isHR, updateJobStep1);
router.put('/:id/step2', protect, isHR, updateJobStep2);
router.put('/:id/step3', protect, isHR, updateJobStep3);
router.put('/:id/step4', protect, isHR, updateJobStep4);
router.put('/:id/post', protect, isHR, postJob);

// Get jobs
router.get('/', protect, getMyJobs);
router.get('/:id', protect, getJob);

// Delete job
router.delete('/:id', protect, isHR, deleteJob);

export default router;