import React from 'react';
import Link from 'next/link';
import { MoodSelector } from '@/components/MoodSelector';
import { MovieCard } from '@/components/MovieCard';
import { CURATED_MOVIES } from '@/lib/movies-data';
import { Film, Users, Sparkles, Tv, ShieldCheck, ArrowRight, Play } from 'lucide-react';

export default function HomePage() {
  const featuredMovie = CURATED_MOVIES[0]; // Spirited Away
  const trendingPicks = CURATED_MOVIES.slice(1, 7);

  return (
    <div className="w-full relative overflow-hidden pb-16">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-cinema/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cinema-850 border border-cinema-700/80 text-amber-cinema text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles size={14} />
          <span>Mood-First Cinema & Synchronized Watch</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          Every mood has a movie.
        </h1>

        {/* Supporting Text */}
        <p className="text-base sm:text-lg text-cinema-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Tell us how you feel. We’ll find the film that feels right — then invite your people to watch in sync with a simple room code.
        </p>

        {/* 12 Mood Selection Grid */}
        <MoodSelector />
      </section>

      {/* Watch Together Feature Spotlight (Rave-Inspired Experience) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-14">
        <div className="rounded-3xl bg-gradient-to-br from-cinema-900 via-cinema-850 to-cinema-900 border border-cinema-750/70 p-8 sm:p-12 shadow-cinema-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-cinema/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold mb-3">
                <Users size={14} />
                <span>Rave-Style Social Watch Parties</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                Watch trailers & films together in real-time.
              </h2>
              <p className="text-sm text-cinema-300 leading-relaxed mb-6">
                Create a private room in seconds. Share an easy code like <span className="font-mono text-amber-cinema font-bold">MOON-582</span>. When the host plays or pauses, everyone stays in synchronized lockstep with live group chat and emoji reactions.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/watch-together?create=true"
                  className="px-6 py-3 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-semibold text-sm transition-all shadow-glow-amber flex items-center gap-2"
                >
                  <Play size={16} className="fill-cinema-950" />
                  <span>Create a Watch Room</span>
                </Link>

                <Link
                  href="/watch-together"
                  className="px-6 py-3 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-200 border border-cinema-700/80 font-medium text-sm transition-colors"
                >
                  Join with Code
                </Link>
              </div>
            </div>

            {/* Quick Room Code join preview card */}
            <div className="w-full max-w-sm rounded-2xl bg-cinema-950 border border-cinema-750/90 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-cinema-400 uppercase tracking-wider">
                  Live Party Demo
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-cinema-900 border border-cinema-800 mb-4">
                <img
                  src={featuredMovie.posterPath}
                  alt={featuredMovie.title}
                  className="w-10 h-14 rounded-lg object-cover"
                />
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">{featuredMovie.title}</p>
                  <p className="text-[11px] text-amber-cinema font-mono">Room: NOVA-482</p>
                  <p className="text-[10px] text-cinema-400">4 friends watching</p>
                </div>
              </div>

              <Link
                href="/room/NOVA-482"
                className="w-full py-2.5 rounded-xl bg-cinema-800 hover:bg-amber-cinema hover:text-cinema-950 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Jump into Live Room</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mood Recommendation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Tonight's Curated Masterpiece
            </h2>
            <p className="text-xs sm:text-sm text-cinema-400">
              Hand-picked for deep emotional impact and visual wonder.
            </p>
          </div>
          <Link
            href="/discover"
            className="text-xs font-medium text-amber-cinema hover:underline flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <MovieCard movie={featuredMovie} featured={true} />
      </section>

      {/* Trending / Recommended Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Explore by Emotional Frequency
            </h2>
            <p className="text-xs sm:text-sm text-cinema-400">
              Films matched to catharsis, mystery, adrenaline, and quiet reflection.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {trendingPicks.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
