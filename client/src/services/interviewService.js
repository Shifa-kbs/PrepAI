import api from './api';

export const getInterviewStatus = async () => {
  const response = await api.get('/interview/status');
  return response.data;
};

export const startMockInterview = async (payload) => {
  const response = await api.post('/interview/start', payload);
  return response.data;
};

export const getActiveMockInterview = async () => {
  const response = await api.get('/interview/active');
  return response.data;
};

export const getMockInterviewById = async (id) => {
  const response = await api.get(`/interview/${id}`);
  return response.data;
};

export const submitInterviewAnswer = async (id, data) => {
  const response = await api.post(`/interview/${id}/answer`, data);
  return response.data;
};

export const skipInterviewQuestion = async (id, data) => {
  const response = await api.post(`/interview/${id}/skip`, data);
  return response.data;
};

export const finishMockInterview = async (id) => {
  const response = await api.post(`/interview/${id}/finish`);
  return response.data;
};

export const getMockInterviewReport = async (id) => {
  const response = await api.get(`/interview/${id}/report`);
  return response.data;
};

export const getMockInterviewHistory = async (params = {}) => {
  const response = await api.get('/interview/history', { params });
  return response.data;
};

export const abandonMockInterview = async () => {
  const response = await api.post('/interview/abandon');
  return response.data;
};

export default {
  startMockInterview,
  getActiveMockInterview,
  getMockInterviewById,
  submitInterviewAnswer,
  skipInterviewQuestion,
  finishMockInterview,
  getMockInterviewReport,
  getMockInterviewHistory,
  abandonMockInterview,
};
