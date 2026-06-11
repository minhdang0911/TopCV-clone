'use client';

import { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';

export default function NotificationToast({ notification, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 6000);
    return () => clearTimeout(t);
  }, [notification]);

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      maxWidth: '360px', width: 'calc(100vw - 48px)',
      background: 'white', borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      border: '1px solid #e5e7eb',
      padding: '14px 16px',
      display: 'flex', gap: '12px', alignItems: 'flex-start',
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: '#f0fdf4', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Bell size={18} color="#00b14f" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>
          {notification.title}
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
          {notification.body}
        </div>
        {notification.url && (
          <a href={notification.url} style={{ fontSize: '12px', color: '#00b14f', fontWeight: '600', textDecoration: 'none', marginTop: '6px', display: 'inline-block' }}>
            Xem chi tiết →
          </a>
        )}
      </div>

      <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px', flexShrink: 0 }}>
        <X size={16} />
      </button>
    </div>
  );
}
