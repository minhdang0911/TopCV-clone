'use client';

import { useState, useEffect, createElement } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, Edit2, Eye } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';
import { getTemplate } from '@/app/components/cv/templateRegistry';
import JobSuggestions from '@/app/components/jobs/JobSuggestions';
import chartArrown from '../assests/img/chart_banner_update_cv.png';

const A4_W = 794;
const A4_H = 1123;
const CARD_W = 220;
const SCALE = CARD_W / A4_W;
const THUMB_H = Math.round(A4_H * SCALE);

const SAMPLE_CONTENT = {
    personalInfo: {
        fullName: 'Nguyễn Văn Minh',
        title: 'Frontend Developer',
        email: 'minhkv@gmail.com',
        phone: '0901 234 567',
        address: 'Hồ Chí Minh',
        linkedin: 'linkedin.com/in/nguyenvanminh',
        github: 'github.com/nguyenvanminh',
    },
    objective:
        'Kỹ sư Frontend với hơn 3 năm kinh nghiệm xây dựng ứng dụng web hiệu suất cao sử dụng React và Next.js. Có khả năng làm việc độc lập lẫn theo nhóm, đam mê tối ưu hoá trải nghiệm người dùng và chất lượng mã nguồn. Mong muốn đóng góp vào các sản phẩm công nghệ có tầm ảnh hưởng lớn, đồng thời không ngừng học hỏi và phát triển bản thân trong môi trường chuyên nghiệp.',
    experiences: [
        {
            id: '1',
            position: 'Senior Frontend Developer',
            company: 'VNG Corporation',
            startDate: '06/2022',
            endDate: '',
            isCurrent: true,
            description:
                '- Dẫn dắt nhóm 4 kỹ sư phát triển giao diện Zalo Web phục vụ 20M+ người dùng hàng ngày\n- Tối ưu Core Web Vitals, cải thiện LCP từ 4.2s xuống 1.8s\n- Xây dựng design system nội bộ với 60+ component tái sử dụng',
        },
        {
            id: '2',
            position: 'Frontend Developer',
            company: 'Tiki Corporation',
            startDate: '01/2021',
            endDate: '05/2022',
            isCurrent: false,
            description:
                '- Phát triển và bảo trì các trang sản phẩm, giỏ hàng và thanh toán trên nền tảng e-commerce\n- Tích hợp A/B testing giúp tăng tỷ lệ chuyển đổi 15%\n- Làm việc chặt chẽ với đội thiết kế để hiện thực hoá giao diện pixel-perfect',
        },
        {
            id: '3',
            position: 'Junior Frontend Developer',
            company: 'KMS Technology',
            startDate: '07/2019',
            endDate: '12/2020',
            isCurrent: false,
            description:
                '- Phát triển giao diện cho hệ thống quản lý nội bộ bằng React và Redux\n- Viết unit test với Jest và React Testing Library, đạt coverage 85%',
        },
    ],
    education: [
        {
            id: '1',
            school: 'Đại học Bách Khoa TP.HCM',
            degree: 'Kỹ sư Công nghệ Thông tin',
            gpa: '3.6/4.0',
            startDate: '2015',
            endDate: '2019',
            description: 'Tốt nghiệp loại Giỏi. Đồ án tốt nghiệp: Hệ thống nhận diện khuôn mặt thời gian thực.',
        },
    ],
    skills: [
        { id: '1', name: 'React / Next.js', level: 5 },
        { id: '2', name: 'TypeScript', level: 4 },
        { id: '3', name: 'Tailwind CSS', level: 4 },
        { id: '4', name: 'Node.js / Express', level: 3 },
        { id: '5', name: 'GraphQL / REST API', level: 4 },
        { id: '6', name: 'Git / CI-CD', level: 4 },
    ],
    languages: [
        { id: '1', name: 'Tiếng Anh', level: 'IELTS 6.5' },
        { id: '2', name: 'Tiếng Nhật', level: 'N3' },
    ],
    certifications: [
        { id: '1', name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services', year: '2023' },
    ],
    activities: [
        {
            id: '1',
            name: 'Vietnam Frontend Meetup',
            role: 'Speaker',
            description: 'Trình bày chủ đề "React Server Components trong thực tế" tại sự kiện 200+ người tham dự.',
        },
    ],
};

function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function CvThumbnail({ cv }) {
    const TemplateComponent = getTemplate(cv.template);
    const content =
        cv.content &&
        Object.keys(cv.content).some((k) => {
            const v = cv.content[k];
            return v && (Array.isArray(v) ? v.length > 0 : typeof v === 'object' ? Object.keys(v).length > 0 : !!v);
        })
            ? cv.content
            : SAMPLE_CONTENT;
    const color = cv.color || '#00b14f';

    if (!TemplateComponent) return null;

    return (
        <div
            style={{
                width: `${CARD_W}px`,
                height: `${THUMB_H}px`,
                overflow: 'hidden',
                flexShrink: 0,
            }}
        >
            <div
                style={{
                    width: `${A4_W}px`,
                    transform: `scale(${SCALE})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                {createElement(TemplateComponent, { content, color })}
            </div>
        </div>
    );
}

export default function QuanLyCvPage() {
    const router = useRouter();
    const { hydrated, isAuthenticated } = useAuthStore();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        resumeService
            .list('resume')
            .then((res) => {
                setResumes(res.data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa CV này?')) return;
        setDeletingId(id);
        try {
            await resumeService.remove(id);
            setResumes((prev) => prev.filter((r) => r.id !== id));
        } catch {}
        setDeletingId(null);
    };

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 16px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

                {/* Header */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}
                >
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            CV đã tạo trên TopCV
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                            {resumes.length} CV
                        </p>
                    </div>
                    <Link
                        href="/tao-cv"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            background: '#00b14f',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textDecoration: 'none',
                        }}
                    >
                        <Plus size={16} />
                        Tạo CV
                    </Link>
                </div>

                {/* Banner */}
                <div
                    style={{
                        background: 'linear-gradient(180deg, #254348 0%, #198c56 126.72%)',
                        borderRadius: '8px',
                        padding: '30px',
                        marginBottom: '16px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'white',
                        gap: '24px',
                    }}
                >
                    {/* Left side */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Animated upward arrow icon + percentage */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                            <div
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    flexShrink: 0,
                                    animation: 'bounceUp 1.4s ease-in-out infinite',
                                }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
                                    <path d="M3 17L9 11L13 15L21 7" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M15 7H21V13" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1, color: '#4ade80' }}>
                                +28%
                            </span>
                        </div>

                        {/* Main description */}
                        <p style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 4px', lineHeight: '1.5' }}>
                            Ứng viên được NTD chủ động tiếp cận tăng 28% trong tuần vừa rồi
                        </p>
                        <p style={{ fontSize: '13px', margin: '0 0 20px', opacity: 0.8 }}>
                            Cập nhật CV để không bỏ lỡ cơ hội
                        </p>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Link
                                href="/tao-cv"
                                style={{
                                    padding: '9px 22px',
                                    background: 'white',
                                    color: '#198c56',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                }}
                            >
                                Cập nhật CV
                            </Link>
                            <Link
                                href="/tai-cv-len"
                                style={{
                                    padding: '9px 22px',
                                    background: 'transparent',
                                    color: 'white',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    textDecoration: 'none',
                                    border: '1.5px solid rgba(255,255,255,0.7)',
                                    display: 'inline-block',
                                }}
                            >
                                Tải CV lên
                            </Link>
                        </div>
                    </div>

                    {/* Right side — chart image */}
                    <div style={{ flexShrink: 0 }}>
                        <Image
                            src={chartArrown}
                            alt=""
                            width={200}
                            style={{ objectFit: 'contain', display: 'block' }}
                            unoptimized
                        />
                    </div>
                </div>

                {/* Keyframe style tag */}
                <style>{`
                    @keyframes bounceUp {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                    }
                `}</style>

                {/* CV List / empty / loading */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280', fontSize: '14px' }}>
                        Đang tải...
                    </div>
                ) : resumes.length === 0 ? (
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '60px 24px',
                            textAlign: 'center',
                            border: '2px dashed #e5e7eb',
                        }}
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
                                <rect width="56" height="56" rx="28" fill="#f0fdf4" />
                                <path d="M20 38V18a2 2 0 012-2h12l6 6v16a2 2 0 01-2 2H22a2 2 0 01-2-2z" stroke="#00b14f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                <path d="M34 16v6h6" stroke="#00b14f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="24" y1="26" x2="32" y2="26" stroke="#00b14f" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="24" y1="30" x2="32" y2="30" stroke="#00b14f" strokeWidth="1.8" strokeLinecap="round" />
                                <line x1="24" y1="34" x2="29" y2="34" stroke="#00b14f" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Bạn chưa có CV nào
                        </p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                            Tạo CV để tăng cơ hội được các nhà tuyển dụng tìm thấy bạn
                        </p>
                        <Link
                            href="/tao-cv"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 24px',
                                background: '#00b14f',
                                color: 'white',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                textDecoration: 'none',
                            }}
                        >
                            <Plus size={16} />
                            Tạo CV ngay
                        </Link>
                    </div>
                ) : (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, 220px)',
                            gap: '16px',
                        }}
                    >
                        {resumes.map((cv) => (
                            <div
                                key={cv.id}
                                onMouseEnter={() => setHoveredId(cv.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    background: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    width: `${CARD_W}px`,
                                    boxShadow: hoveredId === cv.id ? '0 4px 16px rgba(0,0,0,0.10)' : '0 1px 3px rgba(0,0,0,0.05)',
                                    transition: 'box-shadow 0.2s ease',
                                }}
                            >
                                {/* Thumbnail area */}
                                <div
                                    style={{
                                        width: `${CARD_W}px`,
                                        height: `${THUMB_H}px`,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        borderBottom: `3px solid ${cv.color || '#00b14f'}`,
                                        cursor: 'pointer',
                                        background: '#f9fafb',
                                    }}
                                    onClick={() => router.push(`/tao-cv/${cv.id}`)}
                                >
                                    <CvThumbnail cv={cv} />

                                    {/* Hover overlay */}
                                    {hoveredId === cv.id && (
                                        <div
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                background: 'rgba(0,0,0,0.48)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '10px',
                                            }}
                                        >
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/tao-cv/${cv.id}`);
                                                }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 20px',
                                                    background: '#00b14f',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    width: '150px',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Edit2 size={14} />
                                                Chỉnh sửa
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(`/tao-cv/${cv.id}?preview=1`, '_blank');
                                                }}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 20px',
                                                    background: 'transparent',
                                                    color: 'white',
                                                    border: '1.5px solid rgba(255,255,255,0.8)',
                                                    borderRadius: '6px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    width: '150px',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Eye size={14} />
                                                Xem trước
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Card info */}
                                <div style={{ padding: '12px' }}>
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#111827',
                                            marginBottom: '3px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                        title={cv.title}
                                    >
                                        {cv.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '10px' }}>
                                        Cập nhật: {formatDate(cv.updatedAt)}
                                    </div>

                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button
                                            onClick={() => router.push(`/tao-cv/${cv.id}`)}
                                            style={{
                                                flex: 1,
                                                padding: '6px 0',
                                                background: '#f3f4f6',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Chỉnh sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cv.id)}
                                            disabled={deletingId === cv.id}
                                            style={{
                                                padding: '6px 10px',
                                                background: '#fee2e2',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: deletingId === cv.id ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: deletingId === cv.id ? 0.6 : 1,
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <JobSuggestions />
            </div>
        </div>
    );
}
