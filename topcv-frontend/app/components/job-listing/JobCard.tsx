'use client';

import Link from 'next/link';
import { MapPin, Clock, Briefcase, Heart, Calendar } from 'lucide-react';

const GREEN = '#00b14f';

const WORKING_TYPE_LABEL: Record<string, string> = {
    TOAN_THOI_GIAN: 'Toàn thời gian',
    BAN_THOI_GIAN: 'Bán thời gian',
    FREELANCE: 'Freelance',
    THUC_TAP: 'Thực tập',
    REMOTE: 'Remote',
};

const LEVEL_LABEL: Record<string, string> = {
    NHAN_VIEN: 'Nhân viên',
    TRUONG_NHOM: 'Trưởng nhóm',
    TRUONG_PHO_PHONG: 'Trưởng/Phó phòng',
    QUAN_LY_GIAM_SAT: 'Quản lý/Giám sát',
    TRUONG_CHI_NHANH: 'Trưởng chi nhánh',
    PHO_GIAM_DOC: 'Phó giám đốc',
    GIAM_DOC: 'Giám đốc',
    THUC_TAP_SINH: 'Thực tập sinh',
};

const WORKING_DAYS_LABEL: Record<string, string> = {
    MON_FRI: 'T2 - T6',
    MON_SAT: 'T2 - T7',
    MON_SUN: 'T2 - CN',
    FLEXIBLE: 'Linh hoạt',
    CUSTOM: 'Tùy chỉnh',
};

function formatSalary(min?: number | null, max?: number | null, type?: string) {
    if (type === 'negotiable' || (!min && !max)) return 'Thỏa thuận';
    const fmt = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(0)} triệu` : `${n.toLocaleString()}đ`);
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    if (max) return `Đến ${fmt(max)}`;
    return 'Thỏa thuận';
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    if (days < 7) return `${days} ngày trước`;
    if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
    return `${Math.floor(days / 30)} tháng trước`;
}

interface Job {
    id: string;
    title: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryType?: string;
    provinceName?: string;
    districtName?: string;
    experience?: string;
    workingType?: string;
    workingDays?: string;
    level?: string;
    deadline?: string;
    createdAt: string;
    employer: {
        companyName: string;
        logoUrl?: string;
        address?: string;
    };
    industry?: { name: string };
    jobPosition?: { name: string };
}

interface JobCardProps {
    job: Job;
    featured?: boolean; // top 3 trên trang 1 → border xanh + badge "NỔI BẬT"
    suggested?: boolean; // recommended → badge "Đề xuất cho bạn"
}

export default function JobCard({ job, featured, suggested }: JobCardProps) {
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType);
    const location = job.districtName
        ? `${job.districtName}, ${job.provinceName}`
        : job.provinceName || job.employer.address || 'Chưa cập nhật';

    const isDeadlineSoon =
        job.deadline &&
        new Date(job.deadline).getTime() - Date.now() < 3 * 86400000 &&
        new Date(job.deadline).getTime() > Date.now();

    const isNegotiable = job.salaryType === 'negotiable' || (!job.salaryMin && !job.salaryMax);

    return (
        <div
            style={{
                background: 'white',
                border: featured ? `1.5px solid ${GREEN}` : '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                gap: '14px',
                cursor: 'pointer',
                transition: 'box-shadow 0.18s, border-color 0.18s',
                position: 'relative',
                overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,177,79,0.1)';
                (e.currentTarget as HTMLDivElement).style.borderColor = GREEN;
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLDivElement).style.borderColor = featured ? GREEN : '#e5e7eb';
            }}
        >
            {/* Featured ribbon */}
            {featured && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        background: GREEN,
                        color: 'white',
                        fontSize: '10px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '0 0 6px 0',
                        letterSpacing: '0.3px',
                    }}
                >
                    NỔI BẬT
                </div>
            )}

            {/* Logo */}
            <Link href={`/viec-lam/${job.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f9fafb',
                        marginTop: featured ? '10px' : '0',
                        flexShrink: 0,
                    }}
                >
                    {job.employer.logoUrl ? (
                        <img
                            src={job.employer.logoUrl}
                            alt={job.employer.companyName}
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                    ) : (
                        <span style={{ fontSize: '18px', fontWeight: '700', color: GREEN }}>
                            {job.employer.companyName.charAt(0)}
                        </span>
                    )}
                </div>
            </Link>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Row 1: title + salary */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                            href={`/viec-lam/${job.id}`}
                            style={{
                                fontSize: '14px',
                                fontWeight: '700',
                                color: '#111827',
                                textDecoration: 'none',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.4',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = GREEN)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#111827')}
                        >
                            {job.title}
                        </Link>
                        <div
                            style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                marginTop: '2px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {job.employer.companyName}
                        </div>
                    </div>

                    {/* Salary badge */}
                    <div
                        style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: isNegotiable ? '#6b7280' : GREEN,
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                            background: isNegotiable ? '#f3f4f6' : '#f0fdf4',
                            padding: '3px 10px',
                            borderRadius: '20px',
                        }}
                    >
                        {salary}
                    </div>
                </div>

                {/* Tags row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                    <Tag icon={<MapPin size={10} />} label={location} />
                    {job.workingType && <Tag label={WORKING_TYPE_LABEL[job.workingType] || job.workingType} />}
                    {job.level && <Tag label={LEVEL_LABEL[job.level] || job.level} />}
                    {job.experience && <Tag icon={<Briefcase size={10} />} label={job.experience} />}
                    {job.workingDays && WORKING_DAYS_LABEL[job.workingDays] && (
                        <Tag
                            icon={<Calendar size={10} />}
                            label={WORKING_DAYS_LABEL[job.workingDays]}
                            color="#92400e"
                            bg="#fef3c7"
                        />
                    )}
                    {job.industry && <Tag label={job.industry.name} color="#1d4ed8" bg="#eff6ff" />}
                </div>

                {/* Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '8px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                            style={{
                                fontSize: '12px',
                                color: '#9ca3af',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            <Clock size={11} />
                            {timeAgo(job.createdAt)}
                        </span>

                        {job.deadline && (
                            <span
                                style={{
                                    fontSize: '12px',
                                    color: isDeadlineSoon ? '#ef4444' : '#9ca3af',
                                    fontWeight: isDeadlineSoon ? '600' : '400',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                }}
                            >
                                {isDeadlineSoon && '🔥 '}
                                HH: {new Date(job.deadline).toLocaleDateString('vi-VN')}
                            </span>
                        )}

                        {/* Badge "Đề xuất cho bạn" */}
                        {suggested && (
                            <span
                                style={{
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: GREEN,
                                    background: '#f0fdf4',
                                    border: `1px solid #bbf7d0`,
                                    padding: '1px 7px',
                                    borderRadius: '20px',
                                }}
                            >
                                Đề xuất cho bạn
                            </span>
                        )}
                    </div>

                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#d1d5db',
                            padding: '2px',
                            display: 'flex',
                            transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#d1d5db')}
                        title="Lưu việc làm"
                    >
                        <Heart size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function Tag({
    icon,
    label,
    color = '#374151',
    bg = '#f3f4f6',
}: {
    icon?: React.ReactNode;
    label: string;
    color?: string;
    bg?: string;
}) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                padding: '2px 8px',
                borderRadius: '20px',
                background: bg,
                color,
                fontSize: '11px',
                fontWeight: '500',
                lineHeight: '1.6',
                whiteSpace: 'nowrap',
            }}
        >
            {icon}
            {label}
        </span>
    );
}
