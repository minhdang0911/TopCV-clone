'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotificationRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/cai-dat-thong-bao-viec-lam');
    }, [router]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            <div className="text-center">
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: '2px solid #e5e7eb',
                    borderTopColor: '#00b14f',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px'
                }}></div>
                <p style={{ color: '#6b7280', fontSize: '13px' }}>Đang chuyển hướng đến trang Cài đặt thông báo việc làm...</p>
                <style>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
