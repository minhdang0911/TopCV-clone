import Link from 'next/link';

const GREEN = '#00b14f';

interface SeoColumn {
    title: string;
    items: { label: string; href: string }[];
}

interface SeoKeywordsProps {
    heading?: string;
    description?: string;
    columns?: SeoColumn[];
}

const DEFAULT_COLUMNS: SeoColumn[] = [
    {
        title: 'Việc làm theo ngành nghề',
        items: [
            { label: 'Việc làm Kinh doanh/Bán hàng', href: '#' },
            { label: 'Việc làm Marketing/PR/Quảng cáo', href: '#' },
            { label: 'Việc làm Chăm sóc khách hàng/Vận hành', href: '#' },
            { label: 'Việc làm Nhân sự/Hành chính/Pháp chế', href: '#' },
            { label: 'Việc làm Công nghệ Thông tin', href: '#' },
            { label: 'Việc làm Lao động phổ thông', href: '#' },
            { label: 'Việc làm Tài chính/Ngân hàng/Bảo hiểm', href: '#' },
            { label: 'Việc làm Kế toán/Kiểm toán', href: '#' },
            { label: 'Việc làm Logistics', href: '#' },
            { label: 'Việc làm Xây dựng', href: '#' },
        ],
    },
    {
        title: 'Việc làm theo khu vực',
        items: [
            { label: 'Việc làm tại Hà Nội', href: '/tim-viec-lam-moi-nhat?provinceCode=01&provinceName=Hà Nội' },
            {
                label: 'Việc làm tại Hồ Chí Minh',
                href: '/tim-viec-lam-moi-nhat?provinceCode=79&provinceName=Hồ Chí Minh',
            },
            {
                label: 'Việc làm tại Bình Dương',
                href: '/tim-viec-lam-moi-nhat?provinceCode=74&provinceName=Bình Dương',
            },
            { label: 'Việc làm tại Bắc Ninh', href: '/tim-viec-lam-moi-nhat?provinceCode=27&provinceName=Bắc Ninh' },
            { label: 'Việc làm tại Đồng Nai', href: '/tim-viec-lam-moi-nhat?provinceCode=75&provinceName=Đồng Nai' },
            { label: 'Việc làm tại Hưng Yên', href: '/tim-viec-lam-moi-nhat?provinceCode=33&provinceName=Hưng Yên' },
            { label: 'Việc làm tại Hải Dương', href: '/tim-viec-lam-moi-nhat?provinceCode=30&provinceName=Hải Dương' },
            { label: 'Việc làm tại Đà Nẵng', href: '/tim-viec-lam-moi-nhat?provinceCode=48&provinceName=Đà Nẵng' },
            { label: 'Việc làm tại Hải Phòng', href: '/tim-viec-lam-moi-nhat?provinceCode=31&provinceName=Hải Phòng' },
            { label: 'Việc làm tại Cần Thơ', href: '/tim-viec-lam-moi-nhat?provinceCode=92&provinceName=Cần Thơ' },
        ],
    },
    {
        title: 'Việc làm phổ biến',
        items: [
            { label: 'Việc làm Digital Marketing', href: '#' },
            { label: 'Việc làm Content Marketing', href: '#' },
            { label: 'Việc làm Tuyển dụng', href: '#' },
            { label: 'Việc làm Kế toán tổng hợp', href: '#' },
            { label: 'Việc làm Sales Admin/Sales Support', href: '#' },
            { label: 'Việc làm Kinh doanh/Bán hàng khác', href: '#' },
            { label: 'Việc làm Thu mua/Mua hàng', href: '#' },
            { label: 'Việc làm Photographer/Video', href: '#' },
            { label: 'Việc làm Lập trình viên', href: '#' },
            { label: 'Việc làm Kỹ sư', href: '#' },
        ],
    },
    {
        title: 'Việc làm phổ thông',
        items: [
            { label: 'Việc làm Tài xế', href: '#' },
            { label: 'Việc làm Bảo vệ', href: '#' },
            { label: 'Việc làm Công nhân', href: '#' },
            { label: 'Việc làm Nhân viên kho', href: '#' },
            { label: 'Việc làm Shipper (Nhân viên giao hàng)', href: '#' },
            { label: 'Việc làm Thu ngân', href: '#' },
            { label: 'Việc làm Lễ tân/Đón tiếp', href: '#' },
            { label: 'Việc làm Pha chế (Barista)', href: '#' },
            { label: 'Việc làm Trực page', href: '#' },
            { label: 'Việc làm Phục vụ nhà hàng', href: '#' },
        ],
    },
];

export default function SeoKeywords({
    heading = 'Cơ hội ứng tuyển việc làm với đãi ngộ hấp dẫn tại các công ty hàng đầu',
    description,
    columns = DEFAULT_COLUMNS,
}: SeoKeywordsProps) {
    return (
        <div style={{ background: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '24px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>{heading}</h2>

                {description && (
                    <p
                        style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6', margin: '0 0 14px' }}
                        dangerouslySetInnerHTML={{ __html: description }}
                    />
                )}

                <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', margin: '0 0 10px' }}>
                    Các từ khóa liên quan:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {columns.map((col) => (
                        <div
                            key={col.title}
                            style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                background: 'white',
                            }}
                        >
                            {/* Header */}
                            <div
                                style={{
                                    padding: '8px 12px',
                                    borderBottom: '1px solid #f3f4f6',
                                    background: '#fafafa',
                                }}
                            >
                                <span style={{ fontSize: '12px', fontWeight: '700', color: '#374151' }}>
                                    {col.title}
                                </span>
                            </div>
                            {/* Body - scrollable, compact */}
                            <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                {col.items.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        className="seo-link"
                                        style={{
                                            display: 'block',
                                            fontSize: '12px',
                                            color: '#6b7280',
                                            padding: '5px 12px',
                                            textDecoration: 'none',
                                            lineHeight: '1.4',
                                            borderBottom: '1px solid #f9fafb',
                                        }}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
