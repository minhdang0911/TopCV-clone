'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, ClipboardList, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { applicationsService } from '@/services/applications.service';
import { employerDashboardService } from '@/services/employer-dashboard.service';
import useAuthStore from '@/stores/auth.store';

const GREEN = '#00b14f';

const STATUS_CONFIG = {
    PENDING:   { label: 'Chờ duyệt',     color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
    REVIEWING: { label: 'Đang xem xét',  color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    INTERVIEW: { label: 'Phỏng vấn',     color: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
    OFFERED:   { label: 'Nhận offer',    color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
    REJECTED:  { label: 'Không phù hợp', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const STATUS_OPTIONS = ['PENDING', 'REVIEWING', 'INTERVIEW', 'OFFERED', 'REJECTED'];

function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    const days = Math.floor(hours / 24);
    return days < 30 ? `${days} ngày trước` : new Date(iso).toLocaleDateString('vi-VN');
}

// ─── Status Dropdown ──────────────────────────────────────────────────────────
// Uses position:fixed + getBoundingClientRect so it never gets clipped by
// ancestor overflow:hidden on the table wrapper.

function StatusDropdown({ current, applicationId, onUpdate, onModalStatus }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pos, setPos] = useState({ top: 0, right: 0 });
    const btnRef = useRef(null);
    const cfg = STATUS_CONFIG[current] || STATUS_CONFIG.PENDING;

    const handleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
        }
        setOpen(v => !v);
    };

    const handleSelect = async (status) => {
        if (status === current) { setOpen(false); return; }
        setOpen(false);

        if (['INTERVIEW', 'OFFERED', 'REJECTED'].includes(status) && onModalStatus) {
            onModalStatus(status);
            return;
        }

        setLoading(true);
        try {
            await applicationsService.updateStatus(applicationId, { status });
            onUpdate(applicationId, status);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                ref={btnRef}
                onClick={handleOpen}
                disabled={loading}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', fontWeight: '600',
                    color: cfg.color, background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                    borderRadius: '20px', padding: '4px 10px 4px 12px',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    opacity: loading ? 0.7 : 1,
                }}
            >
                {cfg.label}
                <ChevronDown size={12} />
            </button>

            {open && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setOpen(false)} />
                    <div style={{
                        position: 'fixed',
                        top: pos.top,
                        right: pos.right,
                        zIndex: 9999,
                        background: 'white',
                        borderRadius: '10px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                        border: '1px solid #e5e7eb',
                        overflow: 'hidden',
                        minWidth: '160px',
                    }}>
                        {STATUS_OPTIONS.map(s => {
                            const c = STATUS_CONFIG[s];
                            return (
                                <button key={s} onClick={() => handleSelect(s)}
                                    style={{
                                        display: 'block', width: '100%', textAlign: 'left',
                                        padding: '9px 14px', border: 'none', cursor: 'pointer',
                                        fontSize: '13px', fontWeight: s === current ? '700' : '400',
                                        color: c.color,
                                        background: s === current ? c.bg : 'white',
                                    }}
                                    onMouseEnter={e => { if (s !== current) e.currentTarget.style.background = '#f9fafb'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = s === current ? c.bg : 'white'; }}
                                >
                                    {c.label}
                                </button>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ─── Interview Email Modal ─────────────────────────────────────────────────────

const INTERVIEW_TYPE_LABELS = {
    direct: 'Trực tiếp tại văn phòng',
    online: 'Online (Zoom / Google Meet)',
    phone: 'Qua điện thoại',
};

function buildEmailTemplate({ candidateName, jobTitle, companyName, interviewDate, interviewTime, interviewLocation, interviewType, interviewNote }) {
    const dateStr = interviewDate
        ? new Date(interviewDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '';
    const typeLabel = INTERVIEW_TYPE_LABELS[interviewType] || 'Trực tiếp tại văn phòng';

    let body = `Kính gửi ${candidateName},\n\n`;
    body += `Cảm ơn bạn đã quan tâm và ứng tuyển vào vị trí ${jobTitle} tại ${companyName}. Sau khi xem xét hồ sơ, chúng tôi nhận thấy bạn phù hợp với yêu cầu tuyển dụng và mong muốn mời bạn tham gia buổi phỏng vấn để trao đổi chi tiết hơn về công việc.\n`;

    const hasDetails = dateStr || interviewLocation || interviewType;
    if (hasDetails) {
        body += '\n';
        if (dateStr) body += `Thời gian: ${dateStr}${interviewTime ? ` lúc ${interviewTime}` : ''}\n`;
        if (interviewLocation) body += `Địa điểm: ${interviewLocation}\n`;
        body += `Hình thức: ${typeLabel}\n`;
    }

    if (interviewNote) body += `\nLưu ý: ${interviewNote}\n`;

    body += '\nVui lòng xác nhận sự tham gia của bạn bằng cách phản hồi email này. Nếu bạn có bất kỳ câu hỏi nào, đừng ngần ngại liên hệ với chúng tôi.\n';
    body += '\nRất mong được gặp bạn trong buổi phỏng vấn!\n\n';
    body += `Trân trọng,\nBộ phận Nhân sự\n${companyName}`;
    return body;
}

// applications — always an array (1 item = single mode, >1 = bulk mode)
function InterviewEmailModal({ applications, companyName, logoUrl, companyAddress, onClose, onConfirm }) {
    const isBulk = applications.length > 1;
    const firstApp = applications[0] || {};
    const firstCandidate = firstApp.candidate || {};
    const firstProfile = firstCandidate.candidateProfile || {};
    const firstCandidateName = firstProfile.fullName || firstCandidate.email || 'Ứng viên';
    const jobTitle = firstApp.job?.title || '';
    const templateName = isBulk ? '[Tên ứng viên]' : firstCandidateName;

    const [sendEmail, setSendEmail] = useState(true);
    const [loading, setLoading] = useState(false);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [interviewLocation, setInterviewLocation] = useState(companyAddress || '');
    const [interviewType, setInterviewType] = useState('direct');
    const [interviewNote, setInterviewNote] = useState('');
    const [emailSubject, setEmailSubject] = useState(
        isBulk
            ? `[${companyName}] Thư mời phỏng vấn`
            : `[${companyName}] Thư mời phỏng vấn vị trí ${jobTitle}`
    );
    const [emailBody, setEmailBody] = useState('');
    const [isBodyCustomized, setIsBodyCustomized] = useState(false);
    const dirtyRef = useRef(false);

    useEffect(() => {
        setEmailBody(buildEmailTemplate({ candidateName: templateName, jobTitle, companyName, interviewDate: '', interviewTime: '', interviewLocation: companyAddress || '', interviewType: 'direct', interviewNote: '' }));
    }, []); // eslint-disable-line

    useEffect(() => {
        if (!dirtyRef.current) {
            setEmailBody(buildEmailTemplate({ candidateName: templateName, jobTitle, companyName, interviewDate, interviewTime, interviewLocation, interviewType, interviewNote }));
        }
    }, [interviewDate, interviewTime, interviewLocation, interviewType, interviewNote]); // eslint-disable-line

    const handleBodyChange = (e) => {
        setEmailBody(e.target.value);
        if (!dirtyRef.current) { dirtyRef.current = true; setIsBodyCustomized(true); }
    };

    const resetBody = () => {
        dirtyRef.current = false;
        setIsBodyCustomized(false);
        setEmailBody(buildEmailTemplate({ candidateName: templateName, jobTitle, companyName, interviewDate, interviewTime, interviewLocation, interviewType, interviewNote }));
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm({
                sendEmail, interviewDate, interviewTime, interviewLocation,
                interviewType, interviewNote,
                emailSubject: sendEmail ? emailSubject : undefined,
                emailBodyTemplate: sendEmail ? emailBody : undefined,
            });
        } finally {
            setLoading(false);
        }
    };

    const field = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', color: '#374151', background: 'white', boxSizing: 'border-box' };
    const lbl = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={onClose}
        >
            <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                onClick={e => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {logoUrl
                            ? <img src={logoUrl} alt={companyName} style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #e5e7eb', background: '#f9fafb', padding: '2px' }} />
                            : <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px', flexShrink: 0 }}>{(companyName[0] || 'C').toUpperCase()}</div>
                        }
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Thư mời phỏng vấn</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{companyName}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '22px', lineHeight: 1, padding: '4px 6px' }}>×</button>
                </div>

                {/* ── To / Subject ── */}
                <div style={{ padding: '10px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', width: '50px', flexShrink: 0 }}>Gửi đến</span>
                        {isBulk ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '3px 12px 3px 8px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '700' }}>{applications.length}</div>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{applications.length} ứng viên đã chọn</span>
                            </div>
                        ) : (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '3px 12px 3px 8px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '700' }}>{firstCandidateName[0]?.toUpperCase()}</div>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{firstCandidateName}</span>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>{'<'}{firstCandidate.email}{'>'}</span>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', width: '50px', flexShrink: 0 }}>Tiêu đề</span>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', color: '#374151', background: 'white' }} />
                    </div>
                </div>

                {/* ── Two-column body ── */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

                    {/* Left: interview form */}
                    <div style={{ width: '280px', flexShrink: 0, borderRight: '1px solid #e5e7eb', padding: '16px', overflowY: 'auto' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Chi tiết buổi phỏng vấn</div>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Ngày phỏng vấn</label>
                            <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} style={field} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Giờ bắt đầu</label>
                            <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} style={field} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Hình thức</label>
                            <select value={interviewType} onChange={e => setInterviewType(e.target.value)} style={{ ...field, cursor: 'pointer' }}>
                                <option value="direct">Trực tiếp tại văn phòng</option>
                                <option value="online">Online (Zoom / Google Meet)</option>
                                <option value="phone">Qua điện thoại</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Địa điểm</label>
                            <input type="text" value={interviewLocation} onChange={e => setInterviewLocation(e.target.value)}
                                placeholder="Tầng 5, 123 Nguyễn Huệ, Q.1..." style={field} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Ghi chú <span style={{ fontWeight: '400', color: '#9ca3af' }}>(tùy chọn)</span></label>
                            <textarea value={interviewNote} onChange={e => setInterviewNote(e.target.value)}
                                placeholder="Vui lòng mang theo CCCD, CV bản cứng..."
                                rows={3} style={{ ...field, resize: 'vertical' }} />
                        </div>

                        <div style={{ marginTop: '4px', padding: '10px 12px', background: '#f0fdf4', borderRadius: '6px', fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <CheckCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span>Thông báo realtime sẽ tự động gửi khi xác nhận.</span>
                        </div>
                    </div>

                    {/* Right: email body editor */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Nội dung email {isBulk && <span style={{ color: '#d97706', textTransform: 'none', letterSpacing: 0, fontWeight: '400' }}>— [Tên ứng viên] sẽ được thay tự động</span>}
                            </div>
                            {isBodyCustomized && (
                                <button onClick={resetBody} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GREEN, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <RotateCcw size={11} /> Hoàn tác về mẫu
                                </button>
                            )}
                        </div>

                        <textarea
                            value={emailBody}
                            onChange={handleBodyChange}
                            spellCheck={false}
                            style={{
                                flex: 1, padding: '14px', border: `1px solid ${isBodyCustomized ? '#fbbf24' : '#e5e7eb'}`,
                                borderRadius: '8px', fontSize: '13px', lineHeight: '1.8', resize: 'none', outline: 'none',
                                fontFamily: 'inherit', color: '#374151',
                                background: isBodyCustomized ? '#fffdf0' : 'white',
                                transition: 'border-color 0.15s',
                            }}
                        />
                        <div style={{ marginTop: '5px', fontSize: '11px', color: isBodyCustomized ? '#d97706' : '#9ca3af' }}>
                            {isBodyCustomized ? '✏️ Nội dung tùy chỉnh — thay đổi trên form không tự cập nhật' : 'Tự động cập nhật khi điền thông tin bên trái'}
                        </div>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                        <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                            style={{ width: '15px', height: '15px', accentColor: GREEN }} />
                        {isBulk
                            ? `Gửi email thông báo đến ${applications.length} ứng viên`
                            : <>Gửi email thông báo đến <strong style={{ marginLeft: '3px' }}>{firstCandidate.email}</strong></>
                        }
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onClose}
                            style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '7px', background: 'white', fontSize: '13px', cursor: 'pointer', color: '#374151', fontWeight: '500' }}>
                            Hủy
                        </button>
                        <button onClick={handleConfirm} disabled={loading}
                            style={{ padding: '8px 20px', background: GREEN, color: 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Đang xử lý...' : (sendEmail ? 'Xác nhận & Gửi email' : 'Xác nhận')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Offer Email Modal ────────────────────────────────────────────────────────

function buildOfferTemplate({ candidateName, jobTitle, companyName, offerSalary, offerStartDate, offerProbation }) {
    const dateStr = offerStartDate
        ? new Date(offerStartDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '';
    let body = `Kính gửi ${candidateName},\n\n`;
    body += `Thay mặt ${companyName}, chúng tôi vui mừng thông báo bạn đã vượt qua vòng phỏng vấn và được nhận vào vị trí ${jobTitle}.\n\n`;
    body += `Sau quá trình phỏng vấn, chúng tôi nhận thấy bạn phù hợp với yêu cầu và kỳ vọng của chúng tôi cho vị trí này.\n`;
    if (offerSalary || dateStr || offerProbation) {
        body += '\nThông tin offer:\n';
        if (offerSalary) body += `Mức lương: ${offerSalary}\n`;
        if (dateStr) body += `Ngày bắt đầu: ${dateStr}\n`;
        if (offerProbation) body += `Thời gian thử việc: ${offerProbation}\n`;
    }
    body += '\nVui lòng xác nhận nhận việc bằng cách phản hồi email này.\n\n';
    body += `Chúng tôi rất mong được chào đón bạn gia nhập đội ngũ!\n\nTrân trọng,\nBộ phận Nhân sự\n${companyName}`;
    return body;
}

function OfferEmailModal({ application, companyName, logoUrl, onClose, onConfirm }) {
    const candidate = application.candidate || {};
    const profile = candidate.candidateProfile || {};
    const candidateName = profile.fullName || candidate.email || 'Ứng viên';
    const jobTitle = application.job?.title || '';

    const [sendEmail, setSendEmail] = useState(true);
    const [loading, setLoading] = useState(false);
    const [offerSalary, setOfferSalary] = useState('');
    const [offerStartDate, setOfferStartDate] = useState('');
    const [offerProbation, setOfferProbation] = useState('');
    const [offerNote, setOfferNote] = useState('');
    const [emailSubject, setEmailSubject] = useState(`[${companyName}] Thư thông báo kết quả tuyển dụng – ${jobTitle}`);
    const [emailBody, setEmailBody] = useState(() =>
        buildOfferTemplate({ candidateName, jobTitle, companyName, offerSalary: '', offerStartDate: '', offerProbation: '' })
    );
    const [isBodyCustomized, setIsBodyCustomized] = useState(false);
    const dirtyRef = useRef(false);

    useEffect(() => {
        if (!dirtyRef.current) {
            setEmailBody(buildOfferTemplate({ candidateName, jobTitle, companyName, offerSalary, offerStartDate, offerProbation }));
        }
    }, [offerSalary, offerStartDate, offerProbation]); // eslint-disable-line

    const resetBody = () => {
        dirtyRef.current = false;
        setIsBodyCustomized(false);
        setEmailBody(buildOfferTemplate({ candidateName, jobTitle, companyName, offerSalary, offerStartDate, offerProbation }));
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm({
                sendEmail, offerSalary, offerStartDate, offerProbation, offerNote,
                emailSubject: sendEmail ? emailSubject : undefined,
                emailBody: sendEmail ? emailBody : undefined,
            });
        } finally { setLoading(false); }
    };

    const field = { width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', color: '#374151', background: 'white', boxSizing: 'border-box' };
    const lbl = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '860px', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {logoUrl
                            ? <img src={logoUrl} alt={companyName} style={{ width: '34px', height: '34px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #e5e7eb', padding: '2px' }} />
                            : <div style={{ width: '34px', height: '34px', borderRadius: '6px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '15px' }}>{(companyName[0] || 'C').toUpperCase()}</div>
                        }
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Thư mời nhận việc (Offer Letter)</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{companyName}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '22px', lineHeight: 1, padding: '4px 6px' }}>×</button>
                </div>

                {/* To / Subject */}
                <div style={{ padding: '10px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', width: '50px', flexShrink: 0 }}>Gửi đến</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '3px 12px 3px 8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '700' }}>{candidateName[0]?.toUpperCase()}</div>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{candidateName}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{'<'}{candidate.email}{'>'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', width: '50px', flexShrink: 0 }}>Tiêu đề</span>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', color: '#374151', background: 'white' }} />
                    </div>
                </div>

                {/* Two-column */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>
                    {/* Left: offer details */}
                    <div style={{ width: '270px', flexShrink: 0, borderRight: '1px solid #e5e7eb', padding: '16px', overflowY: 'auto' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>Thông tin offer</div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Mức lương</label>
                            <input type="text" value={offerSalary} onChange={e => setOfferSalary(e.target.value)}
                                placeholder="VD: 18.000.000 VNĐ/tháng" style={field} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Ngày bắt đầu làm việc</label>
                            <input type="date" value={offerStartDate} onChange={e => setOfferStartDate(e.target.value)} style={field} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Thời gian thử việc <span style={{ fontWeight: '400', color: '#9ca3af' }}>(tùy chọn)</span></label>
                            <input type="text" value={offerProbation} onChange={e => setOfferProbation(e.target.value)}
                                placeholder="VD: 2 tháng, hưởng 80% lương" style={field} />
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={lbl}>Ghi chú <span style={{ fontWeight: '400', color: '#9ca3af' }}>(tùy chọn)</span></label>
                            <textarea value={offerNote} onChange={e => setOfferNote(e.target.value)}
                                placeholder="Thông tin thêm về phúc lợi, quy định..."
                                rows={3} style={{ ...field, resize: 'vertical' }} />
                        </div>
                        <div style={{ padding: '10px 12px', background: '#f0fdf4', borderRadius: '6px', fontSize: '12px', color: '#16a34a', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <CheckCircle size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span>Thông báo realtime sẽ tự động gửi khi xác nhận.</span>
                        </div>
                    </div>
                    {/* Right: email body */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nội dung email</div>
                            {isBodyCustomized && (
                                <button onClick={resetBody} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GREEN, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                    <RotateCcw size={11} /> Hoàn tác về mẫu
                                </button>
                            )}
                        </div>
                        <textarea value={emailBody} onChange={e => { setEmailBody(e.target.value); if (!dirtyRef.current) { dirtyRef.current = true; setIsBodyCustomized(true); } }}
                            spellCheck={false}
                            style={{ flex: 1, padding: '14px', border: `1px solid ${isBodyCustomized ? '#fbbf24' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '13px', lineHeight: '1.8', resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#374151', background: isBodyCustomized ? '#fffdf0' : 'white', transition: 'border-color 0.15s' }} />
                        <div style={{ marginTop: '5px', fontSize: '11px', color: isBodyCustomized ? '#d97706' : '#9ca3af' }}>
                            {isBodyCustomized ? '✏️ Nội dung tùy chỉnh — thay đổi form sẽ không tự cập nhật' : 'Tự động cập nhật khi điền thông tin bên trái'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                        <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: GREEN }} />
                        Gửi email thông báo đến <strong style={{ marginLeft: '3px' }}>{candidate.email}</strong>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onClose} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '7px', background: 'white', fontSize: '13px', cursor: 'pointer', color: '#374151', fontWeight: '500' }}>Hủy</button>
                        <button onClick={handleConfirm} disabled={loading}
                            style={{ padding: '8px 20px', background: GREEN, color: 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Đang xử lý...' : (sendEmail ? 'Xác nhận & Gửi email' : 'Xác nhận')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Rejected Email Modal ─────────────────────────────────────────────────────

function buildRejectionTemplate({ candidateName, jobTitle, companyName }) {
    return `Kính gửi ${candidateName},\n\nCảm ơn bạn đã dành thời gian tham gia phỏng vấn cho vị trí ${jobTitle} tại ${companyName}.\n\nSau khi cân nhắc kỹ lưỡng, chúng tôi rất tiếc phải thông báo rằng hồ sơ của bạn chưa phù hợp với yêu cầu tuyển dụng hiện tại của chúng tôi.\n\nChúng tôi trân trọng sự quan tâm của bạn và sẽ lưu lại thông tin để xem xét trong tương lai nếu có vị trí phù hợp hơn.\n\nChúc bạn thành công trong quá trình tìm kiếm công việc!\n\nTrân trọng,\nBộ phận Nhân sự\n${companyName}`;
}

function RejectedEmailModal({ application, companyName, logoUrl, onClose, onConfirm }) {
    const candidate = application.candidate || {};
    const profile = candidate.candidateProfile || {};
    const candidateName = profile.fullName || candidate.email || 'Ứng viên';
    const jobTitle = application.job?.title || '';

    const [sendEmail, setSendEmail] = useState(true);
    const [loading, setLoading] = useState(false);
    const [emailSubject, setEmailSubject] = useState(`[${companyName}] Kết quả ứng tuyển vị trí ${jobTitle}`);
    const [emailBody, setEmailBody] = useState(() => buildRejectionTemplate({ candidateName, jobTitle, companyName }));
    const [isBodyCustomized, setIsBodyCustomized] = useState(false);
    const dirtyRef = useRef(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm({ sendEmail, emailSubject: sendEmail ? emailSubject : undefined, emailBody: sendEmail ? emailBody : undefined });
        } finally { setLoading(false); }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
            <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '14px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {logoUrl
                            ? <img src={logoUrl} alt={companyName} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain', border: '1px solid #e5e7eb', padding: '2px' }} />
                            : <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '14px' }}>{(companyName[0] || 'C').toUpperCase()}</div>
                        }
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>Thông báo kết quả ứng tuyển</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{companyName}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '22px', lineHeight: 1, padding: '4px 6px' }}>×</button>
                </div>

                {/* To / Subject */}
                <div style={{ padding: '10px 20px', borderBottom: '1px solid #e5e7eb', background: '#fafafa', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '7px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', width: '50px', flexShrink: 0 }}>Gửi đến</span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '3px 12px 3px 8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '700' }}>{candidateName[0]?.toUpperCase()}</div>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{candidateName}</span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{'<'}{candidate.email}{'>'}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', width: '50px', flexShrink: 0 }}>Tiêu đề</span>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                            style={{ flex: 1, padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', fontFamily: 'inherit', color: '#374151', background: 'white' }} />
                    </div>
                </div>

                {/* Email body */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nội dung email</div>
                        {isBodyCustomized && (
                            <button onClick={() => { dirtyRef.current = false; setIsBodyCustomized(false); setEmailBody(buildRejectionTemplate({ candidateName, jobTitle, companyName })); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: GREEN, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <RotateCcw size={11} /> Hoàn tác về mẫu
                            </button>
                        )}
                    </div>
                    <textarea value={emailBody} onChange={e => { setEmailBody(e.target.value); if (!dirtyRef.current) { dirtyRef.current = true; setIsBodyCustomized(true); } }}
                        spellCheck={false}
                        style={{ flex: 1, padding: '14px', border: `1px solid ${isBodyCustomized ? '#fbbf24' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '13px', lineHeight: '1.8', resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#374151', background: isBodyCustomized ? '#fffdf0' : 'white', transition: 'border-color 0.15s' }} />
                </div>

                {/* Footer */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
                        <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: GREEN }} />
                        Gửi email thông báo đến <strong style={{ marginLeft: '3px' }}>{candidate.email}</strong>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={onClose} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '7px', background: 'white', fontSize: '13px', cursor: 'pointer', color: '#374151', fontWeight: '500' }}>Hủy</button>
                        <button onClick={handleConfirm} disabled={loading}
                            style={{ padding: '8px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Đang xử lý...' : (sendEmail ? 'Xác nhận & Gửi email' : 'Xác nhận')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Application Row ──────────────────────────────────────────────────────────

function ApplicationRow({ item, selected, onToggleSelect, onStatusChange, onViewDetail, onModalStatus }) {
    const candidate = item.candidate || {};
    const profile = candidate.candidateProfile || {};
    const job = item.job || {};
    const displayName = profile.fullName || candidate.email || '?';

    return (
        <tr
            className="ap-tr"
            style={{ borderBottom: '1px solid #f3f4f6', background: selected ? '#f0fdf4' : 'white' }}
            onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#fafafa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = selected ? '#f0fdf4' : 'white'; }}
        >
            {/* Checkbox */}
            <td className="ap-td ap-td-check" style={{ padding: '12px 8px 12px 16px', width: '36px' }}>
                <input type="checkbox" checked={selected} onChange={() => onToggleSelect(item.id)}
                    style={{ width: '15px', height: '15px', accentColor: GREEN, cursor: 'pointer' }} />
            </td>
            {/* Candidate */}
            <td className="ap-td ap-td-cand" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#f0fdf4', fontSize: '14px', fontWeight: '700', color: GREEN,
                        overflow: 'hidden',
                    }}>
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : displayName[0].toUpperCase()
                        }
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{displayName}</div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{candidate.email}</div>
                        {candidate.phone && <div style={{ fontSize: '12px', color: '#6b7280' }}>{candidate.phone}</div>}
                    </div>
                </div>
            </td>

            {/* Job */}
            <td className="ap-td ap-td-job" style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '2px' }}>{job.title}</div>
                {item.location && (
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {[item.location?.districtName, item.location?.provinceName].filter(Boolean).join(', ')}
                    </div>
                )}
            </td>

            {/* CV */}
            <td className="ap-td ap-td-cv" style={{ padding: '12px 16px' }}>
                {item.resume ? (
                    <a href={`/xem-cv/${item.resume.id}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        {item.resume.title}
                    </a>
                ) : item.cvFileUrl ? (
                    <a href={item.cvFileUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: '500' }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                    >
                        Xem file CV
                    </a>
                ) : (
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>—</span>
                )}
            </td>

            {/* Applied at */}
            <td className="ap-td ap-td-time" style={{ padding: '12px 16px' }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{timeAgo(item.createdAt)}</span>
            </td>

            {/* Status */}
            <td className="ap-td ap-td-status" style={{ padding: '12px 16px' }}>
                <StatusDropdown
                    current={item.status}
                    applicationId={item.id}
                    onUpdate={onStatusChange}
                    onModalStatus={(status) => onModalStatus(item, status)}
                />
            </td>

            {/* Actions */}
            <td className="ap-td ap-td-actions" style={{ padding: '12px 16px', textAlign: 'center' }}>
                <button
                    onClick={() => onViewDetail(item)}
                    title="Xem chi tiết"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}
                    onMouseEnter={e => e.currentTarget.style.color = GREEN}
                    onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                    <Eye size={16} />
                </button>
            </td>
        </tr>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailModal({ item, onClose, onStatusChange, onModalStatus }) {
    const candidate = item.candidate || {};
    const profile = candidate.candidateProfile || {};
    const job = item.job || {};
    const displayName = profile.fullName || candidate.email || '?';
    const [note, setNote] = useState(item.note || '');
    const [saving, setSaving] = useState(false);

    const saveNote = async () => {
        setSaving(true);
        try {
            await applicationsService.updateStatus(item.id, { status: item.status, note });
            onClose();
        } catch {} finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
            onClick={onClose}
        >
            <div
                style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Chi tiết ứng viên</div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '20px' }}>×</button>
                </div>
                <div style={{ padding: '20px 24px' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '700', color: GREEN, flexShrink: 0, overflow: 'hidden' }}>
                            {profile.avatarUrl
                                ? <img src={profile.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : displayName[0].toUpperCase()
                            }
                        </div>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{displayName}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{candidate.email}</div>
                            {candidate.phone && <div style={{ fontSize: '13px', color: '#6b7280' }}>{candidate.phone}</div>}
                        </div>
                    </div>

                    <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Vị trí ứng tuyển</div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{job.title}</div>
                    </div>

                    {/* CV links */}
                    {(item.resume || item.cvFileUrl) && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Hồ sơ CV</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {item.resume && (
                                    <a href={`/xem-cv/${item.resume.id}`} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '13px', fontWeight: '600', color: '#2563eb', textDecoration: 'none' }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                        {item.resume.title || 'CV Online'}
                                    </a>
                                )}
                                {item.cvFileUrl && (
                                    <a href={item.cvFileUrl} target="_blank" rel="noopener noreferrer"
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', background: '#fef3c7', border: '1px solid #fde68a', fontSize: '13px', fontWeight: '600', color: '#d97706', textDecoration: 'none' }}
                                    >
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                        CV file đính kèm
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {item.coverLetterFileUrl && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Cover Letter đính kèm (file)</div>
                            <a href={item.coverLetterFileUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #86efac', fontSize: '13px', fontWeight: '600', color: '#16a34a', textDecoration: 'none' }}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                Xem file Cover Letter
                            </a>
                        </div>
                    )}

                    {item.coverLetterDoc && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Cover Letter đính kèm</div>
                            <a href={`/xem-cover-letter/${item.coverLetterDoc.id}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '6px', background: '#f0fdf4', border: '1px solid #86efac', fontSize: '13px', fontWeight: '600', color: '#16a34a', textDecoration: 'none' }}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8"/></svg>
                                {item.coverLetterDoc.title || 'Cover Letter'}
                            </a>
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Cập nhật trạng thái</div>
                        <StatusDropdown
                            current={item.status}
                            applicationId={item.id}
                            onUpdate={(id, s) => { onStatusChange(id, s); item.status = s; }}
                            onModalStatus={onModalStatus ? (status) => { onClose(); onModalStatus(item, status); } : undefined}
                        />
                    </div>

                    {item.coverLetter && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Thư giới thiệu</div>
                            <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {item.coverLetter}
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                            Ghi chú nội bộ
                        </label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Ghi chú về ứng viên này..."
                            rows={3}
                            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} style={{ flex: 1, padding: '10px', border: '1px solid #d1d5db', borderRadius: '8px', background: 'white', fontSize: '13px', cursor: 'pointer' }}>
                            Đóng
                        </button>
                        <button onClick={saveNote} disabled={saving} style={{ flex: 2, padding: '10px', background: GREEN, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                            {saving ? 'Đang lưu...' : 'Lưu ghi chú'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CandidateProfilesPage() {
    const { user } = useAuthStore();
    const companyName = user?.employerProfile?.companyName || 'Công ty';
    const logoUrl = user?.employerProfile?.logoUrl || null;
    const companyAddress = user?.employerProfile?.address || '';
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [jobFilter, setJobFilter] = useState('');
    const [jobs, setJobs] = useState([]);
    const [detailItem, setDetailItem] = useState(null);
    const [interviewItem, setInterviewItem] = useState(null);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [offerItem, setOfferItem] = useState(null);
    const [rejectItem, setRejectItem] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const LIMIT = 20;

    useEffect(() => {
        employerDashboardService.getMyJobs({ limit: 100 })
            .then(res => setJobs(res.data?.data || []))
            .catch(() => {});
    }, []);

    const fetchApplications = () => {
        setLoading(true);
        const params = { page, limit: LIMIT };
        if (statusFilter) params.status = statusFilter;
        if (jobFilter) params.jobId = jobFilter;
        applicationsService.getAllByEmployer(params)
            .then(res => {
                setItems(res.data?.data || []);
                setTotal(res.data?.total || 0);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchApplications(); setSelectedIds(new Set()); }, [page, statusFilter, jobFilter]); // eslint-disable-line

    const handleStatusChange = (applicationId, newStatus) => {
        setItems(prev => prev.map(i => i.id === applicationId ? { ...i, status: newStatus } : i));
    };

    const handleInterviewConfirm = async ({ sendEmail, interviewDate, interviewTime, interviewLocation, interviewType, interviewNote, emailSubject, emailBodyTemplate }) => {
        const targets = interviewItem ? [interviewItem] : items.filter(i => selectedIds.has(i.id));
        if (!targets.length) return;
        try {
            await Promise.all(targets.map(app => {
                const cand = app.candidate || {};
                const prof = cand.candidateProfile || {};
                const name = prof.fullName || cand.email || 'Ứng viên';
                const emailBody = emailBodyTemplate?.replace(/\[Tên ứng viên\]/g, name);
                return applicationsService.updateStatus(app.id, {
                    status: 'INTERVIEW', sendEmail, interviewDate, interviewTime,
                    interviewLocation, interviewType, interviewNote, emailSubject, emailBody,
                });
            }));
            targets.forEach(app => handleStatusChange(app.id, 'INTERVIEW'));
            setInterviewItem(null);
            setBulkModalOpen(false);
            setSelectedIds(new Set());
            toast.success(targets.length > 1 ? `Đã mời phỏng vấn ${targets.length} ứng viên` : 'Đã chuyển sang Phỏng vấn');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Cập nhật thất bại');
        }
    };

    const handleOfferConfirm = async ({ sendEmail, offerSalary, offerStartDate, offerProbation, offerNote, emailSubject, emailBody }) => {
        if (!offerItem) return;
        try {
            await applicationsService.updateStatus(offerItem.id, { status: 'OFFERED', sendEmail, offerSalary, offerStartDate, offerProbation, offerNote, emailSubject, emailBody });
            handleStatusChange(offerItem.id, 'OFFERED');
            setOfferItem(null);
            toast.success('Đã gửi Offer Letter');
        } catch (e) { toast.error(e?.response?.data?.message || 'Cập nhật thất bại'); }
    };

    const handleRejectConfirm = async ({ sendEmail, emailSubject, emailBody }) => {
        if (!rejectItem) return;
        try {
            await applicationsService.updateStatus(rejectItem.id, { status: 'REJECTED', sendEmail, emailSubject, emailBody });
            handleStatusChange(rejectItem.id, 'REJECTED');
            setRejectItem(null);
            toast.success('Đã cập nhật trạng thái');
        } catch (e) { toast.error(e?.response?.data?.message || 'Cập nhật thất bại'); }
    };

    const openStatusModal = (item, status) => {
        if (status === 'INTERVIEW') setInterviewItem(item);
        else if (status === 'OFFERED') setOfferItem(item);
        else if (status === 'REJECTED') setRejectItem(item);
    };

    const allChecked = items.length > 0 && items.every(i => selectedIds.has(i.id));
    const someChecked = items.some(i => selectedIds.has(i.id)) && !allChecked;

    const totalPages = Math.ceil(total / LIMIT);

    const thStyle = {
        padding: '10px 16px', textAlign: 'left',
        fontSize: '11px', fontWeight: '700',
        color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em',
        background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
    };

    return (
        <div>
            <style>{`
                @media (max-width: 768px) {
                    .ap-thead { display: none; }
                    .ap-tr {
                        display: flex !important;
                        flex-wrap: wrap;
                        align-items: flex-start;
                        padding: 12px !important;
                        gap: 0;
                    }
                    .ap-td { padding: 0 !important; }
                    .ap-td-check { flex-shrink: 0; padding-top: 6px !important; }
                    .ap-td-cand { flex: 1; min-width: 0; padding-left: 10px !important; }
                    .ap-td-job { width: 100%; padding-left: 51px !important; margin-top: 2px; }
                    .ap-td-cv { display: none !important; }
                    .ap-td-time { display: none !important; }
                    .ap-td-status { padding-left: 51px !important; margin-top: 8px; }
                    .ap-td-actions { margin-left: auto; margin-top: 8px; }
                }
            `}</style>
            {detailItem && (
                <DetailModal
                    item={detailItem}
                    onClose={() => setDetailItem(null)}
                    onStatusChange={handleStatusChange}
                    onModalStatus={openStatusModal}
                />
            )}

            {offerItem && (
                <OfferEmailModal
                    application={offerItem}
                    companyName={companyName}
                    logoUrl={logoUrl}
                    onClose={() => setOfferItem(null)}
                    onConfirm={handleOfferConfirm}
                />
            )}

            {rejectItem && (
                <RejectedEmailModal
                    application={rejectItem}
                    companyName={companyName}
                    logoUrl={logoUrl}
                    onClose={() => setRejectItem(null)}
                    onConfirm={handleRejectConfirm}
                />
            )}

            {interviewItem && (
                <InterviewEmailModal
                    applications={[interviewItem]}
                    companyName={companyName}
                    logoUrl={logoUrl}
                    companyAddress={companyAddress}
                    onClose={() => setInterviewItem(null)}
                    onConfirm={handleInterviewConfirm}
                />
            )}

            {bulkModalOpen && selectedIds.size > 0 && (
                <InterviewEmailModal
                    applications={items.filter(i => selectedIds.has(i.id))}
                    companyName={companyName}
                    logoUrl={logoUrl}
                    companyAddress={companyAddress}
                    onClose={() => setBulkModalOpen(false)}
                    onConfirm={handleInterviewConfirm}
                />
            )}

            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>
                        Hồ sơ ứng viên
                    </h1>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {total > 0 ? `${total} đơn ứng tuyển` : 'Chưa có đơn ứng tuyển'}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                    <select
                        value={jobFilter}
                        onChange={e => { setJobFilter(e.target.value); setPage(1); }}
                        style={{ padding: '8px 32px 8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#374151', background: 'white', appearance: 'none', cursor: 'pointer', outline: 'none', minWidth: '180px' }}
                    >
                        <option value="">Tất cả vị trí</option>
                        {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                </div>

                <div style={{ position: 'relative' }}>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        style={{ padding: '8px 32px 8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#374151', background: 'white', appearance: 'none', cursor: 'pointer', outline: 'none', minWidth: '160px' }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
                </div>
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', marginBottom: '10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#374151' }}>
                        Đã chọn <strong>{selectedIds.size}</strong> ứng viên
                    </span>
                    <button
                        onClick={() => setBulkModalOpen(true)}
                        style={{ padding: '6px 16px', background: GREEN, color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        Mời phỏng vấn ({selectedIds.size})
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        style={{ padding: '6px 14px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
                    >
                        Bỏ chọn
                    </button>
                </div>
            )}

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr className="ap-thead">
                                <th style={{ ...thStyle, width: '36px', padding: '10px 8px 10px 16px' }}>
                                    <input type="checkbox" checked={allChecked}
                                        ref={el => { if (el) el.indeterminate = someChecked; }}
                                        onChange={() => setSelectedIds(allChecked ? new Set() : new Set(items.map(i => i.id)))}
                                        style={{ width: '15px', height: '15px', accentColor: GREEN, cursor: 'pointer' }} />
                                </th>
                                <th style={thStyle}>Ứng viên</th>
                                <th style={thStyle}>Vị trí</th>
                                <th style={thStyle}>CV</th>
                                <th style={thStyle}>Thời gian</th>
                                <th style={thStyle}>Trạng thái</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ padding: '60px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                                            <ClipboardList size={40} color="#d1d5db" />
                                        </div>
                                        <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 4px' }}>
                                            Chưa có hồ sơ ứng viên
                                        </p>
                                        <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                                            Ứng viên sẽ hiển thị tại đây khi họ nộp hồ sơ
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                items.map(item => (
                                    <ApplicationRow
                                        key={item.id}
                                        item={item}
                                        selected={selectedIds.has(item.id)}
                                        onToggleSelect={id => setSelectedIds(prev => {
                                            const next = new Set(prev);
                                            next.has(id) ? next.delete(id) : next.add(id);
                                            return next;
                                        })}
                                        onStatusChange={handleStatusChange}
                                        onViewDetail={setDetailItem}
                                        onModalStatus={openStatusModal}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', padding: '16px', borderTop: '1px solid #f3f4f6' }}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setPage(p)}
                                style={{
                                    width: '32px', height: '32px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                                    border: p === page ? `2px solid ${GREEN}` : '1px solid #e5e7eb',
                                    background: p === page ? '#f0fdf4' : 'white',
                                    color: p === page ? GREEN : '#374151',
                                    fontWeight: p === page ? '700' : '400',
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
