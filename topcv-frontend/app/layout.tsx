import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

import AuthProvider from '@/app/components/providers/AuthProvider';
import LayoutContent from '@/app/components/layout/LayoutContent';

const beVietnamPro = Be_Vietnam_Pro({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin', 'vietnamese'],
    variable: '--font-be-vietnam',
    display: 'swap',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'TopCV - Tìm việc làm nhanh, việc làm tốt',
    description: 'Nền tảng tuyển dụng và tìm việc làm hàng đầu Việt Nam',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" className={beVietnamPro.variable}>
            <body style={{ fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', sans-serif" }}>
                <AuthProvider>
                    <LayoutContent>{children}</LayoutContent>
                </AuthProvider>
            </body>
        </html>
    );
}
