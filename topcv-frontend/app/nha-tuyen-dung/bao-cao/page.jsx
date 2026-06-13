'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart2, Briefcase, CheckCircle, Users, ArrowRight, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { employerDashboardService } from '@/services/employer-dashboard.service';

const GREEN = '#00b14f';


export default function BaoCaoPage() {
    const [report, setReport] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            employerDashboardService.getMyReport(),
            employerDashboardService.getMyStats(),
        ])
            .then(([rRes, sRes]) => {
                setReport(rRes.data);
                setStats(sRes.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading)
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px', gap: '12px', color: '#94a3b8' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );

    const ov = report?.overview || {};
    const topJobs = report?.topJobs || [];

    const donutSegments = [
        { label: 'Đang tuyển', value: ov.activeJobs || 0, color: GREEN },
        { label: 'Tạm dừng',   value: ov.inactiveJobs || 0, color: '#f59e0b' },
        { label: 'Hết hạn',    value: ov.expiredJobs || 0,  color: '#ef4444' },
    ];

    const avgApps = ov.totalJobs > 0 ? (ov.totalApplications / ov.totalJobs).toFixed(1) : 0;
    const convRate = ov.totalJobs > 0 && ov.totalApplications > 0
        ? Math.min(100, ((ov.totalApplications / ov.totalJobs) * 10).toFixed(0))
        : 0;

    const maxApps = Math.max(...topJobs.map(j => j.applicationCount), 1);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Báo cáo tuyển dụng</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                    Phân tích tổng quan hiệu quả tuyển dụng của bạn
                </p>
            </div>

            {/* Overview cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }} className="rpt-grid-4">
                {[
                    { icon: Briefcase, label: 'Tổng tin', value: ov.totalJobs || 0, color: '#7c3aed', bg: '#f5f3ff', border: '#7c3aed' },
                    { icon: CheckCircle, label: 'Đang tuyển', value: ov.activeJobs || 0, color: GREEN, bg: '#f0fdf4', border: GREEN },
                    { icon: Users, label: 'Tổng ứng tuyển', value: ov.totalApplications || 0, color: '#0284c7', bg: '#f0f9ff', border: '#0284c7' },
                    { icon: TrendingUp, label: 'TB đơn/tin', value: avgApps, color: '#d97706', bg: '#fffbeb', border: '#d97706' },
                ].map((c, i) => (
                    <div key={i} style={{
                        background: 'white', borderRadius: '12px', padding: '16px 18px',
                        border: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '10px',
                            background: c.bg, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                        }}>
                            <c.icon size={20} color={c.color} strokeWidth={2} />
                        </div>
                        <div>
                            <div style={{ fontSize: '26px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>{c.value}</div>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', fontWeight: '500' }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Donut + bar chart row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }} className="rpt-grid-2">
                {/* Job status donut */}
                <div style={{
                    background: 'white', borderRadius: '14px', padding: '24px',
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BarChart2 size={16} color="#64748b" />
                        Phân bổ tin tuyển dụng
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* Recharts Donut */}
                        <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
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
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex',
                                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                pointerEvents: 'none',
                            }}>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{ov.totalJobs || 0}</div>
                                <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '600' }}>Tổng tin</div>
                            </div>
                        </div>
                        {/* Legend */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                            {donutSegments.map((sg, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: sg.color, flexShrink: 0 }} />
                                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{sg.label}</span>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{sg.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Conversion rate */}
                <div style={{
                    background: 'white', borderRadius: '14px', padding: '24px',
                    border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={16} color="#64748b" />
                        Hiệu quả tuyển dụng
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {[
                            { label: 'Tổng ứng tuyển', value: ov.totalApplications || 0, total: null, color: '#0284c7', unit: ' đơn' },
                            { label: 'TB đơn / tin', value: parseFloat(avgApps), total: null, color: '#7c3aed', unit: ' đơn/tin' },
                            { label: 'Tin đang hoạt động', value: ov.activeJobs || 0, total: ov.totalJobs || 1, color: GREEN, unit: '' },
                        ].map((item, i) => {
                            const pct = item.total !== null ? Math.round((item.value / item.total) * 100) : Math.min(100, parseFloat(item.value) * 10);
                            return (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{item.label}</span>
                                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                                            {item.value}{item.unit}
                                            {item.total !== null && <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '400' }}> / {item.total}</span>}
                                        </span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%', borderRadius: '4px',
                                            width: `${Math.min(100, pct || 0)}%`,
                                            background: item.color,
                                            transition: 'width 0.8s ease',
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top jobs by applications */}
            <div style={{
                background: 'white', borderRadius: '14px', padding: '24px',
                border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="#64748b" />
                        Top tin theo số lượng ứng tuyển
                    </div>
                    <Link href="/nha-tuyen-dung/ho-so-ung-vien" style={{ fontSize: '12px', color: GREEN, textDecoration: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        Xem hồ sơ <ArrowRight size={12} />
                    </Link>
                </div>

                {topJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '13px', background: '#f8fafc', borderRadius: '10px' }}>
                        Chưa có tin nào có ứng tuyển
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {topJobs.map((job, idx) => {
                            const pct = Math.round((job.applicationCount / maxApps) * 100);
                            const isExpired = job.deadline && new Date(job.deadline) < new Date();
                            const statusColor = !job.isActive ? '#f59e0b' : isExpired ? '#ef4444' : GREEN;
                            const statusLabel = !job.isActive ? 'Tạm ẩn' : isExpired ? 'Hết hạn' : 'Hoạt động';
                            return (
                                <div key={job.id} style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '12px 14px', borderRadius: '10px',
                                    background: idx % 2 === 0 ? '#f8fafc' : 'white',
                                    border: '1px solid #f1f5f9',
                                }}>
                                    {/* Rank */}
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                                        background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f3f4f6' : idx === 2 ? '#fef9ec' : '#f8fafc',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '12px', fontWeight: '800',
                                        color: idx === 0 ? '#d97706' : idx === 1 ? '#6b7280' : idx === 2 ? '#b45309' : '#94a3b8',
                                    }}>
                                        {idx + 1}
                                    </div>
                                    {/* Job info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {job.title}
                                            </span>
                                            <span style={{
                                                fontSize: '10px', fontWeight: '700', padding: '1px 7px', borderRadius: '20px', flexShrink: 0,
                                                background: `${statusColor}18`, color: statusColor,
                                            }}>
                                                {statusLabel}
                                            </span>
                                        </div>
                                        {/* Progress bar */}
                                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', borderRadius: '3px',
                                                width: `${pct}%`,
                                                background: idx === 0 ? `linear-gradient(90deg, ${GREEN}, #00934a)` : '#86efac',
                                                transition: 'width 0.8s ease',
                                            }} />
                                        </div>
                                    </div>
                                    {/* Count */}
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
                                            {job.applicationCount}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: '500' }}>ứng tuyển</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* CTA */}
            <div style={{
                background: `linear-gradient(135deg, #f0fdf4, #dcfce7)`,
                borderRadius: '14px', padding: '20px 24px',
                border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            }}>
                <div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#065f46' }}>Muốn tuyển dụng hiệu quả hơn?</div>
                    <div style={{ fontSize: '13px', color: '#059669', marginTop: '3px' }}>
                        Đăng thêm tin hoặc kết nối trực tiếp với ứng viên phù hợp
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Link href="/nha-tuyen-dung/dang-tin" style={{
                        padding: '9px 18px', background: GREEN, color: 'white',
                        borderRadius: '9px', textDecoration: 'none', fontSize: '13px', fontWeight: '700',
                        boxShadow: '0 3px 10px rgba(0,177,79,0.35)',
                    }}>
                        Đăng tin mới
                    </Link>
                    <Link href="/nha-tuyen-dung/ket-noi" style={{
                        padding: '9px 18px', background: 'white', color: GREEN,
                        borderRadius: '9px', textDecoration: 'none', fontSize: '13px', fontWeight: '700',
                        border: `1px solid ${GREEN}`,
                    }}>
                        Kết nối ứng viên
                    </Link>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .rpt-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
                    .rpt-grid-2 { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 480px) {
                    .rpt-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
                }
            `}</style>
        </div>
    );
}
