'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Building2, FileText, CheckCircle, Circle, ArrowRight, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';

const GREEN = '#00b14f';

const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', color: '#0f172a',
    outline: 'none', background: '#fafafa', boxSizing: 'border-box',
};

const STEPS = [
    { key: 'step1', label: 'Xác thực số điện thoại', href: '/nha-tuyen-dung/ho-so-cong-ty/xac-thuc-sdt', icon: Phone },
    { key: 'step2', label: 'Cập nhật thông tin công ty', href: '/nha-tuyen-dung/ho-so-cong-ty', icon: Building2 },
    { key: 'step3', label: 'Xác thực Giấy đăng ký doanh nghiệp', href: '/nha-tuyen-dung/ho-so-cong-ty/giay-dkkd', icon: FileText },
];

export default function ThongTinTaiKhoanPage() {
    const { user, setUser } = useAuthStore();
    const [vstatus, setVstatus] = useState(null);
    const [phone, setPhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/employers/me/verification-status').then(r => setVstatus(r.data)).catch(() => {});
        setPhone(user?.phone || '');
    }, [user?.phone]);

    const level = vstatus?.level ?? 0;
    const canPost = vstatus?.canPostJob;
    const pct = Math.round((level / 3) * 100);
    const levelColor = canPost ? GREEN : level > 0 ? '#d97706' : '#dc2626';

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/users/me/info', { phone });
            setUser({ ...user, phone });
            toast.success('Cập nhật thành công');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Thông tin tài khoản</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Cập nhật thông tin cá nhân và trạng thái xác thực tài khoản</p>
            </div>

            {/* Verification checklist */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Xác thực thông tin</h3>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: '3px 0 0' }}>
                            Tài khoản xác thực:{' '}
                            <span style={{ fontWeight: '700', color: levelColor }}>Cấp {level}/3</span>
                        </p>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: levelColor }}>Hoàn thành {pct}%</div>
                </div>

                {/* Progress bar */}
                <div style={{ height: '4px', background: '#f1f5f9', borderRadius: '2px', marginBottom: '16px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: canPost ? GREEN : '#f59e0b', borderRadius: '2px', transition: 'width 0.4s ease' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {STEPS.map(s => {
                        const done = vstatus?.[s.key]?.done;
                        const Icon = s.icon;
                        return (
                            <Link key={s.key} href={s.href} style={{ textDecoration: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${done ? '#d1fae5' : '#f3f4f6'}`, background: done ? '#f0fdf4' : '#fafafa', transition: 'all 0.12s', cursor: 'pointer' }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = done ? '#86efac' : '#e5e7eb'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = done ? '#d1fae5' : '#f3f4f6'}
                                >
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: done ? '#dcfce7' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={15} color={done ? GREEN : '#94a3b8'} />
                                    </div>
                                    <span style={{ flex: 1, fontSize: '13px', fontWeight: '500', color: done ? '#166534' : '#374151' }}>{s.label}</span>
                                    {done
                                        ? <CheckCircle size={18} color={GREEN} />
                                        : <ArrowRight size={16} color="#94a3b8" />
                                    }
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Personal account info */}
            <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Cập nhật thông tin tài khoản</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email</label>
                        <input value={user?.email || ''} disabled style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Số điện thoại</label>
                        <input
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="0912345678"
                            style={inputStyle}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: saving ? '#86efac' : `linear-gradient(135deg, ${GREEN}, #00934a)`, color: 'white', border: 'none', borderRadius: '10px', padding: '10px 24px', fontSize: '13px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(0,177,79,0.25)' }}
                    >
                        {saving ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
