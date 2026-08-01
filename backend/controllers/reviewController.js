import Review from '../models/Review.js';
import User from '../models/User.js';
import ParkingSpace from '../models/ParkingSpace.js';
import Booking from '../models/Booking.js';

// @desc    Create a new review
// @route   POST /api/review
export const createReview = async (req, res) => {
  try {
    const { bookingId, toUser, rating, review } = req.body;

    const existingReview = await Review.findOne({ bookingId, fromUser: req.user._id });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this booking' });
    }

    const newReview = await Review.create({
      bookingId,
      fromUser: req.user._id,
      toUser,
      rating,
      review
    });

    res.status(201).json({ success: true, data: newReview });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a specific user
// @route   GET /api/review/:userId
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ toUser: req.params.userId })
      .populate('fromUser', 'name profileImage');
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get reviews for provider spaces
// @route   GET /api/review/provider
export const getProviderReviews = async (req, res) => {
  try {
    const mySpaces = await ParkingSpace.find({ ownerId: req.user._id });
    const spaceIds = mySpaces.map(s => s._id);

    const bookings = await Booking.find({ parkingId: { $in: spaceIds } });
    const bookingIds = bookings.map(b => b._id);

    const reviews = await Review.find({ bookingId: { $in: bookingIds } })
      .populate('fromUser', 'name profileImage')
      .populate({
        path: 'bookingId',
        populate: { path: 'parkingId', select: 'title address' }
      });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
