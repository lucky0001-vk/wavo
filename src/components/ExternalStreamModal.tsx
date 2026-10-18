'use client';

import React from 'react';
import { X, ShieldAlert, Film, Info, Play, FolderOpen } from 'lucide-react';
import { Movie } from '@/types';
import { PlaybackAvailabilityBadge } from './PlaybackAvailabilityBadge';
import { useRouter } from 'next/navigation';

interface ExternalStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

export const ExternalStreamModal: React.FC<ExternalStreamModalProps> = ({
  isOpen,
  onClose,
  movie,
}) => {
  const router = useRouter();
  if (!isOpen) return null;

  const defaultProviders = [
    { name: 'Netflix', status: 'Widevine L1/L3 DRM Required' },
    { name: 'Amazon Prime Video', status: 'PlayReady DRM Required' },
    { name: 'Apple TV', status: 'FairPlay DRM Required' },
    { name: 'Max', status: 'Widevine DRM Required' },
  ];

  const providers = movie.streamingProviders && movie.streamingProviders.length > 0
    ? movie.streamingProviders.map((p) => ({ name: p.name, status: 'Provider Account & DRM Required' }))
    : defaultProviders;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cinema-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-cinema-850 border border-cinema-700/80 rounded-3xl p-6 sm:p-8 shadow-cinema-card text-cinema-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-cinema-400 hover:text-white hover:bg-cinema-800 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-cinema/15 text-amber-cinema flex items-center justify-center">
            <Film size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">
              Playback Availability: {movie.title}
            </h3>
            <p className="text-xs text-cinema-400">
              Verified in-app viewing status & streaming guidance
            </p>
          </div>
        </div>

        {/* Real Playback Availability Badge */}
        <div className="mb-4">
          <PlaybackAvailabilityBadge movie={movie} />
        </div>

        {/* In-app playback restriction notice */}
        <div className="p-4 rounded-2xl bg-amber-cinema/10 border border-amber-cinema/25 text-xs text-cinema-300 mb-6 space-y-2">
          <div className="flex items-start gap-2.5">
            <ShieldAlert size={18} className="text-amber-cinema shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block">
                In-app playback unavailable for commercial sources
              </span>
              <p className="leading-relaxed text-[11px] text-cinema-300 mt-1">
                Commercial providers (Netflix, Prime Video, Max) enforce hardware DRM (Widevine/PlayReady) and frame security (X-Frame-Options: DENY). They cannot legally or technically render within a web frame without official partner SDKs.
              </p>
            </div>
          </div>
        </div>

        {/* Commercial provider list (honest status without misleading embeds) */}
        <div className="space-y-2 mb-6">
          <p className="text-xs font-semibold text-cinema-300 uppercase tracking-wider">
            Commercial Provider Status:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {providers.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-3 rounded-xl bg-cinema-900 border border-cinema-750 text-xs"
              >
                <span className="font-medium text-white">{p.name}</span>
                <span className="text-[10px] text-purple-400 font-mono">SDK Required</span>
              </div>
            ))}
          </div>
        </div>

        {/* Playable in-app alternatives */}
        <div className="pt-4 border-t border-cinema-800 space-y-3">
          <span className="text-xs font-bold text-white block">
            Watch inside this website right now:
          </span>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={() => {
                onClose();
                router.push(`/watch-together?movieId=${movie.id}`);
              }}
              className="flex-1 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-glow-amber"
            >
              <Play size={13} className="fill-cinema-950" />
              <span>Watch In-App Trailer & Set Up Room</span>
            </button>

            <button
              onClick={() => {
                onClose();
                router.push(`/media-browser`);
              }}
              className="px-4 py-2.5 rounded-xl bg-cinema-900 hover:bg-cinema-800 text-cinema-200 border border-cinema-750 text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <FolderOpen size={13} />
              <span>Load Local File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
