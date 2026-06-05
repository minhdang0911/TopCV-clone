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
                    set({
                        user: res.data,
                        isAuthenticated: true,
                        isLoading: false,
                        hydrated: true,
                    });
                } catch (err) {
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        role: null,
                        isAuthenticated: false,
                        isLoading: false,
                        hydrated: true,
                    });
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
