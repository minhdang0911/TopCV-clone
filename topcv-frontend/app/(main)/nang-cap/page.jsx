'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { paymentService } from '@/services/payment.service';
import useAuthStore from '@/stores/auth.store';

const GREEN = '#00b14f';
const GOLD = '#f59e0b';

const TIERS = [
    {
        key: 'FREE', label: 'Thường', price: 'Miễn phí', duration: '', color: '#6b7280',
        cv: 6, cl: 6, badge: false, premiumTpl: false, cta: null,
    },
    {
        key: 'PRO', label: 'Pro', badge: 'VIP', price: '50.000 VNĐ', duration: '1 tháng', color: GREEN,
        cv: 12, cl: 12, verified: true, premiumTpl: true, cta: 'pro',
    },
    {
        key: 'PREMIUM', label: 'Premium', badge: 'VIP', price: '500.000 VNĐ', duration: '1 năm', color: GOLD,
        cv: 20, cl: 20, verified: true, premiumTpl: true, cta: 'premium',
    },
];

const FEATURES = [
    { label: 'Thời hạn sử dụng', render: (t) => t.key === 'FREE' ? 'Vĩnh viễn' : t.duration },
    { label: 'Số lượng CV', render: (t) => String(t.cv) },
    { label: 'Số lượng Cover Letter', render: (t) => String(t.cl) },
    { label: 'Biểu tượng xác minh tài khoản', render: (t) => t.verified ? <Check /> : <Dash /> },
    { label: 'Sử dụng mẫu CV Cao Cấp', render: (t) => t.premiumTpl ? <Check /> : <Dash /> },
    { label: 'Sử dụng mẫu Cover Letter Cao Cấp', render: (t) => t.premiumTpl ? <Check /> : <Dash /> },
];

function Check() {
    return <span style={{ color: GREEN, fontWeight: '700', fontSize: '16px' }}>✓</span>;
}
function Dash() {
    return <span style={{ color: '#d1d5db', fontSize: '16px' }}>—</span>;
}

export default function NangCapPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [currentPlan, setCurrentPlan] = useState('FREE');
    const [planExpiresAt, setPlanExpiresAt] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) return;
        paymentService.getMyPlan()
            .then(res => {
                setCurrentPlan(res.data?.plan ?? 'FREE');
                setPlanExpiresAt(res.data?.planExpiresAt ?? null);
            })
            .catch(() => {});
    }, [isAuthenticated]);

    function handleUpgrade(plan) {
        if (!isAuthenticated) { router.push('/dang-nhap'); return; }
        router.push(`/nang-cap/thanh-toan?plan=${plan.toLowerCase()}`);
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh', padding: '40px 0' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: GREEN, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    NÂNG CẤP TÀI KHOẢN
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1a1a1a' }}>
                    Mở khóa nhiều quyền lợi hơn
                </h1>
                {currentPlan !== 'FREE' && planExpiresAt && (
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#888' }}>
                        Gói {currentPlan} của bạn hết hạn: {new Date(planExpiresAt).toLocaleDateString('vi-VN')}
                    </div>
                )}
            </div>

            {/* Table */}
            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                    {/* Header row */}
                    <thead>
                        <tr>
                            <th style={{ padding: '20px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#444', borderBottom: '1px solid #f0f0f0', width: '35%' }}>
                                Loại tài khoản
                            </th>
                            {TIERS.map(t => (
                                <th key={t.key} style={{ padding: '20px 16px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', background: currentPlan === t.key ? '#f0faf5' : 'white' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '15px', fontWeight: '800', color: t.color }}>{t.label}</span>
                                        {t.badge && <span style={{ background: t.color, color: 'white', fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '4px' }}>VIP</span>}
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1a1a1a' }}>{t.price}</div>
                                    {t.duration && <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>/ {t.duration}</div>}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    {/* Feature rows */}
                    <tbody>
                        {FEATURES.map((f, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#fafafa' }}>
                                <td style={{ padding: '14px 24px', fontSize: '13px', color: '#555', borderBottom: '1px solid #f5f5f5' }}>
                                    {f.label}
                                </td>
                                {TIERS.map(t => (
                                    <td key={t.key} style={{ padding: '14px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '500', color: '#333', borderBottom: '1px solid #f5f5f5', background: currentPlan === t.key ? '#f0faf5' : 'inherit' }}>
                                        {f.render(t)}
                                    </td>
                                ))}
                            </tr>
                        ))}

                        {/* CTA row */}
                        <tr>
                            <td style={{ padding: '20px 24px' }} />
                            {TIERS.map(t => (
                                <td key={t.key} style={{ padding: '20px 16px', textAlign: 'center', background: currentPlan === t.key ? '#f0faf5' : 'white' }}>
                                    {currentPlan === t.key ? (
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: t.color, padding: '9px 20px', border: `1.5px solid ${t.color}`, borderRadius: '6px', display: 'inline-block' }}>
                                            Đang sử dụng
                                        </div>
                                    ) : t.cta ? (
                                        <button
                                            onClick={() => handleUpgrade(t.cta)}
                                            style={{ background: t.color, color: 'white', border: 'none', borderRadius: '6px', padding: '9px 24px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                                        >
                                            Nâng cấp
                                        </button>
                                    ) : null}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
