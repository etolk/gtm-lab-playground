import type { Metadata } from 'next';
import Link from 'next/link';
import NotFoundTracker from '@/components/not-found-tracker';

export const metadata: Metadata = {
    title: 'Tracking Lab | Page Not Found',
};

export default function ErrorPage() {
    return (
        <div className="page-container" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '60vh' }}>
            <NotFoundTracker />
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '2rem', width: '100%' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s', padding: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Home
                </Link>
            </div>
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
            </div>

            <h1 style={{ fontSize: '4rem', marginBottom: '0.5rem', lineHeight: 1 }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 500 }}>Page Not Found</h2>

            <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.125rem', lineHeight: 1.8 }}>
                The URL you requested does not exist. We&apos;ve fired a <code>vl_page_view</code> event (with <code>error_path</code>) to the dataLayer to log this broken link!
            </p>

            <div>
                <Link href="/" className="button">
                    Return to Home
                </Link>
            </div>
        </div>
    );
}
