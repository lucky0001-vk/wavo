// Wavo Media Browser & Streaming Types

export type StreamingProviderId = 'youtube' | 'netflix' | 'prime' | 'disney' | 'max' | 'apple' | 'crunchyroll';

export type PlaybackAvailabilityStatus =
  | 'playable_in_app'
  | 'youtube_player'
  | 'local_file_required'
  | 'provider_integration_required'
  | 'unavailable';

export interface PlaybackSource {
  id: string;
  name: string;
  type: 'youtube' | 'local' | 'provider';
  providerId?: StreamingProviderId;
  availability: PlaybackAvailabilityStatus;
  isPlayableInApp: boolean;
  mediaId?: string; // YouTube video ID or local file ID
  streamUrl?: string; // Blob or embed URL
  notes?: string;
  requirementNotice?: string;
}

export interface StreamingProvider {
  id: StreamingProviderId;
  name: string;
  tagline: string;
  url: string;
  launchType: 'embedded_api' | 'official_app_tab' | 'webview_compatible';
  description: string;
  requiresAccount: boolean;
  drmType: 'Standard' | 'Widevine L1/L3' | 'PlayReady';
  syncSupported: boolean;
  accentColor: string;
  badge: string;
  instructions: string;
  logoSvgName: string;
}

export interface LocalMediaItem {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  duration?: number;
  lastPlayedPosition?: number;
  blobUrl?: string;
  file?: File;
  addedAt: number;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  language: string;
  blobUrl: string;
  fileName: string;
}

export interface AdminHealthReport {
  status: 'healthy' | 'degraded' | 'error';
  timestamp: number;
  uptimeSeconds: number;
  environment: {
    nodeEnv: string;
    supabaseConfigured: boolean;
    tmdbConfigured: boolean;
    appUrlConfigured: boolean;
  };
  services: {
    supabase: { status: 'connected' | 'unconfigured' | 'error'; latencyMs?: number };
    tmdb: { status: 'operational' | 'offline_fallback_active'; latencyMs?: number };
    realtimeSync: { status: 'active'; transport: 'supabase_and_broadcast_channel' };
  };
  activeRoomsCount: number;
  securityChecks: {
    cspHeadersActive: boolean;
    rlsEnforced: boolean;
    zeroSecretExposure: boolean;
    rateLimitingActive: boolean;
  };
}
