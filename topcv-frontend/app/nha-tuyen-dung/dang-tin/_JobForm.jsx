'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, Eye, AlignLeft, PlusCircle, X, ArrowLeft, Send, MapPin, DollarSign, Briefcase, Calendar, Users, Tag, Building2, CheckCircle } from 'lucide-react';
import { employerDashboardService } from '@/services/employer-dashboard.service';
import { provinceService } from '@/services/province.service';
import { cn } from '@/lib/utils';

const GREEN = '#00b14f';

const JOB_TYPES = [
    { value: 'full-time', label: 'Toàn thời gian' },
    { value: 'part-time', label: 'Bán thời gian' },
    { value: 'remote', label: 'Remote' },
    { value: 'internship', label: 'Thực tập' },
    { value: 'contract', label: 'Hợp đồng' },
];

const WORKING_TYPES = [
    { value: 'TOAN_THOI_GIAN', label: 'Tại văn phòng' },
    { value: 'BAN_THOI_GIAN', label: 'Bán thời gian' },
    { value: 'REMOTE', label: 'Remote' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'THUC_TAP', label: 'Thực tập' },
];

const WORKING_DAYS = [
    { value: 'MON_FRI', label: 'Thứ 2 – Thứ 6' },
    { value: 'MON_SAT', label: 'Thứ 2 – Thứ 7' },
    { value: 'MON_SUN', label: 'Thứ 2 – Chủ nhật' },
    { value: 'FLEXIBLE', label: 'Linh hoạt' },
    { value: 'CUSTOM', label: 'Tùy chỉnh' },
];

const LEVELS = [
    { value: 'NHAN_VIEN', label: 'Nhân viên' },
    { value: 'TRUONG_NHOM', label: 'Trưởng nhóm' },
    { value: 'TRUONG_PHO_PHONG', label: 'Trưởng/Phó phòng' },
    { value: 'QUAN_LY_GIAM_SAT', label: 'Quản lý / Giám sát' },
    { value: 'TRUONG_CHI_NHANH', label: 'Trưởng chi nhánh' },
    { value: 'PHO_GIAM_DOC', label: 'Phó giám đốc' },
    { value: 'GIAM_DOC', label: 'Giám đốc' },
    { value: 'THUC_TAP_SINH', label: 'Thực tập sinh' },
];

const SALARY_TYPES = [
    { value: 'range', label: 'Khoảng lương (VD: 10–15 triệu)' },
    { value: 'fixed', label: 'Lương cố định' },
    { value: 'negotiable', label: 'Thỏa thuận' },
];

const EMPTY_LOC = { provinceCode: '', provinceName: '', districtCode: '', districtName: '', address: '' };

const EMPTY = {
    title: '', description: '',
    salaryType: 'range', salaryMin: '', salaryMax: '',
    locations: [{ ...EMPTY_LOC }],
    jobType: 'full-time', workingType: 'TOAN_THOI_GIAN', workingDays: 'MON_FRI', workingDaysNote: '',
    level: 'NHAN_VIEN', quantity: 1, deadline: '',
    industryId: '', jobPositionId: '', isActive: true,
};

const inputCls = 'w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 outline-none bg-white box-border';
const selectCls = cn(inputCls, 'cursor-pointer');

function renderMarkdown(md) {
    if (!md) return '';
    let s = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    s = s.replace(/```[\w]*\n?([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
    s = s.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    s = s.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    s = s.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
    s = s.replace(/~~(.+?)~~/g, '<del>$1</del>');
    s = s.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
    s = s.replace(/^- (.+)$/gm, '<li>$1</li>');
    s = s.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    s = s.replace(/((?:<li>[\s\S]*?<\/li>\n?)+)/g, '<ul>$1</ul>');
    s = s.split('\n\n').map(p => {
        p = p.trim();
        if (!p) return '';
        if (/^<(h[123]|ul|pre|blockquote)/.test(p)) return p;
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
    }).join('');
    return s;
}

function MarkdownEditor({ value, onChange }) {
    const taRef = useRef(null);
    const [showPreview, setShowPreview] = useState(false);

    const wrapSel = (pre, suf = pre) => {
        const ta = taRef.current;
        if (!ta) return;
        const { selectionStart: s, selectionEnd: e } = ta;
        const sel = value.slice(s, e);
        onChange(value.slice(0, s) + pre + sel + suf + value.slice(e));
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(s + pre.length, e + pre.length);
        });
    };

    const prependLine = (pre) => {
        const ta = taRef.current;
        if (!ta) return;
        const s = ta.selectionStart;
        const ls = value.lastIndexOf('\n', s - 1) + 1;
        onChange(value.slice(0, ls) + pre + value.slice(ls));
        requestAnimationFrame(() => {
            ta.focus();
            ta.setSelectionRange(s + pre.length, s + pre.length);
        });
    };

    const Btn = ({ onClick, title, children, active }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                'flex items-center gap-0.5 px-1.5 py-1 rounded text-[11px] font-bold text-slate-700 border-none cursor-pointer',
                active ? 'bg-slate-200' : 'bg-transparent hover:bg-slate-100'
            )}
        >
            {children}
        </button>
    );

    const Sep = () => <div className="w-px h-[18px] bg-slate-200 mx-0.5 shrink-0" />;

    return (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-0.5 flex-wrap px-2.5 py-1.5 bg-slate-50 border-b border-slate-200">
                <Btn onClick={() => prependLine('# ')} title="Tiêu đề 1">H1</Btn>
                <Btn onClick={() => prependLine('## ')} title="Tiêu đề 2">H2</Btn>
                <Btn onClick={() => prependLine('### ')} title="Tiêu đề 3">H3</Btn>
                <Sep />
                <Btn onClick={() => wrapSel('**')} title="In đậm"><Bold size={13} /></Btn>
                <Btn onClick={() => wrapSel('*')} title="In nghiêng"><Italic size={13} /></Btn>
                <Btn onClick={() => wrapSel('~~')} title="Gạch ngang"><Strikethrough size={13} /></Btn>
                <Sep />
                <Btn onClick={() => prependLine('> ')} title="Trích dẫn"><Quote size={13} /></Btn>
                <Btn onClick={() => prependLine('- ')} title="Danh sách"><List size={13} /></Btn>
                <Btn onClick={() => prependLine('1. ')} title="Danh sách số"><ListOrdered size={13} /></Btn>
                <Sep />
                <Btn onClick={() => wrapSel('`')} title="Code nội tuyến"><Code size={13} /></Btn>
                <Btn onClick={() => wrapSel('```\n', '\n```')} title="Code block"><AlignLeft size={13} /></Btn>

                <div className="ml-auto flex gap-1 border-l border-slate-200 pl-2">
                    <Btn onClick={() => setShowPreview(false)} active={!showPreview} title="Soạn thảo">Soạn thảo</Btn>
                    <Btn onClick={() => setShowPreview(true)} active={showPreview} title="Xem trước">
                        <Eye size={13} /> Xem trước
                    </Btn>
                </div>
            </div>

            {showPreview ? (
                <div
                    className="md-preview px-5 py-4 min-h-[260px] text-sm text-slate-700 leading-relaxed"
                    dangerouslySetInnerHTML={{
                        __html: renderMarkdown(value) || '<p style="color:#9ca3af">Chưa có nội dung...</p>',
                    }}
                />
            ) : (
                <textarea
                    ref={taRef}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={12}
                    placeholder={`## Mô tả công việc\n- Phát triển tính năng mới...\n\n## Yêu cầu\n- Kinh nghiệm 2+ năm...\n\n## Quyền lợi\n- Lương cạnh tranh...`}
                    className="w-full px-4 py-3 border-none outline-none resize-y min-h-[260px] box-border text-[13px] text-slate-700 leading-relaxed bg-white"
                    style={{ fontFamily: '"Fira Code", "SF Mono", Consolas, monospace' }}
                />
            )}

            <style>{`
                .md-preview h1 { font-size: 20px; font-weight: 800; margin: 16px 0 8px; color: #111827; }
                .md-preview h2 { font-size: 17px; font-weight: 700; margin: 14px 0 6px; color: #111827; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
                .md-preview h3 { font-size: 15px; font-weight: 700; margin: 12px 0 6px; color: #111827; }
                .md-preview p { margin: 8px 0; }
                .md-preview ul { padding-left: 22px; margin: 8px 0; list-style: disc; }
                .md-preview li { margin: 3px 0; }
                .md-preview code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: monospace; color: #374151; }
                .md-preview pre { background: #f3f4f6; padding: 12px 16px; border-radius: 8px; overflow-x: auto; margin: 12px 0; }
                .md-preview pre code { background: none; padding: 0; font-size: 13px; }
                .md-preview blockquote { border-left: 3px solid #d1d5db; padding: 2px 12px; color: #6b7280; margin: 8px 0; font-style: italic; }
                .md-preview strong { font-weight: 700; }
                .md-preview em { font-style: italic; }
                .md-preview del { text-decoration: line-through; color: #9ca3af; }
            `}</style>
        </div>
    );
}

function LocationRow({ loc, provinces, index, onChange, onRemove, canRemove }) {
    const [districts, setDistricts] = useState([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    useEffect(() => {
        if (!loc.provinceCode) { setDistricts([]); return; }
        setLoadingDistricts(true);
        provinceService.getDistricts(loc.provinceCode)
            .then(data => setDistricts(Array.isArray(data) ? data : data?.districts || []))
            .catch(console.error)
            .finally(() => setLoadingDistricts(false));
    }, [loc.provinceCode]);

    const handleProvince = (code) => {
        const prov = provinces.find(p => p.code === code);
        onChange({ ...loc, provinceCode: code, provinceName: prov?.name || '', districtCode: '', districtName: '' });
    };

    const handleDistrict = (code) => {
        const dist = districts.find(d => String(d.code) === code);
        onChange({ ...loc, districtCode: code, districtName: dist?.name || '' });
    };

    return (
        <div className="border border-slate-200 rounded-lg p-3 mb-2.5 bg-slate-50 relative">
            {canRemove && (
                <button type="button" onClick={onRemove} className="absolute top-2 right-2 bg-transparent border-none cursor-pointer text-slate-400 p-0.5">
                    <X size={14} />
                </button>
            )}
            <div className="grid grid-cols-2 gap-2.5 mb-2">
                <select value={loc.provinceCode || ''} onChange={e => handleProvince(e.target.value)} className={selectCls}>
                    <option value="">-- Tỉnh/Thành phố --</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                <select
                    value={loc.districtCode || ''}
                    onChange={e => handleDistrict(e.target.value)}
                    disabled={!loc.provinceCode || loadingDistricts}
                    className={cn(selectCls, !loc.provinceCode ? 'opacity-50' : '')}
                >
                    <option value="">-- Quận/Huyện --</option>
                    {districts.map(d => <option key={d.code} value={String(d.code)}>{d.name}</option>)}
                </select>
            </div>
            <input
                value={loc.address || ''}
                onChange={e => onChange({ ...loc, address: e.target.value })}
                placeholder="Địa chỉ cụ thể (tòa nhà, đường phố...)"
                className={inputCls}
            />
        </div>
    );
}

function Field({ label, required, children, hint }) {
    return (
        <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="bg-white rounded-xl px-6 py-5 border border-slate-200 mb-4">
            <h3 className="text-[15px] font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">{title}</h3>
            {children}
        </div>
    );
}

// ─── Salary format helper ─────────────────────────────────────────────────────
function fmtSalary(form) {
    if (form.salaryType === 'negotiable') return 'Thỏa thuận';
    const fmt = (v) => v ? `${(v / 1_000_000).toLocaleString('vi-VN')} triệu` : null;
    const min = fmt(form.salaryMin), max = fmt(form.salaryMax);
    if (min && max) return `${min} – ${max}`;
    return min || max || 'Thỏa thuận';
}

const JOB_TYPE_LABEL = {
    'full-time': 'Toàn thời gian', 'part-time': 'Bán thời gian',
    remote: 'Remote', internship: 'Thực tập', contract: 'Hợp đồng',
};
const LEVEL_LABEL = {
    NHAN_VIEN: 'Nhân viên', TRUONG_NHOM: 'Trưởng nhóm',
    TRUONG_PHO_PHONG: 'Trưởng/Phó phòng', QUAN_LY_GIAM_SAT: 'Quản lý/Giám sát',
    GIAM_DOC: 'Giám đốc', PHO_GIAM_DOC: 'Phó giám đốc',
    TRUONG_CHI_NHANH: 'Trưởng chi nhánh', THUC_TAP_SINH: 'Thực tập sinh',
};
const WORKING_DAYS_LABEL = {
    MON_FRI: 'Thứ 2 – Thứ 6', MON_SAT: 'Thứ 2 – Thứ 7',
    MON_SUN: 'Thứ 2 – Chủ nhật', FLEXIBLE: 'Linh hoạt', CUSTOM: 'Tùy chỉnh',
};
const WORKING_TYPE_LABEL = {
    TOAN_THOI_GIAN: 'Tại văn phòng', BAN_THOI_GIAN: 'Bán thời gian',
    REMOTE: 'Remote', FREELANCE: 'Freelance', THUC_TAP: 'Thực tập',
};

// ─── Job Preview Modal ────────────────────────────────────────────────────────
function JobPreviewModal({ form, industries, jobPositions, onClose, onSubmit, saving }) {
    const industryName = industries.find(i => String(i.id) === String(form.industryId))?.name;
    const positionName = jobPositions.find(p => String(p.id) === String(form.jobPositionId))?.name;
    const locationStr = form.locations
        .filter(l => l.provinceName)
        .map(l => [l.districtName, l.provinceName].filter(Boolean).join(', '))
        .join(' • ');

    const Chip = ({ icon: Icon, children, color = '#475569' }) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            {Icon && <Icon size={11} />}
            {children}
        </span>
    );

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-[760px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Modal header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
                    <div className="flex items-center gap-2">
                        <Eye size={16} className="text-[#00b14f]" />
                        <span className="font-bold text-sm text-slate-900">Xem trước tin tuyển dụng</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 bg-amber-50 border border-amber-200 text-amber-600 px-2.5 py-1 rounded-full font-medium">
                            Đây là bản xem trước — chưa được đăng
                        </span>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Preview content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Hero */}
                    <div className="px-8 py-6 border-b border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center shrink-0">
                                <Briefcase size={26} className="text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl font-bold text-slate-900 mb-1 leading-snug">
                                    {form.title || <span className="text-slate-300 italic">Chưa có tiêu đề...</span>}
                                </h1>
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Building2 size={13} />
                                    <span>Tên công ty của bạn</span>
                                </div>
                                {positionName && (
                                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-[#00b14f] font-medium">
                                        <Tag size={11} /> {positionName}
                                    </div>
                                )}
                            </div>
                            {!form.isActive && (
                                <span className="text-xs bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full font-medium shrink-0">
                                    Bản nháp
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Quick info chips */}
                    <div className="px-8 py-4 border-b border-slate-100 flex flex-wrap gap-2">
                        <Chip icon={DollarSign}>{fmtSalary(form)}</Chip>
                        {locationStr && <Chip icon={MapPin}>{locationStr}</Chip>}
                        {form.jobType && <Chip>{JOB_TYPE_LABEL[form.jobType] || form.jobType}</Chip>}
                        {form.workingType && <Chip icon={Briefcase}>{WORKING_TYPE_LABEL[form.workingType] || form.workingType}</Chip>}
                        {form.workingDays && <Chip icon={Calendar}>{WORKING_DAYS_LABEL[form.workingDays] || form.workingDays}</Chip>}
                        {form.level && <Chip>{LEVEL_LABEL[form.level] || form.level}</Chip>}
                        {form.quantity && <Chip icon={Users}>{form.quantity} vị trí</Chip>}
                        {industryName && <Chip icon={Tag}>{industryName}</Chip>}
                        {form.deadline && (
                            <Chip icon={Calendar}>
                                Hạn: {new Date(form.deadline).toLocaleDateString('vi-VN')}
                            </Chip>
                        )}
                    </div>

                    {/* Description */}
                    <div className="px-8 py-6">
                        {form.description ? (
                            <div
                                className="jd-preview-modal text-sm text-slate-700 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: renderMarkdown(form.description) }}
                            />
                        ) : (
                            <div className="text-center py-12 text-slate-300 italic text-sm">
                                Chưa có nội dung mô tả công việc...
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={14} /> Quay lại chỉnh sửa
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={saving}
                        className="flex-[2] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-60"
                        style={{ background: saving ? '#86efac' : GREEN }}
                    >
                        {saving
                            ? <><Send size={14} /> Đang đăng...</>
                            : <><CheckCircle size={14} /> Xác nhận & Đăng tin</>
                        }
                    </button>
                </div>

                <style>{`
                    .jd-preview-modal h1 { font-size: 18px; font-weight: 800; margin: 14px 0 6px; color: #111827; }
                    .jd-preview-modal h2 { font-size: 16px; font-weight: 700; margin: 12px 0 5px; color: #111827; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
                    .jd-preview-modal h3 { font-size: 14px; font-weight: 700; margin: 10px 0 4px; color: #374151; }
                    .jd-preview-modal p { margin: 6px 0; }
                    .jd-preview-modal ul { padding-left: 22px; margin: 6px 0; list-style: disc; }
                    .jd-preview-modal li { margin: 3px 0; }
                    .jd-preview-modal strong { font-weight: 700; }
                    .jd-preview-modal em { font-style: italic; }
                    .jd-preview-modal del { text-decoration: line-through; color: #9ca3af; }
                    .jd-preview-modal blockquote { border-left: 3px solid #d1d5db; padding: 2px 12px; color: #6b7280; margin: 8px 0; font-style: italic; }
                    .jd-preview-modal code { background: #f3f4f6; padding: 2px 5px; border-radius: 4px; font-size: 12px; font-family: monospace; }
                    .jd-preview-modal pre { background: #f3f4f6; padding: 10px 14px; border-radius: 8px; overflow-x: auto; margin: 10px 0; }
                    .jd-preview-modal pre code { background: none; padding: 0; }
                `}</style>
            </div>
        </div>
    );
}

export default function JobForm({ jobId, initialData }) {
    const router = useRouter();
    const [form, setForm] = useState(() => {
        if (!initialData) return { ...EMPTY };
        const { locations, provinceCode, provinceName, districtCode, districtName, address, ...rest } = initialData;
        const locs = locations && locations.length > 0
            ? locations
            : provinceCode
                ? [{ provinceCode, provinceName: provinceName || '', districtCode: districtCode || '', districtName: districtName || '', address: address || '' }]
                : [{ ...EMPTY_LOC }];
        return { ...EMPTY, ...rest, locations: locs };
    });
    const [industries, setIndustries] = useState([]);
    const [jobPositions, setJobPositions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        Promise.all([
            employerDashboardService.getIndustries(),
            employerDashboardService.getJobPositions(),
            provinceService.getAll(),
        ]).then(([indRes, posRes, provRes]) => {
            setIndustries(indRes.data?.data || indRes.data || []);
            setJobPositions(posRes.data?.data || posRes.data || []);
            setProvinces(provRes || []);
        }).catch(console.error);
    }, []);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const updateLocation = (index, newLoc) => {
        setForm(f => {
            const locs = [...f.locations];
            locs[index] = newLoc;
            return { ...f, locations: locs };
        });
    };

    const addLocation = () => setForm(f => ({ ...f, locations: [...f.locations, { ...EMPTY_LOC }] }));
    const removeLocation = (index) => setForm(f => ({ ...f, locations: f.locations.filter((_, i) => i !== index) }));

    const validate = () => {
        if (!form.title.trim()) { setError('Tiêu đề không được để trống'); return false; }
        if (!form.description.trim()) { setError('Mô tả không được để trống'); return false; }
        setError('');
        return true;
    };

    const handlePreview = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setShowPreview(true);
    };

    const doSubmit = async () => {
        setSaving(true);
        try {
            const payload = {
                ...form,
                salaryMin: form.salaryType !== 'negotiable' && form.salaryMin ? Number(form.salaryMin) * 1_000_000 : null,
                salaryMax: form.salaryType !== 'negotiable' && form.salaryMax ? Number(form.salaryMax) * 1_000_000 : null,
                quantity: Number(form.quantity) || 1,
                industryId: form.industryId ? Number(form.industryId) : undefined,
                jobPositionId: form.jobPositionId ? Number(form.jobPositionId) : undefined,
                deadline: form.deadline || undefined,
                locations: form.locations.filter(loc => loc.provinceCode || loc.address),
            };

            if (jobId) {
                await employerDashboardService.updateJob(jobId, payload);
            } else {
                await employerDashboardService.createJob(payload);
            }
            router.push('/nha-tuyen-dung/quan-ly-tin');
        } catch (err) {
            setShowPreview(false);
            setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        doSubmit();
    };

    const salaryInMillion = (val) => val ? val / 1_000_000 : '';

    return (
        <form onSubmit={handleSubmit} className="flex flex-col min-[900px]:flex-row gap-6 items-start">
            {/* Main */}
            <div className="flex-1 min-w-0">
                {/* Basic info */}
                <Section title="Thông tin cơ bản">
                    <Field label="Tiêu đề công việc" required>
                        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="VD: Lập trình viên React Senior" className={inputCls} />
                    </Field>
                    <Field label="Mô tả công việc" required hint="Hỗ trợ Markdown: **in đậm**, *in nghiêng*, ## tiêu đề, - danh sách.">
                        <MarkdownEditor value={form.description} onChange={v => set('description', v)} />
                    </Field>
                </Section>

                {/* Salary */}
                <Section title="Mức lương">
                    <Field label="Hình thức lương">
                        <select value={form.salaryType} onChange={e => set('salaryType', e.target.value)} className={selectCls}>
                            {SALARY_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </Field>
                    {form.salaryType !== 'negotiable' && (
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Từ (triệu VNĐ)">
                                <input type="number" min="0" value={form.salaryMin === '' ? '' : salaryInMillion(form.salaryMin)}
                                    onChange={e => set('salaryMin', e.target.value ? Number(e.target.value) * 1_000_000 : '')}
                                    placeholder="VD: 10" className={inputCls} />
                            </Field>
                            <Field label="Đến (triệu VNĐ)">
                                <input type="number" min="0" value={form.salaryMax === '' ? '' : salaryInMillion(form.salaryMax)}
                                    onChange={e => set('salaryMax', e.target.value ? Number(e.target.value) * 1_000_000 : '')}
                                    placeholder="VD: 20" className={inputCls} />
                            </Field>
                        </div>
                    )}
                </Section>

                {/* Location */}
                <Section title="Địa điểm làm việc">
                    <p className="text-xs text-slate-400 -mt-2 mb-3">
                        Có thể thêm nhiều địa điểm nếu công ty có nhiều chi nhánh tuyển dụng cùng lúc.
                    </p>
                    {form.locations.map((loc, i) => (
                        <LocationRow
                            key={i}
                            loc={loc}
                            provinces={provinces}
                            index={i}
                            onChange={newLoc => updateLocation(i, newLoc)}
                            onRemove={() => removeLocation(i)}
                            canRemove={form.locations.length > 1}
                        />
                    ))}
                    <button
                        type="button"
                        onClick={addLocation}
                        className="flex items-center justify-center gap-1.5 w-full border border-dashed rounded-lg px-3.5 py-2 text-[13px] font-semibold cursor-pointer bg-transparent"
                        style={{ borderColor: GREEN, color: GREEN }}
                    >
                        <PlusCircle size={15} /> Thêm địa điểm
                    </button>
                </Section>

                {/* Work details */}
                <Section title="Yêu cầu & Hình thức làm việc">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Loại hình">
                            <select value={form.jobType} onChange={e => set('jobType', e.target.value)} className={selectCls}>
                                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Hình thức làm việc">
                            <select value={form.workingType} onChange={e => set('workingType', e.target.value)} className={selectCls}>
                                {WORKING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Ngày làm việc">
                            <select value={form.workingDays} onChange={e => set('workingDays', e.target.value)} className={selectCls}>
                                {WORKING_DAYS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Cấp bậc">
                            <select value={form.level} onChange={e => set('level', e.target.value)} className={selectCls}>
                                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                            </select>
                        </Field>
                    </div>
                    {form.workingDays === 'CUSTOM' && (
                        <Field label="Ghi chú ngày làm việc">
                            <input value={form.workingDaysNote} onChange={e => set('workingDaysNote', e.target.value)}
                                placeholder="VD: Thứ 2, 4, 6" className={inputCls} />
                        </Field>
                    )}
                </Section>
            </div>

            {/* Sidebar */}
            <div className="w-full min-[900px]:w-[280px] shrink-0 flex flex-col gap-4">
                {/* Publish */}
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-3.5">Xuất bản</h3>

                    <div className="flex items-center justify-between mb-3.5">
                        <span className="text-[13px] text-slate-700">Hiển thị ngay</span>
                        <button
                            type="button"
                            onClick={() => set('isActive', !form.isActive)}
                            className="w-10 h-[22px] rounded-full border-none cursor-pointer relative transition-colors"
                            style={{ background: form.isActive ? GREEN : '#d1d5db' }}
                        >
                            <span
                                className="absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                                style={{ left: form.isActive ? '21px' : '3px' }}
                            />
                        </button>
                    </div>

                    <Field label="Số lượng tuyển">
                        <input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} className={inputCls} />
                    </Field>

                    <Field label="Hạn nộp hồ sơ">
                        <input type="date" value={form.deadline ? form.deadline.slice(0, 10) : ''} onChange={e => set('deadline', e.target.value)} className={inputCls} />
                    </Field>

                    {error && (
                        <div className="bg-red-50 border border-red-300 rounded-lg px-3 py-2.5 text-[13px] text-red-600 mb-3">
                            {error}
                        </div>
                    )}

                    {/* Nút Xem trước (chỉ hiện khi tạo mới) */}
                    {!jobId && (
                        <button
                            type="button"
                            onClick={handlePreview}
                            className="w-full border border-slate-200 rounded-lg py-[11px] text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-slate-700 hover:bg-slate-50 mb-2"
                        >
                            <Eye size={15} />
                            Xem trước tin
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full text-white border-none rounded-lg py-[11px] text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-opacity"
                        style={{ background: saving ? '#86efac' : GREEN }}
                    >
                        <Save size={16} />
                        {saving ? 'Đang lưu...' : jobId ? 'Cập nhật tin' : 'Đăng tin ngay'}
                    </button>
                </div>

                {/* Classification */}
                <div className="bg-white rounded-xl p-5 border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-3.5">Phân loại</h3>
                    <Field label="Ngành nghề">
                        <select value={form.industryId} onChange={e => set('industryId', e.target.value)} className={selectCls}>
                            <option value="">-- Chọn ngành nghề --</option>
                            {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Vị trí công việc">
                        <select value={form.jobPositionId} onChange={e => set('jobPositionId', e.target.value)} className={selectCls}>
                            <option value="">-- Chọn vị trí --</option>
                            {jobPositions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </Field>
                </div>
            </div>
        </form>

        {/* Preview Modal */}
        {showPreview && (
            <JobPreviewModal
                form={form}
                industries={industries}
                jobPositions={jobPositions}
                onClose={() => setShowPreview(false)}
                onSubmit={doSubmit}
                saving={saving}
            />
        )}
    );
}
