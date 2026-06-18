import { Mail, Phone, MapPin, Megaphone, Star } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';

const DEFAULT_ORDER = ['objective', 'experiences', 'education', 'skills', 'languages', 'certifications', 'activities'];

function MainSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '18px', height: '2px', background: color, borderRadius: '1px' }} />
                <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#374151' }}>{title}</span>
            </div>
            <div style={{ height: '1px', background: '#e5e7eb', marginTop: '6px' }} />
        </div>
    );
}

function SidebarSectionTitle({ title, color }) {
    return (
        <div style={{ marginBottom: '10px', paddingBottom: '6px', borderBottom: `2px solid ${color}30` }}>
            <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color }}>
                {title}
            </span>
        </div>
    );
}

function ProgressBar({ pct, color }) {
    return (
        <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}cc, ${color})`, borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>
    );
}

export default function MarketingCV3({ content = {}, color = '#d97706', fontSize = 'medium', lineSpacing = 1.55, background = 'white' }) {
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

    const sidebarKeys = ['skills', 'languages', 'certifications'];
    const mainKeys = order.filter(k => !sidebarKeys.includes(k));
    const activeSidebarKeys = order.filter(k => sidebarKeys.includes(k) && !hiddenSections.includes(k));

    return (
        <div style={{ width: '794px', minHeight: '100%', fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', Arial, sans-serif", background, fontSize: `${base}px`, position: 'relative' }}>

            {/* ── DECORATIVE ACCENT SHAPE top-right ── */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '120px', height: '120px', background: `${color}15`, borderBottomLeftRadius: '120px', zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, right: 0, width: '70px', height: '70px', background: `${color}25`, borderBottomLeftRadius: '70px', zIndex: 0, pointerEvents: 'none' }} />

            {/* ── HEADER ── */}
            <div style={{ padding: '32px 36px 22px', borderBottom: '1px solid #f3f4f6', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '580px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '900', color: '#111', letterSpacing: '-0.5px', lineHeight: 1.1, marginBottom: '4px' }}>
                        {personalInfo.fullName || 'Ho va Ten'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '28px', height: '2px', background: color, borderRadius: '1px' }} />
                        <span style={{ fontSize: '13px', fontWeight: '600', color, letterSpacing: '0.5px' }}>
                            {personalInfo.title || 'Chuyen Vien Marketing'}
                        </span>
                    </div>
                    {/* Contact row inline */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                        {personalInfo.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Phone size={10} color={color} />
                                </div>
                                <span style={{ fontSize: '10px', color: '#374141', fontWeight: '500' }}>{personalInfo.phone}</span>
                            </div>
                        )}
                        {personalInfo.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Mail size={10} color={color} />
                                </div>
                                <span style={{ fontSize: '10px', color: '#374141', fontWeight: '500', wordBreak: 'break-all' }}>{personalInfo.email}</span>
                            </div>
                        )}
                        {personalInfo.address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <MapPin size={10} color={color} />
                                </div>
                                <span style={{ fontSize: '10px', color: '#374141', fontWeight: '500' }}>{personalInfo.address}</span>
                            </div>
                        )}
                        {personalInfo.linkedin && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <FaLinkedin style={{ fontSize: '10px', color }} />
                                </div>
                                <span style={{ fontSize: '10px', color: '#374141', fontWeight: '500', wordBreak: 'break-all' }}>{personalInfo.linkedin}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── BODY: two columns ── */}
            <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>

                {/* LEFT MAIN — 65% */}
                <div style={{ flex: '0 0 65%', padding: '24px 28px 32px 36px' }}>
                    {mainKeys.map((key) => {
                        if (hiddenSections.includes(key)) return null;

                        if (key === 'objective' && objective) return (
                            <div key="objective" style={{ marginBottom: '22px' }}>
                                <MainSectionTitle title="Muc tieu nghe nghiep" color={color} />
                                <p style={{ margin: 0, color: '#4b5563', lineHeight: lineSpacing, whiteSpace: 'pre-wrap', fontSize: `${base}px` }}>{objective}</p>
                            </div>
                        );

                        if (key === 'experiences' && experiences.length > 0) return (
                            <div key="experiences" style={{ marginBottom: '22px' }}>
                                <MainSectionTitle title="Kinh nghiem lam viec" color={color} />
                                {experiences.map((exp, i) => (
                                    <div key={exp.id || i} style={{ marginBottom: '16px', position: 'relative' }}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            {/* Timeline dot + line */}
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4px' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                                                {i < experiences.length - 1 && <div style={{ width: '1px', flex: 1, background: '#e5e7eb', marginTop: '4px', minHeight: '20px' }} />}
                                            </div>
                                            <div style={{ flex: 1, paddingBottom: i < experiences.length - 1 ? '10px' : 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1px' }}>
                                                    <div style={{ fontSize: `${base + 1}px`, fontWeight: '800', color: '#111' }}>{exp.position}</div>
                                                    <div style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '10px', background: `${color}10`, padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                                                        {exp.startDate} – {exp.isCurrent ? 'Hien tai' : exp.endDate}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: `${base}px`, color, fontWeight: '600', marginBottom: '5px' }}>{exp.company}</div>
                                                {exp.description && <div style={{ fontSize: `${base - 1}px`, color: '#4b5563', lineHeight: lineSpacing, whiteSpace: 'pre-wrap' }}>{exp.description}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'education' && education.length > 0) return (
                            <div key="education" style={{ marginBottom: '22px' }}>
                                <MainSectionTitle title="Hoc van" color={color} />
                                {education.map((edu, i) => (
                                    <div key={edu.id || i} style={{ marginBottom: '12px', display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `${color}60`, flexShrink: 0, marginTop: '5px' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>{edu.school}</div>
                                                <div style={{ fontSize: '9px', color: '#9ca3af', whiteSpace: 'nowrap', marginLeft: '8px' }}>{edu.startDate} – {edu.endDate}</div>
                                            </div>
                                            <div style={{ fontSize: `${base - 1}px`, color: '#6b7280' }}>{edu.degree}{edu.gpa ? ` | GPA: ${edu.gpa}` : ''}</div>
                                            {edu.description && <div style={{ fontSize: `${base - 2}px`, color: '#9ca3af', marginTop: '2px' }}>{edu.description}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                        if (key === 'activities' && activities.length > 0) return (
                            <div key="activities" style={{ marginBottom: '22px' }}>
                                <MainSectionTitle title="Hoat dong ngoai khoa" color={color} />
                                {activities.map((act, i) => (
                                    <div key={act.id || i} style={{ marginBottom: '10px', display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0, marginTop: '4px', transform: 'rotate(45deg)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: `${base}px`, fontWeight: '700', color: '#111' }}>
                                                {act.role || act.name}
                                                {act.organization && <span style={{ fontWeight: '500', color: '#6b7280' }}> – {act.organization}</span>}
                                            </div>
                                            {act.description && <div style={{ fontSize: `${base - 1}px`, color: '#4b5563', lineHeight: lineSpacing, marginTop: '2px' }}>{act.description}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );

                        return null;
                    })}
                </div>

                {/* Divider */}
                <div style={{ width: '1px', background: '#f3f4f6', flexShrink: 0 }} />

                {/* RIGHT SIDEBAR — 35% */}
                <div style={{ flex: '0 0 35%', padding: '24px 28px 32px 24px', background: '#fafafa' }}>
                    {/* Avatar */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        {personalInfo.avatarUrl ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}55)`, zIndex: 0 }} />
                                <img src={personalInfo.avatarUrl} alt="avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', position: 'relative', zIndex: 1, border: '2px solid white' }} />
                            </div>
                        ) : (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                <div style={{ position: 'absolute', inset: '-3px', borderRadius: '50%', background: `linear-gradient(135deg, ${color}, ${color}55)`, zIndex: 0 }} />
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '900', color, position: 'relative', zIndex: 1, border: '2px solid white' }}>
                                    {(personalInfo.fullName || 'M').charAt(0).toUpperCase()}
                                </div>
                            </div>
                        )}
                    </div>

                    {activeSidebarKeys.map((key) => {
                        if (key === 'skills' && skills.length > 0) return (
                            <div key="skills" style={{ marginBottom: '20px' }}>
                                <SidebarSectionTitle title="Ky nang" color={color} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                                    {skills.map((sk, i) => {
                                        const pct = ((sk.level || 3) / 5) * 100;
                                        return (
                                            <div key={sk.id || i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '10px', fontWeight: '600', color: '#111' }}>{sk.name}</span>
                                                    <span style={{ fontSize: '9px', color, fontWeight: '700' }}>{Math.round(pct)}%</span>
                                                </div>
                                                <ProgressBar pct={pct} color={color} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );

                        if (key === 'languages' && languages.length > 0) return (
                            <div key="languages" style={{ marginBottom: '20px' }}>
                                <SidebarSectionTitle title="Ngoai ngu" color={color} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {languages.map((lang, i) => (
                                        <div key={lang.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#111' }}>{lang.name}</span>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <div key={n} style={{ width: '7px', height: '7px', borderRadius: '50%', background: n <= (lang.level || 3) ? color : `${color}25` }} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                        if (key === 'certifications' && certifications.length > 0) return (
                            <div key="certifications" style={{ marginBottom: '20px' }}>
                                <SidebarSectionTitle title="Chung chi" color={color} />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                                    {certifications.map((cert, i) => (
                                        <div key={cert.id || i} style={{ padding: '8px 10px', background: 'white', borderRadius: '6px', border: `1px solid ${color}20`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
                                            <div style={{ fontSize: '10px', fontWeight: '700', color: '#111', lineHeight: 1.4 }}>{cert.name}</div>
                                            <div style={{ fontSize: '9px', color: '#9ca3af', marginTop: '2px' }}>{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
