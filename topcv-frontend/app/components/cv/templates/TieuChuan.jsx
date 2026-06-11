import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

function Section({ title, color, children }) {
    return (
        <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color }}>{title}</span>
                <div style={{ flex: 1, height: '2px', background: color, opacity: 0.25 }} />
            </div>
            {children}
        </div>
    );
}

function SkillBar({ name, level }) {
    return (
        <div style={{ marginBottom: '8px' }}>
            <div style={{ marginBottom: '3px' }}>
                <span style={{ fontSize: '11px', color: 'white' }}>{name}</span>
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.25)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${(level / 5) * 100}%`, background: 'white', borderRadius: '2px' }} />
            </div>
        </div>
    );
}

export default function TieuChuanTemplate({ content = {}, color = '#00b14f', fontSize = 'medium', background = 'white' }) {
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
        <div style={{ display: 'flex', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", fontSize: `${baseFontSize}px`, lineHeight: '1.55', background }}>
            {/* LEFT SIDEBAR */}
            <div style={{ width: '200px', flexShrink: 0, background: color, padding: '24px 16px', color: 'white' }}>
                {/* Avatar */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    {personalInfo.avatarUrl ? (
                        <img
                            src={personalInfo.avatarUrl}
                            alt="avatar"
                            style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }}
                        />
                    ) : (
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '700', color: 'white' }}>
                            {(personalInfo.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Contact */}
                {(personalInfo.phone || personalInfo.email || personalInfo.address) && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '8px' }}>Liên hệ</div>
                        {personalInfo.phone && (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '11px' }}>
                                <Phone size={11} style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.email && (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '11px', wordBreak: 'break-all' }}>
                                <Mail size={11} style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.address && (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '11px' }}>
                                <MapPin size={11} style={{ marginTop: '1px', flexShrink: 0 }} />
                                <span>{personalInfo.address}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '11px', wordBreak: 'break-all' }}>
                                <FaLinkedin style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span>{personalInfo.linkedin}</span>
                            </div>
                        )}
                        {personalInfo.github && (
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', marginBottom: '5px', fontSize: '11px', wordBreak: 'break-all' }}>
                                <FaGithub style={{ marginTop: '2px', flexShrink: 0 }} />
                                <span>{personalInfo.github}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '8px' }}>Kỹ năng</div>
                        {skills.map((s, i) => (
                            <SkillBar key={s.id || i} name={s.name} level={s.level || 3} />
                        ))}
                    </div>
                )}

                {/* Languages */}
                {languages.length > 0 && (
                    <div>
                        <div style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7, marginBottom: '8px' }}>Ngôn ngữ</div>
                        {languages.map((l, i) => (
                            <div key={l.id || i} style={{ fontSize: '11px', marginBottom: '4px' }}>
                                <span>{l.name}</span>
                                {l.level && <span style={{ opacity: 0.7 }}> — {l.level}</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT MAIN */}
            <div style={{ flex: 1, padding: '24px 20px', background: 'white' }}>
                {/* Name & Title */}
                <div style={{ marginBottom: '20px', borderBottom: `2px solid ${color}`, paddingBottom: '14px' }}>
                    <h1 style={{ fontSize: `${baseFontSize + 8}px`, fontWeight: '800', color: color, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {personalInfo.fullName || 'Họ và Tên'}
                    </h1>
                    {personalInfo.title && (
                        <div style={{ fontSize: `${baseFontSize + 1}px`, color: '#374151', fontWeight: '500' }}>
                            {personalInfo.title}
                        </div>
                    )}
                </div>

                {objective && (
                    <Section title="Mục tiêu nghề nghiệp" color={color}>
                        <p style={{ color: '#374151', margin: 0, fontSize: `${baseFontSize}px` }}>{objective}</p>
                    </Section>
                )}

                {experiences.length > 0 && (
                    <Section title="Kinh nghiệm làm việc" color={color}>
                        {experiences.map((exp, i) => (
                            <div key={exp.id || i} style={{ marginBottom: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{exp.position}</div>
                                        <div style={{ color: color, fontWeight: '600', fontSize: `${baseFontSize}px` }}>{exp.company}</div>
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

                {education.length > 0 && (
                    <Section title="Học vấn" color={color}>
                        {education.map((edu, i) => (
                            <div key={edu.id || i} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize + 1}px` }}>{edu.school}</div>
                                        <div style={{ color: '#4b5563', fontSize: `${baseFontSize}px` }}>{edu.degree}</div>
                                        {edu.gpa && <div style={{ color: '#9ca3af', fontSize: '10px' }}>GPA: {edu.gpa}</div>}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', flexShrink: 0, marginLeft: '8px' }}>
                                        {edu.startDate} - {edu.endDate}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Section>
                )}

                {certifications.length > 0 && (
                    <Section title="Chứng chỉ" color={color}>
                        {certifications.map((cert, i) => (
                            <div key={cert.id || i} style={{ marginBottom: '6px', fontSize: `${baseFontSize - 1}px`, color: '#374151' }}>
                                <span style={{ fontWeight: '600' }}>{cert.name}</span>
                                {cert.issuer && <span style={{ color: '#9ca3af' }}> — {cert.issuer}</span>}
                                {cert.date && <span style={{ color: '#9ca3af' }}> ({cert.date})</span>}
                            </div>
                        ))}
                    </Section>
                )}

                {activities.length > 0 && (
                    <Section title="Hoạt động ngoại khóa" color={color}>
                        {activities.map((act, i) => (
                            <div key={act.id || i} style={{ marginBottom: '10px' }}>
                                <div style={{ fontWeight: '700', color: '#111827', fontSize: `${baseFontSize}px` }}>{act.role}</div>
                                <div style={{ color: '#4b5563', fontSize: `${baseFontSize - 1}px` }}>{act.organization}</div>
                                {act.description && <p style={{ color: '#6b7280', margin: '4px 0 0', fontSize: `${baseFontSize - 1}px` }}>{act.description}</p>}
                            </div>
                        ))}
                    </Section>
                )}
            </div>
        </div>
    );
}
