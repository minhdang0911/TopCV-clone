'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import momoLogo from '@/app/assests/img/momo.png';
import zalopayLogo from '@/app/assests/img/zalopay.png';
import vnpayLogo from '@/app/assests/img/vnpay.png';

const GREEN = '#00b14f';

const GATEWAYS = [
    { key: 'MOMO',    label: 'Ví MoMo',  color: '#a50064', logo: momoLogo },
    { key: 'ZALOPAY', label: 'ZaloPay',  color: '#0068ff', logo: zalopayLogo },
    { key: 'VNPAY',   label: 'VNPay',    color: '#e31837', logo: vnpayLogo },
];

function fmtMoney(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

// createPayment: async () => { orderId, payUrl } — caller provides this
// onSuccess: () => void
export default function PaymentModal({ open, onClose, title, description, amount, createPayment, onSuccess }) {
    const [gateway, setGateway] = useState('MOMO');
    const [phase, setPhase] = useState('select'); // select | waiting | done
    const [loading, setLoading] = useState(false);
    const pollRef = useRef(null);

    useEffect(() => {
        if (!open) {
            clearInterval(pollRef.current);
            setPhase('select');
            setLoading(false);
        }
    }, [open]);

    const stopPolling = () => clearInterval(pollRef.current);

    const startPolling = (orderId) => {
        pollRef.current = setInterval(async () => {
            try {
                const res = await api.get(`/payments/status/${orderId}`);
                const status = res.data?.status;
                if (status === 'SUCCESS') {
                    stopPolling();
                    setPhase('done');
                    toast.success('Thanh toán thành công!');
                    setTimeout(() => { onSuccess?.(); onClose?.(); }, 1200);
                } else if (status === 'FAILED') {
                    stopPolling();
                    toast.error('Thanh toán thất bại. Vui lòng thử lại.');
                    setPhase('select');
                }
            } catch {}
        }, 3000);
    };

    const handlePay = async () => {
        setLoading(true);
        try {
            const { orderId, payUrl } = await createPayment(gateway);
            if (!payUrl) { toast.error('Không thể tạo đơn thanh toán'); return; }
            localStorage.setItem('pending_payment', JSON.stringify({ orderId, gateway }));
            window.open(payUrl, '_blank');
            setPhase('waiting');
            startPolling(orderId);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
        }} onClick={(e) => { if (e.target === e.currentTarget) { stopPolling(); onClose?.(); } }}>
            <div style={{
                background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{title}</div>
                        {description && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{description}</div>}
                    </div>
                    <button onClick={() => { stopPolling(); onClose?.(); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px', flexShrink: 0 }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '20px 24px 24px' }}>
                    {phase === 'done' ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <CheckCircle size={48} color={GREEN} style={{ margin: '0 auto 12px', display: 'block' }} />
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Thanh toán thành công!</div>
                        </div>
                    ) : phase === 'waiting' ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                            <Loader2 size={40} color={GREEN} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}>Đang chờ thanh toán...</div>
                            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>Hoàn tất thanh toán trên cửa sổ vừa mở</div>
                            <button
                                onClick={() => { stopPolling(); setPhase('select'); }}
                                style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '13px', cursor: 'pointer' }}
                            >
                                Huỷ
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Amount */}
                            <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#374151' }}>Số tiền thanh toán</span>
                                <span style={{ fontSize: '18px', fontWeight: '800', color: GREEN }}>{fmtMoney(amount)}</span>
                            </div>

                            {/* Gateway select */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Chọn phương thức thanh toán</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {GATEWAYS.map(gw => (
                                        <button
                                            key={gw.key}
                                            onClick={() => setGateway(gw.key)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '12px 14px', borderRadius: '10px',
                                                border: gateway === gw.key ? `2px solid ${gw.color}` : '2px solid #e5e7eb',
                                                background: gateway === gw.key ? `${gw.color}08` : 'white',
                                                cursor: 'pointer', textAlign: 'left',
                                                transition: 'all 0.12s',
                                            }}
                                        >
                                            <Image src={gw.logo} alt={gw.label} width={32} height={32} style={{ objectFit: 'contain', borderRadius: '6px' }} />
                                            <span style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{gw.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handlePay}
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '13px', borderRadius: '10px',
                                    border: 'none', background: loading ? '#9ca3af' : GREEN,
                                    color: 'white', fontSize: '14px', fontWeight: '700',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                            >
                                {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ExternalLink size={16} />}
                                {loading ? 'Đang tạo đơn...' : 'Thanh toán ngay'}
                            </button>
                        </>
                    )}
                </div>
            </div>
            <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
        </div>
    );
}
