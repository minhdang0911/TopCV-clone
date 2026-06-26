'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import {
    AdminTable, Badge, Pagination, PageHeader, RefreshButton,
    SearchInput, FilterSelect, FilterBar, Button,
} from '../_components/ui';

const GW_STYLE = {
    MOMO:    'bg-pink-50 text-pink-700 border border-pink-200',
    ZALOPAY: 'bg-sky-50 text-sky-700 border border-sky-200',
    VNPAY:   'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

function PlanCell({ plan, planMeta }) {
    if (planMeta?.type === 'VIEW_APPLICANTS') {
        return (
            <div className="space-y-0.5">
                <span className="inline-block text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">Xem ứng tuyển</span>
                {planMeta.jobTitle && <p className="text-xs text-slate-700 font-medium">{planMeta.jobTitle}</p>}
                {planMeta.companyName && <p className="text-[11px] text-slate-400">{planMeta.companyName}</p>}
            </div>
        );
    }
    const MAP = { PREMIUM: 'bg-amber-50 text-amber-700 border-amber-200', PRO: 'bg-sky-50 text-sky-700 border-sky-200', FREE: 'bg-slate-100 text-slate-500 border-slate-200' };
    return <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${MAP[plan] ?? MAP.FREE}`}>{plan || 'FREE'}</span>;
}

function UserCell({ user }) {
    const [copied, setCopied] = useState(false);
    if (!user) return <span className="text-slate-400">—</span>;
    const name = user.candidateProfile?.fullName || user.employerProfile?.companyName;
    const copy = () => { navigator.clipboard.writeText(user.id).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
    return (
        <div>
            {name && <p className="text-sm font-semibold text-slate-800">{name}</p>}
            <p className={`text-xs ${name ? 'text-slate-400' : 'font-medium text-slate-800'}`}>{user.email}</p>
            <div className="flex items-center gap-1 mt-0.5">
                <span className="font-mono text-[10px] text-slate-300 max-w-[110px] truncate">{user.id}</span>
                <button onClick={copy} className={`transition-colors ${copied ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'}`}>
                    {copied ? <Check size={10} /> : <Copy size={10} />}
                </button>
            </div>
        </div>
    );
}

const fmtVnd   = n => n == null ? '—' : n.toLocaleString('vi-VN') + ' ₫';
const fmtShort = n => { if (n == null) return '—'; if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'; if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K'; return String(n); };

const STATUS_OPTS  = [{ value: '__all__', label: 'Tất cả trạng thái' }, { value: 'SUCCESS', label: 'Thành công' }, { value: 'PENDING', label: 'Chờ xử lý' }, { value: 'FAILED', label: 'Thất bại' }];
const GATEWAY_OPTS = [{ value: '__all__', label: 'Tất cả cổng' }, { value: 'MOMO', label: 'MOMO' }, { value: 'ZALOPAY', label: 'ZALOPAY' }, { value: 'VNPAY', label: 'VNPAY' }];
const PLAN_OPTS    = [{ value: '__all__', label: 'Tất cả gói' }, { value: 'FREE', label: 'FREE' }, { value: 'PRO', label: 'PRO' }, { value: 'PREMIUM', label: 'PREMIUM' }];

export default function AdminPaymentsPage() {
    const [data,  setData]    = useState(null);
    const [stats, setStats]   = useState(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery]   = useState({ keyword: '', status: '', gateway: '', plan: '', page: 1, limit: 10 });

    const load = useCallback(async (q = query) => {
        setLoading(true);
        try {
            const params = { page: q.page, limit: q.limit };
            if (q.keyword) params.keyword = q.keyword;
            if (q.status)  params.status  = q.status;
            if (q.gateway) params.gateway = q.gateway;
            if (q.plan)    params.plan    = q.plan;
            const [listRes, statsRes] = await Promise.all([adminService.getPayments(params), adminService.getPaymentStats()]);
            setData(listRes.data);
            setStats(statsRes.data);
        } catch { toast.error('Không thể tải dữ liệu'); }
        finally { setLoading(false); }
    }, [query]);

    useEffect(() => { load(); }, []);

    const sel = (field) => (v) => setQuery(q => ({ ...q, [field]: v === '__all__' ? '' : v }));

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <PageHeader
                    title="Thanh toán"
                    sub={stats ? `Tổng doanh thu: ${fmtShort(stats.totalRevenue)} ₫ · ${stats.totalSuccessCount} giao dịch` : ''}
                />
                <RefreshButton onClick={() => load({ ...query, page: 1 })} loading={loading} />
            </div>

            {/* Gateway summary cards */}
            {stats?.byGateway?.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    {stats.byGateway.map(g => (
                        <div key={g.gateway} className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="mb-2">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${GW_STYLE[g.gateway] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>{g.gateway}</span>
                            </div>
                            <p className="text-xl font-bold text-slate-900">{fmtShort(g.revenue)} ₫</p>
                            <p className="text-xs text-slate-400 mt-0.5">{g.count} giao dịch</p>
                        </div>
                    ))}
                </div>
            )}

            <FilterBar onSubmit={() => load({ ...query, page: 1 })}>
                <SearchInput value={query.keyword} onChange={v => setQuery(q => ({ ...q, keyword: v }))} placeholder="Email, order ID, tên..." />
                <FilterSelect value={query.status  || '__all__'} onValueChange={sel('status')}  placeholder="Trạng thái" options={STATUS_OPTS} />
                <FilterSelect value={query.gateway || '__all__'} onValueChange={sel('gateway')} placeholder="Cổng TT"    options={GATEWAY_OPTS} />
                <FilterSelect value={query.plan    || '__all__'} onValueChange={sel('plan')}    placeholder="Gói"        options={PLAN_OPTS} />
            </FilterBar>

            <AdminTable headers={['Mã đơn hàng', 'Người dùng', 'Gói', 'Cổng', 'Số tiền', 'Trạng thái', 'Ngày tạo']} loading={loading}>
                {data?.data?.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5">
                            <code className="text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded font-mono">{p.orderId}</code>
                        </td>
                        <td className="px-4 py-3.5 min-w-[190px]"><UserCell user={p.user} /></td>
                        <td className="px-4 py-3.5 min-w-[160px]"><PlanCell plan={p.plan} planMeta={p.planMeta} /></td>
                        <td className="px-4 py-3.5">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${GW_STYLE[p.gateway] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>{p.gateway}</span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 tabular-nums whitespace-nowrap">{fmtVnd(p.amount)}</td>
                        <td className="px-4 py-3.5"><Badge type={p.status} /></td>
                        <td className="px-4 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                            {new Date(p.createdAt).toLocaleString('vi', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                    </tr>
                ))}
            </AdminTable>

            <Pagination data={data} query={query} setQuery={setQuery} load={load} loading={loading} />
        </div>
    );
}
