// Ví dụ dùng HomeSearch trong Hero section của trang chủ
// Đặt ở: app/(home)/page.tsx hoặc app/page.tsx

import HomeSearch from './Homesearch';

export default function HeroSection() {
    return (
        <section
            style={{
                background: 'linear-gradient(135deg, #00b14f 0%, #007a35 60%, #005a28 100%)',
                padding: '60px 20px 50px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background decorative */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%)',
                    pointerEvents: 'none',
                }}
            />

            <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative' }}>
                {/* Headline */}
                <h1
                    style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: GREEN,
                        margin: '0 0 10px',
                        lineHeight: '1.3',
                        textShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }}
                >
                    Tìm việc làm nhanh 24h, việc làm mới nhất trên toàn quốc
                </h1>
                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 28px' }}>
                    Tiếp cận <strong style={{ color: 'white' }}>60.000+</strong> tin tuyển dụng việc làm mỗi ngày từ
                    hàng nghìn doanh nghiệp uy tín tại Việt Nam
                </p>

                {/* ══ HomeSearch component ══ */}
                <HomeSearch />
            </div>
        </section>
    );
}

const GREEN = '#00b14f';
