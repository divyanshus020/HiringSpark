import express from 'express';
import { chatWithAI } from '../controllers/chatController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/', protect, chatWithAI);

export default router;
