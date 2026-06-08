// app/components/layout/LayoutContent.tsx

'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import SeoKeywords from '@/app/components/SeoKeywords';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const hiddenRoutes = [
        '/login',
        '/register',
        '/verify-otp',
        '/forgot-password',
        '/reset-password',
        '/employer-login',
        '/employer-register',
        '/employer-complete-profile',
    ];

    const hiddenRoutesSeo = ['/'];

    const hideHeader = hiddenRoutes.includes(pathname);

    return (
        <>
            {!hideHeader && <Header />}
            {children}
            {!hiddenRoutesSeo.includes(pathname) && <SeoKeywords />}
            {!hideHeader && <Footer />}
        </>
    );
}
