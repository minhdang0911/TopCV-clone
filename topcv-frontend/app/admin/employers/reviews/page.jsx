'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, ThumbsUp, ThumbsDown, Star, User, X } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { AdminTable, Badge, PageHeader, RefreshButton } from '../../_components/ui';

const TABS = [
    { value: 'PENDING',  label: 'Chờ duyệt', icon: Clock },
    { value: 'APPROVED', label: 'Đã duyệt',  icon: CheckCircle },
    { value: 'REJECTED', label: 'Từ chối',   icon: XCircle },
    { value: '',         label: 'Tất cả',     icon: Eye },
];

function Stars({ value, size = 12 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={size} fill={i <= value ? '#f59e0b' : 'none'} color={i <= value ? '#f59e0b' : '#d1d5db'} />
            ))}
            <span className="text-xs text-slate-500 ml-1">{value}/5</span>
        </div>
    );
}

function StarRow({ label, value }) {
    return (
        <div className="flex items-center justify-between py-1.5">
            <span className="text-xs text-slate-500">{label}</span>
            <Stars value={value} size={11} />
        </div>
    );
}

export default function AdminEmployerReviewsPage() {
    const [data,     setData]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [filter,   setFilter]   = useState('PENDING');
    const [selected, setSelected] = useState(null);
    const [reason,   setReason]   = useState('');
    const [busy,     setBusy]     = useState(false);

    const load = useCallback(async (status = filter) => {
        setLoading(true);
        try {
            const res = await adminService.getEmployerReviews(status);
            setData(res.data?.data ?? res.data ?? []);
        } catch { toast.error('Không thể tải đánh giá'); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { load(); }, []);

    const changeFilter = (v) => { setFilter(v); setSelected(null); load(v); };

    const handleAction = async (id, status) => {
        if (status === 'REJECTED' && !reason.trim()) { toast.error('Vui lòng nhập lý do'); return; }
        setBusy(true);
        try {
            await adminService.updateReviewStatus(id, status, reason || undefined);
            toast.success(status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối');
            setSelected(null); setReason(''); load();
        } catch { toast.error('Thất bại'); } finally { setBusy(false); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <PageHeader title="Đánh giá công ty" sub="Đánh giá được tự động kiểm duyệt bằng AI. Admin override khi cần." />
                <RefreshButton onClick={() => load(filter)} loading={loading} />
            </div>

            <div className="flex gap-2 mb-5">
                {TABS.map(t => {
                    const Icon = t.icon;
                    const active = filter === t.value;
                    return (
                        <button key={t.value} onClick={() => changeFilter(t.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                                active ? 'bg-[#00b14f] text-white border-[#00b14f]' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}>
                            <Icon size={14} /> {t.label}
                        </button>
                    );
                })}
            </div>

            <div className={`grid gap-5 ${selected ? 'grid-cols-[1fr_400px]' : 'grid-cols-1'}`}>
                <AdminTable
                    headers={['Người đánh giá', 'Công ty', 'Tiêu đề', 'Điểm', 'Giới thiệu', 'Ngày', 'Trạng thái', '']}
                    loading={loading} emptyText="Không có đánh giá">
                    {data.map(r => (
                        <tr key={r.id} onClick={() => setSelected(r)}
                            className={`cursor-pointer hover:bg-slate-50 transition-colors ${selected?.id === r.id ? 'bg-emerald-50/50' : ''}`}>
                            <td className="px-4 py-3">
                                <p className="text-sm font-medium text-slate-800">{r.user?.candidateProfile?.fullName || '—'}</p>
                                <p className="text-xs text-slate-400">{r.user?.email}</p>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 font-medium">{r.employerProfile?.companyName ?? '—'}</td>
                            <td className="px-4 py-3 text-sm text-slate-700 max-w-[180px] truncate">{r.title}</td>
                            <td className="px-4 py-3"><Stars value={r.rating} size={12} /></td>
                            <td className="px-4 py-3">
                                {r.recommend
                                    ? <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><ThumbsUp size={11} /> Có</span>
                                    : <span className="text-xs font-semibold text-red-500 flex items-center gap-1"><ThumbsDown size={11} /> Không</span>
                                }
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString('vi')}</td>
                            <td className="px-4 py-3">
                                <Badge type={r.status === 'PENDING' ? 'pending' : r.status === 'APPROVED' ? 'approved' : 'rejected'} />
                            </td>
                            <td className="px-4 py-3">
                                <button onClick={e => { e.stopPropagation(); setSelected(r); }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#00b14f] border border-[#00b14f]/30 bg-emerald-50 hover:bg-emerald-100 rounded-lg">
                                    <Eye size={11} /> Xem
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>

                {/* Detail panel */}
                {selected && (
                    <div className="bg-white rounded-xl border border-slate-200 self-start overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800">Chi tiết đánh giá</h2>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-280px)]">
                            {/* Reviewer */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5"><User size={11} /> Người đánh giá (chỉ admin)</p>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-[#00b14f] flex items-center justify-center text-white text-sm font-bold shrink-0">
                                        {selected.user?.candidateProfile?.fullName?.[0] ?? <User size={14} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{selected.user?.candidateProfile?.fullName || '(Chưa có tên)'}</p>
                                        <p className="text-xs text-slate-400">{selected.user?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Company & title */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Công ty</p>
                                <p className="text-sm font-semibold text-slate-800">{selected.employerProfile?.companyName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiêu đề & Điểm</p>
                                <p className="text-sm font-semibold text-slate-800 mb-1.5">{selected.title}</p>
                                <Stars value={selected.rating} size={16} />
                            </div>

                            {/* Detailed stars */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Đánh giá chi tiết</p>
                                <StarRow label="Lương & phúc lợi"  value={selected.salaryRating} />
                                <StarRow label="Đào tạo & học hỏi" value={selected.trainingRating} />
                                <StarRow label="Quan tâm nhân viên" value={selected.careRating} />
                                <StarRow label="Văn hoá công ty"   value={selected.cultureRating} />
                                <StarRow label="Văn phòng"         value={selected.officeRating} />
                            </div>

                            {/* Liked / Improvement */}
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Điểm tốt</p>
                                <div className="border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2 rounded-r-lg">
                                    <p className="text-xs text-emerald-900 leading-relaxed">{selected.liked}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cần cải thiện</p>
                                <div className="border-l-4 border-amber-400 bg-amber-50 px-3 py-2 rounded-r-lg">
                                    <p className="text-xs text-amber-900 leading-relaxed">{selected.improvement}</p>
                                </div>
                            </div>

                            {/* Recommend */}
                            <div className="flex items-center gap-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Giới thiệu?</p>
                                {selected.recommend
                                    ? <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1"><ThumbsUp size={12} /> Có</span>
                                    : <span className="text-xs font-semibold text-red-500 flex items-center gap-1"><ThumbsDown size={12} /> Không</span>
                                }
                            </div>

                            {/* Reject reason shown */}
                            {selected.rejectReason && (
                                <div className="border-l-4 border-red-400 bg-red-50 px-3 py-2 rounded-r-lg">
                                    <p className="text-[10px] font-bold text-red-600 mb-1">Lý do từ chối</p>
                                    <p className="text-xs text-red-800">{selected.rejectReason}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {selected.status === 'PENDING' && (
                                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Lý do từ chối (nếu từ chối)</label>
                                        <textarea value={reason} onChange={e => setReason(e.target.value)}
                                            placeholder="Nhập lý do..." rows={2}
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#00b14f] resize-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAction(selected.id, 'APPROVED')} disabled={busy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#00b14f] hover:bg-[#009944] text-white text-sm font-bold rounded-lg disabled:opacity-50">
                                            <CheckCircle size={14} /> Duyệt
                                        </button>
                                        <button onClick={() => handleAction(selected.id, 'REJECTED')} disabled={busy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold border border-red-200 rounded-lg disabled:opacity-50">
                                            <XCircle size={14} /> Từ chối
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
