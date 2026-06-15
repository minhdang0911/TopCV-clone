'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard, Briefcase, PlusCircle, Building2, ChevronRight,
    LogOut, Menu, X, Users, MessageSquare, UserPlus, Eye, BarChart2, History,
} from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import NotificationBell from '@/app/components/NotificationBell';
import topCVLogo from '@/app/assests/img/logo-home.png';

const GREEN = '#00b14f';

const NAV = [
    { href: '/nha-tuyen-dung', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
    { href: '/nha-tuyen-dung/quan-ly-tin', label: 'Quản lý tin', icon: Briefcase },
    { href: '/nha-tuyen-dung/ho-so-ung-vien', label: 'Hồ sơ ứng viên', icon: Users },
    { href: '/nha-tuyen-dung/dang-tin', label: 'Đăng tin mới', icon: PlusCircle },
    { href: '/nha-tuyen-dung/ho-so-cong-ty', label: 'Hồ sơ công ty', icon: Building2 },
    { href: '/nha-tuyen-dung/xem-ho-so', label: 'Xem hồ sơ', icon: Eye },
    { href: '/nha-tuyen-dung/ket-noi', label: 'Kết nối ứng viên', icon: UserPlus },
    { href: '/nha-tuyen-dung/bao-cao', label: 'Báo cáo', icon: BarChart2 },
    { href: '/nha-tuyen-dung/tin-nhan', label: 'Tin nhắn', icon: MessageSquare },
    { href: '/nha-tuyen-dung/lich-su-hoat-dong', label: 'Lịch sử hoạt động', icon: History },
];

function Sidebar({ company, logoUrl, isActive, onNavClick, onLogout }) {
    return (
        <div style={{
            width: '240px', minHeight: '100vh',
            background: 'white',
            borderRight: '1px solid #e5e7eb',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
            boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
        }}>
            {/* Logo */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f3f4f6' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image src={topCVLogo} alt="TopCV" height={28} style={{ objectFit: 'contain' }} />
                    <span style={{
                        fontSize: '10px', fontWeight: '700', color: 'white',
                        background: `linear-gradient(135deg, ${GREEN}, #00934a)`,
                        borderRadius: '5px', padding: '2px 7px', flexShrink: 0,
                        letterSpacing: '0.03em',
                    }}>NTD</span>
                </Link>
            </div>

            {/* Company info */}
            <div style={{
                padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #f9fafb 100%)',
            }}>
                <div style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    border: '2px solid #d1fae5', overflow: 'hidden',
                    flexShrink: 0, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', background: 'white',
                }}>
                    {logoUrl
                        ? <Image src={logoUrl} alt={company} width={38} height={38} unoptimized style={{ objectFit: 'contain' }} />
                        : <span style={{ fontSize: '17px', fontWeight: '800', color: GREEN }}>{company[0]?.toUpperCase()}</span>
                    }
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{
                        fontSize: '12px', fontWeight: '700', color: '#111827',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{company}</div>
                    <div style={{
                        fontSize: '10px', color: GREEN, fontWeight: '600',
                        display: 'flex', alignItems: 'center', gap: '3px', marginTop: '1px',
                    }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: GREEN, display: 'inline-block',
                        }} />
                        Nhà tuyển dụng
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '10px 10px 6px' }}>
                {NAV.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href} onClick={onNavClick}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                padding: '9px 10px 9px 12px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                background: active ? '#f0fdf4' : 'transparent',
                                color: active ? GREEN : '#4b5563',
                                fontWeight: active ? '600' : '400',
                                fontSize: '13px',
                                marginBottom: '1px',
                                borderLeft: active ? `3px solid ${GREEN}` : '3px solid transparent',
                                transition: 'all 0.12s',
                                position: 'relative',
                            }}
                        >
                            <Icon size={16} strokeWidth={active ? 2.5 : 1.8} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {active && <ChevronRight size={12} strokeWidth={2.5} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '10px 10px 16px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={onLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '9px 12px', borderRadius: '8px', border: 'none',
                        background: 'transparent', cursor: 'pointer',
                        color: '#9ca3af', fontSize: '13px', fontWeight: '500',
                        transition: 'color 0.12s',
                    }}
                >
                    <LogOut size={16} strokeWidth={1.8} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}

export default function EmployerDashboardLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, hydrated, isAuthenticated, role, clearAuth, refreshToken } = useAuthStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated || role !== 'EMPLOYER') {
            router.replace('/employer-login');
        }
    }, [hydrated, isAuthenticated, role, router]);

    if (!hydrated || !isAuthenticated) return null;

    const company = user?.employerProfile?.companyName || user?.email || '';
    const logoUrl = user?.employerProfile?.logoUrl;
    const isActive = (item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href));
    const handleLogout = async () => {
        try { await api.post('/auth/logout', { refreshToken }); } catch {}
        clearAuth();
        router.push('/employer-login');
    };

    const currentPage = NAV.find((n) => isActive(n))?.label || 'Dashboard';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            {/* Desktop sidebar */}
            <div style={{ display: 'none' }} className="employer-sidebar-desktop">
                <Sidebar company={company} logoUrl={logoUrl} isActive={isActive} onNavClick={() => {}} onLogout={handleLogout} />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }} onClick={() => setSidebarOpen(false)} />
                    <div style={{ position: 'relative', zIndex: 201 }}>
                        <Sidebar company={company} logoUrl={logoUrl} isActive={isActive} onNavClick={() => setSidebarOpen(false)} onLogout={handleLogout} />
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: 'white', border: 'none', borderRadius: '50%',
                            width: '36px', height: '36px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 202, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            color: '#374151',
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>
            )}

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <div style={{
                    height: '56px',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    gap: '12px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                }}>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="employer-mobile-menu"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#374151', display: 'none', padding: '4px' }}
                    >
                        <Menu size={22} />
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                            {currentPage}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <NotificationBell iconColor="#6b7280" />
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f0fdf4, #d1fae5)',
                            border: '2px solid #a7f3d0',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '800', color: GREEN, flexShrink: 0,
                            overflow: 'hidden',
                        }}>
                            {logoUrl
                                ? <Image src={logoUrl} alt={company} width={32} height={32} unoptimized style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                                : company[0]?.toUpperCase()
                            }
                        </div>
                        <span className="topbar-company" style={{ fontSize: '13px', color: '#374151', fontWeight: '600', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {company}
                        </span>
                    </div>
                </div>

                {/* Page content */}
                <div className="employer-content" style={{ flex: 1, padding: '24px 28px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                    {children}
                </div>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .employer-sidebar-desktop { display: flex !important; }
                }
                @media (max-width: 767px) {
                    .employer-mobile-menu { display: flex !important; }
                    .employer-content { padding: 16px 14px !important; }
                    .topbar-company { display: none !important; }
                }
            `}</style>
        </div>
    );
}
