import ParkingSpace from '../models/ParkingSpace.js';
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

// @desc   List all approved, available spots (Cached)
// @route  GET /api/spots
export const listSpots = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;
    const cacheKey = `spots_${skip}_${limit}`;

    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    const spots = await ParkingSpace.find({ status: 'active' })
      .populate('providerId', 'fullName email')
      .skip(skip)
      .limit(limit)
      .lean(); // Optimization

    const response = { success: true, count: spots.length, data: spots };
    cache.set(cacheKey, response);

    res.json(response);
  } catch (err) {
    next(err);
  }
};

// @desc   Get a single spot
// @route  GET /api/spots/:id
export const getSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpace.findById(req.params.id)
      .populate('providerId', 'fullName email')
      .lean();

    if (!spot) return res.status(404).json({ success: false, message: 'Spot not found' });
    res.json({ success: true, data: spot });
  } catch (err) {
    next(err);
  }
};

// @desc   Create a parking spot (provider only)
// @route  POST /api/spots
export const createSpot = async (req, res, next) => {
  try {
    const { address, hourlyPrice, dailyPrice, totalSlots, latitude, longitude, parkingName, openingTime, closingTime } = req.body;
    
    const spot = await ParkingSpace.create({
      providerId: req.user._id,
      parkingName: parkingName || address,
      address,
      hourlyPrice: hourlyPrice || 50,
      dailyPrice: dailyPrice || 300,
      totalSlots: totalSlots || 1,
      availableSlots: totalSlots || 1,
      location: {
        type: 'Point',
        coordinates: [longitude || 72.5714, latitude || 23.0225]
      },
      openingTime: openingTime || '08:00',
      closingTime: closingTime || '22:00',
    });
    
    cache.flushAll(); // Invalidate cache
    res.status(201).json({ success: true, data: spot });
  } catch (err) {
    next(err);
  }
};

// @desc   Get spots owned by current provider
// @route  GET /api/spots/mine
export const mySpots = async (req, res, next) => {
  try {
    const spots = await ParkingSpace.find({ providerId: req.user._id }).lean();
    res.json({ success: true, count: spots.length, data: spots });
  } catch (err) {
    next(err);
  }
};

// @desc   Update a spot
// @route  PUT /api/spots/:id
export const updateSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpace.findOneAndUpdate(
      { _id: req.params.id, providerId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    ).lean();
    
    if (!spot) return res.status(404).json({ success: false, message: 'Spot not found or unauthorized' });
    
    cache.flushAll(); // Invalidate cache
    res.json({ success: true, data: spot });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete a spot
// @route  DELETE /api/spots/:id
export const deleteSpot = async (req, res, next) => {
  try {
    const spot = await ParkingSpace.findOneAndDelete({ _id: req.params.id, providerId: req.user._id });
    if (!spot) return res.status(404).json({ success: false, message: 'Spot not found or unauthorized' });
    
    cache.flushAll(); // Invalidate cache
    res.json({ success: true, message: 'Spot removed' });
  } catch (err) {
    next(err);
  }
};

// @desc   Admin: toggle spot availability
// @route  PATCH /api/spots/:id/approve
export const approveSpot = async (req, res, next) => {
  try {
    const { approved } = req.body;
    const spot = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      { status: approved ? 'active' : 'inactive' },
      { new: true }
    ).lean();
    
    if (!spot) return res.status(404).json({ success: false, message: 'Spot not found' });
    
    cache.flushAll(); // Invalidate cache
    res.json({ success: true, data: spot });
  } catch (err) {
    next(err);
  }
};
