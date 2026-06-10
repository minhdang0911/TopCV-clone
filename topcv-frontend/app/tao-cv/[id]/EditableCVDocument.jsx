'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, EyeOff } from 'lucide-react';
import api from '@/lib/axios';

export const SECTION_LABELS = {
    objective: 'Mục tiêu nghề nghiệp',
    experiences: 'Kinh nghiệm làm việc',
    education: 'Học vấn',
    skills: 'Kỹ năng',
    languages: 'Ngôn ngữ',
    certifications: 'Chứng chỉ',
    activities: 'Hoạt động ngoại khóa',
};

export const ALL_SECTIONS = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function uuid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

function PhoneIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.13h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
    );
}

function EmailIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    );
}

function MapPinIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
            <circle cx="4" cy="4" r="2"/>
        </svg>
    );
}

function GitHubIcon() {
    return (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
    );
}

// Transparent inline editable field
function EF({ value, onChange, placeholder = '', multiline = false, style = {}, bold = false }) {
    const taRef = useRef(null);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (multiline && taRef.current) {
            taRef.current.style.height = 'auto';
            taRef.current.style.height = taRef.current.scrollHeight + 'px';
        }
    }, [value, multiline]);

    const base = {
        border: 'none',
        outline: focused ? '1px dashed #d1d5db' : '1px solid transparent',
        background: focused ? 'rgba(0,177,79,0.04)' : 'transparent',
        width: '100%',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        fontWeight: bold ? '700' : 'inherit',
        color: 'inherit',
        padding: '1px 4px',
        borderRadius: '3px',
        boxSizing: 'border-box',
        resize: 'none',
        display: 'block',
        ...style,
    };

    if (multiline) {
        return (
            <textarea ref={taRef} value={value || ''} onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder} rows={1}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{ ...base, overflow: 'hidden', minHeight: '22px' }} />
        );
    }
    return (
        <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={base} />
    );
}

// Section wrapper with floating toolbar on hover
function SectionBlock({ title, color, children, onMoveUp, onMoveDown, onHide, canMoveUp, canMoveDown }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            style={{ position: 'relative', marginBottom: '20px' }}>
            {/* Floating section toolbar */}
            {hovered && (
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    right: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                    zIndex: 30,
                    overflow: 'hidden',
                }}>
                    <SectionToolBtn onClick={onMoveUp} disabled={!canMoveUp} title="Lên">
                        <ChevronUp size={13} />
                    </SectionToolBtn>
                    <SectionToolBtn onClick={onMoveDown} disabled={!canMoveDown} title="Xuống">
                        <ChevronDown size={13} />
                    </SectionToolBtn>
                    <div style={{ width: 1, height: 16, background: '#f3f4f6' }} />
                    <SectionToolBtn onClick={onHide} title="Ẩn mục" danger>
                        <EyeOff size={12} />
                        <span style={{ fontSize: '11px', marginLeft: '2px' }}>Ẩn</span>
                    </SectionToolBtn>
                </div>
            )}
            <div style={{
                padding: '8px 10px',
                border: hovered ? '1px dashed #d1d5db' : '1px solid transparent',
                borderRadius: '4px',
                background: hovered ? 'rgba(0,177,79,0.012)' : 'transparent',
                transition: 'border-color 0.15s, background 0.15s',
            }}>
                <div style={{
                    fontSize: '12px', fontWeight: '800', textTransform: 'uppercase',
                    letterSpacing: '1px', color,
                    borderBottom: `2px solid ${color}40`,
                    paddingBottom: '4px',
                    marginBottom: '10px',
                }}>
                    {title}
                </div>
                {children}
            </div>
        </div>
    );
}

function SectionToolBtn({ onClick, disabled, children, title, danger }) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} disabled={disabled} title={title}
            onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{
                padding: '5px 8px',
                border: 'none',
                background: hov && !disabled ? (danger ? '#fef2f2' : '#f9fafb') : 'transparent',
                cursor: disabled ? 'default' : 'pointer',
                color: disabled ? '#d1d5db' : danger ? '#ef4444' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontSize: '12px',
                transition: 'background 0.1s',
            }}>
            {children}
        </button>
    );
}

function AddBtn({ onClick, color, children }) {
    return (
        <button onClick={onClick}
            style={{ marginTop: '8px', padding: '6px 14px', border: `1px dashed ${color}60`, background: `${color}08`, borderRadius: '6px', fontSize: '12px', color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={12} />{children}
        </button>
    );
}

function DelBtn({ onClick }) {
    return (
        <button onClick={onClick}
            style={{ background: 'none', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', fontSize: '11px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '3px', borderRadius: '4px' }}>
            <Trash2 size={11} />Xóa
        </button>
    );
}

function AvatarBlock({ value, onChange }) {
    const [uploading, setUploading] = useState(false);
    const ref = useRef(null);
    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const res = await api.post('/upload/cv-avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            onChange(res.data?.data?.url || '');
        } catch {}
        setUploading(false);
        e.target.value = '';
    };
    return (
        <div onClick={() => !uploading && ref.current?.click()} title="Click để thay ảnh"
            style={{ width: '90px', height: '90px', borderRadius: '50%', border: '2px dashed #d1d5db', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
            {value ? (
                <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                    <span style={{ fontSize: '9px', color: '#9ca3af', textAlign: 'center', lineHeight: '1.3' }}>
                        {uploading ? 'Đang tải...' : 'Thêm ảnh'}
                    </span>
                </div>
            )}
            <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
        </div>
    );
}

const CONTACT_FIELDS = [
    { Icon: PhoneIcon, key: 'phone', ph: 'Số điện thoại' },
    { Icon: EmailIcon, key: 'email', ph: 'Email' },
    { Icon: MapPinIcon, key: 'address', ph: 'Địa chỉ' },
    { Icon: LinkedInIcon, key: 'linkedin', ph: 'LinkedIn' },
    { Icon: GitHubIcon, key: 'github', ph: 'GitHub' },
];

export default function EditableCVDocument({
    content, onContentChange,
    sectionOrder, onSectionOrderChange,
    hiddenSections, onHideSection,
    color = '#00b14f', font = 'Arial', fontSize = 'medium', lineSpacing = 1.5, background = 'white',
}) {
    const pi = content?.personalInfo || {};
    const baseFontSize = fontSize === 'small' ? 12 : fontSize === 'large' ? 15 : 13;
    const visibleSections = sectionOrder.filter((s) => !hiddenSections.includes(s));

    const updatePI = (field, val) => onContentChange({ ...content, personalInfo: { ...pi, [field]: val } });
    const updateField = (field, val) => onContentChange({ ...content, [field]: val });
    const addItem = (field, tpl) => updateField(field, [...(content[field] || []), { id: uuid(), ...tpl }]);
    const removeItem = (field, id) => updateField(field, (content[field] || []).filter((x) => x.id !== id));
    const upd = (field, id, key, val) => updateField(field, (content[field] || []).map((x) => x.id === id ? { ...x, [key]: val } : x));

    const moveSection = (key, dir) => {
        const arr = [...visibleSections];
        const i = arr.indexOf(key);
        const j = i + dir;
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        const newOrder = [...sectionOrder];
        const visibleIndices = sectionOrder.map((s, idx) => !hiddenSections.includes(s) ? idx : -1).filter((i) => i !== -1);
        arr.forEach((s, i) => { newOrder[visibleIndices[i]] = s; });
        onSectionOrderChange(newOrder);
    };

    const sectionProps = (key, idx) => ({
        color,
        title: SECTION_LABELS[key],
        canMoveUp: idx > 0,
        canMoveDown: idx < visibleSections.length - 1,
        onMoveUp: () => moveSection(key, -1),
        onMoveDown: () => moveSection(key, 1),
        onHide: () => onHideSection(key),
    });

    return (
        <div id="cv-print-area"
            style={{ width: '794px', minHeight: '1123px', background: background || 'white', fontFamily: `${font || 'Arial'}, sans-serif`, fontSize: `${baseFontSize}px`, lineHeight: lineSpacing || 1.5, color: '#111827', padding: '44px 52px', boxSizing: 'border-box' }}>

            {/* Header */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '28px', paddingBottom: '18px', borderBottom: `3px solid ${color}` }}>
                <AvatarBlock value={pi.avatarUrl} onChange={(url) => updatePI('avatarUrl', url)} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <EF value={pi.fullName} onChange={(v) => updatePI('fullName', v)} placeholder="Họ và tên đầy đủ" bold
                        style={{ fontSize: `${baseFontSize + 8}px`, color, marginBottom: '4px' }} />
                    <EF value={pi.title} onChange={(v) => updatePI('title', v)} placeholder="Vị trí ứng tuyển"
                        style={{ fontSize: `${baseFontSize + 1}px`, color: '#4b5563', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 14px' }}>
                        {CONTACT_FIELDS.map(({ Icon, key, ph }) => (
                            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '12px' }}>
                                <Icon />
                                <EF value={pi[key]} onChange={(v) => updatePI(key, v)} placeholder={ph}
                                    style={{ fontSize: '12px', minWidth: '80px', color: '#374151' }} />
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sections */}
            {visibleSections.map((key, idx) => {
                const sp = sectionProps(key, idx);

                if (key === 'objective') return (
                    <SectionBlock key={key} {...sp}>
                        <EF value={content?.objective} onChange={(v) => updateField('objective', v)}
                            placeholder="Mô tả ngắn gọn về bản thân, kinh nghiệm và mục tiêu nghề nghiệp..." multiline
                            style={{ color: '#374151', minHeight: '60px' }} />
                    </SectionBlock>
                );

                if (key === 'experiences') return (
                    <SectionBlock key={key} {...sp}>
                        {(content?.experiences || []).map((exp) => (
                            <div key={exp.id} style={{ marginBottom: '16px', paddingLeft: '12px', borderLeft: `3px solid ${color}30` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                                    <EF value={exp.position} onChange={(v) => upd('experiences', exp.id, 'position', v)} placeholder="Vị trí / Chức danh" bold />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0, fontSize: '11px', color: '#9ca3af' }}>
                                        <EF value={exp.startDate} onChange={(v) => upd('experiences', exp.id, 'startDate', v)} placeholder="Từ" style={{ width: '72px', fontSize: '11px', color: '#9ca3af', textAlign: 'right' }} />
                                        <span>—</span>
                                        {exp.isCurrent
                                            ? <span style={{ color, fontWeight: '600' }}>Hiện tại</span>
                                            : <EF value={exp.endDate} onChange={(v) => upd('experiences', exp.id, 'endDate', v)} placeholder="Đến" style={{ width: '72px', fontSize: '11px', color: '#9ca3af' }} />
                                        }
                                    </div>
                                </div>
                                <EF value={exp.company} onChange={(v) => upd('experiences', exp.id, 'company', v)} placeholder="Tên công ty" style={{ color, fontWeight: '600', fontSize: '12px' }} />
                                <EF value={exp.description} onChange={(v) => upd('experiences', exp.id, 'description', v)}
                                    placeholder="- Mô tả công việc và thành tích nổi bật" multiline style={{ color: '#374151', marginTop: '5px' }} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                                    <label style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                                        <input type="checkbox" checked={!!exp.isCurrent} onChange={(e) => upd('experiences', exp.id, 'isCurrent', e.target.checked)} />
                                        Hiện đang làm
                                    </label>
                                    <DelBtn onClick={() => removeItem('experiences', exp.id)} />
                                </div>
                            </div>
                        ))}
                        <AddBtn onClick={() => addItem('experiences', { position: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' })} color={color}>Thêm kinh nghiệm</AddBtn>
                    </SectionBlock>
                );

                if (key === 'education') return (
                    <SectionBlock key={key} {...sp}>
                        {(content?.education || []).map((edu) => (
                            <div key={edu.id} style={{ marginBottom: '14px', paddingLeft: '12px', borderLeft: `3px solid ${color}30` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                                    <EF value={edu.school} onChange={(v) => upd('education', edu.id, 'school', v)} placeholder="Tên trường" bold />
                                    <div style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0, display: 'flex', gap: '2px', alignItems: 'center' }}>
                                        <EF value={edu.startDate} onChange={(v) => upd('education', edu.id, 'startDate', v)} placeholder="Năm" style={{ width: '48px', fontSize: '11px', textAlign: 'right' }} />
                                        <span>-</span>
                                        <EF value={edu.endDate} onChange={(v) => upd('education', edu.id, 'endDate', v)} placeholder="Năm" style={{ width: '48px', fontSize: '11px' }} />
                                    </div>
                                </div>
                                <EF value={edu.degree} onChange={(v) => upd('education', edu.id, 'degree', v)} placeholder="Ngành học / Bằng cấp" style={{ color: '#4b5563' }} />
                                <EF value={edu.gpa} onChange={(v) => upd('education', edu.id, 'gpa', v)} placeholder="GPA / Xếp loại" style={{ color, fontSize: '11px', fontWeight: '600' }} />
                                <EF value={edu.description} onChange={(v) => upd('education', edu.id, 'description', v)} placeholder="Thành tích, hoạt động nổi bật..." multiline style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }} />
                                <DelBtn onClick={() => removeItem('education', edu.id)} />
                            </div>
                        ))}
                        <AddBtn onClick={() => addItem('education', { school: '', degree: '', gpa: '', startDate: '', endDate: '', description: '' })} color={color}>Thêm học vấn</AddBtn>
                    </SectionBlock>
                );

                if (key === 'skills') return (
                    <SectionBlock key={key} {...sp}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                            {(content?.skills || []).map((s) => (
                                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <EF value={s.name} onChange={(v) => upd('skills', s.id, 'name', v)} placeholder="Kỹ năng" style={{ flex: 1 }} />
                                    <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                                        {[1, 2, 3, 4, 5].map((n) => (
                                            <button key={n} onClick={() => upd('skills', s.id, 'level', n)}
                                                style={{ width: '14px', height: '7px', borderRadius: '2px', border: 'none', cursor: 'pointer', background: n <= (s.level || 3) ? color : '#e5e7eb', padding: 0 }} />
                                        ))}
                                    </div>
                                    <button onClick={() => removeItem('skills', s.id)} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addItem('skills', { name: '', level: 3 })} color={color}>Thêm kỹ năng</AddBtn>
                    </SectionBlock>
                );

                if (key === 'languages') return (
                    <SectionBlock key={key} {...sp}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                            {(content?.languages || []).map((l) => (
                                <div key={l.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <EF value={l.name} onChange={(v) => upd('languages', l.id, 'name', v)} placeholder="Ngôn ngữ" style={{ flex: 1 }} bold />
                                    <EF value={l.level} onChange={(v) => upd('languages', l.id, 'level', v)} placeholder="Trình độ" style={{ flex: 1, color: '#6b7280' }} />
                                    <button onClick={() => removeItem('languages', l.id)} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <AddBtn onClick={() => addItem('languages', { name: '', level: '' })} color={color}>Thêm ngôn ngữ</AddBtn>
                    </SectionBlock>
                );

                if (key === 'certifications') return (
                    <SectionBlock key={key} {...sp}>
                        {(content?.certifications || []).map((cert) => (
                            <div key={cert.id} style={{ display: 'flex', gap: '10px', alignItems: 'baseline', marginBottom: '7px' }}>
                                <EF value={cert.name} onChange={(v) => upd('certifications', cert.id, 'name', v)} placeholder="Tên chứng chỉ" bold style={{ flex: 2 }} />
                                <EF value={cert.issuer} onChange={(v) => upd('certifications', cert.id, 'issuer', v)} placeholder="Đơn vị cấp" style={{ flex: 2, color: '#6b7280' }} />
                                <EF value={cert.date} onChange={(v) => upd('certifications', cert.id, 'date', v)} placeholder="Năm" style={{ flex: 1, color: '#9ca3af' }} />
                                <button onClick={() => removeItem('certifications', cert.id)} style={{ background: 'none', border: 'none', color: '#d1d5db', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                        <AddBtn onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })} color={color}>Thêm chứng chỉ</AddBtn>
                    </SectionBlock>
                );

                if (key === 'activities') return (
                    <SectionBlock key={key} {...sp}>
                        {(content?.activities || []).map((act) => (
                            <div key={act.id} style={{ marginBottom: '14px', paddingLeft: '12px', borderLeft: `3px solid ${color}30` }}>
                                <EF value={act.role} onChange={(v) => upd('activities', act.id, 'role', v)} placeholder="Vai trò / Chức vụ" bold />
                                <EF value={act.organization} onChange={(v) => upd('activities', act.id, 'organization', v)} placeholder="Tên tổ chức / CLB" style={{ color, fontWeight: '600', fontSize: '12px' }} />
                                <EF value={act.description} onChange={(v) => upd('activities', act.id, 'description', v)} placeholder="Mô tả hoạt động..." multiline style={{ color: '#374151', marginTop: '4px' }} />
                                <DelBtn onClick={() => removeItem('activities', act.id)} />
                            </div>
                        ))}
                        <AddBtn onClick={() => addItem('activities', { role: '', organization: '', description: '' })} color={color}>Thêm hoạt động</AddBtn>
                    </SectionBlock>
                );

                return null;
            })}
        </div>
    );
}
