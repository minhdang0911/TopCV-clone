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
        <div className="flex justify-center py-16">
            <div className="w-9 h-9 border-[3px] border-slate-200 border-t-green-500 rounded-full animate-spin" />
        </div>
    );

    if (notFound) return (
        <div className="text-center py-16 text-slate-500">
            <p className="text-base font-semibold text-slate-700 mb-2">Không tìm thấy tin tuyển dụng</p>
            <Link href="/nha-tuyen-dung/quan-ly-tin" className="font-semibold no-underline" style={{ color: GREEN }}>← Quay lại danh sách</Link>
        </div>
    );

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
            <div className="mb-6 flex items-center gap-3">
                <Link href="/nha-tuyen-dung/quan-ly-tin" className="flex items-center gap-1.5 text-[13px] text-slate-500 no-underline">
                    <ArrowLeft size={16} /> Quay lại
                </Link>
                <div className="w-px h-4.5 bg-slate-200" />
                <div>
                    <h1 className="text-[22px] font-extrabold text-slate-900">Chỉnh sửa tin tuyển dụng</h1>
                    <p className="text-[13px] text-slate-500 mt-1">{job.title}</p>
                </div>
            </div>
            <JobForm jobId={id} initialData={initialData} />
        </div>
    );
}
