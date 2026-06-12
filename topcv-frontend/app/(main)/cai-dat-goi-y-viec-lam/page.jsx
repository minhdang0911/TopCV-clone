'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, X, ChevronDown, Search } from 'lucide-react';
import { toast } from 'sonner';
import { provinceService } from '@/services/province.service';
import { userService } from '@/services/user.service';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';

const GREEN = '#00b14f';

const EXPERIENCE_OPTIONS = [
    { label: '-- Thời gian làm việc ngành nghề đã chọn --', value: '' },
    { label: 'Chưa có kinh nghiệm', value: 'chua-co' },
    { label: '1 năm trở xuống', value: '1-nam-tro-xuong' },
    { label: '1 năm', value: '1-nam' },
    { label: '2 năm', value: '2-nam' },
    { label: '3 năm', value: '3-nam' },
    { label: 'Từ 4-5 năm', value: '4-5-nam' },
    { label: 'Trên 5 năm', value: 'tren-5-nam' },
];

function formatVND(val) {
    if (!val && val !== 0) return '';
    const n = typeof val === 'string' ? parseInt(val.replace(/[^\d]/g, ''), 10) : val;
    if (isNaN(n)) return '';
    return n.toLocaleString('vi-VN');
}

function parseVND(str) {
    return parseInt((str || '').replace(/[^\d]/g, ''), 10) || 0;
}

function Section({ title, required, children }) {
    return (
        <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '10px' }}>
                {title}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
            </label>
            {children}
        </div>
    );
}

function FormContent({ initialPrefs, industries, provinces }) {
    const { user, setUser } = useAuthStore();
    const router = useRouter();

    const parsedCodes = Array.isArray(initialPrefs?.provinceCodes) && initialPrefs.provinceCodes.length
        ? initialPrefs.provinceCodes
        : initialPrefs?.provinceCode ? [initialPrefs.provinceCode] : [];

    const [gender, setGender] = useState(initialPrefs?.gender || '');
    const [selectedIndustryIds, setSelectedIndustryIds] = useState(initialPrefs?.industryIds || []);
    const [experience, setExperience] = useState(initialPrefs?.experience || '');
    const [salary, setSalary] = useState(initialPrefs?.salary ? formatVND(initialPrefs.salary) : '');
    const [selectedProvinceCodes, setSelectedProvinceCodes] = useState(parsedCodes);
    const [industrySearch, setIndustrySearch] = useState('');
    const [industryDropdownOpen, setIndustryDropdownOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('[data-industry-dropdown]')) setIndustryDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleIndustry = (id) => {
        setSelectedIndustryIds(prev => {
            if (prev.includes(id)) return prev.filter(i => i !== id);
            if (prev.length >= 5) return prev;
            return [...prev, id];
        });
    };

    const toggleProvince = (code) => {
        setSelectedProvinceCodes(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
        );
    };

    const handleSalaryChange = (e) => {
        const digits = e.target.value.replace(/[^\d]/g, '');
        setSalary(digits ? formatVND(Number(digits)) : '');
    };

    async function handleSubmit() {
        setSaving(true);
        try {
            const salaryNum = parseVND(salary);
            const jobPreferences = {
                gender,
                industryIds: selectedIndustryIds,
                experience,
                salary: salaryNum || null,
                provinceCodes: selectedProvinceCodes,
                provinceCode: selectedProvinceCodes[0] || null,
            };
            await userService.updateJobPreferences(jobPreferences);
            if (user) {
                setUser({ ...user, candidateProfile: { ...user.candidateProfile, jobPreferences } });
            }
            toast.success('Đã cập nhật thành công!');
        } catch {
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
        }
        finally { setSaving(false); }
    }

    const filteredIndustries = industries.filter(i =>
        i.name.toLowerCase().includes(industrySearch.toLowerCase())
    );
    const provinceNameOf = (code) => provinces.find(p => p.code === code)?.name || code;
    const industryNameOf = (id) => industries.find(i => i.id === id)?.name || String(id);

    return (
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 16px 60px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '24px' }}>
                    Cài đặt gợi ý việc làm
                </h1>

                <Section title="Giới tính">
                    <div style={{ display: 'flex', gap: '20px' }}>
                        {[{ label: 'Nữ', val: 'FEMALE' }, { label: 'Nam', val: 'MALE' }, { label: 'Không xác định', val: 'OTHER' }].map(opt => (
                            <label key={opt.val} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', color: '#374151' }}>
                                <input type="radio" name="gender" value={opt.val} checked={gender === opt.val} onChange={() => setGender(opt.val)} style={{ accentColor: GREEN, width: '15px', height: '15px' }} />
                                {opt.label}
                            </label>
                        ))}
                    </div>
                </Section>

                <Section title="Ngành nghề / Vị trí chuyên môn (chọn tối đa 5)">
                    {selectedIndustryIds.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                            {selectedIndustryIds.map(id => (
                                <span key={id} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#f0fdf4', border: `1px solid ${GREEN}`, borderRadius: '16px', fontSize: '13px', color: GREEN, fontWeight: '500' }}>
                                    {industryNameOf(id)}
                                    <button onClick={() => toggleIndustry(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: GREEN }}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div data-industry-dropdown="" style={{ position: 'relative' }}>
                        <div onClick={() => setIndustryDropdownOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', border: `1px solid ${industryDropdownOpen ? GREEN : '#d1d5db'}`, borderRadius: '8px', cursor: 'pointer', background: 'white', userSelect: 'none', fontSize: '14px', color: selectedIndustryIds.length ? '#111827' : '#9ca3af' }}>
                            <span>{selectedIndustryIds.length === 5 ? 'Đã chọn tối đa 5 ngành' : 'Chọn ngành nghề từ danh mục'}</span>
                            <ChevronDown size={16} color="#9ca3af" style={{ transform: industryDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                        </div>
                        {industryDropdownOpen && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 50, maxHeight: '220px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={13} style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                        <input autoFocus value={industrySearch} onChange={e => setIndustrySearch(e.target.value)} placeholder="Tìm ngành nghề..." style={{ width: '100%', padding: '6px 9px 6px 28px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                                    </div>
                                </div>
                                <div style={{ overflowY: 'auto', flex: 1 }}>
                                    {filteredIndustries.map(ind => {
                                        const sel = selectedIndustryIds.includes(ind.id);
                                        const disabled = !sel && selectedIndustryIds.length >= 5;
                                        return (
                                            <div key={ind.id} onClick={() => !disabled && toggleIndustry(ind.id)} style={{ padding: '9px 12px', cursor: disabled ? 'not-allowed' : 'pointer', background: sel ? '#f0fdf4' : 'white', color: sel ? GREEN : disabled ? '#9ca3af' : '#374151', fontWeight: sel ? '600' : '400', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                {ind.name}
                                                {sel && <CheckCircle2 size={14} color={GREEN} />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </Section>

                <Section title="Kinh nghiệm" required>
                    <select value={experience} onChange={e => setExperience(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', color: experience ? '#111827' : '#9ca3af', background: 'white', cursor: 'pointer' }}>
                        {EXPERIENCE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </Section>

                <Section title="Mức lương mong muốn">
                    <div style={{ position: 'relative' }}>
                        <input type="text" inputMode="numeric" value={salary} onChange={handleSalaryChange} placeholder="0" style={{ width: '100%', padding: '10px 56px 10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                        <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '13px', color: '#9ca3af', fontWeight: '500', pointerEvents: 'none' }}>VND</span>
                    </div>
                    {salary && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>{salary} đồng/tháng</p>}
                </Section>

                <Section title="Địa điểm làm việc" required>
                    {selectedProvinceCodes.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                            {selectedProvinceCodes.map(code => (
                                <span key={code} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', background: '#f0fdf4', border: `1px solid ${GREEN}`, borderRadius: '16px', fontSize: '13px', color: GREEN, fontWeight: '500' }}>
                                    {provinceNameOf(code)}
                                    <button onClick={() => toggleProvince(code)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0, color: GREEN }}>
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '180px', overflowY: 'auto', border: '1px solid #f3f4f6', borderRadius: '8px', padding: '10px' }}>
                        {provinces.map(prov => {
                            const sel = selectedProvinceCodes.includes(prov.code);
                            return (
                                <button key={prov.code} onClick={() => toggleProvince(prov.code)} style={{ padding: '5px 12px', borderRadius: '16px', border: sel ? `1.5px solid ${GREEN}` : '1.5px solid #e5e7eb', background: sel ? '#f0fdf4' : 'white', color: sel ? GREEN : '#374151', fontWeight: sel ? '600' : '400', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                                    {prov.name}
                                </button>
                            );
                        })}
                    </div>
                </Section>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button onClick={handleSubmit} disabled={saving} style={{ padding: '11px 36px', background: saving ? '#9ca3af' : GREEN, color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}>
                        {saving ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                </div>
            </div>

            <div style={{ width: '300px', flexShrink: 0 }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '10px' }}>Tại sao cần cập nhật?</h3>
                    <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            'Nhà tuyển dụng có thể tìm thấy và mang đến cho bạn những cơ hội việc làm tốt nhất.',
                            'Được chủ động nhận các cơ hội việc làm phù hợp.',
                            'Hồ sơ của bạn sẽ hiển thị nổi bật trên kết quả tìm kiếm của Nhà tuyển dụng.',
                        ].map((text, i) => (
                            <li key={i} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{text}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={() => router.push('/viec-lam/phu-hop')} style={{ display: 'block', width: '100%', marginTop: '12px', padding: '10px', background: 'white', border: `1px solid ${GREEN}`, borderRadius: '8px', color: GREEN, fontWeight: '600', fontSize: '13px', cursor: 'pointer', textAlign: 'center' }}>
                    Xem việc làm phù hợp
                </button>
            </div>
        </div>
    );
}

export default function CaiDatGoiYViecLamPage() {
    const { isAuthenticated, hydrated, user } = useAuthStore();
    const router = useRouter();
    const [industries, setIndustries] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    useEffect(() => {
        Promise.all([
            api.get('/industries?limit=100'),
            provinceService.getAll(),
        ]).then(([indRes, provData]) => {
            setIndustries(Array.isArray(indRes.data) ? indRes.data : (indRes.data?.data || []));
            setProvinces(Array.isArray(provData) ? provData : []);
        }).catch(() => {}).finally(() => setDataLoading(false));
    }, []);

    if (!hydrated || !isAuthenticated || dataLoading) {
        return <div style={{ padding: '60px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>Đang tải...</div>;
    }

    return (
        <FormContent
            key={user?.id}
            initialPrefs={user?.candidateProfile?.jobPreferences}
            industries={industries}
            provinces={provinces}
        />
    );
}
