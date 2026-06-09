import { Mail, Phone, MapPin, Linkedin, Github } from 'lucide-react';

function Section({ title, color, children }) {
    return (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '6px', height: '6px', background: color, borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827' }}>{title}</span>
                <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            </div>
            {children}
        </div>
    );
}

export default function AnTuongTemplate({ content = {}, color = '#1e3a5f', fontSize = 'medium' }) {
    const {
        personalInfo = {},
        objective = '',
        experiences = [],
        education = [],
        skills = [],
        certifications = [],
        languages = [],
        activities = [],
    } = content;

    const baseFontSize = fontSize === 'small' ? 11 : fontSize === 'large' ? 13 : 12;

    return (
        <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: `${baseFontSize}px`, lineHeight: '1.6', background: 'white', minHeight: '100%' }}>
            {/* Dark header */}
            <div style={{ background: color, color: 'white', padding: '32px 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Avatar */}
                    {personalInfo.avatarUrl ? (
                        <img
                            src={personalInfo.avatarUrl}
                            alt="avatar"
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.3)', flexShrink: 0 }}
                        />
                    ) : (
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700' }}>
                            {(personalInfo.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h1 style={{ margin: '0 0 4px', fontSize: `${baseFontSize + 10}px`, fontWeight: '800', letterSpacing: '0.5px' }}>
                            {personalInfo.fullName || 'Ho va Ten'}
                        </h1>
                        {personalInfo.title && (
                            <div style={{ fontSize: `${baseFontSize + 2}px`, opacity: 0.8, fontWeight: '400', letterSpacing: '0.5px' }}>
                                {personalInfo.title}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', fontSize: '11px', opacity: 0.85 }}>
                    {personalInfo.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Phone size={11} /> {personalInfo.phone}
                        </span>
                    )}
                    {personalInfo.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Mail size={11} /> {personalInfo.email}
                        </span>
                    )}
                    {personalInfo.address && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <MapPin size={11} /> {personalInfo.address}
                        </span>
                    )}
                    {personalInfo.linkedin && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Linkedin size={11} /> {personalInfo.linkedin}
                        </span>
                    )}
                    {personalInfo.github && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Github size={11} /> {personalInfo.github}
                        </span>
                    )}
                </div>
            </div>

            {/* Body: 2-column */}
            <div style={{ display: 'flex', gap: 0 }}>
                {/* Main column */}
                <div style={{ flex: 1, padding: '24px 24px 24px 28px', borderRight: '1px solid #f3f4f6' }}>
                    {objective && (
                        <Section title="Gioi thieu ban than" color={color}>
                            <p style={{ color: '#374151', margin: 0 }}>{objective}</p>
                        </Section>
                    )}

                    {experiences.length > 0 && (
                        <Section title="Kinh nghiem" color={color}>
                            {experiences.map((exp, i) => (
                                <div key={exp.id || i} style={{ marginBottom: '16px', paddingLeft: '12px', borderLeft: `2px solid ${color}30` }}>
                                    <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{exp.position}</div>
                                    <div style={{ color: color, fontWeight: '600', fontSize: `${baseFontSize}px` }}>{exp.company}</div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', margin: '2px 0 6px' }}>
                                        {exp.startDate} - {exp.isCurrent ? 'Hien tai' : exp.endDate}
                                    </div>
                                    {exp.description && (
                                        <p style={{ color: '#4b5563', margin: 0, fontSize: `${baseFontSize - 1}px`, whiteSpace: 'pre-wrap' }}>
                                            {exp.description}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </Section>
                    )}

                    {activities.length > 0 && (
                        <Section title="Hoat dong" color={color}>
                            {activities.map((act, i) => (
                                <div key={act.id || i} style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: `2px solid ${color}30` }}>
                                    <div style={{ fontWeight: '700', color: '#111827' }}>{act.role}</div>
                                    <div style={{ color: '#6b7280' }}>{act.organization}</div>
                                    {act.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px` }}>{act.description}</p>}
                                </div>
                            ))}
                        </Section>
                    )}
                </div>

                {/* Side column */}
                <div style={{ width: '190px', flexShrink: 0, padding: '24px 16px 24px 20px' }}>
                    {education.length > 0 && (
                        <Section title="Hoc van" color={color}>
                            {education.map((edu, i) => (
                                <div key={edu.id || i} style={{ marginBottom: '12px' }}>
                                    <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize}px` }}>{edu.school}</div>
                                    <div style={{ color: '#4b5563', fontSize: '11px' }}>{edu.degree}</div>
                                    {edu.gpa && <div style={{ color: color, fontSize: '10px', fontWeight: '600' }}>GPA: {edu.gpa}</div>}
                                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>{edu.startDate} - {edu.endDate}</div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {skills.length > 0 && (
                        <Section title="Ky nang" color={color}>
                            {skills.map((s, i) => (
                                <div key={s.id || i} style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px', fontSize: '11px', color: '#374151', fontWeight: '500' }}>
                                        <span>{s.name}</span>
                                    </div>
                                    <div style={{ height: '3px', background: '#e5e7eb', borderRadius: '2px' }}>
                                        <div style={{ height: '100%', width: `${((s.level || 3) / 5) * 100}%`, background: color, borderRadius: '2px' }} />
                                    </div>
                                </div>
                            ))}
                        </Section>
                    )}

                    {languages.length > 0 && (
                        <Section title="Ngon ngu" color={color}>
                            {languages.map((l, i) => (
                                <div key={l.id || i} style={{ marginBottom: '4px', fontSize: '11px', color: '#374151' }}>
                                    <span style={{ fontWeight: '600' }}>{l.name}</span>
                                    {l.level && <span style={{ color: '#9ca3af' }}> — {l.level}</span>}
                                </div>
                            ))}
                        </Section>
                    )}

                    {certifications.length > 0 && (
                        <Section title="Chung chi" color={color}>
                            {certifications.map((cert, i) => (
                                <div key={cert.id || i} style={{ marginBottom: '8px', fontSize: '11px' }}>
                                    <div style={{ fontWeight: '600', color: '#111827' }}>{cert.name}</div>
                                    {cert.issuer && <div style={{ color: '#9ca3af' }}>{cert.issuer}</div>}
                                    {cert.date && <div style={{ color: '#9ca3af' }}>{cert.date}</div>}
                                </div>
                            ))}
                        </Section>
                    )}
                </div>
            </div>
        </div>
    );
}
