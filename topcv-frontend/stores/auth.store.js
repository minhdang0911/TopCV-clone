import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/axios';

const useAuthStore = create(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,
            role: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            hydrated: false,

            setAuth: (accessToken, refreshToken, role) => {
                set({ accessToken, refreshToken, role, isAuthenticated: true });
            },

            setUser: (user) => set({ user }),

            clearAuth: () => {
                set({
                    accessToken: null,
                    refreshToken: null,
                    role: null,
                    user: null,
                    isAuthenticated: false,
                });
            },

            initAuth: async () => {
                const token = get().accessToken;
                set({ isLoading: true });

                if (!token) {
                    set({ isLoading: false, isAuthenticated: false, hydrated: true });
                    return;
                }

                try {
                    const res = await api.get('/users/me');

                    // The interceptor may have refreshed tokens and written new values
                    // directly to localStorage. Re-read them so we don't overwrite
                    // the refreshed tokens when Zustand persist writes state.
                    let latestAccess = get().accessToken;
                    let latestRefresh = get().refreshToken;
                    try {
                        const raw = localStorage.getItem('auth-storage');
                        const stored = raw ? JSON.parse(raw).state : null;
                        if (stored?.accessToken) latestAccess = stored.accessToken;
                        if (stored?.refreshToken) latestRefresh = stored.refreshToken;
                    } catch {}

                    set({
                        user: res.data,
                        accessToken: latestAccess,
                        refreshToken: latestRefresh,
                        isAuthenticated: true,
                        isLoading: false,
                        hydrated: true,
                    });
                } catch (err) {
                    const status = err?.response?.status;
                    if (status === 401) {
                        // Interceptor already cleared localStorage and will redirect.
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            role: null,
                            isAuthenticated: false,
                            isLoading: false,
                            hydrated: true,
                        });
                    } else {
                        // Server/network error — keep tokens, just mark hydrated.
                        set({ user: null, isLoading: false, hydrated: true });
                    }
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                role: state.role,
                isAuthenticated: state.isAuthenticated,
            }),
        },
    ),
);

export default useAuthStore;
