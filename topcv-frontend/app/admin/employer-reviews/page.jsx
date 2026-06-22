'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Star, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/axios';

const STATUS_META = {
    PENDING:  { label: 'Chờ duyệt',   className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    APPROVED: { label: 'Đã duyệt',    className: 'bg-green-100 text-green-700 border-green-200' },
    REJECTED: { label: 'Từ chối',     className: 'bg-red-100 text-red-700 border-red-200' },
};

const DETAIL_CATS = [
    { key: 'salaryRating',   label: 'Lương & phúc lợi' },
    { key: 'trainingRating', label: 'Đào tạo' },
    { key: 'careRating',     label: 'Quan tâm NV' },
    { key: 'cultureRating',  label: 'Văn hoá' },
    { key: 'officeRating',   label: 'Văn phòng' },
];

function StarRow({ value = 0, size = 12 }) {
    const v = Math.round(value);
    return (
        <span className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={size} fill={v >= s ? '#f59e0b' : '#e5e7eb'} stroke={v >= s ? '#f59e0b' : '#e5e7eb'} />
            ))}
        </span>
    );
}

function ReviewRow({ review }) {
    const [expanded, setExpanded] = useState(false);
    const sm = STATUS_META[review.status] ?? STATUS_META.PENDING;

    return (
        <div className="border-b border-slate-100 last:border-0">
            {/* Main row */}
            <div className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50/60 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sm.className} shrink-0`}>
                    {sm.label}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-slate-800 truncate">{review.title}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                        {review.employerProfile?.companyName ?? 'N/A'}
                        <span className="mx-1.5">·</span>
                        {review.user?.candidateProfile?.fullName ?? 'Ẩn danh'}
                        <span className="text-slate-300 ml-1">({review.user?.email ?? ''})</span>
                    </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <StarRow value={review.rating} />
                    <span className="text-[12px] font-semibold text-amber-500 ml-1">{(review.rating || 0).toFixed(1)}</span>
                </div>

                <span className="text-[12px] text-slate-300 shrink-0">
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </span>

                <button
                    onClick={() => setExpanded((e) => !e)}
                    className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 transition-colors shrink-0 px-2 py-1 rounded hover:bg-slate-100"
                >
                    {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {expanded ? 'Thu gọn' : 'Chi tiết'}
                </button>

            </div>

            {/* Reject reason display */}
            {review.status === 'REJECTED' && review.rejectReason && (
                <div className="px-5 pb-3">
                    <p className="text-[12px] text-red-700 bg-red-50 rounded-lg px-3 py-2">
                        Lý do: {review.rejectReason}
                    </p>
                </div>
            )}

            {/* Expanded detail */}
            {expanded && (
                <div className="px-5 pb-5 pt-1">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-[11px] font-semibold text-green-700 mb-1.5 flex items-center gap-1">
                                <ThumbsUp size={11} /> Điểm tốt
                            </p>
                            <p className="text-[13px] text-slate-600 leading-relaxed">{review.liked}</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-3">
                            <p className="text-[11px] font-semibold text-red-700 mb-1.5 flex items-center gap-1">
                                <ThumbsDown size={11} /> Cần cải thiện
                            </p>
                            <p className="text-[13px] text-slate-600 leading-relaxed">{review.improvement}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 flex-wrap mb-3">
                        <span className="text-[12px] text-slate-500">
                            OT: <strong className="text-slate-700">{review.overtimePolicy === 'satisfied' ? 'Hài lòng' : 'Không hài lòng'}</strong>
                            {review.overtimeReason ? <span className="text-slate-400 ml-1">— {review.overtimeReason}</span> : null}
                        </span>
                        <span className="text-[12px] text-slate-500">
                            Giới thiệu: <strong className={review.recommend ? 'text-green-600' : 'text-red-500'}>{review.recommend ? 'Có' : 'Không'}</strong>
                        </span>
                    </div>

                    <div className="flex gap-4 flex-wrap">
                        {DETAIL_CATS.map(({ key, label }) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <span className="text-[11px] text-slate-400">{label}</span>
                                <StarRow value={review[key]} size={11} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AdminEmployerReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('PENDING');

    const load = useCallback(async (s) => {
        setLoading(true);
        try {
            const r = await api.get('/employers/admin/employer-reviews', { params: s ? { status: s } : {} });
            setReviews(r.data);
        } catch {
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(statusFilter); }, [statusFilter, load]);

    const TABS = [
        { key: 'PENDING',  label: 'Chờ duyệt' },
        { key: 'APPROVED', label: 'Đã duyệt' },
        { key: 'REJECTED', label: 'Từ chối' },
        { key: '',         label: 'Tất cả' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-[20px] font-bold text-slate-800">Đánh giá công ty</h1>
                    <p className="text-[13px] text-slate-400 mt-0.5">Theo dõi trạng thái đánh giá — AI tự động kiểm duyệt sau khi ứng viên gửi</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200">
                    {TABS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setStatusFilter(key)}
                            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors ${
                                statusFilter === key
                                    ? 'border-green-600 text-green-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12 text-slate-400 text-[13px]">Đang tải...</div>
                        ) : reviews.length === 0 ? (
                            <div className="text-center py-16 space-y-2">
                                <MessageSquare size={36} className="mx-auto text-slate-200" />
                                <p className="text-[14px] text-slate-400">Không có đánh giá nào</p>
                            </div>
                        ) : (
                            <div>
                                {reviews.map((r) => (
                                    <ReviewRow key={r.id} review={r} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
