'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail } from 'lucide-react';
import { authService } from '@/services/auth.service';
import logo from '../assests/img/logo.png';
import AuthBanner from '@/app/components/auth/AuthBanner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* LEFT */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '48px 32px',
                    }}
                >
                    <div style={{ width: '100%', maxWidth: '480px' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <Image src={logo} alt="TopCV" height={36} />
                        </div>

                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#00b14f', marginBottom: '24px' }}>
                            Quên mật khẩu
                        </h1>

                        {sent && (
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    background: '#f0fdf4',
                                    border: '1px solid #bbf7d0',
                                    color: '#16a34a',
                                    fontSize: '13px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '16px',
                                }}
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    style={{ flexShrink: 0, marginTop: '1px' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Hãy kiểm tra email của bạn. Sau đó nhấn vào link trong hộp thư để đổi lại mật khẩu.
                            </div>
                        )}

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

                        <form onSubmit={handleSubmit}>
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
                                        <Mail size={18} />
                                    </span>
                                    <input
                                        type="email"
                                        placeholder="Nhập email"
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

                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px', lineHeight: '1.6' }}>
                                Bằng việc thực hiện đổi mật khẩu, bạn đã đồng ý với{' '}
                                <Link href="#" style={{ color: '#00b14f' }}>
                                    Điều khoản dịch vụ
                                </Link>{' '}
                                và{' '}
                                <Link href="#" style={{ color: '#00b14f' }}>
                                    Chính sách bảo mật
                                </Link>{' '}
                                của chúng tôi
                            </p>

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
                                {loading ? 'Đang gửi...' : 'Tạo lại mật khẩu'}
                            </button>
                        </form>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <Link href="/login" style={{ fontSize: '13px', color: '#00b14f' }}>
                                Quay lại đăng nhập
                            </Link>
                            <Link href="/register" style={{ fontSize: '13px', color: '#00b14f' }}>
                                Đăng ký tài khoản mới
                            </Link>
                        </div>

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
                        © 2016. All Rights Reserved. TopCV Vietnam JSC.
                    </p>
                </div>
            </div>

            {/* RIGHT */}
            <AuthBanner />
        </div>
    );
}
