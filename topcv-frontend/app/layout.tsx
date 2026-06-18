import type { Metadata, Viewport } from 'next';
import { Be_Vietnam_Pro, Mulish, Roboto, Open_Sans, Source_Code_Pro } from 'next/font/google';
import './globals.css';

import { Toaster } from 'sonner';
import AuthProvider from '@/app/components/providers/AuthProvider';
import LayoutContent from '@/app/components/layout/LayoutContent';

const beVietnamPro = Be_Vietnam_Pro({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin', 'vietnamese'],
    variable: '--font-be-vietnam',
    display: 'swap',
});

const mulish = Mulish({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ['latin', 'vietnamese'],
    variable: '--font-mulish',
    display: 'swap',
});

const roboto = Roboto({
    weight: ['400', '500', '700'],
    subsets: ['latin', 'vietnamese'],
    variable: '--font-roboto',
    display: 'swap',
});

const openSans = Open_Sans({
    weight: ['400', '600', '700'],
    subsets: ['latin', 'vietnamese'],
    variable: '--font-open-sans',
    display: 'swap',
});

const sourceCodePro = Source_Code_Pro({
    weight: ['400', '500', '700'],
    subsets: ['latin'],
    variable: '--font-source-code-pro',
    display: 'swap',
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};

export const metadata: Metadata = {
    title: 'TopCV Clone - Tìm việc làm nhanh, việc làm tốt',
    description: 'Nền tảng tuyển dụng và tìm việc làm hàng đầu Việt Nam. Kết nối nhà tuyển dụng và ứng viên tiềm năng.',
    keywords: ['tìm việc làm', 'tuyển dụng', 'việc làm', 'nhân sự', 'ứng tuyển'],
    icons: {
        icon: '/favo-icons.png',
        shortcut: '/favo-icons.png',
        apple: '/favo-icons.png',
    },
    openGraph: {
        title: 'TopCV Clone - Tìm việc làm nhanh, việc làm tốt',
        description: 'Nền tảng tuyển dụng và tìm việc làm hàng đầu Việt Nam.',
        images: ['/favo-icons.png'],
        locale: 'vi_VN',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" className={`${beVietnamPro.variable} ${mulish.variable} ${roboto.variable} ${openSans.variable} ${sourceCodePro.variable}`}>
            <body style={{ fontFamily: "var(--font-be-vietnam), 'Be Vietnam Pro', sans-serif" }}>
                <AuthProvider>
                    <LayoutContent>{children}</LayoutContent>
                </AuthProvider>
                <Toaster position="top-right" duration={2000} richColors />
            </body>
        </html>
    );
}
