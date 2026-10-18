import { describe, it, expect } from 'vitest';
import { validateStreamingUrl, extractYouTubeVideoId, STREAMING_PROVIDERS } from '../src/lib/streaming-providers';
import { convertSrtToVtt } from '../src/lib/subtitle-parser';

describe('Media Browser & Streaming Security', () => {
  it('validates official streaming provider URLs securely', () => {
    // Valid official provider URLs
    expect(validateStreamingUrl('https://www.netflix.com/title/80018294').isValid).toBe(true);
    expect(validateStreamingUrl('https://www.youtube.com/watch?v=ByXuk9QqQkk').isValid).toBe(true);
    expect(validateStreamingUrl('https://www.amazon.com/Prime-Video').isValid).toBe(true);
    expect(validateStreamingUrl('https://www.disneyplus.com').isValid).toBe(true);

    // Malicious / Insecure schemes
    expect(validateStreamingUrl('javascript:alert(1)').isValid).toBe(false);
    expect(validateStreamingUrl('data:text/html,<script>evil()</script>').isValid).toBe(false);
    expect(validateStreamingUrl('file:///C:/passwords.txt').isValid).toBe(false);

    // Unapproved external domains
    expect(validateStreamingUrl('https://malicious-phishing-site.com').isValid).toBe(false);
    expect(validateStreamingUrl('').isValid).toBe(false);
  });

  it('correctly extracts 11-character YouTube video IDs from diverse link formats', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=ByXuk9QqQkk')).toBe('ByXuk9QqQkk');
    expect(extractYouTubeVideoId('https://youtu.be/ByXuk9QqQkk')).toBe('ByXuk9QqQkk');
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/ByXuk9QqQkk?rel=0')).toBe('ByXuk9QqQkk');
    expect(extractYouTubeVideoId('ByXuk9QqQkk')).toBe('ByXuk9QqQkk');
    expect(extractYouTubeVideoId('invalid_short')).toBeNull();
  });

  it('accurately converts SubRip (.srt) subtitles to standard WebVTT format', () => {
    const srtSample = `1
00:01:20,000 --> 00:01:23,500
Chihiro, don't look back until you reach the tunnel.

2
00:01:25,100 --> 00:01:28,000
Thank you, Haku!`;

    const vtt = convertSrtToVtt(srtSample);
    expect(vtt).toContain('WEBVTT');
    expect(vtt).toContain('00:01:20.000 --> 00:01:23.500');
    expect(vtt).toContain('Chihiro, don\'t look back until you reach the tunnel.');
    expect(vtt).toContain('00:01:25.100 --> 00:01:28.000');
    expect(vtt).not.toContain('00:01:20,000');
  });

  it('guarantees streaming providers have appropriate DRM and sync specifications', () => {
    const netflix = STREAMING_PROVIDERS.find((p) => p.id === 'netflix');
    expect(netflix).toBeDefined();
    expect(netflix?.drmType).toContain('Widevine');
    expect(netflix?.syncSupported).toBe(false); // Honest distinction: external app launch

    const youtube = STREAMING_PROVIDERS.find((p) => p.id === 'youtube');
    expect(youtube).toBeDefined();
    expect(youtube?.syncSupported).toBe(true); // Official IFrame API supports synchronized playback
  });
});
