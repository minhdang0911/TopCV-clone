'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Building2, MapPin, Globe, Users, ChevronDown, Check } from 'lucide-react';

import api from '@/lib/axios';
import logo from '../../assests/img/logo.png';

export default function EmployerCompleteProfilePage() {
    const router = useRouter();

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);

    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [form, setForm] = useState({
        companyName: '',
        provinceId: '',
        provinceName: '',
        districtId: '',
        districtName: '',
        companySize: '',
        industry: '',
        website: '',
    });

    // =========================
    // Fetch Provinces
    // =========================
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);

            try {
                const res = await fetch('https://provinces.open-api.vn/api/v2/p?limit=100');

                const data = await res.json();

                setProvinces(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingProvinces(false);
            }
        };

        fetchProvinces();
    }, []);

    // =========================
    // Fetch Districts
    // =========================
    useEffect(() => {
        if (!form.provinceId) return;

        const fetchDistricts = async () => {
            setLoadingDistricts(true);

            try {
                const res = await fetch(`https://provinces.open-api.vn/api/v2/p/${form.provinceId}?depth=2`);

                const data = await res.json();

                setDistricts(data.wards || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingDistricts(false);
            }
        };

        fetchDistricts();
    }, [form.provinceId]);

    // =========================
    // Handlers
    // =========================
    const handleProvinceChange = (e) => {
        const provinceId = e.target.value;

        const selectedProvince = provinces.find((p) => p.code === Number(provinceId));

        // reset districts immediately
        setDistricts([]);

        setForm((prev) => ({
            ...prev,
            provinceId,
            provinceName: selectedProvince?.name || '',
            districtId: '',
            districtName: '',
        }));
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;

        const selectedDistrict = districts.find((d) => d.code === Number(districtId));

        setForm((prev) => ({
            ...prev,
            districtId,
            districtName: selectedDistrict?.name || '',
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // Submit
    // =========================
    const handleSubmit = async () => {
        setError('');

        if (!form.companyName.trim()) {
            setError('Vui lòng nhập tên công ty');
            return;
        }

        if (!form.provinceId) {
            setError('Vui lòng chọn tỉnh/thành phố');
            return;
        }

        setLoading(true);

        try {
            const address = form.districtName ? `${form.districtName}, ${form.provinceName}` : form.provinceName;

            await api.patch('/users/employer/profile', {
                companyName: form.companyName,
                address,
                companySize: form.companySize,
                industry: form.industry,
                website: form.website,
            });

            router.push('/employer/dashboard');
        } catch (err) {
            setError(err?.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // Data
    // =========================
    const companySizes = [
        '1-9 nhân viên',
        '10-24 nhân viên',
        '25-99 nhân viên',
        '100-499 nhân viên',
        '500-999 nhân viên',
        '1000+ nhân viên',
    ];

    const industries = [
        'Công nghệ thông tin',
        'Tài chính - Ngân hàng',
        'Bất động sản',
        'Giáo dục - Đào tạo',
        'Y tế - Dược phẩm',
        'Thương mại điện tử',
        'Marketing - Truyền thông',
        'Sản xuất - Công nghiệp',
        'Xây dựng',
        'Khác',
    ];

    // =========================
    // Styles
    // =========================
    const inputStyle = {
        width: '100%',
        padding: '11px 16px 11px 40px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '13px',
        outline: 'none',
        background: '#f9fafb',
        color: '#374151',
        boxSizing: 'border-box',
    };

    const selectStyle = {
        ...inputStyle,
        paddingRight: '36px',
        appearance: 'none',
        cursor: 'pointer',
    };

    const labelStyle = {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
    };

    const iconStyle = {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none',
    };

    const chevronStyle = {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9ca3af',
        pointerEvents: 'none',
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f3f4f6',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <div
                style={{
                    background: 'white',
                    borderBottom: '1px solid #f3f4f6',
                    padding: '16px 32px',
                }}
            >
                <Image src={logo} alt="TopCV" height={32} />
            </div>

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '40px 16px',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        maxWidth: '640px',
                    }}
                >
                    {/* Progress */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '32px',
                        }}
                    >
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#00b14f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Check size={16} color="white" strokeWidth={2.5} />
                        </div>

                        <div
                            style={{
                                flex: 1,
                                height: '2px',
                                background: '#00b14f',
                                margin: '0 12px',
                            }}
                        />

                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#00b14f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: '700',
                            }}
                        >
                            2
                        </div>
                    </div>

                    {/* Card */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            border: '1px solid #f3f4f6',
                            padding: '32px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                        }}
                    >
                        <h1
                            style={{
                                fontSize: '20px',
                                fontWeight: '700',
                                marginBottom: '4px',
                            }}
                        >
                            Thông tin công ty
                        </h1>

                        <p
                            style={{
                                fontSize: '13px',
                                color: '#6b7280',
                                marginBottom: '24px',
                            }}
                        >
                            Vui lòng điền các thông tin bên dưới.
                        </p>

                        {error && (
                            <div
                                style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    fontSize: '13px',
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                            }}
                        >
                            {/* Company */}
                            <div>
                                <label style={labelStyle}>Tên công ty *</label>

                                <div style={{ position: 'relative' }}>
                                    <span style={iconStyle}>
                                        <Building2 size={16} />
                                    </span>

                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Nhập tên công ty"
                                        value={form.companyName}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Province */}
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '16px',
                                }}
                            >
                                <div>
                                    <label style={labelStyle}>Tỉnh/Thành phố *</label>

                                    <div style={{ position: 'relative' }}>
                                        <span style={iconStyle}>
                                            <MapPin size={16} />
                                        </span>

                                        <select
                                            value={form.provinceId}
                                            onChange={handleProvinceChange}
                                            style={selectStyle}
                                        >
                                            <option value="">
                                                {loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                                            </option>

                                            {provinces.map((province) => (
                                                <option key={province.code} value={province.code}>
                                                    {province.name}
                                                </option>
                                            ))}
                                        </select>

                                        <span style={chevronStyle}>
                                            <ChevronDown size={15} />
                                        </span>
                                    </div>
                                </div>

                                {/* District */}
                                <div>
                                    <label style={labelStyle}>Phường/Xã</label>

                                    <div style={{ position: 'relative' }}>
                                        <span style={iconStyle}>
                                            <MapPin size={16} />
                                        </span>

                                        <select
                                            value={form.districtId}
                                            onChange={handleDistrictChange}
                                            disabled={!form.provinceId || loadingDistricts}
                                            style={{
                                                ...selectStyle,
                                                opacity: !form.provinceId || loadingDistricts ? 0.5 : 1,
                                            }}
                                        >
                                            <option value="">
                                                {loadingDistricts ? 'Đang tải...' : 'Chọn phường/xã'}
                                            </option>

                                            {districts.map((district) => (
                                                <option key={district.code} value={district.code}>
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>

                                        <span style={chevronStyle}>
                                            <ChevronDown size={15} />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Company Size */}
                            <div>
                                <label style={labelStyle}>Quy mô công ty</label>

                                <div style={{ position: 'relative' }}>
                                    <span style={iconStyle}>
                                        <Users size={16} />
                                    </span>

                                    <select
                                        name="companySize"
                                        value={form.companySize}
                                        onChange={handleChange}
                                        style={selectStyle}
                                    >
                                        <option value="">Chọn quy mô</option>

                                        {companySizes.map((size) => (
                                            <option key={size} value={size}>
                                                {size}
                                            </option>
                                        ))}
                                    </select>

                                    <span style={chevronStyle}>
                                        <ChevronDown size={15} />
                                    </span>
                                </div>
                            </div>

                            {/* Industry */}
                            <div>
                                <label style={labelStyle}>Lĩnh vực hoạt động</label>

                                <div style={{ position: 'relative' }}>
                                    <span style={iconStyle}>
                                        <Building2 size={16} />
                                    </span>

                                    <select
                                        name="industry"
                                        value={form.industry}
                                        onChange={handleChange}
                                        style={selectStyle}
                                    >
                                        <option value="">Chọn lĩnh vực</option>

                                        {industries.map((industry) => (
                                            <option key={industry} value={industry}>
                                                {industry}
                                            </option>
                                        ))}
                                    </select>

                                    <span style={chevronStyle}>
                                        <ChevronDown size={15} />
                                    </span>
                                </div>
                            </div>

                            {/* Website */}
                            <div>
                                <label style={labelStyle}>Website công ty</label>

                                <div style={{ position: 'relative' }}>
                                    <span style={iconStyle}>
                                        <Globe size={16} />
                                    </span>

                                    <input
                                        type="url"
                                        name="website"
                                        placeholder="https://company.com"
                                        value={form.website}
                                        onChange={handleChange}
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    paddingTop: '8px',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => router.push('/employer/dashboard')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Bỏ qua
                                </button>

                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: loading ? '#86efac' : '#00b14f',
                                        color: 'white',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading ? 'Đang lưu...' : 'Lưu và Tiếp tục →'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: '11px',
                            color: '#9ca3af',
                            marginTop: '24px',
                        }}
                    >
                        ©2014-2026 TopCV Vietnam JSC. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
