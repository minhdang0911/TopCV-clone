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
    { key: 'total',    label: 'Tổng tin đăng',   icon: Briefcase,    color: '#7c3aed', bg: '#f5f3ff', border: '#7c3aed' },
    { key: 'active',   label: 'Đang tuyển dụng', icon: CheckCircle,  color: GREEN,     bg: '#f0fdf4', border: GREEN },
    { key: 'inactive', label: 'Tạm dừng',        icon: PauseCircle,  color: '#d97706', bg: '#fffbeb', border: '#d97706' },
    { key: 'expired',  label: 'Hết hạn',          icon: Clock,        color: '#dc2626', bg: '#fef2f2', border: '#dc2626' },
];

const ACTION_LABELS = {
    CREATE: { label: 'Tạo mới',   color: '#059669', bg: '#d1fae5' },
    UPDATE: { label: 'Cập nhật',  color: '#2563eb', bg: '#dbeafe' },
    DELETE: { label: 'Xóa',       color: '#dc2626', bg: '#fee2e2' },
    TOGGLE: { label: 'Bật/Tắt',  color: '#d97706', bg: '#fef3c7' },
};

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '18px 20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
        }}>
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: bg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon size={22} color={color} strokeWidth={2} />
            </div>
            <div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
                    {value}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: '500' }}>
                    {label}
                </div>
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
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', gap: '12px', color: '#94a3b8' }}>
                <div style={{
                    width: '32px', height: '32px', border: '3px solid #e2e8f0',
                    borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div className="dash-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Tổng quan</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                        Theo dõi hoạt động tuyển dụng của bạn
                    </p>
                </div>
                <Link
                    href="/nha-tuyen-dung/dang-tin"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '7px',
                        background: `linear-gradient(135deg, ${GREEN}, #00934a)`,
                        color: 'white', padding: '10px 20px',
                        borderRadius: '10px', textDecoration: 'none',
                        fontSize: '14px', fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,177,79,0.3)',
                    }}
                >
                    <PlusCircle size={16} />
                    Đăng tin mới
                </Link>
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="stats-grid">
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="dash-grid">
                {/* Weekly chart */}
                <div style={{
                    background: 'white', borderRadius: '14px',
                    padding: '20px 24px', border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '10px',
                                background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <TrendingUp size={16} color={GREEN} />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Tin đăng 7 ngày</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Hoạt động gần đây</div>
                            </div>
                        </div>
                        <Link href="/nha-tuyen-dung/bao-cao" style={{ fontSize: '12px', color: GREEN, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            Xem báo cáo <ArrowRight size={12} />
                        </Link>
                    </div>
                    {stats?.weeklyGrowth?.every((d) => d.count === 0) ? (
                        <div style={{
                            textAlign: 'center', color: '#94a3b8', fontSize: '13px',
                            padding: '32px 0', background: '#f8fafc', borderRadius: '10px',
                        }}>
                            Chưa có tin nào trong 7 ngày qua
                        </div>
                    ) : (
                        <WeeklyChart data={stats?.weeklyGrowth || []} />
                    )}
                </div>

                {/* Recent jobs */}
                <div style={{
                    background: 'white', borderRadius: '14px',
                    padding: '20px 24px', border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '34px', height: '34px', borderRadius: '10px',
                                background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Briefcase size={16} color="#7c3aed" />
                            </div>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Tin đăng gần đây</div>
                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{stats?.total || 0} tin tổng cộng</div>
                            </div>
                        </div>
                        <Link href="/nha-tuyen-dung/quan-ly-tin" style={{ fontSize: '12px', color: '#7c3aed', textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            Tất cả <ArrowRight size={12} />
                        </Link>
                    </div>
                    {!stats?.recentJobs?.length ? (
                        <div style={{
                            textAlign: 'center', color: '#94a3b8', fontSize: '13px',
                            padding: '32px 0', background: '#f8fafc', borderRadius: '10px',
                        }}>
                            Chưa có tin nào
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {stats.recentJobs.map((job, idx) => (
                                <div key={job.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    padding: '10px 12px', borderRadius: '8px',
                                    background: idx % 2 === 0 ? '#fafafa' : 'white',
                                    transition: 'background 0.1s',
                                }}>
                                    <div style={{
                                        width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                                        background: job.isActive ? GREEN : '#d1d5db',
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} style={{
                                            fontSize: '13px', fontWeight: '600', color: '#0f172a',
                                            textDecoration: 'none', overflow: 'hidden',
                                            textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                                        }}>
                                            {job.title}
                                        </Link>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '1px' }}>
                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                            {job.deadline && ` · HH: ${new Date(job.deadline).toLocaleDateString('vi-VN')}`}
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '10px', fontWeight: '700', padding: '3px 8px',
                                        borderRadius: '20px',
                                        background: job.isActive ? '#dcfce7' : '#f3f4f6',
                                        color: job.isActive ? GREEN : '#9ca3af',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {job.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick actions */}
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '20px 24px', border: '1px solid #e2e8f0',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
            }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={16} color="#64748b" />
                    Thao tác nhanh
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                    {[
                        { href: '/nha-tuyen-dung/dang-tin', icon: PlusCircle, label: 'Đăng tin tuyển dụng', color: GREEN, bg: '#f0fdf4' },
                        { href: '/nha-tuyen-dung/xem-ho-so', icon: CheckCircle, label: 'Xem hồ sơ ứng viên', color: '#7c3aed', bg: '#f5f3ff' },
                        { href: '/nha-tuyen-dung/ket-noi', icon: PlusCircle, label: 'Kết nối ứng viên', color: '#0284c7', bg: '#f0f9ff' },
                        { href: '/nha-tuyen-dung/bao-cao', icon: BarChart2, label: 'Xem báo cáo', color: '#d97706', bg: '#fffbeb' },
                    ].map(action => (
                        <Link key={action.href} href={action.href} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px', borderRadius: '10px',
                            border: '1px solid #e2e8f0', textDecoration: 'none',
                            background: action.bg, transition: 'transform 0.1s',
                        }}>
                            <div style={{
                                width: '32px', height: '32px', borderRadius: '8px',
                                background: 'white', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            }}>
                                <action.icon size={16} color={action.color} />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                {action.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Audit logs */}
            <div style={{
                background: 'white', borderRadius: '14px',
                padding: '20px 24px', border: '1px solid #e2e8f0',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{
                        width: '34px', height: '34px', borderRadius: '10px',
                        background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Activity size={16} color="#64748b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>Lịch sử hoạt động</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>8 hoạt động gần nhất</div>
                    </div>
                </div>
                {!logs.length ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '24px 0' }}>
                        Chưa có hoạt động nào
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {logs.map((log, idx) => {
                            const meta = ACTION_LABELS[log.action] || { label: log.action, color: '#64748b', bg: '#f1f5f9' };
                            return (
                                <div key={log.id} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                                    padding: '10px 0',
                                    borderBottom: idx < logs.length - 1 ? '1px solid #f1f5f9' : 'none',
                                }}>
                                    <span style={{
                                        fontSize: '10px', fontWeight: '700', padding: '3px 8px',
                                        borderRadius: '20px', background: meta.bg, color: meta.color,
                                        flexShrink: 0, marginTop: '1px', whiteSpace: 'nowrap',
                                    }}>
                                        {meta.label}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontSize: '13px', color: '#374151' }}>
                                            <strong>{log.entity}</strong>
                                            {log.newData?.title && <span style={{ color: '#64748b' }}> · {log.newData.title}</span>}
                                        </span>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                            {timeAgo(log.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 900px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                    .dash-grid  { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 480px) {
                    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </div>
    );
}
