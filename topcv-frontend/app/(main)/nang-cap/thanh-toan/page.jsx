'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentService } from '@/services/payment.service';

const PLAN_INFO = {
    pro: { label: 'Tài khoản Pro', price: '50.000 VNĐ', duration: '1 tháng', color: '#00b14f' },
    premium: { label: 'Tài khoản Premium', price: '500.000 VNĐ', duration: '1 năm', color: '#f59e0b' },
};

const GATEWAYS = [
    { key: 'MOMO', label: 'Thanh toán bằng Ví MoMo', color: '#a50064', logo: '💜' },
    { key: 'ZALOPAY', label: 'Thanh toán bằng ZaloPay', color: '#0068ff', logo: '💙' },
    { key: 'VNPAY', label: 'Thanh toán bằng VNPay', color: '#e31837', logo: '❤️' },
];

function ThanhToanContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const plan = searchParams.get('plan') || 'pro';
    const planInfo = PLAN_INFO[plan] || PLAN_INFO.pro;

    const [gateway, setGateway] = useState('MOMO');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handlePay() {
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const res = await paymentService.create(plan, gateway);
            const { orderId, payUrl } = res.data || {};
            if (!payUrl) { setError('Không thể tạo đơn thanh toán. Vui lòng thử lại.'); return; }

            localStorage.setItem('pending_payment', JSON.stringify({ orderId, gateway, plan }));
            window.location.href = payUrl;
        } catch (e) {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '24px' }}>
                    Thanh toán nâng cấp Tài khoản VIP
                </h2>

                <div style={{ background: 'white', borderRadius: '10px', padding: '24px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
                    {/* Step 1: Plan */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px' }}>
                            1 &nbsp; Gói đã chọn
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', border: `2px solid ${planInfo.color}`, borderRadius: '8px', background: '#fafafa' }}>
                            <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: planInfo.color, flexShrink: 0 }} />
                            <div>
                                <span style={{ fontWeight: '700', color: planInfo.color }}>{planInfo.label}</span>
                                <span style={{ color: '#555', fontSize: '13px' }}> — {planInfo.price} / {planInfo.duration}</span>
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Gateway */}
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a1a', marginBottom: '14px' }}>
                            2 &nbsp; Chọn hình thức thanh toán
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {GATEWAYS.map(gw => (
                                <label
                                    key={gw.key}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px solid ${gateway === gw.key ? gw.color : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', background: gateway === gw.key ? '#fafafa' : 'white', transition: 'border-color 0.15s' }}
                                >
                                    <input type="radio" name="gateway" value={gw.key} checked={gateway === gw.key} onChange={() => setGateway(gw.key)} style={{ accentColor: gw.color, width: '16px', height: '16px' }} />
                                    <span style={{ fontSize: '20px' }}>{gw.logo}</span>
                                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a1a' }}>{gw.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px 16px', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={handlePay}
                    disabled={loading}
                    style={{ width: '100%', background: loading ? '#9ca3af' : '#00b14f', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer' }}
                >
                    {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#dc2626', lineHeight: 1.5 }}>
                    Nếu có vấn đề về thanh toán vui lòng liên hệ: hotro@topcv.vn hoặc hotline: <strong>1900 068 889</strong>
                </div>
            </div>
        </div>
    );
}

export default function ThanhToanPage() {
    return (
        <Suspense>
            <ThanhToanContent />
        </Suspense>
    );
}
