'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Eye, ClipboardList, CheckCircle, RotateCcw, MessageSquare, Video, Copy, X, Calendar, LayoutList, LayoutGrid, GripVertical } from 'lucide-react';
import { DndContext, DragOverlay, useDroppable, useDraggable, rectIntersection, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { applicationsService } from '@/services/applications.service';
import { chatgioService as chatService } from '@/services/chat.service';
import { employerDashboardService } from '@/services/employer-dashboard.service';
import { meetingsService } from '@/services/meetings.service';
import useAuthStore from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import RatingDialog from '@/components/RatingDialog';

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
        <div className="relative inline-block">
            <button
                ref={btnRef}
                onClick={handleOpen}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1 pr-2.5 cursor-pointer whitespace-nowrap border"
                style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border, opacity: loading ? 0.7 : 1 }}
            >
                {cfg.label}
                <ChevronDown size={12} />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
                    <div
                        className="fixed z-[9999] bg-white rounded-[10px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] border border-slate-200 overflow-hidden min-w-[160px]"
                        style={{ top: pos.top, right: pos.right }}
                    >
                        {STATUS_OPTIONS.map(s => {
                            const c = STATUS_CONFIG[s];
                            return (
                                <button key={s} onClick={() => handleSelect(s)}
                                    className="block w-full text-left px-3.5 py-2.5 border-none cursor-pointer text-[13px] transition-colors"
                                    style={{
                                        color: c.color,
                                        fontWeight: s === current ? '700' : '400',
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

// ─── Shared modal field styles ─────────────────────────────────────────────────
const modalField = {
    width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb',
    borderRadius: '6px', fontSize: '13px', outline: 'none',
    fontFamily: 'inherit', color: '#374151', background: 'white', boxSizing: 'border-box',
};
const modalLabel = { display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '5px' };

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
        isBulk ? `[${companyName}] Thư mời phỏng vấn` : `[${companyName}] Thư mời phỏng vấn vị trí ${jobTitle}`
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
            await onConfirm({ sendEmail, interviewDate, interviewTime, interviewLocation, interviewType, interviewNote, emailSubject: sendEmail ? emailSubject : undefined, emailBodyTemplate: sendEmail ? emailBody : undefined });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-[900px] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        {logoUrl
                            ? <img src={logoUrl} alt={companyName} className="w-[34px] h-[34px] rounded-md object-contain border border-slate-200 bg-slate-50 p-0.5" />
                            : <div className="w-[34px] h-[34px] rounded-md bg-slate-700 flex items-center justify-center text-white font-bold text-[15px] shrink-0">{(companyName[0] || 'C').toUpperCase()}</div>
                        }
                        <div>
                            <div className="text-sm font-bold text-slate-900">Thư mời phỏng vấn</div>
                            <div className="text-xs text-slate-500">{companyName}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 text-[22px] leading-none px-1.5 py-1">×</button>
                </div>

                {/* To / Subject */}
                <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500 w-[50px] shrink-0">Gửi đến</span>
                        {isBulk ? (
                            <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-300 rounded-md px-2.5 py-0.5">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: GREEN }}>{applications.length}</div>
                                <span className="text-[13px] font-semibold text-slate-700">{applications.length} ứng viên đã chọn</span>
                            </div>
                        ) : (
                            <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-300 rounded-md px-2.5 py-0.5">
                                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: GREEN }}>{firstCandidateName[0]?.toUpperCase()}</div>
                                <span className="text-[13px] font-semibold text-slate-700">{firstCandidateName}</span>
                                <span className="text-xs text-slate-500">{'<'}{firstCandidate.email}{'>'}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-[50px] shrink-0">Tiêu đề</span>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md text-[13px] outline-none text-slate-700 bg-white" />
                    </div>
                </div>

                {/* Two-column body */}
                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Left: interview form */}
                    <div className="w-[280px] shrink-0 border-r border-slate-200 p-4 overflow-y-auto">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3.5">Chi tiết buổi phỏng vấn</div>
                        <div className="mb-3">
                            <label style={modalLabel}>Ngày phỏng vấn</label>
                            <input type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} style={modalField} />
                        </div>
                        <div className="mb-3">
                            <label style={modalLabel}>Giờ bắt đầu</label>
                            <input type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} style={modalField} />
                        </div>
                        <div className="mb-3">
                            <label style={modalLabel}>Hình thức</label>
                            <select value={interviewType} onChange={e => setInterviewType(e.target.value)} style={{ ...modalField, cursor: 'pointer' }}>
                                <option value="direct">Trực tiếp tại văn phòng</option>
                                <option value="online">Online (Zoom / Google Meet)</option>
                                <option value="phone">Qua điện thoại</option>
                            </select>
                        </div>
                        <div className="mb-3">
                            <label style={modalLabel}>Địa điểm</label>
                            <input type="text" value={interviewLocation} onChange={e => setInterviewLocation(e.target.value)}
                                placeholder="Tầng 5, 123 Nguyễn Huệ, Q.1..." style={modalField} />
                        </div>
                        <div className="mb-3">
                            <label style={modalLabel}>Ghi chú <span className="font-normal text-slate-400">(tùy chọn)</span></label>
                            <textarea value={interviewNote} onChange={e => setInterviewNote(e.target.value)}
                                placeholder="Vui lòng mang theo CCCD, CV bản cứng..."
                                rows={3} style={{ ...modalField, resize: 'vertical' }} />
                        </div>
                        <div className="mt-1 px-3 py-2.5 bg-green-50 rounded-md text-xs text-green-700 flex items-start gap-1.5">
                            <CheckCircle size={13} className="shrink-0 mt-0.5" />
                            <span>Thông báo realtime sẽ tự động gửi khi xác nhận.</span>
                        </div>
                    </div>

                    {/* Right: email body editor */}
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                Nội dung email {isBulk && <span className="text-amber-600 normal-case tracking-normal font-normal">— [Tên ứng viên] sẽ được thay tự động</span>}
                            </div>
                            {isBodyCustomized && (
                                <button onClick={resetBody} className="flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer p-0" style={{ color: GREEN }}>
                                    <RotateCcw size={11} /> Hoàn tác về mẫu
                                </button>
                            )}
                        </div>
                        <textarea
                            value={emailBody}
                            onChange={handleBodyChange}
                            spellCheck={false}
                            style={{
                                flex: 1, padding: '14px',
                                border: `1px solid ${isBodyCustomized ? '#fbbf24' : '#e5e7eb'}`,
                                borderRadius: '8px', fontSize: '13px', lineHeight: '1.8',
                                resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#374151',
                                background: isBodyCustomized ? '#fffdf0' : 'white',
                                transition: 'border-color 0.15s',
                            }}
                        />
                        <div className="mt-1 text-[11px]" style={{ color: isBodyCustomized ? '#d97706' : '#9ca3af' }}>
                            {isBodyCustomized ? 'Nội dung tùy chỉnh — thay đổi trên form không tự cập nhật' : 'Tự động cập nhật khi điền thông tin bên trái'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
                        <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                            style={{ width: '15px', height: '15px', accentColor: GREEN }} />
                        {isBulk
                            ? `Gửi email thông báo đến ${applications.length} ứng viên`
                            : <><span>Gửi email thông báo đến</span> <strong className="ml-0.5">{firstCandidate.email}</strong></>
                        }
                    </label>
                    <div className="flex gap-2">
                        <button onClick={onClose}
                            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-[13px] cursor-pointer text-slate-700 font-medium">
                            Hủy
                        </button>
                        <button onClick={handleConfirm} disabled={loading}
                            className="px-5 py-2 text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                            style={{ background: GREEN }}>
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
            await onConfirm({ sendEmail, offerSalary, offerStartDate, offerProbation, offerNote, emailSubject: sendEmail ? emailSubject : undefined, emailBody: sendEmail ? emailBody : undefined });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-[860px] max-h-[92vh] flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        {logoUrl
                            ? <img src={logoUrl} alt={companyName} className="w-[34px] h-[34px] rounded-md object-contain border border-slate-200 p-0.5" />
                            : <div className="w-[34px] h-[34px] rounded-md bg-slate-700 flex items-center justify-center text-white font-bold text-[15px]">{(companyName[0] || 'C').toUpperCase()}</div>
                        }
                        <div>
                            <div className="text-sm font-bold text-slate-900">Thư mời nhận việc (Offer Letter)</div>
                            <div className="text-xs text-slate-500">{companyName}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 text-[22px] leading-none px-1.5 py-1">×</button>
                </div>

                {/* To / Subject */}
                <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500 w-[50px] shrink-0">Gửi đến</span>
                        <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-300 rounded-md px-2.5 py-0.5">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: GREEN }}>{candidateName[0]?.toUpperCase()}</div>
                            <span className="text-[13px] font-semibold text-slate-700">{candidateName}</span>
                            <span className="text-xs text-slate-500">{'<'}{candidate.email}{'>'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-[50px] shrink-0">Tiêu đề</span>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md text-[13px] outline-none text-slate-700 bg-white" />
                    </div>
                </div>

                {/* Two-column */}
                <div className="flex flex-1 overflow-hidden min-h-0">
                    {/* Left: offer details */}
                    <div className="w-[270px] shrink-0 border-r border-slate-200 p-4 overflow-y-auto">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3.5">Thông tin offer</div>
                        <div className="mb-3">
                            <label style={modalLabel}>Mức lương</label>
                            <input type="text" value={offerSalary} onChange={e => setOfferSalary(e.target.value)}
                                placeholder="VD: 18.000.000 VNĐ/tháng" style={modalField} />
                        </div>
                        <div className="mb-3">
                            <label style={modalLabel}>Ngày bắt đầu làm việc</label>
                            <input type="date" value={offerStartDate} onChange={e => setOfferStartDate(e.target.value)} style={modalField} />
                        </div>
                        <div className="mb-3">
                            <label style={modalLabel}>Thời gian thử việc <span className="font-normal text-slate-400">(tùy chọn)</span></label>
                            <input type="text" value={offerProbation} onChange={e => setOfferProbation(e.target.value)}
                                placeholder="VD: 2 tháng, hưởng 80% lương" style={modalField} />
                        </div>
                        <div className="mb-3">
                            <label style={modalLabel}>Ghi chú <span className="font-normal text-slate-400">(tùy chọn)</span></label>
                            <textarea value={offerNote} onChange={e => setOfferNote(e.target.value)}
                                placeholder="Thông tin thêm về phúc lợi, quy định..."
                                rows={3} style={{ ...modalField, resize: 'vertical' }} />
                        </div>
                        <div className="px-3 py-2.5 bg-green-50 rounded-md text-xs text-green-700 flex items-start gap-1.5">
                            <CheckCircle size={13} className="shrink-0 mt-0.5" />
                            <span>Thông báo realtime sẽ tự động gửi khi xác nhận.</span>
                        </div>
                    </div>
                    {/* Right: email body */}
                    <div className="flex-1 flex flex-col p-4 overflow-hidden">
                        <div className="flex justify-between items-center mb-2">
                            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nội dung email</div>
                            {isBodyCustomized && (
                                <button onClick={resetBody} className="flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer p-0" style={{ color: GREEN }}>
                                    <RotateCcw size={11} /> Hoàn tác về mẫu
                                </button>
                            )}
                        </div>
                        <textarea value={emailBody}
                            onChange={e => { setEmailBody(e.target.value); if (!dirtyRef.current) { dirtyRef.current = true; setIsBodyCustomized(true); } }}
                            spellCheck={false}
                            style={{
                                flex: 1, padding: '14px',
                                border: `1px solid ${isBodyCustomized ? '#fbbf24' : '#e5e7eb'}`,
                                borderRadius: '8px', fontSize: '13px', lineHeight: '1.8',
                                resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#374151',
                                background: isBodyCustomized ? '#fffdf0' : 'white',
                                transition: 'border-color 0.15s',
                            }} />
                        <div className="mt-1 text-[11px]" style={{ color: isBodyCustomized ? '#d97706' : '#9ca3af' }}>
                            {isBodyCustomized ? 'Nội dung tùy chỉnh — thay đổi form sẽ không tự cập nhật' : 'Tự động cập nhật khi điền thông tin bên trái'}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
                        <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                            style={{ width: '15px', height: '15px', accentColor: GREEN }} />
                        Gửi email thông báo đến <strong className="ml-0.5">{candidate.email}</strong>
                    </label>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-[13px] cursor-pointer text-slate-700 font-medium">Hủy</button>
                        <button onClick={handleConfirm} disabled={loading}
                            className="px-5 py-2 text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer disabled:opacity-70"
                            style={{ background: GREEN }}>
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
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-[600px] max-h-[88vh] flex flex-col overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        {logoUrl
                            ? <img src={logoUrl} alt={companyName} className="w-8 h-8 rounded-md object-contain border border-slate-200 p-0.5" />
                            : <div className="w-8 h-8 rounded-md bg-slate-700 flex items-center justify-center text-white font-bold text-sm">{(companyName[0] || 'C').toUpperCase()}</div>
                        }
                        <div>
                            <div className="text-sm font-bold text-slate-900">Thông báo kết quả ứng tuyển</div>
                            <div className="text-xs text-slate-500">{companyName}</div>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 text-[22px] leading-none px-1.5 py-1">×</button>
                </div>

                {/* To / Subject */}
                <div className="px-5 py-2.5 border-b border-slate-200 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-500 w-[50px] shrink-0">Gửi đến</span>
                        <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-md px-2.5 py-0.5">
                            <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-bold">{candidateName[0]?.toUpperCase()}</div>
                            <span className="text-[13px] font-semibold text-slate-700">{candidateName}</span>
                            <span className="text-xs text-slate-500">{'<'}{candidate.email}{'>'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 w-[50px] shrink-0">Tiêu đề</span>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                            className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-md text-[13px] outline-none text-slate-700 bg-white" />
                    </div>
                </div>

                {/* Email body */}
                <div className="flex-1 flex flex-col p-4 overflow-hidden">
                    <div className="flex justify-between items-center mb-2">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nội dung email</div>
                        {isBodyCustomized && (
                            <button
                                onClick={() => { dirtyRef.current = false; setIsBodyCustomized(false); setEmailBody(buildRejectionTemplate({ candidateName, jobTitle, companyName })); }}
                                className="flex items-center gap-1 text-xs bg-transparent border-none cursor-pointer p-0"
                                style={{ color: GREEN }}
                            >
                                <RotateCcw size={11} /> Hoàn tác về mẫu
                            </button>
                        )}
                    </div>
                    <textarea value={emailBody}
                        onChange={e => { setEmailBody(e.target.value); if (!dirtyRef.current) { dirtyRef.current = true; setIsBodyCustomized(true); } }}
                        spellCheck={false}
                        style={{
                            flex: 1, padding: '14px',
                            border: `1px solid ${isBodyCustomized ? '#fbbf24' : '#e5e7eb'}`,
                            borderRadius: '8px', fontSize: '13px', lineHeight: '1.8',
                            resize: 'none', outline: 'none', fontFamily: 'inherit', color: '#374151',
                            background: isBodyCustomized ? '#fffdf0' : 'white',
                            transition: 'border-color 0.15s',
                        }} />
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
                    <label className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
                        <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)}
                            style={{ width: '15px', height: '15px', accentColor: GREEN }} />
                        Gửi email thông báo đến <strong className="ml-0.5">{candidate.email}</strong>
                    </label>
                    <div className="flex gap-2">
                        <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-[13px] cursor-pointer text-slate-700 font-medium">Hủy</button>
                        <button onClick={handleConfirm} disabled={loading}
                            className="px-5 py-2 text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer disabled:opacity-70 bg-red-600">
                            {loading ? 'Đang xử lý...' : (sendEmail ? 'Xác nhận & Gửi email' : 'Xác nhận')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Create Meeting Modal ─────────────────────────────────────────────────────
function CreateMeetingModal({ application, onClose }) {
    const [title, setTitle] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [creating, setCreating] = useState(false);
    const [result, setResult] = useState(null);

    const candidate = application.candidate || {};
    const profile = candidate.candidateProfile || {};
    const candidateName = profile.fullName || candidate.email || 'Ứng viên';

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await meetingsService.create({
                candidateId: application.candidateId,
                applicationId: application.id,
                title: title.trim() || `Phỏng vấn: ${application.job?.title || ''}`,
                scheduledAt: scheduledAt || undefined,
            });
            setResult(res.data?.data);
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Không thể tạo phòng họp');
        } finally {
            setCreating(false);
        }
    };

    const copyLink = () => {
        if (!result) return;
        navigator.clipboard.writeText(`${window.location.origin}/meet/${result.roomCode}`);
        toast.success('Đã sao chép link');
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-[460px] shadow-[0_8px_32px_rgba(0,0,0,0.18)] overflow-hidden"
                onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                            <Video size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Tạo cuộc họp video</p>
                            <p className="text-xs text-slate-500">Với {candidateName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 text-xl leading-none">×</button>
                </div>

                <div className="px-5 py-5">
                    {result ? (
                        /* Success state */
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                                <CheckCircle size={28} className="text-green-500" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 mb-1">Phòng họp đã được tạo!</p>
                                <p className="text-sm text-slate-500">Đã gửi thông báo đến {candidateName}</p>
                            </div>

                            {/* Room code display */}
                            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <p className="text-xs text-slate-500 mb-2 font-semibold">Mã phòng họp</p>
                                <p className="text-2xl font-mono font-bold tracking-widest text-slate-900 mb-3">{result.roomCode}</p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={copyLink}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <Copy size={13} /> Sao chép link
                                    </button>
                                    <a
                                        href={`/meet/${result.roomCode}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border-none text-[13px] font-bold text-white cursor-pointer no-underline"
                                        style={{ background: GREEN }}
                                    >
                                        <Video size={13} /> Vào phòng họp
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Create form */
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Tiêu đề cuộc họp <span className="font-normal text-slate-400">(tùy chọn)</span>
                                </label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder={`Phỏng vấn: ${application.job?.title || 'vị trí tuyển dụng'}`}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none box-border"
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    <Calendar size={11} className="inline mr-1" />
                                    Thời gian dự kiến <span className="font-normal text-slate-400">(tùy chọn)</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] text-slate-700 outline-none box-border"
                                    style={{ fontFamily: 'inherit' }}
                                />
                            </div>
                            <div className="bg-blue-50 rounded-lg px-3.5 py-2.5 text-xs text-blue-700 border border-blue-100">
                                Thông báo sẽ tự động gửi đến <strong>{candidateName}</strong> khi tạo phòng.
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={onClose}
                                    className="flex-1 py-2.5 border border-slate-200 rounded-lg bg-white text-[13px] cursor-pointer text-slate-700 font-medium">
                                    Hủy
                                </button>
                                <button onClick={handleCreate} disabled={creating}
                                    className="flex-[2] py-2.5 border-none rounded-lg text-white text-[13px] font-bold cursor-pointer disabled:opacity-60"
                                    style={{ background: GREEN }}>
                                    {creating ? 'Đang tạo...' : 'Tạo phòng họp'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Kanban Components ───────────────────────────────────────────────────────

function KanbanCard({ item, onViewDetail, onCreateMeeting, openChat }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
    const candidate = item.candidate || {};
    const profile = candidate.candidateProfile || {};
    const displayName = profile.fullName || candidate.email || '?';
    const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Translate.toString(transform),
                opacity: isDragging ? 0.2 : 1,
                boxShadow: '0 1px 2px rgba(9,30,66,.25), 0 0 0 1px rgba(9,30,66,.08)',
            }}
            className="bg-white rounded select-none relative group cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
        >
            <div className="px-3 pt-3 pb-2.5">
                {/* Name + email */}
                <div className="text-[13px] font-semibold text-[#172b4d] leading-snug mb-0.5">
                    {displayName}
                </div>
                <div className="text-[11px] text-slate-400 mb-2 truncate">{candidate.email}</div>

                {/* Job badge — solid fill, white text, Jira style */}
                <div className="mb-3">
                    <span className="text-[11px] font-bold text-white px-1.5 py-0.5 rounded-sm leading-none"
                        style={{ background: cfg.color }}>
                        {item.job?.title || '—'}
                    </span>
                </div>

                {/* Bottom row */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#5e6c84] flex-1">{timeAgo(item.createdAt)}</span>

                    {/* CV badge */}
                    {(item.resume || item.cvFileUrl) && (
                        <a
                            href={item.resume ? `/xem-cv/${item.resume.id}` : item.cvFileUrl}
                            target="_blank" rel="noopener noreferrer"
                            onPointerDown={e => e.stopPropagation()}
                            className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-sm no-underline hover:bg-blue-100 transition-colors"
                        >
                            CV
                        </a>
                    )}

                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold overflow-hidden"
                        style={{ background: cfg.bg, color: cfg.color }}>
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : displayName[0].toUpperCase()
                        }
                    </div>
                </div>
            </div>

            {/* Hover actions — top right, like Jira's hover menu */}
            <div
                className="absolute top-2 right-2 hidden group-hover:flex items-center gap-0.5 bg-white rounded border border-slate-200 shadow-sm px-0.5 py-0.5"
                onPointerDown={e => e.stopPropagation()}
            >
                <button onClick={() => onViewDetail(item)} title="Chi tiết"
                    className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <Eye size={13} />
                </button>
                <button onClick={() => openChat(item)} title="Nhắn tin"
                    className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                    <MessageSquare size={13} />
                </button>
                <button onClick={() => onCreateMeeting(item)} title="Video"
                    className="w-7 h-7 flex items-center justify-center rounded bg-transparent border-none cursor-pointer text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                    <Video size={13} />
                </button>
            </div>
        </div>
    );
}

function KanbanColumn({ status, items, onViewDetail, onCreateMeeting, openChat }) {
    const { setNodeRef, isOver } = useDroppable({ id: status });
    const cfg = STATUS_CONFIG[status];

    return (
        <div className="flex flex-col shrink-0" style={{ width: 260 }}>
            {/* Column header — Jira style: "TO DO 6" */}
            <div className="flex items-center gap-2 mb-2 px-1 py-1">
                <span className="text-[11.5px] font-bold text-[#5e6c84] uppercase tracking-wider">{cfg.label}</span>
                <span className="text-[11.5px] font-bold text-[#5e6c84]">{items.length}</span>
            </div>

            {/* Drop area */}
            <div
                ref={setNodeRef}
                className="flex-1 rounded-[3px] p-1.5 space-y-1.5 min-h-[520px] transition-colors duration-100"
                style={{ background: isOver ? '#e8edff' : '#f4f5f7' }}
            >
                {items.map(item => (
                    <KanbanCard
                        key={item.id}
                        item={item}
                        onViewDetail={onViewDetail}
                        onCreateMeeting={onCreateMeeting}
                        openChat={openChat}
                    />
                ))}
                {items.length === 0 && isOver && (
                    <div className="h-20 rounded border-2 border-dashed border-blue-300 flex items-center justify-center text-[12px] text-blue-400">
                        Thả vào đây
                    </div>
                )}
            </div>
        </div>
    );
}

function KanbanBoard({ items, onStatusChange, onModalStatus, onViewDetail, onCreateMeeting, openChat }) {
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
    const [activeItem, setActiveItem] = useState(null);

    const grouped = STATUS_OPTIONS.reduce((acc, s) => {
        acc[s] = items.filter(i => i.status === s);
        return acc;
    }, {});

    const handleDragStart = ({ active }) => {
        setActiveItem(items.find(i => i.id === active.id) || null);
    };

    const handleDragEnd = ({ active, over }) => {
        setActiveItem(null);
        if (!over) return;
        const draggedItem = items.find(i => i.id === active.id);
        if (!draggedItem) return;
        const targetStatus = over.id;
        if (!STATUS_OPTIONS.includes(targetStatus) || draggedItem.status === targetStatus) return;

        if (['INTERVIEW', 'OFFERED', 'REJECTED'].includes(targetStatus)) {
            onModalStatus(draggedItem, targetStatus);
        } else {
            onStatusChange(draggedItem.id, targetStatus);
            applicationsService.updateStatus(draggedItem.id, { status: targetStatus }).catch(() => {
                onStatusChange(draggedItem.id, draggedItem.status);
                toast.error('Cập nhật thất bại');
            });
        }
    };

    const activeDisplayName = activeItem
        ? (activeItem.candidate?.candidateProfile?.fullName || activeItem.candidate?.email || '?')
        : '';

    return (
        <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
                {STATUS_OPTIONS.map(status => (
                    <KanbanColumn
                        key={status}
                        status={status}
                        items={grouped[status] || []}
                        onViewDetail={onViewDetail}
                        onCreateMeeting={onCreateMeeting}
                        openChat={openChat}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
                {activeItem ? (
                    <div className="bg-white rounded-xl border border-slate-300 shadow-2xl p-3 w-[248px] opacity-95 rotate-1">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-green-50 text-sm font-bold overflow-hidden" style={{ color: GREEN }}>
                                {activeItem.candidate?.candidateProfile?.avatarUrl
                                    ? <img src={activeItem.candidate.candidateProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    : activeDisplayName[0]?.toUpperCase()
                                }
                            </div>
                            <div className="min-w-0">
                                <div className="text-[13px] font-bold text-slate-900 truncate">{activeDisplayName}</div>
                                <div className="text-[12px] text-slate-500 truncate">{activeItem.job?.title}</div>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// ─── Application Row ──────────────────────────────────────────────────────────
function ApplicationRow({ item, selected, onToggleSelect, onStatusChange, onViewDetail, onModalStatus, onCreateMeeting, openChat }) {
    const candidate = item.candidate || {};
    const profile = candidate.candidateProfile || {};
    const job = item.job || {};
    const displayName = profile.fullName || candidate.email || '?';

    return (
        <tr
            className="ap-tr border-b border-slate-100"
            style={{ background: selected ? '#f0fdf4' : 'white' }}
            onMouseEnter={e => { if (!selected) e.currentTarget.style.background = '#fafafa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = selected ? '#f0fdf4' : 'white'; }}
        >
            {/* Checkbox */}
            <td className="ap-td ap-td-check px-2 py-3 pl-4 w-9">
                <input type="checkbox" checked={selected} onChange={() => onToggleSelect(item.id)}
                    style={{ width: '15px', height: '15px', accentColor: GREEN, cursor: 'pointer' }} />
            </td>
            {/* Candidate */}
            <td className="ap-td ap-td-cand px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center bg-green-50 text-sm font-bold overflow-hidden" style={{ color: GREEN }}>
                        {profile.avatarUrl
                            ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : displayName[0].toUpperCase()
                        }
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-slate-900">{displayName}</div>
                        <div className="text-xs text-slate-500">{candidate.email}</div>
                        {candidate.phone && <div className="text-xs text-slate-500">{candidate.phone}</div>}
                    </div>
                </div>
            </td>
            {/* Job */}
            <td className="ap-td ap-td-job px-4 py-3">
                <div className="text-[13px] font-semibold text-slate-700 mb-0.5">{job.title}</div>
                {item.location && (
                    <div className="text-xs text-slate-500">
                        {[item.location?.districtName, item.location?.provinceName].filter(Boolean).join(', ')}
                    </div>
                )}
            </td>
            {/* CV */}
            <td className="ap-td ap-td-cv px-4 py-3">
                {item.resume ? (
                    <a href={`/xem-cv/${item.resume.id}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 no-underline font-medium hover:underline">
                        {item.resume.title}
                    </a>
                ) : item.cvFileUrl ? (
                    <a href={item.cvFileUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-600 no-underline font-medium hover:underline">
                        Xem file CV
                    </a>
                ) : (
                    <span className="text-xs text-slate-400">—</span>
                )}
            </td>
            {/* Applied at */}
            <td className="ap-td ap-td-time px-4 py-3">
                <span className="text-xs text-slate-500">{timeAgo(item.createdAt)}</span>
            </td>
            {/* Status */}
            <td className="ap-td ap-td-status px-4 py-3">
                <StatusDropdown
                    current={item.status}
                    applicationId={item.id}
                    onUpdate={onStatusChange}
                    onModalStatus={(status) => onModalStatus(item, status)}
                />
            </td>
            {/* Actions */}
            <td className="ap-td ap-td-actions px-4 py-3 text-center">
                <div className="flex gap-1 justify-center">
                    <button
                        onClick={() => onViewDetail(item)}
                        title="Xem chi tiết"
                        className="bg-transparent border-none cursor-pointer text-slate-400 p-1 hover:text-green-600 transition-colors"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => openChat(item)}
                        title="Nhắn tin"
                        className="bg-transparent border-none cursor-pointer text-slate-400 p-1 hover:text-green-600 transition-colors"
                    >
                        <MessageSquare size={16} />
                    </button>
                    <button
                        onClick={() => onCreateMeeting(item)}
                        title="Tạo cuộc họp video"
                        className="bg-transparent border-none cursor-pointer text-slate-400 p-1 hover:text-blue-600 transition-colors"
                    >
                        <Video size={16} />
                    </button>
                </div>
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
            className="fixed inset-0 z-[1000] bg-black/50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-[540px] max-h-[90vh] overflow-auto shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <div className="text-base font-bold text-slate-900">Chi tiết ứng viên</div>
                    <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 text-xl">×</button>
                </div>
                <div className="px-6 py-5">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-[52px] h-[52px] rounded-full bg-green-50 flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden" style={{ color: GREEN }}>
                            {profile.avatarUrl
                                ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                                : displayName[0].toUpperCase()
                            }
                        </div>
                        <div>
                            <div className="text-base font-bold text-slate-900">{displayName}</div>
                            <div className="text-[13px] text-slate-500">{candidate.email}</div>
                            {candidate.phone && <div className="text-[13px] text-slate-500">{candidate.phone}</div>}
                        </div>
                    </div>

                    {/* Position */}
                    <div className="bg-slate-50 rounded-lg px-3.5 py-3 mb-4">
                        <div className="text-xs text-slate-400 mb-1">Vị trí ứng tuyển</div>
                        <div className="text-sm font-semibold text-slate-900">{job.title}</div>
                    </div>

                    {/* CV links */}
                    {(item.resume || item.cvFileUrl) && (
                        <div className="mb-4">
                            <div className="text-[13px] font-semibold text-slate-700 mb-2">Hồ sơ CV</div>
                            <div className="flex gap-2 flex-wrap">
                                {item.resume && (
                                    <a href={`/xem-cv/${item.resume.id}`} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-50 border border-blue-200 text-[13px] font-semibold text-blue-700 no-underline">
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                        {item.resume.title || 'CV Online'}
                                    </a>
                                )}
                                {item.cvFileUrl && (
                                    <a href={item.cvFileUrl} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-50 border border-amber-200 text-[13px] font-semibold text-amber-600 no-underline">
                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                        CV file đính kèm
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {item.coverLetterFileUrl && (
                        <div className="mb-4">
                            <div className="text-[13px] font-semibold text-slate-700 mb-2">Cover Letter đính kèm (file)</div>
                            <a href={item.coverLetterFileUrl} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-green-50 border border-green-300 text-[13px] font-semibold text-green-700 no-underline">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                                Xem file Cover Letter
                            </a>
                        </div>
                    )}

                    {item.coverLetterDoc && (
                        <div className="mb-4">
                            <div className="text-[13px] font-semibold text-slate-700 mb-2">Cover Letter đính kèm</div>
                            <a href={`/xem-cover-letter/${item.coverLetterDoc.id}`} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-green-50 border border-green-300 text-[13px] font-semibold text-green-700 no-underline">
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.8"/><path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8"/></svg>
                                {item.coverLetterDoc.title || 'Cover Letter'}
                            </a>
                        </div>
                    )}

                    {/* Status update */}
                    <div className="mb-4">
                        <div className="text-[13px] font-semibold text-slate-700 mb-1.5">Cập nhật trạng thái</div>
                        <StatusDropdown
                            current={item.status}
                            applicationId={item.id}
                            onUpdate={(id, s) => { onStatusChange(id, s); item.status = s; }}
                            onModalStatus={onModalStatus ? (status) => { onClose(); onModalStatus(item, status); } : undefined}
                        />
                    </div>

                    {/* Cover letter text */}
                    {item.coverLetter && (
                        <div className="mb-4">
                            <div className="text-[13px] font-semibold text-slate-700 mb-1.5">Thư giới thiệu</div>
                            <div className="px-3 py-2.5 bg-slate-50 rounded-lg text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {item.coverLetter}
                            </div>
                        </div>
                    )}

                    {/* Internal note */}
                    <div className="mb-5">
                        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Ghi chú nội bộ</label>
                        <textarea
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="Ghi chú về ứng viên này..."
                            rows={3}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-[13px] resize-y outline-none box-border font-inherit"
                        />
                    </div>

                    <div className="flex gap-2.5">
                        <button onClick={onClose} className="flex-1 py-2.5 border border-slate-300 rounded-lg bg-white text-[13px] cursor-pointer text-slate-700">
                            Đóng
                        </button>
                        <button onClick={saveNote} disabled={saving}
                            className="flex-[2] py-2.5 text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer disabled:opacity-70"
                            style={{ background: GREEN }}>
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
    const router = useRouter();
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
    const [meetingItem, setMeetingItem] = useState(null);
    const [ratingItem, setRatingItem] = useState(null);
    const [viewMode, setViewMode] = useState('table');
    const [kanbanItems, setKanbanItems] = useState([]);
    const [kanbanLoading, setKanbanLoading] = useState(false);

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
            .then(res => { setItems(res.data?.data || []); setTotal(res.data?.total || 0); })
            .catch(() => {})
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchApplications(); setSelectedIds(new Set()); }, [page, statusFilter, jobFilter]); // eslint-disable-line

    const openChat = useCallback(async (item) => {
        try {
            const res = await chatService.findOrCreate({ candidateUserId: item.candidateId, employerProfileId: item.job?.employerId });
            const convId = res.data?.data?.id;
            if (convId) router.push(`/nha-tuyen-dung/tin-nhan?conv=${convId}`);
        } catch {}
    }, [router]);

    const fetchKanban = useCallback(() => {
        setKanbanLoading(true);
        const params = { page: 1, limit: 500 };
        if (jobFilter) params.jobId = jobFilter;
        applicationsService.getAllByEmployer(params)
            .then(res => setKanbanItems(res.data?.data || []))
            .catch(() => {})
            .finally(() => setKanbanLoading(false));
    }, [jobFilter]);

    useEffect(() => {
        if (viewMode === 'kanban') fetchKanban();
    }, [viewMode, jobFilter]); // eslint-disable-line

    const handleStatusChange = (applicationId, newStatus) => {
        const updater = prev => prev.map(i => i.id === applicationId ? { ...i, status: newStatus } : i);
        setItems(updater);
        setKanbanItems(updater);
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
                return applicationsService.updateStatus(app.id, { status: 'INTERVIEW', sendEmail, interviewDate, interviewTime, interviewLocation, interviewType, interviewNote, emailSubject, emailBody });
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
            const saved = offerItem;
            setOfferItem(null);
            toast.success('Đã gửi Offer Letter');
            setTimeout(() => setRatingItem(saved), 400);
        } catch (e) { toast.error(e?.response?.data?.message || 'Cập nhật thất bại'); }
    };

    const handleRejectConfirm = async ({ sendEmail, emailSubject, emailBody }) => {
        if (!rejectItem) return;
        try {
            await applicationsService.updateStatus(rejectItem.id, { status: 'REJECTED', sendEmail, emailSubject, emailBody });
            handleStatusChange(rejectItem.id, 'REJECTED');
            const saved = rejectItem;
            setRejectItem(null);
            toast.success('Đã cập nhật trạng thái');
            setTimeout(() => setRatingItem(saved), 400);
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

    return (
        <div>
            <style>{`
                @media (max-width: 768px) {
                    .ap-thead { display: none; }
                    .ap-tr { display: flex !important; flex-wrap: wrap; align-items: flex-start; padding: 12px !important; gap: 0; }
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

            {/* Modals */}
            {meetingItem && (
                <CreateMeetingModal application={meetingItem} onClose={() => setMeetingItem(null)} />
            )}
            <RatingDialog
                open={!!ratingItem}
                onClose={() => setRatingItem(null)}
                applicationId={ratingItem?.id}
                type="EMPLOYER_TO_CANDIDATE"
                targetName={ratingItem?.candidate?.candidateProfile?.fullName}
            />
            {detailItem && (
                <DetailModal item={detailItem} onClose={() => setDetailItem(null)} onStatusChange={handleStatusChange} onModalStatus={openStatusModal} />
            )}
            {offerItem && (
                <OfferEmailModal application={offerItem} companyName={companyName} logoUrl={logoUrl} onClose={() => setOfferItem(null)} onConfirm={handleOfferConfirm} />
            )}
            {rejectItem && (
                <RejectedEmailModal application={rejectItem} companyName={companyName} logoUrl={logoUrl} onClose={() => setRejectItem(null)} onConfirm={handleRejectConfirm} />
            )}
            {interviewItem && (
                <InterviewEmailModal applications={[interviewItem]} companyName={companyName} logoUrl={logoUrl} companyAddress={companyAddress} onClose={() => setInterviewItem(null)} onConfirm={handleInterviewConfirm} />
            )}
            {bulkModalOpen && selectedIds.size > 0 && (
                <InterviewEmailModal applications={items.filter(i => selectedIds.has(i.id))} companyName={companyName} logoUrl={logoUrl} companyAddress={companyAddress} onClose={() => setBulkModalOpen(false)} onConfirm={handleInterviewConfirm} />
            )}

            {/* Page header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-[22px] font-extrabold text-slate-900 mb-1">Hồ sơ ứng viên</h1>
                    <p className="text-sm text-slate-500">{total > 0 ? `${total} đơn ứng tuyển` : 'Chưa có đơn ứng tuyển'}</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('table')}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer border-none',
                            viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <LayoutList size={14} /> Bảng
                    </button>
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold transition-colors cursor-pointer border-none',
                            viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700'
                        )}
                    >
                        <LayoutGrid size={14} /> Kanban
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2.5 mb-4 flex-wrap">
                <div className="relative">
                    <select
                        value={jobFilter}
                        onChange={e => { setJobFilter(e.target.value); setPage(1); }}
                        className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white appearance-none cursor-pointer outline-none min-w-[180px]"
                    >
                        <option value="">Tất cả vị trí</option>
                        {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-[13px] text-slate-700 bg-white appearance-none cursor-pointer outline-none min-w-[160px]"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
            </div>

            {/* Bulk action bar — table only */}
            {viewMode === 'table' && selectedIds.size > 0 && (
                <div className="flex items-center gap-3 px-4 py-2.5 mb-2.5 bg-green-50 border border-green-300 rounded-lg">
                    <span className="text-[13px] text-slate-700">
                        Đã chọn <strong>{selectedIds.size}</strong> ứng viên
                    </span>
                    <button
                        onClick={() => setBulkModalOpen(true)}
                        className="px-4 py-1.5 text-white border-none rounded-md text-[13px] font-semibold cursor-pointer"
                        style={{ background: GREEN }}
                    >
                        Mời phỏng vấn ({selectedIds.size})
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())}
                        className="px-3.5 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-md text-[13px] cursor-pointer hover:bg-slate-50"
                    >
                        Bỏ chọn
                    </button>
                </div>
            )}

            {/* Kanban view */}
            {viewMode === 'kanban' && (
                kanbanLoading ? (
                    <div className="py-20 text-center text-slate-400 text-sm">Đang tải...</div>
                ) : (
                    <KanbanBoard
                        items={kanbanItems}
                        onStatusChange={handleStatusChange}
                        onModalStatus={openStatusModal}
                        onViewDetail={setDetailItem}
                        onCreateMeeting={setMeetingItem}
                        openChat={openChat}
                    />
                )
            )}

            {/* Table */}
            {viewMode === 'table' && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="ap-thead">
                                    <th className="px-2 py-2.5 pl-4 w-9 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                                        <input type="checkbox" checked={allChecked}
                                            ref={el => { if (el) el.indeterminate = someChecked; }}
                                            onChange={() => setSelectedIds(allChecked ? new Set() : new Set(items.map(i => i.id)))}
                                            style={{ width: '15px', height: '15px', accentColor: GREEN, cursor: 'pointer' }} />
                                    </th>
                                    {['Ứng viên', 'Vị trí', 'CV', 'Thời gian', 'Trạng thái'].map(h => (
                                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">{h}</th>
                                    ))}
                                    <th className="px-4 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-slate-400 text-sm">Đang tải...</td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center">
                                            <ClipboardList size={40} className="text-slate-300 mx-auto mb-3" />
                                            <p className="text-[15px] font-semibold text-slate-700 mb-1">Chưa có hồ sơ ứng viên</p>
                                            <p className="text-[13px] text-slate-400">Ứng viên sẽ hiển thị tại đây khi họ nộp hồ sơ</p>
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
                                            onCreateMeeting={setMeetingItem}
                                            openChat={openChat}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center gap-1.5 p-4 border-t border-slate-100">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={cn(
                                        'w-8 h-8 rounded-md text-[13px] cursor-pointer border transition-colors',
                                        p === page
                                            ? 'font-bold'
                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    )}
                                    style={p === page ? { borderColor: GREEN, background: '#f0fdf4', color: GREEN } : {}}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
