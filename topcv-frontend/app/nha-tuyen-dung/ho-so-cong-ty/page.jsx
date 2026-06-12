'use client';

import { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';

const GREEN = '#00b14f';

const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7eb',
    borderRadius: '8px', fontSize: '14px', color: '#111827',
    outline: 'none', background: 'white', boxSizing: 'border-box',
};

function Field({ label, children, hint }) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>{label}</label>
            {children}
            {hint && <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{hint}</p>}
        </div>
    );
}

export default function HoSoCongTyPage() {
    const { user, setUser } = useAuthStore();
    const profile = user?.employerProfile;
    const [form, setForm] = useState({
        companyName: profile?.companyName || '',
        website: profile?.website || '',
        address: profile?.address || '',
        companySize: profile?.companySize || '',
        description: profile?.description || '',
        taxCode: profile?.taxCode || '',
    });
    const [saving, setSaving] = useState(false);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.patch('/users/me/profile', form);
            setUser({ ...user, employerProfile: { ...profile, ...res.data } });
            toast.success('Cập nhật thành công!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Hồ sơ công ty</h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Thông tin hiển thị cho ứng viên khi xem tin tuyển dụng của bạn</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'flex-start' }} className="company-form-layout">
                <div>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>Thông tin cơ bản</h3>
                        <Field label="Tên công ty">
                            <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="TopCV Vietnam" style={inputStyle} />
                        </Field>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Field label="Website">
                                <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://topcv.vn" style={inputStyle} />
                            </Field>
                            <Field label="Mã số thuế">
                                <input value={form.taxCode} onChange={e => set('taxCode', e.target.value)} placeholder="0123456789" style={inputStyle} />
                            </Field>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <Field label="Quy mô công ty">
                                <select value={form.companySize} onChange={e => set('companySize', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                                    <option value="">-- Chọn quy mô --</option>
                                    <option value="1-10">1 – 10 nhân viên</option>
                                    <option value="11-50">11 – 50 nhân viên</option>
                                    <option value="51-200">51 – 200 nhân viên</option>
                                    <option value="201-500">201 – 500 nhân viên</option>
                                    <option value="501-1000">501 – 1000 nhân viên</option>
                                    <option value="1001+">Trên 1000 nhân viên</option>
                                </select>
                            </Field>
                            <Field label="Địa chỉ trụ sở">
                                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Nguyễn Huệ, Q.1, HCM" style={inputStyle} />
                            </Field>
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111827', margin: '0 0 16px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>Giới thiệu công ty</h3>
                        <Field label="Mô tả" hint="Giới thiệu về công ty, văn hóa, định hướng phát triển...">
                            <textarea
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                rows={8}
                                placeholder="Giới thiệu về công ty của bạn..."
                                style={{ ...inputStyle, resize: 'vertical', minHeight: '160px', fontFamily: 'inherit' }}
                            />
                        </Field>
                    </div>
                </div>

                {/* Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Logo */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 14px' }}>Logo công ty</h3>
                        <div style={{ width: '96px', height: '96px', borderRadius: '12px', border: '2px dashed #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden', background: '#f9fafb' }}>
                            {profile?.logoUrl
                                ? <img src={profile.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                : <span style={{ fontSize: '28px', fontWeight: '800', color: GREEN }}>{form.companyName[0]?.toUpperCase() || '?'}</span>
                            }
                        </div>
                        <p style={{ fontSize: '12px', color: '#9ca3af', margin: '0 0 10px' }}>PNG, JPG tối đa 2MB</p>
                        <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer', color: '#374151' }}>
                            <Upload size={14} /> Tải logo lên
                        </button>
                    </div>

                    {/* Save */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e5e7eb' }}>
                        <button type="submit" disabled={saving} style={{
                            width: '100%', background: saving ? '#86efac' : GREEN, color: 'white',
                            border: 'none', borderRadius: '8px', padding: '11px', fontSize: '14px',
                            fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}>
                            <Save size={16} />
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </div>

                <style>{`
                    @media (max-width: 768px) {
                        .company-form-layout { grid-template-columns: 1fr !important; }
                    }
                `}</style>
            </form>
        </div>
    );
}
