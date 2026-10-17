import api from './api';

export const getUserAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export default {
  getUserAnalytics,
};
