'use client';

import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { userService } from '@/services/user.service';

const INDUSTRIES = [
    'Công nghệ thông tin',
    'Kinh doanh / Bán hàng',
    'Marketing / PR',
    'Kế toán / Tài chính',
    'Nhân sự',
    'Kỹ thuật / Cơ khí',
    'Thiết kế / Sáng tạo',
    'Giáo dục / Đào tạo',
    'Y tế / Dược',
    'Logistics / Vận tải',
    'Xây dựng / Bất động sản',
    'Ngân hàng / Bảo hiểm',
    'Truyền thông / Báo chí',
    'Khách sạn / Nhà hàng',
    'Khác',
];

const SALARY_OPTIONS = [
    { label: 'Dưới 5 triệu', value: { min: 0, max: 5000000 } },
    { label: '5 - 10 triệu', value: { min: 5000000, max: 10000000 } },
    { label: '10 - 15 triệu', value: { min: 10000000, max: 15000000 } },
    { label: '15 - 20 triệu', value: { min: 15000000, max: 20000000 } },
    { label: '20 - 30 triệu', value: { min: 20000000, max: 30000000 } },
    { label: 'Trên 30 triệu', value: { min: 30000000, max: null } },
    { label: 'Thương lượng', value: { min: null, max: null } },
];

const PROVINCES = [
    'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Bình Dương', 'Đồng Nai',
    'Hải Phòng', 'Cần Thơ', 'Long An', 'Bà Rịa - Vũng Tàu', 'Khác',
];

export default function JobPreferencesModal({ onClose }) {
    const { setUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);

    const [selectedIndustries, setSelectedIndustries] = useState([]);
    const [desiredPosition, setDesiredPosition] = useState('');
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [selectedProvince, setSelectedProvince] = useState('');

    const toggleIndustry = (ind) => {
        setSelectedIndustries((prev) =>
            prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind],
        );
    };

    const handleSubmit = async () => {
        setSaving(true);
        try {
            const jobPreferences = {
                industries: selectedIndustries,
                desiredPosition: desiredPosition.trim(),
                salary: selectedSalary,
                province: selectedProvince,
            };
            await userService.updateJobPreferences(jobPreferences);
            const res = await userService.getMe();
            setUser(res.data);
            onClose();
        } catch {
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.55)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '520px',
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
                }}
            >
                {/* Header */}
                <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#00b14f', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                            Buoc {step}/3
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            {step === 1 && 'Ban muon tim viec nganh gi?'}
                            {step === 2 && 'Vi tri va muc luong mong muon'}
                            {step === 3 && 'Ban muon lam viec o dau?'}
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                            TopCV se goi y cong viec phu hop hon cho ban
                        </p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', marginTop: '-4px' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Progress bar */}
                <div style={{ padding: '16px 24px 0' }}>
                    <div style={{ height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
                        <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: '#00b14f', borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {step === 1 && (
                        <div>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                Chon mot hoac nhieu nganh nghe
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {INDUSTRIES.map((ind) => {
                                    const selected = selectedIndustries.includes(ind);
                                    return (
                                        <button
                                            key={ind}
                                            onClick={() => toggleIndustry(ind)}
                                            style={{
                                                padding: '7px 14px',
                                                borderRadius: '20px',
                                                border: selected ? '1.5px solid #00b14f' : '1.5px solid #e5e7eb',
                                                background: selected ? '#f0fdf4' : 'white',
                                                color: selected ? '#00b14f' : '#374151',
                                                fontSize: '13px',
                                                fontWeight: selected ? '600' : '400',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s',
                                            }}
                                        >
                                            {ind}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                                    Vi tri mong muon
                                </label>
                                <input
                                    type="text"
                                    placeholder="VD: Frontend Developer, Ke toan tong hop..."
                                    value={desiredPosition}
                                    onChange={(e) => setDesiredPosition(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>
                                    Muc luong mong muon
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {SALARY_OPTIONS.map((opt) => {
                                        const selected = selectedSalary?.label === opt.label;
                                        return (
                                            <button
                                                key={opt.label}
                                                onClick={() => setSelectedSalary({ label: opt.label, ...opt.value })}
                                                style={{
                                                    padding: '7px 14px',
                                                    borderRadius: '20px',
                                                    border: selected ? '1.5px solid #00b14f' : '1.5px solid #e5e7eb',
                                                    background: selected ? '#f0fdf4' : 'white',
                                                    color: selected ? '#00b14f' : '#374151',
                                                    fontSize: '13px',
                                                    fontWeight: selected ? '600' : '400',
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                Chon tinh/thanh pho ban muon lam viec
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {PROVINCES.map((prov) => {
                                    const selected = selectedProvince === prov;
                                    return (
                                        <button
                                            key={prov}
                                            onClick={() => setSelectedProvince(prov)}
                                            style={{
                                                padding: '7px 14px',
                                                borderRadius: '20px',
                                                border: selected ? '1.5px solid #00b14f' : '1.5px solid #e5e7eb',
                                                background: selected ? '#f0fdf4' : 'white',
                                                color: selected ? '#00b14f' : '#374151',
                                                fontSize: '13px',
                                                fontWeight: selected ? '600' : '400',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {prov}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Quay lai
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer' }}
                        >
                            Bo qua
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '10px 24px',
                                background: '#00b14f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer',
                            }}
                        >
                            Tiep theo <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={saving}
                            style={{
                                padding: '10px 28px',
                                background: saving ? '#9ca3af' : '#00b14f',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? 'Dang luu...' : 'Hoan thanh'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
