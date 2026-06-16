'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Briefcase, CheckCircle, PauseCircle, Clock, PlusCircle,
    TrendingUp, ArrowRight, Activity, BarChart2,
} from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { employerDashboardService } from '@/services/employer-dashboard.service';

const GREEN = '#00b14f';

const STAT_CONFIGS = [
    { key: 'total',    label: 'Tổng tin đăng',   icon: Briefcase,   color: '#7c3aed', bg: 'bg-violet-50' },
    { key: 'active',   label: 'Đang tuyển dụng', icon: CheckCircle, color: GREEN,     bg: 'bg-green-50' },
    { key: 'inactive', label: 'Tạm dừng',        icon: PauseCircle, color: '#d97706', bg: 'bg-amber-50' },
    { key: 'expired',  label: 'Hết hạn',         icon: Clock,       color: '#dc2626', bg: 'bg-red-50' },
];

const ACTION_LABELS = {
    CREATE: { label: 'Tạo mới',  color: '#059669', bg: '#d1fae5' },
    UPDATE: { label: 'Cập nhật', color: '#2563eb', bg: '#dbeafe' },
    DELETE: { label: 'Xóa',      color: '#dc2626', bg: '#fee2e2' },
    TOGGLE: { label: 'Bật/Tắt', color: '#d97706', bg: '#fef3c7' },
};

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center gap-3.5 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={22} color={color} strokeWidth={2} />
            </div>
            <div>
                <div className="text-3xl font-extrabold text-slate-900 leading-none">{value}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
            </div>
        </div>
    );
}

function WeeklyChart({ data }) {
    if (!data?.length) return null;
    const max = Math.max(...data.map((d) => d.count), 1);
    const chartData = data.map((d) => ({
        name: d.date.slice(5).replace('-', '/'),
        count: d.count,
        isHighest: d.count === max && max > 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={116}>
            <BarChart data={chartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                    cursor={{ fill: '#f1f5f9', radius: 4 }}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    formatter={(v) => [v, 'Tin đăng']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.isHighest ? GREEN : '#86efac'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

function timeAgo(dateStr) {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function EmployerDashboardPage() {
    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            employerDashboardService.getMyStats(),
            employerDashboardService.getMyLogs({ limit: 8 }),
        ])
            .then(([statsRes, logsRes]) => {
                setStats(statsRes.data);
                setLogs(logsRes.data?.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-52 gap-3 text-slate-400">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 m-0">Tổng quan</h1>
                    <p className="text-sm text-slate-500 mt-1">Theo dõi hoạt động tuyển dụng của bạn</p>
                </div>
                <Link
                    href="/nha-tuyen-dung/dang-tin"
                    className="inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_12px_rgba(0,177,79,0.3)] no-underline hover:opacity-90 transition-opacity"
                >
                    <PlusCircle size={16} />
                    Đăng tin mới
                </Link>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STAT_CONFIGS.map(cfg => (
                    <StatCard
                        key={cfg.key}
                        icon={cfg.icon}
                        label={cfg.label}
                        value={stats?.[cfg.key] ?? 0}
                        color={cfg.color}
                        bg={cfg.bg}
                    />
                ))}
            </div>

            {/* Charts + recent jobs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Weekly chart */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                                <TrendingUp size={16} color={GREEN} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">Tin đăng 7 ngày</div>
                                <div className="text-[11px] text-slate-400">Hoạt động gần đây</div>
                            </div>
                        </div>
                        <Link href="/nha-tuyen-dung/bao-cao" className="text-xs text-green-600 no-underline font-semibold flex items-center gap-1 hover:underline">
                            Xem báo cáo <ArrowRight size={12} />
                        </Link>
                    </div>
                    {stats?.weeklyGrowth?.every((d) => d.count === 0) ? (
                        <div className="text-center text-slate-400 text-sm py-8 bg-slate-50 rounded-xl">
                            Chưa có tin nào trong 7 ngày qua
                        </div>
                    ) : (
                        <WeeklyChart data={stats?.weeklyGrowth || []} />
                    )}
                </div>

                {/* Recent jobs */}
                <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                                <Briefcase size={16} color="#7c3aed" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-900">Tin đăng gần đây</div>
                                <div className="text-[11px] text-slate-400">{stats?.total || 0} tin tổng cộng</div>
                            </div>
                        </div>
                        <Link href="/nha-tuyen-dung/quan-ly-tin" className="text-xs text-violet-600 no-underline font-semibold flex items-center gap-1 hover:underline">
                            Tất cả <ArrowRight size={12} />
                        </Link>
                    </div>
                    {!stats?.recentJobs?.length ? (
                        <div className="text-center text-slate-400 text-sm py-8 bg-slate-50 rounded-xl">
                            Chưa có tin nào
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0.5">
                            {stats.recentJobs.map((job, idx) => (
                                <div key={job.id} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${job.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} className="text-sm font-semibold text-slate-900 no-underline truncate block hover:text-green-600 transition-colors">
                                            {job.title}
                                        </Link>
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                            {job.deadline && ` · HH: ${new Date(job.deadline).toLocaleDateString('vi-VN')}`}
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${job.isActive ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {job.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                    <Activity size={16} color="#64748b" />
                    Thao tác nhanh
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                    {[
                        { href: '/nha-tuyen-dung/dang-tin',   icon: PlusCircle,  label: 'Đăng tin tuyển dụng',  color: GREEN,     bg: 'bg-green-50' },
                        { href: '/nha-tuyen-dung/xem-ho-so',  icon: CheckCircle, label: 'Xem hồ sơ ứng viên',  color: '#7c3aed', bg: 'bg-violet-50' },
                        { href: '/nha-tuyen-dung/ket-noi',    icon: PlusCircle,  label: 'Kết nối ứng viên',    color: '#0284c7', bg: 'bg-sky-50' },
                        { href: '/nha-tuyen-dung/bao-cao',    icon: BarChart2,   label: 'Xem báo cáo',         color: '#d97706', bg: 'bg-amber-50' },
                    ].map(action => (
                        <Link key={action.href} href={action.href} className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-slate-200 no-underline ${action.bg} hover:shadow-sm transition-shadow`}>
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-sm">
                                <action.icon size={16} color={action.color} />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Audit logs */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Activity size={16} color="#64748b" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-900">Lịch sử hoạt động</div>
                        <div className="text-[11px] text-slate-400">8 hoạt động gần nhất</div>
                    </div>
                </div>
                {!logs.length ? (
                    <div className="text-center text-slate-400 text-sm py-6">Chưa có hoạt động nào</div>
                ) : (
                    <div className="flex flex-col">
                        {logs.map((log, idx) => {
                            const meta = ACTION_LABELS[log.action] || { label: log.action, color: '#64748b', bg: '#f1f5f9' };
                            return (
                                <div key={log.id} className={`flex items-start gap-3 py-2.5 ${idx < logs.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 whitespace-nowrap" style={{ background: meta.bg, color: meta.color }}>
                                        {meta.label}
                                    </span>
                                    <div className="flex-1">
                                        <span className="text-sm text-slate-700">
                                            <strong>{log.entity}</strong>
                                            {log.newData?.title && <span className="text-slate-500"> · {log.newData.title}</span>}
                                        </span>
                                        <div className="text-[11px] text-slate-400 mt-0.5">{timeAgo(log.createdAt)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
