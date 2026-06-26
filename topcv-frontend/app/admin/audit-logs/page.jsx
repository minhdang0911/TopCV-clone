'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import {
    AdminTable, Pagination, PageHeader, RefreshButton,
    SearchInput, FilterBar, Button,
} from '../_components/ui';

const ACTION_BADGE = {
    CREATE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    UPDATE: 'text-sky-700 bg-sky-50 border-sky-200',
    DELETE: 'text-red-600 bg-red-50 border-red-200',
    ADMIN:  'text-amber-700 bg-amber-50 border-amber-200',
    LOGIN:  'text-violet-700 bg-violet-50 border-violet-200',
};

function ActionBadge({ action = '' }) {
    const key = Object.keys(ACTION_BADGE).find(k => action.toUpperCase().startsWith(k)) ?? 'CREATE';
    return <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${ACTION_BADGE[key]}`}>{action}</span>;
}

export default function AdminAuditLogsPage() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [query,   setQuery]   = useState({ keyword: '', page: 1, limit: 10 });

    const load = useCallback(async (q = query) => {
        setLoading(true);
        try {
            const params = { page: q.page, limit: q.limit };
            if (q.keyword) params.keyword = q.keyword;
            const res = await adminService.getAuditLogs(params);
            setData(res.data);
        } catch { toast.error('Không thể tải audit logs'); }
        finally { setLoading(false); }
    }, [query]);

    useEffect(() => { load(); }, []);

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <PageHeader title="Audit Logs" sub={`${data?.total?.toLocaleString('vi-VN') ?? '—'} bản ghi`} />
                <RefreshButton onClick={() => load({ ...query, page: 1 })} loading={loading} />
            </div>

            <FilterBar onSubmit={() => load({ ...query, page: 1 })}>
                <SearchInput value={query.keyword} onChange={v => setQuery(q => ({ ...q, keyword: v }))} placeholder="Action, entity, user..." />
            </FilterBar>

            <AdminTable headers={['Hành động', 'Đối tượng', 'Mã', 'Người dùng', 'IP', 'Thời gian']} loading={loading} emptyText="Chưa có bản ghi">
                {data?.data?.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
                        <td className="px-4 py-3">
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{log.entity}</span>
                        </td>
                        <td className="px-4 py-3">
                            <code className="text-[10px] text-slate-400 font-mono">{log.entityId?.slice(0, 8)}…</code>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                                    {(log.user?.email ?? log.userId ?? 'S')[0]?.toUpperCase()}
                                </div>
                                <span className="text-xs text-slate-700">{log.user?.email ?? log.userId?.slice(0, 8) ?? 'System'}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ipAddress ?? '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                            {new Date(log.createdAt).toLocaleString('vi', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                    </tr>
                ))}
            </AdminTable>

            <Pagination data={data} query={query} setQuery={setQuery} load={load} loading={loading} />
        </div>
    );
}
