'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/stores/auth.store';
import Image from 'next/image';
import logo from '../../assests/img/logo.png';

export default function AdminLoginPage() {
    const router = useRouter();
    const { setAuth, hydrated, isAuthenticated, role } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (hydrated && isAuthenticated && role === 'ADMIN') {
            router.replace('/admin/dashboard');
        }
    }, [hydrated, isAuthenticated, role]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) { toast.error('Vui lòng nhập đầy đủ thông tin'); return; }
        setLoading(true);
        try {
            const res = await authService.login(email, password);
            const data = res.data?.data ?? res.data;
            if (data.role !== 'ADMIN') {
                toast.error('Tài khoản này không có quyền truy cập admin');
                return;
            }
            setAuth(data.accessToken, data.refreshToken, data.role);
            toast.success('Đăng nhập thành công!');
            router.push('/admin/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f6fa' }}>

            {/* LEFT — branding panel */}
            <div style={{
                width: '420px', flexShrink: 0,
                background: 'linear-gradient(160deg, #00b14f 0%, #007a36 100%)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '40px', color: 'white',
                position: 'relative', overflow: 'hidden',
            }} className="hidden lg:flex">
                {/* decorative circles */}
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                <div style={{ position: 'absolute', bottom: -80, left: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

                <div style={{ position: 'relative', textAlign: 'center' }}>
                    {/* Shield icon — lucide */}
                    <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        background: 'rgba(255,255,255,0.15)',
                        border: '1px solid rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <ShieldCheck size={38} color="white" strokeWidth={1.8} />
                    </div>

                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 10, letterSpacing: '-0.5px' }}>
                        TopCV Admin
                    </h1>
                    <p style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.6, maxWidth: 280 }}>
                        Hệ thống quản trị nội bộ. Chỉ dành cho nhân viên và quản trị viên có thẩm quyền.
                    </p>

                    <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {['Quản lý người dùng & nhà tuyển dụng', 'Duyệt hồ sơ doanh nghiệp', 'Thống kê doanh thu & tăng trưởng', 'Quản lý nội dung Blog'].map(f => (
                            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, opacity: 0.85 }}>
                                <CheckCircle size={15} color="rgba(255,255,255,0.85)" strokeWidth={2} style={{ flexShrink: 0 }} />
                                {f}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT — form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
                <div style={{ width: '100%', maxWidth: 420 }}>

                    {/* Logo row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                        <Image src={logo} alt="TopCV Logo" width={100} height={36} style={{ objectFit: 'contain' }} />
                        <div style={{ height: 24, width: 1, background: '#e5e7eb' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Admin Portal</span>
                    </div>

                    <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111', marginBottom: 4 }}>Đăng nhập quản trị</h2>
                    <p style={{ fontSize: 13, color: '#888', marginBottom: 28 }}>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>

                    {/* Google */}
                    <button
                        onClick={handleGoogleLogin}
                        type="button"
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 10, padding: '11px 16px', borderRadius: 10,
                            border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer',
                            fontSize: 14, fontWeight: 600, color: '#374151',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 20,
                            transition: 'all 0.15s',
                        }}
                        onMouseOver={e => e.currentTarget.style.borderColor = '#00b14f'}
                        onMouseOut={e => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Tiếp tục với Google
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                        <span style={{ fontSize: 12, color: '#aaa' }}>hoặc đăng nhập bằng email</span>
                        <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        {/* Email */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin@topcv.vn"
                                required
                                style={{
                                    width: '100%', padding: '11px 14px',
                                    border: '1.5px solid #e5e7eb', borderRadius: 10,
                                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                    background: 'white', color: '#111',
                                    transition: 'border-color 0.15s',
                                }}
                                onFocus={e => e.target.style.borderColor = '#00b14f'}
                                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                                Mật khẩu
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%', padding: '11px 40px 11px 14px',
                                        border: '1.5px solid #e5e7eb', borderRadius: 10,
                                        fontSize: 14, outline: 'none', boxSizing: 'border-box',
                                        background: 'white', color: '#111',
                                        transition: 'border-color 0.15s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#00b14f'}
                                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 0 }}
                                >
                                    {showPassword
                                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px', borderRadius: 10,
                                background: loading ? '#86efac' : '#00b14f',
                                color: 'white', fontWeight: 700, fontSize: 14,
                                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                transition: 'background 0.15s',
                            }}
                        >
                            {loading && (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                            )}
                            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 28 }}>
                        ©2026 TopCV Vietnam JSC · Chỉ dành cho quản trị viên
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
