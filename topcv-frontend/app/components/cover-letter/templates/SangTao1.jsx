import { Mail, Phone, MapPin } from 'lucide-react';
import { resolveFontFamily } from '../fontMap';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function SangTao1({ content = {}, color = '#e67e22', font = 'Open Sans', fontSize = 'medium', lineSpacing = 1.65 }) {
    const c = content;
    const fs = FONT_SIZE[fontSize] || '13px';
    const paragraphs = (c.body || '').split('\n\n').filter(Boolean);
    const today = c.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{
            width: '794px', minHeight: '1123px', background: 'white',
            fontFamily: resolveFontFamily(font), fontSize: fs, color: '#222',
            boxSizing: 'border-box',
        }}>
            {/* Bold header block */}
            <div style={{ background: color, padding: '36px 56px 30px', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative circles */}
                <div style={{ position: 'absolute', right: -40, top: -40, width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ position: 'absolute', right: 40, bottom: -60, width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', position: 'relative' }}>
                    {/* Avatar */}
                    <div style={{ flexShrink: 0 }}>
                        {c.avatarUrl ? (
                            <img src={c.avatarUrl} alt="avatar" style={{ width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)' }} />
                        ) : (
                            <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '800', color: 'white', border: '3px solid rgba(255,255,255,0.35)' }}>
                                {(c.fullName || 'A').charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: 'white', lineHeight: 1.15, marginBottom: '5px', letterSpacing: '-0.5px' }}>
                            {c.fullName || 'Họ và Tên'}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.85)', marginBottom: '14px' }}>
                            {c.jobTitle || 'Vị trí ứng tuyển'}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                            {c.phone && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={10} />{c.phone}</span>}
                            {c.email && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={10} />{c.email}</span>}
                            {c.address && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={10} />{c.address}</span>}
                        </div>
                    </div>

                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}>{today}</div>
                </div>
            </div>

            {/* Accent strip */}
            <div style={{ height: '5px', background: `${color}50` }} />

            {/* Body */}
            <div style={{ padding: '30px 56px 40px' }}>
                {/* Recipient + subject */}
                <div style={{ marginBottom: '22px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {(c.recipientName || c.company) && (
                        <div style={{ flex: 1, fontSize: '12px', color: '#444', lineHeight: 1.7 }}>
                            {c.recipientName && <div>Kính gửi: <strong>{c.recipientName}</strong>{c.department ? ` — ${c.department}` : ''}</div>}
                            {c.company && <div style={{ color: color, fontWeight: '600' }}>{c.company}</div>}
                            {c.companyAddress && <div style={{ color: '#999' }}>{c.companyAddress}</div>}
                        </div>
                    )}
                    <div style={{ flexShrink: 0, background: `${color}12`, border: `1px solid ${color}30`, borderRadius: '6px', padding: '8px 14px', maxWidth: '220px' }}>
                        <div style={{ fontSize: '10px', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>Ứng tuyển</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color }}>{c.position || '[Tên vị trí]'}</div>
                    </div>
                </div>

                {/* Letter body */}
                <div style={{ lineHeight: lineSpacing, color: '#333' }}>
                    {paragraphs.length > 0
                        ? paragraphs.map((p, i) => (
                            <p key={i} style={{ margin: '0 0 14px', textAlign: 'justify', fontSize: fs }}>{p}</p>
                        ))
                        : <p style={{ margin: 0, color: '#aaa', fontStyle: 'italic' }}>Nội dung thư xin việc...</p>
                    }
                </div>

                {/* Signature */}
                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>
                        Hồ sơ đính kèm: CV + Bằng cấp liên quan
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '34px' }}>Trân trọng,</div>
                        <div style={{ display: 'inline-block', borderBottom: `2px solid ${color}`, paddingBottom: '4px', minWidth: '120px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#111' }}>{c.fullName || 'Họ và Tên'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
