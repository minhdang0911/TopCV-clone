'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart2, Briefcase, CheckCircle, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { employerDashboardService } from '@/services/employer-dashboard.service';

const GREEN = '#00b14f';

export default function BaoCaoPage() {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            employerDashboardService.getMyReport(),
            employerDashboardService.getMyStats(),
        ])
            .then(([rRes]) => setReport(rRes.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div className="flex justify-center items-center h-56">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );

    const ov = report?.overview || {};
    const topJobs = report?.topJobs || [];

    const donutSegments = [
        { label: 'Đang tuyển', value: ov.activeJobs || 0,   color: GREEN },
        { label: 'Tạm dừng',   value: ov.inactiveJobs || 0, color: '#f59e0b' },
        { label: 'Hết hạn',    value: ov.expiredJobs || 0,  color: '#ef4444' },
    ];

    const avgApps = ov.totalJobs > 0 ? (ov.totalApplications / ov.totalJobs).toFixed(1) : 0;
    const maxApps = Math.max(...topJobs.map(j => j.applicationCount), 1);

    const overviewCards = [
        { icon: Briefcase,   label: 'Tổng tin',        value: ov.totalJobs || 0,         color: '#7c3aed', bg: 'bg-violet-50' },
        { icon: CheckCircle, label: 'Đang tuyển',      value: ov.activeJobs || 0,        color: GREEN,     bg: 'bg-green-50' },
        { icon: Users,       label: 'Tổng ứng tuyển',  value: ov.totalApplications || 0, color: '#0284c7', bg: 'bg-sky-50' },
        { icon: TrendingUp,  label: 'TB đơn/tin',      value: avgApps,                   color: '#d97706', bg: 'bg-amber-50' },
    ];

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div>
                <h1 className="text-xl font-extrabold text-slate-900 m-0">Báo cáo tuyển dụng</h1>
                <p className="text-sm text-slate-500 mt-1">Phân tích tổng quan hiệu quả tuyển dụng của bạn</p>
            </div>

            {/* Overview cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overviewCards.map((c, i) => (
                    <div key={i} className="bg-white rounded-xl px-4 py-4 border border-slate-200 shadow-sm flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
                            <c.icon size={20} color={c.color} strokeWidth={2} />
                        </div>
                        <div>
                            <div className="text-2xl font-extrabold text-slate-900 leading-none">{c.value}</div>
                            <div className="text-xs text-slate-500 mt-1 font-medium">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Donut + bar chart row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Job status donut */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                        <BarChart2 size={16} className="text-slate-400" />
                        Phân bổ tin tuyển dụng
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="relative w-[120px] h-[120px] shrink-0">
                            <ResponsiveContainer width={120} height={120}>
                                <PieChart>
                                    <Pie
                                        data={donutSegments.filter(sg => sg.value > 0).length ? donutSegments : [{ label: 'Trống', value: 1, color: '#e2e8f0' }]}
                                        cx={55} cy={55}
                                        innerRadius={36} outerRadius={52}
                                        dataKey="value"
                                        startAngle={90} endAngle={-270}
                                        strokeWidth={0}
                                    >
                                        {(donutSegments.filter(sg => sg.value > 0).length ? donutSegments : [{ label: 'Trống', value: 1, color: '#e2e8f0' }]).map((sg, i) => (
                                            <Cell key={i} fill={sg.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                                        formatter={(v, n, p) => [v, p.payload.label]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <div className="text-xl font-extrabold text-slate-900">{ov.totalJobs || 0}</div>
                                <div className="text-[10px] text-slate-400 font-semibold">Tổng tin</div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2.5 flex-1">
                            {donutSegments.map((sg, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sg.color }} />
                                        <span className="text-sm text-slate-700 font-medium">{sg.label}</span>
                                    </div>
                                    <span className="text-sm font-bold text-slate-900">{sg.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Conversion rate */}
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="text-sm font-bold text-slate-900 mb-5 flex items-center gap-2">
                        <TrendingUp size={16} className="text-slate-400" />
                        Hiệu quả tuyển dụng
                    </div>
                    <div className="flex flex-col gap-4">
                        {[
                            { label: 'Tổng ứng tuyển',     value: ov.totalApplications || 0, total: null,              color: '#0284c7', unit: ' đơn' },
                            { label: 'TB đơn / tin',        value: parseFloat(avgApps),        total: null,              color: '#7c3aed', unit: ' đơn/tin' },
                            { label: 'Tin đang hoạt động', value: ov.activeJobs || 0,         total: ov.totalJobs || 1, color: GREEN,     unit: '' },
                        ].map((item, i) => {
                            const pct = item.total !== null ? Math.round((item.value / item.total) * 100) : Math.min(100, parseFloat(item.value) * 10);
                            return (
                                <div key={i}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                                        <span className="text-sm font-bold text-slate-900">
                                            {item.value}{item.unit}
                                            {item.total !== null && <span className="text-[11px] text-slate-400 font-normal"> / {item.total}</span>}
                                        </span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, pct || 0)}%`, background: item.color }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top jobs */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Users size={16} className="text-slate-400" />
                        Top tin theo số lượng ứng tuyển
                    </div>
                    <Link href="/nha-tuyen-dung/ho-so-ung-vien" className="text-xs text-green-600 no-underline font-semibold flex items-center gap-1 hover:underline">
                        Xem hồ sơ <ArrowRight size={12} />
                    </Link>
                </div>
                {topJobs.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm bg-slate-50 rounded-xl">Chưa có tin nào có ứng tuyển</div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {topJobs.map((job, idx) => {
                            const pct = Math.round((job.applicationCount / maxApps) * 100);
                            const isExpired = job.deadline && new Date(job.deadline) < new Date();
                            const statusColor = !job.isActive ? '#f59e0b' : isExpired ? '#ef4444' : GREEN;
                            const statusLabel = !job.isActive ? 'Tạm ẩn' : isExpired ? 'Hết hạn' : 'Hoạt động';
                            return (
                                <div key={job.id} className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl border border-slate-100 ${idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                                    <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-extrabold ${idx === 0 ? 'bg-amber-100 text-amber-600' : idx === 1 ? 'bg-slate-100 text-slate-500' : idx === 2 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-slate-900 truncate">{job.title}</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: `${statusColor}18`, color: statusColor }}>{statusLabel}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: idx === 0 ? `linear-gradient(90deg, ${GREEN}, #00934a)` : '#86efac' }} />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-lg font-extrabold text-slate-900 leading-none">{job.applicationCount}</div>
                                        <div className="text-[10px] text-slate-400 font-medium">ứng tuyển</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl px-6 py-5 border border-green-200 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <div className="text-sm font-bold text-green-800">Muốn tuyển dụng hiệu quả hơn?</div>
                    <div className="text-sm text-green-600 mt-1">Đăng thêm tin hoặc kết nối trực tiếp với ứng viên phù hợp</div>
                </div>
                <div className="flex gap-2.5">
                    <Link href="/nha-tuyen-dung/dang-tin" className="px-4 py-2 bg-green-500 text-white rounded-xl no-underline text-sm font-bold shadow-[0_3px_10px_rgba(0,177,79,0.35)] hover:opacity-90 transition-opacity">Đăng tin mới</Link>
                    <Link href="/nha-tuyen-dung/ket-noi" className="px-4 py-2 bg-white text-green-600 border border-green-500 rounded-xl no-underline text-sm font-bold hover:bg-green-50 transition-colors">Kết nối ứng viên</Link>
                </div>
            </div>
        </div>
    );
}
