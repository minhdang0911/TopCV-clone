'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth.store';
import { userService } from '@/services/user.service';
import { provinceService } from '@/services/province.service';
import api from '@/lib/axios';

const GREEN = '#00b14f';

const SALARY_OPTIONS = [
    { label: 'Dưới 5 triệu', min: 0, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 15 triệu', min: 10000000, max: 15000000 },
    { label: '15 - 20 triệu', min: 15000000, max: 20000000 },
    { label: '20 - 30 triệu', min: 20000000, max: 30000000 },
    { label: 'Trên 30 triệu', min: 30000000, max: null },
    { label: 'Thương lượng', min: null, max: null },
];

const EXPERIENCE_OPTIONS = [
    { label: 'Chưa có kinh nghiệm', value: 'chua-co' },
    { label: '1 năm trở xuống', value: '1-nam-tro-xuong' },
    { label: '1 năm', value: '1-nam' },
    { label: '2 năm', value: '2-nam' },
    { label: '3 năm', value: '3-nam' },
    { label: 'Từ 4-5 năm', value: '4-5-nam' },
    { label: 'Trên 5 năm', value: 'tren-5-nam' },
];

const STEP_TITLES = [
    'Bạn muốn tìm việc ngành gì?',
    'Kinh nghiệm và mức lương',
    'Bạn muốn làm việc ở đâu?',
];

export default function JobPreferencesModal({ onClose }) {
    const { user, setUser } = useAuthStore();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [industries, setIndustries] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [selectedIndustryIds, setSelectedIndustryIds] = useState([]);
    const [gender, setGender] = useState('');
    const [experience, setExperience] = useState('');
    const [selectedSalary, setSelectedSalary] = useState(null);
    const [selectedProvinceCodes, setSelectedProvinceCodes] = useState([]);

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

    const toggleProvince = (code) => {
        setSelectedProvinceCodes((prev) =>
            prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
        );
    };

    const handleSkip = async () => {
        try {
            await userService.updateJobPreferences({ skipped: true });
            if (user) setUser({ ...user, candidateProfile: { ...user.candidateProfile, jobPreferences: { skipped: true } } });
        } catch {}
        onClose();
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        try {
            const jobPreferences = {
                gender,
                industryIds: selectedIndustryIds,
                experience,
                salary: selectedSalary,
                provinceCodes: selectedProvinceCodes,
                provinceCode: selectedProvinceCodes[0] || null,
            };
            await userService.updateJobPreferences(jobPreferences);
            if (user) setUser({ ...user, candidateProfile: { ...user.candidateProfile, jobPreferences } });
            toast.success('Đã lưu thành công!');
            onClose();
            router.push('/cai-dat-goi-y-viec-lam');
        } catch {
            setError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
                {/* Header */}
                <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: GREEN, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                            Bước {step}/3
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            {STEP_TITLES[step - 1]}
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
                        <div style={{ height: '100%', width: `${(step / 3) * 100}%`, background: GREEN, borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                    {/* Step 1: Industries */}
                    {step === 1 && (
                        <div>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Chọn một hoặc nhiều ngành nghề</p>
                            {industries.length === 0 ? (
                                <div style={{ color: '#9ca3af', fontSize: '13px' }}>Đang tải ngành nghề...</div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {industries.map((ind) => {
                                        const selected = selectedIndustryIds.includes(ind.id);
                                        return (
                                            <button key={ind.id} onClick={() => toggleIndustry(ind.id)} style={{ padding: '7px 14px', borderRadius: '20px', border: selected ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: selected ? '#f0fdf4' : 'white', color: selected ? GREEN : '#374151', fontSize: '13px', fontWeight: selected ? '600' : '400', cursor: 'pointer', transition: 'all 0.15s' }}>
                                                {ind.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Gender + Experience + Salary */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Gender */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Giới tính</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {[{ label: 'Nữ', val: 'FEMALE' }, { label: 'Nam', val: 'MALE' }, { label: 'Không xác định', val: 'OTHER' }].map(opt => {
                                        const sel = gender === opt.val;
                                        return (
                                            <button key={opt.val} onClick={() => setGender(opt.val)} style={{ padding: '7px 14px', borderRadius: '20px', border: sel ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: sel ? '#f0fdf4' : 'white', color: sel ? GREEN : '#374151', fontSize: '13px', fontWeight: sel ? '600' : '400', cursor: 'pointer' }}>
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Experience */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Kinh nghiệm</label>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {EXPERIENCE_OPTIONS.map(opt => {
                                        const sel = experience === opt.value;
                                        return (
                                            <button key={opt.value} onClick={() => setExperience(opt.value)} style={{ padding: '7px 14px', borderRadius: '20px', border: sel ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: sel ? '#f0fdf4' : 'white', color: sel ? GREEN : '#374151', fontSize: '13px', fontWeight: sel ? '600' : '400', cursor: 'pointer' }}>
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Salary */}
                            <div>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Mức lương mong muốn</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {SALARY_OPTIONS.map((opt) => {
                                        const selected = selectedSalary?.label === opt.label;
                                        return (
                                            <button key={opt.label} onClick={() => setSelectedSalary(opt)} style={{ padding: '7px 14px', borderRadius: '20px', border: selected ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: selected ? '#f0fdf4' : 'white', color: selected ? GREEN : '#374151', fontSize: '13px', fontWeight: selected ? '600' : '400', cursor: 'pointer' }}>
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Multi-province */}
                    {step === 3 && (
                        <div>
                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>Chọn tỉnh/thành phố bạn muốn làm việc (có thể chọn nhiều)</p>
                            {provinces.length === 0 ? (
                                <div style={{ color: '#9ca3af', fontSize: '13px' }}>Đang tải danh sách tỉnh thành...</div>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                                    {provinces.map((prov) => {
                                        const selected = selectedProvinceCodes.includes(prov.code);
                                        return (
                                            <button key={prov.code} onClick={() => toggleProvince(prov.code)} style={{ padding: '7px 14px', borderRadius: '20px', border: selected ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: selected ? '#f0fdf4' : 'white', color: selected ? GREEN : '#374151', fontSize: '13px', fontWeight: selected ? '600' : '400', cursor: 'pointer', whiteSpace: 'nowrap' }}>
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
                        <button onClick={() => setStep(step - 1)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer', fontWeight: '500' }}>
                            Quay lại
                        </button>
                    ) : (
                        <button onClick={handleSkip} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', cursor: 'pointer' }}>
                            Bỏ qua
                        </button>
                    )}

                    {step < 3 ? (
                        <button onClick={() => setStep(step + 1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px', background: GREEN, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                            Tiếp theo <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={saving} style={{ padding: '10px 28px', background: saving ? '#9ca3af' : GREEN, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
                            {saving ? 'Đang lưu...' : 'Hoàn thành'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
