import { Mail, Phone, MapPin } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

const SIDEBAR_SECTIONS = ['skills', 'languages', 'certifications'];
const MAIN_SECTIONS = ['objective', 'experiences', 'education', 'activities'];

function SidebarSectionHeader({ title, color }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: color, marginBottom: '6px' }}>{title}</div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.15)' }} />
        </div>
    );
}

function MainSectionHeader({ title, color }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', marginTop: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px', color: '#1a1a1a' }}>{title}</span>
            <div style={{ flex: 1, height: '2px', background: color }} />
        </div>
    );
}

export default function KinhDoanh2Template({ content = {}, color = '#c0392b', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    const sidebarOrder = order.filter(k => SIDEBAR_SECTIONS.includes(k));
    const mainOrder = order.filter(k => MAIN_SECTIONS.includes(k));

    const levelToPercent = (level) => {
        if (level === null || level === undefined || level === '') return 60;
        if (typeof level === 'number') return Math.min(100, Math.max(10, level * 20));
        const l = String(level).toLowerCase();
        if (l.includes('native') || l.includes('fluent') || l.includes('xuất sắc') || l.includes('thành thạo')) return 95;
        if (l.includes('advanced') || l.includes('cao') || l.includes('giỏi')) return 80;
        if (l.includes('intermediate') || l.includes('trung') || l.includes('khá')) return 60;
        if (l.includes('basic') || l.includes('cơ bản') || l.includes('beginner')) return 35;
        const n = parseInt(l);
        if (!isNaN(n)) return Math.min(100, Math.max(10, n * 20));
        return 60;
    };

    const sidebarSectionMap = {
        skills: skills.length > 0 && !hiddenSections.includes('skills') ? (
            <div key="skills" style={{ marginBottom: '20px' }}>
                <SidebarSectionHeader title="Ky nang" color={color} />
                {skills.map((sk, i) => (
                    <div key={sk.id || i} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: `${base - 1}px`, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{sk.name}</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${levelToPercent(sk.level)}%`, background: color, borderRadius: '3px', transition: 'width 0.3s' }} />
                        </div>
                    </div>
                ))}
            </div>
        ) : null,

        languages: languages.length > 0 && !hiddenSections.includes('languages') ? (
            <div key="languages" style={{ marginBottom: '20px' }}>
                <SidebarSectionHeader title="Ngoai ngu" color={color} />
                {languages.map((lang, i) => (
                    <div key={lang.id || i} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: `${base - 1}px`, color: 'rgba(255,255,255,0.9)', fontWeight: '500' }}>{lang.name}</span>
                            <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)' }}>{lang.level}</span>
                        </div>
                        <div style={{ height: '5px', background: 'rgba(255,255,255,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${levelToPercent(lang.level)}%`, background: color, borderRadius: '3px' }} />
                        </div>
                    </div>
                ))}
            </div>
        ) : null,

        certifications: certifications.length > 0 && !hiddenSections.includes('certifications') ? (
            <div key="certifications" style={{ marginBottom: '20px' }}>
                <SidebarSectionHeader title="Chung chi" color={color} />
                {certifications.map((cert, i) => (
                    <div key={cert.id || i} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: `${base - 1}px`, color: 'white', fontWeight: '600', marginBottom: '2px' }}>{cert.name}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.55)' }}>{cert.issuer}</div>
                        {cert.date && <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', marginTop: '1px' }}>{cert.date}</div>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    const mainSectionMap = {
        objective: objective && !hiddenSections.includes('objective') ? (
            <div key="objective" style={{ marginBottom: '20px' }}>
                <MainSectionHeader title="Muc tieu nghe nghiep" color={color} />
                <p style={{ fontSize: `${base}px`, color: '#555', lineHeight: lineSpacing, margin: 0, whiteSpace: 'pre-wrap' }}>{objective}</p>
            </div>
        ) : null,

        experiences: experiences.length > 0 && !hiddenSections.includes('experiences') ? (
            <div key="experiences" style={{ marginBottom: '20px' }}>
                <MainSectionHeader title="Kinh nghiem lam viec" color={color} />
                {experiences.map((exp, i) => (
                    <div key={exp.id || i} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                            <div style={{ fontSize: `${base + 1}px`, fontWeight: '700', color: '#1a1a1a' }}>{exp.position}</div>
                            <div style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap', marginLeft: '8px', background: '#f4f4f4', padding: '2px 8px', borderRadius: '10px' }}>
                                {exp.startDate}{exp.startDate ? ' – ' : ''}{exp.isCurrent ? 'Hien tai' : exp.endDate}
                            </div>
                        </div>
                        <div style={{ fontSize: `${base}px`, color: color, fontWeight: '600', marginBottom: '6px' }}>{exp.company}</div>
                        {exp.description && (
                            <div style={{ fontSize: `${base - 1}px`, color: '#555', lineHeight: lineSpacing, whiteSpace: 'pre-wrap', paddingLeft: '10px', borderLeft: `2px solid ${color}40` }}>{exp.description}</div>
                        )}
                    </div>
                ))}
            </div>
        ) : null,

        education: education.length > 0 && !hiddenSections.includes('education') ? (
            <div key="education" style={{ marginBottom: '20px' }}>
                <MainSectionHeader title="Hoc van" color={color} />
                {education.map((edu, i) => (
                    <div key={edu.id || i} style={{ marginBottom: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, marginTop: '4px', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#1a1a1a' }}>{edu.school}</div>
                                <div style={{ fontSize: '10px', color: '#999' }}>{edu.startDate}{edu.startDate ? ' – ' : ''}{edu.endDate}</div>
                            </div>
                            <div style={{ fontSize: `${base - 1}px`, color: '#666' }}>{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                            {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#888', marginTop: '2px', fontStyle: 'italic' }}>{edu.description}</div>}
                        </div>
                    </div>
                ))}
            </div>
        ) : null,

        activities: activities.length > 0 && !hiddenSections.includes('activities') ? (
            <div key="activities" style={{ marginBottom: '20px' }}>
                <MainSectionHeader title="Hoat dong" color={color} />
                {activities.map((act, i) => (
                    <div key={act.id || i} style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#1a1a1a' }}>
                            {act.role || act.name}
                            {act.organization && <span style={{ color: '#777', fontWeight: '400' }}> – {act.organization}</span>}
                        </div>
                        {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#666', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>}
                    </div>
                ))}
            </div>
        ) : null,
    };

    return (
        <div style={{ width: '794px', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px`, display: 'flex', flexDirection: 'column' }}>
            {/* Sidebar + Main layout */}
            <div style={{ display: 'flex', flex: 1, minHeight: '1122px' }}>
                {/* Left sidebar */}
                <div style={{ width: '195px', flexShrink: 0, background: '#1a1a2e', display: 'flex', flexDirection: 'column' }}>
                    {/* Avatar & name block */}
                    <div style={{ padding: '30px 18px 24px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {personalInfo.avatarUrl ? (
                            <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}`, marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
                        ) : (
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: color, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: 'white' }}>
                                {(personalInfo.fullName || 'K').charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'white', lineHeight: 1.3, marginBottom: '5px' }}>{personalInfo.fullName || 'Ho va Ten'}</div>
                        <div style={{ fontSize: '10px', color: color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{personalInfo.title || 'Nhan Vien Kinh Doanh'}</div>
                    </div>

                    {/* Contact */}
                    <div style={{ padding: '18px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: color, marginBottom: '10px' }}>Lien he</div>
                        {personalInfo.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Phone size={10} color={color} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', wordBreak: 'break-all' }}>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Mail size={10} color={color} style={{ flexShrink: 0 }} />
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', wordBreak: 'break-all' }}>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.address && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                <MapPin size={10} color={color} style={{ flexShrink: 0, marginTop: '1px' }} />
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>{personalInfo.address}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <FaLinkedin style={{ fontSize: '10px', color: color, flexShrink: 0 }} />
                                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', wordBreak: 'break-all' }}>{personalInfo.linkedin}</span>
                            </div>
                        )}
                    </div>

                    {/* Sidebar sections */}
                    <div style={{ padding: '18px 18px 20px', flex: 1 }}>
                        {sidebarOrder.map(key => sidebarSectionMap[key] || null)}
                    </div>
                </div>

                {/* Right main area */}
                <div style={{ flex: 1, background, padding: '28px 28px 28px 24px' }}>
                    {mainOrder.map(key => mainSectionMap[key] || null)}
                </div>
            </div>
        </div>
    );
}
