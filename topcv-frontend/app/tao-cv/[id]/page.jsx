'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Printer, ArrowLeft, GripVertical, Check, Eye, EyeOff, ChevronRight, X } from 'lucide-react';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
    useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import useAuthStore from '@/stores/auth.store';
import useResumeStore from '@/stores/resume.store';
import { resumeService } from '@/services/resume.service';
import { getTemplate } from '@/app/components/cv/templateRegistry';
import TieuChuanTemplate from '@/app/components/cv/templates/TieuChuan';
import TieuChuanItKNTemplate from '@/app/components/cv/templates/TieuChuanItKN';
import AnTuongTemplate from '@/app/components/cv/templates/AnTuong';
import ThanhLichTemplate from '@/app/components/cv/templates/ThanhLich';
import HienDaiTemplate from '@/app/components/cv/templates/HienDai';
import ChuyenNghiepTemplate from '@/app/components/cv/templates/ChuyenNghiep';
import GocCanhTemplate from '@/app/components/cv/templates/GocCanh';
import ThamVongTemplate from '@/app/components/cv/templates/ThamVong';
import KinhDoanhTemplate from '@/app/components/cv/templates/KinhDoanh';
import KinhDoanh2Template from '@/app/components/cv/templates/KinhDoanh2';
import KinhDoanh3Template from '@/app/components/cv/templates/KinhDoanh3';
import KinhDoanh4Template from '@/app/components/cv/templates/KinhDoanh4';
import LapTrinhVienCVTemplate from '@/app/components/cv/templates/LapTrinhVienCV';
import LapTrinhVienCV2Template from '@/app/components/cv/templates/LapTrinhVienCV2';
import LapTrinhVienCV3Template from '@/app/components/cv/templates/LapTrinhVienCV3';
import LapTrinhVienCV4Template from '@/app/components/cv/templates/LapTrinhVienCV4';
import KeToanTemplate from '@/app/components/cv/templates/KeToan';
import KeToan2Template from '@/app/components/cv/templates/KeToan2';
import KeToan3Template from '@/app/components/cv/templates/KeToan3';
import KeToan4Template from '@/app/components/cv/templates/KeToan4';
import MarketingCVTemplate from '@/app/components/cv/templates/MarketingCV';
import MarketingCV2Template from '@/app/components/cv/templates/MarketingCV2';
import MarketingCV3Template from '@/app/components/cv/templates/MarketingCV3';
import MarketingCV4Template from '@/app/components/cv/templates/MarketingCV4';
import EditableCVDocument, { SECTION_LABELS, ALL_SECTIONS } from './EditableCVDocument';

// ── Constants ────────────────────────────────────────────────────────────────

const A4_W = 794;
const A4_H = 1123;
const THUMB_SCALE = 0.19;
const THUMB_W = Math.round(A4_W * THUMB_SCALE);
const THUMB_H = Math.round(A4_H * THUMB_SCALE);

const CV_BACKGROUNDS = [
    { id: 'white', bg: 'white', label: 'Trắng' },
    { id: 'gray', bg: '#f8f9fa', label: 'Xám nhạt' },
    { id: 'green', bg: '#f0fdf4', label: 'Xanh lá' },
    { id: 'blue', bg: '#eff6ff', label: 'Xanh dương' },
    { id: 'purple', bg: '#faf5ff', label: 'Tím nhạt' },
    { id: 'warm', bg: '#fff7ed', label: 'Cam nhạt' },
    { id: 'rose', bg: '#fff1f2', label: 'Hồng nhạt' },
    { id: 'teal', bg: '#f0fdfa', label: 'Xanh ngọc' },
    { id: 'grad1', bg: 'linear-gradient(160deg,#f0fdf4 0%,#eff6ff 100%)', label: 'Gradient 1' },
    { id: 'grad2', bg: 'linear-gradient(160deg,#faf5ff 0%,#fff7ed 100%)', label: 'Gradient 2' },
    { id: 'grad3', bg: 'linear-gradient(160deg,#eff6ff 0%,#fff1f2 100%)', label: 'Gradient 3' },
    { id: 'grad4', bg: 'linear-gradient(160deg,#f0fdfa 0%,#f0fdf4 100%)', label: 'Gradient 4' },
];

const FONTS = ['Arial', 'Georgia', 'Verdana', 'Tahoma', 'Times New Roman'];

const ALL_TEMPLATES = [
    { id: 'tieu-chuan', name: 'Tiêu chuẩn', Component: TieuChuanTemplate, colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'] },
    { id: 'tieu-chuan-it-kn', name: 'Tiêu chuẩn (ít KN)', Component: TieuChuanItKNTemplate, colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'] },
    { id: 'an-tuong', name: 'Ấn tượng', Component: AnTuongTemplate, colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'] },
    { id: 'thanh-lich', name: 'Thanh lịch', Component: ThanhLichTemplate, colors: ['#00b14f', '#1e3a5f', '#64748b', '#7c3aed'] },
    { id: 'hien-dai', name: 'Hiện đại', Component: HienDaiTemplate, colors: ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981'] },
    { id: 'chuyen-nghiep', name: 'Chuyên nghiệp', Component: ChuyenNghiepTemplate, colors: ['#1e3a5f', '#374151', '#b91c1c', '#065f46'] },
    { id: 'goc-canh', name: 'Góc cạnh', Component: GocCanhTemplate, colors: ['#1e293b', '#1e3a5f', '#7c3aed', '#be123c'] },
    { id: 'tham-vong', name: 'Tham vọng', Component: ThamVongTemplate, colors: ['#1e293b', '#0f4c75', '#6d28d9', '#064e3b'] },
    { id: 'kinh-doanh', name: 'Kinh doanh 1', Component: KinhDoanhTemplate, colors: ['#d35400', '#c0392b', '#e67e22', '#27ae60'] },
    { id: 'kinh-doanh-2', name: 'Kinh doanh 2', Component: KinhDoanh2Template, colors: ['#c0392b', '#d35400', '#7c3aed', '#1e3a5f'] },
    { id: 'kinh-doanh-3', name: 'Kinh doanh 3', Component: KinhDoanh3Template, colors: ['#27ae60', '#00b14f', '#16a085', '#2471a3'] },
    { id: 'kinh-doanh-4', name: 'Kinh doanh 4', Component: KinhDoanh4Template, colors: ['#e67e22', '#d35400', '#c0392b', '#7c3aed'] },
    { id: 'lap-trinh-vien-cv', name: 'Lập trình viên 1', Component: LapTrinhVienCVTemplate, colors: ['#2c3e7a', '#1e293b', '#16a085', '#6d28d9'] },
    { id: 'lap-trinh-vien-cv-2', name: 'Lập trình viên 2', Component: LapTrinhVienCV2Template, colors: ['#16a085', '#0f4c75', '#2c3e7a', '#6d28d9'] },
    { id: 'lap-trinh-vien-cv-3', name: 'Lập trình viên 3', Component: LapTrinhVienCV3Template, colors: ['#6d28d9', '#2c3e7a', '#16a085', '#0ea5e9'] },
    { id: 'lap-trinh-vien-cv-4', name: 'Lập trình viên 4', Component: LapTrinhVienCV4Template, colors: ['#0ea5e9', '#2c3e7a', '#8b5cf6', '#16a085'] },
    { id: 'ke-toan', name: 'Kế toán 1', Component: KeToanTemplate, colors: ['#1a3a6b', '#374151', '#065f46', '#7c3aed'] },
    { id: 'ke-toan-2', name: 'Kế toán 2', Component: KeToan2Template, colors: ['#374151', '#1a3a6b', '#1e293b', '#065f46'] },
    { id: 'ke-toan-3', name: 'Kế toán 3', Component: KeToan3Template, colors: ['#065f46', '#1a3a6b', '#374151', '#2471a3'] },
    { id: 'ke-toan-4', name: 'Kế toán 4', Component: KeToan4Template, colors: ['#7c3aed', '#1a3a6b', '#374151', '#065f46'] },
    { id: 'marketing-cv', name: 'Marketing 1', Component: MarketingCVTemplate, colors: ['#7c3aed', '#be123c', '#d97706', '#0ea5e9'] },
    { id: 'marketing-cv-2', name: 'Marketing 2', Component: MarketingCV2Template, colors: ['#be123c', '#7c3aed', '#d97706', '#0ea5e9'] },
    { id: 'marketing-cv-3', name: 'Marketing 3', Component: MarketingCV3Template, colors: ['#d97706', '#be123c', '#7c3aed', '#0ea5e9'] },
    { id: 'marketing-cv-4', name: 'Marketing 4', Component: MarketingCV4Template, colors: ['#0ea5e9', '#7c3aed', '#be123c', '#d97706'] },
];

const THUMB_SAMPLE = {
    personalInfo: { fullName: 'Nguyễn Văn Minh', title: 'Frontend Developer', email: 'minh@email.com', phone: '0901 234 567', address: 'TP. Hồ Chí Minh', linkedin: 'linkedin.com/in/minhkv', github: 'github.com/minhkv' },
    objective: 'Kỹ sư Frontend với 3 năm kinh nghiệm React và Next.js. Mong muốn đóng góp vào sản phẩm công nghệ lớn có tác động xã hội mạnh mẽ trong môi trường Agile năng động.',
    experiences: [
        { id: '1', position: 'Senior Frontend Developer', company: 'VNG Corporation', startDate: '06/2022', endDate: '', isCurrent: true, description: '- Phát triển tính năng mới cho Zalo Web với 20M+ người dùng\n- Tối ưu performance, giảm 40% load time\n- Mentor 2 junior developers trong nhóm' },
        { id: '2', position: 'Frontend Developer', company: 'FPT Software', startDate: '09/2020', endDate: '05/2022', isCurrent: false, description: '- Xây dựng hệ thống quản lý nội bộ cho 500+ nhân viên\n- Tích hợp REST API với React/Redux\n- Cải thiện UX, tăng 25% user retention' },
    ],
    education: [{ id: '1', school: 'ĐH Bách Khoa TP.HCM', degree: 'Kỹ sư Công nghệ Thông tin', gpa: '3.6/4.0', startDate: '2016', endDate: '2020', description: 'Thủ khoa kỳ 3 năm 2018. Giải nhì cuộc thi lập trình ACM-ICPC cấp trường.' }],
    skills: [
        { id: '1', name: 'React / Next.js', level: 5 }, { id: '2', name: 'TypeScript', level: 4 },
        { id: '3', name: 'Node.js / Express', level: 3 }, { id: '4', name: 'Tailwind CSS', level: 4 },
        { id: '5', name: 'Git / CI-CD', level: 4 }, { id: '6', name: 'Docker / AWS', level: 3 },
    ],
    languages: [{ id: '1', name: 'Tiếng Anh', level: 'B2 (IELTS 6.5)' }, { id: '2', name: 'Tiếng Nhật', level: 'N4' }],
    certifications: [{ id: '1', name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' }],
    activities: [{ id: '1', role: 'Trưởng ban kỹ thuật', organization: 'CLB IT Bách Khoa', description: 'Tổ chức workshop hàng tháng về web development cho 200+ thành viên' }],
    sectionOrder: ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'],
    hiddenSections: [],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_SECTION_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];
const DEFAULT_HIDDEN = ['certifications', 'activities'];

// Pre-fill content so new CVs look full, not empty
const SAMPLE_PREFILL = {
    personalInfo: {
        fullName: 'Họ và tên đầy đủ',
        title: 'Vị trí ứng tuyển',
        email: 'email@example.com',
        phone: '0901 234 567',
        address: 'TP. Hồ Chí Minh',
        linkedin: 'linkedin.com/in/your-profile',
        github: '',
        avatarUrl: null,
    },
    objective: 'Với X năm kinh nghiệm làm việc trong lĩnh vực [ngành nghề], tôi mong muốn được đóng góp vào sự phát triển của quý công ty, đồng thời tiếp tục nâng cao kỹ năng chuyên môn trong môi trường năng động và chuyên nghiệp.',
    experiences: [
        { id: 'e1', position: 'Tên vị trí công việc', company: 'Tên công ty', startDate: '01/2022', endDate: '', isCurrent: true, description: '- Mô tả trách nhiệm và công việc chính\n- Thành tích nổi bật đạt được\n- Kết quả đo lường được (VD: tăng X%, tiết kiệm Y giờ/tuần)' },
        { id: 'e2', position: 'Vị trí trước đó', company: 'Công ty trước', startDate: '06/2019', endDate: '12/2021', isCurrent: false, description: '- Mô tả công việc và đóng góp chính\n- Kỹ năng và công nghệ sử dụng' },
    ],
    education: [
        { id: 'edu1', school: 'Tên trường đại học', degree: 'Ngành học / Bằng cấp', gpa: '3.5/4.0', startDate: '2015', endDate: '2019', description: 'Thành tích học tập và hoạt động nổi bật...' },
    ],
    skills: [
        { id: 's1', name: 'Kỹ năng chuyên môn 1', level: 5 },
        { id: 's2', name: 'Kỹ năng chuyên môn 2', level: 4 },
        { id: 's3', name: 'Kỹ năng chuyên môn 3', level: 4 },
        { id: 's4', name: 'Kỹ năng mềm', level: 4 },
    ],
    languages: [
        { id: 'l1', name: 'Tiếng Anh', level: 'B2 - Giao tiếp tốt' },
    ],
    certifications: [
        { id: 'c1', name: 'Tên chứng chỉ', issuer: 'Đơn vị cấp', date: '2023' },
    ],
    activities: [
        { id: 'a1', role: 'Vai trò của bạn', organization: 'Tên tổ chức / CLB', description: 'Mô tả hoạt động và đóng góp...' },
    ],
};

// ── Sortable section row (Bố cục tab) ────────────────────────────────────────

function SortableRow({ id, label, hidden }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    return (
        <div ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1, display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 10px', background: isDragging ? '#f0fdf4' : 'white', border: `1px solid ${hidden ? '#f3f4f6' : '#e5e7eb'}`, borderRadius: '7px', marginBottom: '5px', boxShadow: isDragging ? '0 2px 10px rgba(0,0,0,0.12)' : 'none', opacity: hidden ? 0.45 : undefined }}>
            <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#9ca3af', touchAction: 'none', display: 'flex' }}>
                <GripVertical size={15} />
            </div>
            <span style={{ fontSize: '12px', color: hidden ? '#9ca3af' : '#374151', flex: 1 }}>{label}</span>
            {hidden && <span style={{ fontSize: '10px', color: '#9ca3af', background: '#f3f4f6', padding: '1px 6px', borderRadius: '10px' }}>Ẩn</span>}
        </div>
    );
}

// ── Left panel tabs ───────────────────────────────────────────────────────────

const TABS = [
    { id: 'design', label: 'Thiết kế\n& Font' },
    { id: 'sections', label: 'Thêm\nmục' },
    { id: 'layout', label: 'Bố\ncục' },
    { id: 'template', label: 'Đổi\nmẫu' },
];

// ── Main page ────────────────────────────────────────────────────────────────

export default function CvEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const { hydrated, isAuthenticated, user } = useAuthStore();
    const { resume, setResume, isDirty, setSaving, saving } = useResumeStore();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(null); // null = panel closed
    const [saveMsg, setSaveMsg] = useState('');
    const [previewMode, setPreviewMode] = useState(false);
    const autoSaveRef = useRef(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        resumeService.get(id).then((res) => {
            let data = res.data;
            const c = data.content || {};

            // Pre-fill with sample content when CV is brand new / empty
            const isEmpty = !c.personalInfo?.fullName && !c.experiences?.length && !c.education?.length;
            if (isEmpty) {
                data = { ...data, content: { ...SAMPLE_PREFILL, sectionOrder: DEFAULT_SECTION_ORDER, hiddenSections: DEFAULT_HIDDEN } };
            } else {
                // Ensure structural defaults
                if (!c.sectionOrder) data = { ...data, content: { ...c, sectionOrder: DEFAULT_SECTION_ORDER } };
                if (!c.hiddenSections) data = { ...data, content: { ...data.content, hiddenSections: DEFAULT_HIDDEN } };
            }

            // Carry over profile avatar if no custom avatar set
            const content = data.content;
            if (!content?.personalInfo?.avatarUrl && user?.candidateProfile?.avatarUrl) {
                data = { ...data, content: { ...content, personalInfo: { ...content.personalInfo, avatarUrl: user.candidateProfile.avatarUrl } } };
            }

            setResume(data);
        }).catch(() => router.replace('/tao-cv')).finally(() => setLoading(false));
        return () => useResumeStore.getState().reset();
    }, [id, isAuthenticated]);

    const save = useCallback(async () => {
        const r = useResumeStore.getState().resume;
        if (!r) return;
        setSaving(true);
        try {
            await resumeService.update(r.id, { title: r.title, template: r.template, color: r.color, fontSize: r.fontSize, lineSpacing: r.lineSpacing, content: r.content });
            setSaveMsg('Đã lưu');
            setTimeout(() => setSaveMsg(''), 2000);
        } catch {}
        setSaving(false);
    }, []);

    useEffect(() => {
        if (!isDirty) return;
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(save, 2500);
        return () => clearTimeout(autoSaveRef.current);
    }, [isDirty, save]);

    // Leave-page warning
    useEffect(() => {
        const handler = (e) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    if (!hydrated || loading || !resume) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>Đang tải...</div>;
    }

    const content = resume.content || {};
    const sectionOrder = content.sectionOrder || DEFAULT_SECTION_ORDER;
    const hiddenSections = content.hiddenSections || DEFAULT_HIDDEN;
    const color = resume.color || '#00b14f';
    const font = content.font || 'Arial';
    const fontSize = resume.fontSize || 'medium';
    const lineSpacing = resume.lineSpacing || 1.5;
    const background = content.cvBackground || 'white';
    const tplMeta = ALL_TEMPLATES.find((t) => t.id === resume.template);

    const setR = (patch) => useResumeStore.setState((s) => ({ resume: { ...s.resume, ...patch }, isDirty: true }));
    const setContent = (newContent) => useResumeStore.setState((s) => ({ resume: { ...s.resume, content: newContent }, isDirty: true }));
    const updateContent = (field, val) => useResumeStore.setState((s) => ({ resume: { ...s.resume, content: { ...s.resume.content, [field]: val } }, isDirty: true }));

    const setSectionOrder = (order) => updateContent('sectionOrder', order);
    const setHiddenSections = (hidden) => updateContent('hiddenSections', hidden);
    const toggleSection = (key) => {
        if (hiddenSections.includes(key)) {
            setHiddenSections(hiddenSections.filter((k) => k !== key));
        } else {
            setHiddenSections([...hiddenSections, key]);
        }
    };

    // DnD
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldI = sectionOrder.indexOf(active.id);
            const newI = sectionOrder.indexOf(over.id);
            setSectionOrder(arrayMove(sectionOrder, oldI, newI));
        }
    };

    // ── Panels ────────────────────────────────────────────────────────────────

    const DesignPanel = (
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px' }}>
            <SectionLabel>Phông chữ</SectionLabel>
            <select value={font} onChange={(e) => updateContent('font', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '13px', marginBottom: '16px', outline: 'none', background: 'white' }}>
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>

            <SectionLabel>Cỡ chữ</SectionLabel>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                {[['small', 'Nhỏ'], ['medium', 'Trung bình'], ['large', 'Siêu lớn']].map(([v, l]) => (
                    <button key={v} onClick={() => setR({ fontSize: v })}
                        style={{ flex: 1, padding: '7px 4px', border: fontSize === v ? '2px solid #00b14f' : '1px solid #e5e7eb', borderRadius: '7px', background: fontSize === v ? '#f0fdf4' : 'white', color: fontSize === v ? '#00b14f' : '#374151', fontSize: '11px', fontWeight: fontSize === v ? '700' : '400', cursor: 'pointer' }}>
                        {l}
                    </button>
                ))}
            </div>

            <SectionLabel>Khoảng cách dòng: {(lineSpacing).toFixed(1)}</SectionLabel>
            <input type="range" min="1.0" max="2.0" step="0.1" value={lineSpacing}
                onChange={(e) => setR({ lineSpacing: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#00b14f', marginBottom: '4px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9ca3af', marginBottom: '16px' }}>
                <span>1.0</span><span>2.0</span>
            </div>

            <SectionLabel>Màu chủ đề</SectionLabel>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {(tplMeta?.colors || ['#00b14f', '#1e3a5f', '#c0392b']).map((c) => (
                    <button key={c} onClick={() => setR({ color: c })}
                        style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: color === c ? '3px solid #111827' : '2px solid transparent', cursor: 'pointer', outline: color === c ? '2px solid white' : 'none', outlineOffset: '-4px', flexShrink: 0 }} />
                ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input type="color" value={color} onChange={(e) => setR({ color: e.target.value })}
                    style={{ width: '36px', height: '36px', border: '1px solid #e5e7eb', borderRadius: '6px', cursor: 'pointer', padding: '2px' }} />
                <input type="text" value={color} onChange={(e) => setR({ color: e.target.value })}
                    style={{ flex: 1, padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace', outline: 'none' }} />
            </div>

            <SectionLabel>Hình nền CV</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {CV_BACKGROUNDS.map((bg) => {
                    const active = background === bg.bg;
                    return (
                        <button key={bg.id} onClick={() => updateContent('cvBackground', bg.bg)} title={bg.label}
                            style={{ aspectRatio: '1', borderRadius: '8px', background: bg.bg, border: active ? '3px solid #111827' : '2px solid #e5e7eb', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
                            {active && (
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={13} color="#111827" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    const SectionsPanel = (
        <div style={{ overflowY: 'auto', flex: 1, padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '14px', lineHeight: '1.5' }}>
                Bật / tắt từng mục để hiện hoặc ẩn trên CV.
            </div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Đang hiển thị</div>
            {ALL_SECTIONS.filter((s) => !hiddenSections.includes(s)).map((s) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#15803d', fontWeight: '500' }}>{SECTION_LABELS[s]}</span>
                    <button onClick={() => toggleSection(s)} title="Ẩn mục này"
                        style={{ background: 'none', border: '1px solid #bbf7d0', borderRadius: '5px', cursor: 'pointer', padding: '3px 8px', color: '#6b7280', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <EyeOff size={11} /> Ẩn
                    </button>
                </div>
            ))}

            {hiddenSections.length > 0 && (
                <>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', marginTop: '14px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chưa sử dụng</div>
                    {hiddenSections.map((s) => (
                        <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '5px', opacity: 0.7 }}>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{SECTION_LABELS[s]}</span>
                            <button onClick={() => toggleSection(s)} title="Hiện mục này"
                                style={{ background: '#00b14f', border: 'none', borderRadius: '5px', cursor: 'pointer', padding: '3px 10px', color: 'white', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
                                + Thêm
                            </button>
                        </div>
                    ))}
                </>
            )}
        </div>
    );

    const LayoutPanel = (
        <div style={{ overflowY: 'auto', flex: 1, padding: '14px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', lineHeight: '1.5' }}>Kéo để thay đổi thứ tự các mục trong CV.</div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                    {sectionOrder.map((key) => (
                        <SortableRow key={key} id={key} label={SECTION_LABELS[key] || key} hidden={hiddenSections.includes(key)} />
                    ))}
                </SortableContext>
            </DndContext>
            <button onClick={() => setSectionOrder(DEFAULT_SECTION_ORDER)}
                style={{ width: '100%', marginTop: '10px', padding: '8px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '7px', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
                Đặt lại mặc định
            </button>
        </div>
    );

    const TemplatePanel = (
        <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px' }}>Chọn mẫu khác — nội dung giữ nguyên.</div>
            {ALL_TEMPLATES.map((tpl) => {
                const active = resume.template === tpl.id;
                const c = active ? color : tpl.colors[0];
                return (
                    <div key={tpl.id} style={{ marginBottom: '18px' }}>
                        <div onClick={() => { setR({ template: tpl.id, color: tpl.colors.includes(color) ? color : tpl.colors[0] }); }}
                            style={{ borderRadius: '8px', overflow: 'hidden', border: active ? `2.5px solid ${color}` : '2px solid #e5e7eb', cursor: 'pointer', position: 'relative', background: '#f9fafb' }}>
                            <div style={{ width: `${THUMB_W}px`, height: `${THUMB_H}px`, overflow: 'hidden' }}>
                                <div style={{ width: `${A4_W}px`, transform: `scale(${THUMB_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                                    <tpl.Component content={THUMB_SAMPLE} color={c} />
                                </div>
                            </div>
                            {active && (
                                <div style={{ position: 'absolute', top: '6px', right: '6px', background: color, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Check size={11} color="white" strokeWidth={3} />
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: active ? color : '#374151', marginTop: '5px', textAlign: 'center' }}>{tpl.name}</div>
                        {active && (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                                {tpl.colors.map((c) => (
                                    <button key={c} onClick={() => setR({ color: c })}
                                        style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: color === c ? '2.5px solid #111827' : '2px solid transparent', cursor: 'pointer', outline: color === c ? '2px solid white' : 'none', outlineOffset: '-3px', flexShrink: 0 }} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const panelContent = { design: DesignPanel, sections: SectionsPanel, layout: LayoutPanel, template: TemplatePanel };

    // ── Render ──────────────────────────────────────────────────────────────

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'white', fontFamily: 'Arial, sans-serif' }}>
            {/* Toolbar */}
            <div style={{ height: '52px', flexShrink: 0, background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '0', padding: '0 12px 0 0', zIndex: 10 }}>
                <button onClick={() => {
                        if (isDirty && !confirm('Bạn có thay đổi chưa lưu. Rời khỏi trang này?')) return;
                        router.push('/quan-ly-cv');
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6b7280', padding: '0 12px', height: '100%' }}>
                    <ArrowLeft size={15} /> Quản lý CV
                </button>
                <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />
                <input value={resume.title || ''} onChange={(e) => setR({ title: e.target.value })}
                    style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#111827', background: 'transparent', flex: 1, padding: '0 12px', minWidth: '0' }} />
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    {saveMsg && <span style={{ fontSize: '12px', color: '#00b14f', fontWeight: '500' }}>{saveMsg}</span>}
                    <button onClick={() => setPreviewMode(!previewMode)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', background: previewMode ? '#f0fdf4' : '#f3f4f6', border: previewMode ? '1px solid #bbf7d0' : 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', color: previewMode ? '#00b14f' : '#374151' }}>
                        {previewMode ? <><EyeOff size={13} /> Chỉnh sửa</> : <><Eye size={13} /> Xem trước</>}
                    </button>
                    <button onClick={save} disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#f3f4f6', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                        <Save size={14} />{saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                    <button onClick={() => window.print()}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#00b14f', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'white' }}>
                        <Printer size={14} />Tải PDF
                    </button>
                </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Icon sidebar */}
                <div style={{ width: '56px', flexShrink: 0, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px', gap: '2px', zIndex: 10 }}>
                    {TABS.map((tab) => {
                        const active = activeTab === tab.id;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(active ? null : tab.id)} title={tab.label.replace('\n', ' ')}
                                style={{ width: '48px', padding: '8px 4px', borderRadius: '8px', border: 'none', background: active ? '#f0fdf4' : 'transparent', color: active ? '#00b14f' : '#9ca3af', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                                <TabIcon id={tab.id} />
                                <span style={{ fontSize: '9px', fontWeight: '500', lineHeight: 1.1, whiteSpace: 'pre', textAlign: 'center' }}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Side panel (slides in) */}
                {activeTab && (
                    <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #e5e7eb', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 9 }}>
                        <div style={{ padding: '12px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827' }}>
                                {TABS.find((t) => t.id === activeTab)?.label.replace('\n', ' & ')}
                            </span>
                            <button onClick={() => setActiveTab(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }}>
                                <X size={16} />
                            </button>
                        </div>
                        {panelContent[activeTab]}
                    </div>
                )}

                {/* CV Canvas */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#525659', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 24px' }}>
                    {previewMode ? (
                        <div id="cv-print-area" style={{ width: '794px', minHeight: '1123px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)', flexShrink: 0 }}>
                            {React.createElement(getTemplate(resume.template), { content, color, fontSize, lineSpacing, background })}
                        </div>
                    ) : (
                        <div style={{ width: '794px', minHeight: '1123px', boxShadow: '0 4px 30px rgba(0,0,0,0.4)', flexShrink: 0 }}>
                            <EditableCVDocument
                                content={content}
                                onContentChange={setContent}
                                sectionOrder={sectionOrder}
                                onSectionOrderChange={setSectionOrder}
                                hiddenSections={hiddenSections}
                                onHideSection={(key) => setHiddenSections([...hiddenSections, key])}
                                color={color}
                                font={font}
                                fontSize={fontSize}
                                lineSpacing={lineSpacing}
                                background={background}
                            />
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #cv-print-area { display: block !important; position: fixed; inset: 0; width: 100%; box-shadow: none; }
                }
            `}</style>
        </div>
    );
}

function SectionLabel({ children }) {
    return <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{children}</div>;
}

function TabIcon({ id }) {
    const s = { width: 20, height: 20 };
    if (id === 'design') return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}>
            <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
        </svg>
    );
    if (id === 'sections') return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
    if (id === 'layout') return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}>
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
    );
    if (id === 'template') return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={s}>
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
        </svg>
    );
    return null;
}
