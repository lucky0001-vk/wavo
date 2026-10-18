import { NextRequest, NextResponse } from 'next/server';
import { saveServerRoom, getAllActiveServerRooms } from '@/lib/server-room-store';
import { WatchRoom } from '@/types';

export async function GET() {
  const rooms = getAllActiveServerRooms().filter((r) => r.isPublic);
  return NextResponse.json({ rooms }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    const room: WatchRoom = await request.json();

    if (!room || !room.code || !room.movie) {
      return NextResponse.json({ error: 'Invalid room payload.' }, { status: 400 });
    }

    saveServerRoom(room);
    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (err: any) {
    console.error('API create room error:', err);
    return NextResponse.json({ error: 'Failed to register room on server.' }, { status: 500 });
  }
}
