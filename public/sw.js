// Wavo Progressive Web App Service Worker
const CACHE_NAME = 'wavo-cinema-v1';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/wavo-icon.png',
  '/wavo-logo.png',
  '/discover',
];

// Install: precache app shell and static branding
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('Precache partial miss (non-critical):', err);
      });
    })
  );
});

// Activate: clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Safe caching strategy
// IMPORTANT: NEVER cache private rooms, API endpoints, auth tokens, or media video streams
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Bypass non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Bypass API calls, realtime room endpoints, auth, and video streams
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/room/') ||
    url.pathname.includes('/auth') ||
    url.hostname.includes('youtube') ||
    url.hostname.includes('supabase') ||
    url.hostname.includes('tmdb') ||
    event.request.headers.get('range') ||
    url.pathname.match(/\.(mp4|webm|mkv|mov|ts|m3u8)$/i)
  ) {
    return;
  }

  // 3. Stale-while-revalidate for static assets; network-first for pages
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. Navigation requests: Network-first with offline shell fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/').then((fallback) => {
          return fallback || new Response(
            '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Wavo Offline</title><style>body{background:#08090B;color:#fff;font-family:sans-serif;text-align:center;padding:50px 20px;}h1{color:#D6A85F;}</style></head><body><h1>Wavo</h1><p>You appear to be offline. Reconnect to resume synchronized watch parties.</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        });
      })
    );
  }
});
