'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Phone, Building2, FileText, Settings, CheckCircle, Clock, AlertCircle, ChevronRight, User, ChevronDown } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

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
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        api.get('/employers/me/verification-status').then(r => setVstatus(r.data)).catch(() => {});
    }, [pathname]);

    useEffect(() => { setMobileOpen(false); }, [pathname]);

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
    const levelCls = canPost
        ? 'bg-green-50 border-green-200 text-green-700'
        : level > 0
            ? 'bg-amber-50 border-amber-200 text-amber-700'
            : 'bg-red-50 border-red-200 text-red-700';

    const currentItem = NAV_ITEMS.find(item => isActive(item));

    const SidebarNav = ({ onItemClick }) => (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Company card */}
            <div className="p-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-9 h-9 rounded-lg border-2 border-green-200 overflow-hidden shrink-0 flex items-center justify-center bg-green-50">
                        {profile?.logoUrl
                            ? <img src={profile.logoUrl} alt="logo" className="w-full h-full object-contain" />
                            : <span className="text-base font-extrabold text-green-600">{(profile?.companyName || user?.email || '?')[0]?.toUpperCase()}</span>
                        }
                    </div>
                    <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{profile?.companyName || user?.email}</div>
                        <div className="text-[10px] text-slate-500">Nhà tuyển dụng</div>
                    </div>
                </div>
                <div className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${levelCls}`}>
                    Tài khoản xác thực: Cấp {level}/3
                </div>
            </div>

            {/* Nav */}
            <nav className="p-2">
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item);
                    const Icon = item.icon;
                    const badge = getStepBadge(item.stepKey);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onItemClick}
                            className={cn(
                                'flex items-center gap-2 px-2.5 py-2.5 rounded-lg text-sm mb-0.5 border-l-[3px] no-underline transition-all',
                                active
                                    ? 'bg-green-50 text-green-600 border-green-500 font-semibold'
                                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-700 font-normal'
                            )}
                        >
                            <Icon size={15} strokeWidth={active ? 2.5 : 1.8} className="shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {badge ?? (active ? <ChevronRight size={12} strokeWidth={2.5} /> : null)}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );

    return (
        <div className="flex gap-5 items-start">
            {/* Desktop sub-sidebar */}
            <div className="hidden md:block w-56 shrink-0">
                <SidebarNav onItemClick={() => {}} />
            </div>

            {/* Mobile accordion trigger */}
            <div className="md:hidden w-full mb-3">
                <button
                    onClick={() => setMobileOpen(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 shadow-sm"
                >
                    <span>{currentItem?.label || 'Hồ sơ công ty'}</span>
                    <ChevronDown size={16} className={cn('transition-transform', mobileOpen && 'rotate-180')} />
                </button>
                {mobileOpen && (
                    <div className="mt-2">
                        <SidebarNav onItemClick={() => setMobileOpen(false)} />
                    </div>
                )}
            </div>

            {/* Page content */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}
