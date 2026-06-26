// Shared UI primitives for Admin pages — all shadcn + Tailwind
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Search,
} from 'lucide-react';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Re-export shadcn primitives so pages only need to import from here
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
export { Button };
export { Input };

// ─── Page size options ──────────────────────────────────────────────────────────
export const PAGE_SIZES = [10, 20, 50, 1000];

// ─── Shared filter Select wrapper ──────────────────────────────────────────────
export function FilterSelect({ value, onValueChange, placeholder, options }) {
    // options: [{ value: string, label: string }]
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-9 min-w-[140px] text-sm border-slate-200 bg-white focus:ring-[#00b14f]/20 focus:border-[#00b14f]">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map(o => (
                    <SelectItem key={o.value} value={o.value} className="text-sm">{o.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// ─── Shared search input ────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Tìm kiếm...' }) {
    return (
        <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <Input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 pl-8 min-w-[220px] text-sm border-slate-200 focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20"
            />
        </div>
    );
}

// ─── Filter form wrapper ────────────────────────────────────────────────────────
export function FilterBar({ onSubmit, children }) {
    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}
            className="flex flex-wrap items-center gap-2 mb-5">
            {children}
            <Button type="submit" size="sm" className="h-9 bg-[#00b14f] hover:bg-[#009944] text-white gap-2">
                <Search size={13} /> Tìm
            </Button>
        </form>
    );
}

// ─── Pagination + page size (full-featured) ────────────────────────────────────
export function Pagination({ data, query, setQuery, load, loading }) {
    if (!data) return null;
    const { page = 1, totalPages = 1, total = 0 } = data;
    const canPrev = page > 1;
    const canNext = page < totalPages;

    const go = (p) => {
        const nq = { ...query, page: p };
        setQuery(nq);
        load(nq);
    };
    const changeSize = (sz) => {
        const nq = { ...query, page: 1, limit: Number(sz) };
        setQuery(nq);
        load(nq);
    };

    // Page window
    const pages = [];
    const left  = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);
    if (left > 1)         { pages.push(1); if (left > 2) pages.push('…'); }
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages) { if (right < totalPages - 1) pages.push('…'); pages.push(totalPages); }

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            {/* Left: total + page size */}
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                    Tổng <span className="font-semibold text-slate-600">{total?.toLocaleString('vi-VN')}</span> kết quả
                </span>
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Hiển thị</span>
                    <Select value={String(query.limit ?? 10)} onValueChange={changeSize}>
                        <SelectTrigger className="h-8 w-[72px] text-xs border-slate-200 bg-white focus:ring-[#00b14f]/20 focus:border-[#00b14f]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {PAGE_SIZES.map(s => (
                                <SelectItem key={s} value={String(s)} className="text-xs">
                                    {s === 1000 ? 'Tất cả' : s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-xs text-slate-400">/ trang</span>
                </div>
            </div>

            {/* Right: page buttons */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(1)} disabled={!canPrev || loading}>
                        <ChevronsLeft size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(page - 1)} disabled={!canPrev || loading}>
                        <ChevronLeft size={14} />
                    </Button>

                    {pages.map((p, i) =>
                        p === '…' ? (
                            <span key={`e${i}`} className="px-1 text-slate-400 text-sm select-none">…</span>
                        ) : (
                            <Button key={p} size="icon" onClick={() => p !== page && go(p)} disabled={loading}
                                className={`h-8 w-8 text-xs ${
                                    p === page
                                        ? 'bg-[#00b14f] text-white hover:bg-[#009944]'
                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-[#00b14f] hover:text-[#00b14f] hover:bg-white'
                                }`}>
                                {p}
                            </Button>
                        )
                    )}

                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(page + 1)} disabled={!canNext || loading}>
                        <ChevronRight size={14} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => go(totalPages)} disabled={!canNext || loading}>
                        <ChevronsRight size={14} />
                    </Button>
                </div>
            )}
        </div>
    );
}

// ─── Refresh button ─────────────────────────────────────────────────────────────
export function RefreshButton({ onClick, loading }) {
    return (
        <Button variant="outline" size="sm" onClick={onClick} disabled={loading}
            className="h-9 gap-2 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 shrink-0">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Làm mới
        </Button>
    );
}

// ─── Table wrapper ─────────────────────────────────────────────────────────────
export function AdminTable({ headers, children, loading, colSpan, emptyText = 'Không có dữ liệu' }) {
    const cols = colSpan ?? headers.length;
    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {headers.map(h => (
                                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && [...Array(6)].map((_, i) => (
                            <tr key={i}>
                                {[...Array(cols)].map((_, j) => (
                                    <td key={j} className="px-4 py-3.5">
                                        <div className="h-4 bg-slate-100 rounded animate-pulse" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {!loading && children}
                        {!loading && !children?.length && (
                            <tr>
                                <td colSpan={cols} className="py-16 text-center text-sm text-slate-400">
                                    {emptyText}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Status badges ─────────────────────────────────────────────────────────────
export function Badge({ type }) {
    const styles = {
        active:   'bg-emerald-50 text-emerald-700 border-emerald-200',
        inactive: 'bg-slate-100 text-slate-500 border-slate-200',
        pending:  'bg-amber-50 text-amber-700 border-amber-200',
        approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        rejected: 'bg-red-50 text-red-600 border-red-200',
        success:  'bg-emerald-50 text-emerald-700 border-emerald-200',
        failed:   'bg-red-50 text-red-600 border-red-200',
        PENDING:  'bg-amber-50 text-amber-700 border-amber-200',
        SUCCESS:  'bg-emerald-50 text-emerald-700 border-emerald-200',
        FAILED:   'bg-red-50 text-red-600 border-red-200',
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        REJECTED: 'bg-red-50 text-red-600 border-red-200',
    };
    const labels = {
        active: 'Hoạt động', inactive: 'Không hoạt động', pending: 'Chờ duyệt',
        approved: 'Đã duyệt', rejected: 'Từ chối',
        success: 'Thành công', failed: 'Thất bại',
        PENDING: 'Chờ xử lý', SUCCESS: 'Thành công', FAILED: 'Thất bại',
        APPROVED: 'Đã duyệt', REJECTED: 'Từ chối',
    };
    const dots = {
        active: 'bg-emerald-500', inactive: 'bg-slate-400', pending: 'bg-amber-500',
        approved: 'bg-emerald-500', rejected: 'bg-red-500',
        success: 'bg-emerald-500', failed: 'bg-red-500',
        PENDING: 'bg-amber-500', SUCCESS: 'bg-emerald-500', FAILED: 'bg-red-500',
        APPROVED: 'bg-emerald-500', REJECTED: 'bg-red-500',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[type] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dots[type] ?? 'bg-slate-400'}`} />
            {labels[type] ?? type}
        </span>
    );
}

// ─── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, sub }) {
    return (
        <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            {sub && <p className="text-sm text-slate-400 mt-0.5">{sub}</p>}
        </div>
    );
}

// ─── Legacy class helpers (still used in some inline elements) ─────────────────
export const btnPrimary = 'flex items-center gap-2 px-4 py-2 bg-[#00b14f] hover:bg-[#009944] text-white text-sm font-semibold rounded-lg transition-colors';
