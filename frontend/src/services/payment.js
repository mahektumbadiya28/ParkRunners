import API from './api';

export const createOrder = async (orderData) => {
  const response = await API.post('/payment/create-order', orderData);
  return response.data;
};

export const verifyPayment = async (verificationData) => {
  const response = await API.post('/payment/verify', verificationData);
  return response.data;
};

export const getPaymentHistory = async () => {
  const response = await API.get('/payment/history');
  return response.data;
};
