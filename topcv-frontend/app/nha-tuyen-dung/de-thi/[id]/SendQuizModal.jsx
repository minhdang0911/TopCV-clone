'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { quizService } from '@/services/quiz.service';
import { applicationsService } from '@/services/applications.service';
import { Check, Send, User } from 'lucide-react';

export default function SendQuizModal({ open, onClose, quiz, onSent }) {
    const [candidates, setCandidates] = useState([]);
    const [selected, setSelected] = useState([]);
    const [startsAt, setStartsAt] = useState('');
    const [endsAt, setEndsAt] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        if (!open) { setSelected([]); setStartsAt(''); setEndsAt(''); return; }
        setLoading(true);
        applicationsService.getAllByEmployer({ limit: 200 })
            .then(r => {
                const apps = r.data?.data ?? [];
                setCandidates(apps);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [open]);

    const toggle = (id) => setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    const handleSend = async () => {
        if (!selected.length) return;
        setSending(true);
        try {
            await quizService.assign(quiz.id, {
                applicationIds: selected,
                startsAt: startsAt || undefined,
                endsAt: endsAt || undefined,
            });
            onSent?.();
            onClose();
        } catch { } finally { setSending(false); }
    };

    return (
        <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-[15px]">Gửi đề thi</DialogTitle>
                    <DialogDescription className="sr-only">Chọn ứng viên và thời gian để gửi đề thi</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    <p className="text-[12px] text-slate-500">
                        Đề thi: <span className="font-semibold text-slate-700">{quiz?.title}</span>
                    </p>

                    {/* Time window */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label className="text-[11px] mb-1 block">Bắt đầu từ (tuỳ chọn)</Label>
                            <Input type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className="text-[12px]" />
                        </div>
                        <div>
                            <Label className="text-[11px] mb-1 block">Hạn nộp (tuỳ chọn)</Label>
                            <Input type="datetime-local" value={endsAt} onChange={e => setEndsAt(e.target.value)} className="text-[12px]" />
                        </div>
                    </div>

                    {/* Candidate list */}
                    <div>
                        <Label className="text-[11px] mb-2 block text-slate-500">
                            Chọn ứng viên ({selected.length} đã chọn)
                        </Label>
                        {loading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
                            </div>
                        ) : candidates.length === 0 ? (
                            <p className="text-[12px] text-slate-400 py-4 text-center">Không có ứng viên nào đang trong quá trình tuyển dụng</p>
                        ) : (
                            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                                {candidates.map(app => {
                                    const name = app.candidate?.candidateProfile?.fullName || app.candidate?.email || 'Ứng viên';
                                    const job = app.job?.title ?? '';
                                    const isSelected = selected.includes(app.id);
                                    return (
                                        <button
                                            key={app.id}
                                            onClick={() => toggle(app.id)}
                                            className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors ${isSelected ? 'border-green-400 bg-green-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}
                                        >
                                            <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${isSelected ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                                                {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                                            </div>
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                <User size={13} className="text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-semibold text-slate-700 truncate">{name}</p>
                                                <p className="text-[11px] text-slate-400 truncate">{job}</p>
                                            </div>
                                            <Badge variant="outline" className={`text-[10px] shrink-0 ${app.status === 'INTERVIEW' ? 'text-blue-600 border-blue-200' : 'text-slate-500'}`}>
                                                {app.status}
                                            </Badge>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-[13px]">Huỷ</Button>
                    <Button
                        size="sm"
                        onClick={handleSend}
                        disabled={!selected.length || sending}
                        className="bg-green-600 hover:bg-green-700 text-[13px] gap-1.5"
                    >
                        <Send size={13} />
                        {sending ? 'Đang gửi...' : `Gửi cho ${selected.length} ứng viên`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
