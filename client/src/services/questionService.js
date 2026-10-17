import api from './api';

export const getQuestions = async (params = {}) => {
  const response = await api.get('/questions', { params });
  return response.data;
};

export const getQuestionFilters = async () => {
  const response = await api.get('/questions/filters');
  return response.data;
};

export const getQuestionById = async (id) => {
  const response = await api.get(`/questions/${id}`);
  return response.data;
};

export const submitAnswer = async (id, data) => {
  const response = await api.post(`/questions/${id}/submit`, data);
  return response.data;
};

export const revealSolution = async (id, data = {}) => {
  const response = await api.post(`/questions/${id}/reveal`, data);
  return response.data;
};

export const toggleBookmark = async (id) => {
  const response = await api.post(`/questions/${id}/bookmark`);
  return response.data;
};

export const updateNotes = async (id, notes) => {
  const response = await api.put(`/questions/${id}/notes`, { notes });
  return response.data;
};

export const getQuestionProgress = async (id) => {
  const response = await api.get(`/questions/${id}/progress`);
  return response.data;
};

export default {
  getQuestions,
  getQuestionFilters,
  getQuestionById,
  submitAnswer,
  revealSolution,
  toggleBookmark,
  updateNotes,
  getQuestionProgress,
};
