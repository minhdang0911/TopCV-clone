'use client';

import { Settings } from 'lucide-react';

export default function CaiDatPage() {
    return (
        <div>
            <div className="mb-5">
                <h2 className="text-base font-extrabold text-slate-900 m-0">Cài đặt</h2>
                <p className="text-sm text-slate-500 mt-1">Cài đặt tài khoản nhà tuyển dụng</p>
            </div>
            <div className="bg-white rounded-xl py-16 px-7 border border-slate-200 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Settings size={26} className="text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-700 m-0 mb-2">Sắp ra mắt</h3>
                <p className="text-sm text-slate-400 m-0">Tính năng cài đặt tài khoản đang được phát triển</p>
            </div>
        </div>
    );
}
