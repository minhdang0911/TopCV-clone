'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft, ChevronRight, CalendarDays, List,
    Video, Clock, User, Briefcase, MapPin,
} from 'lucide-react';
import { applicationsService } from '@/services/applications.service';
import { meetingsService } from '@/services/meetings.service';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const INTERVIEW_TYPE_LABEL = {
    direct:  'Trực tiếp',
    online:  'Online',
    phone:   'Điện thoại',
};

const MEETING_STATUS = {
    scheduled: { label: 'Đã lên lịch', color: '#3b82f6', bg: '#eff6ff' },
    active:    { label: 'Đang diễn ra', color: '#16a34a', bg: '#f0fdf4' },
    ended:     { label: 'Đã kết thúc',  color: '#94a3b8', bg: '#f8fafc' },
};

function formatTime(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isToday(date) {
    const t = new Date();
    return date.getFullYear() === t.getFullYear() &&
        date.getMonth() === t.getMonth() &&
        date.getDate() === t.getDate();
}

function getCalendarDays(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let startDow = firstDay.getDay();
    startDow = startDow === 0 ? 6 : startDow - 1;
    const totalDays = lastDay.getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) {
        cells.push({ date: new Date(year, month - 1, -startDow + 1 + i), inMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
        cells.push({ date: new Date(year, month - 1, d), inMonth: true });
    }
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        cells.push({ date: new Date(year, month, i), inMonth: false });
    }
    return cells;
}

// ─── Interview chip (blue-ish) ───────────────────────────────────────────────
function InterviewChip({ item, onClick }) {
    const name = item.candidate?.candidateProfile?.fullName || item.candidate?.email || '—';
    return (
        <button
            onClick={() => onClick(item)}
            className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium leading-snug truncate hover:opacity-80 transition-opacity"
            style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
        >
            {formatTime(item.interviewAt)} {name}
        </button>
    );
}

// ─── Meeting chip (green) ────────────────────────────────────────────────────
function MeetingChip({ item, onClick }) {
    const cfg = MEETING_STATUS[item.status] || MEETING_STATUS.scheduled;
    const name = item.candidate?.candidateProfile?.fullName || item.candidate?.email || '—';
    return (
        <button
            onClick={() => onClick(item)}
            className="w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium leading-snug truncate hover:opacity-80 transition-opacity"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}
        >
            {formatTime(item.scheduledAt)} {name}
        </button>
    );
}

// ─── Interview detail modal ──────────────────────────────────────────────────
function InterviewDetailModal({ item, onClose }) {
    if (!item) return null;
    const name = item.candidate?.candidateProfile?.fullName || item.candidate?.email || '—';
    const avatar = item.candidate?.candidateProfile?.avatarUrl;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-100 max-w-[95vw]" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] text-slate-800 truncate">{name}</p>
                        <p className="text-[12px] text-slate-400 truncate">{item.candidate?.email}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-lg leading-none mt-0.5">×</button>
                </div>
                <div className="px-5 py-4 space-y-3">
                    {item.job?.title && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-700">
                            <Briefcase size={14} className="text-slate-400 shrink-0" />
                            <span>{item.job.title}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-[13px] text-slate-700">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>
                            {item.interviewAt
                                ? new Date(item.interviewAt).toLocaleString('vi-VN', {
                                    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })
                                : 'Chưa có lịch'}
                        </span>
                    </div>
                    {item.interviewLocation && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-700">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span>{item.interviewLocation}</span>
                        </div>
                    )}
                    {item.interviewType && (
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                                {INTERVIEW_TYPE_LABEL[item.interviewType] || item.interviewType}
                            </span>
                        </div>
                    )}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
                    <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-50 rounded-lg">Đóng</button>
                </div>
            </div>
        </div>
    );
}

// ─── Meeting detail modal ────────────────────────────────────────────────────
function MeetingDetailModal({ item, onClose, onJoin }) {
    if (!item) return null;
    const cfg = MEETING_STATUS[item.status] || MEETING_STATUS.scheduled;
    const name = item.candidate?.candidateProfile?.fullName || item.candidate?.email || '—';
    const avatar = item.candidate?.candidateProfile?.avatarUrl;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-100 max-w-[95vw]" onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 border-b border-slate-100 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <User size={18} className="text-slate-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] text-slate-800 truncate">{name}</p>
                        <p className="text-[12px] text-slate-400 truncate">{item.candidate?.email}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-lg leading-none mt-0.5">×</button>
                </div>
                <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-2 text-[13px] text-slate-700">
                        <Video size={14} className="text-slate-400 shrink-0" />
                        <span>{item.title || 'Phỏng vấn video'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-slate-700">
                        <Clock size={14} className="text-slate-400 shrink-0" />
                        <span>
                            {item.scheduledAt
                                ? new Date(item.scheduledAt).toLocaleString('vi-VN', {
                                    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                })
                                : 'Chưa lên lịch'}
                        </span>
                    </div>
                    {item.application?.job?.title && (
                        <div className="flex items-center gap-2 text-[13px] text-slate-700">
                            <Briefcase size={14} className="text-slate-400 shrink-0" />
                            <span>{item.application.job.title}</span>
                        </div>
                    )}
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                    </span>
                </div>
                <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                    <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-slate-500 hover:bg-slate-50 rounded-lg">Đóng</button>
                    {item.status !== 'ended' && (
                        <button onClick={() => onJoin(item.roomCode)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg">
                            <Video size={13} /> Vào phòng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Calendar grid ───────────────────────────────────────────────────────────
function CalendarGrid({ year, month, interviews, meetings, onSelectInterview, onSelectMeeting }) {
    const interviewByDate = {};
    for (const item of interviews) {
        if (!item.interviewAt) continue;
        const key = toDateKey(new Date(item.interviewAt));
        if (!interviewByDate[key]) interviewByDate[key] = [];
        interviewByDate[key].push(item);
    }
    const meetingByDate = {};
    for (const item of meetings) {
        if (!item.scheduledAt) continue;
        const key = toDateKey(new Date(item.scheduledAt));
        if (!meetingByDate[key]) meetingByDate[key] = [];
        meetingByDate[key].push(item);
    }

    const cells = getCalendarDays(year, month);
    return (
        <div>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS.map(d => (
                    <div key={d} className="text-center text-[11px] font-bold text-slate-400 py-1.5 uppercase tracking-wider">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
                {cells.map((cell, i) => {
                    const key = toDateKey(cell.date);
                    const ivs = interviewByDate[key] || [];
                    const mts = meetingByDate[key] || [];
                    const today = isToday(cell.date);
                    return (
                        <div key={i} className={`bg-white min-h-[88px] p-1.5 ${!cell.inMonth ? 'opacity-40' : ''}`}>
                            <div className="flex items-center justify-center mb-1">
                                <span className={`w-6 h-6 flex items-center justify-center text-[12px] font-semibold rounded-full ${today ? 'bg-green-600 text-white' : 'text-slate-600'}`}>
                                    {cell.date.getDate()}
                                </span>
                            </div>
                            <div className="space-y-0.5">
                                {ivs.slice(0, 2).map(item => (
                                    <InterviewChip key={item.id} item={item} onClick={onSelectInterview} />
                                ))}
                                {mts.slice(0, 2 - Math.min(ivs.length, 2)).map(item => (
                                    <MeetingChip key={item.id} item={item} onClick={onSelectMeeting} />
                                ))}
                                {(ivs.length + mts.length) > 2 && (
                                    <span className="text-[10px] text-slate-400 px-1">+{ivs.length + mts.length - 2} khác</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 px-1">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-300" />
                    <span className="text-[11px] text-slate-500">Phỏng vấn trực tiếp/online</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-green-50 border border-green-300" />
                    <span className="text-[11px] text-slate-500">Video meeting</span>
                </div>
            </div>
        </div>
    );
}

// ─── List view ───────────────────────────────────────────────────────────────
function ListView({ interviews, meetings, onSelectInterview, onSelectMeeting }) {
    const all = [
        ...interviews.filter(i => i.interviewAt).map(i => ({ ...i, _type: 'interview', _date: new Date(i.interviewAt) })),
        ...meetings.filter(m => m.scheduledAt).map(m => ({ ...m, _type: 'meeting', _date: new Date(m.scheduledAt) })),
    ].sort((a, b) => a._date - b._date);

    if (all.length === 0) {
        return <div className="py-10 text-center text-slate-400 text-[13px]">Không có lịch trong tháng này</div>;
    }

    return (
        <div className="space-y-2">
            {all.map(item => {
                const isIv = item._type === 'interview';
                const name = item.candidate?.candidateProfile?.fullName || item.candidate?.email || '—';
                const jobTitle = isIv ? item.job?.title : item.application?.job?.title;
                return (
                    <button key={`${item._type}-${item.id}`}
                        onClick={() => isIv ? onSelectInterview(item) : onSelectMeeting(item)}
                        className="w-full text-left flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all bg-white"
                    >
                        <div className="text-center min-w-10">
                            <p className="text-[10px] text-slate-400">{item._date.toLocaleDateString('vi-VN', { weekday: 'short' })}</p>
                            <p className="text-[18px] font-bold text-slate-700 leading-tight">{item._date.getDate()}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 truncate">
                                {isIv ? (name) : (item.title || 'Phỏng vấn video')}
                            </p>
                            {isIv
                                ? <p className="text-[12px] text-slate-500 truncate">{item.candidate?.email}</p>
                                : <p className="text-[12px] text-slate-500 truncate">{name}</p>
                            }
                            {jobTitle && <p className="text-[11px] text-slate-400 truncate">{jobTitle}</p>}
                        </div>
                        <div className="shrink-0 flex flex-col items-end gap-1">
                            <span className="text-[11px] font-semibold text-slate-600">{formatTime(item._date)}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isIv ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                {isIv ? (INTERVIEW_TYPE_LABEL[item.interviewType] || 'Phỏng vấn') : 'Video meeting'}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function InterviewCalendarPage() {
    const router = useRouter();
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [interviews, setInterviews] = useState([]);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('calendar');
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            applicationsService.getInterviewSchedule(month, year),
            meetingsService.getMyMeetings(month, year),
        ]).then(([ivRes, mtRes]) => {
            setInterviews(ivRes.data?.data || []);
            setMeetings(mtRes.data?.data || []);
        }).catch(() => {
            setInterviews([]);
            setMeetings([]);
        }).finally(() => setLoading(false));
    }, [month, year]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

    const handleJoin = (roomCode) => router.push(`/meet/${roomCode}`);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[20px] font-bold text-slate-800">Lịch phỏng vấn</h1>
                    <p className="text-[13px] text-slate-400 mt-0.5">Lịch hẹn phỏng vấn và video meeting với ứng viên</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setViewMode('calendar')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${viewMode === 'calendar' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        <CalendarDays size={14} /> Lịch
                    </button>
                    <button onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                        <List size={14} /> Danh sách
                    </button>
                </div>
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
                        <div className="h-64 flex items-center justify-center text-slate-400 text-[13px]">Đang tải...</div>
                    ) : viewMode === 'calendar' ? (
                        <CalendarGrid
                            year={year} month={month}
                            interviews={interviews} meetings={meetings}
                            onSelectInterview={setSelectedInterview}
                            onSelectMeeting={setSelectedMeeting}
                        />
                    ) : (
                        <ListView
                            interviews={interviews} meetings={meetings}
                            onSelectInterview={setSelectedInterview}
                            onSelectMeeting={setSelectedMeeting}
                        />
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
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[12px] text-slate-500">Video meeting</span>
                        <span className="text-[12px] font-bold text-slate-700">{meetings.length}</span>
                    </div>
                    <div className="ml-auto text-[12px] text-slate-400">
                        Tổng: <span className="font-bold text-slate-600">{interviews.length + meetings.length}</span> sự kiện
                    </div>
                </div>
            </div>

            {selectedInterview && (
                <InterviewDetailModal item={selectedInterview} onClose={() => setSelectedInterview(null)} />
            )}
            {selectedMeeting && (
                <MeetingDetailModal item={selectedMeeting} onClose={() => setSelectedMeeting(null)} onJoin={handleJoin} />
            )}
        </div>
    );
}
