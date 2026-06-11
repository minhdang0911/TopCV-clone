'use client';

import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/auth.store';
import { useFCM } from '@/hooks/useFCM';
import NotificationToast from '@/app/components/NotificationToast';

function FCMProvider() {
    const { isAuthenticated, role } = useAuthStore();
    const [toast, setToast] = useState(null);

    useFCM({
        enabled: isAuthenticated && role === 'CANDIDATE',
        onForegroundMessage: (msg) => setToast(msg),
    });

    return (
        <NotificationToast
            notification={toast}
            onDismiss={() => setToast(null)}
        />
    );
}

export default function AuthProvider({ children }) {
    const initAuth = useAuthStore((state) => state.initAuth);

    useEffect(() => {
        initAuth();
    }, []);

    return (
        <>
            {children}
            <FCMProvider />
        </>
    );
}
