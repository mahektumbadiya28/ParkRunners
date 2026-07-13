import mongoose from 'mongoose';

const valetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID associated with the valet driver is required'],
    unique: true,
    index: true,
  },
  licenseNumber: {
    type: String,
    required: [true, 'Driving license number is required'],
    trim: true,
  },
  licenseImage: {
    type: String, // Cloudinary URL
    default: '',
  },
  experience: {
    type: Number, // In years
    default: 0,
    min: [0, 'Experience cannot be negative'],
  },
  availability: {
    type: Boolean,
    default: true, // Whether driver is active and ready to accept bookings
    index: true,
  },
  currentLatitude: {
    type: Number,
    default: null,
  },
  currentLongitude: {
    type: Number,
    default: null,
  },
  rating: {
    type: Number,
    default: 5.0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
  },
  verified: {
    type: Boolean,
    default: false,
    index: true, // Verified by admin
  }
}, {
  timestamps: true,
});

valetSchema.index({ currentLatitude: 1, currentLongitude: 1 });

const Valet = mongoose.model('Valet', valetSchema);
export default Valet;
