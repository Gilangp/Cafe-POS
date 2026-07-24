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

// Fetch Event - Strategic Routing
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ====================================================================
  // PENTING: Jangan pernah intersep request API apapun.
  // Biarkan semua request ke /api/v1/* langsung ke network tanpa cache.
  // Ini mencegah error "Failed to convert value to Response" pada
  // request POST/PUT/DELETE yang tidak bisa di-cache oleh Service Worker.
  // ====================================================================
  if (url.pathname.startsWith('/api/')) {
    return; // Biarkan browser menangani sendiri, SW tidak ikut campur
  }

  // Ignore non-GET requests, chrome-extension, dan non-http schemes
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. API Landing Page & Menu: Caching (Network-First dengan Stale Fallback)
  if (
    url.pathname.includes('/api/v1/landing-page') ||
    url.pathname.includes('/api/v1/menus') ||
    url.pathname.includes('/api/v1/categories')
  ) {
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
        .catch((err) => {
          console.error('[Service Worker] Fetch failed:', err);
          // Jika offline dan request navigasi, fallback ke root
          if (event.request.mode === 'navigate' && !cachedResponse) {
            return caches.match('/').then(res => res || Response.error());
          }
          return Response.error();
        });

      // Harus selalu mereturn Response, jika undefined akan TypeError
      return cachedResponse || fetchPromise.then(res => res || Response.error());
    })
  );
});
