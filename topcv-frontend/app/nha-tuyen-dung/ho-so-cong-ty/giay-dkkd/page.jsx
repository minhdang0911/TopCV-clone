'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, Check, Loader, AlertCircle, Clock, CheckCircle, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import sampleLicence from '@/app/assests/img/sample-licence.7436372.webp';
import authorityPaper from '@/app/assests/img/authority-paper-sample.d8936ab.webp';
import identitySample from '@/app/assests/img/identity-sample.7c14dbb.jpg';

const GREEN = '#00b14f';

function FileDropzone({ label, hint, accept, file, onChange, disabled }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (disabled) return;
        const f = e.dataTransfer.files?.[0];
        if (f) onChange(f);
    };

    return (
        <div>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>{label}</p>
            <div
                onClick={() => !disabled && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border: `2px dashed ${dragging ? GREEN : file ? '#86efac' : '#d1d5db'}`,
                    borderRadius: '10px',
                    padding: '20px',
                    textAlign: 'center',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: dragging ? '#f0fdf4' : file ? '#f0fdf4' : '#fafafa',
                    transition: 'all 0.15s',
                    position: 'relative',
                }}
            >
                {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                        <FileText size={18} color={GREEN} />
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#166534',
                                maxWidth: '200px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {file.name}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(null);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#dc2626',
                                display: 'flex',
                                padding: '2px',
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload size={22} color="#9ca3af" style={{ marginBottom: '8px' }} />
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Chọn hoặc kéo file vào đây</p>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '4px 0 0' }}>
                            Dung lượng tối đa 5MB, định dạng: jpeg, jpg, png, pdf
                        </p>
                    </>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    style={{ display: 'none' }}
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    disabled={disabled}
                />
            </div>
            {hint && <p style={{ fontSize: '12px', color: '#ef4444', margin: '6px 0 0' }}>{hint}</p>}
        </div>
    );
}

export default function GiayDkkdPage() {
    const [vstatus, setVstatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [docType, setDocType] = useState('REGISTRATION');
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [saving, setSaving] = useState(false);

    const reloadStatus = () => {
        api.get('/employers/me/verification-status')
            .then((r) => {
                setVstatus(r.data);
                if (r.data.step3.docType) setDocType(r.data.step3.docType);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        reloadStatus();
    }, []);

    const step3 = vstatus?.step3;
    const docStatus = step3?.status;
    const alreadyHasDoc = !!step3?.docUrl;

    const uploadFile = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/upload/doc', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        return res.data?.data?.url;
    };

    const handleSave = async () => {
        if (!file1) {
            toast.error('Vui lòng chọn tài liệu');
            return;
        }
        if (docType === 'DELEGATION' && !file2) {
            toast.error('Vui lòng chọn file CCCD/Hộ chiếu');
            return;
        }
        if (file1.size > 5 * 1024 * 1024 || (file2 && file2.size > 5 * 1024 * 1024)) {
            toast.error('File tối đa 5MB');
            return;
        }

        setSaving(true);
        try {
            const url1 = await uploadFile(file1);
            const url2 = docType === 'DELEGATION' && file2 ? await uploadFile(file2) : null;
            await api.post('/employers/me/business-doc', { docType, docUrl: url1, docUrl2: url2 });
            toast.success('Đã gửi tài liệu, đang chờ admin duyệt');
            setFile1(null);
            setFile2(null);
            reloadStatus();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Upload thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                <Loader size={24} color={GREEN} style={{ animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    const isApproved = docStatus === 'APPROVED';
    const isPending = docStatus === 'PENDING';
    const isRejected = docStatus === 'REJECTED';

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    Giấy đăng ký doanh nghiệp
                </h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
                    Vui lòng lựa chọn phương thức đăng tải phù hợp
                </p>
            </div>

            {/* Status banner */}
            {isApproved && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 18px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '12px',
                        marginBottom: '20px',
                    }}
                >
                    <CheckCircle size={20} color={GREEN} />
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#166534' }}>
                            Tài liệu đã được phê duyệt
                        </div>
                        <div style={{ fontSize: '12px', color: '#15803d' }}>
                            Tài khoản của bạn đã được xác thực đầy đủ
                        </div>
                    </div>
                </div>
            )}
            {isPending && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px 18px',
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        borderRadius: '12px',
                        marginBottom: '20px',
                    }}
                >
                    <Clock size={20} color="#d97706" />
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#92400e' }}>
                            Đang chờ admin duyệt
                        </div>
                        <div style={{ fontSize: '12px', color: '#b45309' }}>
                            Thường trong 1–2 ngày làm việc. Bạn có thể cập nhật lại tài liệu nếu cần.
                        </div>
                    </div>
                </div>
            )}
            {isRejected && (
                <div
                    style={{
                        padding: '14px 18px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        marginBottom: '20px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <AlertCircle size={20} color="#dc2626" />
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626' }}>Tài liệu bị từ chối</div>
                    </div>
                    {step3?.rejectReason && (
                        <div
                            style={{
                                fontSize: '13px',
                                color: '#7f1d1d',
                                background: 'rgba(220,38,38,0.07)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                marginTop: '4px',
                            }}
                        >
                            <strong>Lý do:</strong> {step3.rejectReason}
                        </div>
                    )}
                    <p style={{ fontSize: '12px', color: '#b91c1c', margin: '8px 0 0' }}>
                        Vui lòng upload lại tài liệu hợp lệ bên dưới.
                    </p>
                </div>
            )}

            {/* Upload form */}
            <div
                style={{
                    background: 'white',
                    borderRadius: '14px',
                    padding: '28px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
                }}
            >
                <h3
                    style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#0f172a',
                        margin: '0 0 20px',
                        paddingBottom: '14px',
                        borderBottom: '1px solid #f1f5f9',
                    }}
                >
                    Thông tin Giấy đăng ký doanh nghiệp
                </h3>

                {/* Option 1 */}
                <div
                    onClick={() => setDocType('REGISTRATION')}
                    style={{
                        border: `2px solid ${docType === 'REGISTRATION' ? GREEN : '#e5e7eb'}`,
                        borderRadius: '12px',
                        padding: '20px',
                        marginBottom: '16px',
                        cursor: 'pointer',
                        background: docType === 'REGISTRATION' ? '#f0fdf4' : 'white',
                        transition: 'all 0.15s',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: docType === 'REGISTRATION' ? '20px' : 0,
                        }}
                    >
                        <div
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: `2px solid ${docType === 'REGISTRATION' ? GREEN : '#d1d5db'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                background: docType === 'REGISTRATION' ? GREEN : 'white',
                            }}
                        >
                            {docType === 'REGISTRATION' && (
                                <div
                                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}
                                />
                            )}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Giấy đăng ký doanh nghiệp hoặc Giấy tờ tương đương khác
                        </span>
                    </div>

                    {docType === 'REGISTRATION' && (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 200px',
                                gap: '20px',
                                alignItems: 'flex-start',
                            }}
                        >
                            <div>
                                <FileDropzone
                                    label="Giấy tờ *"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                                    file={file1}
                                    onChange={setFile1}
                                    disabled={saving}
                                />
                                <div style={{ marginTop: '12px' }}>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            color: '#ef4444',
                                            margin: '0 0 4px',
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '6px',
                                        }}
                                    >
                                        <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                                        Các văn bản đăng tải cần đầy đủ các mặt và không có dấu hiệu chỉnh sửa/cắt thông
                                        tin
                                    </p>
                                    <p
                                        style={{
                                            fontSize: '12px',
                                            color: '#ef4444',
                                            margin: 0,
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '6px',
                                        }}
                                    >
                                        <AlertCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                                        Vui lòng đăng tải Giấy đăng ký doanh nghiệp có thông tin trùng khớp với dữ liệu
                                        của doanh nghiệp theo Trang thông tin điện tử của Cục Thuế
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 8px' }}>
                                    Minh họa
                                </p>
                                <Image
                                    src={sampleLicence}
                                    alt="Minh họa ĐKKD"
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Option 2 */}
                <div
                    onClick={() => setDocType('DELEGATION')}
                    style={{
                        border: `2px solid ${docType === 'DELEGATION' ? GREEN : '#e5e7eb'}`,
                        borderRadius: '12px',
                        padding: '20px',
                        cursor: 'pointer',
                        background: docType === 'DELEGATION' ? '#f0fdf4' : 'white',
                        transition: 'all 0.15s',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: docType === 'DELEGATION' ? '20px' : 0,
                        }}
                    >
                        <div
                            style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: `2px solid ${docType === 'DELEGATION' ? GREEN : '#d1d5db'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                background: docType === 'DELEGATION' ? GREEN : 'white',
                            }}
                        >
                            {docType === 'DELEGATION' && (
                                <div
                                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'white' }}
                                />
                            )}
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                            Giấy ủy quyền và Giấy tờ tạm danh
                        </span>
                    </div>

                    {docType === 'DELEGATION' && (
                        <div>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                                Dùng khi người đại diện không phải giám đốc/chủ doanh nghiệp. Cần cung cấp cả Giấy ủy
                                quyền lẫn CCCD/Hộ chiếu.
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* Giấy ủy quyền */}
                                <div>
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 140px',
                                            gap: '12px',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        <FileDropzone
                                            label="Giấy ủy quyền *"
                                            accept="image/jpeg,image/jpg,image/png,.pdf"
                                            file={file1}
                                            onChange={setFile1}
                                            disabled={saving}
                                        />
                                        <div style={{ textAlign: 'center' }}>
                                            <p
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: '#6b7280',
                                                    margin: '0 0 6px',
                                                }}
                                            >
                                                Minh họa
                                            </p>
                                            <Image
                                                src={authorityPaper}
                                                alt="Giấy ủy quyền mẫu"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* CCCD */}
                                <div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '12px' }}>
                                        <FileDropzone
                                            label="CCCD / Hộ chiếu *"
                                            accept="image/jpeg,image/jpg,image/png,.pdf"
                                            file={file2}
                                            onChange={setFile2}
                                            disabled={saving}
                                        />
                                        <div style={{ textAlign: 'center' }}>
                                            <p
                                                style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: '#6b7280',
                                                    margin: '0 0 6px',
                                                }}
                                            >
                                                Minh họa
                                            </p>
                                            <Image
                                                src={identitySample}
                                                alt="CCCD mẫu"
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e5e7eb',
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save button */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving || !file1}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: saving || !file1 ? '#86efac' : `linear-gradient(135deg, ${GREEN}, #00934a)`,
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px 32px',
                            fontSize: '14px',
                            fontWeight: '700',
                            cursor: saving || !file1 ? 'not-allowed' : 'pointer',
                            boxShadow: saving || !file1 ? 'none' : '0 4px 12px rgba(0,177,79,0.3)',
                        }}
                    >
                        {saving ? (
                            <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <Check size={16} />
                        )}
                        {saving ? 'Đang gửi...' : 'Lưu'}
                    </button>
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
