'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard, Briefcase, PlusCircle, Building2, ChevronRight,
    LogOut, Menu, Users, MessageSquare, UserPlus, Eye, BarChart2, History,
} from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import NotificationBell from '@/app/components/NotificationBell';
import topCVLogo from '@/app/assests/img/logo-home.png';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const NAV = [
    { href: '/nha-tuyen-dung',                   label: 'Tổng quan',          icon: LayoutDashboard, exact: true },
    { href: '/nha-tuyen-dung/quan-ly-tin',        label: 'Quản lý tin',        icon: Briefcase },
    { href: '/nha-tuyen-dung/ho-so-ung-vien',     label: 'Hồ sơ ứng viên',    icon: Users },
    { href: '/nha-tuyen-dung/dang-tin',           label: 'Đăng tin mới',       icon: PlusCircle },
    { href: '/nha-tuyen-dung/ho-so-cong-ty',      label: 'Hồ sơ công ty',     icon: Building2 },
    { href: '/nha-tuyen-dung/xem-ho-so',          label: 'Xem hồ sơ',         icon: Eye },
    { href: '/nha-tuyen-dung/ket-noi',            label: 'Kết nối ứng viên',  icon: UserPlus },
    { href: '/nha-tuyen-dung/bao-cao',            label: 'Báo cáo',           icon: BarChart2 },
    { href: '/nha-tuyen-dung/tin-nhan',           label: 'Tin nhắn',          icon: MessageSquare },
    { href: '/nha-tuyen-dung/lich-su-hoat-dong',  label: 'Lịch sử hoạt động', icon: History },
];

function NavItem({ item, isActive, onClick }) {
    const active = isActive(item);
    const Icon = item.icon;
    return (
        <Link
            href={item.href}
            onClick={onClick}
            className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-[3px]',
                active
                    ? 'bg-green-50 text-green-600 border-green-500 font-semibold'
                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700'
            )}
        >
            <Icon size={16} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
            {active && <ChevronRight size={12} strokeWidth={2.5} className="text-green-500" />}
        </Link>
    );
}

function SidebarContent({ company, logoUrl, isActive, onNavClick, onLogout }) {
    return (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-5 py-4 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <Image src={topCVLogo} alt="TopCV" height={28} className="object-contain" />
                    <span className="text-[10px] font-bold text-white bg-gradient-to-br from-green-500 to-green-700 rounded px-1.5 py-0.5 tracking-wide">
                        NTD
                    </span>
                </Link>
            </div>

            {/* Company info */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 bg-gradient-to-br from-green-50 to-slate-50">
                <div className="w-9 h-9 rounded-xl border-2 border-green-200 overflow-hidden shrink-0 flex items-center justify-center bg-white">
                    {logoUrl
                        ? <Image src={logoUrl} alt={company} width={36} height={36} unoptimized className="object-contain" />
                        : <span className="text-lg font-extrabold text-green-600">{company[0]?.toUpperCase()}</span>
                    }
                </div>
                <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{company}</p>
                    <p className="text-[10px] text-green-600 font-semibold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Nhà tuyển dụng
                    </p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-2.5 py-2 space-y-0.5 overflow-y-auto">
                {NAV.map(item => (
                    <NavItem key={item.href} item={item} isActive={isActive} onClick={onNavClick} />
                ))}
            </nav>

            <Separator />

            {/* Logout */}
            <div className="p-2.5">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
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

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated || role !== 'EMPLOYER') {
            router.replace('/employer-login');
        }
    }, [hydrated, isAuthenticated, role, router]);

    if (!hydrated || !isAuthenticated) return null;

    const company = user?.employerProfile?.companyName || user?.email || '';
    const logoUrl = user?.employerProfile?.logoUrl;
    const isActive = (item) => item.exact ? pathname === item.href : pathname.startsWith(item.href);
    const currentPage = NAV.find((n) => isActive(n))?.label || 'Dashboard';

    const handleLogout = async () => {
        try { await api.post('/auth/logout', { refreshToken }); } catch {}
        clearAuth();
        router.push('/employer-login');
    };

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-60 min-h-screen bg-white border-r border-slate-200 shadow-sm flex-col shrink-0">
                <SidebarContent company={company} logoUrl={logoUrl} isActive={isActive} onNavClick={() => {}} onLogout={handleLogout} />
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="sticky top-0 z-50 h-14 bg-white border-b border-slate-200 shadow-sm flex items-center px-4 gap-3">
                    {/* Mobile menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-slate-600">
                                <Menu size={22} />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-60 p-0">
                            <SidebarContent company={company} logoUrl={logoUrl} isActive={isActive} onNavClick={() => {}} onLogout={handleLogout} />
                        </SheetContent>
                    </Sheet>

                    <span className="flex-1 text-[15px] font-bold text-slate-800 truncate">{currentPage}</span>

                    <div className="flex items-center gap-2">
                        <NotificationBell iconColor="#6b7280" />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 flex items-center justify-center text-sm font-extrabold text-green-600 overflow-hidden shrink-0">
                            {logoUrl
                                ? <Image src={logoUrl} alt={company} width={32} height={32} unoptimized className="object-contain w-full h-full" />
                                : company[0]?.toUpperCase()
                            }
                        </div>
                        <span className="hidden sm:block text-sm text-slate-600 font-semibold max-w-[160px] truncate">
                            {company}
                        </span>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 p-4 md:p-6 max-w-[1200px] w-full mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
