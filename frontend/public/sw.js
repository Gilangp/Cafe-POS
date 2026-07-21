const CACHE_NAME = 'nemu-space-pwa-v1';
const STATIC_CACHE = 'nemu-space-static-v1';
const API_CACHE = 'nemu-space-api-v1';

const STATIC_ASSETS = [
  '/',
  '/menu',
  '/reservasi',
  '/artikel',
  '/galeri',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
];

// Install Event - Precache Core Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Precaching static assets for NEMU Space');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' }))).catch(err => {
        console.warn('[Service Worker] Precache partial error (non-fatal):', err);
      });
    })
  );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (![CACHE_NAME, STATIC_CACHE, API_CACHE].includes(name)) {
              console.log('[Service Worker] Deleting old cache:', name);
              return caches.delete(name);
            }
          })
        );
      });
    })
  );
});

// Fetch Event - Strategic Routing (Stale-While-Revalidate / Network-First / Offline Fallback)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignore non-GET requests and chrome-extension schemes
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API Caching Strategy (Network-First with Stale Cache Fallback for Landing Page & Menus)
  if (url.pathname.includes('/api/v1/landing-page') || url.pathname.includes('/api/v1/menus') || url.pathname.includes('/api/v1/categories')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clonedResponse = networkResponse.clone();
            caches.open(API_CACHE).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({
                success: true,
                message: 'Offline mode: Using cached or fallback dataset.',
                data: null,
                offline: true,
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // 2. Static Assets & Pages (Stale-While-Revalidate)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is a navigation, fallback to root or cached page
          if (event.request.mode === 'navigate' && !cachedResponse) {
            return caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
