'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import SeoKeywords from '@/app/components/SeoKeywords';
import JobPreferencesModal from '@/app/components/onboarding/JobPreferencesModal';
import FloatingActions from '@/components/FloatingActions';
import useAuthStore from '@/stores/auth.store';

const HIDDEN_ROUTES = [
    '/login',
    '/register',
    '/verify-otp',
    '/forgot-password',
    '/reset-password',
    '/employer-login',
    '/employer-register',
    '/employer-complete-profile',
    '/nha-tuyen-dung',
];

const HIDDEN_SEO = ['/'];

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, hydrated, isAuthenticated } = useAuthStore();
    const [showOnboarding, setShowOnboarding] = useState(false);

    const isCvEditor = /^\/tao-cv\/[^/]+$/.test(pathname);
    const isEmployerDashboard = /^\/nha-tuyen-dung/.test(pathname);
    const isViewer = /^\/(xem-cv|xem-cover-letter|sua-cover-letter)\//.test(pathname);
    const isMeetingRoom = /^\/meet\//.test(pathname);
    const hideHeader = HIDDEN_ROUTES.includes(pathname) || isCvEditor || isEmployerDashboard || isViewer || isMeetingRoom;

    useEffect(() => {
        if (
            hydrated &&
            isAuthenticated &&
            user?.role === 'CANDIDATE' &&
            user?.candidateProfile &&
            user.candidateProfile.jobPreferences == null &&
            !HIDDEN_ROUTES.includes(pathname)
        ) {
            const timer = setTimeout(() => setShowOnboarding(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hydrated, isAuthenticated, user, pathname]);

    return (
        <>
            {!hideHeader && <Header />}
            <div style={!hideHeader ? { paddingTop: '72px' } : undefined}>
                {children}
                {!HIDDEN_SEO.includes(pathname) && !hideHeader && <SeoKeywords />}
                {!hideHeader && <Footer />}
            </div>
            {showOnboarding && <JobPreferencesModal onClose={() => setShowOnboarding(false)} />}
            {!isEmployerDashboard && !isCvEditor && !isViewer && !isMeetingRoom && <FloatingActions />}
        </>
    );
}
