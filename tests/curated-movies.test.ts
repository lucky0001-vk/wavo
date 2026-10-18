import { describe, it, expect } from 'vitest';
import { MOODS } from '../src/lib/constants';
import { CURATED_MOVIES, filterCuratedMovies } from '../src/lib/movies-data';

describe('Mood Discovery & Curated Cinema Catalog', () => {
  it('contains all 12 required cinematic moods', () => {
    const requiredMoods = [
      'happy',
      'sad',
      'stressed',
      'romantic',
      'lonely',
      'adventurous',
      'curious',
      'nostalgic',
      'scared',
      'inspired',
      'bored',
      'surprise',
    ];

    const currentMoodIds = MOODS.map((m) => m.id);
    for (const required of requiredMoods) {
      expect(currentMoodIds).toContain(required);
    }
  });

  it('ensures each curated movie has necessary streaming metadata and rationale', () => {
    for (const movie of CURATED_MOVIES) {
      expect(movie.id).toBeTruthy();
      expect(movie.title).toBeTruthy();
      expect(movie.posterPath).toMatch(/^https?:\/\//);
      expect(movie.backdropPath).toMatch(/^https?:\/\//);
      expect(movie.trailerYoutubeId).toBeTruthy();
      expect(movie.moodMatchReason).toBeTruthy();
      expect(movie.rating).toBeGreaterThan(0);
      expect(movie.runtime).toBeGreaterThan(0);
      expect(movie.genres.length).toBeGreaterThan(0);
    }
  });

  it('filters curated movies accurately by mood', () => {
    const romanticFilms = filterCuratedMovies({ mood: 'romantic' });
    expect(romanticFilms.length).toBeGreaterThan(0);
    for (const film of romanticFilms) {
      expect(film.matchedMoods).toContain('romantic');
    }

    const scaredFilms = filterCuratedMovies({ mood: 'scared' });
    expect(scaredFilms.length).toBeGreaterThan(0);
    for (const film of scaredFilms) {
      expect(film.matchedMoods).toContain('scared');
    }
  });

  it('filters curated movies accurately by runtime duration', () => {
    const briskFilms = filterCuratedMovies({ timeLimit: 'under_90' });
    for (const film of briskFilms) {
      expect(film.runtime).toBeLessThan(90);
    }

    const epicFilms = filterCuratedMovies({ timeLimit: 'over_120' });
    for (const film of epicFilms) {
      expect(film.runtime).toBeGreaterThan(120);
    }
  });
});
