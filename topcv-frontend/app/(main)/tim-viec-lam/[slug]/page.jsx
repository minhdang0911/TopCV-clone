'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronRight,
    Bell,
    MapPin,
    Bookmark,
    ChevronLeft,
    Clock,
    Building2,
    Briefcase,
} from 'lucide-react';
import api from '@/lib/axios';
import JobFilter from '@/app/components/job-listing/JobFilter';
import useAuthStore from '@/stores/auth.store';
import { savedJobsService } from '@/services/applications.service';
import { toast } from 'sonner';

const GREEN = '#00b14f';
const LIMIT = 15;

function formatSalary(min, max, type) {
    if (type === 'negotiable' || (!min && !max)) return 'Thỏa thuận';
    if (min && max) return `${(min / 1_000_000).toFixed(0)} - ${(max / 1_000_000).toFixed(0)} triệu`;
    if (min) return `Từ ${(min / 1_000_000).toFixed(0)} triệu`;
    if (max) return `Đến ${(max / 1_000_000).toFixed(0)} triệu`;
    return 'Thỏa thuận';
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86_400_000);
    if (d === 0) return 'Hôm nay';
    if (d === 1) return 'Hôm qua';
    if (d < 7) return `${d} ngày trước`;
    if (d < 30) return `${Math.floor(d / 7)} tuần trước`;
    return `${Math.floor(d / 30)} tháng trước`;
}

function JobCard({ job, saved, onToggleSave }) {
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType);
    const location = job.districtName
        ? `${job.districtName}, ${job.provinceName || ''}`
        : job.provinceName || job.address || 'Toàn quốc';
    const isNew = Date.now() - new Date(job.createdAt).getTime() < 7 * 86_400_000;
    const isHot = job.isHot || job.featured;
    const isPro = job.isPro;

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,177,79,0.12)';
                e.currentTarget.style.borderColor = '#86efac';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
            }}
        >
            {/* Logo */}
            <Link
                href={`/cong-ty/${job.employer?.slug || job.employer?.id || '#'}`}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                    textDecoration: 'none',
                }}
            >
                {job.employer?.logoUrl ? (
                    <img
                        src={job.employer.logoUrl}
                        alt={job.employer.companyName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                ) : (
                    <span style={{ fontSize: '22px', fontWeight: '700', color: GREEN }}>
                        {job.employer?.companyName?.[0] || 'C'}
                    </span>
                )}
            </Link>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {isHot && (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', background: '#ef4444', borderRadius: '3px', padding: '1px 5px' }}>
                            HOT
                        </span>
                    )}
                    {isNew && !isHot && (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'white', background: GREEN, borderRadius: '3px', padding: '1px 5px' }}>
                            Mới
                        </span>
                    )}
                </div>

                <Link
                    href={`/viec-lam/${job.slug || job.id}`}
                    style={{ fontSize: '14px', fontWeight: '600', color: '#111827', textDecoration: 'none', display: 'block', lineHeight: '1.4', marginBottom: '4px' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
                >
                    {job.title}
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                    {isPro && (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#513101', background: 'linear-gradient(135deg,#f59e0b,#d97706)', borderRadius: '111px', padding: '1px 6px', flexShrink: 0 }}>
                            Pro
                        </span>
                    )}
                    <Link
                        href={`/cong-ty/${job.employer?.slug || '#'}`}
                        style={{ fontSize: '12px', color: '#6b7280', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
                    >
                        {job.employer?.companyName}
                    </Link>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                        <MapPin size={11} color="#9ca3af" />
                        {location}
                    </span>
                    {job.experience && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
                            <Briefcase size={11} color="#9ca3af" />
                            {job.experience}
                        </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                        <Clock size={11} color="#d1d5db" />
                        {timeAgo(job.createdAt)}
                    </span>
                </div>
            </div>

            {/* Right: salary + bookmark */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: GREEN, whiteSpace: 'nowrap' }}>
                    {salary}
                </span>
                <button
                    onClick={(e) => { e.preventDefault(); onToggleSave(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                    title={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
                >
                    <Bookmark
                        size={17}
                        color={saved ? GREEN : '#9ca3af'}
                        fill={saved ? GREEN : 'none'}
                    />
                </button>
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, onChange }) {
    const pages = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, page + 2);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '24px' }}>
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                style={{ width: '34px', height: '34px', border: '1px solid #e5e7eb', borderRadius: '6px', background: page === 1 ? '#f9fafb' : 'white', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === 1 ? 0.4 : 1 }}
            >
                <ChevronLeft size={15} color="#374151" />
            </button>

            {start > 1 && (
                <>
                    <button onClick={() => onChange(1)} style={pageBtn(false)}>1</button>
                    {start > 2 && <span style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>}
                </>
            )}

            {pages.map((p) => (
                <button key={p} onClick={() => onChange(p)} style={pageBtn(p === page)}>{p}</button>
            ))}

            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span style={{ color: '#9ca3af', fontSize: '13px' }}>...</span>}
                    <button onClick={() => onChange(totalPages)} style={pageBtn(false)}>{totalPages}</button>
                </>
            )}

            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                style={{ width: '34px', height: '34px', border: '1px solid #e5e7eb', borderRadius: '6px', background: page === totalPages ? '#f9fafb' : 'white', cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page === totalPages ? 0.4 : 1 }}
            >
                <ChevronRight size={15} color="#374151" />
            </button>
        </div>
    );
}

function pageBtn(active) {
    return {
        width: '34px',
        height: '34px',
        border: `1px solid ${active ? GREEN : '#e5e7eb'}`,
        borderRadius: '6px',
        background: active ? GREEN : 'white',
        color: active ? 'white' : '#374151',
        fontSize: '13px',
        fontWeight: active ? '600' : '400',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };
}

export default function IndustryCategoryPage() {
    const { slug } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    // category can be an industry OR a job position
    const [category, setCategory] = useState(null); // { id, name, slug, type: 'industry'|'position' }
    const [allIndustries, setAllIndustries] = useState([]);
    const [allJobPositions, setAllJobPositions] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
    const [loadingCategory, setLoadingCategory] = useState(true);
    const [loadingJobs, setLoadingJobs] = useState(false);
    const [savedIds, setSavedIds] = useState(new Set());

    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || '';

    // Fetch industries + job-positions, find current slug in either list
    useEffect(() => {
        setLoadingCategory(true);
        Promise.all([
            api.get('/industries?limit=100'),
            api.get('/job-positions?limit=100'),
        ])
            .then(([indRes, posRes]) => {
                const industries = indRes.data?.data || indRes.data || [];
                const positions = posRes.data?.data || posRes.data || [];
                setAllIndustries(industries);
                setAllJobPositions(positions);

                const foundInd = industries.find((i) => i.slug === slug);
                if (foundInd) {
                    setCategory({ ...foundInd, type: 'industry' });
                } else {
                    const foundPos = positions.find((p) => p.slug === slug);
                    if (foundPos) setCategory({ ...foundPos, type: 'position' });
                    else setCategory(null);
                }
            })
            .catch(() => {})
            .finally(() => setLoadingCategory(false));
    }, [slug]);

    // Fetch jobs once category is known
    useEffect(() => {
        if (!category) return;
        setLoadingJobs(true);

        const params = {
            page,
            limit: LIMIT,
            [category.type === 'industry' ? 'industryId' : 'jobPositionId']: category.id,
        };

        // Append other active filters from URL
        [
            'workingType',
            'workingDays',
            'level',
            'experience',
            'salaryMin',
            'salaryMax',
            'provinceCode',
            'sort',
        ].forEach((k) => {
            const v = searchParams.get(k);
            // multi-select params are comma-separated → take first value (backend single-value)
            if (v) params[k] = v.includes(',') ? v.split(',')[0] : v;
        });

        api.get('/jobs', { params })
            .then((res) => {
                setJobs(res.data?.data || []);
                setMeta(res.data?.meta || { total: 0, totalPages: 1, page: 1 });
            })
            .catch(() => {
                setJobs([]);
                setMeta({ total: 0, totalPages: 1, page: 1 });
            })
            .finally(() => setLoadingJobs(false));
    }, [category, searchParams, page]);

    // Load saved job IDs
    useEffect(() => {
        if (!isAuthenticated) return;
        savedJobsService
            .getMy({ limit: 1000 })
            .then((res) => {
                const ids = (res.data?.data || []).map((s) => s.jobId || s.job?.id).filter(Boolean);
                setSavedIds(new Set(ids));
            })
            .catch(() => {});
    }, [isAuthenticated]);

    const toggleSave = async (jobId) => {
        if (!isAuthenticated) {
            toast.error('Vui lòng đăng nhập để lưu việc làm');
            return;
        }
        const wasSaved = savedIds.has(jobId);
        setSavedIds((prev) => {
            const next = new Set(prev);
            wasSaved ? next.delete(jobId) : next.add(jobId);
            return next;
        });
        try {
            await savedJobsService.toggle(jobId);
            toast.success(wasSaved ? 'Đã bỏ lưu việc làm' : 'Đã lưu việc làm');
        } catch {
            setSavedIds((prev) => {
                const next = new Set(prev);
                wasSaved ? next.add(jobId) : next.delete(jobId);
                return next;
            });
            toast.error('Có lỗi xảy ra');
        }
    };

    const changePage = (newPage) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', String(newPage));
        router.push(`/tim-viec-lam/${slug}?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const changeSort = (val) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val) params.set('sort', val);
        else params.delete('sort');
        params.set('page', '1');
        router.push(`/tim-viec-lam/${slug}?${params.toString()}`);
    };

    const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Breadcrumb */}
            <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                    <Link href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Trang chủ</Link>
                    <ChevronRight size={12} />
                    <Link href="/viec-lam" style={{ color: '#6b7280', textDecoration: 'none' }}>Việc làm</Link>
                    {category && (
                        <>
                            <ChevronRight size={12} />
                            <span style={{ color: '#374151', fontWeight: '500' }}>{category.name}</span>
                        </>
                    )}
                </div>
            </div>

            {/* Title header */}
            <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6', padding: '16px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '19px', fontWeight: '700', color: '#111827', margin: '0 0 4px', lineHeight: '1.3' }}>
                            Tuyển dụng{' '}
                            <span style={{ color: GREEN }}>
                                {loadingJobs ? '...' : meta.total.toLocaleString('vi-VN')} việc làm
                            </span>
                            {category ? ` ${category.name}` : ''}
                        </h1>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
                            [Update {today}]
                        </p>
                    </div>
                    <button
                        style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#374151', fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0 }}
                        onClick={() => toast.info('Tính năng sắp ra mắt')}
                    >
                        <Bell size={14} />
                        Tạo thông báo việc làm
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px', alignItems: 'start' }}>
                {/* Left sidebar */}
                <aside>
                    {!loadingCategory && (
                        <JobFilter
                            key={category?.id}
                            industries={allIndustries}
                            jobPositions={allJobPositions}
                            activeIndustryId={category?.type === 'industry' ? String(category.id) : undefined}
                            activeJobPositionId={category?.type === 'position' ? String(category.id) : undefined}
                        />
                    )}
                </aside>

                {/* Right: job list */}
                <main>
                    {/* Sort bar */}
                    <div style={{ background: 'white', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e5e7eb' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            {loadingJobs
                                ? 'Đang tải...'
                                : `Tìm thấy ${meta.total.toLocaleString('vi-VN')} việc làm`}
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>Sắp xếp:</span>
                            <select
                                value={sort}
                                onChange={(e) => changeSort(e.target.value)}
                                style={{ fontSize: '13px', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', background: 'white', outline: 'none' }}
                            >
                                <option value="">Mới nhất</option>
                                <option value="salary">Lương cao nhất</option>
                            </select>
                        </div>
                    </div>

                    {/* Jobs */}
                    {loadingJobs ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <Building2 size={32} color="#e5e7eb" style={{ marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '14px', margin: 0 }}>Đang tải việc làm...</p>
                        </div>
                    ) : jobs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                            <Building2 size={40} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 12px' }} />
                            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 4px' }}>
                                Không tìm thấy việc làm phù hợp
                            </p>
                            <p style={{ fontSize: '12px', color: '#d1d5db', margin: 0 }}>
                                Thử thay đổi bộ lọc để xem thêm kết quả
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {jobs.map((job) => (
                                <JobCard
                                    key={job.id}
                                    job={job}
                                    saved={savedIds.has(job.id)}
                                    onToggleSave={() => toggleSave(job.id)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {meta.totalPages > 1 && !loadingJobs && (
                        <Pagination
                            page={page}
                            totalPages={meta.totalPages}
                            onChange={changePage}
                        />
                    )}
                </main>
            </div>
        </div>
    );
}
