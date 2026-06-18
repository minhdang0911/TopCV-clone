import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

const LEFT_SECTIONS = ['objective', 'experiences'];
const RIGHT_SECTIONS = ['education', 'skills', 'languages', 'certifications', 'activities'];

function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

function LeftSectionHeader({ title, color }) {
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.3px', color: '#1a1a1a' }}>{title}</span>
                <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
            </div>
            <div style={{ height: '2px', width: '32px', background: color, borderRadius: '1px', marginTop: '3px' }} />
        </div>
    );
}

function RightSectionHeader({ title, color }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.4px', color: color }}>{title}</span>
            <div style={{ height: '1px', background: `rgba(${hexToRgb(color)}, 0.25)`, marginTop: '4px' }} />
        </div>
    );
}

export default function KinhDoanh4Template({ content = {}, color = '#e67e22', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    const leftOrder = order.filter(k => LEFT_SECTIONS.includes(k));
    const rightOrder = order.filter(k => RIGHT_SECTIONS.includes(k));

    const rgb = hexToRgb(color);

    const leftSectionMap = {
        objective: objective && !hiddenSections.includes('objective') ? (
            <div key="objective" style={{ marginBottom: '22px' }}>
                <LeftSectionHeader title="Muc tieu nghe nghiep" color={color} />
                <p style={{ fontSize: `${base}px`, color: '#555', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap' }}>{objective}</p>
            </div>
        ) : null,

        experiences: experiences.length > 0 && !hiddenSections.includes('experiences') ? (
            <div key="experiences" style={{ marginBottom: '22px' }}>
                <LeftSectionHeader title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '16px', borderLeft: `3px solid ${color}`, paddingLeft: '12px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1px' }}>
                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#1a1a1a', flex: 1 }}>{exp.position}</div>
                            <div style={{ fontSize: '9px', color: '#aaa', whiteSpace: 'nowrap', marginLeft: '8px', marginTop: '2px' }}>
                                {exp.startDate}{exp.startDate ? ' – ' : ''}{exp.isCurrent ? 'Hien tai' : exp.endDate}
                            </div>
                        </div>
                        <div style={{ fontSize: `${base}px`, color: color, fontWeight: '600', marginBottom: '5px' }}>{exp.company}</div>
                        {exp.description && (
                            <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>
                        )}
                    </div>
                ))}
            </div>
        ) : null,
    };

    const rightSectionMap = {
        education: education.length > 0 && !hiddenSections.includes('education') ? (
            <div key="education" style={{ marginBottom: '18px' }}>
                <RightSectionHeader title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#1a1a1a' }}>{edu.school}</div>
                        <div style={{ fontSize: `${base - 1}px`, color: '#666', marginTop: '1px' }}>{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                        <div style={{ fontSize: '9px', color: '#aaa', marginTop: '1px' }}>{edu.startDate}{edu.startDate ? ' – ' : ''}{edu.endDate}</div>
                        {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#999', fontStyle: 'italic', marginTop: '2px' }}>{edu.description}</div>}
                    </div>
                ))}
            </div>
        ) : null,

        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills" style={{ marginBottom: '18px' }}>
                <RightSectionHeader title="Ky nang" color={color} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {skills.map((sk, i) => (
                        <span key={sk.id || i} style={{
                            padding: '3px 9px',
                            background: `rgba(${rgb}, 0.1)`,
                            color: color,
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600',
                            border: `1px solid rgba(${rgb}, 0.2)`,
                            whiteSpace: 'nowrap'
                        }}>{sk.name}</span>
                    ))}
                </div>
            </div>
        ) : null,

        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages" style={{ marginBottom: '18px' }}>
                <RightSectionHeader title="Ngoai ngu" color={color} />
                {languages.map((lang, i) => (
                    <div key={lang.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: `${base - 1}px`, fontWeight: '600', color: '#333' }}>{lang.name}</span>
                        {lang.level && (
                            <span style={{ fontSize: '9px', color: '#888', background: '#f0f0f0', padding: '1px 7px', borderRadius: '8px' }}>{lang.level}</span>
                        )}
                    </div>
                ))}
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications" style={{ marginBottom: '18px' }}>
                <RightSectionHeader title="Chung chi" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: `${base - 1}px`, fontWeight: '600', color: '#222' }}>{cert.name}</div>
                        {(cert.issuer || cert.date) && (
                            <div style={{ fontSize: '9px', color: '#aaa', marginTop: '1px' }}>
                                {cert.issuer}{cert.issuer && cert.date ? ' · ' : ''}{cert.date}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        ) : null,

        activities: activities.length > 0 && !hiddenSections.includes('activities') ? (
            <div key="activities" style={{ marginBottom: '18px' }}>
                <RightSectionHeader title="Hoat dong" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#222' }}>
                            {act.role || act.name}
                        </div>
                        {act.organization && <div style={{ fontSize: '9px', color: color, marginTop: '1px' }}>{act.organization}</div>}
                        {act.description && <div style={{ fontSize: '9px', color: '#777', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ width: '794px', minHeight: '1122px', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px` }}>
            {/* Full-width colored header */}
            <div style={{ background: color, padding: '26px 36px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    {/* Small avatar */}
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '64px', height: '64px', borderRadius: '6px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.35)', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: '64px', height: '64px', borderRadius: '6px', background: 'rgba(255,255,255,0.18)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: 'white', border: '2px solid rgba(255,255,255,0.25)' }}>
                            {(personalInfo.fullName || 'K').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: 'white', lineHeight: 1.2, marginBottom: '2px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: 'rgba(255,255,255,0.8)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{personalInfo.title || 'Nhan Vien Kinh Doanh'}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {personalInfo.phone && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.88)' }}>
                                    <Phone size={10} />{personalInfo.phone}
                                </span>
                            )}
                            {personalInfo.email && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.88)' }}>
                                    <Mail size={10} />{personalInfo.email}
                                </span>
                            )}
                            {personalInfo.address && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.88)' }}>
                                    <MapPin size={10} />{personalInfo.address}
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'rgba(255,255,255,0.88)' }}>
                                    <FaLinkedin style={{ fontSize: '10px' }} />{personalInfo.linkedin}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Two-column body */}
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left col — 65% */}
                <div style={{ width: '65%', padding: '24px 24px 32px 32px', borderRight: '1px solid #eeeeee' }}>
                    {leftOrder.map(key => leftSectionMap[key] || null)}
                </div>

                {/* Right col — 35% */}
                <div style={{ width: '35%', padding: '24px 24px 32px 20px', background: `rgba(${rgb}, 0.04)` }}>
                    {rightOrder.map(key => rightSectionMap[key] || null)}
                </div>
            </div>
        </div>
    );
}
