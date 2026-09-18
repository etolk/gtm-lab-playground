'use client';

import Link from 'next/link';

export default function Footer() {
    const handleManageCookies = (e: React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(new Event('open-consent-banner'));
    };

    const handleOpenDataLayer = (e: React.MouseEvent) => {
        e.preventDefault();
        window.dispatchEvent(new Event('open-datalayer-viewer'));
    };

    return (
        <footer className="site-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <p className="footer-brand">Tracking Lab</p>
                    <p className="footer-tagline">A GA4 sandbox for analytics engineers</p>
                </div>
                <div className="footer-center">
                    <div className="footer-links">
                        <Link href="/">Home</Link>
                        <Link href="/shop">Shop</Link>
                        <Link href="/blog">Blog</Link>
                        <Link href="/media">Media</Link>
                        <Link href="/form">Form</Link>
                        <Link href="/this-is-a-404-test" prefetch={false}>404</Link>
                    </div>
                    <div className="footer-actions">
                        <button type="button" onClick={handleManageCookies} className="footer-manage-cookies">Manage Cookies</button>
                        <button type="button" onClick={handleOpenDataLayer} className="footer-manage-cookies">DataLayer Viewer</button>
                    </div>
                </div>
                <div className="footer-right">
                    <p className="footer-copy">&copy; {new Date().getFullYear()} Tracking Lab. Analytics Playground.</p>
                </div>
            </div>
        </footer>
    );
}
