'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Building2, MapPin, Globe, Users, ChevronDown, Check } from 'lucide-react';
import api from '@/lib/axios';
import logo from '../../assests/img/logo.png';

export default function EmployerCompleteProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();

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

    useEffect(() => {
        if (!form.provinceId) {
            setDistricts([]);
            return;
        }
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

    const handleProvinceChange = (e) => {
        const selected = provinces.find((p) => p.code === parseInt(e.target.value));
        setForm((prev) => ({
            ...prev,
            provinceId: e.target.value,
            provinceName: selected?.name || '',
            districtId: '',
            districtName: '',
        }));
        setDistricts([]);
    };

    const handleDistrictChange = (e) => {
        const selected = districts.find((d) => d.code === parseInt(e.target.value));
        setForm((prev) => ({ ...prev, districtId: e.target.value, districtName: selected?.name || '' }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.companyName) {
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
            setError(err.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

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

    const inputStyle = {
        width: '100%',
        paddingLeft: '40px',
        paddingRight: '16px',
        paddingTop: '11px',
        paddingBottom: '11px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '13px',
        outline: 'none',
        background: '#f9fafb',
        boxSizing: 'border-box',
        color: '#374151',
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

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #f3f4f6', padding: '16px 32px' }}>
                <Image src={logo} alt="TopCV" height={32} />
            </div>

            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    padding: '40px 16px',
                }}
            >
                <div style={{ width: '100%', maxWidth: '640px' }}>
                    {/* Progress bar */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                        {/* Step 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#00b14f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <Check size={16} color="white" strokeWidth={2.5} />
                            </div>
                            <span
                                style={{ fontSize: '13px', color: '#00b14f', fontWeight: '500', whiteSpace: 'nowrap' }}
                            >
                                Tạo tài khoản
                            </span>
                        </div>

                        <div style={{ flex: 1, height: '2px', background: '#00b14f', margin: '0 12px' }} />

                        {/* Step 2 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#00b14f',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <span style={{ color: 'white', fontSize: '13px', fontWeight: '700' }}>2</span>
                            </div>
                            <span
                                style={{ fontSize: '13px', color: '#00b14f', fontWeight: '600', whiteSpace: 'nowrap' }}
                            >
                                Thông tin công ty
                            </span>
                        </div>

                        <div style={{ flex: 1, height: '2px', background: '#e5e7eb', margin: '0 12px' }} />

                        {/* Step 3 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#e5e7eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: '700' }}>3</span>
                            </div>
                            <span style={{ fontSize: '13px', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                                Nhu cầu tuyển dụng
                            </span>
                        </div>
                    </div>

                    {/* Card */}
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            border: '1px solid #f3f4f6',
                            padding: '32px',
                        }}
                    >
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                            Thông tin công ty
                        </h1>
                        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
                            Vui lòng điền các thông tin bên dưới để chúng tôi hỗ trợ bạn tốt hơn.
                        </p>

                        {error && (
                            <div
                                style={{
                                    background: '#fef2f2',
                                    border: '1px solid #fecaca',
                                    color: '#dc2626',
                                    fontSize: '13px',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    marginBottom: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    style={{ flexShrink: 0 }}
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Tên công ty */}
                            <div>
                                <label style={labelStyle}>
                                    Tên công ty <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                        }}
                                    >
                                        <Building2 size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Nhập tên công ty"
                                        value={form.companyName}
                                        onChange={handleChange}
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            {/* Tỉnh + Quận */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={labelStyle}>
                                        Tỉnh/Thành phố <span style={{ color: '#ef4444' }}>*</span>
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                pointerEvents: 'none',
                                            }}
                                        >
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
                                            {provinces.map((p) => (
                                                <option key={p.code} value={p.code}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <ChevronDown size={15} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Phường/Xã</label>
                                    <div style={{ position: 'relative' }}>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                left: '12px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <MapPin size={16} />
                                        </span>
                                        <select
                                            value={form.districtId}
                                            onChange={handleDistrictChange}
                                            disabled={!form.provinceId || loadingDistricts}
                                            style={{
                                                ...selectStyle,
                                                opacity: !form.provinceId || loadingDistricts ? 0.5 : 1,
                                                cursor:
                                                    !form.provinceId || loadingDistricts ? 'not-allowed' : 'pointer',
                                            }}
                                        >
                                            <option value="">
                                                {loadingDistricts ? 'Đang tải...' : 'Chọn phường/xã'}
                                            </option>
                                            {districts.map((d) => (
                                                <option key={d.code} value={d.code}>
                                                    {d.name}
                                                </option>
                                            ))}
                                        </select>
                                        <span
                                            style={{
                                                position: 'absolute',
                                                right: '10px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                color: '#9ca3af',
                                                pointerEvents: 'none',
                                            }}
                                        >
                                            <ChevronDown size={15} />
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quy mô */}
                            <div>
                                <label style={labelStyle}>Quy mô công ty</label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <Users size={16} />
                                    </span>
                                    <select
                                        name="companySize"
                                        value={form.companySize}
                                        onChange={handleChange}
                                        style={selectStyle}
                                    >
                                        <option value="">Chọn quy mô</option>
                                        {companySizes.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <ChevronDown size={15} />
                                    </span>
                                </div>
                            </div>

                            {/* Lĩnh vực */}
                            <div>
                                <label style={labelStyle}>Lĩnh vực hoạt động</label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <Building2 size={16} />
                                    </span>
                                    <select
                                        name="industry"
                                        value={form.industry}
                                        onChange={handleChange}
                                        style={selectStyle}
                                    >
                                        <option value="">Chọn lĩnh vực</option>
                                        {industries.map((i) => (
                                            <option key={i} value={i}>
                                                {i}
                                            </option>
                                        ))}
                                    </select>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            pointerEvents: 'none',
                                        }}
                                    >
                                        <ChevronDown size={15} />
                                    </span>
                                </div>
                            </div>

                            {/* Website */}
                            <div>
                                <label style={labelStyle}>Website công ty</label>
                                <div style={{ position: 'relative' }}>
                                    <span
                                        style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                        }}
                                    >
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
                            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => router.push('/employer/dashboard')}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: '#6b7280',
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
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                    }}
                                >
                                    {loading ? 'Đang lưu...' : 'Lưu và Tiếp tục →'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#9ca3af', marginTop: '24px' }}>
                        ©2014-2026 TopCV Vietnam JSC. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
