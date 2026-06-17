import api from '@/lib/axios';

export const ratingsService = {
  create: (data) => api.post('/ratings', data),
  getForUser: (userId, type) => api.get(`/ratings/user?userId=${userId}&type=${type}`),
  getMyRating: (applicationId, type) => api.get(`/ratings/my?applicationId=${applicationId}&type=${type}`),
};
