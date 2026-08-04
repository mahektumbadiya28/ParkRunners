import PlatformFeedback from '../models/PlatformFeedback.js';

// @desc    Submit platform feedback
// @route   POST /api/feedback
export const submitPlatformFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const newFeedback = await PlatformFeedback.create({
      userId: req.user._id,
      role: req.user.role,
      rating,
      comment
    });

    res.status(201).json({ success: true, data: newFeedback });
  } catch (error) {
    next(error);
  }
};
