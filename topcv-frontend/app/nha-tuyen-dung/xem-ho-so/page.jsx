'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    FileText, X, ChevronLeft, ChevronRight, Briefcase,
    MapPin, DollarSign, ExternalLink, ChevronDown, ChevronUp,
    User, Calendar, Phone, Loader2, UserCheck, UserX,
} from 'lucide-react';
import { connectService } from '@/services/connect.service';
import { provinceService } from '@/services/province.service';
import { cn } from '@/lib/utils';

const GREEN = '#00b14f';

function useProvinceMap() {
    const [map, setMap] = useState({});
    useEffect(() => {
        provinceService.getAll()
            .then(data => {
                const m = {};
                (data || []).forEach(p => { m[p.code] = p.name; });
                setMap(m);
            })
            .catch(() => {});
    }, []);
    return map;
}

function resolveProvinces(codes, map) {
    if (!codes?.length) return null;
    return codes.map(c => map[c] || map[String(c)] || map[Number(c)] || c).join(', ');
}

const GENDER_MAP = {
    MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác',
    male: 'Nam', female: 'Nữ', other: 'Khác',
    Nam: 'Nam', Nữ: 'Nữ',
};

function calcAge(dob) {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function formatDob(dob) {
    if (!dob) return null;
    return new Date(dob).toLocaleDateString('vi-VN');
}

const SALARY_MAP = {
    BELOW_10: 'Dưới 10 triệu',
    FROM_10_TO_15: '10 - 15 triệu',
    FROM_15_TO_20: '15 - 20 triệu',
    FROM_20_TO_25: '20 - 25 triệu',
    FROM_25_TO_30: '25 - 30 triệu',
    ABOVE_30: 'Trên 30 triệu',
    NEGOTIABLE: 'Thương lượng',
};

const WORKING_TYPE_MAP = {
    TOAN_THOI_GIAN: 'Toàn thời gian',
    BAN_THOI_GIAN: 'Bán thời gian',
    FREELANCE: 'Freelance',
    THUC_TAP: 'Thực tập',
    REMOTE: 'Remote',
};

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="flex items-start gap-2">
            <Icon size={14} className="text-slate-400 mt-0.5 shrink-0" />
            <div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">{label}</div>
                <div className="text-[13px] text-slate-700 font-medium">{value}</div>
            </div>
        </div>
    );
}

// ── Candidate Detail Modal ────────────────────────────────────────────────────
function CandidateDetailModal({ candidateUserId, onClose, onConnect, onDismiss, actionLoading, provinceMap }) {
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
                <div className="px-5 py-[18px] border-b border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-[15px] text-slate-900">Thông tin ứng viên</span>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border-none cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {loading ? (
                        <div className="flex items-center justify-center gap-2.5 py-12 text-slate-400">
                            <Loader2 size={20} className="animate-spin" />
                            <span className="text-sm">Đang tải...</span>
                        </div>
                    ) : !detail ? (
                        <div className="text-center py-12 text-slate-400 text-sm">Không thể tải thông tin</div>
                    ) : (
                        <div className="flex flex-col gap-[18px]">
                            {/* Avatar + name */}
                            <div className="flex items-center gap-3.5">
                                <div className="w-16 h-16 rounded-full shrink-0 border-2 border-slate-200 overflow-hidden bg-green-50 flex items-center justify-center">
                                    {detail.avatarUrl
                                        ? <img src={detail.avatarUrl} alt="" className="w-full h-full object-cover block" />
                                        : <span className="font-bold text-2xl" style={{ color: GREEN }}>
                                            {(detail.fullName || '?')[0].toUpperCase()}
                                        </span>
                                    }
                                </div>
                                <div>
                                    <div className="font-bold text-[17px] text-slate-900">{detail.fullName || 'Ứng viên'}</div>
                                    {prefs.jobTitle && (
                                        <div className="text-[13px] text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Briefcase size={12} /> {prefs.jobTitle}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Personal info */}
                            <div className="bg-slate-50 rounded-[10px] p-3.5 flex flex-col gap-2.5">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin cá nhân</div>
                                {!detail.gender && !detail.dob && !detail.phone && (
                                    <div className="text-[13px] text-slate-400 italic">Ứng viên chưa cập nhật thông tin cá nhân</div>
                                )}
                                {!!(detail.gender || detail.dob || detail.phone) && (
                                    <div className="grid grid-cols-2 gap-3">
                                        {detail.gender && <InfoItem icon={User} label="Giới tính" value={GENDER_MAP[detail.gender] || detail.gender} />}
                                        {detail.dob && <InfoItem icon={Calendar} label="Ngày sinh" value={`${formatDob(detail.dob)}${age !== null ? ` (${age} tuổi)` : ''}`} />}
                                        {detail.phone && <InfoItem icon={Phone} label="Số điện thoại" value={detail.phone} />}
                                    </div>
                                )}
                            </div>

                            {/* Job preferences */}
                            {Object.keys(prefs).length > 0 && (
                                <div className="bg-slate-50 rounded-[10px] p-3.5 flex flex-col gap-2.5">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nguyện vọng việc làm</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {prefs.salaryRange && <InfoItem icon={DollarSign} label="Mức lương" value={SALARY_MAP[prefs.salaryRange] || prefs.salaryRange} />}
                                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && (
                                            <InfoItem icon={MapPin} label="Địa điểm" value={prefs.provinceName || resolveProvinces(prefs.provinceCodes, provinceMap) || prefs.provinceCodes?.join(', ')} />
                                        )}
                                        {prefs.workingType && <InfoItem icon={Briefcase} label="Hình thức" value={WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType} />}
                                        {prefs.experience && <InfoItem icon={Briefcase} label="Kinh nghiệm" value={prefs.experience} />}
                                    </div>
                                </div>
                            )}

                            {/* CV */}
                            {detail.cvTitle && (
                                <div className="flex items-center gap-2.5 border border-slate-200 rounded-[10px] px-3.5 py-3">
                                    <FileText size={18} className="text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold text-slate-700 truncate">{detail.cvTitle}</div>
                                        <div className="text-[11px] text-slate-400 mt-0.5">
                                            {detail.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}
                                        </div>
                                    </div>
                                    {cvHref && (
                                        <a href={cvHref} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs font-semibold no-underline shrink-0"
                                            style={{ color: GREEN }}
                                        >
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
                        onClick={() => { onDismiss(candidateUserId); onClose(); }}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-lg bg-white text-slate-500 text-[13px] font-semibold cursor-pointer disabled:cursor-not-allowed"
                    >
                        <UserX size={15} /> Bỏ qua
                    </button>
                    <button
                        onClick={() => { onConnect(candidateUserId); onClose(); }}
                        disabled={actionLoading}
                        className={cn(
                            'flex-[2] flex items-center justify-center gap-1.5 py-2.5 border-none rounded-lg text-white text-[13px] font-bold',
                            actionLoading ? 'bg-slate-300 cursor-not-allowed' : 'cursor-pointer'
                        )}
                        style={!actionLoading ? { background: GREEN } : {}}
                    >
                        <UserCheck size={15} /> Gửi kết nối
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Profile Card ──────────────────────────────────────────────────────────────
function ProfileCard({ candidate, onDismiss, dismissing, onView, onViewDetail, provinceMap }) {
    const [expanded, setExpanded] = useState(false);

    const handleToggleExpand = () => {
        if (!expanded) onView(candidate.userId);
        setExpanded(v => !v);
    };
    const prefs = candidate.jobPreferences || {};
    const letter = (candidate.fullName || '?')[0].toUpperCase();

    const cvHref = candidate.cvType === 'uploaded'
        ? candidate.cvFileUrl
        : candidate.defaultCvId ? `/xem-cv/${candidate.defaultCvId}` : null;

    return (
        <div className="bg-white border border-slate-200 rounded-[14px] overflow-hidden shadow-sm">
            {/* Header row */}
            <div className="p-4 flex flex-wrap items-center gap-3.5 min-[520px]:flex-nowrap">
                {/* Avatar */}
                <div className="w-[52px] h-[52px] rounded-[14px] shrink-0 border-2 border-emerald-100 overflow-hidden bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover block" />
                        : <span className="font-extrabold text-xl" style={{ color: GREEN }}>{letter}</span>
                    }
                </div>

                {/* Name + title + gender/dob */}
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-[15px] text-slate-900">{candidate.fullName || 'Ứng viên'}</div>
                    {prefs.jobTitle && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Briefcase size={11} /> {prefs.jobTitle}
                        </div>
                    )}
                    {(candidate.gender || candidate.dob) && (
                        <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-slate-400">
                            {candidate.gender && (
                                <span className="flex items-center gap-0.5">
                                    <User size={10} /> {GENDER_MAP[candidate.gender] || candidate.gender}
                                </span>
                            )}
                            {candidate.dob && (
                                <span className="flex items-center gap-0.5">
                                    <Calendar size={10} />
                                    {formatDob(candidate.dob)}{calcAge(candidate.dob) !== null ? ` (${calcAge(candidate.dob)} tuổi)` : ''}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0 w-full min-[520px]:w-auto justify-end">
                    <button
                        onClick={() => onViewDetail(candidate.userId)}
                        className="flex items-center gap-1 px-3 py-[7px] border rounded-[9px] text-xs font-bold bg-green-50 cursor-pointer whitespace-nowrap"
                        style={{ borderColor: GREEN, color: GREEN }}
                    >
                        <User size={13} /> Xem chi tiết
                    </button>
                    {cvHref && (
                        <a
                            href={cvHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-3 py-[7px] border border-slate-200 rounded-[9px] text-slate-700 text-xs font-semibold no-underline bg-white"
                            onClick={e => e.stopPropagation()}
                        >
                            <FileText size={13} /> Xem CV
                        </a>
                    )}
                    <button
                        onClick={() => onDismiss(candidate.userId)}
                        disabled={dismissing}
                        title="Xóa khỏi danh sách"
                        className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                    >
                        <X size={15} />
                    </button>
                    <button
                        onClick={handleToggleExpand}
                        className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer"
                    >
                        {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                </div>
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div className="border-t border-slate-100 p-3.5 bg-slate-50 flex flex-col gap-2.5">
                    {/* CV info */}
                    {candidate.cvTitle && (
                        <div className="flex items-center gap-2 p-2.5 px-3 bg-white rounded-lg border border-slate-100">
                            <FileText size={15} className="text-slate-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-semibold text-slate-700 truncate">{candidate.cvTitle}</div>
                                <div className="text-[11px] text-slate-400">
                                    {candidate.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}
                                </div>
                            </div>
                            {cvHref && (
                                <a href={cvHref} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-semibold no-underline flex items-center gap-0.5 shrink-0"
                                    style={{ color: GREEN }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <ExternalLink size={12} /> Xem
                                </a>
                            )}
                        </div>
                    )}

                    {/* Preferences grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {prefs.salaryRange && (
                            <div className="flex items-start gap-1.5">
                                <DollarSign size={13} className="text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Mức lương</div>
                                    <div className="text-xs text-slate-700 font-medium">{SALARY_MAP[prefs.salaryRange] || prefs.salaryRange}</div>
                                </div>
                            </div>
                        )}
                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && (
                            <div className="flex items-start gap-1.5">
                                <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Địa điểm</div>
                                    <div className="text-xs text-slate-700 font-medium">
                                        {prefs.provinceName || resolveProvinces(prefs.provinceCodes, provinceMap) || prefs.provinceCodes?.join(', ')}
                                    </div>
                                </div>
                            </div>
                        )}
                        {prefs.workingType && (
                            <div className="flex items-start gap-1.5">
                                <Briefcase size={13} className="text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Hình thức</div>
                                    <div className="text-xs text-slate-700 font-medium">{WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType}</div>
                                </div>
                            </div>
                        )}
                        {prefs.experience && (
                            <div className="flex items-start gap-1.5">
                                <Briefcase size={13} className="text-slate-400 mt-0.5 shrink-0" />
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Kinh nghiệm</div>
                                    <div className="text-xs text-slate-700 font-medium">{prefs.experience}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Connect CTA */}
                    <div className="pt-1">
                        <a
                            href="/nha-tuyen-dung/ket-noi"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold no-underline"
                            style={{ color: GREEN }}
                        >
                            Gửi lời kết nối cho ứng viên này →
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function XemHoSoPage() {
    const [candidates, setCandidates] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [dismissing, setDismissing] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [detailUserId, setDetailUserId] = useState(null);
    const provinceMap = useProvinceMap();

    const fetchCandidates = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await connectService.getSuggestions({ page: p, limit: 12, mode: 'view' });
            setCandidates(res.data?.data ?? []);
            setMeta(res.data?.meta ?? { total: 0, page: p, limit: 12, totalPages: 1 });
        } catch {
            toast.error('Không thể tải danh sách hồ sơ');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCandidates(page); }, [page, fetchCandidates]);

    const handleView = async (candidateUserId) => {
        try { await connectService.recordView(candidateUserId); } catch {}
    };

    const handleDismiss = async (candidateUserId) => {
        setDismissing(candidateUserId);
        try {
            await connectService.skip(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Đã xóa khỏi danh sách');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setDismissing(null);
        }
    };

    const handleConnect = async (candidateUserId) => {
        setActionLoading(true);
        try {
            await connectService.request(candidateUserId);
            setCandidates(prev => prev.filter(c => c.userId !== candidateUserId));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Đã gửi yêu cầu kết nối');
        } catch (e) {
            toast.error(e?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-5">
                <h1 className="text-[22px] font-extrabold text-slate-900 mb-1">Hồ sơ ứng viên</h1>
                <p className="text-[13px] text-slate-500">Ứng viên đang tìm việc, phù hợp với ngành của bạn</p>
            </div>

            {/* Stats bar */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between shadow-sm">
                <span className="text-[13px] text-slate-500">
                    <strong className="text-slate-900">{meta.total}</strong> hồ sơ phù hợp
                </span>
                <span className="text-xs text-slate-400">Trang {meta.page}/{Math.max(1, meta.totalPages)}</span>
            </div>

            {loading ? (
                <div className="text-center py-16 text-slate-400 text-sm">Đang tải...</div>
            ) : candidates.length === 0 ? (
                <div className="text-center py-16 px-5 bg-white rounded-xl border border-slate-200">
                    <FileText size={48} className="text-slate-300 mx-auto mb-3" />
                    <div className="text-[15px] font-semibold text-slate-700 mb-1.5">Không có hồ sơ nào</div>
                    <div className="text-[13px] text-slate-400">Hiện chưa có ứng viên phù hợp. Hãy quay lại sau!</div>
                </div>
            ) : (
                <div className="flex flex-col gap-2.5 mb-6">
                    {candidates.map(c => (
                        <ProfileCard
                            key={c.userId}
                            candidate={c}
                            onDismiss={handleDismiss}
                            dismissing={dismissing === c.userId}
                            onView={handleView}
                            onViewDetail={setDetailUserId}
                            provinceMap={provinceMap}
                        />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={cn(
                            'flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-[13px]',
                            page === 1 ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-slate-50'
                        )}
                    >
                        <ChevronLeft size={15} /> Trước
                    </button>
                    <span className="text-[13px] text-slate-500 px-2">{page} / {meta.totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages}
                        className={cn(
                            'flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-[13px]',
                            page === meta.totalPages ? 'bg-slate-50 cursor-not-allowed' : 'bg-white cursor-pointer hover:bg-slate-50'
                        )}
                    >
                        Sau <ChevronRight size={15} />
                    </button>
                </div>
            )}

            {/* Detail modal */}
            {detailUserId && (
                <CandidateDetailModal
                    candidateUserId={detailUserId}
                    onClose={() => setDetailUserId(null)}
                    onConnect={handleConnect}
                    onDismiss={handleDismiss}
                    actionLoading={actionLoading}
                    provinceMap={provinceMap}
                />
            )}
        </div>
    );
}
