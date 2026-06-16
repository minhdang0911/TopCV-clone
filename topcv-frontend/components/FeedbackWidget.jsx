'use client';

import { useState } from 'react';
import { X, Send, Star, CheckCircle, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useAuthStore from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const GREEN = '#00b14f';

const TOPICS = [
    'Công cụ tạo CV',
    'Tìm kiếm việc làm',
    'Tính năng / Giao diện',
    'Thông báo việc làm',
    'Kết nối nhà tuyển dụng',
    'Khác',
];

function StarRating({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;
    const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map(s => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => onChange(s)}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        className="border-none bg-transparent cursor-pointer p-0.5 transition-transform"
                        style={{ transform: active >= s ? 'scale(1.15)' : 'scale(1)' }}
                    >
                        <Star
                            size={28}
                            fill={active >= s ? '#fbbf24' : 'none'}
                            stroke={active >= s ? '#f59e0b' : '#d1d5db'}
                            strokeWidth={1.5}
                        />
                    </button>
                ))}
            </div>
            {active > 0 && (
                <span className="text-xs font-semibold" style={{ color: active >= 4 ? GREEN : active === 3 ? '#f59e0b' : '#ef4444' }}>
                    {labels[active]}
                </span>
            )}
        </div>
    );
}

export default function FeedbackWidget() {
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const reset = () => { setTopic(''); setDescription(''); setRating(0); setDone(false); };

    const handleOpen = () => {
        if (!isAuthenticated) {
            router.push('/dang-nhap?redirect=/phan-hoi');
            return;
        }
        setOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic) { toast.error('Vui lòng chọn chủ đề'); return; }
        if (!description.trim()) { toast.error('Vui lòng nhập mô tả'); return; }
        if (!rating) { toast.error('Vui lòng chọn đánh giá'); return; }
        setSubmitting(true);
        try {
            await api.post('/feedback', { topic, description: description.trim(), rating });
            setDone(true);
        } catch {
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            {/* Floating tab */}
            <button
                onClick={handleOpen}
                className="fixed z-[999] flex flex-col items-center gap-1.5 px-1.5 py-3 rounded-l-xl shadow-lg border border-r-0 border-slate-200 cursor-pointer transition-all"
                style={{
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'white',
                    writingMode: 'vertical-rl',
                }}
                title="Gửi phản hồi"
            >
                <MessageSquarePlus size={16} style={{ color: GREEN, transform: 'rotate(90deg)' }} />
                <span className="text-[11px] font-bold" style={{ color: GREEN, letterSpacing: '0.05em' }}>
                    Góp ý
                </span>
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/30"
                    onClick={() => { setOpen(false); reset(); }}
                />
            )}

            {/* Panel */}
            <div
                className={cn(
                    'fixed z-[1001] top-0 right-0 h-full w-[360px] bg-white shadow-2xl flex flex-col transition-transform duration-300',
                    open ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <MessageSquarePlus size={18} style={{ color: GREEN }} />
                        <h3 className="text-base font-extrabold text-slate-900">Gửi phản hồi</h3>
                    </div>
                    <button
                        onClick={() => { setOpen(false); reset(); }}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border-none cursor-pointer bg-transparent"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {done ? (
                        <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-5">
                            <CheckCircle size={52} style={{ color: GREEN }} />
                            <div>
                                <h4 className="text-lg font-extrabold text-slate-900 mb-2">Cảm ơn bạn!</h4>
                                <p className="text-sm text-slate-500">Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.</p>
                            </div>
                            <button
                                onClick={reset}
                                className="px-5 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer bg-white"
                                style={{ borderColor: GREEN, color: GREEN }}
                            >
                                Gửi phản hồi khác
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-5">
                            {/* Topic */}
                            <div>
                                <p className="text-[13px] font-bold text-slate-800 mb-2.5">Chủ đề</p>
                                <div className="flex flex-wrap gap-2">
                                    {TOPICS.map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTopic(t)}
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold border-2 cursor-pointer transition-all"
                                            style={{
                                                borderColor: topic === t ? GREEN : '#e5e7eb',
                                                background: topic === t ? '#f0fdf4' : 'white',
                                                color: topic === t ? GREEN : '#374151',
                                            }}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <p className="text-[13px] font-bold text-slate-800 mb-2">Mô tả chi tiết</p>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Nhập mô tả phản hồi của bạn..."
                                    rows={5}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none outline-none box-border leading-relaxed"
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>

                            {/* Rating */}
                            <div>
                                <p className="text-[13px] font-bold text-slate-800 mb-3 text-center">Đánh giá trải nghiệm</p>
                                <StarRating value={rating} onChange={setRating} />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-none text-white text-sm font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                                style={{ background: GREEN }}
                            >
                                <Send size={15} />
                                {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Footer hint */}
                {!done && (
                    <div className="px-5 py-3 border-t border-slate-100 text-center">
                        <p className="text-[11px] text-slate-400">Ý kiến của bạn giúp chúng tôi cải thiện sản phẩm</p>
                    </div>
                )}
            </div>
        </>
    );
}
