'use client';

import { createElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CL_TEMPLATE_META, getCLTemplate, DEFAULT_CL_CONTENT } from '@/app/components/cover-letter/templateRegistry';
import { coverLetterService } from '@/services/cover-letter.service';
import useAuthStore from '@/stores/auth.store';

const A4_W = 794;
const CARD_W = 200;
const SCALE = CARD_W / A4_W;
const CARD_H = Math.round(1123 * SCALE);

const FILTER_TAGS = ['Tất cả', 'Chuyên nghiệp', 'Sáng tạo', 'Màu sắc'];

function Thumbnail({ templateId, color, font }) {
    const Component = getCLTemplate(templateId);
    return (
        <div style={{ width: `${CARD_W}px`, height: `${CARD_H}px`, overflow: 'hidden', position: 'relative', borderRadius: '4px' }}>
            <div style={{ transform: `scale(${SCALE})`, transformOrigin: 'top left', width: `${A4_W}px`, pointerEvents: 'none', userSelect: 'none' }}>
                {createElement(Component, { content: DEFAULT_CL_CONTENT, color, font })}
            </div>
        </div>
    );
}

function TemplateCard({ meta, onUse, onPreview }) {
    const [hovered, setHovered] = useState(false);
    const [selectedColor, setSelectedColor] = useState(meta.defaultColor);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
                style={{ position: 'relative', cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <Thumbnail templateId={meta.id} color={selectedColor} font={meta.defaultFont} />

                {hovered && (
                    <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    }}>
                        <button
                            onClick={() => onPreview(meta, selectedColor)}
                            style={{ background: 'white', color: '#1a1a1a', border: 'none', borderRadius: '6px', padding: '8px 20px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', width: '130px' }}
                        >
                            Xem trước
                        </button>
                        <button
                            onClick={() => onUse(meta, selectedColor)}
                            style={{ background: '#00b14f', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 20px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', width: '130px' }}
                        >
                            Dùng mẫu này
                        </button>
                    </div>
                )}
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {meta.tags.map(t => (
                    <span key={t} style={{ fontSize: '11px', background: '#f0faf5', color: '#00b14f', border: '1px solid #d1fae5', borderRadius: '4px', padding: '2px 7px' }}>{t}</span>
                ))}
            </div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a1a' }}>{meta.name}</div>

            {/* Color swatches */}
            <div style={{ display: 'flex', gap: '6px' }}>
                {meta.colors.map(col => (
                    <button
                        key={col}
                        onClick={() => setSelectedColor(col)}
                        style={{
                            width: '20px', height: '20px', borderRadius: '50%', background: col, border: 'none', cursor: 'pointer',
                            outline: selectedColor === col ? `2px solid ${col}` : 'none',
                            outlineOffset: '2px',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

function PreviewModal({ meta, color, onClose, onUse }) {
    const Component = getCLTemplate(meta.id);
    const PREVIEW_W = 620;
    const PREVIEW_SCALE = PREVIEW_W / A4_W;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflow: 'auto', padding: '40px 20px' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', maxWidth: '900px', width: '100%' }}>
                {/* Template preview */}
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, width: `${PREVIEW_W}px`, height: `${Math.round(1123 * PREVIEW_SCALE)}px` }}>
                    <div style={{ transform: `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', width: `${A4_W}px`, pointerEvents: 'none' }}>
                        {createElement(Component, { content: DEFAULT_CL_CONTENT, color, font: meta.defaultFont })}
                    </div>
                </div>

                {/* Right panel */}
                <div style={{ background: 'white', borderRadius: '8px', padding: '24px', width: '200px', flexShrink: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#00b14f', marginBottom: '20px' }}>
                        Mẫu Cover Letter {meta.name}
                    </div>
                    <button
                        onClick={onUse}
                        style={{ width: '100%', background: '#00b14f', color: 'white', border: 'none', borderRadius: '6px', padding: '10px', fontWeight: '600', fontSize: '13px', cursor: 'pointer', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        Dùng mẫu này
                    </button>
                    <button
                        onClick={onClose}
                        style={{ width: '100%', background: 'white', color: '#555', border: '1px solid #ddd', borderRadius: '6px', padding: '10px', fontWeight: '500', fontSize: '13px', cursor: 'pointer' }}
                    >
                        Đóng lại
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function MauCoverLetterPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();
    const [activeFilter, setActiveFilter] = useState('Tất cả');
    const [preview, setPreview] = useState(null);
    const [creating, setCreating] = useState(false);

    const filtered = activeFilter === 'Tất cả'
        ? CL_TEMPLATE_META
        : CL_TEMPLATE_META.filter(m => m.tags.includes(activeFilter));

    async function handleUse(meta, color) {
        if (!isAuthenticated) { router.push('/dang-nhap'); return; }
        if (creating) return;
        setCreating(true);
        try {
            const res = await coverLetterService.create({
                templateId: meta.id,
                color,
                font: meta.defaultFont,
                content: DEFAULT_CL_CONTENT,
            });
            const id = res.data?.data?.id;
            if (id) router.push(`/sua-cover-letter/${id}`);
        } finally {
            setCreating(false);
        }
    }

    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            {/* Banner */}
            <div style={{ background: 'white', padding: '32px 0', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#00b14f', marginBottom: '8px' }}>
                                Danh sách mẫu Cover Letter xin việc tiếng Anh / Việt chuẩn 2026
                            </h1>
                            <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
                                Các mẫu Cover Letter được thiết kế theo chuẩn, theo các ngành nghề. Phù hợp với sinh viên và người đi làm.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px', display: 'flex', gap: '24px' }}>
                {/* Left filter panel */}
                <div style={{ width: '220px', flexShrink: 0 }}>
                    <div style={{ background: 'white', borderRadius: '8px', padding: '16px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Sắp xếp</div>
                        {FILTER_TAGS.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveFilter(tag)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    width: '100%', background: 'none', border: 'none', padding: '8px 4px',
                                    cursor: 'pointer', fontSize: '13px', color: '#444', textAlign: 'left',
                                }}
                            >
                                <span style={{
                                    width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0,
                                    border: `2px solid ${activeFilter === tag ? '#00b14f' : '#ccc'}`,
                                    background: activeFilter === tag ? '#00b14f' : 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {activeFilter === tag && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="white" strokeWidth="2" fill="none"/></svg>}
                                </span>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template grid */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {filtered.map(meta => (
                            <TemplateCard
                                key={meta.id}
                                meta={meta}
                                onUse={handleUse}
                                onPreview={(m, c) => setPreview({ meta: m, color: c })}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {preview && (
                <PreviewModal
                    meta={preview.meta}
                    color={preview.color}
                    onClose={() => setPreview(null)}
                    onUse={() => { setPreview(null); handleUse(preview.meta, preview.color); }}
                />
            )}
        </div>
    );
}
