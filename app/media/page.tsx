'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { pushToDataLayer } from '@/lib/tracking';

export default function MediaPage() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Track which progress milestones have been reached
    const progressTracked = useRef(new Set<number>());
    const videoStarted = useRef(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => {
            setIsPlaying(true);

            if (!videoStarted.current) {
                videoStarted.current = true;
                pushToDataLayer({
                    event: 'video_start',
                    video_title: 'Tracking Sandbox Demo Reel',
                    video_provider: 'html5',
                    video_duration: Math.round(video.duration)
                });
            } else {
                // Firing un-pause event
                pushToDataLayer({
                    event: 'video_play',
                    video_title: 'Tracking Sandbox Demo Reel'
                });
            }
        };

        const handlePause = () => {
            setIsPlaying(false);
            // Don't fire pause if it's actually ending
            if (video.currentTime !== video.duration) {
                pushToDataLayer({
                    event: 'video_pause',
                    video_title: 'Tracking Sandbox Demo Reel',
                    video_current_time: Math.round(video.currentTime)
                });
            }
        };

        const handleTimeUpdate = () => {
            if (!video.duration) return;

            const percent = Math.round((video.currentTime / video.duration) * 100);
            const milestones = [10, 25, 50, 75, 90];

            milestones.forEach((milestone) => {
                if (percent >= milestone && !progressTracked.current.has(milestone)) {
                    progressTracked.current.add(milestone);
                    pushToDataLayer({
                        event: 'video_progress',
                        video_percent: milestone,
                        video_title: 'Tracking Sandbox Demo Reel'
                    });
                }
            });
        };

        const handleEnded = () => {
            setIsPlaying(false);
            pushToDataLayer({
                event: 'video_complete',
                video_title: 'Tracking Sandbox Demo Reel',
                video_duration: Math.round(video.duration)
            });

            // Reset tracking so they can rewatch and trigger events again
            progressTracked.current.clear();
            videoStarted.current = false;
        };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem', marginBottom: '1rem' }}>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.2s', padding: '0.5rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Home
                </Link>
            </div>

            <h1 style={{ marginTop: '1rem', marginBottom: '1rem' }}>Media Tracking Lab</h1>
            <p className="subtitle" style={{ marginBottom: '2rem' }}>
                Interact with the HTML5 video player below. Play, pause, and scrub through the timeline to test the <code>video_start</code>, <code>video_progress</code>, and <code>video_complete</code> events.
            </p>

            <div style={{
                backgroundColor: 'var(--surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
            }}>
                <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000', aspectRatio: '16 / 9' }}>
                    {/* Using a standard generic placeholder video */}
                    <video
                        ref={videoRef}
                        controls
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                        poster="https://media.w3.org/2010/05/sintel/poster.png"
                    >
                        <source src="https://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" />
                        Your browser does not support HTML5 video.
                    </video>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <button className="button" onClick={togglePlay}>
                        {isPlaying ? 'Pause Video' : 'Play Video'}
                    </button>
                </div>
            </div>
        </div>
    );
}
