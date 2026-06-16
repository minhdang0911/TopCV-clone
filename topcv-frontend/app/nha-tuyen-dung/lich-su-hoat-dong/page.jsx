'use client';

import { useState, useEffect, useCallback } from 'react';
import { History, LogIn, LogOut, UserPlus, Shield, Globe } from 'lucide-react';
import api from '@/lib/axios';
import DateRangePicker from '@/components/DateRangePicker';

const ACTION_META = {
  LOGIN:    { label: 'Đăng nhập',                    icon: LogIn,    color: '#00b14f' },
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

  const fetchLogs = useCallback(async (r) => {
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

  useEffect(() => { fetchLogs(range); }, []); // eslint-disable-line

  const handleRangeChange = (r) => {
    setRange(r);
    fetchLogs(r);
  };

  const groups = groupByDate(logs);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 m-0">Lịch sử hoạt động</h2>
          <p className="text-sm text-slate-500 mt-1 mb-0">
            {total > 0 ? `${total} hoạt động` : 'Chưa có hoạt động nào'}
          </p>
        </div>
        <DateRangePicker value={range} onChange={handleRangeChange} />
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Đang tải...</div>
        ) : groups.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <History size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400 m-0">Không có hoạt động nào trong khoảng thời gian này</p>
          </div>
        ) : (
          groups.map(([date, items], gi) => (
            <div key={date}>
              <div className={`px-5 py-3 bg-slate-50 border-b border-slate-100 ${gi > 0 ? 'border-t border-slate-200' : ''}`}>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{date}</span>
              </div>
              {items.map((log, i) => {
                const meta = getMeta(log.action);
                const Icon = meta.icon;
                return (
                  <div
                    key={log.id}
                    className={`flex items-center gap-4 px-5 py-3.5 ${i < items.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <div className="w-11 shrink-0">
                      <span className="text-sm font-bold text-green-600">{fmtTime(log.createdAt)}</span>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${meta.color}18` }}>
                      <Icon size={16} color={meta.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-slate-900 font-medium">{meta.label}</span>
                    </div>
                    {log.ipAddress && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Globe size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400 font-mono">{log.ipAddress}</span>
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
