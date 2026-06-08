'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/axios';
import roboDash from '../assests/img/robo-dash.webp';

const GREEN = '#00b14f';
const GRAD = 'linear-gradient(83.78deg, #122235 1.64%, #1aa357 93.62%)';
const INDUSTRY_COLORS = ['#00b14f', '#3b82f6', '#f97316', '#06b6d4', '#a855f7', '#f59e0b'];

const fmtNum = n => (n ?? 0).toLocaleString('vi-VN');
const fmtDate = iso => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
const fmtShortDate = iso => { const [, mm, dd] = iso.split('-'); return `${dd}/${mm}`; };
const isNew = dateStr => new Date() - new Date(dateStr) < 24 * 3600 * 1000;

/* ── Stat block ── */
function StatBlock({ value, label }) {
    return (
        <div style={{ padding: '0 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '30px', fontWeight: '800', color: 'white', lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                {value != null ? fmtNum(value) : '---'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '5px' }}>{label}</div>
        </div>
    );
}

/* ── Section header ── */
function SectionHead({ title, right }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                    <polyline points="0,11 4,5.5 7,8.5 13,1" stroke={GREEN} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'white' }}>{title}</span>
            </div>
            {right}
        </div>
    );
}

/* ── SVG Line chart ── */
function LineChart({ data }) {
    if (!data || data.length < 2) return (
        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            Đang tải...
        </div>
    );

    const PL = 50, PR = 8, PT = 10, PB = 26, W = 360, H = 165;
    const cW = W - PL - PR, cH = H - PT - PB;
    const vals = data.map(d => d.total);
    const maxV = Math.max(...vals), minV = Math.min(...vals);
    const range = maxV - minV || 1;

    const toX = i => PL + (i / (data.length - 1)) * cW;
    const toY = v => PT + cH - ((v - minV) / range) * cH;
    const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.total) }));

    const linePath = pts.reduce((acc, p, i) => {
        if (i === 0) return `M${p.x.toFixed(1)},${p.y.toFixed(1)}`;
        const prev = pts[i - 1];
        const cx = ((prev.x + p.x) / 2).toFixed(1);
        return `${acc} C${cx},${prev.y.toFixed(1)} ${cx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }, '');

    const last = pts[pts.length - 1], first = pts[0];
    const areaPath = `${linePath} L${last.x.toFixed(1)},${(PT + cH).toFixed(1)} L${first.x.toFixed(1)},${(PT + cH).toFixed(1)} Z`;

    const fmtYLabel = v => {
        if (maxV >= 10000) return Math.round(v / 1000).toLocaleString('vi-VN') + '.000';
        return fmtNum(Math.round(v));
    };
    const yTicks = [0, 1, 2, 3].map(i => {
        const v = minV + (range / 3) * i;
        return { y: toY(v), label: fmtYLabel(v) };
    });

    const step = Math.max(1, Math.floor((data.length - 1) / 5));
    const xLabels = data
        .map((d, i) => ({ i, d }))
        .filter(({ i }) => i % step === 0 || i === data.length - 1)
        .map(({ i, d }) => ({ x: toX(i), label: fmtShortDate(d.date) }));

    return (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
            <defs>
                <linearGradient id="lgM" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GREEN} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
                </linearGradient>
            </defs>
            {yTicks.map((t, i) => (
                <line key={i} x1={PL} y1={t.y} x2={PL + cW} y2={t.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="3,3" />
            ))}
            <path d={areaPath} fill="url(#lgM)" />
            <path d={linePath} fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={last.x} cy={last.y} r="4" fill={GREEN} />
            <circle cx={last.x} cy={last.y} r="7" fill={GREEN} fillOpacity="0.2" />
            {yTicks.map((t, i) => (
                <text key={i} x={PL - 5} y={t.y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="Inter,sans-serif">{t.label}</text>
            ))}
            {xLabels.map((l, i) => (
                <text key={i} x={l.x} y={H - 3} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)" fontFamily="Inter,sans-serif">{l.label}</text>
            ))}
        </svg>
    );
}

/* ── Horizontal bar chart ── */
function BarChart({ data }) {
    if (!data || data.length === 0) return (
        <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
            Loading...
        </div>
    );

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div>
            {/* CSS animation avoids synchronous setState in effect */}
            <style>{`@keyframes barGrowM{from{width:0}to{width:var(--tw)}}`}</style>
            {data.map((item, i) => (
                <div key={i} style={{ marginBottom: '9px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ flex: 1, fontSize: '11px', color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'white', flexShrink: 0 }}>
                            {fmtNum(item.count)}
                        </span>
                    </div>
                    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{
                            '--tw': `${(item.count / maxCount) * 100}%`,
                            height: '100%',
                            background: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
                            borderRadius: '3px',
                            animation: `barGrowM 1s ease forwards`,
                            animationDelay: `${i * 0.08}s`,
                        }} />
                    </div>
                </div>
            ))}
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', marginTop: '10px' }}>
                {data.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length], flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name.length > 14 ? item.name.slice(0, 14) + '...' : item.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Mini job card ── */
function MiniJobCard({ job }) {
    const salary = () => {
        if (job.salaryType === 'negotiable') return 'Thương lượng';
        if (job.salaryType === 'upto' && job.salaryMax) return `Đến ${job.salaryMax / 1_000_000} triệu`;
        if (job.salaryMin && job.salaryMax) return `${job.salaryMin / 1_000_000} - ${job.salaryMax / 1_000_000} triệu`;
        return 'Thương lượng';
    };

    return (
        <div
            style={{ display: 'flex', gap: '8px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
            <div style={{
                width: '38px', height: '38px', borderRadius: '6px', flexShrink: 0,
                background: job.employer?.logoUrl ? 'white' : 'rgba(0,177,79,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
                {job.employer?.logoUrl
                    ? <Image unoptimized src={job.employer.logoUrl} alt="" width={38} height={38} style={{ objectFit: 'contain' }} />
                    : <span style={{ fontSize: '14px', fontWeight: '700', color: GREEN }}>{(job.employer?.companyName || 'C')[0].toUpperCase()}</span>
                }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {job.title}
                    </span>
                    {isNew(job.createdAt) && (
                        <span style={{ fontSize: '9px', fontWeight: '700', color: 'white', background: GREEN, borderRadius: '3px', padding: '1px 4px', flexShrink: 0, lineHeight: '14px' }}>Mới</span>
                    )}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {job.employer?.companyName}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: GREEN }}>
                    {salary()}
                    {job.provinceName && <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400', marginLeft: '4px' }}>• {job.provinceName}</span>}
                </div>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════ */
export default function JobMarket() {
    const [stats, setStats] = useState(null);
    const [growth, setGrowth] = useState([]);
    const [industryDemand, setIndustryDemand] = useState([]);
    const [latestJobs, setLatestJobs] = useState([]);

    useEffect(() => {
        api.get('/jobs/stats').then(r => setStats(r.data)).catch(() => {});
        api.get('/jobs/growth?days=30').then(r => setGrowth(r.data)).catch(() => {});
        api.get('/jobs/industry-demand').then(r => setIndustryDemand(r.data)).catch(() => {});
        api.get('/jobs?limit=3&sort=newest').then(r => setLatestJobs(r.data?.data || [])).catch(() => {});
    }, []);

    return (
        <div style={{ padding: '0 0 32px', fontFamily: 'Inter, -apple-system, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ background: GRAD, borderRadius: '12px', overflow: 'hidden', padding: '20px 24px' }}>

                    {/* ── Header ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'white', letterSpacing: '-0.3px' }}>
                            Thị trường việc làm hôm nay{' '}
                            <span style={{ color: GREEN }}>{stats ? fmtDate(stats.date) : ''}</span>
                        </h2>
                        {/* Icon top-right như TopCV */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.6 }}>
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="1.5" />
                                <circle cx="11" cy="11" r="3" fill="white" />
                                <line x1="11" y1="2" x2="11" y2="5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <line x1="11" y1="17" x2="11" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <line x1="2" y1="11" x2="5" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                <line x1="17" y1="11" x2="20" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path d="M5 3L10 7L5 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>

                    {/* ── Main 4-column grid ── */}
                    {/* Robot spans rows 1+2, stats in row 1, charts in row 2 */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '190px repeat(3, 1fr)',
                        gridTemplateRows: 'auto 1fr',
                        columnGap: '8px',
                        rowGap: '0',
                    }}>
                        {/* Robot — spans cả 2 rows */}
                        <div style={{
                            gridColumn: '1',
                            gridRow: '1 / 3',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            paddingBottom: '8px',
                        }}>
                            <Image
                                src={roboDash}
                                alt="robo"
                                width={190}
                                height={250}
                                style={{ objectFit: 'contain', width: '100%', height: 'auto', maxHeight: '260px' }}
                            />
                        </div>

                        {/* Stat row (row 1, cols 2-4) */}
                        <div style={{ gridColumn: '2', gridRow: '1' }}>
                            <StatBlock value={stats?.newToday} label="Việc làm 24h gần nhất" />
                        </div>
                        <div style={{ gridColumn: '3', gridRow: '1' }}>
                            <StatBlock value={stats?.totalActive} label="Việc làm đang tuyển" />
                        </div>
                        <div style={{ gridColumn: '4', gridRow: '1' }}>
                            <StatBlock value={stats?.totalCompanies} label="Công ty đang tuyển" />
                        </div>

                        {/* Charts row (row 2, cols 2-4) — add paddingTop to separate from stats */}
                        {/* Việc làm mới nhất */}
                        <div style={{ gridColumn: '2', gridRow: '2', paddingTop: '14px' }}>
                            <SectionHead title="Việc làm mới nhất" />
                            {latestJobs.length === 0 ? (
                                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', padding: '20px 0', textAlign: 'center' }}>Đang tải...</div>
                            ) : latestJobs.map(job => <MiniJobCard key={job.id} job={job} />)}
                            <a
                                href="/tim-viec-lam-moi-nhat"
                                style={{ display: 'block', marginTop: '10px', fontSize: '11px', color: GREEN, fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}
                            >
                                Xem tất cả →
                            </a>
                        </div>

                        {/* Growth chart */}
                        <div style={{ gridColumn: '3', gridRow: '2', paddingTop: '14px' }}>
                            <SectionHead title="Tăng trưởng cơ hội việc làm" />
                            <LineChart data={growth} />
                        </div>

                        {/* Industry demand */}
                        <div style={{ gridColumn: '4', gridRow: '2', paddingTop: '14px' }}>
                            <SectionHead
                                title="Nhu cầu tuyển dụng theo"
                                right={
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'rgba(255,255,255,0.12)', borderRadius: '5px',
                                        padding: '3px 8px', cursor: 'pointer',
                                    }}>
                                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>Ngành nghề</span>
                                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                            <path d="M1.5 3L4.5 6L7.5 3" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                }
                            />
                            <BarChart data={industryDemand} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
