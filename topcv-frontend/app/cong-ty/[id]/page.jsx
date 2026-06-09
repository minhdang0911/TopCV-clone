'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Lottie from 'lottie-react';
import api from '@/lib/axios';

import veryBadAnim from '../../../public/verry_bad.json';
import badAnim from '../../../public/bad.json';
import normalAnim from '../../../public/normal.json';
import goodAnim from '../../../public/good.json';
import veryGoodAnim from '../../../public/verry_good.json';

const GREEN = '#00b14f';

const RATINGS = [
    { value: 1, label: 'Không đáng tin cậy\n& rõ ràng', anim: veryBadAnim },
    { value: 2, label: 'Ít đáng tin cậy\n& rõ ràng', anim: badAnim },
    { value: 3, label: 'Bình thường', anim: normalAnim },
    { value: 4, label: 'Đáng tin cậy\n& rõ ràng', anim: goodAnim },
    { value: 5, label: 'Rất đáng tin cậy\n& rõ ràng', anim: veryGoodAnim },
];

/* ── Helpers ── */
function formatSalary(min, max, type) {
    if (type === 'negotiable') return 'Thỏa thuận';
    if (type === 'upto' && max) return `Tới ${max.toLocaleString('vi-VN')} đ`;
    if (min && max) return `${(min / 1e6).toFixed(0)} - ${(max / 1e6).toFixed(0)} triệu`;
    return 'Thỏa thuận';
}

function timeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 30) return `${days} ngày trước`;
    return `${Math.floor(days / 30)} tháng trước`;
}

/* ── Breadcrumb ── */
function Breadcrumb({ name }) {
    return (
        <div style={{ fontSize: 13, color: '#767676', display: 'flex', gap: 6, alignItems: 'center', padding: '12px 0' }}>
            <Link href="/" style={{ color: '#767676', textDecoration: 'none' }}>Trang chủ</Link>
            <span>›</span>
            <Link href="/cong-ty" style={{ color: '#767676', textDecoration: 'none' }}>Danh sách công ty</Link>
            <span>›</span>
            <span style={{ color: '#333' }}>{name}</span>
        </div>
    );
}

/* ── Company header ── */
function CompanyHeader({ company, tab, onTabChange, followed, onFollow, followLoading }) {
    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                {/* Logo */}
                <div style={{
                    width: 90, height: 90, border: '1px solid #e8e8e8', borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden', background: '#f8f8f8',
                }}>
                    {company.logoUrl ? (
                        <Image src={company.logoUrl} alt={company.companyName} width={90} height={90}
                            style={{ objectFit: 'contain' }} unoptimized />
                    ) : (
                        <div style={{ fontSize: 28, fontWeight: 700, color: GREEN }}>
                            {company.companyName?.[0]}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>
                        {company.companyName}
                    </h1>
                    {company.website && (
                        <a href={company.website} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: 13, color: '#767676', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                            {company.website.replace(/^https?:\/\//, '')}
                        </a>
                    )}
                </div>

                {/* Follow button */}
                <button
                    onClick={onFollow}
                    disabled={followLoading}
                    style={{
                        padding: '8px 20px', borderRadius: 6, cursor: followLoading ? 'wait' : 'pointer',
                        fontSize: 14, fontWeight: 600, border: `1px solid ${GREEN}`,
                        background: followed ? GREEN : '#fff',
                        color: followed ? '#fff' : GREEN,
                        display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                        transition: 'all 0.2s',
                    }}
                >
                    {followed ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                            Đang theo dõi
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                            + Theo dõi công ty
                        </>
                    )}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginTop: 16, borderBottom: '1px solid #e8e8e8' }}>
                {[
                    { key: 'home', label: 'Trang chủ' },
                    { key: 'jobs', label: `Tin tuyển dụng${company.jobCount ? ` (${company.jobCount})` : ''}` },
                ].map(t => (
                    <button key={t.key} onClick={() => onTabChange(t.key)} style={{
                        padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
                        color: tab === t.key ? GREEN : '#555',
                        borderBottom: tab === t.key ? `2px solid ${GREEN}` : '2px solid transparent',
                        marginBottom: -1,
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ── Sidebar: General info ── */
function InfoCard({ company }) {
    const rows = [
        { icon: '🏢', label: 'Quy mô', value: company.companySize },
        { icon: '🏭', label: 'Lĩnh vực', value: company.industryName },
        { icon: '🔢', label: 'Mã số thuế', value: company.taxCode },
    ].filter(r => r.value);

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>Thông tin chung</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {rows.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
                        <div>
                            <div style={{ fontSize: 12, color: '#767676' }}>{r.label}</div>
                            <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{r.value}</div>
                        </div>
                    </div>
                ))}
                {rows.length === 0 && (
                    <p style={{ color: '#999', fontSize: 13 }}>Chưa có thông tin</p>
                )}
            </div>
        </div>
    );
}

/* ── Sidebar: Map ── */
function MapCard({ address }) {
    const query = encodeURIComponent(address || 'Vietnam');
    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>Địa điểm công ty</h3>
            {address && <p style={{ fontSize: 13, color: '#555', margin: '0 0 12px' }}>{address}</p>}
            <div style={{ borderRadius: 8, overflow: 'hidden', height: 180, background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <a
                    href={`https://maps.google.com/?q=${query}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 13, color: GREEN, textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
                >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill={GREEN}>
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    Mở trong Google Maps
                </a>
            </div>
        </div>
    );
}

/* ── Sidebar: Share ── */
function ShareCard({ company }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? window.location.href : '';

    const copy = () => {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>Chia sẻ công ty</h3>
            <p style={{ fontSize: 13, color: '#767676', margin: '0 0 10px' }}>Sao chép đường dẫn</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input readOnly value={url} style={{
                    flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #e8e8e8',
                    fontSize: 12, color: '#555', background: '#f8f8f8',
                }} />
                <button onClick={copy} style={{
                    padding: '7px 14px', background: copied ? GREEN : '#f0faf4', border: `1px solid ${GREEN}`,
                    borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: copied ? '#fff' : GREEN, flexShrink: 0,
                }}>
                    {copied ? 'Đã chép!' : 'Sao chép'}
                </button>
            </div>
            <p style={{ fontSize: 13, color: '#767676', margin: '0 0 10px' }}>Chia sẻ qua mạng xã hội</p>
            <div style={{ display: 'flex', gap: 10 }}>
                {[
                    { href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, color: '#1877f2', label: 'f', title: 'Facebook' },
                    { href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(company.companyName)}`, color: '#1da1f2', label: '𝕏', title: 'Twitter' },
                    { href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, color: '#0a66c2', label: 'in', title: 'LinkedIn' },
                ].map(s => (
                    <a key={s.title} href={s.href} target="_blank" rel="noopener noreferrer" title={s.title}
                        style={{
                            width: 36, height: 36, borderRadius: '50%', background: s.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                        }}>
                        {s.label}
                    </a>
                ))}
            </div>
        </div>
    );
}

/* ── Job card (mini) ── */
function JobCard({ job, company }) {
    return (
        <Link href={`/viec-lam/${job.id}`} style={{ textDecoration: 'none' }}>
            <div style={{
                border: '1px solid #e8e8e8', borderRadius: 8, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,177,79,.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e8e8e8'; e.currentTarget.style.boxShadow = 'none'; }}
            >
                <div style={{
                    width: 48, height: 48, border: '1px solid #e8e8e8', borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#f8f8f8', flexShrink: 0,
                }}>
                    {company?.logoUrl ? (
                        <Image src={company.logoUrl} alt="" width={48} height={48} style={{ objectFit: 'contain' }} unoptimized />
                    ) : (
                        <span style={{ fontSize: 20, fontWeight: 700, color: GREEN }}>{company?.companyName?.[0]}</span>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {job.title}
                    </div>
                    <div style={{ fontSize: 13, color: '#767676', display: 'flex', gap: 12 }}>
                        <span style={{ color: GREEN, fontWeight: 500 }}>{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</span>
                        {job.provinceName && <span>📍 {job.provinceName}</span>}
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#999', flexShrink: 0 }}>{timeAgo(job.createdAt)}</div>
            </div>
        </Link>
    );
}

/* ── Rating section ── */
function RatingSection({ companyId, reviews }) {
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [hovered, setHovered] = useState(null);

    const submit = async (val) => {
        setSelected(val);
        setSubmitting(true);
        try {
            await api.post(`/employers/${companyId}/reviews`, { rating: val });
            setSubmitted(true);
        } catch {
            // ignore auth errors silently
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '24px', marginTop: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>
                Bạn thấy độ tin cậy &amp; rõ ràng của thông tin công ty này thế nào?
            </h3>
            {reviews?.reviewCount > 0 && (
                <p style={{ fontSize: 13, color: '#767676', margin: '0 0 20px' }}>
                    {reviews.reviewCount} đánh giá · Điểm trung bình: {reviews.avgRating?.toFixed(1)}
                </p>
            )}
            {submitted ? (
                <p style={{ color: GREEN, fontWeight: 600, fontSize: 14 }}>Cảm ơn bạn đã đánh giá!</p>
            ) : (
                <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {RATINGS.map(r => (
                        <button key={r.value} onClick={() => submit(r.value)} disabled={submitting}
                            onMouseEnter={() => setHovered(r.value)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                background: 'none', border: 'none', cursor: submitting ? 'wait' : 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                                opacity: selected && selected !== r.value ? 0.5 : 1,
                                transform: hovered === r.value ? 'scale(1.08)' : 'scale(1)',
                                transition: 'transform 0.15s, opacity 0.15s',
                            }}>
                            <div style={{ width: 64, height: 64 }}>
                                <Lottie animationData={r.anim}
                                    loop={hovered === r.value || selected === r.value}
                                    style={{ width: 64, height: 64 }} />
                            </div>
                            <span style={{
                                fontSize: 12, color: selected === r.value ? GREEN : '#555',
                                textAlign: 'center', whiteSpace: 'pre-line', lineHeight: 1.4,
                                fontWeight: selected === r.value ? 600 : 400,
                            }}>
                                {r.label}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Similar companies ── */
function SimilarCompanies({ companies }) {
    if (!companies?.length) return null;
    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                    Thương hiệu lớn tiêu biểu cùng lĩnh vực
                    <span style={{ fontSize: 11, background: '#e8f5e9', color: GREEN, padding: '2px 8px', borderRadius: 10, marginLeft: 8, fontWeight: 600 }}>Pro Company</span>
                </h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {companies.slice(0, 8).map(c => (
                    <Link key={c.id} href={`/cong-ty/${c.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                            border: '1px solid #e8e8e8', borderRadius: 8, padding: '12px 14px',
                            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                            transition: 'border-color 0.2s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = GREEN}
                            onMouseLeave={e => e.currentTarget.style.borderColor = '#e8e8e8'}
                        >
                            <div style={{
                                width: 40, height: 40, border: '1px solid #e8e8e8', borderRadius: 6,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: '#f8f8f8', flexShrink: 0,
                            }}>
                                {c.logoUrl
                                    ? <Image src={c.logoUrl} alt="" width={40} height={40} style={{ objectFit: 'contain' }} unoptimized />
                                    : <span style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>{c.companyName?.[0]}</span>
                                }
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {c.companyName}
                                </div>
                                <div style={{ fontSize: 12, color: '#767676' }}>{c.industryName}</div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

/* ── Jobs tab ── */
function JobsTab({ companyId, company }) {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);

    const fetchJobs = useCallback((kw, pg) => {
        const params = { page: pg ?? 1, limit: 10 };
        if (kw) params.keyword = kw;
        api.get(`/employers/${companyId}/jobs`, { params })
            .then(r => { setJobs(r.data.data); setMeta(r.data.meta); })
            .finally(() => setLoading(false));
    }, [companyId]);

    useEffect(() => { fetchJobs(undefined, 1); }, [fetchJobs]);

    const handleSearch = () => {
        setPage(1);
        setLoading(true);
        fetchJobs(keyword, 1);
    };

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>
                Việc làm tại {company.companyName}
            </h2>

            {/* Search bar */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#999' }}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Tên công việc, vị trí ứng tuyển..."
                        style={{
                            width: '100%', padding: '10px 12px 10px 34px', border: '1px solid #e8e8e8',
                            borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none',
                        }}
                    />
                </div>
                <button onClick={handleSearch} style={{
                    padding: '10px 20px', background: GREEN, color: '#fff',
                    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                }}>
                    Tìm kiếm
                </button>
            </div>

            {/* Job list */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} style={{ height: 76, background: '#f5f5f5', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p>Không có tin tuyển dụng phù hợp</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {jobs.map(j => <JobCard key={j.id} job={j} company={company} />)}
                </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    {[...Array(meta.totalPages)].map((_, i) => (
                        <button key={i} onClick={() => { setPage(i + 1); fetchJobs(keyword, i + 1); }}
                            style={{
                                width: 36, height: 36, borderRadius: '50%', border: `1px solid ${page === i + 1 ? GREEN : '#e8e8e8'}`,
                                background: page === i + 1 ? GREEN : '#fff', color: page === i + 1 ? '#fff' : '#333',
                                cursor: 'pointer', fontSize: 14, fontWeight: page === i + 1 ? 700 : 400,
                            }}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Home tab ── */
function HomeTab({ company, jobs, loadingJobs, reviews }) {
    return (
        <>
            {/* About */}
            {company.description && (
                <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>Giới thiệu công ty</h2>
                    <div style={{ fontSize: 14, color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {company.description}
                    </div>
                </div>
            )}

            {/* Jobs preview */}
            <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Tin tuyển dụng</h2>
                    <Link href="?tab=jobs" style={{ fontSize: 13, color: GREEN, textDecoration: 'none' }}>Xem thêm →</Link>
                </div>
                {loadingJobs ? (
                    <div style={{ color: '#999', fontSize: 14 }}>Đang tải...</div>
                ) : jobs.length === 0 ? (
                    <div style={{ color: '#999', fontSize: 14 }}>Công ty chưa có tin tuyển dụng nào.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {jobs.slice(0, 5).map(j => <JobCard key={j.id} job={j} company={company} />)}
                    </div>
                )}
            </div>

            <SimilarCompanies companies={company.similarCompanies} />

            <RatingSection companyId={company.id} reviews={reviews} />
        </>
    );
}

/* ── Main page ── */
export default function CompanyDetailPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const tab = searchParams.get('tab') || 'home';

    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [reviews, setReviews] = useState(null);
    const [followed, setFollowed] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        api.get(`/employers/${id}`)
            .then(r => setCompany(r.data))
            .finally(() => setLoading(false));

        api.get(`/employers/${id}/jobs`, { params: { limit: 10 } })
            .then(r => setJobs(r.data.data))
            .finally(() => setLoadingJobs(false));

        api.get(`/employers/${id}/reviews`).then(r => setReviews(r.data));

        api.get(`/employers/${id}/follow-status`)
            .then(r => setFollowed(r.data.followed))
            .catch(() => { });
    }, [id]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            if (followed) {
                await api.delete(`/employers/${id}/follow`);
                setFollowed(false);
            } else {
                await api.post(`/employers/${id}/follow`);
                setFollowed(true);
            }
        } catch {
            // If not logged in, redirect to login
            router.push('/login');
        } finally {
            setFollowLoading(false);
        }
    };

    const handleTabChange = (t) => {
        const params = new URLSearchParams(searchParams.toString());
        if (t === 'home') params.delete('tab');
        else params.set('tab', t);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    if (loading) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
                <div style={{ height: 160, background: '#f5f5f5', borderRadius: 8, marginBottom: 16, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
                    <div style={{ height: 400, background: '#f5f5f5', borderRadius: 8 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ height: 180, background: '#f5f5f5', borderRadius: 8 }} />
                        <div style={{ height: 180, background: '#f5f5f5', borderRadius: 8 }} />
                    </div>
                </div>
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
            </div>
        );
    }

    if (!company) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 16px', textAlign: 'center' }}>
                <h2 style={{ color: '#333' }}>Không tìm thấy công ty</h2>
                <Link href="/cong-ty" style={{ color: GREEN }}>← Quay lại danh sách</Link>
            </div>
        );
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 40px' }}>
                <Breadcrumb name={company.companyName} />

                <CompanyHeader
                    company={company}
                    tab={tab}
                    onTabChange={handleTabChange}
                    followed={followed}
                    onFollow={handleFollow}
                    followLoading={followLoading}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
                    {/* Main */}
                    <div>
                        {tab === 'home' ? (
                            <HomeTab company={company} jobs={jobs} loadingJobs={loadingJobs} reviews={reviews} />
                        ) : (
                            <JobsTab companyId={id} company={company} />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div style={{ position: 'sticky', top: 80 }}>
                        <InfoCard company={company} />
                        <MapCard address={company.address} />
                        <ShareCard company={company} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
            `}</style>
        </div>
    );
}
