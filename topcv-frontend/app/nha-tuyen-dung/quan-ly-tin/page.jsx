'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    PlusCircle, Pencil, Trash2, ToggleLeft, ToggleRight,
    Search, ChevronLeft, ChevronRight, Briefcase, MapPin,
    DollarSign, Calendar, LayoutList, LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';
import { employerDashboardService } from '@/services/employer-dashboard.service';

const GREEN = '#00b14f';

function formatDeadline(date) {
    if (!date) return null;
    const d = new Date(date);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    const label = d.toLocaleDateString('vi-VN');
    if (diff < 0) return { text: `${label}`, color: '#ef4444' };
    if (diff <= 3) return { text: `${label} (${diff}n)`, color: '#f97316' };
    return { text: label, color: '#64748b' };
}

function statusInfo(job) {
    const isExpired = job.deadline && new Date(job.deadline) < new Date();
    if (!job.isActive) return { label: 'Tạm ẩn', color: '#d97706', bg: '#fef3c7' };
    if (isExpired) return { label: 'Hết hạn', color: '#ef4444', bg: '#fee2e2' };
    return { label: 'Đang hiển thị', color: GREEN, bg: '#dcfce7' };
}

function salaryText(job) {
    if (job.salaryType === 'negotiable') return 'Thỏa thuận';
    if (job.salaryMin && job.salaryMax) return `${job.salaryMin / 1e6}–${job.salaryMax / 1e6}tr`;
    return null;
}

function locationText(job) {
    return job.locations?.length > 0
        ? job.locations.map(l => l.provinceName).filter(Boolean).join(', ')
        : job.provinceName || null;
}

// ── Table view ─────────────────────────────────────────────────────────────────
function JobTable({ jobs, onToggle, onDelete, toggling, deleting }) {
    return (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Tiêu đề', 'Trạng thái', 'Lương', 'Địa điểm', 'Hạn nộp', 'Hành động'].map(h => (
                            <th key={h} style={{
                                padding: '10px 14px', textAlign: 'left',
                                fontSize: '11px', fontWeight: '700', color: '#64748b',
                                textTransform: 'uppercase', letterSpacing: '0.03em', whiteSpace: 'nowrap',
                            }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {jobs.map((job, idx) => {
                        const st = statusInfo(job);
                        const deadline = formatDeadline(job.deadline);
                        const salary = salaryText(job);
                        const location = locationText(job);
                        return (
                            <tr key={job.id} style={{
                                borderBottom: idx < jobs.length - 1 ? '1px solid #f1f5f9' : 'none',
                                background: 'white',
                            }}>
                                <td style={{ padding: '12px 14px', minWidth: '200px', maxWidth: '280px' }}>
                                    <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} style={{
                                        fontWeight: '600', color: '#0f172a', textDecoration: 'none',
                                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                    }}>
                                        {job.title}
                                    </Link>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                        {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                    </div>
                                </td>
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                    <span style={{
                                        fontSize: '11px', fontWeight: '700', padding: '3px 9px',
                                        borderRadius: '20px', background: st.bg, color: st.color,
                                    }}>
                                        {st.label}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 14px', color: salary ? GREEN : '#d1d5db', fontWeight: '600', whiteSpace: 'nowrap' }}>
                                    {salary || '—'}
                                </td>
                                <td style={{ padding: '12px 14px', color: '#374151', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {location || <span style={{ color: '#d1d5db' }}>—</span>}
                                </td>
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap', color: deadline?.color || '#94a3b8' }}>
                                    {deadline?.text || '—'}
                                </td>
                                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                        <button
                                            onClick={() => onToggle(job.id)}
                                            disabled={toggling === job.id}
                                            title={job.isActive ? 'Tạm ẩn' : 'Hiển thị'}
                                            style={{
                                                display: 'flex', alignItems: 'center',
                                                background: 'none', border: 'none',
                                                cursor: toggling === job.id ? 'not-allowed' : 'pointer',
                                                color: job.isActive ? GREEN : '#94a3b8', padding: '2px',
                                            }}
                                        >
                                            {job.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                        </button>
                                        <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            padding: '5px 10px', borderRadius: '7px',
                                            border: '1px solid #e2e8f0', color: '#374151',
                                            textDecoration: 'none', fontSize: '12px', fontWeight: '600',
                                            background: 'white',
                                        }}>
                                            <Pencil size={12} /> Sửa
                                        </Link>
                                        <button
                                            onClick={() => onDelete(job.id, job.title)}
                                            disabled={deleting === job.id}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '5px 10px', borderRadius: '7px',
                                                border: '1px solid #fee2e2', color: '#ef4444',
                                                background: '#fff5f5', fontSize: '12px', fontWeight: '600',
                                                cursor: deleting === job.id ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <Trash2 size={12} /> Xóa
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ── Card view ──────────────────────────────────────────────────────────────────
function JobCard({ job, onToggle, onDelete, toggling, deleting }) {
    const st = statusInfo(job);
    const deadline = formatDeadline(job.deadline);
    const salary = salaryText(job);
    const location = locationText(job);

    return (
        <div style={{
            background: 'white', borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '14px 16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} style={{
                        fontSize: '14px', fontWeight: '700', color: '#0f172a',
                        textDecoration: 'none', display: 'block',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {job.title}
                    </Link>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                        Đăng ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                </div>
                <span style={{
                    fontSize: '11px', fontWeight: '700', padding: '3px 9px',
                    borderRadius: '20px', background: st.bg, color: st.color, flexShrink: 0,
                }}>
                    {st.label}
                </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {salary && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <DollarSign size={12} color="#9ca3af" />
                        <span style={{ fontWeight: '600', color: GREEN }}>{salary}</span>
                    </div>
                )}
                {location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#374151' }}>
                        <MapPin size={12} color="#9ca3af" />{location}
                    </div>
                )}
                {deadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        <Calendar size={12} color="#9ca3af" />
                        <span style={{ color: deadline.color, fontWeight: '500' }}>{deadline.text}</span>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                <button
                    onClick={() => onToggle(job.id)}
                    disabled={toggling === job.id}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'none', border: 'none', cursor: toggling === job.id ? 'not-allowed' : 'pointer',
                        fontSize: '12px', fontWeight: '600', color: job.isActive ? GREEN : '#94a3b8', padding: '4px 0',
                    }}
                >
                    {job.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    {job.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', borderRadius: '7px', border: '1px solid #e2e8f0',
                        color: '#374151', textDecoration: 'none', fontSize: '12px', fontWeight: '600', background: 'white',
                    }}>
                        <Pencil size={12} /> Sửa
                    </Link>
                    <button
                        onClick={() => onDelete(job.id, job.title)}
                        disabled={deleting === job.id}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '5px 10px', borderRadius: '7px',
                            border: '1px solid #fee2e2', color: '#ef4444', background: '#fff5f5',
                            fontSize: '12px', fontWeight: '600', cursor: deleting === job.id ? 'not-allowed' : 'pointer',
                        }}
                    >
                        <Trash2 size={12} /> Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function QuanLyTinPage() {
    const [jobs, setJobs] = useState([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [deleting, setDeleting] = useState(null);
    const [toggling, setToggling] = useState(null);
    const [viewMode, setViewMode] = useState('table');

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
        } catch {
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
        } catch {
            toast.error('Lỗi khi xoá tin');
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Quản lý tin tuyển dụng</h1>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{meta.total} tin đã đăng</p>
                </div>
                <Link href="/nha-tuyen-dung/dang-tin" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    background: `linear-gradient(135deg, ${GREEN}, #00934a)`,
                    color: 'white', padding: '9px 18px',
                    borderRadius: '9px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: '600',
                }}>
                    <PlusCircle size={16} /> Đăng tin mới
                </Link>
            </div>

            {/* Search + view toggle */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '9px',
                    padding: '8px 14px',
                }}>
                    <Search size={15} color="#94a3b8" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
                        placeholder="Tìm theo tiêu đề tin..."
                        style={{ border: 'none', outline: 'none', flex: 1, fontSize: '14px', color: '#0f172a', background: 'transparent' }}
                    />
                </div>
                <button
                    onClick={() => { setSearch(searchInput); setPage(1); }}
                    style={{
                        background: GREEN, color: 'white', border: 'none', borderRadius: '9px',
                        padding: '9px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                    }}
                >
                    Tìm
                </button>

                {/* View toggle */}
                <div style={{
                    display: 'flex', border: '1px solid #e2e8f0', borderRadius: '9px',
                    overflow: 'hidden', background: 'white',
                }}>
                    <button
                        onClick={() => setViewMode('table')}
                        title="Dạng bảng"
                        style={{
                            display: 'flex', alignItems: 'center', padding: '8px 12px', border: 'none',
                            background: viewMode === 'table' ? '#f0fdf4' : 'white',
                            color: viewMode === 'table' ? GREEN : '#6b7280',
                            cursor: 'pointer', borderRight: '1px solid #e2e8f0',
                        }}
                    >
                        <LayoutList size={17} />
                    </button>
                    <button
                        onClick={() => setViewMode('card')}
                        title="Dạng thẻ"
                        style={{
                            display: 'flex', alignItems: 'center', padding: '8px 12px', border: 'none',
                            background: viewMode === 'card' ? '#f0fdf4' : 'white',
                            color: viewMode === 'card' ? GREEN : '#6b7280',
                            cursor: 'pointer',
                        }}
                    >
                        <LayoutGrid size={17} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0', gap: '10px', color: '#94a3b8' }}>
                    <div style={{ width: '28px', height: '28px', border: '3px solid #e2e8f0', borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>
            ) : !jobs.length ? (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
                }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <Briefcase size={26} color="#94a3b8" />
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#374151', margin: '0 0 6px' }}>Chưa có tin tuyển dụng nào</p>
                    <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 18px' }}>Hãy đăng tin đầu tiên của bạn</p>
                    <Link href="/nha-tuyen-dung/dang-tin" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: `linear-gradient(135deg, ${GREEN}, #00934a)`,
                        color: 'white', padding: '9px 22px',
                        borderRadius: '9px', textDecoration: 'none', fontSize: '14px', fontWeight: '600',
                    }}>
                        <PlusCircle size={16} /> Đăng tin ngay
                    </Link>
                </div>
            ) : viewMode === 'table' ? (
                <div style={{ overflowX: 'auto' }}>
                    <JobTable
                        jobs={jobs}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        toggling={toggling}
                        deleting={deleting}
                    />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            toggling={toggling}
                            deleting={deleting}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                    <button
                        onClick={() => setPage(p => p - 1)} disabled={page === 1}
                        style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            border: '1px solid #e2e8f0', background: page === 1 ? '#f8fafc' : 'white',
                            cursor: page === 1 ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: page === 1 ? '#cbd5e1' : '#374151',
                        }}
                    >
                        <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        const p = i + 1;
                        return (
                            <button key={p} onClick={() => setPage(p)}
                                style={{
                                    width: '34px', height: '34px', borderRadius: '8px',
                                    border: `1px solid ${p === page ? GREEN : '#e2e8f0'}`,
                                    background: p === page ? GREEN : 'white',
                                    color: p === page ? 'white' : '#374151',
                                    fontSize: '13px', fontWeight: p === page ? '700' : '400',
                                    cursor: 'pointer',
                                }}
                            >
                                {p}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages}
                        style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            border: '1px solid #e2e8f0', background: page === meta.totalPages ? '#f8fafc' : 'white',
                            cursor: page === meta.totalPages ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: page === meta.totalPages ? '#cbd5e1' : '#374151',
                        }}
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            )}
        </div>
    );
}
