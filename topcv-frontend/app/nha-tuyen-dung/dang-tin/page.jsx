'use client';

import JobForm from './_JobForm';

export default function DangTinPage() {
    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Đăng tin tuyển dụng</h1>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>Điền đầy đủ thông tin để thu hút ứng viên phù hợp</p>
            </div>
            <JobForm />
        </div>
    );
}
