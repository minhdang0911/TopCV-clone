import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_SECTION_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '12px', marginTop: '20px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '4px' }}>{title}</div>
            <div style={{ height: '2px', background: color, width: '100%' }} />
        </div>
    );
}

function TimelineDot({ color }) {
    return (
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, marginTop: '5px', boxShadow: `0 0 0 2px ${color}30` }} />
    );
}

export default function ChuyenNghiepTemplate({ content = {}, color = '#1e3a5f', fontSize = 'medium', lineSpacing = 1.5, background = 'white' }) {
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
                    <div key={exp.id || i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <TimelineDot color={color} />
                        <div style={{ flex: 1, paddingBottom: i < experiences.length - 1 ? '8px' : 0, borderLeft: i < experiences.length - 1 ? `1px dashed ${color}40` : 'none', marginLeft: '-16px', paddingLeft: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{exp.position}</div>
                                    <div style={{ color: color, fontWeight: '600', fontSize: `${baseFontSize}px`, marginTop: '2px' }}>{exp.company}</div>
                                </div>
                                <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px', fontStyle: 'italic' }}>
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
                    <div key={edu.id || i} style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                        <TimelineDot color={color} />
                        <div style={{ flex: 1, marginLeft: '-16px', paddingLeft: '20px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', marginBottom: '4px' }}>
                    {skills.map((s, i) => (
                        <div key={s.id || i} style={{ marginBottom: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: `${baseFontSize - 1}px`, color: '#374151' }}>
                                <span style={{ fontWeight: '500' }}>{s.name}</span>
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
                        <div key={l.id || i} style={{ fontSize: `${baseFontSize}px` }}>
                            <span style={{ fontWeight: '600', color: '#111827' }}>{l.name}</span>
                            {l.level && <span style={{ color: '#9ca3af', marginLeft: '6px' }}>{l.level}</span>}
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications">
                <SectionTitle title="Chung chi" color={color} />
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
                <SectionTitle title="Hoat dong ngoai khoa" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <TimelineDot color={color} />
                        <div style={{ flex: 1, marginLeft: '-16px', paddingLeft: '20px' }}>
                            <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize}px` }}>{act.role}</div>
                            <div style={{ color: color, fontSize: `${baseFontSize - 1}px`, marginTop: '2px' }}>{act.organization}</div>
                            {act.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px`, lineHeight: lineSpacing }}>{act.description}</p>}
                        </div>
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ width: '794px', minHeight: '1123px', fontFamily: 'Arial, sans-serif', fontSize: `${baseFontSize}px`, lineHeight: lineSpacing, background, boxSizing: 'border-box' }}>
            {/* Colored header block */}
            <div style={{ background: color, minHeight: '120px', padding: '28px 36px 24px', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar"
                            style={{ width: '75px', height: '75px', borderRadius: '4px', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: '75px', height: '75px', borderRadius: '4px', background: 'rgba(255,255,255,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', border: '3px solid rgba(255,255,255,0.3)' }}>
                            {(personalInfo.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <h1 style={{ margin: '0 0 4px', fontSize: `${baseFontSize + 12}px`, fontWeight: '800', color: 'white', letterSpacing: '1px' }}>
                            {personalInfo.fullName || 'Ho va Ten'}
                        </h1>
                        {personalInfo.title && (
                            <div style={{ fontSize: `${baseFontSize + 1}px`, opacity: 0.85, fontWeight: '400', marginBottom: '10px' }}>
                                {personalInfo.title}
                            </div>
                        )}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '10px', opacity: 0.9 }}>
                            {personalInfo.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Phone size={10} /> {personalInfo.phone}
                                </span>
                            )}
                            {personalInfo.email && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Mail size={10} /> {personalInfo.email}
                                </span>
                            )}
                            {personalInfo.address && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <MapPin size={10} /> {personalInfo.address}
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FaLinkedin style={{ flexShrink: 0 }} /> {personalInfo.linkedin}
                                </span>
                            )}
                            {personalInfo.github && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FaGithub style={{ flexShrink: 0 }} /> {personalInfo.github}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '8px 36px 36px' }}>
                {order.map((key) => sections[key] || null)}
            </div>
        </div>
    );
}
