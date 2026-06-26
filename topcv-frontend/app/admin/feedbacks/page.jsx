'use client';

import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Send, CheckCircle, Clock, Star, RefreshCw } from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { PageHeader, RefreshButton } from '../_components/ui';

export default function AdminFeedbacksPage() {
    const [data,      setData]      = useState([]);
    const [loading,   setLoading]   = useState(true);
    const [replyId,   setReplyId]   = useState(null);
    const [replyText, setReplyText] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminService.getFeedbacks({ limit: 50 });
            setData(res.data?.data ?? res.data ?? []);
        } catch { toast.error('Không thể tải phản hồi'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, []);

    const sendReply = async (id) => {
        if (!replyText.trim()) { toast.error('Vui lòng nhập nội dung'); return; }
        try {
            await adminService.replyFeedback(id, replyText);
            toast.success('Đã gửi phản hồi');
            setReplyId(null); setReplyText(''); load();
        } catch { toast.error('Gửi thất bại'); }
    };

    const pending = data.filter(f => !f.replyText).length;

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <PageHeader title="Phản hồi" sub={`${data.length} phản hồi`} />
                <div className="flex items-center gap-3">
                    {!loading && (
                        <>
                            <div className="text-center bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                                <p className="text-xl font-bold text-amber-600">{pending}</p>
                                <p className="text-[11px] text-amber-500">Chờ xử lý</p>
                            </div>
                            <div className="text-center bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
                                <p className="text-xl font-bold text-emerald-600">{data.length - pending}</p>
                                <p className="text-[11px] text-emerald-500">Đã xử lý</p>
                            </div>
                        </>
                    )}
                    <RefreshButton onClick={load} loading={loading} />
                </div>
            </div>


            {loading && (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                            <div className="h-3 bg-slate-100 rounded w-1/4 mb-2" />
                            <div className="h-3 bg-slate-100 rounded w-3/4 mb-1" />
                            <div className="h-3 bg-slate-100 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && data.length === 0 && (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                    <MessageSquare size={36} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm text-slate-400">Chưa có phản hồi nào</p>
                </div>
            )}

            <div className="space-y-3">
                {data.map(fb => (
                    <div key={fb.id} className={`bg-white rounded-xl border p-5 transition-all ${!fb.replyText ? 'border-amber-200' : 'border-slate-200'}`}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                                    {(fb.user?.email ?? fb.email ?? 'A')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{fb.user?.email ?? fb.email ?? 'Ẩn danh'}</p>
                                    <p className="text-xs text-slate-400">{new Date(fb.createdAt).toLocaleString('vi')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {fb.rating != null && (
                                    <div className="flex items-center gap-0.5">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={13}
                                                fill={s <= fb.rating ? '#f59e0b' : 'none'}
                                                color={s <= fb.rating ? '#f59e0b' : '#d1d5db'}
                                            />
                                        ))}
                                    </div>
                                )}
                                {fb.replyText
                                    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full"><CheckCircle size={11} /> Đã reply</span>
                                    : <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full"><Clock size={11} /> Chờ xử lý</span>
                                }
                            </div>
                        </div>

                        <p className="text-sm text-slate-700 leading-relaxed">{fb.content || fb.message}</p>

                        {fb.replyText && (
                            <div className="mt-3 border-l-4 border-[#00b14f] bg-emerald-50 rounded-r-lg px-4 py-3">
                                <p className="text-xs font-bold text-emerald-700 mb-1">Phản hồi từ Admin</p>
                                <p className="text-sm text-emerald-900">{fb.replyText}</p>
                            </div>
                        )}

                        {!fb.replyText && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                {replyId === fb.id ? (
                                    <div className="space-y-2">
                                        <textarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                            placeholder="Nhập nội dung phản hồi..." rows={3}
                                            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 outline-none focus:border-[#00b14f] focus:ring-1 focus:ring-[#00b14f]/20 resize-none transition-all" />
                                        <div className="flex gap-2">
                                            <button onClick={() => sendReply(fb.id)}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-[#00b14f] hover:bg-[#009944] text-white text-sm font-semibold rounded-lg transition-colors">
                                                <Send size={13} /> Gửi
                                            </button>
                                            <button onClick={() => { setReplyId(null); setReplyText(''); }}
                                                className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => { setReplyId(fb.id); setReplyText(''); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#00b14f] border border-[#00b14f] hover:bg-emerald-50 rounded-lg transition-colors">
                                        <MessageSquare size={13} /> Viết phản hồi
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
