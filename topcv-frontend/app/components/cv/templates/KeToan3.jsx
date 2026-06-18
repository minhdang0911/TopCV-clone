import { Mail, Phone, MapPin, Award } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '12px', marginTop: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '18px', background: color, borderRadius: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#1a1a1a' }}>{title}</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
        </div>
    );
}

function ContactChip({ icon, text, color }) {
    if (!text) return null;
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: `${color}0d`, border: `1px solid ${color}22`, borderRadius: '20px', padding: '4px 10px' }}>
            <span style={{ color, display: 'flex', alignItems: 'center' }}>{icon}</span>
            <span style={{ fontSize: '10px', color: '#374151' }}>{text}</span>
        </div>
    );
}

function SkillDot({ filled, color }) {
    return (
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: filled ? color : `${color}25`, border: `1px solid ${color}40`, flexShrink: 0 }} />
    );
}

function LevelDots({ level, color }) {
    const filledCount = level === 'Xuất sắc' || level === 'Thành thạo' ? 5
        : level === 'Tốt' ? 4
        : level === 'Khá' ? 3
        : level === 'Trung bình' ? 2 : 3;
    return (
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(n => <SkillDot key={n} filled={n <= filledCount} color={color} />)}
        </div>
    );
}

export default function KeToan3Template({ content = {}, color = '#065f46', fontSize = 'medium', lineSpacing = 1.6, background = 'white' }) {
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
        <div style={{ width: '794px', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px` }}>
            {/* Header */}
            <div style={{ padding: '32px 48px 20px', borderBottom: `3px solid ${color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#111', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '4px' }}>
                            {personalInfo.fullName || 'Ho va Ten'}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: color, letterSpacing: '1px', textTransform: 'uppercase' }}>
                            {personalInfo.title || 'Nhan Vien Ke Toan'}
                        </div>
                    </div>
                    {personalInfo.avatarUrl && (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: `2px solid ${color}30` }} />
                    )}
                </div>

                {/* Contact chips row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                    <ContactChip icon={<Phone size={10} />} text={personalInfo.phone} color={color} />
                    <ContactChip icon={<Mail size={10} />} text={personalInfo.email} color={color} />
                    <ContactChip icon={<MapPin size={10} />} text={personalInfo.address} color={color} />
                    {personalInfo.linkedin && (
                        <ContactChip icon={<FaLinkedin style={{ fontSize: '10px' }} />} text={personalInfo.linkedin} color={color} />
                    )}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '0 48px 36px' }}>
                {order.map((key) => {
                    if (hiddenSections.includes(key)) return null;

                    if (key === 'objective' && objective) return (
                        <div key="objective">
                            <SectionTitle title="Muc tieu nghe nghiep" color={color} />
                            <p style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap', paddingLeft: '14px' }}>{objective}</p>
                        </div>
                    );

                    if (key === 'experiences' && experiences.length > 0) return (
                        <div key="experiences">
                            <SectionTitle title="Kinh nghiem lam viec" color={color} />
                            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                {/* Timeline vertical line */}
                                <div style={{ position: 'absolute', left: '6px', top: '6px', bottom: '6px', width: '1px', background: `${color}30` }} />
                                {experiences.map((exp, i) => (
                                    <div key={exp.id || i} style={{ position: 'relative', marginBottom: '18px' }}>
                                        {/* Timeline dot */}
                                        <div style={{ position: 'absolute', left: '-17px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', background: color, border: '2px solid white', boxShadow: `0 0 0 2px ${color}40` }} />
                                        {/* Row: position + date right-aligned */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111', flex: 1 }}>{exp.position}</div>
                                            <div style={{ fontSize: '10px', color: color, fontWeight: '600', whiteSpace: 'nowrap', marginLeft: '16px', flexShrink: 0 }}>
                                                {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: `${base}px`, color: '#374151', fontWeight: '600', marginBottom: '5px' }}>{exp.company}</div>
                                        {exp.description && (
                                            <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'education' && education.length > 0) return (
                        <div key="education">
                            <SectionTitle title="Hoc van" color={color} />
                            <div style={{ border: `1px solid #e5e7eb`, borderRadius: '6px', overflow: 'hidden' }}>
                                {education.map((edu, i) => (
                                    <div key={edu.id || i} style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr auto auto auto',
                                        gap: '12px',
                                        alignItems: 'center',
                                        padding: '10px 14px',
                                        background: i % 2 === 0 ? 'white' : `${color}05`,
                                        borderBottom: i < education.length - 1 ? `1px solid #e5e7eb` : 'none',
                                    }}>
                                        <div>
                                            <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                                            <div style={{ fontSize: `${base - 1}px`, color: '#555', marginTop: '1px' }}>{edu.degree}</div>
                                            {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', fontStyle: 'italic', marginTop: '2px' }}>{edu.description}</div>}
                                        </div>
                                        {edu.gpa && (
                                            <div style={{ textAlign: 'center', background: `${color}15`, borderRadius: '4px', padding: '3px 8px', whiteSpace: 'nowrap' }}>
                                                <div style={{ fontSize: '8px', color: color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>GPA</div>
                                                <div style={{ fontSize: `${base}px`, fontWeight: '800', color: color }}>{edu.gpa}</div>
                                            </div>
                                        )}
                                        {!edu.gpa && <div />}
                                        <div style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                            {edu.startDate}
                                        </div>
                                        <div style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', textAlign: 'right' }}>
                                            {edu.endDate}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'skills' && skills.length > 0) return (
                        <div key="skills">
                            <SectionTitle title="Ky nang chuyen mon" color={color} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 16px' }}>
                                {skills.map((sk, i) => (
                                    <div key={sk.id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid #f3f4f6` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                            <span style={{ fontSize: `${base - 1}px`, color: '#333' }}>{sk.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'languages' && languages.length > 0) return (
                        <div key="languages">
                            <SectionTitle title="Ngoai ngu" color={color} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                                {languages.map((l, i) => (
                                    <div key={l.id || i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 14px', border: `1px solid ${color}25`, borderRadius: '4px' }}>
                                        <span style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{l.name}</span>
                                        <LevelDots level={l.level} color={color} />
                                        <span style={{ fontSize: '10px', color: '#6b7280' }}>{l.level}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'certifications' && certifications.length > 0) return (
                        <div key="certifications">
                            <SectionTitle title="Chung chi chuyen mon" color={color} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                {certifications.map((cert, i) => (
                                    <div key={cert.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 12px', background: `${color}06`, border: `1px solid ${color}18`, borderRadius: '5px' }}>
                                        <Award size={14} style={{ color, marginTop: '1px', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#111', lineHeight: 1.3 }}>{cert.name}</div>
                                            <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>{cert.issuer}</div>
                                            {(cert.date || cert.year) && <div style={{ fontSize: '9px', color: color, fontWeight: '600', marginTop: '1px' }}>{cert.date || cert.year}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    if (key === 'activities' && activities.length > 0) return (
                        <div key="activities">
                            <SectionTitle title="Hoat dong ngoai khoa" color={color} />
                            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                <div style={{ position: 'absolute', left: '6px', top: '6px', bottom: '6px', width: '1px', background: `${color}30` }} />
                                {activities.map((act, i) => (
                                    <div key={act.id || i} style={{ position: 'relative', marginBottom: '10px' }}>
                                        <div style={{ position: 'absolute', left: '-17px', top: '5px', width: '10px', height: '10px', borderRadius: '50%', background: `${color}30`, border: `2px solid ${color}60` }} />
                                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                                            {act.role || act.name}
                                            {act.organization && <span style={{ color: '#6b7280', fontWeight: '400' }}> — {act.organization}</span>}
                                        </div>
                                        {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );

                    return null;
                })}
            </div>
        </div>
    );
}
