import express from 'express';
import { getPlatforms, getPlatform } from '../controllers/platformController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getPlatforms);
router.get('/:id', protect, getPlatform);

export default router;