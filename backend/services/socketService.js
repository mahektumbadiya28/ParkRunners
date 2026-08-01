import { io } from '../index.js';

export const setupSocketHandlers = () => {
  if (!io) {
    console.error('Socket.io not initialized.');
    return;
  }

  io.on('connection', (socket) => {
    // console.log(`[Socket] Client connected: ${socket.id}`);

    // Join a room for a specific booking to track vehicle
    socket.on('join_booking', (bookingId) => {
      socket.join(`booking_${bookingId}`);
      // console.log(`[Socket] Client joined booking room: booking_${bookingId}`);
    });

    // Leave a room
    socket.on('leave_booking', (bookingId) => {
      socket.leave(`booking_${bookingId}`);
    });

    // Handle location updates from valet
    socket.on('update_location', (data) => {
      const { bookingId, latitude, longitude } = data;
      // Broadcast to everyone else in the room
      socket.to(`booking_${bookingId}`).emit('location_updated', { latitude, longitude });
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};
