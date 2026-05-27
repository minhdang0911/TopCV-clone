import { create } from 'zustand';

const useAuthStore = create((set) => ({
    accessToken: null,
    role: null,
    isAuthenticated: false,

    setAuth: (accessToken, role) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('role', role);
        set({ accessToken, role, isAuthenticated: true });
    },

    clearAuth: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        set({ accessToken: null, role: null, isAuthenticated: false });
    },

    initAuth: () => {
        const token = localStorage.getItem('accessToken');
        const role = localStorage.getItem('role');
        if (token) {
            set({ accessToken: token, role, isAuthenticated: true });
        }
    },
}));

export default useAuthStore;
