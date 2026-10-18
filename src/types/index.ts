// Cinemood & Watch Together - Domain Types

export type MoodId =
  | 'happy'
  | 'sad'
  | 'stressed'
  | 'romantic'
  | 'lonely'
  | 'adventurous'
  | 'curious'
  | 'nostalgic'
  | 'scared'
  | 'inspired'
  | 'bored'
  | 'surprise';

export interface Mood {
  id: MoodId;
  label: string;
  tagline: string;
  description: string;
  emoji: string;
  iconName: string;
  accentColor: string;
  ambientGlow: string;
  genres: string[];
}

export interface Movie {
  id: string;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  releaseYear: string;
  runtime: number; // in minutes
  rating: number; // out of 10
  voteCount: number;
  genres: string[];
  language: string;
  director?: string;
  cast?: string[];
  trailerYoutubeId?: string;
  moodMatchReason?: string;
  matchedMoods?: MoodId[];
  streamingProviders?: {
    name: string;
    logoUrl?: string;
    url?: string;
  }[];
}

export type PlaybackStatus = 'playing' | 'paused' | 'buffering' | 'ended';

export interface PlaybackState {
  status: PlaybackStatus;
  position: number; // in seconds
  updatedAt: number; // timestamp in ms
  hostId: string;
  mediaId: string;
  mediaType: 'youtube' | 'mp4' | 'external';
}

export interface RoomParticipant {
  id: string; // user id or guest token
  nickname: string;
  avatarUrl?: string;
  isHost: boolean;
  joinedAt: number;
  lastSeen: number;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  content: string;
  type: 'text' | 'reaction' | 'quick_message' | 'system';
  createdAt: number;
  avatarUrl?: string;
}

export interface WatchRoom {
  code: string; // e.g. "MOON-582", "NOVA-482"
  title: string;
  hostId: string;
  hostNickname: string;
  isPublic: boolean;
  movie: Movie;
  playback: PlaybackState;
  createdAt: number;
  expiresAt: number;
  participantsCount: number;
}

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  username?: string;
  avatarUrl?: string;
  isGuest: boolean;
  preferredMoods: MoodId[];
  preferredGenres: string[];
  preferredStreamingServices: string[];
}

export interface FilterPreferences {
  mood?: MoodId;
  timeLimit?: 'under_90' | '90_120' | 'over_120' | 'any';
  genre?: string;
  taste?: 'popular' | 'underrated' | 'hidden_gem' | 'any';
  language?: string;
}
