import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxy will handle this
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        const { token } = JSON.parse(userInfo);
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    signup: (data) => api.post('/auth/signup', data),
    getPending: () => api.get('/auth/pending-nurses'),
    approve: (id) => api.patch(`/auth/approve/${id}`),
};

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

export const activityAPI = {
  getLogs: (limit = 10) => api.get('/activity', { params: { limit } })
};

export default api;

