import express from 'express';
import { register, login, getMe, forgotPassword, resetPassword, adminRegister, adminLogin } from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// HR Routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Admin Routes (Postman only for register)
router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);

export default router;