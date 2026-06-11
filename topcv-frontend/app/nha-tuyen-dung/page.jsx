'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, CheckCircle, PauseCircle, Clock, PlusCircle, TrendingUp } from 'lucide-react';
import { employerDashboardService } from '@/services/employer-dashboard.service';

const GREEN = '#00b14f';

const ACTION_LABELS = {
    CREATE: { label: 'Tạo mới', color: '#059669', bg: '#d1fae5' },
    UPDATE: { label: 'Cập nhật', color: '#2563eb', bg: '#dbeafe' },
    DELETE: { label: 'Xóa', color: '#dc2626', bg: '#fee2e2' },
    TOGGLE: { label: 'Bật/Tắt', color: '#d97706', bg: '#fef3c7' },
};

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div
            style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px 24px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
            }}
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <Icon size={24} color={color} />
            </div>
            <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{label}</div>
            </div>
        </div>
    );
}

function WeeklyChart({ data }) {
    if (!data?.length) return null;
    const max = Math.max(...data.map((d) => d.count), 1);
    const barW = 32;
    const gap = 10;
    const chartH = 80;
    const totalW = data.length * (barW + gap);

    return (
        <svg width={totalW} height={chartH + 30} style={{ overflow: 'visible' }}>
            {data.map((d, i) => {
                const barH = Math.max((d.count / max) * chartH, d.count > 0 ? 4 : 0);
                const x = i * (barW + gap);
                const y = chartH - barH;
                const label = d.date.slice(5).replace('-', '/');
                return (
                    <g key={d.date}>
                        <rect x={x} y={y} width={barW} height={barH} fill={GREEN} rx={4} opacity={0.85} />
                        {d.count > 0 && (
                            <text
                                x={x + barW / 2}
                                y={y - 4}
                                textAnchor="middle"
                                fontSize={11}
                                fill={GREEN}
                                fontWeight="600"
                            >
                                {d.count}
                            </text>
                        )}
                        <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize={11} fill="#9ca3af">
                            {label}
                        </text>
                    </g>
                );
            })}
        </svg>
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
        Promise.all([employerDashboardService.getMyStats(), employerDashboardService.getMyLogs({ limit: 10 })])
            .then(([statsRes, logsRes]) => {
                setStats(statsRes.data);
                setLogs(logsRes.data?.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <div
                    style={{
                        width: '36px',
                        height: '36px',
                        border: `3px solid #e5e7eb`,
                        borderTopColor: GREEN,
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                    }}
                />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Tổng quan</h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                        Xem nhanh hoạt động tuyển dụng của bạn
                    </p>
                </div>
                <Link
                    href="/nha-tuyen-dung/dang-tin"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: GREEN,
                        color: 'white',
                        padding: '9px 18px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                    }}
                >
                    <PlusCircle size={16} />
                    Đăng tin mới
                </Link>
            </div>

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="stats-grid">
                <StatCard
                    icon={Briefcase}
                    label="Tổng tin đăng"
                    value={stats?.total ?? 0}
                    color="#6366f1"
                    bg="#ede9fe"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Đang tuyển dụng"
                    value={stats?.active ?? 0}
                    color={GREEN}
                    bg="#dcfce7"
                />
                <StatCard
                    icon={PauseCircle}
                    label="Tạm dừng"
                    value={stats?.inactive ?? 0}
                    color="#d97706"
                    bg="#fef3c7"
                />
                <StatCard icon={Clock} label="Hết hạn" value={stats?.expired ?? 0} color="#ef4444" bg="#fee2e2" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="dash-grid">
                {/* Weekly chart */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                        <TrendingUp size={18} color={GREEN} />
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>
                            Tin đăng 7 ngày qua
                        </span>
                    </div>
                    {stats?.weeklyGrowth?.every((d) => d.count === 0) ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '24px 0' }}>
                            Chưa có tin nào trong 7 ngày qua
                        </div>
                    ) : (
                        <WeeklyChart data={stats?.weeklyGrowth || []} />
                    )}
                </div>

                {/* Recent jobs */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px 24px',
                        border: '1px solid #e5e7eb',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '16px',
                        }}
                    >
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#111827' }}>Tin đăng gần đây</span>
                        <Link
                            href="/nha-tuyen-dung/quan-ly-tin"
                            style={{ fontSize: '13px', color: GREEN, textDecoration: 'none', fontWeight: '500' }}
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                    {!stats?.recentJobs?.length ? (
                        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '24px 0' }}>
                            Chưa có tin nào
                        </div>
                    ) : (
                        stats.recentJobs.map((job) => (
                            <div
                                key={job.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '10px 0',
                                    borderBottom: '1px solid #f3f4f6',
                                }}
                            >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Link
                                        href={`/nha-tuyen-dung/dang-tin/${job.id}`}
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#111827',
                                            textDecoration: 'none',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            display: 'block',
                                        }}
                                    >
                                        {job.title}
                                    </Link>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                        {job.deadline && ` · HH: ${new Date(job.deadline).toLocaleDateString('vi-VN')}`}
                                    </div>
                                </div>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        padding: '2px 8px',
                                        borderRadius: '20px',
                                        background: job.isActive ? '#dcfce7' : '#f3f4f6',
                                        color: job.isActive ? GREEN : '#9ca3af',
                                    }}
                                >
                                    {job.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Audit logs */}
            <div
                style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb' }}
            >
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px' }}>
                    Lịch sử hoạt động
                </h3>
                {!logs.length ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', padding: '24px 0' }}>
                        Chưa có hoạt động nào
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {logs.map((log) => {
                            const meta = ACTION_LABELS[log.action] || {
                                label: log.action,
                                color: '#6b7280',
                                bg: '#f3f4f6',
                            };
                            return (
                                <div
                                    key={log.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '10px 0',
                                        borderBottom: '1px solid #f9fafb',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '3px 8px',
                                            borderRadius: '20px',
                                            background: meta.bg,
                                            color: meta.color,
                                            flexShrink: 0,
                                            marginTop: '1px',
                                        }}
                                    >
                                        {meta.label}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '13px', color: '#374151' }}>
                                            <strong>{log.entity}</strong>
                                            {log.newData?.title && ` · ${log.newData.title}`}
                                        </span>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                            {timeAgo(log.createdAt)} · IP: {log.ipAddress || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .dash-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 480px) {
                    .stats-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
