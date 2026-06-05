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
} from 'lucide-react';
import { jobService } from '@/services/job.service';
import { provinceService } from '@/services/province.service';
import api from '@/lib/axios';

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

/* ─── SearchableDropdown ─── */
function SearchableDropdown({ value, onChange, options, placeholder, icon: Icon }) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

    const selected = options.find((o) => o.value === value);

    return (
        <div ref={ref} style={{ position: 'relative', flex: 1 }}>
            <button
                onClick={() => {
                    setOpen(!open);
                    setSearch('');
                }}
                style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: selected?.value ? '#111827' : '#9ca3af',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    {Icon && <Icon size={16} color="#9ca3af" style={{ flexShrink: 0 }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selected?.label || placeholder}
                    </span>
                </div>
                <ChevronDown
                    size={16}
                    color="#9ca3af"
                    style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                />
            </button>

            {open && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        zIndex: 100,
                        maxHeight: '280px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: '#f9fafb',
                                borderRadius: '6px',
                                padding: '6px 10px',
                            }}
                        >
                            <Search size={14} color="#9ca3af" />
                            <input
                                autoFocus
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm kiếm..."
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    outline: 'none',
                                    fontSize: '13px',
                                    flex: 1,
                                    color: '#111827',
                                }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#9ca3af',
                                        padding: 0,
                                        display: 'flex',
                                    }}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {filtered.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    padding: '9px 14px',
                                    border: 'none',
                                    background: opt.value === value ? '#f0fdf4' : 'white',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    color: opt.value === value ? GREEN : '#374151',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '8px',
                                }}
                                onMouseEnter={(e) => {
                                    if (opt.value !== value) e.currentTarget.style.background = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    if (opt.value !== value) e.currentTarget.style.background = 'white';
                                }}
                            >
                                {opt.label}
                                {opt.value === value && <Check size={14} color={GREEN} />}
                            </button>
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                                Không tìm thấy
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── JobCard — list layout ngang giống TopCV ─── */
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

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
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
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,177,79,0.12)';
                e.currentTarget.style.borderColor = '#86efac';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
            }}
        >
            {/* Logo */}
            <div
                style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
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
                                fontSize: '10px',
                                fontWeight: '700',
                                color: '#f97316',
                                background: '#fff7ed',
                                border: '1px solid #fdba74',
                                borderRadius: '3px',
                                padding: '1px 5px',
                                flexShrink: 0,
                            }}
                        >
                            NỔI BẬT
                        </span>
                    )}
                    {isHot && (
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: 'white',
                                background: '#ef4444',
                                borderRadius: '3px',
                                padding: '1px 5px',
                                flexShrink: 0,
                            }}
                        >
                            HOT
                        </span>
                    )}
                    {isNew(job.createdAt) && !isHot && (
                        <span
                            style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                color: 'white',
                                background: GREEN,
                                borderRadius: '3px',
                                padding: '1px 5px',
                                flexShrink: 0,
                            }}
                        >
                            Mới
                        </span>
                    )}
                    <Link
                        href={`/viec-lam/${job.id}`}
                        style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#111827',
                            textDecoration: 'none',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
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
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span
                        style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                        }}
                    >
                        <MapPin size={12} color="#9ca3af" /> {location}
                    </span>
                    {remaining !== null && (
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                            · Còn <strong style={{ color: remaining <= 3 ? '#ef4444' : '#374151' }}>{remaining}</strong>{' '}
                            ngày để ứng tuyển
                        </span>
                    )}
                    <span
                        style={{
                            fontSize: '12px',
                            color: '#9ca3af',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                        }}
                    >
                        <Clock size={11} /> Cập nhật {updated}
                    </span>
                </div>
            </div>

            {/* Right side — salary + actions */}
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
                            padding: '8px 18px',
                            borderRadius: '6px',
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
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
            }}
        >
            <div
                style={{ width: '64px', height: '64px', borderRadius: '10px', background: '#f3f4f6', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
                <div
                    style={{
                        height: '15px',
                        background: '#f3f4f6',
                        borderRadius: '4px',
                        width: '60%',
                        marginBottom: '8px',
                    }}
                />
                <div
                    style={{
                        height: '13px',
                        background: '#f3f4f6',
                        borderRadius: '4px',
                        width: '35%',
                        marginBottom: '10px',
                    }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '100px' }} />
                    <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '130px' }} />
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                <div style={{ height: '14px', background: '#f3f4f6', borderRadius: '4px', width: '80px' }} />
                <div style={{ height: '34px', background: '#f3f4f6', borderRadius: '6px', width: '90px' }} />
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
            key={content}
            onClick={onClick}
            disabled={disabled}
            style={{
                minWidth: '36px',
                height: '36px',
                borderRadius: '6px',
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
                    {start > 2 && <span style={{ color: '#9ca3af', padding: '0 4px' }}>…</span>}
                </>
            )}
            {pages.map((p) => btn(p, () => onChange(p), p === page))}
            {end < totalPages && (
                <>
                    {end < totalPages - 1 && <span style={{ color: '#9ca3af', padding: '0 4px' }}>…</span>}
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

    /* Load provinces + industries */
    useEffect(() => {
        provinceService
            .getAll()
            .then((data) => setProvinces(data || []))
            .catch(console.error);
        api.get('/industries?limit=100')
            .then((r) => setIndustries(r.data.data || []))
            .catch(console.error);
    }, []);

    /* Fetch jobs */
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

    /* Options */
    const provinceOptions = [
        { label: 'Tất cả tỉnh/thành phố', value: '' },
        ...provinces.map((p) => ({ label: p.name, value: String(p.code) })),
    ];
    const industryOptions = [
        { label: 'Tất cả lĩnh vực', value: '' },
        ...industries.map((i) => ({ label: i.name, value: String(i.id) })),
    ];

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            {/* ── Hero banner ── */}
            <div
                style={{
                    background: 'linear-gradient(135deg, #00b14f 0%, #007a35 100%)',
                    padding: '28px 16px 32px',
                }}
            >
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', margin: '0 0 6px' }}>
                        Việc làm tốt nhất
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px' }}>
                        Tìm kiếm công việc mơ ước từ những cơ hội việc làm tốt nhất trên TopCV
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        {['✓ Lương cao', '✓ Phúc lợi hấp dẫn', '✓ Môi trường chuyên nghiệp'].map((t) => (
                            <span
                                key={t}
                                style={{
                                    fontSize: '12px',
                                    color: 'white',
                                    background: 'rgba(255,255,255,0.2)',
                                    borderRadius: '20px',
                                    padding: '4px 12px',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </div>

                    {/* Search bar */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '10px',
                            padding: '8px',
                            display: 'flex',
                            gap: '8px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Keyword */}
                        <div
                            style={{
                                flex: 2,
                                minWidth: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '0 8px',
                                borderRight: '1px solid #e5e7eb',
                            }}
                        >
                            <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Tên công việc, vị trí"
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: '#111827',
                                    width: '100%',
                                    background: 'transparent',
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

                        {/* Industry dropdown */}
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <SearchableDropdown
                                value={industryId}
                                onChange={setIndustryId}
                                options={industryOptions}
                                placeholder="Tất cả lĩnh vực"
                            />
                        </div>

                        {/* Province dropdown */}
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <SearchableDropdown
                                value={provinceCode}
                                onChange={setProvinceCode}
                                options={provinceOptions}
                                placeholder="Tất cả tỉnh/thành phố"
                                icon={MapPin}
                            />
                        </div>

                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '10px 28px',
                                background: GREEN,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#009940')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = GREEN)}
                        >
                            Tìm kiếm
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main layout ── */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {/* ── Job list ── */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px',
                            }}
                        >
                            <div>
                                <h2
                                    style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 2px' }}
                                >
                                    Việc làm tốt nhất
                                </h2>
                                {!loading && (
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                        Tìm thấy{' '}
                                        <strong style={{ color: '#111827' }}>{meta.total.toLocaleString()}</strong> việc
                                        làm phù hợp với yêu cầu của bạn
                                    </p>
                                )}
                            </div>
                            {/* Active filters */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
                        </div>

                        {/* Job list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                >
                                    <Briefcase
                                        size={52}
                                        color="#d1d5db"
                                        style={{ margin: '0 auto 16px', display: 'block' }}
                                    />
                                    <p
                                        style={{
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            margin: '0 0 4px',
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

                    {/* ── Sidebar ── */}
                    <div
                        style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}
                        className="sidebar"
                    >
                        {/* Banner placeholder */}
                        <div
                            style={{
                                background: 'linear-gradient(135deg, #00b14f, #007a35)',
                                borderRadius: '10px',
                                padding: '24px 20px',
                                color: 'white',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🚀</div>
                            <p style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 6px' }}>
                                Tăng cơ hội ứng tuyển
                            </p>
                            <p style={{ fontSize: '12px', opacity: 0.85, margin: '0 0 14px' }}>
                                Tạo CV chuyên nghiệp với TopCV để nổi bật hơn
                            </p>
                            <Link
                                href="/tao-cv"
                                style={{
                                    display: 'inline-block',
                                    padding: '8px 20px',
                                    background: 'white',
                                    color: GREEN,
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                }}
                            >
                                Tạo CV ngay →
                            </Link>
                        </div>

                        {/* Lĩnh vực nổi bật */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '10px',
                                border: '1px solid #e5e7eb',
                                padding: '16px',
                            }}
                        >
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 12px' }}>
                                Lĩnh vực nổi bật
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                {industries.slice(0, 8).map((ind) => (
                                    <button
                                        key={ind.id}
                                        onClick={() =>
                                            setIndustryId(String(ind.id) === industryId ? '' : String(ind.id))
                                        }
                                        style={{
                                            textAlign: 'left',
                                            padding: '7px 10px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            background: String(ind.id) === industryId ? '#f0fdf4' : 'transparent',
                                            color: String(ind.id) === industryId ? GREEN : '#374151',
                                            fontWeight: String(ind.id) === industryId ? '600' : '400',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (String(ind.id) !== industryId)
                                                e.currentTarget.style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (String(ind.id) !== industryId)
                                                e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        {ind.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) {
                    .sidebar { display: none !important; }
                }
                *::-webkit-scrollbar { display: none; }
                * { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
