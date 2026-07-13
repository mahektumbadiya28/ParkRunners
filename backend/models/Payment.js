import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required for payment records'],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User associated with payment is required'],
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount cannot be negative'],
  },
  paymentMethod: {
    type: String, // e.g. 'Stripe', 'Razorpay', 'Card', etc.
    required: [true, 'Payment method is required'],
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction reference/ID is required'],
    unique: true,
    index: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  },
  paidAt: {
    type: Date,
    default: Date.now,
  }
}, {
  timestamps: true,
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
