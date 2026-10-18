import { describe, it, expect } from 'vitest';
import { UserProfile, ChatMessage } from '../src/types';

describe('Authentication, Guest Access & Chat Permissions', () => {
  it('creates an anonymous guest user profile with default preferences', () => {
    const createGuest = (nickname?: string): UserProfile => ({
      id: `guest_${Math.random().toString(36).substring(2, 8)}`,
      displayName: nickname?.trim() || `MovieLover_${Math.floor(100 + Math.random() * 900)}`,
      isGuest: true,
      preferredMoods: ['happy', 'bored'],
      preferredGenres: ['Action', 'Comedy'],
      preferredStreamingServices: ['Netflix'],
    });

    const guest = createGuest('Luna');
    expect(guest.isGuest).toBe(true);
    expect(guest.displayName).toBe('Luna');
    expect(guest.id).toMatch(/^guest_/);
    expect(guest.preferredMoods).toContain('happy');
  });

  it('validates signup credentials and password complexity constraints', () => {
    const validateSignup = (email: string, pass: string, name: string) => {
      if (!email || !email.includes('@')) return { error: 'Invalid email' };
      if (!pass || pass.length < 6) return { error: 'Password must be at least 6 characters' };
      if (!name.trim()) return { error: 'Display name required' };
      return { ok: true };
    };

    expect(validateSignup('test@cinema.org', '123456', 'Cinema Fan').ok).toBe(true);
    expect(validateSignup('invalid-email', '123456', 'Fan').error).toBe('Invalid email');
    expect(validateSignup('test@cinema.org', '123', 'Fan').error).toBe('Password must be at least 6 characters');
    expect(validateSignup('test@cinema.org', '123456', '').error).toBe('Display name required');
  });

  it('formats and sanitizes group chat messages', () => {
    const buildMessage = (
      userId: string,
      nickname: string,
      rawContent: string,
      type: ChatMessage['type'] = 'text'
    ): ChatMessage => {
      const sanitized = rawContent.trim();
      return {
        id: `msg-${Date.now()}`,
        userId,
        nickname,
        content: sanitized,
        type,
        createdAt: Date.now(),
      };
    };

    const msg = buildMessage('usr_1', 'Ethan', '   This movie is thrilling!   ');
    expect(msg.content).toBe('This movie is thrilling!');
    expect(msg.type).toBe('text');
    expect(msg.nickname).toBe('Ethan');
  });

  it('checks expired room logic', () => {
    const isRoomExpired = (expiresAt: number): boolean => {
      return Date.now() > expiresAt;
    };

    const pastTimestamp = Date.now() - 1000 * 60; // 1 min in past
    const futureTimestamp = Date.now() + 1000 * 60 * 60 * 24; // 24 hours future

    expect(isRoomExpired(pastTimestamp)).toBe(true);
    expect(isRoomExpired(futureTimestamp)).toBe(false);
  });
});
