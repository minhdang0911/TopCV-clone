import api from '@/lib/axios';

export const adminService = {
  // ─── Dashboard ───────────────────────────────────────────────────────────
  getDashboard: () => api.get('/admin/dashboard'),

  // ─── Payments ────────────────────────────────────────────────────────────
  getPayments: (params) => api.get('/admin/payments', { params }),
  getPaymentStats: () => api.get('/admin/payments/stats'),

  // ─── Applications ────────────────────────────────────────────────────────
  getApplicationStats: () => api.get('/admin/applications/stats'),

  // ─── Users ───────────────────────────────────────────────────────────────
  getUsers: (params) => api.get('/users/admin/all', { params }),
  getUser: (id) => api.get(`/users/admin/${id}`),
  toggleBanUser: (id) => api.patch(`/users/admin/${id}/ban`),
  changeUserRole: (id, role) => api.patch(`/users/admin/${id}/role`, { role }),

  // ─── Jobs ────────────────────────────────────────────────────────────────
  getJobs: (params) => api.get('/jobs/admin/all', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  toggleJobActive: (id) => api.patch(`/jobs/admin/${id}/toggle-active`),

  // ─── Employers ───────────────────────────────────────────────────────────
  getPendingDocs: (status) => api.get('/employers/admin/docs', { params: { status } }),
  approveDoc: (id, approve, rejectReason) =>
    api.patch(`/employers/admin/${id}/approve-doc`, { approve, rejectReason }),
  getEmployerReviews: (status) => api.get('/employers/admin/employer-reviews', { params: { status } }),
  updateReviewStatus: (reviewId, status, rejectReason) =>
    api.patch(`/employers/admin/employer-reviews/${reviewId}/status`, { status, rejectReason }),

  // ─── Feedback ────────────────────────────────────────────────────────────
  getFeedbacks: (params) => api.get('/feedback', { params }),
  replyFeedback: (id, replyText) => api.post(`/feedback/${id}/reply`, { replyText }),

  // ─── Audit Logs ──────────────────────────────────────────────────────────
  getAuditLogs: (params) => api.get('/audit-logs', { params }),
  getAuditLogStats: () => api.get('/audit-logs/stats'),

  // ─── Blog ────────────────────────────────────────────────────────────────
  adminListPosts: (params) => api.get('/blog/admin/posts', { params }),
  createCategory: (data) => api.post('/blog/categories', data),
  updateCategory: (id, data) => api.patch(`/blog/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/blog/categories/${id}`),
  createPost: (formData) =>
    api.post('/blog/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updatePost: (id, formData) =>
    api.patch(`/blog/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  publishPost: (id) => api.patch(`/blog/posts/${id}/publish`),
  unpublishPost: (id) => api.patch(`/blog/posts/${id}/unpublish`),
  deletePost: (id) => api.delete(`/blog/posts/${id}`),
};
