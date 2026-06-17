'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, MapPin, X, ChevronDown, Banknote } from 'lucide-react';

const GREEN = '#00b14f';

const POPULAR_PROVINCES = [
    { code: '79', name: 'Hồ Chí Minh' },
    { code: '01', name: 'Hà Nội' },
    { code: '48', name: 'Đà Nẵng' },
    { code: '74', name: 'Bình Dương' },
    { code: '75', name: 'Đồng Nai' },
    { code: '92', name: 'Cần Thơ' },
    { code: '31', name: 'Hải Phòng' },
    { code: '46', name: 'Thừa Thiên Huế' },
    { code: '52', name: 'Khánh Hòa' },
    { code: '77', name: 'Bà Rịa - Vũng Tàu' },
    { code: '89', name: 'An Giang' },
    { code: '56', name: 'Bình Thuận' },
];

// Quick categories với icon SVG như TopCV
const QUICK_CATEGORIES = [
    {
        label: 'Việc không yêu cầu bằng cấp',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        ),
    },
    {
        label: 'Việc thực tập sinh',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
        ),
    },
    {
        label: 'Việc part-time, thời vụ',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        label: 'Bán hàng/Kinh doanh',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
    },
    {
        label: 'Hành chính/Văn phòng',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        ),
    },
    {
        label: 'IT-Công nghệ thông tin',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
            </svg>
        ),
    },
    {
        label: 'Marketing sáng tạo',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
        ),
    },
    {
        label: 'Kế toán/Kiểm toán',
        icon: (
            <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
    },
];

const SALARY_RANGES = [
    { label: 'Tất cả mức lương', min: null, max: null, type: null },
    { label: 'Dưới 3 triệu', min: null, max: 3, type: null },
    { label: '3 - 5 triệu', min: 3, max: 5, type: null },
    { label: '5 - 7 triệu', min: 5, max: 7, type: null },
    { label: '7 - 10 triệu', min: 7, max: 10, type: null },
    { label: '10 - 15 triệu', min: 10, max: 15, type: null },
    { label: '15 - 20 triệu', min: 15, max: 20, type: null },
    { label: '20 - 30 triệu', min: 20, max: 30, type: null },
    { label: 'Trên 30 triệu', min: 30, max: null, type: null },
    { label: 'Thỏa thuận', min: null, max: null, type: 'negotiable' },
];

interface JobSearchProps {
    totalJobs?: number;
    provinceName?: string;
}

export default function JobSearch({ totalJobs, provinceName }: JobSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [keyword, setKeyword] = useState(searchParams.get('search') || '');
    const [province, setProvince] = useState({
        code: searchParams.get('provinceCode') || '',
        name: searchParams.get('provinceName') || provinceName || '',
    });
    const [showProvinces, setShowProvinces] = useState(false);
    const [showSalary, setShowSalary] = useState(false);
    const [salaryIdx, setSalaryIdx] = useState(() => {
        const min = searchParams.get('salaryMin');
        const max = searchParams.get('salaryMax');
        const type = searchParams.get('salaryType');
        if (!min && !max && !type) return 0;
        return SALARY_RANGES.findIndex(
            r => String(r.min ?? '') === (min ?? '') && String(r.max ?? '') === (max ?? '') && (r.type ?? '') === (type ?? '')
        ) || 0;
    });
    const provinceRef = useRef<HTMLDivElement>(null);
    const salaryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (provinceRef.current && !provinceRef.current.contains(e.target as Node)) setShowProvinces(false);
            if (salaryRef.current && !salaryRef.current.contains(e.target as Node)) setShowSalary(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const applySalaryParams = (params: URLSearchParams, idx: number) => {
        const r = SALARY_RANGES[idx];
        if (r.min != null) params.set('salaryMin', String(r.min)); else params.delete('salaryMin');
        if (r.max != null) params.set('salaryMax', String(r.max)); else params.delete('salaryMax');
        if (r.type) params.set('salaryType', r.type); else params.delete('salaryType');
    };

    const handleSearch = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        if (keyword.trim()) params.set('search', keyword.trim());
        else params.delete('search');
        if (province.code) {
            params.set('provinceCode', province.code);
            params.set('provinceName', province.name);
        } else {
            params.delete('provinceCode');
            params.delete('provinceName');
        }
        applySalaryParams(params, salaryIdx);
        router.push(`${pathname}?${params.toString()}`);
    };

    const selectSalary = (idx: number) => {
        setSalaryIdx(idx);
        setShowSalary(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        applySalaryParams(params, idx);
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const selectProvince = (p: { code: string; name: string }) => {
        setProvince(p);
        setShowProvinces(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1');
        if (p.code) {
            params.set('provinceCode', p.code);
            params.set('provinceName', p.name);
        } else {
            params.delete('provinceCode');
            params.delete('provinceName');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const clearProvince = (e: React.MouseEvent) => {
        e.stopPropagation();
        setProvince({ code: '', name: '' });
        const params = new URLSearchParams(searchParams.toString());
        params.delete('provinceCode');
        params.delete('provinceName');
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div>
            {/* Search bar */}
            <div
                style={{
                    display: 'flex',
                    background: 'white',
                    borderRadius: '10px',
                    border: '2px solid #e5e7eb',
                    overflow: 'visible',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'border-color 0.2s',
                }}
                onFocusCapture={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = GREEN)}
                onBlurCapture={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = '#e5e7eb')}
            >
                {/* Keyword input */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: '10px' }}>
                    <Search size={17} color="#9ca3af" />
                    <input
                        type="text"
                        placeholder="Vị trí tuyển dụng, tên công ty..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            fontSize: '14px',
                            color: '#111827',
                            background: 'transparent',
                            padding: '13px 0',
                        }}
                    />
                    {keyword && (
                        <button
                            onClick={() => setKeyword('')}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                padding: '2px',
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', background: '#e5e7eb', margin: '10px 0' }} />

                {/* Province selector */}
                <div ref={provinceRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowProvinces(!showProvinces)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '0 16px',
                            height: '100%',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: province.name ? '#111827' : '#9ca3af',
                            whiteSpace: 'nowrap',
                            minWidth: '155px',
                        }}
                    >
                        <MapPin size={15} color={province.code ? GREEN : '#9ca3af'} />
                        <span style={{ flex: 1, textAlign: 'left' }}>{province.name || 'Tất cả tỉnh/thành'}</span>
                        {province.code ? (
                            <span onClick={clearProvince}>
                                <X size={13} color="#9ca3af" />
                            </span>
                        ) : (
                            <ChevronDown size={13} color="#9ca3af" />
                        )}
                    </button>

                    {showProvinces && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                zIndex: 300,
                                minWidth: '200px',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ padding: '6px' }}>
                                <button
                                    onClick={() => selectProvince({ code: '', name: '' })}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '7px 10px',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: !province.code ? '#f0fdf4' : 'none',
                                        color: !province.code ? GREEN : '#374151',
                                        fontSize: '13px',
                                        fontWeight: !province.code ? '600' : '400',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Tất cả tỉnh/thành
                                </button>
                                {POPULAR_PROVINCES.map((p) => (
                                    <button
                                        key={p.code}
                                        onClick={() => selectProvince(p)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '7px 10px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: province.code === p.code ? '#f0fdf4' : 'none',
                                            color: province.code === p.code ? GREEN : '#374151',
                                            fontSize: '13px',
                                            fontWeight: province.code === p.code ? '600' : '400',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (province.code !== p.code)
                                                (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (province.code !== p.code)
                                                (e.currentTarget as HTMLButtonElement).style.background = 'none';
                                        }}
                                    >
                                        {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', background: '#e5e7eb', margin: '10px 0' }} />

                {/* Salary selector */}
                <div ref={salaryRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowSalary(!showSalary)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '7px',
                            padding: '0 16px',
                            height: '100%',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: salaryIdx > 0 ? '#111827' : '#9ca3af',
                            whiteSpace: 'nowrap',
                            minWidth: '160px',
                        }}
                    >
                        <Banknote size={15} color={salaryIdx > 0 ? GREEN : '#9ca3af'} />
                        <span style={{ flex: 1, textAlign: 'left' }}>{SALARY_RANGES[salaryIdx].label}</span>
                        {salaryIdx > 0 ? (
                            <span onClick={(e) => { e.stopPropagation(); selectSalary(0); }}>
                                <X size={13} color="#9ca3af" />
                            </span>
                        ) : (
                            <ChevronDown size={13} color="#9ca3af" />
                        )}
                    </button>

                    {showSalary && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                zIndex: 300,
                                minWidth: '190px',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ padding: '6px' }}>
                                {SALARY_RANGES.map((r, i) => (
                                    <button
                                        key={i}
                                        onClick={() => selectSalary(i)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '7px 10px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: salaryIdx === i ? '#f0fdf4' : 'none',
                                            color: salaryIdx === i ? GREEN : '#374151',
                                            fontSize: '13px',
                                            fontWeight: salaryIdx === i ? '600' : '400',
                                            cursor: 'pointer',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (salaryIdx !== i) (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (salaryIdx !== i) (e.currentTarget as HTMLButtonElement).style.background = 'none';
                                        }}
                                    >
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Search button */}
                <button
                    onClick={handleSearch}
                    style={{
                        background: GREEN,
                        color: 'white',
                        border: 'none',
                        padding: '0 26px',
                        fontSize: '15px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        borderRadius: '0 8px 8px 0',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#009940')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = GREEN)}
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Stats */}
            {totalJobs !== undefined && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#6b7280' }}>
                    Tuyển dụng <strong style={{ color: GREEN }}>{totalJobs.toLocaleString('vi-VN')} việc làm</strong>
                    {province.name ? ` tại ${province.name}` : ''} [Update {new Date().toLocaleDateString('vi-VN')}]
                </div>
            )}

            {/* Quick category chips — icon + text như TopCV */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {QUICK_CATEGORIES.map((cat) => {
                    const active = keyword === cat.label;
                    return (
                        <button
                            key={cat.label}
                            onClick={() => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set('search', cat.label);
                                params.set('page', '1');
                                setKeyword(cat.label);
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: `1px solid ${active ? GREEN : '#e5e7eb'}`,
                                background: active ? '#f0fdf4' : 'white',
                                color: active ? GREEN : '#374151',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = GREEN;
                                    (e.currentTarget as HTMLButtonElement).style.color = GREEN;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                                    (e.currentTarget as HTMLButtonElement).style.color = '#374151';
                                }
                            }}
                        >
                            <span style={{ color: active ? GREEN : '#9ca3af', display: 'flex' }}>{cat.icon}</span>
                            {cat.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
