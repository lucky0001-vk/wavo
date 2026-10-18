'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Movie, MoodId } from '@/types';
import { MOODS, GENRE_OPTIONS, TIME_OPTIONS, TASTE_OPTIONS } from '@/lib/constants';
import { fetchMoviesByMood } from '@/lib/tmdb';
import { MovieCard } from '@/components/MovieCard';
import { Sparkles, Shuffle, SlidersHorizontal, RefreshCw, X } from 'lucide-react';

function DiscoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const moodParam = (searchParams.get('mood') as MoodId) || 'happy';
  const timeParam = searchParams.get('time') || 'any';
  const genreParam = searchParams.get('genre') || 'Any';
  const tasteParam = searchParams.get('taste') || 'any';
  const langParam = searchParams.get('lang') || 'Any';

  const [selectedMood, setSelectedMood] = useState<MoodId>(moodParam);
  const [timeLimit, setTimeLimit] = useState(timeParam);
  const [genre, setGenre] = useState(genreParam);
  const [taste, setTaste] = useState(tasteParam);
  const [language, setLanguage] = useState(langParam);

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);

  // Load recommendations
  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchMoviesByMood({
        mood: selectedMood,
        timeLimit: timeLimit as any,
        genre,
        taste: taste as any,
        language,
      });

      // Filter out any skipped films
      const filtered = results.filter((m) => !skippedIds.includes(m.id));
      setMovies(filtered.length > 0 ? filtered : results);
    } catch (err: any) {
      console.warn('Recommendation fetch notice:', err);
      setError('Could not fetch recommendations at this time. Showing curated selections.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [selectedMood, timeLimit, genre, taste, language]);

  // Handle Mood change
  const handleMoodChange = (moodId: MoodId) => {
    setSelectedMood(moodId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('mood', moodId);
    router.replace(`/discover?${params.toString()}`);
  };

  // Shuffle / Show Me Another
  const handleShuffle = () => {
    if (movies.length <= 1) return;
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    setMovies(shuffled);
  };

  // Skip / Dislike movie
  const handleSkip = (id: string) => {
    setSkippedIds((prev) => [...prev, id]);
    setMovies((prev) => prev.filter((m) => m.id !== id));
  };

  const currentMoodObj = MOODS.find((m) => m.id === selectedMood) || MOODS[0];
  const featuredMovie = movies[0];
  const alternativeMovies = movies.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-cinema/15 text-amber-cinema text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{currentMoodObj.emoji}</span>
            <span>{currentMoodObj.label} Mood Stream</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Personalized For Your Evening
          </h1>
          <p className="text-xs sm:text-sm text-cinema-400 mt-1 max-w-xl">
            {currentMoodObj.description}
          </p>
        </div>

        {/* Shuffle & Refresh Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShuffle}
            className="px-4 py-2 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-cinema-750 text-cinema-200 hover:text-white text-xs font-medium transition-colors flex items-center gap-2"
          >
            <Shuffle size={14} className="text-amber-cinema" />
            <span>Show Me Another</span>
          </button>

          <button
            onClick={loadRecommendations}
            className="p-2 rounded-xl bg-cinema-850 hover:bg-cinema-800 border border-cinema-750 text-cinema-400 hover:text-white transition-colors"
            title="Reload recommendations"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Mood Quick Pills Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {MOODS.map((m) => {
          const active = m.id === selectedMood;
          return (
            <button
              key={m.id}
              onClick={() => handleMoodChange(m.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                active
                  ? 'bg-amber-cinema text-cinema-950 font-semibold shadow-glow-amber'
                  : 'bg-cinema-900 border border-cinema-800 text-cinema-300 hover:bg-cinema-850 hover:text-white'
              }`}
            >
              <span>{m.emoji}</span>
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-8 animate-pulse">
          <div className="w-full h-80 rounded-3xl bg-cinema-900 border border-cinema-800" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl bg-cinema-900 border border-cinema-800" />
            ))}
          </div>
        </div>
      ) : movies.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center rounded-3xl bg-cinema-850 border border-cinema-750 max-w-lg mx-auto p-8">
          <Sparkles size={32} className="text-amber-cinema mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">No Matching Films Found</h3>
          <p className="text-xs text-cinema-400 mb-6">
            We couldn't find a film matching all chosen filters. Try loosening the runtime or genre constraints.
          </p>
          <button
            onClick={() => {
              setTimeLimit('any');
              setGenre('Any');
              setTaste('any');
              setLanguage('Any');
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-cinema text-cinema-950 font-semibold text-xs"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        /* Results View */
        <div>
          {/* Top Featured Pick */}
          {featuredMovie && (
            <div className="relative mb-12">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-cinema-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-cinema" />
                  Primary Mood Recommendation
                </span>

                <button
                  onClick={() => handleSkip(featuredMovie.id)}
                  className="text-xs text-cinema-400 hover:text-red-400 transition-colors flex items-center gap-1"
                >
                  <X size={14} />
                  <span>Not in the mood for this</span>
                </button>
              </div>

              <MovieCard movie={featuredMovie} featured={true} />
            </div>
          )}

          {/* Alternatives Grid */}
          {alternativeMovies.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Alternative Mood Matches
                </h2>
                <span className="text-xs text-cinema-400">
                  {alternativeMovies.length} more films found
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                {alternativeMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-cinema border-t-transparent animate-spin" />
        </div>
      }
    >
      <DiscoverContent />
    </Suspense>
  );
}
