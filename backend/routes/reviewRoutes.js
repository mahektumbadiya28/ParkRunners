import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createReview,
  getUserReviews,
  getProviderReviews
} from '../controllers/reviewController.js';

const router = express.Router();

router.post('/', protect, createReview);
router.get('/provider', protect, authorize('provider', 'parking_provider'), getProviderReviews);
router.get('/:userId', getUserReviews);

export default router;
