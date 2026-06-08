'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, Check } from 'lucide-react';

const GREEN = '#00b14f';

const SEARCH_BY_OPTIONS = [
    { label: 'Tên việc làm', value: 'title' },
    { label: 'Tên công ty', value: 'company' },
    { label: 'Cả hai', value: 'both' },
];

const SORT_OPTIONS = [
    { label: 'Mới nhất', value: 'newest' },
    { label: 'Ngày cập nhật', value: 'updated' },
    { label: 'Lương cao đến thấp', value: 'salary' },
    { label: 'Cần tuyển gấp', value: 'urgent' },
];

export default function SortBar({ total, search }: { total: number; search?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentSort = searchParams.get('sort') || 'newest';
    const currentSearchBy = searchParams.get('searchBy') || 'title';

    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const setParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        params.set('page', '1');
        router.push(`${pathname}?${params.toString()}`);
    };

    const currentSortLabel = SORT_OPTIONS.find((o) => o.value === currentSort)?.label || 'Mới nhất';

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '10px 14px',
            }}
        >
            {/* Left: search by toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>Tìm kiếm theo:</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                    {SEARCH_BY_OPTIONS.map(({ label, value }) => {
                        const active = currentSearchBy === value;
                        return (
                            <button
                                key={value}
                                onClick={() => setParam('searchBy', value)}
                                style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    border: `1.5px solid ${active ? GREEN : '#e5e7eb'}`,
                                    background: active ? '#f0fdf4' : 'white',
                                    color: active ? GREEN : '#6b7280',
                                    fontSize: '13px',
                                    fontWeight: active ? '600' : '400',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'all 0.15s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {active && <Check size={11} strokeWidth={3} />}
                                {label}
                            </button>
                        );
                    })}
                </div>

                {total > 0 && (
                    <span style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        — <strong style={{ color: '#111827' }}>{total.toLocaleString('vi-VN')}</strong> việc làm
                        {search && (
                            <>
                                {' '}
                                phù hợp với <strong style={{ color: GREEN }}>"{search}"</strong>
                            </>
                        )}
                    </span>
                )}
            </div>

            {/* Right: sort dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} ref={sortRef}>
                <span style={{ fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>Sắp xếp theo:</span>
                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowSortDropdown((v) => !v)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '5px 12px',
                            border: `1.5px solid ${showSortDropdown ? GREEN : '#e5e7eb'}`,
                            borderRadius: '8px',
                            background: 'white',
                            color: '#111827',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'border-color 0.15s',
                        }}
                    >
                        {currentSortLabel}
                        <ChevronDown
                            size={14}
                            color="#6b7280"
                            style={{
                                transform: showSortDropdown ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s',
                            }}
                        />
                    </button>

                    {showSortDropdown && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                right: 0,
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                zIndex: 200,
                                minWidth: '180px',
                                overflow: 'hidden',
                                padding: '4px',
                            }}
                        >
                            {SORT_OPTIONS.map(({ label, value }) => {
                                const active = currentSort === value;
                                return (
                                    <button
                                        key={value}
                                        onClick={() => {
                                            setParam('sort', value);
                                            setShowSortDropdown(false);
                                        }}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 12px',
                                            border: 'none',
                                            borderRadius: '6px',
                                            background: active ? '#f0fdf4' : 'none',
                                            color: active ? GREEN : '#374151',
                                            fontSize: '13px',
                                            fontWeight: active ? '600' : '400',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active)
                                                (e.currentTarget as HTMLButtonElement).style.background = '#f9fafb';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active)
                                                (e.currentTarget as HTMLButtonElement).style.background = 'none';
                                        }}
                                    >
                                        {label}
                                        {active && <Check size={13} color={GREEN} strokeWidth={2.5} />}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
