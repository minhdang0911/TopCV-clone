'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    UserCheck, UserX, ChevronLeft, ChevronRight,
    FileText, Briefcase, MessageSquare, Clock, CheckCircle, XCircle,
    User, Calendar, Phone, MapPin, DollarSign, ExternalLink, X, Loader2, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { connectService } from '@/services/connect.service';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const GREEN = '#00b14f';

const TABS = [
    { key: 'suggest',   label: 'Gợi ý' },
    { key: 'PENDING',   label: 'Chờ phản hồi' },
    { key: 'CONNECTED', label: 'Đã kết nối' },
    { key: 'REJECTED',  label: 'Đã từ chối' },
];

const SALARY_MAP = {
    BELOW_10: 'Dưới 10 triệu', FROM_10_TO_15: '10 - 15 triệu', FROM_15_TO_20: '15 - 20 triệu',
    FROM_20_TO_25: '20 - 25 triệu', FROM_25_TO_30: '25 - 30 triệu', ABOVE_30: 'Trên 30 triệu', NEGOTIABLE: 'Thương lượng',
};
const WORKING_TYPE_MAP = {
    TOAN_THOI_GIAN: 'Toàn thời gian', BAN_THOI_GIAN: 'Bán thời gian',
    FREELANCE: 'Freelance', THUC_TAP: 'Thực tập', REMOTE: 'Remote',
};
const GENDER_MAP = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác', male: 'Nam', female: 'Nữ', other: 'Khác', Nam: 'Nam', Nữ: 'Nữ' };

function calcAge(dob) {
    if (!dob) return null;
    const birth = new Date(dob), today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}
const formatDob = (dob) => dob ? new Date(dob).toLocaleDateString('vi-VN') : null;

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <Icon size={13} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
                <div className="text-sm text-slate-700 font-medium">{value}</div>
            </div>
        </div>
    );
}

// ─── Candidate Detail Modal ───────────────────────────────────────────────────
function CandidateDetailModal({ candidateUserId, onClose, onSkip, onConnect, actionLoading }) {
    const [detail,  setDetail]  = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        connectService.getCandidateDetail(candidateUserId)
            .then(res  => { if (!cancelled) setDetail(res.data); })
            .catch(()  => { if (!cancelled) toast.error('Không thể tải thông tin ứng viên'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [candidateUserId]);

    const prefs  = detail?.jobPreferences || {};
    const age    = calcAge(detail?.dob);
    const cvHref = detail?.cvType === 'uploaded'
        ? detail?.cvFileUrl
        : detail?.defaultCvId ? `/xem-cv/${detail.defaultCvId}` : null;

    return (
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Thông tin ứng viên</span>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                        <X size={15} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Skeleton className="w-16 h-16 rounded-full" />
                                <div className="space-y-2"><Skeleton className="h-5 w-36" /><Skeleton className="h-4 w-24" /></div>
                            </div>
                            <Skeleton className="h-24 rounded-xl" />
                        </div>
                    ) : !detail ? (
                        <div className="text-center py-12 text-slate-400 text-sm">Không thể tải thông tin</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-16 h-16 rounded-full shrink-0 border-2 border-slate-200 overflow-hidden bg-emerald-50 flex items-center justify-center">
                                    {detail.avatarUrl
                                        ? <img src={detail.avatarUrl} alt="" className="w-16 h-16 object-cover" />
                                        : <span className="font-bold text-2xl text-[#00b14f]">{(detail.fullName || '?')[0].toUpperCase()}</span>
                                    }
                                </div>
                                <div>
                                    <div className="font-bold text-base text-slate-900">{detail.fullName || 'Ứng viên'}</div>
                                    {prefs.jobTitle && <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5"><Briefcase size={12} /> {prefs.jobTitle}</div>}
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin cá nhân</div>
                                {!detail.gender && !detail.dob && !detail.phone ? (
                                    <p className="text-sm text-slate-400 italic">Ứng viên chưa cập nhật thông tin cá nhân</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {detail.gender && <InfoRow icon={User}     label="Giới tính"     value={GENDER_MAP[detail.gender] || detail.gender} />}
                                        {detail.dob    && <InfoRow icon={Calendar} label="Ngày sinh"      value={`${formatDob(detail.dob)}${age !== null ? ` (${age} tuổi)` : ''}`} />}
                                        {detail.phone  && <InfoRow icon={Phone}    label="Số điện thoại" value={detail.phone} />}
                                    </div>
                                )}
                            </div>
                            {Object.keys(prefs).length > 0 && (
                                <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nguyện vọng việc làm</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {prefs.salaryRange && <InfoRow icon={DollarSign} label="Mức lương" value={SALARY_MAP[prefs.salaryRange] || prefs.salaryRange} />}
                                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && <InfoRow icon={MapPin} label="Địa điểm" value={prefs.provinceName || prefs.provinceCodes?.join(', ')} />}
                                        {prefs.workingType && <InfoRow icon={Briefcase} label="Hình thức"   value={WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType} />}
                                        {prefs.experience  && <InfoRow icon={Briefcase} label="Kinh nghiệm" value={prefs.experience} />}
                                    </div>
                                </div>
                            )}
                            {detail.cvTitle && (
                                <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-3.5 py-3">
                                    <FileText size={17} className="text-slate-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-700 truncate">{detail.cvTitle}</div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">{detail.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}</div>
                                    </div>
                                    {cvHref && (
                                        <a href={cvHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-[#00b14f] font-semibold no-underline shrink-0">
                                            <ExternalLink size={13} /> Xem CV
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2.5">
                    <Button variant="outline" className="flex-1 gap-1.5" onClick={() => { onSkip(candidateUserId); onClose(); }} disabled={actionLoading}>
                        <UserX size={14} /> Bỏ qua
                    </Button>
                    <Button className="flex-[2] gap-1.5 bg-[#00b14f] hover:bg-[#009944] text-white"
                        onClick={() => { onConnect(candidateUserId); onClose(); }} disabled={actionLoading}>
                        <UserCheck size={14} /> Gửi kết nối
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ─── Candidate Card ───────────────────────────────────────────────────────────
function CandidateCard({ candidate, onSkip, onConnect, loading, onViewDetail }) {
    const age    = calcAge(candidate.dob);
    const cvHref = candidate.cvType === 'uploaded' ? candidate.cvFileUrl
        : candidate.defaultCvId ? `/xem-cv/${candidate.defaultCvId}` : null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="font-bold text-xl text-[#00b14f]">{(candidate.fullName || '?')[0].toUpperCase()}</span>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900">{candidate.fullName || 'Ứng viên'}</div>
                    {candidate.jobPreferences?.jobTitle && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Briefcase size={11} /> {candidate.jobPreferences.jobTitle}
                        </div>
                    )}
                </div>
            </div>

            {(candidate.gender || candidate.dob) && (
                <div className="flex gap-4 text-xs text-slate-400">
                    {candidate.gender && <span className="flex items-center gap-1"><User size={11} />{GENDER_MAP[candidate.gender] || candidate.gender}</span>}
                    {candidate.dob    && <span className="flex items-center gap-1"><Calendar size={11} />{formatDob(candidate.dob)}{age !== null ? ` (${age} tuổi)` : ''}</span>}
                </div>
            )}

            {candidate.cvTitle && (
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <FileText size={14} className="text-slate-400" />
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-700 truncate">{candidate.cvTitle}</div>
                        <div className="text-[11px] text-slate-400">{candidate.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}</div>
                    </div>
                    {cvHref && <a href={cvHref} target="_blank" rel="noopener noreferrer" className="text-xs text-[#00b14f] no-underline font-semibold shrink-0">Xem</a>}
                </div>
            )}

            <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="flex-1 h-8 gap-1 text-xs" onClick={() => onSkip(candidate.userId)} disabled={loading}>
                    <UserX size={12} /> Bỏ qua
                </Button>
                <Button variant="outline" size="sm" className="flex-[2] h-8 gap-1 text-xs border-[#00b14f] text-[#00b14f] bg-emerald-50 hover:bg-emerald-100 hover:text-[#00b14f]"
                    onClick={() => onViewDetail(candidate.userId)} disabled={loading}>
                    <User size={12} /> Xem chi tiết
                </Button>
                <Button size="sm" className="flex-[2] h-8 gap-1 text-xs bg-[#00b14f] hover:bg-[#009944] text-white"
                    onClick={() => onConnect(candidate.userId)} disabled={loading}>
                    <UserCheck size={12} /> Kết nối
                </Button>
            </div>
        </div>
    );
}

// ─── Sent Card ────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
    PENDING:   { label: 'Chờ phản hồi', cls: 'bg-amber-50 text-amber-700',  Icon: Clock },
    CONNECTED: { label: 'Đã kết nối',   cls: 'bg-emerald-50 text-emerald-700', Icon: CheckCircle },
    REJECTED:  { label: 'Đã từ chối',   cls: 'bg-red-50 text-red-600',      Icon: XCircle },
};

function SentCard({ item }) {
    const s      = STATUS_STYLE[item.status] || STATUS_STYLE.PENDING;
    const letter = (item.candidate?.fullName || item.candidate?.email || '?')[0].toUpperCase();
    return (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3.5 hover:shadow-sm transition-shadow">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border-2 border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {item.candidate?.avatarUrl
                    ? <img src={item.candidate.avatarUrl} alt="" className="w-12 h-12 object-cover" />
                    : <span className="font-bold text-lg text-[#00b14f]">{letter}</span>
                }
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 mb-1">{item.candidate?.fullName || item.candidate?.email || 'Ứng viên'}</div>
                <div className="flex gap-2 items-center flex-wrap">
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold', s.cls)}>
                        <s.Icon size={11} /> {s.label}
                    </span>
                    <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
            {item.status === 'CONNECTED' && (
                <Link href="/nha-tuyen-dung/tin-nhan"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 border border-[#00b14f] rounded-lg text-[#00b14f] text-xs font-semibold no-underline hover:bg-emerald-50 transition-colors shrink-0">
                    <MessageSquare size={13} /> Nhắn tin
                </Link>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function KetNoiPage() {
    const [activeTab,    setActiveTab]    = useState('suggest');
    const [candidates,   setCandidates]   = useState([]);
    const [sentItems,    setSentItems]    = useState([]);
    const [meta,         setMeta]         = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
    const [loading,      setLoading]      = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [page,         setPage]         = useState(1);
    const [detailUserId, setDetailUserId] = useState(null);

    const fetchData = useCallback(async (tab, p) => {
        setLoading(true);
        try {
            if (tab === 'suggest') {
                const res = await connectService.getSuggestions({ page: p, limit: 9 });
                setCandidates(res.data?.data ?? []);
                setMeta(res.data?.meta ?? { total: 0, page: p, limit: 9, totalPages: 1 });
            } else {
                const res = await connectService.getSent({ status: tab, page: p, limit: 10 });
                setSentItems(res.data?.data ?? []);
                setMeta(res.data?.meta ?? { total: 0, page: p, limit: 10, totalPages: 1 });
            }
        } catch { toast.error('Không thể tải danh sách'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { setPage(1); fetchData(activeTab, 1); }, [activeTab, fetchData]);
    useEffect(() => { if (page > 1) fetchData(activeTab, page); }, [page, activeTab, fetchData]);

    const handleSkip = async (uid) => {
        setActionLoading(true);
        try {
            await connectService.skip(uid);
            setCandidates(prev => prev.filter(c => c.userId !== uid));
            toast.success('Đã bỏ qua ứng viên');
        } catch (e) { toast.error(e?.response?.data?.message || 'Có lỗi xảy ra'); }
        finally { setActionLoading(false); }
    };
    const handleConnect = async (uid) => {
        setActionLoading(true);
        try {
            await connectService.request(uid);
            setCandidates(prev => prev.filter(c => c.userId !== uid));
            toast.success('Đã gửi yêu cầu kết nối');
        } catch (e) { toast.error(e?.response?.data?.message || 'Có lỗi xảy ra'); }
        finally { setActionLoading(false); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Kết nối ứng viên</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Ứng viên phù hợp với ngành của bạn — gửi lời kết nối để bắt đầu trò chuyện</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchData(activeTab, page)} disabled={loading}
                    className="h-9 gap-1.5 border-slate-200">
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    Làm mới
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={cn('flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all',
                            activeTab === tab.key
                                ? 'bg-white text-[#00b14f] font-bold shadow-sm'
                                : 'text-slate-500 hover:text-slate-700')}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            {!loading && (
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3 mb-5 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        <strong className="text-slate-900">{meta.total}</strong>{' '}
                        {activeTab === 'suggest' ? 'ứng viên phù hợp' : 'lời mời'}
                    </span>
                    {meta.totalPages > 1 && <span className="text-xs text-slate-400">Trang {meta.page}/{meta.totalPages}</span>}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
                </div>
            ) : activeTab === 'suggest' ? (
                candidates.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <UserCheck size={26} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">Đã xem qua tất cả ứng viên</p>
                        <p className="text-sm text-slate-400">Hãy quay lại sau để xem ứng viên mới!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {candidates.map(c => (
                            <CandidateCard key={c.userId} candidate={c}
                                onSkip={handleSkip} onConnect={handleConnect}
                                loading={actionLoading} onViewDetail={setDetailUserId} />
                        ))}
                    </div>
                )
            ) : (
                sentItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <UserCheck size={26} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                            {activeTab === 'PENDING' ? 'Chưa có lời mời đang chờ phản hồi.' : 'Không có dữ liệu trong mục này.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5 mb-6">
                        {sentItems.map(item => <SentCard key={item.id} item={item} />)}
                    </div>
                )
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="gap-1">
                        <ChevronLeft size={14} /> Trước
                    </Button>
                    <span className="text-sm text-slate-500 px-2">{page} / {meta.totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="gap-1">
                        Sau <ChevronRight size={14} />
                    </Button>
                </div>
            )}

            {detailUserId && (
                <CandidateDetailModal candidateUserId={detailUserId} onClose={() => setDetailUserId(null)}
                    onSkip={handleSkip} onConnect={handleConnect} actionLoading={actionLoading} />
            )}
        </div>
    );
}
