'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Building2, FileText, CheckCircle, ArrowRight, Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';

const GREEN = '#00b14f';

const STEPS = [
    { key: 'step1', label: 'Xác thực số điện thoại',             href: '/nha-tuyen-dung/ho-so-cong-ty/xac-thuc-sdt', icon: Phone },
    { key: 'step2', label: 'Cập nhật thông tin công ty',          href: '/nha-tuyen-dung/ho-so-cong-ty',             icon: Building2 },
    { key: 'step3', label: 'Xác thực Giấy đăng ký doanh nghiệp', href: '/nha-tuyen-dung/ho-so-cong-ty/giay-dkkd',   icon: FileText },
];

const fieldCls = 'w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none bg-slate-50 box-border focus:border-green-400 focus:bg-white transition-colors';

export default function ThongTinTaiKhoanPage() {
    const { user, setUser } = useAuthStore();
    const [vstatus, setVstatus] = useState(null);
    const [phone, setPhone] = useState(user?.phone || '');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/employers/me/verification-status').then(r => setVstatus(r.data)).catch(() => {});
        setPhone(user?.phone || '');
    }, [user?.phone]);

    const level = vstatus?.level ?? 0;
    const canPost = vstatus?.canPostJob;
    const pct = Math.round((level / 3) * 100);
    const levelColor = canPost ? GREEN : level > 0 ? '#d97706' : '#dc2626';

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch('/users/me/info', { phone });
            setUser({ ...user, phone });
            toast.success('Cập nhật thành công');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-base font-extrabold text-slate-900 m-0">Thông tin tài khoản</h2>
                <p className="text-sm text-slate-500 mt-1">Cập nhật thông tin cá nhân và trạng thái xác thực tài khoản</p>
            </div>

            {/* Verification checklist */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 m-0">Xác thực thông tin</h3>
                        <p className="text-xs text-slate-500 mt-1 m-0">
                            Tài khoản xác thực:{' '}
                            <span className="font-bold" style={{ color: levelColor }}>Cấp {level}/3</span>
                        </p>
                    </div>
                    <div className="text-sm font-bold" style={{ color: levelColor }}>Hoàn thành {pct}%</div>
                </div>

                <div className="h-1 bg-slate-100 rounded-full mb-4 overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: canPost ? GREEN : '#f59e0b' }}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    {STEPS.map(s => {
                        const done = vstatus?.[s.key]?.done;
                        const Icon = s.icon;
                        return (
                            <Link key={s.key} href={s.href} className="no-underline">
                                <div className={cn(
                                    'flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-colors cursor-pointer',
                                    done ? 'border-green-100 bg-green-50 hover:border-green-200' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                )}>
                                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', done ? 'bg-green-100' : 'bg-slate-100')}>
                                        <Icon size={15} color={done ? GREEN : '#94a3b8'} />
                                    </div>
                                    <span className={cn('flex-1 text-sm font-medium', done ? 'text-green-800' : 'text-slate-700')}>{s.label}</span>
                                    {done
                                        ? <CheckCircle size={18} color={GREEN} />
                                        : <ArrowRight size={16} className="text-slate-400" />
                                    }
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 m-0 mb-5 pb-3.5 border-b border-slate-100">Cập nhật thông tin tài khoản</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                        <input value={user?.email || ''} disabled className={cn(fieldCls, 'text-slate-400 cursor-not-allowed')} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
                        <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912345678" className={fieldCls} />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave} disabled={saving}
                        className={cn(
                            'inline-flex items-center gap-1.5 text-white border-none rounded-xl px-6 py-2.5 text-sm font-bold transition-opacity',
                            saving ? 'bg-green-300 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-700 shadow-[0_4px_12px_rgba(0,177,79,0.25)] cursor-pointer hover:opacity-90'
                        )}
                    >
                        {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
}
