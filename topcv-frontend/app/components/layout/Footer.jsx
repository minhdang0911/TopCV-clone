'use client';

import Image from 'next/image';
import Link from 'next/link';
import logo from '@/app/assests/img/logo-home.png';

const GREEN = '#00b14f';

/* ── Data ── */
const COL1 = {
    title: 'Về TopCV',
    links: [
        { label: 'Giới thiệu', href: '#' },
        { label: 'Góc báo chí', href: '#' },
        { label: 'Tuyển dụng', href: '#' },
        { label: 'Liên hệ', href: '#' },
        { label: 'Hỏi đáp', href: '#' },
        { label: 'Chính sách bảo mật', href: '#' },
        { label: 'Điều khoản dịch vụ', href: '#' },
    ],
};

const COL2 = {
    title: 'Hồ sơ và CV',
    links: [
        { label: 'Quản lý CV của bạn', href: '#' },
        { label: 'Hướng dẫn viết CV', href: '#' },
        { label: 'Thư viện CV theo ngành nghề', href: '#' },
        { label: 'Review CV', href: '#' },
    ],
    sub: {
        title: 'Đối tác',
        links: [
            { label: 'TestCenter', href: '#' },
            { label: 'TopHR', href: '#' },
            { label: 'ViecNgay', href: '#' },
            { label: 'Happy Time', href: '#' },
        ],
    },
};

const COL3 = {
    title: 'Khám phá',
    links: [
        { label: 'Ứng dụng di động TopCV', href: '#' },
        { label: 'Tính lương Gross - Net', href: '#' },
        { label: 'Tính lãi suất kép', href: '#' },
        { label: 'Lập kế hoạch tiết kiệm', href: '#' },
        { label: 'Tính bảo hiểm thất nghiệp', href: '#' },
        { label: 'Tính bảo hiểm xã hội một lần', href: '#' },
        { label: 'Trắc nghiệm MBTI', href: '#' },
        { label: 'Trắc nghiệm MI', href: '#' },
    ],
};

const COL4 = {
    title: 'Xây dựng sự nghiệp',
    links: [
        { label: 'Việc làm tốt nhất', href: '/viec-lam-tot-nhat' },
        { label: 'Việc làm lương cao', href: '#' },
        { label: 'Việc làm quản lý', href: '#' },
        { label: 'Việc làm IT', href: '#' },
        { label: 'Việc làm Senior', href: '#' },
        { label: 'Việc làm bán thời gian', href: '#' },
    ],
    sub: {
        title: 'Quy tắc chung',
        links: [
            { label: 'Điều kiện giao dịch chung', href: '#' },
            { label: 'Giá dịch vụ & Cách thanh toán', href: '#' },
            { label: 'Thông tin về vận chuyển', href: '#' },
        ],
    },
};

const ECOSYSTEM = [
    {
        bg: GREEN,
        name: 'topcv',
        logo: (
            <span style={{ fontWeight: 900, fontSize: '18px', color: 'white', letterSpacing: '-0.5px' }}>
                top<span style={{ color: '#b8f5d0' }}>cv</span>
            </span>
        ),
        desc: 'Nền tảng công nghệ tuyển dụng thông minh TopCV.vn',
    },
    {
        bg: '#f37a20',
        name: 'happytime',
        logo: <span style={{ fontWeight: 800, fontSize: '15px', color: 'white' }}>HappyTime</span>,
        desc: 'Nền tảng quản lý & gia tăng trải nghiệm nhân viên HappyTime.vn',
    },
    {
        bg: '#1a2a4a',
        name: 'testcenter',
        logo: <span style={{ fontWeight: 800, fontSize: '15px', color: 'white' }}>TestCenter</span>,
        desc: 'Nền tảng thiết lập và đánh giá năng lực nhân viên TestCenter.vn',
    },
    {
        bg: '#1a6b45',
        name: 'shiring',
        logo: (
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'white' }}>
                SHiring<span style={{ color: '#7ef4b8' }}>.ai</span>
            </span>
        ),
        desc: 'Giải pháp quản trị tuyển dụng hiệu suất cao SHiring.ai',
    },
];

/* ── Social SVGs ── */
const FacebookIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
);
const YoutubeIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#f37a20" />
    </svg>
);
const LinkedinIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
    </svg>
);
const TiktokIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.18 8.18 0 004.78 1.52V6.94a4.85 4.85 0 01-1-.25z" />
    </svg>
);

/* ── Link column ── */
function FooterCol({ col }) {
    return (
        <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a', marginBottom: '12px' }}>
                {col.title}
            </div>
            {col.links.map((l) => (
                <a
                    key={l.label}
                    href={l.href}
                    style={{
                        display: 'block',
                        fontSize: '13px',
                        color: '#555',
                        marginBottom: '8px',
                        textDecoration: 'none',
                        lineHeight: 1.4,
                        transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.target.style.color = GREEN)}
                    onMouseLeave={(e) => (e.target.style.color = '#555')}
                >
                    {l.label}
                </a>
            ))}
            {col.sub && (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#1a1a1a', marginBottom: '12px' }}>
                        {col.sub.title}
                    </div>
                    {col.sub.links.map((l) => (
                        <a
                            key={l.label}
                            href={l.href}
                            style={{
                                display: 'block',
                                fontSize: '13px',
                                color: '#555',
                                marginBottom: '8px',
                                textDecoration: 'none',
                                lineHeight: 1.4,
                                transition: 'color 0.15s',
                            }}
                            onMouseEnter={(e) => (e.target.style.color = GREEN)}
                            onMouseLeave={(e) => (e.target.style.color = '#555')}
                        >
                            {l.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════ */
export default function Footer() {
    return (
        <footer>
            <FooterStyles />
            {/* ── Top section ── */}
            <div style={{ background: '#f8f8f8', borderTop: '1px solid #e8e8e8', padding: '40px 0 32px' }}>
                <div
                    className="footer-top-grid"
                    style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 20px',
                        display: 'grid',
                        gridTemplateColumns: '260px 1fr',
                        gap: '48px',
                    }}
                >
                    {/* Left: branding + contact */}
                    <div>
                        {/* Logo */}
                        <div style={{ marginBottom: '6px' }}>
                            <Link href="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
                                <Image src={logo} alt="TopCV" height={150} unoptimized />
                            </Link>
                        </div>

                        {/* Badges */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', alignItems: 'center' }}>
                            <div
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '6px',
                                    padding: '4px 8px',
                                    fontSize: '10px',
                                    color: '#555',
                                    background: 'white',
                                    lineHeight: 1.3,
                                }}
                            >
                                <span style={{ color: '#4285f4', fontWeight: 700 }}>G</span>
                                <span style={{ color: '#ea4335', fontWeight: 700 }}>o</span>
                                <span style={{ color: '#fbbc05', fontWeight: 700 }}>o</span>
                                <span style={{ color: '#4285f4', fontWeight: 700 }}>g</span>
                                <span style={{ color: '#34a853', fontWeight: 700 }}>l</span>
                                <span style={{ color: '#ea4335', fontWeight: 700 }}>e</span> for Startups
                                <br />
                                Accelerator 2020
                            </div>
                            <div
                                style={{
                                    background: '#1a1a2e',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: GREEN,
                                }}
                            >
                                DMCA
                            </div>
                        </div>

                        {/* Contact */}
                        <div style={{ fontSize: '12.5px', color: '#444', lineHeight: '2' }}>
                            <div>
                                <strong>Liên hệ</strong>
                            </div>
                            <div>
                                Hotline: <strong>1900 068 889</strong> | Nhánh 2 (Giờ hành chính)
                            </div>
                            <div>
                                Email:{' '}
                                <a href="mailto:hotro@topcv.vn" style={{ color: GREEN, textDecoration: 'none' }}>
                                    hotro@topcv.vn
                                </a>
                            </div>
                            <div>
                                Zalo hỗ trợ ứng viên:{' '}
                                <a href="#" style={{ color: GREEN, textDecoration: 'none' }}>
                                    Kết nối ngay →
                                </a>
                            </div>
                            <div>
                                Fanpage:{' '}
                                <a href="#" style={{ color: GREEN, textDecoration: 'none' }}>
                                    TopCV Vietnam
                                </a>
                            </div>
                            <div>
                                LinkedIn:{' '}
                                <a href="#" style={{ color: GREEN, textDecoration: 'none' }}>
                                    TopCV Vietnam
                                </a>
                            </div>
                            <div>
                                Thread:{' '}
                                <a href="#" style={{ color: GREEN, textDecoration: 'none' }}>
                                    TopCV Vietnam
                                </a>
                            </div>
                            <div>
                                Tiktok:{' '}
                                <a href="#" style={{ color: GREEN, textDecoration: 'none' }}>
                                    TopCV Vietnam
                                </a>
                            </div>
                        </div>

                        {/* App store buttons */}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', marginBottom: '16px' }}>
                            <a
                                href="#"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#1a1a1a',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    textDecoration: 'none',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                <div style={{ lineHeight: 1.2 }}>
                                    <div style={{ fontSize: '9px', color: '#aaa' }}>Download on the</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>App Store</div>
                                </div>
                            </a>
                            <a
                                href="#"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: '#1a1a1a',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    textDecoration: 'none',
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path
                                        d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z"
                                        fill="#34a853"
                                    />
                                    <path d="M3 3.5L14.5 15 3 20.5v-17z" fill="#4285f4" />
                                    <path d="M3 20.5L14.5 15 17.5 17l-12.9 4.3c-.66.5-1.6.03-1.6-.8z" fill="#ea4335" />
                                    <path d="M3 3.5l12.9 4.3L14.5 9 3 3.5z" fill="#fbbc05" />
                                </svg>
                                <div style={{ lineHeight: 1.2 }}>
                                    <div style={{ fontSize: '9px', color: '#aaa' }}>GET IT ON</div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'white' }}>Google Play</div>
                                </div>
                            </a>
                        </div>

                        {/* Social icons */}
                        <div style={{ marginTop: '4px' }}>
                            <div style={{ fontSize: '12.5px', fontWeight: '600', color: '#444', marginBottom: '10px' }}>
                                Cộng đồng TopCV
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {[
                                    { icon: <FacebookIcon />, bg: '#1877f2', href: '#' },
                                    { icon: <YoutubeIcon />, bg: '#ff0000', href: '#' },
                                    { icon: <LinkedinIcon />, bg: '#0a66c2', href: '#' },
                                    { icon: <TiktokIcon />, bg: '#1a1a1a', href: '#' },
                                ].map((s, i) => (
                                    <a
                                        key={i}
                                        href={s.href}
                                        style={{
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '50%',
                                            background: s.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {s.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: 4 link columns */}
                    <div className="footer-link-cols" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                        <FooterCol col={COL1} />
                        <FooterCol col={COL2} />
                        <FooterCol col={COL3} />
                        <FooterCol col={COL4} />
                    </div>
                </div>
            </div>

            {/* ── Bottom section ── */}
            <div style={{ background: 'white', borderTop: '1px solid #e8e8e8', padding: '28px 0 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div className="footer-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'start' }}>
                        {/* Legal info */}
                        <div>
                            <div
                                style={{ fontWeight: '700', fontSize: '15px', color: '#1a1a1a', marginBottom: '10px' }}
                            >
                                Công ty Cổ phần TopCV Việt Nam
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.9' }}>
                                <div>
                                    <span style={{ color: GREEN }}>▪</span> Giấy phép đăng ký kinh doanh số:{' '}
                                    <strong>0107307178</strong> cấp ngày 21/01/2016, thay đổi lần thứ 17 ngày 03/04/2025
                                    tại Sở Tài chính Thành phố Hà Nội
                                </div>
                                <div>
                                    <span style={{ color: GREEN }}>▪</span> Giấy phép hoạt động dịch vụ việc làm số:{' '}
                                    <strong>44/2024/SLĐTBXH-GP</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '3px' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#e8a000"/></svg>
                                    <span><strong>Trụ sở HN:</strong> Tòa FS - GoldSeason số 47 Nguyễn Tuân, Phường Thanh Xuân, Thành phố Hà Nội, Việt Nam</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '3px' }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#e8a000"/></svg>
                                    <span><strong>Chi nhánh HCM:</strong> Tòa nhà Dali, 24C Phan Đăng Lưu, Phường Gia Định, TP HCM</span>
                                </div>
                            </div>

                            {/* Ecosystem */}
                            <div style={{ marginTop: '18px' }}>
                                <div
                                    style={{
                                        fontSize: '12.5px',
                                        fontWeight: '600',
                                        color: '#444',
                                        marginBottom: '10px',
                                    }}
                                >
                                    Hệ sinh thái HR Tech của TopCV
                                </div>
                                <div className="footer-ecosystem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                    {ECOSYSTEM.map((e) => (
                                        <a
                                            key={e.name}
                                            href="#"
                                            style={{
                                                background: e.bg,
                                                borderRadius: '10px',
                                                padding: '10px 12px',
                                                textDecoration: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            <div style={{ flexShrink: 0 }}>{e.logo}</div>
                                            <div
                                                style={{
                                                    fontSize: '11px',
                                                    color: 'rgba(255,255,255,0.85)',
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {e.desc}
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Copyright */}
                            <div
                                style={{
                                    marginTop: '16px',
                                    fontSize: '12px',
                                    color: '#999',
                                    borderTop: '1px solid #f0f0f0',
                                    paddingTop: '12px',
                                }}
                            >
                                © 2014-2026 TopCV Vietnam JSC. All rights reserved.
                            </div>
                        </div>

                        {/* QR code */}
                        <div className="footer-qr" style={{ textAlign: 'center' }}>
                            <div
                                style={{
                                    width: '90px',
                                    height: '90px',
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    background: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <QRPattern />
                            </div>
                            <div style={{ fontSize: '11px', color: GREEN, marginTop: '6px', fontWeight: '600' }}>
                                topcv.com.vn
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* ── Responsive ── */
const FooterStyles = () => (
    <style>{`
        @media(max-width:768px){
            .footer-top-grid{grid-template-columns:1fr!important;gap:24px!important;}
            .footer-link-cols{grid-template-columns:repeat(2,1fr)!important;gap:16px!important;}
            .footer-bottom-grid{grid-template-columns:1fr!important;}
            .footer-ecosystem-grid{grid-template-columns:repeat(2,1fr)!important;}
            .footer-qr{display:none!important;}
        }
        @media(max-width:480px){
            .footer-link-cols{grid-template-columns:1fr!important;}
        }
    `}</style>
);

/* ── Simple QR-like decorative pattern ── */
function QRPattern() {
    const cells = [];
    const size = 11;
    const seed = [
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
        [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0],
        [1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1],
        [0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1],
    ];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            cells.push(
                <rect
                    key={`${r}-${c}`}
                    x={c * 7}
                    y={r * 7}
                    width={6}
                    height={6}
                    fill={seed[r][c] ? '#1a1a1a' : 'white'}
                />,
            );
        }
    }
    return (
        <svg viewBox="0 0 77 77" width="78" height="78">
            {cells}
        </svg>
    );
}
