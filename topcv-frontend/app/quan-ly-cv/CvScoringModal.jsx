'use client';

import { useState } from 'react';
import { X, Lock, Sparkles, ChevronRight, TrendingUp } from 'lucide-react';
import { cvScoringService } from '@/services/cv-scoring.service';
import { useRouter } from 'next/navigation';

const GREEN = '#00b14f';

function scoreColor(score) {
    if (score >= 80) return '#00b14f';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
}

function ScoreCircle({ score, loading }) {
    const color = scoreColor(score);
    const radius = 52;
    const circ = 2 * Math.PI * radius;
    const pct = loading ? 0 : (score / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative">
                <svg width="128" height="128" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle
                        cx="64" cy="64" r={radius}
                        fill="none"
                        stroke={loading ? '#e5e7eb' : color}
                        strokeWidth="10"
                        strokeDasharray={`${pct} ${circ}`}
                        strokeLinecap="round"
                        transform="rotate(-90 64 64)"
                        style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-green-500 rounded-full animate-spin" />
                    ) : (
                        <>
                            <span className="text-3xl font-extrabold" style={{ color }}>{score}</span>
                            <span className="text-xs text-slate-400 font-medium">/100</span>
                        </>
                    )}
                </div>
            </div>
            <span className="text-sm font-semibold text-slate-500">
                {loading ? 'Đang phân tích...' : score >= 80 ? 'Xuất sắc' : score >= 60 ? 'Khá tốt' : score >= 40 ? 'Cần cải thiện' : 'Cần chú ý'}
            </span>
        </div>
    );
}

function SectionRow({ section, locked }) {
    const color = scoreColor((section.score / section.maxScore) * 100);
    const pct = Math.round((section.score / section.maxScore) * 100);

    return (
        <div className={`rounded-xl border p-4 ${locked ? 'relative overflow-hidden' : ''}`}>
            {locked && (
                <div className="absolute inset-0 backdrop-blur-sm bg-white/60 flex flex-col items-center justify-center z-10 rounded-xl">
                    <Lock size={18} className="text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500 font-medium">Nâng cấp để xem</span>
                </div>
            )}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">{section.label}</span>
                <span className="text-sm font-bold" style={{ color }}>{section.score}/{section.maxScore}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
            <p className="text-xs text-slate-500 mb-2">{section.feedback}</p>
            {section.suggestions?.length > 0 && (
                <ul className="space-y-1">
                    {section.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <ChevronRight size={12} className="text-green-500 mt-0.5 shrink-0" />
                            {s}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function CvScoringModal({ cv, onClose }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [scored, setScored] = useState(false);

    const handleScore = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await cvScoringService.score(cv.id);
            setResult(res.data?.data);
            setScored(true);
        } catch (e) {
            setError(e?.response?.data?.message || 'Không thể phân tích CV. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const SECTION_ORDER = ['personalInfo', 'experience', 'education', 'skills', 'presentation'];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white z-10 rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-sm">Chấm điểm CV bằng AI</h3>
                            <p className="text-xs text-slate-400 truncate max-w-[220px]">{cv.title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors border-none cursor-pointer bg-transparent">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-5">
                    {/* Initial state */}
                    {!scored && !loading && (
                        <div className="flex flex-col items-center gap-5 py-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                                <TrendingUp size={30} style={{ color: GREEN }} />
                            </div>
                            <div className="text-center">
                                <h4 className="font-bold text-slate-900 mb-1">Phân tích CV của bạn</h4>
                                <p className="text-sm text-slate-500">AI sẽ đánh giá CV theo 5 tiêu chí và đưa ra gợi ý cải thiện cụ thể</p>
                            </div>
                            <div className="w-full bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                {['Thông tin & Mục tiêu', 'Kinh nghiệm làm việc', 'Học vấn & Chứng chỉ', 'Kỹ năng', 'Trình bày & Cấu trúc'].map((item) => (
                                    <div key={item} className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                                        {item}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleScore}
                                className="w-full py-3 rounded-xl text-white font-bold text-sm border-none cursor-pointer flex items-center justify-center gap-2"
                                style={{ background: GREEN }}
                            >
                                <Sparkles size={16} />
                                Phân tích ngay
                            </button>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex flex-col items-center gap-6 py-10">
                            <ScoreCircle score={0} loading={true} />
                            <p className="text-sm text-slate-500 animate-pulse">AI đang đọc và đánh giá CV của bạn...</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                            <p className="text-sm text-red-600 mb-3">{error}</p>
                            <button onClick={handleScore} className="text-sm font-semibold border-none cursor-pointer bg-transparent" style={{ color: GREEN }}>
                                Thử lại
                            </button>
                        </div>
                    )}

                    {/* Result */}
                    {scored && result && !loading && (
                        <div className="space-y-5">
                            {/* Score + summary */}
                            <div className="flex flex-col items-center gap-4">
                                <ScoreCircle score={result.totalScore} loading={false} />
                                <p className="text-sm text-slate-600 text-center leading-relaxed">{result.summary}</p>
                            </div>

                            {/* Quick tips (free) */}
                            <div className="bg-slate-50 rounded-xl p-4">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Gợi ý nhanh</p>
                                <ul className="space-y-2">
                                    {result.quickTips?.map((tip, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5" style={{ background: GREEN }}>
                                                {i + 1}
                                            </span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Sections */}
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Phân tích chi tiết</p>
                                <div className="space-y-3">
                                    {SECTION_ORDER.map((key) => {
                                        if (!result.sections) {
                                            const PLACEHOLDER = {
                                                personalInfo: { label: 'Thông tin cá nhân & Mục tiêu', score: 14, maxScore: 20, feedback: '', suggestions: [] },
                                                experience: { label: 'Kinh nghiệm làm việc', score: 20, maxScore: 30, feedback: '', suggestions: [] },
                                                education: { label: 'Học vấn & Chứng chỉ', score: 14, maxScore: 20, feedback: '', suggestions: [] },
                                                skills: { label: 'Kỹ năng', score: 14, maxScore: 20, feedback: '', suggestions: [] },
                                                presentation: { label: 'Trình bày & Cấu trúc', score: 8, maxScore: 10, feedback: '', suggestions: [] },
                                            };
                                            return <SectionRow key={key} section={PLACEHOLDER[key]} locked={true} />;
                                        }
                                        return <SectionRow key={key} section={result.sections[key]} locked={false} />;
                                    })}
                                </div>
                            </div>

                            {/* Upgrade CTA for free users */}
                            {!result.isVip && (
                                <div
                                    className="rounded-xl p-4 text-center"
                                    style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
                                >
                                    <Lock size={20} className="mx-auto mb-2" style={{ color: GREEN }} />
                                    <p className="font-bold text-slate-900 text-sm mb-1">Xem phân tích chi tiết</p>
                                    <p className="text-xs text-slate-500 mb-3">Nâng cấp PRO để xem nhận xét + gợi ý cụ thể cho từng mục</p>
                                    <button
                                        onClick={() => { onClose(); router.push('/nang-cap'); }}
                                        className="px-5 py-2.5 rounded-xl text-white text-sm font-bold border-none cursor-pointer"
                                        style={{ background: GREEN }}
                                    >
                                        Nâng cấp PRO
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
