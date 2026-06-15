'use client';

import { useState, useEffect } from 'react';
import { Phone, Check, Loader, ShieldCheck, ArrowRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';

const GREEN = '#00b14f';

const inputStyle = {
    width: '100%', padding: '11px 16px', border: '1.5px solid #e2e8f0',
    borderRadius: '10px', fontSize: '15px', color: '#0f172a',
    outline: 'none', background: '#fafafa', boxSizing: 'border-box',
};

const BENEFITS = [
    'Tăng cường bảo mật tài khoản nhà tuyển dụng',
    'Nâng cao mức độ uy tín của thương hiệu tuyển dụng',
    'Tăng khả năng hiển thị tin tuyển dụng với ứng viên phù hợp',
    'Tăng tỷ lệ hồ sơ ứng tuyển',
];

export default function XacThucSdtPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [verified, setVerified] = useState(false);
    const [userPhone, setUserPhone] = useState('');

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [sending, setSending] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        api.get('/employers/me/verification-status').then(res => {
            setVerified(res.data.step1.done);
            setLoading(false);
        }).catch(() => setLoading(false));

        if (user?.phone) setUserPhone(user.phone);
    }, []);

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

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><Loader size={24} color={GREEN} style={{ animation: 'spin 1s linear infinite' }} /><style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style></div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Xác thực số điện thoại</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Xác minh số điện thoại để nâng cao độ uy tín tài khoản nhà tuyển dụng</p>
            </div>

            {verified ? (
                /* Already verified */
                <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #bbf7d0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(135deg, #00b14f 0%, #00934a 100%)', padding: '32px 28px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ShieldCheck size={28} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'white', margin: 0 }}>Số điện thoại đã được xác thực</h3>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '4px 0 0' }}>
                                Tài khoản của bạn đã hoàn thành bước xác thực số điện thoại
                            </p>
                        </div>
                    </div>
                    <div style={{ padding: '24px 28px' }}>
                        {userPhone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #d1fae5' }}>
                                <Phone size={18} color={GREEN} />
                                <span style={{ fontSize: '14px', fontWeight: '700', color: '#166534' }}>{userPhone}</span>
                                <span style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '600', color: GREEN, background: '#dcfce7', padding: '2px 10px', borderRadius: '20px', border: `1px solid ${GREEN}` }}>Đã xác thực</span>
                            </div>
                        )}
                        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {BENEFITS.map((b, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}>
                                    <Check size={15} color={GREEN} style={{ flexShrink: 0, marginTop: '1px' }} />
                                    {b}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Not verified */
                <div>
                    {/* Banner */}
                    <div style={{ background: 'linear-gradient(135deg, #00b14f 0%, #00934a 100%)', borderRadius: '14px', padding: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 4px 20px rgba(0,177,79,0.25)' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>TopCV for Business</div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'white', margin: '0 0 16px', lineHeight: 1.3 }}>Xác thực số điện thoại nhà tuyển dụng</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {BENEFITS.map((b, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '12px', color: 'rgba(255,255,255,0.9)' }}>
                                        <Check size={13} color="white" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        {b}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Phone size={36} color="white" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Form */}
                    <div style={{ background: 'white', borderRadius: '14px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', margin: '0 0 20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                            {step === 'phone' ? 'Cập nhật và xác thực số điện thoại' : 'Nhập mã OTP'}
                        </h3>

                        {step === 'phone' ? (
                            <div style={{ maxWidth: '480px' }}>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px' }}>
                                    Nhập số điện thoại để nhận mã xác thực qua SMS
                                </p>
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                    <span style={{ padding: '11px 14px', background: '#f1f5f9', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#475569', border: '1.5px solid #e2e8f0', whiteSpace: 'nowrap' }}>+84</span>
                                    <input
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                                        placeholder="901234567"
                                        style={{ ...inputStyle, flex: 1 }}
                                        maxLength={11}
                                        onKeyDown={e => e.key === 'Enter' && sendOtp()}
                                    />
                                </div>
                                <button onClick={sendOtp} disabled={sending || phone.replace(/\D/g,'').length < 9} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: sending ? '#86efac' : `linear-gradient(135deg, ${GREEN}, #00934a)`, color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '14px', fontWeight: '700', cursor: sending ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,177,79,0.3)' }}>
                                    {sending ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ArrowRight size={16} />}
                                    {sending ? 'Đang gửi...' : 'Gửi mã xác thực'}
                                </button>
                            </div>
                        ) : (
                            <div style={{ maxWidth: '400px' }}>
                                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 14px' }}>
                                    Mã OTP đã được gửi đến <strong>+84{phone.replace(/^0/, '')}</strong>. Có hiệu lực trong 5 phút.
                                </p>
                                <input
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Nhập 6 chữ số"
                                    style={{ ...inputStyle, letterSpacing: '8px', fontSize: '22px', textAlign: 'center', fontWeight: '700', marginBottom: '16px' }}
                                    maxLength={6}
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && confirmOtp()}
                                />
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <button onClick={() => { setStep('phone'); setOtp(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '11px 18px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
                                        <RotateCcw size={14} /> Gửi lại
                                    </button>
                                    <button onClick={confirmOtp} disabled={confirming || otp.length !== 6} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: confirming || otp.length !== 6 ? '#86efac' : `linear-gradient(135deg, ${GREEN}, #00934a)`, color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: confirming || otp.length !== 6 ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,177,79,0.3)' }}>
                                        {confirming ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
                                        {confirming ? 'Đang xác thực...' : 'Xác nhận'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
