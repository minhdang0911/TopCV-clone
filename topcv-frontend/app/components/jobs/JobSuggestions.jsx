'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, DollarSign, Building2 } from 'lucide-react';
import { jobService } from '@/services/job.service';
import useAuthStore from '@/stores/auth.store';

function formatSalary(min, max) {
    if (!min && !max) return 'Thỏa thuận';
    const fmt = (n) => (n / 1_000_000).toFixed(0) + ' triệu';
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    if (min) return `Từ ${fmt(min)}`;
    return `Đến ${fmt(max)}`;
}

function JobCard({ job }) {
    const router = useRouter();
    const logo = job.employer?.logoUrl;
    const company = job.employer?.companyName || 'Công ty';

    return (
        <div
            onClick={() => router.push(`/viec-lam/${job.id}`)}
            style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s, border-color 0.15s',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#00b14f';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
            }}
        >
            <div
                style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                }}
            >
                {logo ? (
                    <img src={logo} alt={company} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                    <Building2 size={22} color="#9ca3af" />
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {job.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{company}</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#00b14f', fontWeight: '500' }}>
                        <DollarSign size={12} />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                    {job.provinceCode && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '12px', color: '#6b7280' }}>
                            <MapPin size={12} />
                            {job.address || job.provinceCode}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function JobSuggestions() {
    const { isAuthenticated } = useAuthStore();
    const [jobs, setJobs] = useState([]);
    const [isPersonalized, setIsPersonalized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        jobService
            .getSuggestions()
            .then((res) => {
                setJobs(res.data?.data || []);
                setIsPersonalized(res.data?.isPersonalized || false);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    if (loading) {
        return (
            <div style={{ padding: '32px 0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                height: '100px',
                                borderRadius: '10px',
                                background: '#f3f4f6',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!jobs.length) return null;

    return (
        <div style={{ marginTop: '48px' }}>
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>
                    {isPersonalized ? 'Việc làm phù hợp với bạn' : 'Việc làm nổi bật'}
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    {isPersonalized
                        ? 'Dựa trên tiêu chí tìm việc bạn đã chọn'
                        : 'Các vị trí đang được tuyển dụng nhiều nhất hiện nay'}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
            </div>
        </div>
    );
}
