'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Building2, FileText, Settings, CheckCircle, Clock, AlertCircle, ChevronRight, User } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';

const GREEN = '#00b14f';

const NAV_ITEMS = [
    { href: '/nha-tuyen-dung/ho-so-cong-ty/thong-tin-tai-khoan', label: 'Thông tin tài khoản', icon: User },
    { href: '/nha-tuyen-dung/ho-so-cong-ty/xac-thuc-sdt', label: 'Xác thực số điện thoại', icon: Phone, stepKey: 'step1' },
    { href: '/nha-tuyen-dung/ho-so-cong-ty', label: 'Thông tin công ty', icon: Building2, exact: true, stepKey: 'step2' },
    { href: '/nha-tuyen-dung/ho-so-cong-ty/giay-dkkd', label: 'Giấy đăng ký doanh nghiệp', icon: FileText, stepKey: 'step3' },
    { href: '/nha-tuyen-dung/ho-so-cong-ty/cai-dat', label: 'Cài đặt', icon: Settings },
];

export default function AccountSettingsLayout({ children }) {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const profile = user?.employerProfile;
    const [vstatus, setVstatus] = useState(null);

    useEffect(() => {
        api.get('/employers/me/verification-status').then(r => setVstatus(r.data)).catch(() => {});
    }, [pathname]);

    const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href);

    const getStepBadge = (stepKey) => {
        if (!vstatus || !stepKey) return null;
        const s = vstatus[stepKey];
        if (s?.done) return <CheckCircle size={13} color={GREEN} />;
        if (stepKey === 'step3' && vstatus.step3?.status === 'PENDING') return <Clock size={13} color="#f59e0b" />;
        if (stepKey === 'step3' && vstatus.step3?.status === 'REJECTED') return <AlertCircle size={13} color="#ef4444" />;
        return null;
    };

    const level = vstatus?.level ?? 0;
    const canPost = vstatus?.canPostJob;
    const levelColor = canPost ? GREEN : level > 0 ? '#d97706' : '#dc2626';
    const levelBg = canPost ? '#f0fdf4' : level > 0 ? '#fef3c7' : '#fef2f2';
    const levelBorder = canPost ? '#bbf7d0' : level > 0 ? '#fde68a' : '#fecaca';

    return (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            {/* Sub-sidebar */}
            <div style={{ width: '220px', flexShrink: 0 }} className="account-subsidebar">
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    {/* Company card */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '8px', border: '2px solid #d1fae5', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fdf4' }}>
                                {profile?.logoUrl
                                    ? <img src={profile.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    : <span style={{ fontSize: '16px', fontWeight: '800', color: GREEN }}>{(profile?.companyName || user?.email || '?')[0]?.toUpperCase()}</span>
                                }
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {profile?.companyName || user?.email}
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>Nhà tuyển dụng</div>
                            </div>
                        </div>
                        <div style={{ padding: '6px 10px', background: levelBg, borderRadius: '8px', border: `1px solid ${levelBorder}` }}>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: levelColor }}>
                                Tài khoản xác thực: Cấp {level}/3
                            </span>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav style={{ padding: '8px' }}>
                        {NAV_ITEMS.map((item) => {
                            const active = isActive(item);
                            const Icon = item.icon;
                            const badge = getStepBadge(item.stepKey);
                            return (
                                <Link key={item.href} href={item.href} style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '9px 10px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    background: active ? '#f0fdf4' : 'transparent',
                                    color: active ? GREEN : '#4b5563',
                                    fontWeight: active ? '600' : '400',
                                    fontSize: '13px',
                                    marginBottom: '1px',
                                    borderLeft: active ? `3px solid ${GREEN}` : '3px solid transparent',
                                    transition: 'all 0.12s',
                                }}>
                                    <Icon size={15} strokeWidth={active ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                    {badge ?? (active ? <ChevronRight size={12} strokeWidth={2.5} /> : null)}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </div>

            {/* Page content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {children}
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .account-subsidebar { display: none !important; }
                }
            `}</style>
        </div>
    );
}
