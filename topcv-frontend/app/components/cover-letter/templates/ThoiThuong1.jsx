import { Mail, Phone, MapPin } from 'lucide-react';
import { resolveFontFamily } from '../fontMap';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function ThoiThuong1({ content = {}, color = '#00b14f', font = 'Be Vietnam Pro', fontSize = 'medium', lineSpacing = 1.6 }) {
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
            {/* Top color band */}
            <div style={{ background: color, height: '8px' }} />

            {/* Header */}
            <div style={{ padding: '36px 56px 28px', display: 'flex', alignItems: 'flex-start', gap: '24px', borderBottom: '1px solid #e9ecef' }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                    {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="avatar" style={{ width: '88px', height: '88px', borderRadius: '4px', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ width: '88px', height: '88px', borderRadius: '4px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '800', color }}>
                            {(c.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                {/* Name + info */}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '26px', fontWeight: '800', color: '#111', lineHeight: 1.2, marginBottom: '4px' }}>
                        {c.fullName || 'Họ và Tên'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color, marginBottom: '14px', letterSpacing: '0.3px' }}>
                        {c.jobTitle || 'Vị trí ứng tuyển'}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                        {c.phone && <span style={{ fontSize: '11px', color: '#555', display: 'flex', alignItems: 'center', gap: '5px' }}><Phone size={11} color={color} />{c.phone}</span>}
                        {c.email && <span style={{ fontSize: '11px', color: '#555', display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={11} color={color} />{c.email}</span>}
                        {c.address && <span style={{ fontSize: '11px', color: '#555', display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={11} color={color} />{c.address}</span>}
                    </div>
                </div>

                {/* Date */}
                <div style={{ fontSize: '11px', color: '#aaa', whiteSpace: 'nowrap', marginTop: '6px' }}>
                    {today}
                </div>
            </div>

            {/* Body */}
            <div style={{ padding: '28px 56px 40px' }}>
                {/* Recipient */}
                <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontSize: '12px', color: '#333', lineHeight: 1.7 }}>
                        {c.recipientName && <div>Kính gửi: <strong>{c.recipientName}</strong>{c.department ? ` — ${c.department}` : ''}</div>}
                        {c.company && <div style={{ color: color, fontWeight: '600' }}>{c.company}</div>}
                        {c.companyAddress && <div style={{ color: '#888' }}>{c.companyAddress}</div>}
                    </div>
                </div>

                {/* Subject line */}
                <div style={{ marginBottom: '20px', padding: '10px 16px', background: `${color}0f`, borderLeft: `3px solid ${color}`, borderRadius: '0 4px 4px 0' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#333' }}>V/v: </span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color }}>Ứng tuyển vị trí {c.position || '[Tên vị trí]'} tại {c.company || '[Tên công ty]'}</span>
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
                <div style={{ marginTop: '32px', textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '40px' }}>Trân trọng,</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#111' }}>{c.fullName || 'Họ và Tên'}</div>
                    <div style={{ width: '80px', height: '2px', background: color, marginLeft: 'auto', marginTop: '6px', borderRadius: '2px' }} />
                </div>
            </div>
        </div>
    );
}
