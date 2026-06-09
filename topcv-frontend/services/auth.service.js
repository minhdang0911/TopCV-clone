import api from '@/lib/axios';

export const authService = {
    login: (email, password) => api.post('/auth/login', { email, password }),

    register: (data) => api.post('/auth/register', data),

    verifyOtp: (email, code, type) => api.post('/auth/verify-otp', { email, code, type }),

    resendOtp: (email) => api.post('/auth/resend-otp', { email }),

    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    verifyResetToken: (token) => api.post('/auth/verify-reset-token', { token }),

    resetPassword: (token, newPassword, confirmPassword) =>
        api.post('/auth/reset-password', { token, newPassword, confirmPassword }),

    twoFaEnable: () => api.post('/auth/2fa/enable'),
    twoFaConfirm: (code) => api.post('/auth/2fa/confirm', { code }),
    twoFaDisable: () => api.post('/auth/2fa/disable'),
    twoFaDisableConfirm: (code) => api.post('/auth/2fa/disable/confirm', { code }),
};
