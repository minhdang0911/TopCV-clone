'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, ChevronLeft } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { chatgioService as chatService } from '@/services/chat.service';
import api from '@/lib/axios';
import ChatMessageArea, { Avatar, timeAgo } from '@/app/components/chat/ChatMessageArea';

const GREEN = '#00b14f';

function getWsUrl() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    return apiUrl
        .replace('https://', 'wss://')
        .replace('http://', 'ws://')
        .replace(/\/api\/?$/, '');
}

export default function CandidateChatPage() {
    const { accessToken, isAuthenticated, user } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initConvId = searchParams.get('conv');

    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(initConvId || null);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const wsRef = useRef(null);
    const wsDeadRef = useRef(false);

    const activeConv = conversations.find((c) => c.id === activeConvId);

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
        if (conversations.length > 0) {
            if (initConvId) {
                const found = conversations.find((c) => c.id === initConvId);
                if (found) setActiveConvId(initConvId);
            } else if (!activeConvId) {
                // Auto-select the first conversation if URL query is empty
                const firstConvId = conversations[0].id;
                setActiveConvId(firstConvId);
                const params = new URLSearchParams(searchParams.toString());
                params.set('conv', firstConvId);
                router.replace(`/tin-nhan?${params.toString()}`);
            }
        }
    }, [initConvId, conversations, activeConvId, searchParams, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        api.get('/applications/my?limit=100')
            .then((res) => setAppliedJobs(res.data?.data || []))
            .catch(() => {});
    }, [isAuthenticated]);

    useEffect(() => {
        if (!activeConvId) return;
        setLoadingMsgs(true);
        setMessages([]);
        chatService
            .getMessages(activeConvId)
            .then((res) => setMessages(res.data?.data || []))
            .catch(() => {})
            .finally(() => setLoadingMsgs(false));
        chatService.markRead(activeConvId).catch(() => {});
        setConversations((prev) => prev.map((c) => (c.id === activeConvId ? { ...c, unreadCount: 0 } : c)));
    }, [activeConvId]);

    // WebSocket
    useEffect(() => {
        if (!isAuthenticated || !accessToken) return;
        wsDeadRef.current = false;
        let timer = null;

        function connect() {
            if (wsDeadRef.current) return;
            const ws = new WebSocket(`${getWsUrl()}/ws?token=${accessToken}`);
            wsRef.current = ws;
            ws.onmessage = (ev) => {
                try {
                    const { event, data } = JSON.parse(ev.data);
                    if (event === 'chat_message') {
                        const { conversationId, message } = data;
                        if (conversationId === activeConvId) {
                            setMessages((prev) => [...prev, message]);
                            chatService.markRead(conversationId).catch(() => {});
                        }
                        setConversations((prev) =>
                            prev.map((c) =>
                                c.id !== conversationId
                                    ? c
                                    : {
                                          ...c,
                                          messages: [message],
                                          lastMessageAt: message.createdAt,
                                          unreadCount: conversationId === activeConvId ? 0 : (c.unreadCount || 0) + 1,
                                      },
                            ),
                        );
                    }
                    if (event === 'message_reaction') {
                        const { messageId, reactions } = data;
                        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)));
                    }
                } catch {}
            };
            ws.onerror = () => ws.close();
            ws.onclose = () => {
                if (!wsDeadRef.current) timer = setTimeout(connect, 4000);
            };
        }
        connect();
        return () => {
            wsDeadRef.current = true;
            if (timer) clearTimeout(timer);
            wsRef.current?.close();
        };
    }, [isAuthenticated, accessToken, activeConvId]);

    const handleSelectConv = (convId) => {
        setActiveConvId(convId);
        if (isMobile) setShowSidebar(false);
        const params = new URLSearchParams(searchParams.toString());
        params.set('conv', convId);
        router.replace(`/tin-nhan?${params.toString()}`);
    };

    const handleSend = async (text, replyTo) => {
        const res = await chatService.send(activeConvId, text, 'text', replyTo?.id || null);
        let msg = res.data?.data;
        // Ensure replyTo is shown immediately without needing a refresh
        if (replyTo && msg && !msg.replyTo) {
            msg = { ...msg, replyTo };
        }
        setMessages((prev) => [...prev, msg]);
        setConversations((prev) =>
            prev.map((c) => (c.id === activeConvId ? { ...c, messages: [msg], lastMessageAt: msg?.createdAt } : c)),
        );
    };

    const handleReact = async (msgId, emoji) => {
        const msg = messages.find((m) => m.id === msgId);
        const alreadyReacted = msg?.reactions?.find((r) => r.emoji === emoji && r.userIds?.includes(user?.id));
        const res = alreadyReacted
            ? await chatService.removeReaction(msgId, emoji)
            : await chatService.addReaction(msgId, emoji);
        const reactions = res.data?.reactions;
        if (Array.isArray(reactions)) {
            setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, reactions } : m)));
        }
    };

    const filteredConvs = conversations.filter((c) => {
        const name = c.employerProfile?.companyName || '';
        return name.toLowerCase().includes(search.toLowerCase());
    });

    if (!isAuthenticated) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', color: '#374151', marginBottom: '12px' }}>
                        Vui lòng đăng nhập để xem tin nhắn
                    </div>
                    <button
                        onClick={() => router.push('/login')}
                        style={{
                            background: GREEN,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 24px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                        }}
                    >
                        Đăng nhập
                    </button>
                </div>
            </div>
        );
    }

    const epName = activeConv?.employerProfile?.companyName || 'Nhà tuyển dụng';
    const epAvatar = activeConv?.employerProfile?.logoUrl;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 72px)', background: '#f3f4f6', overflow: 'hidden' }}>
            {/* Conversation sidebar */}
            {(!isMobile || showSidebar) && (
                <div
                    style={{
                        width: isMobile ? '100%' : '320px',
                        flexShrink: 0,
                        background: 'white',
                        borderRight: '1px solid #e5e7eb',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>
                            Tin nhắn
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Search
                                size={14}
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#9ca3af',
                                }}
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Tìm công ty..."
                                style={{
                                    width: '100%',
                                    padding: '8px 10px 8px 30px',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontSize: '13px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loadingConvs ? (
                            <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                                Đang tải...
                            </div>
                        ) : filteredConvs.length === 0 ? (
                            <div
                                style={{
                                    padding: '32px 16px',
                                    textAlign: 'center',
                                    color: '#9ca3af',
                                    fontSize: '13px',
                                }}
                            >
                                Chưa có cuộc trò chuyện nào
                            </div>
                        ) : (
                            filteredConvs.map((conv) => {
                                const ep = conv.employerProfile || {};
                                const lastMsg = conv.messages?.[0];
                                const isActive = conv.id === activeConvId;
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => handleSelectConv(conv.id)}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'flex-start',
                                            background: isActive ? '#f0fdf4' : 'white',
                                            borderLeft: isActive ? `3px solid ${GREEN}` : '3px solid transparent',
                                            borderBottom: '1px solid #f9fafb',
                                        }}
                                    >
                                        <Avatar src={ep.logoUrl} name={ep.companyName} size={40} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '2px',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '13px',
                                                        fontWeight: conv.unreadCount > 0 ? '700' : '600',
                                                        color: '#111827',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {ep.companyName}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#9ca3af',
                                                        flexShrink: 0,
                                                        marginLeft: '4px',
                                                    }}
                                                >
                                                    {timeAgo(conv.lastMessageAt)}
                                                </span>
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#6b7280',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        flex: 1,
                                                    }}
                                                >
                                                    {lastMsg
                                                        ? (lastMsg.senderId === user?.id ? 'Bạn: ' : '') +
                                                          lastMsg.content
                                                        : 'Bắt đầu trò chuyện...'}
                                                </span>
                                                {conv.unreadCount > 0 && (
                                                    <span
                                                        style={{
                                                            background: '#ef4444',
                                                            color: 'white',
                                                            fontSize: '10px',
                                                            borderRadius: '50%',
                                                            minWidth: '16px',
                                                            height: '16px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: '700',
                                                            flexShrink: 0,
                                                            marginLeft: '4px',
                                                            padding: '0 3px',
                                                        }}
                                                    >
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
            {(!isMobile || !showSidebar) &&
                (activeConvId && activeConv ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        {/* Chat header */}
                        <div
                            style={{
                                padding: '12px 20px',
                                background: 'white',
                                borderBottom: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                            }}
                        >
                            {isMobile && (
                                <button
                                    onClick={() => setShowSidebar(true)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <ChevronLeft size={22} color="#374151" />
                                </button>
                            )}
                            <Avatar src={epAvatar} name={epName} size={38} />
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827' }}>{epName}</div>
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>Nhà tuyển dụng</div>
                            </div>
                        </div>

                        <ChatMessageArea
                            messages={messages}
                            user={user}
                            isMineCheck={(msg) => msg.senderId === user?.id || msg.senderId === activeConv.candidateId}
                            otherAvatar={epAvatar}
                            otherName={epName}
                            loading={loadingMsgs}
                            onSend={handleSend}
                            onReact={handleReact}
                            emptyAvatar={epAvatar}
                            emptyName={epName}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9ca3af',
                        }}
                    >
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>💬</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151' }}>
                            Chọn một cuộc trò chuyện
                        </div>
                        <div style={{ fontSize: '13px', marginTop: '6px' }}>
                            Hoặc bắt đầu nhắn tin từ trang chi tiết công việc
                        </div>
                    </div>
                ))}

            {/* Right panel — applied jobs (desktop only) */}
            {!isMobile && (
                <div
                    style={{
                        width: '260px',
                        flexShrink: 0,
                        background: 'white',
                        borderLeft: '1px solid #e5e7eb',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', flexShrink: 0 }}>
                        <div
                            style={{
                                fontSize: '12px',
                                fontWeight: '700',
                                color: '#6b7280',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Tin tuyển dụng đã ứng tuyển
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                        {(() => {
                            const epId = activeConv?.employerProfile?.id;
                            const jobs = epId ? appliedJobs.filter((a) => a.job?.employer?.id === epId) : appliedJobs;
                            if (jobs.length === 0) {
                                return (
                                    <div
                                        style={{
                                            padding: '24px 16px',
                                            textAlign: 'center',
                                            color: '#9ca3af',
                                            fontSize: '12px',
                                        }}
                                    >
                                        Chưa có dữ liệu
                                    </div>
                                );
                            }
                            return jobs.map((app) => {
                                const ep = app.job?.employer || {};
                                const handleChatRight = async () => {
                                    if (!ep.id) return;
                                    try {
                                        const res = await chatService.findOrCreate({ employerProfileId: ep.id });
                                        const conv = res.data?.data;
                                        if (!conv) return;
                                        setConversations((prev) => {
                                            const exists = prev.find((c) => c.id === conv.id);
                                            return exists ? prev : [conv, ...prev];
                                        });
                                        handleSelectConv(conv.id);
                                    } catch {}
                                };
                                return (
                                    <div
                                        key={app.id}
                                        style={{
                                            padding: '10px 12px',
                                            borderBottom: '1px solid #f3f4f6',
                                            display: 'flex',
                                            gap: '8px',
                                            alignItems: 'flex-start',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: '6px',
                                                border: '1px solid #e5e7eb',
                                                overflow: 'hidden',
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#f9fafb',
                                            }}
                                        >
                                            {ep.logoUrl ? (
                                                <img
                                                    src={ep.logoUrl}
                                                    alt={ep.companyName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <span style={{ fontSize: '13px', fontWeight: '700', color: GREEN }}>
                                                    {(ep.companyName || '?')[0]}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: '#9ca3af',
                                                    marginBottom: '1px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {ep.companyName}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: '#111827',
                                                    lineHeight: '1.3',
                                                    marginBottom: '6px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {app.job?.title}
                                            </div>
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '4px',
                                                }}
                                            >
                                                <button
                                                    onClick={handleChatRight}
                                                    style={{
                                                        padding: '3px 10px',
                                                        borderRadius: '20px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        background: '#f0fdf4',
                                                        color: GREEN,
                                                        border: `1px solid ${GREEN}`,
                                                        cursor: 'pointer',
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    Nhắn tin
                                                </button>
                                                <a
                                                    href={`/viec-lam/${app.job?.slug || app.job?.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        fontSize: '11px',
                                                        color: '#6b7280',
                                                        textDecoration: 'none',
                                                    }}
                                                >
                                                    Xem tin
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
