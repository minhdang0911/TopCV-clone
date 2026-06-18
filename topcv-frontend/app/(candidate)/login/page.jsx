'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { authService } from '@/services/auth.service';
import useAuthStore from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import background from '../../assests/img/auth_bg_desktop.png';
import logo from '../../assests/img/logo.png';
import backgroundarrown from '../../assests/img/background-arrow.png';
import AuthBanner from '../../components/auth/AuthBanner';

export default function CandidateLoginPage() {
    const router = useRouter();
    const { setAuth, isAuthenticated, hydrated } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hydrated && isAuthenticated) {
            router.replace('/');
        }
    }, [hydrated, isAuthenticated, router]);

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

            setAuth(data.accessToken, data.refreshToken, data.role);
            router.push('/');
        } catch (err) {
            const message = err.response?.data?.message;
            console.log('Error message:', message); // ← thêm dòng này

            if (message?.includes('chưa xác thực')) {
                console.log('Redirecting to verify-otp...'); // ← và dòng này

                router.push(`/verify-otp?email=${email}&type=verify_email&role=CANDIDATE`);
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

    const handleSocialLogin = (provider) => {
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`;
    };

    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex flex-1">
                {/* LEFT - Form */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="flex-1 flex justify-center items-center px-8 py-12">
                        <div className="w-full max-w-[480px]">
                            {/* Logo */}
                            <div className="mb-8">
                                <Image src={logo} alt="TopCV" height={36} />
                            </div>

                            <h1 className="text-2xl font-bold text-[#00b14f] mb-1">Chào mừng bạn đã quay trở lại</h1>
                            <p className="text-gray-500 text-sm mb-6">
                                Cùng xây dựng một hồ sơ nổi bật và nhận được các cơ hội sự nghiệp lý tưởng
                            </p>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-md mb-4">{error}</div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00b14f]">
                                            <Mail size={18} />
                                        </span>
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-[#00b14f]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00b14f]">
                                            <Lock size={18} />
                                        </span>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Mật khẩu"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-[#00b14f]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <Link href="/forgot-password" className="text-sm text-[#00b14f] hover:underline">
                                        Quên mật khẩu
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#00b14f] hover:bg-[#009a44] text-white font-semibold py-3 rounded-md transition-colors disabled:opacity-60"
                                >
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </button>
                            </form>

                            <div className="mt-4">
                                <p className="text-center text-sm text-gray-400 mb-3">Hoặc đăng nhập bằng</p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#db4437] hover:bg-[#c53929] text-white text-sm font-medium transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                        </svg>
                                        Google
                                    </button>
                                    <button
                                        onClick={() => handleSocialLogin('facebook')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-medium transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                        Facebook
                                    </button>
                                    <button
                                        onClick={() => handleSocialLogin('linkedin')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-[#0077b5] hover:bg-[#006399] text-white text-sm font-medium transition-colors"
                                    >
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                        </svg>
                                        Linkedin
                                    </button>
                                </div>
                            </div>

                            <p className="text-center text-sm text-gray-500 mt-5">
                                Bạn chưa có tài khoản?{' '}
                                <Link href="/register" className="text-[#00b14f] font-medium hover:underline">
                                    Đăng ký ngay
                                </Link>
                            </p>

                            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                                <p className="text-sm font-semibold text-gray-600">
                                    Bạn gặp khó khăn khi tạo tài khoản?
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Vui lòng gọi tới số{' '}
                                    <span className="text-[#00b14f] font-semibold">1900 068 889</span> |{' '}
                                    <span className="text-[#00b14f] font-semibold">Nhánh 2</span> (giờ hành chính).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="py-4 text-center">
                        <p className="text-xs text-gray-400">© 2016. All Rights Reserved. TopCV Vietnam JSC.</p>
                    </div>
                </div>

                <AuthBanner />
            </div>
        </div>
    );
}
