import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getProviderAnalytics } from '../controllers/providerController.js';
// import {
//   getStats,
//   getAllUsers,
//   updateUser,
//   getProviderAnalytics
// } from '../controllers/adminController.js';
const router = express.Router();
// router.get('/stats', protect, authorize('admin'), getStats);
// router.get('/users', protect, authorize('admin'), getAllUsers);
// router.patch('/users/:id', protect, authorize('admin'), updateUser);
// router.get('/provider', protect, authorize('provider'), getProviderAnalytics);
router.get('/provider', protect, authorize('provider', 'parking_provider'), getProviderAnalytics);

export default router;
