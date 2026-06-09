import { Suspense } from 'react';
import JobSearch from '@/app/components/job-listing/JobSearch';
import JobFilter from '@/app/components/job-listing/JobFilter';
import JobCard from '@/app/components/job-listing/JobCard';
import SortBar from '@/app/components/job-listing/SortBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const GREEN = '#00b14f';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SearchParams {
    page?: string;
    limit?: string;
    search?: string;
    searchBy?: string;
    // Checkbox multi-value (comma-separated) → backend nhận từng giá trị
    industryId?: string;
    company_field?: string;
    jobPositionId?: string;
    workingType?: string;
    workingDays?: string;
    level?: string;
    experience?: string;
    provinceCode?: string;
    provinceName?: string;
    salaryMin?: string;
    salaryMax?: string;
    salaryPreset?: string;
    sort?: string;
    sortBy?: string;
}

/**
 * Backend jobs.service.ts nhận single value cho mỗi filter.
 * Nếu user chọn nhiều checkbox (comma-separated), ta gửi request đầu tiên
 * hoặc có thể mở rộng backend sau. Hiện tại dùng first value.
 * TODO: mở rộng backend để nhận mảng filter.
 */
function firstOf(val?: string) {
    return val ? val.split(',')[0] : undefined;
}

async function fetchJobs(params: SearchParams) {
    const query = new URLSearchParams();
    query.set('page', params.page || '1');
    query.set('limit', params.limit || '20');

    if (params.search) query.set('search', params.search);

    // Ưu tiên industryId, fallback company_field
    const industryId = firstOf(params.industryId || params.company_field);
    if (industryId) query.set('industryId', industryId);

    const jobPositionId = firstOf(params.jobPositionId);
    if (jobPositionId) query.set('jobPositionId', jobPositionId);

    const workingType = firstOf(params.workingType);
    if (workingType) query.set('workingType', workingType);

    const workingDays = firstOf(params.workingDays);
    if (workingDays) query.set('workingDays', workingDays);

    const level = firstOf(params.level);
    if (level) query.set('level', level);

    const experience = firstOf(params.experience);
    if (experience) query.set('experience', experience);

    if (params.provinceCode) query.set('provinceCode', params.provinceCode);
    if (params.salaryMin) query.set('salaryMin', params.salaryMin);
    if (params.salaryMax) query.set('salaryMax', params.salaryMax);

    // Map sort values từ frontend sang backend
    const sortMap: Record<string, string> = {
        newest: 'newest',
        updated: 'newest', // backend chưa có sort by updatedAt, fallback newest
        salary: 'salary',
        urgent: 'newest', // backend chưa có urgent sort, fallback newest
    };
    if (params.sort) query.set('sort', sortMap[params.sort] || 'newest');

    try {
        const res = await fetch(`${API_BASE}/jobs?${query.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Fetch jobs failed');
        return res.json();
    } catch {
        return { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } };
    }
}

async function fetchIndustries() {
    try {
        const res = await fetch(`${API_BASE}/industries?limit=100`, { next: { revalidate: 1800 } });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

async function fetchJobPositions() {
    try {
        const res = await fetch(`${API_BASE}/job-positions?limit=100`, { next: { revalidate: 1800 } });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch {
        return [];
    }
}

function EmptyState() {
    return (
        <div
            style={{
                background: 'white',
                borderRadius: '10px',
                padding: '52px 24px',
                textAlign: 'center',
                border: '1px solid #e5e7eb',
            }}
        >
            <svg
                width="110"
                height="110"
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ marginBottom: '16px' }}
            >
                <circle cx="60" cy="60" r="56" fill="#f0fdf4" />
                <line x1="80" y1="80" x2="98" y2="98" stroke="#00b14f" strokeWidth="6" strokeLinecap="round" />
                <circle cx="62" cy="55" r="26" stroke="#00b14f" strokeWidth="5" fill="white" />
                <line x1="53" y1="48" x2="71" y2="48" stroke="#d1fae5" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="53" y1="55" x2="71" y2="55" stroke="#d1fae5" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="53" y1="62" x2="64" y2="62" stroke="#d1fae5" strokeWidth="3.5" strokeLinecap="round" />
                <circle cx="85" cy="30" r="12" fill="#fee2e2" />
                <line x1="80" y1="25" x2="90" y2="35" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="90" y1="25" x2="80" y2="35" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>
                Không tìm thấy việc làm phù hợp
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 18px', lineHeight: '1.6' }}>
                Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc
            </p>
            <div
                style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    gap: '6px',
                    textAlign: 'left',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontSize: '12px',
                    color: '#6b7280',
                }}
            >
                {[
                    'Kiểm tra lỗi chính tả từ khóa',
                    'Thử từ khóa ngắn hơn hoặc chung hơn',
                    'Bỏ bớt bộ lọc đang áp dụng',
                    'Chọn tỉnh/thành khác hoặc tất cả khu vực',
                ].map((tip) => (
                    <div key={tip} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <circle cx="7" cy="7" r="6" fill="#d1fae5" />
                            <path
                                d="M4.5 7l1.8 1.8L9.5 5"
                                stroke="#00b14f"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                        {tip}
                    </div>
                ))}
            </div>
        </div>
    );
}

function Pagination({
    currentPage,
    totalPages,
    searchParams,
}: {
    currentPage: number;
    totalPages: number;
    searchParams: SearchParams;
}) {
    if (totalPages <= 1) return null;

    const buildUrl = (page: number) => {
        const p = new URLSearchParams();
        Object.entries(searchParams).forEach(([k, v]) => {
            if (v && k !== 'page') p.set(k, v);
        });
        p.set('page', String(page));
        return `/tim-viec-lam-moi-nhat?${p.toString()}`;
    };

    const pages: (number | '...')[] = [];
    const delta = 2;
    const range: number[] = [];
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
    }
    if (range[0] > 2) pages.push(1, '...');
    else pages.push(1);
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push('...', totalPages);
    else if (totalPages > 1) pages.push(totalPages);

    const btnBase: React.CSSProperties = {
        width: '34px',
        height: '34px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        background: 'white',
        cursor: 'pointer',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '500',
        textDecoration: 'none',
        color: '#374151',
        transition: 'all 0.15s',
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '28px', flexWrap: 'wrap' }}>
            {currentPage > 1 && (
                <a href={buildUrl(currentPage - 1)} style={btnBase}>
                    <ChevronLeft size={15} />
                </a>
            )}
            {pages.map((p, i) =>
                p === '...' ? (
                    <span key={`dot-${i}`} style={{ ...btnBase, cursor: 'default', border: 'none' }}>
                        ···
                    </span>
                ) : (
                    <a
                        key={p}
                        href={buildUrl(p as number)}
                        style={{
                            ...btnBase,
                            background: p === currentPage ? GREEN : 'white',
                            color: p === currentPage ? 'white' : '#374151',
                            borderColor: p === currentPage ? GREEN : '#e5e7eb',
                            fontWeight: p === currentPage ? '700' : '500',
                        }}
                    >
                        {p}
                    </a>
                ),
            )}
            {currentPage < totalPages && (
                <a href={buildUrl(currentPage + 1)} style={btnBase}>
                    <ChevronRight size={15} />
                </a>
            )}
        </div>
    );
}

export default async function JobListingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params = await searchParams;

    const [jobsRes, industries, jobPositions] = await Promise.all([
        fetchJobs(params),
        fetchIndustries(),
        fetchJobPositions(),
    ]);

    const jobs = jobsRes.data || [];
    const meta = jobsRes.meta || { total: 0, page: 1, totalPages: 0 };
    const currentPage = Number(params.page) || 1;
    const activeIndustryId = params.industryId || params.company_field || '';

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
            <style>{`
                @media(max-width:768px){
                    .tvlmn-grid{grid-template-columns:1fr!important;}
                    .tvlmn-sidebar{display:none!important;}
                }
            `}</style>
            {/* Search header — white bar */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                    {/* Breadcrumb */}
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                        <Link href="/" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                            Trang chủ
                        </Link>
                        {' › '}
                        <a href="/viec-lam" style={{ color: '#9ca3af', textDecoration: 'none' }}>
                            Việc làm
                        </a>
                        {params.provinceName && (
                            <>
                                {' › '}
                                <span style={{ color: '#374151' }}>{params.provinceName}</span>
                            </>
                        )}
                    </div>

                    <Suspense fallback={null}>
                        <JobSearch totalJobs={meta.total} provinceName={params.provinceName} />
                    </Suspense>
                </div>
            </div>

            {/* Main */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
                <div
                    className="tvlmn-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '256px 1fr',
                        gap: '16px',
                        alignItems: 'start',
                    }}
                >
                    {/* Sidebar filter */}
                    <div className="tvlmn-sidebar">
                        <Suspense fallback={null}>
                            <JobFilter
                                industries={industries}
                                jobPositions={jobPositions}
                                activeIndustryId={activeIndustryId}
                            />
                        </Suspense>
                    </div>

                    {/* Job list */}
                    <div>
                        <Suspense fallback={null}>
                            <SortBar total={meta.total} search={params.search} />
                        </Suspense>

                        {jobs.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {jobs.map((job: any, idx: number) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        featured={idx < 3 && currentPage === 1}
                                        suggested={idx >= 3 && idx < 8 && currentPage === 1}
                                    />
                                ))}
                            </div>
                        )}

                        <Pagination currentPage={currentPage} totalPages={meta.totalPages} searchParams={params} />
                    </div>
                </div>
            </div>
        </div>
    );
}
