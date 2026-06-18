'use client';

import { useState } from 'react';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { quizService } from '@/services/quiz.service';
import QuestionCard from './QuestionCard';
import { Plus, AlertCircle } from 'lucide-react';

function SortableQuestion({ question, index, quizId, scoringMode, autoPoints, onUpdate, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

    return (
        <div ref={setNodeRef} style={style}>
            <QuestionCard
                question={question}
                index={index}
                quizId={quizId}
                scoringMode={scoringMode}
                autoPoints={autoPoints}
                onUpdate={onUpdate}
                onDelete={onDelete}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    );
}

export default function QuestionList({ quiz, questions, setQuestions }) {
    const [adding, setAdding] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const autoPoints = quiz.totalPoints / (questions.length || 1);
    const allocatedPoints = questions.reduce((s, q) => s + (q.points ?? 0), 0);
    const pointsOk = quiz.scoringMode === 'AUTO' || Math.abs(allocatedPoints - quiz.totalPoints) < 0.01;

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIdx = questions.findIndex(q => q.id === active.id);
        const newIdx = questions.findIndex(q => q.id === over.id);
        const reordered = arrayMove(questions, oldIdx, newIdx);
        setQuestions(reordered);
        const orders = reordered.map((q, i) => ({ id: q.id, order: i + 1 }));
        await quizService.reorderQuestions(quiz.id, orders).catch(() => { });
    };

    const handleAdd = async () => {
        setAdding(true);
        try {
            const res = await quizService.addQuestion(quiz.id, {
                questionText: '',
                points: quiz.scoringMode === 'AUTO' ? autoPoints : 0,
                options: [
                    { optionText: '', isCorrect: true },
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false },
                    { optionText: '', isCorrect: false },
                ],
            });
            setQuestions(p => [...p, res.data]);
        } catch { } finally { setAdding(false); }
    };

    const handleUpdate = (updated) => setQuestions(p => p.map(q => q.id === updated.id ? updated : q));
    const handleDelete = async (id) => {
        await quizService.deleteQuestion(id).catch(() => { });
        setQuestions(p => p.filter(q => q.id !== id));
    };

    return (
        <div className="space-y-3">
            {/* Header row — chỉ hiện count + điểm badge */}
            <div className="flex items-center gap-2">
                <span className="text-[13px] font-semibold text-slate-700">{questions.length} câu hỏi</span>
                {quiz.scoringMode === 'MANUAL' && (
                    <Badge variant={pointsOk ? 'outline' : 'destructive'} className={`text-[11px] ${pointsOk ? 'text-green-600 border-green-200 bg-green-50' : ''}`}>
                        {pointsOk ? (
                            `${allocatedPoints}/${quiz.totalPoints} điểm`
                        ) : (
                            <span className="flex items-center gap-1"><AlertCircle size={10} /> {allocatedPoints}/{quiz.totalPoints} điểm</span>
                        )}
                    </Badge>
                )}
                {quiz.scoringMode === 'AUTO' && questions.length > 0 && (
                    <Badge variant="outline" className="text-[11px] text-slate-500">
                        Mỗi câu: {(quiz.totalPoints / questions.length).toFixed(1)} đ
                    </Badge>
                )}
            </div>

            {questions.length === 0 ? (
                <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="w-full border-2 border-dashed border-slate-200 rounded-xl py-10 text-center hover:border-green-400 hover:bg-green-50 transition-colors group"
                >
                    <Plus size={22} className="mx-auto mb-2 text-slate-300 group-hover:text-green-500 transition-colors" />
                    <p className="text-[13px] text-slate-400 group-hover:text-green-600">{adding ? 'Đang thêm...' : 'Thêm câu hỏi đầu tiên'}</p>
                </button>
            ) : (
                <>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {questions.map((q, i) => (
                                    <SortableQuestion
                                        key={q.id}
                                        question={q}
                                        index={i}
                                        quizId={quiz.id}
                                        scoringMode={quiz.scoringMode}
                                        autoPoints={parseFloat((quiz.totalPoints / questions.length).toFixed(2))}
                                        onUpdate={handleUpdate}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {/* Thêm câu — luôn ở cuối danh sách */}
                    <button
                        onClick={handleAdd}
                        disabled={adding}
                        className="w-full border-2 border-dashed border-slate-200 rounded-xl py-4 flex items-center justify-center gap-2 text-[12px] text-slate-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                    >
                        <Plus size={15} />
                        {adding ? 'Đang thêm...' : 'Thêm câu hỏi'}
                    </button>
                </>
            )}
        </div>
    );
}
