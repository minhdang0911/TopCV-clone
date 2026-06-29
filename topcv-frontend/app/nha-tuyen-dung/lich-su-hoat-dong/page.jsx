'use client';

import { useState, useEffect, useCallback } from 'react';
import { History, LogIn, LogOut, UserPlus, Shield, Globe, RefreshCw } from 'lucide-react';
import api from '@/lib/axios';
import DateRangePicker from '@/components/DateRangePicker';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const ACTION_META = {
    LOGIN:    { label: 'Đăng nhập',                    icon: LogIn,    color: '#00b14f' },
    LOGOUT:   { label: 'Đăng xuất',                    icon: LogOut,   color: '#64748b' },
    REGISTER: { label: 'Đăng ký tài khoản thành công', icon: UserPlus, color: '#3b82f6' },
};

function getMeta(action) {
    return ACTION_META[action] || { label: action, icon: Shield, color: '#94a3b8' };
}

function fmtTime(iso) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function groupByDate(logs) {
    const map = new Map();
    for (const log of logs) {
        const key = new Date(log.createdAt).toDateString();
        const label = fmtDate(log.createdAt);
        if (!map.has(key)) map.set(key, { label, items: [] });
        map.get(key).items.push(log);
    }
    return [...map.values()];
}

const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

export default function LichSuHoatDongPage() {
    const [logs,    setLogs]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [range,   setRange]   = useState({ start: today0(), end: today0() });
    const [total,   setTotal]   = useState(0);

    const fetchLogs = useCallback(async (r) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: '200' });
            if (r?.start) { const from = new Date(r.start); from.setHours(0, 0, 0, 0); params.set('from', from.toISOString()); }
            if (r?.end)   { const to   = new Date(r.end);   to.setHours(23, 59, 59, 999); params.set('to', to.toISOString()); }
            const res = await api.get(`/audit-logs/my?${params}`);
            const data = res.data?.data ?? [];
            setLogs(data);
            setTotal(res.data?.meta?.total ?? data.length);
        } catch { setLogs([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchLogs(range); }, []); // eslint-disable-line

    const handleRangeChange = (r) => { setRange(r); fetchLogs(r); };
    const groups = groupByDate(logs);

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Lịch sử hoạt động</h1>
                    <p className="text-sm text-slate-400 mt-0.5">
                        {total > 0 ? `${total} hoạt động` : 'Chưa có hoạt động nào'}
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <DateRangePicker value={range} onChange={handleRangeChange} />
                    <Button variant="outline" size="sm" onClick={() => fetchLogs(range)} disabled={loading}
                        className="h-9 gap-1.5 border-slate-200">
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="w-11 h-4" />
                                <Skeleton className="w-9 h-9 rounded-full" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        ))}
                    </div>
                ) : groups.length === 0 ? (
                    <div className="py-20 px-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <History size={26} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-600 mb-1">Không có hoạt động</p>
                        <p className="text-sm text-slate-400">Không có hoạt động nào trong khoảng thời gian đã chọn</p>
                    </div>
                ) : (
                    groups.map(({ label, items }, gi) => (
                        <div key={label}>
                            {/* Date header */}
                            <div className={`px-5 py-2.5 bg-slate-50 border-b border-slate-100 ${gi > 0 ? 'border-t border-slate-200' : ''}`}>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                            </div>
                            {/* Log items */}
                            {items.map((log, i) => {
                                const meta = getMeta(log.action);
                                const Icon = meta.icon;
                                return (
                                    <div key={log.id}
                                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors ${i < items.length - 1 ? 'border-b border-slate-50' : ''}`}>
                                        {/* Time */}
                                        <div className="w-12 shrink-0 text-right">
                                            <span className="text-xs font-bold text-[#00b14f] tabular-nums">{fmtTime(log.createdAt)}</span>
                                        </div>
                                        {/* Icon */}
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{ background: `${meta.color}15` }}>
                                            <Icon size={14} style={{ color: meta.color }} />
                                        </div>
                                        {/* Label */}
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm text-slate-800 font-medium">{meta.label}</span>
                                        </div>
                                        {/* IP */}
                                        {log.ipAddress && (
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Globe size={12} className="text-slate-300" />
                                                <span className="text-xs text-slate-400 font-mono">{log.ipAddress}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
