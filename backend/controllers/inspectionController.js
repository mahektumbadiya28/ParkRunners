import VehicleInspection from '../models/VehicleInspection.js';
import Booking from '../models/Booking.js';
import axios from 'axios';

// @desc   Submit a vehicle inspection with AI damage detection
// @route  POST /api/inspection
export const createInspection = async (req, res, next) => {
  try {
    const { bookingId, beforeImages, afterImages, damageDescription } = req.body;

    const bookingDoc = await Booking.findById(bookingId);
    if (!bookingDoc) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Prepare images to send to AI service
    const imagesToAnalyze = beforeImages && beforeImages.length > 0 ? beforeImages : afterImages;
    let aiDamageDetected = false;
    let aiConfidenceScore = 0;
    let aiRemarks = '';

    if (imagesToAnalyze && imagesToAnalyze.length > 0) {
      try {
        const aiUrl = `${process.env.AI_SERVICE_URL || 'http://localhost:5001'}/api/ai/detect-damage/`;
        console.log(`[AI Request] Sending images to AI Service: ${aiUrl}`);

        const aiResponse = await axios.post(aiUrl, {
          images: imagesToAnalyze
        });

        if (aiResponse.data && aiResponse.data.success) {
          aiDamageDetected = aiResponse.data.detected_damage;
          aiConfidenceScore = aiResponse.data.confidence * 100; // Convert 0-1 to percentage 0-100
          aiRemarks = aiResponse.data.remarks;
          console.log(`[AI Response] Damage detected: ${aiDamageDetected}, Confidence: ${aiConfidenceScore}%`);
        }
      } catch (aiErr) {
        console.error('Failed to communicate with AI Service:', aiErr.message);
        aiRemarks = `AI Service unavailable. Manual inspect details: ${damageDescription || 'None'}`;
      }
    }

    const inspection = await VehicleInspection.create({
      bookingId,
      beforeImages: beforeImages || [],
      afterImages: afterImages || [],
      damageDetected: aiDamageDetected,
      damageDescription: aiRemarks || damageDescription || 'No description provided',
      aiConfidence: aiConfidenceScore,
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle inspection completed successfully',
      data: inspection
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get inspection by booking id
// @route  GET /api/inspection/:bookingId
export const getInspection = async (req, res, next) => {
  try {
    const inspection = await VehicleInspection.findOne({ bookingId: req.params.bookingId }).lean();
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    res.json({ success: true, data: inspection });
  } catch (err) {
    next(err);
  }
};
