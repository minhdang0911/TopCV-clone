'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import useAuthStore from '@/stores/auth.store';
import { userService } from '@/services/user.service';
import { provinceService } from '@/services/province.service';
import api from '@/lib/axios';

const SALARY_OPTIONS = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 15 triệu', min: 10000000, max: 15000000 },
    { label: '15 - 20 triệu', min: 15000000, max: 20000000 },
    { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
    { label: 'Trên 30 triệu', min: 30000000, max: null },
    { label: 'Thương lượng', min: null, max: null },
];

export default function JobPreferencesModal({ onClose }) {
    const { user, setUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [industries, setIndustries] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [selectedIndustryIds, setSelectedIndustryIds] = useState([]);
    const [desiredPosition, setDesiredPosition] = useState('');
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);

    useEffect(() => {
        api.get('/industries?limit=100').then((res) => {
            setIndustries(Array.isArray(res.data) ? res.data : (res.data?.data || []));
        }).catch(() => setIndustries([]));

        provinceService.getAll().then((data) => {
            setProvinces(Array.isArray(data) ? data : []);
        }).catch(() => setProvinces([]));
    }, []);

    const toggleIndustry = (id) => {
        setSelectedIndustryIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
        );
    };

    const updateUserState = (jobPreferences) => {
        if (!user) return;
        setUser({
            ...user,
            candidateProfile: {
                ...user.candidateProfile,
                jobPreferences,
            },
        });
    };

    const handleSkip = async () => {
        try {
            await userService.updateJobPreferences({ skipped: true });
            updateUserState({ skipped: true });
        } catch {}
        onClose();
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            const jobPreferences = {
                industryIds: selectedIndustryIds,
                desiredPosition: desiredPosition.trim(),
                salary: selectedSalary,
                provinceCode: selectedProvinceCode,
            };
            await userService.updateJobPreferences(jobPreferences);
            updateUserState(jobPreferences);
            onClose();
        } catch {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
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
                            Bước {step}/3
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            {step === 1 && 'Bạn muốn tìm việc ngành gì?'}
                            {step === 2 && 'Vị trí và mức lương mong muốn'}
                            {step === 3 && 'Bạn muốn làm việc ở đâu?'}
                        </h2>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                            TopCV sẽ gợi ý công việc phù hợp hơn cho bạn
                        </p>
                    </div>
                    <button onClick={handleSkip} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px', marginTop: '-4px' }}>
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
                                Chọn một hoặc nhiều ngành nghề
                            </p>
                            {industries.length === 0 ? (
                                <div style={{ color: '#9ca3af', fontSize: '13px' }}>Đang tải ngành nghề...</div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {industries.map((ind) => {
                                        const selected = selectedIndustryIds.includes(ind.id);
                                        return (
                                            <button
                                                key={ind.id}
                                                onClick={() => toggleIndustry(ind.id)}
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
                                                {ind.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                                    Vị trí mong muốn
                                </label>
                                <input
                                    type="text"
                                    placeholder="VD: Frontend Developer, Kế toán tổng hợp..."
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
                                    Mức lương mong muốn
                                </label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {SALARY_OPTIONS.map((opt) => {
                                        const selected = selectedSalary?.label === opt.label;
                                        return (
                                            <button
                                                key={opt.label}
                                                onClick={() => setSelectedSalary(opt)}
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
                                Chọn tỉnh/thành phố bạn muốn làm việc
                            </p>
                            {provinces.length === 0 ? (
                                <div style={{ color: '#9ca3af', fontSize: '13px' }}>Đang tải danh sách tỉnh thành...</div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                                    {provinces.map((prov) => {
                                        const selected = selectedProvinceCode === prov.code;
                                        return (
                                            <button
                                                key={prov.code}
                                                onClick={() => setSelectedProvinceCode(prov.code)}
                                                style={{
                                                    padding: '7px 14px',
                                                    borderRadius: '20px',
                                                    border: selected ? '1.5px solid #00b14f' : '1.5px solid #e5e7eb',
                                                    background: selected ? '#f0fdf4' : 'white',
                                                    color: selected ? '#00b14f' : '#374151',
                                                    fontSize: '13px',
                                                    fontWeight: selected ? '600' : '400',
                                                    cursor: 'pointer',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {prov.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {error && (
                        <div style={{ marginTop: '12px', padding: '10px 12px', background: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '13px' }}>
                            {error}
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
                            Quay lại
                        </button>
                    ) : (
                        <button
                            onClick={handleSkip}
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer' }}
                        >
                            Bỏ qua
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
                            Tiếp theo <ChevronRight size={16} />
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
                            {saving ? 'Đang lưu...' : 'Hoàn thành'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
