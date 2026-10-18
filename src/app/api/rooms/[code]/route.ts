import { NextRequest, NextResponse } from 'next/server';
import { getServerRoom, saveServerRoom, updateServerPlayback } from '@/lib/server-room-store';
import { getSupabaseClient } from '@/lib/supabase';
import { Movie, WatchRoom } from '@/types';
import { CURATED_MOVIES } from '@/lib/movies-data';

interface RouteContext {
  params: { code: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const code = (params?.code || '').trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ error: 'Room code is required.' }, { status: 400 });
  }

  // 1. Check server memory store
  let room = getServerRoom(code);
  if (room) {
    return NextResponse.json({ room }, { status: 200 });
  }

  // 2. Check Supabase database if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('watch_rooms')
        .select('*')
        .eq('room_code', code)
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

        const dbRoom: WatchRoom = {
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

        saveServerRoom(dbRoom);
        return NextResponse.json({ room: dbRoom }, { status: 200 });
      }
    } catch (err) {
      console.warn('Supabase lookup warning:', err);
    }
  }

  // 3. Fallback for valid demo format codes (e.g. MOON-582, NOVA-482)
  if (/^[A-Z0-9]{3,6}-[0-9]{3,4}$/.test(code)) {
    const movie = CURATED_MOVIES[Math.abs(code.charCodeAt(0)) % CURATED_MOVIES.length];
    const demoRoom: WatchRoom = {
      code,
      title: `${movie.title} with Host`,
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
    saveServerRoom(demoRoom);
    return NextResponse.json({ room: demoRoom }, { status: 200 });
  }

  return NextResponse.json({ error: 'Room not found or expired.' }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const code = (params?.code || '').trim().toUpperCase();

  try {
    const body = await request.json();
    if (body.playback) {
      const updated = updateServerPlayback(code, body.playback);
      if (!updated) {
        return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
      }
      return NextResponse.json({ success: true, playback: updated.playback });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update room.' }, { status: 500 });
  }
}
