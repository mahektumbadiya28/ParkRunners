import API from './api';

export const updateUserProfile = async (id, userData) => {
  const response = await API.put(`/users/${id}`, userData);
  return response.data;
};
