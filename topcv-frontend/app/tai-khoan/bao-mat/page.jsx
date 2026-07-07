'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import useAuthStore from '@/stores/auth.store';
import ProfileSidebar from '@/app/components/profile/ProfileSidebar';
import OtpModal from '@/app/components/auth/OtpModal';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { userService } from '@/services/user.service';

export default function SecurityPage() {
    const router = useRouter();
    const { user, hydrated, isAuthenticated, setUser } = useAuthStore();

    const [receiveJobAlerts, setReceiveJobAlerts] = useState(true);
    const [allowCvImprovement, setAllowCvImprovement] = useState(true);

    const [twoFaModal, setTwoFaModal] = useState(null);
    const [twoFaLoading, setTwoFaLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (hydrated && !isAuthenticated) {
            router.replace('/login');
        }
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        if (user?.candidateProfile) {
            setReceiveJobAlerts(user.candidateProfile.isLookingForJob ?? false);
            setAllowCvImprovement(user.candidateProfile.allowEmployerSearch ?? true);
        }
    }, [user]);

    if (!hydrated || !user) return null;

    const twoFactorEnabled = user.twoFactorEnabled ?? false;

    const refreshUser = async () => {
        try {
            const res = await userService.getMe();
            setUser(res.data);
        } catch {}
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await userService.updateCandidateProfile({
                isLookingForJob: receiveJobAlerts,
                allowEmployerSearch: allowCvImprovement,
            });
            await refreshUser();
            toast.success('Lưu cài đặt bảo mật và quyền riêng tư thành công!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra khi lưu cài đặt');
        } finally {
            setSaving(false);
        }
    };

    const handleToggle2FA = async () => {
        setTwoFaLoading(true);
        try {
            if (twoFactorEnabled) {
                await authService.twoFaDisable();
                setTwoFaModal('disable');
            } else {
                await authService.twoFaEnable();
                setTwoFaModal('enable');
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setTwoFaLoading(false);
        }
    };

    const handleOtpConfirm = async (code) => {
        if (twoFaModal === 'enable') {
            await authService.twoFaConfirm(code);
            await refreshUser();
            setTwoFaModal(null);
            toast.success('Bật xác minh 2 bước thành công');
        } else if (twoFaModal === 'disable') {
            await authService.twoFaDisableConfirm(code);
            await refreshUser();
            setTwoFaModal(null);
            toast.success('Tắt xác minh 2 bước thành công');
        }
    };

    const handleOtpResend = async () => {
        if (twoFaModal === 'enable') {
            await authService.twoFaEnable();
        } else if (twoFaModal === 'disable') {
            await authService.twoFaDisable();
        }
    };

    return (
        <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: '24px 16px' }}>
            <div style={{ maxWidth: '960px', margin: '0 auto' }}>
                <div
                    className="account-grid"
                    style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'start' }}
                >
                    {/* Main */}
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
                            Thay đổi cài đặt bảo mật
                        </h1>

                        {/* Notification checkboxes */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={receiveJobAlerts}
                                    onChange={(e) => setReceiveJobAlerts(e.target.checked)}
                                    style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#00b14f', flexShrink: 0 }}
                                />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                        Nhận cơ hội việc làm tốt hơn từ TopCV
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                        Mỗi khi có việc làm phù hợp cao hơn 20 - 50% lương hiện tại. Mỗi khi có công
                                        việc phù hợp, TopCV sẽ thông báo tới bạn qua email hoặc điện thoại.
                                    </div>
                                </div>
                            </label>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={allowCvImprovement}
                                    onChange={(e) => setAllowCvImprovement(e.target.checked)}
                                    style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#00b14f', flexShrink: 0 }}
                                />
                                <div>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                                        Cho phép TopCV hỗ trợ sửa và đánh giá CV
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                                        TopCV giúp bạn cải thiện chất lượng CV.
                                    </div>
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={handleSaveSettings}
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
                                marginBottom: '24px',
                            }}
                        >
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>

                        {/* 2FA section */}
                        <div
                            style={{
                                padding: '20px',
                                background: '#f9fafb',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'space-between',
                                    gap: '16px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                                        Xác minh 2 bước
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                                        Bảo vệ tài khoản bằng cách yêu cầu mã OTP qua email mỗi khi đăng nhập.
                                    </div>
                                    {twoFactorEnabled ? (
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '2px 10px',
                                                background: '#d1fae5',
                                                color: '#059669',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                            }}
                                        >
                                            Đang bật
                                        </span>
                                    ) : (
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '2px 10px',
                                                background: '#fee2e2',
                                                color: '#ef4444',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                            }}
                                        >
                                            Chưa kích hoạt
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleToggle2FA}
                                    disabled={twoFaLoading}
                                    style={{
                                        padding: '8px 20px',
                                        background: twoFactorEnabled ? 'white' : '#00b14f',
                                        color: twoFactorEnabled ? '#374151' : 'white',
                                        border: twoFactorEnabled ? '1px solid #d1d5db' : 'none',
                                        borderRadius: '6px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: twoFaLoading ? 'not-allowed' : 'pointer',
                                        flexShrink: 0,
                                        opacity: twoFaLoading ? 0.7 : 1,
                                    }}
                                >
                                    {twoFaLoading
                                        ? 'Đang xử lý...'
                                        : twoFactorEnabled
                                        ? 'Tắt xác minh 2 bước'
                                        : 'Kích hoạt'}
                                </button>
                            </div>

                        </div>

                        {/* Privacy text */}
                        <div
                            style={{
                                marginTop: '20px',
                                fontSize: '12px',
                                color: '#6b7280',
                                lineHeight: '1.6',
                                borderTop: '1px solid #f3f4f6',
                                paddingTop: '16px',
                            }}
                        >
                            Tìm hiểu thêm về{' '}
                            <Link href="#" style={{ color: '#00b14f' }}>Chính sách bảo mật</Link>{' '}
                            và{' '}
                            <Link href="#" style={{ color: '#00b14f' }}>Điều khoản dịch vụ</Link>{' '}
                            của TopCV (đã được cập nhật theo quy định mới nhất của Nghị định 13/2023/NĐ-CP về Bảo vệ
                            dữ liệu cá nhân).
                        </div>
                    </div>

                    {/* Sidebar */}
                    <ProfileSidebar />
                </div>
            </div>

            <style>{`@media(max-width:768px){.account-grid{grid-template-columns:1fr!important;}}`}</style>

            {/* OTP Modal */}
            {twoFaModal && (
                <OtpModal
                    email={user.email}
                    title={twoFaModal === 'enable' ? 'Bật tính năng xác minh 2 bước' : 'Tắt xác minh 2 bước'}
                    description="Bạn vui lòng kiểm tra email để lấy mã."
                    onConfirm={handleOtpConfirm}
                    onCancel={() => setTwoFaModal(null)}
                    onResend={handleOtpResend}
                />
            )}
        </div>
    );
}
