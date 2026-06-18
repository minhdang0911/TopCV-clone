'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizService } from '@/services/quiz.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileQuestion, ClipboardList, Clock, Target, Trash2, ChevronRight } from 'lucide-react';

function CreateQuizDialog({ open, onClose, onCreate }) {
    const [form, setForm] = useState({ title: '', description: '', totalPoints: 100, passRate: 70, durationMinutes: 30 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) setForm({ title: '', description: '', totalPoints: 100, passRate: 70, durationMinutes: 30 });
    }, [open]);

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

    const handleSubmit = async () => {
        if (!form.title.trim()) return;
        setLoading(true);
        try {
            const res = await quizService.create(form);
            onCreate(res.data);
        } catch { } finally { setLoading(false); }
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[15px]">Tạo đề thi mới</DialogTitle>
                    <DialogDescription className="sr-only">Điền thông tin để tạo đề thi mới</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-1">
                    <div>
                        <Label className="text-[12px] mb-1 block">Tên đề thi *</Label>
                        <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="VD: Bài kiểm tra Java Senior" className="text-[13px]" />
                    </div>
                    <div>
                        <Label className="text-[12px] mb-1 block">Mô tả</Label>
                        <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="text-[13px] resize-none" placeholder="Mô tả ngắn về đề thi..." />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <Label className="text-[12px] mb-1 block">Tổng điểm</Label>
                            <Input type="number" value={form.totalPoints} onChange={e => set('totalPoints', +e.target.value)} className="text-[13px]" />
                        </div>
                        <div>
                            <Label className="text-[12px] mb-1 block">Điểm đậu (%)</Label>
                            <Input type="number" value={form.passRate} onChange={e => set('passRate', +e.target.value)} className="text-[13px]" />
                        </div>
                        <div>
                            <Label className="text-[12px] mb-1 block">Thời gian (phút)</Label>
                            <Input type="number" value={form.durationMinutes} onChange={e => set('durationMinutes', +e.target.value)} className="text-[13px]" />
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-[13px]">Huỷ</Button>
                    <Button size="sm" onClick={handleSubmit} disabled={!form.title.trim() || loading} className="bg-green-600 hover:bg-green-700 text-[13px]">
                        {loading ? 'Đang tạo...' : 'Tạo đề thi'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function DeThiPage() {
    const router = useRouter();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        quizService.list().then(r => setQuizzes(r.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleCreate = (quiz) => {
        setShowCreate(false);
        router.push(`/nha-tuyen-dung/de-thi/${quiz.id}`);
    };

    const handleDelete = async (id) => {
        if (!confirm('Xoá đề thi này?')) return;
        setDeleting(id);
        try {
            await quizService.remove(id);
            setQuizzes(p => p.filter(q => q.id !== id));
        } catch { } finally { setDeleting(null); }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-[17px] font-bold text-slate-800">Đề thi</h1>
                    <p className="text-[12px] text-slate-500 mt-0.5">Tạo và quản lý bài kiểm tra tuyển dụng</p>
                </div>
                <Button size="sm" onClick={() => setShowCreate(true)} className="bg-green-600 hover:bg-green-700 text-[13px] gap-1.5">
                    <Plus size={15} />
                    Tạo đề thi
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
                </div>
            ) : quizzes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileQuestion size={48} className="text-slate-200 mb-4" />
                    <p className="text-[14px] font-semibold text-slate-500">Chưa có đề thi nào</p>
                    <p className="text-[12px] text-slate-400 mt-1 mb-4">Tạo đề thi để gửi cho ứng viên</p>
                    <Button size="sm" onClick={() => setShowCreate(true)} className="bg-green-600 hover:bg-green-700 text-[13px]">
                        Tạo đề thi đầu tiên
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.map(quiz => (
                        <Card key={quiz.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => router.push(`/nha-tuyen-dung/de-thi/${quiz.id}`)}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-9 h-9 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                                        <FileQuestion size={18} className="text-green-600" />
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDelete(quiz.id); }}
                                        disabled={deleting === quiz.id}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-2 mb-2">{quiz.title}</h3>
                                {quiz.description && (
                                    <p className="text-[12px] text-slate-500 line-clamp-1 mb-3">{quiz.description}</p>
                                )}

                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3">
                                    <span className="flex items-center gap-1"><Target size={11} />{quiz.totalPoints} điểm</span>
                                    <span className="flex items-center gap-1"><Clock size={11} />{quiz.durationMinutes} phút</span>
                                    <span className="flex items-center gap-1"><ClipboardList size={11} />{quiz._count?.questions ?? 0} câu</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <Badge variant="outline" className="text-[10px] text-green-600 border-green-200 bg-green-50">
                                        Đậu ≥ {quiz.passRate}%
                                    </Badge>
                                    <span className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-green-600 transition-colors">
                                        Chỉnh sửa <ChevronRight size={12} />
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateQuizDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        </div>
    );
}
