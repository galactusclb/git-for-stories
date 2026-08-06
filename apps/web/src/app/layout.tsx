import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Suspense } from 'react';

import Header from '@/components/shared/header/header';
import ProviderWrapper from '@/components/shared/providers/provider-wrapper';
import ServerDataProvider from '@/components/shared/providers/server-data-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Scaffold',
    description: 'A minimal blogging scaffold',
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
            >
                <Suspense>
                    <ProviderWrapper>
                        <ServerDataProvider>
                            <Header />
                            <main className="flex-1 overflow-auto">{children}</main>
                        </ServerDataProvider>
                    </ProviderWrapper>
                </Suspense>
                <Toaster />
            </body>
        </html>
    );
}
