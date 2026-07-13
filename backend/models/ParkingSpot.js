import mongoose from 'mongoose';

const parkingSpotSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Space provider host ownerId is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Parking spot title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Parking spot address is required'],
    trim: true,
  },
  latitude: {
    type: Number,
    required: [true, 'Latitude is required for mapping'],
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90'],
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required for mapping'],
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180'],
  },
  images: {
    type: [String],
    default: [],
  },
  parkingType: {
    type: String,
    enum: {
      values: ['garage', 'driveway', 'covered', 'open'],
      message: '{VALUE} is not a valid parking type',
    },
    default: 'driveway',
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Rate cannot be negative'],
  },
  availableFrom: {
    type: String, // HH:MM format
    required: [true, 'Start availability time is required'],
  },
  availableTill: {
    type: String, // HH:MM format
    required: [true, 'End availability time is required'],
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot exceed 5'],
  }
}, {
  timestamps: true,
});

// Setup 2D sphere index for geo-queries (extremely useful for searching parking spots nearby!)
parkingSpotSchema.index({ latitude: 1, longitude: 1 });

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);
export default ParkingSpot;
