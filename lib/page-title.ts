/**
 * Shared page title format for document <title> and dataLayer page_title.
 * All page titles use: "Tracking Lab | <Section>"
 */

export const TITLE_PREFIX = 'Tracking Lab | ';

export function pageTitle(suffix: string): string {
  return `${TITLE_PREFIX}${suffix}`;
}

/** Map pathname to a title suffix for dataLayer fallbacks (e.g. when document.title not yet set). */
export function pathnameToTitleSuffix(pathname: string): string {
  if (pathname === '/' || !pathname) return 'Home';
  if (pathname === '/shop') return 'Shop';
  if (pathname === '/blog') return 'Blog';
  if (pathname === '/media') return 'Media';
  if (pathname === '/form') return 'Form';
  if (pathname === '/checkout' || pathname.startsWith('/checkout/')) return 'Checkout';
  if (pathname.startsWith('/product/')) return 'Product';
  return 'Page Not Found';
}
