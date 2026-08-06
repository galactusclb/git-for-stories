import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export default function PostNotFound() {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
            <h1 className="text-3xl font-bold">Post not found</h1>
            <p className="text-muted-foreground">This post may have been removed or made private.</p>
            <Button asChild variant="outline">
                <Link href={ROUTES.home}>Back to posts</Link>
            </Button>
        </div>
    );
}
