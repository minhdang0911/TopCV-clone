'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Check, ChevronDown, X, Loader } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const GREEN = '#00b14f';

function IndustryPicker({ industries, selected, onChange }) {
    const [open, setOpen] = useState(false);
    const toggle = (id) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const selectedLabels = industries.filter(i => selected.includes(i.id)).map(i => i.name);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 bg-slate-50 cursor-pointer outline-none text-left gap-2 hover:border-slate-300 transition-colors"
            >
                <span className={cn('flex-1 truncate', selected.length === 0 && 'text-slate-400')}>
                    {selected.length === 0 ? '-- Chọn ngành nghề --' : selectedLabels.join(', ')}
                </span>
                <ChevronDown size={14} className={cn('text-slate-400 shrink-0 transition-transform', open && 'rotate-180')} />
            </button>
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {industries.filter(i => selected.includes(i.id)).map(i => (
                        <span key={i.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 border border-green-500 rounded-full text-xs text-green-600 font-medium">
                            {i.name}
                            <button type="button" onClick={() => toggle(i.id)} className="border-none bg-transparent cursor-pointer text-green-600 flex p-0 leading-none">
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
            {open && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[220px] overflow-y-auto mt-1">
                    {industries.map(i => (
                        <button
                            key={i.id} type="button" onClick={() => toggle(i.id)}
                            className={cn('w-full text-left px-4 py-2.5 border-none cursor-pointer text-sm text-slate-700 flex items-center justify-between hover:bg-slate-50', selected.includes(i.id) && 'bg-green-50')}
                        >
                            {i.name}
                            {selected.includes(i.id) && <Check size={14} color={GREEN} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Field({ label, children, hint }) {
    return (
        <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
            {children}
            {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
        </div>
    );
}

const fieldCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none bg-slate-50 box-border focus:border-green-400 focus:bg-white transition-colors';

export default function ThongTinCongTyPage() {
    const { user, setUser } = useAuthStore();
    const profile = user?.employerProfile;

    const [form, setForm] = useState({
        companyName: profile?.companyName || '',
        website: profile?.website || '',
        address: profile?.address || '',
        companySize: profile?.companySize || '',
        description: profile?.description || '',
        taxCode: profile?.taxCode || '',
    });
    const [industryIds, setIndustryIds] = useState([]);
    const [industries, setIndustries] = useState([]);
    const [saving, setSaving] = useState(false);
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || null);
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverPreview, setCoverPreview] = useState(profile?.coverImage || null);

    useEffect(() => {
        api.get('/industries?limit=100').then(res => {
            setIndustries(res.data?.data ?? res.data ?? []);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (profile) {
            const ids = profile.industryIds;
            if (Array.isArray(ids)) setIndustryIds(ids.map(Number));
            else if (profile.industryId) setIndustryIds([profile.industryId]);
            setLogoPreview(profile.logoUrl || null);
            setCoverPreview(profile.coverImage || null);
        }
    }, [profile?.id]); // eslint-disable-line

    const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('File tối đa 2MB'); return; }
        setLogoPreview(URL.createObjectURL(file));
        setLogoUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = res.data?.data?.url;
            setUser({ ...user, employerProfile: { ...profile, logoUrl: url } });
            setLogoPreview(url);
            toast.success('Đã cập nhật logo');
        } catch {
            toast.error('Upload logo thất bại');
            setLogoPreview(profile?.logoUrl || null);
        } finally {
            setLogoUploading(false);
        }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('File tối đa 5MB'); return; }
        setCoverPreview(URL.createObjectURL(file));
        setCoverUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload/cover', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = res.data?.data?.url;
            setUser({ ...user, employerProfile: { ...profile, coverImage: url } });
            setCoverPreview(url);
            toast.success('Đã cập nhật ảnh bìa');
        } catch {
            toast.error('Upload ảnh bìa thất bại');
            setCoverPreview(profile?.coverImage || null);
        } finally {
            setCoverUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form, industryIds };
            const res = await api.patch('/users/me/profile', payload);
            setUser({ ...user, employerProfile: { ...profile, ...res.data, industryIds } });
            toast.success('Cập nhật thành công!');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-base font-extrabold text-slate-900 m-0">Thông tin công ty</h2>
                <p className="text-sm text-slate-500 mt-1">Thông tin hiển thị cho ứng viên khi xem tin tuyển dụng của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-5 items-start">
                <div className="flex flex-col gap-4">
                    {/* Basic info */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 m-0 mb-4 pb-3 border-b border-slate-100">Thông tin cơ bản</h3>
                        <Field label="Tên công ty">
                            <input value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="TopCV Vietnam" className={fieldCls} />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Website">
                                <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://topcv.vn" className={fieldCls} />
                            </Field>
                            <Field label="Mã số thuế">
                                <input value={form.taxCode} onChange={e => set('taxCode', e.target.value)} placeholder="0123456789" className={fieldCls} />
                            </Field>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Quy mô công ty">
                                <select value={form.companySize} onChange={e => set('companySize', e.target.value)} className={cn(fieldCls, 'cursor-pointer')}>
                                    <option value="">-- Chọn quy mô --</option>
                                    <option value="1-10">1 – 10 nhân viên</option>
                                    <option value="11-50">11 – 50 nhân viên</option>
                                    <option value="51-200">51 – 200 nhân viên</option>
                                    <option value="201-500">201 – 500 nhân viên</option>
                                    <option value="501-1000">501 – 1000 nhân viên</option>
                                    <option value="1001+">Trên 1000 nhân viên</option>
                                </select>
                            </Field>
                            <Field label="Địa chỉ trụ sở">
                                <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Nguyễn Huệ, Q.1, HCM" className={fieldCls} />
                            </Field>
                        </div>
                        <Field label="Ngành nghề" hint="Chọn một hoặc nhiều ngành phù hợp với lĩnh vực của công ty">
                            <IndustryPicker industries={industries} selected={industryIds} onChange={setIndustryIds} />
                        </Field>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 m-0 mb-4 pb-3 border-b border-slate-100">Giới thiệu công ty</h3>
                        <Field label="Mô tả" hint="Giới thiệu về công ty, văn hóa, định hướng phát triển...">
                            <textarea
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                rows={8}
                                placeholder="Giới thiệu về công ty của bạn..."
                                className={cn(fieldCls, 'resize-y min-h-40 font-inherit')}
                            />
                        </Field>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-4">
                    {/* Logo */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm text-center">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 mb-3">Logo công ty</h3>
                        <div className="w-22.5 h-22.5 rounded-xl border-2 border-dashed border-green-200 flex items-center justify-center mx-auto mb-2.5 overflow-hidden bg-linear-to-br from-green-50 to-slate-50 relative">
                            {logoPreview
                                ? <img src={logoPreview} alt="logo" className="w-full h-full object-contain" />
                                : <span className="text-3xl font-extrabold text-green-600">{form.companyName[0]?.toUpperCase() || '?'}</span>
                            }
                            {logoUploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader size={20} color={GREEN} className="animate-spin" />
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 m-0 mb-2.5">PNG, JPG tối đa 2MB</p>
                        <label className={cn('inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-600', logoUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 transition-colors')}>
                            <Upload size={13} />
                            Tải logo lên
                            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                        </label>
                    </div>

                    {/* Cover photo */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0 mb-3">Ảnh bìa công ty</h3>
                        <div className="w-full h-24 rounded-xl border-2 border-dashed border-green-200 overflow-hidden bg-linear-to-br from-green-50 to-slate-50 relative mb-2.5">
                            {coverPreview
                                ? <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-slate-300 text-[11px]">Chưa có ảnh bìa</div>
                            }
                            {coverUploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <Loader size={20} color={GREEN} className="animate-spin" />
                                </div>
                            )}
                        </div>
                        <p className="text-[11px] text-slate-400 m-0 mb-2.5">PNG, JPG tối đa 5MB · Tỉ lệ 3:1 khuyến nghị</p>
                        <label className={cn('inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-600', coverUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50 transition-colors')}>
                            <Upload size={13} />
                            Tải ảnh bìa lên
                            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={handleCoverUpload} disabled={coverUploading} />
                        </label>
                    </div>

                    {/* Save */}
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <button
                            type="submit" disabled={saving}
                            className={cn('w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-bold text-white border-none cursor-pointer transition-opacity', saving ? 'bg-green-300 cursor-not-allowed' : 'bg-linear-to-br from-green-500 to-green-700 shadow-[0_4px_12px_rgba(0,177,79,0.3)] hover:opacity-90')}
                        >
                            {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <p className="text-[11px] text-slate-400 text-center mt-2 m-0">Lưu để cập nhật bước xác thực thông tin công ty</p>
                    </div>
                </div>
            </form>
        </div>
    );
}
