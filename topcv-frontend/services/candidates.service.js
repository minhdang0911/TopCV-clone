import api from '@/lib/axios';

export const candidatesService = {
  search: (params = {}) => api.get('/users/candidates', { params }),
};
