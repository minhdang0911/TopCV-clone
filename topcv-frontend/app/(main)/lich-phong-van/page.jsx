'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, List, Video, Clock, MapPin, Building2 } from 'lucide-react';
import { applicationsService } from '@/services/applications.service';
import { meetingsService } from '@/services/meetings.service';
import useAuthStore from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isToday(date) {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() && date.getMonth() === t.getMonth() && date.getDate() === t.getDate();
}

function getCalendarDays(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push({ date: new Date(year, month - 1, -startDow + 1 + i), inMonth: false });
    for (let d = 1; d <= lastDay.getDate(); d++) cells.push({ date: new Date(year, month - 1, d), inMonth: true });
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) cells.push({ date: new Date(year, month, i), inMonth: false });
    return cells;
}

const INTERVIEW_TYPE_LABEL = { direct: 'Trực tiếp', online: 'Online', phone: 'Điện thoại' };

// ─── Detail modal ─────────────────────────────────────────────────────────────
function DetailModal({ event, onClose }) {
    const router = useRouter();
    if (!event) return null;
    const isInterview = event._type === 'interview';
    const company = isInterview
        ? event.job?.employer?.companyName
        : event.hostEmployer?.companyName;
    const logo = isInterview ? event.job?.employer?.logoUrl : event.hostEmployer?.logoUrl;
    const dateObj = isInterview ? new Date(event.interviewAt) : new Date(event.scheduledAt);
    const meeting = isInterview ? event.meetings?.[0] : event;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-lg border border-slate-100 flex items-center justify-center bg-slate-50 overflow-hidden shrink-0">
                        {logo ? <img src={logo} alt={company} className="w-full h-full object-contain" /> : <Building2 size={18} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] text-slate-800 truncate">{company || '—'}</p>
                        <p className="text-[12px] text-slate-400 truncate">
                            {isInterview ? (event.job?.title || '—') : (event.title || 'Phỏng vấn video')}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-xl leading-none">×</button>
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-[13px] text-slate-700">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>
                            {dateObj.toLocaleString('vi-VN', {
                                weekday: 'long', day: '2-digit', month: '2-digit',
                                year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                        </span>
                    </div>
                    {isInterview && event.interviewLocation && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-700">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span>{event.interviewLocation}</span>
                        </div>
                    )}
                    {isInterview && event.interviewType && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                {INTERVIEW_TYPE_LABEL[event.interviewType] || event.interviewType}
                            </span>
                        </div>
                    )}
                    {!isInterview && (
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${event.status === 'ended' ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600'}`}>
                                {event.status === 'ended' ? 'Đã kết thúc' : 'Đang mở'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-50 rounded-lg">Đóng</button>
                    {meeting && meeting.status !== 'ended' && (
                        <button
                            onClick={() => router.push(`/meet/${meeting.roomCode}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg"
                        >
                            <Video size={13} /> Vào phòng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Calendar grid ────────────────────────────────────────────────────────────
function CalendarGrid({ year, month, events, onSelect }) {
    const byDate = {};
    for (const ev of events) {
        const key = toDateKey(new Date(ev._date));
        if (!byDate[key]) byDate[key] = [];
        byDate[key].push(ev);
    }
    const cells = getCalendarDays(year, month);

    return (
        <div>
            <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[11px] font-bold text-slate-400 py-1.5 uppercase tracking-wider">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                {cells.map((cell, i) => {
                    const key = toDateKey(cell.date);
                    const dayEvs = byDate[key] || [];
                    const today = isToday(cell.date);
                    return (
                        <div key={i} className={`bg-white min-h-[88px] p-1.5 ${!cell.inMonth ? 'opacity-40' : ''}`}>
                            <div className="flex items-center justify-center mb-1">
                                <span className={`w-6 h-6 flex items-center justify-center text-[12px] font-semibold rounded-full ${today ? 'bg-green-600 text-white' : 'text-slate-600'}`}>
                                    {cell.date.getDate()}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                {dayEvs.slice(0, 3).map((ev, j) => (
                                    <button key={j} onClick={() => onSelect(ev)}
                                        className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium truncate hover:opacity-80"
                                        style={ev._type === 'interview'
                                            ? { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
                                            : { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }
                                        }>
                                        {formatTime(ev._date)} {ev._type === 'interview' ? (ev.job?.employer?.companyName || '—') : (ev.title || 'Meeting')}
                                    </button>
                                ))}
                                {dayEvs.length > 3 && <span className="text-[10px] text-slate-400 px-1">+{dayEvs.length - 3} khác</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex items-center gap-4 mt-3 px-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-300" />
                    <span className="text-[11px] text-slate-500">Phỏng vấn</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-violet-50 border border-violet-300" />
                    <span className="text-[11px] text-slate-500">Video meeting</span>
                </div>
            </div>
        </div>
    );
}

// ─── List view ────────────────────────────────────────────────────────────────
function ListView({ events, onSelect }) {
    if (!events.length) return (
        <div className="py-10 text-center text-slate-400 text-[13px]">Không có lịch trong tháng này</div>
    );
    return (
        <div className="space-y-2">
            {events.map((ev, i) => {
                const isIv = ev._type === 'interview';
                const company = isIv ? ev.job?.employer?.companyName : ev.hostEmployer?.companyName;
                const title = isIv ? (ev.job?.title || '—') : (ev.title || 'Phỏng vấn video');
                const meeting = isIv ? ev.meetings?.[0] : ev;
                return (
                    <button key={i} onClick={() => onSelect(ev)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white">
                        <div className="text-center min-w-10">
                            <p className="text-[10px] text-slate-400">{new Date(ev._date).toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                            <p className="text-[18px] font-bold text-slate-700 leading-tight">{new Date(ev._date).getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">{company}</p>
                            <p className="text-[12px] text-slate-500 truncate">{title}</p>
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                            <span className="text-[11px] font-semibold text-slate-600">{formatTime(ev._date)}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isIv ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                                {isIv ? (INTERVIEW_TYPE_LABEL[ev.interviewType] || 'Phỏng vấn') : 'Video meeting'}
                            </span>
                        </div>
                        {meeting && meeting.status !== 'ended' && (
                            <span className="shrink-0 w-2 h-2 rounded-full bg-green-500" title="Có link phòng" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CandidateCalendarPage() {
    const { isAuthenticated, hydrated } = useAuthStore();
    const router = useRouter();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [tab, setTab] = useState('all'); // 'all' | 'interview' | 'meeting'
    const [viewMode, setViewMode] = useState('calendar');
    const [interviews, setInterviews] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    const fetchData = useCallback(() => {
        if (!isAuthenticated) return;
        setLoading(true);
        Promise.all([
            applicationsService.getMyInterviews(month, year),
            meetingsService.getMyCandidateMeetings(month, year),
        ]).then(([ivRes, mtRes]) => {
            setInterviews(ivRes.data?.data || []);
            setMeetings(mtRes.data?.data || []);
        }).catch(() => {}).finally(() => setLoading(false));
    }, [month, year, isAuthenticated]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

    // Build unified event list
    const allEvents = [
        ...interviews.filter(iv => iv.interviewAt).map(iv => ({ ...iv, _type: 'interview', _date: new Date(iv.interviewAt) })),
        ...meetings.filter(mt => mt.scheduledAt).map(mt => ({ ...mt, _type: 'meeting', _date: new Date(mt.scheduledAt) })),
    ].sort((a, b) => a._date - b._date);

    const filtered = tab === 'interview' ? allEvents.filter(e => e._type === 'interview')
        : tab === 'meeting' ? allEvents.filter(e => e._type === 'meeting')
        : allEvents;

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h1 className="text-[20px] font-bold text-slate-900">Lịch phỏng vấn</h1>
                    <p className="text-[13px] text-slate-400 mt-0.5">Lịch hẹn và video meeting của bạn</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <button onClick={() => setViewMode('calendar')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'calendar' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <CalendarDays size={15} />
                    </button>
                    <button onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <List size={15} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mb-4 bg-slate-100 p-0.5 rounded-lg w-fit">
                {[['all', 'Tất cả'], ['interview', 'Phỏng vấn'], ['meeting', 'Video meeting']].map(([v, l]) => (
                    <button key={v} onClick={() => setTab(v)}
                        className={`px-3 py-1.5 text-[12px] font-semibold rounded-md transition-colors ${tab === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {l}
                        <span className="ml-1.5 text-[10px] font-bold opacity-60">
                            {v === 'all' ? allEvents.length : v === 'interview' ? allEvents.filter(e => e._type === 'interview').length : allEvents.filter(e => e._type === 'meeting').length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Calendar card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                {/* Month nav */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                    <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500"><ChevronLeft size={16} /></button>
                    <span className="text-[15px] font-bold text-slate-800">Tháng {month}/{year}</span>
                    <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-500"><ChevronRight size={16} /></button>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="w-7 h-7 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
                        </div>
                    ) : viewMode === 'calendar' ? (
                        <CalendarGrid year={year} month={month} events={filtered} onSelect={setSelected} />
                    ) : (
                        <ListView events={filtered} onSelect={setSelected} />
                    )}
                </div>

                {/* Summary */}
                <div className="px-5 py-2.5 border-t border-slate-100 flex items-center gap-5">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[12px] text-slate-500">Phỏng vấn</span>
                        <span className="text-[12px] font-bold text-slate-700">{interviews.length}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        <span className="text-[12px] text-slate-500">Video meeting</span>
                        <span className="text-[12px] font-bold text-slate-700">{meetings.length}</span>
                    </div>
                </div>
            </div>

            {selected && <DetailModal event={selected} onClose={() => setSelected(null)} />}
        </div>
    );
}
