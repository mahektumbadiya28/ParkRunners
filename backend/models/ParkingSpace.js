import mongoose from 'mongoose';

const parkingSpaceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Provider ID is required'],
    index: true,
  },
  parkingName: {
    type: String,
    required: [true, 'Parking Name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  vehicleTypes: {
    type: [String],
    default: ['Car'],
  },
  images: {
    type: [String],
    default: [],
  },
  totalSlots: {
    type: Number,
    required: true,
  },
  availableSlots: {
    type: Number,
    required: true,
  },
  hourlyPrice: {
    type: Number,
    required: true,
  },
  dailyPrice: {
    type: Number,
  },
  openingTime: {
    type: String,
    required: true,
  },
  closingTime: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  }
}, {
  timestamps: true,
});

parkingSpaceSchema.index({ location: '2dsphere' });

const ParkingSpace = mongoose.model('ParkingSpace', parkingSpaceSchema);
export default ParkingSpace;
