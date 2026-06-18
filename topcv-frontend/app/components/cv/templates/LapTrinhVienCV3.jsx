import { Mail, Phone, MapPin, Code2 } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function Chip({ name, color }) {
    return (
        <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: `${color}12`,
            color: color,
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            border: `1px solid ${color}35`,
            margin: '0 6px 7px 0',
        }}>{name}</span>
    );
}

function Section({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '22px 0 12px' }}>
            <div style={{ width: '22px', height: '2px', background: color, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{
                fontSize: '11px', fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: '1.8px',
                color: '#1a1a1a',
            }}>{title}</span>
            <div style={{ flex: 1, height: '1px', background: '#ebebeb' }} />
        </div>
    );
}

function ContactBadge({ icon, text }) {
    if (!text) return null;
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            fontSize: '10px', color: '#555',
            padding: '0 6px',
        }}>
            {icon}
            {text}
        </span>
    );
}

export default function LapTrinhVienCV3({ content = {}, color = '#6d28d9', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    // Filter out skills from main rendering since we show them right after header
    const mainOrder = order.filter(k => k !== 'skills');

    const contactItems = [
        personalInfo.phone && { icon: <Phone size={10} color={color} />, text: personalInfo.phone },
        personalInfo.email && { icon: <Mail size={10} color={color} />, text: personalInfo.email },
        personalInfo.address && { icon: <MapPin size={10} color={color} />, text: personalInfo.address },
        personalInfo.github && { icon: <FaGithub style={{ fontSize: '10px', color: color }} />, text: personalInfo.github },
        personalInfo.linkedin && { icon: <FaLinkedin style={{ fontSize: '10px', color: color }} />, text: personalInfo.linkedin },
    ].filter(Boolean);

    return (
        <div style={{
            width: '794px',
            minHeight: '100%',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            background,
            fontSize: `${base}px`,
            color: '#222',
        }}>
            {/* ── Centered Header ── */}
            <div style={{
                padding: '36px 48px 0',
                textAlign: 'center',
                borderBottom: `1px solid #f0f0f0`,
            }}>
                {/* Avatar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{
                            width: '88px', height: '88px', borderRadius: '50%',
                            objectFit: 'cover',
                            border: `3px solid ${color}`,
                            boxShadow: `0 0 0 4px ${color}18`,
                        }} />
                    ) : (
                        <div style={{
                            width: '88px', height: '88px', borderRadius: '50%',
                            background: `${color}12`,
                            border: `3px solid ${color}`,
                            boxShadow: `0 0 0 4px ${color}18`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '32px', fontWeight: '800', color: color,
                        }}>
                            {(personalInfo.fullName || 'D').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Name */}
                <div style={{
                    fontSize: '24px', fontWeight: '800', color: '#111',
                    letterSpacing: '-0.5px', marginBottom: '5px', lineHeight: 1.2,
                }}>{personalInfo.fullName || 'Ho va Ten'}</div>

                {/* Title */}
                <div style={{
                    fontSize: '13px', fontWeight: '600', color: color,
                    marginBottom: '14px', letterSpacing: '0.3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}>
                    <Code2 size={13} color={color} />
                    {personalInfo.title || 'Software Developer'}
                </div>

                {/* Contact row */}
                {contactItems.length > 0 && (
                    <div style={{
                        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
                        gap: '2px', marginBottom: '20px',
                    }}>
                        {contactItems.map((item, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <ContactBadge icon={item.icon} text={item.text} />
                                {i < contactItems.length - 1 && (
                                    <span style={{ color: '#ddd', fontSize: '12px', marginLeft: '6px' }}>|</span>
                                )}
                            </span>
                        ))}
                    </div>
                )}

                {/* Tech Stack chips — immediately below header */}
                {skills.length > 0 && !hiddenSections.includes('skills') && (
                    <div style={{
                        padding: '14px 0 16px',
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
                    }}>
                        {skills.map((sk, i) => (
                            <Chip key={sk.id || i} name={sk.name} color={color} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '0 48px 36px' }}>
                {mainOrder.map((key) => {
                    if (hiddenSections.includes(key)) return null;

                    if (key === 'objective' && objective) return (
                        <div key="objective">
                            <Section title="Muc tieu nghe nghiep" color={color} />
                            <p style={{
                                fontSize: `${base}px`, color: '#444',
                                lineHeight: lineSpacing, margin: 0,
                                whiteSpace: 'pre-wrap',
                                padding: '4px 0',
                            }}>{objective}</p>
                        </div>
                    );

                    if (key === 'experiences' && experiences.length > 0) return (
                        <div key="experiences">
                            <Section title="Kinh nghiem lam viec" color={color} />
                            {experiences.map((exp, i) => (
                                <div key={exp.id || i} style={{
                                    marginBottom: '18px',
                                    padding: '14px 16px',
                                    background: '#fafafa',
                                    border: `1px solid #f0f0f0`,
                                    borderRadius: '8px',
                                    borderTop: `3px solid ${color}`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                                        <div style={{ fontSize: `${base + 1}px`, fontWeight: '800', color: '#111' }}>{exp.position}</div>
                                        <div style={{
                                            fontSize: '10px', color: '#888',
                                            background: 'white',
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '4px',
                                            padding: '2px 8px',
                                            whiteSpace: 'nowrap', marginLeft: '8px', flexShrink: 0,
                                        }}>
                                            {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: `${base - 1}px`, color: color, fontWeight: '700', marginBottom: '6px' }}>{exp.company}</div>
                                    {exp.description && (
                                        <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'education' && education.length > 0) return (
                        <div key="education">
                            <Section title="Hoc van" color={color} />
                            {education.map((edu, i) => (
                                <div key={edu.id || i} style={{
                                    marginBottom: '14px',
                                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                                }}>
                                    {/* Year badge */}
                                    <div style={{
                                        flexShrink: 0, width: '48px', textAlign: 'center',
                                        paddingTop: '2px',
                                    }}>
                                        <div style={{
                                            fontSize: '9px', fontWeight: '700', color: 'white',
                                            background: color, borderRadius: '4px', padding: '3px 4px',
                                            lineHeight: 1.4,
                                        }}>{edu.endDate || edu.startDate}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                                        <div style={{ fontSize: `${base - 1}px`, color: '#666', marginTop: '2px' }}>
                                            {edu.degree}
                                            {edu.gpa && <span style={{ color: color, fontWeight: '600', marginLeft: '8px' }}>GPA: {edu.gpa}</span>}
                                        </div>
                                        {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', marginTop: '3px' }}>{edu.description}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'languages' && languages.length > 0) return (
                        <div key="languages">
                            <Section title="Ngoai ngu" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {languages.map((lang, i) => (
                                    <div key={lang.id || i} style={{
                                        padding: '8px 16px',
                                        border: `1px solid ${color}30`,
                                        borderRadius: '8px',
                                        minWidth: '90px', textAlign: 'center',
                                        background: `${color}06`,
                                    }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{lang.name}</div>
                                        <div style={{ fontSize: '10px', color: color, fontWeight: '600', marginTop: '2px' }}>{lang.level}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'certifications' && certifications.length > 0) return (
                        <div key="certifications">
                            <Section title="Chung chi" color={color} />
                            {certifications.map((cert, i) => (
                                <div key={cert.id || i} style={{
                                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                                    marginBottom: '10px',
                                }}>
                                    <div style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: color, flexShrink: 0, marginTop: '5px',
                                    }} />
                                    <div>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{cert.name}</div>
                                        <div style={{ fontSize: '10px', color: '#777', marginTop: '1px' }}>
                                            {cert.issuer}{cert.date ? ` · ${cert.date}` : ''}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'activities' && activities.length > 0) return (
                        <div key="activities">
                            <Section title="Hoat dong ngoai khoa" color={color} />
                            {activities.map((act, i) => (
                                <div key={act.id || i} style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                                        {act.role || act.name}
                                        {act.organization && <span style={{ fontWeight: '400', color: '#777', marginLeft: '6px' }}>– {act.organization}</span>}
                                    </div>
                                    {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>}
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
