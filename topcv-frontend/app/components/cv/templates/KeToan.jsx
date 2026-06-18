import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '20px', height: '2px', background: color }} />
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: color }}>{title}</span>
                <div style={{ flex: 1, height: '1px', background: color, opacity: 0.2 }} />
            </div>
        </div>
    );
}

export default function KeToanTemplate({ content = {}, color = '#1a3a6b', fontSize = 'medium', lineSpacing = 1.6, background = 'white' }) {
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

    return (
        <div style={{ minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px` }}>
            {/* Header: clean top bar + name block */}
            <div style={{ borderTop: `6px solid ${color}`, padding: '28px 40px 20px', background: '#fafbfc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: color, lineHeight: 1.2, marginBottom: '4px', letterSpacing: '-0.5px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#555', letterSpacing: '0.5px', marginBottom: '12px' }}>{personalInfo.title || 'Nhan Vien Ke Toan'}</div>
                        {personalInfo.address && (
                            <div style={{ fontSize: '10px', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <MapPin size={9} />{personalInfo.address}
                            </div>
                        )}
                    </div>
                    {/* Avatar */}
                    <div>
                        {personalInfo.avatarUrl ? (
                            <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '4px', border: `2px solid ${color}30` }} />
                        ) : (
                            <div style={{ width: '72px', height: '72px', borderRadius: '4px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: color, border: `2px solid ${color}20` }}>
                                {(personalInfo.fullName || 'K').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                </div>
                {/* Contact bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '12px', paddingTop: '10px', borderTop: `1px solid ${color}20` }}>
                    {personalInfo.phone && <span style={{ fontSize: '10px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={9} color={color} />{personalInfo.phone}</span>}
                    {personalInfo.email && <span style={{ fontSize: '10px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={9} color={color} />{personalInfo.email}</span>}
                    {personalInfo.linkedin && <span style={{ fontSize: '10px', color: '#555', display: 'flex', alignItems: 'center', gap: '4px' }}><FaLinkedin style={{ fontSize: '9px', color }} />{personalInfo.linkedin}</span>}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '0 40px 28px', background }}>
                {order.map((key) => {
                    if (hiddenSections.includes(key)) return null;

                    if (key === 'objective' && objective) return (
                        <div key="objective">
                            <SectionTitle title="Muc tieu nghe nghiep" color={color} />
                            <p style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{objective}</p>
                        </div>
                    );

                    if (key === 'experiences' && experiences.length > 0) return (
                        <div key="experiences">
                            <SectionTitle title="Kinh nghiem lam viec" color={color} />
                            {experiences.map((exp, i) => (
                                <div key={exp.id || i} style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: i < experiences.length - 1 ? '1px dashed #e5e7eb' : 'none' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                        <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111' }}>{exp.position}</div>
                                        <div style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '8px', fontStyle: 'italic' }}>{exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}</div>
                                    </div>
                                    <div style={{ fontSize: `${base}px`, color: color, fontWeight: '600', marginBottom: '4px' }}>{exp.company}</div>
                                    {exp.description && <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>}
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'education' && education.length > 0) return (
                        <div key="education">
                            <SectionTitle title="Hoc van" color={color} />
                            {education.map((edu, i) => (
                                <div key={edu.id || i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                                        <div style={{ fontSize: `${base}px`, color: '#555' }}>{edu.degree}{edu.gpa ? ` — GPA: ${edu.gpa}` : ''}</div>
                                        {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', fontStyle: 'italic', marginTop: '2px' }}>{edu.description}</div>}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '12px', fontStyle: 'italic' }}>{edu.startDate} – {edu.endDate}</div>
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'certifications' && certifications.length > 0) return (
                        <div key="certifications">
                            <SectionTitle title="Chung chi chuyen mon" color={color} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {certifications.map((cert, i) => (
                                    <div key={cert.id || i} style={{ background: `${color}08`, border: `1px solid ${color}20`, borderRadius: '4px', padding: '7px 10px' }}>
                                        <div style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#111' }}>{cert.name}</div>
                                        <div style={{ fontSize: '9px', color: '#888' }}>{cert.issuer} · {cert.date || cert.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'skills' && skills.length > 0) return (
                        <div key="skills">
                            <SectionTitle title="Ky nang chuyen mon" color={color} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                {skills.map((sk, i) => (
                                    <div key={sk.id || i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0' }}>
                                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                        <span style={{ fontSize: `${base}px`, color: '#333' }}>{sk.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'languages' && languages.length > 0) return (
                        <div key="languages">
                            <SectionTitle title="Ngoai ngu" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                                {languages.map((l, i) => (
                                    <span key={l.id || i} style={{ fontSize: `${base}px`, color: '#444' }}>
                                        <strong style={{ color: '#111' }}>{l.name}</strong>: {l.level}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'activities' && activities.length > 0) return (
                        <div key="activities">
                            <SectionTitle title="Hoat dong" color={color} />
                            {activities.map((act, i) => (
                                <div key={act.id || i} style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{act.role || act.name} <span style={{ color: '#777', fontWeight: '400' }}>– {act.organization}</span></div>
                                    {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing }}>{act.description}</div>}
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
