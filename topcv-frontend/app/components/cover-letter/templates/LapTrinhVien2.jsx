import { Mail, Phone, MapPin } from 'lucide-react';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function LapTrinhVien2({ content = {}, color = '#2c3e7a', font = 'Roboto', fontSize = 'medium', lineSpacing = 1.5 }) {
    const c = content;
    const fs = FONT_SIZE[fontSize] || '13px';
    const paragraphs = (c.body || '').split('\n\n').filter(Boolean);
    const today = c.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{
            width: '794px', minHeight: '1123px', background: 'white',
            fontFamily: `'${font}', sans-serif`, fontSize: fs, color: '#222',
            boxSizing: 'border-box',
        }}>
            {/* Header: centered layout */}
            <div style={{ padding: '32px 52px 20px', textAlign: 'center', borderBottom: '2px solid #eee', position: 'relative' }}>
                {/* Job title badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: color, color: 'white', borderRadius: '20px', padding: '5px 16px', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="4" width="10" height="7" rx="1.5" stroke="white" strokeWidth="1.2"/><path d="M4 4V3a2 2 0 0 1 4 0v1" stroke="white" strokeWidth="1.2"/></svg>
                    {c.jobTitle || 'Nhân Viên Kinh Doanh'}
                </div>

                {/* Avatar */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: `3px solid ${color}`, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {c.avatarUrl
                            ? <img src={c.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <svg width="36" height="36" viewBox="0 0 24 24" fill={color + '55'}><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>
                        }
                    </div>
                </div>

                {/* Name */}
                <div style={{ fontSize: '22px', fontWeight: '800', color, letterSpacing: '1px', marginBottom: '12px' }}>
                    {c.fullName || 'NGUYỄN VĂN A'}
                </div>

                {/* Contact row */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {c.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: color, borderRadius: '6px', padding: '4px 10px' }}>
                            <Mail size={11} color="white" />
                            <span style={{ fontSize: '11px', color: 'white' }}>{c.email}</span>
                        </div>
                    )}
                    {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: color, borderRadius: '6px', padding: '4px 10px' }}>
                            <Phone size={11} color="white" />
                            <span style={{ fontSize: '11px', color: 'white' }}>{c.phone}</span>
                        </div>
                    )}
                    {c.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: color, borderRadius: '6px', padding: '4px 10px' }}>
                            <MapPin size={11} color="white" />
                            <span style={{ fontSize: '11px', color: 'white' }}>{c.address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '24px 52px 32px', lineHeight: lineSpacing }}>
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
