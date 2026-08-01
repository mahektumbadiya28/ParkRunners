import mongoose from 'mongoose';

const vehicleTrackingSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  valetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Valet',
    required: true,
  },
  currentLocation: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  eta: {
    type: String, // e.g. "8 Minutes"
  },
  status: {
    type: String,
    enum: ['vehicle_received', 'moving_to_parking', 'parked', 'returning', 'delivered'],
    required: true,
  }
}, {
  timestamps: true,
});

const VehicleTracking = mongoose.model('VehicleTracking', vehicleTrackingSchema);
export default VehicleTracking;
