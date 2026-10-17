import api from './api';

export const getStudyPlan = async () => {
  const response = await api.get('/study-plan');
  return response.data;
};

export const createOrUpdatePlan = async (payload) => {
  const response = await api.post('/study-plan', payload);
  return response.data;
};

export const toggleTaskCompletion = async (taskId) => {
  const response = await api.patch(`/study-plan/tasks/${taskId}/toggle`);
  return response.data;
};

export const addCustomTask = async (taskData) => {
  const response = await api.post('/study-plan/tasks', taskData);
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/study-plan/tasks/${taskId}`);
  return response.data;
};

export default {
  getStudyPlan,
  createOrUpdatePlan,
  toggleTaskCompletion,
  addCustomTask,
  deleteTask,
};
