'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import {
    AdminTable, Badge, Pagination, PageHeader, RefreshButton,
    SearchInput, FilterSelect, FilterBar, Button,
} from '../_components/ui';

export default function AdminUsersPage() {
    const [data,    setData]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [query,   setQuery]   = useState({ keyword: '', role: '', isActive: '', page: 1, limit: 10 });

    const load = useCallback(async (q = query) => {
        setLoading(true);
        try {
            const params = { page: q.page, limit: q.limit };
            if (q.keyword)         params.keyword  = q.keyword;
            if (q.role)            params.role     = q.role;
            if (q.isActive !== '') params.isActive = q.isActive;
            const res = await adminService.getUsers(params);
            setData(res.data);
        } catch { toast.error('Không thể tải danh sách người dùng'); }
        finally { setLoading(false); }
    }, [query]);

    useEffect(() => { load(); }, []);

    const handleBan = async (id, email, isActive) => {
        if (!confirm(`${isActive ? 'Khóa' : 'Mở khóa'} tài khoản ${email}?`)) return;
        try {
            const res = await adminService.toggleBanUser(id);
            toast.success(res.data?.message || 'Thành công');
            load();
        } catch { toast.error('Thao tác thất bại'); }
    };

    const ROLE_OPTIONS  = [{ value: '', label: 'Tất cả vai trò' }, { value: 'CANDIDATE', label: 'Ứng viên' }, { value: 'EMPLOYER', label: 'Nhà tuyển dụng' }, { value: 'ADMIN', label: 'Admin' }];
    const STATUS_OPTIONS = [{ value: '', label: 'Tất cả trạng thái' }, { value: 'true', label: 'Hoạt động' }, { value: 'false', label: 'Bị khóa' }];

    const ROLE_STYLE = { ADMIN: 'bg-amber-50 text-amber-700 border border-amber-200', EMPLOYER: 'bg-sky-50 text-sky-700 border border-sky-200', CANDIDATE: 'bg-emerald-50 text-emerald-700 border border-emerald-200' };
    const ROLE_LABEL = { ADMIN: 'Admin', EMPLOYER: 'Nhà tuyển dụng', CANDIDATE: 'Ứng viên' };
    const PLAN_STYLE  = { FREE: 'bg-slate-100 text-slate-500', PRO: 'bg-sky-50 text-sky-700', PREMIUM: 'bg-amber-50 text-amber-700' };

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <PageHeader title="Người dùng" sub={`${data?.total?.toLocaleString('vi-VN') ?? '—'} tài khoản`} />
                <RefreshButton onClick={() => load({ ...query, page: 1 })} loading={loading} />
            </div>

            <FilterBar onSubmit={() => load({ ...query, page: 1 })}>
                <SearchInput value={query.keyword} onChange={v => setQuery(q => ({ ...q, keyword: v }))} placeholder="Email, tên người dùng..." />
                <FilterSelect value={query.role || '__all__'} onValueChange={v => setQuery(q => ({ ...q, role: v === '__all__' ? '' : v }))} placeholder="Vai trò" options={ROLE_OPTIONS.map(o => ({ ...o, value: o.value || '__all__' }))} />
                <FilterSelect value={query.isActive || '__all__'} onValueChange={v => setQuery(q => ({ ...q, isActive: v === '__all__' ? '' : v }))} placeholder="Trạng thái" options={STATUS_OPTIONS.map(o => ({ ...o, value: o.value || '__all__' }))} />
            </FilterBar>

            <AdminTable headers={['Người dùng', 'Vai trò', 'Gói', 'Trạng thái', 'Ngày tạo', 'Thao tác']} loading={loading}>
                {data?.data?.map(u => {
                    const name = u.candidateProfile?.fullName || u.employerProfile?.companyName;
                    const plan = u.plan || 'FREE';
                    return (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                        {(name || u.email)[0].toUpperCase()}
                                    </div>
                                    <div>
                                        {name && <p className="text-sm font-semibold text-slate-800">{name}</p>}
                                        <p className={`text-xs ${name ? 'text-slate-400' : 'font-medium text-slate-800'}`}>{u.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ROLE_STYLE[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                                    {ROLE_LABEL[u.role] ?? u.role}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PLAN_STYLE[plan] ?? PLAN_STYLE.FREE}`}>{plan}</span>
                            </td>
                            <td className="px-4 py-3"><Badge type={u.isActive ? 'active' : 'inactive'} /></td>
                            <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                                {new Date(u.createdAt).toLocaleDateString('vi')}
                            </td>
                            <td className="px-4 py-3">
                                <Button variant="outline" size="sm"
                                    onClick={() => handleBan(u.id, u.email, u.isActive)}
                                    className={`h-8 gap-1.5 text-xs ${u.isActive ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700' : 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100'}`}>
                                    {u.isActive ? <><Lock size={11} />Khóa</> : <><Unlock size={11} />Mở khóa</>}
                                </Button>
                            </td>
                        </tr>
                    );
                })}
            </AdminTable>

            <Pagination data={data} query={query} setQuery={setQuery} load={load} loading={loading} />
        </div>
    );
}
