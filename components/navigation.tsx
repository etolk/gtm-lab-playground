'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/components/theme-provider';
import { pushToDataLayer } from '@/lib/tracking';

const SCROLL_TOP_THRESHOLD = 24;
const DESKTOP_BREAKPOINT = 901;

export default function Navigation() {
    const { theme, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
    const pathname = usePathname();

    /* At top: standard bar; when scrolled: floating pill (desktop only) */
    useEffect(() => {
        const handleScroll = () => {
            if (typeof window === 'undefined' || window.innerWidth < DESKTOP_BREAKPOINT) return;
            setIsAtTop(window.scrollY < SCROLL_TOP_THRESHOLD);
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Hydrate auth state from localStorage on client (deferred to avoid synchronous setState in effect)
        const savedUserId = localStorage.getItem('mock_user_id');
        if (savedUserId) {
            const id = requestAnimationFrame(() => setIsLoggedIn(true));
            return () => cancelAnimationFrame(id);
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        pushToDataLayer({
            event: 'search',
            search_term: searchQuery
        });
        setSearchQuery('');
    };

    const handleNavClick = (linkName: string) => {
        setIsMobileMenuOpen(false); // Close menu on navigation
        pushToDataLayer({
            event: 'navigation_click',
            link_name: linkName
        });
    };

    const handleAuth = () => {
        if (isLoggedIn) {
            localStorage.removeItem('mock_user_id');
            pushToDataLayer({
                event: 'logout',
                user: { user_id: null }
            });
            setIsLoggedIn(false);
        } else {
            const mockUserId = Math.floor(Math.random() * 100000).toString();
            localStorage.setItem('mock_user_id', mockUserId);
            pushToDataLayer({
                event: 'login',
                method: 'Mock Auth',
                user: {
                    user_id: mockUserId
                }
            });
            setIsLoggedIn(true);
        }
    };

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        pushToDataLayer({
            event: 'ui_interaction',
            interaction_type: 'theme_toggle',
            interaction_detail: newTheme
        });
        toggleTheme();
    };

    const handleMobileMenuToggle = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);
        pushToDataLayer({
            event: 'ui_interaction',
            interaction_type: 'mobile_menu_toggle',
            interaction_detail: newState ? 'open' : 'close'
        });
    };

    return (
        <nav className={`global-nav${!isAtTop ? ' nav-floating' : ''}`}>
            <div className="nav-container">
                <Link href="/" className="nav-logo" onClick={() => handleNavClick('Logo')}>
                    <span><span style={{ color: 'var(--accent)' }}>Tracking</span> Lab</span>
                </Link>

                <button
                    className="mobile-menu-btn"
                    onClick={handleMobileMenuToggle}
                    aria-label="Toggle navigation menu"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {isMobileMenuOpen ? (
                            <>
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </>
                        ) : (
                            <>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </>
                        )}
                    </svg>
                </button>

                <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} style={{ alignItems: 'center', gap: '1rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex' }}>
                        <input
                            id="nav-search"
                            type="text"
                            placeholder="Search..."
                            name="search"
                            autoComplete="off"
                            aria-label="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '4px',
                                background: 'transparent',
                                color: 'var(--foreground)',
                                fontSize: '0.875rem',
                                width: '150px'
                            }}
                        />
                    </form>
                    <Link href="/" onClick={() => handleNavClick('Home')} className={pathname === '/' ? 'nav-active' : ''}>Home</Link>
                    <Link href="/shop" onClick={() => handleNavClick('Shop')} className={pathname === '/shop' ? 'nav-active' : ''}>Shop</Link>
                    <Link href="/form" onClick={() => handleNavClick('Form')} className={pathname === '/form' ? 'nav-active' : ''}>Form</Link>
                    <Link href="/blog" onClick={() => handleNavClick('Blog')} className={pathname === '/blog' ? 'nav-active' : ''}>Blog</Link>
                    <Link href="/media" onClick={() => handleNavClick('Media')} className={pathname === '/media' ? 'nav-active' : ''}>Media</Link>
                    <Link href="/this-is-a-404-test" prefetch={false} onClick={() => handleNavClick('404 Error')} className={pathname === '/this-is-a-404-test' ? 'nav-active' : ''}>404</Link>
                    <button type="button" onClick={handleAuth} className="nav-auth-btn">
                        {isLoggedIn ? 'Logout' : 'Login'}
                    </button>
                    <button
                        type="button"
                        onClick={handleThemeToggle}
                        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                        className="nav-theme-btn"
                    >
                        {theme === 'light' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </nav>
    );
}
