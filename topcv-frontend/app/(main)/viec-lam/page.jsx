'use client';

import HomeSearch from '@/app/components/Homesearch';
import BestJobsSection from '@/app/components/BestJobsSection';
import FeaturedEmployers from '@/app/components/FeaturedEmployers';

export default function ViecLamPage() {
    return (
        <div>
            {/* Search Hero Area */}
            <HomeSearch />

            {/* Best Jobs Section */}
            <div style={{ background: '#f5f5f5', padding: '32px 0' }}>
                <BestJobsSection stickyFilter={true} showPagination={true} limit={12} />
            </div>

            {/* Pro Featured Employers */}
            <FeaturedEmployers />
        </div>
    );
}
