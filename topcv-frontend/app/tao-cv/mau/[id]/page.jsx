'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';
import TieuChuanTemplate from '@/app/components/cv/templates/TieuChuan';
import TieuChuanItKNTemplate from '@/app/components/cv/templates/TieuChuanItKN';
import AnTuongTemplate from '@/app/components/cv/templates/AnTuong';
import JobSuggestions from '@/app/components/jobs/JobSuggestions';

const A4_W = 794;
const A4_H = 1123;
const PREVIEW_SCALE = 0.62;
const PREVIEW_W = Math.round(A4_W * PREVIEW_SCALE);

const SAMPLE_CONTENT = {
    personalInfo: {
        fullName: 'Nguyễn Văn Minh',
        title: 'Frontend Developer',
        email: 'minhkv@gmail.com',
        phone: '0901 234 567',
        address: 'Hồ Chí Minh',
        linkedin: 'linkedin.com/in/minhkv',
        github: 'github.com/minhkv',
    },
    objective:
        'Kỹ sư Frontend với 3+ năm kinh nghiệm React và Next.js. Mong muốn đóng góp vào sản phẩm có tác động lớn và phát triển trong môi trường Agile năng động.',
    experiences: [
        {
            id: '1',
            position: 'Frontend Developer',
            company: 'VNG Corporation',
            startDate: '06/2022',
            endDate: '',
            isCurrent: true,
            description:
                '- Phát triển tính năng mới cho Zalo Web với 20M+ người dùng\n- Tối ưu performance, giảm 40% load time\n- Mentor 2 junior developers',
        },
        {
            id: '2',
            position: 'Junior Frontend',
            company: 'FPT Software',
            startDate: '09/2020',
            endDate: '05/2022',
            isCurrent: false,
            description:
                '- Xây dựng giao diện hệ thống quản lý nội bộ\n- Tích hợp REST API với React / Redux',
        },
    ],
    education: [
        {
            id: '1',
            school: 'Đại học Bách Khoa TP.HCM',
            degree: 'Kỹ sư Công nghệ Thông tin',
            gpa: '3.6/4.0',
            startDate: '2016',
            endDate: '2020',
        },
    ],
    skills: [
        { id: '1', name: 'React / Next.js', level: 5 },
        { id: '2', name: 'TypeScript', level: 4 },
        { id: '3', name: 'Node.js', level: 3 },
        { id: '4', name: 'Tailwind CSS', level: 4 },
        { id: '5', name: 'Git / CI-CD', level: 4 },
    ],
    languages: [
        { id: '1', name: 'Tiếng Anh', level: 'B2 (IELTS 6.5)' },
        { id: '2', name: 'Tiếng Nhật', level: 'N4' },
    ],
    certifications: [
        { id: '1', name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' },
    ],
    activities: [
        {
            id: '1',
            role: 'Trưởng ban kỹ thuật',
            organization: 'CLB IT Bách Khoa',
            description: 'Tổ chức workshop hàng tháng về web development cho 200+ thành viên',
        },
    ],
};

const TEMPLATES = {
    'tieu-chuan': {
        id: 'tieu-chuan',
        name: 'Tiêu chuẩn',
        Component: TieuChuanTemplate,
        description: 'Gọn gàng, rõ ràng, phù hợp mọi ngành nghề. Được nhà tuyển dụng đánh giá cao.',
        colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'],
        tags: ['Phổ biến', 'Chuyên nghiệp'],
    },
    'tieu-chuan-it-kn': {
        id: 'tieu-chuan-it-kn',
        name: 'Tiêu chuẩn (ít kinh nghiệm)',
        Component: TieuChuanItKNTemplate,
        description: 'Tối ưu cho sinh viên và fresher. Làm nổi bật kỹ năng và học vấn thay vì kinh nghiệm.',
        colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'],
        tags: ['Sinh viên', 'Fresher'],
    },
    'an-tuong': {
        id: 'an-tuong',
        name: 'Ấn tượng',
        Component: AnTuongTemplate,
        description: 'Header đậm nét, thiết kế hiện đại. Phù hợp vị trí senior, design, marketing.',
        colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'],
        tags: ['Ấn tượng', 'Sáng tạo'],
    },
};

function TemplatePreview({ Component, color }) {
    return (
        <div
            style={{
                width: `${PREVIEW_W}px`,
                overflowX: 'hidden',
            }}
        >
            <div
                style={{
                    width: `${A4_W}px`,
                    transform: `scale(${PREVIEW_SCALE})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    marginBottom: `-${Math.round(A4_H * (1 - PREVIEW_SCALE))}px`,
                }}
            >
                <Component content={SAMPLE_CONTENT} color={color} />
            </div>
        </div>
    );
}

export default function TemplateDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated } = useAuthStore();

    const template = TEMPLATES[id];
    const defaultColor = searchParams.get('color') || template?.colors?.[0];
    const [selectedColor, setSelectedColor] = useState(defaultColor);
    const [creating, setCreating] = useState(false);

    if (!template) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                        Không tìm thấy mẫu CV
                    </div>
                    <button
                        onClick={() => router.push('/tao-cv')}
                        style={{ padding: '10px 20px', background: '#00b14f', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        Về trang mẫu CV
                    </button>
                </div>
            </div>
        );
    }

    const { Component } = template;

    const handleUse = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setCreating(true);
        try {
            const res = await resumeService.create({ type: 'resume', template: template.id, color: selectedColor });
            router.push(`/tao-cv/${res.data.id}`);
        } catch {
            setCreating(false);
        }
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh' }}>
            {/* Breadcrumb bar */}
            <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '12px 24px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6b7280' }}>
                    <button
                        onClick={() => router.push('/tao-cv')}
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '13px', padding: 0 }}
                    >
                        <ArrowLeft size={14} />
                        Chọn mẫu CV
                    </button>
                    <ChevronRight size={12} />
                    <span style={{ color: '#111827', fontWeight: '500' }}>{template.name}</span>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                {/* Main content: preview + panel */}
                <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
                    {/* CV preview */}
                    <div
                        style={{
                            flex: 1,
                            minWidth: 0,
                            background: '#e5e7eb',
                            borderRadius: '12px',
                            padding: '24px',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            style={{
                                boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                                borderRadius: '2px',
                                overflow: 'hidden',
                            }}
                        >
                            <TemplatePreview Component={Component} color={selectedColor} />
                        </div>
                    </div>

                    {/* Right panel */}
                    <div
                        style={{
                            width: '300px',
                            flexShrink: 0,
                            position: 'sticky',
                            top: '80px',
                        }}
                    >
                        {/* Template info card */}
                        <div
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                border: '1px solid #e5e7eb',
                                marginBottom: '16px',
                            }}
                        >
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                {template.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        style={{
                                            padding: '3px 10px',
                                            background: '#f0fdf4',
                                            color: '#00b14f',
                                            borderRadius: '20px',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            border: '1px solid #bbf7d0',
                                        }}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                                {template.name}
                            </h1>
                            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6', marginBottom: '20px' }}>
                                {template.description}
                            </p>

                            {/* Color picker */}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                                    Chọn màu sắc
                                </div>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {template.colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColor(c)}
                                            style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: c,
                                                border: selectedColor === c ? '3px solid #111827' : '2px solid transparent',
                                                cursor: 'pointer',
                                                outline: selectedColor === c ? '2px solid white' : 'none',
                                                outlineOffset: '-4px',
                                                flexShrink: 0,
                                                transition: 'transform 0.1s',
                                            }}
                                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleUse}
                                disabled={creating}
                                style={{
                                    width: '100%',
                                    padding: '13px',
                                    background: creating ? '#86efac' : '#00b14f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    cursor: creating ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'background 0.15s',
                                }}
                            >
                                <Check size={16} />
                                {creating ? 'Đang tạo...' : 'Dùng mẫu này'}
                            </button>
                        </div>

                        {/* Tips card */}
                        <div
                            style={{
                                background: '#f0fdf4',
                                borderRadius: '12px',
                                padding: '16px',
                                border: '1px solid #bbf7d0',
                            }}
                        >
                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d', marginBottom: '8px' }}>
                                Mẹo tạo CV ấn tượng
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#166534', lineHeight: '1.8' }}>
                                <li>Viết mục tiêu nghề nghiệp rõ ràng, ngắn gọn</li>
                                <li>Dùng số liệu cụ thể để mô tả thành tích</li>
                                <li>Cập nhật kỹ năng phù hợp với JD</li>
                                <li>Kiểm tra lỗi chính tả trước khi nộp</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Job suggestions */}
                <JobSuggestions />
            </div>
        </div>
    );
}
