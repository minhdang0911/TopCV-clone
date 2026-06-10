import { Mail, Phone, MapPin } from 'lucide-react';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function TinhTe2({ content = {}, color = '#1e3a5f', font = 'Muli', fontSize = 'medium', lineSpacing = 1.5 }) {
    const c = content;
    const fs = FONT_SIZE[fontSize] || '13px';
    const paragraphs = (c.body || '').split('\n\n').filter(Boolean);
    const today = c.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{
            width: '794px', minHeight: '1123px', background: 'white',
            fontFamily: `'${font}', sans-serif`, fontSize: fs, color: '#222',
            position: 'relative', boxSizing: 'border-box',
        }}>
            {/* Header band */}
            <div style={{
                background: '#e8f0f7',
                padding: '32px 0 32px 48px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Avatar */}
                <div style={{
                    width: '96px', height: '96px', flexShrink: 0, overflow: 'hidden',
                    border: `3px solid ${color}`,
                    background: '#cdd8e8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    {c.avatarUrl
                        ? <img src={c.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <svg width="44" height="44" viewBox="0 0 24 24" fill={color + '66'}><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z"/></svg>
                    }
                </div>

                {/* Name / title */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '24px', fontWeight: '800', color, letterSpacing: '0.5px' }}>
                        {c.fullName || 'TÊN CỦA BẠN'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#555', fontWeight: '500', marginBottom: '12px', textTransform: 'uppercase' }}>
                        {c.jobTitle || 'Vị trí ứng tuyển'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {c.phone && <span style={{ fontSize: '11px', color: '#444' }}>{c.phone}</span>}
                        {c.email && <span style={{ fontSize: '11px', color: '#444' }}>{c.email}</span>}
                        {c.address && <span style={{ fontSize: '11px', color: '#444' }}>{c.address}</span>}
                    </div>
                </div>

                {/* Right contact icons column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '56px' }}>
                    {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#333' }}>
                            <span style={{ background: color, padding: '4px', borderRadius: '4px', display: 'flex' }}><Phone size={10} color="white" /></span>
                            {c.phone}
                        </div>
                    )}
                    {c.email && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#333' }}>
                            <span style={{ background: color, padding: '4px', borderRadius: '4px', display: 'flex' }}><Mail size={10} color="white" /></span>
                            {c.email}
                        </div>
                    )}
                    {c.address && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#333' }}>
                            <span style={{ background: color, padding: '4px', borderRadius: '4px', display: 'flex' }}><MapPin size={10} color="white" /></span>
                            {c.address}
                        </div>
                    )}
                </div>

                {/* Dark vertical bar */}
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '18px', background: color }} />
            </div>

            {/* Body */}
            <div style={{ padding: '28px 48px', lineHeight: lineSpacing }}>
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
                    <div style={{ textAlign: 'right', fontWeight: '700', color: '#111' }}>
                        {c.fullName || 'Nguyễn Văn A'}
                    </div>
                </div>
            </div>
        </div>
    );
}
