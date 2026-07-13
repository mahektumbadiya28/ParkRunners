import mongoose from 'mongoose';

const vehicleTrackingSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required for tracking'],
    index: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required'],
  },
  status: {
    type: String,
    enum: ['car_received', 'moving', 'parked', 'returning', 'completed'],
    required: [true, 'Tracking status is required'],
  }
}, {
  timestamps: true, // This captures the exact time of the coordinate update
});

const VehicleTracking = mongoose.model('VehicleTracking', vehicleTrackingSchema);
export default VehicleTracking;
