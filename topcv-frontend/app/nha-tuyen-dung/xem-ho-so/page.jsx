'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
    FileText, X, ChevronLeft, ChevronRight, Briefcase,
    MapPin, DollarSign, ExternalLink, ChevronDown, ChevronUp,
    User, Calendar, Phone, Loader2, UserCheck, UserX, RefreshCw,
} from 'lucide-react';
import { connectService } from '@/services/connect.service';
import { provinceService } from '@/services/province.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const GREEN = '#00b14f';

function useProvinceMap() {
    const [map, setMap] = useState({});
    useEffect(() => {
        provinceService.getAll()
            .then(data => { const m = {}; (data || []).forEach(p => { m[p.code] = p.name; }); setMap(m); })
            .catch(() => {});
    }, []);
    return map;
}

function resolveProvinces(codes, map) {
    if (!codes?.length) return null;
    return codes.map(c => map[c] || map[String(c)] || map[Number(c)] || c).join(', ');
}

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

const SALARY_MAP = {
    BELOW_10: 'Dưới 10 triệu', FROM_10_TO_15: '10 - 15 triệu', FROM_15_TO_20: '15 - 20 triệu',
    FROM_20_TO_25: '20 - 25 triệu', FROM_25_TO_30: '25 - 30 triệu', ABOVE_30: 'Trên 30 triệu', NEGOTIABLE: 'Thương lượng',
};
const WORKING_TYPE_MAP = {
    TOAN_THOI_GIAN: 'Toàn thời gian', BAN_THOI_GIAN: 'Bán thời gian',
    FREELANCE: 'Freelance', THUC_TAP: 'Thực tập', REMOTE: 'Remote',
};

function InfoItem({ icon: Icon, label, value }) {
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
function CandidateDetailModal({ candidateUserId, onClose, onConnect, onDismiss, actionLoading, provinceMap }) {
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
                            <Skeleton className="h-20 rounded-xl" />
                        </div>
                    ) : !detail ? (
                        <div className="text-center py-12 text-slate-400 text-sm">Không thể tải thông tin</div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-16 h-16 rounded-full shrink-0 border-2 border-slate-200 overflow-hidden bg-emerald-50 flex items-center justify-center">
                                    {detail.avatarUrl
                                        ? <img src={detail.avatarUrl} alt="" className="w-full h-full object-cover" />
                                        : <span className="font-bold text-2xl text-[#00b14f]">{(detail.fullName || '?')[0].toUpperCase()}</span>
                                    }
                                </div>
                                <div>
                                    <div className="font-bold text-base text-slate-900">{detail.fullName || 'Ứng viên'}</div>
                                    {prefs.jobTitle && (
                                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                                            <Briefcase size={12} /> {prefs.jobTitle}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5">
                                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Thông tin cá nhân</div>
                                {!detail.gender && !detail.dob && !detail.phone ? (
                                    <p className="text-sm text-slate-400 italic">Ứng viên chưa cập nhật thông tin cá nhân</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {detail.gender && <InfoItem icon={User}     label="Giới tính"     value={GENDER_MAP[detail.gender] || detail.gender} />}
                                        {detail.dob    && <InfoItem icon={Calendar} label="Ngày sinh"      value={`${formatDob(detail.dob)}${age !== null ? ` (${age} tuổi)` : ''}`} />}
                                        {detail.phone  && <InfoItem icon={Phone}    label="Số điện thoại" value={detail.phone} />}
                                    </div>
                                )}
                            </div>

                            {Object.keys(prefs).length > 0 && (
                                <div className="bg-slate-50 rounded-xl p-3.5 space-y-2.5">
                                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nguyện vọng việc làm</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {prefs.salaryRange && <InfoItem icon={DollarSign} label="Mức lương"  value={SALARY_MAP[prefs.salaryRange] || prefs.salaryRange} />}
                                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && (
                                            <InfoItem icon={MapPin} label="Địa điểm" value={prefs.provinceName || resolveProvinces(prefs.provinceCodes, provinceMap) || prefs.provinceCodes?.join(', ')} />
                                        )}
                                        {prefs.workingType && <InfoItem icon={Briefcase} label="Hình thức"   value={WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType} />}
                                        {prefs.experience  && <InfoItem icon={Briefcase} label="Kinh nghiệm" value={prefs.experience} />}
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
                                        <a href={cvHref} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs font-semibold no-underline text-[#00b14f] shrink-0">
                                            <ExternalLink size={13} /> Xem CV
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-5 py-3.5 border-t border-slate-100 flex gap-2.5">
                    <Button variant="outline" className="flex-1 gap-1.5" onClick={() => { onDismiss(candidateUserId); onClose(); }} disabled={actionLoading}>
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

// ─── Profile Card ─────────────────────────────────────────────────────────────
function ProfileCard({ candidate, onDismiss, dismissing, onView, onViewDetail, provinceMap }) {
    const [expanded, setExpanded] = useState(false);
    const handleToggleExpand = () => { if (!expanded) onView(candidate.userId); setExpanded(v => !v); };
    const prefs  = candidate.jobPreferences || {};
    const letter = (candidate.fullName || '?')[0].toUpperCase();
    const cvHref = candidate.cvType === 'uploaded' ? candidate.cvFileUrl
        : candidate.defaultCvId ? `/xem-cv/${candidate.defaultCvId}` : null;

    return (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 flex flex-wrap items-center gap-3.5 min-[520px]:flex-nowrap">
                <div className="w-12 h-12 rounded-xl shrink-0 border-2 border-emerald-100 overflow-hidden bg-emerald-50 flex items-center justify-center">
                    {candidate.avatarUrl
                        ? <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : <span className="font-bold text-xl text-[#00b14f]">{letter}</span>
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900">{candidate.fullName || 'Ứng viên'}</div>
                    {prefs.jobTitle && (
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Briefcase size={11} /> {prefs.jobTitle}
                        </div>
                    )}
                    {(candidate.gender || candidate.dob) && (
                        <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-slate-400">
                            {candidate.gender && <span className="flex items-center gap-0.5"><User size={10} /> {GENDER_MAP[candidate.gender] || candidate.gender}</span>}
                            {candidate.dob    && <span className="flex items-center gap-0.5"><Calendar size={10} /> {formatDob(candidate.dob)}{calcAge(candidate.dob) !== null ? ` (${calcAge(candidate.dob)} tuổi)` : ''}</span>}
                        </div>
                    )}
                </div>
                <div className="flex gap-1.5 shrink-0 w-full min-[520px]:w-auto justify-end">
                    <Button variant="outline" size="sm" onClick={() => onViewDetail(candidate.userId)}
                        className="h-8 gap-1 text-xs border-[#00b14f] text-[#00b14f] bg-emerald-50 hover:bg-emerald-100 hover:text-[#00b14f]">
                        <User size={12} /> Xem chi tiết
                    </Button>
                    {cvHref && (
                        <a href={cvHref} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 h-8 px-2.5 border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold no-underline bg-white hover:bg-slate-50 transition-colors">
                            <FileText size={12} /> Xem CV
                        </a>
                    )}
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onDismiss(candidate.userId)} disabled={dismissing}>
                        <X size={13} />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleToggleExpand}>
                        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </Button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 p-3.5 bg-slate-50 space-y-2.5">
                    {candidate.cvTitle && (
                        <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-100">
                            <FileText size={14} className="text-slate-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-slate-700 truncate">{candidate.cvTitle}</div>
                                <div className="text-[11px] text-slate-400">{candidate.cvType === 'uploaded' ? 'CV tải lên' : 'CV tạo trên TopCV'}</div>
                            </div>
                            {cvHref && (
                                <a href={cvHref} target="_blank" rel="noopener noreferrer"
                                    className="text-xs font-semibold text-[#00b14f] no-underline flex items-center gap-0.5">
                                    <ExternalLink size={12} /> Xem
                                </a>
                            )}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                        {prefs.salaryRange && <InfoItem icon={DollarSign} label="Mức lương" value={SALARY_MAP[prefs.salaryRange] || prefs.salaryRange} />}
                        {(prefs.provinceName || prefs.provinceCodes?.length > 0) && (
                            <InfoItem icon={MapPin} label="Địa điểm" value={prefs.provinceName || resolveProvinces(prefs.provinceCodes, provinceMap) || prefs.provinceCodes?.join(', ')} />
                        )}
                        {prefs.workingType && <InfoItem icon={Briefcase} label="Hình thức"   value={WORKING_TYPE_MAP[prefs.workingType] || prefs.workingType} />}
                        {prefs.experience  && <InfoItem icon={Briefcase} label="Kinh nghiệm" value={prefs.experience} />}
                    </div>
                    <a href="/nha-tuyen-dung/ket-noi"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#00b14f] no-underline hover:underline">
                        Gửi lời kết nối cho ứng viên này →
                    </a>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function XemHoSoPage() {
    const [candidates,   setCandidates]   = useState([]);
    const [meta,         setMeta]         = useState({ total: 0, page: 1, limit: 12, totalPages: 1 });
    const [loading,      setLoading]      = useState(true);
    const [dismissing,   setDismissing]   = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [page,         setPage]         = useState(1);
    const [detailUserId, setDetailUserId] = useState(null);
    const provinceMap = useProvinceMap();

    const fetchCandidates = useCallback(async (p) => {
        setLoading(true);
        try {
            const res = await connectService.getSuggestions({ page: p, limit: 12, mode: 'view' });
            setCandidates(res.data?.data ?? []);
            setMeta(res.data?.meta ?? { total: 0, page: p, limit: 12, totalPages: 1 });
        } catch { toast.error('Không thể tải danh sách hồ sơ'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCandidates(page); }, [page, fetchCandidates]);

    const handleView    = async (uid) => { try { await connectService.recordView(uid); } catch {} };
    const handleDismiss = async (uid) => {
        setDismissing(uid);
        try {
            await connectService.skip(uid);
            setCandidates(prev => prev.filter(c => c.userId !== uid));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Đã xóa khỏi danh sách');
        } catch (e) { toast.error(e?.response?.data?.message || 'Có lỗi xảy ra'); }
        finally { setDismissing(null); }
    };
    const handleConnect = async (uid) => {
        setActionLoading(true);
        try {
            await connectService.request(uid);
            setCandidates(prev => prev.filter(c => c.userId !== uid));
            setMeta(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            toast.success('Đã gửi yêu cầu kết nối');
        } catch (e) { toast.error(e?.response?.data?.message || 'Có lỗi xảy ra'); }
        finally { setActionLoading(false); }
    };

    return (
        <div>
            <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Hồ sơ ứng viên</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Ứng viên đang tìm việc, phù hợp với ngành của bạn</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchCandidates(page)} disabled={loading}
                    className="h-9 gap-1.5 border-slate-200">
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    Làm mới
                </Button>
            </div>

            {/* Stats bar */}
            <div className="bg-white border border-slate-200 rounded-xl px-5 py-3.5 mb-5 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                    <strong className="text-slate-900">{meta.total}</strong> hồ sơ phù hợp
                </span>
                <span className="text-xs text-slate-400">Trang {meta.page}/{Math.max(1, meta.totalPages)}</span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
            ) : candidates.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <FileText size={26} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1">Không có hồ sơ nào</p>
                    <p className="text-sm text-slate-400">Hiện chưa có ứng viên phù hợp. Hãy quay lại sau!</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2.5 mb-6">
                    {candidates.map(c => (
                        <ProfileCard key={c.userId} candidate={c}
                            onDismiss={handleDismiss} dismissing={dismissing === c.userId}
                            onView={handleView} onViewDetail={setDetailUserId}
                            provinceMap={provinceMap} />
                    ))}
                </div>
            )}

            {meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
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
                    onConnect={handleConnect} onDismiss={handleDismiss}
                    actionLoading={actionLoading} provinceMap={provinceMap} />
            )}
        </div>
    );
}
