'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import JobForm from './_JobForm';

export default function DangTinPage() {
    const router = useRouter();
    const [canPost, setCanPost] = useState(null); // null = loading

    useEffect(() => {
        api.get('/employers/me/verification-status')
            .then(res => setCanPost(res.data?.canPostJob ?? false))
            .catch(() => setCanPost(false));
    }, []);

    if (canPost === null) {
        return <div style={{ padding: '60px 0', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Đang kiểm tra xác thực...</div>;
    }

    if (!canPost) {
        return (
            <div>
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Đăng tin tuyển dụng</h1>
                </div>
                <div style={{ background: 'white', borderRadius: '16px', padding: '48px 32px', textAlign: 'center', border: '1px solid #fde68a', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '64px', height: '64px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <ShieldAlert size={32} color="#d97706" />
                    </div>
                    <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                        Tài khoản chưa được xác thực
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 28px', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                        Bạn cần hoàn thành <strong>3 bước xác thực</strong> trước khi có thể đăng tin tuyển dụng.
                        Việc này giúp đảm bảo ứng viên chỉ thấy tin từ nhà tuyển dụng hợp lệ.
                    </p>
                    <button
                        onClick={() => router.push('/nha-tuyen-dung/ho-so-cong-ty')}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, #00b14f, #00934a)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,177,79,0.3)' }}
                    >
                        Hoàn thành xác thực <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Đăng tin tuyển dụng</h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Điền đầy đủ thông tin để thu hút ứng viên phù hợp</p>
            </div>
            <JobForm />
        </div>
    );
}
