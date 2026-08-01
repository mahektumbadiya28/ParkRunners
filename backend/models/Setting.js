import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  platformFeePercentage: {
    type: Number,
    default: 10,
  },
  valetCommissionPercentage: {
    type: Number,
    default: 15,
  },
  enableAI: {
    type: Boolean,
    default: true,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
