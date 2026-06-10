import api from '@/lib/axios';

export const coverLetterService = {
    getAll: () => api.get('/cover-letters'),

    getById: (id) => api.get(`/cover-letters/${id}`),

    create: (body) => api.post('/cover-letters', body),

    update: (id, body) => api.patch(`/cover-letters/${id}`, body),

    remove: (id) => api.delete(`/cover-letters/${id}`),

    uploadAvatar: (file) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/upload/cover-letter-avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};
