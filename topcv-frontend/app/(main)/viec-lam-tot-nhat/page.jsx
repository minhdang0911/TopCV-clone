'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    Bookmark,
    MapPin,
    Clock,
    Search,
    X,
    Briefcase,
    ChevronDown,
    Check,
    Rocket,
} from 'lucide-react';
import { jobService } from '@/services/job.service';
import { provinceService } from '@/services/province.service';
import api from '@/lib/axios';
import arrownDesktop from '@/app/assests/img/arrow_desktop.png';
import bannerRight from '@/app/assests/img/banner_right.webp';

const GREEN = '#00b14f';

/* ─── Helpers ─── */
const formatSalary = (min, max, type) => {
    if (type === 'negotiable' || (!min && !max)) return 'Thỏa thuận';
    if (min && max) return `${min / 1000000} - ${max / 1000000} triệu`;
    if (min) return `Từ ${min / 1000000} triệu`;
    if (max) return `Đến ${max / 1000000} triệu`;
    return 'Thỏa thuận';
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return `${seconds} giây trước`;
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return `${Math.floor(days / 7)} tuần trước`;
};

const daysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline).getTime() - Date.now();
    const days = Math.ceil(diff / 86400000);
    return days > 0 ? days : 0;
};

const isNew = (dateStr) => Date.now() - new Date(dateStr).getTime() < 7 * 86400000;

/* ─── JobCard ─── */
function JobCard({ job }) {
    const [saved, setSaved] = useState(false);
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType);
    const location = job.districtName
        ? `${job.districtName}, ${job.provinceName || ''}`
        : job.provinceName || job.address || 'Toàn quốc';
    const remaining = daysLeft(job.deadline);
    const updated = timeAgo(job.updatedAt || job.createdAt);
    const isPro = job.isPro;
    const isHot = job.isHot;
    const isOutstanding = job.isOutstanding;
    const showNew = isNew(job.createdAt) && !isHot;

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '5px',
                padding: '16px 20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, border-color 0.18s',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,177,79,0.12)';
                e.currentTarget.style.borderColor = GREEN;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
            }}
        >
            {/* Logo */}
            <div
                style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    flexShrink: 0,
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
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }}
                    />
                ) : (
                    <span style={{ fontSize: '22px', fontWeight: '700', color: GREEN }}>
                        {job.employer?.companyName?.[0] || 'C'}
                    </span>
                )}
            </div>

            {/* Main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title row */}
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}
                >
                    {isOutstanding && (
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#f97316',
                                background: '#fff7ed',
                                border: '1px solid #fdba74',
                                borderRadius: '3px',
                                padding: '1px 6px',
                                flexShrink: 0,
                            }}
                        >
                            NỔI BẬT
                        </span>
                    )}
                    {isHot && (
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'white',
                                background: '#ef4444',
                                borderRadius: '3px',
                                padding: '1px 6px',
                                flexShrink: 0,
                            }}
                        >
                            HOT
                        </span>
                    )}
                    {showNew && (
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: GREEN,
                                background: 'white',
                                border: `1px solid ${GREEN}`,
                                borderRadius: '3px',
                                padding: '1px 6px',
                                flexShrink: 0,
                            }}
                        >
                            Tin mới
                        </span>
                    )}
                    <Link
                        href={`/viec-lam/${job.id}`}
                        style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#212f3f',
                            textDecoration: 'none',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#212f3f')}
                    >
                        {job.title}
                    </Link>
                </div>

                {/* Company */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                    {isPro && (
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: '#513101',
                                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                                borderRadius: '111px',
                                padding: '1px 7px',
                                flexShrink: 0,
                            }}
                        >
                            Pro
                        </span>
                    )}
                    <span
                        style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {job.employer?.companyName}
                    </span>
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span
                        style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                        }}
                    >
                        <MapPin size={12} color="#9ca3af" /> {location}
                    </span>
                    {remaining !== null && (
                        <span
                            style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                            }}
                        >
                            <Clock size={12} color="#9ca3af" />
                            Còn{' '}
                            <strong style={{ color: remaining <= 3 ? '#ef4444' : '#374151', margin: '0 2px' }}>
                                {remaining}
                            </strong>{' '}
                            ngày để ứng tuyển
                        </span>
                    )}
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>Cập nhật {updated}</span>
                </div>
            </div>

            {/* Right — salary + actions */}
            <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', flexShrink: 0 }}
            >
                <span style={{ fontSize: '14px', fontWeight: '600', color: GREEN, whiteSpace: 'nowrap' }}>
                    {salary}
                </span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setSaved(!saved);
                        }}
                        style={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '50%',
                            border: `1px solid ${saved ? GREEN : '#e5e7eb'}`,
                            background: saved ? '#f0fdf4' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: saved ? GREEN : '#9ca3af',
                            transition: 'all 0.15s',
                        }}
                    >
                        <Bookmark size={15} fill={saved ? GREEN : 'none'} />
                    </button>
                    <Link
                        href={`/viec-lam/${job.id}`}
                        style={{
                            padding: '8px 20px',
                            borderRadius: '4px',
                            background: GREEN,
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#009940')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
                    >
                        Ứng tuyển
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* ─── Skeleton ─── */
function JobCardSkeleton() {
    return (
        <div
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '5px',
                padding: '16px 20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
            }}
        >
            <div style={{ width: '72px', height: '72px', borderRadius: '4px', background: '#f3f4f6', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        height: '15px',
                        background: '#f3f4f6',
                        borderRadius: '3px',
                        width: '55%',
                        marginBottom: '8px',
                    }}
                />
                <div
                    style={{
                        height: '13px',
                        background: '#f3f4f6',
                        borderRadius: '3px',
                        width: '30%',
                        marginBottom: '10px',
                    }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '3px', width: '90px' }} />
                    <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '3px', width: '130px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '3px', width: '80px' }} />
                <div style={{ height: '34px', background: '#f3f4f6', borderRadius: '4px', width: '90px' }} />
            </div>
        </div>
    );
}

/* ─── Pagination ─── */
function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    const pages = [];
    const delta = 2;
    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);
    for (let i = start; i <= end; i++) pages.push(i);

    const btn = (content, onClick, active = false, disabled = false) => (
        <button
            key={String(content)}
            onClick={onClick}
            disabled={disabled}
            style={{
                minWidth: '36px',
                height: '36px',
                borderRadius: '4px',
                border: active ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb',
                background: active ? GREEN : disabled ? '#f9fafb' : 'white',
                color: active ? 'white' : disabled ? '#d1d5db' : '#374151',
                fontSize: '14px',
                fontWeight: active ? '600' : '400',
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s',
                padding: '0 8px',
            }}
        >
            {content}
        </button>
    );

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', margin: '32px 0' }}>
            {btn(<ChevronLeft size={16} />, () => onChange(page - 1), false, page === 1)}
            {start > 1 && (
                <>
                    {btn(1, () => onChange(1))}
                    {start > 2 && <span style={{ color: '#9ca3af', padding: '0 2px' }}>…</span>}
                </>
            )}
            {pages.map((p) => btn(p, () => onChange(p), p === page))}
            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span style={{ color: '#9ca3af', padding: '0 2px' }}>…</span>}
                    {btn(totalPages, () => onChange(totalPages))}
                </>
            )}
            {btn(<ChevronRight size={16} />, () => onChange(page + 1), false, page === totalPages)}
        </div>
    );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ViecLamTotNhatPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [provinceCode, setProvinceCode] = useState('');
    const [industryId, setIndustryId] = useState('');

    const [provinces, setProvinces] = useState([]);
    const [industries, setIndustries] = useState([]);

    useEffect(() => {
        provinceService
            .getAll()
            .then((data) => setProvinces(data || []))
            .catch(console.error);
        api.get('/industries?limit=100')
            .then((r) => setIndustries(r.data.data || []))
            .catch(console.error);
    }, []);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, limit: 20 };
            if (search) params.search = search;
            if (provinceCode) params.provinceCode = provinceCode;
            if (industryId) params.industryId = industryId;
            const res = await jobService.getAll(params);
            setJobs(res.data.data || []);
            setMeta(res.data.meta || { total: 0, totalPages: 1, page: 1 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, search, provinceCode, industryId]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    useEffect(() => {
        setPage(1);
    }, [search, provinceCode, industryId]);

    const handleSearch = () => setSearch(searchInput);

    const provinceOptions = [
        { label: 'Tất cả tỉnh/thành phố', value: '' },
        ...provinces.map((p) => ({ label: p.name, value: String(p.code) })),
    ];
    const industryOptions = [
        { label: 'Tất cả lĩnh vực', value: '' },
        ...industries.map((i) => ({ label: i.name, value: String(i.id) })),
    ];

    return (
        <div style={{ background: '#f4f5f5', minHeight: '100vh' }}>
            {/* ══ BANNER ══ */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #263238, #00b14f 105.53%)',
                    borderRadius: '5px 5px 0 0',
                    minHeight: '180px',
                    padding: '28px 0 32px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Arrow decoration */}
                <img
                    src={arrownDesktop.src || arrownDesktop}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: 'absolute',
                        right: '320px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: '130px',
                        opacity: 0.9,
                        pointerEvents: 'none',
                    }}
                />

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', position: 'relative' }}>
                    <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'white', margin: '0 0 6px' }}>
                        Việc làm tốt nhất
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: '0 0 18px' }}>
                        Tìm kiếm công việc mơ ước từ những cơ hội việc làm tốt nhất trên TopCV
                    </p>

                    {/* Feature pills */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {['Lương cao', 'Phúc lợi hấp dẫn', 'Môi trường chuyên nghiệp'].map((tag) => (
                            <span
                                key={tag}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    fontSize: '13px',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.45)',
                                    borderRadius: '20px',
                                    padding: '4px 14px',
                                }}
                            >
                                <Check size={13} color="#4ade80" strokeWidth={3} />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══ SEARCH BAR — dưới banner, ngoài banner ══ */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            border: '1px solid #e5e7eb',
                            borderRadius: '5px',
                            overflow: 'hidden',
                            background: 'white',
                        }}
                    >
                        {/* Keyword */}
                        <div
                            style={{
                                flex: 2,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 14px',
                                gap: '8px',
                                borderRight: '1px solid #e5e7eb',
                            }}
                        >
                            <Search size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tên công việc, vị trí"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#212f3f',
                                    width: '100%',
                                    background: 'transparent',
                                    fontFamily: 'inherit',
                                    padding: '10px 0',
                                }}
                            />
                            {searchInput && (
                                <button
                                    onClick={() => {
                                        setSearchInput('');
                                        setSearch('');
                                    }}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9ca3af',
                                        padding: 0,
                                        display: 'flex',
                                    }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Industry */}
                        <div
                            style={{
                                width: '220px',
                                borderRight: '1px solid #e5e7eb',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <select
                                value={industryId}
                                onChange={(e) => setIndustryId(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '10px 32px 10px 14px',
                                    fontSize: '14px',
                                    color: industryId ? '#212f3f' : '#9ca3af',
                                    background: 'transparent',
                                    width: '100%',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {industryOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={14}
                                color="#9ca3af"
                                style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}
                            />
                        </div>

                        {/* Province */}
                        <div
                            style={{
                                width: '220px',
                                borderRight: '1px solid #e5e7eb',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <MapPin
                                size={14}
                                color="#9ca3af"
                                style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
                            />
                            <select
                                value={provinceCode}
                                onChange={(e) => setProvinceCode(e.target.value)}
                                style={{
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '10px 32px 10px 32px',
                                    fontSize: '14px',
                                    color: provinceCode ? '#212f3f' : '#9ca3af',
                                    background: 'transparent',
                                    width: '100%',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                {provinceOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                size={14}
                                color="#9ca3af"
                                style={{ position: 'absolute', right: '10px', pointerEvents: 'none' }}
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '10px 28px',
                                background: GREEN,
                                color: 'white',
                                border: 'none',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                fontFamily: 'inherit',
                                transition: 'background 0.15s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#009940')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
                        >
                            <Search size={16} />
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* ══ CONTENT ══ */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {/* ── Job list ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header */}
                        <div style={{ marginBottom: '14px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#212f3f', margin: '0 0 4px' }}>
                                Việc làm tốt nhất
                            </h2>
                            {!loading && (
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                    Tìm thấy <strong style={{ color: '#212f3f' }}>{meta.total.toLocaleString()}</strong>{' '}
                                    việc làm phù hợp với yêu cầu của bạn
                                </p>
                            )}
                        </div>

                        {/* Active filter tags */}
                        {(provinceCode || industryId) && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                {provinceCode && (
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            background: '#f0fdf4',
                                            border: '1px solid #86efac',
                                            fontSize: '12px',
                                            color: GREEN,
                                        }}
                                    >
                                        {provinceOptions.find((p) => p.value === provinceCode)?.label}
                                        <button
                                            onClick={() => setProvinceCode('')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: GREEN,
                                                padding: 0,
                                                display: 'flex',
                                            }}
                                        >
                                            <X size={11} />
                                        </button>
                                    </span>
                                )}
                                {industryId && (
                                    <span
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '3px 10px',
                                            borderRadius: '20px',
                                            background: '#f0fdf4',
                                            border: '1px solid #86efac',
                                            fontSize: '12px',
                                            color: GREEN,
                                        }}
                                    >
                                        {industryOptions.find((i) => i.value === industryId)?.label}
                                        <button
                                            onClick={() => setIndustryId('')}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: GREEN,
                                                padding: 0,
                                                display: 'flex',
                                            }}
                                        >
                                            <X size={11} />
                                        </button>
                                    </span>
                                )}
                            </div>
                        )}

                        {/* List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <JobCardSkeleton key={i} />)
                            ) : jobs.length > 0 ? (
                                jobs.map((job) => <JobCard key={job.id} job={job} />)
                            ) : (
                                <div
                                    style={{
                                        textAlign: 'center',
                                        padding: '80px 0',
                                        background: 'white',
                                        borderRadius: '5px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                >
                                    <Briefcase
                                        size={48}
                                        color="#d1d5db"
                                        style={{ margin: '0 auto 16px', display: 'block' }}
                                    />
                                    <p
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            margin: '0 0 6px',
                                        }}
                                    >
                                        Không tìm thấy việc làm phù hợp
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                                        Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                                    </p>
                                </div>
                            )}
                        </div>

                        <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />
                    </div>

                    {/* ── Sidebar — chỉ CV banner card, đúng như TopCV ── */}
                    <div className="sidebar" style={{ width: '300px', flexShrink: 0 }}>
                        <img
                            src={bannerRight.src || bannerRight}
                            alt="Tăng cơ hội ứng tuyển"
                            style={{ width: '100%', borderRadius: '8px', display: 'block' }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) { .sidebar { display: none !important; } }
                * { box-sizing: border-box; -ms-overflow-style: none; scrollbar-width: none; }
                *::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
