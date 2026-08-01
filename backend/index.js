import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { getHealthStatus } from './controllers/healthController.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import parkingRoutes from './routes/parkingRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import valetRoutes from './routes/valetRoutes.js';
import inspectionRoutes from './routes/inspectionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Make io accessible in controllers
app.set('io', io);

// Security & Optimization Middlewares
app.use(helmet()); // Security headers
app.use(cors());
app.use(compression()); // Compress payloads
app.use(morgan('dev')); // Logging API requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize()); // Prevent NoSQL Injection

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Connect to MongoDB
connectDB();

// Health Check Endpoint
app.get('/api/health', getHealthStatus);

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'VolenPark API Gateway',
    timestamp: new Date()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/valets', valetRoutes);
app.use('/api/inspection', inspectionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

import { setupSocketHandlers } from './services/socketService.js';
setupSocketHandlers();

// Global Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5005;

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`VolenPark Backend running on port ${PORT}`);
  });
}

export { app, server, io };
