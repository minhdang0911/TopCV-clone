import { Mail, Phone, MapPin } from 'lucide-react';
import { resolveFontFamily } from '../fontMap';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function MauSac1({ content = {}, color = '#e67e22', font = 'Open Sans', fontSize = 'medium', lineSpacing = 1.5 }) {
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
            {/* Colored full-width header */}
            <div style={{ background: color, padding: '28px 48px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                {/* Avatar circle — overlaps into body area */}
                <div style={{
                    width: '88px', height: '88px', borderRadius: '50%', border: '4px solid white',
                    overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {c.avatarUrl
                        ? <img src={c.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.6)"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>
                    }
                </div>
                <div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: 'white', letterSpacing: '1px' }}>
                        {c.fullName || 'TÊN CỦA BẠN'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontWeight: '500', marginTop: '4px' }}>
                        {c.jobTitle || 'Vị trí ứng tuyển'}
                    </div>
                </div>
            </div>

            {/* Contact bar */}
            <div style={{ background: '#f8f8f8', padding: '10px 48px', display: 'flex', gap: '20px', flexWrap: 'wrap', borderBottom: `3px solid ${color}` }}>
                {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}><Phone size={11} color={color} />{c.phone}</span>}
                {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}><Mail size={11} color={color} />{c.email}</span>}
                {c.address && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}><MapPin size={11} color={color} />{c.address}</span>}
            </div>

            {/* Body */}
            <div style={{ padding: '24px 48px 32px', lineHeight: lineSpacing }}>
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
                    <p key={i} style={{ marginBottom: '12px', color, lineHeight: lineSpacing, textIndent: '24px' }}>{p}</p>
                ))}

                <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>© topcv.vn</div>
                    <div style={{ fontWeight: '700', color: '#111' }}>{c.fullName || 'Nguyễn Văn A'}</div>
                </div>
            </div>
        </div>
    );
}
