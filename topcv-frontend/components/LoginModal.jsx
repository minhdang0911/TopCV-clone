'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const GREEN = '#00b14f';

/**
 * LoginModal — hiển thị popup đăng nhập khi người dùng chưa đăng nhập.
 * Props:
 *   open          — boolean, có hiển thị hay không
 *   onClose       — callback đóng modal
 *   redirectTo    — URL sẽ redirect sau khi đăng nhập (optional)
 *   message       — thông báo tuỳ chỉnh (optional)
 */
export default function LoginModal({ open, onClose, redirectTo = '', message = '' }) {
    const overlayRef = useRef(null);

    // Đóng khi nhấn Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Khoá scroll body khi mở
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const encodedRedirect = redirectTo ? encodeURIComponent(redirectTo) : '';
    // Strip /api suffix từ API URL để lấy base server URL cho OAuth
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    const serverBase = apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl.replace(/\/api$/, '');
    const googleUrl = `${serverBase}/api/auth/google${encodedRedirect ? `?redirect=${encodedRedirect}` : ''}`;
    const loginUrl = redirectTo ? `/login?redirect=${encodedRedirect}` : '/login';
    const registerUrl = redirectTo ? `/register?redirect=${encodedRedirect}` : '/register';

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                background: 'rgba(0,0,0,0.52)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backdropFilter: 'blur(2px)',
                animation: 'fadeInOverlay 0.18s ease',
            }}
        >
            <style>{`
                @keyframes fadeInOverlay { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUpModal  { from { opacity: 0; transform: translateY(24px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
                .login-modal-google-btn:hover { background: #f1f5f9 !important; }
                .login-modal-btn-primary:hover { background: #009940 !important; }
                .login-modal-link:hover { text-decoration: underline !important; }
            `}</style>

            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'white',
                    borderRadius: '20px',
                    width: '100%',
                    maxWidth: '420px',
                    boxShadow: '0 32px 72px rgba(0,0,0,0.22)',
                    overflow: 'hidden',
                    animation: 'slideUpModal 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Header xanh */}
                <div style={{
                    background: `linear-gradient(135deg, ${GREEN} 0%, #00963e 100%)`,
                    padding: '28px 28px 24px',
                    position: 'relative',
                    textAlign: 'center',
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '14px', right: '14px',
                            background: 'rgba(255,255,255,0.18)', border: 'none',
                            borderRadius: '50%', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'white', transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                    >
                        <X size={16} />
                    </button>

                    {/* Logo / icon */}
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)', margin: '0 auto 12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                        </svg>
                    </div>

                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '6px' }}>
                        Đăng nhập để tiếp tục
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.5' }}>
                        {message || 'Bạn cần đăng nhập để sử dụng tính năng này'}
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px 28px' }}>

                    {/* Nút đăng nhập Google */}
                    <a
                        href={googleUrl}
                        className="login-modal-google-btn"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: '10px', width: '100%', padding: '12px 16px',
                            border: '1.5px solid #e5e7eb', borderRadius: '10px',
                            background: 'white', textDecoration: 'none',
                            fontSize: '14px', fontWeight: '600', color: '#374151',
                            cursor: 'pointer', transition: 'background 0.15s',
                            marginBottom: '12px',
                        }}
                    >
                        {/* Google icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Tiếp tục với Google
                    </a>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>hoặc đăng nhập bằng email</span>
                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                    </div>

                    {/* Nút đăng nhập email */}
                    <a
                        href={loginUrl}
                        className="login-modal-btn-primary"
                        style={{
                            display: 'block', width: '100%', padding: '12px',
                            background: GREEN, color: 'white', border: 'none',
                            borderRadius: '10px', fontSize: '14px', fontWeight: '700',
                            cursor: 'pointer', textDecoration: 'none', textAlign: 'center',
                            transition: 'background 0.15s', marginBottom: '14px',
                        }}
                    >
                        Đăng nhập
                    </a>

                    {/* Link đăng ký */}
                    <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', margin: 0 }}>
                        Chưa có tài khoản?{' '}
                        <a
                            href={registerUrl}
                            className="login-modal-link"
                            style={{ color: GREEN, fontWeight: '600', textDecoration: 'none' }}
                        >
                            Đăng ký ngay
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
