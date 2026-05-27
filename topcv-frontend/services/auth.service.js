import api from '@/lib/axios';

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),

    register: (data) => api.post('/auth/register', data),

    verifyOtp: (email, code, type) => api.post('/auth/verify-otp', { email, code, type }),

    resendOtp: (email) => api.post('/auth/resend-otp', { email }),

    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    resetPassword: (token, newPassword, confirmPassword) =>
        api.post('/auth/reset-password', { token, newPassword, confirmPassword }),
};
