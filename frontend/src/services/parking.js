import API from './api';

// // Parking spots
// export const listSpots = () => API.get('/spots').then((res) => res.data);
// export const createSpot = (spot) => API.post('/spots', spot).then((res) => res.data);
// export const listMySpots = () => API.get('/spots/mine').then((res) => res.data);
// Parking spaces
export const listSpots = () => API.get('/parking').then((res) => res.data);
export const createSpot = (spot) => API.post('/parking', spot).then((res) => res.data);
export const listMySpots = () => API.get('/parking/mine').then((res) => res.data);

// Bookings
export const listMyBookings = () => API.get('/bookings').then((res) => res.data);
export const bookSpot = (spotId) => API.post('/bookings', { spot: spotId }).then((res) => res.data);
export const listAvailableJobs = () => API.get('/bookings/available').then((res) => res.data);
export const bookingAction = (bookingId, action) =>
  API.post(`/bookings/${bookingId}/action`, { action }).then((res) => res.data);
