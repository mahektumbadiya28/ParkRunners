import mongoose from 'mongoose';

const vehicleInspectionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  beforeImages: {
    front: { type: String, default: '' },
    rear: { type: String, default: '' },
    left: { type: String, default: '' },
    right: { type: String, default: '' },
    dashboard: { type: String, default: '' },
    odometer: { type: String, default: '' }
  },
  afterImages: {
    front: { type: String, default: '' },
    rear: { type: String, default: '' },
    left: { type: String, default: '' },
    right: { type: String, default: '' },
    dashboard: { type: String, default: '' },
    odometer: { type: String, default: '' }
  },
  damageDetected: {
    type: Boolean,
    default: false,
  },
  aiConfidence: {
    type: Number, // Percentage 0-100
  }
});

const VehicleInspection = mongoose.model('VehicleInspection', vehicleInspectionSchema);
export default VehicleInspection;
