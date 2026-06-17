'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Heart, UserPlus, MessageCircle, HelpCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import useAuthStore from '@/stores/auth.store';
import { savedJobsService } from '@/services/applications.service';
import zaloIcon from '@/app/assests/img/zalo-icon.webp';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const GREEN = '#00b14f';
const ZALO_URL = 'https://zalo.me/946504486043251830';

const TOPICS = [
    'Công cụ tạo CV',
    'Công cụ tìm kiếm',
    'Tính năng/Giao diện trang web',
    'Thông báo việc làm',
    'Thông tin công ty',
    'Khác',
];

const RATINGS = [
    { value: 1, label: 'Rất tệ', file: '/verry_bad.json' },
    { value: 2, label: 'Tệ', file: '/bad.json' },
    { value: 3, label: 'Bình thường', file: '/normal.json' },
    { value: 4, label: 'Tốt', file: '/good.json' },
    { value: 5, label: 'Tuyệt vời', file: '/verry_good.json' },
];

function EmojiRating({ value, onChange }) {
    const [anims, setAnims] = useState({});
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        RATINGS.forEach((r) => {
            fetch(r.file)
                .then((res) => res.json())
                .then((data) => setAnims((prev) => ({ ...prev, [r.value]: data })))
                .catch(() => {});
        });
    }, []);

    const active = hovered ?? value;

    return (
        <div className="flex justify-center gap-4 flex-wrap">
            {RATINGS.map((r) => (
                <button
                    key={r.value}
                    type="button"
                    onClick={() => onChange(r.value)}
                    onMouseEnter={() => setHovered(r.value)}
                    onMouseLeave={() => setHovered(null)}
                    className="flex flex-col items-center gap-1.5 border-none bg-transparent cursor-pointer p-1 rounded-xl transition-transform"
                    style={{
                        transform: active === r.value ? 'scale(1.12)' : 'scale(1)',
                        outline: value === r.value ? `2px solid ${GREEN}` : '2px solid transparent',
                        borderRadius: '12px',
                    }}
                >
                    <div className="w-14 h-14">
                        {anims[r.value] ? (
                            <Lottie animationData={anims[r.value]} loop={active === r.value} />
                        ) : (
                            <div className="w-14 h-14 rounded-full bg-slate-100" />
                        )}
                    </div>
                    <span
                        className="text-[11px] font-semibold"
                        style={{ color: value === r.value ? GREEN : '#9ca3af' }}
                    >
                        {r.label}
                    </span>
                </button>
            ))}
        </div>
    );
}

// Modal: "Bạn muốn?" — choose feedback or zalo
function ChoiceModal({ onFeedback, onClose }) {
    return (
        <div
            className="fixed inset-0 z-[1001] bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="text-base font-extrabold text-slate-900">Bạn muốn?</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border-none cursor-pointer bg-transparent"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3 p-5">
                    {/* Góp ý sản phẩm */}
                    <button
                        onClick={onFeedback}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-100 hover:border-green-300 hover:bg-green-50 cursor-pointer bg-white transition-all text-center"
                    >
                        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                            <MessageCircle size={28} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Góp ý sản phẩm</p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                Chia sẻ ý kiến, đề xuất và nhận xét về sản phẩm
                            </p>
                        </div>
                    </button>

                    {/* Chat Zalo */}
                    <a
                        href={ZALO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="flex flex-col items-center gap-3 p-5 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer bg-white transition-all text-center no-underline"
                    >
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center overflow-hidden">
                            <Image src={zaloIcon} alt="Zalo" width={40} height={40} className="object-contain" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Chat Zalo để được hỗ trợ</p>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                Yêu cầu hỗ trợ liên quan đến sản phẩm hoặc dịch vụ
                            </p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}

// Modal: Feedback form
function FeedbackModal({ onClose }) {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!topic) {
            toast.error('Vui lòng chọn chủ đề');
            return;
        }
        if (!description.trim()) {
            toast.error('Vui lòng nhập mô tả');
            return;
        }
        if (!rating) {
            toast.error('Vui lòng chọn đánh giá');
            return;
        }
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
        <div
            className="fixed inset-0 z-[1002] bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-base font-extrabold text-slate-900">Góp ý sản phẩm</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Phản hồi của bạn rất quan trọng với chúng tôi</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 border-none cursor-pointer bg-transparent"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {done ? (
                        <div className="flex flex-col items-center py-8 gap-4 text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                <MessageCircle size={32} className="text-green-500" />
                            </div>
                            <div>
                                <h4 className="text-lg font-extrabold text-slate-900 mb-2">Cảm ơn bạn!</h4>
                                <p className="text-sm text-slate-500">
                                    Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setDone(false);
                                    setTopic('');
                                    setDescription('');
                                    setRating(0);
                                }}
                                className="px-5 py-2.5 rounded-lg border text-sm font-semibold cursor-pointer bg-white"
                                style={{ borderColor: GREEN, color: GREEN }}
                            >
                                Gửi phản hồi khác
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            {/* Topic */}
                            <div>
                                <p className="text-[13px] font-bold text-slate-800 mb-2.5">
                                    Chủ đề cần góp ý <span className="text-red-500">*</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {TOPICS.map((t) => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setTopic(t)}
                                            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all"
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
                                <p className="text-[13px] font-bold text-slate-800 mb-2">
                                    Mô tả góp ý <span className="text-red-500">*</span>
                                </p>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mô tả góp ý của bạn giúp TopCV cải tiến sản phẩm, hỗ trợ bạn tốt hơn"
                                    rows={4}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 resize-none outline-none box-border leading-relaxed focus:border-green-400"
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>

                            {/* Rating */}
                            <div>
                                <p className="text-[13px] font-bold text-slate-800 mb-3 text-center">
                                    Bạn có hài lòng với TopCV không?
                                </p>
                                <EmojiRating value={rating} onChange={setRating} />
                            </div>
                        </form>
                    )}
                </div>

                {!done && (
                    <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 cursor-pointer bg-white hover:bg-slate-50 transition-colors"
                        >
                            Huỷ
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-[2] py-2.5 rounded-lg border-none text-white text-sm font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ background: GREEN }}
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// One icon button
function ActionBtn({ icon, label, onClick, href, color = '#6b7280', count }) {
    const cls =
        'relative group w-11 h-11 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow';

    const inner = (
        <>
            <span style={{ color }}>{icon}</span>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {count > 99 ? '99+' : count}
                </span>
            )}
            {/* Tooltip */}
            <span className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                {label}
                <span className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-800" />
            </span>
        </>
    );

    if (href)
        return (
            <Link href={href} className={cls} title={label}>
                {inner}
            </Link>
        );
    return (
        <button type="button" onClick={onClick} className={cls} title={label}>
            {inner}
        </button>
    );
}

export default function FloatingActions() {
    const { isAuthenticated } = useAuthStore();
    const [modal, setModal] = useState(null);
    const [savedCount, setSavedCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) return;
        savedJobsService
            .getMy({ limit: 1 })
            .then((res) => setSavedCount(res.data?.meta?.total ?? res.data?.total ?? 0))
            .catch(() => {});
    }, [isAuthenticated]);

    const handleGopY = () => {
        if (!isAuthenticated) {
            window.location.href = '/dang-nhap?redirect=/phan-hoi';
            return;
        }
        setModal('choice');
    };

    return (
        <>
            {/* 4 floating buttons */}
            <div className="fixed bottom-6 right-4 z-[999] flex flex-col gap-2.5 items-center">
                <ActionBtn
                    icon={<Heart size={20} fill="#fecdd3" stroke="#f43f5e" />}
                    label="Danh sách việc làm đã lưu"
                    href="/viec-lam-da-luu"
                    color="#f43f5e"
                    count={savedCount}
                />
                <ActionBtn
                    icon={<UserPlus size={20} />}
                    label="Danh sách kết nối nhà tuyển dụng"
                    href="/connect-to-employer/list"
                    color="#8b5cf6"
                />
                <ActionBtn
                    icon={<MessageCircle size={20} />}
                    label="Góp ý cho TopCV"
                    onClick={handleGopY}
                    color={GREEN}
                />
                <ActionBtn
                    icon={<HelpCircle size={20} />}
                    label="Trung tâm hỗ trợ ứng viên"
                    onClick={() => toast.info('Tính năng đang phát triển')}
                    color="#3b82f6"
                />
            </div>

            {modal === 'choice' && (
                <ChoiceModal onFeedback={() => setModal('feedback')} onClose={() => setModal(null)} />
            )}

            {modal === 'feedback' && <FeedbackModal onClose={() => setModal(null)} />}
        </>
    );
}
