import axiosInstance from '@/lib/axios';

const BASE = '/job-alerts';

export const jobAlertsService = {
    getAll: () => axiosInstance.get(BASE),
    create: (data) => axiosInstance.post(BASE, data),
    update: (id, data) => axiosInstance.patch(`${BASE}/${id}`, data),
    toggle: (id) => axiosInstance.patch(`${BASE}/${id}/toggle`),
    remove: (id) => axiosInstance.delete(`${BASE}/${id}`),
};
