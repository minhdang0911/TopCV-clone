'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Building2, X } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { AdminTable, Badge, PageHeader, RefreshButton } from '../../_components/ui';

const TABS = [
    { value: 'PENDING',  label: 'Chờ duyệt',  icon: Clock },
    { value: 'APPROVED', label: 'Đã duyệt',    icon: CheckCircle },
    { value: 'REJECTED', label: 'Từ chối',     icon: XCircle },
    { value: '',         label: 'Tất cả',       icon: Building2 },
];

export default function AdminEmployerDocsPage() {
    const [data,     setData]     = useState([]);
    const [loading,  setLoading]  = useState(true);
    const [filter,   setFilter]   = useState('PENDING');
    const [selected, setSelected] = useState(null);
    const [reason,   setReason]   = useState('');
    const [busy,     setBusy]     = useState(false);

    const load = useCallback(async (status = filter) => {
        setLoading(true);
        try {
            const res = await adminService.getPendingDocs(status);
            setData(res.data?.data ?? res.data ?? []);
        } catch { toast.error('Không thể tải danh sách'); }
        finally { setLoading(false); }
    }, [filter]);

    useEffect(() => { load(); }, []);

    const changeFilter = (v) => { setFilter(v); setSelected(null); load(v); };

    const approve = async (id) => {
        if (!confirm('Duyệt hồ sơ này?')) return;
        setBusy(true);
        try { await adminService.approveDoc(id, true, null); toast.success('Đã duyệt'); setSelected(null); load(); }
        catch { toast.error('Thất bại'); } finally { setBusy(false); }
    };

    const reject = async (id) => {
        if (!reason.trim()) { toast.error('Nhập lý do từ chối'); return; }
        setBusy(true);
        try { await adminService.approveDoc(id, false, reason); toast.success('Đã từ chối'); setSelected(null); setReason(''); load(); }
        catch { toast.error('Thất bại'); } finally { setBusy(false); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <PageHeader title="Hồ sơ doanh nghiệp" sub="Xét duyệt tài liệu xác minh doanh nghiệp" />
                <RefreshButton onClick={() => load(filter)} loading={loading} />
            </div>

            {/* Tabs */}
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

            <div className={`grid gap-5 ${selected ? 'grid-cols-[1fr_360px]' : 'grid-cols-1'}`}>
                <AdminTable headers={['Công ty', 'Email', 'Mã số thuế', 'Ngày nộp', 'Trạng thái', '']} loading={loading} emptyText="Không có hồ sơ">
                    {data.map(d => (
                        <tr key={d.id} onClick={() => setSelected(d)}
                            className={`cursor-pointer hover:bg-slate-50 transition-colors ${selected?.id === d.id ? 'bg-emerald-50/50' : ''}`}>
                            <td className="px-4 py-3 font-semibold text-slate-800">{d.companyName}</td>
                            <td className="px-4 py-3 text-sm text-slate-500">{d.user?.email ?? '—'}</td>
                            <td className="px-4 py-3">
                                <code className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{d.taxCode ?? '—'}</code>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-400">{d.updatedAt ? new Date(d.updatedAt).toLocaleDateString('vi') : '—'}</td>
                            <td className="px-4 py-3">
                                <Badge type={d.businessDocStatus === 'PENDING' ? 'pending' : d.businessDocStatus === 'APPROVED' ? 'approved' : 'rejected'} />
                            </td>
                            <td className="px-4 py-3">
                                <button onClick={e => { e.stopPropagation(); setSelected(d); }}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#00b14f] border border-[#00b14f]/30 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                                    <Eye size={11} /> Xem
                                </button>
                            </td>
                        </tr>
                    ))}
                </AdminTable>

                {/* Detail */}
                {selected && (
                    <div className="bg-white rounded-xl border border-slate-200 self-start">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800">Chi tiết hồ sơ</h2>
                            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                        </div>
                        <div className="p-5 space-y-3.5">
                            {[['Công ty', selected.companyName], ['Email', selected.user?.email], ['Mã số thuế', selected.taxCode], ['Địa chỉ', selected.address]].map(([l, v]) => (
                                <div key={l} className="flex gap-3">
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[80px] pt-0.5">{l}</span>
                                    <span className="text-sm text-slate-700">{v || '—'}</span>
                                </div>
                            ))}
                            <div className="flex gap-3">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider min-w-[80px] pt-0.5">Trạng thái</span>
                                <Badge type={selected.businessDocStatus === 'PENDING' ? 'pending' : selected.businessDocStatus === 'APPROVED' ? 'approved' : 'rejected'} />
                            </div>
                            {selected.businessDocUrl && (
                                <a href={selected.businessDocUrl} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-1.5 text-sm text-[#00b14f] hover:underline font-medium">
                                    <Eye size={13} /> Xem tài liệu
                                </a>
                            )}
                            {selected.businessDocStatus === 'PENDING' && (
                                <div className="pt-4 border-t border-slate-100 space-y-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Lý do từ chối</label>
                                        <textarea value={reason} onChange={e => setReason(e.target.value)}
                                            placeholder="Nhập lý do nếu từ chối..." rows={3}
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-[#00b14f]/20 resize-none" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => approve(selected.id)} disabled={busy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#00b14f] hover:bg-[#009944] text-white text-sm font-bold rounded-lg disabled:opacity-50">
                                            <CheckCircle size={14} /> Duyệt
                                        </button>
                                        <button onClick={() => reject(selected.id)} disabled={busy}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-bold border border-red-200 rounded-lg disabled:opacity-50">
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
