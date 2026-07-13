import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID associated with the notification is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
  },
  message: {
    type: String,
    required: [true, 'Notification body message is required'],
    trim: true,
  },
  type: {
    type: String, // e.g. 'info', 'booking_status', 'payment', 'alert'
    default: 'info',
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true,
  }
}, {
  timestamps: true,
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
