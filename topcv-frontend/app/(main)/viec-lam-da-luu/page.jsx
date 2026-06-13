'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, MapPin, DollarSign, Calendar, Clock, Briefcase, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { savedJobsService } from '@/services/applications.service';
import { jobService } from '@/services/job.service';
import useAuthStore from '@/stores/auth.store';
import emptyImg from '@/app/assests/img/empty.png';

const GREEN = '#00b14f';

function formatSalary(job) {
    if (!job) return 'Thoả thuận';
    if (job.salaryType === 'NEGOTIABLE' || (!job.salaryMin && !job.salaryMax)) return 'Thoả thuận';
    const min = job.salaryMin ? (job.salaryMin / 1000000).toFixed(0) : null;
    const max = job.salaryMax ? (job.salaryMax / 1000000).toFixed(0) : null;
    if (min && max) return `${min} - ${max} triệu`;
    if (min) return `Từ ${min} triệu`;
    if (max) return `Đến ${max} triệu`;
    return 'Thoả thuận';
}

function formatSavedDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} - ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDeadline(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function timeUpdated(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return `${m} phút trước`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ trước`;
    const day = Math.floor(h / 24);
    if (day < 7) return `${day} ngày trước`;
    return `${Math.floor(day / 7)} tuần trước`;
}

export default function SavedJobsPage() {
    const router = useRouter();
    const { isAuthenticated, hydrated } = useAuthStore();

    const [savedItems, setSavedItems] = useState([]);
    const [similarJobs, setSimilarJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);
    const [unsavingId, setUnsavingId] = useState(null);
    const [savingId, setSavingId] = useState(null);

    async function fetchAll() {
        try {
            const res = await savedJobsService.getMy();
            const items = res.data?.data || [];
            setSavedItems(items);

            const savedJobIds = new Set(items.map((i) => i.jobId));

            let similar = [];
            try {
                const suggestRes = await jobService.getSuggestions();
                similar = (suggestRes.data?.data || suggestRes.data || []).filter((j) => !savedJobIds.has(j.id));
            } catch {}

            if (similar.length < 4) {
                try {
                    const allRes = await jobService.getAll({ limit: 12 });
                    const more = (allRes.data?.data || []).filter(
                        (j) => !savedJobIds.has(j.id) && !similar.find((s) => s.id === j.id),
                    );
                    similar = [...similar, ...more];
                } catch {}
            }

            setSimilarJobs(similar.slice(0, 8));
        } catch {}
    }

    useEffect(() => {
        if (!hydrated || !isAuthenticated) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchAll().finally(() => setLoading(false));
    }, [hydrated, isAuthenticated]);

    const handleUnsave = async (e, jobId) => {
        e.stopPropagation();
        e.preventDefault();
        if (unsavingId) return;
        setUnsavingId(jobId);
        try {
            await savedJobsService.toggle(jobId);
            setSavedItems((prev) => prev.filter((i) => i.jobId !== jobId));
            toast.success('Đã bỏ lưu việc làm');
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setUnsavingId(null);
        }
    };

    const handleToggleSimilar = async (e, jobId, isSaved) => {
        e.stopPropagation();
        e.preventDefault();
        if (savingId) return;
        setSavingId(jobId);
        try {
            await savedJobsService.toggle(jobId);
            if (isSaved) {
                setSavedItems((prev) => prev.filter((i) => i.jobId !== jobId));
                toast.success('Đã bỏ lưu việc làm');
            } else {
                // Refresh saved list to get the new item with createdAt
                const res = await savedJobsService.getMy();
                setSavedItems(res.data?.data || []);
                toast.success('Đã lưu việc làm');
            }
        } catch {
            toast.error('Có lỗi xảy ra');
        } finally {
            setSavingId(null);
        }
    };

    const handleApply = (e, slug) => {
        e.stopPropagation();
        e.preventDefault();
        router.push(`/viec-lam/${slug}?apply=1`);
    };

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <img
                        src={emptyImg.src}
                        alt=""
                        style={{
                            width: '160px',
                            height: '160px',
                            objectFit: 'contain',
                            marginBottom: '16px',
                            opacity: 0.7,
                        }}
                    />
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                        Vui lòng đăng nhập để xem việc làm đã lưu
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        style={{
                            background: GREEN,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 28px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            marginTop: '8px',
                        }}
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                style={{
                    maxWidth: '960px',
                    margin: '0 auto',
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '14px',
                }}
            >
                Đang tải...
            </div>
        );
    }

    const savedJobIds = new Set(savedItems.map((i) => i.jobId));

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px 60px' }}>
            {/* ── Saved jobs list ───────────────────────────────────── */}
            {savedItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0 40px' }}>
                    <img
                        src={emptyImg.src}
                        alt=""
                        style={{ width: '180px', height: '180px', objectFit: 'contain', display: 'block', margin: '0 auto 20px' }}
                    />
                    <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                        Bạn chưa lưu công việc nào!
                    </p>
                    <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '28px' }}>
                        Lưu những công việc yêu thích để xem lại sau
                    </p>
                    <button
                        onClick={() => router.push('/viec-lam')}
                        style={{
                            background: GREEN,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 32px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        Tìm việc ngay <ChevronRight size={16} />
                    </button>
                </div>
            ) : (
                <>
                    <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px' }}>
                        Danh sách {savedItems.length} việc làm đã lưu
                    </h1>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '48px' }}>
                        {savedItems.map((item) => {
                            const job = item.job;
                            if (!job) return null;
                            const isHovered = hoveredId === item.id;
                            const location = job.locations?.[0]?.provinceName || '';
                            const deadline = formatDeadline(job.deadline);

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => router.push(`/viec-lam/${job.slug}`)}
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    style={{
                                        background: 'white',
                                        border: `1px solid ${isHovered ? GREEN : '#e5e7eb'}`,
                                        borderRadius: '12px',
                                        padding: '16px 20px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: '16px',
                                        alignItems: 'center',
                                        boxShadow: isHovered
                                            ? '0 4px 16px rgba(0,177,79,0.1)'
                                            : '0 1px 4px rgba(0,0,0,0.05)',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                >
                                    {/* Company logo */}
                                    <div
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            flexShrink: 0,
                                            borderRadius: '10px',
                                            border: '1px solid #f0f0f0',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#fafafa',
                                        }}
                                    >
                                        {job.employer?.logoUrl ? (
                                            <img
                                                src={job.employer.logoUrl}
                                                alt={job.employer.companyName}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <Briefcase size={26} color="#d1d5db" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: '15px',
                                                fontWeight: '700',
                                                color: '#111827',
                                                marginBottom: '3px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {job.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                color: '#6b7280',
                                                marginBottom: '8px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {job.employer?.companyName}
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                gap: '14px',
                                                flexWrap: 'wrap',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '13px',
                                                    color: GREEN,
                                                    fontWeight: '600',
                                                }}
                                            >
                                                <DollarSign size={13} strokeWidth={2.5} />
                                                {formatSalary(job)}
                                            </span>
                                            {location && (
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '13px',
                                                        color: '#6b7280',
                                                    }}
                                                >
                                                    <MapPin size={13} />
                                                    {location}
                                                </span>
                                            )}
                                            {deadline && (
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        fontSize: '12px',
                                                        color: '#9ca3af',
                                                    }}
                                                >
                                                    <Calendar size={12} />
                                                    Hạn: {deadline}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '11px',
                                                color: '#9ca3af',
                                                marginTop: '6px',
                                            }}
                                        >
                                            <Clock size={11} />
                                            Đã lưu: {formatSavedDate(item.createdAt)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '10px',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <button
                                            onClick={(e) => handleUnsave(e, item.jobId)}
                                            disabled={!!unsavingId}
                                            title="Bỏ lưu"
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: '4px',
                                                lineHeight: 0,
                                                opacity: unsavingId === item.jobId ? 0.5 : 1,
                                            }}
                                        >
                                            <Heart size={20} fill="#ef4444" color="#ef4444" />
                                        </button>
                                        <button
                                            onClick={(e) => handleApply(e, job.slug)}
                                            style={{
                                                background: isHovered ? GREEN : 'transparent',
                                                color: isHovered ? 'white' : 'transparent',
                                                border: `1px solid ${isHovered ? GREEN : 'transparent'}`,
                                                borderRadius: '6px',
                                                padding: '6px 16px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                whiteSpace: 'nowrap',
                                                transition: 'all 0.15s',
                                                pointerEvents: isHovered ? 'auto' : 'none',
                                            }}
                                        >
                                            Ứng tuyển
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* ── Similar jobs ─────────────────────────────────────── */}
            {similarJobs.length > 0 && (
                <div>
                    <h2
                        style={{
                            fontSize: '17px',
                            fontWeight: '700',
                            color: '#111827',
                            marginBottom: '16px',
                            paddingTop: savedItems.length > 0 ? '8px' : '0',
                            borderTop: savedItems.length > 0 ? '1px solid #f3f4f6' : 'none',
                            paddingBottom: '0',
                        }}
                    >
                        Việc làm tương tự việc bạn đã lưu
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {similarJobs.map((job) => {
                            const isSaved = savedJobIds.has(job.id);
                            const location = job.locations?.[0]?.provinceName || '';
                            const logoUrl = job.employer?.logoUrl || job.company?.logo;
                            const companyName = job.employer?.companyName || job.company?.companyName;

                            return (
                                <div
                                    key={job.id}
                                    onClick={() => router.push(`/viec-lam/${job.slug}`)}
                                    style={{
                                        background: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '10px',
                                        padding: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'flex-start',
                                        transition: 'border-color 0.15s, box-shadow 0.15s',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = GREEN;
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,177,79,0.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '46px',
                                            height: '46px',
                                            flexShrink: 0,
                                            borderRadius: '8px',
                                            border: '1px solid #f0f0f0',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#fafafa',
                                        }}
                                    >
                                        {logoUrl ? (
                                            <img
                                                src={logoUrl}
                                                alt={companyName}
                                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                            />
                                        ) : (
                                            <Briefcase size={20} color="#d1d5db" />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                fontSize: '13px',
                                                fontWeight: '700',
                                                color: '#111827',
                                                marginBottom: '3px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {job.title}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#6b7280',
                                                marginBottom: '7px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {companyName}
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                fontSize: '12px',
                                            }}
                                        >
                                            <span style={{ color: GREEN, fontWeight: '600' }}>{formatSalary(job)}</span>
                                            {location && (
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '3px',
                                                        color: '#9ca3af',
                                                    }}
                                                >
                                                    <MapPin size={11} />
                                                    {location}
                                                </span>
                                            )}
                                        </div>
                                        {job.updatedAt && (
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#9ca3af',
                                                    marginTop: '5px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '3px',
                                                }}
                                            >
                                                <Clock size={10} />
                                                Cập nhật {timeUpdated(job.updatedAt)}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={(e) => handleToggleSimilar(e, job.id, isSaved)}
                                        disabled={savingId === job.id}
                                        title={isSaved ? 'Bỏ lưu' : 'Lưu việc làm'}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            lineHeight: 0,
                                            flexShrink: 0,
                                            opacity: savingId === job.id ? 0.5 : 1,
                                        }}
                                    >
                                        <Heart
                                            size={16}
                                            fill={isSaved ? '#ef4444' : 'none'}
                                            color={isSaved ? '#ef4444' : '#9ca3af'}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
