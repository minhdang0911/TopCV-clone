'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const GREEN = '#00b14f';
const RANGE_BG = '#d1fae5';

const MONTHS_VI = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'];
const DAYS_HEADER = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function sameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function fmt(d) {
  if (!d) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function addDays(d, n) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function today0() {
  const d = new Date(); d.setHours(0, 0, 0, 0); return d;
}

function startOfMonth(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function endOfMonth(d) { return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
function addMonths(d, n) {
  const r = new Date(d); r.setMonth(r.getMonth() + n); return r;
}

const PRESETS = [
  { key: 'today', label: 'Hôm nay' },
  { key: '7days', label: '7 ngày qua' },
  { key: '28days', label: '28 ngày qua' },
  { key: 'thisMonth', label: 'Tháng này' },
  { key: 'lastMonth', label: 'Tháng trước' },
  { key: 'all', label: 'Tất cả thời gian' },
  { key: 'custom', label: 'Tùy chỉnh' },
];

function getPresetRange(key) {
  const t = today0();
  switch (key) {
    case 'today': return { start: t, end: t };
    case '7days': return { start: addDays(t, -6), end: t };
    case '28days': return { start: addDays(t, -27), end: t };
    case 'thisMonth': return { start: startOfMonth(t), end: t };
    case 'lastMonth': { const p = addMonths(t, -1); return { start: startOfMonth(p), end: endOfMonth(p) }; }
    case 'all': return { start: null, end: null };
    default: return null;
  }
}

function CalendarGrid({ year, month, range, hoverDate, selecting, onDayClick, onDayHover }) {
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const t = today0();

  const { start, end } = range;
  const effEnd = selecting && hoverDate ? hoverDate : end;
  const lo = start && effEnd ? (start <= effEnd ? start : effEnd) : start;
  const hi = start && effEnd ? (start <= effEnd ? effEnd : start) : null;
  const sameSE = lo && hi && sameDay(lo, hi);

  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)' }}>
        {DAYS_HEADER.map(h => (
          <div key={h} style={{ fontSize: '11px', fontWeight: '600', color: '#94a3b8', textAlign: 'center', padding: '4px 0' }}>{h}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 32px)' }}>
          {week.map((d, di) => {
            if (!d) return <div key={di} style={{ height: '34px' }} />;

            const isLo = lo && sameDay(d, lo);
            const isHi = hi && sameDay(d, hi);
            const isEdge = isLo || isHi;
            const inRange = lo && hi && !sameSE && d > lo && d < hi;
            const isToday = sameDay(d, t);

            let outerBg = 'transparent';
            if (inRange) outerBg = RANGE_BG;
            else if (isLo && hi && !sameSE) outerBg = `linear-gradient(to right, transparent 50%, ${RANGE_BG} 50%)`;
            else if (isHi && lo && !sameSE) outerBg = `linear-gradient(to left, transparent 50%, ${RANGE_BG} 50%)`;

            return (
              <div
                key={di}
                style={{ height: '34px', background: outerBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => onDayClick(d)}
                onMouseEnter={() => onDayHover(d)}
              >
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: isEdge ? GREEN : 'transparent',
                  color: isEdge ? 'white' : isToday ? GREEN : '#374151',
                  fontWeight: isEdge || isToday ? '700' : '400',
                  fontSize: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: isToday && !isEdge ? `2px solid ${GREEN}` : 'none',
                  boxSizing: 'border-box',
                }}>
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function DateRangePicker({ value, onChange }) {
  const t = today0();
  const initRange = value || { start: t, end: t };

  const [open, setOpen] = useState(false);
  const [range, setRange] = useState(initRange);
  const [pending, setPending] = useState(initRange);
  const [activePreset, setActivePreset] = useState('today');
  const [selecting, setSelecting] = useState(false);
  const [hoverDate, setHoverDate] = useState(null);
  const [leftYear, setLeftYear] = useState(t.getFullYear());
  const [leftMonth, setLeftMonth] = useState(t.getMonth());
  const ref = useRef(null);

  // Right calendar always = left + 1
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (dir) => {
    let m = leftMonth + dir;
    let y = leftYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setLeftMonth(m);
    setLeftYear(y);
  };

  const handleOpen = () => {
    setPending(range);
    setSelecting(false);
    setHoverDate(null);
    setOpen(true);
  };

  const handlePreset = (key) => {
    setActivePreset(key);
    if (key === 'custom') return;
    const r = getPresetRange(key);
    setPending(r);
    setSelecting(false);
    setHoverDate(null);
    if (r?.start) {
      setLeftYear(r.start.getFullYear());
      setLeftMonth(r.start.getMonth() === 11 ? 10 : r.start.getMonth());
    }
  };

  const handleDayClick = (d) => {
    setActivePreset('custom');
    if (!selecting) {
      setPending({ start: d, end: null });
      setSelecting(true);
    } else {
      const { start } = pending;
      setPending(d < start ? { start: d, end: start } : { start, end: d });
      setSelecting(false);
    }
  };

  const handleOk = () => {
    const final = pending || { start: null, end: null };
    setRange(final);
    onChange?.(final);
    setOpen(false);
    setSelecting(false);
  };

  const handleCancel = () => {
    setPending(range);
    setSelecting(false);
    setOpen(false);
  };

  const label = range.start && range.end
    ? `${fmt(range.start)} - ${fmt(range.end)}`
    : range.start ? fmt(range.start) : 'Tất cả thời gian';

  const pendingLabel = pending?.start && pending?.end
    ? `${fmt(pending.start)} - ${fmt(pending.end)}`
    : pending?.start ? `${fmt(pending.start)} - ...` : 'Tất cả thời gian';

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={handleOpen}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 14px', background: 'white', cursor: 'pointer', fontSize: '13px', color: '#374151', minWidth: '220px', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      >
        <span>{label}</span>
        <ChevronDown size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
      </button>

      {open && (
        <div
          style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 200, background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', display: 'flex', overflow: 'hidden' }}
          onMouseLeave={() => setHoverDate(null)}
        >
          {/* Preset list */}
          <div style={{ width: '148px', borderRight: '1px solid #f1f5f9', padding: '10px 0', flexShrink: 0 }}>
            {PRESETS.map(p => (
              <button
                key={p.key}
                type="button"
                onClick={() => handlePreset(p.key)}
                style={{ width: '100%', textAlign: 'left', padding: '9px 16px', border: 'none', background: activePreset === p.key ? GREEN : 'transparent', color: activePreset === p.key ? 'white' : '#374151', cursor: 'pointer', fontSize: '13px', fontWeight: activePreset === p.key ? '600' : '400' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Dual calendar */}
          <div style={{ padding: '16px 18px 12px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Left calendar */}
              <div style={{ width: '224px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <button type="button" onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                    <ChevronLeft size={16} color="#374151" />
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{MONTHS_VI[leftMonth]}. {leftYear}</span>
                  <button type="button" onClick={() => navigate(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                    <ChevronRight size={16} color="#374151" />
                  </button>
                </div>
                <CalendarGrid
                  year={leftYear} month={leftMonth}
                  range={pending || { start: null, end: null }}
                  hoverDate={hoverDate} selecting={selecting}
                  onDayClick={handleDayClick} onDayHover={setHoverDate}
                />
              </div>

              {/* Right calendar */}
              <div style={{ width: '224px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <button type="button" onClick={() => navigate(-1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                    <ChevronLeft size={16} color="#374151" />
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{MONTHS_VI[rightMonth]}. {rightYear}</span>
                  <button type="button" onClick={() => navigate(1)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex' }}>
                    <ChevronRight size={16} color="#374151" />
                  </button>
                </div>
                <CalendarGrid
                  year={rightYear} month={rightMonth}
                  range={pending || { start: null, end: null }}
                  hoverDate={hoverDate} selecting={selecting}
                  onDayClick={handleDayClick} onDayHover={setHoverDate}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{pendingLabel}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={handleCancel} style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: '6px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer', color: '#374151', fontWeight: '500' }}>Hủy</button>
                <button type="button" onClick={handleOk} style={{ border: 'none', background: GREEN, borderRadius: '6px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer', color: 'white', fontWeight: '600' }}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
