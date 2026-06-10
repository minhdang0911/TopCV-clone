'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/payment.service';

function VNPayResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('PENDING');
    const [plan, setPlan] = useState('');

    useEffect(() => {
        const params = {};
        searchParams.forEach((v, k) => { params[k] = v; });

        paymentService.verifyVNPay(params)
            .then(res => {
                const s = res.data?.status;
                if (s === 'SUCCESS') {
                    setPlan(res.data.plan);
                    setStatus('SUCCESS');
                } else {
                    setStatus('FAILED');
                }
            })
            .catch(() => setStatus('FAILED'));
    }, []);

    if (status === 'PENDING') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: '#f5f5f5' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#00b14f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>Đang xác nhận thanh toán VNPay...</div>
        </div>
    );

    if (status === 'SUCCESS') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#f5f5f5' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#00b14f"/><path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#00b14f' }}>Nâng cấp thành công!</div>
            <div style={{ fontSize: '14px', color: '#555' }}>
                Tài khoản của bạn đã được nâng lên gói <strong>{plan}</strong>.
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button onClick={() => router.push('/quan-ly-cv')} style={{ background: '#00b14f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    Quản lý CV
                </button>
                <button onClick={() => router.push('/')} style={{ background: 'white', color: '#555', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}>
                    Trang chủ
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#f5f5f5' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ef4444"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444' }}>Thanh toán thất bại</div>
            <div style={{ fontSize: '14px', color: '#555' }}>Giao dịch không thành công hoặc bị huỷ. Vui lòng thử lại.</div>
            <button onClick={() => router.push('/nang-cap')} style={{ background: '#00b14f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
                Thử lại
            </button>
        </div>
    );
}

export default function VNPayResultPage() {
    return (
        <Suspense>
            <VNPayResultContent />
        </Suspense>
    );
}
