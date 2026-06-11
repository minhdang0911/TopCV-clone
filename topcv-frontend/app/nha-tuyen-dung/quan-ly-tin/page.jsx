'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { PlusCircle, Pencil, Trash2, ToggleLeft, ToggleRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { employerDashboardService } from '@/services/employer-dashboard.service';

const GREEN = '#00b14f';

function formatDeadline(date) {
    if (!date) return '—';
    const d = new Date(date);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    const label = d.toLocaleDateString('vi-VN');
    if (diff < 0) return <span style={{ color: '#ef4444' }}>{label} (hết hạn)</span>;
    if (diff <= 3) return <span style={{ color: '#f97316' }}>{label} (còn {diff}n)</span>;
    return label;
}

export default function QuanLyTinPage() {
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [toggling, setToggling] = useState(null);

    const fetchJobs = useCallback(() => {
        setLoading(true);
        employerDashboardService.getMyJobs({ page, limit: 10, search: search || undefined })
            .then(res => {
                setJobs(res.data.data || []);
                setMeta(res.data.meta || { total: 0, totalPages: 1, page: 1 });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [page, search]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const handleToggle = async (id) => {
        setToggling(id);
        try {
            await employerDashboardService.toggleActive(id);
            fetchJobs();
            toast.success('Đã cập nhật trạng thái tin');
        } catch (e) {
            toast.error('Lỗi khi thay đổi trạng thái');
        } finally {
            setToggling(null);
        }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Xoá tin "${title}"? Không thể hoàn tác.`)) return;
        setDeleting(id);
        try {
            await employerDashboardService.deleteJob(id);
            fetchJobs();
            toast.success('Đã xoá tin tuyển dụng');
        } catch (e) {
            toast.error('Lỗi khi xoá tin');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Quản lý tin tuyển dụng</h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                        {meta.total} tin đã đăng
                    </p>
                </div>
                <Link href="/nha-tuyen-dung/dang-tin" style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: GREEN, color: 'white', padding: '9px 18px',
                    borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                }}>
                    <PlusCircle size={16} />
                    Đăng tin mới
                </Link>
            </div>

            {/* Search */}
            <div style={{ background: 'white', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e5e7eb', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 12px' }}>
                    <Search size={16} color="#9ca3af" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
                        placeholder="Tìm theo tiêu đề..."
                        style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#111827', background: 'transparent' }}
                    />
                </div>
                <button
                    onClick={() => { setSearch(searchInput); setPage(1); }}
                    style={{ background: GREEN, color: 'white', border: 'none', borderRadius: '8px', padding: '9px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
                >
                    Tìm
                </button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
                        <div style={{ width: '32px', height: '32px', border: `3px solid #e5e7eb`, borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ) : !jobs.length ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>Chưa có tin tuyển dụng nào</p>
                        <p style={{ fontSize: '13px', marginTop: '4px' }}>Hãy đăng tin đầu tiên của bạn</p>
                        <Link href="/nha-tuyen-dung/dang-tin" style={{ display: 'inline-block', marginTop: '16px', background: GREEN, color: 'white', padding: '9px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                            Đăng tin ngay
                        </Link>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                {['Tiêu đề', 'Lương', 'Địa điểm', 'Hạn nộp', 'Trạng thái', 'Thao tác'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job, idx) => (
                                <tr key={job.id} style={{ borderBottom: idx < jobs.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                    <td style={{ padding: '14px 16px', maxWidth: '260px' }}>
                                        <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} style={{ fontSize: '14px', fontWeight: '600', color: '#111827', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                            {job.title}
                                        </Link>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: GREEN, fontWeight: '600', whiteSpace: 'nowrap' }}>
                                        {job.salaryType === 'negotiable' ? 'Thỏa thuận'
                                            : job.salaryMin && job.salaryMax ? `${job.salaryMin / 1e6}–${job.salaryMax / 1e6}tr`
                                            : '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                                        {job.locations?.length > 0
                                            ? job.locations.map(l => l.provinceName).filter(Boolean).join(', ')
                                            : job.provinceName || '—'}
                                    </td>
                                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>
                                        {formatDeadline(job.deadline)}
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <button
                                            onClick={() => handleToggle(job.id)}
                                            disabled={toggling === job.id}
                                            style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: job.isActive ? GREEN : '#9ca3af', padding: 0 }}
                                        >
                                            {job.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                            {job.isActive ? 'Hiển thị' : 'Tạm ẩn'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} style={{
                                                width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e5e7eb',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', textDecoration: 'none',
                                            }}>
                                                <Pencil size={14} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(job.id, job.title)}
                                                disabled={deleting === job.id}
                                                style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #fee2e2', background: '#fff5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e5e7eb', background: page === 1 ? '#f9fafb' : 'white', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#d1d5db' : '#374151' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <span style={{ fontSize: '14px', color: '#374151' }}>
                        <strong>{page}</strong> / {meta.totalPages}
                    </span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #e5e7eb', background: page === meta.totalPages ? '#f9fafb' : 'white', cursor: page === meta.totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === meta.totalPages ? '#d1d5db' : '#374151' }}>
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}
