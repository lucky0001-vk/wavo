import { Movie, MoodId } from '@/types';
import { CURATED_MOVIES, filterCuratedMovies } from './movies-data';
import { MOODS } from './constants';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

// Mood-to-TMDB genre IDs mapping
const MOOD_GENRE_MAP: Record<MoodId, number[]> = {
  happy: [35, 16, 10751], // Comedy, Animation, Family
  sad: [18, 10749], // Drama, Romance
  stressed: [16, 35, 99], // Animation, Comedy, Documentary
  romantic: [10749, 35], // Romance, Comedy
  lonely: [18, 35], // Drama, Comedy
  adventurous: [12, 28, 878], // Adventure, Action, Sci-Fi
  curious: [9648, 53, 878], // Mystery, Thriller, Sci-Fi
  nostalgic: [18, 12, 10751], // Drama, Adventure, Family
  scared: [27, 53], // Horror, Thriller
  inspired: [18, 36, 99], // Drama, History, Documentary
  bored: [28, 53, 35], // Action, Thriller, Comedy
  surprise: [878, 9648, 35, 18],
};

export async function fetchMoviesByMood(options: {
  mood?: MoodId;
  timeLimit?: string;
  genre?: string;
  taste?: string;
  language?: string;
}): Promise<Movie[]> {
  // If no TMDB API key is provided or offline, use the rich curated database
  if (!TMDB_API_KEY) {
    const filtered = filterCuratedMovies(options);
    return filtered.length > 0 ? filtered : CURATED_MOVIES;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&vote_count.gte=100`;

    if (options.mood && MOOD_GENRE_MAP[options.mood]) {
      const genreIds = MOOD_GENRE_MAP[options.mood].join(',');
      url += `&with_genres=${genreIds}`;
    }

    if (options.language && options.language !== 'Any') {
      url += `&with_original_language=${options.language.toLowerCase().slice(0, 2)}`;
    }

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`TMDB API error ${response.status}. Falling back to curated catalog.`);
      return filterCuratedMovies(options);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      return filterCuratedMovies(options);
    }

    // Transform TMDB results
    const tmdbMovies: Movie[] = data.results.slice(0, 12).map((item: any) => {
      const moodConfig = MOODS.find((m) => m.id === options.mood);
      return {
        id: item.id.toString(),
        title: item.title,
        overview: item.overview || 'No synopsis available.',
        posterPath: item.poster_path
          ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
          : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&q=80',
        backdropPath: item.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
          : 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1280&q=80',
        releaseYear: item.release_date ? item.release_date.split('-')[0] : 'Unknown',
        runtime: 110,
        rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.5,
        voteCount: item.vote_count || 100,
        genres: ['Cinema', moodConfig?.label || 'Feature'],
        language: item.original_language?.toUpperCase() || 'EN',
        trailerYoutubeId: 'ByXuk9QqQkk', // Default fallback trailer
        moodMatchReason: moodConfig
          ? `Selected for your "${moodConfig.label}" mood: aligns with ${moodConfig.tagline.toLowerCase()}.`
          : 'Recommended based on high audience acclaim.',
        matchedMoods: options.mood ? [options.mood] : ['happy'],
        streamingProviders: [
          { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' },
          { name: 'Apple TV', url: 'https://tv.apple.com' }
        ]
      };
    });

    return tmdbMovies;
  } catch (err) {
    console.warn('Network error fetching from TMDB, using offline catalog:', err);
    return filterCuratedMovies(options);
  }
}

export async function fetchMovieDetails(id: string): Promise<Movie | null> {
  // Check curated list first
  const curated = CURATED_MOVIES.find((m) => m.id === id);
  if (curated) return curated;

  if (!TMDB_API_KEY) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const [detailsRes, videosRes] = await Promise.allSettled([
      fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,watch/providers`, {
        signal: controller.signal
      }),
      fetch(`${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`, {
        signal: controller.signal
      })
    ]);

    clearTimeout(timeoutId);

    if (detailsRes.status !== 'fulfilled' || !detailsRes.value.ok) {
      return CURATED_MOVIES[0]; // fallback
    }

    const item = await detailsRes.value.json();

    let trailerYoutubeId = 'ByXuk9QqQkk';
    if (videosRes.status === 'fulfilled' && videosRes.value.ok) {
      const vids = await videosRes.value.json();
      const officialTrailer = vids.results?.find(
        (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
      );
      if (officialTrailer) {
        trailerYoutubeId = officialTrailer.key;
      }
    }

    const director = item.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'Cinema Director';
    const cast = item.credits?.cast?.slice(0, 5).map((c: any) => c.name) || ['Lead Actor'];

    return {
      id: item.id.toString(),
      title: item.title,
      overview: item.overview,
      posterPath: item.poster_path
        ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
        : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=780&q=80',
      backdropPath: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1280&q=80',
      releaseYear: item.release_date ? item.release_date.split('-')[0] : 'Unknown',
      runtime: item.runtime || 115,
      rating: item.vote_average ? Number(item.vote_average.toFixed(1)) : 7.8,
      voteCount: item.vote_count || 100,
      genres: item.genres?.map((g: any) => g.name) || ['Drama'],
      language: item.original_language?.toUpperCase() || 'EN',
      director,
      cast,
      trailerYoutubeId,
      moodMatchReason: 'A critically recognized cinematic work chosen for its emotional depth and compelling storytelling.',
      matchedMoods: ['curious', 'adventurous'],
      streamingProviders: [
        { name: 'Prime Video', url: 'https://www.amazon.com/Prime-Video' },
        { name: 'Apple TV', url: 'https://tv.apple.com' }
      ]
    };
  } catch (e) {
    console.error('Error fetching TMDB details:', e);
    return CURATED_MOVIES[0];
  }
}
