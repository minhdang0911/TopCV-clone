'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Users, Briefcase, CalendarCheck, CheckCircle2,
    XCircle, Clock, ArrowRight, Download,
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { applicationsService } from '@/services/applications.service';
import { employerDashboardService } from '@/services/employer-dashboard.service';

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = [
    { key: 'PENDING',   label: 'Chờ xem xét',  color: '#94a3b8' },
    { key: 'REVIEWING', label: 'Đang xem xét',  color: '#3b82f6' },
    { key: 'INTERVIEW', label: 'Hẹn phỏng vấn', color: '#f59e0b' },
    { key: 'OFFERED',   label: 'Gửi đề nghị',   color: '#8b5cf6' },
    { key: 'REJECTED',  label: 'Từ chối',        color: '#ef4444' },
    { key: 'WITHDRAWN', label: 'Rút đơn',        color: '#64748b' },
];

const STATUS_MAP = Object.fromEntries(STATUS_CONFIG.map(s => [s.key, s]));

// ─── Summary cards ────────────────────────────────────────────────────────────
function SummaryCards({ total, statusCounts, jobOverview }) {
    const cards = [
        { label: 'Hồ sơ tiếp nhận', value: total,                              icon: Users,         color: '#0284c7', bg: '#eff6ff' },
        { label: 'Hẹn phỏng vấn',   value: statusCounts?.INTERVIEW || 0,       icon: CalendarCheck, color: '#f59e0b', bg: '#fffbeb' },
        { label: 'Gửi đề nghị',     value: statusCounts?.OFFERED || 0,         icon: CheckCircle2,  color: '#8b5cf6', bg: '#f5f3ff' },
        { label: 'Từ chối',         value: statusCounts?.REJECTED || 0,        icon: XCircle,       color: '#ef4444', bg: '#fef2f2' },
        { label: 'Tin đang tuyển',  value: jobOverview?.activeJobs || 0,       icon: Briefcase,     color: '#00b14f', bg: '#f0fdf4' },
    ];
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map((c, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.bg }}>
                        <c.icon size={17} color={c.color} strokeWidth={2} />
                    </div>
                    <div>
                        <div className="text-[22px] font-extrabold text-slate-900 leading-none">{c.value.toLocaleString()}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5 font-medium leading-snug">{c.label}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ─── Funnel bars ──────────────────────────────────────────────────────────────
function StatusFunnel({ statusCounts, total }) {
    if (!total) return (
        <div className="py-10 text-center text-slate-400 text-[13px]">Chưa có hồ sơ ứng tuyển</div>
    );
    return (
        <div className="space-y-3">
            {STATUS_CONFIG.map(cfg => {
                const count = statusCounts?.[cfg.key] || 0;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                    <div key={cfg.key} className="flex items-center gap-3">
                        <div className="w-[110px] shrink-0 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.color }} />
                            <span className="text-[12px] text-slate-600 font-medium truncate">{cfg.label}</span>
                        </div>
                        <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden">
                            <div
                                className="h-full rounded-md transition-all duration-700 flex items-center px-2"
                                style={{ width: `${Math.max(pct, pct > 0 ? 3 : 0)}%`, background: cfg.color, minWidth: count > 0 ? 28 : 0 }}
                            />
                        </div>
                        <div className="w-[64px] shrink-0 text-right">
                            <span className="text-[13px] font-bold text-slate-800">{count.toLocaleString()}</span>
                            <span className="text-[11px] text-slate-400 ml-1">({pct}%)</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Line chart ───────────────────────────────────────────────────────────────
const CHART_LINES = [
    { key: 'total',     label: 'Hồ sơ tiếp nhận', color: '#0284c7' },
    { key: 'INTERVIEW', label: 'Hẹn phỏng vấn',   color: '#f59e0b' },
    { key: 'OFFERED',   label: 'Gửi đề nghị',     color: '#8b5cf6' },
    { key: 'REJECTED',  label: 'Từ chối',          color: '#ef4444' },
];

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-md px-3 py-2.5 text-[12px]">
            <p className="font-bold text-slate-700 mb-1.5">{label}</p>
            {payload.map(p => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-0.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-slate-600">{p.name}</span>
                    <span className="font-bold text-slate-800 ml-auto pl-3">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

function TrendChart({ timeSeries, period, onPeriodChange }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div className="text-[13px] font-bold text-slate-800">Hiệu quả tuyển dụng theo thời gian</div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                    {[['daily', '30 ngày'], ['monthly', '12 tháng']].map(([v, l]) => (
                        <button key={v} onClick={() => onPeriodChange(v)}
                            className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors ${period === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                            {l}
                        </button>
                    ))}
                </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={timeSeries} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false}
                        interval={period === 'daily' ? 4 : 1} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8}
                        formatter={(v) => <span style={{ fontSize: 11, color: '#64748b' }}>{v}</span>} />
                    {CHART_LINES.map(l => (
                        <Line key={l.key} type="monotone" dataKey={l.key} name={l.label}
                            stroke={l.color} strokeWidth={2} dot={false}
                            activeDot={{ r: 4, strokeWidth: 0 }} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// ─── Per-job table ────────────────────────────────────────────────────────────
const TABLE_COLS = [
    { key: 'total',     label: 'Tổng',       color: '#0284c7' },
    { key: 'REVIEWING', label: 'Xem xét',    color: '#3b82f6' },
    { key: 'INTERVIEW', label: 'Phỏng vấn',  color: '#f59e0b' },
    { key: 'OFFERED',   label: 'Đề nghị',    color: '#8b5cf6' },
    { key: 'REJECTED',  label: 'Từ chối',    color: '#ef4444' },
];

function JobTable({ perJob }) {
    if (!perJob?.length) return (
        <div className="py-10 text-center text-slate-400 text-[13px]">Chưa có dữ liệu</div>
    );
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
                <thead>
                    <tr className="border-b border-slate-100">
                        <th className="text-left py-2.5 pr-4 font-semibold text-slate-500 text-[12px] uppercase tracking-wide">Tin tuyển dụng</th>
                        {TABLE_COLS.map(c => (
                            <th key={c.key} className="text-right py-2.5 px-3 font-semibold text-[12px] uppercase tracking-wide" style={{ color: c.color }}>
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {perJob.map((job, i) => (
                        <tr key={job.jobId} className={`border-b border-slate-50 ${i % 2 === 0 ? 'bg-slate-50/40' : ''} hover:bg-slate-50 transition-colors`}>
                            <td className="py-2.5 pr-4">
                                <span className="font-medium text-slate-800 line-clamp-1">{job.jobTitle}</span>
                            </td>
                            {TABLE_COLS.map(c => (
                                <td key={c.key} className="py-2.5 px-3 text-right">
                                    <span className={`font-bold ${job[c.key] > 0 ? '' : 'text-slate-300'}`} style={job[c.key] > 0 ? { color: c.color } : {}}>
                                        {job[c.key] ?? 0}
                                    </span>
                                </td>
                            ))}
                        </tr>
                    ))}
                    {/* Total row */}
                    <tr className="border-t-2 border-slate-200 bg-white font-bold">
                        <td className="py-2.5 pr-4 text-[13px] font-bold text-slate-800">Tất cả</td>
                        {TABLE_COLS.map(c => (
                            <td key={c.key} className="py-2.5 px-3 text-right">
                                <span className="font-extrabold text-slate-800">
                                    {perJob.reduce((s, j) => s + (j[c.key] ?? 0), 0)}
                                </span>
                            </td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BaoCaoPage() {
    const [period, setPeriod] = useState('daily');
    const [report, setReport] = useState(null);
    const [jobOverview, setJobOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(() => {
        setLoading(true);
        Promise.all([
            applicationsService.getReport(period),
            employerDashboardService.getMyReport(),
        ]).then(([rRes, jRes]) => {
            setReport(rRes.data);
            setJobOverview(jRes.data?.overview || null);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [period]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    const { statusCounts, timeSeries, perJob, total } = report || {};

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[20px] font-extrabold text-slate-900">Báo cáo tuyển dụng</h1>
                    <p className="text-[13px] text-slate-400 mt-0.5">Phân tích hiệu quả tuyển dụng của công ty bạn</p>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <Download size={13} />
                    Xuất báo cáo
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-56">
                    <div className="w-8 h-8 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <SummaryCards total={total || 0} statusCounts={statusCounts} jobOverview={jobOverview} />

                    {/* Funnel + chart row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Status funnel */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={15} className="text-slate-400" />
                                <span className="text-[13px] font-bold text-slate-800">Trạng thái hồ sơ</span>
                                <span className="ml-auto text-[12px] text-slate-400">{(total || 0).toLocaleString()} hồ sơ</span>
                            </div>
                            <StatusFunnel statusCounts={statusCounts} total={total || 0} />
                        </div>

                        {/* Job status donut (kept from original) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Briefcase size={15} className="text-slate-400" />
                                <span className="text-[13px] font-bold text-slate-800">Tổng quan tin tuyển dụng</span>
                            </div>
                            {jobOverview ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Tổng tin đã đăng',  value: jobOverview.totalJobs,       color: '#475569' },
                                        { label: 'Đang tuyển dụng',   value: jobOverview.activeJobs,      color: '#00b14f' },
                                        { label: 'Tạm ẩn',            value: jobOverview.inactiveJobs,    color: '#f59e0b' },
                                        { label: 'Hết hạn',           value: jobOverview.expiredJobs,     color: '#ef4444' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-slate-50 rounded-lg px-3.5 py-3 border border-slate-100">
                                            <div className="text-[20px] font-extrabold leading-none" style={{ color: item.color }}>{item.value}</div>
                                            <div className="text-[11px] text-slate-500 mt-1 font-medium">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-slate-400 text-[13px] text-center py-6">Không có dữ liệu</div>
                            )}
                        </div>
                    </div>

                    {/* Line chart */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <TrendChart timeSeries={timeSeries || []} period={period} onPeriodChange={setPeriod} />
                    </div>

                    {/* Per-job table */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Users size={15} className="text-slate-400" />
                                <span className="text-[13px] font-bold text-slate-800">Hiệu quả theo từng tin</span>
                            </div>
                            <Link href="/nha-tuyen-dung/ho-so-ung-vien"
                                className="text-[12px] text-green-600 no-underline font-semibold flex items-center gap-1 hover:underline">
                                Xem hồ sơ <ArrowRight size={12} />
                            </Link>
                        </div>
                        <JobTable perJob={perJob || []} />
                    </div>
                </>
            )}
        </div>
    );
}
