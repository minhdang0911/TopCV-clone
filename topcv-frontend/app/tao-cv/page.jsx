'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';
import TieuChuanTemplate from '@/app/components/cv/templates/TieuChuan';
import TieuChuanItKNTemplate from '@/app/components/cv/templates/TieuChuanItKN';
import AnTuongTemplate from '@/app/components/cv/templates/AnTuong';
import ThanhLichTemplate from '@/app/components/cv/templates/ThanhLich';
import HienDaiTemplate from '@/app/components/cv/templates/HienDai';
import ChuyenNghiepTemplate from '@/app/components/cv/templates/ChuyenNghiep';
import GocCanhTemplate from '@/app/components/cv/templates/GocCanh';
import ThamVongTemplate from '@/app/components/cv/templates/ThamVong';
import robo from '@/app/assests/img/toppy-list-mau-cv.png';

const A4_W = 794;
const A4_H = 1123;
// Scale so the CV thumbnail fills the card width (~300px grid column)
const SCALE = 0.36;
const THUMB_W = Math.round(A4_W * SCALE);
const THUMB_H = Math.round(A4_H * SCALE);

const MODAL_SCALE = 0.58;
const MODAL_W = Math.round(A4_W * MODAL_SCALE);
const MODAL_H = Math.round(A4_H * MODAL_SCALE);

const SAMPLE_CONTENT = {
    personalInfo: {
        fullName: 'Nguyễn Văn Minh',
        title: 'Senior Frontend Developer',
        email: 'minhkv@gmail.com',
        phone: '0901 234 567',
        address: 'Hồ Chí Minh',
        linkedin: 'linkedin.com/in/minhkv',
        github: 'github.com/minhkv',
    },
    objective:
        'Kỹ sư Frontend với 3+ năm kinh nghiệm React và Next.js, chuyên xây dựng các ứng dụng web hiệu năng cao và trải nghiệm người dùng tốt. Mong muốn đóng góp vào sản phẩm có tác động lớn trong môi trường Agile năng động, học hỏi liên tục.',
    experiences: [
        {
            id: '1',
            position: 'Senior Frontend Developer',
            company: 'VNG Corporation',
            startDate: '06/2022',
            endDate: '',
            isCurrent: true,
            description:
                '- Phát triển tính năng mới cho Zalo Web với 20M+ người dùng\n- Tối ưu performance, giảm 40% load time bằng code splitting và lazy loading\n- Mentor 2 junior developers, tổ chức knowledge sharing sessions\n- Thiết kế hệ thống component library dùng chung cho 3 sản phẩm',
        },
        {
            id: '2',
            position: 'Frontend Developer',
            company: 'FPT Software',
            startDate: '09/2020',
            endDate: '05/2022',
            isCurrent: false,
            description:
                '- Xây dựng giao diện hệ thống quản lý nội bộ cho 500+ nhân viên\n- Tích hợp REST API với React/Redux, giảm 30% thời gian tải trang\n- Implement CI/CD pipeline với GitHub Actions\n- Cải thiện UX dựa trên user research, tăng 25% user retention',
        },
        {
            id: '3',
            position: 'Frontend Intern',
            company: 'Tiki Corporation',
            startDate: '06/2020',
            endDate: '08/2020',
            isCurrent: false,
            description:
                '- Hỗ trợ phát triển tính năng frontend cho trang thương mại điện tử\n- Fix bugs và viết unit tests cho module thanh toán',
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
            description: 'Thủ khoa kỳ 3 năm 2018. Giải nhì cuộc thi lập trình ACM-ICPC cấp trường.',
        },
    ],
    skills: [
        { id: '1', name: 'React / Next.js', level: 5 },
        { id: '2', name: 'TypeScript', level: 4 },
        { id: '3', name: 'Node.js / Express', level: 3 },
        { id: '4', name: 'Tailwind CSS', level: 4 },
        { id: '5', name: 'Git / CI-CD', level: 4 },
        { id: '6', name: 'Docker / AWS', level: 3 },
    ],
    languages: [
        { id: '1', name: 'Tiếng Anh', level: 'B2 (IELTS 6.5)' },
        { id: '2', name: 'Tiếng Nhật', level: 'N4' },
    ],
    certifications: [
        { id: '1', name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' },
        { id: '2', name: 'Meta Frontend Developer', issuer: 'Meta / Coursera', date: '2022' },
    ],
    activities: [
        {
            id: '1',
            role: 'Trưởng ban kỹ thuật',
            organization: 'CLB IT Bách Khoa',
            description:
                'Tổ chức workshop hàng tháng về web development cho 200+ thành viên. Xây dựng hệ thống quản lý sự kiện nội bộ.',
        },
    ],
};

const TEMPLATES = [
    {
        id: 'tieu-chuan',
        name: 'Tiêu chuẩn',
        Component: TieuChuanTemplate,
        description: 'Gọn gàng, rõ ràng, phù hợp mọi ngành nghề',
        colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'],
        tags: ['Mẫu CV Chuyên nghiệp'],
    },
    {
        id: 'tieu-chuan-it-kn',
        name: 'Tiêu chuẩn (ít kinh nghiệm)',
        Component: TieuChuanItKNTemplate,
        description: 'Tối ưu cho sinh viên, fresher',
        colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'],
        tags: ['Mẫu CV Đơn giản'],
    },
    {
        id: 'an-tuong',
        name: 'Ấn tượng',
        Component: AnTuongTemplate,
        description: 'Nổi bật với header đậm, phù hợp senior',
        colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'],
        tags: ['Mẫu CV Ấn tượng'],
    },
    {
        id: 'thanh-lich',
        name: 'Thanh lịch',
        Component: ThanhLichTemplate,
        description: 'Tối giản, thanh lịch, bố cục một cột',
        colors: ['#00b14f', '#1e3a5f', '#64748b', '#7c3aed'],
        tags: ['Mẫu CV Đơn giản'],
    },
    {
        id: 'hien-dai',
        name: 'Hiện đại',
        Component: HienDaiTemplate,
        description: 'Hai cột hiện đại, sidebar xám nhẹ',
        colors: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'],
        tags: ['Mẫu CV Ấn tượng'],
    },
    {
        id: 'chuyen-nghiep',
        name: 'Chuyên nghiệp',
        Component: ChuyenNghiepTemplate,
        description: 'Header màu nổi bật, phong cách doanh nghiệp',
        colors: ['#1e3a5f', '#374151', '#b91c1c', '#065f46'],
        tags: ['Mẫu CV Chuyên nghiệp'],
    },
    {
        id: 'goc-canh',
        name: 'Góc cạnh',
        Component: GocCanhTemplate,
        description: 'Sidebar tối, phong cách mạnh mẽ',
        colors: ['#1e293b', '#1e3a5f', '#7c3aed', '#be123c'],
        tags: ['Mẫu CV Ấn tượng'],
    },
    {
        id: 'tham-vong',
        name: 'Tham vọng',
        Component: ThamVongTemplate,
        description: 'Header tối, timeline thanh lịch',
        colors: ['#1e293b', '#0f4c75', '#6d28d9', '#064e3b'],
        tags: ['Mẫu CV Chuyên nghiệp'],
    },
];

const FILTER_TAGS = ['Tất cả', 'Mẫu CV Đơn giản', 'Mẫu CV Ấn tượng', 'Mẫu CV Chuyên nghiệp'];

function Thumbnail({ Component, color, scale = SCALE }) {
    const w = Math.round(A4_W * scale);
    const h = Math.round(A4_H * scale);
    return (
        <div style={{ width: `${w}px`, height: `${h}px`, overflow: 'hidden', background: 'white', margin: '0 auto' }}>
            <div
                style={{
                    width: `${A4_W}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    userSelect: 'none',
                }}
            >
                <Component content={SAMPLE_CONTENT} color={color} />
            </div>
        </div>
    );
}

export default function TaoCvPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [activeFilter, setActiveFilter] = useState('Tất cả');
    const [selectedColors, setSelectedColors] = useState(Object.fromEntries(TEMPLATES.map((t) => [t.id, t.colors[0]])));
    const [creating, setCreating] = useState(false);
    const [preview, setPreview] = useState(null); // { tpl, color }

    const handleUseTemplate = async (templateId, color) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setCreating(true);
        try {
            const res = await resumeService.create({ type: 'resume', template: templateId, color });
            router.push(`/tao-cv/${res.data.id}`);
        } catch {
            setCreating(false);
        }
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '40px 16px' }}>
            <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '30px', fontWeight: '800', color: '#111827', marginBottom: '10px' }}>
                        Mẫu CV xin việc tiếng Việt chuẩn 2026
                    </h1>
                    <p style={{ fontSize: '15px', color: '#6b7280' }}>
                        Tuyển chọn mẫu CV đa dạng phong cách, giúp bạn tạo dấu ấn cá nhân
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        marginBottom: '32px',
                        justifyContent: 'center',
                    }}
                >
                    {FILTER_TAGS.map((tag) => {
                        const active = activeFilter === tag;
                        return (
                            <button
                                key={tag}
                                onClick={() => setActiveFilter(tag)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '20px',
                                    border: active ? 'none' : '1px solid #d1d5db',
                                    background: active ? '#00b14f' : 'white',
                                    color: active ? 'white' : '#374151',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '24px',
                    }}
                >
                    {TEMPLATES.filter((tpl) => activeFilter === 'Tất cả' || tpl.tags.includes(activeFilter)).map((tpl) => {
                        const color = selectedColors[tpl.id];
                        return (
                            <div
                                key={tpl.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    transition: 'box-shadow 0.2s, transform 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                <div
                                    style={{ background: '#f0f0f0', overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => setPreview({ tpl, color })}
                                >
                                    <Thumbnail Component={tpl.Component} color={color} />
                                </div>

                                <div style={{ padding: '14px 16px 0' }}>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                                        {tpl.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                style={{
                                                    padding: '3px 9px',
                                                    background: '#f0fdf4',
                                                    color: '#15803d',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '15px',
                                            fontWeight: '700',
                                            color: '#111827',
                                            marginBottom: '4px',
                                        }}
                                    >
                                        {tpl.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                                        {tpl.description}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        padding: '0 16px 12px',
                                        display: 'flex',
                                        gap: '6px',
                                        alignItems: 'center',
                                    }}
                                >
                                    {tpl.colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColors((prev) => ({ ...prev, [tpl.id]: c }))}
                                            style={{
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                background: c,
                                                border: color === c ? '2.5px solid #111827' : '2px solid transparent',
                                                cursor: 'pointer',
                                                outline: color === c ? '2px solid white' : 'none',
                                                outlineOffset: '-4px',
                                                flexShrink: 0,
                                            }}
                                        />
                                    ))}
                                </div>

                                <div style={{ padding: '0 12px 14px', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setPreview({ tpl, color })}
                                        style={{
                                            flex: 1,
                                            padding: '9px',
                                            border: '1px solid #d1d5db',
                                            background: 'white',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: '#374151',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Xem trước
                                    </button>
                                    <button
                                        onClick={() => handleUseTemplate(tpl.id, color)}
                                        disabled={creating}
                                        style={{
                                            flex: 1,
                                            padding: '9px',
                                            border: 'none',
                                            background: '#00b14f',
                                            borderRadius: '8px',
                                            fontSize: '13px',
                                            color: 'white',
                                            cursor: creating ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                        }}
                                    >
                                        Dùng mẫu này
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Preview modal */}
            {preview && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.7)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        padding: '32px 16px',
                        overflowY: 'auto',
                    }}
                    onClick={() => setPreview(null)}
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: '24px',
                            alignItems: 'flex-start',
                            maxWidth: '1000px',
                            width: '100%',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CV preview */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div
                                style={{
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                    width: `${MODAL_W}px`,
                                }}
                            >
                                <div style={{ width: `${MODAL_W}px`, height: `${MODAL_H}px`, overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            width: `${A4_W}px`,
                                            transform: `scale(${MODAL_SCALE})`,
                                            transformOrigin: 'top left',
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                        }}
                                    >
                                        <preview.tpl.Component content={SAMPLE_CONTENT} color={preview.color} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side panel */}
                        <div
                            style={{
                                width: '260px',
                                flexShrink: 0,
                                background: 'white',
                                borderRadius: '12px',
                                padding: '24px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            }}
                        >
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                                {preview.tpl.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px' }}>
                                {preview.tpl.description}
                            </div>

                            <div
                                style={{
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    color: '#6b7280',
                                    marginBottom: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Màu sắc
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                                {preview.tpl.colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setPreview((p) => ({ ...p, color: c }))}
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            background: c,
                                            border: preview.color === c ? '3px solid #111827' : '2px solid transparent',
                                            cursor: 'pointer',
                                            outline: preview.color === c ? '2px solid white' : 'none',
                                            outlineOffset: '-4px',
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => {
                                    handleUseTemplate(preview.tpl.id, preview.color);
                                    setPreview(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: '#00b14f',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    marginBottom: '10px',
                                }}
                            >
                                Dùng mẫu này
                            </button>
                            <button
                                onClick={() => setPreview(null)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    background: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    color: '#374151',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                }}
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
