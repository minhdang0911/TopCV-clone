'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { paymentService } from '@/services/payment.service';
import { resumeService } from '@/services/resume.service';
import { X, Upload, FileText, ChevronRight } from 'lucide-react';

const PLAN_META = {
    FREE:    { label: 'Thường',  color: '#6b7280', bg: '#f3f4f6' },
    PRO:     { label: 'Pro',     color: '#00b14f', bg: '#dcfce7' },
    PREMIUM: { label: 'Premium', color: '#d97706', bg: '#fef3c7' },
};

function CvSelectModal({ onClose, onSelect }) {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        resumeService.list('resume').then(res => {
            setResumes(res.data?.data ?? res.data ?? []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.includes('pdf')) {
            toast.error('Chỉ chấp nhận file PDF');
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await api.post('/upload/cv-file', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const fileUrl = uploadRes.data?.data?.url;
            if (!fileUrl) throw new Error('Upload failed');

            const createRes = await resumeService.create({
                type: 'uploaded',
                title: file.name.replace(/\.pdf$/i, ''),
                fileUrl,
                content: {},
            });
            const newId = createRes.data?.id ?? createRes.data?.data?.id;
            if (newId) {
                toast.success('Upload CV thành công');
                onSelect(newId);
            }
        } catch {
            toast.error('Upload thất bại, vui lòng thử lại');
        } finally {
            setUploading(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedId) return;
        setConfirming(true);
        await onSelect(selectedId);
        setConfirming(false);
    };

    return (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white', borderRadius: '12px', width: '100%', maxWidth: '480px',
                    maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827' }}>
                        Chọn CV để hiển thị với NTD
                    </div>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px' }}>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px' }}>
                        Nhà tuyển dụng sẽ thấy CV này khi tìm kiếm ứng viên.
                    </p>

                    {/* Upload option */}
                    <label
                        style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px', border: '2px dashed #d1d5db',
                            borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer',
                            marginBottom: '12px', opacity: uploading ? 0.6 : 1,
                        }}
                    >
                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Upload size={18} color="#00b14f" />
                        </div>
                        <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                                {uploading ? 'Đang upload...' : 'Tải lên CV từ máy tính'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Hỗ trợ file PDF, tối đa 5MB</div>
                        </div>
                    </label>

                    {/* Existing CVs */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>Đang tải...</div>
                    ) : resumes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>Chưa có CV nào</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>Chọn từ CV đã tạo</div>
                            {resumes.map(cv => (
                                <div
                                    key={cv.id}
                                    onClick={() => setSelectedId(cv.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 14px',
                                        border: `2px solid ${selectedId === cv.id ? '#00b14f' : '#e5e7eb'}`,
                                        borderRadius: '8px', cursor: 'pointer',
                                        background: selectedId === cv.id ? '#f0fdf4' : 'white',
                                        transition: 'border-color 0.15s',
                                    }}
                                >
                                    <FileText size={18} color={selectedId === cv.id ? '#00b14f' : '#9ca3af'} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {cv.title || 'CV chưa đặt tên'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                            {cv.template} · {new Date(cv.updatedAt || cv.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                    {selectedId === cv.id && <ChevronRight size={16} color="#00b14f" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={onClose}
                        style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedId || confirming}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: '8px',
                            background: !selectedId || confirming ? '#d1d5db' : '#00b14f',
                            color: 'white', fontSize: '13px', fontWeight: '700',
                            cursor: !selectedId || confirming ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {confirming ? 'Đang lưu...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProfileSidebar() {
    const { user, setUser } = useAuthStore();
    const [toggling, setToggling] = useState(false);
    const [planInfo, setPlanInfo] = useState(null);
    const [showCvModal, setShowCvModal] = useState(false);

    useEffect(() => {
        paymentService.getMyPlan()
            .then(res => setPlanInfo(res.data))
            .catch(() => {});
    }, []);

    if (!user) return null;

    const avatarSrc =
        user.candidateProfile?.avatarUrl ||
        user.employerProfile?.logoUrl ||
        '/default-avatar.png';
    const displayName =
        user.candidateProfile?.fullName ||
        user.employerProfile?.companyName ||
        user.email ||
        '';
    const isLooking = user.candidateProfile?.isLookingForJob ?? false;

    const handleToggleLooking = async () => {
        if (toggling || user.role !== 'CANDIDATE') return;

        // Turning OFF — no need for CV selection
        if (isLooking) {
            setToggling(true);
            try {
                await api.patch('/users/me/profile', { isLookingForJob: false });
                const res = await api.get('/users/me');
                setUser(res.data);
                toast.success('Đã tắt tìm việc');
            } catch {
                toast.error('Có lỗi xảy ra');
            }
            setToggling(false);
            return;
        }

        // Turning ON — show CV selection modal
        setShowCvModal(true);
    };

    const handleCvSelected = async (cvId) => {
        setShowCvModal(false);
        setToggling(true);
        try {
            await api.patch('/users/me/profile', { isLookingForJob: true, defaultCvId: cvId });
            const res = await api.get('/users/me');
            setUser(res.data);
            toast.success('Đã bật tìm việc');
        } catch {
            toast.error('Có lỗi xảy ra');
        }
        setToggling(false);
    };

    return (
        <>
            {showCvModal && (
                <CvSelectModal
                    onClose={() => setShowCvModal(false)}
                    onSelect={handleCvSelected}
                />
            )}

            <div
                style={{
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                }}
            >
                {/* User card */}
                <div style={{ padding: '20px 16px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                        <img
                            src={avatarSrc}
                            alt="avatar"
                            style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid #e5e7eb',
                            }}
                        />
                    </div>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '4px' }}>
                        {displayName}
                    </div>
                    {user.isVerified && (
                        <span
                            style={{
                                display: 'inline-block',
                                fontSize: '11px',
                                color: '#059669',
                                background: '#d1fae5',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: '600',
                                marginBottom: '10px',
                            }}
                        >
                            Tài khoản đã xác thực
                        </span>
                    )}
                    {/* Plan badge */}
                    {planInfo && (() => {
                        const plan = planInfo.plan ?? 'FREE';
                        const meta = PLAN_META[plan] || PLAN_META.FREE;
                        const expires = planInfo.planExpiresAt ? new Date(planInfo.planExpiresAt) : null;
                        const now = new Date();
                        const daysLeft = expires ? Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / 86400000)) : null;
                        return (
                            <div style={{ marginTop: '10px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '3px 10px',
                                    borderRadius: '20px',
                                    background: meta.bg,
                                    color: meta.color,
                                    fontSize: '12px',
                                    fontWeight: '700',
                                }}>
                                    {plan === 'FREE' ? 'Tài khoản Thường' : `Tài khoản ${meta.label}`}
                                </span>
                                {expires && daysLeft !== null && (
                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                        Hết hạn: {expires.toLocaleDateString('vi-VN')}
                                        {daysLeft <= 7 && (
                                            <span style={{ color: '#ef4444', fontWeight: '600', marginLeft: '4px' }}>
                                                (còn {daysLeft} ngày)
                                            </span>
                                        )}
                                    </div>
                                )}
                                {plan === 'FREE' && (
                                    <div style={{ marginTop: '6px' }}>
                                        <Link href="/nang-cap" style={{ fontSize: '12px', color: '#00b14f', fontWeight: '600', textDecoration: 'none' }}>
                                            Nâng cấp tài khoản →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* isLookingForJob toggle (candidates only) */}
                {user.role === 'CANDIDATE' && (
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                        >
                            <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                                {isLooking ? 'Đang Bật tìm việc' : 'Đang Tắt tìm việc'}
                            </span>
                            <button
                                onClick={handleToggleLooking}
                                disabled={toggling}
                                style={{
                                    width: '40px',
                                    height: '22px',
                                    borderRadius: '11px',
                                    background: isLooking ? '#00b14f' : '#d1d5db',
                                    border: 'none',
                                    cursor: toggling ? 'not-allowed' : 'pointer',
                                    position: 'relative',
                                    transition: 'background 0.2s',
                                    flexShrink: 0,
                                }}
                            >
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: '3px',
                                        left: isLooking ? '21px' : '3px',
                                        width: '16px',
                                        height: '16px',
                                        borderRadius: '50%',
                                        background: 'white',
                                        transition: 'left 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    }}
                                />
                            </button>
                        </div>
                        {isLooking && user.candidateProfile?.defaultCvId && (
                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '6px' }}>
                                CV đang hiển thị với NTD · <Link href="/ho-so/cv" style={{ color: '#00b14f', textDecoration: 'none' }}>Đổi CV</Link>
                            </div>
                        )}
                    </div>
                )}

                {/* allowEmployerSearch info (candidates only) */}
                {user.role === 'CANDIDATE' && (
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            Cho phép NTD tìm kiếm hồ sơ
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                            Có 1 CV đang bật cho phép NTD tìm kiếm
                        </div>
                        <Link
                            href="/connect-to-employer/list"
                            style={{
                                display: 'inline-block',
                                padding: '5px 14px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '12px',
                                color: '#374151',
                                textDecoration: 'none',
                                fontWeight: '500',
                            }}
                        >
                            Xem kết nối
                        </Link>
                    </div>
                )}

                {/* CV score placeholder */}
                <div style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        CV của bạn đã đủ tốt?
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Bao nhiêu NTD đang quan tâm tới Hồ sơ của bạn?
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '2px solid #e5e7eb',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#9ca3af',
                            margin: '8px 0',
                        }}
                    >
                        0
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>lượt</div>
                    <Link
                        href="#"
                        style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            padding: '5px 14px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#374151',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}
                    >
                        Khám phá ngay
                    </Link>
                </div>
            </div>
        </>
    );
}
