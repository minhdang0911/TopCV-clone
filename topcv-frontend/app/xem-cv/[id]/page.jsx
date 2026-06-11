'use client';

import { createElement, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { resumeService } from '@/services/resume.service';
import { getTemplate } from '@/app/components/cv/templateRegistry';

export default function ViewCvPage() {
    const params = useParams();
    const id = params?.id;
    const [resume, setResume] = useState(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);

    useEffect(() => {
        import('@/lib/axios')
            .then(({ default: api }) => api.get(`/resumes/${id}/view`))
            .then((res) => setResume(res.data?.data || res.data))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5',
                }}
            >
                <div style={{ fontSize: '14px', color: '#888' }}>Đang tải...</div>
            </div>
        );
    }

    if (!resume) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '15px', color: '#888' }}>CV không tồn tại hoặc đã bị xóa.</div>
            </div>
        );
    }

    const TemplateComponent = getTemplate(resume.template);
    const ownerName = resume.content?.personalInfo?.fullName || 'Ứng viên';

    return (
        <>
            <style>{`
                @media print {
                    .cv-topbar { display: none !important; }
                    body { margin: 0; }
                    .cv-viewer-bg { background: white !important; padding: 0 !important; }
                }
            `}</style>

            {/* Top bar */}
            <div
                className="cv-topbar"
                style={{
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    padding: '0 24px',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                }}
            >
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>
                    Xem CV Online của {ownerName}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => window.print()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'none',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '7px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            color: '#555',
                            fontWeight: '500',
                        }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <path
                                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                        Tải CV PDF
                    </button>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href).catch(() => {});
                            toast.success('Đã copy link!');
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'none',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            padding: '7px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            color: '#555',
                            fontWeight: '500',
                        }}
                    >
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
                            <path
                                d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            />
                        </svg>
                        Copy CV
                    </button>
                </div>
            </div>

            {/* Document */}
            <div
                className="cv-viewer-bg"
                style={{
                    background: '#e8e8e8',
                    minHeight: 'calc(100vh - 52px)',
                    padding: '40px 0',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <div ref={printRef} style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)', background: 'white' }}>
                    {createElement(TemplateComponent, {
                        content: resume.content,
                        color: resume.color,
                        fontSize: resume.fontSize,
                        lineSpacing: resume.lineSpacing,
                        background: resume.background,
                    })}
                </div>
            </div>
        </>
    );
}
