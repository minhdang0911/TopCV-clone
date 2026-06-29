'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import {
    Building2, ChevronLeft, ChevronRight, ExternalLink,
    MapPin, DollarSign, Bookmark, X, Clock, Sparkles,
} from 'lucide-react';
import { connectService } from '@/services/connect.service';
import { jobService } from '@/services/job.service';
import { savedJobsService } from '@/services/applications.service';
import useAuthStore from '@/stores/auth.store';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from 'recharts';

const GREEN = '#00b14f';

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

function daysLeft(deadline) {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / 86400000);
    return days > 0 ? days : 0;
}

function formatSalary(min, max, type) {
    if (type === 'NEGOTIABLE' || (!min && !max)) return 'Thỏa thuận';
    const fmt = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(0)} triệu` : `${n.toLocaleString()}đ`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    if (max) return `Đến ${fmt(max)}`;
    return 'Thỏa thuận';
}

// ── Employer viewer card ──────────────────────────────────────────────────────
function ViewerCard({ item }) {
    const { employer, viewedAt } = item;
    const letter = (employer.companyName || '?')[0].toUpperCase();

    return (
        <div style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '16px', display: 'flex', alignItems: 'center', gap: '16px',
        }}>
            <div style={{
                width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0,
                border: '1px solid #e5e7eb', overflow: 'hidden', background: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {employer.logoUrl
                    ? <Image src={employer.logoUrl} alt={employer.companyName} width={52} height={52} unoptimized style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                    : <span style={{ fontSize: '20px', fontWeight: '700', color: GREEN }}>{letter}</span>
                }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '3px' }}>
                    {employer.companyName}
                </div>
                {employer.description && (
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {employer.description}
                    </div>
                )}
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Đã xem hồ sơ · {timeAgo(viewedAt)}
                </div>
            </div>

            {employer.slug && (
                <a
                    href={`/cong-ty/${employer.slug}`}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '8px 14px', border: `1.5px solid ${GREEN}`,
                        borderRadius: '8px', color: GREEN, fontSize: '13px',
                        fontWeight: '600', textDecoration: 'none', flexShrink: 0, whiteSpace: 'nowrap',
                    }}
                >
                    <ExternalLink size={13} />
                    Xem thông tin công ty
                </a>
            )}
        </div>
    );
}

// ── Job suggestion card (list style) ─────────────────────────────────────────
function JobListCard({ job, saved, onToggleSave, onDismiss }) {
    const router = useRouter();
    const logo = job.employer?.logoUrl || job.company?.logo;
    const companyName = job.employer?.companyName || job.company?.companyName || '';
    const location = job.locations?.[0]?.provinceName || job.locations?.[0]?.provinceCode || '';
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType);
    const days = daysLeft(job.deadline);

    return (
        <div
            onClick={() => router.push(`/viec-lam/${job.slug}`)}
            style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '14px 16px', cursor: 'pointer', position: 'relative',
                display: 'flex', gap: '14px', alignItems: 'center',
                transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#86efac'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
        >
            {/* Logo */}
            <div style={{
                width: '48px', height: '48px', flexShrink: 0, borderRadius: '8px',
                border: '1px solid #f3f4f6', overflow: 'hidden', background: '#f9fafb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {logo
                    ? <Image src={logo} alt={companyName} width={48} height={48} unoptimized style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                    : <div style={{ width: '28px', height: '28px', background: '#e5e7eb', borderRadius: '4px' }} />
                }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '60px' }}>
                    {job.title}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {companyName}
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: GREEN, fontWeight: '600', background: '#f0fdf4', padding: '2px 8px', borderRadius: '4px' }}>
                        {salary}
                    </span>
                    {location && (
                        <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} color="#9ca3af" />
                            {location}
                        </span>
                    )}
                    {days !== null && (
                        <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Clock size={11} />
                            Còn {days} ngày
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
                <button
                    onClick={e => { e.stopPropagation(); onDismiss(); }}
                    title="Ẩn gợi ý"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#d1d5db', lineHeight: 0 }}
                >
                    <X size={16} />
                </button>
                <button
                    onClick={e => { e.stopPropagation(); onToggleSave(); }}
                    title={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: saved ? GREEN : '#d1d5db', lineHeight: 0 }}
                >
                    <Bookmark size={18} fill={saved ? GREEN : 'none'} />
                </button>
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function XemHoSoPage() {
    const { isAuthenticated, role, hydrated } = useAuthStore();
    const router = useRouter();

    const [viewers, setViewers] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const [chartData, setChartData] = useState([]);
    const [stats, setStats] = useState({ totalViews: 0, viewsToday: 0, growthPct: 0 });

    const [jobs, setJobs] = useState([]);
    const [savedIds, setSavedIds] = useState(new Set());
    const [jobsLoading, setJobsLoading] = useState(true);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated || role !== 'CANDIDATE') {
            router.replace('/login');
        }
    }, [hydrated, isAuthenticated, role, router]);

    const fetchViewers = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await connectService.getProfileViewers({ page: p, limit: 10 });
            setViewers(res.data?.data ?? []);
            setMeta(res.data?.meta ?? { total: 0, page: p, limit: 10, totalPages: 1 });
        } catch {
            toast.error('Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch all viewers for charting
    useEffect(() => {
        if (!hydrated || !isAuthenticated || role !== 'CANDIDATE') return;

        connectService.getProfileViewers({ page: 1, limit: 100 }).then((res) => {
            const list = res.data?.data || [];
            
            // Build last 7 days chart array
            const dates = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dates.push({
                    raw: d.toISOString().split('T')[0],
                    label: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                    views: 0,
                });
            }

            let todayCount = 0;
            let yesterdayCount = 0;
            const todayStr = new Date().toISOString().split('T')[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            list.forEach((item) => {
                if (!item.viewedAt) return;
                const viewDate = item.viewedAt.split('T')[0];
                
                // For chart
                const match = dates.find(d => d.raw === viewDate);
                if (match) match.views += 1;

                // For stats
                if (viewDate === todayStr) todayCount++;
                if (viewDate === yesterdayStr) yesterdayCount++;
            });

            // Calculate growth compared to yesterday
            let growth = 0;
            if (yesterdayCount > 0) {
                growth = Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100);
            } else if (todayCount > 0) {
                growth = 100; // 100% growth if yesterday was 0
            }

            setChartData(dates);
            setStats({
                totalViews: res.data?.meta?.total || list.length,
                viewsToday: todayCount,
                growthPct: growth,
            });
        }).catch(() => {});
    }, [hydrated, isAuthenticated, role]);

    useEffect(() => {
        if (!hydrated || !isAuthenticated || role !== 'CANDIDATE') return;
        fetchViewers(page);
    }, [page, fetchViewers, hydrated, isAuthenticated, role]);

    useEffect(() => {
        if (!isAuthenticated) return;
        Promise.all([
            jobService.getSuggestions(),
            savedJobsService.getMy({ limit: 200 }),
        ]).then(([jobsRes, savedRes]) => {
            setJobs(jobsRes.data?.data || []);
            setSavedIds(new Set((savedRes.data?.data || []).map(i => i.jobId)));
        }).catch(() => {}).finally(() => setJobsLoading(false));
    }, [isAuthenticated]);

    const handleToggleSave = async (jobId) => {
        const willSave = !savedIds.has(jobId);
        setSavedIds(prev => { const n = new Set(prev); n.has(jobId) ? n.delete(jobId) : n.add(jobId); return n; });
        toast.success(willSave ? 'Đã lưu việc làm' : 'Đã bỏ lưu');
        try { await savedJobsService.toggle(jobId); } catch {
            setSavedIds(prev => { const n = new Set(prev); n.has(jobId) ? n.delete(jobId) : n.add(jobId); return n; });
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDismissJob = async (jobId) => {
        setJobs(prev => prev.filter(j => j.id !== jobId));
        try { await jobService.dismissSuggestion(jobId); } catch {}
    };

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 16px 60px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <Building2 size={22} color={GREEN} />
                    <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        Nhà tuyển dụng xem hồ sơ
                    </h1>
                </div>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    Danh sách các công ty đã xem hồ sơ của bạn.
                </p>
            </div>

            {/* ─── Profile Views Analytics Panel ─── */}
            <div style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px',
                padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
                <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color={GREEN} /> Thống kê lượt xem hồ sơ
                </h2>

                {/* KPI stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>TỔNG LƯỢT XEM</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{stats.totalViews}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>XEM HÔM NAY</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>{stats.viewsToday}</div>
                    </div>
                    <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                        <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>TĂNG TRƯỞNG</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {stats.growthPct >= 0 ? `+${stats.growthPct}%` : `${stats.growthPct}%`}
                        </div>
                    </div>
                </div>

                {/* AreaChart showing views in last 7 days */}
                <div style={{ width: '100%', height: '180px' }}>
                    {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={GREEN} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={GREEN} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="views" 
                                    name="Lượt xem"
                                    stroke={GREEN} 
                                    strokeWidth={2.5}
                                    fillOpacity={1} 
                                    fill="url(#colorViews)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '13px' }}>
                            Đang chuẩn bị dữ liệu biểu đồ...
                        </div>
                    )}
                </div>
            </div>

            {/* List Header & Tab Info */}
            <div style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '14px 20px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    Danh sách chi tiết: <strong style={{ color: '#111827' }}>{meta.total}</strong> công ty đã xem hồ sơ
                </span>
                {meta.totalPages > 1 && (
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                        Trang {meta.page}/{meta.totalPages}
                    </span>
                )}
            </div>

            {/* Viewers list */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '14px' }}>Đang tải...</div>
            ) : viewers.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                    marginBottom: '32px',
                }}>
                    <Building2 size={48} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Chưa có Nhà tuyển dụng nào xem hồ sơ của bạn
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                        Để nhận được cơ hội việc làm từ Nhà tuyển dụng, hãy bật tìm kiếm và cập nhật CV.
                    </div>
                    <Link
                        href="/cai-dat-goi-y-viec-lam"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '9px 18px', background: GREEN, color: 'white',
                            borderRadius: '8px', fontSize: '13px', fontWeight: '600', textDecoration: 'none',
                        }}
                    >
                        Cài đặt gợi ý việc làm
                    </Link>
                </div>
            ) : (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                        {viewers.map((item, i) => (
                            <ViewerCard key={`${item.employer.id}-${i}`} item={item} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
                                    background: page === 1 ? '#f9fafb' : 'white',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#374151',
                                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
                                }}
                            >
                                <ChevronLeft size={15} /> Trước
                            </button>
                            <span style={{ fontSize: '13px', color: '#6b7280', padding: '0 8px' }}>
                                {page} / {meta.totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                style={{
                                    padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
                                    background: page === meta.totalPages ? '#f9fafb' : 'white',
                                    cursor: page === meta.totalPages ? 'not-allowed' : 'pointer', color: '#374151',
                                    display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
                                }}
                            >
                                Sau <ChevronRight size={15} />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* ── Job suggestions (below) ── */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Sparkles size={18} color={GREEN} />
                    <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#111827', margin: 0 }}>
                        Việc làm phù hợp với bạn
                    </h2>
                </div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                    Để nhận được gợi ý việc làm chính xác hơn, hãy{' '}
                    <Link href="/cai-dat-goi-y-viec-lam" style={{ color: GREEN, fontWeight: '600', textDecoration: 'underline' }}>
                        tùy chỉnh cài đặt gợi ý việc làm
                    </Link>.
                </p>

                {jobsLoading ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: '14px' }}>Đang tải...</div>
                ) : jobs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af', fontSize: '14px' }}>
                        Không có gợi ý phù hợp.
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            {jobs.map(job => (
                                <JobListCard
                                    key={job.id}
                                    job={job}
                                    saved={savedIds.has(job.id)}
                                    onToggleSave={() => handleToggleSave(job.id)}
                                    onDismiss={() => handleDismissJob(job.id)}
                                />
                            ))}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Link
                                href="/viec-lam/phu-hop"
                                style={{
                                    display: 'inline-block', padding: '10px 28px',
                                    background: GREEN, color: 'white', borderRadius: '8px',
                                    fontSize: '14px', fontWeight: '700', textDecoration: 'none',
                                }}
                            >
                                Xem tất cả việc làm phù hợp
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
