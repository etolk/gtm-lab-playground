'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { pushToDataLayer } from '@/lib/tracking';

export default function BlogPage() {
    const articleRef = useRef<HTMLDivElement>(null);
    const scrolledMilestones = useRef(new Set<number>());

    useEffect(() => {
        const calculateScrollDepth = () => {
            if (!articleRef.current) return;

            // Measure relative to the article container itself, not the whole window
            const rect = articleRef.current.getBoundingClientRect();
            const elementTop = rect.top;
            const elementHeight = rect.height;
            const windowHeight = window.innerHeight;

            // How much of the element has scrolled past the top of the viewport
            const scrolledPixels = (elementTop * -1) + windowHeight;
            let percentage = (scrolledPixels / elementHeight) * 100;

            // Clamp between 0 and 100
            percentage = Math.max(0, Math.min(100, Math.round(percentage)));

            const milestones = [25, 50, 75, 100];

            milestones.forEach((milestone) => {
                if (percentage >= milestone && !scrolledMilestones.current.has(milestone)) {
                    scrolledMilestones.current.add(milestone);

                    pushToDataLayer({
                        event: 'scroll',
                        percent_scrolled: milestone,
                        page_type: 'Article'
                    });
                }
            });
        };

        window.addEventListener('scroll', calculateScrollDepth);
        // Fire once on load to catch short screens
        calculateScrollDepth();

        return () => window.removeEventListener('scroll', calculateScrollDepth);
    }, []);

    // Also track reading time (Time on Page > 30s)
    useEffect(() => {
        const timer = setTimeout(() => {
            pushToDataLayer({
                event: 'engaged_reader',
                time_on_page: '30s+'
            });
        }, 30000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '2rem' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s', padding: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Home
                </Link>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h1 style={{ marginBottom: '1rem' }}>Deep Article Engagement</h1>
                <p className="subtitle" style={{ margin: '0 auto', maxWidth: '600px', lineHeight: 1.8 }}>
                    This page simulates a long-form content reading experience. Scroll down to trigger <code>scroll</code> events at 25%, 50%, 75%, and 100% depth. Stay on the page for more than 30 seconds to fire an <code>engaged_reader</code> event.
                </p>
            </div>

            <article ref={articleRef} style={{ backgroundColor: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.2, marginTop: 0 }}>The Evolution of Client-Side Tagging in 2026</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.25rem' }}>Understanding the shift from traditional DOM scraping to robust, declarative DataLayer architectures.</p>

                {/* Dummy Content Blocks to force scrolling */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.125rem', lineHeight: 1.8, color: 'var(--foreground)' }}>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

                    <div style={{ padding: '2rem', backgroundColor: 'var(--surface)', borderLeft: '4px solid var(--accent)', margin: '2rem 0' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Key Takeaway</h3>
                        <p style={{ margin: 0 }}>Relying on CSS selectors for GA4 events is notoriously brittle. A minor UI update can shatter your entire attribution funnel. The modern approach necessitates a dedicated dataLayer contract between engineering and marketing.</p>
                    </div>

                    <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>

                    <h2 style={{ marginTop: '2rem' }}>The Server-Side Paradigm Shift</h2>
                    <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?</p>

                    <div style={{ margin: '3rem 0', display: 'flex', justifyContent: 'center' }}>
                        <Image
                            src="/images/datalayer_light.webp"
                            alt="Clean Declarative DataLayer Architecture (Light)"
                            width={1280}
                            height={1280}
                            className="theme-light-only"
                            style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
                            sizes="(max-width: 640px) 100vw, 640px"
                        />
                        <Image
                            src="/images/datalayer_dark.webp"
                            alt="Clean Declarative DataLayer Architecture (Dark)"
                            width={1536}
                            height={1536}
                            className="theme-dark-only"
                            style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
                            sizes="(max-width: 768px) 100vw, 768px"
                        />
                    </div>

                    <p>Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur? At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
                    <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.</p>

                    <h2 style={{ marginTop: '2rem' }}>Implementing the Observer Pattern</h2>
                    <p>Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.</p>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                </div>
            </article>

        </div>
    );
}
