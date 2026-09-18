'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface DataLayerEntry {
    event?: string;
    timestamp: string;
    data: Record<string, unknown>;
    id: number;
}

let entryCounter = 0;

export default function DataLayerViewer() {
    const [entries, setEntries] = useState<DataLayerEntry[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isClosed, setIsClosed] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [size, setSize] = useState({ width: 380, height: 420 });

    // Position in bottom-right corner, updated on mount
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const positionInitialized = useRef(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const logRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const isResizing = useRef(false);
    const dragOffset = useRef({ x: 0, y: 0 });

    // Intercept dataLayer.push without breaking GTM
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Position in bottom-right on first render
        if (!positionInitialized.current) {
            positionInitialized.current = true;
            setPosition({
                x: window.innerWidth - 260,
                y: 80
            });
        }

        window.dataLayer = window.dataLayer || [];

        // Capture any entries already in the dataLayer (including consent signals)
        const existingEntries: DataLayerEntry[] = [];
        window.dataLayer.forEach((item: unknown) => {
            if (typeof item !== 'object' || item === null) return;
            const isArguments = Object.prototype.toString.call(item) === '[object Arguments]';
            if (isArguments) {
                const argsArray = Array.from(item as ArrayLike<unknown>);
                if (argsArray[0] === 'consent' && (argsArray[1] === 'default' || argsArray[1] === 'update')) {
                    const consentData = argsArray[2] as Record<string, unknown>;
                    existingEntries.push({
                        event: `consent:${argsArray[1]}`,
                        timestamp: new Date().toLocaleTimeString(),
                        data: { command: argsArray[0], action: argsArray[1], ...consentData },
                        id: entryCounter++
                    });
                }
            } else {
                const entry = item as Record<string, unknown>;
                if (entry.event) {
                    existingEntries.push({
                        event: entry.event as string,
                        timestamp: new Date().toLocaleTimeString(),
                        data: { ...entry },
                        id: entryCounter++
                    });
                }
            }
        });
        if (existingEntries.length > 0) {
            setEntries(existingEntries);
        }

        // Store the original push method
        const originalPush = window.dataLayer.push.bind(window.dataLayer);

        // Override push to also capture entries
        window.dataLayer.push = function (...args: Record<string, unknown>[]) {
            // Call the original push first — never break GTM
            const result = originalPush(...args);

            // Capture each pushed item
            args.forEach((item) => {
                if (typeof item === 'object' && item !== null) {
                    const isArguments = Object.prototype.toString.call(item) === '[object Arguments]';

                    // Capture consent mode signals from gtag Arguments objects
                    if (isArguments) {
                        const argsArray = Array.from(item as unknown as ArrayLike<unknown>);
                        if (argsArray[0] === 'consent' && (argsArray[1] === 'default' || argsArray[1] === 'update')) {
                            const consentData = argsArray[2] as Record<string, unknown>;
                            const entry: DataLayerEntry = {
                                event: `consent:${argsArray[1]}`,
                                timestamp: new Date().toLocaleTimeString(),
                                data: { command: argsArray[0], action: argsArray[1], ...consentData },
                                id: entryCounter++
                            };
                            setEntries(prev => [...prev, entry]);
                        }
                        return;
                    }

                    const entry: DataLayerEntry = {
                        event: (item.event as string) || undefined,
                        timestamp: new Date().toLocaleTimeString(),
                        data: { ...item },
                        id: entryCounter++
                    };
                    setEntries(prev => [...prev, entry]);
                }
            });

            return result;
        };

        // Cleanup: restore original push
        return () => {
            if (window.dataLayer) {
                window.dataLayer.push = originalPush;
            }
        };
    }, []);

    // Auto-scroll to top on new entries (newest first)
    useEffect(() => {
        if (logRef.current && !isCollapsed) {
            logRef.current.scrollTop = 0;
        }
    }, [entries, isCollapsed]);

    // Listen for re-open event from footer
    useEffect(() => {
        const handleOpen = () => setIsClosed(false);
        window.addEventListener('open-datalayer-viewer', handleOpen);
        return () => window.removeEventListener('open-datalayer-viewer', handleOpen);
    }, []);

    // Drag handlers (mouse + touch)
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.dlv-resize-handle') || target.closest('.dlv-controls')) return;
        isDragging.current = true;
        const rect = panelRef.current?.getBoundingClientRect();
        if (rect) {
            dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        e.preventDefault();
    }, []);

    const handleTouchStartDrag = useCallback((e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('.dlv-resize-handle') || target.closest('.dlv-controls')) return;
        isDragging.current = true;
        const t = e.touches[0];
        const rect = panelRef.current?.getBoundingClientRect();
        if (rect && t) {
            dragOffset.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
        }
        // Don't call preventDefault here: React's onTouchStart is passive, so it would throw.
        // Scrolling is blocked in touchmove (registered with { passive: false }) when dragging.
    }, []);

    // Resize handler (mouse + touch)
    const handleResizeDown = useCallback((e: React.MouseEvent) => {
        isResizing.current = true;
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleResizeTouchStart = useCallback(() => {
        isResizing.current = true;
        // Don't call preventDefault/stopPropagation: React's onTouchStart is passive.
        // Scrolling is blocked in touchmove (registered with { passive: false }) when resizing.
    }, []);

    useEffect(() => {
        const getCoords = (e: MouseEvent | TouchEvent): { x: number; y: number } | null => {
            if ('touches' in e && e.touches.length > 0) {
                return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
            if ('clientX' in e) {
                return { x: e.clientX, y: e.clientY };
            }
            return null;
        };

        const handleMove = (e: MouseEvent | TouchEvent) => {
            const coords = getCoords(e);
            if (!coords) return;
            if (isDragging.current) {
                setPosition({
                    x: Math.max(0, coords.x - dragOffset.current.x),
                    y: Math.max(0, coords.y - dragOffset.current.y)
                });
            }
            if (isResizing.current && panelRef.current) {
                const rect = panelRef.current.getBoundingClientRect();
                setSize({
                    width: Math.max(280, coords.x - rect.left),
                    height: Math.max(200, coords.y - rect.top)
                });
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (isDragging.current || isResizing.current) {
                e.preventDefault();
            }
            handleMove(e);
        };

        const handleUp = () => {
            isDragging.current = false;
            isResizing.current = false;
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleUp);
        window.addEventListener('touchcancel', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleUp);
            window.removeEventListener('touchcancel', handleUp);
        };
    }, []);

    const clearEntries = () => {
        setEntries([]);
        setExpandedId(null);
    };

    const copyJson = (e: React.MouseEvent, data: Record<string, unknown>, id: number) => {
        e.stopPropagation();
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const getEventColor = (event?: string) => {
        if (!event) return 'var(--text-muted)';
        if (event.startsWith('vl_')) return '#5A8A6A';
        if (event.startsWith('video_')) return '#7B61FF';
        if (event.startsWith('consent')) return '#E8973A';
        if (event === 'gtm.js') return '#4285F4';
        return 'var(--foreground)';
    };

    if (isClosed) return null;

    return (
        <div
            ref={panelRef}
            className="dlv-panel"
            style={{
                left: position.x,
                top: position.y,
                width: isCollapsed ? 'auto' : size.width,
                height: isCollapsed ? 'auto' : size.height
            }}
        >
            {/* Header — draggable (mouse + touch) */}
            <div
                className="dlv-header"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStartDrag}
            >
                <div className="dlv-title">
                    <span className="dlv-dot" />
                    dataLayer
                    <span className="dlv-badge">{entries.length}</span>
                </div>
                <div className="dlv-controls">
                    <button className="dlv-btn" onClick={clearEntries} title="Clear">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                    </button>
                    <button className="dlv-btn" onClick={() => {
                        const willExpand = isCollapsed;
                        setIsCollapsed(!isCollapsed);
                        // Clamp position when expanding so panel stays in viewport
                        if (willExpand) {
                            setPosition(prev => ({
                                x: Math.min(prev.x, window.innerWidth - size.width - 20),
                                y: Math.min(prev.y, window.innerHeight - size.height - 20)
                            }));
                        }
                    }} title={isCollapsed ? 'Expand' : 'Collapse'}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isCollapsed ? (
                                <><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></>
                            ) : (
                                <line x1="5" y1="12" x2="19" y2="12" />
                            )}
                        </svg>
                    </button>
                    <button className="dlv-btn" onClick={() => setIsClosed(true)} title="Close">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Log entries */}
            {!isCollapsed && (
                <div className="dlv-log" ref={logRef}>
                    {entries.length === 0 ? (
                        <div className="dlv-empty">Waiting for dataLayer events...</div>
                    ) : (
                        [...entries].reverse().map((entry) => (
                            <div
                                key={entry.id}
                                className={`dlv-entry ${expandedId === entry.id ? 'expanded' : ''}`}
                                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                            >
                                <div className="dlv-entry-header">
                                    <span className="dlv-time">{entry.timestamp}</span>
                                    <span className="dlv-event" style={{ color: getEventColor(entry.event) }}>
                                        {entry.event || 'push'}
                                    </span>
                                </div>
                                {expandedId === entry.id && (
                                    <div className="dlv-json-wrapper">
                                        <button
                                            className="dlv-copy-btn"
                                            onClick={(e) => copyJson(e, entry.data, entry.id)}
                                            title="Copy JSON"
                                        >
                                            {copiedId === entry.id ? (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : (
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                </svg>
                                            )}
                                        </button>
                                        <pre className="dlv-json">
                                            {JSON.stringify(entry.data, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Resize handle */}
            {!isCollapsed && (
                <div
                    className="dlv-resize-handle"
                    onMouseDown={handleResizeDown}
                    onTouchStart={handleResizeTouchStart}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12">
                        <path d="M10 2L2 10M10 6L6 10M10 10L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                    </svg>
                </div>
            )}
        </div>
    );
}
