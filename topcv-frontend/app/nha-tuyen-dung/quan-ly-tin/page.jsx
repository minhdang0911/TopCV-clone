'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    PlusCircle, Pencil, Trash2, ToggleLeft, ToggleRight,
    MapPin, DollarSign, Calendar, LayoutList, LayoutGrid,
    RefreshCw, Briefcase, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { employerDashboardService } from '@/services/employer-dashboard.service';
import ViewApplicantButton from '@/components/ViewApplicantButton';

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
    return                  { label: 'Đang hiển thị',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
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

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function TableSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {['Tin tuyển dụng', 'Trạng thái', 'Lương', 'Địa điểm', 'Hạn nộp', 'Thao tác'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                <td className="px-4 py-3"><Skeleton className="h-4 w-48" /></td>
                                <td className="px-4 py-3"><Skeleton className="h-6 w-20 rounded-full" /></td>
                                <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                                <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                                <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                                <td className="px-4 py-3"><Skeleton className="h-8 w-32 rounded-lg" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Table View ───────────────────────────────────────────────────────────────
function JobTable({ jobs, onToggle, onDelete, toggling, deleting }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {['Tin tuyển dụng', 'Trạng thái', 'Lương', 'Địa điểm', 'Hạn nộp', 'Thao tác'].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {jobs.map(job => {
                            const st = statusInfo(job);
                            const deadline = formatDeadline(job.deadline);
                            const salary = salaryText(job);
                            const location = locationText(job);
                            return (
                                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 min-w-[200px] max-w-[280px]">
                                        <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`}
                                            className="font-semibold text-slate-900 no-underline truncate block hover:text-[#00b14f] transition-colors">
                                            {job.title}
                                        </Link>
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                            {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <Badge variant="outline" className={`text-[11px] font-semibold ${st.cls}`}>{st.label}</Badge>
                                    </td>
                                    <td className={`px-4 py-3 font-semibold whitespace-nowrap text-sm ${salary ? 'text-[#00b14f]' : 'text-slate-300'}`}>
                                        {salary || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-sm max-w-[160px] truncate">
                                        {location || <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-xs font-medium ${deadline?.cls || 'text-slate-400'}`}>
                                        {deadline?.text || '—'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex gap-1.5 items-center">
                                            <button onClick={() => onToggle(job.id)} disabled={toggling === job.id}
                                                title={job.isActive ? 'Tạm ẩn' : 'Hiển thị'}
                                                className={cn('p-0.5 rounded disabled:opacity-50 transition-colors',
                                                    job.isActive ? 'text-[#00b14f] hover:text-[#009944]' : 'text-slate-400 hover:text-slate-600')}>
                                                {job.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                            </button>
                                            <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 no-underline text-xs font-semibold bg-white hover:bg-slate-50 transition-colors">
                                                <Pencil size={11} /> Sửa
                                            </Link>
                                            <ViewApplicantButton jobId={job.id} />
                                            <button onClick={() => onDelete(job.id, job.title)} disabled={deleting === job.id}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-100 text-red-500 bg-red-50 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                                                <Trash2 size={11} /> Xóa
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

// ─── Card View ────────────────────────────────────────────────────────────────
function JobCard({ job, onToggle, onDelete, toggling, deleting }) {
    const st = statusInfo(job);
    const deadline = formatDeadline(job.deadline);
    const salary = salaryText(job);
    const location = locationText(job);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Briefcase size={16} className="text-[#00b14f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`}
                            className="text-sm font-bold text-slate-900 no-underline truncate block hover:text-[#00b14f] transition-colors">
                            {job.title}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                            Đăng ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>
                <Badge variant="outline" className={`text-[11px] font-semibold shrink-0 ${st.cls}`}>{st.label}</Badge>
            </div>

            <div className="flex gap-4 flex-wrap mb-3">
                {salary && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#00b14f]">
                        <DollarSign size={12} className="text-slate-400" />{salary}
                    </div>
                )}
                {location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <MapPin size={12} className="text-slate-400" />{location}
                    </div>
                )}
                {deadline && (
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${deadline.cls}`}>
                        <Calendar size={12} className="text-slate-400" />{deadline.text}
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button onClick={() => onToggle(job.id)} disabled={toggling === job.id}
                    className={cn('flex items-center gap-1.5 text-xs font-semibold bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 transition-colors',
                        job.isActive ? 'text-[#00b14f]' : 'text-slate-400')}>
                    {job.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {job.isActive ? 'Đang hiển thị' : 'Tạm ẩn'}
                </button>
                <div className="flex gap-1.5">
                    <ViewApplicantButton jobId={job.id} />
                    <Link href={`/nha-tuyen-dung/dang-tin/${job.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 no-underline text-xs font-semibold bg-white hover:bg-slate-50 transition-colors">
                        <Pencil size={11} /> Sửa
                    </Link>
                    <button onClick={() => onDelete(job.id, job.title)} disabled={deleting === job.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-100 text-red-500 bg-red-50 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50">
                        <Trash2 size={11} /> Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────────────────────────
import { ChevronLeft, ChevronRight } from 'lucide-react';

function JobPagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    const pages = [];
    const left  = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);
    if (left > 1) { pages.push(1); if (left > 2) pages.push('…'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push('…'); pages.push(totalPages); }

    return (
        <div className="flex justify-center items-center gap-1.5 mt-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(page - 1)} disabled={page === 1}>
                <ChevronLeft size={14} />
            </Button>
            {pages.map((p, i) =>
                p === '…' ? (
                    <span key={`e${i}`} className="px-1 text-slate-400 text-sm select-none">…</span>
                ) : (
                    <Button key={p} size="icon" onClick={() => p !== page && onChange(p)}
                        className={`h-8 w-8 text-xs ${p === page ? 'bg-[#00b14f] text-white hover:bg-[#009944]' : 'bg-white text-slate-600 border border-slate-200 hover:border-[#00b14f] hover:text-[#00b14f] hover:bg-white'}`}>
                        {p}
                    </Button>
                )
            )}
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onChange(page + 1)} disabled={page === totalPages}>
                <ChevronRight size={14} />
            </Button>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuanLyTinPage() {
    const [jobs,       setJobs]       = useState([]);
    const [meta,       setMeta]       = useState({ total: 0, totalPages: 1, page: 1 });
    const [loading,    setLoading]    = useState(true);
    const [page,       setPage]       = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search,     setSearch]     = useState('');
    const [deleting,   setDeleting]   = useState(null);
    const [toggling,   setToggling]   = useState(null);
    const [viewMode,   setViewMode]   = useState('table');

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

    const doSearch = () => { setSearch(searchInput); setPage(1); };

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Quản lý tin tuyển dụng</h1>
                    <p className="text-sm text-slate-400 mt-0.5">{meta.total} tin đã đăng</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading}
                        className="h-9 gap-1.5 border-slate-200 text-slate-600 hover:text-slate-900">
                        <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                        Làm mới
                    </Button>
                    <Link href="/nha-tuyen-dung/dang-tin">
                        <Button size="sm" className="h-9 gap-1.5 bg-[#00b14f] hover:bg-[#009944] text-white">
                            <PlusCircle size={14} /> Đăng tin mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Search + view toggle */}
            <div className="flex gap-2 items-center flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Input
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') doSearch(); }}
                        placeholder="Tìm theo tiêu đề tin tuyển dụng..."
                        className="h-9 text-sm border-slate-200 focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20"
                    />
                </div>
                <Button onClick={doSearch} size="sm" className="h-9 bg-[#00b14f] hover:bg-[#009944] text-white">
                    Tìm kiếm
                </Button>
                {/* View toggle */}
                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white ml-auto">
                    <button onClick={() => setViewMode('table')} title="Dạng bảng"
                        className={cn('flex items-center px-2.5 py-2 border-r border-slate-200 transition-colors',
                            viewMode === 'table' ? 'bg-[#00b14f]/10 text-[#00b14f]' : 'text-slate-500 hover:bg-slate-50')}>
                        <LayoutList size={16} />
                    </button>
                    <button onClick={() => setViewMode('card')} title="Dạng thẻ"
                        className={cn('flex items-center px-2.5 py-2 transition-colors',
                            viewMode === 'card' ? 'bg-[#00b14f]/10 text-[#00b14f]' : 'text-slate-500 hover:bg-slate-50')}>
                        <LayoutGrid size={16} />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <TableSkeleton />
            ) : !jobs.length ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={26} className="text-slate-400" />
                    </div>
                    <p className="text-base font-bold text-slate-700 mb-1.5">
                        {search ? `Không tìm thấy tin nào cho "${search}"` : 'Chưa có tin tuyển dụng nào'}
                    </p>
                    <p className="text-sm text-slate-400 mb-5">
                        {search ? 'Thử tìm với từ khóa khác' : 'Hãy đăng tin đầu tiên của bạn'}
                    </p>
                    {!search && (
                        <Link href="/nha-tuyen-dung/dang-tin">
                            <Button className="bg-[#00b14f] hover:bg-[#009944] text-white gap-2">
                                <PlusCircle size={15} /> Đăng tin ngay
                            </Button>
                        </Link>
                    )}
                </div>
            ) : viewMode === 'table' ? (
                <JobTable jobs={jobs} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} deleting={deleting} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} deleting={deleting} />
                    ))}
                </div>
            )}

            <JobPagination page={page} totalPages={meta.totalPages} onChange={p => setPage(p)} />
        </div>
    );
}
