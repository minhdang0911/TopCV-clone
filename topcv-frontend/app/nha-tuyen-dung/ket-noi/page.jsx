'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    UserCheck, UserX, ChevronLeft, ChevronRight,
    FileText, Briefcase, MessageSquare, Clock, CheckCircle, XCircle,
    User, Calendar, Phone, MapPin, DollarSign, ExternalLink, X, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { connectService } from '@/services/connect.service';

const GREEN = '#00b14f';

const TABS = [
    { key: 'suggest',   label: 'Gợi ý' },
    { key: 'PENDING',   label: 'Chờ phản hồi' },
    { key: 'CONNECTED', label: 'Đã kết nối' },
    { key: 'REJECTED',  label: 'Đã từ chối' },
];

const SALARY_MAP = {
    BELOW_10:       'Dưới 10 triệu',
    FROM_10_TO_15:  '10 - 15 triệu',
    FROM_15_TO_20:  '15 - 20 triệu',
    FROM_20_TO_25:  '20 - 25 triệu',
    FROM_25_TO_30:  '25 - 30 triệu',
    ABOVE_30:       'Trên 30 triệu',
    NEGOTIABLE:     'Thương lượng',
};

const WORKING_TYPE_MAP = {
    TOAN_THOI_GIAN: 'Toàn thời gian',
    BAN_THOI_GIAN:  'Bán thời gian',
    FREELANCE:      'Freelance',
    THUC_TAP:       'Thực tập',
    REMOTE:         'Remote',
};

const GENDER_MAP = {
    MALE:   'Nam',
    FEMALE: 'Nữ',
    OTHER:  'Khác',
    male:   'Nam',
    female: 'Nữ',
    other:  'Khác',
    Nam:    'Nam',
    Nữ:     'Nữ',
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
    const d = new Date(dob);
    return d.toLocaleDateString('vi-VN');
}

// ── Candidate Detail Modal ────────────────────────────────────────────────────
function CandidateDetailModal({ candidateUserId, onClose, onSkip, onConnect, actionLoading }) {
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
        <div style={{
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
                {/* Modal header */}
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

                {/* Modal body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '10px', color: '#9ca3af' }}>
                            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
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
                                                        {prefs.provinceName || prefs.provinceCodes?.join(', ')}
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
                                    <FileText size={18} color="#9ca3af" flexShrink={0} />
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

                {/* Modal footer */}
                <div style={{
                    padding: '14px 20px', borderTop: '1px solid #f3f4f6',
                    display: 'flex', gap: '10px',
                }}>
                    <button
                        onClick={() => { onSkip(candidateUserId); onClose(); }}
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

// ── Suggestion card ───────────────────────────────────────────────────────────
function CandidateCard({ candidate, onSkip, onConnect, loading, onViewDetail }) {
    const age = calcAge(candidate.dob);
    const cvHref = candidate.cvType === 'uploaded'
        ? candidate.cvFileUrl
        : candidate.defaultCvId ? `/xem-cv/${candidate.defaultCvId}` : null;

    return (
        <div style={{
            background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px',
            padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        }}>
            {/* Avatar + name row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '52px', height: '52px', borderRadius: '14px',
                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                    border: '2px solid #d1fae5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                }}>
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" style={{ width: '52px', height: '52px', objectFit: 'cover', display: 'block' }} />
                        : <span style={{ fontWeight: '800', fontSize: '20px', color: GREEN }}>{(candidate.fullName || '?')[0].toUpperCase()}</span>
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '2px' }}>
                        {candidate.fullName || 'Ứng viên'}
                    </div>
                    {candidate.jobPreferences?.jobTitle && (
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Briefcase size={11} />
                            {candidate.jobPreferences.jobTitle}
                        </div>
                    )}
                </div>
            </div>

            {/* Gender + dob row */}
            {(candidate.gender || candidate.dob) && (
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    {candidate.gender && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={12} />
                            {GENDER_MAP[candidate.gender] || candidate.gender}
                        </span>
                    )}
                    {candidate.dob && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {formatDob(candidate.dob)}{age !== null ? ` (${age} tuổi)` : ''}
                        </span>
                    )}
                </div>
            )}

            {/* CV info */}
            {candidate.cvTitle && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#f9fafb', borderRadius: '8px', padding: '10px 12px', border: '1px solid #f3f4f6',
                }}>
                    <FileText size={16} color="#9ca3af" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {candidate.cvTitle}
                        </div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {candidate.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}
                        </div>
                    </div>
                    {cvHref && (
                        <a href={cvHref} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '11px', color: GREEN, textDecoration: 'none', fontWeight: '600', flexShrink: 0 }}>
                            Xem
                        </a>
                    )}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => onSkip(candidate.userId)}
                    disabled={loading}
                    style={{
                        flex: 1, padding: '9px 0', border: '1px solid #e2e8f0', borderRadius: '9px',
                        background: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}
                >
                    <UserX size={13} /> Bỏ qua
                </button>
                <button
                    onClick={() => onViewDetail(candidate.userId)}
                    disabled={loading}
                    style={{
                        flex: 2, padding: '9px 0', border: `1px solid ${GREEN}`, borderRadius: '9px',
                        background: '#f0fdf4', color: GREEN, fontSize: '12px', fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                    }}
                >
                    <User size={13} /> Xem chi tiết
                </button>
                <button
                    onClick={() => onConnect(candidate.userId)}
                    disabled={loading}
                    style={{
                        flex: 2, padding: '9px 0', border: 'none', borderRadius: '9px',
                        background: loading ? '#d1d5db' : `linear-gradient(135deg, ${GREEN}, #00934a)`,
                        color: 'white', fontSize: '12px', fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                        boxShadow: loading ? 'none' : '0 3px 8px rgba(0,177,79,0.3)',
                    }}
                >
                    <UserCheck size={13} /> Kết nối
                </button>
            </div>
        </div>
    );
}

// ── Sent request card ─────────────────────────────────────────────────────────
const STATUS_STYLE = {
    PENDING:   { label: 'Chờ phản hồi', color: '#d97706', bg: '#fef3c7', Icon: Clock },
    CONNECTED: { label: 'Đã kết nối',   color: '#059669', bg: '#d1fae5', Icon: CheckCircle },
    REJECTED:  { label: 'Đã từ chối',   color: '#dc2626', bg: '#fee2e2', Icon: XCircle },
};

function SentCard({ item }) {
    const s = STATUS_STYLE[item.status] || STATUS_STYLE.PENDING;
    const letter = (item.candidate?.fullName || item.candidate?.email || '?')[0].toUpperCase();

    return (
        <div style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px',
        }}>
            {/* Avatar */}
            <div style={{
                width: '48px', height: '48px', borderRadius: '50%',
                background: '#f0fdf4', border: '2px solid #e5e7eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
            }}>
                {item.candidate?.avatarUrl
                    ? <img src={item.candidate.avatarUrl} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', display: 'block' }} />
                    : <span style={{ fontWeight: '700', fontSize: '18px', color: GREEN }}>{letter}</span>
                }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                    {item.candidate?.fullName || item.candidate?.email || 'Ứng viên'}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '2px 10px', borderRadius: '20px',
                        background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600',
                    }}>
                        <s.Icon size={11} />
                        {s.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </div>

            {/* Action */}
            {item.status === 'CONNECTED' && (
                <Link
                    href="/nha-tuyen-dung/tin-nhan"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 14px', border: `1px solid ${GREEN}`, borderRadius: '8px',
                        color: GREEN, fontSize: '12px', fontWeight: '600', textDecoration: 'none',
                        flexShrink: 0, whiteSpace: 'nowrap',
                    }}
                >
                    <MessageSquare size={13} /> Nhắn tin
                </Link>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function KetNoiPage() {
    const [activeTab, setActiveTab] = useState('suggest');
    const [candidates, setCandidates] = useState([]);
    const [sentItems, setSentItems] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [detailUserId, setDetailUserId] = useState(null);

    const fetchData = useCallback(async (tab, p) => {
        setLoading(true);
        try {
            if (tab === 'suggest') {
                const res = await connectService.getSuggestions({ page: p, limit: 9 });
                setCandidates(res.data?.data ?? []);
                setMeta(res.data?.meta ?? { total: 0, page: p, limit: 9, totalPages: 1 });
            } else {
                const res = await connectService.getSent({ status: tab, page: p, limit: 10 });
                setSentItems(res.data?.data ?? []);
                setMeta(res.data?.meta ?? { total: 0, page: p, limit: 10, totalPages: 1 });
            }
        } catch {
            toast.error('Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        fetchData(activeTab, 1);
    }, [activeTab, fetchData]);

    useEffect(() => {
        if (page > 1) fetchData(activeTab, page);
    }, [page, activeTab, fetchData]);

    const handleSkip = async (candidateUserId) => {
        setActionLoading(true);
        try {
            await connectService.skip(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
            toast.success('Đã bỏ qua ứng viên');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConnect = async (candidateUserId) => {
        setActionLoading(true);
        try {
            await connectService.request(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
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
                    Kết nối ứng viên
                </h1>
                <p style={{ fontSize: '13px', color: '#64748b' }}>
                    Ứng viên phù hợp với ngành của bạn — gửi lời kết nối để bắt đầu trò chuyện
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '20px', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.06)' }}>
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: '9px 6px', border: 'none', borderRadius: '9px',
                            background: activeTab === tab.key ? 'white' : 'transparent',
                            color: activeTab === tab.key ? GREEN : '#64748b',
                            fontSize: '12px', fontWeight: activeTab === tab.key ? '700' : '500',
                            cursor: 'pointer', transition: 'all 0.15s',
                            boxShadow: activeTab === tab.key ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            {!loading && (
                <div style={{
                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                    padding: '14px 20px', marginBottom: '20px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        <strong style={{ color: '#111827' }}>{meta.total}</strong>{' '}
                        {activeTab === 'suggest' ? 'ứng viên phù hợp' : 'lời mời'}
                    </span>
                    {meta.totalPages > 1 && (
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Trang {meta.page}/{meta.totalPages}
                        </span>
                    )}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '14px' }}>Đang tải...</div>
            ) : activeTab === 'suggest' ? (
                candidates.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                    }}>
                        <UserCheck size={48} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            Không có ứng viên nào
                        </div>
                        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                            Bạn đã xem qua tất cả ứng viên phù hợp. Hãy quay lại sau!
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '16px', marginBottom: '24px',
                    }}>
                        {candidates.map(c => (
                            <CandidateCard
                                key={c.userId}
                                candidate={c}
                                onSkip={handleSkip}
                                onConnect={handleConnect}
                                loading={actionLoading}
                                onViewDetail={setDetailUserId}
                            />
                        ))}
                    </div>
                )
            ) : (
                sentItems.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                    }}>
                        <UserCheck size={48} color="#d1d5db" style={{ margin: '0 auto 12px', display: 'block' }} />
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            Không có lời mời nào
                        </div>
                        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                            {activeTab === 'PENDING' ? 'Chưa có lời mời đang chờ phản hồi.' : 'Không có dữ liệu trong mục này.'}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                        {sentItems.map(item => (
                            <SentCard key={item.id} item={item} />
                        ))}
                    </div>
                )
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

            {/* Candidate detail modal */}
            {detailUserId && (
                <CandidateDetailModal
                    candidateUserId={detailUserId}
                    onClose={() => setDetailUserId(null)}
                    onSkip={handleSkip}
                    onConnect={handleConnect}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
}
