'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

const GREEN = '#00b14f';
const PER_PAGE = 8;

const fmtNum = n => (n ?? 0).toLocaleString('vi-VN');

/* ── SVG Icons per industry slug ── */
const ICONS = {
    'cong-nghe-thong-tin': (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
            <rect x="6" y="10" width="52" height="34" rx="4" stroke="#1a1a2e" strokeWidth="3" fill="#e8f5e9" />
            <rect x="10" y="14" width="44" height="26" rx="2" fill="white" />
            <path d="M22 32l6-6 4 4 8-8" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 44h16M32 44v8M22 52h20" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="48" cy="18" r="4" fill={GREEN} />
        </svg>
    ),
    'tai-chinh-ngan-hang': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <path d="M8 22L32 10l24 12H8z" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="13" y="22" width="8" height="20" fill="#1a1a2e" rx="1" />
            <rect x="28" y="22" width="8" height="20" fill="#1a1a2e" rx="1" />
            <rect x="43" y="22" width="8" height="20" fill="#1a1a2e" rx="1" />
            <rect x="8" y="42" width="48" height="4" fill="#1a1a2e" rx="1" />
            <circle cx="32" cy="16" r="3" fill={GREEN} />
            <rect x="6" y="52" width="52" height="3" fill={GREEN} rx="1.5" />
        </svg>
    ),
    'bat-dong-san': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <path d="M10 32L28 16l10 8V54H10V32z" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M38 24l16 14v16H38V24z" fill="white" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="20" y="40" width="8" height="14" fill="#1a1a2e" rx="1" />
            <rect x="42" y="38" width="7" height="8" fill="#e8f5e9" rx="1" stroke="#1a1a2e" strokeWidth="1.5" />
            <line x1="28" y1="22" x2="28" y2="16" stroke="#1a1a2e" strokeWidth="2" />
            <path d="M24 19l4-4 4 4" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    'giao-duc-dao-tao': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <path d="M32 10L6 24l26 14 26-14L32 10z" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M16 31v12c0 4 8 8 16 8s16-4 16-8V31" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="54" y1="24" x2="54" y2="42" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="54" cy="44" r="3" fill={GREEN} />
            <circle cx="32" cy="24" r="4" fill={GREEN} />
        </svg>
    ),
    'y-te-duoc-pham': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="10" y="10" width="44" height="44" rx="8" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <rect x="28" y="18" width="8" height="28" rx="3" fill={GREEN} />
            <rect x="18" y="28" width="28" height="8" rx="3" fill={GREEN} />
        </svg>
    ),
    'thuong-mai-dien-tu': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <path d="M8 12h8l6 28h24l6-20H20" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="28" cy="48" r="4" fill="#1a1a2e" />
            <circle cx="44" cy="48" r="4" fill="#1a1a2e" />
            <path d="M44 20l6-6M50 14l-6 6" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" />
            <rect x="32" y="8" width="20" height="16" rx="3" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2" />
            <path d="M36 16l4 4 6-6" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    'marketing-truyen-thong': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <path d="M48 14L16 26v12l32 12V14z" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="8" y="26" width="10" height="12" rx="2" fill="#1a1a2e" />
            <path d="M16 38l4 10" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="52" cy="32" r="5" fill={GREEN} stroke="#1a1a2e" strokeWidth="2" />
            <path d="M52 20v6M52 38v6M40 32h6M58 32h0" stroke={GREEN} strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    'san-xuat-cong-nghiep': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="6" y="30" width="52" height="24" rx="2" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <path d="M6 30l14-14v14M20 30l14-14v14M34 30l14-14v14" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" fill="none" />
            <rect x="12" y="40" width="8" height="14" rx="1" fill="#1a1a2e" />
            <rect x="28" y="36" width="8" height="18" rx="1" fill={GREEN} />
            <rect x="44" y="40" width="8" height="14" rx="1" fill="#1a1a2e" />
        </svg>
    ),
    'xay-dung': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <path d="M10 54V30l22-18 22 18v24H10z" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" strokeLinejoin="round" />
            <rect x="24" y="38" width="16" height="16" rx="1" fill="#1a1a2e" />
            <rect x="16" y="34" width="10" height="10" rx="1" fill="white" stroke="#1a1a2e" strokeWidth="1.5" />
            <rect x="38" y="34" width="10" height="10" rx="1" fill="white" stroke="#1a1a2e" strokeWidth="1.5" />
            <path d="M26 18l6-6 6 6" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    'nhan-su-hanh-chinh': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="10" y="20" width="44" height="34" rx="4" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <path d="M22 20v-4a10 10 0 0120 0v4" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="36" r="7" fill={GREEN} />
            <path d="M18 54v-2a14 14 0 0128 0v2" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    'ke-toan-kiem-toan': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="12" y="8" width="40" height="48" rx="4" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <line x1="20" y1="22" x2="44" y2="22" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="30" x2="44" y2="30" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="38" x2="32" y2="38" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="44" cy="44" r="8" fill={GREEN} />
            <path d="M40 44l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    'blockchain-new': (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="22" y="8" width="20" height="14" rx="3" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <rect x="6" y="34" width="18" height="14" rx="3" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <rect x="40" y="34" width="18" height="14" rx="3" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <line x1="32" y1="22" x2="32" y2="34" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="34" x2="15" y2="34" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="34" x2="49" y2="34" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
            <circle cx="32" cy="15" r="4" fill={GREEN} />
            <circle cx="15" cy="41" r="4" fill={GREEN} />
            <circle cx="49" cy="41" r="4" fill={GREEN} />
        </svg>
    ),
    default: (
        <svg viewBox="0 0 64 64" fill="none" width="56" height="56">
            <rect x="10" y="20" width="44" height="34" rx="4" fill="#e8f5e9" stroke="#1a1a2e" strokeWidth="2.5" />
            <path d="M22 20v-4a10 10 0 0120 0v4" stroke="#1a1a2e" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="32" cy="37" r="6" fill={GREEN} />
            <line x1="32" y1="43" x2="32" y2="50" stroke="#1a1a2e" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
};

const getIcon = slug => {
    if (!slug) return ICONS.default;
    // partial match — ví dụ "tai-chinh-ngan-hang" match slug chứa "tai-chinh"
    const found = Object.keys(ICONS).find(k => k !== 'default' && slug.includes(k.split('-')[0]) && slug.includes(k.split('-')[1] ?? ''));
    return ICONS[slug] || ICONS[found] || ICONS.default;
};

/* ── Industry card ── */
function IndustryCard({ industry }) {
    const [hover, setHover] = useState(false);
    return (
        <a
            href={`/viec-lam?industryId=${industry.id}`}
            style={{ textDecoration: 'none' }}
        >
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    background: 'white',
                    border: `1.5px solid ${hover ? GREEN : '#e8e8e8'}`,
                    borderRadius: '12px',
                    padding: '20px 12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                    boxShadow: hover ? '0 4px 16px rgba(0,177,79,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                    transform: hover ? 'translateY(-2px)' : 'none',
                }}
            >
                <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getIcon(industry.slug)}
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '13px', fontWeight: '600', color: '#1a1a1a',
                        lineHeight: 1.4, marginBottom: '4px',
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                        {industry.name}
                    </div>
                    <div style={{ fontSize: '12px', color: GREEN, fontWeight: '600' }}>
                        {fmtNum(industry.count)} việc làm
                    </div>
                </div>
            </div>
        </a>
    );
}

/* ════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════ */
export default function TopIndustries() {
    const [industries, setIndustries] = useState([]);
    const [page, setPage] = useState(0);

    useEffect(() => {
        api.get('/jobs/industry-demand?limit=50')
            .then(r => setIndustries(Array.isArray(r.data) ? r.data : []))
            .catch(() => {});
    }, []);

    const totalPages = Math.ceil(industries.length / PER_PAGE);
    const visible = industries.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

    return (
        <div style={{ background: 'white', padding: '36px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

                {/* ── Header ── */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: GREEN }}>
                            Top ngành nghề nổi bật
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
                            Bạn muốn tìm việc mới?{' '}
                            <a href="/viec-lam" style={{ color: GREEN, fontWeight: '600', textDecoration: 'none' }}>
                                Xem danh sách việc làm tại đây
                            </a>
                        </p>
                    </div>

                    {/* Nav arrows */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                            <NavBtn disabled={page === 0} onClick={() => setPage(p => p - 1)} dir="left" />
                            <NavBtn disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)} dir="right" />
                        </div>
                    )}
                </div>

                {/* ── Grid 4 × 2 ── */}
                {industries.length === 0 ? (
                    <SkeletonGrid />
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '12px',
                    }}>
                        {visible.map(ind => (
                            <IndustryCard key={ind.id} industry={ind} />
                        ))}
                        {/* Filler to keep grid shape on last page */}
                        {visible.length < PER_PAGE && Array.from({ length: PER_PAGE - visible.length }).map((_, i) => (
                            <div key={`fill-${i}`} />
                        ))}
                    </div>
                )}

                {/* Dot indicators */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                style={{
                                    width: i === page ? '20px' : '8px',
                                    height: '8px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    background: i === page ? GREEN : '#d0d0d0',
                                    cursor: 'pointer',
                                    padding: 0,
                                    transition: 'all 0.2s',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Arrow button ── */
function NavBtn({ disabled, onClick, dir }) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={{
                width: '32px', height: '32px', borderRadius: '50%',
                border: `1.5px solid ${disabled ? '#e0e0e0' : GREEN}`,
                background: disabled ? '#f5f5f5' : 'white',
                cursor: disabled ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
            }}
        >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {dir === 'left'
                    ? <path d="M9 3L5 7L9 11" stroke={disabled ? '#ccc' : GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    : <path d="M5 3L9 7L5 11" stroke={disabled ? '#ccc' : GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                }
            </svg>
        </button>
    );
}

/* ── Skeleton ── */
function SkeletonGrid() {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <style>{`@keyframes shimmer2{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{
                    height: '130px', borderRadius: '12px',
                    background: 'linear-gradient(90deg,#f0f0f0 25%,#f8f8f8 50%,#f0f0f0 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer2 1.2s infinite',
                }} />
            ))}
        </div>
    );
}
