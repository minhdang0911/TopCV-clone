import { Mail, Phone, MapPin } from 'lucide-react';
import { resolveFontFamily } from '../fontMap';

const FONT_SIZE = { small: '12px', medium: '13px', large: '14px' };

export default function ChuyenNghiep1({ content = {}, color = '#1e3a5f', font = 'Roboto', fontSize = 'medium', lineSpacing = 1.6 }) {
    const c = content;
    const fs = FONT_SIZE[fontSize] || '13px';
    const paragraphs = (c.body || '').split('\n\n').filter(Boolean);
    const today = c.date || new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div style={{
            width: '794px', minHeight: '1123px', background: 'white',
            fontFamily: resolveFontFamily(font), fontSize: fs, color: '#222',
            boxSizing: 'border-box', display: 'flex',
        }}>
            {/* Sidebar */}
            <div style={{ width: '220px', flexShrink: 0, background: color, padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Avatar */}
                <div style={{ marginBottom: '18px' }}>
                    {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt="avatar" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }} />
                    ) : (
                        <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', fontWeight: '800', color: 'white', border: '3px solid rgba(255,255,255,0.3)' }}>
                            {(c.fullName || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div style={{ fontSize: '16px', fontWeight: '800', color: 'white', textAlign: 'center', lineHeight: 1.3, marginBottom: '6px' }}>
                    {c.fullName || 'Họ và Tên'}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: '20px', lineHeight: 1.4 }}>
                    {c.jobTitle || 'Vị trí ứng tuyển'}
                </div>

                <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.4)', marginBottom: '20px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                    {c.phone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
                            <Phone size={11} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0 }} />
                            <span style={{ wordBreak: 'break-word' }}>{c.phone}</span>
                        </div>
                    )}
                    {c.email && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
                            <Mail size={11} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span style={{ wordBreak: 'break-word' }}>{c.email}</span>
                        </div>
                    )}
                    {c.address && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '11px', color: 'rgba(255,255,255,0.85)' }}>
                            <MapPin size={11} color="rgba(255,255,255,0.7)" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <span>{c.address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, padding: '40px 36px' }}>
                {/* Date */}
                <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '24px', textAlign: 'right' }}>{today}</div>

                {/* Title */}
                <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color, marginBottom: '6px' }}>
                        THƯ XIN VIỆC
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                        Ứng tuyển vị trí: <strong style={{ color, fontStyle: 'normal' }}>{c.position || '[Tên vị trí]'}</strong>
                    </div>
                </div>

                {/* Recipient */}
                {(c.recipientName || c.company) && (
                    <div style={{ marginBottom: '18px', fontSize: '12px', color: '#444', lineHeight: 1.7 }}>
                        {c.recipientName && <div>Kính gửi: <strong>{c.recipientName}</strong>{c.department ? ` — ${c.department}` : ''}</div>}
                        {c.company && <div><strong>{c.company}</strong></div>}
                        {c.companyAddress && <div style={{ color: '#888' }}>{c.companyAddress}</div>}
                    </div>
                )}

                {/* Divider */}
                <div style={{ height: '1px', background: `${color}30`, marginBottom: '18px' }} />

                {/* Body */}
                <div style={{ lineHeight: lineSpacing, color: '#333' }}>
                    {paragraphs.length > 0
                        ? paragraphs.map((p, i) => (
                            <p key={i} style={{ margin: '0 0 13px', textAlign: 'justify', fontSize: fs }}>{p}</p>
                        ))
                        : <p style={{ margin: 0, color: '#aaa', fontStyle: 'italic' }}>Nội dung thư xin việc...</p>
                    }
                </div>

                {/* Signature */}
                <div style={{ marginTop: '30px' }}>
                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '36px' }}>Trân trọng kính chào,</div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#111' }}>{c.fullName || 'Họ và Tên'}</div>
                    <div style={{ fontSize: '11px', color, marginTop: '3px' }}>{c.jobTitle || 'Vị trí ứng tuyển'}</div>
                </div>
            </div>
        </div>
    );
}
