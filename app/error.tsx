'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { pushToDataLayer } from '@/lib/tracking';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        const payload: Record<string, unknown> = {
            event: 'exception',
            description: error?.message || 'Unknown error',
            fatal: true,
        };
        if (error?.digest) payload.error_digest = error.digest;
        pushToDataLayer(payload);
    }, [error]);

    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '60vh' }}>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', lineHeight: 1 }}>Something went wrong</h1>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>An unexpected error occurred</h2>

            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.125rem', lineHeight: 1.8 }}>
                We&apos;ve fired an <code>exception</code> event to the dataLayer so this error can be tracked in GA4.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="button" onClick={() => reset()}>
                    Try Again
                </button>
                <Link href="/" className="button button-outline">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
