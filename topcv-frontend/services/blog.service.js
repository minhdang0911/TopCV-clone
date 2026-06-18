import api from '@/lib/axios';

export const blogService = {
    // Public
    listCategories: () => api.get('/blog/categories'),
    listTags: () => api.get('/blog/tags'),
    getFeatured: (limit = 5) => api.get(`/blog/featured?limit=${limit}`),
    listPosts: (params = {}) => api.get('/blog', { params }),
    getPost: (slug) => api.get(`/blog/post/${slug}`),
    getRelated: (id) => api.get(`/blog/post/${id}/related`),

    // Auth
    bookmark: (id) => api.post(`/blog/post/${id}/bookmark`),
    removeBookmark: (id) => api.delete(`/blog/post/${id}/bookmark`),
    myBookmarks: () => api.get('/blog/bookmarks'),

    // Admin
    adminListPosts: (params = {}) => api.get('/blog/admin/posts', { params }),
    createPost: (formData) => api.post('/blog/posts', formData),
    updatePost: (id, formData) => api.patch(`/blog/posts/${id}`, formData),
    publishPost: (id) => api.patch(`/blog/posts/${id}/publish`),
    unpublishPost: (id) => api.patch(`/blog/posts/${id}/unpublish`),
    deletePost: (id) => api.delete(`/blog/posts/${id}`),
    createCategory: (data) => api.post('/blog/categories', data),
    updateCategory: (id, data) => api.patch(`/blog/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/blog/categories/${id}`),
};
