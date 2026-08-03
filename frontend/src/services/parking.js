import API from './api';

// // Parking spots
// export const listSpots = () => API.get('/spots').then((res) => res.data);
// export const createSpot = (spot) => API.post('/spots', spot).then((res) => res.data);
// export const listMySpots = () => API.get('/spots/mine').then((res) => res.data);
// Parking spaces
export const listSpots = () => API.get('/parking').then((res) => res.data);
export const createSpot = (spot) => API.post('/parking', spot).then((res) => res.data);
export const updateSpot = (id, spot) => API.put(`/parking/${id}`, spot).then((res) => res.data);
export const deleteSpot = (id) => API.delete(`/parking/${id}`).then((res) => res.data);
export const listMySpots = () => API.get('/parking/mine').then((res) => res.data);

// Bookings
export const listMyBookings = () => API.get('/bookings').then((res) => res.data);
export const bookSpot = (spotId, formData = {}) => {
  const startDateTime = `${formData.date || new Date().toISOString().split('T')[0]}T${formData.startTime || '10:00'}:00`;
  const endDate = new Date(startDateTime);
  endDate.setHours(endDate.getHours() + (parseInt(formData.duration) || 2));
  const endDateTime = endDate.toISOString();
  return API.post('/bookings', {
    spotId,
    startTime: startDateTime,
    endTime: endDateTime,
    vehicleId: formData.vehicleId || undefined,
    requireValet: formData.requireValet || false
  }).then(res => res.data);
};
export const listAvailableJobs = () => API.get('/bookings/available').then((res) => res.data);
export const bookingAction = (bookingId, action) =>
  API.post(`/bookings/${bookingId}/action`, { action }).then((res) => res.data);
