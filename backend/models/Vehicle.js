import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner userId is required'],
    index: true,
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle plate number is required'],
    unique: true,
    trim: true,
    uppercase: true, // Forces plate numbers to uppercase
    index: true,
  },
  brand: {
    type: String,
    required: [true, 'Vehicle brand/make is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
  },
  color: {
    type: String,
    required: [true, 'Vehicle color is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Vehicle manufacture year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the far future'],
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required (e.g. Sedan, SUV, Hatchback)'],
    trim: true,
  },
  images: {
    type: [String],
    default: [],
  },
  insuranceNumber: {
    type: String,
    trim: true,
  },
  registrationCertificate: {
    type: String, // URL/Cloudinary link
    trim: true,
  }
}, {
  timestamps: true,
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
