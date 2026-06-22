'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, ArrowRight, Shield, Zap, Users } from 'lucide-react';

const GREEN = '#00b14f';

export default function MeetLandingPage() {
    const router = useRouter();
    const [code, setCode] = useState('');

    const handleJoin = (e) => {
        e.preventDefault();
        const trimmed = code.trim().replace(/\s+/g, '');
        if (!trimmed) return;
        router.push(`/meet/${trimmed}`);
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col">
            {/* Header */}
            <header className="flex items-center gap-2.5 px-6 py-4 border-b border-slate-800">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                    <Video size={14} className="text-white" />
                </div>
                <span className="text-white font-bold text-sm tracking-tight">TopCV Meet</span>
            </header>

            {/* Body */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* Left — content */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit"
                                style={{ background: 'rgba(0,177,79,0.12)', color: GREEN }}
                            >
                                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: GREEN }} />
                                Phỏng vấn video trực tuyến
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                                Tham gia cuộc họp<br />
                                <span style={{ color: GREEN }}>an toàn & tức thì</span>
                            </h1>
                            <p className="text-slate-400 text-base leading-relaxed">
                                Nhập mã phòng được cung cấp bởi nhà tuyển dụng để bắt đầu buổi phỏng vấn video chất lượng cao.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3">
                            {[
                                { icon: Shield, label: 'Bảo mật end-to-end' },
                                { icon: Zap, label: 'Kết nối tức thì, không cài đặt' },
                                { icon: Users, label: 'Hỗ trợ cả ứng viên và nhà tuyển dụng' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                                        <Icon size={14} className="text-slate-400" />
                                    </div>
                                    <span className="text-slate-400 text-sm">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right — join card */}
                    <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-8 flex flex-col gap-6 backdrop-blur-sm">
                        <div className="flex flex-col gap-1.5">
                            <h2 className="text-white font-bold text-xl">Nhập mã phòng</h2>
                            <p className="text-slate-500 text-sm">Mã phòng có dạng: <span className="font-mono text-slate-400">abc-defg-hij</span></p>
                        </div>

                        <form onSubmit={handleJoin} className="flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="abc-defg-hij"
                                    autoFocus
                                    spellCheck={false}
                                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-600 text-base font-mono focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!code.trim()}
                                className="w-full py-3.5 rounded-xl text-white text-sm font-bold border-none cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
                                style={{ background: GREEN }}
                            >
                                Tham gia ngay
                                <ArrowRight size={16} />
                            </button>
                        </form>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-700" />
                            <span className="text-slate-600 text-xs">hoặc</span>
                            <div className="flex-1 h-px bg-slate-700" />
                        </div>

                        <p className="text-slate-500 text-xs text-center leading-relaxed">
                            Link tham gia được gửi qua email sau khi nhà tuyển dụng tạo lịch phỏng vấn.
                            Kiểm tra hộp thư của bạn nếu chưa có mã.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
