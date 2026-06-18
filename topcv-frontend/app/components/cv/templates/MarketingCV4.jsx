import { Mail, Phone, MapPin, Megaphone, TrendingUp, Star } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function LeftSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={12} color={color} />
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1f2937' }}>{title}</span>
            </div>
            <div style={{ height: '2px', marginTop: '5px', background: `linear-gradient(90deg, ${color}, transparent)`, borderRadius: '1px' }} />
        </div>
    );
}

function RightSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'white', opacity: 0.9 }}>{title}</div>
            <div style={{ height: '1px', marginTop: '5px', background: 'rgba(255,255,255,0.25)', borderRadius: '1px' }} />
        </div>
    );
}

export default function MarketingCV4({ content = {}, color = '#0ea5e9', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    // Left column gets: objective, experiences, activities
    const leftKeys = ['objective', 'experiences', 'activities'];
    // Right column gets: skills, education, languages, certifications
    const rightKeys = ['skills', 'education', 'languages', 'certifications'];

    const activeLeft = order.filter(k => leftKeys.includes(k) && !hiddenSections.includes(k));
    const activeRight = order.filter(k => rightKeys.includes(k) && !hiddenSections.includes(k));

    // darken color for right sidebar background
    const darkerColor = color; // we use the color + opacity overlay

    return (
        <div style={{ width: '794px', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px`, overflow: 'hidden' }}>

            {/* ── DIAGONAL HEADER ── */}
            <div style={{ position: 'relative', marginBottom: '-2px' }}>
                {/* Colored bg with angled bottom */}
                <div style={{
                    background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                    clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0 100%)',
                    padding: '30px 36px 54px',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        {/* Avatar circle */}
                        <div style={{ flexShrink: 0 }}>
                            {personalInfo.avatarUrl ? (
                                <img
                                    src={personalInfo.avatarUrl}
                                    alt="avatar"
                                    style={{ width: '86px', height: '86px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                                />
                            ) : (
                                <div style={{ width: '86px', height: '86px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: 'white', border: '3px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                                    {(personalInfo.fullName || 'M').charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Name + title + contact */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '24px', fontWeight: '900', color: 'white', letterSpacing: '-0.3px', lineHeight: 1.15, marginBottom: '3px', textShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                                {personalInfo.fullName || 'Ho va Ten'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '12px' }}>
                                <Megaphone size={12} color="rgba(255,255,255,0.75)" />
                                <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.9)', letterSpacing: '0.5px' }}>
                                    {personalInfo.title || 'Chuyen Vien Marketing'}
                                </span>
                            </div>
                            {/* Contact — two rows */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 18px' }}>
                                {personalInfo.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Phone size={10} color="rgba(255,255,255,0.75)" />
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{personalInfo.phone}</span>
                                    </div>
                                )}
                                {personalInfo.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Mail size={10} color="rgba(255,255,255,0.75)" />
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '500', wordBreak: 'break-all' }}>{personalInfo.email}</span>
                                    </div>
                                )}
                                {personalInfo.address && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <MapPin size={10} color="rgba(255,255,255,0.75)" />
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{personalInfo.address}</span>
                                    </div>
                                )}
                                {personalInfo.linkedin && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <FaLinkedin style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }} />
                                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '500', wordBreak: 'break-all' }}>{personalInfo.linkedin}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── BODY: two equal columns ── */}
            <div style={{ display: 'flex', minHeight: '600px' }}>

                {/* LEFT column — white bg, experiences/objective/activities */}
                <div style={{ flex: '0 0 50%', padding: '20px 24px 32px 36px', background: background }}>
                    {activeLeft.map((key) => {
                        if (key === 'objective' && objective) return (
                            <div key="objective" style={{ marginBottom: '20px' }}>
                                <LeftSectionTitle title="Muc tieu nghe nghiep" color={color} />
                                <p style={{ margin: 0, color: '#374151', lineHeight: lineSpacing, whiteSpace: 'pre-wrap', fontSize: `${base}px` }}>{objective}</p>
                            </div>
                        );

                        if (key === 'experiences' && experiences.length > 0) return (
                            <div key="experiences" style={{ marginBottom: '20px' }}>
                                <LeftSectionTitle title="Kinh nghiem lam viec" color={color} />
                                {experiences.map((exp, i) => (
                                    <div key={exp.id || i} style={{ marginBottom: '14px', display: 'flex', gap: '10px' }}>
                                        {/* Timeline */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '3px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white', border: `2px solid ${color}`, flexShrink: 0 }} />
                                            {i < experiences.length - 1 && <div style={{ width: '2px', flex: 1, background: `${color}25`, minHeight: '20px', marginTop: '3px' }} />}
                                        </div>
                                        <div style={{ flex: 1, paddingBottom: i < experiences.length - 1 ? '8px' : 0 }}>
                                            <div style={{ fontSize: `${base}px`, fontWeight: '800', color: '#111', lineHeight: 1.3 }}>{exp.position}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <div style={{ fontSize: `${base - 1}px`, color, fontWeight: '600' }}>{exp.company}</div>
                                                <div style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '8px', fontWeight: '500' }}>
                                                    {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                                                </div>
                                            </div>
                                            {exp.description && <div style={{ fontSize: `${base - 1}px`, color: '#4b5563', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'activities' && activities.length > 0) return (
                            <div key="activities" style={{ marginBottom: '20px' }}>
                                <LeftSectionTitle title="Hoat dong" color={color} />
                                {activities.map((act, i) => (
                                    <div key={act.id || i} style={{ marginBottom: '10px', paddingLeft: '12px', borderLeft: `2px solid ${color}40` }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                                            {act.role || act.name}
                                            {act.organization && <span style={{ fontWeight: '500', color: '#6b7280' }}> — {act.organization}</span>}
                                        </div>
                                        {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#4b5563', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>}
                                    </div>
                                ))}
                            </div>
                        );

                        return null;
                    })}
                </div>

                {/* RIGHT column — dark color bg, skills/education/languages/certs */}
                <div style={{ flex: '0 0 50%', padding: '20px 28px 32px 24px', background: `linear-gradient(180deg, ${color}f0 0%, ${color}d8 100%)` }}>
                    {activeRight.map((key) => {
                        if (key === 'skills' && skills.length > 0) return (
                            <div key="skills" style={{ marginBottom: '20px' }}>
                                <RightSectionTitle title="Ky nang" color={color} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {skills.map((sk, i) => {
                                        const pct = ((sk.level || 3) / 5) * 100;
                                        return (
                                            <div key={sk.id || i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: '600', color: 'white' }}>{sk.name}</span>
                                                    <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)', fontWeight: '700' }}>{Math.round(pct)}%</span>
                                                </div>
                                                <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                                                    <div style={{ height: '100%', width: `${pct}%`, background: 'white', borderRadius: '2px', opacity: 0.85 }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );

                        if (key === 'education' && education.length > 0) return (
                            <div key="education" style={{ marginBottom: '20px' }}>
                                <RightSectionTitle title="Hoc van" color={color} />
                                {education.map((edu, i) => (
                                    <div key={edu.id || i} style={{ marginBottom: '12px', padding: '10px 12px', background: 'rgba(255,255,255,0.12)', borderRadius: '6px', borderLeft: '3px solid rgba(255,255,255,0.5)' }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: 'white', lineHeight: 1.3 }}>{edu.school}</div>
                                        <div style={{ fontSize: `${base - 1}px`, color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
                                            {edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}
                                        </div>
                                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{edu.startDate} – {edu.endDate}</div>
                                        {edu.description && <div style={{ fontSize: `${base - 2}px`, color: 'rgba(255,255,255,0.6)', marginTop: '3px', lineHeight: lineSpacing }}>{edu.description}</div>}
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'languages' && languages.length > 0) return (
                            <div key="languages" style={{ marginBottom: '20px' }}>
                                <RightSectionTitle title="Ngoai ngu" color={color} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {languages.map((lang, i) => (
                                        <div key={lang.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                                <Star size={10} color="rgba(255,255,255,0.7)" fill="rgba(255,255,255,0.7)" />
                                                <span style={{ fontSize: '10px', fontWeight: '700', color: 'white' }}>{lang.name}</span>
                                            </div>
                                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', fontWeight: '500' }}>{lang.level}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                        if (key === 'certifications' && certifications.length > 0) return (
                            <div key="certifications" style={{ marginBottom: '20px' }}>
                                <RightSectionTitle title="Chung chi" color={color} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {certifications.map((cert, i) => (
                                        <div key={cert.id || i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: 'white', lineHeight: 1.4 }}>{cert.name}</div>
                                            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)', marginTop: '2px' }}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
