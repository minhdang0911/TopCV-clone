import { Mail, Phone, MapPin, Award } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function SidebarSectionTitle({ title }) {
    return (
        <div style={{ marginBottom: '8px', marginTop: '18px' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#a0aec0', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
                {title}
            </div>
        </div>
    );
}

function MainSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px', marginTop: '22px' }}>
            <div style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: color, paddingBottom: '6px', borderBottom: `2px solid ${color}` }}>
                {title}
            </div>
        </div>
    );
}

export default function KeToan2Template({ content = {}, color = '#374151', fontSize = 'medium', lineSpacing = 1.6, background = 'white' }) {
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

    const sidebarSections = ['certifications', 'skills', 'languages'];
    const mainSections = ['objective', 'experiences', 'education', 'activities'];
    const sidebarOrder = order.filter(k => sidebarSections.includes(k));
    const mainOrder = order.filter(k => mainSections.includes(k));

    const renderSidebarSection = (key) => {
        if (hiddenSections.includes(key)) return null;

        if (key === 'certifications' && certifications.length > 0) return (
            <div key="certifications">
                <SidebarSectionTitle title="Chung chi" />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: i < certifications.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                            <Award size={10} style={{ color: '#fbbf24', marginTop: '2px', flexShrink: 0 }} />
                            <div>
                                <div style={{ fontSize: `${base - 1}px`, fontWeight: '700', color: '#f7fafc', lineHeight: 1.3 }}>{cert.name}</div>
                                <div style={{ fontSize: '9px', color: '#718096', marginTop: '2px' }}>{cert.issuer}</div>
                                {(cert.date || cert.year) && <div style={{ fontSize: '9px', color: '#4a5568', marginTop: '1px' }}>{cert.date || cert.year}</div>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );

        if (key === 'skills' && skills.length > 0) return (
            <div key="skills">
                <SidebarSectionTitle title="Ky nang" />
                {skills.map((sk, i) => (
                    <div key={sk.id || i} style={{ marginBottom: '6px' }}>
                        <div style={{ fontSize: `${base - 1}px`, color: '#e2e8f0', marginBottom: '3px' }}>{sk.name}</div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                                height: '100%',
                                borderRadius: '2px',
                                background: color === '#374151' ? '#60a5fa' : color,
                                width: sk.level === 'Xuất sắc' || sk.level === 'Thành thạo' ? '90%'
                                    : sk.level === 'Tốt' ? '70%'
                                    : sk.level === 'Trung bình' ? '50%' : '60%',
                            }} />
                        </div>
                    </div>
                ))}
            </div>
        );

        if (key === 'languages' && languages.length > 0) return (
            <div key="languages">
                <SidebarSectionTitle title="Ngoai ngu" />
                {languages.map((l, i) => (
                    <div key={l.id || i} style={{ marginBottom: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: `${base - 1}px`, color: '#e2e8f0', fontWeight: '600' }}>{l.name}</span>
                            <span style={{ fontSize: '9px', color: '#718096' }}>{l.level}</span>
                        </div>
                    </div>
                ))}
            </div>
        );

        return null;
    };

    const renderMainSection = (key) => {
        if (hiddenSections.includes(key)) return null;

        if (key === 'objective' && objective) return (
            <div key="objective">
                <MainSectionTitle title="Muc tieu nghe nghiep" color={color} />
                <p style={{ fontSize: `${base}px`, color: '#444', lineHeight: lineSpacing, margin: '0 0 4px', whiteSpace: 'pre-wrap' }}>{objective}</p>
            </div>
        );

        if (key === 'experiences' && experiences.length > 0) return (
            <div key="experiences">
                <MainSectionTitle title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111', flex: 1 }}>{exp.position}</div>
                            <div style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '12px', background: `${color}10`, border: `1px solid ${color}25`, borderRadius: '3px', padding: '2px 6px', fontWeight: '500' }}>
                                {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                            </div>
                        </div>
                        <div style={{ fontSize: `${base}px`, color: color, fontWeight: '700', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{exp.company}</div>
                        {exp.description && (
                            <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap', borderLeft: `3px solid ${color}30`, paddingLeft: '10px' }}>
                                {exp.description}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );

        if (key === 'education' && education.length > 0) return (
            <div key="education">
                <MainSectionTitle title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                            <div style={{ fontSize: `${base}px`, color: '#555', marginTop: '2px' }}>{edu.degree}</div>
                            {edu.gpa && <div style={{ fontSize: `${base - 1}px`, color: color, fontWeight: '600', marginTop: '2px' }}>GPA: {edu.gpa}</div>}
                            {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', fontStyle: 'italic', marginTop: '3px' }}>{edu.description}</div>}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280', whiteSpace: 'nowrap', marginLeft: '12px', background: `${color}10`, border: `1px solid ${color}25`, borderRadius: '3px', padding: '2px 6px', fontWeight: '500' }}>
                            {edu.startDate} – {edu.endDate}
                        </div>
                    </div>
                ))}
            </div>
        );

        if (key === 'activities' && activities.length > 0) return (
            <div key="activities">
                <MainSectionTitle title="Hoat dong ngoai khoa" color={color} />
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

    return (
        <div style={{ width: '794px', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px`, display: 'flex', flexDirection: 'column' }}>
            {/* Top header bar */}
            <div style={{ background: '#2d3748', padding: '0 0 0 200px' }}>
                <div style={{ background: '#1a202c', height: '4px' }} />
            </div>

            <div style={{ display: 'flex', flex: 1 }}>
                {/* Left sidebar */}
                <div style={{ width: '200px', minWidth: '200px', background: '#2d3748', padding: '28px 20px 28px', display: 'flex', flexDirection: 'column' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        {personalInfo.avatarUrl ? (
                            <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.15)' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#a0aec0', border: '3px solid rgba(255,255,255,0.12)' }}>
                                {(personalInfo.fullName || 'K').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Name + Title */}
                    <div style={{ textAlign: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#f7fafc', lineHeight: 1.3, marginBottom: '5px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                        <div style={{ fontSize: '10px', color: '#a0aec0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' }}>{personalInfo.title || 'Nhan Vien Ke Toan'}</div>
                    </div>

                    {/* Contact */}
                    <div>
                        <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#a0aec0', paddingBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: '10px' }}>Lien he</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {personalInfo.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Phone size={10} color="#718096" />
                                    </div>
                                    <span style={{ fontSize: `${base - 2}px`, color: '#cbd5e0', wordBreak: 'break-all' }}>{personalInfo.phone}</span>
                                </div>
                            )}
                            {personalInfo.email && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Mail size={10} color="#718096" />
                                    </div>
                                    <span style={{ fontSize: `${base - 2}px`, color: '#cbd5e0', wordBreak: 'break-all' }}>{personalInfo.email}</span>
                                </div>
                            )}
                            {personalInfo.address && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <MapPin size={10} color="#718096" />
                                    </div>
                                    <span style={{ fontSize: `${base - 2}px`, color: '#cbd5e0' }}>{personalInfo.address}</span>
                                </div>
                            )}
                            {personalInfo.linkedin && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FaLinkedin style={{ fontSize: '10px', color: '#718096' }} />
                                    </div>
                                    <span style={{ fontSize: `${base - 2}px`, color: '#cbd5e0', wordBreak: 'break-all' }}>{personalInfo.linkedin}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar dynamic sections */}
                    {sidebarOrder.map(key => renderSidebarSection(key))}
                </div>

                {/* Right main content */}
                <div style={{ flex: 1, padding: '28px 36px 28px 32px', background }}>
                    {mainOrder.map(key => renderMainSection(key))}
                    {/* Render any section not in our predefined main/sidebar lists */}
                    {order.filter(k => !mainSections.includes(k) && !sidebarSections.includes(k)).map(key => renderMainSection(key))}
                </div>
            </div>
        </div>
    );
}
