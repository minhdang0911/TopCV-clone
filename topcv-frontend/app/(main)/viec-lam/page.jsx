'use client';

import BestJobsSection from '@/app/components/BestJobsSection';

export default function ViecLamPage() {
    return (
        <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
            <BestJobsSection stickyFilter={true} showPagination={true} limit={12} />
        </div>
    );
}
