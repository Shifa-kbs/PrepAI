import api from './api';

export const startPracticeSession = async (payload) => {
  const response = await api.post('/practice/start', payload);
  return response.data;
};

export const getActivePracticeSession = async (params = {}) => {
  const response = await api.get('/practice/active', { params });
  return response.data;
};

export const getPracticeSessionById = async (id) => {
  const response = await api.get(`/practice/${id}`);
  return response.data;
};

export const submitPracticeAnswer = async (id, data) => {
  const response = await api.post(`/practice/${id}/answer`, data);
  return response.data;
};

export const toggleReviewFlag = async (id, data) => {
  const response = await api.put(`/practice/${id}/review`, data);
  return response.data;
};

export const finishPracticeSession = async (id) => {
  const response = await api.post(`/practice/${id}/finish`);
  return response.data;
};

export const getPracticeHistory = async (params = {}) => {
  const response = await api.get('/practice/history', { params });
  return response.data;
};

export const abandonActiveSession = async () => {
  const response = await api.post('/practice/abandon');
  return response.data;
};

export default {
  startPracticeSession,
  getActivePracticeSession,
  getPracticeSessionById,
  submitPracticeAnswer,
  toggleReviewFlag,
  finishPracticeSession,
  getPracticeHistory,
  abandonActiveSession,
};
