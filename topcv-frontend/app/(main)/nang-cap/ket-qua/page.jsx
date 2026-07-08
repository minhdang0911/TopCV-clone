'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/payment.service';

const MAX_POLLS = 100; // ~5 phút
const POLL_MS = 3000;

function KetQuaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('PENDING'); // PENDING | SUCCESS | FAILED | INVALID
    const [plan, setPlan] = useState('');
    const [countdown, setCountdown] = useState(5);
    const intervalRef = useRef(null);
    const pollCount = useRef(0);

    useEffect(() => {
        const params = {};
        searchParams.forEach((v, k) => { params[k] = v; });

        const isVNPay = !!searchParams.get('vnp_ResponseCode');
        const isMoMo = searchParams.get('partnerCode') === 'MOMO';
        const isZaloPay = !isVNPay && !isMoMo && (!!searchParams.get('apptransid') || !!searchParams.get('status'));

        const handleResult = (res) => {
            const s = res.data?.status;
            if (s === 'SUCCESS') { setPlan(res.data.plan); setStatus('SUCCESS'); localStorage.removeItem('pending_payment'); }
            else setStatus('FAILED');
        };

        if (isVNPay) {
            paymentService.verifyVNPay(params).then(handleResult).catch(() => setStatus('FAILED'));
            return;
        }

        if (isMoMo) {
            paymentService.confirmMoMo(params).then(handleResult).catch(() => setStatus('FAILED'));
            return;
        }

        if (isZaloPay) {
            // Also attach orderId from localStorage for ZaloPay if not in URL
            const stored = localStorage.getItem('pending_payment');
            if (stored) {
                try { params.orderId = JSON.parse(stored).orderId; } catch {}
            }
            paymentService.confirmZaloPay(params).then(handleResult).catch(() => setStatus('FAILED'));
            return;
        }

        // Fallback: poll by orderId from localStorage (for direct navigation)
        const stored = localStorage.getItem('pending_payment');
        if (!stored) { setStatus('INVALID'); return; }
        let { orderId } = JSON.parse(stored);
        if (!orderId) { setStatus('INVALID'); return; }

        function poll() {
            pollCount.current += 1;
            if (pollCount.current > MAX_POLLS) {
                clearInterval(intervalRef.current);
                setStatus('FAILED');
                return;
            }
            paymentService.getStatus(orderId)
                .then(res => {
                    const s = res.data?.status;
                    if (s === 'SUCCESS') {
                        clearInterval(intervalRef.current);
                        setPlan(res.data.plan);
                        setStatus('SUCCESS');
                        localStorage.removeItem('pending_payment');
                    } else if (s === 'FAILED') {
                        clearInterval(intervalRef.current);
                        setStatus('FAILED');
                        localStorage.removeItem('pending_payment');
                    }
                })
                .catch(() => {});
        }

        poll();
        intervalRef.current = setInterval(poll, POLL_MS);
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        if (status !== 'SUCCESS') return;

        const isViewApplicants = plan?.startsWith('VIEW_APPLICANTS:');
        if (!isViewApplicants) return;

        const jobId = plan.replace('VIEW_APPLICANTS:', '');

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push(`/viec-lam/${jobId}`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [status, plan, router]);

    if (status === 'PENDING') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: '#f5f5f5' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#00b14f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a1a1a' }}>Đang chờ xác nhận thanh toán...</div>
            <div style={{ fontSize: '13px', color: '#888' }}>Vui lòng hoàn tất thanh toán trong cửa sổ đã mở.</div>
        </div>
    );

    if (status === 'SUCCESS') {
        const isViewApplicants = plan?.startsWith('VIEW_APPLICANTS:');
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#f5f5f5' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#00b14f"/><path d="M7 12.5l3.5 3.5 6.5-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#00b14f' }}>
                    {isViewApplicants ? 'Thanh toán thành công!' : 'Nâng cấp thành công!'}
                </div>
                <div style={{ fontSize: '14px', color: '#555', textAlign: 'center', maxWidth: '400px', lineHeight: '1.5' }}>
                    {isViewApplicants ? (
                        <>
                            Giao dịch hoàn tất. Hệ thống sẽ tự động đưa bạn trở lại trang chi tiết việc làm trong{' '}
                            <strong style={{ color: '#00b14f', fontSize: '16px' }}>{countdown}</strong> giây...
                        </>
                    ) : (
                        <>Tài khoản của bạn đã được nâng lên gói <strong>{plan}</strong>.</>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    {isViewApplicants ? (
                        <button 
                            onClick={() => {
                                const jobId = plan.replace('VIEW_APPLICANTS:', '');
                                router.push(`/viec-lam/${jobId}`);
                            }} 
                            style={{ background: '#00b14f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                        >
                            Quay lại trang việc làm ngay
                        </button>
                    ) : (
                        <>
                            <button onClick={() => router.push('/quan-ly-cv')} style={{ background: '#00b14f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                                Quản lý CV
                            </button>
                            <button onClick={() => router.push('/')} style={{ background: 'white', color: '#555', border: '1px solid #ddd', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', cursor: 'pointer' }}>
                                Trang chủ
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (status === 'FAILED') return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#f5f5f5' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#ef4444"/><path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2.2" strokeLinecap="round"/></svg>
            </div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#ef4444' }}>Thanh toán thất bại</div>
            <div style={{ fontSize: '14px', color: '#555' }}>Giao dịch không thành công hoặc đã hết thời gian. Vui lòng thử lại.</div>
            <button onClick={() => router.push('/nang-cap')} style={{ background: '#00b14f', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}>
                Thử lại
            </button>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '14px', color: '#888' }}>Không tìm thấy thông tin thanh toán.</div>
        </div>
    );
}

export default function KetQuaPage() {
    return (
        <Suspense>
            <KetQuaContent />
        </Suspense>
    );
}
