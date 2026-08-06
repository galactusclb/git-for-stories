'use client';

import { AlertCircle } from 'lucide-react';
import { ErrorInfo, unstable_catchError } from 'next/error';

import { Button } from '@/components/ui/button';

function DefaultErrorFallback(_props: object, { error: _error, unstable_retry }: ErrorInfo) {
    return (
        <div
            role="alert"
            className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-muted/60 py-16 text-center"
        >
            <AlertCircle className="size-12 text-destructive" aria-hidden="true" />
            <div className="space-y-1.5">
                <p className="text-base font-semibold text-foreground">This section could not load</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Give it another try, or reload the page if it keeps happening.
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" onClick={unstable_retry}>
                    Try again
                </Button>
                <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline transition-colors"
                    onClick={() => window.location.reload()}
                >
                    Reload page
                </button>
            </div>
        </div>
    );
}

export default unstable_catchError(DefaultErrorFallback);
