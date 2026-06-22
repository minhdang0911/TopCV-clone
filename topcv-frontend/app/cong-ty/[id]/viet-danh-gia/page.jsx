'use client';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import roboDoneReview from '../../../assests/img/robo-done-review.png';
import daDanhGia from '../../../assests/img/da-danh-gia-cong-ty-roi.png';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Star } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

const DETAIL_CATEGORIES = [
    { key: 'salaryRating', label: 'Lương thưởng & phúc lợi' },
    { key: 'trainingRating', label: 'Đào tạo & học hỏi' },
    { key: 'careRating', label: 'Sự quan tâm đến nhân viên' },
    { key: 'cultureRating', label: 'Văn hoá công ty' },
    { key: 'officeRating', label: 'Văn phòng làm việc' },
];

function StarPicker({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div style={{ display: 'flex', gap: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <button
                    key={s}
                    type="button"
                    onClick={() => onChange(s)}
                    onMouseEnter={() => setHover(s)}
                    onMouseLeave={() => setHover(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                >
                    <Star
                        size={24}
                        fill={(hover || value) >= s ? '#f59e0b' : 'none'}
                        stroke={(hover || value) >= s ? '#f59e0b' : '#d1d5db'}
                        strokeWidth={1.5}
                    />
                </button>
            ))}
        </div>
    );
}

const CONFETTI_COLORS = ['#f59e0b', '#00b14f', '#3b82f6', '#ef4444', '#a855f7', '#ec4899', '#06b6d4', '#f97316'];

function SuccessScreen({ onBack }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = Array.from({ length: 120 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: 8 + Math.random() * 8,
            h: 4 + Math.random() * 6,
            color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            vx: (Math.random() - 0.5) * 3,
            vy: 2 + Math.random() * 4,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.15,
            opacity: 1,
        }));

        let raf;
        let tick = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            tick++;
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.angle += p.spin;
                if (tick > 90) p.opacity = Math.max(0, p.opacity - 0.012);
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                    p.opacity = tick > 90 ? 0 : 1;
                }
                ctx.save();
                ctx.globalAlpha = p.opacity;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            if (particles.some((p) => p.opacity > 0)) raf = requestAnimationFrame(draw);
        };

        raf = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }} />
            <div
                style={{
                    background: '#fff',
                    borderRadius: 16,
                    padding: '48px 48px 40px',
                    textAlign: 'center',
                    maxWidth: 480,
                    width: '100%',
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
                }}
            >
                <Image
                    src={roboDoneReview}
                    alt="Done"
                    width={220}
                    height={220}
                    style={{ margin: '0 auto 16px', display: 'block' }}
                    unoptimized
                />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 8 }}>
                    Cảm ơn bạn đã đánh giá!
                </h2>
                <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                    Đánh giá của bạn đang chờ admin duyệt và sẽ được hiển thị ẩn danh sau khi được phê duyệt.
                </p>
                <button
                    onClick={onBack}
                    style={{
                        padding: '12px 32px',
                        background: '#00b14f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    Quay lại trang công ty
                </button>
            </div>
        </div>
    );
}

export default function WriteReviewPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [company, setCompany] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState({});
    const [myReview, setMyReview] = useState(undefined); // undefined = loading, null = none

    const initialRating = parseInt(searchParams.get('rating') || '0', 10);

    const [form, setForm] = useState({
        rating: initialRating || 0,
        title: '',
        overtimePolicy: '',
        overtimeReason: '',
        liked: '',
        improvement: '',
        salaryRating: 0,
        trainingRating: 0,
        careRating: 0,
        cultureRating: 0,
        officeRating: 0,
        recommend: null,
    });

    useEffect(() => {
        if (!id) return;
        api.get(`/employers/${id}`)
            .then((r) => setCompany(r.data))
            .catch(() => {});
        api.get(`/employers/${id}/employer-reviews/my-review`)
            .then((r) => setMyReview(r.data))
            .catch(() => setMyReview(null));
    }, [id]);

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const validate = () => {
        const e = {};
        if (!form.rating) e.rating = 'Vui lòng chọn số sao';
        if (!form.title.trim()) e.title = 'Vui lòng nhập tiêu đề';
        if (form.title.trim().length < 10) e.title = 'Tiêu đề tối thiểu 10 ký tự';
        if (!form.overtimePolicy) e.overtimePolicy = 'Vui lòng chọn';
        if (form.overtimePolicy && !form.overtimeReason?.trim())
            e.overtimeReason = 'Vui lòng nhập lý do (tối thiểu 10 ký tự)';
        if (form.overtimeReason && form.overtimeReason.trim().length < 10) e.overtimeReason = 'Tối thiểu 10 ký tự';
        if (!form.liked.trim() || form.liked.trim().length < 50) e.liked = 'Tối thiểu 50 ký tự';
        if (!form.improvement.trim() || form.improvement.trim().length < 50) e.improvement = 'Tối thiểu 50 ký tự';
        DETAIL_CATEGORIES.forEach(({ key }) => {
            if (!form[key]) e[key] = 'Vui lòng chọn';
        });
        if (form.recommend === null) e.recommend = 'Vui lòng chọn';
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        setErrors(e);
        if (Object.keys(e).length > 0) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        setSubmitting(true);
        try {
            await api.post(`/employers/${id}/employer-reviews`, form);
            setSubmitted(true);
        } catch {
            toast.error('Đã có lỗi xảy ra, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return <SuccessScreen id={id} onBack={() => router.push(`/cong-ty/${id}`)} />;
    }

    if (myReview?.status === 'APPROVED' || myReview?.status === 'PENDING') {
        const isApproved = myReview.status === 'APPROVED';
        return (
            <div
                style={{
                    minHeight: '100vh',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px 16px',
                }}
            >
                <div
                    style={{
                        background: '#fff',
                        borderRadius: 16,
                        padding: '48px 40px',
                        textAlign: 'center',
                        maxWidth: 460,
                        width: '100%',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    }}
                >
                    <Image src={daDanhGia} alt="" width={180} height={180} style={{ margin: '0 auto 16px', display: 'block' }} unoptimized />
                    <h2 style={{ fontSize: 20, fontWeight: 800, color: '#111', marginBottom: 10 }}>
                        {isApproved ? 'Bạn đã đánh giá công ty này' : 'Đánh giá đang chờ duyệt'}
                    </h2>
                    <p style={{ color: '#666', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
                        {isApproved
                            ? 'Mỗi người chỉ được gửi một đánh giá cho mỗi công ty. Đánh giá của bạn đã được duyệt và hiển thị công khai.'
                            : 'Đánh giá của bạn đã được gửi và đang chờ admin phê duyệt. Vui lòng chờ trong ít ngày.'}
                    </p>
                    <button
                        onClick={() => router.push(`/cong-ty/${id}`)}
                        style={{
                            padding: '12px 32px',
                            background: '#00b14f',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 15,
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        Quay lại trang công ty
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '24px 16px' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                {/* Back */}
                <button
                    onClick={() => router.back()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#555',
                        fontSize: 14,
                        marginBottom: 16,
                        padding: 0,
                    }}
                >
                    <ChevronLeft size={16} /> Quay lại
                </button>

                <div
                    className="review-grid"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}
                >
                    {/* Form */}
                    <div style={{ background: '#fff', borderRadius: 12, padding: '32px 36px' }}>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 4 }}>
                            Đánh giá {company?.companyName ?? ''}
                        </h1>
                        <p style={{ fontSize: 13, color: '#777', marginBottom: 20 }}>
                            Bạn chỉ mất 1 phút để hoàn thành. Đánh giá của bạn sẽ được gửi ẩn danh.
                        </p>

                        {/* Overall rating */}
                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#111',
                                    display: 'block',
                                    marginBottom: 8,
                                }}
                            >
                                Đánh giá chung <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <StarPicker value={form.rating} onChange={(v) => set('rating', v)} />
                            {errors.rating && (
                                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{errors.rating}</p>
                            )}
                        </div>

                        {/* Title */}
                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#111',
                                    display: 'block',
                                    marginBottom: 8,
                                }}
                            >
                                Tiêu đề <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                value={form.title}
                                onChange={(e) => set('title', e.target.value)}
                                placeholder="Tiêu đề đánh giá của bạn"
                                maxLength={140}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '10px 14px',
                                    border: `1.5px solid ${errors.title ? '#ef4444' : '#e5e7eb'}`,
                                    borderRadius: 8,
                                    fontSize: 14,
                                    outline: 'none',
                                }}
                            />
                            <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Giới hạn từ 10 đến 140 ký tự.</p>
                            {errors.title && (
                                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 2 }}>{errors.title}</p>
                            )}
                        </div>

                        {/* Overtime */}
                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#111',
                                    display: 'block',
                                    marginBottom: 10,
                                }}
                            >
                                Bạn cảm thấy như thế nào về chế độ OT? <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            {['satisfied', 'unsatisfied'].map((v) => (
                                <label
                                    key={v}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 8,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        color: '#333',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="overtime"
                                        checked={form.overtimePolicy === v}
                                        onChange={() => set('overtimePolicy', v)}
                                        style={{ accentColor: '#00b14f' }}
                                    />
                                    {v === 'satisfied' ? 'Hài lòng' : 'Không hài lòng'}
                                </label>
                            ))}
                            {errors.overtimePolicy && (
                                <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.overtimePolicy}</p>
                            )}
                            {form.overtimePolicy && (
                                <div style={{ marginTop: 10 }}>
                                    <textarea
                                        value={form.overtimeReason}
                                        onChange={(e) => set('overtimeReason', e.target.value)}
                                        placeholder="Nhập lý do của bạn"
                                        maxLength={140}
                                        rows={3}
                                        style={{
                                            width: '100%',
                                            boxSizing: 'border-box',
                                            padding: '10px 14px',
                                            border: `1.5px solid ${errors.overtimeReason ? '#ef4444' : '#e5e7eb'}`,
                                            borderRadius: 8,
                                            fontSize: 14,
                                            outline: 'none',
                                            resize: 'vertical',
                                        }}
                                    />
                                    <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                        Giới hạn từ 10 đến 140 ký tự.
                                    </p>
                                    {errors.overtimeReason && (
                                        <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.overtimeReason}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Liked */}
                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#111',
                                    display: 'block',
                                    marginBottom: 8,
                                }}
                            >
                                Điều làm bạn thích làm việc tại đây <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                value={form.liked}
                                onChange={(e) => set('liked', e.target.value)}
                                placeholder="Nhập nội dung"
                                maxLength={10000}
                                rows={4}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '10px 14px',
                                    border: `1.5px solid ${errors.liked ? '#ef4444' : '#e5e7eb'}`,
                                    borderRadius: 8,
                                    fontSize: 14,
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                            />
                            <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                Giới hạn từ 50 đến 10000 ký tự. ({form.liked.length}/10000)
                            </p>
                            {errors.liked && <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.liked}</p>}
                        </div>

                        {/* Improvement */}
                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#111',
                                    display: 'block',
                                    marginBottom: 8,
                                }}
                            >
                                Đề nghị cải thiện <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                value={form.improvement}
                                onChange={(e) => set('improvement', e.target.value)}
                                placeholder="Nhập nội dung"
                                maxLength={10000}
                                rows={4}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '10px 14px',
                                    border: `1.5px solid ${errors.improvement ? '#ef4444' : '#e5e7eb'}`,
                                    borderRadius: 8,
                                    fontSize: 14,
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                            />
                            <p style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                                Giới hạn từ 50 đến 10000 ký tự. ({form.improvement.length}/10000)
                            </p>
                            {errors.improvement && (
                                <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.improvement}</p>
                            )}
                        </div>

                        {/* Detail ratings */}
                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#111',
                                    display: 'block',
                                    marginBottom: 14,
                                }}
                            >
                                Đánh giá chi tiết <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {DETAIL_CATEGORIES.map(({ key, label }) => (
                                    <div
                                        key={key}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 12,
                                        }}
                                    >
                                        <span style={{ fontSize: 14, color: '#333', minWidth: 0, flex: 1 }}>
                                            {label}
                                        </span>
                                        <div>
                                            <StarPicker value={form[key]} onChange={(v) => set(key, v)} />
                                            {errors[key] && (
                                                <p
                                                    style={{
                                                        color: '#ef4444',
                                                        fontSize: 11,
                                                        marginTop: 2,
                                                        textAlign: 'right',
                                                    }}
                                                >
                                                    {errors[key]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recommend */}
                        <div style={{ marginBottom: 32 }}>
                            <label
                                style={{
                                    fontSize: 14,
                                    fontWeight: 600,
                                    color: '#111',
                                    display: 'block',
                                    marginBottom: 10,
                                }}
                            >
                                Bạn có muốn giới thiệu công ty này đến bạn bè của mình?{' '}
                                <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            {[
                                { val: true, label: 'Có' },
                                { val: false, label: 'Không' },
                            ].map(({ val, label }) => (
                                <label
                                    key={label}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 8,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        color: '#333',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="recommend"
                                        checked={form.recommend === val}
                                        onChange={() => set('recommend', val)}
                                        style={{ accentColor: '#00b14f' }}
                                    />
                                    {label}
                                </label>
                            ))}
                            {errors.recommend && <p style={{ color: '#ef4444', fontSize: 12 }}>{errors.recommend}</p>}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: submitting ? '#86efac' : '#00b14f',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                fontSize: 15,
                                fontWeight: 700,
                                cursor: submitting ? 'wait' : 'pointer',
                            }}
                        >
                            {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </button>
                    </div>

                    {/* Guidelines sidebar */}
                    <div style={{ background: '#1a1a2e', borderRadius: 12, padding: '24px', color: '#fff' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                            Hướng dẫn và điều kiện về đánh giá
                        </h3>
                        <p style={{ fontSize: 13, color: '#ccc', marginBottom: 16, lineHeight: 1.6 }}>
                            Mọi đánh giá phải tuân thủ Hướng Dẫn & Điều Kiện để được hiển thị trên website.
                        </p>
                        <p style={{ fontSize: 13, color: '#ccc', marginBottom: 12 }}>Xin vui lòng:</p>
                        <ul style={{ fontSize: 13, color: '#ccc', paddingLeft: 16, lineHeight: 2 }}>
                            <li>Không sử dụng từ ngữ mang ý xúc phạm, miệt thị</li>
                            <li>Không cung cấp thông tin cá nhân</li>
                            <li>Không cung cấp thông tin bảo mật, bí mật kinh doanh của công ty</li>
                        </ul>
                        plan
                    </div>
                </div>

                <style>{`
                    @media (max-width: 768px) {
                        .review-grid { grid-template-columns: 1fr !important; }
                    }
                `}</style>
            </div>
        </div>
    );
}
