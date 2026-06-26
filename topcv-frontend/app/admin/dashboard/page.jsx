'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users, Briefcase, FileText, CreditCard, ArrowRight,
    TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Building2,
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const n  = (v) => v != null ? Number(v).toLocaleString('vi-VN') : '—';
const vnd = (v) => v == null ? '—' : Number(v).toLocaleString('vi-VN') + ' ₫';
const short = (v) => {
    if (v == null) return '—';
    if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B';
    if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
    return String(v);
};
const ax = (v) => {
    if (v >= 1e6) return (v / 1e6).toFixed(0) + 'M';
    if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K';
    return v;
};

const ROLE_COLORS = { ADMIN: '#f59e0b', CANDIDATE: '#00b14f', EMPLOYER: '#6366f1' };
const ROLE_LABELS = { ADMIN: 'Admin', CANDIDATE: 'Ứng viên', EMPLOYER: 'NTD' };

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function CT({ active, payload, label, fmt }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 shadow-lg rounded-lg px-3 py-2 text-xs">
            <p className="text-slate-500 mb-1">{label}</p>
            <p className="font-bold text-slate-900">{fmt ? fmt(payload[0].value) : payload[0].value}</p>
        </div>
    );
}

// ─── Stat card — Windmill/Argon style ────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconBg, iconColor, href }) {
    const inner = (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">{label}</p>
                <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
                {sub && <p className="text-xs text-slate-400 mt-1.5">{sub}</p>}
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon size={22} className={iconColor} />
            </div>
        </div>
    );
    return href ? <Link href={href}>{inner}</Link> : inner;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ h = 'h-28', className = '' }) {
    return <div className={`bg-slate-100 rounded-xl animate-pulse ${h} ${className}`} />;
}

// ─── Plan label ───────────────────────────────────────────────────────────────
function planBadge(plan) {
    if (!plan) return { label: '—', cls: 'text-slate-400' };
    if (plan.startsWith('VIEW_APPLICANTS')) return { label: 'Xem ứng tuyển', cls: 'text-violet-600 font-medium' };
    if (plan === 'PREMIUM') return { label: 'Premium', cls: 'text-amber-600 font-medium' };
    if (plan === 'PRO')     return { label: 'Pro',     cls: 'text-sky-600 font-medium' };
    return { label: plan, cls: 'text-slate-500' };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminService.getDashboard()
            .then(r => setData(r.data))
            .catch(() => toast.error('Không thể tải dữ liệu dashboard'))
            .finally(() => setLoading(false));
    }, []);

    const ov     = data?.overview ?? {};
    const monthly = data?.revenueChart?.monthly ?? [];
    const regData = data?.registrationChart ?? [];
    const pieData = data?.usersByRole ?? [];
    const byPlan  = data?.revenueChart?.byPlan ?? [];
    const byGw    = data?.revenueChart?.byGateway ?? [];
    const recent  = data?.recentPayments ?? [];

    const alerts = [
        ov.pendingDocs     > 0 && { msg: `${ov.pendingDocs} hồ sơ DN chờ duyệt`,   href: '/admin/employers/docs' },
        ov.pendingReviews  > 0 && { msg: `${ov.pendingReviews} đánh giá chờ duyệt`, href: '/admin/employers/reviews' },
        ov.pendingFeedbacks > 0 && { msg: `${ov.pendingFeedbacks} feedback chưa xử lý`, href: '/admin/feedbacks' },
    ].filter(Boolean);

    return (
        <div className="space-y-6">

            {/* Title */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Tổng quan</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Live
                </span>
            </div>

            {/* Alerts */}
            {!loading && alerts.length > 0 && (
                <div className="grid gap-2">
                    {alerts.map(a => (
                        <Link key={a.href} href={a.href}
                            className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors">
                            <AlertCircle size={15} className="text-amber-500 shrink-0" />
                            <span className="text-sm font-medium text-amber-800">{a.msg}</span>
                            <ArrowRight size={13} className="text-amber-400 ml-auto" />
                        </Link>
                    ))}
                </div>
            )}

            {/* KPI Cards — 4 col */}
            {loading ? (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Sk key={i} />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiCard
                        label="Người dùng" value={n(ov.totalUsers)}
                        sub={`+${ov.newUsersToday ?? 0} hôm nay`}
                        icon={Users} iconBg="bg-indigo-100" iconColor="text-indigo-500"
                        href="/admin/users"
                    />
                    <KpiCard
                        label="Tin tuyển dụng" value={n(ov.totalJobs)}
                        sub={`${ov.activeJobs ?? 0} đang active`}
                        icon={Briefcase} iconBg="bg-emerald-100" iconColor="text-emerald-500"
                        href="/admin/jobs"
                    />
                    <KpiCard
                        label="Đơn ứng tuyển" value={n(ov.totalApplications)}
                        icon={FileText} iconBg="bg-violet-100" iconColor="text-violet-500"
                    />
                    <KpiCard
                        label="Tổng doanh thu" value={short(ov.totalRevenue) + ' ₫'}
                        sub={`${ov.totalPayments ?? 0} giao dịch`}
                        icon={CreditCard} iconBg="bg-amber-100" iconColor="text-amber-500"
                        href="/admin/payments"
                    />
                </div>
            )}

            {/* Revenue Chart — full width */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Doanh thu theo tháng</p>
                        <p className="text-3xl font-bold text-slate-900 mt-1">{short(ov.totalRevenue)} <span className="text-lg font-semibold text-slate-400">₫</span></p>
                        <p className="text-xs text-slate-400 mt-1">{ov.totalPayments ?? 0} giao dịch thành công</p>
                    </div>
                    <div className="flex gap-6">
                        {byGw.map(g => (
                            <div key={g.gateway} className="text-right">
                                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">{g.gateway}</p>
                                <p className="text-sm font-bold text-slate-700 mt-0.5">{short(g.revenue)} ₫</p>
                                <p className="text-[10px] text-slate-400">{g.count} GD</p>
                            </div>
                        ))}
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={ax} width={48} />
                        <Tooltip content={<CT fmt={vnd} />} />
                        <Bar dataKey="revenue" fill="#00b14f" radius={[4, 4, 0, 0]} maxBarSize={36}
                            label={false} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Row 3: Registration + Recent Payments + Pie */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                {/* Registration bar — 2 cols */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-800">Đăng ký 30 ngày</p>
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                            +{ov.newUsersToday ?? 0} hôm nay
                        </span>
                    </div>
                    <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={regData} margin={{ top: 2, right: 2, left: -30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#cbd5e1' }} axisLine={false} tickLine={false}
                                tickFormatter={(v, i) => i % 7 === 0 ? v.slice(5) : ''} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<CT fmt={v => `${v} đăng ký`} />} />
                            <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={14} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Recent payments — 2 cols */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-semibold text-slate-800">Giao dịch gần nhất</p>
                        <Link href="/admin/payments" className="text-xs text-[#00b14f] hover:underline font-medium flex items-center gap-1">
                            Xem tất cả <ArrowRight size={11} />
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {recent.length === 0 && <p className="text-sm text-slate-400 text-center py-6">Chưa có giao dịch</p>}
                        {recent.map(p => {
                            const name = p.user?.candidateProfile?.fullName || p.user?.employerProfile?.companyName || p.user?.email;
                            const { label: pl, cls } = planBadge(p.plan);
                            return (
                                <div key={p.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                                        {name?.[0]?.toUpperCase() ?? '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-slate-800 truncate">{name}</p>
                                        <p className={`text-[11px] ${cls}`}>{pl} · {p.gateway}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 tabular-nums shrink-0">{short(p.amount)} ₫</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Users by role Pie — 1 col */}
                <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 p-6">
                    <p className="text-sm font-semibold text-slate-800 mb-4">Vai trò</p>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={130}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={32} outerRadius={52}
                                        paddingAngle={3} dataKey="count">
                                        {pieData.map((r, i) => (
                                            <Cell key={i} fill={ROLE_COLORS[r.role] ?? '#94a3b8'} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={v => [n(v) + ' người', '']}
                                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2 mt-2">
                                {pieData.map(r => {
                                    const total = pieData.reduce((s, x) => s + x.count, 0);
                                    return (
                                        <div key={r.role} className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-sm" style={{ background: ROLE_COLORS[r.role] ?? '#94a3b8' }} />
                                            <span className="text-[11px] text-slate-500 flex-1">{ROLE_LABELS[r.role] ?? r.role}</span>
                                            <span className="text-[11px] font-bold text-slate-700 tabular-nums">{n(r.count)}</span>
                                            <span className="text-[10px] text-slate-400 tabular-nums">
                                                {Math.round(r.count / total * 100)}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="h-32 flex items-center justify-center text-slate-400 text-sm">Chưa có dữ liệu</div>
                    )}
                </div>
            </div>

            {/* By plan */}
            {byPlan.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Doanh thu theo gói</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {byPlan.map((p, i) => {
                            const isViewApplicants = p.plan?.startsWith('VIEW_APPLICANTS');
                            const colors = [
                                { bg: 'bg-violet-50', border: 'border-violet-100', label: 'text-violet-600', val: 'text-violet-900', badge: 'bg-violet-100 text-violet-700' },
                                { bg: 'bg-amber-50',  border: 'border-amber-100',  label: 'text-amber-600',  val: 'text-amber-900',  badge: 'bg-amber-100 text-amber-700' },
                                { bg: 'bg-sky-50',    border: 'border-sky-100',    label: 'text-sky-600',    val: 'text-sky-900',    badge: 'bg-sky-100 text-sky-700' },
                                { bg: 'bg-emerald-50',border: 'border-emerald-100',label: 'text-emerald-600',val: 'text-emerald-900',badge: 'bg-emerald-100 text-emerald-700' },
                            ];
                            const c = colors[i % colors.length];
                            return (
                                <div key={p.plan} className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
                                    {/* Plan type badge */}
                                    <div className="mb-2">
                                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${c.badge}`}>
                                            {isViewApplicants ? 'Xem ứng tuyển' : `Gói ${p.plan}`}
                                        </span>
                                    </div>
                                    {/* Job info for VIEW_APPLICANTS */}
                                    {isViewApplicants && (
                                        <div className="mb-2 space-y-0.5">
                                            <p className={`text-sm font-semibold leading-tight ${c.val}`}>
                                                {p.jobTitle || <span className="italic font-normal text-slate-400">Job đã bị xóa</span>}
                                            </p>
                                            {p.companyName && (
                                                <p className={`text-[11px] font-medium opacity-80 ${c.label} flex items-center gap-1`}>
                                                    <Building2 size={10} /> {p.companyName}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <p className={`text-xl font-bold ${c.val}`}>{short(p.revenue)} ₫</p>
                                    <p className={`text-xs ${c.label} mt-0.5`}>{p.count} giao dịch</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
