'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Movie } from '@/types';
import { useWatchlist } from '@/lib/watchlist-context';
import { Star, Clock, Bookmark, Users, Play, Sparkles, Check, Layers } from 'lucide-react';
import { PlaybackAvailabilityBadge } from './PlaybackAvailabilityBadge';
import { MediaSourceSelectorModal } from './MediaSourceSelectorModal';

interface MovieCardProps {
  movie: Movie;
  featured?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, featured = false }) => {
  const router = useRouter();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const inWatchlist = isInWatchlist(movie.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const handleWatchTogether = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/watch-together?movieId=${movie.id}`);
  };

  const handleOpenSourceSelector = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSourceModalOpen(true);
  };

  if (featured) {
    return (
      <>
        <div className="relative w-full rounded-3xl bg-cinema-850 border border-cinema-700/60 overflow-hidden shadow-cinema-card mb-10 group">
          {/* Backdrop with gradient overlays */}
          <div className="relative h-80 sm:h-96 md:h-[420px] w-full overflow-hidden">
            <img
              src={movie.backdropPath}
              alt={movie.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-cinema-950/90 via-cinema-950/40 to-transparent" />

            {/* Featured Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-cinema/20 border border-amber-cinema/40 backdrop-blur-md text-amber-cinema text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={14} />
                <span>Top Mood Match</span>
              </div>
              <PlaybackAvailabilityBadge movie={movie} />
            </div>
          </div>

          {/* Content overlay */}
          <div className="p-6 sm:p-8 -mt-24 sm:-mt-32 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Floating poster */}
              <div className="w-28 sm:w-36 md:w-44 shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-cinema-700/60 hidden sm:block">
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              </div>

              {/* Information */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-cinema-400 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-cinema-800 text-cinema-200 font-mono">
                    {movie.releaseYear}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-cinema-400" />
                    {movie.runtime} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-cinema font-medium">
                    <Star size={13} className="fill-amber-cinema text-amber-cinema" />
                    {movie.rating}
                  </span>
                  <span>•</span>
                  <span>{movie.genres.slice(0, 3).join(', ')}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
                  {movie.title}
                </h2>

                {/* "Why this movie?" emotional rationale card */}
                {movie.moodMatchReason && (
                  <div className="p-3.5 rounded-2xl bg-amber-cinema/10 border border-amber-cinema/20 text-xs sm:text-sm text-cinema-200 mb-4 flex items-start gap-2.5">
                    <Sparkles size={18} className="text-amber-cinema shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-amber-cinema">Why this movie: </span>
                      <span>{movie.moodMatchReason}</span>
                    </div>
                  </div>
                )}

                <p className="text-sm text-cinema-300 leading-relaxed max-w-3xl line-clamp-3 mb-6">
                  {movie.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleOpenSourceSelector}
                    className="px-5 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-glow-amber flex items-center gap-2"
                  >
                    <Play size={16} className="fill-cinema-950" />
                    <span>Watch Now</span>
                  </button>

                  <button
                    onClick={handleWatchTogether}
                    className="px-4 py-2.5 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-100 border border-cinema-700/60 font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
                  >
                    <Users size={16} className="text-amber-cinema" />
                    <span>Watch Together</span>
                  </button>

                  <button
                    onClick={toggleWatchlist}
                    className={`px-3.5 py-2.5 rounded-xl border font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 ${
                      inWatchlist
                        ? 'bg-amber-cinema/20 border-amber-cinema text-amber-cinema'
                        : 'bg-cinema-900 border-cinema-750 text-cinema-300 hover:text-white'
                    }`}
                  >
                    {inWatchlist ? <Check size={16} /> : <Bookmark size={16} />}
                    <span>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
                  </button>

                  <Link
                    href={`/movie/${movie.id}`}
                    className="px-3.5 py-2.5 rounded-xl text-xs text-cinema-400 hover:text-cinema-200 transition-colors flex items-center gap-1 border border-cinema-800 hover:border-cinema-700"
                  >
                    <Layers size={14} />
                    <span>Film Details</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MediaSourceSelectorModal
          isOpen={sourceModalOpen}
          onClose={() => setSourceModalOpen(false)}
          movie={movie}
          onWatchTogether={(selectedMovie) => {
            setSourceModalOpen(false);
            router.push(`/watch-together?movieId=${selectedMovie.id}`);
          }}
        />
      </>
    );
  }

  // Standard Movie Grid Card
  return (
    <>
      <div className="group relative rounded-2xl bg-cinema-850 border border-cinema-750/70 overflow-hidden hover:border-cinema-600 transition-all duration-300 flex flex-col justify-between shadow-lg">
        {/* Poster image */}
        <Link href={`/movie/${movie.id}`} className="block relative aspect-[2/3] w-full overflow-hidden bg-cinema-900">
          <img
            src={movie.posterPath}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cinema-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Rating tag */}
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-cinema-950/80 backdrop-blur-md border border-cinema-800 text-amber-cinema text-xs font-semibold flex items-center gap-1">
            <Star size={12} className="fill-amber-cinema" />
            <span>{movie.rating}</span>
          </div>

          {/* Real Playback Availability Badge overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex justify-start pointer-events-none">
            <PlaybackAvailabilityBadge movie={movie} compact={true} />
          </div>

          {/* Watchlist Quick Button */}
          <button
            onClick={toggleWatchlist}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors ${
              inWatchlist
                ? 'bg-amber-cinema text-cinema-950'
                : 'bg-cinema-950/70 text-cinema-300 hover:text-white border border-cinema-800'
            }`}
            title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          >
            <Bookmark size={14} className={inWatchlist ? 'fill-cinema-950' : ''} />
          </button>
        </Link>

        {/* Card info */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-cinema-400 mb-1">
              <span className="font-mono">{movie.releaseYear}</span>
              <span>•</span>
              <span>{movie.runtime}m</span>
              <span>•</span>
              <span className="truncate">{movie.genres[0]}</span>
            </div>

            <Link href={`/movie/${movie.id}`}>
              <h3 className="font-semibold text-sm text-white group-hover:text-amber-cinema transition-colors line-clamp-1 mb-1.5">
                {movie.title}
              </h3>
            </Link>

            {/* Why this movie match snippet */}
            {movie.moodMatchReason && (
              <p className="text-[11px] text-cinema-300 line-clamp-2 leading-relaxed mb-3">
                {movie.moodMatchReason}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-cinema-800/80">
            <button
              onClick={handleWatchTogether}
              className="flex-1 py-1.5 rounded-xl bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-cinema-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Users size={13} />
              <span>Watch Together</span>
            </button>

            <button
              onClick={handleOpenSourceSelector}
              className="p-1.5 rounded-xl bg-cinema-900 border border-cinema-800 text-cinema-400 hover:text-amber-cinema hover:border-amber-cinema/50 transition-colors"
              title="Watch in App or Select Playback Source"
            >
              <Play size={14} />
            </button>
          </div>
        </div>
      </div>

      <MediaSourceSelectorModal
        isOpen={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        movie={movie}
        onWatchTogether={(selectedMovie) => {
          setSourceModalOpen(false);
          router.push(`/watch-together?movieId=${selectedMovie.id}`);
        }}
      />
    </>
  );
};
