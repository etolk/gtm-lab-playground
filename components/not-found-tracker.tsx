'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { pageTitle } from '@/lib/page-title';
import { getSpaPreviousPath, pushPageView } from '@/lib/tracking';

/** Fires a single 404 vl_page_view (with error context). Render once inside the not-found page. */
export default function NotFoundTracker() {
    const pathname = usePathname();
    const errorTracked = useRef(false);

    useEffect(() => {
        if (errorTracked.current) return;
        errorTracked.current = true;
        const currentPath = pathname + (window.location.search || '');
        const previousPath = getSpaPreviousPath();
        let pageReferrer = '';
        if (previousPath) {
            pageReferrer = window.location.origin + previousPath;
        } else {
            const navEntry = window.performance?.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
            const isReload = navEntry?.type === 'reload';
            if (!isReload && document.referrer) {
                pageReferrer = document.referrer;
            }
        }

        pushPageView({
            pagePath: currentPath,
            pageLocation: window.location.href,
            pageTitle: pageTitle('Page Not Found'),
            pageReferrer,
            updatePreviousPath: true,
            extra: {
                error_url: window.location.href,
                error_path: pathname,
            },
        });
    }, [pathname]);

    return null;
}
