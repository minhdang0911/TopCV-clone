import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_SECTION_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '14px', marginTop: '22px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: color, whiteSpace: 'nowrap' }}>{title}</div>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(to right, ${color}60, transparent)` }} />
        </div>
    );
}

function TimelineDot({ color }) {
    return (
        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'white', border: `2px solid ${color}`, flexShrink: 0, marginTop: '4px' }} />
    );
}

export default function ThamVongTemplate({ content = {}, color = '#1e293b', fontSize = 'medium', lineSpacing = 1.5, background = 'white' }) {
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

    const sections = {
        objective: objective && !hiddenSections.includes('objective') ? (
            <div key="objective">
                <SectionTitle title="Muc tieu nghe nghiep" color={color} />
                <p style={{ color: '#374151', margin: '0 0 4px', fontSize: `${baseFontSize}px`, lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{objective}</p>
            </div>
        ) : null,

        experiences: experiences.length > 0 && !hiddenSections.includes('experiences') ? (
            <div key="experiences">
                <SectionTitle title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ display: 'flex', gap: '14px', marginBottom: '16px', position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <TimelineDot color={color} />
                            {i < experiences.length - 1 && (
                                <div style={{ width: '1px', flex: 1, background: `${color}30`, minHeight: '20px', marginTop: '4px' }} />
                            )}
                        </div>
                        <div style={{ flex: 1, paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{exp.position}</div>
                                    <div style={{ color: color, fontWeight: '600', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{exp.company}</div>
                                </div>
                                <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px', fontStyle: 'italic', marginTop: '2px' }}>
                                    {exp.startDate}{exp.startDate ? ' - ' : ''}{exp.isCurrent ? 'Hien tai' : exp.endDate}
                                </div>
                            </div>
                            {exp.description && (
                                <p style={{ color: '#4b5563', margin: '6px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>
                                    {exp.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ) : null,

        education: education.length > 0 && !hiddenSections.includes('education') ? (
            <div key="education">
                <SectionTitle title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <TimelineDot color={color} />
                            {i < education.length - 1 && (
                                <div style={{ width: '1px', flex: 1, background: `${color}30`, minHeight: '16px', marginTop: '4px' }} />
                            )}
                        </div>
                        <div style={{ flex: 1, paddingBottom: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{edu.school}</div>
                                    <div style={{ color: '#4b5563', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{edu.degree}</div>
                                    {edu.gpa && <div style={{ color: '#9ca3af', fontSize: '10px' }}>GPA: {edu.gpa}</div>}
                                </div>
                                <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px', fontStyle: 'italic' }}>
                                    {edu.startDate}{edu.startDate ? ' - ' : ''}{edu.endDate}
                                </div>
                            </div>
                            {edu.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing }}>{edu.description}</p>}
                        </div>
                    </div>
                ))}
            </div>
        ) : null,

        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills">
                <SectionTitle title="Ky nang" color={color} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 28px', marginBottom: '4px' }}>
                    {skills.map((s, i) => (
                        <div key={s.id || i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: `${baseFontSize - 1}px`, color: '#374151' }}>
                                <span style={{ fontWeight: '500' }}>{s.name}</span>
                                <span style={{ color: '#9ca3af', fontSize: '9px' }}>{s.level || 3}/5</span>
                            </div>
                            <div style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px' }}>
                                <div style={{ height: '100%', width: `${((s.level || 3) / 5) * 100}%`, background: color, borderRadius: '2px' }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages">
                <SectionTitle title="Ngon ngu" color={color} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '4px' }}>
                    {languages.map((l, i) => (
                        <div key={l.id || i} style={{ padding: '6px 14px', border: `1px solid ${color}40`, borderRadius: '4px', background: `${color}08` }}>
                            <div style={{ fontSize: `${baseFontSize - 1}px`, fontWeight: '700', color: '#111827' }}>{l.name}</div>
                            {l.level && <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>{l.level}</div>}
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications">
                <SectionTitle title="Chung chi" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', padding: '8px 12px', background: `${color}06`, borderLeft: `3px solid ${color}`, borderRadius: '0 4px 4px 0' }}>
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
                <SectionTitle title="Hoat dong ngoai khoa" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: `2px solid ${color}30` }}>
                        <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize}px` }}>{act.role}</div>
                        <div style={{ color: color, fontSize: `${baseFontSize - 1}px`, marginTop: '2px' }}>{act.organization}</div>
                        {act.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing }}>{act.description}</p>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ width: '794px', minHeight: '1123px', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', 'Helvetica Neue', Arial, sans-serif", fontSize: `${baseFontSize}px`, lineHeight: lineSpacing, background, boxSizing: 'border-box' }}>
            {/* Full-width dark header */}
            <div style={{ background: '#1e293b', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Left: avatar + name */}
                    <div style={{ flex: 1, padding: '28px 28px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        {personalInfo.avatarUrl ? (
                            <img src={personalInfo.avatarUrl} alt="avatar"
                                style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: '75px', height: '75px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', border: '3px solid rgba(255,255,255,0.2)' }}>
                                {(personalInfo.fullName || 'A').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h1 style={{ margin: '0 0 5px', fontSize: `${baseFontSize + 12}px`, fontWeight: '800', color: 'white', letterSpacing: '0.5px', lineHeight: '1.1' }}>
                                {personalInfo.fullName || 'Ho va Ten'}
                            </h1>
                            {personalInfo.title && (
                                <div style={{ fontSize: `${baseFontSize + 1}px`, color: 'rgba(255,255,255,0.7)', fontWeight: '400' }}>
                                    {personalInfo.title}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right: colored accent strip with contact info */}
                    <div style={{ width: '240px', flexShrink: 0, background: color, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '7px' }}>
                        {personalInfo.phone && (
                            <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', fontSize: '10px', color: 'rgba(255,255,255,0.9)' }}>
                                <Phone size={10} style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.email && (
                            <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', fontSize: '10px', color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all' }}>
                                <Mail size={10} style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.address && (
                            <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', fontSize: '10px', color: 'rgba(255,255,255,0.9)' }}>
                                <MapPin size={10} style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.address}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', fontSize: '10px', color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all' }}>
                                <FaLinkedin style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.linkedin}</span>
                            </div>
                        )}
                        {personalInfo.github && (
                            <div style={{ display: 'flex', gap: '7px', alignItems: 'flex-start', fontSize: '10px', color: 'rgba(255,255,255,0.9)', wordBreak: 'break-all' }}>
                                <FaGithub style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.github}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Single-column body */}
            <div style={{ padding: '4px 36px 36px' }}>
                {order.map((key) => sections[key] || null)}
            </div>
        </div>
    );
}
