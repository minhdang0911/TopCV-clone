'use client';
import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

function FacebookIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
    );
}

function TwitterIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
        </svg>
    );
}

export default function ShareSocial({ url, title }) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareTitle = encodeURIComponent(title || '');
    const encodedUrl = encodeURIComponent(shareUrl);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    const buttons = [
        {
            label: 'Facebook',
            bg: '#1877f2',
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            icon: <FacebookIcon />,
        },
        {
            label: 'Twitter',
            bg: '#000000',
            href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareTitle}`,
            icon: <TwitterIcon />,
        },
        {
            label: 'LinkedIn',
            bg: '#0a66c2',
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            icon: <LinkedInIcon />,
        },
    ];

    return (
        <div style={{
            position: 'fixed',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
        }} className="share-social-wrap">
            <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '2px',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                lineHeight: 1,
            }}>Chia sẻ</span>

            {buttons.map((btn) => (
                <a
                    key={btn.label}
                    href={btn.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={btn.label}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: btn.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        textDecoration: 'none',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.22)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'; }}
                >
                    {btn.icon}
                </a>
            ))}

            <button
                onClick={handleCopy}
                title="Sao chép link"
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: copied ? '#00b14f' : '#e5e7eb',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    transition: 'all 0.15s',
                    flexShrink: 0,
                    color: copied ? 'white' : '#374151',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
                {copied ? <Check size={16} /> : <Link2 size={16} />}
            </button>

            <style>{`
                @media (max-width: 1280px) {
                    .share-social-wrap { display: none !important; }
                }
            `}</style>
        </div>
    );
}
