'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, DollarSign, Clock, Bookmark, Settings2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { jobService } from '@/services/job.service';
import { savedJobsService } from '@/services/applications.service';
import useAuthStore from '@/stores/auth.store';

const GREEN = '#00b14f';

function formatSalary(min, max, type) {
    if (type === 'NEGOTIABLE' || (!min && !max)) return 'Thương lượng';
    const fmt = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(0)} triệu` : `${n.toLocaleString()}đ`;
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    if (max) return `Đến ${fmt(max)}`;
    return 'Thương lượng';
}

function JobCard({ job, saved, onToggleSave, onDismiss }) {
    const router = useRouter();
    const logo = job.employer?.logoUrl || job.company?.logo;
    const companyName = job.employer?.companyName || job.company?.companyName || '';
    const location = job.locations?.[0]?.provinceName || job.locations?.[0]?.provinceCode || '';
    const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType);
    const deadline = job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : '';

    return (
        <div
            style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer', transition: 'box-shadow 0.15s, border-color 0.15s', position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,177,79,0.10)'; e.currentTarget.style.borderColor = '#86efac'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = '#e5e7eb'; }}
            onClick={() => router.push(`/viec-lam/${job.slug}`)}
        >
            {/* Dismiss button */}
            <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); onDismiss(); }}
                style={{ position: 'absolute', top: '10px', right: '36px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#d1d5db', lineHeight: 0 }}
                title="Không quan tâm"
            >
                <X size={15} />
            </button>
            {/* Save button */}
            <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleSave(); }}
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: saved ? GREEN : '#d1d5db', lineHeight: 0 }}
                title={saved ? 'Bỏ lưu' : 'Lưu việc làm'}
            >
                <Bookmark size={18} fill={saved ? GREEN : 'none'} />
            </button>

            {/* Logo + title */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', border: '1px solid #f3f4f6', overflow: 'hidden', flexShrink: 0, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {logo ? (
                        <Image src={logo} alt={companyName} width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'contain' }} unoptimized />
                    ) : (
                        <div style={{ width: '28px', height: '28px', background: '#e5e7eb', borderRadius: '4px' }} />
                    )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111827', margin: 0, paddingRight: '28px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{companyName}</p>
                </div>
            </div>

            {/* Salary */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <DollarSign size={13} color={GREEN} />
                <span style={{ fontSize: '13px', color: GREEN, fontWeight: '600' }}>{salary}</span>
            </div>

            {/* Location + deadline */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color='#9ca3af' />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{location}</span>
                    </div>
                )}
                {deadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} color='#9ca3af' />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>HH: {deadline}</span>
                    </div>
                )}
            </div>

            {/* Apply button on hover */}
            <button
                onClick={e => { e.stopPropagation(); router.push(`/viec-lam/${job.slug}?apply=1`); }}
                style={{ width: '100%', padding: '8px', background: GREEN, color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
            >
                Ứng tuyển ngay
            </button>
        </div>
    );
}

export default function ViecLamPhuHopPage() {
    const { isAuthenticated, hydrated } = useAuthStore();
    const router = useRouter();

    const [jobs, setJobs] = useState([]);
    const [isPersonalized, setIsPersonalized] = useState(false);
    const [loading, setLoading] = useState(true);
    const [savedIds, setSavedIds] = useState(new Set());

    useEffect(() => {
        if (!hydrated) return;
        Promise.all([
            jobService.getSuggestions(),
            isAuthenticated ? savedJobsService.getMy({ limit: 200 }) : Promise.resolve(null),
        ]).then(([jobsRes, savedRes]) => {
            const data = jobsRes.data?.data || [];
            setJobs(data);
            setIsPersonalized(!!jobsRes.data?.isPersonalized);
            if (savedRes) {
                setSavedIds(new Set((savedRes.data?.data || []).map(i => i.jobId)));
            }
        }).catch(() => {}).finally(() => setLoading(false));
    }, [hydrated, isAuthenticated]);

    const handleToggleSave = async (jobId) => {
        if (!isAuthenticated) { router.push('/login'); return; }
        const willSave = !savedIds.has(jobId);
        setSavedIds(prev => { const next = new Set(prev); if (next.has(jobId)) next.delete(jobId); else next.add(jobId); return next; });
        toast.success(willSave ? 'Đã lưu việc làm' : 'Đã bỏ lưu');
        try { await savedJobsService.toggle(jobId); } catch {
            setSavedIds(prev => { const next = new Set(prev); if (next.has(jobId)) next.delete(jobId); else next.add(jobId); return next; });
            toast.error('Có lỗi xảy ra');
        }
    };

    const handleDismiss = async (jobId) => {
        if (!isAuthenticated) return;
        setJobs(prev => prev.filter(j => j.id !== jobId));
        try {
            await jobService.dismissSuggestion(jobId);
            toast.success('Đã ẩn gợi ý này');
        } catch {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (!hydrated || loading) {
        return (
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
                Đang tải việc làm phù hợp...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 16px 60px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Sparkles size={20} color={GREEN} />
                        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
                            Việc làm phù hợp với bạn
                        </h1>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        {isPersonalized
                            ? 'Dựa trên sở thích và kinh nghiệm của bạn'
                            : 'Việc làm mới nhất — cập nhật sở thích để nhận gợi ý cá nhân hóa'}
                    </p>
                </div>
                <Link
                    href="/cai-dat-goi-y-viec-lam"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', border: `1.5px solid ${GREEN}`, borderRadius: '8px', color: GREEN, fontSize: '13px', fontWeight: '600', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                    <Settings2 size={15} />
                    Cài đặt gợi ý
                </Link>
            </div>

            {/* Not personalized notice */}
            {!isPersonalized && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Settings2 size={18} color='#d97706' style={{ flexShrink: 0 }} />
                    <div>
                        <p style={{ fontSize: '14px', color: '#92400e', fontWeight: '600', margin: '0 0 2px' }}>
                            Hãy cập nhật sở thích để nhận gợi ý chính xác hơn
                        </p>
                        <p style={{ fontSize: '13px', color: '#b45309', margin: 0 }}>
                            Chọn ngành nghề và địa điểm để TopCV gợi ý việc làm phù hợp nhất.{' '}
                            <Link href="/cai-dat-goi-y-viec-lam" style={{ color: GREEN, fontWeight: '600', textDecoration: 'underline' }}>
                                Cài đặt ngay
                            </Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Jobs grid */}
            {jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                    <p style={{ fontSize: '15px' }}>Không tìm thấy việc làm phù hợp.</p>
                    <Link href="/cai-dat-goi-y-viec-lam" style={{ color: GREEN, fontWeight: '600', fontSize: '14px', textDecoration: 'underline' }}>
                        Cập nhật sở thích
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {jobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            saved={savedIds.has(job.id)}
                            onToggleSave={() => handleToggleSave(job.id)}
                            onDismiss={() => handleDismiss(job.id)}
                        />
                    ))}
                </div>
            )}

            {/* Footer link */}
            <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Link href="/viec-lam" style={{ fontSize: '14px', color: GREEN, fontWeight: '600', textDecoration: 'none', borderBottom: `1.5px solid ${GREEN}`, paddingBottom: '2px' }}>
                    Xem tất cả việc làm
                </Link>
            </div>
        </div>
    );
}
