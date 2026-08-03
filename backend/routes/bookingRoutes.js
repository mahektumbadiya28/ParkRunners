import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createBooking, myBookings, availableJobs, bookingAction, allBookings, getProviderBookings, getBookingById
} from '../controllers/bookingController.js';

const router = express.Router();

router.get('/', protect, myBookings);
router.get('/provider', protect, authorize('provider', 'parking_provider'), getProviderBookings);
router.post('/', protect, authorize('owner', 'car_owner'), createBooking);
router.get('/all', protect, authorize('admin'), allBookings);
router.get('/available', protect, authorize('valet', 'valet_driver'), availableJobs);
router.get('/:id', protect, getBookingById);
router.post('/:id/action', protect, bookingAction);

export default router;
