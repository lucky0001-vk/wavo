'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Movie } from '@/types';
import { fetchMovieDetails } from '@/lib/tmdb';
import { CURATED_MOVIES } from '@/lib/movies-data';
import { useWatchlist } from '@/lib/watchlist-context';
import { MovieCard } from '@/components/MovieCard';
import { PlaybackAvailabilityBadge } from '@/components/PlaybackAvailabilityBadge';
import { MediaSourceSelectorModal } from '@/components/MediaSourceSelectorModal';
import { Star, Clock, Bookmark, Users, Play, ArrowLeft, Check, Sparkles, Layers } from 'lucide-react';
import Link from 'next/link';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params?.id as string;

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    async function loadData() {
      if (!movieId) return;
      setLoading(true);
      try {
        const data = await fetchMovieDetails(movieId);
        setMovie(data || CURATED_MOVIES[0]);
      } catch (e) {
        console.error('Error loading movie:', e);
        setMovie(CURATED_MOVIES[0]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [movieId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-cinema border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Movie Not Found</h2>
        <p className="text-xs text-cinema-400 mb-4">The requested film details could not be located.</p>
        <Link href="/discover" className="px-4 py-2 rounded-xl bg-amber-cinema text-cinema-950 text-xs font-semibold">
          Return to Discover
        </Link>
      </div>
    );
  }

  const inWatchlist = isInWatchlist(movie.id);
  const similarMovies = CURATED_MOVIES.filter((m) => m.id !== movie.id).slice(0, 4);

  const handleWatchTogether = () => {
    router.push(`/watch-together?movieId=${movie.id}`);
  };

  return (
    <div className="w-full pb-20">
      {/* Cinematic Hero Backdrop */}
      <div className="relative w-full h-[380px] sm:h-[480px] md:h-[540px] overflow-hidden">
        <img
          src={movie.backdropPath}
          alt={movie.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cinema-950 via-cinema-950/70 to-cinema-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-cinema-950/90 via-transparent to-transparent" />

        {/* Back navigation button */}
        <div className="absolute top-6 left-4 sm:left-8 z-20">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-full bg-cinema-950/80 backdrop-blur-md border border-cinema-750 text-cinema-300 hover:text-white hover:bg-cinema-800 transition-colors flex items-center gap-2 text-xs"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-40 sm:-mt-56 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Movie Poster */}
          <div className="w-48 sm:w-60 md:w-72 shrink-0 rounded-3xl overflow-hidden shadow-2xl border border-cinema-700/80 mx-auto md:mx-0">
            <img
              src={movie.posterPath}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover"
            />
          </div>

          {/* Metadata & Actions */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs text-cinema-400 mb-3">
              <span className="px-3 py-1 rounded-lg bg-cinema-850 text-cinema-100 font-mono">
                {movie.releaseYear}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {movie.runtime} mins
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-cinema font-bold">
                <Star size={14} className="fill-amber-cinema text-amber-cinema" />
                {movie.rating} / 10
              </span>
              <span>•</span>
              <PlaybackAvailabilityBadge movie={movie} />
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
              {movie.title}
            </h1>

            {/* Genres */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-6">
              {movie.genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 rounded-full bg-cinema-900 border border-cinema-750 text-xs text-cinema-300 font-medium"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Why This Movie Card */}
            {movie.moodMatchReason && (
              <div className="p-4 rounded-2xl bg-amber-cinema/10 border border-amber-cinema/25 text-xs sm:text-sm text-cinema-200 mb-6 flex items-start gap-3">
                <Sparkles size={20} className="text-amber-cinema shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-cinema">Emotional Resonance: </span>
                  <p className="mt-0.5 leading-relaxed">{movie.moodMatchReason}</p>
                </div>
              </div>
            )}

            {/* Synopsis */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-cinema-400 uppercase tracking-wider mb-2">
                Synopsis
              </h3>
              <p className="text-sm sm:text-base text-cinema-200 leading-relaxed max-w-3xl">
                {movie.overview}
              </p>
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-xs border-t border-b border-cinema-800/80 py-4 max-w-2xl">
              <div>
                <span className="text-cinema-400 uppercase font-semibold">Director: </span>
                <span className="text-cinema-100 font-medium">{movie.director || 'Hayao Miyazaki'}</span>
              </div>
              <div>
                <span className="text-cinema-400 uppercase font-semibold">Cast: </span>
                <span className="text-cinema-100 font-medium">
                  {movie.cast?.join(', ') || 'Ensemble Cast'}
                </span>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              {/* Watch Now In-App */}
              <button
                onClick={() => setShowSourceModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 font-bold text-sm transition-all duration-200 shadow-glow-amber flex items-center gap-2"
              >
                <Play size={18} className="fill-cinema-950" />
                <span>Watch Now (In-App)</span>
              </button>

              {/* Watch Together CTA */}
              <button
                onClick={handleWatchTogether}
                className="px-5 py-3.5 rounded-2xl bg-cinema-850 hover:bg-cinema-800 text-cinema-100 border border-cinema-750 font-semibold text-sm transition-colors flex items-center gap-2"
              >
                <Users size={16} className="text-amber-cinema" />
                <span>Watch Together in Room</span>
              </button>

              {/* Watchlist Toggle */}
              <button
                onClick={() => (inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie))}
                className={`px-4 py-3.5 rounded-2xl border font-medium text-sm transition-colors flex items-center gap-2 ${
                  inWatchlist
                    ? 'bg-amber-cinema/20 border-amber-cinema text-amber-cinema'
                    : 'bg-cinema-900 border-cinema-750 text-cinema-300 hover:text-white'
                }`}
              >
                {inWatchlist ? <Check size={18} /> : <Bookmark size={18} />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              {/* Choose Playback Source */}
              <button
                onClick={() => setShowSourceModal(true)}
                className="px-4 py-3.5 rounded-2xl bg-cinema-900 border border-cinema-800 text-cinema-400 hover:text-cinema-100 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <Layers size={15} />
                <span>Playback Sources</span>
              </button>
            </div>
          </div>
        </div>

        {/* Similar Recommendations Section */}
        <div className="mt-16 pt-12 border-t border-cinema-850">
          <h2 className="text-xl font-bold text-white tracking-tight mb-6">
            Similar Films You Might Love
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {similarMovies.map((sim) => (
              <MovieCard key={sim.id} movie={sim} />
            ))}
          </div>
        </div>
      </div>

      {/* Official In-App Trailer Modal */}
      {showTrailerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cinema-950/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden border border-cinema-750 shadow-2xl">
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-cinema-950/80 text-white text-xs font-medium hover:bg-cinema-800"
            >
              Close ✕
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${movie.trailerYoutubeId || 'ByXuk9QqQkk'}?autoplay=1&rel=0`}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Media Source Selector Modal (100% In-App) */}
      <MediaSourceSelectorModal
        isOpen={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        movie={movie}
        onWatchTogether={(selectedMovie) => {
          setShowSourceModal(false);
          router.push(`/watch-together?movieId=${selectedMovie.id}`);
        }}
      />
    </div>
  );
}
