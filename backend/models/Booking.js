import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Car Owner userId is required'],
    index: true,
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: [true, 'ParkingSpot parkingId is required'],
    index: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle vehicleId is required'],
    index: true,
  },
  valetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Valets are users with role valet_driver
    default: null,
    index: true,
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required'],
    default: Date.now,
  },
  startTime: {
    type: Date,
    required: [true, 'Start date/time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End date/time is required'],
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'car_received', 'moving', 'parked', 'returning', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid booking status',
    },
    default: 'pending',
    index: true,
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total price amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true,
  }
}, {
  timestamps: true,
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
