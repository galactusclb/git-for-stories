'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';
import { authQueries } from '@/features/auth';
import { logoutResponseSchema } from '@/models/user.schema';
import { useAuthStore } from '@/store/auth.store';
import { apiPost } from '@/utils/api/api-client';

export default function Header() {
    const { user, isLoading, clearUser } = useAuthStore();
    const queryClient = useQueryClient();

    async function handleLogout() {
        await apiPost('/auth/logout', {}, logoutResponseSchema);
        queryClient.removeQueries({ queryKey: authQueries.me.key() });
        clearUser();
    }

    return (
        <header className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
            <div className="mx-auto h-16 flex max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link href={ROUTES.home} className="text-2xl font-black tracking-tight">
                    Scaffold
                </Link>

                <nav className="flex items-center gap-3">
                    {isLoading ? (
                        <div className="size-9 animate-pulse rounded-full bg-muted" />
                    ) : user ? (
                        <>
                            <Button asChild variant="outline">
                                <Link href={ROUTES.dashboard}>Dashboard</Link>
                            </Button>
                            <Button asChild>
                                <Link href={ROUTES.create}>New Post</Link>
                            </Button>
                            <button
                                type="button"
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Button asChild>
                            <Link href={ROUTES.login}>Login</Link>
                        </Button>
                    )}
                </nav>
            </div>
        </header>
    );
}
