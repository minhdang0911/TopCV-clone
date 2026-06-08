import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    timeout: 10000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// ─── Helpers đọc/ghi token từ Zustand persist (key: 'auth-storage') ───
const getStoredToken = (key) => {
    try {
        const raw = localStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.[key] ?? null;
    } catch {
        return null;
    }
};

const setStoredTokens = (accessToken, refreshToken) => {
    try {
        const raw = localStorage.getItem('auth-storage');
        const parsed = raw ? JSON.parse(raw) : { state: {} };
        parsed.state.accessToken = accessToken;
        parsed.state.refreshToken = refreshToken;
        parsed.state.isAuthenticated = true;
        localStorage.setItem('auth-storage', JSON.stringify(parsed));
    } catch {}
};

const clearStoredAuth = () => {
    try {
        localStorage.removeItem('auth-storage');
    } catch {}
};

// ─── Request interceptor ───
api.interceptors.request.use(
    (config) => {
        const token = getStoredToken('accessToken');
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response interceptor ───
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = getStoredToken('refreshToken');

            if (!refreshToken) {
                isRefreshing = false;
                clearStoredAuth();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { refreshToken });

                const { accessToken, refreshToken: newRefreshToken } = res.data.data;

                setStoredTokens(accessToken, newRefreshToken);

                api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;

                processQueue(null, accessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearStoredAuth();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default api;
