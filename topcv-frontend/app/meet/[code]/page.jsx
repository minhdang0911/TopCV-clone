'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Video, Copy, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '@/stores/auth.store';
import { meetingsService } from '@/services/meetings.service';

const GREEN = '#00b14f';

export default function MeetingRoomPage() {
    const { code } = useParams();
    const router = useRouter();
    const { user, isAuthenticated, hydrated } = useAuthStore();

    const [meeting, setMeeting] = useState(null);
    const [meetingUrl, setMeetingUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [ending, setEnding] = useState(false);

    useEffect(() => {
        if (!hydrated) return;
        if (!isAuthenticated) {
            router.replace(`/dang-nhap?redirect=/meet/${code}`);
            return;
        }

        const init = async () => {
            try {
                const infoRes = await meetingsService.getByCode(code);
                const mtg = infoRes.data?.data;
                setMeeting(mtg);

                const profile = user?.candidateProfile || user?.employerProfile;
                const userName = profile?.fullName || profile?.companyName || user?.email || 'Người dùng';

                const tokenRes = await meetingsService.getToken(code, userName);
                const { token, meetingUrl: url } = tokenRes.data?.data;
                setMeetingUrl(`${url}?jwt=${token}`);
            } catch (e) {
                const msg = e?.response?.data?.message;
                if (msg === 'Phòng họp không tồn tại') setError('Phòng họp không tồn tại hoặc đã hết hạn.');
                else if (msg?.includes('quyền')) setError('Bạn không có quyền truy cập phòng họp này.');
                else if (msg?.includes('kết thúc')) setError('Phòng họp đã kết thúc.');
                else setError('Không thể kết nối đến phòng họp.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [hydrated, isAuthenticated, code]); // eslint-disable-line

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Đã sao chép link');
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        toast.success('Đã sao chép mã phòng');
    };

    const handleEnd = async () => {
        if (!confirm('Kết thúc cuộc họp? Tất cả người tham gia sẽ bị ngắt kết nối.')) return;
        setEnding(true);
        try {
            await meetingsService.end(code);
            toast.success('Đã kết thúc cuộc họp');
            router.push('/nha-tuyen-dung/ho-so-ung-vien');
        } catch {
            toast.error('Không thể kết thúc phòng');
        } finally {
            setEnding(false);
        }
    };

    if (!hydrated || !isAuthenticated) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
                <div className="w-10 h-10 border-[3px] border-slate-600 border-t-green-400 rounded-full animate-spin" />
                <p className="text-slate-400 text-sm">Đang kết nối phòng họp...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-5 p-4">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                    <Video size={32} className="text-slate-500" />
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-bold text-white mb-2">{error}</h2>
                    <p className="text-slate-400 text-sm">Vui lòng kiểm tra lại đường link hoặc mã phòng</p>
                </div>
                <button
                    onClick={() => router.push('/meet')}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white border-none cursor-pointer"
                    style={{ background: GREEN }}
                >
                    Nhập mã phòng khác
                </button>
            </div>
        );
    }

    const candidate = meeting?.candidate;
    const candidateName = candidate?.candidateProfile?.fullName || candidate?.email || '';
    const companyName = meeting?.hostEmployer?.companyName || '';
    const isEmployer = user?.role === 'EMPLOYER';

    return (
        <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                        <Video size={15} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold leading-tight">
                            {meeting?.title || 'Cuộc họp phỏng vấn'}
                        </p>
                        <p className="text-slate-400 text-[11px]">{companyName} · {candidateName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={copyCode}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs font-mono font-semibold border-none cursor-pointer transition-colors"
                    >
                        <span>{code}</span>
                        <Copy size={11} />
                    </button>
                    <button
                        onClick={copyLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 text-xs font-semibold border-none cursor-pointer transition-colors"
                    >
                        <Copy size={12} />
                        <span className="hidden sm:inline">Sao chép link</span>
                    </button>
                    {isEmployer && (
                        <button
                            onClick={handleEnd}
                            disabled={ending}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs font-semibold border-none cursor-pointer transition-colors disabled:opacity-60"
                        >
                            <LogOut size={12} />
                            <span className="hidden sm:inline">{ending ? 'Đang kết thúc...' : 'Kết thúc họp'}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* JaaS iframe */}
            <div className="flex-1 min-h-0">
                {meetingUrl && (
                    <iframe
                        src={meetingUrl}
                        allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
                        className="w-full h-full border-none"
                        title="Cuộc họp video"
                    />
                )}
            </div>
        </div>
    );
}
