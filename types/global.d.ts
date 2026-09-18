export {};

/**
 * Common dataLayer event payloads for type hints.
 * Push calls still accept any compatible object; this improves autocomplete and catch typos.
 */
declare global {
  interface Window {
    /** GTM / GA4 dataLayer. Entries are event objects or gtag argument arrays. */
    dataLayer: DataLayerEntry[];
    /** Set by GTMProvider / Checkout for virtual page_view referrer chain */
    spaPreviousPath: string | undefined;
    /** gtag shim installed in the consent-defaults inline script (app/layout.tsx) */
    gtag?: (...args: unknown[]) => void;
  }
}

/** Event payloads we push from the app (e.g. { event, ... } or { ecommerce: null }; gtag uses arrays) */
export type DataLayerEntry = { [key: string]: unknown } | unknown[];
