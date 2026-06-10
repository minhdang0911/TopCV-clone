import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

function Section({ title, color, children }) {
    return (
        <div style={{ marginBottom: '18px' }}>
            <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#111827' }}>{title}</span>
            </div>
            {children}
        </div>
    );
}

export default function TieuChuanItKNTemplate({ content = {}, color = '#00b14f', fontSize = 'medium', background = 'white' }) {
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
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: `${baseFontSize}px`, lineHeight: '1.6', background, minHeight: '100%' }}>
            {/* Header */}
            <div style={{ background: color, color: 'white', padding: '28px 28px 20px' }}>
                <h1 style={{ margin: '0 0 4px', fontSize: `${baseFontSize + 10}px`, fontWeight: '800', letterSpacing: '1px' }}>
                    {personalInfo.fullName || 'Họ và Tên'}
                </h1>
                {personalInfo.title && (
                    <div style={{ fontSize: `${baseFontSize + 2}px`, opacity: 0.9, fontWeight: '500', marginBottom: '12px' }}>
                        {personalInfo.title}
                    </div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', opacity: 0.9 }}>
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

            {/* Body */}
            <div style={{ padding: '24px 28px' }}>
                {objective && (
                    <Section title="Mục tiêu nghề nghiệp" color={color}>
                        <p style={{ color: '#374151', margin: 0, fontSize: `${baseFontSize}px` }}>{objective}</p>
                    </Section>
                )}

                {education.length > 0 && (
                    <Section title="Học vấn" color={color}>
                        {education.map((edu, i) => (
                            <div key={edu.id || i} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{edu.school}</div>
                                    <div style={{ color: '#4b5563' }}>{edu.degree}</div>
                                    {edu.gpa && <div style={{ color: color, fontSize: '11px', fontWeight: '600' }}>GPA: {edu.gpa}</div>}
                                    {edu.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px` }}>{edu.description}</p>}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0, marginLeft: '12px', textAlign: 'right' }}>
                                    {edu.startDate}<br />{edu.endDate}
                                </div>
                            </div>
                        ))}
                    </Section>
                )}

                {skills.length > 0 && (
                    <Section title="Kỹ năng" color={color}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {skills.map((s, i) => (
                                <span
                                    key={s.id || i}
                                    style={{
                                        padding: '4px 12px',
                                        background: `${color}15`,
                                        color: color,
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        border: `1px solid ${color}40`,
                                    }}
                                >
                                    {s.name}
                                </span>
                            ))}
                        </div>
                    </Section>
                )}

                {experiences.length > 0 && (
                    <Section title="Kinh nghiệm làm việc" color={color}>
                        {experiences.map((exp, i) => (
                            <div key={exp.id || i} style={{ marginBottom: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{exp.position}</div>
                                        <div style={{ color: color, fontWeight: '600' }}>{exp.company}</div>
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px' }}>
                                        {exp.startDate} - {exp.isCurrent ? 'Hiện tại' : exp.endDate}
                                    </div>
                                </div>
                                {exp.description && (
                                    <p style={{ color: '#4b5563', margin: '6px 0 0', fontSize: `${baseFontSize - 1}px`, whiteSpace: 'pre-wrap' }}>
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </Section>
                )}

                {activities.length > 0 && (
                    <Section title="Hoạt động ngoại khóa" color={color}>
                        {activities.map((act, i) => (
                            <div key={act.id || i} style={{ marginBottom: '10px' }}>
                                <div style={{ fontWeight: '700', color: '#111827' }}>{act.role}</div>
                                <div style={{ color: '#6b7280' }}>{act.organization}</div>
                                {act.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px` }}>{act.description}</p>}
                            </div>
                        ))}
                    </Section>
                )}

                {(languages.length > 0 || certifications.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {languages.length > 0 && (
                            <Section title="Ngôn ngữ" color={color}>
                                {languages.map((l, i) => (
                                    <div key={l.id || i} style={{ marginBottom: '4px', fontSize: `${baseFontSize - 1}px`, color: '#374151' }}>
                                        <span style={{ fontWeight: '600' }}>{l.name}</span>
                                        {l.level && <span style={{ color: '#9ca3af' }}> — {l.level}</span>}
                                    </div>
                                ))}
                            </Section>
                        )}
                        {certifications.length > 0 && (
                            <Section title="Chứng chỉ" color={color}>
                                {certifications.map((cert, i) => (
                                    <div key={cert.id || i} style={{ marginBottom: '6px', fontSize: `${baseFontSize - 1}px`, color: '#374151' }}>
                                        <div style={{ fontWeight: '600' }}>{cert.name}</div>
                                        {cert.issuer && <div style={{ color: '#9ca3af' }}>{cert.issuer}</div>}
                                    </div>
                                ))}
                            </Section>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
