'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, XCircle, Briefcase } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import {
    AdminTable, Badge, Pagination, PageHeader, RefreshButton,
    SearchInput, FilterSelect, FilterBar, Button,
} from '../_components/ui';

export default function AdminJobsPage() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [query,   setQuery]   = useState({ keyword: '', isActive: '', page: 1, limit: 10 });

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
        try {
            const res = await adminService.toggleJobActive(id);
            toast.success(res.data?.message || 'Thành công');
            load();
        } catch { toast.error('Thao tác thất bại'); }
    };

    const STATUS_OPTIONS = [{ value: '__all__', label: 'Tất cả trạng thái' }, { value: 'true', label: 'Đang kích hoạt' }, { value: 'false', label: 'Không kích hoạt' }];

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
                            <Button variant="outline" size="sm"
                                onClick={() => handleToggle(j.id, j.title, j.isActive)}
                                className={`h-8 gap-1.5 text-xs ${j.isActive ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'}`}>
                                {j.isActive ? <><XCircle size={11} />Vô hiệu</> : <><CheckCircle size={11} />Kích hoạt</>}
                            </Button>
                        </td>
                    </tr>
                ))}
            </AdminTable>

            <Pagination data={data} query={query} setQuery={setQuery} load={load} loading={loading} />
        </div>
    );
}
