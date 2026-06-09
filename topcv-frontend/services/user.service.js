import api from '@/lib/axios';

export const userService = {
    getMe: () => api.get('/users/me'),
    updateInfo: (data) => api.patch('/users/me/info', data),
    updateCandidateProfile: (data) => api.patch('/users/me/profile', data),
    changePassword: (data) => api.patch('/users/me/password', data),
};
