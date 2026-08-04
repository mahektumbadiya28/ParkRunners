import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';

// Mock auth middleware before importing routes
jest.unstable_mockModule('../middleware/auth.js', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'ownerId123', role: 'owner' };
    next();
  },
  authorize: () => (req, res, next) => next(),
  normalizeUserForClient: jest.fn()
}));

// Mock models before importing routes
jest.unstable_mockModule('../models/Booking.js', () => ({
  default: {
    find: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  }
}));

jest.unstable_mockModule('../models/ParkingSpace.js', () => ({
  default: {
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
  }
}));

// Use dynamic import so mocks apply
const bookingRoutesModule = await import('../routes/bookingRoutes.js');
const bookingRoutes = bookingRoutesModule.default;
const ParkingSpaceMock = (await import('../models/ParkingSpace.js')).default;
const BookingMock = (await import('../models/Booking.js')).default;

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingRoutes);

describe('Booking API Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/bookings', () => {
    it('should return 400 if spot is not available', async () => {
      ParkingSpaceMock.findOneAndUpdate.mockResolvedValue(null); // Simulate no active spots left

      const response = await request(app)
        .post('/api/bookings')
        .send({ spotId: 'spot123', startTime: '10:00', endTime: '12:00' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Spot not available');
    });

    it('should return 201 on successful booking', async () => {
      ParkingSpaceMock.findOneAndUpdate.mockResolvedValue({
        _id: 'spot123',
        hourlyPrice: 50,
      });

      BookingMock.create.mockResolvedValue({
        _id: 'booking123',
        bookingId: 'BK1234',
        totalAmount: 100
      });

      const response = await request(app)
        .post('/api/bookings')
        .send({ spotId: 'spot123', startTime: '2023-10-10T10:00:00', endTime: '2023-10-10T12:00:00' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe('booking123');
    });
  });
});
