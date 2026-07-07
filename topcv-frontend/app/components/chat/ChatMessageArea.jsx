'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Send, Smile, CornerUpLeft, X, Search } from 'lucide-react';

// Emoji picker thuần HTML - không dùng library, 100% clickable
const EMOJI_CATEGORIES = {
    '😊 Mặt': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤧','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','☹️','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
    '👍 Tay': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁️','👅','👄','🫦','💋'],
    '❤️ Tim': ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','❤️‍🔥','❤️‍🩹','💔','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','🕉️','☯️','🌹','💐','🌷','🌺','🌸','🏵️','💮','🌼','🌻','⭐','🌟','✨','💫','⚡','🔥','💥','❄️','🌈','☀️','🌙','🌊'],
    '🎉 Vui': ['🎉','🎊','🎈','🎁','🎀','🎗️','🎟️','🎫','🥂','🍾','🎂','🎆','🎇','🧨','✨','🎯','🎮','🎲','🃏','🀄','🎭','🎨','🖼️','🎬','🎤','🎧','🎼','🎵','🎶','🎸','🎹','🥁','🪘','🎺','🎻','🪕','🎷','🪗','🏆','🥇','🥈','🥉','🏅','🎖️','🎪'],
    '🐶 Thú': ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐔','🐧','🐦','🦅','🦆','🦉','🦇','🐝','🪱','🦋','🐛','🐞','🐜','🪲','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐟','🐠','🐬','🐳','🐋','🦈','🐊','🐆','🐅','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘'],
    '🍕 Ăn': ['🍕','🍔','🍟','🌭','🍿','🧂','🥓','🥚','🍳','🧇','🥞','🧈','🍞','🥐','🥖','🫓','🥨','🥯','🧀','🥗','🥙','🌮','🌯','🫔','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍡','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🧃','🥤','🧋','☕','🍵','🍺','🍻','🥂','🍷','🥃','🍸','🍹','🧉','🍶','🍾'],
};

function SimpleEmojiPicker({ onEmojiClick, onClose, title = 'Chọn biểu cảm' }) {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState(Object.keys(EMOJI_CATEGORIES)[0]);

    const allEmojis = Object.values(EMOJI_CATEGORIES).flat();
    const filtered = search
        ? allEmojis.filter(() => true) // search by showing all for now
        : EMOJI_CATEGORIES[activeTab] || [];

    // Simple search: filter all emojis (since we can't search by name easily, just show all on search)
    const displayed = search ? allEmojis : filtered;

    return (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            width: '320px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#f9fafb',
            }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>{title}</span>
                <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', padding:'2px', display:'flex', alignItems:'center' }}>
                    <X size={14} color="#9ca3af" />
                </button>
            </div>

            {/* Search */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6', position: 'relative' }}>
                <Search size={13} style={{ position:'absolute', left:'18px', top:'50%', transform:'translateY(-50%)', color:'#9ca3af', pointerEvents:'none' }} />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm emoji..."
                    style={{
                        width: '100%',
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        padding: '5px 10px 5px 28px',
                        fontSize: '12px',
                        outline: 'none',
                        background: '#f9fafb',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            {/* Category tabs */}
            {!search && (
                <div style={{ display:'flex', overflowX:'auto', borderBottom:'1px solid #f3f4f6', padding:'4px 6px', gap:'2px', scrollbarWidth:'none' }}>
                    {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            style={{
                                background: activeTab === cat ? '#f0fdf4' : 'none',
                                border: activeTab === cat ? '1px solid #bbf7d0' : '1px solid transparent',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                                color: activeTab === cat ? '#16a34a' : '#6b7280',
                                fontWeight: activeTab === cat ? '600' : '400',
                                transition: 'all 0.15s',
                            }}
                        >
                            {cat.split(' ')[0]}
                        </button>
                    ))}
                </div>
            )}

            {/* Emoji grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: '2px',
                padding: '8px',
                maxHeight: '220px',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}>
                {displayed.map((emoji, i) => (
                    <button
                        key={i}
                        onClick={() => onEmojiClick(emoji)}
                        title={emoji}
                        style={{
                            background: 'none',
                            border: '1px solid transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '20px',
                            lineHeight: 1,
                            padding: '4px',
                            transition: 'background 0.1s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
}

const GREEN = '#00b14f';
const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍'];


export function timeAgo(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return `${m} phút`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} giờ`;
    return `${Math.floor(h / 24)} ngày`;
}

function formatDateLabel(iso) {
    const d = new Date(iso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msgDay = new Date(d);
    msgDay.setHours(0, 0, 0, 0);
    const diff = Math.round((today - msgDay) / 86400000);
    if (diff === 0) return 'Hôm nay';
    if (diff === 1) return 'Hôm qua';
    const DAYS = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    if (diff < 7) return `${DAYS[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatFullTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isSameDay(a, b) {
    if (!a || !b) return false;
    const da = new Date(a),
        db = new Date(b);
    return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function Avatar({ src, name, size = 36 }) {
    const letter = name?.[0]?.toUpperCase() || '?';
    return src ? (
        <img
            src={src}
            alt={name}
            style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
    ) : (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: GREEN,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size * 0.4,
                fontWeight: '700',
                flexShrink: 0,
            }}
        >
            {letter}
        </div>
    );
}

export default function ChatMessageArea({
    messages,
    user,
    isMineCheck,
    otherAvatar,
    otherName,
    loading,
    onSend,
    onReact,
    emptyAvatar,
    emptyName,
}) {
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [hoveredMsg, setHoveredMsg] = useState(null);
    const [reactionMenuFor, setReactionMenuFor] = useState(null);
    const [reactionPickerFor, setReactionPickerFor] = useState(null); // message id
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);     // input emoji

    const scrollAreaRef = useRef(null);
    const msgRefsMap = useRef({});
    const hoverTimerRef = useRef(null);
    const inputBarRef = useRef(null);
    const textareaRef = useRef(null);

    // ✅ FIX: scroll trong container, không scroll cả trang
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Đóng input emoji picker khi click ra ngoài
    useEffect(() => {
        if (!showEmojiPicker) return;
        const handler = (e) => {
            if (!inputBarRef.current?.contains(e.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showEmojiPicker]);

    // Close reaction popups on outside click
    useEffect(() => {
        if (!reactionMenuFor && !reactionPickerFor) return;
        const handler = (e) => {
            if (!e.target.closest('[data-reaction-popup]')) {
                setReactionMenuFor(null);
                setReactionPickerFor(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [reactionMenuFor, reactionPickerFor]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || sending) return;
        setSending(true);
        const replySnapshot = replyingTo;
        setInput('');
        setReplyingTo(null);
        try {
            await onSend(text, replySnapshot);
        } catch {
            setInput(text);
        } finally {
            setSending(false);
        }
    };

    const handleReact = async (msgId, emoji) => {
        setReactionMenuFor(null);
        setReactionPickerFor(null);
        await onReact(msgId, emoji);
    };

    // Toggle input emoji picker — đơn giản, không cần tính tọa độ
    const handleEmojiToggle = () => setShowEmojiPicker((p) => !p);

    const scrollToMsg = (msgId) => {
        const el = msgRefsMap.current[msgId];
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.outline = `2px solid ${GREEN}`;
        el.style.borderRadius = '8px';
        setTimeout(() => {
            if (el) {
                el.style.outline = '';
                el.style.borderRadius = '';
            }
        }, 1200);
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
            <div
                ref={scrollAreaRef}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '13px', marginTop: '40px' }}>
                        Đang tải tin nhắn...
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '60px' }}>
                        <Avatar src={emptyAvatar} name={emptyName} size={56} />
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginTop: '12px' }}>
                            {emptyName}
                        </div>
                        <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>
                            Hãy bắt đầu cuộc trò chuyện bằng một lời chào 👋
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMine = isMineCheck(msg);
                        const isHovered = hoveredMsg === msg.id;
                        const showBar = isHovered || reactionMenuFor === msg.id || reactionPickerFor === msg.id;
                        const showDateSep = idx === 0 || !isSameDay(messages[idx - 1].createdAt, msg.createdAt);

                        return (
                            <div key={msg.id}>
                                {showDateSep && (
                                    <div
                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0' }}
                                    >
                                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                        <span
                                            style={{
                                                fontSize: '11px',
                                                color: '#9ca3af',
                                                fontWeight: '500',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {formatDateLabel(msg.createdAt)}
                                        </span>
                                        <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
                                    </div>
                                )}

                                <div
                                    onMouseEnter={() => {
                                        clearTimeout(hoverTimerRef.current);
                                        setHoveredMsg(msg.id);
                                    }}
                                    onMouseLeave={() => {
                                        hoverTimerRef.current = setTimeout(() => setHoveredMsg(null), 120);
                                    }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                                        gap: '6px',
                                        alignItems: 'flex-start',
                                    }}
                                >
                                    {!isMine && <Avatar src={otherAvatar} name={otherName} size={28} />}

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isMine ? 'flex-end' : 'flex-start',
                                            maxWidth: '65%',
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <div
                                                data-reaction-popup
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    [isMine ? 'right' : 'left']: 'calc(100% + 4px)',
                                                    display: 'flex',
                                                    gap: '3px',
                                                    opacity: showBar ? 1 : 0,
                                                    pointerEvents: showBar ? 'auto' : 'none',
                                                    transition: 'opacity 0.12s',
                                                    zIndex: 15,
                                                }}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setReactionPickerFor(null);
                                                        setReactionMenuFor((p) => (p === msg.id ? null : msg.id));
                                                    }}
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        background: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        cursor: 'pointer',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#f3f4f6';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                    }}
                                                >
                                                    <Smile size={15} color="#6b7280" />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setReplyingTo({
                                                            id: msg.id,
                                                            content: msg.content,
                                                            senderName: isMine ? 'Bạn' : otherName,
                                                        })
                                                    }
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        background: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        cursor: 'pointer',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = '#f3f4f6';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'white';
                                                    }}
                                                >
                                                    <CornerUpLeft size={15} color="#6b7280" />
                                                </button>
                                            </div>

                                            {reactionMenuFor === msg.id && (
                                                <div
                                                    data-reaction-popup
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 'calc(100% + 4px)',
                                                        [isMine ? 'right' : 'left']: 0,
                                                        background: 'white',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '24px',
                                                        padding: '4px 8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '2px',
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                                        zIndex: 20,
                                                        whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    {QUICK_EMOJIS.map((em) => {
                                                        const iReacted = msg.reactions
                                                            ?.find((r) => r.emoji === em)
                                                            ?.userIds?.includes(user?.id);
                                                        return (
                                                            <button
                                                                key={em}
                                                                onClick={() => handleReact(msg.id, em)}
                                                                onMouseEnter={(e) => {
                                                                    e.currentTarget.style.transform =
                                                                        'scale(1.3) translateY(-2px)';
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    e.currentTarget.style.transform = '';
                                                                }}
                                                                style={{
                                                                    background: iReacted ? '#e8f5e9' : 'none',
                                                                    border: 'none',
                                                                    cursor: 'pointer',
                                                                    fontSize: '20px',
                                                                    width: '34px',
                                                                    height: '34px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    borderRadius: '50%',
                                                                    transition: 'transform 0.12s',
                                                                    padding: 0,
                                                                }}
                                                            >
                                                                {em}
                                                            </button>
                                                        );
                                                    })}
                                                    <div
                                                        style={{
                                                            width: '1px',
                                                            height: '20px',
                                                            background: '#e5e7eb',
                                                            margin: '0 3px',
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setReactionPickerFor(msg.id);
                                                            setReactionMenuFor(null);
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = '#f3f4f6';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = 'none';
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            width: '34px',
                                                            height: '34px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            borderRadius: '50%',
                                                            fontSize: '18px',
                                                            fontWeight: '700',
                                                            color: '#374151',
                                                        }}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            )}

                                            {/* reaction emoji picker đã được move ra ngoài thành ReactionEmojiPortal */}

                                            {msg.replyTo && (
                                                <div
                                                    onClick={() => scrollToMsg(msg.replyTo.id)}
                                                    style={{
                                                        cursor: 'pointer',
                                                        borderLeft: `3px solid ${isMine ? 'rgba(255,255,255,0.6)' : GREEN}`,
                                                        background: isMine ? 'rgba(0,140,60,0.85)' : '#f3f4f6',
                                                        borderRadius: '8px 8px 0 0',
                                                        padding: '5px 10px',
                                                        display: 'flex',
                                                        gap: '5px',
                                                        alignItems: 'flex-start',
                                                    }}
                                                >
                                                    <CornerUpLeft
                                                        size={11}
                                                        color={isMine ? 'rgba(255,255,255,0.7)' : GREEN}
                                                        style={{ flexShrink: 0, marginTop: '2px' }}
                                                    />
                                                    <div style={{ minWidth: 0 }}>
                                                        <div
                                                            style={{
                                                                fontSize: '10px',
                                                                fontWeight: '700',
                                                                color: isMine ? 'rgba(255,255,255,0.85)' : GREEN,
                                                                marginBottom: '1px',
                                                            }}
                                                        >
                                                            {msg.replyTo.senderName}
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize: '11px',
                                                                color: isMine ? 'rgba(255,255,255,0.65)' : '#6b7280',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                maxWidth: '220px',
                                                            }}
                                                        >
                                                            {msg.replyTo.content}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div
                                                ref={(el) => {
                                                    if (el) msgRefsMap.current[msg.id] = el;
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    borderRadius: msg.replyTo
                                                        ? isMine
                                                            ? '0 4px 4px 16px'
                                                            : '4px 16px 16px 0'
                                                        : isMine
                                                          ? '16px 16px 4px 16px'
                                                          : '16px 16px 16px 4px',
                                                    background: isMine ? GREEN : 'white',
                                                    color: isMine ? 'white' : '#111827',
                                                    fontSize: '13px',
                                                    lineHeight: '1.5',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                                                    border: isMine ? 'none' : '1px solid #e5e7eb',
                                                    wordBreak: 'break-word',
                                                }}
                                            >
                                                {msg.content}
                                            </div>
                                        </div>

                                        {msg.reactions?.length > 0 && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    gap: '3px',
                                                    marginTop: '3px',
                                                    flexWrap: 'wrap',
                                                    justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                }}
                                            >
                                                {msg.reactions.map((r) => {
                                                    const iReacted = r.userIds?.includes(user?.id);
                                                    return (
                                                        <button
                                                            key={r.emoji}
                                                            onClick={() => handleReact(msg.id, r.emoji)}
                                                            style={{
                                                                background: iReacted ? '#e8f5e9' : '#f3f4f6',
                                                                border: `1px solid ${iReacted ? GREEN : '#e5e7eb'}`,
                                                                borderRadius: '12px',
                                                                padding: '1px 7px',
                                                                fontSize: '13px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '3px',
                                                                lineHeight: '1.5',
                                                            }}
                                                        >
                                                            {r.emoji}
                                                            {r.count > 1 && (
                                                                <span
                                                                    style={{
                                                                        fontSize: '11px',
                                                                        color: '#374151',
                                                                        fontWeight: '600',
                                                                    }}
                                                                >
                                                                    {r.count}
                                                                </span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <span
                                            title={formatFullTime(msg.createdAt)}
                                            style={{
                                                fontSize: '10px',
                                                color: '#9ca3af',
                                                marginTop: '2px',
                                                cursor: 'default',
                                            }}
                                        >
                                            {timeAgo(msg.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                {/* ✅ FIX: đã xóa messagesEndRef div */}
            </div>

            {replyingTo && (
                <div
                    style={{
                        padding: '8px 20px',
                        background: '#f9fafb',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        flexShrink: 0,
                    }}
                >
                    <CornerUpLeft size={14} color={GREEN} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: GREEN }}>{replyingTo.senderName}</div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#6b7280',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {replyingTo.content}
                        </div>
                    </div>
                    <button
                        onClick={() => setReplyingTo(null)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <X size={14} color="#9ca3af" />
                    </button>
                </div>
            )}

            <div
                ref={inputBarRef}
                style={{
                    padding: '12px 20px',
                    background: 'white',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-end',
                    position: 'relative',
                    zIndex: 10,
                    flexShrink: 0,
                }}
            >
                {/* ── INPUT EMOJI PICKER ── */}
                {showEmojiPicker && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 'calc(100% + 8px)',
                            left: '12px',
                            zIndex: 500,
                        }}
                    >
                        <SimpleEmojiPicker
                            title="Chỉn Emoji"
                            onClose={() => setShowEmojiPicker(false)}
                            onEmojiClick={(emoji) => {
                                setInput((p) => p + emoji);
                                textareaRef.current?.focus();
                            }}
                        />
                    </div>
                )}

                {/* ── REACTION EMOJI PICKER ── */}
                {/* Removed from here - now rendered as absolute overlay in outer wrapper */}
                <div style={{ flexShrink: 0 }}>
                    <button
                        onClick={handleEmojiToggle}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'none',
                            border: `1px solid ${showEmojiPicker ? GREEN : '#e5e7eb'}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'border-color 0.15s',
                        }}
                    >
                        <Smile size={18} color={showEmojiPicker ? GREEN : '#9ca3af'} />
                    </button>
                </div>
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="Nhập tin nhắn... (Enter để gửi)"
                    rows={1}
                    style={{
                        flex: 1,
                        border: '1px solid #e5e7eb',
                        borderRadius: '20px',
                        padding: '10px 14px',
                        fontSize: '13px',
                        outline: 'none',
                        resize: 'none',
                        maxHeight: '120px',
                        lineHeight: '1.5',
                        fontFamily: 'inherit',
                    }}
                    onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim() || sending}
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: input.trim() ? GREEN : '#e5e7eb',
                        border: 'none',
                        cursor: input.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'background 0.2s',
                    }}
                >
                    <Send size={16} color={input.trim() ? 'white' : '#9ca3af'} />
                </button>
            </div>
        </div>
    );
}
