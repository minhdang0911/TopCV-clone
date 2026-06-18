'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { quizService } from '@/services/quiz.service';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import QuizSettings from './QuizSettings';
import QuestionList from './QuestionList';
import SendQuizModal from './SendQuizModal';
import { ArrowLeft, Send, Users, Clock, Target, FileQuestion } from 'lucide-react';

function AssignmentRow({ assignment }) {
    const attempt = assignment.attempts?.[0];
    const name = assignment.application?.candidate?.candidateProfile?.fullName
        || assignment.application?.candidate?.email || 'Ứng viên';
    const job = assignment.application?.job?.title ?? '';

    return (
        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 truncate">{name}</p>
                <p className="text-[11px] text-slate-400 truncate">{job}</p>
            </div>
            {attempt?.submittedAt ? (
                <div className="text-right shrink-0">
                    <Badge variant={attempt.passed ? 'default' : 'destructive'} className={`text-[10px] ${attempt.passed ? 'bg-green-100 text-green-700 border-green-200' : ''}`}>
                        {attempt.passed ? 'Đạt' : 'Không đạt'}
                    </Badge>
                    <p className="text-[11px] text-slate-500 mt-0.5">{attempt.score} điểm</p>
                </div>
            ) : attempt?.startedAt ? (
                <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200 shrink-0">Đang làm</Badge>
            ) : (
                <Badge variant="outline" className="text-[10px] text-slate-400 shrink-0">Chưa làm</Badge>
            )}
        </div>
    );
}

export default function QuizBuilderPage() {
    const { id } = useParams();
    const router = useRouter();
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSend, setShowSend] = useState(false);

    useEffect(() => {
        quizService.getOne(id)
            .then(r => {
                setQuiz(r.data);
                setQuestions(r.data.questions ?? []);
            })
            .catch(() => router.replace('/nha-tuyen-dung/de-thi'))
            .finally(() => setLoading(false));
    }, [id]);

    const loadAssignments = () => {
        quizService.getAssignments(id).then(r => setAssignments(r.data)).catch(() => { });
    };

    useEffect(() => { if (quiz) loadAssignments(); }, [quiz]);

    if (loading) return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 rounded-xl" />
        </div>
    );

    if (!quiz) return null;

    return (
        <div className="space-y-4">
            {/* Top bar */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.push('/nha-tuyen-dung/de-thi')} className="h-8 w-8">
                    <ArrowLeft size={16} />
                </Button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-[16px] font-bold text-slate-800 truncate">{quiz.title}</h1>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1"><Target size={10} />{quiz.totalPoints} điểm</span>
                        <span className="flex items-center gap-1"><Clock size={10} />{quiz.durationMinutes} phút</span>
                        <span className="flex items-center gap-1"><FileQuestion size={10} />{questions.length} câu</span>
                        <Badge variant="outline" className="text-[10px]">{quiz.scoringMode === 'AUTO' ? 'Chia đều' : 'Thủ công'}</Badge>
                    </div>
                </div>
                <Button
                    size="sm"
                    onClick={() => setShowSend(true)}
                    disabled={questions.length === 0}
                    className="bg-green-600 hover:bg-green-700 text-[13px] gap-1.5 shrink-0"
                >
                    <Send size={13} /> Gửi đề thi
                </Button>
            </div>

            <Tabs defaultValue="questions">
                <TabsList className="h-8 text-[12px]">
                    <TabsTrigger value="questions" className="text-[12px] px-3 h-7">Câu hỏi</TabsTrigger>
                    <TabsTrigger value="settings" className="text-[12px] px-3 h-7">Cài đặt</TabsTrigger>
                    <TabsTrigger value="results" className="text-[12px] px-3 h-7">
                        Kết quả
                        {assignments.length > 0 && (
                            <span className="ml-1 bg-slate-200 text-slate-600 rounded-full px-1.5 text-[10px]">{assignments.length}</span>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="questions" className="mt-3">
                    <QuestionList
                        quiz={quiz}
                        questions={questions}
                        setQuestions={setQuestions}
                    />
                </TabsContent>

                <TabsContent value="settings" className="mt-3">
                    <QuizSettings quiz={quiz} onUpdate={updated => setQuiz(updated)} />
                </TabsContent>

                <TabsContent value="results" className="mt-3">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Users size={14} className="text-slate-500" />
                                <span className="text-[13px] font-semibold text-slate-700">{assignments.length} ứng viên được gửi</span>
                            </div>
                            {assignments.length === 0 ? (
                                <p className="text-[12px] text-slate-400 text-center py-6">Chưa gửi đề thi cho ai</p>
                            ) : (
                                <div className="space-y-2">
                                    {assignments.map(a => <AssignmentRow key={a.id} assignment={a} />)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <SendQuizModal
                open={showSend}
                onClose={() => setShowSend(false)}
                quiz={quiz}
                onSent={loadAssignments}
            />
        </div>
    );
}
