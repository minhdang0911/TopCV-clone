'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ratingsService } from '@/services/ratings.service';
import { Star } from 'lucide-react';

const LABELS = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

export default function RatingDialog({ open, onClose, applicationId, type, targetName }) {
    const [score, setScore] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (!open) { setScore(0); setHovered(0); setComment(''); setDone(false); }
    }, [open]);

    // Load existing rating
    useEffect(() => {
        if (open && applicationId && type) {
            ratingsService.getMyRating(applicationId, type)
                .then(res => {
                    const r = res.data;
                    if (r?.score) { setScore(r.score); setComment(r.comment || ''); }
                })
                .catch(() => {});
        }
    }, [open, applicationId, type]);

    const handleSubmit = async () => {
        if (!score) return;
        setLoading(true);
        try {
            await ratingsService.create({ applicationId, score, comment, type });
            setDone(true);
            setTimeout(() => { onClose?.(); }, 1200);
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const display = hovered || score;

    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-[15px]">
                        {type === 'EMPLOYER_TO_CANDIDATE' ? 'Đánh giá ứng viên' : 'Đánh giá nhà tuyển dụng'}
                    </DialogTitle>
                </DialogHeader>

                {done ? (
                    <div className="py-6 text-center">
                        <div className="text-3xl mb-2">✓</div>
                        <p className="text-[14px] font-semibold text-green-600">Đã gửi đánh giá!</p>
                    </div>
                ) : (
                    <div className="space-y-4 py-1">
                        {targetName && (
                            <p className="text-[13px] text-slate-500">
                                Đánh giá cho <span className="font-semibold text-slate-700">{targetName}</span>
                            </p>
                        )}

                        {/* Stars */}
                        <div className="flex items-center gap-1.5 justify-center py-2">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setScore(s)}
                                    onMouseEnter={() => setHovered(s)}
                                    onMouseLeave={() => setHovered(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        size={32}
                                        className={display >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}
                                    />
                                </button>
                            ))}
                        </div>

                        {display > 0 && (
                            <div className="text-center">
                                <Badge variant="outline" className="text-[12px] font-semibold">
                                    {LABELS[display]}
                                </Badge>
                            </div>
                        )}

                        <Textarea
                            placeholder="Nhận xét thêm (tuỳ chọn)..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={3}
                            className="text-[13px] resize-none"
                        />
                    </div>
                )}

                {!done && (
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" size="sm" onClick={onClose} className="text-[13px]">Bỏ qua</Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!score || loading}
                            className="bg-green-600 hover:bg-green-700 text-[13px]"
                        >
                            {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
