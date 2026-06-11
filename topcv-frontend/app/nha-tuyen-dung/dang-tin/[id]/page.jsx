'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import JobForm from '../_JobForm';
import { employerDashboardService } from '@/services/employer-dashboard.service';

const GREEN = '#00b14f';

export default function EditJobPage() {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        employerDashboardService.getJobById(id)
            .then(res => setJob(res.data))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '36px', height: '36px', border: `3px solid #e5e7eb`, borderTopColor: GREEN, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (notFound) return (
        <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Không tìm thấy tin tuyển dụng</p>
            <Link href="/nha-tuyen-dung/quan-ly-tin" style={{ color: GREEN, textDecoration: 'none', fontWeight: '600' }}>← Quay lại danh sách</Link>
        </div>
    );

    // Convert API data to form-compatible format
    const initialData = {
        title: job.title || '',
        description: job.description || '',
        salaryType: job.salaryType || 'range',
        salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '',
        locations: job.locations,
        jobType: job.jobType || 'full-time',
        workingType: job.workingType || 'TOAN_THOI_GIAN',
        workingDays: job.workingDays || 'MON_FRI',
        workingDaysNote: job.workingDaysNote || '',
        level: job.level || 'NHAN_VIEN',
        quantity: job.quantity || 1,
        deadline: job.deadline ? job.deadline.slice(0, 10) : '',
        industryId: job.industryId ? String(job.industryId) : '',
        jobPositionId: job.jobPositionId ? String(job.jobPositionId) : '',
        isActive: job.isActive ?? true,
    };

    return (
        <div>
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/nha-tuyen-dung/quan-ly-tin" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>
                    <ArrowLeft size={16} /> Quay lại
                </Link>
                <div style={{ width: '1px', height: '18px', background: '#e5e7eb' }} />
                <div>
                    <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Chỉnh sửa tin tuyển dụng</h1>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>{job.title}</p>
                </div>
            </div>
            <JobForm jobId={id} initialData={initialData} />
        </div>
    );
}
