'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const OTP_SECONDS = 300;

export default function OtpModal({ email, onConfirm, onCancel, onResend, title, description }) {
    const [code, setCode] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(OTP_SECONDS);
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
        const id = setInterval(() => {
            setSecondsLeft((s) => {
                if (s <= 1) { clearInterval(id); return 0; }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, []);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    };

    const handleConfirm = async () => {
        if (!code || code.length < 6) { setError('Vui lòng nhập đủ 6 ký tự'); return; }
        setError('');
        setConfirming(true);
        try {
            await onConfirm(code);
        } catch (err) {
            setError(err?.response?.data?.message || 'Mã không hợp lệ hoặc đã hết hạn');
        } finally {
            setConfirming(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setResendSuccess(false);
        setError('');
        try {
            await onResend();
            setSecondsLeft(OTP_SECONDS);
            setCode('');
            setResendSuccess(true);
        } catch {}
        setResending(false);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '420px',
                    padding: '28px 24px',
                    position: 'relative',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                }}
            >
                <button
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '14px',
                        right: '14px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        display: 'flex',
                    }}
                >
                    <X size={20} />
                </button>

                <h2
                    style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#111827',
                        textAlign: 'center',
                        marginBottom: '8px',
                    }}
                >
                    {title || 'Nhập mã xác minh'}
                </h2>

                <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '4px' }}>
                    Chúng tôi đã gửi mã xác minh tới{' '}
                    <span style={{ color: '#00b14f', fontWeight: '600' }}>{email}</span>
                </p>
                <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>
                    {description || 'Bạn vui lòng kiểm tra email để lấy mã.'}
                </p>

                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                    placeholder="Nhập mã 6 ký tự"
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '20px',
                        textAlign: 'center',
                        letterSpacing: '8px',
                        fontWeight: '700',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '8px',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#00b14f')}
                    onBlur={(e) => (e.target.style.borderColor = error ? '#ef4444' : '#d1d5db')}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
                />

                {error && (
                    <p style={{ fontSize: '12px', color: '#ef4444', textAlign: 'center', marginBottom: '6px' }}>
                        {error}
                    </p>
                )}

                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {secondsLeft > 0 ? (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            Mã hết hạn sau:{' '}
                            <span style={{ fontWeight: '600', color: '#374151' }}>{formatTime(secondsLeft)}</span>
                        </span>
                    ) : (
                        <span style={{ fontSize: '13px', color: '#ef4444' }}>Mã đã hết hạn</span>
                    )}
                </div>

                {resendSuccess && (
                    <p style={{ fontSize: '12px', color: '#059669', textAlign: 'center', marginBottom: '8px' }}>
                        Đã gửi lại mã thành công
                    </p>
                )}

                <p style={{ fontSize: '13px', color: '#6b7280', textAlign: 'center', marginBottom: '20px' }}>
                    Chưa nhận được mã?{' '}
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#00b14f',
                            fontWeight: '600',
                            cursor: resending ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            padding: 0,
                        }}
                    >
                        {resending ? 'Đang gửi...' : 'Gửi lại mã'}
                    </button>
                </p>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '11px',
                            borderRadius: '8px',
                            border: '1px solid #d1d5db',
                            background: 'white',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={confirming || code.length < 6}
                        style={{
                            flex: 1,
                            padding: '11px',
                            borderRadius: '8px',
                            border: 'none',
                            background: confirming || code.length < 6 ? '#9ca3af' : '#00b14f',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: confirming || code.length < 6 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {confirming ? 'Đang xác nhận...' : 'Xác nhận'}
                    </button>
                </div>
            </div>
        </div>
    );
}
