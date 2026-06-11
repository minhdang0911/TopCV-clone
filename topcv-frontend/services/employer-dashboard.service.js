import api from '@/lib/axios';

export const employerDashboardService = {
  getMyStats: () => api.get('/jobs/my-stats'),
  getMyLogs: (params = {}) => api.get('/audit-logs/my', { params }),
  getMyJobs: (params = {}) => api.get('/jobs/my', { params }),
  getIndustries: () => api.get('/industries?limit=100'),
  getJobPositions: () => api.get('/job-positions?limit=200'),
  createJob: (data) => api.post('/jobs', data),
  updateJob: (id, data) => api.patch(`/jobs/${id}`, data),
  toggleActive: (id) => api.patch(`/jobs/${id}/toggle-active`),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getJobById: (id) => api.get(`/jobs/${id}`),
};
