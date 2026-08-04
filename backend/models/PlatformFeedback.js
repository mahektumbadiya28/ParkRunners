import mongoose from 'mongoose';

const platformFeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['car_owner', 'parking_provider', 'valet', 'admin'],
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

const PlatformFeedback = mongoose.model('PlatformFeedback', platformFeedbackSchema);
export default PlatformFeedback;
