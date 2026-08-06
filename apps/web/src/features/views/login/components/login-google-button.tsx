import { AUTH } from '@/utils/constants/auth';
import { constants } from '@/utils/constants/env/client';

import { loginSearchParamsSchema, type LoginSearchParams } from '../schemas/login.schema';

export default async function LoginGoogleButton({
    searchParams,
}: {
    searchParams: Promise<LoginSearchParams>;
}) {
    const result = loginSearchParamsSchema.safeParse(await searchParams);
    const returnTo = result.success ? result.data.returnTo : '/';
    const googleStartUrl = `${constants.API.URL}/auth/google/start?${AUTH.QUERY_PARAMS.RETURN_TO}=${encodeURIComponent(returnTo)}`;

    return (
        <a
            href={googleStartUrl}
            className="inline-flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
            Continue with Google
        </a>
    );
}
