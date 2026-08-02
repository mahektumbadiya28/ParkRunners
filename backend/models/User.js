import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  phone: {
    type: String,
    default: "",
    trim: true,
  },
  role: {
    type: String,
    enum: ['car_owner', 'parking_provider', 'valet_driver', 'admin'],
    default: 'car_owner',
  },
  profileImage: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: 'Mumbai' },
    state: { type: String, default: 'Maharashtra' },
    country: { type: String, default: 'India' },
    pincode: { type: String, default: '400001' },
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  verificationDocs: {
    governmentId: { type: Boolean, default: true },
    vehicleDetails: { type: Boolean, default: true },
    profilePicture: { type: Boolean, default: true },
    phoneVerification: { type: Boolean, default: true },
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active',
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    bookingAlerts: { type: Boolean, default: true },
    paymentAlerts: { type: Boolean, default: true },
    vehicleUpdates: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    weeklyReports: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
  },
  privacy: {
    profileVisibility: { type: String, default: 'public' },
    hidePhone: { type: Boolean, default: false },
    hideEmail: { type: Boolean, default: false },
    hideVehicle: { type: Boolean, default: false },
    allowReviews: { type: Boolean, default: true },
    allowLocationSharing: { type: Boolean, default: true },
  },
  appearance: {
    theme: { type: String, default: 'dark' },
    accentColor: { type: String, default: 'indigo' },
    fontSize: { type: String, default: 'medium' },
    compactMode: { type: Boolean, default: false },
    animationsEnabled: { type: Boolean, default: true },
    glassEffectEnabled: { type: Boolean, default: true },
  },
  languageRegion: {
    language: { type: String, default: 'en' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' },
    timeFormat: { type: String, default: '12h' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
  },
  connectedAccounts: {
    google: { connected: { type: Boolean, default: true }, email: { type: String, default: '' } },
    apple: { connected: { type: Boolean, default: false }, email: { type: String, default: '' } },
    github: { connected: { type: Boolean, default: false }, email: { type: String, default: '' } },
    facebook: { connected: { type: Boolean, default: false }, email: { type: String, default: '' } },
  },
  preferences: {
    defaultDashboard: { type: String, default: 'auto' },
    homePage: { type: String, default: '/map' },
    defaultMapView: { type: String, default: 'standard' },
    defaultVehicle: { type: String, default: 'MH02CB1234' },
    parkingRadius: { type: Number, default: 5 },
    distanceUnit: { type: String, default: 'km' },
    temperatureUnit: { type: String, default: 'celsius' },
    autoRefresh: { type: Boolean, default: true },
    autoLogoutTimer: { type: String, default: '30m' },
  },
  paymentSettings: {
    savedCards: [
      {
        id: { type: String, default: 'card_1' },
        brand: { type: String, default: 'Visa' },
        last4: { type: String, default: '4242' },
        expiry: { type: String, default: '12/28' },
        isDefault: { type: Boolean, default: true },
      }
    ],
    upiIds: [
      { id: { type: String, default: 'upi_1' }, upiId: { type: String, default: 'user@okicici' }, isDefault: { type: Boolean, default: true } }
    ],
    bankAccount: {
      accountNumber: { type: String, default: '••••••••6789' },
      ifsc: { type: String, default: 'HDFC0001234' },
      bankName: { type: String, default: 'HDFC Bank' },
    },
    gstDetails: {
      gstin: { type: String, default: '27AAAAA0000A1Z5' },
      legalName: { type: String, default: 'VolenPark Mobility Pvt Ltd' },
    },
    razorpayConnected: { type: Boolean, default: true },
  },
  devices: [
    {
      id: { type: String },
      deviceName: { type: String },
      browser: { type: String },
      os: { type: String },
      ip: { type: String },
      location: { type: String },
      lastActive: { type: Date, default: Date.now },
      isCurrent: { type: Boolean, default: false },
    }
  ],
  adminSystemConfig: {
    siteName: { type: String, default: 'VolenPark - Smart Valet & Peer-to-Peer Parking' },
    supportEmail: { type: String, default: 'support@volenpark.com' },
    maintenanceMode: { type: Boolean, default: false },
    apiKeys: {
      cloudinary: { type: String, default: 'cloud_key_live_99213' },
      googleMaps: { type: String, default: 'AIzaSyA_VolenPark_MapsKey_2026' },
      razorpay: { type: String, default: 'rzp_live_vP894210x' },
      smtp: { type: String, default: 'smtp.mailgun.org:587' },
    }
  }
}, {
  timestamps: true,
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
