// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  getDataLayer,
  pushToDataLayer,
  getSpaPreviousPath,
  setSpaPreviousPath,
  getMockUserId,
  pushPageView,
} from '@/lib/tracking';

type EventEntry = Record<string, unknown>;

beforeEach(() => {
  // Reset the dataLayer and any SPA / user state between tests.
  (window as unknown as { dataLayer?: unknown[] }).dataLayer = undefined;
  (window as unknown as { spaPreviousPath?: string }).spaPreviousPath = undefined;
  localStorage.clear();
});

describe('getDataLayer / pushToDataLayer', () => {
  it('initializes window.dataLayer as an array', () => {
    const dl = getDataLayer();
    expect(Array.isArray(dl)).toBe(true);
    expect(dl).toBe(window.dataLayer);
  });

  it('pushes entries onto the dataLayer', () => {
    pushToDataLayer({ event: 'unit_test' });
    expect(window.dataLayer).toHaveLength(1);
    expect((window.dataLayer[0] as EventEntry).event).toBe('unit_test');
  });

  it('supports gtag-style argument arrays', () => {
    pushToDataLayer(['consent', 'update', { analytics_storage: 'granted' }]);
    expect(window.dataLayer[0]).toEqual([
      'consent',
      'update',
      { analytics_storage: 'granted' },
    ]);
  });
});

describe('spaPreviousPath', () => {
  it('is undefined initially and round-trips through set/get', () => {
    expect(getSpaPreviousPath()).toBeUndefined();
    setSpaPreviousPath('/shop');
    expect(getSpaPreviousPath()).toBe('/shop');
  });
});

describe('getMockUserId', () => {
  it('returns null when not set', () => {
    expect(getMockUserId()).toBeNull();
  });

  it('returns the stored mock_user_id', () => {
    localStorage.setItem('mock_user_id', '12345');
    expect(getMockUserId()).toBe('12345');
  });
});

describe('pushPageView', () => {
  it('builds a minimal vl_page_view payload', () => {
    pushPageView({
      pagePath: '/',
      pageLocation: 'https://example.com/',
      pageTitle: 'Home',
    });
    const entry = window.dataLayer[0] as EventEntry;
    expect(entry).toEqual({
      event: 'vl_page_view',
      page_location: 'https://example.com/',
      page_path: '/',
      page_title: 'Home',
    });
  });

  it('includes page_referrer and user when provided', () => {
    pushPageView({
      pagePath: '/shop',
      pageLocation: 'https://example.com/shop',
      pageTitle: 'Shop',
      pageReferrer: 'https://example.com/',
      userId: '999',
    });
    const entry = window.dataLayer[0] as EventEntry;
    expect(entry.page_referrer).toBe('https://example.com/');
    expect(entry.user).toEqual({ user_id: '999' });
  });

  it('omits page_referrer and user when falsy', () => {
    pushPageView({
      pagePath: '/shop',
      pageLocation: 'https://example.com/shop',
      pageTitle: 'Shop',
      pageReferrer: '',
      userId: null,
    });
    const entry = window.dataLayer[0] as EventEntry;
    expect(entry).not.toHaveProperty('page_referrer');
    expect(entry).not.toHaveProperty('user');
  });

  it('merges extra fields into the payload (e.g. 404 error context)', () => {
    pushPageView({
      pagePath: '/missing',
      pageLocation: 'https://example.com/missing',
      pageTitle: 'Tracking Lab | Page Not Found',
      extra: { error_path: '/missing', error_url: 'https://example.com/missing' },
    });
    const entry = window.dataLayer[0] as EventEntry;
    expect(entry.event).toBe('vl_page_view');
    expect(entry.error_path).toBe('/missing');
    expect(entry.error_url).toBe('https://example.com/missing');
  });

  it('updates spaPreviousPath only when requested', () => {
    pushPageView({
      pagePath: '/blog',
      pageLocation: 'https://example.com/blog',
      pageTitle: 'Blog',
    });
    expect(getSpaPreviousPath()).toBeUndefined();

    pushPageView({
      pagePath: '/media',
      pageLocation: 'https://example.com/media',
      pageTitle: 'Media',
      updatePreviousPath: true,
    });
    expect(getSpaPreviousPath()).toBe('/media');
  });
});
