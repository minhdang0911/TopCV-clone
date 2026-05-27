'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { authService } from '@/services/auth.service';
import logo from '../../assests/img/logo.png';
import useAuthStore from '@/stores/auth.store';

export default function VerifyOtpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get('email') || '';
    const type = searchParams.get('type') || 'verify_email';
    const role = searchParams.get('role') || 'CANDIDATE';
    const { setAuth } = useAuthStore();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(300);
    const [resending, setResending] = useState(false);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => (newOtp[i] = char));
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Vui lòng nhập đủ 6 số OTP');
            return;
        }
        setError('');
        setLoading(true);
        try {
            const res = await authService.verifyOtp(email, code, type);

            if (type === 'verify_email') {
                // Lưu token vào store
                setAuth(res.data.accessToken, res.data.role);
            }

            setSuccess('Xác thực thành công!');
            setTimeout(() => {
                router.push(role === 'EMPLOYER' ? `/employer-complete-profile?email=${email}` : '/login');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            await authService.resendOtp(email);
            setCountdown(300);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (err) {
            setError(err.response?.data?.message || 'Gửi lại OTP thất bại');
        } finally {
            setResending(false);
        }
    };

    const isComplete = otp.join('').length === 6;

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 50%, #f0f9ff 100%)',
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
                    borderRadius: '24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,177,79,0.06)',
                    width: '100%',
                    maxWidth: '460px',
                    padding: '40px',
                    border: '1px solid rgba(0,177,79,0.08)',
                }}
            >
                {/* Logo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
                    <Image src={logo} alt="TopCV" height={30} />
                </div>

                {/* Icon */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,177,79,0.2)',
                        }}
                    >
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#00b14f" strokeWidth="1.5">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                            />
                        </svg>
                    </div>
                </div>

                <h1
                    style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: '#111827',
                        textAlign: 'center',
                        marginBottom: '8px',
                    }}
                >
                    Xác thực email
                </h1>
                <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '4px' }}>
                    Mã OTP đã được gửi đến
                </p>
                <p
                    style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#00b14f',
                        textAlign: 'center',
                        marginBottom: '32px',
                    }}
                >
                    {email}
                </p>

                {/* Error/Success */}
                {error && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            fontSize: '13px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                        }}
                    >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            color: '#16a34a',
                            fontSize: '13px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                        }}
                    >
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {success}
                    </div>
                )}

                {/* OTP Inputs */}
                <div
                    style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}
                    onPaste={handlePaste}
                >
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#00b14f';
                                e.target.style.boxShadow = '0 0 0 3px rgba(0,177,79,0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = digit ? '#00b14f' : '#e5e7eb';
                                e.target.style.boxShadow = 'none';
                            }}
                            style={{
                                width: '56px',
                                height: '64px',
                                textAlign: 'center',
                                fontSize: '26px',
                                fontWeight: '700',
                                border: `2px solid ${digit ? '#00b14f' : '#e5e7eb'}`,
                                borderRadius: '14px',
                                backgroundColor: digit ? '#f0fdf4' : '#fafafa',
                                color: digit ? '#00b14f' : '#374151',
                                outline: 'none',
                                transition: 'all 0.15s ease',
                                cursor: 'text',
                            }}
                        />
                    ))}
                </div>

                {/* Submit button */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !isComplete}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isComplete && !loading ? 'linear-gradient(135deg, #00b14f, #00994a)' : '#f3f4f6',
                        color: isComplete && !loading ? 'white' : '#9ca3af',
                        fontSize: '15px',
                        fontWeight: '600',
                        cursor: isComplete && !loading ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        boxShadow: isComplete && !loading ? '0 4px 12px rgba(0,177,79,0.3)' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                    }}
                >
                    {loading ? (
                        <>
                            <svg
                                style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }}
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
                            Đang xác thực...
                        </>
                    ) : (
                        'Xác nhận'
                    )}
                </button>

                {/* Countdown */}
                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    {countdown > 0 ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                marginBottom: '8px',
                            }}
                        >
                            <div
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#00b14f',
                                    animation: 'pulse 2s infinite',
                                }}
                            />
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>
                                Mã hết hạn sau{' '}
                                <span
                                    style={{ color: '#00b14f', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {formatTime(countdown)}
                                </span>
                            </span>
                        </div>
                    ) : (
                        <p style={{ fontSize: '13px', color: '#ef4444', fontWeight: '500', marginBottom: '8px' }}>
                            Mã OTP đã hết hạn
                        </p>
                    )}

                    <button
                        onClick={handleResend}
                        disabled={resending || countdown > 240}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: resending || countdown > 240 ? '#d1d5db' : '#00b14f',
                            cursor: resending || countdown > 240 ? 'not-allowed' : 'pointer',
                            textDecoration: 'none',
                            padding: '4px 8px',
                            borderRadius: '6px',
                        }}
                    >
                        {resending ? 'Đang gửi...' : '↺ Gửi lại mã OTP'}
                    </button>
                </div>
            </div>

            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '24px' }}>
                © 2016. All Rights Reserved. TopCV Vietnam JSC.
            </p>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </div>
    );
}
