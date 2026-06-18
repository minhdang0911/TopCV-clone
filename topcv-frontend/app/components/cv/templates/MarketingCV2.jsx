import { Mail, Phone, MapPin, Megaphone, TrendingUp, Star } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionTitle({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '4px', height: '20px', background: color, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111' }}>{title}</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>
    );
}

function ContactChip({ icon, text, color }) {
    if (!text) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.18)', borderRadius: '20px', padding: '3px 10px 3px 7px', fontSize: '10px', color: 'white', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', opacity: 0.85 }}>{icon}</span>
            <span style={{ wordBreak: 'break-all' }}>{text}</span>
        </div>
    );
}

// Extract 3 bold stat cards from experience descriptions or use defaults
function extractMetrics(experiences) {
    const defaults = [
        { label: 'ROAS', value: '4.8x' },
        { label: 'Followers', value: '500K+' },
        { label: 'Traffic', value: '+85%' },
    ];
    if (!experiences || experiences.length === 0) return defaults;

    const allText = experiences.map(e => e.description || '').join(' ');
    const patterns = [
        { regex: /ROAS\s*([\d.]+x?)/i, label: 'ROAS' },
        { regex: /([\d,.]+[KkMm+%x]+)\s*followers?/i, label: 'Followers' },
        { regex: /\+?([\d]+%)\s*(traffic|luu luong|traffic|truy cap)/i, label: 'Traffic' },
        { regex: /doanh\s*thu[^\d]*([\d,.]+[KkMm%\s]*(?:ty|trieu|k|m)?)/i, label: 'Doanh thu' },
        { regex: /([\d]+%)\s*(tang|growth|giam chi phi)/i, label: 'Tang truong' },
        { regex: /CTR[:\s]*([\d.]+%?)/i, label: 'CTR' },
    ];

    const found = [];
    for (const { regex, label } of patterns) {
        const m = allText.match(regex);
        if (m) found.push({ label, value: m[1] });
        if (found.length === 3) break;
    }
    while (found.length < 3) found.push(defaults[found.length]);
    return found.slice(0, 3);
}

export default function MarketingCV2({ content = {}, color = '#be123c', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
    const {
        personalInfo = {},
        objective = '',
        experiences = [],
        education = [],
        skills = [],
        certifications = [],
        languages = [],
        activities = [],
        sectionOrder = DEFAULT_ORDER,
        hiddenSections = [],
    } = content;

    const base = fontSize === 'small' ? 11 : fontSize === 'large' ? 13 : 12;
    const order = sectionOrder.length ? sectionOrder : DEFAULT_ORDER;
    const metrics = extractMetrics(experiences);

    const skillLevels = ['Moi bat dau', 'Co ban', 'Trung binh', 'Kha', 'Thanh thao'];

    return (
        <div style={{ width: '794px', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px` }}>

            {/* ── HEADER ── */}
            <div style={{ background: color, padding: '28px 36px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                    {/* Name + title left */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '26px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>
                            {personalInfo.fullName || 'Ho va Ten'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
                            <Megaphone size={13} color="rgba(255,255,255,0.7)" />
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>
                                {personalInfo.title || 'Chuyen Vien Marketing'}
                            </span>
                        </div>
                        {/* Contact chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            <ContactChip icon={<Phone size={10} />} text={personalInfo.phone} color={color} />
                            <ContactChip icon={<Mail size={10} />} text={personalInfo.email} color={color} />
                            <ContactChip icon={<MapPin size={10} />} text={personalInfo.address} color={color} />
                            <ContactChip icon={<FaLinkedin style={{ fontSize: '10px' }} />} text={personalInfo.linkedin} color={color} />
                        </div>
                    </div>

                    {/* Avatar right */}
                    <div style={{ flexShrink: 0 }}>
                        {personalInfo.avatarUrl ? (
                            <img
                                src={personalInfo.avatarUrl}
                                alt="avatar"
                                style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)' }}
                            />
                        ) : (
                            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '900', color: 'white', border: '3px solid rgba(255,255,255,0.35)' }}>
                                {(personalInfo.fullName || 'M').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── METRICS STRIP ── */}
            <div style={{ background: '#fff', borderBottom: `3px solid ${color}20`, display: 'flex', padding: '0 36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '16px', paddingTop: '12px', paddingBottom: '12px', borderRight: `1px solid #f3f4f6`, flexShrink: 0 }}>
                    <TrendingUp size={14} color={color} />
                    <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#9ca3af' }}>Thanh tich noi bat</span>
                </div>
                <div style={{ display: 'flex', flex: 1, padding: '0 0 0 16px' }}>
                    {metrics.map((m, i) => (
                        <div key={i} style={{ flex: 1, padding: '10px 12px', borderRight: i < 2 ? '1px solid #f3f4f6' : 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontSize: '20px', fontWeight: '900', color: color, lineHeight: 1, letterSpacing: '-0.5px' }}>{m.value}</div>
                            <div style={{ fontSize: '9px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '2px' }}>{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── BODY ── */}
            <div style={{ padding: '24px 36px 32px' }}>
                {order.map((key) => {
                    if (hiddenSections.includes(key)) return null;

                    if (key === 'objective' && objective) return (
                        <div key="objective" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Muc tieu nghe nghiep" color={color} />
                            <p style={{ margin: 0, color: '#374151', lineHeight: lineSpacing, whiteSpace: 'pre-wrap', fontSize: `${base}px` }}>{objective}</p>
                        </div>
                    );

                    if (key === 'experiences' && experiences.length > 0) return (
                        <div key="experiences" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Kinh nghiem lam viec" color={color} />
                            {experiences.map((exp, i) => (
                                <div key={exp.id || i} style={{ marginBottom: '16px', paddingLeft: '14px', borderLeft: `3px solid ${color}`, position: 'relative' }}>
                                    <div style={{ position: 'absolute', left: '-5px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: color, border: '2px solid white', outline: `1px solid ${color}` }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                        <div style={{ fontSize: `${base + 1}px`, fontWeight: '800', color: '#111' }}>{exp.position}</div>
                                        <div style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '10px', fontWeight: '500' }}>
                                            {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: `${base}px`, color: color, fontWeight: '700', marginBottom: '5px' }}>{exp.company}</div>
                                    {exp.description && (
                                        <div style={{ fontSize: `${base - 1}px`, color: '#4b5563', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'education' && education.length > 0) return (
                        <div key="education" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Hoc van" color={color} />
                            {education.map((edu, i) => (
                                <div key={edu.id || i} style={{ marginBottom: '12px', paddingLeft: '14px', borderLeft: `3px solid ${color}40` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                                        <div style={{ fontSize: '10px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '10px' }}>{edu.startDate} – {edu.endDate}</div>
                                    </div>
                                    <div style={{ fontSize: `${base - 1}px`, color: '#6b7280', marginTop: '1px' }}>
                                        {edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                                    </div>
                                    {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#9ca3af', marginTop: '2px' }}>{edu.description}</div>}
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'skills' && skills.length > 0) return (
                        <div key="skills" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Ky nang" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                                {skills.map((sk, i) => {
                                    const pct = Math.round(((sk.level || 3) / 5) * 100);
                                    return (
                                        <div key={sk.id || i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${color}12`, borderRadius: '20px', padding: '5px 12px 5px 8px', border: `1px solid ${color}25` }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, opacity: 0.7 + (pct / 500) }} />
                                            <span style={{ fontSize: '10px', fontWeight: '600', color: '#1f2937' }}>{sk.name}</span>
                                            <span style={{ fontSize: '9px', color: color, fontWeight: '700' }}>{pct}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );

                    if (key === 'languages' && languages.length > 0) return (
                        <div key="languages" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Ngoai ngu" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {languages.map((lang, i) => (
                                    <div key={lang.id || i} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', borderRadius: '8px', padding: '7px 14px', border: '1px solid #e5e7eb' }}>
                                        <Star size={11} color={color} fill={color} />
                                        <span style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#111' }}>{lang.name}</span>
                                        <span style={{ fontSize: `${base - 2}px`, color: '#6b7280' }}>{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'certifications' && certifications.length > 0) return (
                        <div key="certifications" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Chung chi" color={color} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {certifications.map((cert, i) => (
                                    <div key={cert.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 12px', background: '#fafafa', borderRadius: '6px', border: `1px solid ${color}20` }}>
                                        <div style={{ width: '3px', height: '100%', minHeight: '16px', background: color, borderRadius: '2px', flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{cert.name}</div>
                                            <div style={{ fontSize: `${base - 2}px`, color: '#9ca3af' }}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'activities' && activities.length > 0) return (
                        <div key="activities" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Hoat dong" color={color} />
                            {activities.map((act, i) => (
                                <div key={act.id || i} style={{ marginBottom: '10px', paddingLeft: '14px', borderLeft: `3px solid ${color}30` }}>
                                    <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                                        {act.role || act.name}
                                        {act.organization && <span style={{ fontWeight: '500', color: '#6b7280' }}> – {act.organization}</span>}
                                    </div>
                                    {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#4b5563', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>}
                                </div>
                            ))}
                        </div>
                    );

                    return null;
                })}
            </div>
        </div>
    );
}
