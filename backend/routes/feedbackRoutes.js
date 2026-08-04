import express from 'express';
import { submitPlatformFeedback } from '../controllers/feedbackController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, submitPlatformFeedback);

export default router;
