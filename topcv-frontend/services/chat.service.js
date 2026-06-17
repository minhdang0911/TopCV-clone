import api from '@/lib/axios';

export const chatgioService = {
    findOrCreate: (body) => api.post('/chat/conversations', body),
    list: () => api.get('/chat/conversations'),
    getMessages: (convId, page = 1, limit = 30) =>
        api.get(`/chat/conversations/${convId}/messages?page=${page}&limit=${limit}`),
    send: (convId, content, type = 'text', replyToId = null) =>
        api.post(`/chat/conversations/${convId}/messages`, {
            content,
            type,
            ...(replyToId && { replyToId }),
        }),
    markRead: (convId) => api.patch(`/chat/conversations/${convId}/read`),
    unreadCount: () => api.get('/chat/unread-count'),
    addReaction: (msgId, emoji) => api.post(`/chat/messages/${msgId}/reactions`, { emoji }),
    removeReaction: (msgId, emoji) => api.delete(`/chat/messages/${msgId}/reactions`, { data: { emoji } }),
};
