'use client';

import { RscBoundaryProvider } from '@rsc-boundary/next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode, useState } from 'react';

import AuthProvider from './auth-provider';

export default function ProviderWrapper({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000,
                        retry: 1,
                    },
                },
            })
    );

    return (
        <RscBoundaryProvider>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>{children}</AuthProvider>
                <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
        </RscBoundaryProvider>
    );
}
