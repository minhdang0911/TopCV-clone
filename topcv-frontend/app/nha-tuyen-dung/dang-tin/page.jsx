'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import JobForm from './_JobForm';

export default function DangTinPage() {
    const router  = useRouter();
    const [canPost, setCanPost] = useState(null);

    useEffect(() => {
        api.get('/employers/me/verification-status')
            .then(res => setCanPost(res.data?.canPostJob ?? false))
            .catch(() => setCanPost(false));
    }, []);

    if (canPost === null) {
        return (
            <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
                <Loader2 size={20} className="animate-spin text-[#00b14f]" />
                <span className="text-sm">Đang kiểm tra xác thực...</span>
            </div>
        );
    }

    if (!canPost) {
        return (
            <div>
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-900">Đăng tin tuyển dụng</h1>
                </div>
                <div className="bg-white rounded-2xl px-8 py-16 text-center border border-amber-200">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <ShieldAlert size={30} className="text-amber-500" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Tài khoản chưa được xác thực</h2>
                    <p className="text-sm text-slate-500 mb-7 max-w-md mx-auto leading-relaxed">
                        Bạn cần hoàn thành <strong>3 bước xác thực</strong> trước khi có thể đăng tin tuyển dụng.
                        Việc này giúp đảm bảo ứng viên chỉ thấy tin từ nhà tuyển dụng hợp lệ.
                    </p>
                    <Button onClick={() => router.push('/nha-tuyen-dung/ho-so-cong-ty')}
                        className="bg-[#00b14f] hover:bg-[#009944] text-white gap-2 px-6">
                        Hoàn thành xác thực <ArrowRight size={15} />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-900">Đăng tin tuyển dụng</h1>
                <p className="text-sm text-slate-400 mt-0.5">Điền đầy đủ thông tin để thu hút ứng viên phù hợp</p>
            </div>
            <JobForm />
        </div>
    );
}
