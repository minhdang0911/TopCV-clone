import api from '@/lib/axios';

export const resumeService = {
    list: (type = 'resume') => api.get('/resumes', { params: { type } }),
    get: (id) => api.get(`/resumes/${id}`),
    create: (data) => api.post('/resumes', data),
    update: (id, data) => api.patch(`/resumes/${id}`, data),
    remove: (id) => api.delete(`/resumes/${id}`),
};
