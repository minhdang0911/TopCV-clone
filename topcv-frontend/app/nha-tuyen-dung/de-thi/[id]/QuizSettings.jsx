'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { quizService } from '@/services/quiz.service';
import { Settings2, Save } from 'lucide-react';

export default function QuizSettings({ quiz, onUpdate }) {
    const [form, setForm] = useState({
        title: quiz.title,
        description: quiz.description ?? '',
        totalPoints: quiz.totalPoints,
        passRate: quiz.passRate,
        durationMinutes: quiz.durationMinutes,
        scoringMode: quiz.scoringMode,
        shuffleQuestions: quiz.shuffleQuestions,
        shuffleOptions: quiz.shuffleOptions,
        rules: quiz.rules ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await quizService.update(quiz.id, form);
            onUpdate(res.data);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch { } finally { setSaving(false); }
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                    <Settings2 size={15} className="text-slate-500" />
                    <span className="text-[13px] font-semibold text-slate-700">Cài đặt đề thi</span>
                </div>

                <div>
                    <Label className="text-[12px] mb-1 block">Tên đề thi *</Label>
                    <Input value={form.title} onChange={e => set('title', e.target.value)} className="text-[13px]" />
                </div>

                <div>
                    <Label className="text-[12px] mb-1 block">Mô tả</Label>
                    <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} className="text-[13px] resize-none" />
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

                {/* Scoring mode */}
                <div>
                    <Label className="text-[12px] mb-2 block">Phân bổ điểm</Label>
                    <div className="flex gap-2">
                        {['AUTO', 'MANUAL'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => set('scoringMode', mode)}
                                className={`flex-1 py-2 rounded-lg border text-[12px] font-medium transition-colors ${form.scoringMode === mode
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                            >
                                {mode === 'AUTO' ? 'Chia đều tự động' : 'Tự đặt từng câu'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                        <Label className="text-[12px] text-slate-600">Xáo trộn thứ tự câu hỏi</Label>
                        <Switch checked={form.shuffleQuestions} onCheckedChange={v => set('shuffleQuestions', v)} />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label className="text-[12px] text-slate-600">Xáo trộn đáp án</Label>
                        <Switch checked={form.shuffleOptions} onCheckedChange={v => set('shuffleOptions', v)} />
                    </div>
                </div>

                <div>
                    <Label className="text-[12px] mb-1 block">Nội quy thi (tuỳ chọn)</Label>
                    <Textarea value={form.rules} onChange={e => set('rules', e.target.value)} rows={2} className="text-[13px] resize-none" placeholder="VD: Không được tra cứu tài liệu, thời gian tính từ lúc bắt đầu..." />
                </div>

                <Button size="sm" onClick={handleSave} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-[13px] gap-1.5">
                    <Save size={13} />
                    {saving ? 'Đang lưu...' : saved ? 'Đã lưu!' : 'Lưu cài đặt'}
                </Button>
            </CardContent>
        </Card>
    );
}
