import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy will handle this
});

export const bedAPI = {
  getAll: (params) => api.get('/beds', { params }),
  add: (data) => api.post('/beds', data),
  updateStatus: (id, status) => api.patch(`/beds/${id}/status`, { status }),
};

export const patientAPI = {
  register: (data) => api.post('/patients/register', data),
  getQueue: () => api.get('/patients/queue'),
  getAll: (params) => api.get('/patients', { params }),
  get: (id) => api.get(`/patients/${id}`),
  allocate: (id) => api.post(`/patients/${id}/allocate`),
};

export default api;
