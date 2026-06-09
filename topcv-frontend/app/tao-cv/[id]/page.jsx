'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, Printer, ChevronDown, ChevronUp, Plus, Trash2, ArrowLeft } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import useResumeStore from '@/stores/resume.store';
import { resumeService } from '@/services/resume.service';
import { getTemplate, TEMPLATE_META } from '@/app/components/cv/templateRegistry';

/* ─── Left panel section editors ─── */
function FieldInput({ label, value, onChange, type = 'text', placeholder = '' }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            {label && <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', outline: 'none' }}
            />
        </div>
    );
}

function FieldTextarea({ label, value, onChange, rows = 3, placeholder = '' }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            {label && <label style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'block', marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
            />
        </div>
    );
}

function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ borderBottom: '1px solid #e5e7eb' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#111827' }}
            >
                {title}
                {open ? <ChevronUp size={15} color="#9ca3af" /> : <ChevronDown size={15} color="#9ca3af" />}
            </button>
            {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
        </div>
    );
}

function uuid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* ─── Main editor page ─── */
export default function CvEditorPage() {
    const { id } = useParams();
    const router = useRouter();
    const { hydrated, isAuthenticated } = useAuthStore();
    const { resume, setResume, isDirty, setSaving, saving } = useResumeStore();
    const [loading, setLoading] = useState(true);
    const [saveMsg, setSaveMsg] = useState('');
    const autoSaveRef = useRef(null);

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        resumeService.get(id).then((res) => {
            setResume(res.data);
        }).catch(() => router.replace('/tao-cv')).finally(() => setLoading(false));
        return () => useResumeStore.getState().reset();
    }, [id, isAuthenticated]);

    const save = useCallback(async () => {
        const r = useResumeStore.getState().resume;
        if (!r) return;
        setSaving(true);
        try {
            await resumeService.update(r.id, {
                title: r.title,
                template: r.template,
                color: r.color,
                fontSize: r.fontSize,
                lineSpacing: r.lineSpacing,
                content: r.content,
            });
            setSaveMsg('Da luu');
            setTimeout(() => setSaveMsg(''), 2000);
        } catch {}
        setSaving(false);
    }, []);

    // Auto-save 3s after last change
    useEffect(() => {
        if (!isDirty) return;
        clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(save, 3000);
        return () => clearTimeout(autoSaveRef.current);
    }, [isDirty, save]);

    const handlePrint = () => {
        window.print();
    };

    if (!hydrated || loading || !resume) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#6b7280' }}>Dang tai...</div>;
    }

    const { resume: r, updateContent, updateMeta } = useResumeStore.getState();
    const content = resume.content || {};
    const pi = content.personalInfo || {};
    const TemplateComponent = getTemplate(resume.template);
    const templateMeta = TEMPLATE_META.find((t) => t.id === resume.template);

    const updatePI = (key, val) => {
        useResumeStore.setState((s) => ({
            resume: { ...s.resume, content: { ...s.resume.content, personalInfo: { ...(s.resume.content.personalInfo || {}), [key]: val } } },
            isDirty: true,
        }));
    };

    const updateField = (key, val) => {
        useResumeStore.setState((s) => ({
            resume: { ...s.resume, content: { ...s.resume.content, [key]: val } },
            isDirty: true,
        }));
    };

    const updateMeta2 = (key, val) => {
        useResumeStore.setState((s) => ({ resume: { ...s.resume, [key]: val }, isDirty: true }));
    };

    /* ─── List item helpers ─── */
    const addItem = (key, template) => {
        const list = [...(content[key] || []), { id: uuid(), ...template }];
        updateField(key, list);
    };

    const removeItem = (key, itemId) => {
        updateField(key, (content[key] || []).filter((i) => i.id !== itemId));
    };

    const updateItem = (key, itemId, field, val) => {
        updateField(key, (content[key] || []).map((i) => i.id === itemId ? { ...i, [field]: val } : i));
    };

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Arial, sans-serif' }}>
            {/* ─── TOOLBAR ─── */}
            <div className="cv-toolbar" style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: '52px', background: 'white',
                borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '0 16px', zIndex: 500,
            }}>
                <button
                    onClick={() => router.push('/quan-ly-cv')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}
                >
                    <ArrowLeft size={15} /> Quan ly CV
                </button>

                <input
                    value={resume.title || ''}
                    onChange={(e) => updateMeta2('title', e.target.value)}
                    style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#111827', textAlign: 'center', background: 'transparent', minWidth: '200px' }}
                />

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {saveMsg && <span style={{ fontSize: '12px', color: '#00b14f' }}>{saveMsg}</span>}
                    <button
                        onClick={save}
                        disabled={saving}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#f3f4f6', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}
                    >
                        <Save size={14} /> {saving ? 'Dang luu...' : 'Luu'}
                    </button>
                    <button
                        onClick={handlePrint}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', background: '#00b14f', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: 'white' }}
                    >
                        <Printer size={14} /> Tai PDF
                    </button>
                </div>
            </div>

            {/* ─── LEFT PANEL ─── */}
            <div style={{
                width: '300px', flexShrink: 0, overflowY: 'auto',
                borderRight: '1px solid #e5e7eb', background: 'white',
                marginTop: '52px', paddingBottom: '40px',
            }}>
                {/* Style options */}
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mau sac</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(templateMeta?.colors || ['#00b14f', '#1e3a5f', '#c0392b']).map((c) => (
                            <button
                                key={c}
                                onClick={() => updateMeta2('color', c)}
                                style={{
                                    width: '24px', height: '24px', borderRadius: '50%', background: c,
                                    border: resume.color === c ? '2.5px solid #111827' : '2px solid transparent',
                                    cursor: 'pointer',
                                    outline: resume.color === c ? '2px solid white' : 'none',
                                    outlineOffset: '-4px',
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Personal Info */}
                <Accordion title="Thong tin ca nhan" defaultOpen>
                    <FieldInput label="Ho va ten" value={pi.fullName} onChange={(v) => updatePI('fullName', v)} placeholder="Nguyen Van A" />
                    <FieldInput label="Vi tri ung tuyen" value={pi.title} onChange={(v) => updatePI('title', v)} placeholder="Frontend Developer" />
                    <FieldInput label="Email" value={pi.email} onChange={(v) => updatePI('email', v)} type="email" />
                    <FieldInput label="So dien thoai" value={pi.phone} onChange={(v) => updatePI('phone', v)} />
                    <FieldInput label="Dia chi" value={pi.address} onChange={(v) => updatePI('address', v)} />
                    <FieldInput label="LinkedIn" value={pi.linkedin} onChange={(v) => updatePI('linkedin', v)} />
                    <FieldInput label="GitHub" value={pi.github} onChange={(v) => updatePI('github', v)} />
                </Accordion>

                {/* Objective */}
                <Accordion title="Muc tieu nghe nghiep">
                    <FieldTextarea value={content.objective} onChange={(v) => updateField('objective', v)} rows={4} placeholder="Toi la..." />
                </Accordion>

                {/* Experiences */}
                <Accordion title={`Kinh nghiem (${(content.experiences || []).length})`}>
                    {(content.experiences || []).map((exp) => (
                        <div key={exp.id} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
                            <FieldInput label="Vi tri" value={exp.position} onChange={(v) => updateItem('experiences', exp.id, 'position', v)} />
                            <FieldInput label="Cong ty" value={exp.company} onChange={(v) => updateItem('experiences', exp.id, 'company', v)} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <FieldInput label="Tu thang" value={exp.startDate} onChange={(v) => updateItem('experiences', exp.id, 'startDate', v)} placeholder="2022-01" />
                                <FieldInput label="Den thang" value={exp.endDate} onChange={(v) => updateItem('experiences', exp.id, 'endDate', v)} placeholder="2024-06" />
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#374151', marginBottom: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!exp.isCurrent} onChange={(e) => updateItem('experiences', exp.id, 'isCurrent', e.target.checked)} />
                                Hien dang lam viec tai day
                            </label>
                            <FieldTextarea label="Mo ta" value={exp.description} onChange={(v) => updateItem('experiences', exp.id, 'description', v)} />
                            <button onClick={() => removeItem('experiences', exp.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Trash2 size={12} /> Xoa
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => addItem('experiences', { position: '', company: '', startDate: '', endDate: '', isCurrent: false, description: '' })}
                        style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', background: 'white', borderRadius: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <Plus size={13} /> Them kinh nghiem
                    </button>
                </Accordion>

                {/* Education */}
                <Accordion title={`Hoc van (${(content.education || []).length})`}>
                    {(content.education || []).map((edu) => (
                        <div key={edu.id} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
                            <FieldInput label="Truong hoc" value={edu.school} onChange={(v) => updateItem('education', edu.id, 'school', v)} />
                            <FieldInput label="Bang cap / Nganh" value={edu.degree} onChange={(v) => updateItem('education', edu.id, 'degree', v)} />
                            <FieldInput label="GPA" value={edu.gpa} onChange={(v) => updateItem('education', edu.id, 'gpa', v)} placeholder="3.5/4.0" />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <FieldInput label="Nam vao" value={edu.startDate} onChange={(v) => updateItem('education', edu.id, 'startDate', v)} placeholder="2018-09" />
                                <FieldInput label="Nam ra" value={edu.endDate} onChange={(v) => updateItem('education', edu.id, 'endDate', v)} placeholder="2022-06" />
                            </div>
                            <button onClick={() => removeItem('education', edu.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Trash2 size={12} /> Xoa
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => addItem('education', { school: '', degree: '', gpa: '', startDate: '', endDate: '' })}
                        style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', background: 'white', borderRadius: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <Plus size={13} /> Them hoc van
                    </button>
                </Accordion>

                {/* Skills */}
                <Accordion title={`Ky nang (${(content.skills || []).length})`}>
                    {(content.skills || []).map((s) => (
                        <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <input
                                value={s.name || ''}
                                onChange={(e) => updateItem('skills', s.id, 'name', e.target.value)}
                                placeholder="Ten ky nang"
                                style={{ flex: 1, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                            />
                            <select
                                value={s.level || 3}
                                onChange={(e) => updateItem('skills', s.id, 'level', Number(e.target.value))}
                                style={{ padding: '6px 4px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px' }}
                            >
                                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}/5</option>)}
                            </select>
                            <button onClick={() => removeItem('skills', s.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => addItem('skills', { name: '', level: 3 })}
                        style={{ width: '100%', padding: '7px', border: '1px dashed #d1d5db', background: 'white', borderRadius: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <Plus size={13} /> Them ky nang
                    </button>
                </Accordion>

                {/* Languages */}
                <Accordion title={`Ngon ngu (${(content.languages || []).length})`}>
                    {(content.languages || []).map((l) => (
                        <div key={l.id} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                            <input
                                value={l.name || ''}
                                onChange={(e) => updateItem('languages', l.id, 'name', e.target.value)}
                                placeholder="Tieng Anh"
                                style={{ flex: 1, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                            />
                            <input
                                value={l.level || ''}
                                onChange={(e) => updateItem('languages', l.id, 'level', e.target.value)}
                                placeholder="Trung cap"
                                style={{ flex: 1, padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '12px', outline: 'none' }}
                            />
                            <button onClick={() => removeItem('languages', l.id)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}>
                                <Trash2 size={13} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => addItem('languages', { name: '', level: '' })}
                        style={{ width: '100%', padding: '7px', border: '1px dashed #d1d5db', background: 'white', borderRadius: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <Plus size={13} /> Them ngon ngu
                    </button>
                </Accordion>

                {/* Certifications */}
                <Accordion title={`Chung chi (${(content.certifications || []).length})`}>
                    {(content.certifications || []).map((cert) => (
                        <div key={cert.id} style={{ background: '#f9fafb', borderRadius: '6px', padding: '10px', marginBottom: '10px', border: '1px solid #e5e7eb' }}>
                            <FieldInput label="Ten chung chi" value={cert.name} onChange={(v) => updateItem('certifications', cert.id, 'name', v)} />
                            <FieldInput label="Don vi cap" value={cert.issuer} onChange={(v) => updateItem('certifications', cert.id, 'issuer', v)} />
                            <FieldInput label="Nam" value={cert.date} onChange={(v) => updateItem('certifications', cert.id, 'date', v)} placeholder="2023" />
                            <button onClick={() => removeItem('certifications', cert.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Trash2 size={12} /> Xoa
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })}
                        style={{ width: '100%', padding: '7px', border: '1px dashed #d1d5db', background: 'white', borderRadius: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                    >
                        <Plus size={13} /> Them chung chi
                    </button>
                </Accordion>
            </div>

            {/* ─── CV PREVIEW ─── */}
            <div style={{ flex: 1, overflowY: 'auto', background: '#525659', marginTop: '52px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 16px' }}>
                <div
                    id="cv-print-area"
                    style={{
                        width: '794px',
                        minHeight: '1123px',
                        background: 'white',
                        boxShadow: '0 4px 30px rgba(0,0,0,0.4)',
                        overflow: 'hidden',
                    }}
                >
                    <TemplateComponent
                        content={resume.content}
                        color={resume.color}
                        fontSize={resume.fontSize}
                        lineSpacing={resume.lineSpacing}
                    />
                </div>
            </div>

            <style>{`
                @media print {
                    body > * { display: none !important; }
                    #cv-print-area { display: block !important; position: fixed; inset: 0; width: 100%; height: auto; box-shadow: none; }
                }
            `}</style>
        </div>
    );
}
