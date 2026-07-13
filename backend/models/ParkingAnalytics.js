import mongoose from 'mongoose';

const parkingAnalyticsSchema = new mongoose.Schema({
  location: {
    type: String,
    required: [true, 'Regional location name is required for analysis'],
    trim: true,
    index: true,
  },
  date: {
    type: Date,
    required: [true, 'Aggregation date is required'],
    index: true,
  },
  weather: {
    type: String,
    default: 'clear',
    trim: true,
  },
  totalBookings: {
    type: Number,
    default: 0,
    min: 0,
  },
  averagePrice: {
    type: Number,
    default: 0,
    min: 0,
  },
  peakHour: {
    type: String, // e.g. "14:00"
    trim: true,
  },
  parkingDemand: {
    type: Number, // Scaled demand index (e.g. 1-10) used for ML inputs
    default: 0,
    min: 0,
  }
}, {
  timestamps: true,
});

// Compound index on location and date for daily record queries
parkingAnalyticsSchema.index({ location: 1, date: 1 }, { unique: true });

const ParkingAnalytics = mongoose.model('ParkingAnalytics', parkingAnalyticsSchema);
export default ParkingAnalytics;
