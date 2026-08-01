import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getNotifications,
  markNotificationsRead
} from '../controllers/notificationController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.put('/read', markNotificationsRead);

export default router;
