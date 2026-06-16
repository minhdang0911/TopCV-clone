'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload, Check, Loader, AlertCircle, Clock, CheckCircle, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
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
            <p className="text-sm font-semibold text-slate-700 m-0 mb-2">{label}</p>
            <div
                onClick={() => !disabled && inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    'border-2 border-dashed rounded-xl p-5 text-center transition-all relative',
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
                    dragging ? 'border-green-500 bg-green-50'
                        : file ? 'border-green-300 bg-green-50'
                        : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                )}
            >
                {file ? (
                    <div className="flex items-center gap-2.5 justify-center">
                        <FileText size={18} color={GREEN} />
                        <span className="text-sm font-semibold text-green-800 max-w-[200px] truncate">{file.name}</span>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onChange(null); }}
                            className="bg-transparent border-none cursor-pointer text-red-500 flex p-0.5"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                        <Upload size={22} className="text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 m-0">Chọn hoặc kéo file vào đây</p>
                        <p className="text-xs text-slate-400 mt-1 m-0">Dung lượng tối đa 5MB, định dạng: jpeg, jpg, png, pdf</p>
                    </>
                )}
                <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} disabled={disabled} />
            </div>
            {hint && <p className="text-xs text-red-500 mt-1.5 m-0">{hint}</p>}
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

    useEffect(() => { reloadStatus(); }, []);// eslint-disable-line

    const step3 = vstatus?.step3;
    const docStatus = step3?.status;

    const uploadFile = async (file) => {
        const fd = new FormData();
        fd.append('file', file);
        const res = await api.post('/upload/doc', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        return res.data?.data?.url;
    };

    const handleSave = async () => {
        if (!file1) { toast.error('Vui lòng chọn tài liệu'); return; }
        if (docType === 'DELEGATION' && !file2) { toast.error('Vui lòng chọn file CCCD/Hộ chiếu'); return; }
        if (file1.size > 5 * 1024 * 1024 || (file2 && file2.size > 5 * 1024 * 1024)) { toast.error('File tối đa 5MB'); return; }

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

    if (loading)
        return (
            <div className="flex justify-center items-center py-16">
                <div className="w-7 h-7 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );

    const isApproved = docStatus === 'APPROVED';
    const isPending = docStatus === 'PENDING';
    const isRejected = docStatus === 'REJECTED';

    const RadioDot = ({ selected }) => (
        <div className={cn('w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 transition-all', selected ? 'border-green-500 bg-green-500' : 'border-slate-300 bg-white')}>
            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
    );

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-base font-extrabold text-slate-900 m-0">Giấy đăng ký doanh nghiệp</h2>
                <p className="text-sm text-slate-500 mt-1">Vui lòng lựa chọn phương thức đăng tải phù hợp</p>
            </div>

            {/* Status banners */}
            {isApproved && (
                <div className="flex items-center gap-3 px-4 py-3.5 bg-green-50 border border-green-200 rounded-xl mb-5">
                    <CheckCircle size={20} color={GREEN} />
                    <div>
                        <div className="text-sm font-bold text-green-800">Tài liệu đã được phê duyệt</div>
                        <div className="text-xs text-green-700 mt-0.5">Tài khoản của bạn đã được xác thực đầy đủ</div>
                    </div>
                </div>
            )}
            {isPending && (
                <div className="flex items-center gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl mb-5">
                    <Clock size={20} className="text-amber-600" />
                    <div>
                        <div className="text-sm font-bold text-amber-800">Đang chờ admin duyệt</div>
                        <div className="text-xs text-amber-700 mt-0.5">Thường trong 1–2 ngày làm việc. Bạn có thể cập nhật lại tài liệu nếu cần.</div>
                    </div>
                </div>
            )}
            {isRejected && (
                <div className="px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl mb-5">
                    <div className="flex items-center gap-2.5 mb-1.5">
                        <AlertCircle size={20} className="text-red-600" />
                        <div className="text-sm font-bold text-red-600">Tài liệu bị từ chối</div>
                    </div>
                    {step3?.rejectReason && (
                        <div className="text-sm text-red-900 bg-red-100/60 rounded-lg px-3 py-2 mt-1">
                            <strong>Lý do:</strong> {step3.rejectReason}
                        </div>
                    )}
                    <p className="text-xs text-red-700 mt-2 m-0">Vui lòng upload lại tài liệu hợp lệ bên dưới.</p>
                </div>
            )}

            {/* Upload form */}
            <div className="bg-white rounded-xl p-7 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 m-0 mb-5 pb-3.5 border-b border-slate-100">
                    Thông tin Giấy đăng ký doanh nghiệp
                </h3>

                {/* Option 1 — REGISTRATION */}
                <div
                    onClick={() => setDocType('REGISTRATION')}
                    className={cn(
                        'border-2 rounded-xl p-5 mb-4 cursor-pointer transition-all',
                        docType === 'REGISTRATION' ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                >
                    <div className={cn('flex items-center gap-2.5', docType === 'REGISTRATION' ? 'mb-5' : 'mb-0')}>
                        <RadioDot selected={docType === 'REGISTRATION'} />
                        <span className="text-sm font-semibold text-slate-900">
                            Giấy đăng ký doanh nghiệp hoặc Giấy tờ tương đương khác
                        </span>
                    </div>

                    {docType === 'REGISTRATION' && (
                        <div className="grid grid-cols-[1fr_200px] gap-5 items-start">
                            <div>
                                <FileDropzone
                                    label="Giấy tờ *"
                                    accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
                                    file={file1}
                                    onChange={setFile1}
                                    disabled={saving}
                                />
                                <div className="mt-3 flex flex-col gap-1">
                                    <p className="text-xs text-red-500 m-0 flex items-start gap-1.5">
                                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                                        Các văn bản đăng tải cần đầy đủ các mặt và không có dấu hiệu chỉnh sửa/cắt thông tin
                                    </p>
                                    <p className="text-xs text-red-500 m-0 flex items-start gap-1.5">
                                        <AlertCircle size={13} className="shrink-0 mt-0.5" />
                                        Vui lòng đăng tải Giấy đăng ký doanh nghiệp có thông tin trùng khớp với dữ liệu của doanh nghiệp theo Trang thông tin điện tử của Cục Thuế
                                    </p>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-semibold text-slate-500 m-0 mb-2">Minh họa</p>
                                <Image src={sampleLicence} alt="Minh họa ĐKKD" className="w-full h-auto rounded-lg border border-slate-200" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Option 2 — DELEGATION */}
                <div
                    onClick={() => setDocType('DELEGATION')}
                    className={cn(
                        'border-2 rounded-xl p-5 cursor-pointer transition-all',
                        docType === 'DELEGATION' ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                >
                    <div className={cn('flex items-center gap-2.5', docType === 'DELEGATION' ? 'mb-5' : 'mb-0')}>
                        <RadioDot selected={docType === 'DELEGATION'} />
                        <span className="text-sm font-semibold text-slate-900">Giấy ủy quyền và Giấy tờ tạm danh</span>
                    </div>

                    {docType === 'DELEGATION' && (
                        <div>
                            <p className="text-sm text-slate-500 m-0 mb-4">
                                Dùng khi người đại diện không phải giám đốc/chủ doanh nghiệp. Cần cung cấp cả Giấy ủy quyền lẫn CCCD/Hộ chiếu.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <div className="grid grid-cols-[1fr_140px] gap-3">
                                        <FileDropzone
                                            label="Giấy ủy quyền *"
                                            accept="image/jpeg,image/jpg,image/png,.pdf"
                                            file={file1}
                                            onChange={setFile1}
                                            disabled={saving}
                                        />
                                        <div className="text-center">
                                            <p className="text-[11px] font-semibold text-slate-500 m-0 mb-1.5">Minh họa</p>
                                            <Image src={authorityPaper} alt="Giấy ủy quyền mẫu" className="w-full h-auto rounded-md border border-slate-200" />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div className="grid grid-cols-[1fr_140px] gap-3">
                                        <FileDropzone
                                            label="CCCD / Hộ chiếu *"
                                            accept="image/jpeg,image/jpg,image/png,.pdf"
                                            file={file2}
                                            onChange={setFile2}
                                            disabled={saving}
                                        />
                                        <div className="text-center">
                                            <p className="text-[11px] font-semibold text-slate-500 m-0 mb-1.5">Minh họa</p>
                                            <Image src={identitySample} alt="CCCD mẫu" className="w-full h-auto rounded-md border border-slate-200" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving || !file1}
                        className={cn(
                            'inline-flex items-center gap-2 text-white border-none rounded-xl px-8 py-3 text-sm font-bold transition-all',
                            saving || !file1
                                ? 'bg-green-200 cursor-not-allowed'
                                : 'bg-gradient-to-r from-green-500 to-green-700 shadow-[0_4px_12px_rgba(0,177,79,0.3)] cursor-pointer hover:opacity-90'
                        )}
                    >
                        {saving ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                        {saving ? 'Đang gửi...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
}
