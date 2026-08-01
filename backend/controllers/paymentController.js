import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import ParkingSpace from '../models/ParkingSpace.js';

// @desc    Create a payment order (e.g. Stripe/Razorpay)
// @route   POST /api/payment/create-order
export const createOrder = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Mock order creation
    const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
      bookingId,
      ownerId: req.user._id,
      amount,
      paymentMethod: paymentMethod === 'card' ? 'Card' : paymentMethod || 'Card',
      transactionId,
      paymentStatus: 'Pending'
    });

    res.status(201).json({ success: true, transactionId, paymentId: payment._id });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payment/verify
export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, transactionId, status } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Mock verification
    payment.paymentStatus = status === 'completed' ? 'Success' : 'Success';
    payment.transactionId = transactionId || payment.transactionId;
    await payment.save();

    // Update booking payment status
    if (payment.paymentStatus === 'Success') {
      await Booking.findByIdAndUpdate(payment.bookingId, { paymentStatus: 'paid' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history for user
// @route   GET /api/payment/history
export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({ ownerId: req.user._id })
      .populate('bookingId');
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment history for provider
// @route   GET /api/payment/provider
export const getProviderPayments = async (req, res, next) => {
  try {
    // Find all spaces owned by provider
    const mySpaces = await ParkingSpace.find({ providerId: req.user._id });
    const spaceIds = mySpaces.map(s => s._id);

    // Find bookings on those spaces
    const bookings = await Booking.find({ parkingId: { $in: spaceIds } });
    const bookingIds = bookings.map(b => b._id);

    // Get payments for those bookings
    const payments = await Payment.find({ bookingId: { $in: bookingIds } })
      .populate('bookingId')
      .populate('ownerId', 'fullName email');

    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    next(error);
  }
};
