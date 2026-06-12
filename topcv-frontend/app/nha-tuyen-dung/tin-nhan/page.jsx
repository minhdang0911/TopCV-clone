'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, ChevronLeft } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { chatService } from '@/services/chat.service';
import ChatMessageArea, { Avatar, timeAgo } from '@/app/components/chat/ChatMessageArea';

const GREEN = '#00b14f';

function getWsUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return apiUrl.replace('https://', 'wss://').replace('http://', 'ws://').replace(/\/api\/?$/, '');
}

export default function EmployerChatPage() {
    const { accessToken, isAuthenticated, user } = useAuthStore();
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

    // Responsive breakpoint detection
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
        if (initConvId && conversations.length > 0) {
            const found = conversations.find(c => c.id === initConvId);
            if (found) setActiveConvId(initConvId);
        }
    }, [initConvId, conversations]);

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

    // WebSocket
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
    };

    const handleSend = async (text, replyTo) => {
        const res = await chatService.send(activeConvId, text, 'text', replyTo?.id || null);
        let msg = res.data?.data;
        // Ensure replyTo is shown immediately without needing a refresh
        if (replyTo && msg && !msg.replyTo) {
            msg = { ...msg, replyTo };
        }
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
        if (Array.isArray(reactions)) {
            setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reactions } : m));
        }
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
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#f3f4f6', overflow: 'hidden' }}>

            {/* Conversation sidebar */}
            {(!isMobile || showSidebar) && (
                <div style={{ width: isMobile ? '100%' : '300px', flexShrink: 0, background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Tin nhắn</div>
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm ứng viên..."
                                style={{ width: '100%', padding: '7px 9px 7px 28px', border: '1px solid #e5e7eb', borderRadius: '7px', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {[{ k: 'all', l: 'Tất cả' }, { k: 'unread', l: 'Chưa đọc' }].map(t => (
                                <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '5px 12px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600', background: tab === t.k ? GREEN : '#f3f4f6', color: tab === t.k ? 'white' : '#6b7280' }}>
                                    {t.l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loadingConvs ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Đang tải...</div>
                        ) : filtered.length === 0 ? (
                            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Chưa có tin nhắn nào</div>
                        ) : (
                            filtered.map(conv => {
                                const cp = conv.candidate?.candidateProfile || {};
                                const lastMsg = conv.messages?.[0];
                                const isActive = conv.id === activeConvId;
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => handleSelectConv(conv.id)}
                                        style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'flex-start', background: isActive ? '#f0fdf4' : 'white', borderLeft: isActive ? `3px solid ${GREEN}` : '3px solid transparent', borderBottom: '1px solid #f9fafb' }}
                                    >
                                        <Avatar src={cp.avatarUrl} name={cp.fullName} size={38} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                                                <span style={{ fontSize: '13px', fontWeight: conv.unreadCount > 0 ? '700' : '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.fullName || 'Ứng viên'}</span>
                                                <span style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0, marginLeft: '4px' }}>{timeAgo(conv.lastMessageAt)}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                    {lastMsg ? lastMsg.content : 'Bắt đầu trò chuyện...'}
                                                </span>
                                                {conv.unreadCount > 0 && (
                                                    <span style={{ background: '#ef4444', color: 'white', fontSize: '10px', borderRadius: '50%', minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0, marginLeft: '4px', padding: '0 3px' }}>
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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        {/* Chat header */}
                        <div style={{ padding: '12px 20px', background: 'white', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isMobile && (
                                <button onClick={() => setShowSidebar(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                                    <ChevronLeft size={22} color="#374151" />
                                </button>
                            )}
                            <Avatar src={candidateAvatar} name={candidateName} size={38} />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{candidateName}</div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Ứng viên</div>
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
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>Chọn một cuộc trò chuyện</div>
                        <div style={{ fontSize: '13px', marginTop: '6px' }}>Hoặc nhắn tin ứng viên từ trang hồ sơ ứng tuyển</div>
                    </div>
                )
            )}
        </div>
    );
}
