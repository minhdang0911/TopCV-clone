'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import logo from '../../assests/img/logo.png';
import RightBanner from '../../assests/img/banner-03.6c4018d.webp';

export default function EmployerRegisterPage() {
    const router = useRouter();
    const [showRules, setShowRules] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        gender: '',
        phone: '',
        agreed1: false,
        agreed2: false,
        agreed3: false,
        agreed4: false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleGoogleRegister = () => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.agreed1) {
            setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        setLoading(true);
        try {
            await authService.register({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                phone: form.phone,
                role: 'EMPLOYER',
            });
            router.push(`/verify-otp?email=${form.email}&type=verify_email&role=EMPLOYER`);
        } catch (err) {
            setError(err.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* LEFT */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    overflowY: 'auto',
                    marginRight: '420px',
                }}
            >
                {/* Logo */}
                <div style={{ padding: '28px 40px 16px' }}>
                    <Image src={logo} alt="TopCV" height={36} />
                </div>

                {/* Form */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '0 32px 40px' }}>
                    <div style={{ width: '100%', maxWidth: '560px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#00b14f', marginBottom: '4px' }}>
                            Đăng ký tài khoản Nhà tuyển dụng
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' }}>
                            Cùng tạo dựng lợi thế cho doanh nghiệp bằng trải nghiệm công nghệ tuyển dụng ứng dụng sâu AI
                            & Hiring Funnel.
                        </p>

                        {/* Quy định */}
                        <div
                            style={{
                                border: '1px solid #00b14f',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                overflow: 'hidden',
                                background: 'white',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => setShowRules(!showRules)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    background: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <span style={{ color: '#00b14f', fontWeight: '600', fontSize: '14px' }}>Quy định</span>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#00b14f"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    {showRules ? (
                                        <polyline points="18 15 12 9 6 15" />
                                    ) : (
                                        <polyline points="6 9 12 15 18 9" />
                                    )}
                                </svg>
                            </button>
                            {showRules && (
                                <div
                                    style={{
                                        padding: '12px 16px 16px',
                                        borderTop: '1px solid #f3f4f6',
                                        fontSize: '13px',
                                        color: '#4b5563',
                                        lineHeight: '1.7',
                                    }}
                                >
                                    <p style={{ marginBottom: '10px' }}>
                                        Để đảm bảo chất lượng dịch vụ, TopCV{' '}
                                        <span style={{ color: '#ef4444', fontWeight: '500' }}>
                                            không cho phép một người dùng tạo nhiều tài khoản khác nhau
                                        </span>
                                        .
                                    </p>
                                    <p style={{ marginBottom: '10px' }}>
                                        Nếu phát hiện vi phạm, TopCV sẽ ngừng cung cấp dịch vụ tới tất cả các tài khoản
                                        trùng lặp hoặc chặn toàn bộ truy cập tới hệ thống website của TopCV.
                                    </p>
                                    <p style={{ marginBottom: '10px' }}>
                                        Sau khi đăng ký tài khoản nhà tuyển dụng (NTD) và cung cấp các thông tin cần
                                        thiết, NTD có thể được hỗ trợ hiển thị tin tuyển dụng cơ bản (standard), ngoài
                                        trừ một số vị trí nhất định.
                                    </p>
                                    <p style={{ marginBottom: '8px' }}>Mọi thắc mắc vui lòng liên hệ Hotline CSKH:</p>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            color: '#00b14f',
                                            fontWeight: '600',
                                        }}
                                    >
                                        <Phone size={14} />
                                        1900 068 889
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tài khoản */}
                        <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1f2937', marginBottom: '6px' }}>
                            Tài khoản
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '14px', lineHeight: '1.6' }}>
                            Để cung cấp dịch vụ cho bạn, chúng tôi cần xử lý một số dữ liệu cá nhân theo quy định tại{' '}
                            <Link href="#" style={{ color: '#00b14f' }}>
                                Chính sách quyền riêng tư
                            </Link>{' '}
                            và{' '}
                            <Link href="#" style={{ color: '#00b14f' }}>
                                Điều khoản dịch vụ
                            </Link>
                            . Vui lòng lựa chọn các mục dịch vụ mà bạn đồng ý ở dưới đây:
                        </p>

                        {/* Checkboxes trên */}
                        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="agreed1"
                                    checked={form.agreed1}
                                    onChange={handleChange}
                                    style={{ marginTop: '2px', accentColor: '#00b14f' }}
                                />
                                <div>
                                    <p style={{ fontSize: '13px', color: '#4b5563' }}>
                                        Tôi đã đọc và đồng ý với Điều khoản dịch vụ và Chính sách Quyền riêng tư của
                                        TopCV.
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                        — Chúng tôi không thể cung cấp dịch vụ nếu không nhận được sự đồng ý ở mục này.
                                    </p>
                                </div>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="agreed2"
                                    checked={form.agreed2}
                                    onChange={handleChange}
                                    style={{ marginTop: '2px', accentColor: '#00b14f' }}
                                />
                                <div>
                                    <p style={{ fontSize: '13px', color: '#4b5563' }}>
                                        Tôi đồng ý nhận thông tin tư vấn của TopCV để được hỗ trợ đăng tin nhanh, cải
                                        tối ưu hiệu quả tin đăng, các thông báo quan trọng về tin đăng, CV ứng tuyển và
                                        các giải pháp/chương trình tuyển dụng phù hợp.
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#00b14f', marginTop: '2px' }}>
                                        💡 Khuyến dùng: Nếu không có sự đồng ý, chuyên viên sẽ không thể liên hệ để hỗ
                                        trợ Quý khách xác thực tài khoản nhanh chóng & đồng tin kịp thời.
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* Google */}
                        <button
                            type="button"
                            onClick={handleGoogleRegister}
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
                                marginBottom: '14px',
                                cursor: 'pointer',
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            Đăng ký bằng Google
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                            <span style={{ fontSize: '13px', color: '#9ca3af' }}>Hoặc bằng email</span>
                            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                        </div>

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

                        {/* Form fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Email */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Email đăng nhập <span style={{ color: '#ef4444' }}>*</span>
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
                                        <Mail size={16} />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            paddingLeft: '38px',
                                            paddingRight: '16px',
                                            paddingTop: '10px',
                                            paddingBottom: '10px',
                                            borderBottom: '1px solid #d1d5db',
                                            border: 'none',
                                            borderBottom: '1px solid #d1d5db',
                                            fontSize: '13px',
                                            outline: 'none',
                                            background: 'transparent',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                </div>
                                <p style={{ fontSize: '12px', color: '#f87171', marginTop: '4px' }}>
                                    Trường hợp bạn đăng ký tài khoản bằng email không phải email tên miền công ty, một
                                    số dịch vụ trên tài khoản có thể sẽ bị giới hạn quyền mua hoặc sử dụng.
                                </p>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Mật khẩu <span style={{ color: '#ef4444' }}>*</span>
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
                                        <Lock size={16} />
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="Mật khẩu"
                                        value={form.password}
                                        onChange={handleChange}
                                        required
                                        style={{
                                            width: '100%',
                                            paddingLeft: '38px',
                                            paddingRight: '40px',
                                            paddingTop: '10px',
                                            paddingBottom: '10px',
                                            border: 'none',
                                            borderBottom: '1px solid #d1d5db',
                                            fontSize: '13px',
                                            outline: 'none',
                                            background: 'transparent',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '6px',
                                    }}
                                >
                                    Nhập lại mật khẩu <span style={{ color: '#ef4444' }}>*</span>
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
                                        <Lock size={16} />
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
                                            paddingLeft: '38px',
                                            paddingRight: '40px',
                                            paddingTop: '10px',
                                            paddingBottom: '10px',
                                            border: 'none',
                                            borderBottom: '1px solid #d1d5db',
                                            fontSize: '13px',
                                            outline: 'none',
                                            background: 'transparent',
                                            boxSizing: 'border-box',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Thông tin nhà tuyển dụng */}
                            <div style={{ paddingTop: '8px' }}>
                                <h2
                                    style={{
                                        fontSize: '17px',
                                        fontWeight: '700',
                                        color: '#1f2937',
                                        marginBottom: '16px',
                                    }}
                                >
                                    Thông tin nhà tuyển dụng
                                </h2>

                                {/* Họ tên + Giới tính */}
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '16px',
                                        marginBottom: '16px',
                                    }}
                                >
                                    <div>
                                        <label
                                            style={{
                                                display: 'block',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '6px',
                                            }}
                                        >
                                            Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    left: '12px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    color: '#9ca3af',
                                                }}
                                            >
                                                <User size={16} />
                                            </span>
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder="Họ và tên"
                                                value={form.fullName}
                                                onChange={handleChange}
                                                required
                                                style={{
                                                    width: '100%',
                                                    paddingLeft: '38px',
                                                    paddingRight: '16px',
                                                    paddingTop: '10px',
                                                    paddingBottom: '10px',
                                                    border: 'none',
                                                    borderBottom: '1px solid #d1d5db',
                                                    fontSize: '13px',
                                                    outline: 'none',
                                                    background: 'transparent',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label
                                            style={{
                                                display: 'block',
                                                fontSize: '13px',
                                                fontWeight: '500',
                                                color: '#374151',
                                                marginBottom: '6px',
                                            }}
                                        >
                                            Giới tính <span style={{ color: '#ef4444' }}>*</span>
                                        </label>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '16px',
                                                paddingTop: '10px',
                                            }}
                                        >
                                            <label
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#4b5563',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="male"
                                                    checked={form.gender === 'male'}
                                                    onChange={handleChange}
                                                    style={{ accentColor: '#00b14f' }}
                                                />
                                                Nam
                                            </label>
                                            <label
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: '#4b5563',
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="gender"
                                                    value="female"
                                                    checked={form.gender === 'female'}
                                                    onChange={handleChange}
                                                    style={{ accentColor: '#00b14f' }}
                                                />
                                                Nữ
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Số điện thoại */}
                                <div>
                                    <label
                                        style={{
                                            display: 'block',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '6px',
                                        }}
                                    >
                                        Số điện thoại cá nhân <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                            }}
                                        >
                                            <Phone size={16} />
                                        </span>
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="Số điện thoại cá nhân"
                                            value={form.phone}
                                            onChange={handleChange}
                                            required
                                            style={{
                                                width: '100%',
                                                paddingLeft: '38px',
                                                paddingRight: '16px',
                                                paddingTop: '10px',
                                                paddingBottom: '10px',
                                                border: 'none',
                                                borderBottom: '1px solid #d1d5db',
                                                fontSize: '13px',
                                                outline: 'none',
                                                background: 'transparent',
                                                boxSizing: 'border-box',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Checkboxes dưới */}
                            <div
                                style={{
                                    paddingTop: '8px',
                                    borderTop: '1px solid #f3f4f6',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px',
                                }}
                            >
                                <p style={{ fontSize: '13px', color: '#6b7280', paddingTop: '8px', lineHeight: '1.6' }}>
                                    Để cung cấp dịch vụ cho bạn, chúng tôi cần xử lý một số dữ liệu cá nhân theo quy
                                    định tại{' '}
                                    <Link href="#" style={{ color: '#00b14f' }}>
                                        Chính sách quyền riêng tư
                                    </Link>{' '}
                                    và{' '}
                                    <Link href="#" style={{ color: '#00b14f' }}>
                                        Điều khoản dịch vụ
                                    </Link>
                                    .
                                </p>
                                <label
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}
                                >
                                    <input
                                        type="checkbox"
                                        name="agreed3"
                                        checked={form.agreed3}
                                        onChange={handleChange}
                                        style={{ marginTop: '2px', accentColor: '#00b14f' }}
                                    />
                                    <span style={{ fontSize: '13px', color: '#4b5563' }}>
                                        Tôi đã đọc và đồng ý với Điều khoản dịch vụ và Chính sách Quyền riêng tư của
                                        TopCV.
                                    </span>
                                </label>
                                <label
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}
                                >
                                    <input
                                        type="checkbox"
                                        name="agreed4"
                                        checked={form.agreed4}
                                        onChange={handleChange}
                                        style={{ marginTop: '2px', accentColor: '#00b14f' }}
                                    />
                                    <span style={{ fontSize: '13px', color: '#4b5563' }}>
                                        Tôi đồng ý nhận thông tin tư vấn của TopCV để được hỗ trợ đăng tin nhanh.
                                    </span>
                                </label>
                            </div>

                            <button
                                onClick={handleSubmit}
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
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '13px', color: '#6b7280' }}>
                                Đã có tài khoản?{' '}
                                <Link href="/employer-login" style={{ color: '#00b14f', fontWeight: '500' }}>
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>

                        <div style={{ marginTop: '24px', textAlign: 'center' }}>
                            <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                                ©2014-2026 TopCV Vietnam JSC. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT - Banner: fixed so it stays in place while left scrolls */}
            <div style={{ width: '420px', position: 'fixed', right: 0, top: 0, height: '100vh' }}>
                <Image src={RightBanner} alt="background" fill sizes="420px" style={{ objectFit: 'cover' }} priority />
            </div>
        </div>
    );
}
