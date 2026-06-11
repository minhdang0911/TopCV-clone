import api from '@/lib/axios';

export const applicationsService = {
  apply: (data) => api.post('/applications', data),
  checkApplied: (jobId) => api.get('/applications/check', { params: { jobId } }),
  getMy: (params = {}) => api.get('/applications/my', { params }),
  withdraw: (id) => api.delete(`/applications/${id}/withdraw`),

  // Employer
  getByJob: (jobId, params = {}) => api.get(`/applications/job/${jobId}`, { params }),
  getAllByEmployer: (params = {}) => api.get('/applications/employer', { params }),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
};

export const savedJobsService = {
  toggle: (jobId) => api.post(`/saved-jobs/${jobId}/toggle`),
  check: (jobId) => api.get(`/saved-jobs/${jobId}/check`),
  getMy: (params = {}) => api.get('/saved-jobs/my', { params }),
};
