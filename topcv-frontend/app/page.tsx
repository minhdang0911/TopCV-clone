import BestJobsSection from '@/app/components/BestJobsSection';
import HomeSearch from './components/Homesearch';
import JobMarket from './components/JobMarket';
import FeaturedEmployers from './components/FeaturedEmployers';

export default function Home() {
    return (
        <div>
            <HomeSearch />

            <div style={{ background: '#f5f5f5' }}>
                <BestJobsSection stickyFilter={false} showPagination={false} limit={9} />
            </div>

            <FeaturedEmployers />

            <JobMarket />
        </div>
    );
}
