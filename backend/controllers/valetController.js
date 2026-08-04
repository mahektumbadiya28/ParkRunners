import Valet from '../models/Valet.js';

// @desc    Register a valet profile (KYC)
// @route   POST /api/valets
export const registerValetProfile = async (req, res, next) => {
  try {
    const existing = await Valet.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Valet profile already exists' });
    }

    const { licenseNumber, aadhaarNumber } = req.body;

    const valet = await Valet.create({
      userId: req.user._id,
      licenseNumber,
      aadhaarNumber,
      status: 'pending', // Pending admin approval
      isVerified: false,
      online: false
    });

    res.status(201).json({ success: true, data: valet });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all valets
// @route   GET /api/valets
export const getValets = async (req, res, next) => {
  try {
    const valets = await Valet.find({})
      .populate('userId', 'fullName email phone')
      .lean();
    res.json({ success: true, count: valets.length, data: valets });
  } catch (err) {
    next(err);
  }
};

// @desc    Update valet status (online/offline)
// @route   PUT /api/valets/status
export const updateValetStatus = async (req, res, next) => {
  try {
    const { online } = req.body;
    const valet = await Valet.findOneAndUpdate(
      { userId: req.user._id },
      { online },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!valet) {
      return res.status(404).json({ success: false, message: 'Valet profile not found' });
    }

    res.json({ success: true, data: valet });
  } catch (err) {
    next(err);
  }
};

// @desc    Update valet location (Live Tracking)
// @route   PUT /api/valets/location
export const updateValetLocation = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;
    const valet = await Valet.findOneAndUpdate(
      { userId: req.user._id },
      { currentLocation: { latitude, longitude } },
      { returnDocument: 'after', runValidators: true }
    ).lean();

    if (!valet) {
      return res.status(404).json({ success: false, message: 'Valet profile not found' });
    }

    // Emit live location update to sockets
    if (req.app.get('io')) {
      req.app.get('io').emit('valet_location_updated', {
        valetId: valet._id,
        location: valet.currentLocation
      });
    }

    res.json({ success: true, data: valet });
  } catch (err) {
    next(err);
  }
};
