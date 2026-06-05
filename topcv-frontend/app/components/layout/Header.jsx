'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Bell,
    MessageSquare,
    Menu,
    X,
    Briefcase,
    Bookmark,
    CheckSquare,
    Star,
    Building2,
    Building,
    FileText,
    Upload,
    BookOpen,
    Mail,
    HelpCircle,
    Calculator,
    DollarSign,
    TrendingUp,
    Percent,
    Shield,
    PiggyBank,
    Smartphone,
    Brain,
    Activity,
    GraduationCap,
    Compass,
    BarChart2,
} from 'lucide-react';
import logo from '@/app/assests/img/logo-home.png';
import api from '@/lib/axios';
import useAuthStore from '@/stores/auth.store';

/* ─── Icon map for mobile menus ─── */
const VIEC_LAM_ITEMS = [
    { label: 'Tìm việc làm', href: '/viec-lam', Icon: Briefcase },
    { label: 'Việc làm đã lưu', href: '/viec-lam/da-luu', Icon: Bookmark },
    { label: 'Việc làm đã ứng tuyển', href: '/viec-lam/da-ung-tuyen', Icon: CheckSquare },
    { label: 'Việc làm phù hợp', href: '/viec-lam/phu-hop', Icon: Star },
];
const CONG_TY_ITEMS = [
    { label: 'Danh sách công ty', href: '/cong-ty', Icon: Building2 },
    { label: 'Công ty', href: '/cong-ty/pro', Icon: Building, badge: 'Pro' },
];
const TAO_CV_STYLE = [
    { label: 'Mẫu CV Đơn giản', href: '/tao-cv', Icon: FileText },
    { label: 'Mẫu CV Ấn tượng', href: '/tao-cv', Icon: Star },
    { label: 'Mẫu CV Chuyên nghiệp', href: '/tao-cv', Icon: GraduationCap },
    { label: 'Mẫu CV Harvard', href: '/tao-cv', Icon: BookOpen },
];
const TAO_CV_POSITION = [
    { label: 'Nhân viên kinh doanh', href: '/tao-cv' },
    { label: 'Lập trình viên', href: '/tao-cv' },
    { label: 'Nhân viên kế toán', href: '/tao-cv' },
    { label: 'Chuyên viên marketing', href: '/tao-cv' },
];
const TAO_CV_MANAGE = [
    { label: 'Quản lý CV', href: '#', Icon: FileText },
    { label: 'Tải CV lên', href: '#', Icon: Upload },
    { label: 'Hướng dẫn viết CV', href: '#', Icon: BookOpen },
    { label: 'Quản lý Cover Letter', href: '#', Icon: Mail },
    { label: 'Mẫu Cover Letter', href: '#', Icon: FileText },
];
const KHAM_PHA_ITEMS = [
    { label: 'Bộ câu hỏi phỏng vấn', href: '#', Icon: HelpCircle, badge: 'Mới' },
    { label: 'Trắc nghiệm MBTI', href: '#', Icon: Brain },
    { label: 'Trắc nghiệm MI', href: '#', Icon: Activity },
    { label: 'TopCV Skills', href: '#', Icon: GraduationCap },
    { label: 'Khóa học', href: '#', Icon: Compass },
];
const CONG_CU_ITEMS = [
    { label: 'Tính lương Gross - Net', href: '#', Icon: Calculator },
    { label: 'Tính thuế thu nhập cá nhân', href: '#', Icon: DollarSign },
    { label: 'Tra cứu lương', href: '#', Icon: TrendingUp, badge: 'Mới' },
    { label: 'Tính lãi suất kép', href: '#', Icon: Percent },
    { label: 'Tính bảo hiểm thất nghiệp', href: '#', Icon: Shield },
    { label: 'Tính bảo hiểm xã hội một lần', href: '#', Icon: Shield },
    { label: 'Lập kế hoạch tiết kiệm', href: '#', Icon: PiggyBank },
    { label: 'Mobile App TopCV', href: '#', Icon: Smartphone },
];
const CAM_NANG_ITEMS = [
    { label: 'Định hướng nghề nghiệp', href: '#' },
    { label: 'Bí kíp tìm việc', href: '#' },
    { label: 'Chế độ lương thưởng', href: '#' },
    { label: 'Kiến thức chuyên ngành', href: '#' },
    { label: 'Hành trang nghề nghiệp', href: '#' },
    { label: 'Thị trường & xu hướng tuyển dụng', href: '#' },
];

/* ─── Nav items config — href để click navigate ─── */
const NAV_ITEMS = [
    { key: 'viec-lam', label: 'Việc làm', href: '/viec-lam' },
    { key: 'tao-cv', label: 'Tạo CV', href: '/tao-cv' },
    { key: 'cong-cu', label: 'Công cụ', href: '#' },
    { key: 'cam-nang', label: 'Cẩm nang nghề nghiệp', href: '#' },
];

/* ─── Shared styles ─── */
const GREEN = '#00b14f';
const sectionLabel = {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: '0.5px',
    marginBottom: '10px',
    textTransform: 'uppercase',
};
const navLinkStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#374151',
    padding: '5px 0',
    textDecoration: 'none',
    lineHeight: '1.5',
};
const hoverGreen = (e) => (e.currentTarget.style.color = GREEN);
const hoverGray = (e) => (e.currentTarget.style.color = '#374151');

const ProBadge = () => (
    <span
        style={{
            padding: '1px 7px',
            borderRadius: '111px',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            color: '#513101',
            fontSize: '11px',
            fontWeight: '700',
            lineHeight: '1.6',
        }}
    >
        Pro
    </span>
);

const NewBadge = ({ label = 'Mới' }) => (
    <span
        style={{
            padding: '1px 6px',
            borderRadius: '4px',
            background: '#dcfce7',
            color: GREEN,
            fontSize: '10px',
            fontWeight: '700',
            marginLeft: '4px',
        }}
    >
        {label}
    </span>
);

export default function Header() {
    const [jobPositions, setJobPositions] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const menuTimeoutRef = useRef(null);

    const openMenu = (key) => {
        if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
        setActiveMenu(key);
    };
    const closeMenu = () => {
        menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 80);
    };

    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileView, setMobileView] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef(null);
    const { user, isAuthenticated, hydrated } = useAuthStore();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth <= 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                const [posRes, indRes] = await Promise.all([
                    api.get('/job-positions?limit=100'),
                    api.get('/industries?limit=100'),
                ]);
                setJobPositions(posRes.data.data || []);
                setIndustries(indRes.data.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        fetchMenuData();
    }, []);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileOpen]);

    useEffect(() => {
        if (!mobileOpen) setMobileView(null);
    }, [mobileOpen]);

    const half = Math.ceil(jobPositions.length / 2);
    const posCol1 = jobPositions.slice(0, half);
    const posCol2 = jobPositions.slice(half);

    /* ── Auth section ── */
    const renderAuthSection = () => {
        if (!hydrated)
            return <div style={{ width: '130px', height: '32px', borderRadius: '6px', background: '#f3f4f6' }} />;
        if (isAuthenticated && user) {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                        src={user.candidateProfile?.avatarUrl || user.employerProfile?.logoUrl || '/default-avatar.png'}
                        alt="avatar"
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '2px solid #e5e7eb',
                            flexShrink: 0,
                        }}
                    />
                    {!isMobile && (
                        <span
                            style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#374151',
                                maxWidth: '100px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {user.candidateProfile?.fullName || user.employerProfile?.companyName}
                        </span>
                    )}
                </div>
            );
        }
        return (
            <div style={{ display: 'flex', gap: '6px' }}>
                <Link
                    href="/login"
                    style={{
                        padding: '7px 14px',
                        borderRadius: '6px',
                        border: `1px solid ${GREEN}`,
                        color: GREEN,
                        fontSize: '13px',
                        fontWeight: '600',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    Đăng nhập
                </Link>
                {!isMobile && (
                    <Link
                        href="/register"
                        style={{
                            padding: '7px 14px',
                            borderRadius: '6px',
                            background: GREEN,
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Đăng ký
                    </Link>
                )}
            </div>
        );
    };

    /* ─── Mobile submenu content ─── */
    const MobileSubItem = ({ href, Icon, label, badge, onClick }) => (
        <Link
            href={href}
            onClick={onClick || (() => setMobileOpen(false))}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '13px 16px',
                fontSize: '14px',
                color: '#111827',
                textDecoration: 'none',
                borderBottom: '1px solid #f3f4f6',
            }}
        >
            {Icon && <Icon size={18} style={{ color: GREEN, flexShrink: 0 }} />}
            <span style={{ flex: 1 }}>{label}</span>
            {badge === 'Pro' && <ProBadge />}
            {badge === 'Mới' && <NewBadge />}
        </Link>
    );

    const MobileSection = ({ title, items }) => (
        <div>
            {title && <p style={{ ...sectionLabel, padding: '14px 16px 4px', margin: 0 }}>{title}</p>}
            {items.map((item) => (
                <MobileSubItem key={item.label} {...item} />
            ))}
        </div>
    );

    const mobileSubContent = {
        'viec-lam': (
            <>
                <MobileSection title="VIỆC LÀM" items={VIEC_LAM_ITEMS} />
                <MobileSection title="CÔNG TY" items={CONG_TY_ITEMS} />
                {jobPositions.length > 0 && (
                    <div>
                        <p style={{ ...sectionLabel, padding: '14px 16px 4px', margin: 0 }}>VIỆC LÀM THEO VỊ TRÍ</p>
                        {jobPositions.map((pos) => (
                            <MobileSubItem
                                key={pos.id}
                                href={`/tim-viec-lam-${pos.slug}`}
                                label={`Việc làm ${pos.name}`}
                            />
                        ))}
                    </div>
                )}
                {industries.length > 0 && (
                    <div>
                        <p style={{ ...sectionLabel, padding: '14px 16px 4px', margin: 0 }}>VIỆC LÀM THEO LĨNH VỰC</p>
                        {industries.map((ind) => (
                            <MobileSubItem
                                key={ind.id}
                                href={`/tim-viec-lam-moi-nhat?company_field=${ind.id}&type_keyword=1&sba=1&saturday_status=0`}
                                label={`Việc làm ${ind.name}`}
                            />
                        ))}
                    </div>
                )}
            </>
        ),
        'tao-cv': (
            <>
                <div style={{ padding: '14px 16px 4px' }}>
                    <Link
                        href="/tao-cv"
                        style={{ fontSize: '13px', fontWeight: '700', color: GREEN, textDecoration: 'none' }}
                    >
                        Mẫu CV theo style →
                    </Link>
                </div>
                <MobileSection title="" items={TAO_CV_STYLE} />
                <div style={{ padding: '14px 16px 4px' }}>
                    <Link
                        href="/tao-cv"
                        style={{ fontSize: '13px', fontWeight: '700', color: GREEN, textDecoration: 'none' }}
                    >
                        Mẫu CV theo vị trí ứng tuyển →
                    </Link>
                </div>
                {TAO_CV_POSITION.map((item) => (
                    <MobileSubItem key={item.label} href={item.href} label={item.label} />
                ))}
                <MobileSection title="" items={TAO_CV_MANAGE} />
            </>
        ),
        'cong-cu': (
            <>
                <MobileSection title="KHÁM PHÁ VÀ NÂNG CẤP BẢN THÂN" items={KHAM_PHA_ITEMS} />
                <MobileSection title="CÔNG CỤ" items={CONG_CU_ITEMS} />
            </>
        ),
        'cam-nang': <MobileSection title="" items={CAM_NANG_ITEMS.map((i) => ({ ...i, Icon: BarChart2 }))} />,
    };

    /* ─── Desktop dropdown content ─── */
    const dropdownContent = {
        'viec-lam': (
            <div
                style={{
                    position: 'absolute',
                    top: 'calc(100% - 2px)',
                    left: 0,
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
                    border: '1px solid #f0f0f0',
                    width: '800px',
                    padding: '24px',
                    paddingTop: '26px',
                    display: 'grid',
                    gridTemplateColumns: '200px 1fr 1fr',
                    gap: '24px',
                    zIndex: 200,
                }}
            >
                <div>
                    <p style={sectionLabel}>VIỆC LÀM</p>
                    {VIEC_LAM_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={navLinkStyle}
                            onMouseEnter={hoverGreen}
                            onMouseLeave={hoverGray}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <p style={{ ...sectionLabel, margin: '16px 0 10px' }}>CÔNG TY</p>
                    <Link href="/cong-ty" style={navLinkStyle} onMouseEnter={hoverGreen} onMouseLeave={hoverGray}>
                        Danh sách công ty
                    </Link>
                    <Link
                        href="/cong-ty/pro"
                        style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '6px' }}
                        onMouseEnter={hoverGreen}
                        onMouseLeave={hoverGray}
                    >
                        Công ty <ProBadge />
                    </Link>
                </div>
                <div>
                    <p style={sectionLabel}>VIỆC LÀM THEO VỊ TRÍ</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                        {[...posCol1, ...posCol2].map((pos) => (
                            <Link
                                key={pos.id}
                                href={`/tim-viec-lam-${pos.slug}`}
                                style={navLinkStyle}
                                onMouseEnter={hoverGreen}
                                onMouseLeave={hoverGray}
                            >
                                Việc làm {pos.name}
                            </Link>
                        ))}
                    </div>
                </div>
                <div>
                    <p style={sectionLabel}>VIỆC LÀM THEO LĨNH VỰC</p>
                    {industries.map((ind) => (
                        <Link
                            key={ind.id}
                            href={`/tim-viec-lam-moi-nhat?company_field=${ind.id}&type_keyword=1&sba=1&saturday_status=0`}
                            style={navLinkStyle}
                            onMouseEnter={hoverGreen}
                            onMouseLeave={hoverGray}
                        >
                            Việc làm {ind.name}
                        </Link>
                    ))}
                </div>
            </div>
        ),
        'tao-cv': (
            <div
                style={{
                    position: 'absolute',
                    top: 'calc(100% - 2px)',
                    left: 0,
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
                    border: '1px solid #f0f0f0',
                    width: '520px',
                    padding: '24px',
                    zIndex: 200,
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <Link
                            href="/tao-cv"
                            style={{
                                ...sectionLabel,
                                color: GREEN,
                                textDecoration: 'none',
                                display: 'block',
                                marginBottom: '12px',
                            }}
                        >
                            Mẫu CV theo style →
                        </Link>
                        {TAO_CV_STYLE.map((i) => (
                            <Link
                                key={i.label}
                                href={i.href}
                                style={navLinkStyle}
                                onMouseEnter={hoverGreen}
                                onMouseLeave={hoverGray}
                            >
                                {i.label}
                            </Link>
                        ))}
                        <Link
                            href="/tao-cv"
                            style={{
                                ...sectionLabel,
                                color: GREEN,
                                textDecoration: 'none',
                                display: 'block',
                                margin: '14px 0 10px',
                            }}
                        >
                            Mẫu CV theo vị trí ứng tuyển →
                        </Link>
                        {TAO_CV_POSITION.map((i) => (
                            <Link
                                key={i.label}
                                href={i.href}
                                style={navLinkStyle}
                                onMouseEnter={hoverGreen}
                                onMouseLeave={hoverGray}
                            >
                                {i.label}
                            </Link>
                        ))}
                    </div>
                    <div>
                        <p style={sectionLabel}>QUẢN LÝ</p>
                        {TAO_CV_MANAGE.map((i) => (
                            <Link
                                key={i.label}
                                href={i.href}
                                style={navLinkStyle}
                                onMouseEnter={hoverGreen}
                                onMouseLeave={hoverGray}
                            >
                                {i.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        ),
        'cong-cu': (
            <div
                style={{
                    position: 'absolute',
                    top: 'calc(100% - 2px)',
                    left: 0,
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
                    border: '1px solid #f0f0f0',
                    width: '560px',
                    padding: '24px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px',
                    zIndex: 200,
                }}
            >
                <div>
                    <p style={sectionLabel}>KHÁM PHÁ VÀ NÂNG CẤP BẢN THÂN</p>
                    {KHAM_PHA_ITEMS.map((i) => (
                        <Link
                            key={i.label}
                            href={i.href}
                            style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '4px' }}
                            onMouseEnter={hoverGreen}
                            onMouseLeave={hoverGray}
                        >
                            {i.label}
                            {i.badge === 'Mới' && <NewBadge />}
                        </Link>
                    ))}
                </div>
                <div>
                    <p style={sectionLabel}>CÔNG CỤ</p>
                    {CONG_CU_ITEMS.map((i) => (
                        <Link
                            key={i.label}
                            href={i.href}
                            style={{ ...navLinkStyle, display: 'flex', alignItems: 'center', gap: '4px' }}
                            onMouseEnter={hoverGreen}
                            onMouseLeave={hoverGray}
                        >
                            {i.label}
                            {i.badge === 'Mới' && <NewBadge />}
                        </Link>
                    ))}
                </div>
            </div>
        ),
        'cam-nang': (
            <div
                style={{
                    position: 'absolute',
                    top: 'calc(100% - 2px)',
                    left: '-60px',
                    background: 'white',
                    borderRadius: '10px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
                    border: '1px solid #f0f0f0',
                    width: '480px',
                    padding: '24px',
                    zIndex: 200,
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '24px' }}>
                    <div>
                        {CAM_NANG_ITEMS.map((i) => (
                            <Link
                                key={i.label}
                                href={i.href}
                                style={navLinkStyle}
                                onMouseEnter={hoverGreen}
                                onMouseLeave={hoverGray}
                            >
                                {i.label}
                            </Link>
                        ))}
                    </div>
                    <div>
                        <p style={sectionLabel}>BÀI VIẾT NỔI BẬT</p>
                        {[
                            'Telesales là gì? Những công việc Telesales HOT nhất',
                            'TopCV Pro - Không gian tuyển dụng chuyên biệt',
                        ].map((t) => (
                            <Link
                                key={t}
                                href="#"
                                style={{ ...navLinkStyle, lineHeight: '1.5', marginBottom: '8px' }}
                                onMouseEnter={hoverGreen}
                                onMouseLeave={hoverGray}
                            >
                                {t}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        ),
    };

    return (
        <>
            {/* ══════════════ HEADER ══════════════ */}
            <header
                style={{
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                }}
            >
                <div style={{ height: '72px', display: 'flex', alignItems: 'center', paddingLeft: '16px' }}>
                    {/* Hamburger */}
                    {isMobile && (
                        <button
                            onClick={() => setMobileOpen(true)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#374151',
                                padding: '4px',
                                marginRight: '8px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Menu size={24} />
                        </button>
                    )}

                    {/* Logo */}
                    <Link
                        href="/"
                        style={{
                            textDecoration: 'none',
                            flexShrink: 0,
                            marginRight: '24px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Image
                            src={logo}
                            alt="TopCV"
                            height={64}
                            width={160}
                            style={{
                                objectFit: 'contain',
                                objectPosition: 'left center',
                                width: '160px',
                                height: '64px',
                            }}
                        />
                    </Link>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
                        {/* ── Desktop Nav ── */}
                        {!isMobile && (
                            <nav ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                {NAV_ITEMS.map((navItem) => (
                                    <div
                                        key={navItem.key}
                                        style={{ position: 'relative' }}
                                        onMouseEnter={() => openMenu(navItem.key)}
                                        onMouseLeave={closeMenu}
                                    >
                                        {/* ── Click label → navigate, chevron → dropdown ── */}
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <Link
                                                href={navItem.href}
                                                style={{
                                                    padding: '8px 4px 8px 12px',
                                                    fontSize: '15px',
                                                    fontWeight: '600',
                                                    color: activeMenu === navItem.key ? GREEN : '#374151',
                                                    textDecoration: 'none',
                                                    whiteSpace: 'nowrap',
                                                    lineHeight: '1',
                                                }}
                                            >
                                                {navItem.label}
                                            </Link>
                                            <span
                                                style={{
                                                    padding: '8px 8px 8px 2px',
                                                    color: activeMenu === navItem.key ? GREEN : '#374151',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'default',
                                                }}
                                            >
                                                <ChevronDown size={14} />
                                            </span>
                                        </div>

                                        {/* Dropdown */}
                                        {activeMenu === navItem.key && dropdownContent[navItem.key]}
                                    </div>
                                ))}

                                {/* TopCV Pro */}
                                <Link
                                    href="/pro"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '8px 12px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        textDecoration: 'none',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    TopCV <ProBadge />
                                </Link>
                            </nav>
                        )}

                        {/* ── Right side ── */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                flexShrink: 0,
                                marginLeft: 'auto',
                                paddingRight: '16px',
                            }}
                        >
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    padding: '4px',
                                    display: 'flex',
                                }}
                            >
                                <Bell size={20} />
                                <span
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        background: '#ef4444',
                                        color: 'white',
                                        fontSize: '9px',
                                        borderRadius: '50%',
                                        width: '14px',
                                        height: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                    }}
                                >
                                    3
                                </span>
                            </button>
                            <button
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                }}
                            >
                                <MessageSquare size={20} />
                            </button>
                            <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 4px' }} />
                            {renderAuthSection()}
                            {!isMobile && (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        paddingLeft: '12px',
                                        marginLeft: '4px',
                                        borderLeft: '1px solid #e5e7eb',
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: '11px',
                                            color: '#6b7280',
                                            whiteSpace: 'nowrap',
                                            lineHeight: '1.4',
                                        }}
                                    >
                                        Bạn là nhà tuyển dụng?
                                    </span>
                                    <Link
                                        href="/employer-login"
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: '#111827',
                                            textDecoration: 'none',
                                            whiteSpace: 'nowrap',
                                            lineHeight: '1.4',
                                        }}
                                    >
                                        Đăng tuyển ngay »
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ══════════════ OVERLAY ══════════════ */}
            {mobileOpen && (
                <div
                    onClick={() => setMobileOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 200,
                    }}
                />
            )}

            {/* ══════════════ MOBILE DRAWER ══════════════ */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: '320px',
                    maxWidth: '88vw',
                    background: 'white',
                    zIndex: 201,
                    transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                }}
            >
                {/* Drawer header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderBottom: '1px solid #f3f4f6',
                        flexShrink: 0,
                    }}
                >
                    {mobileView ? (
                        <button
                            onClick={() => setMobileView(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#111827',
                                padding: 0,
                            }}
                        >
                            <ChevronLeft size={20} />
                            {NAV_ITEMS.find((i) => i.key === mobileView)?.label}
                        </button>
                    ) : (
                        <Image src={logo} alt="TopCV" height={36} style={{ objectFit: 'contain' }} />
                    )}
                    <button
                        onClick={() => setMobileOpen(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            display: 'flex',
                        }}
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Drawer body */}
                <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                    {/* Root list */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            transform: mobileView ? 'translateX(-100%)' : 'translateX(0)',
                            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                            overflowY: 'auto',
                        }}
                    >
                        {NAV_ITEMS.map((item) => (
                            /* ── Tách: click text → navigate, click arrow → submenu ── */
                            <div
                                key={item.key}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #f3f4f6',
                                }}
                            >
                                <Link
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: '#111827',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {item.label}
                                </Link>
                                <button
                                    onClick={() => setMobileView(item.key)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        borderLeft: '1px solid #f3f4f6',
                                        padding: '16px 14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: '#9ca3af',
                                        flexShrink: 0,
                                    }}
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        ))}

                        {/* TopCV Pro */}
                        <Link
                            href="/pro"
                            onClick={() => setMobileOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '16px',
                                fontSize: '15px',
                                fontWeight: '600',
                                color: '#111827',
                                textDecoration: 'none',
                                borderBottom: '1px solid #f3f4f6',
                            }}
                        >
                            TopCV <ProBadge />
                        </Link>
                    </div>

                    {/* Submenu */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            transform: mobileView ? 'translateX(0)' : 'translateX(100%)',
                            transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1)',
                            overflowY: 'auto',
                            background: 'white',
                        }}
                    >
                        {mobileView && mobileSubContent[mobileView]}
                    </div>
                </div>

                {/* Drawer footer */}
                <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6', flexShrink: 0 }}>
                    <Link
                        href="/employer-login"
                        onClick={() => setMobileOpen(false)}
                        style={{
                            display: 'block',
                            textAlign: 'center',
                            padding: '12px',
                            borderRadius: '8px',
                            border: `1.5px solid ${GREEN}`,
                            color: GREEN,
                            fontSize: '14px',
                            fontWeight: '600',
                            textDecoration: 'none',
                        }}
                    >
                        Đăng tuyển & tìm hồ sơ
                    </Link>
                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginTop: '12px',
                            marginBottom: 0,
                        }}
                    >
                        ©2014 - 2025 TopCV Vietnam JSC. All rights reserved.
                    </p>
                </div>
            </div>
        </>
    );
}
