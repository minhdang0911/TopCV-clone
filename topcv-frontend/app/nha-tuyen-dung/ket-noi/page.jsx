'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    UserCheck, UserX, ChevronLeft, ChevronRight,
    FileText, Briefcase, MessageSquare, Clock, CheckCircle, XCircle,
    User, Calendar, Phone, MapPin, DollarSign, ExternalLink, X, Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { connectService } from '@/services/connect.service';
import { cn } from '@/lib/utils';

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

function formatDob(dob) {
    if (!dob) return null;
    return new Date(dob).toLocaleDateString('vi-VN');
}

function InfoRow({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
                <div className="text-[10px] text-slate-400 font-semibold">{label}</div>
                <div className="text-sm text-slate-700 font-medium">{value}</div>
            </div>
        </div>
    );
}

function CandidateDetailModal({ candidateUserId, onClose, onSkip, onConnect, actionLoading }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        connectService.getCandidateDetail(candidateUserId)
            .then(res => { if (!cancelled) setDetail(res.data); })
            .catch(() => { if (!cancelled) toast.error('Không thể tải thông tin ứng viên'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [candidateUserId]);

    const prefs = detail?.jobPreferences || {};
    const age = calcAge(detail?.dob);
    const cvHref = detail?.cvType === 'uploaded'
        ? detail?.cvFileUrl
        : detail?.defaultCvId ? `/xem-cv/${detail.defaultCvId}` : null;

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/45 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-[15px] text-slate-900">Thông tin ứng viên</span>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full border-none cursor-pointer text-slate-500 hover:bg-slate-200 transition-colors">
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex items-center justify-center py-12 gap-2.5 text-slate-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Đang tải...</span>
                        </div>
                    ) : !detail ? (
                        <div className="text-center py-12 text-slate-400 text-sm">Không thể tải thông tin</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {/* Avatar + name */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-16 h-16 rounded-full shrink-0 border-2 border-slate-200 overflow-hidden bg-green-50 flex items-center justify-center">
                                    {detail.avatarUrl
                                        ? <img src={detail.avatarUrl} alt="" className="w-16 h-16 object-cover block" />
                                        : <span className="font-bold text-2xl text-green-600">{(detail.fullName || '?')[0].toUpperCase()}</span>
                                    }
                                </div>
                                <div>
                                    <div className="font-bold text-[17px] text-slate-900">{detail.fullName || 'Ứng viên'}</div>
                                    {prefs.jobTitle && (
                                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Briefcase size={12} /> {prefs.jobTitle}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Personal info */}
                            <div className="bg-slate-50 rounded-xl px-4 py-3.5 flex flex-col gap-2.5">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin cá nhân</div>
                                {!detail.gender && !detail.dob && !detail.phone ? (
                                    <div className="text-sm text-slate-400 italic">Ứng viên chưa cập nhật thông tin cá nhân</div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {detail.gender && <InfoRow icon={User} label="Giới tính" value={GENDER_MAP[detail.gender] || detail.gender} />}
                                        {detail.dob && <InfoRow icon={Calendar} label="Ngày sinh" value={`${formatDob(detail.dob)}${age !== null ? ` (${age} tuổi)` : ''}`} />}
                                        {detail.phone && <InfoRow icon={Phone} label="Số điện thoại" value={detail.phone} />}
                                    </div>
                                )}
                            </div>

                            {/* Job prefs */}
                            {Object.keys(prefs).length > 0 && (
                                <div className="bg-slate-50 rounded-xl px-4 py-3.5 flex flex-col gap-2.5">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nguyện vọng việc làm</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {prefs.salaryRange && <InfoRow icon={DollarSign} label="Mức lương" value={SALARY_MAP[prefs.salaryRange] || prefs.salaryRange} />}
                                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && <InfoRow icon={MapPin} label="Địa điểm" value={prefs.provinceName || prefs.provinceCodes?.join(', ')} />}
                                        {prefs.workingType && <InfoRow icon={Briefcase} label="Hình thức" value={WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType} />}
                                        {prefs.experience && <InfoRow icon={Briefcase} label="Kinh nghiệm" value={prefs.experience} />}
                                    </div>
                                </div>
                            )}

                            {/* CV */}
                            {detail.cvTitle && (
                                <div className="flex items-center gap-2.5 border border-slate-200 rounded-xl px-3.5 py-3">
                                    <FileText size={18} className="text-slate-400 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-slate-700 truncate">{detail.cvTitle}</div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">{detail.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}</div>
                                    </div>
                                    {cvHref && (
                                        <a href={cvHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-green-600 font-semibold no-underline shrink-0">
                                            <ExternalLink size={13} /> Xem CV
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2.5">
                    <button
                        onClick={() => { onSkip(candidateUserId); onClose(); }}
                        disabled={actionLoading}
                        className="flex-1 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-500 text-sm font-semibold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed"
                    >
                        <UserX size={15} /> Bỏ qua
                    </button>
                    <button
                        onClick={() => { onConnect(candidateUserId); onClose(); }}
                        disabled={actionLoading}
                        className={cn('flex-[2] py-2.5 border-none rounded-lg text-white text-sm font-bold flex items-center justify-center gap-1.5 transition-colors', actionLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-green-500 cursor-pointer hover:opacity-90')}
                    >
                        <UserCheck size={15} /> Gửi kết nối
                    </button>
                </div>
            </div>
        </div>
    );
}

function CandidateCard({ candidate, onSkip, onConnect, loading, onViewDetail }) {
    const age = calcAge(candidate.dob);
    const cvHref = candidate.cvType === 'uploaded'
        ? candidate.cvFileUrl
        : candidate.defaultCvId ? `/xem-cv/${candidate.defaultCvId}` : null;

    return (
        <div className="bg-white border border-slate-200 rounded-[14px] px-5 py-4 flex flex-col gap-3.5 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" className="w-[52px] h-[52px] object-cover block" />
                        : <span className="font-extrabold text-xl text-green-600">{(candidate.fullName || '?')[0].toUpperCase()}</span>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-[15px] text-slate-900 mb-0.5">{candidate.fullName || 'Ứng viên'}</div>
                    {candidate.jobPreferences?.jobTitle && (
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Briefcase size={11} />
                            {candidate.jobPreferences.jobTitle}
                        </div>
                    )}
                </div>
            </div>

            {(candidate.gender || candidate.dob) && (
                <div className="flex gap-4 text-xs text-slate-500">
                    {candidate.gender && <span className="flex items-center gap-1"><User size={12} />{GENDER_MAP[candidate.gender] || candidate.gender}</span>}
                    {candidate.dob && <span className="flex items-center gap-1"><Calendar size={12} />{formatDob(candidate.dob)}{age !== null ? ` (${age} tuổi)` : ''}</span>}
                </div>
            )}

            {candidate.cvTitle && (
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                    <FileText size={15} className="text-slate-400" />
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-slate-700 truncate">{candidate.cvTitle}</div>
                        <div className="text-[11px] text-slate-400">{candidate.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}</div>
                    </div>
                    {cvHref && <a href={cvHref} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 no-underline font-semibold shrink-0">Xem</a>}
                </div>
            )}

            <div className="flex gap-2">
                <button onClick={() => onSkip(candidate.userId)} disabled={loading} className="flex-1 py-2 border border-slate-200 rounded-[9px] bg-slate-50 text-slate-500 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1 hover:bg-slate-100 disabled:cursor-not-allowed transition-colors">
                    <UserX size={13} /> Bỏ qua
                </button>
                <button onClick={() => onViewDetail(candidate.userId)} disabled={loading} className="flex-[2] py-2 border border-green-500 rounded-[9px] bg-green-50 text-green-600 text-xs font-bold cursor-pointer flex items-center justify-center gap-1 hover:bg-green-100 disabled:cursor-not-allowed transition-colors">
                    <User size={13} /> Xem chi tiết
                </button>
                <button
                    onClick={() => onConnect(candidate.userId)}
                    disabled={loading}
                    className={cn('flex-[2] py-2 border-none rounded-[9px] text-white text-xs font-bold flex items-center justify-center gap-1 transition-all', loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-br from-green-500 to-green-700 shadow-[0_3px_8px_rgba(0,177,79,0.3)] cursor-pointer hover:opacity-90')}
                >
                    <UserCheck size={13} /> Kết nối
                </button>
            </div>
        </div>
    );
}

const STATUS_STYLE = {
    PENDING:   { label: 'Chờ phản hồi', cls: 'bg-amber-50 text-amber-700',  Icon: Clock },
    CONNECTED: { label: 'Đã kết nối',   cls: 'bg-green-50 text-green-700',  Icon: CheckCircle },
    REJECTED:  { label: 'Đã từ chối',   cls: 'bg-red-50 text-red-600',      Icon: XCircle },
};

function SentCard({ item }) {
    const s = STATUS_STYLE[item.status] || STATUS_STYLE.PENDING;
    const letter = (item.candidate?.fullName || item.candidate?.email || '?')[0].toUpperCase();
    return (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-green-50 border-2 border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {item.candidate?.avatarUrl
                    ? <img src={item.candidate.avatarUrl} alt="" className="w-12 h-12 object-cover block" />
                    : <span className="font-bold text-lg text-green-600">{letter}</span>
                }
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-slate-900 mb-1">{item.candidate?.fullName || item.candidate?.email || 'Ứng viên'}</div>
                <div className="flex gap-2 items-center flex-wrap">
                    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold', s.cls)}>
                        <s.Icon size={11} /> {s.label}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
            </div>
            {item.status === 'CONNECTED' && (
                <Link href="/nha-tuyen-dung/tin-nhan" className="flex items-center gap-1.5 px-3.5 py-1.5 border border-green-500 rounded-lg text-green-600 text-xs font-semibold no-underline shrink-0 hover:bg-green-50 transition-colors">
                    <MessageSquare size={13} /> Nhắn tin
                </Link>
            )}
        </div>
    );
}

export default function KetNoiPage() {
    const [activeTab, setActiveTab] = useState('suggest');
    const [candidates, setCandidates] = useState([]);
    const [sentItems, setSentItems] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 9, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
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
        } catch {
            toast.error('Không thể tải danh sách');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { setPage(1); fetchData(activeTab, 1); }, [activeTab, fetchData]);
    useEffect(() => { if (page > 1) fetchData(activeTab, page); }, [page, activeTab, fetchData]);

    const handleSkip = async (candidateUserId) => {
        setActionLoading(true);
        try {
            await connectService.skip(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
            toast.success('Đã bỏ qua ứng viên');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleConnect = async (candidateUserId) => {
        setActionLoading(true);
        try {
            await connectService.request(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
            toast.success('Đã gửi yêu cầu kết nối');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const EmptyState = ({ message }) => (
        <div className="text-center py-16 px-5 bg-white rounded-xl border border-slate-200">
            <UserCheck size={48} className="text-slate-300 mx-auto mb-3" />
            <div className="text-sm font-semibold text-slate-700 mb-1.5">{message}</div>
        </div>
    );

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-xl font-extrabold text-slate-900 m-0 mb-1">Kết nối ứng viên</h1>
                <p className="text-sm text-slate-500 m-0">Ứng viên phù hợp với ngành của bạn — gửi lời kết nối để bắt đầu trò chuyện</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5 shadow-inner">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                            'flex-1 py-2 px-1 border-none rounded-[9px] text-xs cursor-pointer transition-all',
                            activeTab === tab.key
                                ? 'bg-white font-bold shadow-[0_2px_6px_rgba(0,0,0,0.1)]'
                                : 'bg-transparent font-medium text-slate-500 hover:text-slate-700'
                        )}
                        style={activeTab === tab.key ? { color: GREEN } : {}}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Stats */}
            {!loading && (
                <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between shadow-sm">
                    <span className="text-sm text-slate-500">
                        <strong className="text-slate-900">{meta.total}</strong>{' '}
                        {activeTab === 'suggest' ? 'ứng viên phù hợp' : 'lời mời'}
                    </span>
                    {meta.totalPages > 1 && <span className="text-xs text-slate-400">Trang {meta.page}/{meta.totalPages}</span>}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="text-center py-16 text-slate-400 text-sm">Đang tải...</div>
            ) : activeTab === 'suggest' ? (
                candidates.length === 0 ? (
                    <EmptyState message="Bạn đã xem qua tất cả ứng viên phù hợp. Hãy quay lại sau!" />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {candidates.map(c => (
                            <CandidateCard key={c.userId} candidate={c} onSkip={handleSkip} onConnect={handleConnect} loading={actionLoading} onViewDetail={setDetailUserId} />
                        ))}
                    </div>
                )
            ) : (
                sentItems.length === 0 ? (
                    <EmptyState message={activeTab === 'PENDING' ? 'Chưa có lời mời đang chờ phản hồi.' : 'Không có dữ liệu trong mục này.'} />
                ) : (
                    <div className="flex flex-col gap-2.5 mb-6">
                        {sentItems.map(item => <SentCard key={item.id} item={item} />)}
                    </div>
                )
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer flex items-center gap-1 text-sm text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors">
                        <ChevronLeft size={15} /> Trước
                    </button>
                    <span className="text-sm text-slate-500 px-2">{page} / {meta.totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer flex items-center gap-1 text-sm text-slate-700 hover:bg-slate-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-colors">
                        Sau <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {detailUserId && (
                <CandidateDetailModal
                    candidateUserId={detailUserId}
                    onClose={() => setDetailUserId(null)}
                    onSkip={handleSkip}
                    onConnect={handleConnect}
                    actionLoading={actionLoading}
                />
            )}
        </div>
    );
}
