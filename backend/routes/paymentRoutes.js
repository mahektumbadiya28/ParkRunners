import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getProviderPayments
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/provider', authorize('provider'), getProviderPayments);

export default router;
