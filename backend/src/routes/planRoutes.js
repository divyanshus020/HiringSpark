import express from 'express';
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan
} from '../controllers/planController.js';
import { protect, isAdmin } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPlans);
router.get('/:id', getPlan);

// Admin only routes
router.post('/', protect, isAdmin, createPlan);
router.put('/:id', protect, isAdmin, updatePlan);

export default router;