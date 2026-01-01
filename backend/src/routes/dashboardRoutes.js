import express from 'express';
import { 
  getDashboardStats
} from '../controllers/dashboardController.js';
import { protect, isHR } from '../middlewares/auth.js';

const router = express.Router();

// All dashboard routes require HR authentication
router.use(protect, isHR);

router.get('/stats', getDashboardStats);


export default router;