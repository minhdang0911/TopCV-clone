'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { quizService } from '@/services/quiz.service';
import { GripVertical, Trash2, ImageIcon, ImagePlus, Type, Code2, Check, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';

function OptionRow({ opt, index, onChangeText, onToggleCorrect, onRemove, onUploadImage, uploading }) {
    const fileRef = useRef();
    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${opt.isCorrect ? 'border-green-300 bg-green-50' : 'border-slate-100 bg-slate-50'}`}>
            {/* Correct toggle */}
            <button
                onClick={() => onToggleCorrect(index)}
                className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${opt.isCorrect ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}
            >
                {opt.isCorrect && <Check size={11} className="text-white" strokeWidth={3} />}
            </button>

            {opt.imageUrl ? (
                /* Has image: thumbnail + hover overlay "Đổi" + hover "Bỏ ảnh" ẩn */
                <div className="flex-1 flex items-center gap-2 min-w-0 group/imgrow">
                    <div
                        className="relative cursor-pointer shrink-0"
                        onClick={() => fileRef.current?.click()}
                        title="Nhấn để đổi ảnh"
                    >
                        <img src={opt.imageUrl} alt="" className="h-12 w-auto max-w-25 rounded-lg border border-slate-200 object-contain bg-white" />
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover/imgrow:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <ImageIcon size={12} className="text-white" />
                            <span className="text-white text-[10px] font-medium">Đổi</span>
                        </div>
                    </div>
                    <button
                        onClick={() => onChangeText(index, '', null)}
                        className="text-[11px] text-slate-300 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/imgrow:opacity-100"
                        title="Bỏ ảnh, dùng text"
                    >
                        Bỏ ảnh
                    </button>
                </div>
            ) : (
                /* No image: text input + camera icon to upload */
                <div className="flex-1 flex items-center gap-1 min-w-0">
                    <Input
                        value={opt.optionText ?? ''}
                        onChange={e => onChangeText(index, e.target.value, null)}
                        placeholder={`Đáp án ${String.fromCharCode(65 + index)}`}
                        className="flex-1 text-[12px] h-8 border-0 bg-transparent focus-visible:ring-0 px-0"
                    />
                    <button
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed border-slate-300 text-slate-400 hover:text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors text-[11px]"
                        title="Upload ảnh thay cho text"
                    >
                        {uploading ? <span>...</span> : <><ImagePlus size={14} /><span>Ảnh</span></>}
                    </button>
                </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && onUploadImage(index, e.target.files[0])} />

            {/* Remove option */}
            <button onClick={() => onRemove(index)} className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0" title="Xoá đáp án">
                <X size={13} />
            </button>
        </div>
    );
}

// 3 modes: 'text' | 'code' | 'image'
function detectInitialMode(question) {
    if (question.imageUrl) return 'image';
    if (question.isCode) return 'code';
    return 'text';
}

export default function QuestionCard({ question, index, quizId, scoringMode, autoPoints, onUpdate, onDelete, dragHandleProps }) {
    const [expanded, setExpanded] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const [uploadingOptIdx, setUploadingOptIdx] = useState(null);
    const [questionMode, setQuestionMode] = useState(detectInitialMode(question));
    const fileRef = useRef();

    const [draft, setDraft] = useState({
        questionText: question.questionText ?? '',
        isCode: question.isCode ?? false,
        points: question.points,
        options: question.options.map(o => ({
            id: o.id,
            optionText: o.optionText ?? '',
            imageUrl: o.imageUrl ?? null,
            isCorrect: o.isCorrect,
        })),
    });

    const setOpt = (idx, text, imgUrl) => setDraft(p => ({
        ...p,
        options: p.options.map((o, i) =>
            i === idx ? { ...o, optionText: text ?? o.optionText, imageUrl: imgUrl !== undefined ? imgUrl : o.imageUrl } : o
        ),
    }));

    const toggleCorrect = (idx) => setDraft(p => ({
        ...p,
        options: p.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
    }));

    const addOption = () => {
        if (draft.options.length >= 6) return;
        setDraft(p => ({ ...p, options: [...p.options, { optionText: '', imageUrl: null, isCorrect: false }] }));
    };

    const removeOption = (idx) => setDraft(p => ({ ...p, options: p.options.filter((_, i) => i !== idx) }));

    const handleModeChange = (mode) => {
        setQuestionMode(mode);
        setDraft(p => ({ ...p, isCode: mode === 'code' }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await quizService.updateQuestion(question.id, {
                questionText: questionMode !== 'image' ? (draft.questionText || undefined) : undefined,
                isCode: draft.isCode,
                points: scoringMode === 'MANUAL' ? draft.points : autoPoints,
                options: draft.options,
            });
            onUpdate(res.data);
        } catch { } finally { setSaving(false); }
    };

    const handleQuestionImageUpload = async (file) => {
        setUploadingImg(true);
        try {
            const res = await quizService.uploadQuestionImage(question.id, file);
            onUpdate({ ...question, imageUrl: res.data.url });
            setQuestionMode('image');
        } catch { } finally { setUploadingImg(false); }
    };

    const handleOptionImageUpload = async (idx, file) => {
        const optId = draft.options[idx]?.id;
        if (!optId) return;
        setUploadingOptIdx(idx);
        try {
            const res = await quizService.uploadOptionImage(optId, file);
            setOpt(idx, null, res.data.url);
        } catch { } finally { setUploadingOptIdx(null); }
    };

    const effectivePoints = scoringMode === 'MANUAL' ? draft.points : autoPoints;
    const previewText = question.questionText
        ? question.questionText.slice(0, 55) + (question.questionText.length > 55 ? '…' : '')
        : question.imageUrl ? '[Câu hỏi hình ảnh]' : 'Chưa có nội dung';

    const MODE_BTNS = [
        { key: 'text', label: 'Text', Icon: Type },
        { key: 'code', label: 'Code', Icon: Code2 },
        { key: 'image', label: 'Hình', Icon: ImageIcon },
    ];

    return (
        <Card className="border-slate-200">
            <CardContent className="p-3">
                {/* Collapsed header */}
                <div className="flex items-center gap-2 mb-2">
                    <div {...dragHandleProps} className="cursor-grab text-slate-300 hover:text-slate-500">
                        <GripVertical size={16} />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold shrink-0">Câu {index + 1}</Badge>
                    {question.isCode && (
                        <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-200 bg-purple-50 shrink-0">Code</Badge>
                    )}
                    <span className="flex-1 text-[11px] text-slate-400 truncate">{previewText}</span>
                    {scoringMode === 'MANUAL' && (
                        <span className="text-[11px] font-semibold text-green-600 shrink-0">{effectivePoints} đ</span>
                    )}
                    <button onClick={() => setExpanded(p => !p)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    <button onClick={() => onDelete(question.id)} className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={13} />
                    </button>
                </div>

                {expanded && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        {/* Mode selector */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label className="text-[11px] text-slate-500">Đề bài</Label>
                                <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                                    {MODE_BTNS.map(({ key, label, Icon }) => (
                                        <button
                                            key={key}
                                            onClick={() => key === 'image' ? fileRef.current?.click() : handleModeChange(key)}
                                            disabled={key === 'image' && uploadingImg}
                                            className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium border-r last:border-r-0 border-slate-200 transition-colors ${questionMode === key
                                                ? 'bg-slate-800 text-white'
                                                : 'text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <Icon size={10} />
                                            {key === 'image' && uploadingImg ? 'Uploading...' : label}
                                        </button>
                                    ))}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleQuestionImageUpload(e.target.files[0])} />
                            </div>

                            {/* Question body by mode */}
                            {questionMode === 'image' ? (
                                question.imageUrl ? (
                                    <div className="relative group inline-block">
                                        <img src={question.imageUrl} alt="question" className="max-h-52 rounded-lg border object-contain" />
                                        <button
                                            onClick={() => { handleModeChange('text'); onUpdate({ ...question, imageUrl: null }); }}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={11} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="w-full border-2 border-dashed border-slate-200 rounded-lg py-6 text-[12px] text-slate-400 hover:border-green-400 hover:text-green-500 transition-colors"
                                    >
                                        Nhấn để upload ảnh đề bài
                                    </button>
                                )
                            ) : questionMode === 'code' ? (
                                <div className="relative rounded-lg overflow-hidden border border-slate-700">
                                    <div className="bg-slate-800 px-3 py-1 flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                        <span className="ml-2 text-[10px] text-slate-400 font-mono">code</span>
                                    </div>
                                    <textarea
                                        value={draft.questionText}
                                        onChange={e => setDraft(p => ({ ...p, questionText: e.target.value }))}
                                        placeholder="// Nhập đoạn code câu hỏi..."
                                        rows={6}
                                        spellCheck={false}
                                        className="w-full bg-slate-900 text-green-400 font-mono text-[12px] p-3 resize-y outline-none leading-relaxed placeholder:text-slate-600"
                                    />
                                </div>
                            ) : (
                                <textarea
                                    value={draft.questionText}
                                    onChange={e => setDraft(p => ({ ...p, questionText: e.target.value }))}
                                    placeholder="Nhập nội dung câu hỏi..."
                                    rows={2}
                                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-800 resize-y outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent leading-relaxed"
                                />
                            )}
                        </div>

                        {/* Points (manual mode) */}
                        {scoringMode === 'MANUAL' && (
                            <div className="flex items-center gap-2">
                                <Label className="text-[11px] text-slate-500 shrink-0">Điểm câu này</Label>
                                <Input
                                    type="number"
                                    value={draft.points}
                                    onChange={e => setDraft(p => ({ ...p, points: +e.target.value }))}
                                    className="text-[13px] w-24"
                                />
                            </div>
                        )}

                        {/* Options */}
                        <div>
                            <Label className="text-[11px] text-slate-500 mb-1.5 block">Đáp án (chọn 1 đáp án đúng)</Label>
                            <div className="space-y-1.5">
                                {draft.options.map((opt, idx) => (
                                    <OptionRow
                                        key={idx}
                                        opt={opt}
                                        index={idx}
                                        onChangeText={setOpt}
                                        onToggleCorrect={toggleCorrect}
                                        onRemove={removeOption}
                                        onUploadImage={handleOptionImageUpload}
                                        uploading={uploadingOptIdx === idx}
                                    />
                                ))}
                            </div>
                            {draft.options.length < 6 && (
                                <button onClick={addOption} className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 hover:text-green-600 transition-colors">
                                    <Plus size={12} /> Thêm đáp án
                                </button>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700 text-[12px] h-7 px-3">
                                {saving ? 'Đang lưu...' : 'Lưu câu'}
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
