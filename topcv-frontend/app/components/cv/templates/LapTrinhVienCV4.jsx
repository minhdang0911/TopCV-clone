import { Mail, Phone, MapPin, Code2, Github } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

// Sections that go in the right column
const RIGHT_SECTIONS = ['skills', 'education', 'certifications', 'languages'];
// Sections that go in the left column
const LEFT_SECTIONS = ['objective', 'experiences', 'activities'];

function darkenColor(hex, amount = 40) {
    // Simple darkening: parse hex and subtract amount from each channel
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const num = parseInt(h, 16);
    let r = Math.max(0, (num >> 16) - amount);
    let g = Math.max(0, ((num >> 8) & 0xff) - amount);
    let b = Math.max(0, (num & 0xff) - amount);
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

function LeftSectionTitle({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '20px' }}>
            <span style={{
                fontSize: '10px', fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                color: color,
            }}>{title}</span>
            <div style={{ flex: 1, height: '1px', background: `${color}30` }} />
        </div>
    );
}

function RightSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px', marginTop: '18px' }}>
            <span style={{
                fontSize: '10px', fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: '1.5px',
                color: 'rgba(255,255,255,0.75)',
                display: 'block',
                paddingBottom: '6px',
                borderBottom: `1px solid rgba(255,255,255,0.15)`,
            }}>{title}</span>
        </div>
    );
}

function TechTag({ name, color }) {
    return (
        <span style={{
            display: 'inline-block',
            padding: '2px 8px',
            background: `${color}15`,
            color: color,
            borderRadius: '3px',
            fontSize: '9.5px',
            fontWeight: '600',
            border: `1px solid ${color}30`,
            margin: '0 4px 4px 0',
        }}>{name}</span>
    );
}

export default function LapTrinhVienCV4({ content = {}, color = '#0ea5e9', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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
    const darker = darkenColor(color, 45);

    // Partition order into left and right columns, preserving user order within each
    const leftOrder = order.filter(k => LEFT_SECTIONS.includes(k));
    const rightOrder = order.filter(k => RIGHT_SECTIONS.includes(k));

    const levelLabels = { 1: 'Beginner', 2: 'Elementary', 3: 'Intermediate', 4: 'Advanced', 5: 'Expert' };
    const levelPct = { 1: '20%', 2: '40%', 3: '60%', 4: '80%', 5: '100%' };

    return (
        <div style={{
            width: '794px',
            minHeight: '100%',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            background,
            fontSize: `${base}px`,
            color: '#222',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* ── Gradient Header ── */}
            <div style={{
                background: `linear-gradient(135deg, ${darker} 0%, ${color} 60%, ${color}cc 100%)`,
                padding: '28px 32px 22px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                    {/* Left: avatar + name block */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        {personalInfo.avatarUrl ? (
                            <img src={personalInfo.avatarUrl} alt="avatar" style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid rgba(255,255,255,0.5)',
                                flexShrink: 0,
                            }} />
                        ) : (
                            <div style={{
                                width: '72px', height: '72px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.2)',
                                border: '3px solid rgba(255,255,255,0.5)',
                                flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '26px', fontWeight: '800', color: 'white',
                            }}>
                                {(personalInfo.fullName || 'D').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div style={{
                                fontSize: '22px', fontWeight: '800', color: 'white',
                                letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: '4px',
                            }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: '600',
                                marginBottom: '10px',
                            }}>
                                <Code2 size={11} color="rgba(255,255,255,0.7)" />
                                {personalInfo.title || 'Software Developer'}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {personalInfo.email && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
                                        <Mail size={9} />{personalInfo.email}
                                    </span>
                                )}
                                {personalInfo.phone && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
                                        <Phone size={9} />{personalInfo.phone}
                                    </span>
                                )}
                                {personalInfo.address && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
                                        <MapPin size={9} />{personalInfo.address}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: github / linkedin badges */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        {personalInfo.github && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '20px', padding: '5px 12px',
                                fontSize: '10px', color: 'white',
                            }}>
                                <FaGithub style={{ fontSize: '11px' }} />
                                {personalInfo.github}
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '20px', padding: '5px 12px',
                                fontSize: '10px', color: 'white',
                            }}>
                                <FaLinkedin style={{ fontSize: '11px' }} />
                                {personalInfo.linkedin}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Two-column body ── */}
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left column — 60% */}
                <div style={{ flex: '0 0 60%', padding: '16px 24px 28px 28px', borderRight: '1px solid #f0f0f0' }}>
                    {leftOrder.map((key) => {
                        if (hiddenSections.includes(key)) return null;

                        if (key === 'objective' && objective) return (
                            <div key="objective">
                                <LeftSectionTitle title="Muc tieu nghe nghiep" color={color} />
                                <p style={{
                                    fontSize: `${base}px`, color: '#444',
                                    lineHeight: lineSpacing, margin: 0,
                                    whiteSpace: 'pre-wrap',
                                    borderLeft: `3px solid ${color}40`,
                                    paddingLeft: '10px',
                                }}>{objective}</p>
                            </div>
                        );

                        if (key === 'experiences' && experiences.length > 0) return (
                            <div key="experiences">
                                <LeftSectionTitle title="Kinh nghiem lam viec" color={color} />
                                {experiences.map((exp, i) => (
                                    <div key={exp.id || i} style={{
                                        marginBottom: '16px',
                                        paddingLeft: '12px',
                                        borderLeft: `3px solid ${i === 0 ? color : `${color}50`}`,
                                        position: 'relative',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1px' }}>
                                            <div style={{ fontSize: `${base}px`, fontWeight: '800', color: '#111' }}>{exp.position}</div>
                                            <div style={{
                                                fontSize: '9px', color: '#999',
                                                whiteSpace: 'nowrap', marginLeft: '8px', flexShrink: 0,
                                            }}>
                                                {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: `${base - 1}px`, color: color, fontWeight: '700', marginBottom: '5px' }}>{exp.company}</div>
                                        {exp.description && (
                                            <div style={{
                                                fontSize: `${base - 1}px`, color: '#555',
                                                lineHeight: lineSpacing, whiteSpace: 'pre-wrap',
                                                marginBottom: '6px',
                                            }}>{exp.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'activities' && activities.length > 0) return (
                            <div key="activities">
                                <LeftSectionTitle title="Hoat dong" color={color} />
                                {activities.map((act, i) => (
                                    <div key={act.id || i} style={{ marginBottom: '10px' }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                                            {act.role || act.name}
                                            {act.organization && <span style={{ fontWeight: '400', color: '#777', marginLeft: '6px' }}>– {act.organization}</span>}
                                        </div>
                                        {act.description && (
                                            <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );

                        return null;
                    })}
                </div>

                {/* Right column — 40% */}
                <div style={{
                    flex: '0 0 40%',
                    background: `linear-gradient(180deg, ${darker}f0 0%, ${color}e8 100%)`,
                    padding: '16px 22px 28px',
                }}>
                    {rightOrder.map((key) => {
                        if (hiddenSections.includes(key)) return null;

                        if (key === 'skills' && skills.length > 0) return (
                            <div key="skills">
                                <RightSectionTitle title="Ky nang" color={color} />
                                {skills.map((sk, i) => (
                                    <div key={sk.id || i} style={{ marginBottom: '9px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                            <span style={{ fontSize: `${base - 1}px`, color: 'rgba(255,255,255,0.95)', fontWeight: '600' }}>{sk.name}</span>
                                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>
                                                {levelLabels[sk.level] || levelLabels[3]}
                                            </span>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%',
                                                width: levelPct[sk.level] || levelPct[3],
                                                background: 'rgba(255,255,255,0.85)',
                                                borderRadius: '3px',
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'education' && education.length > 0) return (
                            <div key="education">
                                <RightSectionTitle title="Hoc van" color={color} />
                                {education.map((edu, i) => (
                                    <div key={edu.id || i} style={{ marginBottom: '12px' }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: 'white', lineHeight: 1.3 }}>{edu.school}</div>
                                        <div style={{ fontSize: `${base - 1}px`, color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
                                            {edu.degree}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                                            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
                                                {edu.startDate} – {edu.endDate}
                                            </span>
                                            {edu.gpa && (
                                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '700' }}>
                                                    GPA: {edu.gpa}
                                                </span>
                                            )}
                                        </div>
                                        {edu.description && (
                                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{edu.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'certifications' && certifications.length > 0) return (
                            <div key="certifications">
                                <RightSectionTitle title="Chung chi" color={color} />
                                {certifications.map((cert, i) => (
                                    <div key={cert.id || i} style={{
                                        marginBottom: '10px',
                                        padding: '8px 10px',
                                        background: 'rgba(255,255,255,0.12)',
                                        borderRadius: '6px',
                                        borderLeft: '3px solid rgba(255,255,255,0.5)',
                                    }}>
                                        <div style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: 'white' }}>{cert.name}</div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.65)', marginTop: '2px' }}>
                                            {cert.issuer}{cert.date ? ` · ${cert.date}` : ''}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'languages' && languages.length > 0) return (
                            <div key="languages">
                                <RightSectionTitle title="Ngoai ngu" color={color} />
                                {languages.map((lang, i) => (
                                    <div key={lang.id || i} style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        marginBottom: '8px',
                                        padding: '6px 10px',
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '5px',
                                    }}>
                                        <span style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: 'white' }}>{lang.name}</span>
                                        <span style={{
                                            fontSize: '10px', color: 'rgba(255,255,255,0.75)',
                                            fontWeight: '500',
                                        }}>{lang.level}</span>
                                    </div>
                                ))}
                            </div>
                        );

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
