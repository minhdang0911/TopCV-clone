'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Image from 'next/image';
import api from '@/lib/axios';
import robo from '../assests/img/robo.webp';
import beforeBg from '../assests/img/section_header_before_bg.png';
import afterBg from '../assests/img/section_header_after_bg.png';

const GREEN = '#00b14f';
const PROVINCE_API_V1 = 'https://provinces.open-api.vn/api/v1';
const PROVINCE_API_V2 = 'https://provinces.open-api.vn/api/v2';

const QUICK_CHIPS = [
    'Nhân viên kinh doanh',
    'Nhan vien ky thuat han dien tu',
    'Nhân viên kỹ thuật hàn',
    'Thực tập sinh software',
    'Nhân viên livestream',
    'Fullstack developer',
];

/* ── Checkbox dùng chung ── */
function Checkbox({ checked }) {
    return (
        <div style={{
            width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0,
            border: `2px solid ${checked ? GREEN : '#d1d5db'}`,
            background: checked ? GREEN : 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
        }}>
            {checked && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
        </div>
    );
}

/* ── Province Dropdown ── */
function ProvinceDropdown({ onClose, onApply, anchorRect, initialProvinces = {} }) {
    // 'v1' = quận/huyện cũ, 'v2' = phường/xã sau 1/7/2025
    const [tab, setTab] = useState('v1');
    const apiBase = tab === 'v2' ? PROVINCE_API_V2 : PROVINCE_API_V1;
    const subLabel = tab === 'v2' ? 'phường/xã' : 'quận/huyện';

    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [activeCode, setActiveCode] = useState(null);
    // undefined = chưa fetch, null = đang fetch, [] hoặc [...] = đã load
    const [districtsByCode, setDistrictsByCode] = useState({});
    const fetchingRef = useRef(new Set());

    const [selected, setSelected] = useState(() => {
        const s = {};
        for (const [code, v] of Object.entries(initialProvinces)) {
            s[code] = { name: v.name, districts: v.districts, sel: new Set(v.districts.map(d => d.code)) };
        }
        return s;
    });

    // Load danh sách tỉnh khi mount hoặc đổi tab
    useEffect(() => {
        setProvinces([]);
        setLoading(true);
        setDistrictsByCode({});
        setActiveCode(null);
        fetchingRef.current.clear();

        fetch(`${apiBase}/p/`)
            .then(r => r.json())
            .then(data => {
                setProvinces(data);
                if (data.length) setActiveCode(String(data[0].code));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

    // Load quận/huyện khi chọn tỉnh — dùng ref để tránh gọi setState sync trong effect
    useEffect(() => {
        if (!activeCode) return;
        if (districtsByCode[activeCode] !== undefined) return; // đã load hoặc đang load
        if (fetchingRef.current.has(activeCode)) return;

        fetchingRef.current.add(activeCode);
        // Đánh dấu null = đang fetch (không gọi setState trực tiếp trong effect body)
        setDistrictsByCode(prev => ({ ...prev, [activeCode]: null }));

        fetch(`${apiBase}/p/${activeCode}?depth=2`)
            .then(r => r.json())
            .then(data => {
                const subs = data.districts || data.wards || [];
                fetchingRef.current.delete(activeCode);
                setDistrictsByCode(prev => ({ ...prev, [activeCode]: subs }));
            })
            .catch(() => {
                fetchingRef.current.delete(activeCode);
                setDistrictsByCode(prev => ({ ...prev, [activeCode]: [] }));
            });
    }, [activeCode, apiBase]); // eslint-disable-line react-hooks/exhaustive-deps

    // Derive loading state từ map thay vì setState sync
    const isDistrictLoading = !!activeCode && districtsByCode[activeCode] === null;
    const activeDistricts = activeCode ? (districtsByCode[activeCode] ?? []) : [];
    const activeProvinceName = provinces.find(p => String(p.code) === activeCode)?.name || '';

    const isProvinceChecked = code => !!selected[code];
    const isDistrictChecked = (pCode, dCode) => selected[pCode]?.sel?.has(dCode) ?? false;
    const isAllChecked = pCode => {
        const s = selected[pCode];
        if (!s) return false;
        const dists = districtsByCode[pCode] || [];
        return dists.length > 0 && dists.every(d => s.sel.has(d.code));
    };

    const toggleProvince = (code, name) => {
        setSelected(prev => {
            const next = { ...prev };
            if (next[code]) {
                delete next[code];
            } else {
                const dists = districtsByCode[code] || [];
                next[code] = { name, districts: dists, sel: new Set(dists.map(d => d.code)) };
            }
            return next;
        });
        setActiveCode(code);
    };

    const toggleDistrict = (pCode, dCode) => {
        setSelected(prev => {
            const next = { ...prev };
            if (!next[pCode]) {
                const name = provinces.find(p => String(p.code) === pCode)?.name || '';
                next[pCode] = { name, districts: districtsByCode[pCode] || [], sel: new Set([dCode]) };
            } else {
                const newSel = new Set(next[pCode].sel);
                if (newSel.has(dCode)) newSel.delete(dCode);
                else newSel.add(dCode);
                if (newSel.size === 0) {
                    delete next[pCode];
                } else {
                    next[pCode] = { ...next[pCode], sel: newSel, districts: districtsByCode[pCode] || [] };
                }
            }
            return next;
        });
    };

    const toggleAll = pCode => {
        const dists = districtsByCode[pCode] || [];
        setSelected(prev => {
            const next = { ...prev };
            if (isAllChecked(pCode)) {
                delete next[pCode];
            } else {
                const name = provinces.find(p => String(p.code) === pCode)?.name || '';
                next[pCode] = { name, districts: dists, sel: new Set(dists.map(d => d.code)) };
            }
            return next;
        });
    };

    const handleApply = () => {
        const result = {};
        for (const [code, v] of Object.entries(selected)) {
            const dists = districtsByCode[code] || v.districts;
            result[code] = { name: v.name, districts: dists, allSelected: v.sel.size === dists.length };
        }
        onApply(result);
        onClose();
    };

    const filtered = searchText
        ? provinces.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()))
        : provinces;

    if (!anchorRect) return null;

    const top = anchorRect.bottom + 6;
    const left = Math.min(anchorRect.left, window.innerWidth - 568);

    const TabBtn = ({ value, label, isNew: showNew }) => {
        const active = tab === value;
        return (
            <button
                onClick={() => setTab(value)}
                style={{
                    paddingBottom: '8px', paddingTop: '4px', background: 'none', border: 'none',
                    borderBottom: `2px solid ${active ? GREEN : 'transparent'}`,
                    color: active ? GREEN : '#6b7280', fontSize: '13px',
                    fontWeight: active ? '600' : '400', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                }}
            >
                {active ? (
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: `2px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: GREEN }} />
                    </span>
                ) : (
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #d1d5db', flexShrink: 0 }} />
                )}
                {label}
                {showNew && <span style={{ fontSize: '10px', background: GREEN, color: 'white', borderRadius: '4px', padding: '1px 5px', fontWeight: '700' }}>Mới</span>}
            </button>
        );
    };

    return (
        <div style={{
            position: 'fixed', top, left,
            width: '560px', maxWidth: 'calc(100vw - 24px)',
            background: 'white', border: '1px solid #e5e7eb',
            borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
            zIndex: 99999, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
            {/* Tabs */}
            <div style={{ padding: '10px 14px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '16px', flexShrink: 0 }}>
                <TabBtn value="v1" label="Tỉnh, Quận/huyện cũ" />
                <TabBtn value="v2" label="Tỉnh, Phường/xã sau 1/7/2025" isNew />
            </div>

            {/* Body: 2 columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '320px' }}>
                {/* Left: Tỉnh */}
                <div style={{ borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 10px', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '5px 10px' }}>
                            <Search size={12} color="#9ca3af" />
                            <input
                                type="text"
                                placeholder="Nhập Tỉnh/Thành phố"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '12px', color: '#111827' }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px 8px', minHeight: 0 }}>
                        {loading ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>Đang tải...</div>
                        ) : filtered.map(p => {
                            const code = String(p.code);
                            const isActive = activeCode === code;
                            const isChecked = isProvinceChecked(code);
                            return (
                                <div
                                    key={p.code}
                                    onClick={() => setActiveCode(code)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '5px', cursor: 'pointer', background: isActive ? '#f0fdf4' : 'transparent' }}
                                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div onClick={e => { e.stopPropagation(); toggleProvince(code, p.name); }}>
                                        <Checkbox checked={isChecked} />
                                    </div>
                                    <span style={{ flex: 1, fontSize: '13px', color: isActive ? GREEN : '#374151', fontWeight: isActive ? '600' : '400' }}>
                                        {p.name}
                                    </span>
                                    {selected[code] && (
                                        <span style={{ fontSize: '11px', color: GREEN, fontWeight: '600', flexShrink: 0 }}>
                                            {selected[code].sel.size}
                                        </span>
                                    )}
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                        <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke={isActive ? GREEN : '#d1d5db'} strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Quận/huyện hoặc Phường/xã */}
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid #f5f5f5', flexShrink: 0 }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                            {activeProvinceName || `Chọn tỉnh để xem ${subLabel}`}
                        </span>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px 8px', minHeight: 0 }}>
                        {isDistrictLoading ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>Đang tải...</div>
                        ) : activeDistricts.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '12px' }}>
                                {activeCode ? `Không có ${subLabel}` : `Chọn tỉnh để xem ${subLabel}`}
                            </div>
                        ) : (
                            <>
                                <div
                                    onClick={() => activeCode && toggleAll(activeCode)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '5px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', marginBottom: '2px' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Checkbox checked={!!(activeCode && isAllChecked(activeCode))} />
                                    <span style={{ fontSize: '13px', color: '#111827', fontWeight: '600' }}>Tất cả</span>
                                </div>
                                {activeDistricts.map(d => (
                                    <div
                                        key={d.code}
                                        onClick={() => activeCode && toggleDistrict(activeCode, d.code)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', borderRadius: '5px', cursor: 'pointer' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Checkbox checked={!!(activeCode && isDistrictChecked(activeCode, d.code))} />
                                        <span style={{ fontSize: '13px', color: '#374151' }}>{d.name}</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 14px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <button onClick={() => setSelected({})} style={{ background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', cursor: 'pointer', fontWeight: '500' }}>
                    Bỏ chọn tất cả
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: 'white', fontSize: '13px', color: '#374151', cursor: 'pointer', fontWeight: '500' }}>
                        Hủy
                    </button>
                    <button onClick={handleApply} style={{ padding: '7px 20px', borderRadius: '6px', border: 'none', background: GREEN, color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                        Áp dụng
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Stats Box ── */
function StatsBox() {
    const [stats, setStats] = useState(null);
    const [hovered, setHovered] = useState(false);

    useEffect(() => {
        api.get('/jobs/stats')
            .then(r => setStats(r.data))
            .catch(() => {});
    }, []);

    const fmt = iso => {
        const d = new Date(iso);
        return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const TrendIcon = stats?.trend === 'up' ? TrendingUp : stats?.trend === 'down' ? TrendingDown : Minus;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: 'rgba(0,35,18,0.6)',
                border: '1px solid rgba(0,177,79,0.22)',
                borderRadius: '10px',
                padding: '10px 16px 10px 14px',
                display: 'flex',
                alignItems: 'center',
                marginTop: '16px',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                minHeight: '52px',
                gap: '0',
                flexWrap: 'nowrap',
                overflow: 'hidden',
            }}
        >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: GREEN, flexShrink: 0, marginRight: '10px', boxShadow: `0 0 6px ${GREEN}` }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: '500', whiteSpace: 'nowrap', marginRight: '6px' }}>
                Thị trường việc làm hôm nay
            </span>
            {stats && (
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#4ade80', whiteSpace: 'nowrap', marginRight: '16px' }}>
                    {fmt(stats.date)}
                </span>
            )}
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', marginRight: '16px', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', marginRight: '6px' }}>Việc làm đang tuyển</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginRight: '4px' }}>
                {stats ? stats.totalActive.toLocaleString('vi-VN') : '---'}
            </span>
            <TrendIcon size={14} color={GREEN} style={{ marginRight: '16px', flexShrink: 0 }} />
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.15)', marginRight: '16px', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', marginRight: '6px' }}>Việc làm mới hôm nay</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: 'white' }}>
                {stats ? stats.newToday.toLocaleString('vi-VN') : '---'}
            </span>
            <div style={{ flex: 1 }} />
            <span style={{
                fontSize: '12px', fontWeight: '600',
                color: hovered ? '#4ade80' : 'rgba(255,255,255,0.4)',
                whiteSpace: 'nowrap', marginRight: '12px',
                transition: 'color 0.2s', flexShrink: 0,
            }}>
                Xem thêm →
            </span>
            <Image
                src={robo} alt="robo" width={56} height={56}
                style={{
                    objectFit: 'contain', flexShrink: 0,
                    transform: hovered ? 'scale(1.08) translateY(-3px)' : 'scale(1)',
                    transition: 'transform 0.25s ease',
                }}
            />
        </div>
    );
}

function buildProvinceLabel(selectedProvinces) {
    const keys = Object.keys(selectedProvinces);
    if (keys.length === 0) return 'Địa điểm';
    const first = selectedProvinces[keys[0]];
    let label = `${first.name} (${first.districts.length})`;
    if (keys.length > 1) label += ` +${keys.length - 1}`;
    return label;
}

/* ════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════ */
export default function HomeSearch() {
    const router = useRouter();

    const [keyword, setKeyword] = useState('');
    const [selectedProvinces, setSelectedProvinces] = useState({});
    const [showProvince, setShowProvince] = useState(false);
    const [provinceRect, setProvinceRect] = useState(null);

    const provinceBtnRef = useRef(null);
    const provinceDropRef = useRef(null);

    useEffect(() => {
        const handler = e => {
            const t = e.target;
            if (
                provinceBtnRef.current && !provinceBtnRef.current.contains(t) &&
                provinceDropRef.current && !provinceDropRef.current.contains(t)
            ) {
                setShowProvince(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const openProvince = () => {
        if (provinceBtnRef.current) setProvinceRect(provinceBtnRef.current.getBoundingClientRect());
        setShowProvince(v => !v);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        params.set('page', '1');
        if (keyword.trim()) params.set('search', keyword.trim());
        const codes = Object.keys(selectedProvinces);
        if (codes.length > 0) {
            params.set('provinceCode', codes[0]);
            params.set('provinceName', selectedProvinces[codes[0]].name);
        }
        router.push(`/tim-viec-lam-moi-nhat?${params.toString()}`);
    };

    const provinceLabel = buildProvinceLabel(selectedProvinces);
    const hasProvince = Object.keys(selectedProvinces).length > 0;

    return (
        <>
            {/* Province dropdown portal */}
            {showProvince && provinceRect && (
                <div
                    ref={provinceDropRef}
                    style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}
                >
                    <div style={{ pointerEvents: 'auto' }}>
                        <ProvinceDropdown
                            onClose={() => setShowProvince(false)}
                            onApply={setSelectedProvinces}
                            anchorRect={provinceRect}
                            initialProvinces={selectedProvinces}
                        />
                    </div>
                </div>
            )}

            {/* ── Hero Section ── */}
            <section style={{
                position: 'relative',
                padding: '32px 20px 28px',
                fontFamily: 'Inter, -apple-system, sans-serif',
                background: `
                    linear-gradient(180deg, rgba(0,28,20,0.5) 0%, rgba(0,28,20,0) 100%),
                    linear-gradient(90deg, #008060 21.86%, #2bab60 78.13%)
                `,
                backgroundRepeat: 'no-repeat',
                backgroundSize: '100% 100%',
                overflow: 'hidden',
            }}>
                {/* Decorative left */}
                <div style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '317px', height: '100%', zIndex: 1, pointerEvents: 'none',
                    backgroundImage: `url(${beforeBg.src})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'calc(100% + 23px)',
                    backgroundPosition: 'left top',
                }} />
                {/* Decorative right */}
                <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '317px', height: '100%', zIndex: 1, pointerEvents: 'none',
                    backgroundImage: `url(${afterBg.src})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'calc(100% - 120px)',
                    backgroundPosition: '100% top',
                }} />

                <div style={{ maxWidth: '780px', margin: '0 auto', position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    {/* Title */}
                    <h1 style={{
                        color: '#00b14f', fontSize: '27px', fontWeight: '700',
                        lineHeight: '1.35', margin: '0 auto 10px',
                    }}>
                        Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
                    </h1>
                    <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', margin: '0 0 20px', fontWeight: '400' }}>
                        Tiếp cận <strong style={{ color: 'white', fontWeight: '700' }}>60.000+</strong> tin tuyển dụng
                        việc làm mỗi ngày từ hàng nghìn doanh nghiệp uy tín tại Việt Nam
                    </p>

                    {/* Search bar */}
                    <div style={{
                        display: 'flex', background: 'white', borderRadius: '8px',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.22)', height: '52px',
                        overflow: 'hidden',
                    }}>
                        {/* Keyword */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 14px', gap: '8px', minWidth: 0 }}>
                            <input
                                type="text"
                                placeholder="Vị trí tuyển dụng, tên công ty"
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                style={{
                                    flex: 1, border: 'none', outline: 'none',
                                    fontSize: '14px', color: '#111827', background: 'transparent', minWidth: 0,
                                }}
                            />
                            {keyword && (
                                <button
                                    onClick={() => setKeyword('')}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px', flexShrink: 0 }}
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div style={{ width: '1px', background: '#e5e7eb', alignSelf: 'center', height: '28px', flexShrink: 0 }} />

                        {/* Location button */}
                        <button
                            ref={provinceBtnRef}
                            onClick={openProvince}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '0 14px', height: '52px',
                                background: 'none', border: 'none',
                                cursor: 'pointer', fontSize: '13.5px',
                                color: hasProvince ? '#111827' : '#9ca3af',
                                whiteSpace: 'nowrap', minWidth: '155px', maxWidth: '220px', flexShrink: 0,
                            }}
                        >
                            <MapPin size={14} color={hasProvince ? GREEN : '#9ca3af'} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'left', fontSize: '14px' }}>
                                {provinceLabel}
                            </span>
                            {hasProvince ? (
                                <span
                                    onClick={e => { e.stopPropagation(); setSelectedProvinces({}); }}
                                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                                >
                                    <X size={13} color="#9ca3af" />
                                </span>
                            ) : (
                                <ChevronDown
                                    size={13} color="#9ca3af"
                                    style={{ transform: showProvince ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}
                                />
                            )}
                        </button>

                        {/* Search button */}
                        <button
                            onClick={handleSearch}
                            style={{
                                background: GREEN, color: 'white', border: 'none',
                                padding: '0 26px', fontSize: '14px', fontWeight: '700',
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                gap: '7px', height: '52px', flexShrink: 0, whiteSpace: 'nowrap',
                                transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#009940'}
                            onMouseLeave={e => e.currentTarget.style.background = GREEN}
                        >
                            <Search size={15} />
                            Tìm kiếm
                        </button>
                    </div>

                    {/* Quick chips */}
                    <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '8px',
                        marginTop: '14px', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', fontWeight: '500' }}>
                            Gợi ý:
                        </span>
                        {QUICK_CHIPS.map(chip => (
                            <button
                                key={chip}
                                onClick={() => router.push(`/tim-viec-lam-moi-nhat?search=${encodeURIComponent(chip)}&page=1`)}
                                style={{
                                    padding: '5px 13px', borderRadius: '20px',
                                    border: '1px solid rgba(255,255,255,0.35)',
                                    background: 'rgba(255,255,255,0.12)',
                                    color: 'rgba(255,255,255,0.95)',
                                    fontSize: '12.5px', cursor: 'pointer',
                                    whiteSpace: 'nowrap', backdropFilter: 'blur(4px)',
                                    transition: 'all 0.15s', fontFamily: 'inherit', fontWeight: '400',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.22)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
                                }}
                            >
                                {chip}
                            </button>
                        ))}
                    </div>

                    <StatsBox />
                </div>
            </section>
        </>
    );
}
