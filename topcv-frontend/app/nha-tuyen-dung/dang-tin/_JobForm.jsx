'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Bold, Italic, Strikethrough, List, ListOrdered, Quote, Code, Eye, AlignLeft, PlusCircle, X } from 'lucide-react';
import { employerDashboardService } from '@/services/employer-dashboard.service';
import { provinceService } from '@/services/province.service';

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
            style={{
                background: active ? '#e5e7eb' : 'none',
                border: 'none', cursor: 'pointer',
                padding: '4px 7px', borderRadius: '4px',
                fontSize: '11px', fontWeight: '700',
                color: '#374151', lineHeight: 1,
                display: 'flex', alignItems: 'center', gap: '3px',
            }}
        >
            {children}
        </button>
    );

    const Sep = () => (
        <div style={{ width: '1px', height: '18px', background: '#e5e7eb', margin: '0 3px', flexShrink: 0 }} />
    );

    return (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap',
                padding: '6px 10px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
            }}>
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

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', borderLeft: '1px solid #e5e7eb', paddingLeft: '8px' }}>
                    <Btn onClick={() => setShowPreview(false)} active={!showPreview} title="Soạn thảo">
                        Soạn thảo
                    </Btn>
                    <Btn onClick={() => setShowPreview(true)} active={showPreview} title="Xem trước">
                        <Eye size={13} /> Xem trước
                    </Btn>
                </div>
            </div>

            {showPreview ? (
                <div
                    className="md-preview"
                    dangerouslySetInnerHTML={{
                        __html: renderMarkdown(value) || '<p style="color:#9ca3af">Chưa có nội dung...</p>',
                    }}
                    style={{ padding: '16px 20px', minHeight: '260px', fontSize: '14px', color: '#374151', lineHeight: 1.7 }}
                />
            ) : (
                <textarea
                    ref={taRef}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    rows={12}
                    placeholder={`## Mô tả công việc\n- Phát triển tính năng mới...\n\n## Yêu cầu\n- Kinh nghiệm 2+ năm...\n\n## Quyền lợi\n- Lương cạnh tranh...`}
                    style={{
                        width: '100%', padding: '12px 16px', border: 'none', outline: 'none',
                        resize: 'vertical', minHeight: '260px', boxSizing: 'border-box',
                        fontFamily: '"Fira Code", "SF Mono", Consolas, monospace',
                        fontSize: '13px', color: '#374151', lineHeight: 1.7, background: 'white',
                    }}
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
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#f9fafb', position: 'relative' }}>
            {canRemove && (
                <button type="button" onClick={onRemove} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}>
                    <X size={14} />
                </button>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <select value={loc.provinceCode || ''} onChange={e => handleProvince(e.target.value)} style={selectStyle}>
                    <option value="">-- Tỉnh/Thành phố --</option>
                    {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                <select value={loc.districtCode || ''} onChange={e => handleDistrict(e.target.value)} disabled={!loc.provinceCode || loadingDistricts} style={{ ...selectStyle, opacity: !loc.provinceCode ? 0.5 : 1 }}>
                    <option value="">-- Quận/Huyện --</option>
                    {districts.map(d => <option key={d.code} value={String(d.code)}>{d.name}</option>)}
                </select>
            </div>
            <input value={loc.address || ''} onChange={e => onChange({ ...loc, address: e.target.value })} placeholder="Địa chỉ cụ thể (tòa nhà, đường phố...)" style={{ ...inputStyle, marginBottom: 0 }} />
        </div>
    );
}

function Field({ label, required, children, hint }) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            {children}
            {hint && <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{hint}</p>}
        </div>
    );
}

const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', color: '#111827',
    outline: 'none', background: 'white', boxSizing: 'border-box',
};

const selectStyle = { ...inputStyle, cursor: 'pointer' };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) { setError('Tiêu đề không được để trống'); return; }
        if (!form.description.trim()) { setError('Mô tả không được để trống'); return; }

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
            setError(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSaving(false);
        }
    };

    const salaryInMillion = (val) => val ? val / 1_000_000 : '';

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }} className="job-form-layout">
            {/* Main */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Basic info */}
                <Section title="Thông tin cơ bản">
                    <Field label="Tiêu đề công việc" required>
                        <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="VD: Lập trình viên React Senior" style={inputStyle} />
                    </Field>

                    <Field label="Mô tả công việc" required hint="Hỗ trợ Markdown: **in đậm**, *in nghiêng*, ## tiêu đề, - danh sách.">
                        <MarkdownEditor value={form.description} onChange={v => set('description', v)} />
                    </Field>
                </Section>

                {/* Salary */}
                <Section title="Mức lương">
                    <Field label="Hình thức lương">
                        <select value={form.salaryType} onChange={e => set('salaryType', e.target.value)} style={selectStyle}>
                            {SALARY_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </Field>
                    {form.salaryType !== 'negotiable' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Field label="Từ (triệu VNĐ)">
                                <input type="number" min="0" value={form.salaryMin === '' ? '' : salaryInMillion(form.salaryMin)} onChange={e => set('salaryMin', e.target.value ? Number(e.target.value) * 1_000_000 : '')} placeholder="VD: 10" style={inputStyle} />
                            </Field>
                            <Field label="Đến (triệu VNĐ)">
                                <input type="number" min="0" value={form.salaryMax === '' ? '' : salaryInMillion(form.salaryMax)} onChange={e => set('salaryMax', e.target.value ? Number(e.target.value) * 1_000_000 : '')} placeholder="VD: 20" style={inputStyle} />
                            </Field>
                        </div>
                    )}
                </Section>

                {/* Location */}
                <Section title="Địa điểm làm việc">
                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '-8px', marginBottom: '12px' }}>
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
                    <button type="button" onClick={addLocation} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px dashed ${GREEN}`, borderRadius: '8px', padding: '8px 14px', color: GREEN, fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                        <PlusCircle size={15} /> Thêm địa điểm
                    </button>
                </Section>

                {/* Work details */}
                <Section title="Yêu cầu & Hình thức làm việc">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Field label="Loại hình">
                            <select value={form.jobType} onChange={e => set('jobType', e.target.value)} style={selectStyle}>
                                {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Hình thức làm việc">
                            <select value={form.workingType} onChange={e => set('workingType', e.target.value)} style={selectStyle}>
                                {WORKING_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Ngày làm việc">
                            <select value={form.workingDays} onChange={e => set('workingDays', e.target.value)} style={selectStyle}>
                                {WORKING_DAYS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Cấp bậc">
                            <select value={form.level} onChange={e => set('level', e.target.value)} style={selectStyle}>
                                {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                            </select>
                        </Field>
                    </div>
                    {form.workingDays === 'CUSTOM' && (
                        <Field label="Ghi chú ngày làm việc">
                            <input value={form.workingDaysNote} onChange={e => set('workingDaysNote', e.target.value)} placeholder="VD: Thứ 2, 4, 6" style={inputStyle} />
                        </Field>
                    )}
                </Section>
            </div>

            {/* Sidebar */}
            <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' }} className="job-form-sidebar">
                {/* Publish */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>Xuất bản</h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ fontSize: '13px', color: '#374151' }}>Hiển thị ngay</span>
                        <button type="button" onClick={() => set('isActive', !form.isActive)}
                            style={{ width: '40px', height: '22px', borderRadius: '11px', background: form.isActive ? GREEN : '#d1d5db', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                            <span style={{ position: 'absolute', top: '3px', left: form.isActive ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                        </button>
                    </div>

                    <Field label="Số lượng tuyển">
                        <input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} style={inputStyle} />
                    </Field>

                    <Field label="Hạn nộp hồ sơ">
                        <input type="date" value={form.deadline ? form.deadline.slice(0, 10) : ''} onChange={e => set('deadline', e.target.value)} style={inputStyle} />
                    </Field>

                    {error && (
                        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', color: '#dc2626', marginBottom: '12px' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={saving} style={{
                        width: '100%', background: saving ? '#86efac' : GREEN, color: 'white',
                        border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px',
                        fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}>
                        <Save size={16} />
                        {saving ? 'Đang lưu...' : jobId ? 'Cập nhật tin' : 'Đăng tin ngay'}
                    </button>
                </div>

                {/* Classification */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>Phân loại</h3>
                    <Field label="Ngành nghề">
                        <select value={form.industryId} onChange={e => set('industryId', e.target.value)} style={selectStyle}>
                            <option value="">-- Chọn ngành nghề --</option>
                            {industries.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </Field>
                    <Field label="Vị trí công việc">
                        <select value={form.jobPositionId} onChange={e => set('jobPositionId', e.target.value)} style={selectStyle}>
                            <option value="">-- Chọn vị trí --</option>
                            {jobPositions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </Field>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .job-form-layout { flex-direction: column !important; }
                    .job-form-sidebar { width: 100% !important; }
                }
            `}</style>
        </form>
    );
}

function Section({ title, children }) {
    return (
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>{title}</h3>
            {children}
        </div>
    );
}
