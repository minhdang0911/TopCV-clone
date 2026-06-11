'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import api from '@/lib/axios';
import useAuthStore from '@/stores/auth.store';

const GREEN = '#00b14f';

function getWsUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return apiUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://')
        .replace(/\/api\/?$/, '');
}

function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 2) return 'vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return `${Math.floor(hours / 24)} ngày trước`;
}

export default function NotificationBell({ iconColor = '#6b7280' }) {
    const { accessToken, isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const fetchAll = useCallback(async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                api.get('/notifications?limit=30'),
                api.get('/notifications/unread-count'),
            ]);
            setNotifications(listRes.data?.data || []);
            setUnreadCount(countRes.data?.count || 0);
        } catch {}
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchAll();
    }, [isAuthenticated, fetchAll]);

    // WebSocket — auto-reconnect
    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;
        let ws = null;
        let timer = null;
        let dead = false;

        function connect() {
            if (dead) return;
            const wsBase = getWsUrl();
            ws = new WebSocket(`${wsBase}/ws?token=${accessToken}`);

            ws.onmessage = (ev) => {
                try {
                    const { event: type, data } = JSON.parse(ev.data);
                    if (type === 'notification') {
                        setNotifications((prev) => [data, ...prev].slice(0, 50));
                        setUnreadCount((c) => c + 1);
                    }
                } catch {}
            };

            ws.onerror = () => ws.close();
            ws.onclose = () => {
                if (!dead) timer = setTimeout(connect, 4000);
            };
        }

        connect();
        return () => {
            dead = true;
            if (timer) clearTimeout(timer);
            if (ws) ws.close();
        };
    }, [isAuthenticated, accessToken]);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const markRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {}
    };

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch {}
    };

    const deleteOne = async (e, id) => {
        e.stopPropagation();
        const notif = notifications.find((n) => n.id === id);
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            if (notif && !notif.isRead) setUnreadCount((c) => Math.max(0, c - 1));
        } catch {}
    };

    const clearAll = async () => {
        try {
            await api.delete('/notifications/clear-all');
            setNotifications([]);
            setUnreadCount(0);
        } catch {}
    };

    const handleNotifClick = (n) => {
        if (!n.isRead) markRead(n.id);
        if (n.url) {
            setOpen(false);
            window.location.href = n.url;
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            <style>{`
                @media (max-width: 480px) {
                    .notif-dropdown {
                        position: fixed !important;
                        top: 56px !important;
                        left: 8px !important;
                        right: 8px !important;
                        width: auto !important;
                        max-width: none !important;
                    }
                }
            `}</style>
            <button
                onClick={() => setOpen((o) => !o)}
                title="Thông báo"
                style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    position: 'relative', padding: '4px', display: 'flex',
                    color: iconColor,
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute', top: 0, right: 0,
                        background: '#ef4444', color: 'white',
                        fontSize: '9px', borderRadius: '50%',
                        width: '14px', height: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', lineHeight: 1,
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="notif-dropdown" style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 'min(360px, calc(100vw - 16px))',
                    background: 'white', borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.16)', border: '1px solid #e5e7eb',
                    zIndex: 500, overflow: 'hidden',
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                        <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>
                            Thông báo{unreadCount > 0 && <span style={{ color: '#ef4444', marginLeft: '4px' }}>({unreadCount})</span>}
                        </span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead}
                                    style={{ background: 'none', border: 'none', fontSize: '12px', color: GREEN, cursor: 'pointer', fontWeight: '600', padding: 0 }}>
                                    Đọc tất cả
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button onClick={clearAll}
                                    style={{ background: 'none', border: 'none', fontSize: '12px', color: '#9ca3af', cursor: 'pointer', padding: 0 }}>
                                    Xoá tất cả
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '36px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                                Chưa có thông báo nào
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => handleNotifClick(n)}
                                    style={{
                                        padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                                        background: n.isRead ? 'white' : '#f0fdf4',
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = n.isRead ? '#f9fafb' : '#dcfce7';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = n.isRead ? 'white' : '#f0fdf4';
                                    }}
                                >
                                    {!n.isRead && (
                                        <div style={{
                                            width: '7px', height: '7px', borderRadius: '50%',
                                            background: GREEN, flexShrink: 0, marginTop: '5px',
                                        }} />
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '13px', fontWeight: n.isRead ? '400' : '600', color: '#111827', marginBottom: '2px', paddingLeft: n.isRead ? '17px' : 0 }}>
                                            {n.title}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5', marginBottom: '3px', paddingLeft: n.isRead ? '17px' : 0 }}>
                                            {n.body}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', paddingLeft: n.isRead ? '17px' : 0 }}>
                                            {timeAgo(n.createdAt)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => deleteOne(e, n.id)}
                                        title="Xoá"
                                        style={{
                                            background: 'none', border: 'none', cursor: 'pointer',
                                            color: '#d1d5db', padding: '2px', flexShrink: 0,
                                            fontSize: '18px', lineHeight: 1, marginTop: '-2px',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#d1d5db'; }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
