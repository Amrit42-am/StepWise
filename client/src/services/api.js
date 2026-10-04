import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3001/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const approachAPI = {
  start: (problem) => api.post('/approach/start', { problem }),
  nextHint: (sessionId, studentResponse) => api.post('/approach/next', { sessionId, studentResponse })
};

export const codeAPI = {
  analyze: (problem, code, language) => api.post('/code/analyze', { problem, code, language }),
  nextHint: (sessionId, studentResponse, updatedCode) => api.post('/code/hint', { sessionId, studentResponse, updatedCode })
};

export const sessionAPI = {
  getSessions: () => api.get('/sessions'),
  getSession: (id) => api.get(`/sessions/${id}`)
};

export default api;
