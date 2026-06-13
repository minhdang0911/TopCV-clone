'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    FileText, X, ChevronLeft, ChevronRight, Briefcase,
    MapPin, DollarSign, ExternalLink, ChevronDown, ChevronUp,
    User, Calendar, Phone, Loader2, UserCheck, UserX,
} from 'lucide-react';
import { connectService } from '@/services/connect.service';
import { provinceService } from '@/services/province.service';

const GREEN = '#00b14f';

function useProvinceMap() {
    const [map, setMap] = useState({});
    useEffect(() => {
        provinceService.getAll()
            .then(data => {
                const m = {};
                (data || []).forEach(p => { m[p.code] = p.name; });
                setMap(m);
            })
            .catch(() => {});
    }, []);
    return map;
}

function resolveProvinces(codes, map) {
    if (!codes?.length) return null;
    return codes.map(c => map[c] || map[String(c)] || map[Number(c)] || c).join(', ');
}

const GENDER_MAP = {
    MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác',
    male: 'Nam', female: 'Nữ', other: 'Khác',
    Nam: 'Nam', Nữ: 'Nữ',
};

function calcAge(dob) {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatDob(dob) {
    if (!dob) return null;
    return new Date(dob).toLocaleDateString('vi-VN');
}

const SALARY_MAP = {
    BELOW_10: 'Dưới 10 triệu',
    FROM_10_TO_15: '10 - 15 triệu',
    FROM_15_TO_20: '15 - 20 triệu',
    FROM_20_TO_25: '20 - 25 triệu',
    FROM_25_TO_30: '25 - 30 triệu',
    ABOVE_30: 'Trên 30 triệu',
    NEGOTIABLE: 'Thương lượng',
};

const WORKING_TYPE_MAP = {
    TOAN_THOI_GIAN: 'Toàn thời gian',
    BAN_THOI_GIAN: 'Bán thời gian',
    FREELANCE: 'Freelance',
    THUC_TAP: 'Thực tập',
    REMOTE: 'Remote',
};

// ── Candidate Detail Modal ────────────────────────────────────────────────────
function CandidateDetailModal({ candidateUserId, onClose, onConnect, onDismiss, actionLoading, provinceMap }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        connectService.getCandidateDetail(candidateUserId)
            .then(res => { if (!cancelled) setDetail(res.data); })
            .catch(() => { if (!cancelled) toast.error('Không thể tải thông tin ứng viên'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [candidateUserId]);

    const prefs = detail?.jobPreferences || {};
    const age = calcAge(detail?.dob);
    const cvHref = detail?.cvType === 'uploaded'
        ? detail?.cvFileUrl
        : detail?.defaultCvId ? `/xem-cv/${detail.defaultCvId}` : null;

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.45)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', padding: '16px',
            }}
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px',
                maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}>
                {/* Header */}
                <div style={{
                    padding: '18px 20px', borderBottom: '1px solid #f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>
                        Thông tin ứng viên
                    </span>
                    <button onClick={onClose} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '32px', height: '32px', border: 'none', background: '#f3f4f6',
                        borderRadius: '50%', cursor: 'pointer', color: '#6b7280',
                    }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '10px', color: '#9ca3af' }}>
                            <Loader2 size={20} />
                            <span style={{ fontSize: '14px' }}>Đang tải...</span>
                        </div>
                    ) : !detail ? (
                        <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '14px' }}>
                            Không thể tải thông tin
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Avatar + name */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
                                    border: '2px solid #e5e7eb', overflow: 'hidden',
                                    background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {detail.avatarUrl
                                        ? <img src={detail.avatarUrl} alt="" style={{ width: '64px', height: '64px', objectFit: 'cover', display: 'block' }} />
                                        : <span style={{ fontWeight: '700', fontSize: '24px', color: GREEN }}>
                                            {(detail.fullName || '?')[0].toUpperCase()}
                                        </span>
                                    }
                                </div>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '17px', color: '#111827' }}>
                                        {detail.fullName || 'Ứng viên'}
                                    </div>
                                    {prefs.jobTitle && (
                                        <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                                            <Briefcase size={12} /> {prefs.jobTitle}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Personal info */}
                            <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Thông tin cá nhân
                                </div>
                                {!detail.gender && !detail.dob && !detail.phone && (
                                    <div style={{ fontSize: '13px', color: '#9ca3af', fontStyle: 'italic' }}>
                                        Ứng viên chưa cập nhật thông tin cá nhân
                                    </div>
                                )}
                                {!!(detail.gender || detail.dob || detail.phone) && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {detail.gender && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <User size={14} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>Giới tính</div>
                                                <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                                    {GENDER_MAP[detail.gender] || detail.gender}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {detail.dob && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <Calendar size={14} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>Ngày sinh</div>
                                                <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                                    {formatDob(detail.dob)}{age !== null ? ` (${age} tuổi)` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {detail.phone && (
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                            <Phone size={14} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>Số điện thoại</div>
                                                <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                                    {detail.phone}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>}
                            </div>

                            {/* Job preferences */}
                            {Object.keys(prefs).length > 0 && (
                                <div style={{ background: '#f9fafb', borderRadius: '10px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Nguyện vọng việc làm
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        {prefs.salaryRange && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <DollarSign size={14} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>Mức lương</div>
                                                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                                        {SALARY_MAP[prefs.salaryRange] || prefs.salaryRange}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <MapPin size={14} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>Địa điểm</div>
                                                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                                        {prefs.provinceName || resolveProvinces(prefs.provinceCodes, provinceMap) || prefs.provinceCodes?.join(', ')}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {prefs.workingType && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <Briefcase size={14} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>Hình thức</div>
                                                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                                        {WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {prefs.experience && (
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                <Briefcase size={14} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                                <div>
                                                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: '600' }}>Kinh nghiệm</div>
                                                    <div style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                                        {prefs.experience}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CV */}
                            {detail.cvTitle && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '10px',
                                    border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px',
                                }}>
                                    <FileText size={18} color="#9ca3af" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {detail.cvTitle}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                            {detail.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}
                                        </div>
                                    </div>
                                    {cvHref && (
                                        <a href={cvHref} target="_blank" rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GREEN, fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>
                                            <ExternalLink size={13} /> Xem CV
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '14px 20px', borderTop: '1px solid #f3f4f6',
                    display: 'flex', gap: '10px',
                }}>
                    <button
                        onClick={() => { onDismiss(candidateUserId); onClose(); }}
                        disabled={actionLoading}
                        style={{
                            flex: 1, padding: '10px 0', border: '1px solid #e5e7eb',
                            borderRadius: '8px', background: 'white', color: '#6b7280',
                            fontSize: '13px', fontWeight: '600', cursor: actionLoading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        <UserX size={15} /> Bỏ qua
                    </button>
                    <button
                        onClick={() => { onConnect(candidateUserId); onClose(); }}
                        disabled={actionLoading}
                        style={{
                            flex: 2, padding: '10px 0', border: 'none',
                            borderRadius: '8px', background: actionLoading ? '#d1d5db' : GREEN,
                            color: 'white', fontSize: '13px', fontWeight: '700',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        <UserCheck size={15} /> Gửi kết nối
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Profile Card ──────────────────────────────────────────────────────────────
function ProfileCard({ candidate, onDismiss, dismissing, onView, onViewDetail, provinceMap }) {
    const [expanded, setExpanded] = useState(false);

    const handleToggleExpand = () => {
        if (!expanded) onView(candidate.userId);
        setExpanded(v => !v);
    };
    const prefs = candidate.jobPreferences || {};
    const letter = (candidate.fullName || '?')[0].toUpperCase();

    const cvHref = candidate.cvType === 'uploaded'
        ? candidate.cvFileUrl
        : candidate.defaultCvId ? `/xem-cv/${candidate.defaultCvId}` : null;

    return (
        <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px',
            overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
            transition: 'box-shadow 0.15s, transform 0.1s',
        }}>
            {/* Header row */}
            <div className="profile-card-hd" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Avatar */}
                <div style={{
                    width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                    border: '2px solid #d1fae5', overflow: 'hidden',
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', display: 'block' }} />
                        : <span style={{ fontWeight: '800', fontSize: '20px', color: GREEN }}>{letter}</span>
                    }
                </div>

                {/* Name + title + gender/dob */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>
                        {candidate.fullName || 'Ứng viên'}
                    </div>
                    {prefs.jobTitle && (
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                            <Briefcase size={11} />
                            {prefs.jobTitle}
                        </div>
                    )}
                    {(candidate.gender || candidate.dob) && (
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: '#94a3b8', flexWrap: 'wrap' }}>
                            {candidate.gender && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <User size={10} />
                                    {GENDER_MAP[candidate.gender] || candidate.gender}
                                </span>
                            )}
                            {candidate.dob && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Calendar size={10} />
                                    {formatDob(candidate.dob)}{calcAge(candidate.dob) !== null ? ` (${calcAge(candidate.dob)} tuổi)` : ''}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="profile-act" style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {/* Xem chi tiết */}
                    <button
                        onClick={() => onViewDetail(candidate.userId)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '7px 13px', border: `1px solid ${GREEN}`,
                            borderRadius: '9px', color: GREEN, fontSize: '12px',
                            fontWeight: '700', background: '#f0fdf4', cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <User size={13} />
                        Xem chi tiết
                    </button>
                    {/* Xem CV */}
                    {cvHref && (
                        <a
                            href={cvHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '5px',
                                padding: '7px 13px', border: '1px solid #e2e8f0',
                                borderRadius: '9px', color: '#374151', fontSize: '12px',
                                fontWeight: '600', textDecoration: 'none', background: 'white',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <FileText size={13} />
                            Xem CV
                        </a>
                    )}
                    {/* Dismiss */}
                    <button
                        onClick={() => onDismiss(candidate.userId)}
                        disabled={dismissing}
                        title="Xóa khỏi danh sách"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', border: '1px solid #e5e7eb',
                            borderRadius: '8px', background: 'white', cursor: dismissing ? 'not-allowed' : 'pointer',
                            color: '#9ca3af',
                        }}
                    >
                        <X size={15} />
                    </button>
                    {/* Expand toggle */}
                    <button
                        onClick={handleToggleExpand}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '32px', height: '32px', border: '1px solid #e5e7eb',
                            borderRadius: '8px', background: 'white', cursor: 'pointer', color: '#6b7280',
                        }}
                    >
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                </div>
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 16px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* CV info */}
                    {candidate.cvTitle && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'white', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                            <FileText size={15} color="#9ca3af" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {candidate.cvTitle}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                    {candidate.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}
                                </div>
                            </div>
                            {cvHref && (
                                <a href={cvHref} target="_blank" rel="noopener noreferrer"
                                    style={{ fontSize: '12px', color: GREEN, fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <ExternalLink size={12} /> Xem
                                </a>
                            )}
                        </div>
                    )}

                    {/* Preferences grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {prefs.salaryRange && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <DollarSign size={13} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Mức lương</div>
                                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                                        {SALARY_MAP[prefs.salaryRange] || prefs.salaryRange}
                                    </div>
                                </div>
                            </div>
                        )}
                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <MapPin size={13} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Địa điểm</div>
                                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                                        {prefs.provinceName || resolveProvinces(prefs.provinceCodes, provinceMap) || prefs.provinceCodes?.join(', ')}
                                    </div>
                                </div>
                            </div>
                        )}
                        {prefs.workingType && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <Briefcase size={13} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Hình thức</div>
                                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                                        {WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType}
                                    </div>
                                </div>
                            </div>
                        )}
                        {prefs.experience && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <Briefcase size={13} color="#9ca3af" style={{ marginTop: '1px', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: '600' }}>Kinh nghiệm</div>
                                    <div style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>
                                        {prefs.experience}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Connect CTA */}
                    <div style={{ paddingTop: '4px' }}>
                        <a
                            href="/nha-tuyen-dung/ket-noi"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                fontSize: '12px', color: GREEN, fontWeight: '600', textDecoration: 'none',
                            }}
                        >
                            Gửi lời kết nối cho ứng viên này →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function XemHoSoPage() {
    const [candidates, setCandidates] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [dismissing, setDismissing] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [detailUserId, setDetailUserId] = useState(null);
    const provinceMap = useProvinceMap();

    const fetchCandidates = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await connectService.getSuggestions({ page: p, limit: 12, mode: 'view' });
            setCandidates(res.data?.data ?? []);
            setMeta(res.data?.meta ?? { total: 0, page: p, limit: 12, totalPages: 1 });
        } catch {
            toast.error('Không thể tải danh sách hồ sơ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCandidates(page); }, [page, fetchCandidates]);

    const handleView = async (candidateUserId) => {
        try { await connectService.recordView(candidateUserId); } catch {}
    };

    const handleDismiss = async (candidateUserId) => {
        setDismissing(candidateUserId);
        try {
            await connectService.skip(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Đã xóa khỏi danh sách');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setDismissing(null);
        }
    };

    const handleConnect = async (candidateUserId) => {
        setActionLoading(true);
        try {
            await connectService.request(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Đã gửi yêu cầu kết nối');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
                    Hồ sơ ứng viên
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Ứng viên đang tìm việc, phù hợp với ngành của bạn
                </p>
            </div>

            {/* Stats bar */}
            <div style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                padding: '14px 20px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    <strong style={{ color: '#111827' }}>{meta.total}</strong> hồ sơ phù hợp
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Trang {meta.page}/{Math.max(1, meta.totalPages)}</span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '14px' }}>Đang tải...</div>
            ) : candidates.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                }}>
                    <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Không có hồ sơ nào
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                        Hiện chưa có ứng viên phù hợp. Hãy quay lại sau!
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {candidates.map(c => (
                        <ProfileCard
                            key={c.userId}
                            candidate={c}
                            onDismiss={handleDismiss}
                            dismissing={dismissing === c.userId}
                            onView={handleView}
                            onViewDetail={setDetailUserId}
                            provinceMap={provinceMap}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={{
                            padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
                            background: page === 1 ? '#f9fafb' : 'white',
                            cursor: page === 1 ? 'not-allowed' : 'pointer', color: '#374151',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
                        }}
                    >
                        <ChevronLeft size={15} /> Trước
                    </button>
                    <span style={{ fontSize: '13px', color: '#6b7280', padding: '0 8px' }}>
                        {page} / {meta.totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages}
                        style={{
                            padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px',
                            background: page === meta.totalPages ? '#f9fafb' : 'white',
                            cursor: page === meta.totalPages ? 'not-allowed' : 'pointer', color: '#374151',
                            display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px',
                        }}
                    >
                        Sau <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {/* Detail modal */}
            {detailUserId && (
                <CandidateDetailModal
                    candidateUserId={detailUserId}
                    onClose={() => setDetailUserId(null)}
                    onConnect={handleConnect}
                    onDismiss={handleDismiss}
                    actionLoading={actionLoading}
                    provinceMap={provinceMap}
                />
            )}

            <style>{`
                @media (max-width: 520px) {
                    .profile-card-hd { flex-wrap: wrap; }
                    .profile-act { flex-shrink: 1 !important; width: 100%; justify-content: flex-end; }
                }
            `}</style>
        </div>
    );
}
