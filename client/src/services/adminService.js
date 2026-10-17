import api from './api';

export const getPlatformStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const getAdminQuestions = async (params = {}) => {
  const response = await api.get('/admin/questions', { params });
  return response.data;
};

export const createQuestion = async (questionData) => {
  const response = await api.post('/admin/questions', questionData);
  return response.data;
};

export const updateQuestion = async (id, questionData) => {
  const response = await api.put(`/admin/questions/${id}`, questionData);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/admin/questions/${id}`);
  return response.data;
};

export default {
  getPlatformStats,
  getUsers,
  updateUserRole,
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
