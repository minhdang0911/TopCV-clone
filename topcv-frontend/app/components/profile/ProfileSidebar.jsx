'use client';

import { useState } from 'react';
import Link from 'next/link';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';

export default function ProfileSidebar() {
    const { user, setUser } = useAuthStore();
    const [toggling, setToggling] = useState(false);

    if (!user) return null;

    const avatarSrc =
        user.candidateProfile?.avatarUrl ||
        user.employerProfile?.logoUrl ||
        '/default-avatar.png';
    const displayName =
        user.candidateProfile?.fullName ||
        user.employerProfile?.companyName ||
        user.email ||
        '';
    const isLooking = user.candidateProfile?.isLookingForJob ?? false;
    const allowSearch = user.candidateProfile?.allowEmployerSearch ?? false;

    const handleToggleLooking = async () => {
        if (toggling || user.role !== 'CANDIDATE') return;
        setToggling(true);
        try {
            await api.patch('/users/me/profile', { isLookingForJob: !isLooking });
            const res = await api.get('/users/me');
            setUser(res.data);
        } catch {}
        setToggling(false);
    };

    return (
        <div
            style={{
                background: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                overflow: 'hidden',
            }}
        >
            {/* User card */}
            <div style={{ padding: '20px 16px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '10px' }}>
                    <img
                        src={avatarSrc}
                        alt="avatar"
                        style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid #e5e7eb',
                        }}
                    />
                </div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '4px' }}>
                    {displayName}
                </div>
                {user.isVerified && (
                    <span
                        style={{
                            display: 'inline-block',
                            fontSize: '11px',
                            color: '#059669',
                            background: '#d1fae5',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            marginBottom: '10px',
                        }}
                    >
                        Tài khoản đã xác thực
                    </span>
                )}
                <div>
                    <Link
                        href="#"
                        style={{
                            fontSize: '12px',
                            color: '#00b14f',
                            fontWeight: '600',
                            textDecoration: 'none',
                        }}
                    >
                        Nâng cấp tài khoản
                    </Link>
                </div>
            </div>

            {/* isLookingForJob toggle (candidates only) */}
            {user.role === 'CANDIDATE' && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                            {isLooking ? 'Đang Bật tìm việc' : 'Đang Tắt tìm việc'}
                        </span>
                        <button
                            onClick={handleToggleLooking}
                            disabled={toggling}
                            style={{
                                width: '40px',
                                height: '22px',
                                borderRadius: '11px',
                                background: isLooking ? '#00b14f' : '#d1d5db',
                                border: 'none',
                                cursor: toggling ? 'not-allowed' : 'pointer',
                                position: 'relative',
                                transition: 'background 0.2s',
                                flexShrink: 0,
                            }}
                        >
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '3px',
                                    left: isLooking ? '21px' : '3px',
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    background: 'white',
                                    transition: 'left 0.2s',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                }}
                            />
                        </button>
                    </div>
                </div>
            )}

            {/* allowEmployerSearch info (candidates only) */}
            {user.role === 'CANDIDATE' && (
                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                        Cho phép NTD tìm kiếm hồ sơ
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                        Có 1 CV đang bật cho phép NTD tìm kiếm
                    </div>
                    <Link
                        href="#"
                        style={{
                            display: 'inline-block',
                            padding: '5px 14px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#374151',
                            textDecoration: 'none',
                            fontWeight: '500',
                        }}
                    >
                        Quản lý danh sách
                    </Link>
                </div>
            )}

            {/* CV score placeholder */}
            <div style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    CV của bạn đã đủ tốt?
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Bao nhiêu NTD đang quan tâm tới Hồ sơ của bạn?
                </div>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '2px solid #e5e7eb',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#9ca3af',
                        margin: '8px 0',
                    }}
                >
                    0
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>lượt</div>
                <Link
                    href="#"
                    style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '5px 14px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontWeight: '500',
                    }}
                >
                    Khám phá ngay
                </Link>
            </div>
        </div>
    );
}
