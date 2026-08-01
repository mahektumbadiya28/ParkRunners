import Booking from '../models/Booking.js';
import ParkingSpace from '../models/ParkingSpace.js';

// @desc   Create a booking
// @route  POST /api/bookings
export const createBooking = async (req, res, next) => {
  try {
    const { spotId, startTime, endTime, vehicleId } = req.body;
    const spot = await ParkingSpace.findById(spotId);
    if (!spot || spot.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Spot not available' });
    }

    const hours = Math.max(1, Math.ceil((new Date(endTime) - new Date(startTime)) / 3600000));
    const totalAmount = hours * (spot.hourlyPrice);

    const booking = await Booking.create({
      bookingId: `BK${Math.floor(1000 + Math.random() * 9000)}`,
      ownerId: req.user._id,
      parkingId: spotId,
      vehicleId,
      bookingDate: new Date().toISOString().split('T')[0],
      startTime,
      endTime,
      duration: hours,
      totalAmount,
      bookingStatus: 'pending',
      paymentStatus: 'pending'
    });

    if (spot.availableSlots > 0) {
      spot.availableSlots -= 1;
      await spot.save();
    }

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Get single booking by ID
// @route  GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('ownerId', 'fullName email phone')
      .populate('parkingId')
      .populate('vehicleId')
      .populate('valetId', 'fullName phone')
      .lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Get current user's (car owner) bookings
// @route  GET /api/bookings
export const myBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ ownerId: req.user._id })
      .populate('parkingId')
      .populate('vehicleId')
      .populate('valetId', 'fullName phone')
      .sort('-createdAt')
      .lean();
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Get provider's bookings (bookings on spaces owned by provider)
// @route  GET /api/bookings/provider
export const getProviderBookings = async (req, res, next) => {
  try {
    const mySpaces = await ParkingSpace.find({ providerId: req.user._id }).lean();
    const spaceIds = mySpaces.map(s => s._id);

    const bookings = await Booking.find({ parkingId: { $in: spaceIds } })
      .populate('parkingId')
      .populate('ownerId', 'fullName email phone')
      .populate('vehicleId')
      .populate('valetId', 'fullName phone')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};

// @desc   Get available jobs for valets (pending bookings)
// @route  GET /api/bookings/available
export const availableJobs = async (req, res, next) => {
  try {
    const jobs = await Booking.find({ bookingStatus: 'pending', valetId: null })
      .populate('parkingId', 'address location')
      .populate('ownerId', 'fullName phone')
      .sort('startTime')
      .lean();
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    next(err);
  }
};

// @desc   Accept / complete / cancel a booking (valet or owner)
// @route  POST /api/bookings/:id/action
export const bookingAction = async (req, res, next) => {
  try {
    const { action } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const role = req.user.role;

    if (action === 'accept' && role === 'valet_driver') {
      booking.valetId = req.user._id;
      booking.bookingStatus = 'confirmed';
    } else if (action === 'receive_car' && role === 'valet_driver') {
      booking.bookingStatus = 'active';
    } else if (action === 'parked' && role === 'valet_driver') {
      const spot = await ParkingSpace.findById(booking.parkingId);
      if (spot && spot.availableSlots > 0) {
        spot.availableSlots -= 1;
        await spot.save();
      }
    } else if (action === 'bring_my_car' && role === 'car_owner') {
      booking.bookingStatus = 'returning';
    } else if (action === 'complete') {
      booking.bookingStatus = 'completed';
      const spot = await ParkingSpace.findById(booking.parkingId);
      if (spot) {
        spot.availableSlots += 1;
        await spot.save();
      }
    } else if (action === 'cancel' && (role === 'car_owner' || role === 'admin')) {
      booking.bookingStatus = 'cancelled';
      const spot = await ParkingSpace.findById(booking.parkingId);
      if (spot) {
        spot.availableSlots += 1;
        await spot.save();
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action or permission denied' });
    }

    await booking.save();
    
    if (req.app.get('io')) {
      req.app.get('io').emit('booking_update', { bookingId: booking._id, status: booking.bookingStatus, action });
    }
    
    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: get all bookings
// @route  GET /api/bookings/all
export const allBookings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const skip = parseInt(req.query.skip) || 0;

    const bookings = await Booking.find()
      .populate('ownerId', 'fullName email')
      .populate('parkingId', 'parkingName address')
      .populate('valetId', 'fullName')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .lean();
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    next(err);
  }
};
