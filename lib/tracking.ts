import type { DataLayerEntry } from '@/types/global';

function getBrowserWindow(): (Window & { dataLayer?: DataLayerEntry[]; spaPreviousPath?: string }) | null {
  if (typeof window === 'undefined') return null;
  return window;
}

export function getDataLayer(): DataLayerEntry[] {
  const w = getBrowserWindow();
  if (!w) return [];
  if (!Array.isArray(w.dataLayer)) {
    w.dataLayer = [];
  }
  return w.dataLayer;
}

export function pushToDataLayer(entry: DataLayerEntry): void {
  getDataLayer().push(entry);
}

export function getSpaPreviousPath(): string | undefined {
  const w = getBrowserWindow();
  return w?.spaPreviousPath;
}

export function setSpaPreviousPath(path: string): void {
  const w = getBrowserWindow();
  if (w) {
    w.spaPreviousPath = path;
  }
}

/** Read the mock user id from localStorage, swallowing access errors (e.g. SSR, blocked storage). */
export function getMockUserId(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('mock_user_id');
  } catch {
    return null;
  }
}

export interface PageViewOptions {
  /** Virtual path for this view (e.g. "/shop", "/checkout/payment"). */
  pagePath: string;
  /** Full page_location URL. */
  pageLocation: string;
  /** Resolved document/page title. */
  pageTitle: string;
  /** Optional referrer URL; omitted from payload when falsy. */
  pageReferrer?: string;
  /** Optional user id; wrapped as { user: { user_id } } when present. */
  userId?: string | null;
  /** When true, also records pagePath as the SPA previous path for the next referrer. */
  updatePreviousPath?: boolean;
  /** Optional extra fields merged into the payload (e.g. error_url/error_path on 404). */
  extra?: Record<string, unknown>;
}

/** Push a standardized `vl_page_view` event, keeping payload shape consistent across routes. */
export function pushPageView(opts: PageViewOptions): void {
  const payload: Record<string, unknown> = {
    event: 'vl_page_view',
    page_location: opts.pageLocation,
    page_path: opts.pagePath,
    page_title: opts.pageTitle,
  };
  if (opts.pageReferrer) payload.page_referrer = opts.pageReferrer;
  if (opts.userId) payload.user = { user_id: opts.userId };
  if (opts.extra) Object.assign(payload, opts.extra);

  pushToDataLayer(payload);

  if (opts.updatePreviousPath) {
    setSpaPreviousPath(opts.pagePath);
  }
}
