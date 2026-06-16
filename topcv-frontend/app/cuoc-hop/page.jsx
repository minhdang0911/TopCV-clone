'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Video } from 'lucide-react';

const GREEN = '#00b14f';

export default function CuocHopPage() {
    const router = useRouter();
    const [segments, setSegments] = useState(['', '', '']);
    const refs = [useRef(null), useRef(null), useRef(null)];
    const lengths = [3, 4, 3];

    const handleChange = (idx, val) => {
        const clean = val.replace(/[^a-zA-Z]/g, '').toLowerCase().slice(0, lengths[idx]);
        const next = [...segments];
        next[idx] = clean;
        setSegments(next);
        if (clean.length === lengths[idx] && idx < 2) {
            refs[idx + 1].current?.focus();
        }
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && segments[idx] === '' && idx > 0) {
            refs[idx - 1].current?.focus();
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        const code = segments.join('-');
        if (code.length !== 11) return;
        router.push(`/meet/${code}`);
    };

    const isReady = segments[0].length === 3 && segments[1].length === 4 && segments[2].length === 3;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: GREEN }}>
                        <Video size={30} className="text-white" />
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900 mb-1">Tham gia cuộc họp</h1>
                    <p className="text-sm text-slate-500 text-center">Nhập mã phòng họp được cung cấp bởi nhà tuyển dụng</p>
                </div>

                <form onSubmit={handleJoin}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">Mã phòng họp</p>
                    <div className="flex items-center justify-center gap-2 mb-6">
                        {segments.map((seg, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    ref={refs[idx]}
                                    value={seg}
                                    onChange={e => handleChange(idx, e.target.value)}
                                    onKeyDown={e => handleKeyDown(idx, e)}
                                    maxLength={lengths[idx]}
                                    placeholder={'·'.repeat(lengths[idx])}
                                    className="text-center text-lg font-bold tracking-widest border-2 rounded-xl outline-none transition-colors text-slate-900 bg-slate-50"
                                    style={{
                                        width: idx === 1 ? '5rem' : '4rem',
                                        padding: '10px 8px',
                                        borderColor: seg.length === lengths[idx] ? GREEN : '#e2e8f0',
                                        background: seg.length === lengths[idx] ? '#f0fdf4' : '#f8fafc',
                                    }}
                                />
                                {idx < 2 && <span className="text-slate-400 font-bold text-lg">-</span>}
                            </div>
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={!isReady}
                        className="w-full py-3 rounded-xl text-white font-bold text-sm border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                        style={{ background: GREEN }}
                    >
                        Tham gia ngay
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 mt-5">
                    Mã có dạng <span className="font-mono font-semibold text-slate-600">abc-defg-hij</span>
                </p>
            </div>
        </div>
    );
}
