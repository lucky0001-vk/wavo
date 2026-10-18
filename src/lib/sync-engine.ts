import { PlaybackState, PlaybackStatus } from '@/types';

export const DRIFT_TOLERANCE_SECONDS = 1.5; // Max allowed drift before hard seek
export const SYNC_INTERVAL_MS = 3000; // Heartbeat interval for host broadcast

/**
 * Calculates current estimated playback position considering elapsed time since last update
 */
export function calculateEstimatedPosition(playback: PlaybackState): number {
  if (playback.status !== 'playing') {
    return playback.position;
  }
  const elapsedSeconds = (Date.now() - playback.updatedAt) / 1000;
  return Math.max(0, playback.position + elapsedSeconds);
}

/**
 * Determines whether a participant player should seek to synchronize with the host
 */
export function shouldCorrectDrift(currentLocalTime: number, targetHostTime: number): boolean {
  const drift = Math.abs(currentLocalTime - targetHostTime);
  return drift > DRIFT_TOLERANCE_SECONDS;
}

/**
 * Generates human-friendly cinematic room codes like "MOON-582" or "NOVA-482"
 */
export function generateRoomCode(): string {
  const prefixes = [
    'MOON', 'NOVA', 'CINE', 'VELA', 'AURA', 
    'LUNA', 'SOLA', 'DUSK', 'ECHO', 'ZEST', 
    'ORION', 'STELLA', 'NEO', 'RAVE'
  ];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${randomPrefix}-${randomNum}`;
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatPlaybackTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
