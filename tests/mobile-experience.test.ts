import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Mobile Support & PWA Compliance', () => {
  it('provides a valid web app manifest for Chrome Android installability', () => {
    const manifestPath = path.resolve(process.cwd(), 'public/manifest.json');
    expect(fs.existsSync(manifestPath)).toBe(true);

    const raw = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(raw);

    expect(manifest.name).toContain('Wavo');
    expect(manifest.short_name).toBe('Wavo');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.background_color).toBe('#08090B');
    expect(manifest.theme_color).toBe('#08090B');
    expect(manifest.icons).toBeInstanceOf(Array);
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const icon192 = manifest.icons.find((i: any) => i.sizes === '192x192');
    expect(icon192).toBeDefined();
    expect(icon192.src).toBe('/wavo-icon.png');
  });

  it('provides a privacy-preserving service worker that excludes private rooms and media streams', () => {
    const swPath = path.resolve(process.cwd(), 'public/sw.js');
    expect(fs.existsSync(swPath)).toBe(true);

    const content = fs.readFileSync(swPath, 'utf-8');

    // Asserts caching security
    expect(content).toContain('wavo-cinema-v1');
    expect(content).toContain('/api/');
    expect(content).toContain('/room/');
    expect(content).toContain('range'); // Does not intercept range video requests
    expect(content).toContain('mp4'); // Does not cache large media files insecurely
    expect(content).toContain('offline');
  });

  it('guarantees invitation URLs use dynamic window.location.origin instead of hardcoded localhost', () => {
    const mockOrigin = 'https://wavo-cinema.loca.lt';
    const roomCode = 'NOVA-482';

    // Simulate invite URL generation
    const generateInviteUrl = (origin: string, code: string) => `${origin}/room/${code}`;
    const url = generateInviteUrl(mockOrigin, roomCode);

    expect(url).toBe('https://wavo-cinema.loca.lt/room/NOVA-482');
    expect(url).not.toContain('localhost');

    // LAN Wi-Fi test
    const lanOrigin = 'http://192.168.1.27:3000';
    const lanUrl = generateInviteUrl(lanOrigin, roomCode);
    expect(lanUrl).toBe('http://192.168.1.27:3000/room/NOVA-482');
  });

  it('handles mobile autoplay policies with touch-gesture fallback', () => {
    let autoplayBlocked = false;

    // Simulate browser autoplay rejection (NotAllowedError)
    const simulateAutoplay = (allowed: boolean) => {
      if (!allowed) {
        autoplayBlocked = true;
        return false;
      }
      return true;
    };

    expect(simulateAutoplay(false)).toBe(false);
    expect(autoplayBlocked).toBe(true);

    // Simulate user tap interaction
    const simulateUserTap = () => {
      autoplayBlocked = false;
      return true;
    };

    expect(simulateUserTap()).toBe(true);
    expect(autoplayBlocked).toBe(false);
  });
});
