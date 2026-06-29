'use client';

import { useState, useEffect, createElement } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Plus, Trash2, Edit3, Eye, Star, Crown, Zap,
    FileText, ArrowRight, AlertTriangle, CheckCircle2,
    Sparkles, TrendingUp,
} from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';
import { coverLetterService } from '@/services/cover-letter.service';
import { getTemplate } from '@/app/components/cv/templateRegistry';
import { getCLTemplate, DEFAULT_CL_CONTENT } from '@/app/components/cover-letter/templateRegistry';
import JobSuggestions from '@/app/components/jobs/JobSuggestions';
import chartArrown from '../assests/img/chart_banner_update_cv.png';
import api from '@/lib/axios';
import ProfileSidebar from '@/app/components/profile/ProfileSidebar';

// ─── Constants ────────────────────────────────────────────────────────────────
const A4_W = 794;
const A4_H = 1123;
const CARD_W = 240;
const SCALE = CARD_W / A4_W;
// Only render top 72% of A4 in thumbnail — content area is always full, gradient hides the rest
const THUMB_FRACTION = 0.72;
const THUMB_H = Math.round(A4_H * SCALE * THUMB_FRACTION);

const PLAN_LIMITS = {
    FREE: { cv: 6, cl: 6 },
    PRO: { cv: 12, cl: 12 },
    PREMIUM: { cv: 20, cl: 20 },
};

const PLAN_META = {
    FREE: { label: 'Miễn phí', color: '#6b7280', bg: '#f3f4f6', icon: FileText },
    PRO: { label: 'Pro', color: '#7c3aed', bg: '#ede9fe', icon: Zap },
    PREMIUM: { label: 'Premium', color: '#d97706', bg: '#fef3c7', icon: Crown },
};

// ─── Sample content for thumbnails ───────────────────────────────────────────
const SAMPLE_CONTENT = {
    personalInfo: {
        fullName: 'Nguyễn Văn Minh', title: 'Frontend Developer',
        email: 'minhkv@gmail.com', phone: '0901 234 567',
        address: 'Hồ Chí Minh', linkedin: 'linkedin.com/in/nguyenvanminh',
        website: 'github.com/nguyenvanminh',
    },
    objective: 'Kỹ sư Frontend với hơn 3 năm kinh nghiệm xây dựng ứng dụng web hiệu suất cao. Đam mê UI/UX, tối ưu trải nghiệm người dùng và xây dựng sản phẩm có tác động lớn.',
    experiences: [
        { id: '1', position: 'Senior Frontend Developer', company: 'VNG Corporation', startDate: '06/2022', endDate: '', isCurrent: true, description: '- Phát triển tính năng mới cho Zalo Web với 100M+ người dùng\n- Tối ưu performance, giảm 40% load time\n- Mentor junior developers, code review hàng tuần' },
        { id: '2', position: 'Frontend Developer', company: 'FPT Software', startDate: '01/2021', endDate: '05/2022', isCurrent: false, description: '- Xây dựng giao diện hệ thống quản lý nội bộ\n- Tích hợp REST API và WebSocket real-time\n- Viết unit test đạt coverage 85%' },
        { id: '3', position: 'Junior Developer', company: 'Tiki Corporation', startDate: '07/2019', endDate: '12/2020', isCurrent: false, description: '- Phát triển tính năng e-commerce cho Tiki.vn\n- Làm việc với ReactJS, Redux và GraphQL' },
    ],
    education: [
        { id: '1', school: 'Đại học Bách Khoa TP.HCM', degree: 'Kỹ sư Công nghệ Thông tin', gpa: '3.6/4.0', startDate: '2016', endDate: '2020' },
    ],
    skills: [
        { id: '1', name: 'React / Next.js', level: 5 },
        { id: '2', name: 'TypeScript', level: 4 },
        { id: '3', name: 'Node.js / NestJS', level: 4 },
        { id: '4', name: 'TailwindCSS', level: 5 },
        { id: '5', name: 'Git / CI/CD', level: 4 },
        { id: '6', name: 'Docker / AWS', level: 3 },
    ],
    languages: [
        { id: '1', name: 'Tiếng Anh', level: 'B2 — IELTS 6.5' },
        { id: '2', name: 'Tiếng Nhật', level: 'N3' },
    ],
    certifications: [
        { id: '1', name: 'AWS Certified Developer', issuer: 'Amazon Web Services', date: '2023' },
        { id: '2', name: 'Google UX Design Certificate', issuer: 'Google / Coursera', date: '2022' },
    ],
    activities: [
        { id: '1', role: 'Trưởng ban Kỹ thuật', organization: 'CLB Lập trình BK', startDate: '2018', endDate: '2020', description: 'Tổ chức hackathon, workshop và dạy lập trình cho sinh viên' },
    ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function timeAgo(iso) {
    if (!iso) return '';
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} ngày trước`;
    return formatDate(iso);
}

// ─── Thumbnail Components ─────────────────────────────────────────────────────
function CoverLetterThumbnail({ cl }) {
    const TemplateComponent = getCLTemplate(cl.template);
    const content =
        cl.content && Object.keys(cl.content).some((k) => {
            const v = cl.content[k];
            return v && (Array.isArray(v) ? v.length > 0 : typeof v === 'object' ? Object.keys(v).length > 0 : !!v);
        }) ? cl.content : DEFAULT_CL_CONTENT;
    if (!TemplateComponent) return null;
    return (
        <div style={{ width: `${CARD_W}px`, height: `${THUMB_H}px`, overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ width: `${A4_W}px`, transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                {createElement(TemplateComponent, { content, color: cl.color || '#1e3a5f' })}
            </div>
        </div>
    );
}

// Merge user content with sample data: user data takes priority,
// but sparse/empty sections are padded with sample so thumbnail always looks full
function buildThumbContent(userContent, sample) {
    if (!userContent) return sample;
    const c = { ...userContent };

    // personalInfo: keep user's but ensure key display fields exist
    c.personalInfo = {
        fullName: sample.personalInfo.fullName,
        title: sample.personalInfo.title,
        email: sample.personalInfo.email,
        phone: sample.personalInfo.phone,
        address: sample.personalInfo.address,
        linkedin: sample.personalInfo.linkedin,
        github: sample.personalInfo.github,
        ...userContent.personalInfo,
    };

    // objective: if too short, use sample
    if (!c.objective || c.objective.trim().length < 30) {
        c.objective = sample.objective;
    }

    // experiences: pad to at least 2 entries
    const userExp = Array.isArray(userContent.experiences) ? userContent.experiences : [];
    if (userExp.length === 0) {
        c.experiences = sample.experiences;
    } else if (userExp.length === 1) {
        c.experiences = [...userExp, sample.experiences[1]];
    } else {
        c.experiences = userExp;
    }

    // education: pad to at least 1
    const userEdu = Array.isArray(userContent.education) ? userContent.education : [];
    c.education = userEdu.length > 0 ? userEdu : sample.education;

    // skills: pad to at least 3
    const userSkills = Array.isArray(userContent.skills) ? userContent.skills : [];
    if (userSkills.length < 3) {
        c.skills = [...userSkills, ...sample.skills.slice(userSkills.length)];
    }

    // languages: pad to at least 1
    const userLangs = Array.isArray(userContent.languages) ? userContent.languages : [];
    c.languages = userLangs.length > 0 ? userLangs : sample.languages;

    // certifications / activities: use user if exists, else sample
    if (!Array.isArray(c.certifications) || c.certifications.length === 0) {
        c.certifications = sample.certifications;
    }
    if (!Array.isArray(c.activities) || c.activities.length === 0) {
        c.activities = sample.activities;
    }

    // Always show all sections in thumbnail (regardless of hiddenSections)
    c.hiddenSections = [];
    c.sectionOrder = sample.sectionOrder;

    return c;
}

function CvThumbnail({ cv }) {
    const TemplateComponent = getTemplate(cv.template);
    const content = buildThumbContent(cv.content, SAMPLE_CONTENT);
    if (!TemplateComponent) return null;
    return (
        <div style={{ width: `${CARD_W}px`, height: `${THUMB_H}px`, overflow: 'hidden', flexShrink: 0, position: 'relative', background: 'white' }}>
            <div style={{ width: `${A4_W}px`, transform: `scale(${SCALE})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                {createElement(TemplateComponent, { content, color: cv.color || '#00b14f' })}
            </div>
            {/* Gradient fade — starts at 20% from bottom, fully opaque at bottom edge */}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '50%',
                background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.7) 50%, white 85%, white 100%)',
                pointerEvents: 'none',
            }} />
        </div>
    );
}


// ─── Plan Banner ──────────────────────────────────────────────────────────────
function PlanBanner({ plan, used, limit, type }) {
    const meta = PLAN_META[plan] || PLAN_META.FREE;
    const PlanIcon = meta.icon;
    const pct = Math.min((used / limit) * 100, 100);
    const isFull = used >= limit;
    const isWarning = pct >= 80 && !isFull;

    const barColor = isFull ? '#ef4444' : isWarning ? '#f59e0b' : '#00b14f';
    const label = type === 'cover-letter' ? 'Cover Letter' : 'CV';

    return (
        <div style={{
            background: 'white',
            borderRadius: '14px',
            border: `1.5px solid ${isFull ? '#fecaca' : isWarning ? '#fde68a' : '#e5e7eb'}`,
            padding: '18px 22px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
        }}>
            {/* Plan badge */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 14px', borderRadius: '10px',
                background: meta.bg, flexShrink: 0,
            }}>
                <PlanIcon size={16} color={meta.color} strokeWidth={2} />
                <span style={{ fontSize: '13px', fontWeight: '700', color: meta.color }}>
                    {meta.label}
                </span>
            </div>

            {/* Progress */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                        {label} đã tạo
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: isFull ? '#ef4444' : '#111827' }}>
                        {used}<span style={{ color: '#9ca3af', fontWeight: '400' }}>/{limit}</span>
                    </span>
                </div>
                <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${pct}%`,
                        background: barColor,
                        borderRadius: '99px',
                        transition: 'width 0.6s ease',
                    }} />
                </div>
                {isFull && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                        <AlertTriangle size={12} color="#ef4444" />
                        <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600' }}>
                            Đã đạt giới hạn — Nâng cấp để tạo thêm
                        </span>
                    </div>
                )}
                {isWarning && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                        <AlertTriangle size={12} color="#f59e0b" />
                        <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '500' }}>
                            Gần đầy — còn {limit - used} {label} nữa
                        </span>
                    </div>
                )}
            </div>

            {/* Upgrade button */}
            {plan === 'FREE' && (
                <Link
                    href="/nang-cap"
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '9px 16px', flexShrink: 0,
                        background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                        color: 'white', borderRadius: '9px',
                        fontSize: '12px', fontWeight: '700',
                        textDecoration: 'none',
                        boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
                        transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                >
                    <Sparkles size={13} />
                    Nâng cấp
                </Link>
            )}
        </div>
    );
}

// ─── CV Card ──────────────────────────────────────────────────────────────────
function CvCard({ cv, type, isDefault, onEdit, onDelete, onPreview, deleting }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'white',
                borderRadius: '14px',
                border: `1.5px solid ${hovered ? '#00b14f40' : '#e5e7eb'}`,
                overflow: 'hidden',
                width: `${CARD_W}px`,
                boxShadow: hovered
                    ? '0 8px 28px rgba(0,177,79,0.12)'
                    : '0 2px 8px rgba(0,0,0,0.05)',
                transform: hovered ? 'translateY(-3px)' : 'none',
                transition: 'all 0.22s ease',
                position: 'relative',
            }}
        >
            {/* Default badge */}
            {isDefault && (
                <div style={{
                    position: 'absolute', top: '10px', left: '10px', zIndex: 10,
                    display: 'flex', alignItems: 'center', gap: '4px',
                    background: 'rgba(0,177,79,0.92)', backdropFilter: 'blur(4px)',
                    color: 'white', borderRadius: '6px',
                    padding: '3px 8px', fontSize: '10px', fontWeight: '700',
                }}>
                    <Star size={10} fill="white" />
                    Mặc định
                </div>
            )}

            {/* Thumbnail */}
            <div
                style={{
                    width: `${CARD_W}px`, height: `${THUMB_H}px`,
                    overflow: 'hidden', position: 'relative',
                    borderBottom: `3px solid ${cv.color || '#00b14f'}`,
                    cursor: 'pointer', background: '#f9fafb',
                }}
                onClick={onEdit}
            >
                {type === 'cover-letter' ? <CoverLetterThumbnail cl={cv} /> : <CvThumbnail cv={cv} />}

                {/* Hover overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(15,23,42,0.55)',
                    backdropFilter: 'blur(1px)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '10px',
                    opacity: hovered ? 1 : 0,
                    transition: 'opacity 0.2s',
                }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '9px 22px', width: '160px', justifyContent: 'center',
                            background: '#00b14f', color: 'white',
                            border: 'none', borderRadius: '8px',
                            fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0,177,79,0.4)',
                        }}
                    >
                        <Edit3 size={14} />
                        Chỉnh sửa
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPreview(); }}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '9px 22px', width: '160px', justifyContent: 'center',
                            background: 'rgba(255,255,255,0.15)', color: 'white',
                            border: '1.5px solid rgba(255,255,255,0.6)',
                            borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        <Eye size={14} />
                        Xem trước
                    </button>
                </div>
            </div>

            {/* Card info */}
            <div style={{ padding: '12px 14px 14px' }}>
                {/* Title + color dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: cv.color || '#00b14f', flexShrink: 0,
                    }} />
                    <div style={{
                        fontSize: '13px', fontWeight: '700', color: '#111827',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                    }} title={cv.title}>
                        {cv.title}
                    </div>
                </div>

                {/* Updated time */}
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px', paddingLeft: '15px' }}>
                    Cập nhật {timeAgo(cv.updatedAt)}
                </div>

                {/* Action row */}
                <div style={{ display: 'flex', gap: '7px' }}>
                    <button
                        onClick={onEdit}
                        style={{
                            flex: 1, padding: '7px 0', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '5px',
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                            color: '#15803d', cursor: 'pointer',
                            transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#86efac'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                    >
                        <Edit3 size={12} />
                        Sửa
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={deleting}
                        style={{
                            padding: '7px 11px', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            background: deleting ? '#f3f4f6' : '#fff1f2',
                            border: `1px solid ${deleting ? '#e5e7eb' : '#fecdd3'}`,
                            borderRadius: '8px', cursor: deleting ? 'not-allowed' : 'pointer',
                            color: deleting ? '#9ca3af' : '#e11d48',
                            transition: 'background 0.15s',
                            opacity: deleting ? 0.6 : 1,
                        }}
                        onMouseEnter={(e) => { if (!deleting) e.currentTarget.style.background = '#ffe4e6'; }}
                        onMouseLeave={(e) => { if (!deleting) e.currentTarget.style.background = '#fff1f2'; }}
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Add Card (Tạo mới) ───────────────────────────────────────────────────────
function AddCard({ type, disabled, href }) {
    const [hovered, setHovered] = useState(false);
    const label = type === 'cover-letter' ? 'Tạo Cover Letter mới' : 'Tạo CV mới';

    const inner = (
        <div
            onMouseEnter={() => !disabled && setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: `${CARD_W}px`,
                height: `${THUMB_H + 80}px`, // match card height
                borderRadius: '14px',
                border: `2px dashed ${disabled ? '#d1d5db' : hovered ? '#00b14f' : '#d1d5db'}`,
                background: disabled ? '#fafafa' : hovered ? '#f0fdf4' : 'white',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: '12px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                textDecoration: 'none',
            }}
        >
            <div style={{
                width: '48px', height: '48px', borderRadius: '14px',
                background: disabled ? '#f3f4f6' : hovered ? '#dcfce7' : '#f0fdf4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s',
            }}>
                <Plus size={24} color={disabled ? '#9ca3af' : '#00b14f'} strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: disabled ? '#9ca3af' : '#111827', marginBottom: '4px' }}>
                    {label}
                </div>
                {disabled && (
                    <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '500', lineHeight: '1.4' }}>
                        Đã đạt giới hạn
                    </div>
                )}
            </div>
        </div>
    );

    if (disabled) return inner;
    return <Link href={href} style={{ textDecoration: 'none' }}>{inner}</Link>;
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ type, href }) {
    const label = type === 'cover-letter' ? 'Cover Letter' : 'CV';
    return (
        <div style={{
            background: 'white', borderRadius: '16px',
            padding: '64px 24px', textAlign: 'center',
            border: '2px dashed #e5e7eb',
        }}>
            <div style={{
                width: '64px', height: '64px', borderRadius: '18px',
                background: '#f0fdf4', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
                <FileText size={28} color="#00b14f" strokeWidth={1.5} />
            </div>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                Bạn chưa có {label} nào
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '22px' }}>
                {type === 'cover-letter'
                    ? 'Tạo Cover Letter ấn tượng để gây chú ý với nhà tuyển dụng'
                    : 'Tạo CV để tăng cơ hội được các nhà tuyển dụng tìm thấy bạn'}
            </p>
            <Link
                href={href}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    padding: '11px 26px',
                    background: 'linear-gradient(135deg, #00b14f, #009a43)',
                    color: 'white', borderRadius: '10px',
                    fontSize: '14px', fontWeight: '700',
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(0,177,79,0.3)',
                }}
            >
                <Plus size={16} />
                Tạo {label} ngay
            </Link>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function QuanLyCvPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const type = searchParams.get('type') || 'resume';
    const { hydrated, isAuthenticated, user } = useAuthStore();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    // ── Plan info — fetched from /payments/my-plan (reliable, always returns plan) ──
    const [planData, setPlanData] = useState({ plan: 'FREE', planExpiresAt: null });
    const [planLoading, setPlanLoading] = useState(true);

    const plan = planData.plan || 'FREE';
    const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.FREE;
    const limit = type === 'cover-letter' ? limits.cl : limits.cv;
    const used = items.length;
    const isFull = used >= limit;
    const createHref = type === 'cover-letter' ? '/mau-cover-letter' : '/tao-cv';
    const defaultCvId = user?.candidateProfile?.defaultCvId;


    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    // Fetch plan from dedicated endpoint (more reliable than user?.plan from auth store)
    useEffect(() => {
        if (!isAuthenticated) return;
        setPlanLoading(true);
        api.get('/payments/my-plan')
            .then((res) => setPlanData(res.data || { plan: 'FREE', planExpiresAt: null }))
            .catch(() => setPlanData({ plan: 'FREE', planExpiresAt: null }))
            .finally(() => setPlanLoading(false));
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;
        setLoading(true);
        const fetch = type === 'cover-letter'
            ? coverLetterService.getAll()
            : resumeService.list('resume');
        fetch
            .then((res) => setItems(res.data?.data || res.data || []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [isAuthenticated, type]);

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa?')) return;
        setDeletingId(id);
        try {
            if (type === 'cover-letter') {
                await coverLetterService.remove(id);
            } else {
                await resumeService.remove(id);
            }
            setItems((prev) => prev.filter((r) => r.id !== id));
        } catch {}
        setDeletingId(null);
    };

    if (!hydrated || !isAuthenticated) return null;

    return (
        <>
            <style>{`
                @keyframes bounceUp {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-6px); }
                }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
                @media (max-width: 900px) {
                    .qlcv-grid { grid-template-columns: 1fr !important; }
                    .qlcv-sidebar { display: none !important; }
                }
            `}</style>

            <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '28px 16px 48px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    {/* ── 2-column layout: main + sidebar (TopCV real layout) ── */}
                    <div className="qlcv-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 300px',
                        gap: '20px',
                        alignItems: 'start',
                    }}>

                        {/* ── LEFT: main CV content ── */}
                        <div>

                            {/* ── Top header ── */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'flex-start', marginBottom: '22px', gap: '16px',
                            }}>
                                <div>
                                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px' }}>
                                        {type === 'cover-letter' ? 'Cover Letter của tôi' : 'CV của tôi'}
                                    </h1>
                                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                        {loading ? '...' : `${used} ${type === 'cover-letter' ? 'cover letter' : 'CV'} đã tạo`}
                                    </p>
                                </div>

                                {/* Tab switcher */}
                                <div style={{
                                    display: 'flex', background: 'white',
                                    borderRadius: '10px', border: '1px solid #e5e7eb',
                                    padding: '3px', gap: '2px',
                                }}>
                                    {[
                                        { label: 'CV', value: 'resume' },
                                        { label: 'Cover Letter', value: 'cover-letter' },
                                    ].map(({ label, value }) => {
                                        const active = type === value;
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => router.push(`/quan-ly-cv${value === 'resume' ? '' : '?type=cover-letter'}`)}
                                                style={{
                                                    padding: '7px 16px', borderRadius: '8px', border: 'none',
                                                    background: active ? '#00b14f' : 'transparent',
                                                    color: active ? 'white' : '#6b7280',
                                                    fontSize: '13px', fontWeight: active ? '700' : '500',
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                }}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Plan banner ── */}
                            {!loading && (
                                <PlanBanner plan={plan} used={used} limit={limit} type={type} />
                            )}

                            {/* ── Promo banner ── */}
                            <div style={{
                                background: 'linear-gradient(135deg, #1a3a5c 0%, #00773a 100%)',
                                borderRadius: '14px', padding: '24px 28px',
                                marginBottom: '24px',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'space-between', gap: '24px',
                                overflow: 'hidden', position: 'relative',
                            }}>
                                <div style={{
                                    position: 'absolute', right: '160px', top: '-40px',
                                    width: '180px', height: '180px', borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.04)',
                                }} />
                                <div style={{ flex: 1, minWidth: 0, zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <div style={{ animation: 'bounceUp 1.4s ease-in-out infinite' }}>
                                            <TrendingUp size={22} color="#4ade80" />
                                        </div>
                                        <span style={{ fontSize: '28px', fontWeight: '800', color: '#4ade80', lineHeight: 1 }}>
                                            +28%
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '14px', fontWeight: '600', color: 'white', margin: '0 0 3px' }}>
                                        Ứng viên được NTD chủ động tiếp cận tăng 28% trong tuần qua
                                    </p>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', margin: '0 0 18px' }}>
                                        Cập nhật CV của bạn để không bỏ lỡ cơ hội tốt
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <Link href="/tao-cv" style={{
                                            padding: '8px 20px', background: 'white', color: '#15803d',
                                            borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        }}>
                                            <Plus size={14} /> Tạo CV mới
                                        </Link>
                                        <Link href="/mau-cover-letter" style={{
                                            padding: '8px 20px', background: 'transparent', color: 'white',
                                            border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: '8px',
                                            fontSize: '13px', fontWeight: '600',
                                            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
                                        }}>
                                            <FileText size={14} /> Tạo Cover Letter
                                        </Link>
                                    </div>
                                </div>
                                <div style={{ flexShrink: 0, zIndex: 1 }}>
                                    <Image src={chartArrown} alt="" width={180} style={{ objectFit: 'contain', display: 'block' }} unoptimized />
                                </div>
                            </div>

                            {/* ── CV / Cover Letter grid ── */}
                            {loading ? (
                                <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, ${CARD_W}px)`, gap: '20px' }}>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} style={{
                                            width: `${CARD_W}px`, height: `${THUMB_H + 80}px`,
                                            background: 'white', borderRadius: '14px',
                                            border: '1px solid #e5e7eb',
                                            animation: 'pulse 1.5s ease-in-out infinite',
                                        }} />
                                    ))}
                                </div>
                            ) : items.length === 0 ? (
                                <EmptyState type={type} href={createHref} />
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(auto-fill, ${CARD_W}px)`,
                                    gap: '20px',
                                }}>
                                    <AddCard type={type} disabled={isFull} href={createHref} />
                                    {items.map((cv) => (
                                        <CvCard
                                            key={cv.id}
                                            cv={cv}
                                            type={type}
                                            isDefault={type === 'resume' && defaultCvId === cv.id}
                                            deleting={deletingId === cv.id}
                                            onEdit={() => router.push(type === 'cover-letter' ? `/sua-cover-letter/${cv.id}` : `/tao-cv/${cv.id}`)}
                                            onDelete={() => handleDelete(cv.id)}
                                            onPreview={() => window.open(`/tao-cv/${cv.id}?preview=1`, '_blank')}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* ── Job suggestions ── */}
                            <div style={{ marginTop: '48px' }}>
                                <JobSuggestions />
                            </div>

                        </div>{/* end LEFT */}

                        {/* ── RIGHT: Profile Sidebar (sticky) ── */}
                        <div className="qlcv-sidebar" style={{ position: 'sticky', top: '80px' }}>
                            <ProfileSidebar />
                        </div>

                    </div>{/* end qlcv-grid */}
                </div>
            </div>
        </>
    );
}

