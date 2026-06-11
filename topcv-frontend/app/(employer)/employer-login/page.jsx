'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import logo from '../../assests/img/logo.png';
import employerBg from '../../assests/img/background-employ.webp';
import backgroundGrid from '../../assests/img/background-grid.svg';

export default function EmployerLoginPage() {
    const router = useRouter();
    const { setAuth, hydrated, isAuthenticated, role } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hydrated && isAuthenticated && role === 'EMPLOYER') {
            router.replace('/nha-tuyen-dung');
        }
    }, [hydrated, isAuthenticated, role]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authService.login(email, password);
            const data = res.data?.data ?? res.data;

            if (data.require2FA) {
                router.push(`/verify-otp?email=${data.email}&type=two_factor_login&role=${data.role}`);
                return;
            }

            if (data.role !== 'EMPLOYER') {
                setError('Tài khoản này không phải nhà tuyển dụng');
                return;
            }

            setAuth(data.accessToken, data.refreshToken, data.role);
            router.push('/nha-tuyen-dung');
        } catch (err) {
            const message = err.response?.data?.message;

            if (message?.includes('chưa xác thực')) {
                router.push(`/verify-otp?email=${email}&type=verify_email&role=EMPLOYER`);
                return;
            }

            if (message?.includes('bị khóa')) {
                setError('Tài khoản của bạn đã bị khóa');
                return;
            }

            setError(message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'row' }}>
            {/* LEFT */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    backgroundImage: `url(${backgroundGrid.src})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Logo */}
                <div style={{ padding: '32px 40px 16px' }}>
                    <Image src={logo} alt="TopCV" height={36} />
                </div>

                {/* Form center */}
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px 32px',
                    }}
                >
                    <div style={{ width: '100%', maxWidth: '440px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#00b14f', marginBottom: '6px' }}>
                            Chào mừng bạn đã quay trở lại
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>
                            Cùng tạo dựng lợi thế cho doanh nghiệp bằng trải nghiệm công nghệ tuyển dụng ứng dụng sâu AI
                            & Hiring Funnel
                        </p>

                        {error && (
                            <div
                                style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    fontSize: '13px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        {/* Google */}
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '12px',
                                borderRadius: '6px',
                                background: '#4285f4',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: 'none',
                                marginBottom: '16px',
                                cursor: 'pointer',
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            Đăng nhập bằng Google
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Hoặc bằng email</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

                        {/* Email */}
                        <div style={{ marginBottom: '16px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                }}
                            >
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#00b14f',
                                    }}
                                >
                                    <Mail size={17} />
                                </span>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        paddingLeft: '40px',
                                        paddingRight: '16px',
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        outline: 'none',
                                        background: 'white',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '8px' }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '6px',
                                }}
                            >
                                Mật khẩu
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#00b14f',
                                    }}
                                >
                                    <Lock size={17} />
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        paddingLeft: '40px',
                                        paddingRight: '40px',
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        outline: 'none',
                                        background: 'white',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#9ca3af',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                            <Link href="/employer-forgot-password" style={{ fontSize: '13px', color: '#00b14f' }}>
                                Quên mật khẩu
                            </Link>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '6px',
                                background: loading ? '#86efac' : '#00b14f',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '14px',
                                border: 'none',
                                marginBottom: '16px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
                            Chưa có tài khoản?{' '}
                            <Link href="/employer-register" style={{ color: '#00b14f', fontWeight: '500' }}>
                                Đăng ký ngay
                            </Link>
                        </p>

                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                                Bạn gặp khó khăn khi tạo tài khoản?
                            </p>
                            <p style={{ fontSize: '13px', color: '#6b7280' }}>
                                Vui lòng gọi tới số{' '}
                                <span style={{ color: '#00b14f', fontWeight: '600' }}>1900 068 889</span> |{' '}
                                <span style={{ color: '#00b14f', fontWeight: '600' }}>Nhánh 2</span> (giờ hành chính).
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                        ©2014-2026 TopCV Vietnam JSC. All rights reserved.
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex" style={{ width: '420px', flexShrink: 0, position: 'relative' }}>
                <Image src={employerBg} alt="background" fill sizes="420px" style={{ objectFit: 'cover' }} priority />
            </div>
        </div>
    );
}
