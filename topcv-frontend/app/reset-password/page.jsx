'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useRouter, useSearchParams } from 'next/navigation';
import logo from '../assests/img/logo.png';

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token') || '';
    const role = searchParams.get('role') || 'CANDIDATE';

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.newPassword !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (form.newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        try {
            await authService.resetPassword(token, form.newPassword, form.confirmPassword);
            setSuccess('Đổi mật khẩu thành công! Đang chuyển hướng...');
            setTimeout(() => {
                router.push(role === 'EMPLOYER' ? '/employer-login' : '/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Link đã hết hạn hoặc không hợp lệ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    width: '100%',
                    maxWidth: '460px',
                    padding: '40px',
                    border: '1px solid #f3f4f6',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                    <Image src={logo} alt="TopCV" height={36} />
                </div>

                <h1
                    style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#00b14f',
                        textAlign: 'center',
                        marginBottom: '8px',
                    }}
                >
                    Tạo lại mật khẩu của bạn
                </h1>
                <p
                    style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        textAlign: 'center',
                        marginBottom: '28px',
                        lineHeight: '1.6',
                    }}
                >
                    Đăng nhập ngay để bắt đầu xây dựng một hồ sơ nổi bật cho bạn và nhận được các cơ hội sự nghiệp lý
                    tưởng
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
                {success && (
                    <div
                        style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#16a34a',
                            fontSize: '13px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            marginBottom: '16px',
                        }}
                    >
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Mật khẩu mới */}
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
                            Mật khẩu mới
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
                                type={showNew ? 'text' : 'password'}
                                name="newPassword"
                                placeholder="Nhập mật khẩu mới"
                                value={form.newPassword}
                                onChange={handleChange}
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
                                onClick={() => setShowNew(!showNew)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                }}
                            >
                                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    {/* Xác nhận mật khẩu */}
                    <div style={{ marginBottom: '24px' }}>
                        <label
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px',
                            }}
                        >
                            Xác nhận mật khẩu
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
                                type={showConfirm ? 'text' : 'password'}
                                name="confirmPassword"
                                placeholder="Nhập lại mật khẩu"
                                value={form.confirmPassword}
                                onChange={handleChange}
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
                                onClick={() => setShowConfirm(!showConfirm)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                }}
                            >
                                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
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
                        }}
                    >
                        {loading ? 'Đang xử lý...' : 'Tạo mật khẩu mới'}
                    </button>
                </form>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <Link
                        href={role === 'EMPLOYER' ? '/employer-login' : '/login'}
                        style={{ fontSize: '13px', color: '#00b14f' }}
                    >
                        Quay lại đăng nhập
                    </Link>
                    <Link
                        href={role === 'EMPLOYER' ? '/employer-register' : '/register'}
                        style={{ fontSize: '13px', color: '#00b14f' }}
                    >
                        Đăng ký tài khoản mới
                    </Link>
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                        Bạn gặp khó khăn khi tạo tài khoản?
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                        Vui lòng gọi tới số <span style={{ color: '#00b14f', fontWeight: '600' }}>1900 068 889</span> |{' '}
                        <span style={{ color: '#00b14f', fontWeight: '600' }}>Nhánh 2</span> (giờ hành chính).
                    </p>
                </div>
            </div>

            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '24px' }}>
                © 2016. All Rights Reserved. TopCV Vietnam JSC.
            </p>
        </div>
    );
}
