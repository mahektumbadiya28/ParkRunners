import Booking from '../models/Booking.js';
import ParkingSpace from '../models/ParkingSpace.js';
import axios from 'axios';

// @desc   Get provider analytics and AI predictions
// @route  GET /api/analytics/provider
export const getProviderAnalytics = async (req, res, next) => {
  try {
    const providerId = req.user._id;

    // Fetch provider spots
    const spots = await ParkingSpace.find({ providerId }).lean();
    const spotIds = spots.map(s => s._id);

    // Fetch provider bookings
    const bookings = await Booking.find({ parkingId: { $in: spotIds } }).lean();

    // Calculate metrics
    const totalSpaces = spots.length;
    const activeParking = spots.filter(s => s.status === 'active').length;
    const availableSlots = spots.reduce((sum, s) => sum + (s.availableSlots || 0), 0);
    const totalSlots = spots.reduce((sum, s) => sum + (s.totalSlots || 0), 0);
    const occupancyRate = totalSlots > 0 ? ((totalSlots - availableSlots) / totalSlots) * 100 : 0;

    const completedBookings = bookings.filter(b => b.bookingStatus === 'completed');
    const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = bookings.filter(b => new Date(b.bookingDate) >= today).length;
    const todayEarnings = completedBookings
      .filter(b => new Date(b.bookingDate) >= today)
      .reduce((sum, b) => sum + b.totalAmount, 0);

    // Call Python AI service for demand prediction and dynamic pricing suggestions
    let aiDemandScore = 0.5;
    let aiPriceMultiplier = 1.0;
    let aiHealthScore = 85;

    try {
      const aiUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';

      const demandRes = await axios.post(`${aiUrl}/api/ai/predict-demand/`, {
        date: new Date().toISOString().split('T')[0],
        time: `${new Date().getHours()}:00`,
        weather: 'Sunny',
        is_holiday: false,
        location: spots[0]?.address || 'Downtown'
      });

      if (demandRes.data && demandRes.data.success) {
        aiDemandScore = demandRes.data.expected_demand;
      }

      const pricingRes = await axios.post(`${aiUrl}/api/ai/dynamic-price/`, {
        demand: aiDemandScore,
        availability_rate: totalSlots > 0 ? (availableSlots / totalSlots) : 0.5,
        is_weekend: [0, 6].includes(new Date().getDay())
      });

      if (pricingRes.data && pricingRes.data.success) {
        aiPriceMultiplier = pricingRes.data.price_multiplier;
      }

      // Dynamic calculation for Business Health Score
      aiHealthScore = Math.round((occupancyRate * 0.4) + (aiDemandScore * 100 * 0.3) + 30);
      aiHealthScore = Math.max(30, Math.min(100, aiHealthScore));
    } catch (aiErr) {
      console.error('Failed to retrieve AI insights:', aiErr.message);
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalSpaces,
          activeParking,
          availableSlots,
          todayBookings,
          totalBookings: bookings.length,
          totalEarnings,
          todayEarnings,
          occupancyRate: Math.round(occupancyRate),
        },
        aiInsights: {
          expectedDemand: aiDemandScore,
          suggestedPricingMultiplier: aiPriceMultiplier,
          businessHealthScore: aiHealthScore,
          expectedWeeklyRevenue: Math.round(totalEarnings * 0.25 * aiPriceMultiplier),
          suggestions: [
            aiDemandScore > 0.7
              ? "High demand predicted today. Consider enabling Dynamic Pricing to maximize revenue."
              : "Demand is moderate. Standard pricing is recommended.",
            availableSlots < (totalSlots * 0.2)
              ? "Critical capacity reached. Monitor slots to avoid overbooking."
              : "Ample parking available. Offer promotional codes to boost bookings.",
            `Suggested Dynamic Rate: ₹${Math.round((spots[0]?.hourlyPrice || 40) * aiPriceMultiplier)}/hr`
          ]
        }
      }
    });
  } catch (err) {
    next(err);
  }
};
