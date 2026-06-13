'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth.store';
import ProfileSidebar from '@/app/components/profile/ProfileSidebar';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
};

export default function PersonalInfoPage() {
    const router = useRouter();
    const { user, hydrated, isAuthenticated, setUser } = useAuthStore();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [dob, setDob] = useState('');
    const [saving, setSaving] = useState(false);

    const isCandidate = user?.role === 'CANDIDATE';

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        if (user) {
            setFullName(user.candidateProfile?.fullName || user.employerProfile?.companyName || '');
            setPhone(user.phone || '');
            setGender(user.candidateProfile?.gender || '');
            const rawDob = user.candidateProfile?.dob;
            if (rawDob) {
                const d = new Date(rawDob);
                setDob(d.toISOString().slice(0, 10));
            }
        }
    }, [user]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { fullName, phone };
            if (isCandidate) {
                payload.gender = gender;
                payload.dob = dob;
            }
            await userService.updateInfo(payload);
            const res = await userService.getMe();
            setUser(res.data);
            toast.success('Cập nhật thông tin thành công');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (!hydrated || !user) return null;

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 16px' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                <div className="personal-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
                    {/* Main form */}
                    <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', padding: '24px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                            Cài đặt thông tin cá nhân
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
                            (*) Các thông tin bắt buộc
                        </p>

                        <form onSubmit={handleSave}>
                            {/* Full name */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Họ và tên <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    required
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#00b14f'}
                                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {/* Phone */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = '#00b14f'}
                                    onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {/* Gender + DOB — candidate only */}
                            {isCandidate && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                            Giới tính
                                        </label>
                                        <select
                                            value={gender}
                                            onChange={e => setGender(e.target.value)}
                                            style={{ ...inputStyle, color: gender ? '#111827' : '#9ca3af', cursor: 'pointer' }}
                                            onFocus={e => e.target.style.borderColor = '#00b14f'}
                                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                        >
                                            <option value="">Chọn giới tính</option>
                                            <option value="MALE">Nam</option>
                                            <option value="FEMALE">Nữ</option>
                                            <option value="OTHER">Khác</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                            Ngày sinh
                                        </label>
                                        <input
                                            type="date"
                                            value={dob}
                                            onChange={e => setDob(e.target.value)}
                                            style={inputStyle}
                                            onFocus={e => e.target.style.borderColor = '#00b14f'}
                                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Email (read-only) */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    readOnly
                                    style={{ ...inputStyle, color: '#6b7280', background: '#f9fafb' }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: '10px 32px',
                                    background: saving ? '#9ca3af' : '#00b14f',
                                    color: 'white', border: 'none', borderRadius: '6px',
                                    fontSize: '14px', fontWeight: '600',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <ProfileSidebar />
                </div>
            </div>

            <style>{`@media(max-width:768px){.personal-grid{grid-template-columns:1fr!important;}}`}</style>
        </div>
    );
}
