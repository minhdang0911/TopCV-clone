'use client';

import { useState, useEffect, useCallback } from 'react';
import { Receipt } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { paymentService } from '@/services/payment.service';
import DateRangePicker from '@/components/DateRangePicker';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

const PAGE_SIZES = [10, 20, 50, 1000];

const GATEWAY_LABEL = { MOMO: 'MoMo', ZALOPAY: 'ZaloPay', VNPAY: 'VNPay' };

const STATUS_CFG = {
    SUCCESS: { label: 'Thành công', className: 'bg-green-50 text-green-700 border-green-200' },
    FAILED:  { label: 'Thất bại',   className: 'bg-red-50 text-red-600 border-red-200' },
    PENDING: { label: 'Chờ thanh toán', className: 'bg-amber-50 text-amber-600 border-amber-200' },
};

function getPlanLabel(plan) {
    if (!plan) return 'Không xác định';
    if (plan === 'PRO') return 'Tài khoản Pro (1 tháng)';
    if (plan === 'PREMIUM') return 'Tài khoản Premium (12 tháng)';
    if (plan.startsWith('VIEW_APPLICANTS:')) return 'Xem số người ứng tuyển';
    return plan;
}

function fmtMoney(n) {
    return new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
}

function fmtDate(iso) {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function StatusBadge({ status }) {
    const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
    return (
        <Badge variant="outline" className={`h-auto py-1 px-2.5 text-xs font-semibold ${cfg.className}`}>
            {cfg.label}
        </Badge>
    );
}

function buildPageList(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
}

export default function LichSuGiaoDichPage() {
    const { isAuthenticated, hydrated } = useAuthStore();
    const router = useRouter();

    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [dateRange, setDateRange] = useState({ start: null, end: null });

    const fetchData = useCallback(() => {
        setLoading(true);
        const params = { page, pageSize };
        if (dateRange.start) params.startDate = dateRange.start.toISOString().slice(0, 10);
        if (dateRange.end) params.endDate = dateRange.end.toISOString().slice(0, 10);

        paymentService.getMyHistory(params)
            .then(res => {
                setPayments(res.data?.data ?? []);
                setTotal(res.data?.total ?? 0);
                setTotalPages(res.data?.totalPages ?? 1);
            })
            .catch(() => setPayments([]))
            .finally(() => setLoading(false));
    }, [page, pageSize, dateRange]);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated) { router.replace('/dang-nhap'); return; }
        fetchData();
    }, [hydrated, isAuthenticated, fetchData, router]);

    const handleDateChange = (range) => {
        setDateRange(range || { start: null, end: null });
        setPage(1);
    };

    const goToPage = (p) => {
        if (p < 1 || p > totalPages) return;
        setPage(p);
    };

    if (!hydrated || !isAuthenticated) return null;

    const pageList = buildPageList(page, totalPages);

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingTop: '24px', paddingBottom: '48px' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>

                <div style={{ marginBottom: '20px' }}>
                    <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>
                        Lịch sử giao dịch
                    </h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                        Danh sách các giao dịch của tài khoản
                    </p>
                </div>

                {/* Filters */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <DateRangePicker value={dateRange} onChange={handleDateChange} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>Hiển thị</span>
                        <select
                            value={pageSize}
                            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                            style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 10px', fontSize: '13px', color: '#374151', background: 'white', cursor: 'pointer', outline: 'none' }}
                        >
                            {PAGE_SIZES.map(s => (
                                <option key={s} value={s}>{s === 1000 ? 'Tất cả' : s} / trang</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-border bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide pl-5">Gói dịch vụ</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide">Số tiền</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cổng TT</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide">Thời gian</TableHead>
                                <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wide">Trạng thái</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="py-0 px-0">
                                            <div className="h-15.5 animate-pulse bg-slate-50" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-16 text-center">
                                        <Receipt size={40} className="text-slate-300 mx-auto mb-3" />
                                        <p className="text-sm text-slate-400">Chưa có giao dịch nào</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="pl-5 py-4">
                                            <p className="text-sm font-semibold text-gray-900">{getPlanLabel(p.plan)}</p>
                                            <p className="text-xs text-slate-400 font-mono mt-0.5">#{p.orderId}</p>
                                        </TableCell>
                                        <TableCell className="text-sm font-semibold text-gray-800">
                                            {fmtMoney(p.amount)}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-600">
                                            {GATEWAY_LABEL[p.gateway] || p.gateway}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-500">
                                            {fmtDate(p.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={p.status} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer */}
                {!loading && total > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            Hiển thị {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} / {total} giao dịch
                        </span>

                        {totalPages > 1 && (
                            <Pagination className="w-auto mx-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            text="Trước"
                                            onClick={() => goToPage(page - 1)}
                                            aria-disabled={page === 1}
                                            style={{ pointerEvents: page === 1 ? 'none' : 'auto', opacity: page === 1 ? 0.4 : 1, cursor: page === 1 ? 'default' : 'pointer' }}
                                        />
                                    </PaginationItem>

                                    {pageList.map((p, i) =>
                                        p === '…' ? (
                                            <PaginationItem key={`e${i}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    isActive={p === page}
                                                    onClick={() => goToPage(p)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    {p}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}

                                    <PaginationItem>
                                        <PaginationNext
                                            text="Sau"
                                            onClick={() => goToPage(page + 1)}
                                            aria-disabled={page === totalPages}
                                            style={{ pointerEvents: page === totalPages ? 'none' : 'auto', opacity: page === totalPages ? 0.4 : 1, cursor: page === totalPages ? 'default' : 'pointer' }}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
