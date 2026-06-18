import { Mail, Phone, MapPin, Award } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

// Sections that live in the right column
const RIGHT_SECTIONS = ['education', 'certifications', 'skills', 'languages'];
// Sections that live in the left column
const LEFT_SECTIONS = ['objective', 'experiences', 'activities'];

function LeftSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#111' }}>{title}</span>
            </div>
            <div style={{ height: '2px', background: `linear-gradient(to right, ${color}, ${color}30, transparent)` }} />
        </div>
    );
}

function RightSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '8px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color, flexShrink: 0 }} />
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a1a1a' }}>{title}</span>
            </div>
        </div>
    );
}

export default function KeToan4Template({ content = {}, color = '#7c3aed', fontSize = 'medium', lineSpacing = 1.6, background = 'white' }) {
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

    const leftOrder = order.filter(k => LEFT_SECTIONS.includes(k));
    const rightOrder = order.filter(k => RIGHT_SECTIONS.includes(k));
    // Anything not in either column goes to left
    const extraOrder = order.filter(k => !LEFT_SECTIONS.includes(k) && !RIGHT_SECTIONS.includes(k));

    const tintBg = `${color}08`;
    const tintBorder = `${color}18`;

    const renderLeftSection = (key) => {
        if (hiddenSections.includes(key)) return null;

        if (key === 'objective' && objective) return (
            <div key="objective">
                <LeftSectionTitle title="Muc tieu nghe nghiep" color={color} />
                <p style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap' }}>{objective}</p>
            </div>
        );

        if (key === 'experiences' && experiences.length > 0) return (
            <div key="experiences">
                <LeftSectionTitle title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '16px', paddingBottom: '14px', borderBottom: i < experiences.length - 1 ? `1px solid #f3f4f6` : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3px' }}>
                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111', flex: 1, paddingRight: '8px' }}>{exp.position}</div>
                            <div style={{ fontSize: '9px', color: 'white', background: color, borderRadius: '3px', padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: '600' }}>
                                {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                            </div>
                        </div>
                        <div style={{ fontSize: `${base}px`, color: color, fontWeight: '600', marginBottom: '5px' }}>{exp.company}</div>
                        {exp.description && (
                            <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>
                        )}
                    </div>
                ))}
            </div>
        );

        if (key === 'activities' && activities.length > 0) return (
            <div key="activities">
                <LeftSectionTitle title="Hoat dong ngoai khoa" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                            {act.role || act.name}
                            {act.organization && <span style={{ color: '#6b7280', fontWeight: '400' }}> — {act.organization}</span>}
                        </div>
                        {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing, marginTop: '3px' }}>{act.description}</div>}
                    </div>
                ))}
            </div>
        );

        return null;
    };

    const renderRightSection = (key) => {
        if (hiddenSections.includes(key)) return null;

        if (key === 'education' && education.length > 0) return (
            <div key="education">
                <RightSectionTitle title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ marginBottom: '10px', padding: '8px 10px', background: tintBg, border: `1px solid ${tintBorder}`, borderRadius: '5px', borderLeft: `3px solid ${color}` }}>
                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111', lineHeight: 1.3 }}>{edu.school}</div>
                        <div style={{ fontSize: `${base - 1}px`, color: '#555', marginTop: '2px' }}>{edu.degree}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '9px', color: '#9ca3af' }}>{edu.startDate} – {edu.endDate}</span>
                            {edu.gpa && <span style={{ fontSize: '10px', fontWeight: '700', color: color }}>GPA: {edu.gpa}</span>}
                        </div>
                        {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', fontStyle: 'italic', marginTop: '3px' }}>{edu.description}</div>}
                    </div>
                ))}
            </div>
        );

        if (key === 'certifications' && certifications.length > 0) return (
            <div key="certifications">
                <RightSectionTitle title="Chung chi" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ marginBottom: '8px', padding: '7px 10px', background: tintBg, border: `1px solid ${tintBorder}`, borderRadius: '5px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <Award size={12} style={{ color, flexShrink: 0, marginTop: '1px' }} />
                            <div>
                                <div style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#111', lineHeight: 1.3 }}>{cert.name}</div>
                                <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>{cert.issuer}</div>
                                {(cert.date || cert.year) && <div style={{ fontSize: '9px', color: color, fontWeight: '600', marginTop: '1px' }}>{cert.date || cert.year}</div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );

        if (key === 'skills' && skills.length > 0) return (
            <div key="skills">
                <RightSectionTitle title="Ky nang" color={color} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {skills.map((sk, i) => {
                        const pct = sk.level === 'Xuất sắc' || sk.level === 'Thành thạo' ? '90%'
                            : sk.level === 'Tốt' ? '75%'
                            : sk.level === 'Khá' ? '60%'
                            : sk.level === 'Trung bình' ? '45%' : '65%';
                        return (
                            <div key={sk.id || i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                    <span style={{ fontSize: `${base - 1}px`, color: '#333' }}>{sk.name}</span>
                                    {sk.level && <span style={{ fontSize: '9px', color: '#9ca3af' }}>{sk.level}</span>}
                                </div>
                                <div style={{ height: '4px', background: `${color}18`, borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: pct, background: color, borderRadius: '2px' }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );

        if (key === 'languages' && languages.length > 0) return (
            <div key="languages">
                <RightSectionTitle title="Ngoai ngu" color={color} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {languages.map((l, i) => (
                        <div key={l.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 8px', background: tintBg, borderRadius: '4px' }}>
                            <span style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#111' }}>{l.name}</span>
                            <span style={{ fontSize: '9px', color: color, fontWeight: '600', background: `${color}18`, padding: '2px 6px', borderRadius: '10px' }}>{l.level}</span>
                        </div>
                    ))}
                </div>
            </div>
        );

        return null;
    };

    return (
        <div style={{ width: '794px', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px` }}>
            {/* Header */}
            <div style={{ padding: '28px 40px 20px', background: 'white', borderBottom: `1px solid #f3f4f6` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'inline-block' }}>
                            <div style={{ fontSize: '26px', fontWeight: '900', color: '#111', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
                                {personalInfo.fullName || 'Ho va Ten'}
                            </div>
                            <div style={{ height: '3px', background: color, borderRadius: '2px', marginTop: '4px' }} />
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '500', color: '#4b5563', marginTop: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                            {personalInfo.title || 'Nhan Vien Ke Toan'}
                        </div>
                        {/* Contact row */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '12px' }}>
                            {personalInfo.phone && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#555' }}>
                                    <Phone size={10} color={color} />{personalInfo.phone}
                                </span>
                            )}
                            {personalInfo.email && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#555' }}>
                                    <Mail size={10} color={color} />{personalInfo.email}
                                </span>
                            )}
                            {personalInfo.address && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#555' }}>
                                    <MapPin size={10} color={color} />{personalInfo.address}
                                </span>
                            )}
                            {personalInfo.linkedin && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#555' }}>
                                    <FaLinkedin style={{ fontSize: '10px', color }} />{personalInfo.linkedin}
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Optional small avatar */}
                    {personalInfo.avatarUrl && (
                        <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: `2px solid ${color}30`, marginLeft: '20px', flexShrink: 0 }} />
                    )}
                </div>
            </div>

            {/* Body: two columns */}
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {/* Left column — 60% */}
                <div style={{ width: '60%', padding: '12px 32px 28px 40px', background }}>
                    {leftOrder.map(key => renderLeftSection(key))}
                    {extraOrder.map(key => renderLeftSection(key))}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', background: `${color}15`, flexShrink: 0 }} />

                {/* Right column — 40% with tinted bg */}
                <div style={{ width: '40%', padding: '12px 28px 28px 24px', background: `${color}05` }}>
                    {rightOrder.map(key => renderRightSection(key))}
                </div>
            </div>
        </div>
    );
}
