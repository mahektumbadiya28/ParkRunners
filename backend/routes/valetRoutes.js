import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  registerValetProfile,
  getValets,
  updateValetStatus,
  updateValetLocation
} from '../controllers/valetController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('valet', 'valet_driver'), registerValetProfile)
  .get(authorize('admin', 'owner', 'car_owner', 'provider', 'parking_provider'), getValets);

router.put('/status', authorize('valet', 'valet_driver'), updateValetStatus);
router.put('/location', authorize('valet', 'valet_driver'), updateValetLocation);

export default router;
