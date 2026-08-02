import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  register,
  login,
  getProfile,
  logout,
  forgotPassword,
  resetPassword,
  verifyOtp,
  switchRole
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);
router.put('/role', protect, switchRole);

export default router;
