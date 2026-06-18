'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { quizService } from '@/services/quiz.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import imgDaNopBai from '@/app/assests/img/da-nop-bai.png';
import imgHetGio from '@/app/assests/img/het-gio-lam-bai.png';
import imgKhongDuQuyen from '@/app/assests/img/khong-du-quyen-lam-bai.png';

function useCountdown(startedAt, durationMinutes) {
    const [remaining, setRemaining] = useState(null);

    useEffect(() => {
        if (!startedAt || !durationMinutes) return;
        const endTime = new Date(startedAt).getTime() + durationMinutes * 60 * 1000;
        const tick = () => setRemaining(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [startedAt, durationMinutes]);

    return remaining;
}

function formatTime(seconds) {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60)
        .toString()
        .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function ResultScreen({ result, autoSubmit }) {
    const router = useRouter();
    const pct = Math.round((result.score / result.totalPoints) * 100);
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm text-center space-y-5">
                <Image
                    src={autoSubmit ? imgHetGio : imgDaNopBai}
                    alt={autoSubmit ? 'Hết giờ' : 'Đã nộp bài'}
                    className="mx-auto w-80 h-auto"
                />
                <div className="space-y-1">
                    <p className="text-[13px] text-slate-500">
                        {autoSubmit ? 'Hết giờ — bài thi đã được tự động nộp' : 'Bài thi đã được nộp thành công'}
                    </p>
                    <p className="text-3xl font-bold text-slate-800">
                        {result.score}
                        <span className="text-lg font-normal text-slate-400">/{result.totalPoints}</span>
                    </p>
                    <p className="text-[13px] text-slate-500">
                        {pct}% — Ngưỡng đậu: {result.passRate}%
                    </p>
                </div>
                <Badge
                    className={`text-[13px] px-5 py-1.5 ${result.passed ? 'bg-green-500 hover:bg-green-500' : 'bg-red-400 hover:bg-red-400'}`}
                >
                    {result.passed ? 'Đạt yêu cầu' : 'Chưa đạt'}
                </Badge>
                <div className="space-y-2 pt-1">
                    <p className="text-[12px] text-slate-400">
                        Kết quả đã được ghi nhận. Nhà tuyển dụng sẽ liên hệ với bạn sớm.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => router.push('/')} className="text-[13px]">
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function CandidateTestPage() {
    const { assignmentId } = useParams();
    const [state, setState] = useState('loading'); // loading | ready | taking | result | error
    const [autoSubmit, setAutoSubmit] = useState(false);
    const [attempt, setAttempt] = useState(null);
    const [answers, setAnswers] = useState({});
    const [current, setCurrent] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const submittedRef = useRef(false);

    const remaining = useCountdown(attempt?.startedAt, attempt?.durationMinutes);

    const handleSubmit = useCallback(
        async (auto = false) => {
            if (submittedRef.current) return;
            submittedRef.current = true;
            setSubmitting(true);
            try {
                const answerList = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
                    questionId,
                    selectedOptionId,
                }));
                const res = await quizService.submitAttempt(attempt.attemptId, answerList);
                setResult(res.data);
                setAutoSubmit(auto);
                setState('result');
            } catch {
            } finally {
                setSubmitting(false);
            }
        },
        [attempt, answers],
    );

    // Auto-submit when time runs out
    useEffect(() => {
        if (remaining === 0 && state === 'taking') {
            handleSubmit(true);
        }
    }, [remaining, state, handleSubmit]);

    const startTest = async () => {
        setState('loading');
        try {
            const res = await quizService.startAttempt(assignmentId);
            setAttempt(res.data);
            setState('taking');
        } catch (e) {
            setError(e?.response?.data?.message || 'Không thể bắt đầu bài thi');
            setState('error');
        }
    };

    useEffect(() => {
        setState('ready');
    }, []);

    if (state === 'result') return <ResultScreen result={result} autoSubmit={autoSubmit} />;

    if (state === 'error') {
        const isAlreadySubmitted = error?.includes('nộp');
        const isExpired = error?.includes('hạn') || error?.includes('giờ');
        const errImg = isAlreadySubmitted ? imgDaNopBai : isExpired ? imgHetGio : imgKhongDuQuyen;
        const errTitle = isAlreadySubmitted
            ? 'Bạn đã nộp bài rồi'
            : isExpired
              ? 'Bài thi đã hết hạn'
              : 'Không thể làm bài';
        const errSub = isAlreadySubmitted
            ? 'Kết quả của bạn đã được ghi nhận. Vui lòng liên hệ nhà tuyển dụng nếu cần hỗ trợ.'
            : isExpired
              ? 'Thời gian làm bài đã kết thúc. Vui lòng liên hệ nhà tuyển dụng để được hỗ trợ.'
              : 'Bạn không có quyền truy cập bài thi này hoặc link đã hết hiệu lực.';
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center max-w-sm space-y-4">
                    <Image src={errImg} alt={errTitle} className="mx-auto w-80 h-auto" />
                    <div className="space-y-1.5">
                        <p className="text-[16px] font-bold text-slate-800">{errTitle}</p>
                        <p className="text-[13px] text-slate-500 leading-relaxed">{errSub}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.history.back()} className="text-[13px]">
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    if (state === 'ready')
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6 space-y-4">
                        <h1 className="text-[16px] font-bold text-slate-800">Sẵn sàng thi?</h1>
                        <p className="text-[13px] text-slate-500">
                            Một khi bắt đầu, đồng hồ đếm ngược sẽ chạy. Hãy chắc chắn bạn sẵn sàng.
                        </p>
                        <Button onClick={startTest} className="w-full bg-green-600 hover:bg-green-700 text-[13px]">
                            Bắt đầu làm bài
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );

    if (state === 'loading')
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-[13px] text-slate-400">Đang tải...</p>
            </div>
        );

    const questions = attempt?.questions ?? [];
    const q = questions[current];
    const answered = Object.keys(answers).length;
    const isLastQ = current === questions.length - 1;
    const isUrgent = remaining !== null && remaining < 60;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-4">
                <div className="flex-1">
                    <Progress value={(answered / questions.length) * 100} className="h-1.5" />
                    <p className="text-[11px] text-slate-400 mt-0.5">
                        {answered}/{questions.length} câu đã trả lời
                    </p>
                </div>
                <div
                    className={`flex items-center gap-1.5 font-mono text-[14px] font-bold shrink-0 ${isUrgent ? 'text-red-500' : 'text-slate-700'}`}
                >
                    <Clock size={14} className={isUrgent ? 'text-red-400' : 'text-slate-400'} />
                    {formatTime(remaining)}
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 p-4 max-w-2xl w-full mx-auto space-y-4">
                {q && (
                    <>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[11px]">
                                Câu {current + 1}/{questions.length}
                            </Badge>
                            <span className="text-[11px] text-slate-400">{q.points} điểm</span>
                        </div>

                        <Card>
                            <CardContent className="p-4">
                                {q.imageUrl ? (
                                    <img src={q.imageUrl} alt="question" className="max-w-full rounded-lg" />
                                ) : q.isCode ? (
                                    <div className="rounded-lg overflow-hidden border border-slate-700">
                                        <div className="bg-slate-800 px-3 py-1.5 flex items-center gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                        </div>
                                        <pre className="bg-slate-900 text-green-400 font-mono text-[13px] p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                                            {q.questionText}
                                        </pre>
                                    </div>
                                ) : (
                                    <p className="text-[14px] text-slate-800 leading-relaxed">{q.questionText}</p>
                                )}
                            </CardContent>
                        </Card>

                        <div className="space-y-2">
                            {q.options.map((opt, idx) => {
                                const selected = answers[q.id] === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                                            selected
                                                ? 'border-green-400 bg-green-50'
                                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${selected ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}
                                        >
                                            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                                        </div>
                                        <span className="text-[13px] font-medium text-slate-500 shrink-0">
                                            {String.fromCharCode(65 + idx)}.
                                        </span>
                                        {opt.imageUrl ? (
                                            <img src={opt.imageUrl} alt="" className="h-14 rounded object-contain" />
                                        ) : (
                                            <span className="text-[13px] text-slate-700">{opt.optionText}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Bottom nav */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrent((p) => p - 1)}
                    disabled={current === 0}
                    className="text-[13px] gap-1"
                >
                    <ChevronLeft size={14} /> Trước
                </Button>

                <div className="flex-1 flex gap-1 overflow-x-auto pb-0.5">
                    {questions.map((q, i) => (
                        <button
                            key={q.id}
                            onClick={() => setCurrent(i)}
                            className={`w-7 h-7 rounded shrink-0 text-[11px] font-semibold transition-colors ${
                                i === current
                                    ? 'bg-green-500 text-white'
                                    : answers[q.id]
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>

                {isLastQ ? (
                    <Button
                        size="sm"
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700 text-[13px] gap-1.5 shrink-0"
                    >
                        <Send size={13} /> {submitting ? 'Đang nộp...' : 'Nộp bài'}
                    </Button>
                ) : (
                    <Button size="sm" onClick={() => setCurrent((p) => p + 1)} className="text-[13px] gap-1 shrink-0">
                        Tiếp <ChevronRight size={14} />
                    </Button>
                )}
            </div>
        </div>
    );
}
