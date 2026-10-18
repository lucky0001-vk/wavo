import { NextRequest, NextResponse } from 'next/server';
import { fetchWatchRoom } from '@/lib/room-manager';

// Simple in-memory rate limiting map for room lookups
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60 * 1000 }); // 60s window
    return true;
  }

  if (entry.count >= 60) {
    // Max 60 requests per minute per IP
    return false;
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || '127.0.0.1';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { roomCode, userId } = body;

    if (!roomCode || typeof roomCode !== 'string') {
      return NextResponse.json({ error: 'Room code is required.' }, { status: 400 });
    }

    const cleanCode = roomCode.trim().toUpperCase();

    // Verify format
    if (!/^[A-Z0-9-]{3,16}$/.test(cleanCode)) {
      return NextResponse.json({ error: 'Malformed room code syntax.' }, { status: 400 });
    }

    const room = await fetchWatchRoom(cleanCode);

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found or session has concluded.' },
        { status: 404 }
      );
    }

    if (Date.now() > room.expiresAt) {
      return NextResponse.json({ error: 'This watch room has expired.' }, { status: 410 });
    }

    const isHost = Boolean(userId && room.hostId === userId);

    return NextResponse.json({
      valid: true,
      roomCode: room.code,
      title: room.title,
      movieTitle: room.movie.title,
      isHost,
      isPublic: room.isPublic,
      participantsCount: room.participantsCount,
    });
  } catch (err) {
    console.error('Room validation error:', err);
    return NextResponse.json({ error: 'Internal validation error.' }, { status: 500 });
  }
}
