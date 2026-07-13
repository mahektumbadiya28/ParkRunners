import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required for reviews'],
    index: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer user reference is required'],
    index: true,
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewee user reference is required'],
    index: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating value is required'],
    min: [1, 'Rating must be at least 1 star'],
    max: [5, 'Rating cannot exceed 5 stars'],
  },
  comment: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

// Compound index to ensure a user can only review a specific booking once
reviewSchema.index({ bookingId: 1, fromUser: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
