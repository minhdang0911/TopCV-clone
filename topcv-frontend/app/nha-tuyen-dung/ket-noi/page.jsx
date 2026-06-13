'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UserCheck, UserX, ChevronLeft, ChevronRight, FileText, Briefcase } from 'lucide-react';
import { connectService } from '@/services/connect.service';

const GREEN = '#00b14f';

function CandidateCard({ candidate, onSkip, onConnect, loading }) {
    return (
        <div style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: '#f0fdf4', border: '2px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, overflow: 'hidden',
                }}>
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontWeight: '700', fontSize: '20px', color: GREEN }}>{(candidate.fullName || '?')[0].toUpperCase()}</span>
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '2px' }}>
                        {candidate.fullName || 'Ứng viên'}
                    </div>
                    {candidate.jobPreferences?.jobTitle && (
                        <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Briefcase size={11} />
                            {candidate.jobPreferences.jobTitle}
                        </div>
                    )}
                </div>
            </div>

            {/* CV info */}
            {candidate.cvTitle && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    background: '#f9fafb', borderRadius: '8px', padding: '10px 12px',
                    border: '1px solid #f3f4f6',
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
                    {candidate.cvType === 'uploaded' && candidate.cvFileUrl && (
                        <a href={candidate.cvFileUrl} target="_blank" rel="noopener noreferrer"
                            style={{ fontSize: '11px', color: GREEN, textDecoration: 'none', fontWeight: '600', flexShrink: 0 }}>
                            Xem
                        </a>
                    )}
                    {candidate.cvType !== 'uploaded' && candidate.defaultCvId && (
                        <a href={`/xem-cv/${candidate.defaultCvId}`} target="_blank" rel="noopener noreferrer"
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
                        flex: 1, padding: '9px 0', border: '1px solid #e5e7eb', borderRadius: '8px',
                        background: 'white', color: '#6b7280', fontSize: '13px', fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                >
                    <UserX size={15} />
                    Bỏ qua
                </button>
                <button
                    onClick={() => onConnect(candidate.userId)}
                    disabled={loading}
                    style={{
                        flex: 2, padding: '9px 0', border: 'none', borderRadius: '8px',
                        background: loading ? '#d1d5db' : GREEN, color: 'white', fontSize: '13px',
                        fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                >
                    <UserCheck size={15} />
                    Kết nối
                </button>
            </div>
        </div>
    );
}

export default function KetNoiPage() {
    const [candidates, setCandidates] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);

    const fetchSuggestions = useCallback(async (p = 1) => {
        setLoading(true);
        try {
            const res = await connectService.getSuggestions({ page: p, limit: 9 });
            setCandidates(res.data?.data ?? []);
            setMeta(res.data?.meta ?? { total: 0, page: p, limit: 9, totalPages: 1 });
        } catch {
            toast.error('Không thể tải danh sách ứng viên');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchSuggestions(page); }, [page, fetchSuggestions]);

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
                <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    Kết nối ứng viên
                </h1>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    Ứng viên đang tìm việc, phù hợp với ngành của bạn. Gửi lời kết nối để bắt đầu trò chuyện.
                </p>
            </div>

            {/* Stats bar */}
            <div style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '14px 20px', marginBottom: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    Tìm thấy <strong style={{ color: '#111827' }}>{meta.total}</strong> ứng viên phù hợp
                </span>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                    Trang {meta.page}/{meta.totalPages}
                </span>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '14px' }}>
                    Đang tải...
                </div>
            ) : candidates.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                }}>
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                        <UserCheck size={48} color="#d1d5db" style={{ margin: '0 auto' }} />
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Không có ứng viên nào
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                        Bạn đã xem qua tất cả ứng viên phù hợp. Hãy quay lại sau!
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '16px',
                    marginBottom: '24px',
                }}>
                    {candidates.map(c => (
                        <CandidateCard
                            key={c.userId}
                            candidate={c}
                            onSkip={handleSkip}
                            onConnect={handleConnect}
                            loading={actionLoading}
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
