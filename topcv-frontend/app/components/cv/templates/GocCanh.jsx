import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_SECTION_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function darkenColor(hex, amount = 60) {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const num = parseInt(c, 16);
    const r = Math.max(0, (num >> 16) - amount);
    const g = Math.max(0, ((num >> 8) & 0xff) - amount);
    const b = Math.max(0, (num & 0xff) - amount);
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

function LevelDots({ level, color }) {
    const filled = Math.round(level || 3);
    return (
        <div style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i < filled ? color : 'rgba(255,255,255,0.25)', border: i < filled ? 'none' : '1px solid rgba(255,255,255,0.4)' }} />
            ))}
        </div>
    );
}

function SidebarSectionTitle({ title }) {
    return (
        <div style={{ marginBottom: '10px', marginTop: '20px' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>{title}</div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)' }} />
        </div>
    );
}

function MainSectionTitle({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'stretch', gap: '0', marginBottom: '14px', marginTop: '22px' }}>
            <div style={{ width: '5px', background: color, borderRadius: '2px 0 0 2px', flexShrink: 0 }} />
            <div style={{ paddingLeft: '12px', paddingTop: '2px', paddingBottom: '2px' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: color }}>{title}</div>
            </div>
        </div>
    );
}

export default function GocCanhTemplate({ content = {}, color = '#1e293b', fontSize = 'medium', lineSpacing = 1.5, background = 'white' }) {
    const {
        personalInfo = {},
        objective = '',
        experiences = [],
        education = [],
        skills = [],
        certifications = [],
        languages = [],
        activities = [],
        sectionOrder = DEFAULT_SECTION_ORDER,
        hiddenSections = [],
    } = content;

    const baseFontSize = fontSize === 'small' ? 11 : fontSize === 'large' ? 13 : 12;
    const order = sectionOrder.length ? sectionOrder : DEFAULT_SECTION_ORDER;
    const darkSidebar = darkenColor(color, 30);

    const sidebarSections = ['skills', 'languages'];
    const mainSections = ['objective', 'experiences', 'education', 'certifications', 'activities'];

    const sidebarMap = {
        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills">
                <SidebarSectionTitle title="Ky nang" />
                {skills.map((s, i) => (
                    <div key={s.id || i} style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginBottom: '4px' }}>{s.name}</div>
                        <LevelDots level={s.level} color="white" />
                    </div>
                ))}
            </div>
        ) : null,
        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages">
                <SidebarSectionTitle title="Ngon ngu" />
                {languages.map((l, i) => (
                    <div key={l.id || i} style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', fontWeight: '600' }}>{l.name}</div>
                        {l.level && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.6)' }}>{l.level}</div>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    const mainMap = {
        objective: objective && !hiddenSections.includes('objective') ? (
            <div key="objective">
                <MainSectionTitle title="Muc tieu nghe nghiep" color={color} />
                <p style={{ color: '#374151', margin: '0 0 4px', fontSize: `${baseFontSize}px`, lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{objective}</p>
            </div>
        ) : null,

        experiences: experiences.length > 0 && !hiddenSections.includes('experiences') ? (
            <div key="experiences">
                <MainSectionTitle title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '16px', paddingBottom: i < experiences.length - 1 ? '14px' : 0, borderBottom: i < experiences.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{exp.position}</div>
                                <div style={{ color: color, fontWeight: '600', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{exp.company}</div>
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px', background: '#f3f4f6', padding: '2px 8px', borderRadius: '3px' }}>
                                {exp.startDate}{exp.startDate ? ' - ' : ''}{exp.isCurrent ? 'Hien tai' : exp.endDate}
                            </div>
                        </div>
                        {exp.description && (
                            <p style={{ color: '#4b5563', margin: '6px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>
                                {exp.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        ) : null,

        education: education.length > 0 && !hiddenSections.includes('education') ? (
            <div key="education">
                <MainSectionTitle title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ marginBottom: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{edu.school}</div>
                                <div style={{ color: '#4b5563', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{edu.degree}</div>
                                {edu.gpa && <div style={{ color: '#9ca3af', fontSize: '10px' }}>GPA: {edu.gpa}</div>}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px', background: '#f3f4f6', padding: '2px 8px', borderRadius: '3px' }}>
                                {edu.startDate}{edu.startDate ? ' - ' : ''}{edu.endDate}
                            </div>
                        </div>
                        {edu.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing }}>{edu.description}</p>}
                    </div>
                ))}
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications">
                <MainSectionTitle title="Chung chi" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                            <span style={{ fontWeight: '600', color: '#111827', fontSize: `${baseFontSize}px` }}>{cert.name}</span>
                            {cert.issuer && <div style={{ color: '#9ca3af', fontSize: `${baseFontSize - 1}px` }}>{cert.issuer}</div>}
                        </div>
                        {cert.date && <span style={{ color: '#9ca3af', fontSize: '10px', flexShrink: 0, marginLeft: '12px' }}>{cert.date}</span>}
                    </div>
                ))}
            </div>
        ) : null,

        activities: activities.length > 0 && !hiddenSections.includes('activities') ? (
            <div key="activities">
                <MainSectionTitle title="Hoat dong ngoai khoa" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '10px' }}>
                        <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize}px` }}>{act.role}</div>
                        <div style={{ color: color, fontSize: `${baseFontSize - 1}px`, marginTop: '2px' }}>{act.organization}</div>
                        {act.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing }}>{act.description}</p>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ width: '794px', minHeight: '1123px', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', 'Helvetica Neue', Arial, sans-serif", fontSize: `${baseFontSize}px`, lineHeight: lineSpacing, background, display: 'flex', boxSizing: 'border-box' }}>
            {/* Dark left sidebar - 30% width = ~238px */}
            <div style={{ width: '238px', flexShrink: 0, background: darkSidebar, color: 'white', padding: '32px 20px' }}>
                {/* Avatar (square) */}
                <div style={{ marginBottom: '20px' }}>
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar"
                            style={{ width: '70px', height: '70px', borderRadius: '4px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.2)' }} />
                    ) : (
                        <div style={{ width: '70px', height: '70px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', border: '2px solid rgba(255,255,255,0.2)' }}>
                            {(personalInfo.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h2 style={{ margin: '12px 0 4px', fontSize: `${baseFontSize + 4}px`, fontWeight: '800', color: 'white', lineHeight: '1.2' }}>
                        {personalInfo.fullName || 'Ho va Ten'}
                    </h2>
                    {personalInfo.title && (
                        <div style={{ fontSize: `${baseFontSize - 1}px`, color: 'rgba(255,255,255,0.7)', fontWeight: '400' }}>
                            {personalInfo.title}
                        </div>
                    )}
                </div>

                {/* Contact info */}
                <SidebarSectionTitle title="Lien he" />
                {personalInfo.phone && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        <Phone size={10} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>{personalInfo.phone}</span>
                    </div>
                )}
                {personalInfo.email && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all' }}>
                        <Mail size={10} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>{personalInfo.email}</span>
                    </div>
                )}
                {personalInfo.address && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.8)' }}>
                        <MapPin size={10} style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>{personalInfo.address}</span>
                    </div>
                )}
                {personalInfo.linkedin && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all' }}>
                        <FaLinkedin style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>{personalInfo.linkedin}</span>
                    </div>
                )}
                {personalInfo.github && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: 'rgba(255,255,255,0.8)', wordBreak: 'break-all' }}>
                        <FaGithub style={{ marginTop: '1px', flexShrink: 0 }} />
                        <span>{personalInfo.github}</span>
                    </div>
                )}

                {/* Sidebar content in order */}
                {order.map((key) => sidebarSections.includes(key) ? (sidebarMap[key] || null) : null)}
            </div>

            {/* Right main content - 70% width */}
            <div style={{ flex: 1, padding: '32px 28px' }}>
                {order.map((key) => mainSections.includes(key) ? (mainMap[key] || null) : null)}
            </div>
        </div>
    );
}
