'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    FileText, X, ChevronLeft, ChevronRight, Briefcase,
    MapPin, DollarSign, ExternalLink, ChevronDown, ChevronUp,
} from 'lucide-react';
import { connectService } from '@/services/connect.service';

const GREEN = '#00b14f';

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

function ProfileCard({ candidate, onDismiss, dismissing }) {
    const [expanded, setExpanded] = useState(false);
    const prefs = candidate.jobPreferences || {};
    const letter = (candidate.fullName || '?')[0].toUpperCase();

    const cvHref = candidate.cvType === 'uploaded'
        ? candidate.cvFileUrl
        : candidate.defaultCvId ? `/xem-cv/${candidate.defaultCvId}` : null;

    return (
        <div style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
            overflow: 'hidden', transition: 'box-shadow 0.15s',
        }}>
            {/* Header row */}
            <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Avatar */}
                <div style={{
                    width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                    border: '2px solid #e5e7eb', overflow: 'hidden',
                    background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontWeight: '700', fontSize: '20px', color: GREEN }}>{letter}</span>
                    }
                </div>

                {/* Name + title */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>
                        {candidate.fullName || 'Ứng viên'}
                    </div>
                    {prefs.jobTitle && (
                        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Briefcase size={11} />
                            {prefs.jobTitle}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {/* Xem CV */}
                    {cvHref && (
                        <a
                            href={cvHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                padding: '6px 12px', border: `1px solid ${GREEN}`,
                                borderRadius: '8px', color: GREEN, fontSize: '12px',
                                fontWeight: '600', textDecoration: 'none',
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
                        onClick={() => setExpanded(v => !v)}
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
                                        {prefs.provinceName || (prefs.provinceCodes?.join(', '))}
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
    const [page, setPage] = useState(1);

    const fetchCandidates = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await connectService.getSuggestions({ page: p, limit: 12 });
            setCandidates(res.data?.data ?? []);
            setMeta(res.data?.meta ?? { total: 0, page: p, limit: 12, totalPages: 1 });
        } catch {
            toast.error('Không thể tải danh sách hồ sơ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCandidates(page); }, [page, fetchCandidates]);

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

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Hồ sơ ứng viên
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    Ứng viên đang tìm việc, bật cho phép NTD tìm kiếm. Nhấn để xem chi tiết hoặc xóa khỏi danh sách.
                </p>
            </div>

            {/* Stats bar */}
            <div style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '14px 20px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
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
        </div>
    );
}
