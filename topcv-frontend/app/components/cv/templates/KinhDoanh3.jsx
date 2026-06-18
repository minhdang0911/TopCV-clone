import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionHeader({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{ width: '3px', height: '18px', background: color, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.6px', color: '#1a1a1a' }}>{title}</span>
            <div style={{ flex: 1, height: '1px', background: '#e8e8e8' }} />
        </div>
    );
}

export default function KinhDoanh3Template({ content = {}, color = '#27ae60', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    const sectionMap = {
        objective: objective && !hiddenSections.includes('objective') ? (
            <div key="objective" style={{ marginBottom: '24px' }}>
                <SectionHeader title="Muc tieu nghe nghiep" color={color} />
                <p style={{ fontSize: `${base}px`, color: '#555', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap', paddingLeft: '13px' }}>{objective}</p>
            </div>
        ) : null,

        experiences: experiences.length > 0 && !hiddenSections.includes('experiences') ? (
            <div key="experiences" style={{ marginBottom: '24px' }}>
                <SectionHeader title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '18px', paddingLeft: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111' }}>{exp.position}</div>
                            <div style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap', marginLeft: '8px' }}>
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

        education: education.length > 0 && !hiddenSections.includes('education') ? (
            <div key="education" style={{ marginBottom: '24px' }}>
                <SectionHeader title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ marginBottom: '14px', paddingLeft: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                            <div style={{ fontSize: `${base - 1}px`, color: '#666', marginTop: '2px' }}>{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                            {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#999', fontStyle: 'italic', marginTop: '2px' }}>{edu.description}</div>}
                        </div>
                        <div style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap', marginLeft: '16px' }}>{edu.startDate}{edu.startDate ? ' – ' : ''}{edu.endDate}</div>
                    </div>
                ))}
            </div>
        ) : null,

        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills" style={{ marginBottom: '24px' }}>
                <SectionHeader title="Ky nang" color={color} />
                <div style={{ paddingLeft: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                    {skills.map((sk, i) => (
                        <div key={sk.id || i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: `${base - 1}px`, color: '#444' }}>
                                {sk.name}{sk.level ? <span style={{ color: '#aaa' }}> – {sk.level}</span> : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages" style={{ marginBottom: '24px' }}>
                <SectionHeader title="Ngoai ngu" color={color} />
                <div style={{ paddingLeft: '13px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                    {languages.map((lang, i) => (
                        <div key={lang.id || i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                            <span style={{ fontSize: `${base - 1}px`, color: '#444' }}>
                                <strong style={{ color: '#222', fontWeight: '600' }}>{lang.name}</strong>
                                {lang.level ? <span style={{ color: '#aaa' }}> – {lang.level}</span> : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications" style={{ marginBottom: '24px' }}>
                <SectionHeader title="Chung chi & Giai thuong" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px', paddingLeft: '13px' }}>
                        <div>
                            <span style={{ fontSize: `${base}px`, fontWeight: '600', color: '#222' }}>{cert.name}</span>
                            {cert.issuer && <span style={{ fontSize: `${base - 1}px`, color: '#888', marginLeft: '6px' }}>{cert.issuer}</span>}
                        </div>
                        {cert.date && <div style={{ fontSize: '10px', color: '#aaa', whiteSpace: 'nowrap', marginLeft: '12px' }}>{cert.date}</div>}
                    </div>
                ))}
            </div>
        ) : null,

        activities: activities.length > 0 && !hiddenSections.includes('activities') ? (
            <div key="activities" style={{ marginBottom: '24px' }}>
                <SectionHeader title="Hoat dong ngoai khoa" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '12px', paddingLeft: '13px' }}>
                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                            {act.role || act.name}
                            {act.organization && <span style={{ fontWeight: '400', color: '#888' }}> — {act.organization}</span>}
                        </div>
                        {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing, marginTop: '3px' }}>{act.description}</div>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ width: '794px', minHeight: '1122px', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px` }}>
            {/* Top accent border */}
            <div style={{ height: '5px', background: color }} />

            {/* Header */}
            <div style={{ padding: '28px 44px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {/* Avatar */}
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}40`, flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${color}15`, border: `2px solid ${color}40`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: '800', color: color }}>
                            {(personalInfo.fullName || 'K').charAt(0).toUpperCase()}
                        </div>
                    )}

                    {/* Name + title */}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '22px', fontWeight: '800', color: '#111', lineHeight: 1.15, marginBottom: '3px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                        <div style={{ fontSize: '12px', color: color, fontWeight: '600', marginBottom: '10px' }}>{personalInfo.title || 'Nhan Vien Kinh Doanh'}</div>
                        {/* Contact chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {personalInfo.phone && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#555', background: '#f4f4f4', padding: '3px 10px', borderRadius: '20px' }}>
                                    <Phone size={9} color={color} />{personalInfo.phone}
                                </span>
                            )}
                            {personalInfo.email && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#555', background: '#f4f4f4', padding: '3px 10px', borderRadius: '20px' }}>
                                    <Mail size={9} color={color} />{personalInfo.email}
                                </span>
                            )}
                            {personalInfo.address && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#555', background: '#f4f4f4', padding: '3px 10px', borderRadius: '20px' }}>
                                    <MapPin size={9} color={color} />{personalInfo.address}
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#555', background: '#f4f4f4', padding: '3px 10px', borderRadius: '20px' }}>
                                    <FaLinkedin style={{ fontSize: '9px', color: color }} />{personalInfo.linkedin}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#e8e8e8', margin: '0 44px' }} />

            {/* Body */}
            <div style={{ padding: '24px 44px 36px' }}>
                {order.map(key => sectionMap[key] || null)}
            </div>
        </div>
    );
}
