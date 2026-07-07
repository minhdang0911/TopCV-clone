'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronLeft, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import useAuthStore from '@/stores/auth.store';
import { chatgioService as chatService } from '@/services/chat.service';
import ChatMessageArea, { Avatar, timeAgo } from '@/app/components/chat/ChatMessageArea';
import { cn } from '@/lib/utils';

const GREEN = '#00b14f';

function getWsUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/api\/?$/, '');
}

export default function EmployerChatPage() {
    const { accessToken, isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initConvId = searchParams.get('conv');

    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(initConvId || null);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState('all');
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const wsDeadRef = useRef(false);
    const activeConv = conversations.find(c => c.id === activeConvId);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setShowSidebar(true);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const fetchConvs = useCallback(async () => {
        try {
            const res = await chatService.list();
            setConversations(res.data?.data || []);
        } catch {}
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;
        fetchConvs().finally(() => setLoadingConvs(false));
    }, [isAuthenticated, fetchConvs]);

    useEffect(() => {
        if (conversations.length > 0) {
            if (initConvId) {
                const found = conversations.find(c => c.id === initConvId);
                if (found) setActiveConvId(initConvId);
            } else if (!activeConvId) {
                const firstConvId = conversations[0].id;
                setActiveConvId(firstConvId);
                const params = new URLSearchParams(searchParams.toString());
                params.set('conv', firstConvId);
                router.replace(`/nha-tuyen-dung/tin-nhan?${params.toString()}`);
            }
        }
    }, [initConvId, conversations, activeConvId, searchParams, router]);

    useEffect(() => {
        if (!activeConvId) return;
        setLoadingMsgs(true);
        setMessages([]);
        chatService.getMessages(activeConvId)
            .then(res => setMessages(res.data?.data || []))
            .catch(() => {})
            .finally(() => setLoadingMsgs(false));
        chatService.markRead(activeConvId).catch(() => {});
        setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unreadCount: 0 } : c));
    }, [activeConvId]);

    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;
        wsDeadRef.current = false;
        let timer = null;

        function connect() {
            if (wsDeadRef.current) return;
            const ws = new WebSocket(`${getWsUrl()}/ws?token=${accessToken}`);
            ws.onmessage = (ev) => {
                try {
                    const { event, data } = JSON.parse(ev.data);
                    if (event === 'chat_message') {
                        const { conversationId, message } = data;
                        if (conversationId === activeConvId) {
                            setMessages(prev => [...prev, message]);
                            chatService.markRead(conversationId).catch(() => {});
                        }
                        setConversations(prev => prev.map(c => c.id !== conversationId ? c : {
                            ...c, messages: [message], lastMessageAt: message.createdAt,
                            unreadCount: conversationId === activeConvId ? 0 : (c.unreadCount || 0) + 1,
                        }));
                    }
                    if (event === 'message_reaction') {
                        const { messageId, reactions } = data;
                        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions } : m));
                    }
                } catch {}
            };
            ws.onerror = () => ws.close();
            ws.onclose = () => { if (!wsDeadRef.current) timer = setTimeout(connect, 4000); };
        }
        connect();
        return () => { wsDeadRef.current = true; if (timer) clearTimeout(timer); };
    }, [isAuthenticated, accessToken, activeConvId]);

    const handleSelectConv = (convId) => {
        setActiveConvId(convId);
        if (isMobile) setShowSidebar(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('conv', convId);
        router.replace(`/nha-tuyen-dung/tin-nhan?${params.toString()}`);
    };

    const handleSend = async (text, replyTo) => {
        const res = await chatService.send(activeConvId, text, 'text', replyTo?.id || null);
        let msg = res.data?.data;
        if (replyTo && msg && !msg.replyTo) msg = { ...msg, replyTo };
        setMessages(prev => [...prev, msg]);
        setConversations(prev => prev.map(c =>
            c.id === activeConvId ? { ...c, messages: [msg], lastMessageAt: msg?.createdAt } : c
        ));
    };

    const handleReact = async (msgId, emoji) => {
        const msg = messages.find(m => m.id === msgId);
        const alreadyReacted = msg?.reactions?.find(r => r.emoji === emoji && r.userIds?.includes(user?.id));
        const res = alreadyReacted
            ? await chatService.removeReaction(msgId, emoji)
            : await chatService.addReaction(msgId, emoji);
        const reactions = res.data?.reactions;
        if (Array.isArray(reactions)) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions } : m));
    };

    const filtered = conversations
        .filter(c => {
            const name = c.candidate?.candidateProfile?.fullName || '';
            return name.toLowerCase().includes(search.toLowerCase());
        })
        .filter(c => tab === 'unread' ? c.unreadCount > 0 : true);

    const candidateName = activeConv?.candidate?.candidateProfile?.fullName || 'Ứng viên';
    const candidateAvatar = activeConv?.candidate?.candidateProfile?.avatarUrl;

    return (
        <div className="flex h-[calc(100vh-60px)] bg-slate-100 overflow-hidden">

            {/* Sidebar */}
            {(!isMobile || showSidebar) && (
                <div className={cn('shrink-0 bg-white border-r border-slate-200 flex flex-col', isMobile ? 'w-full' : 'w-[300px]')}>
                    <div className="px-4 py-3.5 border-b border-slate-100">
                        <div className="text-sm font-bold text-slate-900 mb-2.5">Tin nhắn</div>
                        <div className="relative mb-2.5">
                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                            <Input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm ứng viên..."
                                className="pl-7 h-8 text-xs focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20"
                            />
                        </div>
                        <div className="flex gap-1.5">
                            {[{ k: 'all', l: 'Tất cả' }, { k: 'unread', l: 'Chưa đọc' }].map(t => (
                                <button
                                    key={t.k}
                                    onClick={() => setTab(t.k)}
                                    className={cn('px-3 py-1.5 rounded-full border-none cursor-pointer text-xs font-semibold transition-colors', tab === t.k ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200')}
                                    style={tab === t.k ? { background: GREEN } : {}}
                                >
                                    {t.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingConvs ? (
                            <div className="p-4 space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                                        <div className="flex-1 space-y-1.5">
                                            <Skeleton className="h-3.5 w-28" />
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-12 px-4 text-center">
                                <MessageSquare size={28} className="text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">Chưa có tin nhắn nào</p>
                            </div>
                        ) : (
                            filtered.map(conv => {
                                const cp = conv.candidate?.candidateProfile || {};
                                const lastMsg = conv.messages?.[0];
                                const isActive = conv.id === activeConvId;
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => handleSelectConv(conv.id)}
                                        className={cn('px-4 py-3 cursor-pointer flex gap-2.5 items-start border-b border-slate-50 border-l-[3px] transition-colors', isActive ? 'bg-green-50 border-l-green-500' : 'bg-white border-l-transparent hover:bg-slate-50')}
                                    >
                                        <Avatar src={cp.avatarUrl} name={cp.fullName} size={38} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className={cn('text-sm overflow-hidden text-ellipsis whitespace-nowrap text-slate-900', conv.unreadCount > 0 ? 'font-bold' : 'font-semibold')}>{cp.fullName || 'Ứng viên'}</span>
                                                <span className="text-[11px] text-slate-400 shrink-0 ml-1">{timeAgo(conv.lastMessageAt)}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                                                    {lastMsg ? lastMsg.content : 'Bắt đầu trò chuyện...'}
                                                </span>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] rounded-full min-w-4 h-4 flex items-center justify-center font-bold shrink-0 ml-1 px-1">
                                                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            {/* Chat area */}
            {(!isMobile || !showSidebar) && (
                activeConvId && activeConv ? (
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="px-5 py-3 bg-white border-b border-slate-200 flex items-center gap-3">
                            {isMobile && (
                                <button onClick={() => setShowSidebar(true)} className="bg-transparent border-none cursor-pointer p-0.5 flex items-center">
                                    <ChevronLeft size={22} className="text-slate-700" />
                                </button>
                            )}
                            <Avatar src={candidateAvatar} name={candidateName} size={38} />
                            <div>
                                <div className="text-sm font-bold text-slate-900">{candidateName}</div>
                                <div className="text-xs text-slate-400">Ứng viên</div>
                            </div>
                        </div>
                        <ChatMessageArea
                            messages={messages}
                            user={user}
                            isMineCheck={msg => msg.senderId !== activeConv.candidateId}
                            otherAvatar={candidateAvatar}
                            otherName={candidateName}
                            loading={loadingMsgs}
                            onSend={handleSend}
                            onReact={handleReact}
                            emptyAvatar={candidateAvatar}
                            emptyName={candidateName}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare size={48} className="text-slate-300 mb-3" />
                        <div className="text-[15px] font-semibold text-slate-700">Chọn một cuộc trò chuyện</div>
                        <div className="text-sm mt-1.5">Hoặc nhắn tin ứng viên từ trang hồ sơ ứng tuyển</div>
                    </div>
                )
            )}
        </div>
    );
}
