import { describe, it, expect } from 'vitest';
import {
  generateRoomCode,
  calculateEstimatedPosition,
  shouldCorrectDrift,
  formatPlaybackTime,
  DRIFT_TOLERANCE_SECONDS,
} from '../src/lib/sync-engine';
import { PlaybackState } from '../src/types';

describe('Playback Synchronization & Drift Engine', () => {
  it('generates a valid, readable uppercase room code (e.g. PREFIX-123)', () => {
    const code = generateRoomCode();
    expect(code).toBeDefined();
    expect(code).toMatch(/^[A-Z]{3,6}-[0-9]{3}$/);
  });

  it('correctly calculates estimated playback position when host is playing', () => {
    const now = Date.now();
    const playback: PlaybackState = {
      status: 'playing',
      position: 10.0,
      updatedAt: now - 3000, // 3 seconds ago
      hostId: 'host-1',
      mediaId: 'trailer-123',
      mediaType: 'youtube',
    };

    const estimated = calculateEstimatedPosition(playback);
    // Should be approximately 10.0 + 3.0 = 13.0 seconds
    expect(estimated).toBeGreaterThanOrEqual(12.8);
    expect(estimated).toBeLessThanOrEqual(13.2);
  });

  it('preserves exact position when host is paused', () => {
    const now = Date.now();
    const playback: PlaybackState = {
      status: 'paused',
      position: 45.5,
      updatedAt: now - 10000, // 10 seconds ago
      hostId: 'host-1',
      mediaId: 'trailer-123',
      mediaType: 'youtube',
    };

    const estimated = calculateEstimatedPosition(playback);
    expect(estimated).toBe(45.5);
  });

  it('flags drift correction only when exceeding DRIFT_TOLERANCE_SECONDS', () => {
    // Within tolerance (e.g. 0.5s drift)
    expect(shouldCorrectDrift(10.0, 10.5)).toBe(false);
    expect(shouldCorrectDrift(10.5, 10.0)).toBe(false);

    // Beyond tolerance (> 1.5s drift)
    expect(shouldCorrectDrift(10.0, 12.0)).toBe(true);
    expect(shouldCorrectDrift(14.0, 11.5)).toBe(true);
  });

  it('formats playback seconds into clean human-readable MM:SS or HH:MM:SS', () => {
    expect(formatPlaybackTime(0)).toBe('00:00');
    expect(formatPlaybackTime(65)).toBe('01:05');
    expect(formatPlaybackTime(3665)).toBe('1:01:05');
    expect(formatPlaybackTime(-5)).toBe('00:00');
  });
});
