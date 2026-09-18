'use client';

import { useState, useEffect, useCallback } from 'react';
import { pushToDataLayer } from '@/lib/tracking';

type ConsentState = 'granted' | 'denied';

interface ConsentChoice {
    analytics_storage: ConsentState;
    ad_storage: ConsentState;
    ad_user_data: ConsentState;
    ad_personalization: ConsentState;
}

const CONSENT_KEY = 'consent_mode';

/** Push consent command so GTM/gtag process it (use window.gtag from layout when available so arguments object is pushed). */
function pushConsentUpdate(consent: ConsentChoice) {
    if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', consent);
    } else {
        pushToDataLayer(['consent', 'update', consent]);
    }
}

export function getStoredConsent(): ConsentChoice | null {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }
    return null;
}

export default function ConsentBanner() {
    const [visible, setVisible] = useState(false);

    const showBanner = useCallback(() => {
        setVisible(true);
    }, []);

    useEffect(() => {
        // Show banner automatically if no consent stored
        const stored = getStoredConsent();
        let timer: number | undefined;

        if (!stored) {
            timer = window.setTimeout(() => setVisible(true), 500);
        }

        // Always listen for manual re-open events (from footer link),
        // regardless of whether consent was previously stored.
        const handleOpen = () => showBanner();
        window.addEventListener('open-consent-banner', handleOpen);

        return () => {
            if (timer) {
                window.clearTimeout(timer);
            }
            window.removeEventListener('open-consent-banner', handleOpen);
        };
    }, [showBanner]);

    const handleConsent = (granted: boolean) => {
        const state: ConsentState = granted ? 'granted' : 'denied';
        const consent: ConsentChoice = {
            analytics_storage: state,
            ad_storage: state,
            ad_user_data: state,
            ad_personalization: state
        };

        // Push the consent update so GTM/Google tags apply it (use window.gtag so GCS is set correctly)
        pushConsentUpdate(consent);

        // Persist the choice
        localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

        // Also push a custom event so GTM can react
        pushToDataLayer({
            event: 'consent_update',
            consent_action: granted ? 'accept_all' : 'deny_all'
        });

        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="consent-banner" role="dialog" aria-label="Cookie consent">
            <div className="consent-banner-content">
                <div className="consent-banner-text">
                    <h3 className="consent-banner-title">Cookie Preferences</h3>
                    <p className="consent-banner-description">
                        We use cookies and similar technologies for analytics and tracking.
                        You can accept all or deny non-essential cookies.
                    </p>
                </div>
                <div className="consent-banner-actions">
                    <button
                        className="button button-outline consent-btn"
                        onClick={() => handleConsent(false)}
                    >
                        Deny All
                    </button>
                    <button
                        className="button consent-btn"
                        onClick={() => handleConsent(true)}
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
