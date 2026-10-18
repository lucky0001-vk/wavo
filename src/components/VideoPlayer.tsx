'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Activity, ShieldCheck, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { PlaybackState } from '@/types';
import { formatPlaybackTime, shouldCorrectDrift } from '@/lib/sync-engine';
import { EmojiReactionOverlay, FloatingReaction } from './EmojiReactionOverlay';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  mediaId: string;
  isHost: boolean;
  playbackState: PlaybackState;
  onHostUpdatePlayback: (action: 'play' | 'pause' | 'seek', position?: number) => void;
  reactions: FloatingReaction[];
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaId,
  isHost,
  playbackState,
  onHostUpdatePlayback,
  reactions,
}) => {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120); // Default trailer duration
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [syncStatus, setSyncStatus] = useState<'in_sync' | 'syncing' | 'paused' | 'buffering'>('in_sync');
  const [hasError, setHasError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls after inactivity
  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3500);
  };

  // 1. Load YouTube IFrame API Script if not already loaded
  useEffect(() => {
    let isCancelled = false;

    function initYouTube() {
      if (!window.YT || !window.YT.Player) {
        if (!document.getElementById('youtube-iframe-api')) {
          const tag = document.createElement('script');
          tag.id = 'youtube-iframe-api';
          tag.src = 'https://www.youtube.com/iframe_api';
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevCallback) prevCallback();
          if (!isCancelled) createPlayer();
        };
      } else {
        createPlayer();
      }
    }

    function createPlayer() {
      if (!playerContainerRef.current) return;

      try {
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch (e) {
            // ignore
          }
        }

        ytPlayerRef.current = new window.YT.Player(playerContainerRef.current, {
          videoId: mediaId || 'ByXuk9QqQkk',
          playerVars: {
            autoplay: 0,
            controls: 0, // We render custom cinematic controls
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            disablekb: isHost ? 0 : 1,
            fs: 0,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            onReady: (event: any) => {
              if (isCancelled) return;
              setIsReady(true);
              setHasError(false);
              setDuration(event.target.getDuration() || 120);

              // Late-join sync
              if (playbackState.status === 'playing') {
                const elapsed = (Date.now() - playbackState.updatedAt) / 1000;
                const targetTime = playbackState.position + elapsed;
                event.target.seekTo(targetTime, true);
                try {
                  event.target.playVideo();
                  setIsPlaying(true);
                } catch {
                  setAutoplayBlocked(true);
                }
              } else {
                event.target.seekTo(playbackState.position, true);
                event.target.pauseVideo();
                setIsPlaying(false);
              }
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT?.PlayerState?.PLAYING) {
                setIsPlaying(true);
                setAutoplayBlocked(false);
                setSyncStatus('in_sync');
              } else if (event.data === window.YT?.PlayerState?.PAUSED) {
                setIsPlaying(false);
                setSyncStatus('paused');
              } else if (event.data === window.YT?.PlayerState?.BUFFERING) {
                setSyncStatus('buffering');
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player Event Notice:', err);
              setHasError(true);
            },
          },
        });
      } catch (err) {
        console.error('Error creating YouTube player:', err);
        setHasError(true);
      }
    }

    initYouTube();

    return () => {
      isCancelled = true;
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        ytPlayerRef.current = null;
      }
    };
  }, [mediaId]);

  // 2. Continuous time tracker for UI seekbar & drift detection
  useEffect(() => {
    const timer = setInterval(() => {
      if (ytPlayerRef.current && isReady && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const current = ytPlayerRef.current.getCurrentTime();
          setCurrentTime(current);

          // If current user is a guest, synchronize with authoritative host playback
          if (!isHost && playbackState) {
            let targetHostPosition = playbackState.position;
            if (playbackState.status === 'playing') {
              const elapsed = (Date.now() - playbackState.updatedAt) / 1000;
              targetHostPosition += elapsed;
            }

            if (shouldCorrectDrift(current, targetHostPosition)) {
              setSyncStatus('syncing');
              ytPlayerRef.current.seekTo(targetHostPosition, true);
              if (playbackState.status === 'playing') {
                ytPlayerRef.current.playVideo();
                setIsPlaying(true);
              } else {
                ytPlayerRef.current.pauseVideo();
                setIsPlaying(false);
              }
              setTimeout(() => setSyncStatus('in_sync'), 600);
            } else {
              setSyncStatus(playbackState.status === 'playing' ? 'in_sync' : 'paused');
            }
          }
        } catch (e) {
          // ignore transient poll error
        }
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isReady, isHost, playbackState]);

  // 3. React to incoming playback updates for guests
  useEffect(() => {
    if (isHost || !isReady || !ytPlayerRef.current) return;

    try {
      if (playbackState.status === 'playing') {
        const elapsed = (Date.now() - playbackState.updatedAt) / 1000;
        const targetTime = playbackState.position + elapsed;
        const localTime = ytPlayerRef.current.getCurrentTime();

        if (Math.abs(localTime - targetTime) > 1.2) {
          ytPlayerRef.current.seekTo(targetTime, true);
        }
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        setSyncStatus('in_sync');
      } else if (playbackState.status === 'paused') {
        ytPlayerRef.current.seekTo(playbackState.position, true);
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
        setSyncStatus('paused');
      }
    } catch (e) {
      console.warn('Playback synchronization correction notice:', e);
    }
  }, [playbackState, isHost, isReady]);

  // Host playback actions
  const handleTogglePlay = () => {
    if (!isHost) return;

    if (isPlaying) {
      if (ytPlayerRef.current) ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
      onHostUpdatePlayback('pause', currentTime);
    } else {
      if (ytPlayerRef.current) ytPlayerRef.current.playVideo();
      setIsPlaying(true);
      setAutoplayBlocked(false);
      onHostUpdatePlayback('play', currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isHost) return;
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(newTime, true);
    }
    onHostUpdatePlayback('seek', newTime);
  };

  const handleToggleMute = () => {
    if (!ytPlayerRef.current) return;
    if (isMuted) {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.setVolume(volume);
      setIsMuted(false);
    } else {
      ytPlayerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(val);
      if (val > 0 && isMuted) {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    const isFs = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement
    );

    if (!isFs) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  // Mobile Tap-to-play handler to unlock browser autoplay policy
  const handleMobileUnlockPlay = () => {
    setAutoplayBlocked(false);
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        console.warn('Mobile play error:', e);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-cinema-800 shadow-2xl flex flex-col justify-end group select-none touch-manipulation"
    >
      {/* Reaction animations overlay */}
      <EmojiReactionOverlay reactions={reactions} />

      {/* Video Container (YouTube Player target) */}
      <div className="absolute inset-0 w-full h-full pointer-events-auto">
        <div ref={playerContainerRef} className="w-full h-full" />
      </div>

      {/* Mobile Autoplay Policy Tap-to-Play Overlay */}
      {autoplayBlocked && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <button
            onClick={handleMobileUnlockPlay}
            className="px-6 py-3.5 rounded-2xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-sm shadow-glow-amber flex items-center gap-2.5 animate-pulse"
          >
            <Play size={18} className="fill-cinema-950" />
            <span>Tap to Start Playback</span>
          </button>
        </div>
      )}

      {/* In-App Fallback Notice (Zero external redirects) */}
      {hasError && (
        <div className="absolute inset-0 bg-cinema-950 flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertTriangle size={36} className="text-amber-cinema mb-3" />
          <h4 className="text-base font-semibold text-white mb-1">Trailer Playback Notice</h4>
          <p className="text-xs text-cinema-400 max-w-sm mb-5">
            This video cannot be embedded inside the player. You can reload the stream or select an alternate title.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setHasError(false);
                setIsReady(false);
              }}
              className="px-4 py-2 rounded-xl bg-amber-cinema text-cinema-950 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Retry Stream</span>
            </button>
            <button
              onClick={() => router.push('/watch-together')}
              className="px-4 py-2 rounded-xl bg-cinema-850 hover:bg-cinema-800 text-cinema-200 border border-cinema-700 text-xs font-medium flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Browse Other Films</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Overlay: Sync status pill & Host indicator */}
      <div
        className={`absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Sync Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cinema-950/80 backdrop-blur-md border border-cinema-750 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              syncStatus === 'in_sync'
                ? 'bg-emerald-400 animate-pulse'
                : syncStatus === 'syncing'
                ? 'bg-amber-cinema animate-ping'
                : 'bg-cinema-400'
            }`}
          />
          <span className="text-cinema-200">
            {syncStatus === 'in_sync'
              ? 'Synced (±0.1s)'
              : syncStatus === 'syncing'
              ? 'Synchronizing...'
              : syncStatus === 'buffering'
              ? 'Buffering...'
              : 'Host Paused'}
          </span>
        </div>

        {/* Host Control indicator */}
        <div className="px-3 py-1.5 rounded-full bg-cinema-950/80 backdrop-blur-md border border-cinema-750 text-xs text-cinema-300 flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-amber-cinema" />
          <span>{isHost ? 'You are Host (Controls active)' : 'Host controls playback'}</span>
        </div>
      </div>

      {/* Bottom Custom Playback Controls Bar */}
      <div
        className={`relative z-20 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Seek timeline bar */}
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-xs font-mono text-cinema-300 w-12">
            {formatPlaybackTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 120}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            disabled={!isHost}
            className={`w-full h-1.5 bg-cinema-700 rounded-lg appearance-none cursor-pointer accent-amber-cinema transition-all ${
              !isHost ? 'cursor-not-allowed opacity-75' : ''
            }`}
          />

          <span className="text-xs font-mono text-cinema-400 w-12 text-right">
            {formatPlaybackTime(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            {isHost ? (
              <button
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 flex items-center justify-center transition-all shadow-glow-amber cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={18} className="fill-cinema-950" /> : <Play size={18} className="fill-cinema-950 ml-0.5" />}
              </button>
            ) : (
              <div
                className="w-10 h-10 rounded-xl bg-cinema-800 text-cinema-400 flex items-center justify-center cursor-not-allowed min-h-[44px] min-w-[44px]"
                title="Only host can pause or play"
              >
                {isPlaying ? <Activity size={18} className="text-emerald-400" /> : <Pause size={18} />}
              </div>
            )}

            {/* Volume & Mute */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleMute}
                className="p-2 rounded-lg text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-cinema-700 rounded-lg appearance-none cursor-pointer accent-amber-cinema"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-lg text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Fullscreen"
            >
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
