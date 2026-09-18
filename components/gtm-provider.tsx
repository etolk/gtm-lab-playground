'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { pageTitle, pathnameToTitleSuffix } from '@/lib/page-title';
import { getMockUserId, pushPageView } from '@/lib/tracking';
import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * GTM container id (required to load GTM at all) and an optional server-side
 * tagging (Google Tag Gateway) path. When NEXT_PUBLIC_GTM_SST_PATH is unset,
 * GTM loads directly from googletagmanager.com — no extra infra needed.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GTM_SST_PATH = process.env.NEXT_PUBLIC_GTM_SST_PATH;

/** Routes that have a matching page; 404 = path not in this set. */
const KNOWN_ROUTES = ['/', '/shop', '/checkout', '/blog', '/media', '/form'];
function isKnownRoute(pathname: string): boolean {
    return KNOWN_ROUTES.includes(pathname) || pathname.startsWith('/product/');
}
/** Skip pushing page view here; these routes (or 404) push their own so event order is controlled. */
function shouldSkipPageView(pathname: string): boolean {
    return pathname === '/checkout' || pathname === '/shop' || pathname.startsWith('/product/') || !isKnownRoute(pathname);
}

export default function GTMProvider() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lastPathRef = useRef<string>('');
    const initializedRef = useRef<boolean>(false);

    // 1. Initialize GTM Script once; push gtm.js then initial page view so vl_page_view is the first custom event
    useEffect(() => {
        if (typeof window !== 'undefined' && !initializedRef.current) {
            initializedRef.current = true;

            const w = window;
            const d = document;
            const l = 'dataLayer';

            w[l] = w[l] || [];
            w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

            // First custom event: initial page view (after consent/gtm.js, before any other component pushes)
            // Skip /checkout (handled there), /shop and 404 (those pages push their own to control order)
            const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
            if (pathname && !shouldSkipPageView(pathname)) {
                const navEntry = w.performance?.getEntriesByType?.('navigation')[0] as PerformanceNavigationTiming | undefined;
                const isReload = navEntry?.type === 'reload';
                const pageReferrer = document.referrer && !isReload ? document.referrer : '';
                pushPageView({
                    pagePath: currentPath,
                    pageLocation: w.location.href,
                    pageTitle: document.title || pageTitle(pathnameToTitleSuffix(pathname)),
                    pageReferrer,
                    userId: getMockUserId(),
                    updatePreviousPath: true,
                });
            }

            // No container configured: dataLayer pushes above still work and remain
            // inspectable in the DataLayer Viewer, but there's no GTM to load.
            if (GTM_ID) {
                const f = d.getElementsByTagName('script')[0];
                const j = d.createElement('script');
                const dl = l !== 'dataLayer' ? '&l=' + l : '';
                j.async = true;
                j.src = GTM_SST_PATH
                    ? `${GTM_SST_PATH}?id=${GTM_ID}${dl}`
                    : `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}${dl}`;
                f.parentNode?.insertBefore(j, f);
            } else if (process.env.NODE_ENV !== 'production') {
                console.warn('[gtm-provider] NEXT_PUBLIC_GTM_ID is not set — GTM will not load. Set it in .env.local.');
            }
        }
    }, [pathname, searchParams]);

    // 2. Track route changes (virtual_pageview); useLayoutEffect so this runs before other components' effects
    useLayoutEffect(() => {
        if (typeof window !== 'undefined' && pathname) {
            const currentPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

            if (lastPathRef.current !== currentPath) {
                const isInitialLoad = lastPathRef.current === '';
                // Determine the most accurate previous path: first check if a custom component (like Checkout) 
                // explicitly set a granular exit path in the global variable, otherwise fall back to the standard route history.
                const previousPath = window.spaPreviousPath || lastPathRef.current;

                lastPathRef.current = currentPath;
                const userId = getMockUserId();

                let pageReferrer = '';
                if (previousPath) {
                    pageReferrer = window.location.origin + previousPath;
                } else {
                    const navEntry = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                    const isReload = navEntry?.type === 'reload';
                    if (!isReload) {
                        pageReferrer = document.referrer;
                    }
                }

                // Skip /checkout (handled there), /shop and 404 (those pages push their own to control order).
                if (!shouldSkipPageView(pathname)) {
                    window.spaPreviousPath = currentPath;
                    if (!isInitialLoad) {
                        pushPageView({
                            pagePath: currentPath,
                            pageLocation: window.location.href,
                            pageTitle: document.title || pageTitle(pathnameToTitleSuffix(pathname)),
                            pageReferrer,
                            userId,
                        });
                    }
                }
                // When skipping: /checkout we don't set spaPreviousPath so referrer stays correct; /shop and 404 set it when they push
            }
        }
    }, [pathname, searchParams]);

    return null;
}
