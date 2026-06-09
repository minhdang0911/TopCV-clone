'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Eye, Download, MoreVertical, FileText } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { resumeService } from '@/services/resume.service';

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const TEMPLATE_COLORS = {
    '#00b14f': '#00b14f',
    '#1e3a5f': '#1e3a5f',
    '#c0392b': '#c0392b',
    '#2471a3': '#2471a3',
    '#6c3483': '#6c3483',
};

export default function QuanLyCvPage() {
    const router = useRouter();
    const { user, hydrated, isAuthenticated } = useAuthStore();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [menuOpenId, setMenuOpenId] = useState(null);

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        resumeService.list('resume').then((res) => {
            setResumes(res.data);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [isAuthenticated]);

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc chắn muốn xóa CV này?')) return;
        setDeletingId(id);
        try {
            await resumeService.remove(id);
            setResumes((prev) => prev.filter((r) => r.id !== id));
        } catch {}
        setDeletingId(null);
        setMenuOpenId(null);
    };

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 16px' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            CV da tao tren TopCV
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                            {resumes.length} CV
                        </p>
                    </div>
                    <Link
                        href="/tao-cv"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '10px 20px',
                            background: '#00b14f',
                            color: 'white',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textDecoration: 'none',
                        }}
                    >
                        <Plus size={16} />
                        Tao CV
                    </Link>
                </div>

                {/* Banner */}
                <div style={{
                    background: 'linear-gradient(135deg, #00b14f 0%, #007a35 100%)',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    marginBottom: '24px',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                }}>
                    <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
                            Ung vien duoc NTD chu dong tiep can tang 28% trong tuan vua roi
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>
                            Cap nhat CV de khong bo lo co hoi
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link
                            href="/tao-cv"
                            style={{
                                padding: '8px 18px',
                                background: 'white',
                                color: '#00b14f',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                textDecoration: 'none',
                            }}
                        >
                            Cap nhat CV
                        </Link>
                        <Link
                            href="/tai-cv-len"
                            style={{
                                padding: '8px 18px',
                                background: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                border: '1px solid rgba(255,255,255,0.3)',
                            }}
                        >
                            Tai CV len
                        </Link>
                    </div>
                </div>

                {/* CV List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                        Dang tai...
                    </div>
                ) : resumes.length === 0 ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '60px 24px',
                        textAlign: 'center',
                        border: '2px dashed #e5e7eb',
                    }}>
                        <FileText size={48} color="#d1d5db" style={{ margin: '0 auto 16px' }} />
                        <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                            Ban chua co CV nao
                        </p>
                        <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                            Tao CV de tang co hoi duoc cac nha tuyen dung tim thay
                        </p>
                        <Link
                            href="/tao-cv"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 24px',
                                background: '#00b14f',
                                color: 'white',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                textDecoration: 'none',
                            }}
                        >
                            <Plus size={16} /> Tao CV ngay
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                        {resumes.map((cv) => (
                            <div
                                key={cv.id}
                                style={{
                                    background: 'white',
                                    borderRadius: '10px',
                                    border: '1px solid #e5e7eb',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                {/* Preview area */}
                                <div
                                    style={{
                                        height: '200px',
                                        background: '#f9fafb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderBottom: `3px solid ${cv.color || '#00b14f'}`,
                                        cursor: 'pointer',
                                    }}
                                    onClick={() => router.push(`/tao-cv/${cv.id}`)}
                                >
                                    <FileText size={48} color={cv.color || '#00b14f'} style={{ opacity: 0.4 }} />
                                </div>

                                {/* Actions overlay on hover */}
                                <div
                                    className="cv-actions"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '200px',
                                        background: 'rgba(0,0,0,0.45)',
                                        display: 'none',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    <button
                                        onClick={() => router.push(`/tao-cv/${cv.id}`)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#00b14f',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Chinh sua
                                    </button>
                                </div>

                                {/* Info */}
                                <div style={{ padding: '12px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {cv.title}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '10px' }}>
                                        Cap nhat: {formatDate(cv.updatedAt)}
                                    </div>

                                    {/* Actions row */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <button
                                            onClick={() => router.push(`/tao-cv/${cv.id}`)}
                                            style={{
                                                flex: 1,
                                                padding: '6px',
                                                background: '#f3f4f6',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                color: '#374151',
                                                cursor: 'pointer',
                                                marginRight: '6px',
                                            }}
                                        >
                                            Chinh sua
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cv.id)}
                                            disabled={deletingId === cv.id}
                                            style={{
                                                padding: '6px 10px',
                                                background: '#fee2e2',
                                                border: 'none',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
