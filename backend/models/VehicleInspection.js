import mongoose from 'mongoose';

const vehicleInspectionSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required for inspection check-ins'],
    index: true,
  },
  beforeImages: {
    type: [String], // Array of 4-side vehicle inspection images (front, back, left, right) captured before parking
    default: [],
  },
  afterImages: {
    type: [String], // Array of 4-side vehicle inspection images captured after returning
    default: [],
  },
  damageDetected: {
    type: Boolean,
    default: false,
  },
  damageDescription: {
    type: String,
    default: '',
  },
  aiConfidence: {
    type: Number, // Percentage or float score returned from YOLO damage detection model
    default: 0,
    min: 0,
    max: 100,
  }
}, {
  timestamps: true,
});

const VehicleInspection = mongoose.model('VehicleInspection', vehicleInspectionSchema);
export default VehicleInspection;
