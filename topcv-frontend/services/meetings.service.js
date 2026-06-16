import api from '@/lib/axios';

export const meetingsService = {
  create: (data) => api.post('/meetings', data),
  getByCode: (code) => api.get(`/meetings/${code}`),
  getToken: (code, userName) => api.post(`/meetings/${code}/token`, { userName }),
  end: (code) => api.patch(`/meetings/${code}/end`),
};
