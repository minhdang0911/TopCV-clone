'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    PlusCircle, Pencil, Trash2, ToggleLeft, ToggleRight,
    Search, ChevronLeft, ChevronRight, Briefcase, MapPin,
    DollarSign, Calendar, LayoutList, LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { employerDashboardService } from '@/services/employer-dashboard.service';
import ViewApplicantButton from '@/components/ViewApplicantButton';

const GREEN = '#00b14f';

function formatDeadline(date) {
    if (!date) return null;
    const d = new Date(date);
    const diff = Math.ceil((d.getTime() - Date.now()) / 86400000);
    const label = d.toLocaleDateString('vi-VN');
    if (diff < 0) return { text: label, cls: 'text-red-500' };
    if (diff <= 3) return { text: `${label} (${diff}n)`, cls: 'text-orange-500' };
    return { text: label, cls: 'text-slate-500' };
}

function statusInfo(job) {
    const isExpired = job.deadline && new Date(job.deadline) < new Date();
    if (!job.isActive) return { label: 'Tạm ẩn',       cls: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (isExpired)    return { label: 'Hết hạn',        cls: 'bg-red-50 text-red-600 border-red-200' };
    return                  { label: 'Đang hiển thị',  cls: 'bg-green-50 text-green-700 border-green-200' };
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

// Table view
function JobTable({ jobs, onToggle, onDelete, toggling, deleting }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {['Tiêu đề', 'Trạng thái', 'Lương', 'Địa điểm', 'Hạn nộp', 'Hành động'].map(h => (
                                <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
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
                                <tr key={job.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors`}>
                                    <td className="px-3.5 py-3 min-w-[200px] max-w-[280px]">
                                        <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} className="font-semibold text-slate-900 no-underline truncate block hover:text-green-600 transition-colors">
                                            {job.title}
                                        </Link>
                                        <div className="text-[11px] text-slate-400 mt-0.5">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</div>
                                    </td>
                                    <td className="px-3.5 py-3 whitespace-nowrap">
                                        <Badge variant="outline" className={`text-[11px] font-bold ${st.cls}`}>{st.label}</Badge>
                                    </td>
                                    <td className={`px-3.5 py-3 font-semibold whitespace-nowrap ${salary ? 'text-green-600' : 'text-slate-300'}`}>
                                        {salary || '—'}
                                    </td>
                                    <td className="px-3.5 py-3 text-slate-700 max-w-[160px] truncate">{location || <span className="text-slate-300">—</span>}</td>
                                    <td className={`px-3.5 py-3 whitespace-nowrap text-xs ${deadline?.cls || 'text-slate-400'}`}>{deadline?.text || '—'}</td>
                                    <td className="px-3.5 py-3 whitespace-nowrap">
                                        <div className="flex gap-1.5 items-center">
                                            <button
                                                onClick={() => onToggle(job.id)}
                                                disabled={toggling === job.id}
                                                title={job.isActive ? 'Tạm ẩn' : 'Hiển thị'}
                                                className={cn('flex items-center bg-none border-none cursor-pointer p-0.5 disabled:opacity-50', job.isActive ? 'text-green-500' : 'text-slate-400')}
                                            >
                                                {job.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                            </button>
                                            <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 no-underline text-xs font-semibold bg-white hover:bg-slate-50 transition-colors">
                                                <Pencil size={12} /> Sửa
                                            </Link>
                                            <ViewApplicantButton jobId={job.id} />
                                            <button
                                                onClick={() => onDelete(job.id, job.title)}
                                                disabled={deleting === job.id}
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-100 text-red-500 bg-red-50 text-xs font-semibold cursor-pointer hover:bg-red-100 transition-colors disabled:opacity-50"
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
        </div>
    );
}

// Card view
function JobCard({ job, onToggle, onDelete, toggling, deleting }) {
    const st = statusInfo(job);
    const deadline = formatDeadline(job.deadline);
    const salary = salaryText(job);
    const location = locationText(job);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2.5 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-2.5">
                <div className="flex-1 min-w-0">
                    <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} className="text-sm font-bold text-slate-900 no-underline truncate block hover:text-green-600 transition-colors">
                        {job.title}
                    </Link>
                    <div className="text-[11px] text-slate-400 mt-1">Đăng ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <Badge variant="outline" className={`text-[11px] font-bold shrink-0 ${st.cls}`}>{st.label}</Badge>
            </div>

            <div className="flex gap-3 flex-wrap">
                {salary && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                        <DollarSign size={12} className="text-slate-400" />{salary}
                    </div>
                )}
                {location && (
                    <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin size={12} className="text-slate-400" />{location}
                    </div>
                )}
                {deadline && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${deadline.cls}`}>
                        <Calendar size={12} className="text-slate-400" />{deadline.text}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                <button
                    onClick={() => onToggle(job.id)}
                    disabled={toggling === job.id}
                    className={cn('flex items-center gap-1.5 border-none cursor-pointer text-xs font-semibold bg-transparent p-0 disabled:opacity-50', job.isActive ? 'text-green-500' : 'text-slate-400')}
                >
                    {job.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    {job.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}
                </button>
                <div className="flex gap-1.5">
                    <ViewApplicantButton jobId={job.id} />
                    <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 no-underline text-xs font-semibold bg-white hover:bg-slate-50 transition-colors">
                        <Pencil size={12} /> Sửa
                    </Link>
                    <button
                        onClick={() => onDelete(job.id, job.title)}
                        disabled={deleting === job.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-100 text-red-500 bg-red-50 text-xs font-semibold cursor-pointer hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                        <Trash2 size={12} /> Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

// Main page
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
        } catch { toast.error('Lỗi khi thay đổi trạng thái'); }
        finally { setToggling(null); }
    };

    const handleDelete = async (id, title) => {
        if (!confirm(`Xoá tin "${title}"? Không thể hoàn tác.`)) return;
        setDeleting(id);
        try {
            await employerDashboardService.deleteJob(id);
            fetchJobs();
            toast.success('Đã xoá tin tuyển dụng');
        } catch { toast.error('Lỗi khi xoá tin'); }
        finally { setDeleting(null); }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 m-0">Quản lý tin tuyển dụng</h1>
                    <p className="text-sm text-slate-500 mt-1">{meta.total} tin đã đăng</p>
                </div>
                <Link href="/nha-tuyen-dung/dang-tin" className="inline-flex items-center gap-2 bg-gradient-to-br from-green-500 to-green-700 text-white px-4 py-2.5 rounded-xl no-underline text-sm font-semibold hover:opacity-90 transition-opacity">
                    <PlusCircle size={16} /> Đăng tin mới
                </Link>
            </div>

            {/* Search + view toggle */}
            <div className="flex gap-2.5 items-center">
                <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2">
                    <Search size={15} className="text-slate-400 shrink-0" />
                    <input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
                        placeholder="Tìm theo tiêu đề tin..."
                        className="border-none outline-none flex-1 text-sm text-slate-900 bg-transparent"
                    />
                </div>
                <button
                    onClick={() => { setSearch(searchInput); setPage(1); }}
                    className="bg-green-500 text-white border-none rounded-xl px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-green-600 transition-colors"
                >
                    Tìm
                </button>
                <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <button
                        onClick={() => setViewMode('table')}
                        title="Dạng bảng"
                        className={cn('flex items-center p-2.5 border-none cursor-pointer border-r border-slate-200', viewMode === 'table' ? 'bg-green-50 text-green-600' : 'bg-white text-slate-500 hover:bg-slate-50')}
                    >
                        <LayoutList size={17} />
                    </button>
                    <button
                        onClick={() => setViewMode('card')}
                        title="Dạng thẻ"
                        className={cn('flex items-center p-2.5 border-none cursor-pointer', viewMode === 'card' ? 'bg-green-50 text-green-600' : 'bg-white text-slate-500 hover:bg-slate-50')}
                    >
                        <LayoutGrid size={17} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="w-7 h-7 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
                </div>
            ) : !jobs.length ? (
                <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={26} className="text-slate-400" />
                    </div>
                    <p className="text-base font-bold text-slate-700 m-0 mb-1.5">Chưa có tin tuyển dụng nào</p>
                    <p className="text-sm text-slate-400 m-0 mb-5">Hãy đăng tin đầu tiên của bạn</p>
                    <Link href="/nha-tuyen-dung/dang-tin" className="inline-flex items-center gap-1.5 bg-gradient-to-br from-green-500 to-green-700 text-white px-5 py-2.5 rounded-xl no-underline text-sm font-semibold hover:opacity-90 transition-opacity">
                        <PlusCircle size={16} /> Đăng tin ngay
                    </Link>
                </div>
            ) : viewMode === 'table' ? (
                <JobTable jobs={jobs} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} deleting={deleting} />
            ) : (
                <div className="flex flex-col gap-2.5">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} deleting={deleting} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5">
                    <button
                        onClick={() => setPage(p => p - 1)} disabled={page === 1}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer disabled:cursor-default disabled:text-slate-300 disabled:bg-slate-50 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => i + 1).map(p => (
                        <button
                            key={p} onClick={() => setPage(p)}
                            className={cn('w-8 h-8 rounded-lg text-sm cursor-pointer border transition-colors', p === page ? 'border-green-500 bg-green-500 text-white font-bold' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50')}
                        >
                            {p}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer disabled:cursor-default disabled:text-slate-300 disabled:bg-slate-50 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <ChevronRight size={15} />
                    </button>
                </div>
            )}
        </div>
    );
}
