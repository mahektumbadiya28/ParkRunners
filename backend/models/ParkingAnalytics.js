import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
  },
  date: {
    type: String, // e.g. "2026-07-30"
    required: true,
  },
  bookings: {
    type: Number,
    default: 0,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  averagePrice: {
    type: Number,
    default: 0,
  },
  peakHour: {
    type: String,
  },
  weather: {
    type: String,
  }
});

const ParkingAnalytics = mongoose.model('ParkingAnalytics', analyticsSchema);
export default ParkingAnalytics;
