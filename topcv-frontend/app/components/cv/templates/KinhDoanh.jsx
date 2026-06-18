import { Mail, Phone, MapPin, TrendingUp } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionHeader({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '4px', height: '16px', background: color, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#1a1a1a' }}>{title}</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>
    );
}

export default function KinhDoanhTemplate({ content = {}, color = '#d35400', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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
            <div key="objective" style={{ marginBottom: '20px' }}>
                <SectionHeader title="Muc tieu nghe nghiep" color={color} />
                <p style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap' }}>{objective}</p>
            </div>
        ) : null,

        experiences: experiences.length > 0 && !hiddenSections.includes('experiences') ? (
            <div key="experiences" style={{ marginBottom: '20px' }}>
                <SectionHeader title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '16px', paddingLeft: '14px', borderLeft: `3px solid ${color}25`, position: 'relative' }}>
                        <div style={{ position: 'absolute', left: -5, top: 6, width: 8, height: 8, borderRadius: '50%', background: color }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111' }}>{exp.position}</div>
                            <div style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '8px', marginTop: '2px' }}>
                                {exp.startDate}{exp.startDate ? ' – ' : ''}{exp.isCurrent ? 'Hien tai' : exp.endDate}
                            </div>
                        </div>
                        <div style={{ fontSize: `${base}px`, color: color, fontWeight: '600', marginBottom: '4px' }}>{exp.company}</div>
                        {exp.description && <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>}
                    </div>
                ))}
            </div>
        ) : null,

        education: education.length > 0 && !hiddenSections.includes('education') ? (
            <div key="education" style={{ marginBottom: '20px' }}>
                <SectionHeader title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                            <div style={{ fontSize: `${base - 1}px`, color: '#555' }}>{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                            {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', fontStyle: 'italic', marginTop: '2px' }}>{edu.description}</div>}
                        </div>
                        <div style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '12px' }}>{edu.startDate}{edu.startDate ? ' – ' : ''}{edu.endDate}</div>
                    </div>
                ))}
            </div>
        ) : null,

        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills" style={{ marginBottom: '20px' }}>
                <SectionHeader title="Ky nang" color={color} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                    {skills.map((sk, i) => (
                        <span key={sk.id || i} style={{ padding: '4px 12px', background: `${color}12`, color: color, borderRadius: '20px', fontSize: '11px', fontWeight: '600', border: `1px solid ${color}25` }}>{sk.name}</span>
                    ))}
                </div>
            </div>
        ) : null,

        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages" style={{ marginBottom: '20px' }}>
                <SectionHeader title="Ngoai ngu" color={color} />
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                    {languages.map((lang, i) => (
                        <span key={lang.id || i} style={{ fontSize: `${base}px`, color: '#444' }}>
                            <strong style={{ color: '#111' }}>{lang.name}</strong>: {lang.level}
                        </span>
                    ))}
                </div>
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications" style={{ marginBottom: '20px' }}>
                <SectionHeader title="Chung chi" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ fontSize: `${base}px`, fontWeight: '600', color: '#111' }}>{cert.name}</div>
                        <div style={{ fontSize: '10px', color: '#888' }}>{cert.issuer} {cert.date || cert.year}</div>
                    </div>
                ))}
            </div>
        ) : null,

        activities: activities.length > 0 && !hiddenSections.includes('activities') ? (
            <div key="activities" style={{ marginBottom: '20px' }}>
                <SectionHeader title="Hoat dong" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '8px' }}>
                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                            {act.role || act.name} <span style={{ color: '#777', fontWeight: '400' }}>– {act.organization}</span>
                        </div>
                        {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing }}>{act.description}</div>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px` }}>
            {/* Header */}
            <div style={{ background: color, padding: '28px 36px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '76px', height: '76px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.45)', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: '76px', height: '76px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>
                            {(personalInfo.fullName || 'K').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '21px', fontWeight: '800', color: 'white', lineHeight: 1.2, marginBottom: '3px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <TrendingUp size={12} color="rgba(255,255,255,0.7)" />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>{personalInfo.title || 'Nhan Vien Kinh Doanh'}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                            {personalInfo.phone && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={9} />{personalInfo.phone}</span>}
                            {personalInfo.email && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={9} />{personalInfo.email}</span>}
                            {personalInfo.address && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={9} />{personalInfo.address}</span>}
                            {personalInfo.linkedin && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.88)', display: 'flex', alignItems: 'center', gap: '4px' }}><FaLinkedin style={{ fontSize: '9px' }} />{personalInfo.linkedin}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Accent strip */}
            <div style={{ height: '4px', background: `${color}60` }} />

            {/* Body */}
            <div style={{ padding: '22px 36px 28px' }}>
                {order.map((key) => sectionMap[key] || null)}
            </div>
        </div>
    );
}
