'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Send, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';
import useAuthStore from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

const GREEN = '#00b14f';

const TOPICS = [
    'Công cụ tạo CV',
    'Công cụ tìm kiếm',
    'Tính năng / Giao diện',
    'Thông báo việc làm',
    'Thông tin công ty',
    'Kết nối nhà tuyển dụng',
    'Khác',
];

const RATINGS = [
    { value: 1, label: 'Rất tệ',    file: '/verry_bad.json' },
    { value: 2, label: 'Tệ',        file: '/bad.json' },
    { value: 3, label: 'Bình thường', file: '/normal.json' },
    { value: 4, label: 'Tốt',       file: '/good.json' },
    { value: 5, label: 'Tuyệt vời', file: '/verry_good.json' },
];

function RatingPicker({ value, onChange }) {
    const [anims, setAnims] = useState({});
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        RATINGS.forEach(r => {
            fetch(r.file).then(res => res.json()).then(data => {
                setAnims(prev => ({ ...prev, [r.value]: data }));
            }).catch(() => {});
        });
    }, []);

    const active = hovered ?? value;

    return (
        <div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {RATINGS.map(r => (
                    <button
                        key={r.value}
                        type="button"
                        onClick={() => onChange(r.value)}
                        onMouseEnter={() => setHovered(r.value)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                            border: 'none', background: 'transparent', cursor: 'pointer',
                            padding: '8px', borderRadius: '12px',
                            outline: value === r.value ? `2px solid ${GREEN}` : '2px solid transparent',
                            transition: 'all 0.15s',
                            transform: active === r.value ? 'scale(1.1)' : 'scale(1)',
                        }}
                    >
                        <div style={{ width: '56px', height: '56px' }}>
                            {anims[r.value]
                                ? <Lottie animationData={anims[r.value]} loop={active === r.value} />
                                : <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#f3f4f6' }} />
                            }
                        </div>
                        <span style={{
                            fontSize: '11px', fontWeight: value === r.value ? '700' : '400',
                            color: value === r.value ? GREEN : '#6b7280',
                        }}>
                            {r.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function PhanHoiPage() {
    const { isAuthenticated, hydrated } = useAuthStore();
    const router = useRouter();

    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [rating, setRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated) router.replace('/dang-nhap?redirect=/phan-hoi');
    }, [hydrated, isAuthenticated, router]);

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

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingTop: '40px', paddingBottom: '60px' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 16px' }}>

                {done ? (
                    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '60px 24px', textAlign: 'center' }}>
                        <CheckCircle size={56} color={GREEN} style={{ margin: '0 auto 16px', display: 'block' }} />
                        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px' }}>
                            Cảm ơn bạn đã phản hồi!
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 24px' }}>
                            Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể.
                        </p>
                        <button
                            onClick={() => { setDone(false); setTopic(''); setDescription(''); setRating(0); }}
                            style={{ padding: '10px 28px', borderRadius: '8px', border: `1px solid ${GREEN}`, background: 'white', color: GREEN, fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                        >
                            Gửi phản hồi khác
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '24px' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 6px' }}>
                                Gửi phản hồi
                            </h1>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                Ý kiến của bạn giúp chúng tôi cải thiện sản phẩm tốt hơn
                            </p>
                        </div>

                        {/* Topic */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px 20px 16px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>Chủ đề</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {TOPICS.map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTopic(t)}
                                        style={{
                                            padding: '7px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                                            border: topic === t ? `2px solid ${GREEN}` : '2px solid #e5e7eb',
                                            background: topic === t ? '#f0fdf4' : 'white',
                                            color: topic === t ? GREEN : '#374151',
                                            cursor: 'pointer', transition: 'all 0.12s',
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>Mô tả chi tiết</div>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Nhập mô tả phản hồi của bạn..."
                                rows={5}
                                style={{
                                    width: '100%', border: '1px solid #e5e7eb', borderRadius: '8px',
                                    padding: '10px 12px', fontSize: '13px', color: '#374151',
                                    resize: 'vertical', outline: 'none', boxSizing: 'border-box',
                                    fontFamily: 'inherit', lineHeight: '1.5',
                                }}
                            />
                        </div>

                        {/* Rating */}
                        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>
                                Đánh giá trải nghiệm của bạn
                            </div>
                            <RatingPicker value={rating} onChange={setRating} />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                width: '100%', padding: '14px', borderRadius: '10px',
                                border: 'none', background: submitting ? '#9ca3af' : GREEN,
                                color: 'white', fontSize: '15px', fontWeight: '700',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }}
                        >
                            <Send size={18} />
                            {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
