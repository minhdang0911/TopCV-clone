import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_SECTION_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SidebarSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px', marginTop: '18px' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: color, marginBottom: '6px' }}>{title}</div>
            <div style={{ height: '1px', background: `${color}40` }} />
        </div>
    );
}

function MainSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '12px', marginTop: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: color }}>{title}</div>
            <div style={{ height: '2px', background: `${color}30`, marginTop: '4px' }} />
        </div>
    );
}

function SkillBar({ name, level, color }) {
    const pct = ((level || 3) / 5) * 100;
    return (
        <div style={{ marginBottom: '9px' }}>
            <div style={{ fontSize: '10px', color: '#374151', marginBottom: '3px', fontWeight: '500' }}>{name}</div>
            <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }} />
            </div>
        </div>
    );
}

export default function HienDaiTemplate({ content = {}, color = '#0ea5e9', fontSize = 'medium', lineSpacing = 1.5, background = 'white' }) {
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

    // Sidebar sections
    const sidebarSections = ['skills', 'languages'];
    // Main sections
    const mainSections = ['objective', 'experiences', 'education', 'certifications', 'activities'];

    const sidebarMap = {
        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills">
                <SidebarSectionTitle title="Ky nang" color={color} />
                {skills.map((s, i) => (
                    <SkillBar key={s.id || i} name={s.name} level={s.level} color={color} />
                ))}
            </div>
        ) : null,
        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages">
                <SidebarSectionTitle title="Ngon ngu" color={color} />
                {languages.map((l, i) => (
                    <div key={l.id || i} style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '600', color: '#374151' }}>{l.name}</div>
                        {l.level && <div style={{ fontSize: '9px', color: '#6b7280' }}>{l.level}</div>}
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
                    <div key={exp.id || i} style={{ marginBottom: '14px', paddingLeft: '10px', borderLeft: `2px solid ${color}40` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{exp.position}</div>
                                <div style={{ color: color, fontWeight: '600', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{exp.company}</div>
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px' }}>
                                {exp.startDate}{exp.startDate ? ' - ' : ''}{exp.isCurrent ? 'Hien tai' : exp.endDate}
                            </div>
                        </div>
                        {exp.description && (
                            <p style={{ color: '#4b5563', margin: '5px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>
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
                    <div key={edu.id || i} style={{ marginBottom: '12px', paddingLeft: '10px', borderLeft: `2px solid ${color}40` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{edu.school}</div>
                                <div style={{ color: '#4b5563', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{edu.degree}</div>
                                {edu.gpa && <div style={{ color: '#9ca3af', fontSize: '10px' }}>GPA: {edu.gpa}</div>}
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px' }}>
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
                    <div key={cert.id || i} style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ fontWeight: '600', color: '#111827', fontSize: `${baseFontSize}px` }}>{cert.name}</span>
                            {cert.issuer && <div style={{ color: '#9ca3af', fontSize: `${baseFontSize - 1}px` }}>{cert.issuer}</div>}
                        </div>
                        {cert.date && <span style={{ color: '#9ca3af', fontSize: '10px', flexShrink: 0, marginLeft: '8px' }}>{cert.date}</span>}
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
        <div style={{ width: '794px', minHeight: '1123px', fontFamily: 'Arial, sans-serif', fontSize: `${baseFontSize}px`, lineHeight: lineSpacing, background, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            {/* Top header strip */}
            <div style={{ background: color, padding: '28px 24px 24px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar"
                            style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', border: '3px solid rgba(255,255,255,0.4)' }}>
                            {(personalInfo.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 style={{ margin: '0 0 4px', fontSize: `${baseFontSize + 10}px`, fontWeight: '800', letterSpacing: '0.5px', color: 'white' }}>
                            {personalInfo.fullName || 'Ho va Ten'}
                        </h1>
                        {personalInfo.title && (
                            <div style={{ fontSize: `${baseFontSize + 1}px`, opacity: 0.85, fontWeight: '400' }}>
                                {personalInfo.title}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Two column body */}
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left sidebar */}
                <div style={{ width: '200px', flexShrink: 0, background: '#f8f9fa', padding: '20px 16px', borderRight: '1px solid #e9ecef' }}>
                    {/* Contact info */}
                    <SidebarSectionTitle title="Thong tin lien he" color={color} />
                    {personalInfo.phone && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: '#374151' }}>
                            <Phone size={10} color={color} style={{ marginTop: '1px', flexShrink: 0 }} />
                            <span>{personalInfo.phone}</span>
                        </div>
                    )}
                    {personalInfo.email && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: '#374151', wordBreak: 'break-all' }}>
                            <Mail size={10} color={color} style={{ marginTop: '1px', flexShrink: 0 }} />
                            <span>{personalInfo.email}</span>
                        </div>
                    )}
                    {personalInfo.address && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: '#374151' }}>
                            <MapPin size={10} color={color} style={{ marginTop: '1px', flexShrink: 0 }} />
                            <span>{personalInfo.address}</span>
                        </div>
                    )}
                    {personalInfo.linkedin && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: '#374151', wordBreak: 'break-all' }}>
                            <FaLinkedin style={{ color, marginTop: '1px', flexShrink: 0 }} />
                            <span>{personalInfo.linkedin}</span>
                        </div>
                    )}
                    {personalInfo.github && (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '6px', fontSize: '10px', color: '#374151', wordBreak: 'break-all' }}>
                            <FaGithub style={{ color, marginTop: '1px', flexShrink: 0 }} />
                            <span>{personalInfo.github}</span>
                        </div>
                    )}

                    {/* Sidebar content in section order */}
                    {order.map((key) => sidebarSections.includes(key) ? (sidebarMap[key] || null) : null)}
                </div>

                {/* Right main content */}
                <div style={{ flex: 1, padding: '20px 24px' }}>
                    {order.map((key) => mainSections.includes(key) ? (mainMap[key] || null) : null)}
                </div>
            </div>
        </div>
    );
}
