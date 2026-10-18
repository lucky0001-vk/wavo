import { Movie } from '@/types';
import { PlaybackAvailabilityStatus, PlaybackSource, StreamingProviderId, LocalMediaItem } from '@/types/media-browser';

export interface AvailabilityConfig {
  status: PlaybackAvailabilityStatus;
  label: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  dotColor: string;
  description: string;
  isPlayableInApp: boolean;
}

export const AVAILABILITY_CONFIGS: Record<PlaybackAvailabilityStatus, AvailabilityConfig> = {
  playable_in_app: {
    status: 'playable_in_app',
    label: 'Playable in this app',
    badgeBg: 'bg-emerald-500/15',
    badgeBorder: 'border-emerald-500/30',
    textColor: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    description: 'Decoded and streamed 100% inside Wavo without leaving this website.',
    isPlayableInApp: true,
  },
  youtube_player: {
    status: 'youtube_player',
    label: 'YouTube player available',
    badgeBg: 'bg-amber-cinema/15',
    badgeBorder: 'border-amber-cinema/30',
    textColor: 'text-amber-cinema',
    dotColor: 'bg-amber-cinema',
    description: 'Streams directly via the official YouTube IFrame Player API inside Wavo.',
    isPlayableInApp: true,
  },
  local_file_required: {
    status: 'local_file_required',
    label: 'Local file required',
    badgeBg: 'bg-blue-500/15',
    badgeBorder: 'border-blue-500/30',
    textColor: 'text-blue-400',
    dotColor: 'bg-blue-400',
    description: 'Select your local movie file (.mp4, .webm, .mkv) to play in the Universal Player.',
    isPlayableInApp: true,
  },
  provider_integration_required: {
    status: 'provider_integration_required',
    label: 'Provider integration required',
    badgeBg: 'bg-purple-500/15',
    badgeBorder: 'border-purple-500/30',
    textColor: 'text-purple-400',
    dotColor: 'bg-purple-400',
    description: 'Commercial service enforces DRM (Widevine) and frame security. Requires provider SDK.',
    isPlayableInApp: false,
  },
  unavailable: {
    status: 'unavailable',
    label: 'Unavailable for in-app playback',
    badgeBg: 'bg-zinc-500/15',
    badgeBorder: 'border-zinc-500/30',
    textColor: 'text-zinc-400',
    dotColor: 'bg-zinc-400',
    description: 'This source cannot legally or technically render inside a standard web browser frame.',
    isPlayableInApp: false,
  },
};

/**
 * Returns all potential playback sources for a given movie,
 * categorizing real in-app playback vs. provider requirements honestly.
 */
export function getMoviePlaybackSources(
  movie: Movie,
  currentLocalVideo?: { name: string; blobUrl?: string } | null
): PlaybackSource[] {
  const sources: PlaybackSource[] = [];

  // 1. YouTube In-App Player (Official API)
  if (movie.trailerYoutubeId) {
    sources.push({
      id: `yt-${movie.trailerYoutubeId}`,
      name: 'Official Trailer & Video Stream',
      type: 'youtube',
      availability: 'youtube_player',
      isPlayableInApp: true,
      mediaId: movie.trailerYoutubeId,
      notes: 'Full synchronized playback supported inside Wavo with room controls and chat.',
    });
  }

  // 2. Local File / Personal Library (Universal Player)
  if (currentLocalVideo?.blobUrl) {
    sources.push({
      id: `local-active`,
      name: `Local File: ${currentLocalVideo.name}`,
      type: 'local',
      availability: 'playable_in_app',
      isPlayableInApp: true,
      streamUrl: currentLocalVideo.blobUrl,
      notes: 'Active local file loaded into memory. Ready for instant in-app playback.',
    });
  } else {
    sources.push({
      id: `local-file-${movie.id}`,
      name: 'Your Local Movie File',
      type: 'local',
      availability: 'local_file_required',
      isPlayableInApp: true,
      notes: 'Select your personal video copy on your computer or phone to stream in the HTML5 Universal Player.',
    });
  }

  // 3. Commercial Streaming Providers (Netflix, Prime Video, Max, etc.)
  if (movie.streamingProviders && movie.streamingProviders.length > 0) {
    movie.streamingProviders.forEach((provider, index) => {
      let providerId: StreamingProviderId = 'netflix';
      const lower = provider.name.toLowerCase();
      if (lower.includes('prime') || lower.includes('amazon')) providerId = 'prime';
      else if (lower.includes('disney')) providerId = 'disney';
      else if (lower.includes('max') || lower.includes('hbo')) providerId = 'max';
      else if (lower.includes('apple')) providerId = 'apple';

      sources.push({
        id: `provider-${providerId}-${index}`,
        name: provider.name,
        type: 'provider',
        providerId,
        availability: 'provider_integration_required',
        isPlayableInApp: false,
        requirementNotice: `${provider.name} requires Widevine L1/PlayReady DRM and enforces strict frame-busting security headers (X-Frame-Options: DENY). Full in-app video requires official partner SDK authorization or a native desktop container.`,
      });
    });
  } else {
    // Default commercial references
    sources.push({
      id: 'provider-netflix-default',
      name: 'Netflix',
      type: 'provider',
      providerId: 'netflix',
      availability: 'provider_integration_required',
      isPlayableInApp: false,
      requirementNotice: 'Netflix requires Widevine L1 hardware DRM and prohibits embedding inside third-party websites without partner licensing.',
    });
  }

  return sources;
}

/**
 * Returns primary playback availability status for a movie card.
 */
export function getPrimaryAvailability(movie: Movie): AvailabilityConfig {
  if (movie.id.startsWith('local-')) {
    return AVAILABILITY_CONFIGS.playable_in_app;
  }
  if (movie.trailerYoutubeId) {
    return AVAILABILITY_CONFIGS.youtube_player;
  }
  return AVAILABILITY_CONFIGS.local_file_required;
}
