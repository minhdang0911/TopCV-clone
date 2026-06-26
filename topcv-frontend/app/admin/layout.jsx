'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    LayoutDashboard, Users, Briefcase, Building2, CreditCard,
    MessageSquare, FileText, ScrollText, ChevronDown, ChevronRight,
    LogOut, Bell, Menu, X, Star,
} from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import Image from 'next/image';
import logo from '../assests/img/logo.png';

const NAV_GROUPS = [
    {
        label: 'MENU CHÍNH',
        items: [
            { label: 'Tổng quan',      href: '/admin/dashboard',  icon: LayoutDashboard },
            { label: 'Người dùng',     href: '/admin/users',      icon: Users },
            { label: 'Tin tuyển dụng', href: '/admin/jobs',       icon: Briefcase },
            {
                label: 'Nhà tuyển dụng', icon: Building2,
                children: [
                    { label: 'Hồ sơ DN',      href: '/admin/employers/docs' },
                    { label: 'Đánh giá',      href: '/admin/employers/reviews' },
                ],
            },
            { label: 'Thanh toán',     href: '/admin/payments',   icon: CreditCard },
            { label: 'Phản hồi',       href: '/admin/feedbacks',  icon: MessageSquare },
        ],
    },
    {
        label: 'NỘI DUNG',
        items: [
            {
                label: 'Blog', icon: FileText,
                children: [
                    { label: 'Bài viết',  href: '/admin/blog' },
                    { label: 'Danh mục', href: '/admin/blog/categories' },
                ],
            },
        ],
    },
    {
        label: 'HỆ THỐNG',
        items: [
            { label: 'Audit Logs', href: '/admin/audit-logs', icon: ScrollText },
        ],
    },
];

const CRUMB_MAP = {
    admin: 'Admin', dashboard: 'Tổng quan', users: 'Người dùng', jobs: 'Tin tuyển dụng',
    employers: 'Nhà tuyển dụng', docs: 'Hồ sơ DN', reviews: 'Đánh giá',
    payments: 'Thanh toán', feedbacks: 'Phản hồi', blog: 'Blog',
    categories: 'Danh mục', 'audit-logs': 'Audit Logs', login: 'Đăng nhập',
};

function NavItem({ item, pathname }) {
    const Icon = item.icon;
    const isLeaf = !item.children;
    const isActive = isLeaf
        ? pathname === item.href
        : item.children.some(c => pathname.startsWith(c.href));
    const [open, setOpen] = useState(isActive);

    if (!isLeaf) {
        return (
            <div>
                <button
                    onClick={() => setOpen(v => !v)}
                    className={`group w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors ${
                        isActive ? 'text-[#00b14f] bg-green-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                    <Icon size={16} className={isActive ? 'text-[#00b14f]' : 'text-slate-400 group-hover:text-slate-600'} />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                    <div className="mt-0.5 ml-[42px] flex flex-col">
                        {item.children.map(c => {
                            const childActive = pathname === c.href;
                            return (
                                <Link key={c.href} href={c.href}
                                    className={`flex items-center gap-2 py-2 px-3 text-[12.5px] rounded-md transition-colors ${
                                        childActive ? 'text-[#00b14f] font-semibold' : 'text-slate-500 hover:text-slate-800'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${childActive ? 'bg-[#00b14f]' : 'bg-slate-300'}`} />
                                    {c.label}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link href={item.href}
            className={`group flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium rounded-lg transition-colors relative ${
                isActive ? 'text-[#00b14f] bg-green-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}>
            {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00b14f] rounded-l-full" />
            )}
            <Icon size={16} className={isActive ? 'text-[#00b14f]' : 'text-slate-400 group-hover:text-slate-600'} />
            {item.label}
        </Link>
    );
}

export default function AdminLayout({ children }) {
    const router   = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, role, hydrated, clearAuth } = useAuthStore();
    const [sideOpen, setSideOpen] = useState(false);

    useEffect(() => {
        if (hydrated && pathname !== '/admin/login') {
            if (!isAuthenticated || role !== 'ADMIN') router.replace('/admin/login');
        }
    }, [hydrated, isAuthenticated, role, pathname]);

    if (pathname === '/admin/login') return <>{children}</>;

    const handleLogout = () => {
        clearAuth();
        toast.success('Đã đăng xuất');
        router.push('/admin/login');
    };

    const segments = pathname.split('/').filter(Boolean);
    const crumbs = segments.map((seg, i) => ({
        label: CRUMB_MAP[seg] ?? seg,
        href: '/' + segments.slice(0, i + 1).join('/'),
    }));

    const Sidebar = (
        <aside className="w-[230px] h-full flex flex-col bg-white border-r border-slate-200 shrink-0">
            {/* Logo */}
            <div className="h-[68px] px-5 flex items-center gap-3 border-b border-slate-100">
                <Image src={logo} alt="TopCV Admin" width={120} height={36} className="object-contain" priority />
                <span className="text-[10px] font-bold text-slate-400 tracking-[0.18em] uppercase bg-slate-100 px-2 py-0.5 rounded">Admin</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {NAV_GROUPS.map(g => (
                    <div key={g.label}>
                        <p className="px-4 mb-1 text-[10px] font-bold tracking-[0.12em] text-slate-400 uppercase">{g.label}</p>
                        <div className="space-y-0.5">
                            {g.items.map(item => <NavItem key={item.label} item={item} pathname={pathname} />)}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User */}
            <div className="border-t border-slate-100 p-3">
                <div className="flex items-center gap-2.5 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-[#00b14f] flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {user?.email?.[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-slate-800 truncate">{user?.email ?? 'Admin'}</p>
                        <p className="text-[11px] text-slate-400">Quản trị viên</p>
                    </div>
                </div>
                <button onClick={handleLogout}
                    className="mt-1 w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={14} /> Đăng xuất
                </button>
            </div>
        </aside>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Desktop sidebar */}
            <div className="hidden lg:flex h-full">{Sidebar}</div>

            {/* Mobile sidebar */}
            {sideOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSideOpen(false)} />
                    <div className="absolute left-0 top-0 h-full z-10 shadow-xl">{Sidebar}</div>
                    <button onClick={() => setSideOpen(false)}
                        className="absolute top-4 right-4 z-20 p-2 bg-white rounded-full shadow text-slate-500">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center px-6 gap-4">
                    <button className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors" onClick={() => setSideOpen(true)}>
                        <Menu size={20} />
                    </button>

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-1 text-sm flex-1 min-w-0">
                        {crumbs.map((crumb, i) => (
                            <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                                {i > 0 && <ChevronRight size={13} className="text-slate-300 shrink-0" />}
                                {i < crumbs.length - 1 ? (
                                    <Link href={crumb.href} className="text-slate-400 hover:text-slate-700 font-medium transition-colors truncate">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="font-semibold text-slate-800 truncate">{crumb.label}</span>
                                )}
                            </span>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                            <Bell size={18} />
                        </button>
                        <div className="w-8 h-8 ml-1 rounded-full bg-[#00b14f] flex items-center justify-center text-white text-sm font-bold">
                            {user?.email?.[0]?.toUpperCase() ?? 'A'}
                        </div>
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
