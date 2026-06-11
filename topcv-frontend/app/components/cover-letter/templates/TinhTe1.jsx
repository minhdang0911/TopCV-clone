import { Mail, Phone, MapPin } from 'lucide-react';
import { resolveFontFamily } from '../fontMap';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function TinhTe1({ content = {}, color = '#1e3a5f', font = 'Muli', fontSize = 'medium', lineSpacing = 1.5 }) {
    const c = content;
    const fs = FONT_SIZE[fontSize] || '13px';
    const paragraphs = (c.body || '').split('\n\n').filter(Boolean);
    const today = c.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{
            width: '794px', minHeight: '1123px', background: 'white',
            fontFamily: resolveFontFamily(font), fontSize: fs, color: '#222',
            position: 'relative', boxSizing: 'border-box',
        }}>
            {/* Header */}
            <div style={{ padding: '40px 48px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                {/* Left: info */}
                <div style={{ flex: 1, paddingRight: '32px' }}>
                    <div style={{ fontSize: '28px', fontWeight: '800', color, letterSpacing: '1px', marginBottom: '4px' }}>
                        {c.fullName || 'TÊN CỦA BẠN'}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#555', letterSpacing: '0.5px', marginBottom: '16px', textTransform: 'uppercase' }}>
                        {c.jobTitle || 'Vị trí ứng tuyển'}
                    </div>
                    <div style={{ width: '48px', height: '3px', background: color, marginBottom: '16px', borderRadius: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {c.phone && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#444' }}>
                                <span style={{ background: color, borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Phone size={11} color="white" />
                                </span>
                                {c.phone}
                            </div>
                        )}
                        {c.email && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#444' }}>
                                <span style={{ background: color, borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Mail size={11} color="white" />
                                </span>
                                {c.email}
                            </div>
                        )}
                        {c.address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#444' }}>
                                <span style={{ background: color, borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <MapPin size={11} color="white" />
                                </span>
                                {c.address}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: avatar */}
                <div style={{
                    width: '110px', height: '110px', borderRadius: '50%',
                    border: `4px solid ${color}`, overflow: 'hidden', flexShrink: 0,
                    background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {c.avatarUrl
                        ? <img src={c.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <svg width="48" height="48" viewBox="0 0 24 24" fill={color + '44'}><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>
                    }
                </div>
            </div>

            {/* Divider */}
            <div style={{ height: '2px', background: `linear-gradient(to right, ${color}, transparent)`, margin: '0 48px' }} />

            {/* Body */}
            <div style={{ padding: '28px 48px', lineHeight: lineSpacing }}>
                {/* Recipient */}
                <div style={{ marginBottom: '20px', fontSize: fs, color: '#333' }}>
                    <div>Kính gửi: Ông/Bà <strong>{c.recipientName || '[Tên]'}</strong></div>
                    <div>{c.department || '[Vị trí / Phòng ban]'}</div>
                    <div>{c.company || '[Tên Công Ty]'}</div>
                    <div>{c.companyAddress || '[Địa chỉ]'}</div>
                    <div style={{ marginTop: '8px' }}>Ngày {today}</div>
                </div>

                {/* Subject */}
                <div style={{ fontWeight: '700', marginBottom: '12px', color: '#111' }}>
                    Thư ứng tuyển {c.position ? `[${c.position}]` : '[Vị trí công việc]'}
                </div>
                <div style={{ marginBottom: '12px', color: '#333' }}>
                    Thưa ông/bà {c.recipientName ? `[${c.recipientName}]` : '[Tên]'},
                </div>

                {/* Body paragraphs */}
                {paragraphs.map((p, i) => (
                    <p key={i} style={{ marginBottom: '12px', color, lineHeight: lineSpacing, textIndent: '24px' }}>{p}</p>
                ))}

                {/* Sign-off */}
                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>© topcv.vn</div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '700', color: '#111', marginBottom: '4px' }}>{c.fullName || 'Nguyễn Văn A'}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
