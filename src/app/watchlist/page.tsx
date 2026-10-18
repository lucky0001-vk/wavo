'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWatchlist } from '@/lib/watchlist-context';
import { Bookmark, CheckCircle2, Circle, Trash2, Users, Play, ArrowRight, Sparkles } from 'lucide-react';

export default function WatchlistPage() {
  const router = useRouter();
  const { watchlist, removeFromWatchlist, toggleWatched } = useWatchlist();
  const [filter, setFilter] = useState<'all' | 'unwatched' | 'watched'>('all');

  const filteredItems = watchlist.filter((item) => {
    if (filter === 'unwatched') return !item.watched;
    if (filter === 'watched') return item.watched;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold uppercase tracking-wider mb-2">
            <Bookmark size={13} />
            <span>Personal Collection</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Watchlist</h1>
          <p className="text-xs sm:text-sm text-cinema-400 mt-1">
            Films you saved for upcoming movie nights.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-cinema-900 border border-cinema-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filter === 'all'
                ? 'bg-amber-cinema text-cinema-950 font-semibold'
                : 'text-cinema-400 hover:text-white'
            }`}
          >
            All ({watchlist.length})
          </button>
          <button
            onClick={() => setFilter('unwatched')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filter === 'unwatched'
                ? 'bg-amber-cinema text-cinema-950 font-semibold'
                : 'text-cinema-400 hover:text-white'
            }`}
          >
            To Watch ({watchlist.filter((i) => !i.watched).length})
          </button>
          <button
            onClick={() => setFilter('watched')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filter === 'watched'
                ? 'bg-amber-cinema text-cinema-950 font-semibold'
                : 'text-cinema-400 hover:text-white'
            }`}
          >
            Watched ({watchlist.filter((i) => i.watched).length})
          </button>
        </div>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center rounded-3xl bg-cinema-850 border border-cinema-750 max-w-lg mx-auto p-8 shadow-cinema-card">
          <Bookmark size={36} className="text-amber-cinema/60 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No Saved Movies</h3>
          <p className="text-xs text-cinema-400 mb-6">
            {filter === 'all'
              ? 'Your watchlist is currently empty. Explore mood recommendations and save movies you want to experience.'
              : `No ${filter} films found in your collection.`}
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-xs shadow-glow-amber"
          >
            <span>Explore Mood Recommendations</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredItems.map(({ movie, watched }) => (
            <div
              key={movie.id}
              className={`p-4 rounded-2xl bg-cinema-850 border transition-all flex gap-4 ${
                watched ? 'border-cinema-800 opacity-75' : 'border-cinema-750/80 hover:border-cinema-700'
              }`}
            >
              {/* Poster */}
              <Link href={`/movie/${movie.id}`} className="shrink-0 w-20 sm:w-24 aspect-[2/3] rounded-xl overflow-hidden bg-cinema-900">
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Details & Actions */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono text-cinema-400">
                      {movie.releaseYear} • {movie.runtime}m
                    </span>
                    <button
                      onClick={() => toggleWatched(movie.id)}
                      className={`text-xs flex items-center gap-1 font-medium transition-colors ${
                        watched ? 'text-emerald-400' : 'text-cinema-500 hover:text-cinema-300'
                      }`}
                      title={watched ? 'Mark as unwatched' : 'Mark as watched'}
                    >
                      {watched ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      <span className="text-[11px]">{watched ? 'Watched' : 'Mark Watched'}</span>
                    </button>
                  </div>

                  <Link href={`/movie/${movie.id}`}>
                    <h3 className="text-sm font-semibold text-white hover:text-amber-cinema transition-colors line-clamp-1 mb-1">
                      {movie.title}
                    </h3>
                  </Link>

                  <p className="text-[11px] text-cinema-400 line-clamp-2 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>

                {/* Bottom Row Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-cinema-800">
                  <button
                    onClick={() => router.push(`/watch-together?create=true&movieId=${movie.id}`)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-amber-cinema/15 hover:bg-amber-cinema hover:text-cinema-950 text-amber-cinema text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Users size={13} />
                    <span>Watch Party</span>
                  </button>

                  <button
                    onClick={() => removeFromWatchlist(movie.id)}
                    className="p-1.5 rounded-xl bg-cinema-900 hover:bg-red-500/20 text-cinema-500 hover:text-red-400 transition-colors"
                    title="Remove from Watchlist"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
