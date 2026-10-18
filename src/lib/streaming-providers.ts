import { StreamingProvider } from '@/types/media-browser';

export const STREAMING_PROVIDERS: StreamingProvider[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    tagline: 'Trailers, clips & public video content',
    url: 'https://www.youtube.com',
    launchType: 'embedded_api',
    description:
      'Full in-app playback supported via the official YouTube IFrame Player API. Supports real-time room synchronized play, pause, and seek.',
    requiresAccount: false,
    drmType: 'Standard',
    syncSupported: true,
    accentColor: '#FF0000',
    badge: '100% In-App Sync',
    instructions:
      'Search or paste any YouTube video link. Videos that permit embedding play directly in Wavo with live synchronized party playback.',
    logoSvgName: 'Youtube',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    tagline: 'Movies, TV shows & original cinema',
    url: 'https://www.netflix.com',
    launchType: 'official_app_tab',
    description:
      'Access your personal Netflix account securely. Netflix requires Widevine L1/L3 hardware DRM and enforces X-Frame-Options: DENY in standard web browsers.',
    requiresAccount: true,
    drmType: 'Widevine L1/L3',
    syncSupported: false,
    accentColor: '#E50914',
    badge: 'Official Provider Access',
    instructions:
      'Opens Netflix securely in an isolated browser window or official app. Sign in with your own credentials directly. Use Wavo party chat and countdown sync to watch with friends.',
    logoSvgName: 'Tv',
  },
  {
    id: 'prime',
    name: 'Amazon Prime Video',
    tagline: 'Prime originals, blockbuster films & channels',
    url: 'https://www.amazon.com/Prime-Video',
    launchType: 'official_app_tab',
    description:
      'Access your Amazon Prime Video collection. Requires Amazon account authentication and PlayReady/Widevine protected media pipeline.',
    requiresAccount: true,
    drmType: 'PlayReady',
    syncSupported: false,
    accentColor: '#00A8E1',
    badge: 'Official Provider Access',
    instructions:
      'Opens Prime Video securely in an isolated browser surface. Your credentials stay 100% private on Amazon’s secure servers.',
    logoSvgName: 'Film',
  },
  {
    id: 'disney',
    name: 'Disney+',
    tagline: 'Disney, Pixar, Marvel, Star Wars & Nat Geo',
    url: 'https://www.disneyplus.com',
    launchType: 'official_app_tab',
    description:
      'Stream family classics, sci-fi franchises, and originals on Disney+ with your personal account.',
    requiresAccount: true,
    drmType: 'Widevine L1/L3',
    syncSupported: false,
    accentColor: '#113CCF',
    badge: 'Official Provider Access',
    instructions:
      'Launches Disney+ official portal. Party participants can coordinate play times using Wavo audio/text lobby.',
    logoSvgName: 'Sparkles',
  },
  {
    id: 'max',
    name: 'Max',
    tagline: 'HBO originals, Warner Bros. films & DC',
    url: 'https://play.max.com',
    launchType: 'official_app_tab',
    description:
      'Stream premium HBO productions, critically acclaimed dramas, and Warner Bros. cinema.',
    requiresAccount: true,
    drmType: 'Widevine L1/L3',
    syncSupported: false,
    accentColor: '#002BE7',
    badge: 'Official Provider Access',
    instructions:
      'Opens Max securely in a dedicated tab with official DRM certification.',
    logoSvgName: 'Crown',
  },
];

// Whitelist of strictly permitted streaming domains
const PERMITTED_HOSTS = [
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
  'netflix.com',
  'www.netflix.com',
  'amazon.com',
  'www.amazon.com',
  'primevideo.com',
  'www.primevideo.com',
  'disneyplus.com',
  'www.disneyplus.com',
  'max.com',
  'play.max.com',
  'tv.apple.com',
  'crunchyroll.com',
  'www.crunchyroll.com',
];

/**
 * Validates whether an external URL is safe, uses HTTPS, and targets an approved streaming host
 */
export function validateStreamingUrl(rawUrl: string): {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
} {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { isValid: false, error: 'URL must be a non-empty string.' };
  }

  const trimmed = rawUrl.trim();

  // Explicitly reject harmful schemes
  if (
    trimmed.toLowerCase().startsWith('javascript:') ||
    trimmed.toLowerCase().startsWith('data:') ||
    trimmed.toLowerCase().startsWith('vbscript:') ||
    trimmed.toLowerCase().startsWith('file:')
  ) {
    return { isValid: false, error: 'Insecure URL scheme rejected for security.' };
  }

  try {
    const parsed = new URL(trimmed);

    // Require HTTPS in production
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { isValid: false, error: 'Only HTTPS destinations are permitted.' };
    }

    const hostname = parsed.hostname.toLowerCase();
    const isPermitted = PERMITTED_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );

    if (!isPermitted) {
      return {
        isValid: false,
        error: `Host "${hostname}" is not in the approved streaming provider list.`,
      };
    }

    return { isValid: true, sanitizedUrl: parsed.toString() };
  } catch (err) {
    return { isValid: false, error: 'Malformed URL syntax.' };
  }
}

/**
 * Extracts a YouTube Video ID from any standard YouTube URL (watch?v=, youtu.be, embed/)
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.slice(1).split('?')[0];
      return id.length === 11 ? id : null;
    }

    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v');
      if (v && v.length === 11) return v;

      if (url.pathname.includes('/embed/')) {
        const id = url.pathname.split('/embed/')[1]?.split('?')[0];
        if (id && id.length === 11) return id;
      }
    }
  } catch {
    // Regex fallback
    const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) return match[1];
  }

  return null;
}
