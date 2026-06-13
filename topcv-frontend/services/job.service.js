import api from '@/lib/axios';

export const jobService = {
    getAll: (params) => api.get('/jobs', { params }),
    getOne: (id) => api.get(`/jobs/${id}`),
    getSuggestions: () => api.get('/jobs/suggestions'),
    dismissSuggestion: (jobId) => api.delete(`/jobs/suggestions/dismiss/${jobId}`),
};
