import { describe, it, expect } from 'vitest';
import { CURATED_MOVIES } from '../src/lib/movies-data';
import {
  getMoviePlaybackSources,
  getPrimaryAvailability,
  AVAILABILITY_CONFIGS,
} from '../src/lib/playback-source';
import { createWatchRoom } from '../src/lib/room-manager';

describe('Pre-Watch Discovery & In-App Playback Sources', () => {
  it('correctly classifies in-app playable YouTube trailers vs. commercial providers', () => {
    const movie = CURATED_MOVIES[0]; // Spirited Away
    expect(movie.trailerYoutubeId).toBeDefined();

    const sources = getMoviePlaybackSources(movie);
    expect(sources.length).toBeGreaterThanOrEqual(2);

    // YouTube in-app source
    const ytSource = sources.find((s) => s.type === 'youtube');
    expect(ytSource).toBeDefined();
    expect(ytSource?.isPlayableInApp).toBe(true);
    expect(ytSource?.availability).toBe('youtube_player');
    expect(ytSource?.mediaId).toBe(movie.trailerYoutubeId);

    // Local file option
    const localSource = sources.find((s) => s.type === 'local');
    expect(localSource).toBeDefined();
    expect(localSource?.availability).toBe('local_file_required');

    // Commercial provider source (Max, Netflix, Prime Video, etc.)
    const providerSource = sources.find((s) => s.type === 'provider');
    expect(providerSource).toBeDefined();
    expect(providerSource?.isPlayableInApp).toBe(false);
    expect(providerSource?.availability).toBe('provider_integration_required');
    expect(providerSource?.requirementNotice).toContain('DRM');
  });

  it('marks local files as playable in-app when active local video is supplied', () => {
    const movie = CURATED_MOVIES[1]; // La La Land
    const mockLocalVideo = {
      name: 'La_La_Land_1080p.mp4',
      blobUrl: 'blob:http://localhost:3000/1234-5678',
    };

    const sources = getMoviePlaybackSources(movie, mockLocalVideo);
    const activeLocal = sources.find((s) => s.id === 'local-active');
    expect(activeLocal).toBeDefined();
    expect(activeLocal?.isPlayableInApp).toBe(true);
    expect(activeLocal?.availability).toBe('playable_in_app');
    expect(activeLocal?.streamUrl).toBe(mockLocalVideo.blobUrl);
  });

  it('provides all 5 required playback availability labels with appropriate styling configs', () => {
    expect(AVAILABILITY_CONFIGS.playable_in_app.label).toBe('Playable in this app');
    expect(AVAILABILITY_CONFIGS.youtube_player.label).toBe('YouTube player available');
    expect(AVAILABILITY_CONFIGS.local_file_required.label).toBe('Local file required');
    expect(AVAILABILITY_CONFIGS.provider_integration_required.label).toBe('Provider integration required');
    expect(AVAILABILITY_CONFIGS.unavailable.label).toBe('Unavailable for in-app playback');

    // Check playability flags
    expect(AVAILABILITY_CONFIGS.playable_in_app.isPlayableInApp).toBe(true);
    expect(AVAILABILITY_CONFIGS.youtube_player.isPlayableInApp).toBe(true);
    expect(AVAILABILITY_CONFIGS.provider_integration_required.isPlayableInApp).toBe(false);
    expect(AVAILABILITY_CONFIGS.unavailable.isPlayableInApp).toBe(false);
  });

  it('creates watch rooms carrying selected movie and initial playback media specifications', async () => {
    const selectedMovie = CURATED_MOVIES[2]; // Interstellar

    // Mode B: Online / YouTube Trailer Room
    const onlineRoom = await createWatchRoom({
      movie: selectedMovie,
      hostId: 'test_host_1',
      hostNickname: 'CinemaHost',
      initialPlayback: {
        mediaType: 'youtube',
        mediaId: selectedMovie.trailerYoutubeId,
      },
    });

    expect(onlineRoom.code).toMatch(/^[A-Z0-9]+-[A-Z0-9]+$/);
    expect(onlineRoom.movie.id).toBe(selectedMovie.id);
    expect(onlineRoom.playback.mediaType).toBe('youtube');
    expect(onlineRoom.playback.mediaId).toBe(selectedMovie.trailerYoutubeId);

    // Mode A: Local Video Room
    const localMovie = {
      ...selectedMovie,
      id: `local-${Date.now()}`,
      title: 'Interstellar_IMAX_Edition.mkv',
    };

    const localRoom = await createWatchRoom({
      movie: localMovie,
      hostId: 'test_host_2',
      hostNickname: 'LocalHost',
      initialPlayback: {
        mediaType: 'mp4',
        mediaId: localMovie.title,
      },
    });

    expect(localRoom.movie.id).toContain('local-');
    expect(localRoom.playback.mediaType).toBe('mp4');
    expect(localRoom.playback.mediaId).toBe(localMovie.title);
  });

  it('resolves primary availability correctly for movie cards', () => {
    const regularMovie = CURATED_MOVIES[0];
    const availability = getPrimaryAvailability(regularMovie);
    expect(availability.status).toBe('youtube_player');
    expect(availability.label).toBe('YouTube player available');

    const localItem = {
      ...regularMovie,
      id: 'local-test-123',
    };
    const localAvailability = getPrimaryAvailability(localItem);
    expect(localAvailability.status).toBe('playable_in_app');
    expect(localAvailability.label).toBe('Playable in this app');
  });
});
