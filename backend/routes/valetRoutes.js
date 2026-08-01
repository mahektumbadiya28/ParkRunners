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
  .post(authorize('valet'), registerValetProfile)
  .get(authorize('admin', 'owner', 'provider'), getValets);

router.put('/status', authorize('valet'), updateValetStatus);
router.put('/location', authorize('valet'), updateValetLocation);

export default router;
