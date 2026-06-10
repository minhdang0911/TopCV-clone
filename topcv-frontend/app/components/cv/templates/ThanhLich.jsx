import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_SECTION_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionTitle({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', marginTop: '22px' }}>
            <div style={{ width: '3px', height: '16px', background: color, borderRadius: '2px', marginRight: '12px', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#6b7280' }}>{title}</span>
        </div>
    );
}

function Divider() {
    return <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '4px' }} />;
}

export default function ThanhLichTemplate({ content = {}, color = '#00b14f', fontSize = 'medium', lineSpacing = 1.5, background = 'white' }) {
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
                <Divider />
            </div>
        ) : null,

        experiences: experiences.length > 0 && !hiddenSections.includes('experiences') ? (
            <div key="experiences">
                <SectionTitle title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px`, lineHeight: '1.3' }}>{exp.position}</div>
                                <div style={{ color: color, fontWeight: '600', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{exp.company}</div>
                            </div>
                            <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '16px', marginTop: '3px', fontStyle: 'italic' }}>
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
                <Divider />
            </div>
        ) : null,

        education: education.length > 0 && !hiddenSections.includes('education') ? (
            <div key="education">
                <SectionTitle title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{edu.school}</div>
                            <div style={{ color: '#4b5563', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{edu.degree}</div>
                            {edu.gpa && <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>GPA: {edu.gpa}</div>}
                            {edu.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing }}>{edu.description}</p>}
                        </div>
                        <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '16px', marginTop: '3px', fontStyle: 'italic' }}>
                            {edu.startDate}{edu.startDate ? ' - ' : ''}{edu.endDate}
                        </div>
                    </div>
                ))}
                <Divider />
            </div>
        ) : null,

        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills">
                <SectionTitle title="Ky nang" color={color} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    {skills.map((s, i) => (
                        <span key={s.id || i} style={{ padding: '4px 12px', border: `1.5px solid ${color}`, borderRadius: '20px', fontSize: `${baseFontSize - 1}px`, color: color, fontWeight: '500', background: `${color}10` }}>
                            {s.name}
                        </span>
                    ))}
                </div>
                <Divider />
            </div>
        ) : null,

        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages">
                <SectionTitle title="Ngon ngu" color={color} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '8px' }}>
                    {languages.map((l, i) => (
                        <div key={l.id || i} style={{ fontSize: `${baseFontSize}px` }}>
                            <span style={{ fontWeight: '600', color: '#111827' }}>{l.name}</span>
                            {l.level && <span style={{ color: '#9ca3af', marginLeft: '6px' }}>{l.level}</span>}
                        </div>
                    ))}
                </div>
                <Divider />
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications">
                <SectionTitle title="Chung chi" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                            <span style={{ fontWeight: '600', color: '#111827', fontSize: `${baseFontSize}px` }}>{cert.name}</span>
                            {cert.issuer && <span style={{ color: '#9ca3af', fontSize: `${baseFontSize - 1}px`, marginLeft: '6px' }}>{cert.issuer}</span>}
                        </div>
                        {cert.date && <span style={{ color: '#9ca3af', fontSize: '10px', flexShrink: 0, marginLeft: '12px' }}>{cert.date}</span>}
                    </div>
                ))}
                <Divider />
            </div>
        ) : null,

        activities: activities.length > 0 && !hiddenSections.includes('activities') ? (
            <div key="activities">
                <SectionTitle title="Hoat dong ngoai khoa" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '12px' }}>
                        <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize}px` }}>{act.role}</div>
                        <div style={{ color: color, fontSize: `${baseFontSize - 1}px`, marginTop: '2px' }}>{act.organization}</div>
                        {act.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing }}>{act.description}</p>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ width: '794px', minHeight: '1123px', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: `${baseFontSize}px`, lineHeight: lineSpacing, background, boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ padding: '36px 48px 28px', borderBottom: `3px solid ${color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    {/* Avatar */}
                    {personalInfo.avatarUrl ? (
                        <img
                            src={personalInfo.avatarUrl}
                            alt="avatar"
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: `2px solid ${color}30` }}
                        />
                    ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${color}15`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: color, border: `2px solid ${color}30` }}>
                            {(personalInfo.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                    {/* Name & title */}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: '0 0 4px', fontSize: `${baseFontSize + 14}px`, fontWeight: '700', color: '#111827', letterSpacing: '0.5px', lineHeight: '1.1' }}>
                            {personalInfo.fullName || 'Ho va Ten'}
                        </h1>
                        {personalInfo.title && (
                            <div style={{ fontSize: `${baseFontSize + 2}px`, color: '#6b7280', fontWeight: '400', fontStyle: 'italic', marginTop: '4px' }}>
                                {personalInfo.title}
                            </div>
                        )}
                        {/* Contact row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '10px' }}>
                            {personalInfo.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
                                    <Phone size={10} color={color} /> {personalInfo.phone}
                                </span>
                            )}
                            {personalInfo.email && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
                                    <Mail size={10} color={color} /> {personalInfo.email}
                                </span>
                            )}
                            {personalInfo.address && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
                                    <MapPin size={10} color={color} /> {personalInfo.address}
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
                                    <FaLinkedin style={{ color, flexShrink: 0 }} /> {personalInfo.linkedin}
                                </span>
                            )}
                            {personalInfo.github && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6b7280' }}>
                                    <FaGithub style={{ color, flexShrink: 0 }} /> {personalInfo.github}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '0 48px 36px' }}>
                {order.map((key) => sections[key] || null)}
            </div>
        </div>
    );
}
