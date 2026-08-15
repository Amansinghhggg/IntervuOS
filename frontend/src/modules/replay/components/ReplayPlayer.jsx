import React, { useRef, useEffect, useState } from 'react';
import { VideoOff, Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, Video, Clock, HelpCircle, AlertTriangle } from 'lucide-react';
import { useReplay } from '../hooks/useReplay.js';
import { REPLAY_STATES, TIMELINE_EVENT_TYPES } from '../config/constants.js';

function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const ReplayPlayer = () => {
    const { recording, state, playbackRate, controls, currentTime, timeline } = useReplay();
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const hasShownFullscreenToastRef = useRef(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showFullscreenNotice, setShowFullscreenNotice] = useState(false);
    const [hoveredQuestion, setHoveredQuestion] = useState(null);
    const [hoveredViolation, setHoveredViolation] = useState(null);

    const questions = timeline?.filter((t) => t.type === TIMELINE_EVENT_TYPES.QUESTION) || [];
    const violations = timeline?.filter((t) => t.type === TIMELINE_EVENT_TYPES.VIOLATION) || [];

    const duration = recording?.duration || (videoRef.current ? videoRef.current.duration : 0) || 1;

    // Listen to Fullscreen changes & show in-player overlay notice inside the fullscreen container
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFull = !!document.fullscreenElement;
            setIsFullscreen(isFull);

            if (isFull && !hasShownFullscreenToastRef.current) {
                hasShownFullscreenToastRef.current = true;
                setShowFullscreenNotice(true);

                const timer = setTimeout(() => {
                    setShowFullscreenNotice(false);
                }, 8000);
                return () => clearTimeout(timer);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Sync play/pause state
    useEffect(() => {
        if (!videoRef.current) return;
        if (state === REPLAY_STATES.PLAYING) {
            videoRef.current.play().catch((e) => console.error("Playback prevented", e));
        } else if (state === REPLAY_STATES.PAUSED || state === REPLAY_STATES.IDLE || state === REPLAY_STATES.ENDED) {
            videoRef.current.pause();
        }
    }, [state]);

    // Sync playback rate
    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = playbackRate;
    }, [playbackRate]);

    // Sync current time when driven externally (e.g. seeking via timeline)
    useEffect(() => {
        if (!videoRef.current) return;
        if (Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
            videoRef.current.currentTime = currentTime;
        }
    }, [currentTime]);

    const handleTimeUpdate = () => {
        if (videoRef.current && state === REPLAY_STATES.PLAYING) {
            controls.updateTimeFromVideo(videoRef.current.currentTime);
        }
    };

    const togglePlay = () => {
        if (state === REPLAY_STATES.PLAYING) {
            controls.pause();
        } else {
            controls.play();
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullscreen = () => {
        const target = containerRef.current || videoRef.current;
        if (target) {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch((err) => console.error(err));
            } else {
                target.requestFullscreen().catch((err) => console.error(err));
            }
        }
    };

    const handleScrubClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        controls.seek(percent * duration);
    };

    if (!recording || !recording.url) {
        return (
            <div className="w-full h-full min-h-[320px] flex flex-col items-center justify-center p-8 text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)] mb-1">
                    <VideoOff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                        No Session Recording Available
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
                        A video recording was not saved for this session. Candidate transcript and question evaluations remain fully accessible.
                    </p>
                </div>
                <div className="pt-2">
                    <span className="px-3 py-1.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] font-normal inline-flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        <span>Re-enroll candidate to request a new recorded attempt</span>
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`replay-player bg-black shadow-xl relative group flex flex-col transition-all ${isFullscreen
                ? 'fixed inset-0 z-[99999] w-screen h-screen justify-between rounded-none border-0'
                : 'rounded-xl overflow-hidden border border-[var(--color-border)]'
                }`}
        >
            {/* In-Player Overlay Notice for Fullscreen */}
            {showFullscreenNotice && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)]/95 backdrop-blur-md border border-[var(--color-border-active)]/50 text-[var(--color-text-primary)] text-xs font-medium px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in pointer-events-auto max-w-[90vw] transition-all">
                    <span className="text-sm shrink-0">💡</span>
                    <span className="leading-snug">Hover over the markers on the timeline bar to preview questions and jump directly to answers.</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowFullscreenNotice(false); }}
                        className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors shrink-0 ml-1"
                        title="Dismiss"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {/* Video Player Display */}
            <div
                className={`relative cursor-pointer bg-black flex items-center justify-center ${isFullscreen ? 'flex-1 w-full h-[calc(100vh-80px)] overflow-hidden' : 'min-h-[220px]'
                    }`}
                onClick={togglePlay}
            >
                <video
                    ref={videoRef}
                    src={recording.url}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => controls.updateTimeFromVideo(duration)}
                    className={`replay-video w-full object-contain mx-auto block ${isFullscreen ? 'h-full max-h-none' : 'h-auto max-h-[460px]'
                        }`}
                    controls={false}
                    poster={recording.thumbnail}
                />

                {/* Center Play Overlay Button */}
                {state !== REPLAY_STATES.PLAYING && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-all z-20">
                        <button
                            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                            className="w-14 h-14 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
                            title="Play Video"
                        >
                            <Play className="w-6 h-6 fill-current ml-0.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Playback Controls Bar */}
            <div className={`bg-[var(--color-surface)] border-t border-[var(--color-border)] p-3 px-4 flex flex-col gap-2.5 select-none relative ${isFullscreen ? 'sticky bottom-0 left-0 right-0 z-30 backdrop-blur-md shrink-0 py-4' : ''
                }`}>

                {/* Floating Question Preview Tooltip on Marker Hover */}
                {hoveredQuestion && (
                    <div
                        className="absolute bottom-14 z-50 pointer-events-none -translate-x-1/2 transition-all duration-150 animate-fade-in"
                        style={{
                            left: `${Math.min(90, Math.max(10, (hoveredQuestion.startTime / duration) * 100))}%`
                        }}
                    >
                        <div className="bg-[var(--color-surface)]/98 backdrop-blur-md border border-[var(--color-border-active,#6338F6)] text-[var(--color-text-primary)] rounded-xl p-3 shadow-2xl min-w-[220px] max-w-[300px] sm:max-w-[340px] space-y-1.5 relative">
                            {/* Header row with badge and time */}
                            <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-1.5">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-tint,rgba(99,56,246,0.15))] text-[var(--color-text-accent,#C4B5FD)] text-[10px] font-medium border border-[var(--color-border-active,#6338F6)]/30">
                                    <span>Q{hoveredQuestion.payload?.index || ''}</span>
                                </span>
                                <span className="font-mono text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(hoveredQuestion.startTime)}</span>
                                </span>
                            </div>

                            {/* Question text */}
                            <p className="text-xs font-medium text-[var(--color-text-primary)] leading-snug line-clamp-3">
                                {hoveredQuestion.payload?.question || hoveredQuestion.payload?.text || 'Question'}
                            </p>

                            {/* Footer click hint */}
                            <div className="text-[10px] text-[var(--color-text-accent,#C4B5FD)] pt-0.5 flex items-center gap-1 font-normal">
                                <Play className="w-2.5 h-2.5 fill-current" />
                                <span>Click marker to jump to question</span>
                            </div>

                            {/* Downward indicator triangle */}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-surface)] border-r border-b border-[var(--color-border-active,#6338F6)] rotate-45" />
                        </div>
                    </div>
                )}

                {/* Floating Violation Tooltip on Marker Hover */}
                {hoveredViolation && (
                    <div
                        className="absolute bottom-14 z-50 pointer-events-none -translate-x-1/2 transition-all duration-150 animate-fade-in"
                        style={{
                            left: `${Math.min(90, Math.max(10, (hoveredViolation.startTime / duration) * 100))}%`
                        }}
                    >
                        <div className="bg-[var(--color-surface)]/98 backdrop-blur-md border border-[var(--color-danger,#F43F5E)]/80 text-[var(--color-text-primary)] rounded-xl p-2.5 shadow-2xl min-w-[180px] max-w-[240px] space-y-1 relative">
                            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>{hoveredViolation.payload?.rule || 'Flagged Event'}</span>
                            </div>
                            <div className="font-mono text-[10px] text-[var(--color-text-muted)]">
                                {formatTime(hoveredViolation.startTime)}
                            </div>
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--color-surface)] border-r border-b border-[var(--color-danger)] rotate-45" />
                        </div>
                    </div>
                )}

                {/* Scrub Bar */}
                <div
                    className="relative h-2.5 bg-[var(--color-canvas)] rounded-full cursor-pointer group/scrub flex items-center border border-[var(--color-border)]/60 py-1"
                    onClick={handleScrubClick}
                >
                    {/* Progress Fill */}
                    <div
                        className="h-1.5 bg-[var(--primary)] rounded-full pointer-events-none transition-all duration-75 ml-0.5"
                        style={{ width: `${Math.min(100, (currentTime / duration) * 100)}%` }}
                    />

                    {/* Scrub Handle / Knob */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[var(--color-text-accent,#C4B5FD)] border-2 border-[var(--color-canvas)] shadow-md transition-transform scale-0 group-hover/scrub:scale-100 pointer-events-none z-30"
                        style={{ left: `calc(${Math.min(100, (currentTime / duration) * 100)}% - 7px)` }}
                    />

                    {/* Question Markers on the Timeline Bar */}
                    {questions.map((q) => {
                        const isHovered = hoveredQuestion?.id === q.id;
                        return (
                            <div
                                key={q.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    controls.seek(q.startTime);
                                }}
                                onMouseEnter={() => setHoveredQuestion(q)}
                                onMouseLeave={() => setHoveredQuestion(null)}
                                className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full cursor-pointer transition-all duration-150 z-20 flex items-center justify-center ${isHovered
                                    ? 'bg-[var(--color-text-accent,#C4B5FD)] scale-150 ring-4 ring-[var(--color-border-active,#6338F6)]/40 shadow-lg'
                                    : 'bg-[var(--color-info,#3B82F6)] border-2 border-[var(--color-surface,#16161E)] hover:scale-125'
                                    }`}
                                style={{ left: `calc(${Math.min(100, (q.startTime / duration) * 100)}% - 6px)` }}
                            >
                                <span className="sr-only">Q{q.payload?.index}</span>
                            </div>
                        );
                    })}

                    {/* Violation Markers on the Timeline Bar */}
                    {violations.map((v) => (
                        <div
                            key={v.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                controls.seek(v.startTime);
                            }}
                            onMouseEnter={() => setHoveredViolation(v)}
                            onMouseLeave={() => setHoveredViolation(null)}
                            className="absolute top-0 bottom-0 w-1.5 bg-[var(--color-danger,#F43F5E)] rounded cursor-pointer hover:w-2 transition-all z-10"
                            style={{ left: `calc(${Math.min(100, (v.startTime / duration) * 100)}% - 3px)` }}
                        />
                    ))}
                </div>

                {/* Controls Toolbar */}
                <div className="flex items-center justify-between text-[var(--color-text-primary)]">
                    {/* Left Section: Play/Pause, Mute, Time */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            title={state === REPLAY_STATES.PLAYING ? 'Pause' : 'Play'}
                        >
                            {state === REPLAY_STATES.PLAYING ? (
                                <Pause className="w-4 h-4 fill-current" />
                            ) : (
                                <Play className="w-4 h-4 fill-current" />
                            )}
                        </button>

                        <button
                            onClick={toggleMute}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            title={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted ? (
                                <VolumeX className="w-4 h-4 text-rose-400" />
                            ) : (
                                <Volume2 className="w-4 h-4" />
                            )}
                        </button>

                        <span className="text-xs font-mono text-[var(--color-text-muted)] font-medium">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {/* Right Section: Speed, Fullscreen */}
                    <div className="flex items-center gap-2.5">
                        {/* Speed Dropdown */}
                        <div className="flex items-center gap-1 text-xs">
                            <select
                                value={playbackRate}
                                onChange={(e) => controls.changeSpeed(parseFloat(e.target.value))}
                                className="bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs font-medium rounded-lg px-2 py-1 focus:outline-none focus:border-[var(--color-border-active)] cursor-pointer transition-colors"
                            >
                                <option value={0.5}>0.5x</option>
                                <option value={1.0}>1.0x</option>
                                <option value={1.25}>1.25x</option>
                                <option value={1.5}>1.5x</option>
                                <option value={2.0}>2.0x</option>
                            </select>
                        </div>

                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? (
                                <Minimize className="w-4 h-4" />
                            ) : (
                                <Maximize className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
