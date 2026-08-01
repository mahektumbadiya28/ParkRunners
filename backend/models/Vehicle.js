import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required'],
    index: true,
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
  vehicleType: {
    type: String,
    required: true,
  },
  rcBook: {
    type: String,
    default: '',
  },
  images: [{ type: String }],
}, {
  timestamps: true,
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
