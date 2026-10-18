import { WatchRoom, PlaybackState, RoomParticipant, ChatMessage } from '@/types';
import { CURATED_MOVIES } from './movies-data';

export interface RoomSyncEvent {
  id: string;
  type: 'playback' | 'chat' | 'reaction' | 'presence_ping';
  payload: any;
  timestamp: number;
}

interface ServerRoomStore {
  rooms: Map<string, WatchRoom>;
  events: Map<string, RoomSyncEvent[]>;
  participants: Map<string, Map<string, RoomParticipant>>;
}

// Global persistence across Next.js reloads and hot reloads
const globalStore = globalThis as unknown as { __wavo_room_store?: ServerRoomStore };

if (!globalStore.__wavo_room_store) {
  globalStore.__wavo_room_store = {
    rooms: new Map(),
    events: new Map(),
    participants: new Map(),
  };

  // Pre-seed demo rooms for instant zero-config testing
  const demoMovie = CURATED_MOVIES[0];
  const demoRoom: WatchRoom = {
    code: 'NOVA-482',
    title: `${demoMovie.title} with CinemaHost`,
    hostId: 'host-demo',
    hostNickname: 'CinemaHost',
    isPublic: true,
    movie: demoMovie,
    playback: {
      status: 'paused',
      position: 0,
      updatedAt: Date.now(),
      hostId: 'host-demo',
      mediaId: demoMovie.trailerYoutubeId || 'ByXuk9QqQkk',
      mediaType: 'youtube',
    },
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    participantsCount: 4,
  };
  globalStore.__wavo_room_store.rooms.set('NOVA-482', demoRoom);
}

const store = globalStore.__wavo_room_store;

export function getServerRoom(code: string): WatchRoom | null {
  const normalized = code.trim().toUpperCase();
  const room = store.rooms.get(normalized);
  if (!room) return null;
  if (Date.now() > room.expiresAt) {
    store.rooms.delete(normalized);
    store.events.delete(normalized);
    store.participants.delete(normalized);
    return null;
  }
  return room;
}

export function saveServerRoom(room: WatchRoom): void {
  const normalized = room.code.trim().toUpperCase();
  store.rooms.set(normalized, { ...room, code: normalized });
}

export function updateServerPlayback(code: string, playback: PlaybackState): WatchRoom | null {
  const normalized = code.trim().toUpperCase();
  const room = store.rooms.get(normalized);
  if (!room) return null;

  room.playback = {
    ...room.playback,
    ...playback,
    updatedAt: Date.now(),
  };
  store.rooms.set(normalized, room);
  return room;
}

export function addServerEvent(code: string, type: RoomSyncEvent['type'], payload: any): RoomSyncEvent {
  const normalized = code.trim().toUpperCase();
  if (!store.events.has(normalized)) {
    store.events.set(normalized, []);
  }

  const eventsList = store.events.get(normalized)!;
  const event: RoomSyncEvent = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: Date.now(),
  };

  eventsList.push(event);

  // If playback event, update stored room playback
  if (type === 'playback') {
    updateServerPlayback(normalized, payload);
  }

  // If presence ping, update stored participant
  if (type === 'presence_ping' && payload?.id) {
    if (!store.participants.has(normalized)) {
      store.participants.set(normalized, new Map());
    }
    const partMap = store.participants.get(normalized)!;
    partMap.set(payload.id, {
      ...payload,
      lastSeen: Date.now(),
      isOnline: true,
    });
  }

  // Prune events older than 10 minutes to prevent memory leaks
  const cutoff = Date.now() - 10 * 60 * 1000;
  if (eventsList.length > 500 || (eventsList.length > 0 && eventsList[0].timestamp < cutoff)) {
    store.events.set(
      normalized,
      eventsList.filter((e) => e.timestamp >= cutoff)
    );
  }

  return event;
}

export function getServerEvents(code: string, since: number): RoomSyncEvent[] {
  const normalized = code.trim().toUpperCase();
  const eventsList = store.events.get(normalized) || [];
  return eventsList.filter((e) => e.timestamp > since);
}

export function getServerParticipants(code: string): RoomParticipant[] {
  const normalized = code.trim().toUpperCase();
  const partMap = store.participants.get(normalized);
  if (!partMap) return [];

  const now = Date.now();
  const active: RoomParticipant[] = [];

  partMap.forEach((p, id) => {
    // Participants inactive for > 20s marked offline, > 60s removed
    if (now - p.lastSeen < 20000) {
      active.push({ ...p, isOnline: true });
    } else if (now - p.lastSeen < 60000) {
      active.push({ ...p, isOnline: false });
    } else {
      partMap.delete(id);
    }
  });

  return active;
}

export function getAllActiveServerRooms(): WatchRoom[] {
  const now = Date.now();
  const active: WatchRoom[] = [];
  store.rooms.forEach((r, code) => {
    if (now <= r.expiresAt) {
      active.push(r);
    } else {
      store.rooms.delete(code);
    }
  });
  return active;
}
