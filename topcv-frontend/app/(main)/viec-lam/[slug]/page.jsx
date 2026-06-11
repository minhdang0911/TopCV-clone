'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, DollarSign, Briefcase, Clock, Users, GraduationCap, Building2, Heart, ChevronRight, X, FileText, ChevronDown, CheckCircle, Upload, Eye, AlertCircle } from 'lucide-react';
import { jobService } from '@/services/job.service';
import { resumeService } from '@/services/resume.service';
import { coverLetterService } from '@/services/cover-letter.service';
import { applicationsService, savedJobsService } from '@/services/applications.service';
import useAuthStore from '@/stores/auth.store';
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
                        {(job.locations?.length > 0 ? job.locations[0].provinceName : job.provinceName) && (
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                {job.locations?.length > 0 ? job.locations[0].provinceName : job.provinceName}
                            </span>
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

// ─── CV Radio Item ────────────────────────────────────────────────────────────

function CvRadioItem({ resume, selected, onSelect, isFirst }) {
    const [hovered, setHovered] = useState(false);
    const viewUrl = `/xem-cv/${resume.id}`;
    const date = resume.updatedAt
        ? new Date(resume.updatedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <div
            onClick={() => onSelect(resume.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                border: `1px solid ${selected ? '#00b14f' : '#e5e7eb'}`,
                background: selected ? '#f0fdf4' : hovered ? '#fafafa' : 'white',
                marginBottom: '8px', transition: 'all 0.15s',
            }}
        >
            <div style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${selected ? '#00b14f' : '#d1d5db'}`,
                background: selected ? '#00b14f' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                        {resume.title || 'CV không tên'}
                    </span>
                    {isFirst && (
                        <span style={{
                            fontSize: '11px', fontWeight: '600', color: '#00b14f',
                            background: '#f0fdf4', border: '1px solid #86efac',
                            borderRadius: '4px', padding: '1px 6px',
                        }}>
                            CV ứng tuyển gần nhất
                        </span>
                    )}
                </div>
                {date && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                        CV online - {date}
                    </div>
                )}
            </div>

            {(hovered || selected) && (
                <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                        fontSize: '12px', fontWeight: '600', color: '#00b14f',
                        textDecoration: 'none', flexShrink: 0,
                        padding: '4px 10px', border: '1px solid #00b14f',
                        borderRadius: '4px', background: 'white',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                >
                    Xem
                </a>
            )}
        </div>
    );
}

// ─── CL Radio Item ────────────────────────────────────────────────────────────

function ClRadioItem({ cl, selected, onSelect }) {
    const [hovered, setHovered] = useState(false);
    const viewUrl = `/xem-cover-letter/${cl.id}`;

    return (
        <div
            onClick={() => onSelect(cl.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', borderRadius: '8px', cursor: 'pointer',
                border: `1px solid ${selected ? '#00b14f' : '#e5e7eb'}`,
                background: selected ? '#f0fdf4' : hovered ? '#fafafa' : 'white',
                marginBottom: '8px', transition: 'all 0.15s',
            }}
        >
            <div style={{
                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                border: `2px solid ${selected ? '#00b14f' : '#d1d5db'}`,
                background: selected ? '#00b14f' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {selected && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
            </div>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                {cl.title || 'Cover Letter'}
            </span>
            {(hovered || selected) && (
                <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                        fontSize: '12px', fontWeight: '600', color: '#00b14f',
                        textDecoration: 'none', flexShrink: 0,
                        padding: '4px 10px', border: '1px solid #00b14f',
                        borderRadius: '4px', background: 'white',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}
                >
                    Xem
                </a>
            )}
        </div>
    );
}

// ─── Apply Modal ──────────────────────────────────────────────────────────────

function ApplyModal({ job, onClose, onSuccess }) {
    const [resumes, setResumes] = useState([]);
    const [coverLetters, setCoverLetters] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // CV selection: 'online-{id}' | 'upload'
    const [cvMode, setCvMode] = useState('');
    const [uploadedCvUrl, setUploadedCvUrl] = useState('');
    const [uploadingCv, setUploadingCv] = useState(false);
    const [uploadFileName, setUploadFileName] = useState('');
    const fileInputRef = useRef(null);

    // Cover letter: '' = none, or cover letter id
    const [selectedClId, setSelectedClId] = useState('');

    // Cover letter file upload
    const [clFileUrl, setClFileUrl] = useState('');
    const [clFileName, setClFileName] = useState('');
    const [uploadingCl, setUploadingCl] = useState(false);
    const clFileRef = useRef(null);

    // Location
    const [selectedLocationId, setSelectedLocationId] = useState('');
    const locations = job.locations || [];

    // Text intro
    const [coverLetterText, setCoverLetterText] = useState('');

    // Terms
    const [agreed, setAgreed] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Auto-select first location
        if (locations.length > 0) setSelectedLocationId(locations[0].id);

        Promise.all([
            resumeService.list('resume'),
            coverLetterService.getAll(),
        ]).then(([resRes, clRes]) => {
            const rList = resRes.data?.data || resRes.data || [];
            const clList = clRes.data?.data || clRes.data || [];
            setResumes(rList);
            setCoverLetters(clList);
            if (rList.length > 0) setCvMode(`online-${rList[0].id}`);
        }).catch(() => {}).finally(() => setLoadingData(false));
    }, []);

    const handleFileSelect = async (file) => {
        if (!file) return;
        const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowed.includes(file.type)) {
            setError('Chỉ chấp nhận file PDF, DOC, DOCX');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File không được vượt quá 5MB');
            return;
        }
        setError('');
        setUploadingCv(true);
        setUploadFileName(file.name);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await api.post('/upload/cv-file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = res.data?.data?.url;
            setUploadedCvUrl(url);
            setCvMode('upload');
        } catch (e) {
            setError(e?.response?.data?.message || 'Upload thất bại');
            setUploadFileName('');
        } finally {
            setUploadingCv(false);
        }
    };

    const handleSubmit = async () => {
        if (!cvMode) {
            setError('Vui lòng chọn CV để ứng tuyển');
            return;
        }
        if (cvMode === 'upload' && !uploadedCvUrl) {
            setError('Vui lòng upload CV từ máy tính');
            return;
        }
        if (locations.length > 0 && !selectedLocationId) {
            setError('Vui lòng chọn địa điểm làm việc');
            return;
        }
        if (!agreed) {
            setError('Vui lòng đồng ý với điều khoản trước khi nộp hồ sơ');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const isOnline = cvMode.startsWith('online-');
            await applicationsService.apply({
                jobId: job.id,
                resumeId: isOnline ? cvMode.replace('online-', '') : null,
                cvFileUrl: cvMode === 'upload' ? uploadedCvUrl : null,
                jobLocationId: selectedLocationId || null,
                coverLetter: coverLetterText.trim() || null,
                coverLetterId: selectedClId || null,
                coverLetterFileUrl: clFileUrl || null,
            });
            onSuccess();
        } catch (e) {
            setError(e?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = !submitting && !loadingData && !!cvMode && agreed;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
        }} onClick={onClose}>
            <div style={{
                background: 'white', borderRadius: '16px',
                width: '100%', maxWidth: '560px',
                maxHeight: '92vh', overflowY: 'auto',
                boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{
                    padding: '18px 24px 14px',
                    borderBottom: '2px solid #f3f4f6',
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    position: 'sticky', top: 0, background: 'white', zIndex: 1,
                }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#111827' }}>Ứng tuyển</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginTop: '2px' }}>{job.title}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{job.employer?.companyName}</div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9ca3af', marginTop: '2px' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '20px 24px' }}>

                    {/* ── CV Section ── */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={15} color="#00b14f" />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                                Chọn CV để ứng tuyển <span style={{ color: '#ef4444' }}>*</span>
                            </span>
                        </div>

                        {loadingData ? (
                            <div style={{ height: '52px', background: '#f3f4f6', borderRadius: '8px', marginBottom: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        ) : resumes.length === 0 ? (
                            <div style={{ padding: '12px 14px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e', marginBottom: '8px' }}>
                                Bạn chưa có CV nào.{' '}
                                <a href="/quan-ly-cv" target="_blank" style={{ color: '#d97706', fontWeight: '600' }}>Tạo CV ngay</a>
                            </div>
                        ) : (
                            resumes.map((r, i) => (
                                <CvRadioItem
                                    key={r.id}
                                    resume={r}
                                    selected={cvMode === `online-${r.id}`}
                                    onSelect={(id) => setCvMode(`online-${id}`)}
                                    isFirst={i === 0}
                                />
                            ))
                        )}

                        {/* Upload option */}
                        <div
                            onClick={() => { if (!uploadingCv) fileInputRef.current?.click(); }}
                            style={{
                                border: `2px dashed ${cvMode === 'upload' ? '#00b14f' : '#d1d5db'}`,
                                borderRadius: '8px', padding: '16px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                cursor: uploadingCv ? 'not-allowed' : 'pointer',
                                background: cvMode === 'upload' ? '#f0fdf4' : '#fafafa',
                                transition: 'all 0.15s',
                                gap: '6px',
                            }}
                            onMouseEnter={e => { if (cvMode !== 'upload') e.currentTarget.style.borderColor = '#9ca3af'; }}
                            onMouseLeave={e => { if (cvMode !== 'upload') e.currentTarget.style.borderColor = '#d1d5db'; }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.doc,.docx"
                                style={{ display: 'none' }}
                                onChange={e => handleFileSelect(e.target.files?.[0])}
                            />
                            <Upload size={20} color={cvMode === 'upload' ? '#00b14f' : '#9ca3af'} />
                            <div style={{ fontSize: '13px', fontWeight: '600', color: cvMode === 'upload' ? '#00b14f' : '#374151', textAlign: 'center' }}>
                                {uploadingCv ? 'Đang tải lên...' : uploadFileName || 'Tải lên CV từ máy tính, chọn hoặc kéo thả'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Hỗ trợ định dạng .doc, .docx, .pdf có kích thước dưới 5MB</div>
                            {!uploadingCv && !uploadFileName && (
                                <button
                                    onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                    style={{
                                        marginTop: '4px', padding: '6px 16px',
                                        background: '#00b14f', color: 'white',
                                        border: 'none', borderRadius: '5px',
                                        fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                                    }}
                                >
                                    Chọn CV
                                </button>
                            )}
                            {uploadFileName && !uploadingCv && (
                                <div style={{ fontSize: '12px', color: '#00b14f', fontWeight: '600' }}>✓ {uploadFileName}</div>
                            )}
                        </div>
                    </div>

                    {/* ── Cover Letter Section ── */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FileText size={15} color="#00b14f" />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>
                                Đính kèm Cover Letter <span style={{ fontSize: '13px', fontWeight: '400', color: '#9ca3af' }}>(không bắt buộc)</span>
                            </span>
                        </div>

                        {/* No CL option */}
                        <div
                            onClick={() => setSelectedClId('')}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                                border: `1px solid ${selectedClId === '' ? '#00b14f' : '#e5e7eb'}`,
                                background: selectedClId === '' ? '#f0fdf4' : 'white',
                                marginBottom: '8px', transition: 'all 0.15s',
                            }}
                        >
                            <div style={{
                                width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                                border: `2px solid ${selectedClId === '' ? '#00b14f' : '#d1d5db'}`,
                                background: selectedClId === '' ? '#00b14f' : 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                {selectedClId === '' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }} />}
                            </div>
                            <span style={{ fontSize: '13px', color: '#374151' }}>Không đính kèm</span>
                        </div>

                        {!loadingData && coverLetters.map(cl => (
                            <ClRadioItem
                                key={cl.id}
                                cl={cl}
                                selected={selectedClId === cl.id}
                                onSelect={setSelectedClId}
                            />
                        ))}

                        {/* Upload CL file from computer */}
                        <input
                            ref={clFileRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                if (!allowed.includes(file.type)) { setError('Chỉ chấp nhận PDF, DOC, DOCX'); return; }
                                if (file.size > 5 * 1024 * 1024) { setError('File không được vượt quá 5MB'); return; }
                                setError('');
                                setUploadingCl(true);
                                setClFileName(file.name);
                                setSelectedClId('');
                                try {
                                    const form = new FormData();
                                    form.append('file', file);
                                    const res = await api.post('/upload/cv-file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
                                    setClFileUrl(res.data?.data?.url || '');
                                } catch (e) {
                                    setError(e?.response?.data?.message || 'Upload thất bại');
                                    setClFileName('');
                                    setClFileUrl('');
                                } finally {
                                    setUploadingCl(false);
                                }
                            }}
                        />
                        <div
                            onClick={() => { if (!uploadingCl) clFileRef.current?.click(); }}
                            style={{
                                border: `2px dashed ${clFileUrl ? '#00b14f' : '#d1d5db'}`,
                                borderRadius: '8px', padding: '12px 16px',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                cursor: uploadingCl ? 'not-allowed' : 'pointer',
                                background: clFileUrl ? '#f0fdf4' : '#fafafa',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { if (!clFileUrl) e.currentTarget.style.borderColor = '#9ca3af'; }}
                            onMouseLeave={e => { if (!clFileUrl) e.currentTarget.style.borderColor = '#d1d5db'; }}
                        >
                            <Upload size={16} color={clFileUrl ? '#00b14f' : '#9ca3af'} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', color: clFileUrl ? '#00b14f' : '#374151' }}>
                                    {uploadingCl ? 'Đang tải lên...' : clFileName || 'Tải lên Cover Letter từ máy tính'}
                                </div>
                                {!clFileName && !uploadingCl && (
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>PDF, DOC, DOCX — tối đa 5MB</div>
                                )}
                            </div>
                            {clFileUrl && (
                                <button
                                    onClick={e => { e.stopPropagation(); setClFileUrl(''); setClFileName(''); }}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '18px', lineHeight: 1, padding: 0 }}
                                    onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; }}
                                >×</button>
                            )}
                        </div>
                    </div>

                    {/* ── Location ── */}
                    {locations.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>
                                Địa điểm làm việc mong muốn <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {locations.map(loc => {
                                    const label = loc.provinceName || loc.districtName || 'Toàn quốc';
                                    const isSelected = selectedLocationId === loc.id;
                                    return (
                                        <button
                                            key={loc.id}
                                            onClick={() => setSelectedLocationId(isSelected ? '' : loc.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '4px',
                                                padding: '6px 12px', borderRadius: '20px',
                                                fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                                                border: `1px solid ${isSelected ? '#00b14f' : '#d1d5db'}`,
                                                background: isSelected ? '#00b14f' : 'white',
                                                color: isSelected ? 'white' : '#374151',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {label}
                                            {isSelected && (
                                                <X size={12} style={{ marginLeft: '2px' }} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── Cover Letter Text ── */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '6px' }}>
                            Thư giới thiệu: <span style={{ fontSize: '13px', fontWeight: '400', color: '#9ca3af' }}>(không bắt buộc)</span>
                        </label>
                        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                            Một thư giới thiệu ngắn gọn, chỉn chu sẽ giúp bạn trở nên chuyên nghiệp và gây ấn tượng hơn với nhà tuyển dụng.
                        </p>
                        <textarea
                            value={coverLetterText}
                            onChange={e => setCoverLetterText(e.target.value)}
                            placeholder="Viết giới thiệu ngắn về bản thân (điểm mạnh, điểm yếu) và nếu rõ mong muốn, lý do bạn muốn ứng tuyển cho vị trí này."
                            rows={4}
                            style={{
                                width: '100%', padding: '10px 12px',
                                border: '1px solid #d1d5db', borderRadius: '8px',
                                fontSize: '13px', color: '#111827',
                                resize: 'vertical', outline: 'none',
                                fontFamily: 'inherit', lineHeight: '1.6',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={e => { e.target.style.borderColor = '#00b14f'; }}
                            onBlur={e => { e.target.style.borderColor = '#d1d5db'; }}
                        />
                    </div>

                    {/* ── Notes ── */}
                    <div style={{
                        padding: '12px 14px', borderRadius: '8px',
                        background: '#fffbeb', border: '1px solid #fde68a',
                        marginBottom: '16px',
                    }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <AlertCircle size={15} color="#d97706" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <div>
                                <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', marginBottom: '4px' }}>Lưu ý:</div>
                                <div style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.6' }}>
                                    1. TopCV khuyến tất cả các bạn hãy luôn cẩn trọng trong quá trình tìm việc và chủ động nghiên cứu về thông tin công ty, vị trí việc làm trước khi ứng tuyển.<br />
                                    2. Ứng viên cần có trách nhiệm với hành vi ứng tuyển của mình. Nếu bạn gặp phải tin tuyển dụng hoặc nhà tuyển dụng không minh bạch, hãy báo cáo ngay cho TopCV qua email <strong>hotro@topcv.vn</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Terms ── */}
                    <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer', marginBottom: '20px' }}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={e => setAgreed(e.target.checked)}
                            style={{ marginTop: '2px', accentColor: '#00b14f', width: '15px', height: '15px', flexShrink: 0, cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                            Tôi đã đọc và đồng ý với{' '}
                            <a href="#" style={{ color: '#00b14f', fontWeight: '600' }}>"Thỏa thuận sử dụng dữ liệu cá nhân"</a>{' '}
                            của Nhà tuyển dụng
                        </span>
                    </label>

                    {error && (
                        <div style={{ padding: '10px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>
                            {error}
                        </div>
                    )}

                    {/* ── Submit ── */}
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        style={{
                            width: '100%', padding: '13px',
                            background: canSubmit ? '#00b14f' : '#d1fae5',
                            color: 'white', border: 'none', borderRadius: '8px',
                            fontSize: '15px', fontWeight: '700',
                            cursor: canSubmit ? 'pointer' : 'not-allowed',
                            transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (canSubmit) e.currentTarget.style.background = '#009940'; }}
                        onMouseLeave={e => { if (canSubmit) e.currentTarget.style.background = '#00b14f'; }}
                    >
                        {submitting ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ ứng tuyển'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Apply Success Banner ─────────────────────────────────────────────────────

function AppliedBanner() {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', background: '#f0fdf4',
            border: '1px solid #86efac', borderRadius: '8px',
            marginBottom: '12px',
        }}>
            <CheckCircle size={18} color="#16a34a" />
            <span style={{ fontSize: '14px', color: '#15803d', fontWeight: '500' }}>
                Bạn đã ứng tuyển vị trí này
            </span>
            <a href="/viec-da-ung-tuyen" style={{ marginLeft: 'auto', fontSize: '13px', color: '#16a34a', fontWeight: '600', textDecoration: 'none' }}>
                Xem trạng thái →
            </a>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JobDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const slug = params.slug;
    const router = useRouter();

    const { isAuthenticated, role } = useAuthStore();

    const [job, setJob] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);
    const [savingToggle, setSavingToggle] = useState(false);
    const [applied, setApplied] = useState(false);
    const [applyOpen, setApplyOpen] = useState(false);

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

    // Check saved/applied state once job loads and user is authenticated candidate
    useEffect(() => {
        if (!job?.id || !isAuthenticated || role !== 'CANDIDATE') return;

        savedJobsService.check(job.id)
            .then(res => setSaved(res.data?.data?.saved ?? false))
            .catch(() => {});

        applicationsService.checkApplied(job.id)
            .then(res => setApplied(!!res.data?.data))
            .catch(() => {});
    }, [job?.id, isAuthenticated, role]);

    const handleApply = () => {
        if (!isAuthenticated) {
            router.push('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        if (role !== 'CANDIDATE') return;
        setApplyOpen(true);
    };

    const handleSaveToggle = async () => {
        if (!isAuthenticated) {
            router.push('/dang-nhap?redirect=' + encodeURIComponent(window.location.pathname));
            return;
        }
        if (role !== 'CANDIDATE' || savingToggle) return;
        setSavingToggle(true);
        try {
            const res = await savedJobsService.toggle(job.id);
            setSaved(res.data?.data?.saved ?? !saved);
        } catch {} finally {
            setSavingToggle(false);
        }
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
                <div style={containerStyle} className="jd-wrap">
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
                    <div style={{ flex: '0 0 35%' }} className="jd-right">
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
                @media (max-width: 900px) {
                    .jd-wrap { flex-direction: column !important; }
                    .jd-right { position: static !important; flex: none !important; max-width: 100% !important; width: 100% !important; }
                }
            `}</style>

            {applyOpen && (
                <ApplyModal
                    job={job}
                    onClose={() => setApplyOpen(false)}
                    onSuccess={() => { setApplyOpen(false); setApplied(true); }}
                />
            )}

            <div style={containerStyle} className="jd-wrap">
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
                            {(job.locations?.length > 0 || job.provinceName || job.address) && (
                                <Chip
                                    icon={<MapPin size={14} />}
                                    text={job.locations?.length > 0
                                        ? job.locations.map(l => l.provinceName || l.districtName).filter(Boolean).join(' • ') || 'Toàn quốc'
                                        : job.provinceName || job.address}
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

                        {applied && <AppliedBanner />}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            {applied ? (
                                <button style={{ ...btnPrimary, background: '#9ca3af', cursor: 'default' }} disabled>
                                    Đã ứng tuyển
                                </button>
                            ) : (
                                <button style={btnPrimary} onClick={handleApply}>
                                    Ứng tuyển ngay
                                </button>
                            )}
                            <button
                                style={{ ...btnSecondary, color: saved ? '#ef4444' : '#374151', opacity: savingToggle ? 0.7 : 1 }}
                                onClick={handleSaveToggle}
                                disabled={savingToggle}
                            >
                                <Heart size={16} fill={saved ? '#ef4444' : 'none'} color={saved ? '#ef4444' : '#374151'} />
                                {saved ? 'Đã lưu' : 'Lưu tin'}
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

                        {(job.locations?.length > 0 || job.address || job.provinceName) && (
                            <>
                                <div style={{ borderTop: '1px solid #f3f4f6', margin: '20px 0' }} />
                                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                                    Địa điểm làm việc
                                </h3>
                                {job.locations?.length > 0 ? (
                                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                                        {job.locations.map((loc, i) => (
                                            <li key={i} style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
                                                {[loc.address, loc.districtName, loc.provinceName].filter(Boolean).join(', ')}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
                                        {job.address || job.provinceName}
                                    </p>
                                )}
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

                        {applied ? (
                            <button style={{ ...btnPrimary, flex: 'none', width: '100%', background: '#9ca3af', cursor: 'default' }} disabled>
                                Đã ứng tuyển
                            </button>
                        ) : (
                            <button style={{ ...btnPrimary, flex: 'none', width: '100%' }} onClick={handleApply}>
                                Ứng tuyển ngay
                            </button>
                        )}
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
                <div style={rightStyle} className="jd-right">

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
