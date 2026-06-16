'use client';

import { useState } from 'react';
import { Users, X, ChevronRight, Clock, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { applicationsService } from '@/services/applications.service';

const GREEN = '#00b14f';

const STATUS_MAP = {
    pending:   { label: 'Chờ xem xét', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    reviewing: { label: 'Đang xem xét', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    interview: { label: 'Phỏng vấn',   cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    offer:     { label: 'Đề nghị',      cls: 'bg-purple-50 text-purple-700 border-purple-200' },
    accepted:  { label: 'Đã nhận',      cls: 'bg-green-50 text-green-700 border-green-200' },
    rejected:  { label: 'Từ chối',      cls: 'bg-red-50 text-red-600 border-red-200' },
};

function ApplicantModal({ jobId, onClose }) {
    const [apps, setApps] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useState(() => {
        applicationsService.getByJob(jobId, { limit: 50 })
            .then(res => setApps(res.data?.data || res.data || []))
            .catch(() => setError('Không thể tải danh sách ứng viên'))
            .finally(() => setLoading(false));
    });

    return (
        <div className="fixed inset-0 z-1000 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.18)] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Users size={18} className="text-green-600" />
                        <h2 className="text-base font-bold text-slate-900">
                            Danh sách ứng viên
                            {apps && <span className="ml-2 text-sm font-semibold text-slate-400">({apps.length})</span>}
                        </h2>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border-none cursor-pointer bg-transparent">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex justify-center py-12">
                            <div className="w-7 h-7 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-12 text-sm text-red-500">{error}</div>
                    )}
                    {apps && apps.length === 0 && (
                        <div className="text-center py-14">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <UserCircle size={24} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600 mb-1">Chưa có ứng viên nào</p>
                            <p className="text-xs text-slate-400">Khi có CV mới sẽ hiển thị ở đây</p>
                        </div>
                    )}
                    {apps && apps.length > 0 && (
                        <div className="divide-y divide-slate-50">
                            {apps.map(app => {
                                const profile = app.candidateProfile || app.user;
                                const name = profile?.fullName || profile?.name || 'Ứng viên';
                                const avatar = profile?.avatar;
                                const jobTitle = profile?.jobTitle || profile?.currentTitle || '';
                                const status = STATUS_MAP[app.status] || { label: app.status, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
                                const appliedAt = new Date(app.createdAt).toLocaleDateString('vi-VN');

                                return (
                                    <div key={app.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-green-50 to-green-100 border-2 border-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                                            {avatar
                                                ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
                                                : <span className="text-base font-extrabold text-green-600">{name[0]?.toUpperCase()}</span>
                                            }
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
                                            {jobTitle && <p className="text-xs text-slate-400 truncate">{jobTitle}</p>}
                                            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-slate-400">
                                                <Clock size={10} />
                                                {appliedAt}
                                            </div>
                                        </div>

                                        {/* Status + action */}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant="outline" className={cn('text-[10px] font-bold', status.cls)}>
                                                {status.label}
                                            </Badge>
                                            <Link
                                                href={`/nha-tuyen-dung/ho-so-ung-vien?applicationId=${app.id}`}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 no-underline transition-colors"
                                                title="Xem chi tiết"
                                                onClick={onClose}
                                            >
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {apps && apps.length > 0 && (
                    <div className="border-t border-slate-100 px-5 py-3 flex justify-end">
                        <Link
                            href={`/nha-tuyen-dung/ho-so-ung-vien?jobId=${jobId}`}
                            className="text-xs font-semibold no-underline px-4 py-2 rounded-lg border text-white"
                            style={{ background: GREEN, borderColor: GREEN }}
                            onClick={onClose}
                        >
                            Quản lý tất cả ứng viên
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// variant: 'compact' (table/card in quan-ly-tin) | 'inline' (job detail page)
export default function ViewApplicantButton({ jobId, variant = 'compact' }) {
    const [count, setCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const isInline = variant === 'inline';

    const handleClick = async () => {
        // If count already fetched, just open modal
        if (count !== null) { setModalOpen(true); return; }

        setLoading(true);
        try {
            const res = await applicationsService.getByJob(jobId, { limit: 1 });
            const total = res.data?.meta?.total ?? res.data?.total ?? (res.data?.data?.length ?? 0);
            setCount(total);
            setModalOpen(true);
        } catch {
            // Fallback: open modal anyway, let it fetch inside
            setCount(0);
            setModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                disabled={loading}
                className={cn(
                    'inline-flex items-center border border-solid cursor-pointer font-semibold whitespace-nowrap transition-colors',
                    isInline
                        ? 'gap-1.5 px-3.5 py-1.75 rounded-md text-[13px]'
                        : 'gap-1 px-2.5 py-1.5 rounded-lg text-xs',
                    count !== null
                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50',
                    loading && 'opacity-60 cursor-not-allowed'
                )}
            >
                <Users size={isInline ? 15 : 12} />
                {loading
                    ? '...'
                    : count !== null
                        ? `${count} ứng viên`
                        : 'Xem ứng viên'
                }
            </button>

            {modalOpen && (
                <ApplicantModal jobId={jobId} onClose={() => setModalOpen(false)} />
            )}
        </>
    );
}
