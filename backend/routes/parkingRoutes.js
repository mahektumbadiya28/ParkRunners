import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  listSpots, getSpot, createSpot, mySpots, updateSpot, deleteSpot, approveSpot
} from '../controllers/parkingController.js';

const router = express.Router();

router.get('/', listSpots);
router.get('/mine', protect, authorize('provider'), mySpots);
router.get('/:id', getSpot);
router.post('/', protect, authorize('provider'), createSpot);
router.put('/:id', protect, authorize('provider'), updateSpot);
router.delete('/:id', protect, authorize('provider'), deleteSpot);
router.patch('/:id/approve', protect, authorize('admin'), approveSpot);

export default router;
