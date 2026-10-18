'use client';

import React, { useState, useRef } from 'react';
import { Movie } from '@/types';
import { PlaybackSource, LocalMediaItem } from '@/types/media-browser';
import { getMoviePlaybackSources } from '@/lib/playback-source';
import { PlaybackAvailabilityBadge } from './PlaybackAvailabilityBadge';
import { UniversalVideoPlayer } from './UniversalVideoPlayer';
import {
  X,
  Play,
  Users,
  FolderOpen,
  Film,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  Check,
  AlertTriangle,
  Info,
  Tv,
  ExternalLink,
} from 'lucide-react';

interface MediaSourceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
  onWatchNow?: (source: PlaybackSource, localFile?: File) => void;
  onWatchTogether?: (movie: Movie, source: PlaybackSource, localFile?: File) => void;
  initialLocalVideo?: { file?: File; blobUrl?: string; name: string } | null;
}

export const MediaSourceSelectorModal: React.FC<MediaSourceSelectorModalProps> = ({
  isOpen,
  onClose,
  movie,
  onWatchNow,
  onWatchTogether,
  initialLocalVideo,
}) => {
  if (!isOpen) return null;

  const [localVideo, setLocalVideo] = useState<{
    file?: File;
    blobUrl?: string;
    name: string;
  } | null>(initialLocalVideo || null);

  const sources = getMoviePlaybackSources(movie, localVideo);
  const [selectedSourceId, setSelectedSourceId] = useState<string>(sources[0]?.id || '');
  const [inAppPreviewActive, setInAppPreviewActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSource = sources.find((s) => s.id === selectedSourceId) || sources[0];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localVideo?.blobUrl) {
        URL.revokeObjectURL(localVideo.blobUrl);
      }
      const blobUrl = URL.createObjectURL(file);
      const newLocal = { file, blobUrl, name: file.name };
      setLocalVideo(newLocal);
      // Select local source
      const localSrc = sources.find((s) => s.type === 'local');
      if (localSrc) setSelectedSourceId(localSrc.id);
    }
  };

  const handleWatchNowClick = () => {
    if (selectedSource.availability === 'provider_integration_required') {
      // In-app playback unavailable for commercial provider
      return;
    }
    if (selectedSource.type === 'local' && !localVideo?.blobUrl) {
      fileInputRef.current?.click();
      return;
    }
    if (onWatchNow) {
      onWatchNow(selectedSource, localVideo?.file);
    } else {
      setInAppPreviewActive(true);
    }
  };

  const handleWatchTogetherClick = () => {
    if (selectedSource.availability === 'provider_integration_required') {
      // Prompt user to pick playable alternative before room creation
      return;
    }
    if (selectedSource.type === 'local' && !localVideo?.blobUrl) {
      fileInputRef.current?.click();
      return;
    }
    if (onWatchTogether) {
      onWatchTogether(movie, selectedSource, localVideo?.file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-cinema-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mkv,.mov"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="relative w-full max-w-3xl bg-cinema-850 border border-cinema-700/80 rounded-3xl overflow-hidden shadow-cinema-card text-cinema-100 my-auto">
        {/* Backdrop Banner Header */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-cinema-900">
          <img
            src={movie.backdropPath || movie.posterPath}
            alt={movie.title}
            className="w-full h-full object-cover object-center brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-850 via-cinema-850/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-cinema-950/80 text-cinema-400 hover:text-white hover:bg-cinema-800 transition-colors z-20"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Header content overlay */}
          <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6 flex items-end gap-4 z-10">
            <img
              src={movie.posterPath}
              alt={movie.title}
              className="w-16 sm:w-20 aspect-[2/3] object-cover rounded-xl border border-cinema-700/80 shadow-lg shrink-0 hidden xs:block"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-cinema-900/90 text-cinema-300 text-[11px] font-mono">
                  {movie.releaseYear}
                </span>
                <span className="text-[11px] text-cinema-400">•</span>
                <span className="text-[11px] text-cinema-400 flex items-center gap-1">
                  <Clock size={11} /> {movie.runtime} min
                </span>
                <span className="text-[11px] text-cinema-400">•</span>
                <span className="text-[11px] text-amber-cinema font-bold flex items-center gap-0.5">
                  <Star size={11} className="fill-amber-cinema" /> {movie.rating}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white truncate">
                {movie.title}
              </h2>
            </div>
          </div>
        </div>

        {/* In-App Theater Preview (if activated) */}
        {inAppPreviewActive ? (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play size={16} className="text-amber-cinema fill-amber-cinema" />
                <span className="text-sm font-bold text-white">In-App Theater Mode</span>
              </div>
              <button
                onClick={() => setInAppPreviewActive(false)}
                className="text-xs text-cinema-400 hover:text-white"
              >
                Close Theater View ✕
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-cinema-700">
              {selectedSource.type === 'youtube' ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${selectedSource.mediaId || movie.trailerYoutubeId}?autoplay=1&rel=0`}
                  title={`${movie.title} Player`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedSource.type === 'local' && localVideo?.blobUrl ? (
                <UniversalVideoPlayer
                  src={localVideo.blobUrl}
                  title={localVideo.name}
                  autoPlay={true}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-xs text-cinema-400">
                  <FolderOpen size={32} className="text-amber-cinema mb-2" />
                  <span>Please load a local video file to start in-app playback</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-xs text-cinema-400">
                Playing inside Wavo without external redirects.
              </span>
              <button
                onClick={handleWatchTogetherClick}
                className="px-4 py-2 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-amber"
              >
                <Users size={14} />
                <span>Invite Friends & Watch Together</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Source Selection Body */
          <div className="p-5 sm:p-6 space-y-6">
            {/* Step Subheading */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                <span>Select Playback Source</span>
                <span className="text-xs font-normal lowercase text-cinema-400 font-sans">
                  (Choose how to watch before starting)
                </span>
              </h3>
              <p className="text-xs text-cinema-400">
                Wavo verifies source compatibility so you can watch inside this website without leaving.
              </p>
            </div>

            {/* Source Options List */}
            <div className="space-y-3">
              {sources.map((src) => {
                const isSelected = selectedSource.id === src.id;
                return (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSourceId(src.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-cinema-900 border-amber-cinema shadow-glow-amber'
                        : 'bg-cinema-900/60 border-cinema-750/70 hover:border-cinema-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          src.type === 'youtube'
                            ? 'bg-red-500/15 text-red-500'
                            : src.type === 'local'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-purple-500/15 text-purple-400'
                        }`}
                      >
                        {src.type === 'youtube' ? (
                          <Film size={18} />
                        ) : src.type === 'local' ? (
                          <FolderOpen size={18} />
                        ) : (
                          <Tv size={18} />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{src.name}</span>
                          <PlaybackAvailabilityBadge status={src.availability} compact={true} />
                        </div>
                        <p className="text-xs text-cinema-400 mt-0.5 leading-relaxed">
                          {src.notes || src.requirementNotice}
                        </p>
                      </div>
                    </div>

                    {/* Local File Action Button if local type */}
                    {src.type === 'local' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-100 text-xs font-semibold shrink-0 flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <FolderOpen size={13} />
                        <span>{localVideo ? 'Change File' : 'Browse File'}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Honest Provider Restriction Explanation Banner (when commercial provider selected) */}
            {selectedSource.availability === 'provider_integration_required' && (
              <div className="p-4 rounded-2xl bg-amber-cinema/10 border border-amber-cinema/25 text-xs text-cinema-300 space-y-2 animate-fade-in">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert size={18} className="text-amber-cinema shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white text-xs">
                      In-app playback unavailable for this source
                    </h4>
                    <p className="text-[11px] text-cinema-300 mt-1 leading-relaxed">
                      {selectedSource.name} enforces hardware DRM (Widevine/PlayReady) and security headers (X-Frame-Options: DENY). To maintain your privacy and comply with security rules, we never proxy credentials or display fake players.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-cinema/20 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-amber-cinema font-medium">
                    Suggested in-app alternatives:
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const ytSrc = sources.find((s) => s.type === 'youtube');
                        if (ytSrc) setSelectedSourceId(ytSrc.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cinema-850 hover:bg-cinema-800 text-cinema-100 border border-cinema-750 text-[11px]"
                    >
                      ▶ Watch Trailer In-App
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const locSrc = sources.find((s) => s.type === 'local');
                        if (locSrc) {
                          setSelectedSourceId(locSrc.id);
                          fileInputRef.current?.click();
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-cinema-850 hover:bg-cinema-800 text-cinema-100 border border-cinema-750 text-[11px]"
                    >
                      📁 Load Local Copy
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-4 border-t border-cinema-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-400 hover:text-cinema-200 text-xs font-semibold transition-colors"
              >
                Return to Browsing
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Watch Now Button */}
                <button
                  type="button"
                  onClick={handleWatchNowClick}
                  disabled={selectedSource.availability === 'provider_integration_required'}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedSource.availability === 'provider_integration_required'
                      ? 'bg-cinema-800 text-cinema-500 cursor-not-allowed border border-cinema-750'
                      : 'bg-cinema-800 hover:bg-cinema-750 text-cinema-100 border border-cinema-700/80 hover:text-white'
                  }`}
                  title={
                    selectedSource.availability === 'provider_integration_required'
                      ? 'In-app playback unavailable for this source'
                      : 'Play movie in-app on this website'
                  }
                >
                  <Play size={14} className="fill-current" />
                  <span>Watch Now</span>
                </button>

                {/* Watch Together Button */}
                <button
                  type="button"
                  onClick={handleWatchTogetherClick}
                  disabled={selectedSource.availability === 'provider_integration_required'}
                  className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    selectedSource.availability === 'provider_integration_required'
                      ? 'bg-amber-cinema/30 text-cinema-950/60 cursor-not-allowed'
                      : 'bg-amber-cinema hover:bg-amber-hover text-cinema-950 shadow-glow-amber'
                  }`}
                  title={
                    selectedSource.availability === 'provider_integration_required'
                      ? 'In-app playback unavailable for this source'
                      : 'Create a watch room with this movie'
                  }
                >
                  <Users size={15} />
                  <span>Watch Together</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
