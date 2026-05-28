import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
});

// Request interceptor - gắn token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Response interceptor - bắt 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('role');

            // Chỉ redirect nếu KHÔNG phải đang ở trang auth
            const authRoutes = ['/login', '/register', '/employer-login'];
            const isAuthRoute = authRoutes.some((route) => window.location.pathname.startsWith(route));

            if (!isAuthRoute) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    },
);
export default api;
