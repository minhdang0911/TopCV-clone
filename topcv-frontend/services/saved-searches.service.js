import api from '@/lib/axios';

export const savedSearchesService = {
    getAll: () => api.get('/saved-searches'),
    create: (name, filters) => api.post('/saved-searches', { name, filters }),
    remove: (id) => api.delete(`/saved-searches/${id}`),
};
