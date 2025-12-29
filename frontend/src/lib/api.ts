import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
};

export const projectsApi = {
  getAll: () => api.get('/projects'),
  getOne: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, data: any) => api.post(`/projects/${id}/members`, data),
  removeMember: (id: string, userId: string) =>
    api.delete(`/projects/${id}/members/${userId}`),
};

export const wbsApi = {
  getAll: (projectId: string) => api.get(`/wbs?projectId=${projectId}`),
  getOne: (id: string) => api.get(`/wbs/${id}`),
  create: (data: any) => api.post('/wbs', data),
  update: (id: string, data: any) => api.patch(`/wbs/${id}`, data),
  delete: (id: string) => api.delete(`/wbs/${id}`),
};

export const costApi = {
  getCostCodes: (projectId: string) =>
    api.get(`/cost/codes?projectId=${projectId}`),
  createCostCode: (data: any) => api.post('/cost/codes', data),
  getCostEntries: (projectId: string) =>
    api.get(`/cost/entries?projectId=${projectId}`),
  createCostEntry: (data: any) => api.post('/cost/entries', data),
  getCostSummary: (projectId: string) =>
    api.get(`/cost/summary/${projectId}`),
};

export const scheduleApi = {
  getAll: (projectId: string) => api.get(`/schedule?projectId=${projectId}`),
  getOne: (id: string) => api.get(`/schedule/${id}`),
  create: (data: any) => api.post('/schedule', data),
  update: (id: string, data: any) => api.patch(`/schedule/${id}`, data),
  delete: (id: string) => api.delete(`/schedule/${id}`),
  getMilestones: (projectId: string) =>
    api.get(`/schedule/milestones?projectId=${projectId}`),
  createMilestone: (data: any) => api.post('/schedule/milestones', data),
};

export const progressApi = {
  getUpdates: (projectId: string) =>
    api.get(`/progress/updates?projectId=${projectId}`),
  createUpdate: (data: any) => api.post('/progress/updates', data),
  getSummary: (projectId: string) =>
    api.get(`/progress/summary/${projectId}`),
  getReports: (projectId: string) =>
    api.get(`/progress/reports?projectId=${projectId}`),
  createReport: (data: any) => api.post('/progress/reports', data),
};

export const documentsApi = {
  getAll: (projectId: string, filters?: any) => {
    const params = new URLSearchParams({ projectId, ...filters });
    return api.get(`/documents?${params}`);
  },
  getOne: (id: string) => api.get(`/documents/${id}`),
  create: (data: any) => api.post('/documents', data),
  update: (id: string, data: any) => api.patch(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  addComment: (id: string, content: string) =>
    api.post(`/documents/${id}/comments`, { content }),
};

export const risksApi = {
  getAll: (projectId: string) => api.get(`/risks?projectId=${projectId}`),
  getOne: (id: string) => api.get(`/risks/${id}`),
  create: (data: any) => api.post('/risks', data),
  update: (id: string, data: any) => api.patch(`/risks/${id}`, data),
  delete: (id: string) => api.delete(`/risks/${id}`),
  getMatrix: (projectId: string) => api.get(`/risks/matrix/${projectId}`),
  getChangeOrders: (projectId: string) =>
    api.get(`/risks/change-orders/list?projectId=${projectId}`),
  createChangeOrder: (data: any) =>
    api.post('/risks/change-orders', data),
};

export const dashboardApi = {
  getProjectDashboard: (projectId: string) =>
    api.get(`/dashboard/project/${projectId}`),
};

// Structured API exports for cleaner imports
export default {
  auth: authApi,
  projects: projectsApi,
  wbs: wbsApi,
  cost: costApi,
  schedule: scheduleApi,
  progress: progressApi,
  documents: documentsApi,
  risks: risksApi,
  dashboard: dashboardApi,
};
