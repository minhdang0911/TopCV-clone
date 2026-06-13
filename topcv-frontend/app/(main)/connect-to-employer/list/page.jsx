'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Building2, CheckCircle, XCircle, Clock, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { connectService } from '@/services/connect.service';
import useAuthStore from '@/stores/auth.store';
import Link from 'next/link';

const GREEN = '#00b14f';

const STATUS_TABS = [
    { key: 'PENDING', label: 'Chờ phản hồi' },
    { key: 'CONNECTED', label: 'Đã kết nối' },
    { key: 'REJECTED', label: 'Đã từ chối' },
];

function StatusBadge({ status }) {
    const map = {
        PENDING:   { label: 'Đang chờ', color: '#d97706', bg: '#fef3c7' },
        CONNECTED: { label: 'Đã kết nối', color: '#059669', bg: '#d1fae5' },
        REJECTED:  { label: 'Đã từ chối', color: '#dc2626', bg: '#fee2e2' },
    };
    const s = map[status] || map.PENDING;
    return (
        <span style={{
            padding: '3px 10px', borderRadius: '20px',
            background: s.bg, color: s.color, fontSize: '11px', fontWeight: '600',
        }}>
            {s.label}
        </span>
    );
}

function RequestCard({ item, onAccept, onReject, accepting, rejecting }) {
    const isActing = accepting || rejecting;
    const logoLetter = (item.employer?.companyName || '?')[0].toUpperCase();

    return (
        <div style={{
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
            {/* Employer info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '10px',
                    border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: '#f9fafb',
                }}>
                    {item.employer?.logoUrl
                        ? <img src={item.employer.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <span style={{ fontWeight: '700', fontSize: '18px', color: GREEN }}>{logoLetter}</span>
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#111827', marginBottom: '4px' }}>
                        {item.employer?.slug
                            ? <Link href={`/cong-ty/${item.employer.slug}`} style={{ color: '#111827', textDecoration: 'none' }}>
                                {item.employer.companyName}
                              </Link>
                            : item.employer?.companyName
                        }
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <StatusBadge status={item.status} />
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions for PENDING */}
            {item.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onReject(item.id)}
                        disabled={isActing}
                        style={{
                            flex: 1, padding: '9px 0', border: '1px solid #e5e7eb', borderRadius: '8px',
                            background: 'white', color: '#6b7280', fontSize: '13px', fontWeight: '600',
                            cursor: isActing ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        <XCircle size={15} />
                        {rejecting ? 'Đang xử lý...' : 'Từ chối'}
                    </button>
                    <button
                        onClick={() => onAccept(item.id)}
                        disabled={isActing}
                        style={{
                            flex: 2, padding: '9px 0', border: 'none', borderRadius: '8px',
                            background: isActing ? '#d1d5db' : GREEN, color: 'white', fontSize: '13px', fontWeight: '700',
                            cursor: isActing ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        <CheckCircle size={15} />
                        {accepting ? 'Đang xử lý...' : 'Chấp nhận'}
                    </button>
                </div>
            )}

            {/* Connected: go to chat */}
            {item.status === 'CONNECTED' && (
                <Link
                    href="/tin-nhan"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        padding: '9px 0', border: `1px solid ${GREEN}`, borderRadius: '8px',
                        color: GREEN, fontSize: '13px', fontWeight: '600', textDecoration: 'none',
                    }}
                >
                    <MessageSquare size={15} />
                    Nhắn tin
                </Link>
            )}
        </div>
    );
}

export default function ConnectListPage() {
    const { user, hydrated, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('PENDING');
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [actingId, setActingId] = useState(null);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated || user?.role !== 'CANDIDATE') {
            router.replace('/login');
        }
    }, [hydrated, isAuthenticated, user, router]);

    const fetchRequests = useCallback(async (status, p) => {
        setLoading(true);
        try {
            const res = await connectService.getMyRequests({ status, page: p, limit: 10 });
            setItems(res.data?.data ?? []);
            setMeta(res.data?.meta ?? { total: 0, page: p, limit: 10, totalPages: 1 });
        } catch {
            toast.error('Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            setPage(1);
            fetchRequests(activeTab, 1);
        }
    }, [activeTab, isAuthenticated, fetchRequests]);

    useEffect(() => {
        if (isAuthenticated && page > 1) {
            fetchRequests(activeTab, page);
        }
    }, [page, activeTab, isAuthenticated, fetchRequests]);

    const handleAccept = async (connectId) => {
        setActingId(connectId + '_accept');
        try {
            await connectService.accept(connectId);
            toast.success('Đã chấp nhận kết nối');
            setItems(prev => prev.filter(i => i.id !== connectId));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActingId(null);
        }
    };

    const handleReject = async (connectId) => {
        setActingId(connectId + '_reject');
        try {
            await connectService.reject(connectId);
            toast.success('Đã từ chối kết nối');
            setItems(prev => prev.filter(i => i.id !== connectId));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActingId(null);
        }
    };

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div style={{ maxWidth: '680px', margin: '0 auto', padding: '28px 16px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                Lời mời kết nối
            </h1>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                Nhà tuyển dụng quan tâm đến hồ sơ của bạn và muốn kết nối.
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '10px', padding: '4px', marginBottom: '20px' }}>
                {STATUS_TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            flex: 1, padding: '8px 4px', border: 'none', borderRadius: '8px',
                            background: activeTab === tab.key ? 'white' : 'transparent',
                            color: activeTab === tab.key ? '#111827' : '#6b7280',
                            fontSize: '12px', fontWeight: activeTab === tab.key ? '700' : '400',
                            cursor: 'pointer', transition: 'all 0.15s',
                            boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Count */}
            {!loading && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
                    {meta.total} lời mời · trang {meta.page}/{Math.max(1, meta.totalPages)}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: '14px' }}>Đang tải...</div>
            ) : items.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                }}>
                    <Building2 size={48} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Chưa có lời mời nào
                    </div>
                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                        {activeTab === 'PENDING' ? 'Bật tìm việc để nhà tuyển dụng thấy hồ sơ của bạn.' : 'Không có lời mời trong mục này.'}
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {items.map(item => (
                        <RequestCard
                            key={item.id}
                            item={item}
                            onAccept={handleAccept}
                            onReject={handleReject}
                            accepting={actingId === item.id + '_accept'}
                            rejecting={actingId === item.id + '_reject'}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
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
