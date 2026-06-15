'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Pencil,
    Trash2,
    Bell,
    BellOff,
    ExternalLink,
    Briefcase,
    ChevronDown,
    X,
    Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { jobAlertsService } from '@/services/job-alerts.service';
import { provinceService } from '@/services/province.service';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import toppyEmpty from '@/app/assests/img/empty_mail.svg';
import ProfileSidebar from '@/app/components/profile/ProfileSidebar';

const GREEN = '#00b14f';

const WORKING_TYPES = [
    { value: '', label: 'Tất cả hình thức' },
    { value: 'TOAN_THOI_GIAN', label: 'Toàn thời gian' },
    { value: 'BAN_THOI_GIAN', label: 'Bán thời gian' },
    { value: 'FREELANCE', label: 'Freelance' },
    { value: 'THUC_TAP', label: 'Thực tập' },
    { value: 'REMOTE', label: 'Remote' },
];

const EXPERIENCE_OPTIONS = [
    { value: '', label: 'Tất cả kinh nghiệm' },
    { value: 'chua-co', label: 'Chưa có kinh nghiệm' },
    { value: '1-nam-tro-xuong', label: '1 năm trở xuống' },
    { value: '1-nam', label: '1 năm' },
    { value: '2-nam', label: '2 năm' },
    { value: '3-nam', label: '3 năm' },
    { value: '4-5-nam', label: 'Từ 4-5 năm' },
    { value: 'tren-5-nam', label: 'Trên 5 năm' },
];

const FREQUENCY_OPTIONS = [
    { value: 'DAILY', label: 'Hàng ngày (9h sáng)' },
    { value: 'WEEKLY', label: 'Hàng tuần (9h thứ Hai)' },
];

const CHANNEL_OPTIONS = [
    { value: 'APP', label: 'Ứng dụng' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'BOTH', label: 'Cả hai' },
];

function formatSalary(val) {
    if (!val) return '';
    return Number(val).toLocaleString('vi-VN');
}

function buildViewUrl(alert) {
    const p = new URLSearchParams();
    if (alert.keyword) p.set('search', alert.keyword);
    if (alert.provinceCode) p.set('provinceCode', alert.provinceCode);
    if (alert.districtCode) p.set('districtCode', alert.districtCode);
    if (alert.industryId) p.set('industryId', String(alert.industryId));
    if (alert.jobPositionId) p.set('jobPositionId', String(alert.jobPositionId));
    if (alert.workingType) p.set('workingType', alert.workingType);
    if (alert.experience) p.set('experience', alert.experience);
    if (alert.salaryMin) p.set('salaryMin', String(alert.salaryMin));
    if (alert.salaryMax) p.set('salaryMax', String(alert.salaryMax));
    return `/viec-lam?${p.toString()}`;
}

function describeAlert(alert, industries, jobPositions, provinces) {
    const parts = [];
    if (alert.keyword) parts.push(`"${alert.keyword}"`);
    if (alert.provinceName) parts.push(alert.provinceName);
    else if (alert.provinceCode) {
        const prov = provinces.find((p) => p.code === alert.provinceCode);
        if (prov) parts.push(prov.name);
    }
    if (alert.industryId) {
        const ind = industries.find((i) => i.id === alert.industryId);
        if (ind) parts.push(ind.name);
    }
    if (alert.jobPositionId) {
        const jp = jobPositions.find((j) => j.id === alert.jobPositionId);
        if (jp) parts.push(jp.name);
    }
    if (alert.salaryMin || alert.salaryMax) {
        const min = alert.salaryMin ? formatSalary(alert.salaryMin) : '0';
        const max = alert.salaryMax ? formatSalary(alert.salaryMax) : '';
        parts.push(max ? `${min} - ${max} VND` : `Từ ${min} VND`);
    }
    return parts.join(' · ') || 'Tất cả việc làm';
}

const DEFAULT_FORM = {
    keyword: '',
    provinceCode: '',
    districtCode: '',
    provinceName: '',
    districtName: '',
    salaryMin: '',
    salaryMax: '',
    experience: '',
    industryId: '',
    jobPositionId: '',
    workingType: '',
    frequency: 'DAILY',
    channel: 'BOTH',
};

function formFromAlert(a) {
    if (!a) return DEFAULT_FORM;
    return {
        keyword: a.keyword || '',
        provinceCode: a.provinceCode || '',
        districtCode: a.districtCode || '',
        provinceName: a.provinceName || '',
        districtName: a.districtName || '',
        salaryMin: a.salaryMin ? String(a.salaryMin) : '',
        salaryMax: a.salaryMax ? String(a.salaryMax) : '',
        experience: a.experience || '',
        industryId: a.industryId ? String(a.industryId) : '',
        jobPositionId: a.jobPositionId ? String(a.jobPositionId) : '',
        workingType: a.workingType || '',
        frequency: a.frequency || 'DAILY',
        channel: a.channel || 'BOTH',
    };
}

function AlertModal({ open, onClose, editingAlert, industries, jobPositions, provinces, onSaved }) {
    const [form, setForm] = useState(() => formFromAlert(editingAlert));
    const [saving, setSaving] = useState(false);
    const [indOpen, setIndOpen] = useState(false);
    const [jpOpen, setJpOpen] = useState(false);
    const [indSearch, setIndSearch] = useState('');
    const [jpSearch, setJpSearch] = useState('');
    const [districts, setDistricts] = useState([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            if (!form.provinceCode) { setDistricts([]); return; }
            setLoadingDistricts(true);
            try {
                const data = await provinceService.getDistricts(form.provinceCode);
                if (!cancelled) setDistricts(data?.districts || []);
            } catch {
                if (!cancelled) setDistricts([]);
            } finally {
                if (!cancelled) setLoadingDistricts(false);
            }
        }
        load();
        return () => { cancelled = true; };
    }, [form.provinceCode]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (!e.target.closest('[data-ind-dd]')) setIndOpen(false);
            if (!e.target.closest('[data-jp-dd]')) setJpOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const handleProvinceChange = (e) => {
        const code = e.target.value;
        const prov = provinces.find((p) => String(p.code) === code);
        setForm((prev) => ({
            ...prev,
            provinceCode: code,
            provinceName: prov?.name || '',
            districtCode: '',
            districtName: '',
        }));
    };

    const handleDistrictChange = (e) => {
        const code = e.target.value;
        const dist = districts.find((d) => String(d.code) === code);
        setForm((prev) => ({
            ...prev,
            districtCode: code,
            districtName: dist?.name || '',
        }));
    };

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.keyword.trim()) {
            toast.error('Vui lòng nhập từ khóa');
            return;
        }
        setSaving(true);
        try {
            const payload = {
                ...form,
                keyword: form.keyword.trim(),
                salaryMin: form.salaryMin ? Number(form.salaryMin) : null,
                salaryMax: form.salaryMax ? Number(form.salaryMax) : null,
                industryId: form.industryId ? Number(form.industryId) : null,
                jobPositionId: form.jobPositionId ? Number(form.jobPositionId) : null,
                provinceCode: form.provinceCode || null,
                districtCode: form.districtCode || null,
                provinceName: form.provinceName || null,
                districtName: form.districtName || null,
                workingType: form.workingType || null,
                experience: form.experience || null,
            };
            if (editingAlert) {
                await jobAlertsService.update(editingAlert.id, payload);
                toast.success('Đã cập nhật thông báo việc làm');
            } else {
                await jobAlertsService.create(payload);
                toast.success('Đã tạo thông báo việc làm');
            }
            onSaved();
            onClose();
        } catch {
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    }

    if (!open) return null;

    const selectedInd = industries.find((i) => String(i.id) === form.industryId);
    const selectedJp = jobPositions.find((j) => String(j.id) === form.jobPositionId);
    const filteredInd = industries.filter((i) => i.name.toLowerCase().includes(indSearch.toLowerCase()));
    const filteredJp = jobPositions.filter((j) => j.name.toLowerCase().includes(jpSearch.toLowerCase()));

    const inputStyle = {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    };
    const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' };
    const rowStyle = { marginBottom: '16px' };
    const dropTrigger = (label, open) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '9px 12px',
        border: `1px solid ${open ? GREEN : '#d1d5db'}`,
        borderRadius: '8px',
        cursor: 'pointer',
        background: 'white',
        fontSize: '14px',
        color: label ? '#111827' : '#9ca3af',
        userSelect: 'none',
    });

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.45)',
            }}
            onClick={onClose}
        >
            <div
                style={{
                    background: 'white',
                    borderRadius: '12px',
                    width: '100%',
                    maxWidth: '560px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px 16px',
                        borderBottom: '1px solid #f3f4f6',
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                        {editingAlert ? 'Chỉnh sửa thông báo' : 'Tạo thông báo việc làm'}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#6b7280',
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
                    <div style={rowStyle}>
                        <label style={labelStyle}>
                            Từ khóa <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            style={inputStyle}
                            value={form.keyword}
                            onChange={(e) => set('keyword', e.target.value)}
                            placeholder="Ví dụ: Nhân viên kinh doanh, Lập trình viên..."
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={labelStyle}>Ngành nghề</label>
                            <div data-ind-dd="" style={{ position: 'relative' }}>
                                <div
                                    style={dropTrigger(selectedInd?.name, indOpen)}
                                    onClick={() => setIndOpen((o) => !o)}
                                >
                                    <span>{selectedInd?.name || 'Chọn ngành nghề'}</span>
                                    <ChevronDown
                                        size={15}
                                        color="#9ca3af"
                                        style={{
                                            transform: indOpen ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.15s',
                                            flexShrink: 0,
                                        }}
                                    />
                                </div>
                                {indOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 4px)',
                                            left: 0,
                                            right: 0,
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                                            zIndex: 60,
                                            maxHeight: '200px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <div style={{ padding: '6px', borderBottom: '1px solid #f3f4f6' }}>
                                            <div style={{ position: 'relative' }}>
                                                <Search
                                                    size={12}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '8px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: '#9ca3af',
                                                    }}
                                                />
                                                <input
                                                    autoFocus
                                                    value={indSearch}
                                                    onChange={(e) => setIndSearch(e.target.value)}
                                                    placeholder="Tìm..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '5px 8px 5px 26px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        outline: 'none',
                                                        boxSizing: 'border-box',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ overflowY: 'auto', flex: 1 }}>
                                            <div
                                                onClick={() => {
                                                    set('industryId', '');
                                                    setIndOpen(false);
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: !form.industryId ? GREEN : '#374151',
                                                    fontWeight: !form.industryId ? '600' : '400',
                                                    background: !form.industryId ? '#f0fdf4' : 'white',
                                                }}
                                            >
                                                Tất cả ngành
                                            </div>
                                            {filteredInd.map((ind) => (
                                                <div
                                                    key={ind.id}
                                                    onClick={() => {
                                                        set('industryId', String(ind.id));
                                                        setIndOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        color: String(ind.id) === form.industryId ? GREEN : '#374151',
                                                        fontWeight: String(ind.id) === form.industryId ? '600' : '400',
                                                        background:
                                                            String(ind.id) === form.industryId ? '#f0fdf4' : 'white',
                                                    }}
                                                >
                                                    {ind.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label style={labelStyle}>Vị trí</label>
                            <div data-jp-dd="" style={{ position: 'relative' }}>
                                <div style={dropTrigger(selectedJp?.name, jpOpen)} onClick={() => setJpOpen((o) => !o)}>
                                    <span>{selectedJp?.name || 'Chọn vị trí'}</span>
                                    <ChevronDown
                                        size={15}
                                        color="#9ca3af"
                                        style={{
                                            transform: jpOpen ? 'rotate(180deg)' : 'none',
                                            transition: 'transform 0.15s',
                                            flexShrink: 0,
                                        }}
                                    />
                                </div>
                                {jpOpen && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 'calc(100% + 4px)',
                                            left: 0,
                                            right: 0,
                                            background: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                                            zIndex: 60,
                                            maxHeight: '200px',
                                            overflow: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                        }}
                                    >
                                        <div style={{ padding: '6px', borderBottom: '1px solid #f3f4f6' }}>
                                            <div style={{ position: 'relative' }}>
                                                <Search
                                                    size={12}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '8px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: '#9ca3af',
                                                    }}
                                                />
                                                <input
                                                    autoFocus
                                                    value={jpSearch}
                                                    onChange={(e) => setJpSearch(e.target.value)}
                                                    placeholder="Tìm..."
                                                    style={{
                                                        width: '100%',
                                                        padding: '5px 8px 5px 26px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        outline: 'none',
                                                        boxSizing: 'border-box',
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div style={{ overflowY: 'auto', flex: 1 }}>
                                            <div
                                                onClick={() => {
                                                    set('jobPositionId', '');
                                                    setJpOpen(false);
                                                }}
                                                style={{
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    color: !form.jobPositionId ? GREEN : '#374151',
                                                    fontWeight: !form.jobPositionId ? '600' : '400',
                                                    background: !form.jobPositionId ? '#f0fdf4' : 'white',
                                                }}
                                            >
                                                Tất cả vị trí
                                            </div>
                                            {filteredJp.map((jp) => (
                                                <div
                                                    key={jp.id}
                                                    onClick={() => {
                                                        set('jobPositionId', String(jp.id));
                                                        setJpOpen(false);
                                                    }}
                                                    style={{
                                                        padding: '8px 12px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        color: String(jp.id) === form.jobPositionId ? GREEN : '#374151',
                                                        fontWeight:
                                                            String(jp.id) === form.jobPositionId ? '600' : '400',
                                                        background:
                                                            String(jp.id) === form.jobPositionId ? '#f0fdf4' : 'white',
                                                    }}
                                                >
                                                    {jp.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={labelStyle}>Tỉnh/Thành phố</label>
                            <select
                                style={{ ...inputStyle, color: form.provinceCode ? '#111827' : '#9ca3af' }}
                                value={form.provinceCode}
                                onChange={handleProvinceChange}
                            >
                                <option value="">Tất cả tỉnh/thành</option>
                                {provinces.map((p) => (
                                    <option key={p.code} value={p.code}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Quận/Huyện</label>
                            <select
                                style={{ ...inputStyle, color: form.districtCode ? '#111827' : '#9ca3af' }}
                                value={form.districtCode}
                                onChange={handleDistrictChange}
                                disabled={!form.provinceCode || loadingDistricts}
                            >
                                <option value="">{loadingDistricts ? 'Đang tải...' : 'Tất cả quận/huyện'}</option>
                                {districts.map((d) => (
                                    <option key={d.code} value={d.code}>{d.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={labelStyle}>Lương tối thiểu</label>
                            <input
                                type="number"
                                style={inputStyle}
                                value={form.salaryMin}
                                onChange={(e) => set('salaryMin', e.target.value)}
                                placeholder="VD: 5000000"
                                min="0"
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Lương tối đa</label>
                            <input
                                type="number"
                                style={inputStyle}
                                value={form.salaryMax}
                                onChange={(e) => set('salaryMax', e.target.value)}
                                placeholder="VD: 20000000"
                                min="0"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div>
                            <label style={labelStyle}>Kinh nghiệm</label>
                            <select
                                style={{ ...inputStyle, color: form.experience ? '#111827' : '#9ca3af' }}
                                value={form.experience}
                                onChange={(e) => set('experience', e.target.value)}
                            >
                                {EXPERIENCE_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Hình thức làm việc</label>
                            <select
                                style={{ ...inputStyle, color: form.workingType ? '#111827' : '#9ca3af' }}
                                value={form.workingType}
                                onChange={(e) => set('workingType', e.target.value)}
                            >
                                {WORKING_TYPES.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <label style={labelStyle}>Tần suất gửi thông báo</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {FREQUENCY_OPTIONS.map((o) => (
                                <label
                                    key={o.value}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value={o.value}
                                        checked={form.frequency === o.value}
                                        onChange={() => set('frequency', o.value)}
                                        style={{ accentColor: GREEN }}
                                    />
                                    {o.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={rowStyle}>
                        <label style={labelStyle}>Kênh nhận thông báo</label>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            {CHANNEL_OPTIONS.map((o) => (
                                <label
                                    key={o.value}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#374151',
                                    }}
                                >
                                    <input
                                        type="radio"
                                        name="channel"
                                        value={o.value}
                                        checked={form.channel === o.value}
                                        onChange={() => set('channel', o.value)}
                                        style={{ accentColor: GREEN }}
                                    />
                                    {o.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '9px 20px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                background: 'white',
                                color: '#374151',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: 'pointer',
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: '9px 24px',
                                background: saving ? '#9ca3af' : GREEN,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: saving ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {saving ? 'Đang lưu...' : editingAlert ? 'Cập nhật' : 'Tạo thông báo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ConfirmDialog({ open, title, message, confirmLabel = 'Xóa', onConfirm, onCancel }) {
    if (!open) return null;
    return (
        <div
            style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}
            onClick={onCancel}
        >
            <div
                style={{ background: 'white', borderRadius: '12px', padding: '28px 28px 24px', width: '100%', maxWidth: '380px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Trash2 size={18} color="#ef4444" />
                    </div>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#111827' }}>{title}</p>
                </div>
                {message && <p style={{ margin: '0 0 20px 48px', fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{message}</p>}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: message ? 0 : '20px' }}>
                    <button
                        onClick={onCancel}
                        style={{ padding: '8px 18px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{ padding: '8px 18px', border: 'none', borderRadius: '8px', background: '#ef4444', color: 'white', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

function AlertCard({ alert, industries, jobPositions, provinces, onEdit, onToggle, onDelete }) {
    const [toggling, setToggling] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const label = describeAlert(alert, industries, jobPositions, provinces);
    const freqLabel = FREQUENCY_OPTIONS.find((f) => f.value === alert.frequency)?.label || alert.frequency;
    const channelLabel = CHANNEL_OPTIONS.find((c) => c.value === alert.channel)?.label || alert.channel;

    async function handleToggle() {
        setToggling(true);
        try {
            await onToggle(alert.id);
        } finally {
            setToggling(false);
        }
    }

    async function handleDelete() {
        setConfirmOpen(false);
        setDeleting(true);
        try {
            await onDelete(alert.id);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div
            style={{
                background: 'white',
                border: `1px solid ${alert.isActive ? '#e5e7eb' : '#f3f4f6'}`,
                borderRadius: '10px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                opacity: alert.isActive ? 1 : 0.6,
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <Bell size={16} color={alert.isActive ? GREEN : '#9ca3af'} />
                    <span
                        style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#111827',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {label}
                    </span>
                    {!alert.isActive && (
                        <span
                            style={{
                                fontSize: '11px',
                                background: '#f3f4f6',
                                color: '#9ca3af',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                flexShrink: 0,
                            }}
                        >
                            Đã tắt
                        </span>
                    )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Bell size={11} /> {freqLabel}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Briefcase size={11} /> {channelLabel}
                    </span>
                    {alert.lastSentAt && (
                        <span>Gửi lần cuối: {new Date(alert.lastSentAt).toLocaleDateString('vi-VN')}</span>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <a
                    href={buildViewUrl(alert)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Xem danh sách việc làm"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        color: '#6b7280',
                        textDecoration: 'none',
                    }}
                >
                    <ExternalLink size={14} />
                </a>
                <button
                    onClick={() => onEdit(alert)}
                    title="Chỉnh sửa"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        color: '#6b7280',
                        cursor: 'pointer',
                    }}
                >
                    <Pencil size={14} />
                </button>
                <button
                    onClick={handleToggle}
                    disabled={toggling}
                    title={alert.isActive ? 'Tắt thông báo' : 'Bật thông báo'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        border: `1px solid ${alert.isActive ? '#fca5a5' : '#86efac'}`,
                        background: alert.isActive ? '#fef2f2' : '#f0fdf4',
                        color: alert.isActive ? '#ef4444' : GREEN,
                        cursor: toggling ? 'not-allowed' : 'pointer',
                    }}
                >
                    {alert.isActive ? <BellOff size={14} /> : <Bell size={14} />}
                </button>
                <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={deleting}
                    title="Xóa"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '7px',
                        border: '1px solid #fca5a5',
                        background: '#fef2f2',
                        color: '#ef4444',
                        cursor: deleting ? 'not-allowed' : 'pointer',
                    }}
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Xóa thông báo việc làm?"
                message="Thông báo này sẽ bị xóa vĩnh viễn và không thể khôi phục."
                confirmLabel="Xóa"
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
            />
        </div>
    );
}

export default function CaiDatThongBaoViecLamPage() {
    const { isAuthenticated, hydrated } = useAuthStore();
    const router = useRouter();

    const [alerts, setAlerts] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [jobPositions, setJobPositions] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingAlert, setEditingAlert] = useState(null);

    useEffect(() => {
        if (hydrated && !isAuthenticated) router.replace('/login');
    }, [hydrated, isAuthenticated, router]);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await jobAlertsService.getAll();
            setAlerts(res.data?.data || res.data || []);
        } catch {
            toast.error('Không thể tải danh sách thông báo');
        }
    }, []);

    useEffect(() => {
        if (!hydrated || !isAuthenticated) return;
        Promise.all([
            api.get('/industries?limit=100'),
            api.get('/job-positions?limit=100'),
            provinceService.getAll(),
            jobAlertsService.getAll(),
        ])
            .then(([indRes, jpRes, provData, alertRes]) => {
                setIndustries(Array.isArray(indRes.data) ? indRes.data : indRes.data?.data || []);
                setJobPositions(Array.isArray(jpRes.data) ? jpRes.data : jpRes.data?.data || []);
                setProvinces(Array.isArray(provData) ? provData : []);
                setAlerts(alertRes.data?.data || alertRes.data || []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [hydrated, isAuthenticated]);

    function openCreate() {
        setEditingAlert(null);
        setModalOpen(true);
    }
    function openEdit(alert) {
        setEditingAlert(alert);
        setModalOpen(true);
    }

    async function handleToggle(id) {
        try {
            await jobAlertsService.toggle(id);
            setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    }

    async function handleDelete(id) {
        try {
            await jobAlertsService.remove(id);
            setAlerts((prev) => prev.filter((a) => a.id !== id));
            toast.success('Đã xóa thông báo');
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    }

    if (!hydrated || !isAuthenticated) return null;

    return (
        <div style={{ minHeight: '80vh', padding: '24px 0', background: '#f9fafb' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
            <div>
            <div style={{ background: 'white', borderRadius: '10px', padding: '20px 24px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#111827' }}>
                        Thông báo việc làm
                    </h1>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6b7280' }}>
                        Nhận thông báo khi có việc làm phù hợp với tiêu chí của bạn
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        background: GREEN,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                    }}
                >
                    <Plus size={16} /> Tạo thông báo
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 16px', color: '#9ca3af', fontSize: '14px' }}>
                    Đang tải...
                </div>
            ) : alerts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 16px' }}>
                    <img
                        src={toppyEmpty.src}
                        alt=""
                        style={{
                            width: '140px',
                            height: '140px',
                            objectFit: 'contain',
                            display: 'block',
                            margin: '0 auto 16px',
                        }}
                    />
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 6px' }}>
                        Chưa có thông báo việc làm
                    </p>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' }}>
                        Tạo thông báo để nhận việc làm phù hợp mỗi ngày
                    </p>
                    <button
                        onClick={openCreate}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '9px 20px',
                            background: GREEN,
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                        }}
                    >
                        <Plus size={15} /> Tạo thông báo đầu tiên
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {alerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            industries={industries}
                            jobPositions={jobPositions}
                            provinces={provinces}
                            onEdit={openEdit}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}

            <AlertModal
                key={`${editingAlert?.id ?? 'new'}-${modalOpen}`}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                editingAlert={editingAlert}
                industries={industries}
                jobPositions={jobPositions}
                provinces={provinces}
                onSaved={fetchAlerts}
            />
            </div>
            <ProfileSidebar />
            </div>
        </div>
    );
}
