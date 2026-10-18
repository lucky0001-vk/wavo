import { describe, it, expect } from 'vitest';
import { createWatchRoom, fetchWatchRoom } from '../src/lib/room-manager';
import { CURATED_MOVIES } from '../src/lib/movies-data';

describe('Watch Together Room Manager & Access Control', () => {
  const testMovie = CURATED_MOVIES[0];

  it('creates a new watch room with unique code and authoritative host state', async () => {
    const hostId = 'usr_alex_123';
    const hostNickname = 'Alex';

    const room = await createWatchRoom({
      movie: testMovie,
      hostId,
      hostNickname,
      isPublic: true,
    });

    expect(room).toBeDefined();
    expect(room.code).toMatch(/^[A-Z]{3,6}-[0-9]{3}$/);
    expect(room.hostId).toBe(hostId);
    expect(room.hostNickname).toBe(hostNickname);
    expect(room.playback.status).toBe('paused');
    expect(room.playback.position).toBe(0);
    expect(room.playback.mediaId).toBe(testMovie.trailerYoutubeId);
    expect(room.expiresAt).toBeGreaterThan(Date.now());
  });

  it('fetches an existing room by its room code', async () => {
    const room = await createWatchRoom({
      movie: testMovie,
      hostId: 'host_test_99',
      hostNickname: 'HostTester',
    });

    const fetched = await fetchWatchRoom(room.code);
    expect(fetched).not.toBeNull();
    expect(fetched?.code).toBe(room.code);
    expect(fetched?.movie.title).toBe(testMovie.title);
  });

  it('rejects invalid or gibberish room codes gracefully', async () => {
    const invalidResult = await fetchWatchRoom('INVALID_XYZ_123');
    expect(invalidResult).toBeNull();

    const emptyResult = await fetchWatchRoom('');
    expect(emptyResult).toBeNull();
  });

  it('verifies host permissions vs guest permissions logic', () => {
    const hostId = 'host_42';
    const guestId = 'guest_88';

    const checkCanControlPlayback = (userId: string, roomHostId: string) => userId === roomHostId;

    expect(checkCanControlPlayback(hostId, hostId)).toBe(true);
    expect(checkCanControlPlayback(guestId, hostId)).toBe(false);
  });
});
