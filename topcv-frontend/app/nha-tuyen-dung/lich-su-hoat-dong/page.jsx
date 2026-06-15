'use client';

import { useState, useEffect, useCallback } from 'react';
import { History, LogIn, LogOut, UserPlus, Shield, Globe } from 'lucide-react';
import api from '@/lib/axios';
import DateRangePicker from '@/components/DateRangePicker';

const GREEN = '#00b14f';

const ACTION_META = {
  LOGIN:    { label: 'Đăng nhập',                    icon: LogIn,    color: GREEN },
  LOGOUT:   { label: 'Đăng xuất',                    icon: LogOut,   color: '#64748b' },
  REGISTER: { label: 'Đăng ký tài khoản thành công', icon: UserPlus, color: '#3b82f6' },
};

function getMeta(action) {
  return ACTION_META[action] || { label: action, icon: Shield, color: '#94a3b8' };
}

function fmtTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function fmtDate(iso) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

function groupByDate(logs) {
  const map = new Map();
  for (const log of logs) {
    const key = fmtDate(log.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(log);
  }
  return [...map.entries()];
}

const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

export default function LichSuHoatDongPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState({ start: today0(), end: today0() });
  const [total, setTotal] = useState(0);

  const fetch = useCallback(async (r) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (r?.start) {
        const from = new Date(r.start); from.setHours(0, 0, 0, 0);
        params.set('from', from.toISOString());
      }
      if (r?.end) {
        const to = new Date(r.end); to.setHours(23, 59, 59, 999);
        params.set('to', to.toISOString());
      }
      const res = await api.get(`/audit-logs/my?${params}`);
      const data = res.data?.data ?? [];
      setLogs(data);
      setTotal(res.data?.meta?.total ?? data.length);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(range); }, []);

  const handleRangeChange = (r) => {
    setRange(r);
    fetch(r);
  };

  const groups = groupByDate(logs);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Lịch sử hoạt động</h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>
            {total > 0 ? `${total} hoạt động` : 'Chưa có hoạt động nào'}
          </p>
        </div>
        <DateRangePicker value={range} onChange={handleRangeChange} />
      </div>

      {/* Content */}
      <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
            Đang tải...
          </div>
        ) : groups.length === 0 ? (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <History size={40} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: 0 }}>Không có hoạt động nào trong khoảng thời gian này</p>
          </div>
        ) : (
          groups.map(([date, items], gi) => (
            <div key={date}>
              {/* Date header */}
              <div style={{ padding: '12px 20px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9', borderTop: gi > 0 ? '1px solid #e2e8f0' : 'none' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{date}</span>
              </div>

              {/* Log items */}
              {items.map((log, i) => {
                const meta = getMeta(log.action);
                const Icon = meta.icon;
                return (
                  <div
                    key={log.id}
                    style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 20px', borderBottom: i < items.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  >
                    {/* Time */}
                    <div style={{ width: '44px', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: GREEN }}>{fmtTime(log.createdAt)}</span>
                    </div>

                    {/* Icon */}
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `${meta.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={meta.color} />
                    </div>

                    {/* Description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: '500' }}>{meta.label}</span>
                    </div>

                    {/* IP */}
                    {log.ipAddress && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                        <Globe size={12} color="#94a3b8" />
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>{log.ipAddress}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
