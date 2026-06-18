import { Mail, Phone, MapPin, Code2, Github, Terminal } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function TerminalChip({ name, color }) {
    return (
        <span style={{
            display: 'inline-block',
            padding: '3px 10px',
            background: '#0f1117',
            color: color,
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '700',
            fontFamily: "'Courier New', Courier, monospace",
            border: `1px solid ${color}55`,
            margin: '0 5px 5px 0',
            letterSpacing: '0.5px',
        }}>{name}</span>
    );
}

function SectionTitle({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Terminal size={12} color={color} />
            <span style={{
                fontSize: '10px',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                color: color,
                fontFamily: "'Courier New', Courier, monospace",
            }}>{'// '}{title}</span>
            <div style={{ flex: 1, height: '1px', background: `${color}30` }} />
        </div>
    );
}

export default function LapTrinhVienCV2({ content = {}, color = '#16a085', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    const levelMap = { 1: '20%', 2: '40%', 3: '60%', 4: '80%', 5: '100%' };

    return (
        <div style={{
            width: '794px',
            minHeight: '100%',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            background,
            fontSize: `${base}px`,
            color: '#222',
        }}>
            {/* ── Terminal Header ── */}
            <div style={{ background: '#0f1117', padding: '24px 32px 20px' }}>
                {/* window dots */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                    <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#febc2e' }} />
                    <div style={{ width: '11px', height: '11px', borderRadius: '50%', background: '#28c840' }} />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{
                            width: '68px', height: '68px', borderRadius: '6px',
                            objectFit: 'cover', border: `2px solid ${color}`,
                            flexShrink: 0,
                        }} />
                    ) : (
                        <div style={{
                            width: '68px', height: '68px', borderRadius: '6px',
                            background: `${color}22`, border: `2px solid ${color}`,
                            flexShrink: 0, display: 'flex', alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '26px', fontWeight: '800', color: color,
                            fontFamily: "'Courier New', Courier, monospace",
                        }}>
                            {(personalInfo.fullName || 'D').charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '4px' }}>
                            <span style={{
                                fontFamily: "'Courier New', Courier, monospace",
                                fontSize: '8px', color: color, fontWeight: '700',
                            }}>{'>'}</span>
                            <span style={{
                                fontSize: '22px', fontWeight: '800', color: '#ffffff',
                                fontFamily: "'Courier New', Courier, monospace",
                                letterSpacing: '-0.5px',
                            }}>{personalInfo.fullName || 'Ho va Ten'}</span>
                            <span style={{
                                fontSize: '20px', color: color, fontWeight: '300',
                                fontFamily: "'Courier New', Courier, monospace",
                                animation: 'none',
                            }}>|</span>
                        </div>
                        <div style={{
                            fontSize: '11px', color: color, marginBottom: '10px',
                            fontFamily: "'Courier New', Courier, monospace",
                            fontWeight: '600', letterSpacing: '1px',
                        }}>
                            <Code2 size={10} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'middle' }} />
                            {personalInfo.title || 'Software Developer'}
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {personalInfo.email && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Courier New', Courier, monospace" }}>
                                    <Mail size={10} color={color} />{personalInfo.email}
                                </span>
                            )}
                            {personalInfo.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Courier New', Courier, monospace" }}>
                                    <Phone size={10} color={color} />{personalInfo.phone}
                                </span>
                            )}
                            {personalInfo.address && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Courier New', Courier, monospace" }}>
                                    <MapPin size={10} color={color} />{personalInfo.address}
                                </span>
                            )}
                            {personalInfo.github && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Courier New', Courier, monospace" }}>
                                    <FaGithub style={{ fontSize: '10px', color: color }} />{personalInfo.github}
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontFamily: "'Courier New', Courier, monospace" }}>
                                    <FaLinkedin style={{ fontSize: '10px', color: color }} />{personalInfo.linkedin}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div style={{ padding: '24px 32px 32px' }}>
                {order.map((key) => {
                    if (hiddenSections.includes(key)) return null;

                    if (key === 'objective' && objective) return (
                        <div key="objective" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Gioi thieu" color={color} />
                            <div style={{
                                background: '#f8fffe',
                                border: `1px solid ${color}30`,
                                borderLeft: `3px solid ${color}`,
                                borderRadius: '4px',
                                padding: '10px 14px',
                            }}>
                                <span style={{
                                    fontSize: '10px', color: color, fontFamily: "'Courier New', Courier, monospace",
                                    fontWeight: '700', marginRight: '6px',
                                }}>{'/*'}</span>
                                <span style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{objective}</span>
                                <span style={{
                                    fontSize: '10px', color: color, fontFamily: "'Courier New', Courier, monospace",
                                    fontWeight: '700', marginLeft: '6px',
                                }}>{'*/'}</span>
                            </div>
                        </div>
                    );

                    if (key === 'experiences' && experiences.length > 0) return (
                        <div key="experiences" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Kinh nghiem lam viec" color={color} />
                            {experiences.map((exp, i) => (
                                <div key={exp.id || i} style={{
                                    marginBottom: '16px',
                                    paddingLeft: '14px',
                                    borderLeft: `2px solid ${color}40`,
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute', left: '-5px', top: '3px',
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: color, border: `2px solid white`,
                                    }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                        <div style={{
                                            fontSize: `${base}px`, fontWeight: '800', color: '#111',
                                            fontFamily: "'Courier New', Courier, monospace",
                                        }}>{exp.position}</div>
                                        <div style={{
                                            fontSize: '9px', color: '#888',
                                            fontFamily: "'Courier New', Courier, monospace",
                                            whiteSpace: 'nowrap', marginLeft: '8px',
                                            background: '#f3f4f6', padding: '2px 7px', borderRadius: '3px',
                                        }}>
                                            {exp.startDate} — {exp.isCurrent ? 'now' : exp.endDate}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: `${base - 1}px`, color: color, fontWeight: '700',
                                        fontFamily: "'Courier New', Courier, monospace",
                                        marginBottom: '5px',
                                    }}>{exp.company}</div>
                                    {exp.description && (
                                        <div style={{
                                            fontSize: `${base - 1}px`, color: '#555',
                                            lineHeight: lineSpacing, whiteSpace: 'pre-wrap',
                                        }}>{exp.description}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'education' && education.length > 0) return (
                        <div key="education" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Hoc van" color={color} />
                            {education.map((edu, i) => (
                                <div key={edu.id || i} style={{
                                    marginBottom: '12px',
                                    paddingLeft: '14px',
                                    borderLeft: `2px solid ${color}40`,
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute', left: '-5px', top: '3px',
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: `${color}80`, border: `2px solid white`,
                                    }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                                        <div style={{ fontSize: '9px', color: '#888', background: '#f3f4f6', padding: '2px 7px', borderRadius: '3px', fontFamily: "'Courier New', Courier, monospace" }}>
                                            {edu.startDate} — {edu.endDate}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: `${base - 1}px`, color: '#666', marginTop: '2px' }}>
                                        {edu.degree}{edu.gpa ? <span style={{ color: color, fontWeight: '700', marginLeft: '6px', fontFamily: "'Courier New', Courier, monospace" }}>GPA: {edu.gpa}</span> : ''}
                                    </div>
                                    {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', marginTop: '3px' }}>{edu.description}</div>}
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'skills' && skills.length > 0) return (
                        <div key="skills" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Ky nang ky thuat" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                {skills.map((sk, i) => (
                                    <TerminalChip key={sk.id || i} name={sk.name} color={color} />
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'languages' && languages.length > 0) return (
                        <div key="languages" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Ngoai ngu" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                                {languages.map((lang, i) => (
                                    <div key={lang.id || i} style={{
                                        background: '#f8f9fa',
                                        border: `1px solid ${color}30`,
                                        borderRadius: '5px',
                                        padding: '6px 14px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                                        minWidth: '80px',
                                    }}>
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{lang.name}</div>
                                        <div style={{ fontSize: '10px', color: color, fontFamily: "'Courier New', Courier, monospace", marginTop: '2px' }}>{lang.level}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'certifications' && certifications.length > 0) return (
                        <div key="certifications" style={{ marginBottom: '22px' }}>
                            <SectionTitle title="Chung chi" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {certifications.map((cert, i) => (
                                    <div key={cert.id || i} style={{
                                        background: `${color}0d`,
                                        border: `1px solid ${color}30`,
                                        borderRadius: '5px',
                                        padding: '7px 12px',
                                        flex: '0 0 auto',
                                        maxWidth: '220px',
                                    }}>
                                        <div style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#111' }}>{cert.name}</div>
                                        <div style={{ fontSize: '10px', color: '#777', marginTop: '2px', fontFamily: "'Courier New', Courier, monospace" }}>
                                            {cert.issuer}{cert.date ? ` · ${cert.date}` : ''}
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
                                <div key={act.id || i} style={{
                                    marginBottom: '10px',
                                    paddingLeft: '14px',
                                    borderLeft: `2px solid ${color}40`,
                                    position: 'relative',
                                }}>
                                    <div style={{
                                        position: 'absolute', left: '-5px', top: '3px',
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: `${color}60`, border: `2px solid white`,
                                    }} />
                                    <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                                        {act.role || act.name}
                                        {act.organization && <span style={{ fontWeight: '400', color: '#666', marginLeft: '6px' }}>@ {act.organization}</span>}
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
