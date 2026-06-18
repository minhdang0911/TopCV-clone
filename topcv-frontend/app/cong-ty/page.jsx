'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Briefcase, Building2 } from 'lucide-react';
import api from '@/lib/axios';
import billboardImg from '@/app/assests/img/company-billBoard.png';

const GREEN = '#00b14f';
const LIMIT = 12;

function CompanyCard({ company }) {
    const href = `/cong-ty/${company.slug ?? company.id}`;

    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div
                style={{
                    background: '#fff',
                    borderRadius: 10,
                    border: '1px solid #e8e8e8',
                    overflow: 'hidden',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    cursor: 'pointer',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,177,79,0.14)';
                    e.currentTarget.style.borderColor = GREEN;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = '#e8e8e8';
                }}
            >
                {/* Cover image area */}
                <div style={{ position: 'relative', height: 120, flexShrink: 0 }}>
                    {company.coverImage ? (
                        <Image src={company.coverImage} alt="" fill style={{ objectFit: 'cover' }} unoptimized />
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, #e8f5e9 0%, #c8f0d8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Building2 size={32} color="#a8d8b8" />
                        </div>
                    )}
                    {/* Logo badge */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -20,
                            left: 16,
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            border: '2px solid #fff',
                            background: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        {company.logoUrl ? (
                            <Image
                                src={company.logoUrl}
                                alt={company.companyName}
                                width={48}
                                height={48}
                                style={{ objectFit: 'contain' }}
                                unoptimized
                            />
                        ) : (
                            <span style={{ fontSize: 18, fontWeight: 700, color: GREEN }}>
                                {company.companyName?.[0]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Card body */}
                <div style={{ padding: '28px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                        style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: '#1a1a1a',
                            margin: '0 0 6px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4,
                        }}
                    >
                        {company.companyName}
                    </h3>

                    {company.description && (
                        <p
                            style={{
                                fontSize: 12,
                                color: '#767676',
                                margin: '0 0 10px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.5,
                                flex: 1,
                            }}
                        >
                            {`" ${company.description.slice(0, 120)}..."`}
                        </p>
                    )}

                    <div
                        style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
                    >
                        {company.industryName && (
                            <span
                                style={{
                                    fontSize: 11,
                                    color: '#555',
                                    background: '#f5f5f5',
                                    padding: '3px 8px',
                                    borderRadius: 4,
                                }}
                            >
                                {company.industryName}
                            </span>
                        )}
                        <span
                            style={{
                                fontSize: 11,
                                color: GREEN,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 3,
                                marginLeft: 'auto',
                            }}
                        >
                            <Briefcase size={11} />
                            {company.jobCount} việc làm
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function Skeleton() {
    return (
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
            <div style={{ height: 120, background: '#f0f0f0', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ padding: '28px 16px 16px' }}>
                <div
                    style={{
                        height: 14,
                        width: '70%',
                        background: '#f0f0f0',
                        borderRadius: 4,
                        marginBottom: 8,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
                <div
                    style={{
                        height: 12,
                        width: '90%',
                        background: '#f0f0f0',
                        borderRadius: 4,
                        marginBottom: 6,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
                <div
                    style={{
                        height: 12,
                        width: '60%',
                        background: '#f0f0f0',
                        borderRadius: 4,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
            </div>
        </div>
    );
}

export default function CongTyListPage() {
    const [companies, setCompanies] = useState([]);
    const [initialLoading, setInitialLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [inputValue, setInputValue] = useState('');

    // Refs to avoid stale closures in observer
    const pageRef = useRef(1);
    const keywordRef = useRef('');
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const sentinelRef = useRef(null);

    const fetchPage = async (pg, kw, reset) => {
        if (loadingRef.current) return;
        loadingRef.current = true;
        if (reset) setInitialLoading(true);
        else setLoadingMore(true);
        try {
            const params = { page: pg, limit: LIMIT };
            if (kw) params.keyword = kw;
            const res = await api.get('/employers', { params });
            const { data, meta } = res.data;
            setCompanies((prev) => (reset ? data : [...prev, ...data]));
            const more = pg < meta.totalPages;
            setHasMore(more);
            hasMoreRef.current = more;
            pageRef.current = pg + 1;
        } catch {
            setHasMore(false);
            hasMoreRef.current = false;
        } finally {
            loadingRef.current = false;
            if (reset) setInitialLoading(false);
            else setLoadingMore(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchPage(1, '', true);
    }, []); // eslint-disable-line

    // IntersectionObserver
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
                    fetchPage(pageRef.current, keywordRef.current, false);
                }
            },
            { rootMargin: '300px' },
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, []); // eslint-disable-line

    const handleSearch = () => {
        const kw = inputValue.trim();
        keywordRef.current = kw;
        pageRef.current = 1;
        hasMoreRef.current = true;
        setHasMore(true);
        fetchPage(1, kw, true);
    };

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Hero */}
            <div
                style={{
                    background:
                        'transparent linear-gradient(6deg, #fff, #c4ffdd 100%, rgba(195,255,221,.702) 0) 0 0 no-repeat padding-box',
                    minHeight: 273,
                    paddingTop: 24,
                    marginBottom: 0,
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '0 16px',
                        display: 'flex',
                        alignItems: 'center',
                        minHeight: 249,
                    }}
                >
                    {/* Left */}
                    <div style={{ flex: 1, zIndex: 1 }}>
                        <h1
                            style={{
                                fontSize: 28,
                                fontWeight: 800,
                                color: '#1a1a1a',
                                margin: '0 0 8px',
                                lineHeight: 1.3,
                            }}
                        >
                            Khám phá <span style={{ color: GREEN }}>100.000+ công ty</span> nổi bật
                        </h1>
                        <p style={{ fontSize: 14, color: '#555', margin: '0 0 24px' }}>
                            Tra cứu thông tin công ty và tìm kiếm nơi làm việc tốt nhất dành cho bạn
                        </p>
                        <div style={{ display: 'flex', gap: 10, maxWidth: 520 }}>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <Search
                                    size={16}
                                    style={{
                                        position: 'absolute',
                                        left: 12,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#999',
                                    }}
                                />
                                <input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Nhập tên công ty"
                                    style={{
                                        width: '100%',
                                        padding: '11px 14px 11px 38px',
                                        borderRadius: 8,
                                        border: '1px solid #ddd',
                                        fontSize: 14,
                                        outline: 'none',
                                        background: '#fff',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                style={{
                                    padding: '11px 22px',
                                    background: GREEN,
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    flexShrink: 0,
                                }}
                            >
                                Tìm kiếm
                            </button>
                        </div>
                    </div>

                    {/* Billboard illustration */}
                    <div
                        className="company-billboard"
                        style={{ flexShrink: 0, marginLeft: 32, display: 'flex', alignItems: 'flex-end' }}
                    >
                        <Image
                            src={billboardImg}
                            alt=""
                            width={300}
                            height={244}
                            style={{ objectFit: 'contain' }}
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* List */}
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 48px' }}>
                <h2
                    style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: '#1a1a1a',
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        margin: '0 0 20px',
                        textAlign: 'center',
                    }}
                >
                    {keywordRef.current ? `Kết quả tìm kiếm "${keywordRef.current}"` : 'Danh sách các công ty nổi bật'}
                </h2>

                {initialLoading ? (
                    <div className="company-grid">
                        {[...Array(12)].map((_, i) => (
                            <Skeleton key={i} />
                        ))}
                    </div>
                ) : companies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                        <Building2 size={40} color="#ddd" style={{ margin: '0 auto 12px', display: 'block' }} />
                        <p style={{ margin: 0, fontSize: 14 }}>Không tìm thấy công ty phù hợp</p>
                    </div>
                ) : (
                    <>
                        <div className="company-grid">
                            {companies.map((c) => (
                                <CompanyCard key={c.id} company={c} />
                            ))}
                        </div>

                        {loadingMore && (
                            <div className="company-grid" style={{ marginTop: 20 }}>
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} />
                                ))}
                            </div>
                        )}

                        {!hasMore && companies.length > 0 && (
                            <p style={{ textAlign: 'center', color: '#999', fontSize: 13, marginTop: 24 }}>
                                Đã hiển thị tất cả {companies.length} công ty
                            </p>
                        )}
                    </>
                )}

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} style={{ height: 1 }} />
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
                .company-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 20px;
                }
                @media(max-width: 900px) {
                    .company-grid { grid-template-columns: repeat(2, 1fr); }
                    .company-billboard { display: none !important; }
                }
                @media(max-width: 560px) {
                    .company-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
