'use client';

import { createElement, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { coverLetterService } from '@/services/cover-letter.service';
import { CL_TEMPLATE_META, CL_TEMPLATE_REGISTRY, FONT_OPTIONS, getCLTemplate } from '@/app/components/cover-letter/templateRegistry';

const A4_W = 794;

const COLOR_PRESETS = ['#1e3a5f', '#c0392b', '#2c3e7a', '#e67e22', '#27ae60', '#16a085', '#8e44ad', '#2d3436'];

function Field({ label, value, onChange, multiline = false, rows = 3 }) {
    return (
        <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</label>
            {multiline ? (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    rows={rows}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.5 }}
                    onFocus={(e) => (e.target.style.borderColor = '#00b14f')}
                    onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                />
            ) : (
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={(e) => (e.target.style.borderColor = '#00b14f')}
                    onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                />
            )}
        </div>
    );
}

export default function CoverLetterEditorPage() {
    const params = useParams();
    const id = params?.id;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [tab, setTab] = useState('content'); // 'content' | 'design' | 'template'
    const [showSaved, setShowSaved] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [showChangeTpl, setShowChangeTpl] = useState(false);
    const avatarInputRef = useRef(null);

    const [title, setTitle] = useState('Cover Letter chưa đặt tên');
    const [templateId, setTemplateId] = useState('tinh-te-1');
    const [color, setColor] = useState('#1e3a5f');
    const [font, setFont] = useState('Muli');
    const [fontSize, setFontSize] = useState('medium');
    const [lineSpacing, setLineSpacing] = useState(1.5);
    const [content, setContent] = useState({});

    const previewScale = typeof window !== 'undefined' ? Math.min(0.65, (window.innerWidth - 400) / A4_W) : 0.65;

    useEffect(() => {
        coverLetterService.getById(id)
            .then((res) => {
                const cl = res.data?.data;
                if (!cl) { router.replace('/quan-ly-cv'); return; }
                setTitle(cl.title);
                setTemplateId(cl.templateId);
                setColor(cl.color);
                setFont(cl.font);
                setFontSize(cl.fontSize);
                setLineSpacing(cl.lineSpacing);
                setContent(cl.content || {});
            })
            .catch(() => router.replace('/quan-ly-cv'))
            .finally(() => setLoading(false));
    }, [id, router]);

    useEffect(() => {
        const handler = (e) => {
            if (isDirty) e.preventDefault();
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    function markDirty() { setIsDirty(true); }

    function updateContent(field, value) {
        setContent(prev => ({ ...prev, [field]: value }));
        markDirty();
    }

    async function handleSave() {
        if (saving) return;
        setSaving(true);
        try {
            await coverLetterService.update(id, { title, templateId, color, font, fontSize, lineSpacing, content });
            setIsDirty(false);
            setShowSaved(true);
            setTimeout(() => setShowSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    }

    async function handleAvatarUpload(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarUploading(true);
        try {
            const res = await coverLetterService.uploadAvatar(file);
            const url = res.data?.data?.url;
            if (url) updateContent('avatarUrl', url);
        } finally {
            setAvatarUploading(false);
        }
    }

    function handleBackClick() {
        if (isDirty) {
            if (confirm('Bạn có thay đổi chưa lưu. Rời trang sẽ mất dữ liệu. Tiếp tục?')) {
                router.push('/quan-ly-cv');
            }
        } else {
            router.push('/quan-ly-cv');
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <div style={{ fontSize: '14px', color: '#888' }}>Đang tải...</div>
            </div>
        );
    }

    const TemplateComponent = getCLTemplate(templateId);

    return (
        <div style={{ minHeight: '100vh', background: '#e8e8e8', display: 'flex', flexDirection: 'column' }}>
            {/* Toolbar */}
            <div style={{ background: 'white', borderBottom: '1px solid #ddd', padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center', gap: '12px', position: 'sticky', top: 0, zIndex: 100 }}>
                {/* Back */}
                <button onClick={handleBackClick} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', color: '#555' }}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                </button>

                <input
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); markDirty(); }}
                    style={{ border: 'none', outline: 'none', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', background: 'transparent', minWidth: '200px' }}
                />

                <div style={{ flex: 1 }} />

                {/* Color swatches */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {COLOR_PRESETS.map(c => (
                        <button key={c} onClick={() => { setColor(c); markDirty(); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: color === c ? `2px solid ${c}` : '2px solid transparent', outlineOffset: '2px' }} />
                    ))}
                </div>

                {/* Font */}
                <select
                    value={font}
                    onChange={(e) => { setFont(e.target.value); markDirty(); }}
                    style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', outline: 'none', background: 'white', cursor: 'pointer' }}
                >
                    {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>

                {/* Font size */}
                <div style={{ display: 'flex', gap: '2px' }}>
                    {['small', 'medium', 'large'].map((s, i) => (
                        <button key={s} onClick={() => { setFontSize(s); markDirty(); }} style={{ padding: '4px 6px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: fontSize === s ? '#f0f0f0' : 'white', fontSize: [11, 13, 15][i] + 'px', fontWeight: '600', color: '#555', lineHeight: 1 }}>A</button>
                    ))}
                </div>

                {/* Line spacing */}
                <div style={{ display: 'flex', gap: '2px' }}>
                    {[1.2, 1.5, 1.8].map(ls => (
                        <button key={ls} onClick={() => { setLineSpacing(ls); markDirty(); }} title={`Giãn dòng ${ls}`} style={{ padding: '4px 6px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: lineSpacing === ls ? '#f0f0f0' : 'white', fontSize: '12px', color: '#555' }}>
                            {ls === 1.2 ? 'I' : ls === 1.5 ? 'Ī' : 'Ī̄'}
                        </button>
                    ))}
                </div>

                {/* Change template */}
                <button onClick={() => setShowChangeTpl(true)} style={{ border: '1px solid #ddd', background: 'white', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.8"/></svg>
                    Đổi mẫu
                </button>

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{ background: '#00b14f', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 18px', fontSize: '13px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                    {saving ? 'Đang lưu...' : 'Lưu CV'}
                </button>
            </div>

            {/* Saved toast */}
            {showSaved && (
                <div style={{ position: 'fixed', top: '64px', left: '50%', transform: 'translateX(-50%)', background: '#00b14f', color: 'white', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', zIndex: 200, boxShadow: '0 4px 12px rgba(0,177,79,0.3)' }}>
                    Lưu thành công!
                </div>
            )}

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Preview area */}
                <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px' }}>
                    <div style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top center',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                        pointerEvents: 'none',
                    }}>
                        {createElement(TemplateComponent, { content, color, font, fontSize, lineSpacing })}
                    </div>
                </div>

                {/* Right edit panel */}
                <div style={{ width: '320px', flexShrink: 0, background: 'white', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {/* Tab bar */}
                    <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                        {[['content', 'Nội dung'], ['sender', 'Người gửi']].map(([key, label]) => (
                            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: tab === key ? '#00b14f' : '#888', borderBottom: tab === key ? '2px solid #00b14f' : '2px solid transparent' }}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                        {tab === 'sender' && (
                            <>
                                {/* Avatar upload */}
                                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                                    <div
                                        onClick={() => avatarInputRef.current?.click()}
                                        style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '2px dashed #ccc', margin: '0 auto 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', position: 'relative' }}
                                    >
                                        {content.avatarUrl
                                            ? <img src={content.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#aaa" strokeWidth="1.8"/><circle cx="12" cy="13" r="4" stroke="#aaa" strokeWidth="1.8"/></svg>
                                        }
                                    </div>
                                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
                                    <div style={{ fontSize: '11px', color: '#888' }}>{avatarUploading ? 'Đang tải...' : 'Click để đổi ảnh'}</div>
                                </div>
                                <Field label="Họ và tên" value={content.fullName} onChange={v => updateContent('fullName', v)} />
                                <Field label="Vị trí" value={content.jobTitle} onChange={v => updateContent('jobTitle', v)} />
                                <Field label="Số điện thoại" value={content.phone} onChange={v => updateContent('phone', v)} />
                                <Field label="Email" value={content.email} onChange={v => updateContent('email', v)} />
                                <Field label="Địa chỉ" value={content.address} onChange={v => updateContent('address', v)} />
                            </>
                        )}

                        {tab === 'content' && (
                            <>
                                <Field label="Tên người nhận" value={content.recipientName} onChange={v => updateContent('recipientName', v)} />
                                <Field label="Phòng ban / Vị trí" value={content.department} onChange={v => updateContent('department', v)} />
                                <Field label="Tên công ty" value={content.company} onChange={v => updateContent('company', v)} />
                                <Field label="Địa chỉ công ty" value={content.companyAddress} onChange={v => updateContent('companyAddress', v)} />
                                <Field label="Vị trí ứng tuyển" value={content.position} onChange={v => updateContent('position', v)} />
                                <Field label="Nội dung thư" value={content.body} onChange={v => updateContent('body', v)} multiline rows={12} />
                            </>
                        )}
                    </div>

                    {/* Bottom: view link */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #eee', display: 'flex', gap: '8px' }}>
                        <button
                            onClick={async () => {
                                await handleSave();
                                window.open(`/xem-cover-letter/${id}`, '_blank');
                            }}
                            style={{ flex: 1, background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '6px', padding: '8px', fontSize: '12px', cursor: 'pointer', color: '#555', fontWeight: '500' }}
                        >
                            Xem
                        </button>
                    </div>
                </div>
            </div>

            {/* Change template modal */}
            {showChangeTpl && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={(e) => { if (e.target === e.currentTarget) setShowChangeTpl(false); }}
                >
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '700px', maxHeight: '80vh', overflow: 'auto' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>Chọn mẫu Cover Letter</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {CL_TEMPLATE_META.map(meta => {
                                const Comp = getCLTemplate(meta.id);
                                const S = 180 / A4_W;
                                return (
                                    <div
                                        key={meta.id}
                                        onClick={() => { setTemplateId(meta.id); setColor(meta.defaultColor); setFont(meta.defaultFont); markDirty(); setShowChangeTpl(false); }}
                                        style={{ cursor: 'pointer', border: `2px solid ${templateId === meta.id ? '#00b14f' : '#eee'}`, borderRadius: '8px', overflow: 'hidden', padding: '4px' }}
                                    >
                                        <div style={{ height: `${Math.round(1123 * S)}px`, overflow: 'hidden', position: 'relative' }}>
                                            <div style={{ transform: `scale(${S})`, transformOrigin: 'top left', width: `${A4_W}px`, pointerEvents: 'none' }}>
                                                {createElement(Comp, { content, color: meta.defaultColor, font: meta.defaultFont })}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: '600', textAlign: 'center', padding: '4px 0', color: '#333' }}>{meta.name}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
