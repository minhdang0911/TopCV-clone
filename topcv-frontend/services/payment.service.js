import api from '@/lib/axios';

export const paymentService = {
    create: (plan, gateway) => api.post('/payments/create', { plan, gateway }),

    getStatus: (orderId) => api.get(`/payments/status/${orderId}`),

    confirmMoMo: (params) => api.post('/payments/momo/confirm', params),
    confirmZaloPay: (params) => api.post('/payments/zalopay/confirm', params),
    verifyVNPay: (params) => api.post('/payments/vnpay/verify', params),

    getMyPlan: () => api.get('/payments/my-plan'),
    getMyHistory: (params) => api.get('/payments/my-history', { params }),

    // Candidate view job applicant count
    createViewJob: (jobId, gateway) => api.post('/payments/create-view-job', { jobId, gateway }),
    getJobApplicantCount: (jobId) => api.get(`/payments/job-applicant-count/${jobId}`),
};

export const PLAN_LIMITS = {
    FREE: { cv: 6, cl: 6 },
    PRO: { cv: 12, cl: 12 },
    PREMIUM: { cv: 20, cl: 20 },
};

export const PLANS = {
    PRO: { amount: 50000, durationMonths: 1, label: 'Pro', color: '#00b14f' },
    PREMIUM: { amount: 500000, durationMonths: 12, label: 'Premium', color: '#f59e0b' },
};
