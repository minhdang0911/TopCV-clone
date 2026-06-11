'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { LayoutDashboard, Briefcase, PlusCircle, Building2, ChevronRight, LogOut, Menu, X, Users } from 'lucide-react';
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
];

function Sidebar({ company, logoUrl, isActive, onNavClick, onLogout }) {
    return (
        <div style={{ width: '240px', minHeight: '100vh', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            {/* Logo */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image src={topCVLogo} alt="TopCV" height={30} style={{ objectFit: 'contain' }} />
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', background: GREEN, borderRadius: '4px', padding: '2px 6px', flexShrink: 0 }}>NTD</span>
                </Link>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Nhà tuyển dụng</div>
            </div>

            {/* Company info */}
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
                    {logoUrl
                        ? <Image src={logoUrl} alt={company} width={36} height={36} unoptimized style={{ objectFit: 'contain' }} />
                        : <span style={{ fontSize: '16px', fontWeight: '700', color: GREEN }}>{company[0]?.toUpperCase()}</span>
                    }
                </div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>Employer</div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 10px' }}>
                {NAV.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    return (
                        <Link key={item.href} href={item.href} onClick={onNavClick}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', textDecoration: 'none', background: active ? '#f0fdf4' : 'transparent', color: active ? GREEN : '#374151', fontWeight: active ? '600' : '400', fontSize: '14px', marginBottom: '2px', transition: 'all 0.15s' }}
                        >
                            <Icon size={18} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {active && <ChevronRight size={14} />}
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div style={{ padding: '12px 10px', borderTop: '1px solid #f3f4f6' }}>
                <button onClick={onLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', fontSize: '14px' }}
                >
                    <LogOut size={18} />
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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
            {/* Desktop sidebar */}
            <div style={{ display: 'none' }} className="employer-sidebar-desktop">
                <Sidebar company={company} logoUrl={logoUrl} isActive={isActive} onNavClick={() => {}} onLogout={handleLogout} />
            </div>

            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setSidebarOpen(false)} />
                    <div style={{ position: 'relative', zIndex: 201 }}>
                        <Sidebar company={company} logoUrl={logoUrl} isActive={isActive} onNavClick={() => setSidebarOpen(false)} onLogout={handleLogout} />
                    </div>
                </div>
            )}

            {/* Main content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top bar */}
                <div
                    style={{
                        height: '56px',
                        background: 'white',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 20px',
                        gap: '12px',
                        position: 'sticky',
                        top: 0,
                        zIndex: 50,
                    }}
                >
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="employer-mobile-menu"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#374151',
                            display: 'none',
                        }}
                    >
                        <Menu size={22} />
                    </button>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                            {NAV.find((n) => isActive(n))?.label || 'Dashboard'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <NotificationBell iconColor="#6b7280" />
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#f0fdf4',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '700',
                                color: GREEN,
                            }}
                        >
                            {company[0]?.toUpperCase()}
                        </div>
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{company}</span>
                    </div>
                </div>

                {/* Page content */}
                <div style={{ flex: 1, padding: '24px 28px', maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
                    {children}
                </div>
            </div>

            <style>{`
                @media (min-width: 768px) {
                    .employer-sidebar-desktop { display: flex !important; }
                }
                @media (max-width: 767px) {
                    .employer-mobile-menu { display: block !important; }
                }
            `}</style>
        </div>
    );
}
