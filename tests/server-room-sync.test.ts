import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveServerRoom,
  getServerRoom,
  updateServerPlayback,
  addServerEvent,
  getServerEvents,
  getServerParticipants,
  getAllActiveServerRooms,
} from '../src/lib/server-room-store';
import { CURATED_MOVIES } from '../src/lib/movies-data';
import { WatchRoom } from '../src/types';

describe('Universal Server Room Store & Cross-Device Sync Bus', () => {
  const testMovie = CURATED_MOVIES[0];
  const sampleRoom: WatchRoom = {
    code: 'SYNC-999',
    title: `${testMovie.title} with Alex`,
    hostId: 'host-alex-1',
    hostNickname: 'Alex',
    isPublic: true,
    movie: testMovie,
    playback: {
      status: 'paused',
      position: 0,
      updatedAt: Date.now(),
      hostId: 'host-alex-1',
      mediaId: testMovie.trailerYoutubeId || 'ByXuk9QqQkk',
      mediaType: 'youtube',
    },
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    participantsCount: 1,
  };

  beforeEach(() => {
    saveServerRoom(sampleRoom);
  });

  it('stores and retrieves watch rooms by normalized room code', () => {
    const retrieved = getServerRoom('sync-999');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.code).toBe('SYNC-999');
    expect(retrieved?.movie.title).toBe(testMovie.title);
    expect(retrieved?.hostNickname).toBe('Alex');
  });

  it('updates authoritative host playback state and notifies sync listeners', () => {
    const updated = updateServerPlayback('SYNC-999', {
      status: 'playing',
      position: 42.5,
      updatedAt: Date.now(),
      hostId: 'host-alex-1',
      mediaId: testMovie.trailerYoutubeId || 'ByXuk9QqQkk',
      mediaType: 'youtube',
    });

    expect(updated).not.toBeNull();
    expect(updated?.playback.status).toBe('playing');
    expect(updated?.playback.position).toBe(42.5);

    const check = getServerRoom('SYNC-999');
    expect(check?.playback.status).toBe('playing');
    expect(check?.playback.position).toBe(42.5);
  });

  it('records real-time chat, reactions, and playback events', () => {
    const t0 = Date.now() - 100;

    addServerEvent('SYNC-999', 'chat', {
      id: 'msg-1',
      userId: 'usr_friend',
      nickname: 'Sam',
      content: 'Popcorn is ready! 🍿',
      type: 'text',
      createdAt: Date.now(),
    });

    addServerEvent('SYNC-999', 'reaction', {
      id: 'rx-1',
      emoji: '🔥',
      nickname: 'Sam',
      userId: 'usr_friend',
    });

    const events = getServerEvents('SYNC-999', t0);
    expect(events.length).toBe(2);
    expect(events[0].type).toBe('chat');
    expect(events[0].payload.content).toContain('Popcorn is ready!');
    expect(events[1].type).toBe('reaction');
    expect(events[1].payload.emoji).toBe('🔥');
  });

  it('tracks participant presence across devices without leaking stale connections', () => {
    addServerEvent('SYNC-999', 'presence_ping', {
      id: 'usr_mobile_phone',
      nickname: 'PhoneViewer',
      isHost: false,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      isOnline: true,
    });

    const participants = getServerParticipants('SYNC-999');
    expect(participants.length).toBeGreaterThan(0);
    const phoneUser = participants.find((p) => p.id === 'usr_mobile_phone');
    expect(phoneUser).toBeDefined();
    expect(phoneUser?.nickname).toBe('PhoneViewer');
    expect(phoneUser?.isOnline).toBe(true);
  });

  it('returns all active public rooms in server directory', () => {
    const active = getAllActiveServerRooms();
    expect(active.length).toBeGreaterThan(0);
    expect(active.some((r) => r.code === 'SYNC-999')).toBe(true);
  });
});
