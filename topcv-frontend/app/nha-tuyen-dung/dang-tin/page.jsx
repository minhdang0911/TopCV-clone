'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import api from '@/lib/axios';
import JobForm from './_JobForm';

export default function DangTinPage() {
    const router = useRouter();
    const [canPost, setCanPost] = useState(null); // null = loading

    useEffect(() => {
        api.get('/employers/me/verification-status')
            .then(res => setCanPost(res.data?.canPostJob ?? false))
            .catch(() => setCanPost(false));
    }, []);

    if (canPost === null) {
        return <div className="py-16 text-center text-slate-400 text-sm">Đang kiểm tra xác thực...</div>;
    }

    if (!canPost) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-[22px] font-extrabold text-slate-900">Đăng tin tuyển dụng</h1>
                </div>
                <div className="bg-white rounded-2xl px-8 py-12 text-center border border-amber-200 shadow-sm">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <ShieldAlert size={32} className="text-amber-600" />
                    </div>
                    <h2 className="text-[18px] font-extrabold text-slate-900 mb-2">Tài khoản chưa được xác thực</h2>
                    <p className="text-sm text-slate-500 mb-7 max-w-md mx-auto">
                        Bạn cần hoàn thành <strong>3 bước xác thực</strong> trước khi có thể đăng tin tuyển dụng.
                        Việc này giúp đảm bảo ứng viên chỉ thấy tin từ nhà tuyển dụng hợp lệ.
                    </p>
                    <button
                        onClick={() => router.push('/nha-tuyen-dung/ho-so-cong-ty')}
                        className="inline-flex items-center gap-2 text-white border-none rounded-[10px] px-6 py-3 text-sm font-bold cursor-pointer bg-gradient-to-br from-green-500 to-green-700 shadow-[0_4px_12px_rgba(0,177,79,0.3)]"
                    >
                        Hoàn thành xác thực <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-[22px] font-extrabold text-slate-900">Đăng tin tuyển dụng</h1>
                <p className="text-[13px] text-slate-500 mt-1">Điền đầy đủ thông tin để thu hút ứng viên phù hợp</p>
            </div>
            <JobForm />
        </div>
    );
}
