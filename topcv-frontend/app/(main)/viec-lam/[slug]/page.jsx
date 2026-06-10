'use client';

import { useEffect, useState, use } from 'react';
import { MapPin, DollarSign, Briefcase, Clock, Users, GraduationCap, Building2, Heart, ChevronRight } from 'lucide-react';
import { jobService } from '@/services/job.service';
import api from '@/lib/axios';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSalary(min, max, type) {
    if (type === 'negotiable' || (!min && !max)) return 'Thỏa thuận';
    const fmt = (n) => (n / 1_000_000).toFixed(0) + ' triệu';
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max)}`;
}

function daysLeft(deadline) {
    if (!deadline) return null;
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('vi-VN');
}

const LEVEL_MAP = {
    NHAN_VIEN: 'Nhân viên',
    TRUONG_NHOM: 'Trưởng nhóm',
    TRUONG_PHO_PHONG: 'Trưởng/Phó phòng',
    QUAN_LY_GIAM_SAT: 'Quản lý / Giám sát',
    TRUONG_CHI_NHANH: 'Trưởng chi nhánh',
    PHO_GIAM_DOC: 'Phó Giám đốc',
    GIAM_DOC: 'Giám đốc',
    THUC_TAP_SINH: 'Thực tập sinh',
};

const WORKING_TYPE_MAP = {
    TOAN_THOI_GIAN: 'Toàn thời gian',
    BAN_THOI_GIAN: 'Bán thời gian',
    FREELANCE: 'Freelance',
    THUC_TAP: 'Thực tập',
    REMOTE: 'Remote',
};

const WORKING_DAYS_MAP = {
    MON_FRI: 'Thứ 2 - Thứ 6',
    MON_SAT: 'Thứ 2 - Thứ 7',
    MON_SUN: 'Thứ 2 - Chủ nhật',
    FLEXIBLE: 'Linh hoạt',
    CUSTOM: 'Tùy chỉnh',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Chip({ icon, text, color = '#374151', bg = '#f3f4f6' }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: bg, color, borderRadius: '6px',
            padding: '5px 10px', fontSize: '13px', fontWeight: '500',
        }}>
            {icon}
            {text}
        </span>
    );
}

function Badge({ text, color = '#374151', bg = '#f3f4f6', border }) {
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            background: bg, color,
            border: border || 'none',
            borderRadius: '4px',
            padding: '3px 10px', fontSize: '13px',
        }}>
            {text}
        </span>
    );
}

function InfoRow({ icon, label, value }) {
    if (!value) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ color: '#9ca3af', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>{label}</div>
                <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{value}</div>
            </div>
        </div>
    );
}

function RelatedJobCard({ job }) {
    const logo = job.employer?.logoUrl;
    const company = job.employer?.companyName || 'Công ty';
    const slug = job.slug || job.id;

    return (
        <a href={`/viec-lam/${slug}`} style={{ textDecoration: 'none' }}>
            <div style={{
                display: 'flex', gap: '12px', padding: '12px',
                borderRadius: '8px', border: '1px solid #e5e7eb',
                marginBottom: '10px', cursor: 'pointer',
                transition: 'border-color 0.15s',
            }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00b14f'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
                <div style={{
                    width: '44px', height: '44px', borderRadius: '6px',
                    border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb',
                }}>
                    {logo
                        ? <img src={logo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        : <Building2 size={20} color="#9ca3af" />
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '13px', fontWeight: '600', color: '#111827',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '3px',
                    }}>
                        {job.title}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{company}</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#00b14f', fontWeight: '500' }}>
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}
                        </span>
                        {job.provinceName && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{job.provinceName}</span>
                        )}
                    </div>
                </div>
                <ChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0, alignSelf: 'center' }} />
            </div>
        </a>
    );
}

function SkeletonBlock({ h = 20, w = '100%', mb = 8, br = 6 }) {
    return (
        <div style={{
            height: h, width: w, marginBottom: mb,
            borderRadius: br, background: '#e5e7eb',
            animation: 'pulse 1.5s ease-in-out infinite',
        }} />
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const slug = params.slug;

    const [job, setJob] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        jobService.getOne(slug)
            .then((res) => setJob(res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!job?.id) return;
        api.get(`/jobs/${slug}/related`)
            .then((res) => setRelated(res.data || []))
            .catch(() => {});
    }, [job]);

    const handleApply = () => {
        alert('Tính năng đang phát triển');
    };

    const deadline = job?.deadline;
    const days = daysLeft(deadline);
    const salaryText = job ? formatSalary(job.salaryMin, job.salaryMax, job.salaryType) : '';

    // ── Styles ──
    const pageStyle = {
        background: '#f5f5f5',
        minHeight: '100vh',
        paddingTop: '24px',
        paddingBottom: '48px',
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 16px',
        display: 'flex',
        gap: '24px',
        alignItems: 'flex-start',
    };

    const leftStyle = {
        flex: '1 1 65%',
        minWidth: 0,
    };

    const rightStyle = {
        flex: '0 0 35%',
        maxWidth: '400px',
        position: 'sticky',
        top: '80px',
    };

    const cardStyle = {
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
    };

    const sectionTitleStyle = {
        fontSize: '16px',
        fontWeight: '700',
        color: '#111827',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f3f4f6',
    };

    const btnPrimary = {
        background: '#00b14f',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        padding: '10px 24px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        flex: 1,
    };

    const btnSecondary = {
        background: 'white',
        color: '#374151',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '10px 24px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    // ── Loading skeleton ──
    if (loading) {
        return (
            <div style={pageStyle}>
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
                <div style={containerStyle}>
                    <div style={leftStyle}>
                        <div style={cardStyle}>
                            <SkeletonBlock h={28} w="70%" mb={16} />
                            <SkeletonBlock h={18} w="50%" mb={12} />
                            <SkeletonBlock h={36} w="40%" mb={12} />
                            <SkeletonBlock h={40} />
                        </div>
                        <div style={cardStyle}>
                            <SkeletonBlock h={18} w="30%" mb={12} />
                            <SkeletonBlock h={14} mb={8} />
                            <SkeletonBlock h={14} mb={8} />
                            <SkeletonBlock h={14} w="80%" />
                        </div>
                    </div>
                    <div style={{ flex: '0 0 35%' }}>
                        <div style={cardStyle}>
                            <SkeletonBlock h={60} w="60px" br={8} mb={12} />
                            <SkeletonBlock h={18} w="80%" mb={8} />
                            <SkeletonBlock h={14} mb={6} />
                            <SkeletonBlock h={14} w="70%" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div style={pageStyle}>
                <div style={{ ...containerStyle, justifyContent: 'center' }}>
                    <p style={{ fontSize: '16px', color: '#6b7280' }}>Không tìm thấy việc làm này.</p>
                </div>
            </div>
        );
    }

    const employer = job.employer || {};
    const companySlug = employer.slug || employer.id;

    return (
        <div style={pageStyle}>
            <style>{`
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                * { box-sizing: border-box; }
            `}</style>

            <div style={containerStyle}>
                {/* ── LEFT COLUMN ── */}
                <div style={leftStyle}>

                    {/* Header card */}
                    <div style={cardStyle}>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 16px 0', lineHeight: '1.3' }}>
                            {job.title}
                        </h1>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                            <Chip
                                icon={<DollarSign size={14} />}
                                text={salaryText}
                                color="#00b14f"
                                bg="#f0fdf4"
                            />
                            {(job.provinceName || job.address) && (
                                <Chip
                                    icon={<MapPin size={14} />}
                                    text={job.provinceName || job.address}
                                    color="#374151"
                                    bg="#f3f4f6"
                                />
                            )}
                            {job.experience && (
                                <Chip
                                    icon={<Briefcase size={14} />}
                                    text={job.experience}
                                    color="#374151"
                                    bg="#f3f4f6"
                                />
                            )}
                        </div>

                        <a href="#" style={{ fontSize: '13px', color: '#00b14f', textDecoration: 'none', display: 'block', marginBottom: '14px' }}>
                            Xem mức lương thị trường cho vị trí này
                        </a>

                        {deadline && (
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                                Hạn nộp hồ sơ: {formatDate(deadline)}
                                {days !== null && (
                                    <span style={{ marginLeft: '6px', color: days <= 3 ? '#ef4444' : '#374151', fontWeight: '500' }}>
                                        (Còn {days} ngày)
                                    </span>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button style={btnPrimary} onClick={handleApply}>
                                Ứng tuyển ngay
                            </button>
                            <button
                                style={{ ...btnSecondary, color: saved ? '#ef4444' : '#374151' }}
                                onClick={() => setSaved(!saved)}
                            >
                                <Heart size={16} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : '#374151'} />
                                Lưu tin
                            </button>
                        </div>
                    </div>

                    {/* Details card */}
                    <div style={cardStyle}>
                        {(job.experience || job.level) && (
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280', minWidth: '90px' }}>Yêu cầu:</span>
                                {job.experience && <Badge text={job.experience} />}
                                {job.level && <Badge text={LEVEL_MAP[job.level] || job.level} />}
                            </div>
                        )}

                        {job.workingDays && (
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280', minWidth: '90px' }}>Quyền lợi:</span>
                                <Badge text={WORKING_DAYS_MAP[job.workingDays] || job.workingDays} />
                                {job.workingDaysNote && <Badge text={job.workingDaysNote} />}
                            </div>
                        )}

                        {(job.industry || job.jobPosition) && (
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <span style={{ fontSize: '13px', color: '#6b7280', minWidth: '90px' }}>Chuyên môn:</span>
                                {job.industry && (
                                    <Badge
                                        text={job.industry.name}
                                        color="#1d4ed8"
                                        bg="#eff6ff"
                                    />
                                )}
                                {job.jobPosition && (
                                    <Badge
                                        text={job.jobPosition.name}
                                        color="#7c3aed"
                                        bg="#f5f3ff"
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description card */}
                    <div style={cardStyle}>
                        <h2 style={sectionTitleStyle}>Mô tả công việc</h2>
                        <div
                            style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}
                            dangerouslySetInnerHTML={{ __html: job.description }}
                        />

                        {(job.address || job.provinceName) && (
                            <>
                                <div style={{ borderTop: '1px solid #f3f4f6', margin: '20px 0' }} />
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                    Địa điểm làm việc
                                </h3>
                                <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                                    {job.address || job.provinceName}
                                </p>
                            </>
                        )}

                        {job.workingDays && (
                            <>
                                <div style={{ borderTop: '1px solid #f3f4f6', margin: '20px 0' }} />
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                    Thời gian làm việc
                                </h3>
                                <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                                    {WORKING_DAYS_MAP[job.workingDays] || job.workingDays}
                                    {job.workingDaysNote ? ` - ${job.workingDaysNote}` : ''}
                                </p>
                            </>
                        )}

                        <div style={{ borderTop: '1px solid #f3f4f6', margin: '20px 0' }} />
                        <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                            Cách thức ứng tuyển
                        </h3>
                        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
                            Ứng viên nộp hồ sơ trực tuyến bằng cách bấm Ứng tuyển ngay dưới đây.
                        </p>

                        {deadline && (
                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                Hạn nộp hồ sơ: {formatDate(deadline)}
                                {days !== null && (
                                    <span style={{ marginLeft: '6px', color: days <= 3 ? '#ef4444' : '#374151', fontWeight: '500' }}>
                                        (Còn {days} ngày)
                                    </span>
                                )}
                            </div>
                        )}

                        <button style={{ ...btnPrimary, flex: 'none', width: '100%' }} onClick={handleApply}>
                            Ứng tuyển ngay
                        </button>
                    </div>

                    {/* Related jobs */}
                    {related.length > 0 && (
                        <div style={cardStyle}>
                            <h2 style={sectionTitleStyle}>Việc làm liên quan</h2>
                            {related.map((rj) => (
                                <RelatedJobCard key={rj.id} job={rj} />
                            ))}
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN ── */}
                <div style={rightStyle}>

                    {/* Company card */}
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '60px', height: '60px', borderRadius: '8px',
                                border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb',
                            }}>
                                {employer.logoUrl
                                    ? <img src={employer.logoUrl} alt={employer.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                    : <Building2 size={28} color="#9ca3af" />
                                }
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px', lineHeight: '1.3' }}>
                                    {employer.companyName}
                                </div>
                            </div>
                        </div>

                        {employer.companySize && (
                            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                                <span style={{ color: '#6b7280' }}>Quy mô: </span>
                                {employer.companySize} nhân viên
                            </div>
                        )}

                        {job.industry && (
                            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
                                <span style={{ color: '#6b7280' }}>Lĩnh vực: </span>
                                {job.industry.name}
                            </div>
                        )}

                        {employer.address && (
                            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '16px', lineHeight: '1.5' }}>
                                <span style={{ color: '#6b7280' }}>Địa chỉ: </span>
                                {employer.address}
                            </div>
                        )}

                        <a
                            href={`/cong-ty/${companySlug}`}
                            style={{
                                display: 'block', textAlign: 'center',
                                color: '#00b14f', fontSize: '13px', fontWeight: '600',
                                textDecoration: 'none',
                                border: '1px solid #00b14f',
                                borderRadius: '6px',
                                padding: '8px',
                            }}
                        >
                            Xem trang công ty
                        </a>
                    </div>

                    {/* General info card */}
                    <div style={cardStyle}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>
                            Thông tin chung
                        </h3>

                        <InfoRow
                            icon={<Users size={16} />}
                            label="Cấp bậc"
                            value={job.level ? (LEVEL_MAP[job.level] || job.level) : null}
                        />
                        <InfoRow
                            icon={<GraduationCap size={16} />}
                            label="Học vấn"
                            value={null}
                        />
                        <InfoRow
                            icon={<Users size={16} />}
                            label="Số lượng tuyển"
                            value={job.quantity ? `${job.quantity} người` : null}
                        />
                        <InfoRow
                            icon={<Clock size={16} />}
                            label="Hình thức làm việc"
                            value={job.workingType ? (WORKING_TYPE_MAP[job.workingType] || job.workingType) : null}
                        />
                        <InfoRow
                            icon={<Briefcase size={16} />}
                            label="Loại hình làm việc"
                            value={job.jobType}
                        />
                    </div>

                    {/* Suggested jobs card */}
                    {related.length > 0 && (
                        <div style={{ ...cardStyle, padding: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>
                                Gợi ý việc làm phù hợp
                            </h3>
                            {related.slice(0, 3).map((rj) => (
                                <RelatedJobCard key={rj.id} job={rj} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
