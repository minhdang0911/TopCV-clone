import { Mail, Phone, MapPin, Code2 } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SkillTag({ name, color }) {
    return (
        <span style={{ display: 'inline-block', padding: '3px 9px', background: `${color}18`, color: color, borderRadius: '4px', fontSize: '10px', fontWeight: '600', border: `1px solid ${color}30`, margin: '0 4px 5px 0' }}>{name}</span>
    );
}

function SideLabel({ title }) {
    return <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px', marginTop: '18px' }}>{title}</div>;
}

function MainSection({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '3px', height: '14px', background: color, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#111' }}>{title}</span>
            <div style={{ flex: 1, height: '1px', background: '#e9ecef' }} />
        </div>
    );
}

export default function LapTrinhVienCVTemplate({ content = {}, color = '#2c3e7a', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    const mainOrder = order.filter(k => !['skills', 'languages'].includes(k));
    const hasSidebarSkills = skills.length > 0 && !hiddenSections.includes('skills');
    const hasSidebarLang = languages.length > 0 && !hiddenSections.includes('languages');

    return (
        <div style={{ minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, display: 'flex', flexDirection: 'column', fontSize: `${base}px` }}>
            {/* Header */}
            <div style={{ background: color, padding: '26px 32px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px' }}>
                    {personalInfo.avatarUrl ? (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '72px', height: '72px', borderRadius: '8px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: '72px', height: '72px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800', color: 'white' }}>
                            {(personalInfo.fullName || 'L').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: 'white', lineHeight: 1.2, marginBottom: '3px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                            <Code2 size={11} color="rgba(255,255,255,0.65)" />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', fontFamily: 'monospace' }}>{personalInfo.title || 'Lap Trinh Vien'}</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            {personalInfo.phone && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={9} />{personalInfo.phone}</span>}
                            {personalInfo.email && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}><Mail size={9} />{personalInfo.email}</span>}
                            {personalInfo.address && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={9} />{personalInfo.address}</span>}
                            {personalInfo.github && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}><FaGithub style={{ fontSize: '9px' }} />{personalInfo.github}</span>}
                            {personalInfo.linkedin && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}><FaLinkedin style={{ fontSize: '9px' }} />{personalInfo.linkedin}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Body: sidebar + main */}
            <div style={{ display: 'flex', flex: 1 }}>
                {/* Sidebar */}
                <div style={{ width: '190px', flexShrink: 0, background: '#1e2a3b', padding: '20px 16px 24px', color: 'white' }}>
                    {hasSidebarSkills && (
                        <>
                            <SideLabel title="Ky nang" />
                            <div>{skills.map((sk, i) => (
                                <div key={sk.id || i} style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: '11px', color: 'white', marginBottom: '3px', fontWeight: '500' }}>{sk.name}</div>
                                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }}>
                                        <div style={{ height: '100%', width: `${((sk.level || 3) / 5) * 100}%`, background: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />
                                    </div>
                                </div>
                            ))}</div>
                        </>
                    )}
                    {hasSidebarLang && (
                        <>
                            <SideLabel title="Ngoai ngu" />
                            {languages.map((l, i) => (
                                <div key={l.id || i} style={{ marginBottom: '6px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: 'white' }}>{l.name}</div>
                                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{l.level}</div>
                                </div>
                            ))}
                        </>
                    )}
                    {certifications.length > 0 && !hiddenSections.includes('certifications') && (
                        <>
                            <SideLabel title="Chung chi" />
                            {certifications.map((cert, i) => (
                                <div key={cert.id || i} style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: '10px', fontWeight: '600', color: 'white', lineHeight: 1.4 }}>{cert.name}</div>
                                    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}>{cert.issuer} {cert.date || cert.year}</div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: '20px 28px 24px' }}>
                    {mainOrder.map((key) => {
                        if (hiddenSections.includes(key)) return null;
                        if (key === 'objective' && objective) return (
                            <div key="objective" style={{ marginBottom: '18px' }}>
                                <MainSection title="Ve toi" color={color} />
                                <p style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap' }}>{objective}</p>
                            </div>
                        );
                        if (key === 'experiences' && experiences.length > 0) return (
                            <div key="experiences" style={{ marginBottom: '18px' }}>
                                <MainSection title="Kinh nghiem" color={color} />
                                {experiences.map((exp, i) => (
                                    <div key={exp.id || i} style={{ marginBottom: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                            <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{exp.position}</div>
                                            <div style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '8px' }}>{exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}</div>
                                        </div>
                                        <div style={{ fontSize: `${base - 1}px`, color: color, fontWeight: '600', marginBottom: '4px' }}>{exp.company}</div>
                                        {exp.description && <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{exp.description}</div>}
                                    </div>
                                ))}
                            </div>
                        );
                        if (key === 'education' && education.length > 0) return (
                            <div key="education" style={{ marginBottom: '18px' }}>
                                <MainSection title="Hoc van" color={color} />
                                {education.map((edu, i) => (
                                    <div key={edu.id || i} style={{ marginBottom: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                                            <div style={{ fontSize: '10px', color: '#999' }}>{edu.startDate} – {edu.endDate}</div>
                                        </div>
                                        <div style={{ fontSize: `${base - 1}px`, color: '#555' }}>{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                                        {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', marginTop: '2px' }}>{edu.description}</div>}
                                    </div>
                                ))}
                            </div>
                        );
                        if (key === 'activities' && activities.length > 0) return (
                            <div key="activities" style={{ marginBottom: '18px' }}>
                                <MainSection title="Hoat dong" color={color} />
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
        </div>
    );
}
