'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { X, Check } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';

const TEMPLATES = [
    {
        id: 'tieu-chuan',
        name: 'Tieu chuan',
        description: 'Gon gang, ro rang, phu hop moi nganh nghe',
        colors: ['#00b14f', '#1e3a5f', '#c0392b', '#2471a3', '#6c3483'],
        tags: ['Pho bien', 'Chuyen nghiep'],
        preview: 'two-col',
    },
    {
        id: 'tieu-chuan-it-kn',
        name: 'Tieu chuan (it kinh nghiem)',
        description: 'Toi uu cho sinh vien, fresher can viec lam dau tien',
        colors: ['#00b14f', '#1e3a5f', '#e67e22', '#16a085'],
        tags: ['Sinh vien', 'Fresher'],
        preview: 'single-col',
    },
    {
        id: 'an-tuong',
        name: 'An tuong',
        description: 'Noi bat voi header dam, phu hop vi tri senior/design',
        colors: ['#1e3a5f', '#111827', '#7b2d8b', '#c0392b'],
        tags: ['An tuong', 'Sang tao'],
        preview: 'dark-header',
    },
];

function TemplatePreviewSVG({ template, color }) {
    const c = color || template.colors[0];

    if (template.preview === 'two-col') {
        return (
            <svg viewBox="0 0 200 260" style={{ width: '100%', height: '100%' }}>
                {/* Left sidebar */}
                <rect x="0" y="0" width="65" height="260" fill={c} />
                {/* Avatar placeholder */}
                <circle cx="32" cy="36" r="22" fill="white" fillOpacity="0.25" />
                {/* Name lines */}
                <rect x="8" y="64" width="50" height="5" rx="2" fill="white" fillOpacity="0.8" />
                <rect x="12" y="73" width="42" height="3" rx="1.5" fill="white" fillOpacity="0.5" />
                {/* Sidebar sections */}
                {[90, 120, 150, 180].map((y) => (
                    <g key={y}>
                        <rect x="8" y={y} width="30" height="3" rx="1.5" fill="white" fillOpacity="0.7" />
                        <rect x="8" y={y + 7} width="50" height="2" rx="1" fill="white" fillOpacity="0.4" />
                        <rect x="8" y={y + 12} width="45" height="2" rx="1" fill="white" fillOpacity="0.4" />
                    </g>
                ))}
                {/* Main content */}
                <rect x="75" y="16" width="80" height="6" rx="2" fill={c} />
                <rect x="75" y="26" width="60" height="3" rx="1.5" fill="#9ca3af" />
                {/* Experience section */}
                {[45, 90, 140, 185].map((y) => (
                    <g key={y}>
                        <rect x="75" y={y} width="50" height="3" rx="1.5" fill={c} fillOpacity="0.8" />
                        <rect x="75" y={y + 7} width="110" height="2" rx="1" fill="#d1d5db" />
                        <rect x="75" y={y + 12} width="95" height="2" rx="1" fill="#d1d5db" />
                        <rect x="75" y={y + 17} width="105" height="2" rx="1" fill="#d1d5db" />
                    </g>
                ))}
            </svg>
        );
    }

    if (template.preview === 'single-col') {
        return (
            <svg viewBox="0 0 200 260" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="200" height="55" fill={c} />
                <rect x="16" y="14" width="80" height="6" rx="2" fill="white" />
                <rect x="16" y="24" width="55" height="3" rx="1.5" fill="white" fillOpacity="0.7" />
                <rect x="16" y="32" width="120" height="2" rx="1" fill="white" fillOpacity="0.5" />
                {[68, 110, 155, 200].map((y) => (
                    <g key={y}>
                        <rect x="16" y={y} width="40" height="4" rx="1.5" fill={c} />
                        <rect x="0" y={y + 8} width="200" height="1" fill="#e5e7eb" />
                        <rect x="16" y={y + 14} width="165" height="2" rx="1" fill="#d1d5db" />
                        <rect x="16" y={y + 19} width="140" height="2" rx="1" fill="#d1d5db" />
                        <rect x="16" y={y + 24} width="155" height="2" rx="1" fill="#e5e7eb" />
                    </g>
                ))}
            </svg>
        );
    }

    if (template.preview === 'dark-header') {
        return (
            <svg viewBox="0 0 200 260" style={{ width: '100%', height: '100%' }}>
                <rect x="0" y="0" width="200" height="70" fill={c} />
                <circle cx="30" cy="35" r="22" fill="white" fillOpacity="0.15" />
                <rect x="60" y="18" width="90" height="7" rx="2" fill="white" />
                <rect x="60" y="30" width="70" height="4" rx="2" fill="white" fillOpacity="0.7" />
                <rect x="60" y="38" width="110" height="2" rx="1" fill="white" fillOpacity="0.5" />
                <rect x="60" y="44" width="80" height="2" rx="1" fill="white" fillOpacity="0.5" />
                {[80, 120, 165, 210].map((y) => (
                    <g key={y}>
                        <rect x="16" y={y} width="45" height="4" rx="1.5" fill={c} />
                        <rect x="0" y={y + 8} width="200" height="1" fill="#e5e7eb" />
                        <rect x="16" y={y + 14} width="165" height="2" rx="1" fill="#d1d5db" />
                        <rect x="16" y={y + 19} width="130" height="2" rx="1" fill="#d1d5db" />
                        <rect x="16" y={y + 24} width="150" height="2" rx="1" fill="#e5e7eb" />
                    </g>
                ))}
            </svg>
        );
    }

    return null;
}

function PreviewModal({ template, selectedColor, onColorChange, onUse, onClose }) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{
                background: 'white',
                borderRadius: '16px',
                display: 'flex',
                overflow: 'hidden',
                maxWidth: '800px',
                width: '100%',
                maxHeight: '90vh',
            }}>
                {/* Preview */}
                <div style={{ flex: 1, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ width: '280px', aspectRatio: '210/297', background: 'white', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                        <TemplatePreviewSVG template={template} color={selectedColor} />
                    </div>
                </div>

                {/* Side panel */}
                <div style={{ width: '240px', padding: '24px', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e5e7eb' }}>
                    <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                        <X size={20} />
                    </button>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{template.name}</h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '20px' }}>{template.description}</p>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Mau sac</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {template.colors.map((c) => (
                                <button
                                    key={c}
                                    onClick={() => onColorChange(c)}
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: c,
                                        border: selectedColor === c ? '3px solid #111827' : '2px solid transparent',
                                        cursor: 'pointer',
                                        outline: selectedColor === c ? '2px solid white' : 'none',
                                        outlineOffset: '-4px',
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={onUse}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '11px',
                            background: '#00b14f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: 'auto',
                        }}
                    >
                        <Check size={16} /> Dung mau nay
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px',
                            background: 'white',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginTop: '8px',
                        }}
                    >
                        Dong lai
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function TaoCvPage() {
    const router = useRouter();
    const { isAuthenticated, hydrated } = useAuthStore();
    const [preview, setPreview] = useState(null);
    const [selectedColors, setSelectedColors] = useState(
        Object.fromEntries(TEMPLATES.map((t) => [t.id, t.colors[0]])),
    );
    const [creating, setCreating] = useState(false);

    const handleUseTemplate = async (templateId, color) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setCreating(true);
        try {
            const res = await resumeService.create({
                type: 'resume',
                template: templateId,
                color,
            });
            router.push(`/tao-cv/${res.data.id}`);
        } catch {
            setCreating(false);
        }
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '32px 16px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Page header */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>
                        Chon mau CV phu hop voi ban
                    </h1>
                    <p style={{ fontSize: '15px', color: '#6b7280' }}>
                        Hon 20 mau CV chuyen nghiep, mien phi, tu chon mau sac
                    </p>
                </div>

                {/* Filters (UI only) */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px', justifyContent: 'center' }}>
                    {['Tat ca', 'Mau CV Don gian', 'Mau CV An tuong', 'Mau CV Chuyen nghiep', 'Mau CV Harvard'].map((tag) => (
                        <button
                            key={tag}
                            style={{
                                padding: '7px 18px',
                                borderRadius: '20px',
                                border: tag === 'Tat ca' ? 'none' : '1px solid #e5e7eb',
                                background: tag === 'Tat ca' ? '#00b14f' : 'white',
                                color: tag === 'Tat ca' ? 'white' : '#374151',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                {/* Template grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                    {TEMPLATES.map((tpl) => {
                        const color = selectedColors[tpl.id];
                        return (
                            <div
                                key={tpl.id}
                                style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                            >
                                {/* Preview thumbnail */}
                                <div
                                    style={{ height: '280px', background: '#f9fafb', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
                                    onClick={() => setPreview(tpl)}
                                >
                                    <div style={{ position: 'absolute', inset: '12px' }}>
                                        <TemplatePreviewSVG template={tpl} color={color} />
                                    </div>

                                    {/* Hover overlay */}
                                    <div className="tpl-overlay" style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'rgba(0,0,0,0)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'background 0.2s',
                                    }}>
                                    </div>
                                </div>

                                {/* Tags */}
                                <div style={{ padding: '12px 16px 0' }}>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                        {tpl.tags.map((tag) => (
                                            <span key={tag} style={{
                                                padding: '2px 8px',
                                                background: '#f3f4f6',
                                                color: '#6b7280',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '500',
                                            }}>{tag}</span>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                                        {tpl.name}
                                    </div>
                                </div>

                                {/* Color dots */}
                                <div style={{ padding: '0 16px 12px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                    {tpl.colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setSelectedColors((prev) => ({ ...prev, [tpl.id]: c }))}
                                            style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: c,
                                                border: color === c ? '2.5px solid #111827' : '2px solid transparent',
                                                cursor: 'pointer',
                                                outline: color === c ? '2px solid white' : 'none',
                                                outlineOffset: '-4px',
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Actions */}
                                <div style={{ padding: '0 12px 12px', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => setPreview(tpl)}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            border: '1px solid #e5e7eb',
                                            background: 'white',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            color: '#374151',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Xem truoc
                                    </button>
                                    <button
                                        onClick={() => handleUseTemplate(tpl.id, color)}
                                        disabled={creating}
                                        style={{
                                            flex: 1,
                                            padding: '8px',
                                            border: 'none',
                                            background: '#00b14f',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            color: 'white',
                                            cursor: creating ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                        }}
                                    >
                                        Dung mau nay
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {preview && (
                <PreviewModal
                    template={preview}
                    selectedColor={selectedColors[preview.id]}
                    onColorChange={(c) => setSelectedColors((prev) => ({ ...prev, [preview.id]: c }))}
                    onUse={() => {
                        setPreview(null);
                        handleUseTemplate(preview.id, selectedColors[preview.id]);
                    }}
                    onClose={() => setPreview(null)}
                />
            )}
        </div>
    );
}
