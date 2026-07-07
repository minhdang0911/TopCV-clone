'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Check,
    Bookmark,
    MapPin,
    Briefcase,
    X,
    Lightbulb,
    Filter,
} from 'lucide-react';
import { jobService } from '@/services/job.service';
import { savedJobsService } from '@/services/applications.service';
import { provinceService } from '@/services/province.service';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { toast } from 'sonner';
import SavedSearchButton from '@/components/SavedSearchButton';
import LoginModal from '@/components/LoginModal';

type Job = {
    id: string;
    title: string;
    slug: string;
    salaryMin: number;
    salaryMax: number;
    salaryType: string;
    districtName?: string;
    provinceName?: string;
    address?: string;
    isHot?: boolean;
    featured?: boolean;
    isPremium?: boolean;
    isTop?: boolean;
    isPro?: boolean;
    isOutstanding?: boolean;
    isNoBat?: boolean;
    createdAt: string;
    employer: { companyName: string; logoUrl?: string; slug?: string };
};

type Province = { code: string; name: string };
type District = { code: string; name: string };
type Industry = { id: string | number; name: string };
type SelectOption = { label: string; value: string };
type FilterOption = { label: string; value: string; code?: string; name?: string; min?: number; max?: number; salaryType?: string };
type JobParams = { page: number; limit: number; provinceCode?: string; districtCode?: string; salaryMin?: number; salaryMax?: number; salaryType?: string; experience?: string; industryId?: string };

const GREEN = '#00b14f';

const HCM_PROVINCE_CODE = '79';
const HCM_PROVINCE_NAME = 'Hồ Chí Minh';

/* ─── Constants ─── */
const SALARY_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Dưới 10 triệu', value: 'duoi-10', min: 0, max: 10000000 },
    { label: 'Từ 10-15 triệu', value: '10-15', min: 10000000, max: 15000000 },
    { label: 'Từ 15-20 triệu', value: '15-20', min: 15000000, max: 20000000 },
    { label: 'Từ 20-25 triệu', value: '20-25', min: 20000000, max: 25000000 },
    { label: 'Từ 25-30 triệu', value: '25-30', min: 25000000, max: 30000000 },
    { label: 'Từ 30-50 triệu', value: '30-50', min: 30000000, max: 50000000 },
    { label: 'Trên 50 triệu', value: 'tren-50', min: 50000000, max: undefined },
    { label: 'Thỏa thuận', value: 'thoa-thuan', salaryType: 'negotiable' },
];

const EXPERIENCE_OPTIONS = [
    { label: 'Tất cả', value: '' },
    { label: 'Chưa có kinh nghiệm', value: 'chua-co' },
    { label: '1 năm trở xuống', value: '1-nam-tro-xuong' },
    { label: '1 năm', value: '1-nam' },
    { label: '2 năm', value: '2-nam' },
    { label: '3 năm', value: '3-nam' },
    { label: 'Từ 4-5 năm', value: '4-5-nam' },
    { label: 'Trên 5 năm', value: 'tren-5-nam' },
];

const FILTER_TYPES = [
    { key: 'location', label: 'Địa điểm' },
    { key: 'salary', label: 'Mức lương' },
    { key: 'experience', label: 'Kinh nghiệm' },
    { key: 'industry', label: 'Ngành nghề' },
];

/* ─── Helpers ─── */
const formatSalary = (min: number, max: number, type: string) => {
    if (type === 'negotiable' || (!min && !max)) return 'Thỏa thuận';
    if (min && max) return `${min / 1000000} - ${max / 1000000} triệu`;
    if (min) return `Từ ${min / 1000000} triệu`;
    if (max) return `Đến ${max / 1000000} triệu`;
    return 'Thỏa thuận';
};

const isNew = (dateStr: string) => Date.now() - new Date(dateStr).getTime() < 7 * 86400000;

/* ─── JobCard ─── */
function JobCard({ job, saved, onToggleSave }: { job: Job; saved: boolean; onToggleSave: () => void }) {
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType);
    const location = job.districtName
        ? `${job.districtName}, ${job.provinceName || ''}`
        : job.provinceName || job.address || 'Toàn quốc';

    const isHot = job.isHot || job.featured;
    const isTop = job.isPremium || job.isTop;
    const isPro = job.isPro;
    const isOutstanding = job.isOutstanding || job.isNoBat;

    return (
        <div
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, border-color 0.18s',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,177,79,0.15)';
                e.currentTarget.style.borderColor = '#86efac';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
            }}
        >
            {isTop && (
                <div
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: '3px',
                        background: GREEN,
                    }}
                />
            )}

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                {/* Logo */}
                <div
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '8px',
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
                        <span style={{ fontSize: '20px', fontWeight: '700', color: GREEN }}>
                            {job.employer?.companyName?.[0] || 'C'}
                        </span>
                    )}
                </div>

                {/* Title + company */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px', flexWrap: 'wrap' }}>
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
                                }}
                            >
                                HOT
                            </span>
                        )}
                        {isTop && (
                            <span
                                style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: 'white',
                                    background: GREEN,
                                    borderRadius: '3px',
                                    padding: '1px 5px',
                                }}
                            >
                                TOP
                            </span>
                        )}
                        {isNew(job.createdAt) && !isHot && !isTop && (
                            <span
                                style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: 'white',
                                    background: GREEN,
                                    borderRadius: '3px',
                                    padding: '1px 5px',
                                }}
                            >
                                Mới
                            </span>
                        )}
                    </div>

                    <Link
                        href={`/viec-lam/${job.slug || job.id}`}
                        style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: '#111827',
                            textDecoration: 'none',
                            lineHeight: '1.4',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
                    >
                        {job.title}
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                        {isPro && (
                            <span
                                style={{
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    color: '#513101',
                                    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                                    borderRadius: '111px',
                                    padding: '1px 6px',
                                    flexShrink: 0,
                                }}
                            >
                                Pro
                            </span>
                        )}
                        <p
                            style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {job.employer?.companyName}
                        </p>
                    </div>
                </div>

                {/* Bookmark */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleSave();
                    }}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: saved ? GREEN : '#9ca3af',
                        padding: '2px',
                        flexShrink: 0,
                    }}
                >
                    <Bookmark size={18} fill={saved ? GREEN : 'none'} />
                </button>
            </div>

            {/* Salary + location */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span
                    style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: GREEN,
                        background: '#f0fdf4',
                        borderRadius: '4px',
                        padding: '3px 8px',
                    }}
                >
                    {salary}
                </span>
                <span
                    style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        background: '#f9fafb',
                        borderRadius: '4px',
                        padding: '3px 8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                    }}
                >
                    <MapPin size={11} />
                    {location}
                </span>
            </div>
        </div>
    );
}

type FilterBarProps = {
    filterType: string;
    setFilterType: (type: string) => void;
    filters: Filters;
    setFilters: (updater: ((f: Filters) => Filters) | Filters) => void;
    industries: Industry[];
    provinces: Province[];
    districts: District[];
    loadingDistricts: boolean;
};

/* ─── FilterBar ─── */
function FilterBar({
    filterType,
    setFilterType,
    filters,
    setFilters,
    industries,
    provinces,
    districts,
    loadingDistricts,
}: FilterBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const checkScroll = useCallback(() => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setCanScrollLeft(scrollLeft > 4);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        checkScroll();
        el.addEventListener('scroll', checkScroll, { passive: true });
        const ro = new ResizeObserver(checkScroll);
        ro.observe(el);
        return () => {
            el.removeEventListener('scroll', checkScroll);
            ro.disconnect();
        };
    }, [checkScroll, filterType, districts, provinces, industries]);

    const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });

    const options = (() => {
        if (filterType === 'location') {
            if (filters.provinceCode && districts.length > 0) {
                return [
                    { label: 'Tất cả', value: '__all_district__' },
                    ...districts.map((d: District) => ({
                        label: d.name,
                        value: String(d.code),
                        code: d.code,
                        name: d.name,
                    })),
                ];
            }
            return [
                { label: 'Tất cả', value: '__all_province__' },
                ...provinces.map((p: Province) => ({
                    label: p.name,
                    value: String(p.code),
                    code: p.code,
                    name: p.name,
                })),
            ];
        }
        if (filterType === 'salary') return SALARY_OPTIONS;
        if (filterType === 'experience') return EXPERIENCE_OPTIONS;
        if (filterType === 'industry')
            return [
                { label: 'Tất cả', value: '' },
                ...industries.map((i: Industry) => ({ label: i.name, value: String(i.id) })),
            ];
        return [];
    })();

    const activeValue = (() => {
        if (filterType === 'location') return filters.districtCode || filters.provinceCode || '__all_province__';
        if (filterType === 'salary') return filters.salary || '';
        if (filterType === 'experience') return filters.experience || '';
        if (filterType === 'industry') return filters.industryId || '';
        return '';
    })();

    const handleSelect = (opt: FilterOption) => {
        if (filterType === 'location') {
            if (opt.value === '__all_province__') {
                setFilters((f: Filters) => ({
                    ...f,
                    provinceCode: '',
                    provinceName: '',
                    districtCode: '',
                    districtName: '',
                }));
            } else if (opt.value === '__all_district__') {
                setFilters((f: Filters) => ({ ...f, districtCode: '', districtName: '' }));
            } else if (!filters.provinceCode) {
                setFilters((f: Filters) => ({
                    ...f,
                    provinceCode: String(opt.code),
                    provinceName: opt.name ?? '',
                    districtCode: '',
                    districtName: '',
                }));
            } else {
                setFilters((f: Filters) => ({ ...f, districtCode: String(opt.code), districtName: opt.name ?? '' }));
            }
        } else if (filterType === 'salary') {
            if (!opt.value) {
                setFilters((f: Filters) => ({
                    ...f,
                    salary: '',
                    salaryMin: undefined,
                    salaryMax: undefined,
                    salaryType: '',
                }));
            } else if (opt.salaryType) {
                setFilters((f: Filters) => ({
                    ...f,
                    salary: opt.value,
                    salaryMin: undefined,
                    salaryMax: undefined,
                    salaryType: opt.salaryType ?? '',
                }));
            } else {
                setFilters((f: Filters) => ({
                    ...f,
                    salary: opt.value,
                    salaryMin: opt.min,
                    salaryMax: opt.max,
                    salaryType: '',
                }));
            }
        } else if (filterType === 'experience') {
            setFilters((f: Filters) => ({ ...f, experience: opt.value }));
        } else if (filterType === 'industry') {
            setFilters((f: Filters) => ({ ...f, industryId: opt.value }));
        }
    };

    return (
        <div style={{ background: 'white', padding: '10px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Filter type — custom dropdown */}
                    <div ref={dropdownRef} style={{ position: 'relative', flexShrink: 0 }}>
                        {/* Trigger button */}
                        <button
                            onClick={() => setDropdownOpen((o: boolean) => !o)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                border: dropdownOpen ? `1px solid ${GREEN}` : '1px solid #e5e7eb',
                                borderRadius: '6px',
                                padding: '7px 10px 7px 12px',
                                background: 'white',
                                cursor: 'pointer',
                                minWidth: '170px',
                                outline: 'none',
                                transition: 'border-color 0.15s',
                            }}
                        >
                            <Filter size={13} color="#6b7280" />
                            <span style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap' }}>Lọc theo:</span>
                            <span
                                style={{
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#111827',
                                    flex: 1,
                                    textAlign: 'left',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {FILTER_TYPES.find((f) => f.key === filterType)?.label}
                            </span>
                            <ChevronDown
                                size={14}
                                color="#6b7280"
                                style={{
                                    transition: 'transform 0.2s',
                                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                    flexShrink: 0,
                                }}
                            />
                        </button>

                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    zIndex: 100,
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                                    minWidth: '170px',
                                    overflow: 'hidden',
                                    padding: '4px 0',
                                }}
                            >
                                {FILTER_TYPES.map((f) => {
                                    const isActive = filterType === f.key;
                                    return (
                                        <button
                                            key={f.key}
                                            onClick={() => {
                                                setFilterType(f.key);
                                                setDropdownOpen(false);
                                            }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                width: '100%',
                                                padding: '10px 14px',
                                                background: isActive ? '#f0fdf4' : 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: isActive ? '600' : '400',
                                                color: isActive ? GREEN : '#111827',
                                                textAlign: 'left',
                                                transition: 'background 0.12s',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) e.currentTarget.style.background = '#f9fafb';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) e.currentTarget.style.background = 'white';
                                            }}
                                        >
                                            {f.label}
                                            {isActive && <Check size={14} color={GREEN} style={{ flexShrink: 0 }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Scroll left */}
                    <button
                        onClick={() => scroll(-1)}
                        disabled={!canScrollLeft}
                        style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid #e5e7eb',
                            background: canScrollLeft ? 'white' : '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: canScrollLeft ? 'pointer' : 'default',
                            flexShrink: 0,
                            color: canScrollLeft ? '#374151' : '#d1d5db',
                            transition: 'all 0.15s',
                        }}
                    >
                        <ChevronLeft size={15} />
                    </button>

                    {/* Pills */}
                    <div
                        ref={scrollRef}
                        style={{
                            display: 'flex',
                            gap: '8px',
                            overflowX: 'auto',
                            scrollbarWidth: 'none',
                            flex: 1,
                            alignItems: 'center',
                            padding: '2px 0',
                        }}
                    >
                        {loadingDistricts ? (
                            <span style={{ fontSize: '13px', color: '#9ca3af', padding: '6px 14px' }}>Đang tải...</span>
                        ) : (
                            options.map((opt) => {
                                const isActive = activeValue === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleSelect(opt)}
                                        style={{
                                            flexShrink: 0,
                                            padding: '6px 16px',
                                            borderRadius: '20px',
                                            border: isActive ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb',
                                            background: isActive ? GREEN : 'white',
                                            color: isActive ? 'white' : '#374151',
                                            fontSize: '13px',
                                            fontWeight: isActive ? '600' : '400',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.15s',
                                            lineHeight: '1.5',
                                        }}
                                    >
                                        {opt.label}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Scroll right */}
                    <button
                        onClick={() => scroll(1)}
                        disabled={!canScrollRight}
                        style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid #e5e7eb',
                            background: canScrollRight ? GREEN : '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: canScrollRight ? 'pointer' : 'default',
                            flexShrink: 0,
                            color: canScrollRight ? 'white' : '#d1d5db',
                            transition: 'all 0.15s',
                        }}
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>

                {/* Active filter tags */}
                {(filters.provinceName || filters.salary || filters.experience || filters.industryId) && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {filters.provinceName && (
                            <ActiveTag
                                label={
                                    filters.districtName
                                        ? `${filters.districtName}, ${filters.provinceName}`
                                        : filters.provinceName
                                }
                                onRemove={() =>
                                    setFilters((f: Filters) => ({
                                        ...f,
                                        provinceCode: '',
                                        provinceName: '',
                                        districtCode: '',
                                        districtName: '',
                                    }))
                                }
                            />
                        )}
                        {filters.salary && (
                            <ActiveTag
                                label={SALARY_OPTIONS.find((s) => s.value === filters.salary)?.label}
                                onRemove={() =>
                                    setFilters((f: Filters) => ({
                                        ...f,
                                        salary: '',
                                        salaryMin: undefined,
                                        salaryMax: undefined,
                                        salaryType: '',
                                    }))
                                }
                            />
                        )}
                        {filters.experience && (
                            <ActiveTag
                                label={EXPERIENCE_OPTIONS.find((e) => e.value === filters.experience)?.label}
                                onRemove={() => setFilters((f: Filters) => ({ ...f, experience: '' }))}
                            />
                        )}
                        {filters.industryId && (
                            <ActiveTag
                                label={industries.find((i: Industry) => String(i.id) === filters.industryId)?.name}
                                onRemove={() => setFilters((f: Filters) => ({ ...f, industryId: '' }))}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ActiveTag({ label, onRemove }: { label?: string; onRemove: () => void }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                borderRadius: '20px',
                background: '#f0fdf4',
                border: `1px solid #86efac`,
                fontSize: '12px',
                color: GREEN,
                fontWeight: '500',
            }}
        >
            {label}
            <button
                onClick={onRemove}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: GREEN,
                    padding: 0,
                    display: 'flex',
                }}
            >
                <X size={12} />
            </button>
        </span>
    );
}

/* ─── Pagination ─── */
function Pagination({
    page,
    totalPages,
    onChange,
}: {
    page: number;
    totalPages: number;
    onChange: (p: number) => void;
}) {
    if (totalPages <= 1) return null;
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                margin: '28px 0',
            }}
        >
            <button
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid #e5e7eb',
                    background: page === 1 ? '#f9fafb' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: page === 1 ? 'default' : 'pointer',
                    color: page === 1 ? '#d1d5db' : '#374151',
                }}
            >
                <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500', padding: '0 8px' }}>
                <strong style={{ color: '#111827' }}>{page}</strong>
                <span style={{ color: '#9ca3af' }}> / {totalPages} trang</span>
            </span>
            <button
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid #e5e7eb',
                    background: page === totalPages ? '#f9fafb' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: page === totalPages ? 'default' : 'pointer',
                    color: page === totalPages ? '#d1d5db' : '#374151',
                }}
            >
                <ChevronRight size={16} />
            </button>
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
                borderRadius: '8px',
                padding: '16px',
            }}
        >
            <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <div
                    style={{ width: '52px', height: '52px', borderRadius: '8px', background: '#f3f4f6', flexShrink: 0 }}
                />
                <div style={{ flex: 1 }}>
                    <div
                        style={{
                            height: '14px',
                            background: '#f3f4f6',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            width: '75%',
                        }}
                    />
                    <div style={{ height: '12px', background: '#f3f4f6', borderRadius: '4px', width: '45%' }} />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ height: '26px', background: '#f3f4f6', borderRadius: '4px', width: '95px' }} />
                <div style={{ height: '26px', background: '#f3f4f6', borderRadius: '4px', width: '115px' }} />
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════
   Props
══════════════════════════════════════════ */
interface BestJobsSectionProps {
    /** Hiển thị sticky filter bar (dùng ở trang /viec-lam) */
    stickyFilter?: boolean;
    /** Hiển thị pagination (dùng ở trang /viec-lam, ẩn ở trang chủ) */
    showPagination?: boolean;
    /** Số job mỗi trang (trang chủ có thể set ít hơn) */
    limit?: number;
}

type Filters = {
    provinceCode: string;
    provinceName: string;
    districtCode: string;
    districtName: string;
    salary: string;
    salaryMin: number | undefined;
    salaryMax: number | undefined;
    salaryType: string;
    experience: string;
    industryId: string;
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
export default function BestJobsSection({
    stickyFilter = false,
    showPagination = true,
    limit = 12,
}: BestJobsSectionProps) {
    const searchParams = useSearchParams();
    const initialIndustryId = searchParams.get('industryId') || '';

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
    const [page, setPage] = useState(1);
    const [showTip, setShowTip] = useState(true);
    const [filterType, setFilterType] = useState(initialIndustryId ? 'industry' : 'location');

    const [filters, setFilters] = useState({
        provinceCode: initialIndustryId ? '' : HCM_PROVINCE_CODE,
        provinceName: initialIndustryId ? '' : HCM_PROVINCE_NAME,
        districtCode: '',
        districtName: '',
        salary: '',
        salaryMin: undefined as number | undefined,
        salaryMax: undefined as number | undefined,
        salaryType: '',
        experience: '',
        industryId: initialIndustryId,
    });

    const { isAuthenticated } = useAuthStore();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    // Separate from savedJobIds so we can derive an empty set when logged out
    // without calling setState inside an effect.
    const [loadedSavedIds, setLoadedSavedIds] = useState<Set<string>>(new Set());
    const savedJobIds = isAuthenticated ? loadedSavedIds : (new Set<string>());

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [industries, setIndustries] = useState<Industry[]>([]);

    /* Load saved job IDs */
    useEffect(() => {
        if (!isAuthenticated) return;
        savedJobsService.getMy({ limit: 200 })
            .then((res: { data?: { data?: Array<{ jobId: string }> } }) => {
                setLoadedSavedIds(new Set((res.data?.data || []).map(i => i.jobId)));
            })
            .catch(() => {});
    }, [isAuthenticated]);

    async function handleToggleSave(jobId: string) {
        if (!isAuthenticated) {
            setLoginModalOpen(true);
            return;
        }
        const willSave = !loadedSavedIds.has(jobId);
        setLoadedSavedIds(prev => {
            const next = new Set(prev);
            if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
            return next;
        });
        toast.success(willSave ? 'Đã lưu việc làm' : 'Đã bỏ lưu');
        try { await savedJobsService.toggle(jobId); } catch {
            setLoadedSavedIds(prev => {
                const next = new Set(prev);
                if (next.has(jobId)) next.delete(jobId); else next.add(jobId);
                return next;
            });
            toast.error('Có lỗi xảy ra');
        }
    }

    /* Load provinces + industries */
    useEffect(() => {
        provinceService.getAll().then(setProvinces).catch(console.error);
        api.get('/industries?limit=100')
            .then((r) => setIndustries(r.data.data || []))
            .catch(console.error);
    }, []);

    /* Load districts khi đổi tỉnh */
    useEffect(() => {
        if (!filters.provinceCode) {
            const t = setTimeout(() => setDistricts([]), 0);
            return () => clearTimeout(t);
        }
        const t2 = setTimeout(() => {
            setLoadingDistricts(true);
            provinceService
                .getDistricts(filters.provinceCode)
                .then((data: { districts?: District[] } | District[]) => setDistricts(Array.isArray(data) ? data : (data as { districts?: District[] }).districts || []))
                .catch(console.error)
                .finally(() => setLoadingDistricts(false));
        }, 0);
        return () => clearTimeout(t2);
    }, [filters.provinceCode]);

    /* Fetch jobs */
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const params: JobParams = { page, limit };
            if (filters.provinceCode) params.provinceCode = filters.provinceCode;
            if (filters.districtCode) params.districtCode = filters.districtCode;
            if (filters.salaryMin !== undefined) params.salaryMin = filters.salaryMin;
            if (filters.salaryMax !== undefined) params.salaryMax = filters.salaryMax;
            if (filters.salaryType) params.salaryType = filters.salaryType;
            if (filters.experience) params.experience = filters.experience;
            if (filters.industryId) params.industryId = filters.industryId;

            const res = await jobService.getAll(params);
            setJobs(res.data.data || []);
            setMeta(res.data.meta || { total: 0, totalPages: 1, page: 1 });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [page, filters, limit]);

    useEffect(() => {
        const t = setTimeout(() => fetchJobs(), 0);
        return () => clearTimeout(t);
    }, [fetchJobs]);

    /* Reset page khi đổi filter */
    useEffect(() => {
        const t = setTimeout(() => setPage(1), 0);
        return () => clearTimeout(t);
    }, [filters]);

    const filterBar = (
        <FilterBar
            filterType={filterType}
            setFilterType={setFilterType}
            filters={filters}
            setFilters={setFilters}
            industries={industries}
            provinces={provinces}
            districts={districts}
            loadingDistricts={loadingDistricts}
        />
    );

    return (
        <>
            <LoginModal
                open={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                message="Đăng nhập để lưu việc làm yêu thích"
            />
            {/* Filter bar — sticky hoặc inline tuỳ prop */}
            {stickyFilter ? (
                <div
                    style={{
                        background: 'white',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                        position: 'sticky',
                        top: '72px',
                        zIndex: 50,
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    {filterBar}
                </div>
            ) : (
                <div
                    style={{
                        background: 'white',
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    {filterBar}
                </div>
            )}

            {/* Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 16px' }}>
                {/* Tip */}
                {showTip && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            marginBottom: '16px',
                            fontSize: '13px',
                            color: '#92400e',
                        }}
                    >
                        <Lightbulb size={16} color="#d97706" style={{ flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>
                            <strong>Gợi ý:</strong> Di chuột vào tiêu đề việc làm để xem thêm thông tin chi tiết
                        </span>
                        <button
                            onClick={() => setShowTip(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                padding: 0,
                                display: 'flex',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Section header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: GREEN, margin: 0 }}>
                            Việc làm tốt nhất
                        </h2>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                padding: '4px 10px',
                            }}
                        >
                            <span style={{ fontSize: '10px', color: '#6b7280' }}>Đề xuất bởi</span>
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    background: 'linear-gradient(135deg, #00b14f, #007a35)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                ToppyAI
                            </span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {!loading && (
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                Tìm thấy <strong style={{ color: '#111827' }}>{meta.total.toLocaleString()}</strong>{' '}
                                việc làm
                            </span>
                        )}
                        {stickyFilter && (
                            <SavedSearchButton
                                currentFilters={{
                                    provinceCode: filters.provinceCode || undefined,
                                    districtCode: filters.districtCode || undefined,
                                    salary: filters.salary || undefined,
                                    experience: filters.experience || undefined,
                                    industryId: filters.industryId || undefined,
                                }}
                                label={
                                    [filters.provinceName, filters.salary, filters.experience]
                                        .filter(Boolean).join(' · ') || undefined
                                }
                                onApply={(saved: any) => {
                                    setFilters(f => ({
                                        ...f,
                                        provinceCode: saved.provinceCode ?? '',
                                        districtCode: saved.districtCode ?? '',
                                        salary: saved.salary ?? '',
                                        salaryMin: undefined,
                                        salaryMax: undefined,
                                        salaryType: '',
                                        experience: saved.experience ?? '',
                                        industryId: saved.industryId ?? '',
                                    }));
                                    setPage(1);
                                }}
                            />
                        )}
                        <Link
                            href="/viec-lam-tot-nhat"
                            style={{
                                fontSize: '13px',
                                color: GREEN,
                                textDecoration: 'none',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2px',
                            }}
                        >
                            Xem tất cả <ChevronRight size={15} />
                        </Link>
                    </div>
                </div>

                {/* Job grid */}
                <div
                    className="job-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                    }}
                >
                    {loading ? (
                        Array.from({ length: limit }).map((_, i) => <JobCardSkeleton key={i} />)
                    ) : jobs.length > 0 ? (
                        jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                saved={savedJobIds.has(job.id)}
                                onToggleSave={() => handleToggleSave(job.id)}
                            />
                        ))
                    ) : (
                        <div
                            style={{
                                gridColumn: '1 / -1',
                                textAlign: 'center',
                                padding: '60px 0',
                                color: '#6b7280',
                            }}
                        >
                            <Briefcase size={52} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                            <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 4px' }}>
                                Không tìm thấy việc làm phù hợp
                            </p>
                            <p style={{ fontSize: '14px', margin: 0 }}>
                                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination — chỉ hiện nếu prop showPagination=true */}
                {showPagination && <Pagination page={page} totalPages={meta.totalPages} onChange={setPage} />}
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .job-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .job-grid { grid-template-columns: 1fr !important; }
                }
                *::-webkit-scrollbar { display: none; }
                * { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </>
    );
}
