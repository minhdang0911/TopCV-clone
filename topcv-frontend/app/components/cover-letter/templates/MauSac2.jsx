import { Mail, Phone, MapPin } from 'lucide-react';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function MauSac2({ content = {}, color = '#27ae60', font = 'Be Vietnam Pro', fontSize = 'medium', lineSpacing = 1.5 }) {
    const c = content;
    const fs = FONT_SIZE[fontSize] || '13px';
    const paragraphs = (c.body || '').split('\n\n').filter(Boolean);
    const today = c.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{
            width: '794px', minHeight: '1123px', background: 'white',
            fontFamily: `'${font}', sans-serif`, fontSize: fs, color: '#222',
            display: 'flex', boxSizing: 'border-box',
        }}>
            {/* Left sidebar */}
            <div style={{ width: '240px', background: color, flexShrink: 0, padding: '36px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Avatar */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c.avatarUrl
                            ? <img src={c.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>
                        }
                    </div>
                </div>

                {/* Name */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', lineHeight: 1.3 }}>
                        {c.fullName || 'NGUYỄN VĂN A'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '4px', fontWeight: '500' }}>
                        {c.jobTitle || 'Vị trí ứng tuyển'}
                    </div>
                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }} />

                {/* Contact */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'white' }}>
                            <Phone size={12} color="white" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word' }}>{c.phone}</span>
                        </div>
                    )}
                    {c.email && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'white' }}>
                            <Mail size={12} color="white" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word' }}>{c.email}</span>
                        </div>
                    )}
                    {c.address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'white' }}>
                            <MapPin size={12} color="white" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word' }}>{c.address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: letter body */}
            <div style={{ flex: 1, padding: '36px 36px 32px', lineHeight: lineSpacing, overflowWrap: 'break-word' }}>
                <div style={{ marginBottom: '20px', fontSize: fs, color: '#333' }}>
                    <div>Kính gửi: Ông/Bà <strong>{c.recipientName || '[Tên]'}</strong></div>
                    <div>{c.department || '[Vị trí / Phòng ban]'}</div>
                    <div>{c.company || '[Tên Công Ty]'}</div>
                    <div>{c.companyAddress || '[Địa chỉ]'}</div>
                    <div style={{ marginTop: '8px' }}>Ngày {today}</div>
                </div>

                <div style={{ fontWeight: '700', marginBottom: '12px', color: '#111' }}>
                    Thư ứng tuyển {c.position ? `[${c.position}]` : '[Vị trí công việc]'}
                </div>
                <div style={{ marginBottom: '12px', color: '#333' }}>
                    Thưa ông/bà {c.recipientName ? `[${c.recipientName}]` : '[Tên]'},
                </div>

                {paragraphs.map((p, i) => (
                    <p key={i} style={{ marginBottom: '12px', color, lineHeight: lineSpacing, textIndent: '20px', fontSize: fs }}>{p}</p>
                ))}

                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>© topcv.vn</div>
                    <div style={{ fontWeight: '700', color: '#111', fontSize: fs }}>{c.fullName || 'Nguyễn Văn A'}</div>
                </div>
            </div>
        </div>
    );
}
