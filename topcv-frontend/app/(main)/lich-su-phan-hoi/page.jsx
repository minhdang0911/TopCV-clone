'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquarePlus, Star, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import useAuthStore from '@/stores/auth.store';

const GREEN = '#00b14f';

const RATING_LABEL = { 1: 'Rất tệ', 2: 'Tệ', 3: 'Bình thường', 4: 'Tốt', 5: 'Tuyệt vời' };
const RATING_COLOR = { 1: '#ef4444', 2: '#f97316', 3: '#f59e0b', 4: '#22c55e', 5: GREEN };

function StarDisplay({ value }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    size={13}
                    fill={s <= value ? '#fbbf24' : 'none'}
                    stroke={s <= value ? '#f59e0b' : '#d1d5db'}
                    strokeWidth={1.5}
                />
            ))}
            <span className="text-xs font-semibold ml-1" style={{ color: RATING_COLOR[value] }}>
                {RATING_LABEL[value]}
            </span>
        </div>
    );
}

function FeedbackCard({ item }) {
    const hasReply = !!item.replyText;
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100">
                        {item.topic}
                    </span>
                    {hasReply ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                            <CheckCircle size={11} /> Đã phản hồi
                        </span>
                    ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1">
                            <Clock size={11} /> Đang xem xét
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-end gap-1">
                    <StarDisplay value={item.rating} />
                    <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
                {item.description}
            </p>

            {/* Admin reply */}
            {hasReply && (
                <div className="border-l-4 pl-4 py-2" style={{ borderColor: GREEN }}>
                    <p className="text-[11px] font-bold mb-1.5" style={{ color: GREEN }}>
                        Phản hồi từ TopCV
                        <span className="text-slate-400 font-normal ml-2">
                            {new Date(item.repliedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.replyText}</p>
                </div>
            )}
        </div>
    );
}

export default function LichSuPhanHoiPage() {
    const { isAuthenticated, hydrated } = useAuthStore();
    const router = useRouter();
    const [items, setItems] = useState([]);
    const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated) { router.replace('/dang-nhap?redirect=/lich-su-phan-hoi'); return; }

        setLoading(true);
        api.get('/feedback/my', { params: { page, limit: 10 } })
            .then(res => {
                setItems(res.data?.data || []);
                setMeta(res.data?.meta || { total: 0, totalPages: 1, page: 1 });
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [hydrated, isAuthenticated, page]);

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-10">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                    <div>
                        <h1 className="text-xl font-extrabold text-slate-900">Lịch sử phản hồi</h1>
                        <p className="text-sm text-slate-500 mt-1">{meta.total} phản hồi đã gửi</p>
                    </div>
                    <Link
                        href="/phan-hoi"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl no-underline"
                        style={{ background: GREEN }}
                    >
                        <MessageSquarePlus size={15} /> Gửi phản hồi mới
                    </Link>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MessageSquarePlus size={26} className="text-slate-400" />
                        </div>
                        <p className="text-base font-bold text-slate-700 mb-1">Chưa có phản hồi nào</p>
                        <p className="text-sm text-slate-400 mb-5">Ý kiến của bạn giúp chúng tôi cải thiện sản phẩm</p>
                        <Link href="/phan-hoi" className="text-sm font-bold no-underline" style={{ color: GREEN }}>
                            Gửi phản hồi ngay
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {items.map(item => <FeedbackCard key={item.id} item={item} />)}
                    </div>
                )}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 mt-6">
                        <button
                            onClick={() => setPage(p => p - 1)} disabled={page === 1}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-default hover:bg-slate-50"
                        >
                            <ChevronLeft size={15} />
                        </button>
                        {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                            <button
                                key={p} onClick={() => setPage(p)}
                                className="w-8 h-8 rounded-lg text-sm font-semibold cursor-pointer border transition-colors"
                                style={p === page
                                    ? { background: GREEN, borderColor: GREEN, color: 'white' }
                                    : { background: 'white', borderColor: '#e2e8f0', color: '#475569' }
                                }
                            >
                                {p}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage(p => p + 1)} disabled={page === meta.totalPages}
                            className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-default hover:bg-slate-50"
                        >
                            <ChevronRight size={15} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
