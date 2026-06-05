'use client';

import { useEffect } from 'react';
import useAuthStore from '@/stores/auth.store';

export default function AuthProvider({ children }) {
    const initAuth = useAuthStore((state) => state.initAuth);

    useEffect(() => {
        initAuth();
    }, []);

    return <>{children}</>;
}
