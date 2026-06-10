'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/axios';

const GREEN = '#00b14f';
const CARD_SHADOWS = [
    'linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%)',
    'linear-gradient(135deg,#0f2027 0%,#1a3a28 50%,#2c5344 100%)',
    'linear-gradient(135deg,#1a0f27 0%,#2c1a43 50%,#3d2c64 100%)',
    'linear-gradient(135deg,#1a1a0f 0%,#3a3a1a 50%,#5a5a2c 100%)',
    'linear-gradient(135deg,#0f1a27 0%,#1a2c43 50%,#2c3d64 100%)',
    'linear-gradient(135deg,#1a0f0f 0%,#3a1a1a 50%,#5a2c2c 100%)',
];

const cardBg = name => CARD_SHADOWS[(name?.charCodeAt(0) ?? 0) % CARD_SHADOWS.length];

/* ── Featured large card (left column) ── */
function FeaturedCard({ company }) {
    return (
        <Link
            href={`/cong-ty/${company.id}`}
            style={{ textDecoration: 'none', display: 'block', height: '100%' }}
        >
            <div className="feat-emp-featured" style={{
                background: cardBg(company.companyName),
                borderRadius: '12px',
                padding: '28px 20px',
                height: '100%',
                minHeight: '300px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
            }}>
                {/* Subtle pattern overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.05) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />

                {/* Logo */}
                <div style={{
                    width: '90px', height: '90px', borderRadius: '12px',
                    background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', flexShrink: 0,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                }}>
                    {company.logoUrl
                        ? <Image unoptimized src={company.logoUrl} alt={company.companyName} width={90} height={90} style={{ objectFit: 'contain' }} />
                        : <span style={{ fontSize: '32px', fontWeight: '800', color: GREEN }}>{company.companyName[0].toUpperCase()}</span>
                    }
                </div>

                {/* Info */}
                <div style={{ textAlign: 'center', zIndex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', lineHeight: 1.3, marginBottom: '4px' }}>
                        {company.companyName}
                    </div>
                    {company.industryName && (
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>
                            {company.industryName}
                        </div>
                    )}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        background: 'rgba(255,255,255,0.12)', borderRadius: '20px',
                        padding: '4px 12px', marginBottom: '12px',
                    }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="4" width="10" height="7" rx="1.5" stroke="white" strokeWidth="1.2" />
                            <path d="M4 4V3a2 2 0 0 1 4 0v1" stroke="white" strokeWidth="1.2" />
                        </svg>
                        <span style={{ fontSize: '12px', color: 'white', fontWeight: '500' }}>
                            {company.jobCount} việc làm
                        </span>
                    </div>
                </div>

                {/* Follow button */}
                <button
                    onClick={e => e.preventDefault()}
                    style={{
                        border: '1.5px solid rgba(255,255,255,0.5)', background: 'transparent',
                        borderRadius: '20px', padding: '6px 20px',
                        fontSize: '12px', fontWeight: '600', color: 'white',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                        zIndex: 1,
                    }}
                >
                    <span>+</span> Theo dõi
                </button>
            </div>
        </Link>
    );
}

/* ── Small company card (right grid) ── */
function SmallCard({ company }) {
    const [hover, setHover] = useState(false);
    return (
        <Link href={`/cong-ty/${company.id}`} style={{ textDecoration: 'none' }}>
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                style={{
                    border: `1.5px solid ${hover ? GREEN : '#e8e8e8'}`,
                    borderRadius: '10px',
                    padding: '14px',
                    background: 'white',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    boxShadow: hover ? '0 4px 12px rgba(0,177,79,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                }}
            >
                <div style={{
                    width: '44px', height: '44px', flexShrink: 0, borderRadius: '8px',
                    border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', overflow: 'hidden', background: '#fafafa',
                }}>
                    {company.logoUrl
                        ? <Image unoptimized src={company.logoUrl} alt={company.companyName} width={44} height={44} style={{ objectFit: 'contain' }} />
                        : <span style={{ fontSize: '18px', fontWeight: '700', color: GREEN }}>{company.companyName[0].toUpperCase()}</span>
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.4 }}>
                        {company.companyName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {company.industryName ?? ''}
                    </div>
                    <div style={{ fontSize: '11px', color: GREEN, fontWeight: '600', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <rect x="1" y="4" width="10" height="7" rx="1.5" stroke={GREEN} strokeWidth="1.4" />
                            <path d="M4 4V3a2 2 0 0 1 4 0v1" stroke={GREEN} strokeWidth="1.4" />
                        </svg>
                        {company.jobCount} việc làm
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* ════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════ */
export default function FeaturedEmployers() {
    const [industries, setIndustries] = useState([]);
    const [employers, setEmployers] = useState([]);
    const [selectedId, setSelectedId] = useState(null); // null = Tất cả
    const [loading, setLoading] = useState(true);
    const tabsRef = useRef(null);

    // Load industries once
    useEffect(() => {
        api.get('/industries?limit=100').then(r => {
            setIndustries(r.data?.data ?? []);
        }).catch(() => {});
    }, []);

    // Load employers when filter changes
    useEffect(() => {
        const params = new URLSearchParams({ limit: '7' });
        if (selectedId != null) params.set('industryId', String(selectedId));
        api.get(`/employers?${params}`).then(r => {
            setEmployers(r.data?.data ?? []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [selectedId]);

    const featured = employers[0] ?? null;
    const rest = employers.slice(1, 7);

    return (
        <div style={{ background: '#f5f5f5', padding: '28px 0' }}>
            <style>{`
              @media(max-width:768px){
                .feat-emp-grid{grid-template-columns:1fr!important;}
                .feat-emp-featured{min-height:180px!important;padding:20px!important;}
                .feat-emp-inner-grid{grid-template-columns:1fr 1fr!important;grid-template-rows:auto!important;}
                .feat-emp-filler{display:none!important;}
              }
              @media(max-width:480px){
                .feat-emp-inner-grid{grid-template-columns:1fr!important;}
              }
            `}</style>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>

                {/* ── Header ── */}
                <div style={{ marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
                        Thương hiệu lớn tiêu biểu
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
                        Hàng trăm thương hiệu lớn đang tuyển dụng trên hệ thống
                    </p>
                </div>

                {/* ── Industry tabs ── */}
                <div
                    ref={tabsRef}
                    className="feat-tabs"
                    style={{
                        display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '16px',
                        scrollbarWidth: 'none', paddingBottom: '4px',
                    }}
                >
                    <style>{`.feat-tabs::-webkit-scrollbar{display:none}`}</style>
                    <TabBtn active={selectedId === null} onClick={() => setSelectedId(null)}>
                        Tất cả
                    </TabBtn>
                    {industries.map(ind => (
                        <TabBtn key={ind.id} active={selectedId === ind.id} onClick={() => setSelectedId(ind.id)}>
                            {ind.name}
                        </TabBtn>
                    ))}
                </div>

                {/* ── Company grid ── */}
                {loading ? (
                    <SkeletonGrid />
                ) : employers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa', fontSize: '14px' }}>
                        Chưa có công ty nào trong ngành này.
                    </div>
                ) : (
                    <div className="feat-emp-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 2fr',
                        gap: '12px',
                        alignItems: 'stretch',
                    }}>
                        {/* Featured card */}
                        {featured && <FeaturedCard company={featured} />}

                        {/* Right: 2×3 grid */}
                        <div className="feat-emp-inner-grid" style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gridTemplateRows: 'repeat(3, 1fr)',
                            gap: '10px',
                        }}>
                            {rest.map(company => (
                                <SmallCard key={company.id} company={company} />
                            ))}
                            {/* Filler cards if less than 6 */}
                            {rest.length < 6 && Array.from({ length: 6 - rest.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="feat-emp-filler" style={{
                                    border: '1.5px dashed #e0e0e0', borderRadius: '10px',
                                    background: '#fafafa', minHeight: '72px',
                                }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Footer link ── */}
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Link
                        href="/cong-ty"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            fontSize: '13px', fontWeight: '600', color: GREEN, textDecoration: 'none',
                            border: `1.5px solid ${GREEN}`, borderRadius: '20px',
                            padding: '8px 20px',
                        }}
                    >
                        Xem tất cả công ty
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M5 3L10 7L5 11" stroke={GREEN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </Link>
                </div>

            </div>
        </div>
    );
}

/* ── Tab button ── */
function TabBtn({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: '20px',
                border: `1.5px solid ${active ? GREEN : '#d0d0d0'}`,
                background: active ? GREEN : 'white',
                color: active ? 'white' : '#555',
                fontSize: '12px', fontWeight: active ? '600' : '400',
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
            }}
        >
            {children}
        </button>
    );
}

/* ── Loading skeleton ── */
function SkeletonBox({ style }) {
    return (
        <div style={{
            background: 'linear-gradient(90deg,#e8e8e8 25%,#f0f0f0 50%,#e8e8e8 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s infinite',
            borderRadius: '10px',
            ...style,
        }}>
            <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
    );
}

function SkeletonGrid() {
    return (
        <div className="feat-emp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <SkeletonBox style={{ minHeight: '300px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {Array.from({ length: 6 }).map((_, i) => <SkeletonBox key={i} style={{ height: '80px' }} />)}
            </div>
        </div>
    );
}
