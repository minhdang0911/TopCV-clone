import { Mail, Phone, MapPin } from 'lucide-react';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function LapTrinhVien1({ content = {}, color = '#2c3e7a', font = 'Source Code Pro', fontSize = 'medium', lineSpacing = 1.5 }) {
    const c = content;
    const fs = FONT_SIZE[fontSize] || '13px';
    const paragraphs = (c.body || '').split('\n\n').filter(Boolean);
    const today = c.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{
            width: '794px', minHeight: '1123px', background: 'white',
            fontFamily: `'${font}', monospace`, fontSize: fs, color: '#222',
            boxSizing: 'border-box',
        }}>
            {/* Top colored bar */}
            <div style={{ background: color, height: '8px' }} />

            {/* Header */}
            <div style={{ padding: '32px 52px 20px' }}>
                <div style={{ fontSize: '26px', fontWeight: '800', color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                    {c.fullName || 'TÊN CỦA BẠN'}
                </div>
                <div style={{ fontSize: '13px', color: '#666', fontWeight: '500', letterSpacing: '1px', marginBottom: '16px' }}>
                    {c.jobTitle || 'Vị trí ứng tuyển'}
                </div>

                {/* Contact inline */}
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {c.phone && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}>
                            <Phone size={11} color={color} /> {c.phone}
                        </span>
                    )}
                    {c.email && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}>
                            <Mail size={11} color={color} /> {c.email}
                        </span>
                    )}
                    {c.address && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#555' }}>
                            <MapPin size={11} color={color} /> {c.address}
                        </span>
                    )}
                </div>

                {/* Divider */}
                <div style={{ marginTop: '16px', borderTop: `2px solid ${color}`, borderBottom: '1px solid #e5e5e5', paddingTop: '2px' }} />
            </div>

            {/* Body */}
            <div style={{ padding: '0 52px 32px', lineHeight: lineSpacing }}>
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
                    <p key={i} style={{ marginBottom: '12px', color: '#444', lineHeight: lineSpacing, textIndent: '24px' }}>{p}</p>
                ))}

                <div style={{ marginTop: '32px' }}>
                    <div style={{ color: '#333', marginBottom: '24px' }}>Trân trọng.</div>
                    <div style={{ fontWeight: '700', color: '#111' }}>{c.fullName || 'Nguyễn Văn A'}</div>
                    <div style={{ marginTop: '24px', borderTop: `1px solid ${color}`, paddingTop: '6px', fontSize: '11px', color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{c.email || ''}</span>
                        <span>© topcv.vn</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
