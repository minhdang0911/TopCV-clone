'use client';

import { useState, useEffect } from 'react';
import { Phone, Check, Loader, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const GREEN = '#00b14f';

const BENEFITS = [
    'Tăng cường bảo mật tài khoản nhà tuyển dụng',
    'Nâng cao mức độ uy tín của thương hiệu tuyển dụng',
    'Tăng khả năng hiển thị tin tuyển dụng với ứng viên phù hợp',
    'Tăng tỷ lệ hồ sơ ứng tuyển',
];

const fieldCls = 'w-full px-4 py-2.5 border-[1.5px] border-slate-200 rounded-xl text-sm text-slate-900 outline-none bg-slate-50 box-border focus:border-green-400 focus:bg-white transition-colors';

export default function XacThucSdtPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [userPhone, setUserPhone] = useState('');

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone');
    const [sending, setSending] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        api.get('/employers/me/verification-status').then(res => {
            setVerified(res.data.step1.done);
            setLoading(false);
        }).catch(() => setLoading(false));
        if (user?.phone) setUserPhone(user.phone);
    }, []); // eslint-disable-line

    const sendOtp = async () => {
        const digits = phone.replace(/\D/g, '');
        if (digits.length < 9 || digits.length > 11) { toast.error('Số điện thoại không hợp lệ'); return; }
        setSending(true);
        try {
            await api.post('/employers/me/send-phone-otp', { phone: digits });
            setStep('otp');
            toast.success('Đã gửi mã OTP, kiểm tra tin nhắn SMS');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Không thể gửi OTP');
        } finally {
            setSending(false);
        }
    };

    const confirmOtp = async () => {
        if (otp.length !== 6) { toast.error('Nhập đủ 6 chữ số OTP'); return; }
        setConfirming(true);
        try {
            const res = await api.post('/employers/me/verify-phone', { code: otp });
            toast.success('Xác thực số điện thoại thành công!');
            setVerified(true);
            setUserPhone(res.data.phone || phone);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn');
        } finally {
            setConfirming(false);
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center py-16">
                <div className="w-7 h-7 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
            </div>
        );

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-base font-extrabold text-slate-900 m-0">Xác thực số điện thoại</h2>
                <p className="text-sm text-slate-500 mt-1">Xác minh số điện thoại để nâng cao độ uy tín tài khoản nhà tuyển dụng</p>
            </div>

            {verified ? (
                <div className="bg-white rounded-xl border border-green-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-green-700 px-7 py-8 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                            <ShieldCheck size={28} color="white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-extrabold text-white m-0">Số điện thoại đã được xác thực</h3>
                            <p className="text-sm text-white/80 mt-1 m-0">Tài khoản đã hoàn thành bước xác thực số điện thoại</p>
                        </div>
                    </div>
                    <div className="px-7 py-6">
                        {userPhone && (
                            <div className="flex items-center gap-3 px-4 py-3.5 bg-green-50 rounded-xl border border-green-100 mb-5">
                                <Phone size={18} color={GREEN} />
                                <span className="text-sm font-bold text-green-800">{userPhone}</span>
                                <span className="ml-auto text-xs font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-full border border-green-500">Đã xác thực</span>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {BENEFITS.map((b, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                    <Check size={15} color={GREEN} className="shrink-0 mt-0.5" />
                                    {b}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-xl p-7 mb-5 flex items-center gap-6 shadow-[0_4px_20px_rgba(0,177,79,0.25)]">
                        <div className="flex-1">
                            <div className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1.5">TopCV for Business</div>
                            <h3 className="text-xl font-extrabold text-white m-0 mb-4 leading-snug">Xác thực số điện thoại nhà tuyển dụng</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {BENEFITS.map((b, i) => (
                                    <div key={i} className="flex items-start gap-1.5 text-xs text-white/90">
                                        <Check size={12} color="white" className="shrink-0 mt-0.5" />
                                        {b}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-20 h-20 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                            <Phone size={36} color="white" strokeWidth={1.5} />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-7 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 m-0 mb-5 pb-3.5 border-b border-slate-100">
                            {step === 'phone' ? 'Cập nhật và xác thực số điện thoại' : 'Nhập mã OTP'}
                        </h3>

                        {step === 'phone' ? (
                            <div className="max-w-md">
                                <p className="text-sm text-slate-500 m-0 mb-3.5">Nhập số điện thoại để nhận mã xác thực qua SMS</p>
                                <div className="flex gap-2.5 mb-4">
                                    <span className="px-3.5 py-2.5 bg-slate-100 rounded-xl text-sm font-bold text-slate-500 border border-slate-200 whitespace-nowrap">+84</span>
                                    <input
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                        placeholder="901234567"
                                        className={cn(fieldCls, 'flex-1')}
                                        maxLength={11}
                                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                                    />
                                </div>
                                <button
                                    onClick={sendOtp}
                                    disabled={sending || phone.replace(/\D/g, '').length < 9}
                                    className={cn(
                                        'inline-flex items-center gap-2 text-white border-none rounded-xl px-7 py-3 text-sm font-bold',
                                        sending || phone.replace(/\D/g, '').length < 9
                                            ? 'bg-green-200 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-500 to-green-700 shadow-[0_4px_12px_rgba(0,177,79,0.3)] cursor-pointer hover:opacity-90'
                                    )}
                                >
                                    {sending ? <Loader size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                                    {sending ? 'Đang gửi...' : 'Gửi mã xác thực'}
                                </button>
                            </div>
                        ) : (
                            <div className="max-w-sm">
                                <p className="text-sm text-slate-500 m-0 mb-3.5">
                                    Mã OTP đã được gửi đến <strong>+84{phone.replace(/^0/, '')}</strong>. Có hiệu lực trong 5 phút.
                                </p>
                                <input
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Nhập 6 chữ số"
                                    className={cn(fieldCls, 'tracking-[8px] text-2xl text-center font-bold mb-4')}
                                    maxLength={6}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && confirmOtp()}
                                />
                                <div className="flex gap-2.5 items-center">
                                    <button
                                        onClick={() => { setStep('phone'); setOtp(''); }}
                                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <RotateCcw size={14} /> Gửi lại
                                    </button>
                                    <button
                                        onClick={confirmOtp}
                                        disabled={confirming || otp.length !== 6}
                                        className={cn(
                                            'flex-1 inline-flex items-center justify-center gap-2 text-white border-none rounded-xl py-2.5 text-sm font-bold',
                                            confirming || otp.length !== 6
                                                ? 'bg-green-200 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-green-500 to-green-700 shadow-[0_4px_12px_rgba(0,177,79,0.3)] cursor-pointer hover:opacity-90'
                                        )}
                                    >
                                        {confirming ? <Loader size={16} className="animate-spin" /> : <Check size={16} />}
                                        {confirming ? 'Đang xác thực...' : 'Xác nhận'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
