'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { PROTECTED_ROUTES, ROUTES } from '@/config/routes';
import { authQueries } from '@/features/auth';
import { meFullResponseSchema } from '@/models/user.schema';
import { useAuthStore } from '@/store/auth.store';
import { apiGet } from '@/utils/api/api-client';

export default function AuthProvider({ children }: { children: ReactNode }) {
    const { setUser, clearUser, setLoading } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: authQueries.me.key(),
        queryFn: async () => {
            const res = await apiGet(authQueries.me.endpoint, meFullResponseSchema);
            if (!res.success) throw new Error('Unauthenticated');
            return res.data;
        },
        retry: false,
    });

    useEffect(() => {
        setLoading(isLoading);
        if (!isLoading) {
            if (data) {
                setUser(data);
            } else {
                clearUser();
                const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
                if (isProtected) {
                    router.replace(`${ROUTES.login}?returnTo=${pathname}`);
                }
            }
        }
    }, [isLoading, data, setUser, clearUser, setLoading, pathname, router]);

    return <>{children}</>;
}
