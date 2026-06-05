import api from '@/lib/axios';

export const jobService = {
    getAll: (params) => api.get('/jobs', { params }),
    getOne: (id) => api.get(`/jobs/${id}`),
};
