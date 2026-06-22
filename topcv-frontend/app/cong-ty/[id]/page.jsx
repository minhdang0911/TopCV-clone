'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Lottie from 'lottie-react';
import { Building2, Users, Hash, MapPin, Globe, Heart, Search, Copy, Check, Briefcase, Star, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, PenLine } from 'lucide-react';
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

/* ── Social SVGs ── */
function FacebookIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.792-4.697 4.533-4.697 1.313 0 2.686.235 2.686.235v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.266h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
    );
}

function LinkedinIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

function XIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

/* ── Helpers ── */
function formatSalary(min, max, type) {
    if (type === 'negotiable') return 'Thỏa thuận';
    if (type === 'upto' && max) return `Tới ${(max / 1e6).toFixed(0)} triệu`;
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
        <div
            style={{ fontSize: 13, color: '#767676', display: 'flex', gap: 6, alignItems: 'center', padding: '12px 0' }}
        >
            <Link href="/" style={{ color: '#767676', textDecoration: 'none' }}>
                Trang chủ
            </Link>
            <span>›</span>
            <Link href="/cong-ty" style={{ color: '#767676', textDecoration: 'none' }}>
                Danh sách công ty
            </Link>
            <span>›</span>
            <span style={{ color: '#333' }}>{name}</span>
        </div>
    );
}

/* ── Reviews Tab ── */
const DETAIL_CATS = [
    { key: 'avgSalary', label: 'Lương & phúc lợi' },
    { key: 'avgTraining', label: 'Đào tạo & học hỏi' },
    { key: 'avgCare', label: 'Quan tâm nhân viên' },
    { key: 'avgCulture', label: 'Văn hoá công ty' },
    { key: 'avgOffice', label: 'Văn phòng' },
];

function StarRow({ value }) {
    const v = Math.round(value || 0);
    return (
        <span style={{ display: 'inline-flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={13} fill={v >= s ? '#f59e0b' : '#e5e7eb'} stroke={v >= s ? '#f59e0b' : '#e5e7eb'} />
            ))}
        </span>
    );
}

const REVIEW_CATS = [
    { key: 'salaryRating',   label: 'Lương & phúc lợi' },
    { key: 'trainingRating', label: 'Đào tạo & học hỏi' },
    { key: 'careRating',     label: 'Quan tâm nhân viên' },
    { key: 'cultureRating',  label: 'Văn hoá công ty' },
    { key: 'officeRating',   label: 'Văn phòng làm việc' },
];

function ReviewCard({ review }) {
    const [expanded, setExpanded] = useState(false);
    const [showDrop, setShowDrop] = useState(false);
    const liked = review.liked || '';
    const improvement = review.improvement || '';
    const LIMIT = 200;

    return (
        <div style={{ background: '#fff', borderRadius: 10, padding: '20px 24px', border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                <div>
                    {/* Rating + dropdown trigger */}
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: 4 }}>
                        <button
                            onClick={() => setShowDrop((d) => !d)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                            <StarRow value={review.rating} />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>{(review.rating || 0).toFixed(1)}</span>
                            <ChevronDown size={14} color="#999" style={{ transform: showDrop ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                        </button>
                        {showDrop && (
                            <div
                                style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '12px 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', minWidth: 220, marginTop: 4 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {REVIEW_CATS.map(({ key, label }) => (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8, lastChild: { marginBottom: 0 } }}>
                                        <span style={{ fontSize: 12, color: '#555', flex: 1 }}>{label}</span>
                                        <StarRow value={review[key]} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', width: 22, textAlign: 'right' }}>{(review[key] || 0).toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>{review.title}</h4>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 12, color: '#bbb', margin: 0 }}>{timeAgo(review.createdAt)}</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#166534', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp size={13} /> Điểm tốt
                    </p>
                    <p style={{ fontSize: 13, color: '#333', lineHeight: 1.6, margin: 0 }}>
                        {expanded || liked.length <= LIMIT ? liked : liked.slice(0, LIMIT) + '…'}
                    </p>
                </div>
                <div style={{ background: '#fef2f2', borderRadius: 8, padding: '12px 14px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsDown size={13} /> Cần cải thiện
                    </p>
                    <p style={{ fontSize: 13, color: '#333', lineHeight: 1.6, margin: 0 }}>
                        {expanded || improvement.length <= LIMIT ? improvement : improvement.slice(0, LIMIT) + '…'}
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {review.recommend ? (
                        <span style={{ fontSize: 12, color: '#00b14f', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ThumbsUp size={12} fill="#00b14f" /> Giới thiệu bạn bè
                        </span>
                    ) : (
                        <span style={{ fontSize: 12, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <ThumbsDown size={12} fill="#ef4444" /> Không giới thiệu
                        </span>
                    )}
                </div>
                {(liked.length > LIMIT || improvement.length > LIMIT) && (
                    <button
                        onClick={() => setExpanded((e) => !e)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#00b14f', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}
                    >
                        {expanded ? <><ChevronUp size={13} /> Thu gọn</> : <><ChevronDown size={13} /> Xem thêm</>}
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyReviewState({ companyId }) {
    const router = useRouter();
    const [hover, setHover] = useState(0);
    return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ fontSize: 14, color: '#777', marginBottom: 16 }}>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => router.push(`/cong-ty/${companyId}/viet-danh-gia?rating=${s}`)}
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                    >
                        <Star
                            size={36}
                            fill={(hover || 0) >= s ? '#f59e0b' : '#e5e7eb'}
                            stroke={(hover || 0) >= s ? '#f59e0b' : '#d1d5db'}
                            strokeWidth={1.5}
                        />
                    </button>
                ))}
            </div>
            <p style={{ fontSize: 12, color: '#bbb' }}>Nhấn vào số sao để bắt đầu đánh giá</p>
        </div>
    );
}

function ReviewsTab({ companyId, onCountLoad }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!companyId) return;
        api.get(`/employers/${companyId}/employer-reviews`)
            .then((r) => {
                setData(r.data);
                onCountLoad?.(r.data?.stats?.totalReviews ?? 0);
            })
            .catch(() => setData({ stats: null, reviews: [] }))
            .finally(() => setLoading(false));
    }, [companyId, onCountLoad]);

    if (loading) {
        return (
            <div style={{ background: '#fff', borderRadius: 8, padding: 32, textAlign: 'center', color: '#999' }}>
                Đang tải đánh giá...
            </div>
        );
    }

    const stats = data?.stats;
    const reviews = data?.reviews || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stats card */}
            <div style={{ background: '#fff', borderRadius: 10, padding: '24px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111', margin: 0 }}>
                        Đánh giá của nhân viên
                        {stats?.totalReviews ? <span style={{ fontSize: 14, fontWeight: 400, color: '#777', marginLeft: 8 }}>({stats.totalReviews} đánh giá)</span> : null}
                    </h2>
                    <Link
                        href={`/cong-ty/${companyId}/viet-danh-gia`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: GREEN, color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
                    >
                        <PenLine size={14} /> Viết đánh giá
                    </Link>
                </div>

                {!stats || stats.totalReviews === 0 ? (
                    <EmptyReviewState companyId={companyId} />
                ) : (
                    <div className="reviews-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        {/* Left: overall */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: 48, fontWeight: 800, color: '#f59e0b', lineHeight: 1, margin: 0 }}>{(stats.avgRating || 0).toFixed(1)}</p>
                                    <StarRow value={stats.avgRating} />
                                    <p style={{ fontSize: 12, color: '#777', marginTop: 4 }}>{stats.totalReviews} đánh giá</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    {[5, 4, 3, 2, 1].map((s) => {
                                        const count = stats.distribution?.[s] || 0;
                                        const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                                        return (
                                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                                <span style={{ fontSize: 12, color: '#555', width: 8 }}>{s}</span>
                                                <Star size={11} fill="#f59e0b" stroke="#f59e0b" />
                                                <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: '#f59e0b', borderRadius: 4, transition: 'width 0.4s' }} />
                                                </div>
                                                <span style={{ fontSize: 11, color: '#999', width: 20, textAlign: 'right' }}>{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {stats.recommendPercent !== undefined && (
                                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '12px 16px', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                    <ThumbsUp size={16} fill="#00b14f" stroke="#00b14f" />
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#166534' }}>
                                        {Math.round(stats.recommendPercent)}% giới thiệu cho bạn bè
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Right: per-category */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {DETAIL_CATS.map(({ key, label }) => {
                                const val = stats[key] || 0;
                                return (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: 13, color: '#555', flex: 1 }}>{label}</span>
                                        <StarRow value={val} />
                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b', width: 28, textAlign: 'right' }}>{val.toFixed(1)}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Review list */}
            {reviews.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviews.map((r) => (
                        <ReviewCard key={r.id} review={r} />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ── Company header ── */
function CompanyHeader({ company, tab, onTabChange, followed, onFollow, followLoading, followerCount, reviewCount }) {
    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
            <div
                className="company-header-inner company-header-actions"
                style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: 90,
                        height: 90,
                        border: '1px solid #e8e8e8',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        background: '#f8f8f8',
                    }}
                >
                    {company.logoUrl ? (
                        <Image
                            src={company.logoUrl}
                            alt={company.companyName}
                            width={90}
                            height={90}
                            style={{ objectFit: 'contain' }}
                            unoptimized
                        />
                    ) : (
                        <div style={{ fontSize: 28, fontWeight: 700, color: GREEN }}>{company.companyName?.[0]}</div>
                    )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>
                        {company.companyName}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        {company.website && (
                            <a
                                href={company.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    fontSize: 13,
                                    color: '#767676',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                }}
                            >
                                <Globe size={13} />
                                {company.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                        {followerCount > 0 && (
                            <span style={{ fontSize: 13, color: '#767676', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Users size={13} />
                                {followerCount.toLocaleString('vi-VN')} người theo dõi
                            </span>
                        )}
                    </div>
                </div>

                {/* Follow button */}
                <button
                    className="company-follow-btn"
                    onClick={onFollow}
                    disabled={followLoading}
                    style={{
                        padding: '8px 20px',
                        borderRadius: 6,
                        cursor: followLoading ? 'wait' : 'pointer',
                        fontSize: 14,
                        fontWeight: 600,
                        border: `1px solid ${GREEN}`,
                        background: followed ? GREEN : '#fff',
                        color: followed ? '#fff' : GREEN,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        flexShrink: 0,
                        transition: 'all 0.2s',
                    }}
                >
                    <Heart size={15} fill={followed ? '#fff' : 'none'} />
                    {followed ? 'Đang theo dõi' : '+ Theo dõi công ty'}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e8e8e8', paddingLeft: 8 }}>
                {[
                    { key: 'home', label: 'Trang chủ' },
                    { key: 'jobs', label: `Tin tuyển dụng${company.jobCount ? ` (${company.jobCount})` : ''}` },
                    { key: 'reviews', label: `Đánh giá (${reviewCount ?? 0})` },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => onTabChange(t.key)}
                        style={{
                            padding: '10px 20px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: tab === t.key ? 600 : 400,
                            color: tab === t.key ? GREEN : '#555',
                            borderBottom: tab === t.key ? `2px solid ${GREEN}` : '2px solid transparent',
                            marginBottom: -1,
                        }}
                    >
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
        { icon: <Users size={16} color="#767676" />, label: 'Quy mô', value: company.companySize },
        { icon: <Building2 size={16} color="#767676" />, label: 'Lĩnh vực', value: company.industryName },
        { icon: <Hash size={16} color="#767676" />, label: 'Mã số thuế', value: company.taxCode },
    ].filter((r) => r.value);

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 16px' }}>Thông tin chung</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {rows.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flexShrink: 0, marginTop: 1 }}>{r.icon}</div>
                        <div>
                            <div style={{ fontSize: 12, color: '#767676', marginBottom: 2 }}>{r.label}</div>
                            <div style={{ fontSize: 14, color: '#333', fontWeight: 500 }}>{r.value}</div>
                        </div>
                    </div>
                ))}
                {rows.length === 0 && <p style={{ color: '#999', fontSize: 13, margin: 0 }}>Chưa có thông tin</p>}
            </div>
        </div>
    );
}

/* ── Sidebar: Map ── */
function MapCard({ address }) {
    if (!address) return null;
    const query = encodeURIComponent(address);
    const embedSrc = `https://maps.google.com/maps?q=${query}&output=embed&hl=vi&z=15`;

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>Địa điểm công ty</h3>
            <p
                style={{
                    fontSize: 13,
                    color: '#555',
                    margin: '0 0 12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 5,
                }}
            >
                <MapPin size={14} color="#767676" style={{ flexShrink: 0, marginTop: 2 }} />
                {address}
            </p>
            <div style={{ borderRadius: 8, overflow: 'hidden', height: 200 }}>
                <iframe
                    src={embedSrc}
                    width="100%"
                    height="200"
                    style={{ border: 0, display: 'block' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Địa điểm công ty"
                />
            </div>
            <a
                href={`https://maps.google.com/?q=${query}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    color: GREEN,
                    textDecoration: 'none',
                    marginTop: 8,
                }}
            >
                <MapPin size={12} />
                Mở trong Google Maps
            </a>
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

    const shareLinks = [
        {
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            bg: '#1877f2',
            icon: <FacebookIcon size={16} />,
            title: 'Facebook',
        },
        {
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(company.companyName)}`,
            bg: '#000',
            icon: <XIcon size={16} />,
            title: 'X',
        },
        {
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            bg: '#0a66c2',
            icon: <LinkedinIcon size={16} />,
            title: 'LinkedIn',
        },
    ];

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: '20px', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px' }}>Chia sẻ công ty</h3>
            <p style={{ fontSize: 13, color: '#767676', margin: '0 0 8px' }}>Sao chép đường dẫn</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <input
                    readOnly
                    value={url}
                    style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: 6,
                        border: '1px solid #e8e8e8',
                        fontSize: 12,
                        color: '#555',
                        background: '#f8f8f8',
                        minWidth: 0,
                    }}
                />
                <button
                    onClick={copy}
                    style={{
                        padding: '7px 12px',
                        background: copied ? GREEN : '#f0faf4',
                        border: `1px solid ${GREEN}`,
                        borderRadius: 6,
                        cursor: 'pointer',
                        color: copied ? '#fff' : GREEN,
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 12,
                        fontWeight: 600,
                    }}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Đã chép!' : 'Sao chép'}
                </button>
            </div>
            <p style={{ fontSize: 13, color: '#767676', margin: '0 0 10px' }}>Chia sẻ qua mạng xã hội</p>
            <div style={{ display: 'flex', gap: 10 }}>
                {shareLinks.map((s) => (
                    <a
                        key={s.title}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={s.title}
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            background: s.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            textDecoration: 'none',
                        }}
                    >
                        {s.icon}
                    </a>
                ))}
            </div>
        </div>
    );
}

/* ── Job card ── */
function JobCard({ job, company }) {
    return (
        <Link href={`/viec-lam/${job.slug || job.id}`} style={{ textDecoration: 'none' }}>
            <div
                style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: 8,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = GREEN;
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,177,79,.12)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <div
                    style={{
                        width: 48,
                        height: 48,
                        border: '1px solid #e8e8e8',
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f8f8f8',
                        flexShrink: 0,
                    }}
                >
                    {company?.logoUrl ? (
                        <Image
                            src={company.logoUrl}
                            alt=""
                            width={48}
                            height={48}
                            style={{ objectFit: 'contain' }}
                            unoptimized
                        />
                    ) : (
                        <span style={{ fontSize: 20, fontWeight: 700, color: GREEN }}>{company?.companyName?.[0]}</span>
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#1a1a1a',
                            marginBottom: 4,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {job.title}
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            color: '#767676',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                        }}
                    >
                        <span style={{ color: GREEN, fontWeight: 500 }}>
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                        </span>
                        {job.provinceName && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <MapPin size={12} />
                                {job.provinceName}
                            </span>
                        )}
                    </div>
                </div>
                <div style={{ fontSize: 12, color: '#999', flexShrink: 0 }}>{timeAgo(job.createdAt)}</div>
            </div>
        </Link>
    );
}

/* ── Lottie face: static by default, plays on hover ── */
function RatingFace({ anim, isHovered }) {
    const lottieRef = useRef(null);
    useEffect(() => {
        if (!lottieRef.current) return;
        if (isHovered) {
            lottieRef.current.play();
        } else {
            lottieRef.current.stop();
        }
    }, [isHovered]);
    return (
        <Lottie
            lottieRef={lottieRef}
            animationData={anim}
            loop={true}
            autoplay={false}
            style={{ width: 64, height: 64 }}
        />
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
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', paddingTop: 8 }}>
                    {RATINGS.map((r) => (
                        <button
                            key={r.value}
                            onClick={() => submit(r.value)}
                            disabled={submitting}
                            onMouseEnter={() => setHovered(r.value)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: submitting ? 'wait' : 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 8,
                                opacity: selected && selected !== r.value ? 0.45 : 1,
                                transform: hovered === r.value ? 'scale(1.1)' : 'scale(1)',
                                transition: 'transform 0.15s, opacity 0.15s',
                                padding: '4px 8px',
                            }}
                        >
                            <div style={{ width: 64, height: 64 }}>
                                <RatingFace anim={r.anim} isHovered={hovered === r.value} />
                            </div>
                            <span
                                style={{
                                    fontSize: 11,
                                    color: selected === r.value ? GREEN : '#555',
                                    textAlign: 'center',
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.4,
                                    fontWeight: selected === r.value ? 700 : 400,
                                }}
                            >
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>
                    Thương hiệu lớn tiêu biểu cùng lĩnh vực
                </h3>
                <span
                    style={{
                        fontSize: 11,
                        background: '#e8f5e9',
                        color: GREEN,
                        padding: '2px 8px',
                        borderRadius: 10,
                        fontWeight: 600,
                    }}
                >
                    Pro Company
                </span>
            </div>
            <div
                className="similar-companies-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}
            >
                {companies.slice(0, 8).map((c) => (
                    <Link key={c.id} href={`/cong-ty/${c.slug ?? c.id}`} style={{ textDecoration: 'none' }}>
                        <div
                            style={{
                                border: '1px solid #e8e8e8',
                                borderRadius: 8,
                                padding: '12px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                cursor: 'pointer',
                                transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = GREEN)}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e8e8e8')}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    border: '1px solid #e8e8e8',
                                    borderRadius: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f8f8f8',
                                    flexShrink: 0,
                                }}
                            >
                                {c.logoUrl ? (
                                    <Image
                                        src={c.logoUrl}
                                        alt=""
                                        width={40}
                                        height={40}
                                        style={{ objectFit: 'contain' }}
                                        unoptimized
                                    />
                                ) : (
                                    <span style={{ fontSize: 16, fontWeight: 700, color: GREEN }}>
                                        {c.companyName?.[0]}
                                    </span>
                                )}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: '#1a1a1a',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {c.companyName}
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: '#767676',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                        marginTop: 2,
                                    }}
                                >
                                    <Briefcase size={11} />
                                    {c.jobCount} việc làm
                                </div>
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

    const fetchJobs = useCallback(
        (kw, pg) => {
            const params = { page: pg ?? 1, limit: 10 };
            if (kw) params.keyword = kw;
            api.get(`/employers/${companyId}/jobs`, { params })
                .then((r) => {
                    setJobs(r.data.data);
                    setMeta(r.data.meta);
                })
                .finally(() => setLoading(false));
        },
        [companyId],
    );

    useEffect(() => {
        fetchJobs(undefined, 1);
    }, [fetchJobs]);

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
                    <Search
                        size={15}
                        style={{
                            position: 'absolute',
                            left: 10,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#999',
                        }}
                    />
                    <input
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Tên công việc, vị trí ứng tuyển..."
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 34px',
                            border: '1px solid #e8e8e8',
                            borderRadius: 8,
                            fontSize: 14,
                            boxSizing: 'border-box',
                            outline: 'none',
                        }}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    style={{
                        padding: '10px 20px',
                        background: GREEN,
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: 14,
                    }}
                >
                    Tìm kiếm
                </button>
            </div>

            {/* Job list */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                height: 76,
                                background: '#f5f5f5',
                                borderRadius: 8,
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                    <Briefcase
                        size={40}
                        color="#ddd"
                        style={{ marginBottom: 12, display: 'block', margin: '0 auto 12px' }}
                    />
                    <p style={{ margin: 0 }}>Không có tin tuyển dụng phù hợp</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {jobs.map((j) => (
                        <JobCard key={j.id} job={j} company={company} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
                    {[...Array(meta.totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setPage(i + 1);
                                fetchJobs(keyword, i + 1);
                            }}
                            style={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                border: `1px solid ${page === i + 1 ? GREEN : '#e8e8e8'}`,
                                background: page === i + 1 ? GREEN : '#fff',
                                color: page === i + 1 ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: page === i + 1 ? 700 : 400,
                            }}
                        >
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
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>
                        Giới thiệu công ty
                    </h2>
                    <div style={{ fontSize: 14, color: '#444', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {company.description}
                    </div>
                </div>
            )}

            {/* Jobs preview */}
            <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <div
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}
                >
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Tin tuyển dụng</h2>
                    <Link href="?tab=jobs" style={{ fontSize: 13, color: GREEN, textDecoration: 'none' }}>
                        Xem thêm →
                    </Link>
                </div>
                {loadingJobs ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {[...Array(3)].map((_, i) => (
                            <div key={i} style={{ height: 72, background: '#f5f5f5', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div style={{ color: '#999', fontSize: 14 }}>Công ty chưa có tin tuyển dụng nào.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {jobs.slice(0, 5).map((j) => (
                            <JobCard key={j.id} job={j} company={company} />
                        ))}
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
    const [followerCount, setFollowerCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        if (!id) return;

        api.get(`/employers/${id}`)
            .then((r) => {
                setCompany(r.data);
                setFollowerCount(r.data.followerCount ?? 0);
                // Redirect UUID → slug
                const slug = r.data.slug;
                const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (slug && UUID_RE.test(id)) {
                    const tab = searchParams.get('tab');
                    router.replace(`/cong-ty/${slug}${tab ? `?tab=${tab}` : ''}`, { scroll: false });
                }
            })
            .finally(() => setLoading(false));

        api.get(`/employers/${id}/jobs`, { params: { limit: 10 } })
            .then((r) => setJobs(r.data.data))
            .finally(() => setLoadingJobs(false));

        api.get(`/employers/${id}/reviews`).then((r) => setReviews(r.data));

        api.get(`/employers/${id}/follow-status`)
            .then((r) => setFollowed(r.data.followed))
            .catch(() => {});
    }, [id, router, searchParams]);

    const handleFollow = async () => {
        setFollowLoading(true);
        try {
            if (followed) {
                await api.delete(`/employers/${id}/follow`);
                setFollowed(false);
                setFollowerCount(c => Math.max(0, c - 1));
            } else {
                await api.post(`/employers/${id}/follow`);
                setFollowed(true);
                setFollowerCount(c => c + 1);
            }
        } catch {
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
                <div
                    style={{
                        height: 160,
                        background: '#f5f5f5',
                        borderRadius: 8,
                        marginBottom: 16,
                        animation: 'pulse 1.5s ease-in-out infinite',
                    }}
                />
                <div
                    className="company-detail-grid"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}
                >
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
                <Link href="/cong-ty" style={{ color: GREEN }}>
                    ← Quay lại danh sách
                </Link>
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
                    followerCount={followerCount}
                    reviewCount={reviewCount}
                />

                <div
                    className="company-detail-grid"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}
                >
                    {/* Main */}
                    <div>
                        {tab === 'home' ? (
                            <HomeTab company={company} jobs={jobs} loadingJobs={loadingJobs} reviews={reviews} />
                        ) : tab === 'reviews' ? (
                            <ReviewsTab companyId={id} onCountLoad={setReviewCount} />
                        ) : (
                            <JobsTab companyId={id} company={company} />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="company-detail-sidebar" style={{ position: 'sticky', top: 80 }}>
                        <InfoCard company={company} />
                        <MapCard address={company.address} />
                        <ShareCard company={company} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
                @media(max-width:768px){
                    .company-detail-grid{grid-template-columns:1fr!important;}
                    .company-detail-sidebar{position:static!important;}
                    .similar-companies-grid{grid-template-columns:1fr!important;}
                    .company-header-actions{flex-direction:column!important;align-items:flex-start!important;gap:12px!important;}
                    .company-follow-btn{width:100%!important;justify-content:center!important;}
                    .reviews-stats-grid{grid-template-columns:1fr!important;}
                }
                @media(max-width:480px){
                    .company-header-inner{flex-wrap:wrap!important;}
                }
            `}</style>
        </div>
    );
}
