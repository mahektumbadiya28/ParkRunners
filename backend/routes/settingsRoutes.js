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

// Public route (no auth required)
router.get('/system/status', getSystemStatus);

// All routes below require authentication
router.use(protect);

// Main settings CRUD
router.get('/', getSettings);
router.put('/', updateSettings);

// Profile
router.put('/profile', updateProfile);

// Password
router.put('/password', updatePassword);

// Login history / devices
router.get('/login-history', getLoginHistory);
router.get('/devices', getDevices);
router.delete('/device/:id', deleteDevice);

// Data & account
router.post('/export-data', exportData);
router.delete('/account', deleteAccount);

export default router;
