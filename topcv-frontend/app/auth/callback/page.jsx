'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '@/stores/auth.store';

export default function AuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { setAuth } = useAuthStore();

    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const role = searchParams.get('role');

        if (!token || !role) {
            router.push('/login');
            return;
        }

        // Lưu vào store + localStorage
        setAuth(token, refreshToken, role);

        // Redirect theo role
        if (role === 'CANDIDATE') {
            router.push('/');
        } else if (role === 'EMPLOYER') {
            router.push('/employer/dashboard');
        } else {
            router.push('/');
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p className="text-gray-500">Đang đăng nhập...</p>
        </div>
    );
}
