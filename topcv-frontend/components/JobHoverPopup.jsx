'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, DollarSign, Briefcase, Clock, Building2, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth.store';
import LoginModal from '@/components/LoginModal';

const GREEN = '#00b14f';

function formatSalary(min, max, type) {
    if (type === 'negotiable' || (!min && !max)) return 'Thỏa thuận';
    const fmt = (n) => (n / 1_000_000).toFixed(0) + ' triệu';
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max)}`;
}

function daysAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'Hôm nay';
    if (diff === 1) return '1 ngày trước';
    return `${diff} ngày trước`;
}

/**
 * RelatedJobCardWithPopup
 * 
 * Thay thế cho RelatedJobCard đơn giản.
 * Khi hover → hiện popup bên phải (hoặc bên trái nếu gần mép) chứa:
 *   - Thông tin job tóm tắt
 *   - Nút "Ứng tuyển" → nếu chưa login thì hiện LoginModal, nếu đã login thì navigate đến /viec-lam/[slug]?apply=1
 *   - Nút "Xem chi tiết" → navigate đến /viec-lam/[slug]
 * 
 * Props:
 *   job  — object job data
 */
export function RelatedJobCardWithPopup({ job }) {
    const router = useRouter();
    const { isAuthenticated, role, hydrated } = useAuthStore();
    const [hovered, setHovered] = useState(false);
    const [popupVisible, setPopupVisible] = useState(false);
    const [popupSide, setPopupSide] = useState('right'); // 'right' | 'left'
    const [loginModal, setLoginModal] = useState(false);
    const cardRef = useRef(null);
    const popupRef = useRef(null);
    const hoverTimer = useRef(null);
    const leaveTimer = useRef(null);

    const logo = job.employer?.logoUrl;
    const company = job.employer?.companyName || 'Công ty';
    const slug = job.slug || job.id;
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType);
    const location = job.locations?.length > 0
        ? (job.locations[0].provinceName || job.locations[0].districtName || 'Toàn quốc')
        : (job.provinceName || job.address || 'Toàn quốc');
    const postedDate = daysAgo(job.createdAt);

    // Tính vị trí popup khi hover
    const handleMouseEnter = () => {
        clearTimeout(leaveTimer.current);
        setHovered(true);
        hoverTimer.current = setTimeout(() => {
            if (cardRef.current) {
                const rect = cardRef.current.getBoundingClientRect();
                const spaceRight = window.innerWidth - rect.right;
                setPopupSide(spaceRight > 360 ? 'right' : 'left');
            }
            setPopupVisible(true);
        }, 180);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimer.current);
        setHovered(true); // giữ hovered để popup không biến mất ngay
        leaveTimer.current = setTimeout(() => {
            setHovered(false);
            setPopupVisible(false);
        }, 120);
    };

    const handlePopupEnter = () => {
        clearTimeout(leaveTimer.current);
    };

    const handlePopupLeave = () => {
        leaveTimer.current = setTimeout(() => {
            setHovered(false);
            setPopupVisible(false);
        }, 120);
    };

    useEffect(() => {
        return () => {
            clearTimeout(hoverTimer.current);
            clearTimeout(leaveTimer.current);
        };
    }, []);

    const handleApply = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Nếu chưa hydrate hoặc chưa đăng nhập → show login modal
        if (!hydrated || !isAuthenticated) {
            setLoginModal(true);
            return;
        }
        if (role !== 'CANDIDATE') return;
        router.push(`/viec-lam/${slug}?apply=1`);
    };

    const handleViewDetail = (e) => {
        e.preventDefault();
        router.push(`/viec-lam/${slug}`);
    };

    return (
        <>
            <LoginModal
                open={loginModal}
                onClose={() => setLoginModal(false)}
                redirectTo={`/viec-lam/${slug}?apply=1`}
                message="Đăng nhập để ứng tuyển vị trí này"
            />

            <div style={{ position: 'relative' }}>
                {/* Card */}
                <a
                    ref={cardRef}
                    href={`/viec-lam/${slug}`}
                    onClick={handleViewDetail}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        display: 'flex', gap: '12px', padding: '12px',
                        borderRadius: '8px',
                        border: `1px solid ${hovered ? GREEN : '#e5e7eb'}`,
                        marginBottom: '10px', cursor: 'pointer',
                        transition: 'border-color 0.15s, box-shadow 0.15s',
                        textDecoration: 'none', background: 'white',
                        boxShadow: hovered ? '0 2px 12px rgba(0,177,79,0.12)' : 'none',
                    }}
                >
                    {/* Logo */}
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '6px',
                        border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb',
                    }}>
                        {logo
                            ? <img src={logo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            : <Building2 size={20} color="#9ca3af" />
                        }
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontSize: '13px', fontWeight: '600',
                            color: hovered ? GREEN : '#111827',
                            overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', marginBottom: '3px',
                            transition: 'color 0.15s',
                        }}>
                            {job.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{company}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '12px', color: GREEN, fontWeight: '500' }}>{salary}</span>
                            {location && (
                                <span style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <MapPin size={10} />
                                    {location}
                                </span>
                            )}
                        </div>
                    </div>

                    <ChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0, alignSelf: 'center' }} />
                </a>

                {/* Popup */}
                {popupVisible && (
                    <div
                        ref={popupRef}
                        onMouseEnter={handlePopupEnter}
                        onMouseLeave={handlePopupLeave}
                        style={{
                            position: 'absolute',
                            top: '0',
                            ...(popupSide === 'right'
                                ? { left: 'calc(100% + 12px)' }
                                : { right: 'calc(100% + 12px)' }
                            ),
                            width: '360px',
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            animation: 'popupSlideIn 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                    >
                        <style>{`
                            @keyframes popupSlideIn {
                                from { opacity: 0; transform: scale(0.94) translateY(-6px); }
                                to   { opacity: 1; transform: scale(1) translateY(0); }
                            }
                            .popup-apply-btn:hover { background: #009940 !important; }
                            .popup-detail-btn:hover { background: #f0fdf4 !important; color: ${GREEN} !important; }
                        `}</style>

                        {/* Header gradient */}
                        <div style={{
                            background: `linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)`,
                            padding: '18px 20px',
                            borderBottom: '1px solid #f1f5f9',
                        }}>
                            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                                {/* Company Logo */}
                                <div style={{
                                    width: '56px', height: '56px', borderRadius: '10px',
                                    border: '1px solid #e2e8f0', overflow: 'hidden', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                }}>
                                    {logo
                                        ? <img src={logo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                        : <Building2 size={24} color="#94a3b8" />
                                    }
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '15px', fontWeight: '700', color: '#1e293b',
                                        lineHeight: '1.4', marginBottom: '4px',
                                    }}>
                                        {job.title}
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#64748b' }}>{company}</div>
                                    {postedDate && (
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} /> Đăng {postedDate}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '18px 20px' }}>
                            {/* Badges list */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                {/* Salary Badge */}
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 10px', borderRadius: '6px',
                                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                                    fontSize: '12px', fontWeight: '600', color: GREEN,
                                }}>
                                    <DollarSign size={13} />
                                    {salary}
                                </div>

                                {/* Location Badge */}
                                {location && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '5px 10px', borderRadius: '6px',
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        fontSize: '12px', fontWeight: '500', color: '#475569',
                                    }}>
                                        <MapPin size={13} />
                                        {location.split(',')[0]}
                                    </div>
                                )}

                                {/* Experience Badge */}
                                {job.experience && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '5px 10px', borderRadius: '6px',
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        fontSize: '12px', fontWeight: '500', color: '#475569',
                                    }}>
                                        <Briefcase size={13} />
                                        {job.experience}
                                    </div>
                                )}

                                {/* Working Type Badge */}
                                {job.workingType && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                                        padding: '5px 10px', borderRadius: '6px',
                                        background: '#f8fafc', border: '1px solid #e2e8f0',
                                        fontSize: '12px', fontWeight: '500', color: '#475569',
                                    }}>
                                        <Clock size={13} />
                                        {({
                                            TOAN_THOI_GIAN: 'Toàn thời gian',
                                            BAN_THOI_GIAN: 'Bán thời gian',
                                            FREELANCE: 'Freelance',
                                            THUC_TAP: 'Thực tập',
                                            REMOTE: 'Remote',
                                        })[job.workingType] || job.workingType}
                                    </div>
                                )}
                            </div>

                            {/* Job Description section */}
                            {job.description && (
                                <div style={{ marginBottom: '18px' }}>
                                    <div style={{
                                        fontSize: '13px', fontWeight: '700', color: '#334155',
                                        paddingLeft: '8px', borderLeft: `3px solid ${GREEN}`,
                                        marginBottom: '8px', lineHeight: '1',
                                    }}>
                                        Mô tả công việc
                                    </div>
                                    <div style={{
                                        fontSize: '12.5px', color: '#475569',
                                        lineHeight: '1.6', background: '#f8fafc',
                                        borderRadius: '8px', padding: '10px 12px',
                                        maxHeight: '90px', overflow: 'hidden',
                                        display: '-webkit-box', WebkitLineClamp: 4,
                                        WebkitBoxOrient: 'vertical', border: '1px dashed #e2e8f0',
                                    }} dangerouslySetInnerHTML={{
                                        __html: job.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 180) + '...',
                                    }} />
                                </div>
                            )}

                            {/* Action buttons */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                                <a
                                    href={`/viec-lam/${slug}`}
                                    className="popup-detail-btn"
                                    style={{
                                        flex: 1, padding: '10px 14px',
                                        background: 'white', color: GREEN,
                                        border: `1.5px solid ${GREEN}`, borderRadius: '8px',
                                        fontSize: '13px', fontWeight: '700',
                                        cursor: 'pointer', textDecoration: 'none',
                                        textAlign: 'center', transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}
                                >
                                    Xem chi tiết
                                </a>
                                <button
                                    onClick={handleApply}
                                    className="popup-apply-btn"
                                    style={{
                                        flex: 1, padding: '10px 14px',
                                        background: GREEN, color: 'white',
                                        border: 'none', borderRadius: '8px',
                                        fontSize: '13px', fontWeight: '700',
                                        cursor: 'pointer', transition: 'background 0.15s',
                                    }}
                                >
                                    Ứng tuyển ngay
                                </button>
                            </div>
                        </div>

                        {/* Arrow indicator */}
                        <div style={{
                            position: 'absolute',
                            top: '22px',
                            ...(popupSide === 'right'
                                ? { left: '-7px', borderRight: '7px solid white', borderLeft: 'none' }
                                : { right: '-7px', borderLeft: '7px solid white', borderRight: 'none' }
                            ),
                            borderTop: '7px solid transparent',
                            borderBottom: '7px solid transparent',
                            filter: 'drop-shadow(-1px 0 1px rgba(0,0,0,0.08))',
                        }} />
                    </div>
                )}
            </div>
        </>
    );
}

export default RelatedJobCardWithPopup;
