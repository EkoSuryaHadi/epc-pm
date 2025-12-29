import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function createApiClient(token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests if provided
  if (token) {
    client.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  return client;
}

// Helper function to create API methods
export function createApiMethods(token?: string) {
  const client = createApiClient(token);

  return {
    projects: {
      getAll: () => client.get('/projects'),
      getById: (id: string) => client.get(`/projects/${id}`),
      create: (data: any) => client.post('/projects', data),
      update: (id: string, data: any) => client.patch(`/projects/${id}`, data),
      delete: (id: string) => client.delete(`/projects/${id}`),
      addMember: (id: string, data: any) => client.post(`/projects/${id}/members`, data),
      removeMember: (id: string, userId: string) =>
        client.delete(`/projects/${id}/members/${userId}`),
    },
    wbs: {
      getAll: (projectId: string) => client.get(`/wbs?projectId=${projectId}`),
      getById: (id: string) => client.get(`/wbs/${id}`),
      create: (data: any) => client.post('/wbs', data),
      update: (id: string, data: any) => client.patch(`/wbs/${id}`, data),
      delete: (id: string) => client.delete(`/wbs/${id}`),
    },
    cost: {
      getCostCodes: (projectId: string) => client.get(`/cost/codes?projectId=${projectId}`),
      createCostCode: (data: any) => client.post('/cost/codes', data),
      updateCostCode: (id: string, data: any) => client.patch(`/cost/codes/${id}`, data),
      deleteCostCode: (id: string) => client.delete(`/cost/codes/${id}`),
      getCostEntries: (projectId: string) => client.get(`/cost/entries?projectId=${projectId}`),
      createCostEntry: (data: any) => client.post('/cost/entries', data),
      getCostSummary: (projectId: string) => client.get(`/cost/summary/${projectId}`),
    },
    schedule: {
      getAll: (projectId: string) => client.get(`/schedule?projectId=${projectId}`),
      getById: (id: string) => client.get(`/schedule/${id}`),
      create: (data: any) => client.post('/schedule', data),
      update: (id: string, data: any) => client.patch(`/schedule/${id}`, data),
      delete: (id: string) => client.delete(`/schedule/${id}`),
      getMilestones: (projectId: string) => client.get(`/schedule/milestones?projectId=${projectId}`),
      createMilestone: (data: any) => client.post('/schedule/milestones', data),
      updateMilestone: (id: string, data: any) => client.patch(`/schedule/milestones/${id}`, data),
      deleteMilestone: (id: string) => client.delete(`/schedule/milestones/${id}`),
      // Baseline methods
      getBaselines: (projectId: string) => client.get(`/schedule/baselines?projectId=${projectId}`),
      getBaseline: (id: string) => client.get(`/schedule/baselines/${id}`),
      createBaseline: (data: any) => client.post('/schedule/baselines', data),
      updateBaseline: (id: string, data: any) => client.patch(`/schedule/baselines/${id}`, data),
      deleteBaseline: (id: string) => client.delete(`/schedule/baselines/${id}`),
      activateBaseline: (id: string, projectId: string) => client.patch(`/schedule/baselines/${id}/activate`, { projectId }),
      getVarianceReport: (id: string) => client.get(`/schedule/baselines/${id}/variance`),
      getBaselineTasks: (id: string) => client.get(`/schedule/baselines/${id}/tasks`),
      // Report methods
      getCriticalPathReport: (projectId: string) => client.get(`/schedule/reports/critical-path?projectId=${projectId}`),
      getPerformanceReport: (projectId: string) => client.get(`/schedule/reports/performance?projectId=${projectId}`),
      getCompletionReport: (projectId: string) => client.get(`/schedule/reports/completion?projectId=${projectId}`),
      getScheduleSummary: (projectId: string) => client.get(`/schedule/reports/summary?projectId=${projectId}`),
    },
    progress: {
      getUpdates: (projectId: string) => client.get(`/progress/updates?projectId=${projectId}`),
      getUpdate: (id: string) => client.get(`/progress/updates/${id}`),
      createUpdate: (data: any) => client.post('/progress/updates', data),
      updateUpdate: (id: string, data: any) => client.patch(`/progress/updates/${id}`, data),
      deleteUpdate: (id: string) => client.delete(`/progress/updates/${id}`),
      getSummary: (projectId: string) => client.get(`/progress/summary/${projectId}`),
      getEVM: (projectId: string) => client.get(`/progress/evm/${projectId}`),
      getKPI: (projectId: string) => client.get(`/progress/kpi/${projectId}`),
      getSCurve: (projectId: string) => client.get(`/progress/s-curve/${projectId}`),
      getReports: (projectId: string) => client.get(`/progress/reports?projectId=${projectId}`),
      createReport: (data: any) => client.post('/progress/reports', data),
    },
    documents: {
      getAll: (projectId: string, filters?: any) => {
        const params = new URLSearchParams({ projectId, ...filters });
        return client.get(`/documents?${params}`);
      },
      getById: (id: string) => client.get(`/documents/${id}`),
      upload: (file: File, metadata: any) => {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(metadata).forEach(key => {
          if (metadata[key] !== undefined && metadata[key] !== null) {
            formData.append(key, metadata[key].toString());
          }
        });
        return client.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      },
      create: (data: any) => client.post('/documents', data),
      update: (id: string, data: any) => client.patch(`/documents/${id}`, data),
      delete: (id: string) => client.delete(`/documents/${id}`),
      download: (id: string) => client.get(`/documents/${id}/download`, { responseType: 'blob' }),
      addComment: (id: string, content: string) =>
        client.post(`/documents/${id}/comments`, { content }),
    },
    risks: {
      getAll: (projectId: string) => client.get(`/risks?projectId=${projectId}`),
      getById: (id: string) => client.get(`/risks/${id}`),
      create: (data: any) => client.post('/risks', data),
      update: (id: string, data: any) => client.patch(`/risks/${id}`, data),
      delete: (id: string) => client.delete(`/risks/${id}`),
      getMatrix: (projectId: string) => client.get(`/risks/matrix/${projectId}`),
      getChangeOrders: (projectId: string) =>
        client.get(`/risks/change-orders/list?projectId=${projectId}`),
      createChangeOrder: (data: any) => client.post('/risks/change-orders', data),
      updateChangeOrder: (id: string, data: any) => client.patch(`/risks/change-orders/${id}`, data),
      deleteChangeOrder: (id: string) => client.delete(`/risks/change-orders/${id}`),
    },
    dashboard: {
      getProjectDashboard: (projectId: string) => client.get(`/dashboard/project/${projectId}`),
    },
  };
}
