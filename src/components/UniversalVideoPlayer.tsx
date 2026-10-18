'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Subtitles,
  PictureInPicture,
  AlertTriangle,
  FileVideo,
  Sparkles,
} from 'lucide-react';
import { formatPlaybackTime } from '@/lib/sync-engine';
import { SubtitleTrack } from '@/types/media-browser';

interface UniversalVideoPlayerProps {
  src?: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  subtitles?: SubtitleTrack[];
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onLoadedMetadata?: (duration: number) => void;
  className?: string;
}

export const UniversalVideoPlayer: React.FC<UniversalVideoPlayerProps> = ({
  src,
  poster,
  title,
  autoPlay = false,
  subtitles = [],
  onTimeUpdate,
  onEnded,
  onLoadedMetadata,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState<string>('off');
  const [pipAvailable, setPipAvailable] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check Picture-in-Picture availability
  useEffect(() => {
    if (typeof document !== 'undefined' && 'pictureInPictureEnabled' in document) {
      setPipAvailable(true);
    }
  }, []);

  // Reset state when source changes
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
    setIsLoading(true);
    setCurrentTime(0);
    setAutoplayBlocked(false);
  }, [src]);

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    setDuration(dur);
    setIsLoading(false);
    if (onLoadedMetadata) onLoadedMetadata(dur);
    if (autoPlay) {
      videoRef.current.play().catch((err) => {
        // Mobile browsers require user interaction for unmuted playback
        console.warn('Autoplay restricted by mobile policy:', err);
        setAutoplayBlocked(true);
        setIsPlaying(false);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (onTimeUpdate) onTimeUpdate(curr, duration);
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.warn('Playback error:', e);
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    const isFs = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement
    );

    if (!isFs) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          (videoRef.current as any)?.webkitEnterFullscreen?.();
        });
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((videoRef.current as any)?.webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleTogglePip = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP error:', e);
    }
  };

  const handleError = () => {
    setIsLoading(false);
    setIsBuffering(false);
    setHasError(true);
    setErrorMessage(
      'This video format or codec is not supported by your browser, or the file handle was revoked.'
    );
  };

  // Keyboard navigation & controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime += 5;
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime -= 5;
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume((prev) => {
          const next = Math.min(1, prev + 0.1);
          if (videoRef.current) videoRef.current.volume = next;
          return next;
        });
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume((prev) => {
          const next = Math.max(0, prev - 0.1);
          if (videoRef.current) videoRef.current.volume = next;
          return next;
        });
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        handleToggleMute();
      }
    },
    [volume, isMuted]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Subtitle track selection
  useEffect(() => {
    if (!videoRef.current) return;
    const textTracks = videoRef.current.textTracks;
    for (let i = 0; i < textTracks.length; i++) {
      if (activeSubtitle === 'off') {
        textTracks[i].mode = 'disabled';
      } else if (textTracks[i].label === activeSubtitle) {
        textTracks[i].mode = 'showing';
      } else {
        textTracks[i].mode = 'disabled';
      }
    }
  }, [activeSubtitle, subtitles]);

  // Auto-hide controls when mouse or touch is inactive
  const handleInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3200);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      className={`relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-cinema-800 shadow-2xl flex flex-col justify-end group select-none touch-manipulation ${className}`}
    >
      {/* HTML5 Native Video Tag */}
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          playsInline
          className="w-full h-full object-contain cursor-pointer"
          onClick={handlePlayPause}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsPlaying(true);
            setIsBuffering(false);
            setIsLoading(false);
            setAutoplayBlocked(false);
          }}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            if (onEnded) onEnded();
          }}
          onError={handleError}
        >
          {subtitles.map((sub) => (
            <track
              key={sub.id}
              kind="subtitles"
              label={sub.label}
              srcLang={sub.language}
              src={sub.blobUrl}
            />
          ))}
        </video>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-cinema-900/60">
          <FileVideo size={44} className="text-amber-cinema/50 mb-3" />
          <h4 className="text-base font-semibold text-white mb-1">No Video Loaded</h4>
          <p className="text-xs text-cinema-400 max-w-sm">
            Choose a movie from your device or pick a video from your local downloads.
          </p>
        </div>
      )}

      {/* Mobile Autoplay Fallback Tap-to-Play Overlay */}
      {autoplayBlocked && !isPlaying && src && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <button
            onClick={() => {
              setAutoplayBlocked(false);
              handlePlayPause();
            }}
            className="px-6 py-3.5 rounded-2xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-sm shadow-glow-amber flex items-center gap-2.5 animate-pulse"
          >
            <Play size={18} className="fill-cinema-950" />
            <span>Tap to Start Playback</span>
          </button>
        </div>
      )}

      {/* Buffering & Loading Spinner */}
      {(isLoading || isBuffering) && src && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none z-20">
          <div className="w-12 h-12 rounded-full border-3 border-amber-cinema border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-cinema-950/95 flex flex-col items-center justify-center p-6 text-center z-30">
          <AlertTriangle size={36} className="text-amber-cinema mb-3" />
          <h4 className="text-base font-semibold text-white mb-1">Playback Error</h4>
          <p className="text-xs text-cinema-400 max-w-md mb-4">{errorMessage}</p>
          <button
            onClick={() => {
              setHasError(false);
              if (videoRef.current) {
                videoRef.current.load();
              }
            }}
            className="px-4 py-2 rounded-xl bg-amber-cinema text-cinema-950 font-semibold text-xs flex items-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>Reload Video</span>
          </button>
        </div>
      )}

      {/* Top Overlay: Title & Subtitle selector */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <span className="text-xs font-semibold text-cinema-200 truncate max-w-md">
          {title || 'Local Movie Playback'}
        </span>

        {subtitles.length > 0 && (
          <div className="flex items-center gap-1.5 bg-cinema-950/80 px-2.5 py-1 rounded-xl border border-cinema-750 text-xs">
            <Subtitles size={13} className="text-amber-cinema" />
            <select
              value={activeSubtitle}
              onChange={(e) => setActiveSubtitle(e.target.value)}
              className="bg-transparent text-cinema-200 text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="off" className="bg-cinema-900">
                Captions Off
              </option>
              {subtitles.map((sub) => (
                <option key={sub.id} value={sub.label} className="bg-cinema-900">
                  {sub.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`relative z-20 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubbable Seek Bar */}
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-xs font-mono text-cinema-300 w-12">
            {formatPlaybackTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            disabled={!src}
            className="w-full h-1.5 bg-cinema-700 rounded-lg appearance-none cursor-pointer accent-amber-cinema transition-all"
          />

          <span className="text-xs font-mono text-cinema-400 w-12 text-right">
            {formatPlaybackTime(duration)}
          </span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              disabled={!src}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 flex items-center justify-center transition-all shadow-glow-amber disabled:opacity-50"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={18} className="fill-cinema-950" />
              ) : (
                <Play size={18} className="fill-cinema-950 ml-0.5" />
              )}
            </button>

            {/* Rewind 10s */}
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime -= 10;
              }}
              className="p-2 rounded-xl text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors"
              title="Rewind 10s"
            >
              <RotateCcw size={16} />
            </button>

            {/* Fast-Forward 10s */}
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.currentTime += 10;
              }}
              className="p-2 rounded-xl text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors"
              title="Forward 10s"
            >
              <FastForward size={16} />
            </button>

            {/* Volume & Mute */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleToggleMute}
                className="p-2 rounded-xl text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 sm:w-20 h-1 bg-cinema-700 rounded-lg appearance-none cursor-pointer accent-amber-cinema"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Speed Selector */}
            <select
              value={playbackRate}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="px-2 py-1 rounded-xl bg-cinema-900 border border-cinema-750 text-cinema-200 text-xs font-mono focus:outline-none"
              title="Playback speed"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1.0x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2.0x</option>
            </select>

            {/* Picture-in-Picture */}
            {pipAvailable && (
              <button
                onClick={handleTogglePip}
                className="p-2 rounded-xl text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors hidden sm:block"
                title="Picture-in-Picture"
              >
                <PictureInPicture size={17} />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={handleToggleFullscreen}
              className="p-2 rounded-xl text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors"
              aria-label="Fullscreen"
            >
              {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
