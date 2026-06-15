'use client';

import { Settings } from 'lucide-react';

const GREEN = '#00b14f';

export default function CaiDatPage() {
    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Cài đặt</h2>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>Cài đặt tài khoản nhà tuyển dụng</p>
            </div>
            <div style={{ background: 'white', borderRadius: '14px', padding: '60px 28px', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Settings size={26} color="#94a3b8" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#374151', margin: '0 0 8px' }}>Sắp ra mắt</h3>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Tính năng cài đặt tài khoản đang được phát triển</p>
            </div>
        </div>
    );
}
