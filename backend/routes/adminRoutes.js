import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getStats,
  getAllUsers,
  updateKyc
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('admin'), getStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.patch('/users/:id/kyc', protect, authorize('admin'), updateKyc);

export default router;
