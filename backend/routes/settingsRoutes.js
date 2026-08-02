import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSettings,
  updateSettings,
  updateProfile,
  updatePassword,
  getLoginHistory,
  getDevices,
  deleteDevice,
  exportData,
  deleteAccount,
  getSystemStatus
} from '../controllers/settingsController.js';

const router = express.Router();

// System Status (Public or Protected)
router.get('/system/status', getSystemStatus);

// Protected routes below
router.use(protect);

// Main settings endpoint
router.route('/')
  .get(getSettings)
  .put(updateSettings);

// Specialized endpoints requested
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.put('/profile', updateProfile);
router.put('/password', updatePassword);
router.get('/login-history', getLoginHistory);
router.get('/devices', getDevices);
router.delete('/device/:id', deleteDevice);
router.post('/export-data', exportData);
router.delete('/account', deleteAccount);

export default router;
