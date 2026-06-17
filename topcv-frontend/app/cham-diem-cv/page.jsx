'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    Sparkles, FileText, Upload, ArrowLeft, X, Lock,
    CheckCircle, XCircle, Search, Building2, AlertCircle,
    TrendingUp, ChevronDown, ChevronUp,
} from 'lucide-react';
import { resumeService } from '@/services/resume.service';
import { cvScoringService } from '@/services/cv-scoring.service';
import { jobService } from '@/services/job.service';
import useAuthStore from '@/stores/auth.store';

const GREEN = '#00b14f';
const SECTION_KEYS = ['content', 'skills', 'format', 'requiredSections', 'style'];

function scoreColor(s) {
    if (s >= 80) return '#00b14f';
    if (s >= 60) return '#f59e0b';
    if (s >= 40) return '#f97316';
    return '#ef4444';
}

/* ── Score circle ── */
function ScoreCircle({ score, size = 120, label }) {
    const color = scoreColor(score);
    const r = size / 2 - 10;
    const circ = 2 * Math.PI * r;
    const dash = (score / 100) * circ;
    const half = size / 2;
    return (
        <div className="relative shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={half} cy={half} r={r} fill="none" stroke="#f3f4f6" strokeWidth={10} />
                <circle cx={half} cy={half} r={r} fill="none" stroke={color} strokeWidth={10}
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    transform={`rotate(-90 ${half} ${half})`} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-extrabold" style={{ fontSize: size * 0.26, color }}>{score}</span>
                {label && <span className="text-xs text-slate-400 font-medium">{label}</span>}
            </div>
        </div>
    );
}

/* ── Detail panels ── */
function ContentDetail({ section }) {
    return (
        <div className="space-y-3">
            {section.checks?.map((check, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                        {check.pass
                            ? <CheckCircle size={15} className="text-green-500 shrink-0" />
                            : <XCircle size={15} className="text-red-400 shrink-0" />}
                        <span className="text-sm font-semibold text-slate-800">{check.label}</span>
                        {!check.pass && check.issues?.length > 0 && (
                            <span className="ml-auto text-xs font-medium text-red-500 shrink-0">{check.issues.length} vấn đề</span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 ml-6">{check.description}</p>
                    {check.issues?.length > 0 && (
                        <div className="mt-2 ml-6 space-y-1">
                            {check.issues.map((issue, j) => (
                                <div key={j} className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 italic">
                                    &ldquo;{issue}&rdquo;
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function SkillsDetail({ section, isJd }) {
    const hard = section.hardSkills || [];
    const soft = section.softSkills || [];

    if (isJd) {
        const hardMissing = hard.filter(s => !s.inCV).length;
        const softMissing = soft.filter(s => !s.inCV).length;
        return (
            <div className="space-y-5">
                <div className="flex gap-3">
                    <div className="flex-1 rounded-xl border border-slate-200 p-3 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Kỹ năng kỹ thuật còn thiếu</p>
                        <p className="text-xl font-extrabold text-red-500">{hardMissing}</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-slate-200 p-3 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">Kỹ năng mềm còn thiếu</p>
                        <p className="text-xl font-extrabold text-red-500">{softMissing}</p>
                    </div>
                </div>

                {hard.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Kỹ năng kỹ thuật</p>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Kỹ năng</th>
                                        <th className="text-center py-2 px-3 text-xs font-semibold text-slate-400 w-20">JD yêu cầu</th>
                                        <th className="text-center py-2 px-3 text-xs font-semibold text-slate-400 w-20">CV của bạn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hard.map((skill, i) => (
                                        <tr key={i} className={`border-b border-slate-50 last:border-0 ${!skill.inCV ? 'bg-red-50/40' : ''}`}>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    {skill.inCV
                                                        ? <CheckCircle size={13} className="text-green-500 shrink-0" />
                                                        : <XCircle size={13} className="text-red-400 shrink-0" />}
                                                    <span className={`text-sm font-medium ${!skill.inCV ? 'text-red-700' : 'text-slate-700'}`}>{skill.name}</span>
                                                    {skill.required && <span className="text-xs text-slate-400">(bắt buộc)</span>}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <CheckCircle size={14} className="mx-auto text-green-500" />
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                {skill.inCV
                                                    ? <CheckCircle size={14} className="mx-auto text-green-500" />
                                                    : <XCircle size={14} className="mx-auto text-red-400" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {soft.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Kỹ năng mềm</p>
                        <div className="rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400">Kỹ năng</th>
                                        <th className="text-center py-2 px-3 text-xs font-semibold text-slate-400 w-20">JD yêu cầu</th>
                                        <th className="text-center py-2 px-3 text-xs font-semibold text-slate-400 w-20">CV của bạn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {soft.map((skill, i) => (
                                        <tr key={i} className={`border-b border-slate-50 last:border-0 ${!skill.inCV ? 'bg-red-50/40' : ''}`}>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-2">
                                                    {skill.inCV
                                                        ? <CheckCircle size={13} className="text-green-500 shrink-0" />
                                                        : <XCircle size={13} className="text-red-400 shrink-0" />}
                                                    <span className={`text-sm font-medium ${!skill.inCV ? 'text-red-700' : 'text-slate-700'}`}>{skill.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                <CheckCircle size={14} className="mx-auto text-green-500" />
                                            </td>
                                            <td className="py-2.5 px-3 text-center">
                                                {skill.inCV
                                                    ? <CheckCircle size={14} className="mx-auto text-green-500" />
                                                    : <XCircle size={14} className="mx-auto text-red-400" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {hard.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Kỹ năng kỹ thuật</p>
                    <div className="flex flex-wrap gap-2">
                        {hard.map((skill, i) => (
                            <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${skill.inCV ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-100 bg-red-50 text-red-600'}`}>
                                {skill.inCV ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            {soft.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Kỹ năng mềm</p>
                    <div className="flex flex-wrap gap-2">
                        {soft.map((skill, i) => (
                            <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${skill.inCV ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-red-100 bg-red-50 text-red-600'}`}>
                                {skill.inCV ? <CheckCircle size={11} /> : <XCircle size={11} />}
                                {skill.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function FormatDetail({ section }) {
    return (
        <div className="space-y-3">
            {section.checks?.map((check, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200">
                    {check.pass
                        ? <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                        : <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />}
                    <div>
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">{check.label}</p>
                        <p className="text-xs text-slate-500">{check.note}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

function SectionsDetail({ section }) {
    return (
        <div className="space-y-2">
            {section.items?.map((item, i) => (
                <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${item.present ? 'border-green-100 bg-green-50/60' : 'border-slate-200 bg-slate-50'}`}>
                    {item.present
                        ? <CheckCircle size={15} className="text-green-500 shrink-0" />
                        : <XCircle size={15} className="text-red-400 shrink-0" />}
                    <span className={`text-sm font-semibold ${item.present ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
                    {item.present && item.value && (
                        <>
                            <span className="text-slate-300">—</span>
                            <span className="text-sm text-slate-500 truncate">{item.value}</span>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

function StyleDetail({ section }) {
    return (
        <div className="space-y-3">
            {section.tone && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200">
                    {section.tone.pass
                        ? <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                        : <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />}
                    <div>
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">Giọng văn</p>
                        <p className="text-xs text-slate-500">{section.tone.note}</p>
                    </div>
                </div>
            )}
            {section.buzzwords && (
                <div className="flex items-start gap-3 p-4 rounded-xl border border-slate-200">
                    {section.buzzwords.pass
                        ? <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
                        : <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />}
                    <div>
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">Từ ngữ sáo rỗng</p>
                        {section.buzzwords.found?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {section.buzzwords.found.map((w, i) => (
                                    <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100">{w}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500">CV không sử dụng từ ngữ sáo rỗng.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Highlights + improvements ── */
function OverviewBullets({ highlights, improvements }) {
    if (!highlights?.length && !improvements?.length) return null;
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {highlights?.length > 0 && (
                <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                    <p className="text-xs font-bold text-green-700 mb-2">Điểm nổi bật</p>
                    <ul className="space-y-1">
                        {highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-green-700">
                                <CheckCircle size={11} className="shrink-0 mt-0.5" />{h}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {improvements?.length > 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                    <p className="text-xs font-bold text-amber-700 mb-2">Cần cải thiện</p>
                    <ul className="space-y-1">
                        {improvements.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                                <AlertCircle size={11} className="shrink-0 mt-0.5" />{h}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/* ── Locked panel ── */
function LockedPanel({ onUpgrade }) {
    return (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <Lock size={18} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500 mb-1">Chi tiết bị khóa</p>
            <p className="text-xs text-slate-400 mb-3">Nâng cấp PRO để xem phân tích chi tiết</p>
            <button onClick={onUpgrade}
                className="px-4 py-1.5 rounded-lg text-white text-xs font-bold border-none cursor-pointer"
                style={{ background: GREEN }}>
                Nâng cấp PRO
            </button>
        </div>
    );
}

/* ── PDF viewer sticky (general mode 2-col) ── */
function PdfPane({ file }) {
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!file || file.type !== 'application/pdf') return;
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);
    if (!url) return null;
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden sticky top-20"
            style={{ height: 'calc(100vh - 96px)' }}>
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <FileText size={14} style={{ color: GREEN }} />
                <span className="text-xs font-semibold text-slate-600 truncate">{file.name}</span>
            </div>
            <iframe src={url} title="CV Preview" className="w-full border-0"
                style={{ height: 'calc(100% - 37px)' }} />
        </div>
    );
}

/* ── Collapsible PDF (JD mode top bar) ── */
function CollapsiblePdf({ file }) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState(null);
    useEffect(() => {
        if (!file || file.type !== 'application/pdf') return;
        const u = URL.createObjectURL(file);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [file]);
    if (!url) return null;
    return (
        <div className="bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left border-none bg-transparent cursor-pointer hover:bg-slate-50">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText size={14} style={{ color: GREEN }} /> Xem CV đã upload
                </span>
                {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {open && (
                <iframe src={url} title="CV" className="w-full border-0 border-t border-slate-100"
                    style={{ height: 520 }} />
            )}
        </div>
    );
}

/* ── Section tab (general mode sidebar) ── */
function SectionTab({ section, active, onClick }) {
    const color = scoreColor(section.score);
    return (
        <button onClick={onClick}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all border cursor-pointer"
            style={{ borderColor: active ? GREEN : 'transparent', background: active ? '#f0fdf4' : 'transparent' }}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-700">{section.label}</span>
                    {(section.issueCount ?? 0) > 0
                        ? <span className="text-xs text-amber-600 font-medium shrink-0 ml-1">{section.issueCount} đề xuất</span>
                        : <span className="text-xs font-medium shrink-0 ml-1" style={{ color: GREEN }}>Hoàn thành</span>}
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1">
                    <div className="h-1 rounded-full" style={{ width: `${section.score}%`, background: color }} />
                </div>
            </div>
        </button>
    );
}

/* ══════════════════════════════════════════
   MODE 1: Đánh giá CV chung
   With PDF: two-column layout (PDF sticky left | analysis right)
   No PDF: full-width (score header + section tabs + detail panel)
   ══════════════════════════════════════════ */
function GeneralResult({ result, uploadFile, onReset, onUpgrade }) {
    const [activeTab, setActiveTab] = useState('content');
    const sections = result.sections || {};
    const isVip = result.isVip;
    const hasPdf = uploadFile?.type === 'application/pdf';

    const renderDetail = () => {
        if (!isVip) return <LockedPanel onUpgrade={onUpgrade} />;
        const sec = sections[activeTab];
        if (!sec) return null;
        switch (activeTab) {
            case 'content': return <ContentDetail section={sec} />;
            case 'skills': return <SkillsDetail section={sec} isJd={false} />;
            case 'format': return <FormatDetail section={sec} />;
            case 'requiredSections': return <SectionsDetail section={sec} />;
            case 'style': return <StyleDetail section={sec} />;
            default: return null;
        }
    };

    const analysis = (
        <div className="space-y-4">
            {/* Score card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start gap-4">
                    <ScoreCircle score={result.totalScore} size={100} />
                    <div className="flex-1 min-w-0">
                        <p className="text-lg font-extrabold text-slate-900 mb-1">{result.grade}</p>
                        <p className="text-sm text-slate-500 leading-relaxed mb-3">{result.summary}</p>
                        <OverviewBullets highlights={result.highlights} improvements={result.improvements} />
                    </div>
                </div>
            </div>

            {/* Tabs + detail */}
            <div className="grid gap-3" style={{ gridTemplateColumns: '200px 1fr' }}>
                <div className="bg-white rounded-2xl border border-slate-200 p-2 space-y-0.5 h-fit sticky top-20">
                    {SECTION_KEYS.map(key => {
                        const sec = sections[key];
                        if (!sec) return null;
                        return <SectionTab key={key} section={sec} active={activeTab === key} onClick={() => setActiveTab(key)} />;
                    })}
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                    {sections[activeTab] && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900">{sections[activeTab].label}</h3>
                                <span className="text-sm font-bold" style={{ color: scoreColor(sections[activeTab].score) }}>
                                    {sections[activeTab].score}/100
                                </span>
                            </div>
                            {renderDetail()}
                        </>
                    )}
                </div>
            </div>

            {!isVip && (
                <div className="rounded-2xl p-4 flex items-center gap-4"
                    style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
                    <Lock size={18} style={{ color: GREEN }} className="shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-slate-900 text-sm mb-0.5">Xem phân tích chi tiết từng mục</p>
                        <p className="text-xs text-slate-500">Nâng cấp PRO để mở khóa check-list, danh sách kỹ năng, gợi ý cụ thể</p>
                    </div>
                    <button onClick={onUpgrade}
                        className="px-4 py-2 rounded-xl text-white font-bold text-xs border-none cursor-pointer shrink-0"
                        style={{ background: GREEN }}>
                        Nâng cấp PRO
                    </button>
                </div>
            )}

            <button onClick={onReset}
                className="w-full py-3 rounded-xl font-semibold text-sm border border-slate-200 bg-white cursor-pointer text-slate-600 hover:bg-slate-50">
                Phân tích CV khác
            </button>
        </div>
    );

    if (hasPdf) {
        return (
            <div className="grid gap-4 items-start" style={{ gridTemplateColumns: '1fr 480px' }}>
                <PdfPane file={uploadFile} />
                {analysis}
            </div>
        );
    }

    return analysis;
}

/* ══════════════════════════════════════════
   MODE 2: CV so với JD — Cake.me style
   Left: fixed sidebar (score + section list with progress)
   Right: scrollable sections as accordions (all open by default)
   ══════════════════════════════════════════ */
function JdSectionAccordion({ id, title, score, issueCount, isVip, onUpgrade, children }) {
    const [open, setOpen] = useState(true);
    const color = scoreColor(score);
    const hasIssue = (issueCount ?? 0) > 0;
    return (
        <div id={id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden scroll-mt-24">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-4 text-left border-none bg-transparent cursor-pointer hover:bg-slate-50">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{title}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                            background: hasIssue ? '#fef3c7' : '#f0fdf4',
                            color: hasIssue ? '#d97706' : GREEN,
                        }}>
                        {hasIssue ? `${issueCount} đề xuất` : 'Hoàn thành'}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold" style={{ color }}>{score}/100</span>
                    {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </button>
            {open && (
                <div className="border-t border-slate-100 px-5 py-4">
                    {!isVip ? <LockedPanel onUpgrade={onUpgrade} /> : children}
                </div>
            )}
        </div>
    );
}

function JdResult({ result, uploadFile, onReset, onUpgrade }) {
    const sections = result.sections || {};
    const isVip = result.isVip;

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div>
            {/* Collapsible PDF preview */}
            {uploadFile && <CollapsiblePdf file={uploadFile} />}

            <div className="flex gap-4 items-start">
                {/* ── Left sidebar (sticky) ── */}
                <div className="shrink-0 sticky top-20 self-start" style={{ width: 224 }}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <div className="flex justify-center mb-2">
                            <ScoreCircle score={result.totalScore} size={90} label="match" />
                        </div>
                        {result.jobTitle && (
                            <p className="text-xs text-center text-slate-500 truncate px-1 mb-0.5">{result.jobTitle}</p>
                        )}
                        <p className="text-sm font-extrabold text-center text-slate-900 mb-0.5">{result.grade}</p>
                        <p className="text-xs text-center text-slate-400 mb-4">{result.totalIssues} đề xuất cải thiện</p>

                        <div className="space-y-1.5 mb-4">
                            {SECTION_KEYS.map(key => {
                                const sec = sections[key];
                                if (!sec) return null;
                                const color = scoreColor(sec.score);
                                const hasIssue = (sec.issueCount ?? 0) > 0;
                                return (
                                    <button key={key} onClick={() => scrollTo(`jd-${key}`)}
                                        className="w-full text-left px-2 py-2 rounded-xl hover:bg-slate-50 cursor-pointer border-none bg-transparent">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs font-semibold text-slate-700">{sec.label}</span>
                                            {hasIssue
                                                ? <span className="text-xs text-amber-500 font-medium">{sec.issueCount}</span>
                                                : <CheckCircle size={11} style={{ color: GREEN }} />}
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-1">
                                            <div className="h-1 rounded-full" style={{ width: `${sec.score}%`, background: color }} />
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <button onClick={onReset}
                            className="w-full py-2 rounded-xl text-xs font-semibold text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer">
                            Phân tích CV khác
                        </button>
                    </div>
                </div>

                {/* ── Right: scrollable sections ── */}
                <div className="flex-1 min-w-0 space-y-3">
                    {/* Tổng quan */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5">
                        <h3 className="font-bold text-slate-900 mb-1">Tổng quan</h3>
                        <p className="text-sm text-slate-500 leading-relaxed mb-4">{result.summary}</p>
                        <OverviewBullets highlights={result.highlights} improvements={result.improvements} />
                    </div>

                    {/* Kỹ năng */}
                    {sections.skills && (
                        <JdSectionAccordion id="jd-skills" title="Kỹ năng"
                            score={sections.skills.score} issueCount={sections.skills.issueCount}
                            isVip={isVip} onUpgrade={onUpgrade}>
                            <SkillsDetail section={sections.skills} isJd={true} />
                        </JdSectionAccordion>
                    )}

                    {/* Nội dung */}
                    {sections.content && (
                        <JdSectionAccordion id="jd-content" title="Nội dung"
                            score={sections.content.score} issueCount={sections.content.issueCount}
                            isVip={isVip} onUpgrade={onUpgrade}>
                            <ContentDetail section={sections.content} />
                        </JdSectionAccordion>
                    )}

                    {/* Định dạng */}
                    {sections.format && (
                        <JdSectionAccordion id="jd-format" title="Định dạng"
                            score={sections.format.score} issueCount={sections.format.issueCount ?? 0}
                            isVip={isVip} onUpgrade={onUpgrade}>
                            <FormatDetail section={sections.format} />
                        </JdSectionAccordion>
                    )}

                    {/* Các mục */}
                    {sections.requiredSections && (
                        <JdSectionAccordion id="jd-requiredSections" title="Các mục"
                            score={sections.requiredSections.score} issueCount={sections.requiredSections.issueCount}
                            isVip={isVip} onUpgrade={onUpgrade}>
                            <SectionsDetail section={sections.requiredSections} />
                        </JdSectionAccordion>
                    )}

                    {/* Phong cách */}
                    {sections.style && (
                        <JdSectionAccordion id="jd-style" title="Phong cách"
                            score={sections.style.score} issueCount={sections.style.issueCount ?? 0}
                            isVip={isVip} onUpgrade={onUpgrade}>
                            <StyleDetail section={sections.style} />
                        </JdSectionAccordion>
                    )}

                    {!isVip && (
                        <div className="rounded-2xl p-4 flex items-center gap-4"
                            style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
                            <Lock size={18} style={{ color: GREEN }} className="shrink-0" />
                            <div className="flex-1">
                                <p className="font-bold text-slate-900 text-sm mb-0.5">Xem bảng kỹ năng JD vs CV đầy đủ</p>
                                <p className="text-xs text-slate-500">Nâng cấp PRO để xem so sánh chi tiết từng kỹ năng, gợi ý cải thiện cụ thể</p>
                            </div>
                            <button onClick={onUpgrade}
                                className="px-4 py-2 rounded-xl text-white font-bold text-xs border-none cursor-pointer shrink-0"
                                style={{ background: GREEN }}>
                                Nâng cấp PRO
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Loading with realistic progress ── */
const GENERAL_STAGES = [
    'Đang đọc nội dung CV...',
    'Kiểm tra cấu trúc và định dạng...',
    'Phân tích kỹ năng chuyên môn...',
    'Đánh giá nội dung từng mục...',
    'Kiểm tra phong cách và giọng văn...',
    'Tổng hợp và cho điểm...',
];
const JD_STAGES = [
    'Đang đọc nội dung CV...',
    'Phân tích mô tả công việc...',
    'So sánh kỹ năng kỹ thuật...',
    'Kiểm tra kỹ năng mềm...',
    'Đánh giá kinh nghiệm và học vấn...',
    'Tính điểm phù hợp với JD...',
    'Tổng hợp kết quả...',
];

function LoadingView({ mode, apiDone, onDone }) {
    const stages = mode === 'jd' ? JD_STAGES : GENERAL_STAGES;
    const [progress, setProgress] = useState(0);
    const [stageIdx, setStageIdx] = useState(0);
    const durationRef = useRef(null);
    const startRef = useRef(Date.now());
    const onDoneRef = useRef(onDone);
    const calledRef = useRef(false);
    const fastStartedRef = useRef(false);
    onDoneRef.current = onDone;

    if (!durationRef.current) {
        // general: 30–40s, jd: 45–60s
        durationRef.current = mode === 'jd'
            ? 45000 + Math.floor(Math.random() * 15001)
            : 30000 + Math.floor(Math.random() * 10001);
    }

    // Slow fill: 0 → 92% — stops when fast-ramp takes over
    useEffect(() => {
        const dur = durationRef.current;
        const tick = 250;
        const step = 92 / (dur / tick);
        const timer = setInterval(() => {
            if (fastStartedRef.current) return; // fast-ramp started, don't cap at 92
            setProgress(p => +(Math.min(p + step, 92).toFixed(2)));
        }, tick);
        return () => clearInterval(timer);
    }, []);

    // Stage messages change proportionally
    useEffect(() => {
        const dur = durationRef.current;
        const stageMs = Math.floor(dur / stages.length);
        const timer = setInterval(() => {
            setStageIdx(i => Math.min(i + 1, stages.length - 1));
        }, stageMs);
        return () => clearInterval(timer);
    }, [stages.length]);

    // When API done: wait until full duration elapsed, then fast-ramp 92→100%
    useEffect(() => {
        if (!apiDone) return;
        const dur = durationRef.current;
        const elapsed = Date.now() - startRef.current;
        const remaining = Math.max(0, dur - elapsed);

        const waitTimer = setTimeout(() => {
            fastStartedRef.current = true; // signal slow timer to stop capping
            const fastTimer = setInterval(() => {
                setProgress(p => {
                    const next = +(Math.min(p + 4, 100).toFixed(1));
                    if (next >= 100) clearInterval(fastTimer);
                    return next;
                });
            }, 60);
        }, remaining);

        return () => clearTimeout(waitTimer);
    }, [apiDone]);

    // Call onDone once when progress reaches 100
    useEffect(() => {
        if (progress >= 100 && !calledRef.current) {
            calledRef.current = true;
            onDoneRef.current?.();
        }
    }, [progress]);

    const SIZE = 148;
    const r = SIZE / 2 - 12;
    const circ = 2 * Math.PI * r;
    const dash = (progress / 100) * circ;
    const half = SIZE / 2;
    const estLabel = mode === 'jd' ? '45–60 giây' : '30–40 giây';

    return (
        <div className="max-w-sm mx-auto bg-white rounded-2xl border border-slate-200 p-10 flex flex-col items-center gap-6">
            <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
                <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
                    <circle cx={half} cy={half} r={r} fill="none" stroke="#f3f4f6" strokeWidth={11} />
                    <circle cx={half} cy={half} r={r} fill="none" stroke={GREEN} strokeWidth={11}
                        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                        transform={`rotate(-90 ${half} ${half})`}
                        style={{ transition: 'stroke-dasharray 0.3s linear' }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                    <span className="font-extrabold text-2xl" style={{ color: GREEN }}>{Math.round(progress)}%</span>
                    <Sparkles size={14} style={{ color: GREEN }} className="opacity-60" />
                </div>
            </div>
            <div className="text-center space-y-1.5">
                <p className="font-bold text-slate-800">
                    {mode === 'jd' ? 'AI đang so sánh CV với JD...' : 'AI đang phân tích CV...'}
                </p>
                <p className="text-sm text-slate-500">{stages[stageIdx]}</p>
                <p className="text-xs text-slate-300">Thường mất {estLabel}</p>
            </div>
        </div>
    );
}

/* ── Job search dropdown ── */
function JobSelector({ selectedJob, onSelect }) {
    const [query, setQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const timer = useRef(null);

    const search = useCallback(async (q) => {
        if (!q.trim()) { setJobs([]); return; }
        setLoading(true);
        try {
            const res = await jobService.getAll({ search: q, limit: 8, isActive: true });
            setJobs(res.data?.data || res.data?.jobs || []);
        } catch { setJobs([]); }
        finally { setLoading(false); }
    }, []);

    const handleInput = (e) => {
        const q = e.target.value;
        setQuery(q);
        setOpen(true);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => search(q), 400);
    };

    const pick = (job) => {
        onSelect(job);
        setQuery(job.title);
        setOpen(false);
    };

    return (
        <div className="relative">
            <div className="flex items-center gap-2 p-3 rounded-xl border-2 transition-all"
                style={{ borderColor: selectedJob ? GREEN : '#e5e7eb' }}>
                <Search size={14} className="text-slate-400 shrink-0" />
                <input value={query} onChange={handleInput}
                    onFocus={() => { setOpen(true); if (query) search(query); }}
                    onBlur={() => setTimeout(() => setOpen(false), 200)}
                    placeholder="Tìm kiếm tin tuyển dụng..."
                    className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder-slate-400" />
                {selectedJob && <CheckCircle size={14} style={{ color: GREEN }} />}
            </div>
            {open && query.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-20 max-h-52 overflow-y-auto">
                    {loading
                        ? <div className="p-4 text-center text-sm text-slate-400">Đang tìm...</div>
                        : jobs.length === 0
                            ? <div className="p-4 text-center text-sm text-slate-400">Không tìm thấy</div>
                            : jobs.map(job => (
                                <button key={job.id} onMouseDown={() => pick(job)}
                                    className="w-full flex items-start gap-3 p-3 hover:bg-slate-50 text-left border-none bg-transparent cursor-pointer border-b border-slate-50 last:border-0">
                                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <Building2 size={12} className="text-slate-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{job.title}</p>
                                        <p className="text-xs text-slate-400 truncate">{job.employer?.companyName || ''}</p>
                                    </div>
                                </button>
                            ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════
   Main page
   ══════════════════════════════════════════ */
function ChamDiemCvContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedId = searchParams.get('resumeId');
    const { hydrated, isAuthenticated } = useAuthStore();

    const [mode, setMode] = useState('general');
    const [scoringMode, setScoringMode] = useState('general');
    const [step, setStep] = useState('choose');
    const [resumes, setResumes] = useState([]);
    const [selectedId, setSelectedId] = useState(preselectedId || '');
    const [scoring, setScoring] = useState(false);
    const [result, setResult] = useState(null);
    const [pendingResult, setPendingResult] = useState(null);
    const [apiDone, setApiDone] = useState(false);
    const [error, setError] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [resultUploadFile, setResultUploadFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login?redirect=/cham-diem-cv');
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        resumeService.list('resume').then(r => setResumes(r.data || [])).catch(() => {});
    }, [isAuthenticated]);

    useEffect(() => {
        if (preselectedId && isAuthenticated) run(preselectedId, 'general', null, null);
    }, [preselectedId, isAuthenticated]); // eslint-disable-line

    const run = async (resumeId, currentMode, job, file) => {
        setScoring(true);
        setError('');
        setApiDone(false);
        setPendingResult(null);
        setScoringMode(currentMode);
        setStep('result');
        setResultUploadFile(file);
        try {
            let res;
            if (file) {
                res = currentMode === 'jd' && job
                    ? await cvScoringService.matchJdFile(file, job.id)
                    : await cvScoringService.scoreFile(file);
            } else {
                res = currentMode === 'jd' && job
                    ? await cvScoringService.matchJd(resumeId, job.id)
                    : await cvScoringService.score(resumeId);
            }
            // API done — store result, let LoadingView finish animation before showing
            setPendingResult(res.data?.data);
            setApiDone(true);
        } catch (e) {
            setError(e?.response?.data?.message || 'Không thể phân tích CV. Thử lại sau.');
            setStep('choose');
            setScoring(false);
        }
    };

    const handleLoadingDone = useCallback(() => {
        setResult(pendingResult);
        setScoring(false);
    }, [pendingResult]);

    const handleSubmit = () => run(selectedId, mode, selectedJob, uploadFile);

    const validateAndSet = (file) => {
        const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!allowed.includes(file.type)) { setError('Chỉ hỗ trợ file PDF hoặc DOCX'); return; }
        if (file.size > 5 * 1024 * 1024) { setError('File không được vượt quá 5MB'); return; }
        setError('');
        setUploadFile(file);
        setSelectedId('');
    };

    const handleReset = () => {
        setStep('choose'); setResult(null); setPendingResult(null);
        setApiDone(false); setSelectedId('');
        setUploadFile(null); setSelectedJob(null); setError(''); setResultUploadFile(null);
    };

    if (!hydrated || !isAuthenticated) return null;

    const canSubmit = !!(selectedId || uploadFile) && (mode === 'general' || !!selectedJob);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
                    <button onClick={() => step === 'result' ? handleReset() : router.back()}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 border-none bg-transparent cursor-pointer">
                        <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                            <TrendingUp size={14} className="text-white" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Chấm điểm CV bằng AI</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">

                {/* CHOOSE */}
                {step === 'choose' && (
                    <div className="max-w-xl mx-auto space-y-5">
                        <div className="text-center">
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Chấm điểm CV bằng AI</h1>
                            <p className="text-slate-500 text-sm">Phân tích chuẩn ATS · Gợi ý cải thiện · So sánh với tin tuyển dụng</p>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex gap-1">
                            {[
                                { key: 'general', label: 'Đánh giá CV chung' },
                                { key: 'jd', label: 'So với tin tuyển dụng' },
                            ].map(m => (
                                <button key={m.key} onClick={() => setMode(m.key)}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer"
                                    style={{ background: mode === m.key ? GREEN : 'transparent', color: mode === m.key ? 'white' : '#64748b' }}>
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                            <h3 className="font-bold text-slate-900 text-sm mb-4">Chọn CV cần phân tích</h3>

                            {resumes.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {resumes.map(cv => (
                                        <button key={cv.id}
                                            onClick={() => { setSelectedId(cv.id); setUploadFile(null); }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left cursor-pointer"
                                            style={{
                                                borderColor: selectedId === cv.id && !uploadFile ? GREEN : '#e5e7eb',
                                                background: selectedId === cv.id && !uploadFile ? '#f0fdf4' : 'white',
                                            }}>
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: cv.color || GREEN }}>
                                                <FileText size={14} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{cv.title}</p>
                                                <p className="text-xs text-slate-400">{new Date(cv.updatedAt).toLocaleDateString('vi-VN')}</p>
                                            </div>
                                            <div className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                                                style={{ borderColor: selectedId === cv.id && !uploadFile ? GREEN : '#d1d5db' }}>
                                                {selectedId === cv.id && !uploadFile && <div className="w-2 h-2 rounded-full" style={{ background: GREEN }} />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {resumes.length > 0 && (
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-xs text-slate-400">hoặc upload file</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                </div>
                            )}

                            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); }} />

                            {uploadFile ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl border-2"
                                    style={{ borderColor: GREEN, background: '#f0fdf4' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: GREEN }}>
                                        <FileText size={14} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{uploadFile.name}</p>
                                        <p className="text-xs text-slate-400">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                    <button onClick={() => setUploadFile(null)}
                                        className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/60 border-none bg-transparent cursor-pointer">
                                        <X size={13} className="text-slate-500" />
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={(e) => {
                                        e.preventDefault(); setDragOver(false);
                                        const f = e.dataTransfer?.files?.[0]; if (f) validateAndSet(f);
                                    }}
                                    className="w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors"
                                    style={{ borderColor: dragOver ? GREEN : '#e2e8f0', background: dragOver ? '#f0fdf4' : '#f8fafc', outline: 'none' }}>
                                    <Upload size={20} className="mx-auto mb-2" style={{ color: dragOver ? GREEN : '#94a3b8' }} />
                                    <p className="text-sm font-medium" style={{ color: dragOver ? GREEN : '#64748b' }}>
                                        Kéo thả hoặc <span style={{ color: GREEN }}>chọn file</span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">PDF, DOCX — tối đa 5MB</p>
                                </button>
                            )}
                        </div>

                        {mode === 'jd' && (
                            <div className="bg-white rounded-2xl border border-slate-200 p-5">
                                <h3 className="font-bold text-slate-900 text-sm mb-1">Chọn tin tuyển dụng</h3>
                                <p className="text-xs text-slate-400 mb-3">AI đối chiếu kỹ năng JD yêu cầu với CV của bạn</p>
                                <JobSelector selectedJob={selectedJob} onSelect={setSelectedJob} />
                                {selectedJob && (
                                    <div className="mt-3 flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Building2 size={13} className="text-slate-400 shrink-0" />
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-slate-800 truncate">{selectedJob.title}</p>
                                                <p className="text-xs text-slate-400 truncate">{selectedJob.employer?.companyName || ''}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedJob(null)}
                                            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 border-none bg-transparent cursor-pointer shrink-0 ml-2">
                                            <X size={13} className="text-slate-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

                        <button onClick={handleSubmit} disabled={!canSubmit || scoring}
                            className="w-full py-3.5 rounded-xl text-white font-bold text-sm border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: GREEN }}>
                            <Sparkles size={15} />
                            {mode === 'jd' ? 'So sánh CV với JD' : 'Phân tích CV ngay'}
                        </button>
                    </div>
                )}

                {/* RESULT */}
                {step === 'result' && (
                    <div>
                        {scoring ? <LoadingView mode={scoringMode} apiDone={apiDone} onDone={handleLoadingDone} />
                            : error ? (
                                <div className="max-w-sm mx-auto bg-white rounded-2xl border border-red-200 p-8 text-center">
                                    <p className="text-red-500 mb-4">{error}</p>
                                    <button onClick={() => setStep('choose')}
                                        className="text-sm font-semibold border-none bg-transparent cursor-pointer" style={{ color: GREEN }}>
                                        Thử lại
                                    </button>
                                </div>
                            ) : result && (
                                result.mode === 'jd'
                                    ? <JdResult result={result} uploadFile={resultUploadFile}
                                        onReset={handleReset} onUpgrade={() => router.push('/nang-cap')} />
                                    : <GeneralResult result={result} uploadFile={resultUploadFile}
                                        onReset={handleReset} onUpgrade={() => router.push('/nang-cap')} />
                            )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ChamDiemCvPage() {
    return <Suspense><ChamDiemCvContent /></Suspense>;
}
