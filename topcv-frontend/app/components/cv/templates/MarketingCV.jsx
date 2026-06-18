import { Mail, Phone, MapPin, Megaphone } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SkillBar({ name, level, color }) {
    const pct = ((level || 3) / 5) * 100;
    return (
        <div style={{ marginBottom: '9px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.85)', marginBottom: '3px', fontWeight: '500' }}>{name}</div>
            <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(255,255,255,0.85)', borderRadius: '2px' }} />
            </div>
        </div>
    );
}

function MainSection({ title, color }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: color }}>{title}</span>
                <div style={{ flex: 1, height: '2px', background: `${color}20` }} />
            </div>
        </div>
    );
}

export default function MarketingCVTemplate({ content = {}, color = '#7c3aed', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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
    const sidebarOrder = ['skills', 'languages', 'certifications'];
    const mainOrder = order.filter(k => !sidebarOrder.includes(k));

    return (
        <div style={{ minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, display: 'flex', fontSize: `${base}px` }}>
            {/* Left sidebar */}
            <div style={{ width: '210px', flexShrink: 0, background: color, padding: '0 0 24px', display: 'flex', flexDirection: 'column' }}>
                {/* Avatar + name in sidebar */}
                <div style={{ padding: '28px 18px 20px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
                    <div style={{ marginBottom: '14px' }}>
                        {personalInfo.avatarUrl ? (
                            <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)', margin: '0 auto', display: 'block' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800', color: 'white', border: '3px solid rgba(255,255,255,0.3)' }}>
                                {(personalInfo.fullName || 'M').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 1.3, marginBottom: '4px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '10px' }}>
                        <Megaphone size={10} color="rgba(255,255,255,0.7)" />
                        <span style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>{personalInfo.title || 'Chuyen Vien Marketing'}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {personalInfo.phone && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={9} />{personalInfo.phone}</span>}
                        {personalInfo.email && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '5px', wordBreak: 'break-all' }}><Mail size={9} />{personalInfo.email}</span>}
                        {personalInfo.address && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={9} />{personalInfo.address}</span>}
                        {personalInfo.linkedin && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '5px', wordBreak: 'break-all' }}><FaLinkedin style={{ fontSize: '9px' }} />{personalInfo.linkedin}</span>}
                    </div>
                </div>

                {/* Skills */}
                {skills.length > 0 && !hiddenSections.includes('skills') && (
                    <div style={{ padding: '14px 18px 0' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Ky nang</div>
                        {skills.map((sk, i) => <SkillBar key={sk.id || i} name={sk.name} level={sk.level} color={color} />)}
                    </div>
                )}

                {/* Languages */}
                {languages.length > 0 && !hiddenSections.includes('languages') && (
                    <div style={{ padding: '14px 18px 0' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Ngoai ngu</div>
                        {languages.map((l, i) => (
                            <div key={l.id || i} style={{ marginBottom: '7px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '600', color: 'white' }}>{l.name}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{l.level}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && !hiddenSections.includes('certifications') && (
                    <div style={{ padding: '14px 18px 0' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '10px' }}>Chung chi</div>
                        {certifications.map((cert, i) => (
                            <div key={cert.id || i} style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '600', color: 'white', lineHeight: 1.4 }}>{cert.name}</div>
                                <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}>{cert.issuer} {cert.date || cert.year}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Main content */}
            <div style={{ flex: 1, padding: '28px 28px 24px' }}>
                {mainOrder.map((key) => {
                    if (hiddenSections.includes(key)) return null;

                    if (key === 'objective' && objective) return (
                        <div key="objective" style={{ marginBottom: '20px' }}>
                            <MainSection title="Muc tieu nghe nghiep" color={color} />
                            <p style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap' }}>{objective}</p>
                        </div>
                    );

                    if (key === 'experiences' && experiences.length > 0) return (
                        <div key="experiences" style={{ marginBottom: '20px' }}>
                            <MainSection title="Kinh nghiem lam viec" color={color} />
                            {experiences.map((exp, i) => (
                                <div key={exp.id || i} style={{ marginBottom: '14px', paddingLeft: '12px', borderLeft: `3px solid ${color}30` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                        <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111' }}>{exp.position}</div>
                                        <div style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '8px' }}>{exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}</div>
                                    </div>
                                    <div style={{ fontSize: `${base}px`, color: color, fontWeight: '600', marginBottom: '4px' }}>{exp.company}</div>
                                    {exp.description && <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>}
                                </div>
                            ))}
                        </div>
                    );

                    if (key === 'education' && education.length > 0) return (
                        <div key="education" style={{ marginBottom: '20px' }}>
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
                        <div key="activities" style={{ marginBottom: '20px' }}>
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
    );
}
