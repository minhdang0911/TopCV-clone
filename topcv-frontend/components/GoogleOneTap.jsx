'use client';

import { useEffect, useRef } from 'react';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { usePathname } from 'next/navigation';

const CLIENT_ID = '968267078366-flmdo6011g8qkvh27lkrrrg6r0jotjek.apps.googleusercontent.com';

export default function GoogleOneTap() {
    const { isAuthenticated, setAuth, hydrated } = useAuthStore();
    const initializedRef = useRef(false);
    const pathname = usePathname();

    useEffect(() => {
        // Không kích hoạt One Tap trên các trang Admin hoặc Nhà tuyển dụng
        if (
            pathname?.startsWith('/admin') ||
            pathname?.startsWith('/nha-tuyen-dung') ||
            pathname?.startsWith('/employer-login') ||
            pathname?.startsWith('/employer-register')
        ) {
            return;
        }

        // Chỉ chạy ở client-side, khi đã hydrate và người dùng chưa đăng nhập
        if (!hydrated || isAuthenticated || initializedRef.current) return;

        const scriptId = 'google-gsi-client';
        let script = document.getElementById(scriptId);

        const initOneTap = () => {
            if (!window.google?.accounts?.id) return;
            
            initializedRef.current = true;

            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: false, // Để người dùng tự bấm chọn tài khoản
                cancel_on_tap_outside: true,
            });

            // Kích hoạt gợi ý đăng nhập One Tap
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    console.log('One Tap prompt is not displayed:', notification.getNotDisplayedReason());
                } else if (notification.isSkippedMoment()) {
                    console.log('One Tap prompt skipped:', notification.getSkippedReason());
                } else if (notification.isDismissedMoment()) {
                    console.log('One Tap prompt dismissed:', notification.getDismissedReason());
                }
            });
        };

        const handleCredentialResponse = async (response) => {
            const credential = response.credential;
            if (!credential) return;

            const toastId = toast.loading('Đang xác minh tài khoản...');
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
                const serverBase = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl.replace(/\/api$/, '');
                
                const res = await api.post(`${serverBase}/api/auth/google-one-tap`, { token: credential });
                const { accessToken, refreshToken, role } = res.data.data;

                // Lưu trạng thái đăng nhập
                setAuth(accessToken, refreshToken, role);
                toast.success('Đăng nhập thành công!', { id: toastId });
                
                // Tải lại trang để cập nhật giao diện đã đăng nhập
                window.location.reload();
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || 'Xác thực Google thất bại', { id: toastId });
            }
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = initOneTap;
            document.head.appendChild(script);
        } else {
            initOneTap();
        }
    }, [isAuthenticated, hydrated, setAuth]);

    return null;
}
