import mongoose from 'mongoose';

const valetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  licenseNumber: {
    type: String,
    required: true,
  },
  aadhaarNumber: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  online: {
    type: Boolean,
    default: false,
  },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  completedJobs: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  }
});

const Valet = mongoose.model('Valet', valetSchema);
export default Valet;
