'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, DollarSign, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { applicationsService } from '@/services/applications.service';
import useAuthStore from '@/stores/auth.store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSalary(min, max, type) {
    if (type === 'negotiable' || (!min && !max)) return 'Thỏa thuận';
    const fmt = (n) => (n / 1_000_000).toFixed(0) + 'tr';
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max)}`;
}

function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} ngày trước`;
    return new Date(iso).toLocaleDateString('vi-VN');
}

const STATUS_CONFIG = {
    PENDING:    { label: 'Chờ duyệt',    color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
    REVIEWING:  { label: 'Đang xem xét', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    INTERVIEW:  { label: 'Phỏng vấn',    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
    OFFERED:    { label: 'Nhận offer',   color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    REJECTED:   { label: 'Không phù hợp', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const FILTER_TABS = [
    { key: '', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ duyệt' },
    { key: 'REVIEWING', label: 'Đang xem xét' },
    { key: 'INTERVIEW', label: 'Phỏng vấn' },
    { key: 'OFFERED', label: 'Nhận offer' },
    { key: 'REJECTED', label: 'Không phù hợp' },
];

// ─── Application Card ────────────────────────────────────────────────────────

function ApplicationCard({ item, onWithdraw }) {
    const job = item.job || {};
    const employer = job.company || {};
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const locationText = job.locations?.length > 0
        ? job.locations.map(l => l.provinceName).filter(Boolean).join(' • ')
        : null;

    return (
        <div style={{
            background: 'white', borderRadius: '12px',
            border: '1px solid #e5e7eb', padding: '16px 20px',
            display: 'flex', gap: '14px', alignItems: 'flex-start',
            transition: 'border-color 0.15s, box-shadow 0.15s',
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#00b14f'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,177,79,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
        >
            {/* Logo */}
            <div style={{
                width: '52px', height: '52px', borderRadius: '8px',
                border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb',
            }}>
                {employer.logo
                    ? <img src={employer.logo} alt={employer.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    : <Building2 size={22} color="#9ca3af" />
                }
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <a
                        href={`/viec-lam/${job.slug || job.id}`}
                        style={{ fontSize: '15px', fontWeight: '700', color: '#111827', textDecoration: 'none', lineHeight: '1.3' }}
                        onMouseEnter={e => e.target.style.color = '#00b14f'}
                        onMouseLeave={e => e.target.style.color = '#111827'}
                    >
                        {job.title}
                    </a>
                    <span style={{
                        flexShrink: 0,
                        fontSize: '12px', fontWeight: '600', color: status.color,
                        background: status.bg, border: `1px solid ${status.border}`,
                        borderRadius: '20px', padding: '2px 10px',
                        whiteSpace: 'nowrap',
                    }}>
                        {status.label}
                    </span>
                </div>

                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                    {employer.companyName}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {(job.salaryMin || job.salaryMax || job.salaryType) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00b14f', fontWeight: '500' }}>
                            <DollarSign size={12} />
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                        </span>
                    )}
                    {locationText && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} />
                            {locationText}
                        </span>
                    )}
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        Nộp {timeAgo(item.createdAt)}
                    </span>
                    {item.resume && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            CV: {item.resume.title}
                        </span>
                    )}
                </div>

                {item.note && (
                    <div style={{ marginTop: '10px', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px', color: '#374151', borderLeft: '3px solid #94a3b8' }}>
                        <span style={{ fontWeight: '600', color: '#64748b' }}>Ghi chú từ NTD: </span>
                        {item.note}
                    </div>
                )}
            </div>

            {/* Actions */}
            {item.status === 'PENDING' && (
                <button
                    onClick={() => onWithdraw(item.id)}
                    title="Rút đơn ứng tuyển"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', flexShrink: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                    <Trash2 size={16} />
                </button>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppliedJobsPage() {
    const router = useRouter();
    const { isAuthenticated, role, hydrated } = useAuthStore();

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState('');
    const [withdrawing, setWithdrawing] = useState(null);

    const LIMIT = 10;

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated || role !== 'CANDIDATE') {
            router.push('/dang-nhap');
        }
    }, [hydrated, isAuthenticated, role]);

    const fetchApplications = () => {
        setLoading(true);
        const params = { page, limit: LIMIT };
        if (activeStatus) params.status = activeStatus;
        applicationsService.getMy(params)
            .then(res => {
                setItems(res.data?.data || []);
                setTotal(res.data?.total || 0);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchApplications();
    }, [page, activeStatus, isAuthenticated]);

    const handleWithdraw = async (id) => {
        if (!confirm('Bạn có chắc muốn rút đơn ứng tuyển này?')) return;
        setWithdrawing(id);
        try {
            await applicationsService.withdraw(id);
            setItems(prev => prev.filter(i => i.id !== id));
            setTotal(prev => prev - 1);
            toast.success('Đã rút đơn ứng tuyển');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setWithdrawing(null);
        }
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div style={{ minHeight: '80vh', padding: '24px 0' }}>
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 16px' }}>

                {/* Header */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>
                        Việc đã ứng tuyển
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {total > 0 ? `${total} đơn ứng tuyển` : 'Chưa có đơn ứng tuyển nào'}
                    </p>
                </div>

                {/* Status filter tabs */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {FILTER_TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveStatus(tab.key); setPage(1); }}
                            style={{
                                padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                                border: activeStatus === tab.key ? '1.5px solid #00b14f' : '1.5px solid #e5e7eb',
                                background: activeStatus === tab.key ? '#f0fdf4' : 'white',
                                color: activeStatus === tab.key ? '#00b14f' : '#6b7280',
                                cursor: 'pointer', transition: 'all 0.15s',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[1,2,3].map(i => (
                            <div key={i} style={{ background: 'white', borderRadius: '12px', height: '100px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        ))}
                        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
                    </div>
                ) : items.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '60px 20px',
                        background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>
                            {activeStatus ? 'Không có đơn nào ở trạng thái này' : 'Bạn chưa ứng tuyển vị trí nào'}
                        </p>
                        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 20px' }}>
                            Khám phá hàng nghìn việc làm phù hợp với bạn
                        </p>
                        <a
                            href="/viec-lam-tot-nhat"
                            style={{
                                display: 'inline-block', padding: '10px 24px',
                                background: '#00b14f', color: 'white',
                                borderRadius: '8px', textDecoration: 'none',
                                fontSize: '14px', fontWeight: '600',
                            }}
                        >
                            Tìm việc ngay
                        </a>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {items.map(item => (
                            <ApplicationCard
                                key={item.id}
                                item={item}
                                onWithdraw={handleWithdraw}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p}
                                onClick={() => setPage(p)}
                                style={{
                                    width: '36px', height: '36px', borderRadius: '8px',
                                    border: p === page ? '2px solid #00b14f' : '1px solid #e5e7eb',
                                    background: p === page ? '#f0fdf4' : 'white',
                                    color: p === page ? '#00b14f' : '#374151',
                                    fontWeight: p === page ? '700' : '400',
                                    fontSize: '14px', cursor: 'pointer',
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
