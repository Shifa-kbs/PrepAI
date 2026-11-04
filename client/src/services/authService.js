import api from './api';

export const updateUserProfile = async (payload) => {
  const response = await api.put('/auth/profile', payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default {
  updateUserProfile,
  getCurrentUser,
};
