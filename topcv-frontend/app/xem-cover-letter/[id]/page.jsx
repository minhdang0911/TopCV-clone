'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { coverLetterService } from '@/services/cover-letter.service';
import { getCLTemplate } from '@/app/components/cover-letter/templateRegistry';

export default function ViewCoverLetterPage() {
    const params = useParams();
    const id = params?.id;
    const [cl, setCl] = useState(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);

    useEffect(() => {
        coverLetterService.getById(id)
            .then(res => setCl(res.data?.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    function handleDownload() {
        window.print();
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
                <div style={{ fontSize: '14px', color: '#888' }}>Đang tải...</div>
            </div>
        );
    }

    if (!cl) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '15px', color: '#888' }}>Cover letter không tồn tại hoặc đã bị xóa.</div>
            </div>
        );
    }

    const TemplateComponent = getCLTemplate(cl.templateId);
    const ownerName = cl.content?.fullName || 'Ứng viên';

    return (
        <>
            <style>{`
                @media print {
                    .cl-topbar { display: none !important; }
                    body { margin: 0; }
                    .cl-viewer-bg { background: white !important; padding: 0 !important; }
                }
            `}</style>

            {/* Top bar */}
            <div className="cl-topbar" style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                    Xem Cover Letter Online của {ownerName}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleDownload}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', color: '#555', fontWeight: '500' }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                        Tải Cover Letter PDF
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href).catch(() => {});
                            toast.success('Đã copy link!');
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #ddd', borderRadius: '6px', padding: '7px 14px', fontSize: '13px', cursor: 'pointer', color: '#555', fontWeight: '500' }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.8"/></svg>
                        Copy
                    </button>
                </div>
            </div>

            {/* Document */}
            <div className="cl-viewer-bg" style={{ background: '#e8e8e8', minHeight: 'calc(100vh - 52px)', padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                <div ref={printRef} style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)', background: 'white' }}>
                    {createElement(TemplateComponent, {
                        content: cl.content,
                        color: cl.color,
                        font: cl.font,
                        fontSize: cl.fontSize,
                        lineSpacing: cl.lineSpacing,
                    })}
                </div>
            </div>
        </>
    );
}
