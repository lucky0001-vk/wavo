import { NextRequest, NextResponse } from 'next/server';
import {
  addServerEvent,
  getServerEvents,
  getServerParticipants,
  getServerRoom,
} from '@/lib/server-room-store';

interface RouteContext {
  params: { code: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const code = (params?.code || '').trim().toUpperCase();
  const searchParams = request.nextUrl.searchParams;
  const since = parseInt(searchParams.get('since') || '0', 10);

  const room = getServerRoom(code);
  if (!room) {
    return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
  }

  const events = getServerEvents(code, since);
  const participants = getServerParticipants(code);

  return NextResponse.json(
    {
      roomCode: code,
      playback: room.playback,
      events,
      participants,
      timestamp: Date.now(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const code = (params?.code || '').trim().toUpperCase();

  try {
    const body = await request.json();
    const { type, payload } = body;

    if (!type || !payload) {
      return NextResponse.json({ error: 'Event type and payload required.' }, { status: 400 });
    }

    const event = addServerEvent(code, type, payload);
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (err: any) {
    console.error('Room sync post error:', err);
    return NextResponse.json({ error: 'Failed to process sync event.' }, { status: 500 });
  }
}
