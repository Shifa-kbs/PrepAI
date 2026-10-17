import api from './api';

/**
 * Fetch aptitude section statistics, topic breakdown, and user progress
 */
export const getAptitudeStats = async () => {
  const response = await api.get('/practice/aptitude/stats');
  return response.data;
};

/**
 * Start or resume a dedicated aptitude session
 */
export const startAptitudeSession = async (payload) => {
  const response = await api.post('/practice/start', {
    moduleType: 'aptitude',
    ...payload,
  });
  return response.data;
};

/**
 * Get active in-progress aptitude session for current user
 */
export const getActiveAptitudeSession = async () => {
  const response = await api.get('/practice/active', {
    params: { moduleType: 'aptitude' },
  });
  return response.data;
};

/**
 * Get specific session by ID (for review or resumption)
 */
export const getAptitudeSessionById = async (id) => {
  const response = await api.get(`/practice/${id}`);
  return response.data;
};

/**
 * Submit an answer for a question in an aptitude session
 */
export const submitAptitudeAnswer = async (id, data) => {
  const response = await api.post(`/practice/${id}/answer`, data);
  return response.data;
};

/**
 * Toggle mark for review flag on a question
 */
export const toggleAptitudeReview = async (id, data) => {
  const response = await api.put(`/practice/${id}/review`, data);
  return response.data;
};

/**
 * Complete assessment and compute performance summary
 */
export const finishAptitudeSession = async (id) => {
  const response = await api.post(`/practice/${id}/finish`);
  return response.data;
};

/**
 * Get historical completed aptitude sessions
 */
export const getAptitudeHistory = async (params = {}) => {
  const response = await api.get('/practice/history', {
    params: { moduleType: 'aptitude', ...params },
  });
  return response.data;
};

/**
 * Abandon currently active session
 */
export const abandonActiveAptitudeSession = async () => {
  const response = await api.post('/practice/abandon');
  return response.data;
};

export default {
  getAptitudeStats,
  startAptitudeSession,
  getActiveAptitudeSession,
  getAptitudeSessionById,
  submitAptitudeAnswer,
  toggleAptitudeReview,
  finishAptitudeSession,
  getAptitudeHistory,
  abandonActiveAptitudeSession,
};
