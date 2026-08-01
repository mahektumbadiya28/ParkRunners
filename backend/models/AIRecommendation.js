import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  recommendedParking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpace',
    required: true,
  },
  distance: {
    type: String, // e.g. "350m"
    required: true,
  },
  predictedDemand: {
    type: String,
    required: true,
  },
  suggestedPrice: {
    type: Number,
    required: true,
  },
  aiScore: {
    type: Number,
    required: true,
  }
});

const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);
export default AIRecommendation;
