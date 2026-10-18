import { WatchRoom, PlaybackState, RoomParticipant, ChatMessage, Movie } from '@/types';
import { generateRoomCode } from './sync-engine';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { CURATED_MOVIES } from './movies-data';

const STORAGE_ROOMS_KEY = 'cinemood_watch_rooms';
const STORAGE_PARTICIPANTS_KEY = 'cinemood_room_participants';
const STORAGE_MESSAGES_KEY = 'cinemood_room_messages';

// In-memory cache for fast local retrieval
const localRoomsMap = new Map<string, WatchRoom>();

export function getLocalSavedRooms(): Record<string, WatchRoom> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_ROOMS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveLocalRoom(room: WatchRoom): void {
  localRoomsMap.set(room.code, room);
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalSavedRooms();
    existing[room.code] = room;
    localStorage.setItem(STORAGE_ROOMS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Error saving local room:', err);
  }
}

/**
 * Creates a new Watch Together room
 */
export async function createWatchRoom(options: {
  movie: Movie;
  hostId: string;
  hostNickname: string;
  isPublic?: boolean;
  initialPlayback?: Partial<PlaybackState>;
}): Promise<WatchRoom> {
  const code = generateRoomCode();
  const isLocal =
    options.movie.id.startsWith('local-') ||
    options.initialPlayback?.mediaType === 'mp4';

  const initialPlayback: PlaybackState = {
    status: 'paused',
    position: 0,
    updatedAt: Date.now(),
    hostId: options.hostId,
    mediaId:
      options.initialPlayback?.mediaId ||
      (isLocal ? options.movie.title : options.movie.trailerYoutubeId || 'ByXuk9QqQkk'),
    mediaType: isLocal ? 'mp4' : options.initialPlayback?.mediaType || 'youtube',
    ...options.initialPlayback,
  };

  const newRoom: WatchRoom = {
    code,
    title: `${options.movie.title} with ${options.hostNickname}`,
    hostId: options.hostId,
    hostNickname: options.hostNickname,
    isPublic: options.isPublic ?? true,
    movie: options.movie,
    playback: initialPlayback,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    participantsCount: 1,
  };

  saveLocalRoom(newRoom);

  // Sync to Next.js server registry so any device (phone, laptop) can access it
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRoom),
      }).catch((e) => console.warn('Server room sync warning:', e));
    } catch (e) {
      // ignore
    }
  }

  // If Supabase is configured, also mirror to database
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('watch_rooms').insert([
        {
          room_code: code,
          title: newRoom.title,
          host_id: newRoom.hostId,
          host_nickname: newRoom.hostNickname,
          is_public: newRoom.isPublic,
          media_type: 'youtube',
          media_id: newRoom.playback.mediaId,
          media_title: newRoom.movie.title,
          media_poster: newRoom.movie.posterPath,
          media_backdrop: newRoom.movie.backdropPath,
          playback_status: 'paused',
          playback_position: 0,
          playback_updated_at: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.warn('Supabase room insert notice, continuing with universal sync:', e);
    }
  }

  return newRoom;
}

/**
 * Fetches room by room code with validation
 */
export async function fetchWatchRoom(code: string): Promise<WatchRoom | null> {
  if (!code || typeof code !== 'string') return null;
  const normalizedCode = code.trim().toUpperCase();

  // 1. Check in-memory map or local storage
  if (localRoomsMap.has(normalizedCode)) {
    return localRoomsMap.get(normalizedCode)!;
  }
  const localRooms = getLocalSavedRooms();
  if (localRooms[normalizedCode]) {
    return localRooms[normalizedCode];
  }

  // 2. Query Next.js server registry (cross-device lookup for phone/other browsers)
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(normalizedCode)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.room) {
          saveLocalRoom(json.room);
          return json.room;
        }
      }
    } catch (e) {
      console.warn('Server room lookup fallback notice:', e);
    }
  }

  // 3. Query Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('watch_rooms')
        .select('*')
        .eq('room_code', normalizedCode)
        .eq('is_active', true)
        .single();

      if (data && !error) {
        const movie: Movie = {
          id: data.media_id,
          title: data.media_title,
          overview: 'Watch party feature film.',
          posterPath: data.media_poster || CURATED_MOVIES[0].posterPath,
          backdropPath: data.media_backdrop || CURATED_MOVIES[0].backdropPath,
          releaseYear: '2024',
          runtime: 120,
          rating: 8.0,
          voteCount: 100,
          genres: ['Cinema'],
          language: 'EN',
          trailerYoutubeId: data.media_id,
          moodMatchReason: 'Selected by room host for this session.',
          streamingProviders: [],
        };

        const room: WatchRoom = {
          code: data.room_code,
          title: data.title,
          hostId: data.host_id,
          hostNickname: data.host_nickname,
          isPublic: data.is_public,
          movie,
          playback: {
            status: data.playback_status || 'paused',
            position: Number(data.playback_position) || 0,
            updatedAt: new Date(data.playback_updated_at).getTime(),
            hostId: data.host_id,
            mediaId: data.media_id,
            mediaType: 'youtube',
          },
          createdAt: new Date(data.created_at).getTime(),
          expiresAt: new Date(data.expires_at).getTime(),
          participantsCount: 1,
        };

        saveLocalRoom(room);
        return room;
      }
    } catch (err) {
      console.warn('Supabase room fetch error, fallback to curated lookup:', err);
    }
  }

  // 4. Demo fallback: If code has standard format (e.g. MOON-582, NOVA-482) create instant mock room
  if (/^[A-Z0-9]{3,6}-[0-9]{3,4}$/.test(normalizedCode)) {
    const movie = CURATED_MOVIES[Math.abs(normalizedCode.charCodeAt(0)) % CURATED_MOVIES.length];
    const mockRoom: WatchRoom = {
      code: normalizedCode,
      title: `${movie.title} Watch Party`,
      hostId: 'host-demo',
      hostNickname: 'CinemaHost',
      isPublic: true,
      movie,
      playback: {
        status: 'paused',
        position: 0,
        updatedAt: Date.now(),
        hostId: 'host-demo',
        mediaId: movie.trailerYoutubeId || 'ByXuk9QqQkk',
        mediaType: 'youtube',
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      participantsCount: 1,
    };
    saveLocalRoom(mockRoom);
    return mockRoom;
  }

  return null;
}

export type RoomEventCallback = {
  onPlaybackChange: (state: PlaybackState) => void;
  onParticipantChange: (participants: RoomParticipant[]) => void;
  onChatMessage: (message: ChatMessage) => void;
  onReaction: (reaction: { emoji: string; nickname: string; id: string }) => void;
};

/**
 * Manages real-time room communication (Universal HTTP Event Bus + Supabase Realtime + BroadcastChannel)
 */
export class RealtimeRoomSession {
  private roomCode: string;
  private userId: string;
  private nickname: string;
  private isHost: boolean;
  private callbacks: RoomEventCallback;
  private broadcastChannel: BroadcastChannel | null = null;
  private supabaseChannel: any = null;
  private participants: Map<string, RoomParticipant> = new Map();
  private httpPollTimer: any = null;
  private lastEventTimestamp = Date.now();
  private isDestroyed = false;

  constructor(
    roomCode: string,
    userId: string,
    nickname: string,
    isHost: boolean,
    callbacks: RoomEventCallback
  ) {
    this.roomCode = roomCode.toUpperCase();
    this.userId = userId;
    this.nickname = nickname;
    this.isHost = isHost;
    this.callbacks = callbacks;

    this.initTransport();
  }

  private initTransport() {
    const currentParticipant: RoomParticipant = {
      id: this.userId,
      nickname: this.nickname,
      isHost: this.isHost,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      isOnline: true,
    };
    this.participants.set(this.userId, currentParticipant);

    // 1. Setup local BroadcastChannel (instant inter-tab sync on same machine)
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel(`watch_room_${this.roomCode}`);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingPayload(event.data);
        };
      } catch (e) {
        console.warn('BroadcastChannel unavailable:', e);
      }
    }

    // 2. Setup Supabase Realtime if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const channel = supabase.channel(`room:${this.roomCode}`, {
          config: { broadcast: { self: false } },
        });

        channel
          .on('broadcast', { event: 'playback' }, (payload: any) => {
            this.callbacks.onPlaybackChange(payload.payload);
          })
          .on('broadcast', { event: 'chat' }, (payload: any) => {
            this.callbacks.onChatMessage(payload.payload);
          })
          .on('broadcast', { event: 'reaction' }, (payload: any) => {
            this.callbacks.onReaction(payload.payload);
          })
          .on('broadcast', { event: 'presence_ping' }, (payload: any) => {
            this.handlePresencePing(payload.payload);
          })
          .subscribe();

        this.supabaseChannel = channel;
      } catch (err) {
        console.warn('Supabase realtime channel notice:', err);
      }
    }

    // 3. Universal Cross-Device HTTP Sync (Works between PC, Phone, Tablet anywhere)
    this.startHttpSync();

    // Broadcast self presence
    this.broadcastPresence();
  }

  private startHttpSync() {
    if (typeof window === 'undefined') return;

    const poll = async () => {
      if (this.isDestroyed) return;
      try {
        const res = await fetch(
          `/api/rooms/${encodeURIComponent(this.roomCode)}/sync?since=${this.lastEventTimestamp}&userId=${encodeURIComponent(this.userId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.events && Array.isArray(data.events)) {
            for (const ev of data.events) {
              this.lastEventTimestamp = Math.max(this.lastEventTimestamp, ev.timestamp);
              // Avoid re-processing events we originated locally
              if (ev.payload?.userId !== this.userId) {
                this.handleIncomingPayload(ev);
              }
            }
          }
          if (data.participants && Array.isArray(data.participants)) {
            for (const p of data.participants) {
              this.participants.set(p.id, p);
            }
            this.callbacks.onParticipantChange(Array.from(this.participants.values()));
          }
          if (!this.isHost && data.playback) {
            this.callbacks.onPlaybackChange(data.playback);
          }
        }
      } catch (e) {
        // Transient network jitter, will retry on next tick
      }
    };

    // Poll every 850ms for low-latency synchronization across devices
    this.httpPollTimer = setInterval(poll, 850);
  }

  private handleIncomingPayload(data: any) {
    if (!data || !data.type) return;

    if (data.type === 'playback') {
      this.callbacks.onPlaybackChange(data.payload);
    } else if (data.type === 'chat') {
      this.callbacks.onChatMessage(data.payload);
    } else if (data.type === 'reaction') {
      this.callbacks.onReaction(data.payload);
    } else if (data.type === 'presence_ping') {
      this.handlePresencePing(data.payload);
    }
  }

  private handlePresencePing(participant: RoomParticipant) {
    this.participants.set(participant.id, {
      ...participant,
      lastSeen: Date.now(),
      isOnline: true,
    });
    this.callbacks.onParticipantChange(Array.from(this.participants.values()));
  }

  public broadcastPresence() {
    const participant: RoomParticipant = {
      id: this.userId,
      nickname: this.nickname,
      isHost: this.isHost,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      isOnline: true,
    };

    this.participants.set(this.userId, participant);
    this.callbacks.onParticipantChange(Array.from(this.participants.values()));

    this.sendPayload({
      type: 'presence_ping',
      payload: participant,
    });
  }

  public broadcastPlayback(state: PlaybackState) {
    this.sendPayload({
      type: 'playback',
      payload: state,
    });
  }

  public sendChat(content: string, type: ChatMessage['type'] = 'text') {
    const message: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: this.userId,
      nickname: this.nickname,
      content,
      type,
      createdAt: Date.now(),
    };

    // Trigger local callback for immediate UI feedback
    this.callbacks.onChatMessage(message);

    this.sendPayload({
      type: 'chat',
      payload: message,
    });
  }

  public sendReaction(emoji: string) {
    const reactionPayload = {
      id: `rx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      emoji,
      nickname: this.nickname,
      userId: this.userId,
    };

    this.callbacks.onReaction(reactionPayload);

    this.sendPayload({
      type: 'reaction',
      payload: reactionPayload,
    });
  }

  private sendPayload(data: any) {
    // 1. Local BroadcastChannel
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // 2. Supabase Realtime broadcast
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: data.type,
          payload: data.payload,
        });
      } catch (err) {
        console.warn('Supabase broadcast send notice:', err);
      }
    }

    // 3. Universal Server Event Bus
    if (typeof window !== 'undefined') {
      try {
        fetch(`/api/rooms/${encodeURIComponent(this.roomCode)}/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }).catch(() => {});
      } catch (e) {
        // ignore
      }
    }
  }

  public leave() {
    this.isDestroyed = true;
    if (this.httpPollTimer) {
      clearInterval(this.httpPollTimer);
      this.httpPollTimer = null;
    }
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    if (this.supabaseChannel) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.removeChannel(this.supabaseChannel);
      }
      this.supabaseChannel = null;
    }
  }
}
