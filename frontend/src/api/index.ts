import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string, tenantSlug: string) =>
    api.post('/auth/login', { email, password, tenantSlug }).then(r => r.data),
  register: (tenantName: string, slug: string, email: string, password: string) =>
    api.post('/auth/register', { tenantName, slug, email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

// ── Tenant ────────────────────────────────────────────────────────────
export const tenantApi = {
  get: () => api.get('/tenant').then(r => r.data),
  updateBranding: (data: Record<string, unknown>) => api.patch('/tenant/branding', data).then(r => r.data),
  setPublished: (published: boolean) => api.patch('/tenant/publish', { published }).then(r => r.data),
};

// ── Jobs ──────────────────────────────────────────────────────────────
export const jobsApi = {
  list: (params?: Record<string, string | number>) => api.get('/jobs', { params }).then(r => r.data),
  get: (id: string) => api.get('/jobs/' + id).then(r => r.data),
  create: (data: Record<string, unknown>) => api.post('/jobs', data).then(r => r.data),
  update: (id: string, data: Record<string, unknown>) => api.patch('/jobs/' + id, data).then(r => r.data),
  remove: (id: string) => api.delete('/jobs/' + id),
};

// ── Applications ──────────────────────────────────────────────────────
export const applicationsApi = {
  list: (params?: Record<string, string>) => api.get('/applications', { params }).then(r => r.data),
  updateStatus: (id: string, status: string) => api.patch('/applications/' + id + '/status', { status }).then(r => r.data),
};

// ── Public ────────────────────────────────────────────────────────────
export const publicApi = {
  getCompany: (slug: string) => api.get('/public/' + slug).then(r => r.data),
  getJobs: (slug: string, params?: Record<string, string>) => api.get('/public/' + slug + '/jobs', { params }).then(r => r.data),
  getJob: (slug: string, jobId: string) => api.get('/public/' + slug + '/jobs/' + jobId).then(r => r.data),
  apply: (slug: string, jobId: string, data: Record<string, unknown>) =>
    api.post('/public/' + slug + '/jobs/' + jobId + '/apply', data).then(r => r.data),
};
