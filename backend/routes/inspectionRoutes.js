import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createInspection, getInspection } from '../controllers/inspectionController.js';

const router = express.Router();

router.post('/', protect, authorize('valet'), createInspection);
router.get('/:bookingId', protect, getInspection);

export default router;
