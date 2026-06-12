'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth.store';
import ProfileSidebar from '@/app/components/profile/ProfileSidebar';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
    const router = useRouter();
    const { user, hydrated, isAuthenticated } = useAuthStore();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (hydrated && !isAuthenticated) {
            router.replace('/login');
        }
    }, [hydrated, isAuthenticated, router]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        setSaving(true);
        try {
            await userService.changePassword({ oldPassword, newPassword, confirmPassword });
            toast.success('Đổi mật khẩu thành công');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setSaving(false);
        }
    };

    if (!hydrated || !user) return null;

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

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 16px' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                <div className="account-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}>
                    {/* Main form */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            padding: '24px',
                        }}
                    >
                        <h1
                            style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#111827',
                                marginBottom: '20px',
                            }}
                        >
                            Thay đổi mật khẩu đăng nhập
                        </h1>

                        {error && (
                            <div
                                style={{
                                    background: '#fee2e2',
                                    color: '#991b1b',
                                    padding: '10px 14px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    marginBottom: '16px',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSave}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Email đăng nhập
                                </label>
                                <input
                                    type="email"
                                    value={user.email || ''}
                                    readOnly
                                    style={{ ...inputStyle, background: '#f9fafb', color: '#6b7280' }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = '#00b14f')}
                                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = '#00b14f')}
                                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                                    Nhập lại mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    style={inputStyle}
                                    onFocus={(e) => (e.target.style.borderColor = '#00b14f')}
                                    onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    padding: '10px 32px',
                                    background: saving ? '#9ca3af' : '#00b14f',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: '600',
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
            <style>{`@media(max-width:768px){.account-grid{grid-template-columns:1fr!important;}}`}</style>
        </div>
    );
}
