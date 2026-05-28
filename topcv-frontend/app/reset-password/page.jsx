'use client';

import { useState, useEffect } from 'react';
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

    // 'loading' | 'valid' | 'expired'
    const [status, setStatus] = useState('loading');

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Resend state (dùng khi expired)
    const [resendEmail, setResendEmail] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);
    const [resendError, setResendError] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('expired');
            return;
        }
        authService
            .verifyResetToken(token)
            .then(() => setStatus('valid'))
            .catch(() => setStatus('expired'));
    }, [token]);

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
            const msg = err.response?.data?.message || 'Link đã hết hạn hoặc không hợp lệ';
            setError(msg);
            if (msg.includes('hết hạn') || msg.includes('không hợp lệ')) {
                setStatus('expired');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async (e) => {
        e.preventDefault();
        if (!resendEmail) return;
        setResendLoading(true);
        setResendError('');
        try {
            await authService.forgotPassword(resendEmail);
            setResendSent(true);
        } catch (err) {
            setResendError(err.response?.data?.message || 'Gửi thất bại, vui lòng thử lại');
        } finally {
            setResendLoading(false);
        }
    };

    const wrapperStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 60%, #fff7ed 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    };

    const cardStyle = {
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)',
        width: '100%',
        maxWidth: '460px',
        padding: '40px 36px',
        border: '1px solid rgba(0,177,79,0.08)',
    };

    // ─── LOADING ───────────────────────────────────────────
    if (status === 'loading') {
        return (
            <div style={wrapperStyle}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <div style={cardStyle}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                        <Image src={logo} alt="TopCV" height={32} />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px 0',
                        }}
                    >
                        <svg
                            style={{ animation: 'spin 1s linear infinite', width: '36px', height: '36px' }}
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle style={{ opacity: 0.2 }} cx="12" cy="12" r="10" stroke="#00b14f" strokeWidth="3" />
                            <path
                                style={{ opacity: 0.9 }}
                                fill="#00b14f"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        <p style={{ fontSize: '14px', color: '#6b7280' }}>Đang xác thực liên kết...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ─── EXPIRED ───────────────────────────────────────────
    if (status === 'expired') {
        return (
            <div style={wrapperStyle}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
                    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
                    @keyframes spin { to { transform: rotate(360deg); } }
                    .exp-card { animation: fadeUp 0.45s ease forwards; }
                    .exp-icon { animation: pulse 3s ease-in-out infinite; }
                    .resend-btn:hover { background: #009a44 !important; }
                    .back-btn:hover { background: #f3f4f6 !important; }
                    .resend-input:focus { border-color: #00b14f !important; box-shadow: 0 0 0 3px rgba(0,177,79,0.12) !important; outline: none; }
                `}</style>

                <div style={{ marginBottom: '24px', opacity: 0, animation: 'fadeUp 0.4s ease 0.05s forwards' }}>
                    <Image src={logo} alt="TopCV" height={32} />
                </div>

                <div className="exp-card" style={cardStyle}>
                    {/* Icon */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <div
                            className="exp-icon"
                            style={{
                                width: '76px',
                                height: '76px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #fff7ed, #fed7aa)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <svg
                                width="34"
                                height="34"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#c2410c"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                <line x1="4" y1="4" x2="20" y2="20" />
                            </svg>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-2px',
                                    right: '-2px',
                                    width: '22px',
                                    height: '22px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    border: '2px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Badge */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                background: '#fff7ed',
                                color: '#c2410c',
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                border: '1px solid #fed7aa',
                            }}
                        >
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                            Link đã hết hạn
                        </span>
                    </div>

                    <h1
                        style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#111827',
                            textAlign: 'center',
                            marginBottom: '10px',
                            lineHeight: '1.4',
                        }}
                    >
                        Liên kết không còn hiệu lực
                    </h1>
                    <p
                        style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            textAlign: 'center',
                            lineHeight: '1.7',
                            marginBottom: '24px',
                        }}
                    >
                        Link chỉ có hiệu lực trong <span style={{ color: '#111827', fontWeight: '600' }}>5 phút</span>{' '}
                        và chỉ dùng được <span style={{ color: '#111827', fontWeight: '600' }}>một lần</span>. Nhập
                        email để nhận link mới.
                    </p>

                    {!resendSent ? (
                        <>
                            {resendError && (
                                <div
                                    style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        color: '#dc2626',
                                        fontSize: '13px',
                                        padding: '10px 14px',
                                        borderRadius: '10px',
                                        marginBottom: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                    }}
                                >
                                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {resendError}
                                </div>
                            )}
                            <form onSubmit={handleResend}>
                                <div style={{ marginBottom: '14px' }}>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Email của bạn
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
                                            <svg
                                                width="17"
                                                height="17"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </span>
                                        <input
                                            type="email"
                                            className="resend-input"
                                            placeholder="example@email.com"
                                            value={resendEmail}
                                            onChange={(e) => setResendEmail(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                paddingLeft: '40px',
                                                paddingRight: '16px',
                                                paddingTop: '12px',
                                                paddingBottom: '12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '10px',
                                                fontSize: '13px',
                                                background: 'white',
                                                boxSizing: 'border-box',
                                                transition: 'border-color 0.15s, box-shadow 0.15s',
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={resendLoading}
                                    className="resend-btn"
                                    style={{
                                        width: '100%',
                                        padding: '13px',
                                        borderRadius: '10px',
                                        background: resendLoading ? '#86efac' : '#00b14f',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        border: 'none',
                                        cursor: resendLoading ? 'not-allowed' : 'pointer',
                                        transition: 'background 0.15s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        marginBottom: '10px',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {resendLoading ? (
                                        <>
                                            <svg
                                                style={{
                                                    animation: 'spin 1s linear infinite',
                                                    width: '16px',
                                                    height: '16px',
                                                }}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    style={{ opacity: 0.25 }}
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    style={{ opacity: 0.75 }}
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                />
                                            </svg>
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                            >
                                                <polyline points="1 4 1 10 7 10" />
                                                <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
                                            </svg>
                                            Gửi lại link đặt lại mật khẩu
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div
                            style={{
                                background: '#f0fdf4',
                                border: '1px solid #bbf7d0',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center',
                                marginBottom: '12px',
                            }}
                        >
                            <div
                                style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    background: '#dcfce7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 12px',
                                }}
                            >
                                <svg
                                    width="22"
                                    height="22"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#16a34a"
                                    strokeWidth="2.5"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '600', color: '#15803d', marginBottom: '4px' }}>
                                Đã gửi link mới!
                            </p>
                            <p style={{ fontSize: '13px', color: '#16a34a' }}>
                                Vui lòng kiểm tra hộp thư email của bạn
                            </p>
                        </div>
                    )}

                    <button
                        type="button"
                        className="back-btn"
                        onClick={() => router.push(role === 'EMPLOYER' ? '/employer-login' : '/login')}
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'transparent',
                            color: '#6b7280',
                            fontWeight: '500',
                            fontSize: '14px',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontFamily: 'inherit',
                        }}
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Quay lại đăng nhập
                    </button>

                    <div
                        style={{
                            borderTop: '1px solid #f3f4f6',
                            paddingTop: '18px',
                            textAlign: 'center',
                            marginTop: '20px',
                        }}
                    >
                        <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Gặp khó khăn? Gọi <span style={{ color: '#00b14f', fontWeight: '600' }}>1900 068 889</span>{' '}
                            | <span style={{ color: '#00b14f', fontWeight: '600' }}>Nhánh 2</span> (giờ hành chính)
                        </p>
                    </div>
                </div>

                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '20px' }}>
                    © 2016. All Rights Reserved. TopCV Vietnam JSC.
                </p>
            </div>
        );
    }

    // ─── VALID — form đổi mật khẩu ────────────────────────
    return (
        <div style={wrapperStyle}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');`}</style>
            <div style={cardStyle}>
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
                                    cursor: 'pointer',
                                }}
                            >
                                {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
                            </button>
                        </div>
                    </div>

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
                                    cursor: 'pointer',
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
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontFamily: 'inherit',
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
