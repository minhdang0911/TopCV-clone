'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    CheckCircle, XCircle, Briefcase, X, MapPin, DollarSign,
    Calendar, Users, Building2, Tag, Clock, Eye, Loader2,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import {
    AdminTable, Badge, Pagination, PageHeader, RefreshButton,
    SearchInput, FilterSelect, FilterBar, Button,
} from '../_components/ui';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const JOB_TYPE_LABEL = {
    'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian',
    remote: 'Remote', internship: 'Thực tập', contract: 'Hợp đồng',
};
const WORKING_TYPE_LABEL = {
    TOAN_THOI_GIAN: 'Tại văn phòng', BAN_THOI_GIAN: 'Bán thời gian',
    REMOTE: 'Remote', FREELANCE: 'Freelance', THUC_TAP: 'Thực tập',
};
const LEVEL_LABEL = {
    NHAN_VIEN: 'Nhân viên', TRUONG_NHOM: 'Trưởng nhóm',
    TRUONG_PHO_PHONG: 'Trưởng/Phó phòng', QUAN_LY_GIAM_SAT: 'Quản lý/Giám sát',
    GIAM_DOC: 'Giám đốc', PHO_GIAM_DOC: 'Phó giám đốc',
    TRUONG_CHI_NHANH: 'Trưởng chi nhánh', THUC_TAP_SINH: 'Thực tập sinh',
};

function fmtSalary(job) {
    if (job.salaryType === 'negotiable' || (!job.salaryMin && !job.salaryMax)) return 'Thỏa thuận';
    const fmt = (v) => v ? `${(v / 1_000_000).toLocaleString('vi-VN')} triệu` : null;
    const min = fmt(job.salaryMin), max = fmt(job.salaryMax);
    if (min && max) return `${min} – ${max}`;
    return min || max || 'Thỏa thuận';
}

function renderMarkdown(md) {
    if (!md) return '';
    let s = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
    s = s.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    s = s.replace(/^- (.+)$/gm, '<li>$1</li>');
    s = s.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    s = s.replace(/((?:<li>[\s\S]*?<\/li>\n?)+)/g, '<ul>$1</ul>');
    s = s.split('\n\n').map(p => {
        p = p.trim();
        if (!p) return '';
        if (/^<(h[123]|ul|pre|blockquote)/.test(p)) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    return s;
}

// ─── Chip component ────────────────────────────────────────────────────────────
function Chip({ icon: Icon, children, color = 'slate' }) {
    const colors = {
        slate:   'bg-slate-100 text-slate-600',
        emerald: 'bg-emerald-50 text-emerald-700',
        violet:  'bg-violet-50 text-violet-700',
        amber:   'bg-amber-50 text-amber-700',
        sky:     'bg-sky-50 text-sky-700',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[color]}`}>
            {Icon && <Icon size={11} />}
            {children}
        </span>
    );
}

// ─── Job Detail Modal ──────────────────────────────────────────────────────────
function JobDetailModal({ jobId, onClose, onToggle, toggleLoading }) {
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        adminService.getJob(jobId)
            .then(res => { if (!cancelled) setJob(res.data); })
            .catch(() => { if (!cancelled) toast.error('Không thể tải thông tin tin tuyển dụng'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [jobId]);

    const locations = job?.locations?.length > 0
        ? job.locations.map(l => [l.districtName, l.provinceName].filter(Boolean).join(', ')).join(' • ')
        : job?.provinceName || '—';

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                            <Briefcase size={15} className="text-emerald-600" />
                        </div>
                        <span className="font-bold text-sm text-slate-900">Chi tiết tin tuyển dụng</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
                            <Loader2 size={20} className="animate-spin text-emerald-500" />
                            <span className="text-sm">Đang tải thông tin...</span>
                        </div>
                    ) : !job ? (
                        <div className="text-center py-20 text-slate-400 text-sm">Không thể tải thông tin</div>
                    ) : (
                        <div>
                            {/* Job title + company */}
                            <div className="px-6 pt-5 pb-4 border-b border-slate-100">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h2 className="text-lg font-bold text-slate-900 leading-snug">{job.title}</h2>
                                    <Badge type={job.isActive ? 'active' : 'inactive'} />
                                </div>
                                {job.employer && (
                                    <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                        <Building2 size={13} />
                                        <span className="font-medium">{job.employer.companyName || '—'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Meta chips */}
                            <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap gap-2">
                                <Chip icon={DollarSign} color="emerald">{fmtSalary(job)}</Chip>
                                {locations && <Chip icon={MapPin} color="sky">{locations}</Chip>}
                                {job.industry?.name && <Chip icon={Tag} color="violet">{job.industry.name}</Chip>}
                                {job.jobType && <Chip color="slate">{JOB_TYPE_LABEL[job.jobType] || job.jobType}</Chip>}
                                {job.workingType && <Chip color="slate">{WORKING_TYPE_LABEL[job.workingType] || job.workingType}</Chip>}
                                {job.level && <Chip color="amber">{LEVEL_LABEL[job.level] || job.level}</Chip>}
                            </div>

                            {/* Stats row */}
                            <div className="px-6 py-3 border-b border-slate-100 grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-slate-800">{job._count?.applications ?? 0}</div>
                                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                                        <Users size={11} /> Ứng viên
                                    </div>
                                </div>
                                <div className="text-center border-x border-slate-100">
                                    <div className="text-lg font-bold text-slate-800">{job.quantity ?? '—'}</div>
                                    <div className="text-[11px] text-slate-400 mt-0.5">Chỉ tiêu</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm font-bold text-slate-800">
                                        {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '—'}
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                                        <Calendar size={11} /> Deadline
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {job.description && (
                                <div className="px-6 py-5">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Mô tả công việc
                                    </div>
                                    <div
                                        className="jd-preview text-sm text-slate-700 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: renderMarkdown(job.description) }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer actions */}
                {job && (
                    <div className="px-6 py-4 border-t border-slate-100 flex gap-2.5 shrink-0">
                        <Button variant="outline" className="flex-1" onClick={onClose}>
                            Đóng
                        </Button>
                        <Button
                            className={`flex-[2] gap-2 ${job.isActive
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                            }`}
                            onClick={() => onToggle(job.id, job.title, job.isActive)}
                            disabled={toggleLoading}
                        >
                            {job.isActive
                                ? <><XCircle size={14} /> Vô hiệu hóa tin</>
                                : <><CheckCircle size={14} /> Kích hoạt tin</>
                            }
                        </Button>
                    </div>
                )}

                <style>{`
                    .jd-preview h1 { font-size: 17px; font-weight: 800; margin: 14px 0 6px; color: #111827; }
                    .jd-preview h2 { font-size: 15px; font-weight: 700; margin: 12px 0 5px; color: #111827; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
                    .jd-preview h3 { font-size: 14px; font-weight: 700; margin: 10px 0 4px; color: #374151; }
                    .jd-preview p { margin: 6px 0; }
                    .jd-preview ul { padding-left: 20px; margin: 6px 0; list-style: disc; }
                    .jd-preview li { margin: 3px 0; }
                    .jd-preview strong { font-weight: 700; }
                    .jd-preview em { font-style: italic; }
                    .jd-preview del { text-decoration: line-through; color: #9ca3af; }
                    .jd-preview blockquote { border-left: 3px solid #d1d5db; padding: 2px 12px; color: #6b7280; margin: 8px 0; font-style: italic; }
                    .jd-preview code { background: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-size: 12px; font-family: monospace; }
                    .jd-preview pre { background: #f3f4f6; padding: 10px 14px; border-radius: 8px; overflow-x: auto; margin: 10px 0; }
                    .jd-preview pre code { background: none; padding: 0; }
                `}</style>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminJobsPage() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [query,   setQuery]   = useState({ keyword: '', isActive: '', page: 1, limit: 10 });
    const [previewId, setPreviewId] = useState(null);
    const [toggleLoading, setToggleLoading] = useState(false);

    const load = useCallback(async (q = query) => {
        setLoading(true);
        try {
            const params = { page: q.page, limit: q.limit };
            if (q.keyword)         params.keyword  = q.keyword;
            if (q.isActive !== '') params.isActive = q.isActive;
            const res = await adminService.getJobs(params);
            setData(res.data);
        } catch { toast.error('Không thể tải danh sách tin'); }
        finally { setLoading(false); }
    }, [query]);

    useEffect(() => { load(); }, []);

    const handleToggle = async (id, title, isActive) => {
        if (!confirm(`${isActive ? 'Vô hiệu hóa' : 'Kích hoạt'} tin "${title}"?`)) return;
        setToggleLoading(true);
        try {
            const res = await adminService.toggleJobActive(id);
            toast.success(res.data?.message || 'Thành công');
            setPreviewId(null);
            load();
        } catch { toast.error('Thao tác thất bại'); }
        finally { setToggleLoading(false); }
    };

    const STATUS_OPTIONS = [
        { value: '__all__', label: 'Tất cả trạng thái' },
        { value: 'true',    label: 'Đang kích hoạt' },
        { value: 'false',   label: 'Không kích hoạt' },
    ];

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <PageHeader title="Tin tuyển dụng" sub={`${data?.total?.toLocaleString('vi-VN') ?? '—'} tin đăng`} />
                <RefreshButton onClick={() => load({ ...query, page: 1 })} loading={loading} />
            </div>

            <FilterBar onSubmit={() => load({ ...query, page: 1 })}>
                <SearchInput value={query.keyword} onChange={v => setQuery(q => ({ ...q, keyword: v }))} placeholder="Tên job, công ty..." />
                <FilterSelect
                    value={query.isActive || '__all__'}
                    onValueChange={v => setQuery(q => ({ ...q, isActive: v === '__all__' ? '' : v }))}
                    placeholder="Trạng thái"
                    options={STATUS_OPTIONS}
                />
            </FilterBar>

            <AdminTable headers={['Tin tuyển dụng', 'Công ty', 'Ngành nghề', 'Ứng viên', 'Deadline', 'Trạng thái', 'Thao tác']} loading={loading}>
                {data?.data?.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-[220px]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                    <Briefcase size={13} className="text-emerald-600" />
                                </div>
                                <span className="text-sm font-semibold text-slate-800 truncate">{j.title}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">{j.employer?.companyName || '—'}</td>
                        <td className="px-4 py-3">
                            {j.industry?.name
                                ? <span className="text-xs font-medium text-violet-700 bg-violet-50 border border-violet-100 px-2.5 py-1 rounded-full">{j.industry.name}</span>
                                : <span className="text-slate-400 text-xs">—</span>
                            }
                        </td>
                        <td className="px-4 py-3 text-center">
                            <span className="text-sm font-bold text-slate-700">{j._count?.applications ?? 0}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                            {j.deadline ? new Date(j.deadline).toLocaleDateString('vi') : '—'}
                        </td>
                        <td className="px-4 py-3"><Badge type={j.isActive ? 'active' : 'inactive'} /></td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                                {/* Nút xem chi tiết */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPreviewId(j.id)}
                                    className="h-8 gap-1 text-xs text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                >
                                    <Eye size={11} /> Xem
                                </Button>
                                {/* Nút toggle nhanh */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggle(j.id, j.title, j.isActive)}
                                    disabled={toggleLoading}
                                    className={`h-8 gap-1.5 text-xs ${j.isActive
                                        ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100'
                                        : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                                    }`}
                                >
                                    {j.isActive ? <><XCircle size={11} />Vô hiệu</> : <><CheckCircle size={11} />Kích hoạt</>}
                                </Button>
                            </div>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            <Pagination data={data} query={query} setQuery={setQuery} load={load} loading={loading} />

            {/* Job Detail Modal */}
            {previewId && (
                <JobDetailModal
                    jobId={previewId}
                    onClose={() => setPreviewId(null)}
                    onToggle={handleToggle}
                    toggleLoading={toggleLoading}
                />
            )}
        </div>
    );
}
