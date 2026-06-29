'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Check, ChevronDown, X, Loader2, Building2, Globe, Hash, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// ─── Industry Multi-Picker ─────────────────────────────────────────────────────
function IndustryPicker({ industries, selected, onChange }) {
    const [open, setOpen] = useState(false);
    const toggle = (id) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    const selectedLabels = industries.filter(i => selected.includes(i.id)).map(i => i.name);

    return (
        <div className="relative">
            <button type="button" onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 border border-input rounded-lg text-sm bg-transparent hover:bg-slate-50 transition-colors outline-none">
                <span className={cn('flex-1 truncate text-left', selected.length === 0 && 'text-muted-foreground')}>
                    {selected.length === 0 ? 'Chọn ngành nghề...' : selectedLabels.join(', ')}
                </span>
                <ChevronDown size={14} className={cn('text-slate-400 shrink-0 transition-transform', open && 'rotate-180')} />
            </button>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                    {industries.filter(i => selected.includes(i.id)).map(i => (
                        <span key={i.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-emerald-700 font-medium">
                            {i.name}
                            <button type="button" onClick={() => toggle(i.id)} className="hover:text-emerald-900">
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {open && (
                <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[220px] overflow-y-auto mt-1">
                    {industries.map(i => (
                        <button key={i.id} type="button" onClick={() => toggle(i.id)}
                            className={cn('w-full text-left px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between hover:bg-slate-50 transition-colors',
                                selected.includes(i.id) && 'bg-emerald-50 text-emerald-700')}>
                            {i.name}
                            {selected.includes(i.id) && <Check size={14} className="text-[#00b14f]" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Form Field wrapper ────────────────────────────────────────────────────────
function Field({ label, children, hint, icon: Icon }) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                {Icon && <Icon size={13} className="text-slate-400" />}
                {label}
            </Label>
            {children}
            {hint && <p className="text-xs text-slate-400">{hint}</p>}
        </div>
    );
}

// ─── Upload Section ────────────────────────────────────────────────────────────
function ImageUploadCard({ title, preview, uploading, onUpload, aspect = 'square', maxMB = 2, hint }) {
    return (
        <div className="bg-white rounded-xl p-5 border border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
            <div className={cn(
                'w-full rounded-xl border-2 border-dashed border-slate-200 overflow-hidden bg-slate-50 relative mb-3 flex items-center justify-center',
                aspect === 'square' ? 'h-28' : 'h-24'
            )}>
                {preview
                    ? <img src={preview} alt="" className={cn('object-contain', aspect === 'square' ? 'w-24 h-24' : 'w-full h-full object-cover')} />
                    : <div className="text-slate-300 text-xs">Chưa có ảnh</div>
                }
                {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-[#00b14f]" />
                    </div>
                )}
            </div>
            {hint && <p className="text-[11px] text-slate-400 mb-2">{hint}</p>}
            <label className={cn(
                'inline-flex items-center gap-1.5 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-600 bg-white transition-colors',
                uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'
            )}>
                <Upload size={12} />
                Tải lên
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>
        </div>
    );
}

const SIZE_OPTIONS = [
    { value: '1-10',    label: '1 – 10 nhân viên' },
    { value: '11-50',   label: '11 – 50 nhân viên' },
    { value: '51-200',  label: '51 – 200 nhân viên' },
    { value: '201-500', label: '201 – 500 nhân viên' },
    { value: '501-1000',label: '501 – 1000 nhân viên' },
    { value: '1001+',   label: 'Trên 1000 nhân viên' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ThongTinCongTyPage() {
    const { user, setUser } = useAuthStore();
    const profile = user?.employerProfile;

    const [form, setForm] = useState({
        companyName:  profile?.companyName  || '',
        website:      profile?.website      || '',
        address:      profile?.address      || '',
        companySize:  profile?.companySize  || '',
        description:  profile?.description  || '',
        taxCode:      profile?.taxCode      || '',
    });
    const [industryIds,    setIndustryIds]    = useState([]);
    const [industries,     setIndustries]     = useState([]);
    const [saving,         setSaving]         = useState(false);
    const [logoUploading,  setLogoUploading]  = useState(false);
    const [logoPreview,    setLogoPreview]    = useState(profile?.logoUrl    || null);
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverPreview,   setCoverPreview]   = useState(profile?.coverImage || null);

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
            const fd = new FormData();
            fd.append('file', file);
            const res = await api.post('/upload/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = res.data?.data?.url;
            setUser({ ...user, employerProfile: { ...profile, logoUrl: url } });
            setLogoPreview(url);
            toast.success('Đã cập nhật logo');
        } catch {
            toast.error('Upload logo thất bại');
            setLogoPreview(profile?.logoUrl || null);
        } finally { setLogoUploading(false); }
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('File tối đa 5MB'); return; }
        setCoverPreview(URL.createObjectURL(file));
        setCoverUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await api.post('/upload/cover', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const url = res.data?.data?.url;
            setUser({ ...user, employerProfile: { ...profile, coverImage: url } });
            setCoverPreview(url);
            toast.success('Đã cập nhật ảnh bìa');
        } catch {
            toast.error('Upload ảnh bìa thất bại');
            setCoverPreview(profile?.coverImage || null);
        } finally { setCoverUploading(false); }
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
        } finally { setSaving(false); }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Hồ sơ công ty</h1>
                <p className="text-sm text-slate-400 mt-0.5">Thông tin hiển thị cho ứng viên khi xem tin tuyển dụng của bạn</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_264px] gap-5 items-start">
                {/* Left column */}
                <div className="flex flex-col gap-4">
                    {/* Basic info */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                            Thông tin cơ bản
                        </h3>
                        <div className="space-y-4">
                            <Field label="Tên công ty" icon={Building2}>
                                <Input value={form.companyName} onChange={e => set('companyName', e.target.value)}
                                    placeholder="TopCV Vietnam"
                                    className="focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20" />
                            </Field>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Website" icon={Globe}>
                                    <Input value={form.website} onChange={e => set('website', e.target.value)}
                                        placeholder="https://topcv.vn"
                                        className="focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20" />
                                </Field>
                                <Field label="Mã số thuế" icon={Hash}>
                                    <Input value={form.taxCode} onChange={e => set('taxCode', e.target.value)}
                                        placeholder="0123456789"
                                        className="focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20" />
                                </Field>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Field label="Quy mô công ty" icon={Users}>
                                    <Select value={form.companySize || '__none__'} onValueChange={v => set('companySize', v === '__none__' ? '' : v)}>
                                        <SelectTrigger className="focus:ring-[#00b14f]/20 focus:border-[#00b14f]">
                                            <SelectValue placeholder="Chọn quy mô..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none__">-- Chọn quy mô --</SelectItem>
                                            {SIZE_OPTIONS.map(o => (
                                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label="Địa chỉ trụ sở" icon={MapPin}>
                                    <Input value={form.address} onChange={e => set('address', e.target.value)}
                                        placeholder="123 Nguyễn Huệ, Q.1, HCM"
                                        className="focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20" />
                                </Field>
                            </div>

                            <Field label="Ngành nghề" hint="Chọn một hoặc nhiều ngành phù hợp với lĩnh vực của công ty">
                                <IndustryPicker industries={industries} selected={industryIds} onChange={setIndustryIds} />
                            </Field>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                            Giới thiệu công ty
                        </h3>
                        <Field label="Mô tả" hint="Giới thiệu về công ty, văn hóa, định hướng phát triển...">
                            <Textarea value={form.description} onChange={e => set('description', e.target.value)}
                                rows={8} placeholder="Giới thiệu về công ty của bạn..."
                                className="resize-y min-h-40 focus-visible:border-[#00b14f] focus-visible:ring-[#00b14f]/20" />
                        </Field>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="flex flex-col gap-4">
                    {/* Logo */}
                    <ImageUploadCard
                        title="Logo công ty"
                        preview={logoPreview}
                        uploading={logoUploading}
                        onUpload={handleLogoUpload}
                        aspect="square"
                        hint="PNG, JPG · tối đa 2MB"
                    />

                    {/* Cover */}
                    <ImageUploadCard
                        title="Ảnh bìa công ty"
                        preview={coverPreview}
                        uploading={coverUploading}
                        onUpload={handleCoverUpload}
                        aspect="wide"
                        hint="PNG, JPG · tối đa 5MB · Tỉ lệ 3:1 khuyến nghị"
                    />

                    {/* Save */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5">
                        <Button type="submit" disabled={saving} className="w-full bg-[#00b14f] hover:bg-[#009944] text-white gap-2 h-11">
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <p className="text-[11px] text-slate-400 text-center mt-2">
                            Lưu để cập nhật thông tin xác thực công ty
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}
