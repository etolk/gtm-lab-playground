'use client';

import Link from 'next/link';

export default function Home() {
    return (
        <div className="page-container" style={{ textAlign: 'center' }}>
            <h1 style={{ marginTop: '2rem', fontSize: '2.5rem' }}>Welcome to Tracking Lab</h1>
            <p className="subtitle" style={{ margin: '0 auto 3rem auto', maxWidth: '600px', lineHeight: 1.8 }}>
                A custom Next.js Single Page Application built as a sandbox for testing and debugging dataLayer, Google Tag Manager and GA4 implementations.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', marginBottom: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem', textAlign: 'center', flex: '1 1 300px', maxWidth: '320px' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Simulated Shop</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '40px' }}>Test the full ecommerce funnel: lists, items, cart, and checkout.</p>
                    <Link href="/shop" className="button button-outline" style={{ display: 'block', width: '100%', textAlign: 'center' }}>Enter Shop</Link>
                </div>

                <div className="card" style={{ padding: '2rem', textAlign: 'center', flex: '1 1 300px', maxWidth: '320px' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Lead Generation</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '40px' }}>Test form start, field interactions, errors, and submissions.</p>
                    <Link href="/form" className="button button-outline" style={{ display: 'block', width: '100%', textAlign: 'center' }}>View Form</Link>
                </div>

                <div className="card" style={{ padding: '2rem', textAlign: 'center', flex: '1 1 300px', maxWidth: '320px' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2h13"></path>
                            <polyline points="19.5 2 19.5 22 6.5 22"></polyline>
                            <path d="M4 19.5a2.5 2.5 0 0 0 2.5 2.5h13"></path>
                        </svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Deep Article</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '40px' }}>Test IO scroll tracking and engaged reader timers.</p>
                    <Link href="/blog" className="button button-outline" style={{ display: 'block', width: '100%', textAlign: 'center' }}>Read More</Link>
                </div>

                <div className="card" style={{ padding: '2rem', textAlign: 'center', flex: '1 1 300px', maxWidth: '320px' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                            <line x1="7" y1="2" x2="7" y2="22"></line>
                            <line x1="17" y1="2" x2="17" y2="22"></line>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <line x1="2" y1="7" x2="7" y2="7"></line>
                            <line x1="2" y1="17" x2="7" y2="17"></line>
                            <line x1="17" y1="17" x2="22" y2="17"></line>
                            <line x1="17" y1="7" x2="22" y2="7"></line>
                        </svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Media Player</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '40px' }}>HTML5 wrapper bridging DOM video events to the dataLayer.</p>
                    <Link href="/media" className="button button-outline" style={{ display: 'block', width: '100%', textAlign: 'center' }}>Watch Demo</Link>
                </div>

                <div className="card" style={{ padding: '2rem', textAlign: 'center', flex: '1 1 300px', maxWidth: '320px' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--accent)', display: 'flex', justifyContent: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                    <h3 style={{ marginBottom: '0.5rem' }}>Broken Page</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', minHeight: '40px' }}>Trigger a simulated 404 page_not_found exception.</p>
                    <Link href="/this-is-a-404-test" prefetch={false} className="button button-outline" style={{ display: 'block', width: '100%', textAlign: 'center' }}>Break It</Link>
                </div>
            </div>
        </div>
    );
}
