'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Check, ChevronDown, X } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';

const GREEN = '#00b14f';

const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1px solid #e2e8f0',
    borderRadius: '10px', fontSize: '14px', color: '#0f172a',
    outline: 'none', background: '#fafafa', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
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

function IndustryPicker({ industries, selected, onChange }) {
    const [open, setOpen] = useState(false);

    const toggle = (id) => {
        if (selected.includes(id)) onChange(selected.filter(x => x !== id));
        else onChange([...selected, id]);
    };

    const selectedLabels = industries
        .filter(i => selected.includes(i.id))
        .map(i => i.name);

    return (
        <div style={{ position: 'relative' }}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                style={{
                    ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    cursor: 'pointer', gap: '8px',
                }}
            >
                <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected.length ? '#111827' : '#9ca3af' }}>
                    {selected.length === 0 ? '-- Chọn ngành nghề --' : selectedLabels.join(', ')}
                </span>
                <ChevronDown size={14} color="#9ca3af" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: '0.15s' }} />
            </button>

            {/* Selected tags */}
            {selected.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {industries.filter(i => selected.includes(i.id)).map(i => (
                        <span key={i.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 10px', background: '#f0fdf4', border: `1px solid ${GREEN}`,
                            borderRadius: '20px', fontSize: '12px', color: GREEN, fontWeight: '500',
                        }}>
                            {i.name}
                            <button type="button" onClick={() => toggle(i.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: GREEN, display: 'flex', padding: 0 }}>
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                    background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)', maxHeight: '220px', overflowY: 'auto',
                    marginTop: '4px',
                }}>
                    {industries.length === 0 && (
                        <div style={{ padding: '12px 16px', fontSize: '13px', color: '#9ca3af' }}>Đang tải...</div>
                    )}
                    {industries.map(i => (
                        <button
                            key={i.id}
                            type="button"
                            onClick={() => toggle(i.id)}
                            style={{
                                width: '100%', textAlign: 'left', padding: '10px 16px',
                                border: 'none', background: selected.includes(i.id) ? '#f0fdf4' : 'white',
                                cursor: 'pointer', fontSize: '13px', color: '#374151',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            }}
                        >
                            {i.name}
                            {selected.includes(i.id) && <Check size={14} color={GREEN} />}
                        </button>
                    ))}
                </div>
            )}
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
    const [industryIds, setIndustryIds] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/industries?limit=100').then(res => {
            setIndustries(res.data?.data ?? res.data ?? []);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (profile) {
            const ids = profile.industryIds;
            if (Array.isArray(ids)) setIndustryIds(ids.map(Number));
            else if (profile.industryId) setIndustryIds([profile.industryId]);
        }
    }, [profile]);

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, industryIds };
            const res = await api.patch('/users/me/profile', payload);
            setUser({ ...user, employerProfile: { ...profile, ...res.data, industryIds } });
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
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Hồ sơ công ty</h1>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Thông tin hiển thị cho ứng viên khi xem tin tuyển dụng của bạn</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'flex-start' }} className="company-form-layout">
                <div>
                    <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Thông tin cơ bản
                        </h3>
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

                        {/* Industry multi-select */}
                        <Field label="Ngành nghề" hint="Chọn một hoặc nhiều ngành phù hợp với lĩnh vực của công ty">
                            <IndustryPicker
                                industries={industries}
                                selected={industryIds}
                                onChange={setIndustryIds}
                            />
                        </Field>
                    </div>

                    <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 18px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>Giới thiệu công ty</h3>
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
                    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b' }}>Logo công ty</h3>
                        <div style={{ width: '96px', height: '96px', borderRadius: '14px', border: '2px dashed #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', overflow: 'hidden', background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)' }}>
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
                    <div style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <button type="submit" disabled={saving} style={{
                            width: '100%',
                            background: saving ? '#86efac' : `linear-gradient(135deg, ${GREEN}, #00934a)`,
                            color: 'white', border: 'none', borderRadius: '10px', padding: '12px',
                            fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            boxShadow: saving ? 'none' : '0 4px 12px rgba(0,177,79,0.3)',
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
