import api from './api';

export const submitCognitiveSession = async (payload) => {
  const response = await api.post('/cognitive/session', payload);
  return response.data;
};

export const getCognitiveHistory = async (params = {}) => {
  const response = await api.get('/cognitive/history', { params });
  return response.data;
};

export const getCognitiveStats = async () => {
  const response = await api.get('/cognitive/stats');
  return response.data;
};

export default {
  submitCognitiveSession,
  getCognitiveHistory,
  getCognitiveStats,
};
