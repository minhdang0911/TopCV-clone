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

// ─── Xác định trang login theo role / pathname hiện tại ───────────────────────
const getLoginUrl = () => {
    if (typeof window === 'undefined') return '/login';
    const path = window.location.pathname;
    if (path.startsWith('/admin')) return '/admin/login';
    if (
        path.startsWith('/nha-tuyen-dung') ||
        path.startsWith('/employer-login') ||
        path.startsWith('/employer-register') ||
        path.startsWith('/employer-complete-profile')
    )
        return '/employer-login';
    // fallback: đọc role từ storage
    try {
        const raw = localStorage.getItem('auth-storage');
        const role = raw ? JSON.parse(raw)?.state?.role : null;
        if (role === 'EMPLOYER') return '/employer-login';
        if (role === 'ADMIN') return '/admin/login';
    } catch {}
    return '/login';
};

// ─── Decode JWT payload (không verify) ──────────────────────────────────────
const decodeJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

// ─── Kiểm tra AT còn dưới ngưỡng 2 phút không ──────────────────────────────
const isAccessTokenExpiringSoon = (token) => {
    if (!token) return false;
    const payload = decodeJwt(token);
    if (!payload?.exp) return false;
    const msLeft = payload.exp * 1000 - Date.now();
    return msLeft < 2 * 60 * 1000; // < 2 phút
};

// ─── Helpers đọc/ghi token từ Zustand persist (key: 'auth-storage') ─────────
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

// ─── Hàm thực hiện refresh token (dùng chung cho cả proactive & reactive) ───
const doRefresh = async () => {
    const refreshToken = getStoredToken('refreshToken');
    if (!refreshToken) throw new Error('NO_REFRESH_TOKEN');

    const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
        { refreshToken },
    );

    const { accessToken, refreshToken: newRefreshToken } = res.data.data;
    setStoredTokens(accessToken, newRefreshToken);
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return accessToken;
};

// ─── Request interceptor — proactive refresh khi AT sắp hết hạn ─────────────
api.interceptors.request.use(
    async (config) => {
        // Bỏ qua chính request /auth/refresh để tránh vòng lặp
        if (config.url?.includes('/auth/refresh')) return config;

        const token = getStoredToken('accessToken');

        if (token && isAccessTokenExpiringSoon(token) && !isRefreshing) {
            // AT sắp hết hạn → chủ động refresh trước khi gửi request
            isRefreshing = true;
            try {
                const newToken = await doRefresh();
                config.headers.Authorization = `Bearer ${newToken}`;
            } catch {
                // Nếu refresh thất bại ở đây → để response interceptor xử lý
                config.headers.Authorization = `Bearer ${token}`;
            } finally {
                isRefreshing = false;
            }
        } else if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

// ─── Response interceptor — reactive refresh khi nhận 401 ───────────────────
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Chỉ xử lý 401, không retry chính request refresh (tránh vòng lặp)
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            if (isRefreshing) {
                // Có refresh đang chạy → đợi rồi retry
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
                window.location.href = getLoginUrl();
                return Promise.reject(error);
            }

            try {
                const newToken = await doRefresh();

                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                processQueue(null, newToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                clearStoredAuth();
                window.location.href = getLoginUrl();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    },
);

export default api;
