// public/service-worker.js
const CACHE_NAME = 'blissbloomly-v2'; // 🔴 bump version to force update

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
  // ❌ DO NOT hardcode /static/js/*.js — CRA hashes change
];

/* =======================
   INSTALL
======================= */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

/* =======================
   ACTIVATE
======================= */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );

      if (self.clients && self.clients.claim) {
        await self.clients.claim();
      }
    })()
  );
});

/* =======================
   FETCH  ✅ FIXED HERE
======================= */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 🚫 DO NOT CACHE API CALLS
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // ✅ Cache-first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((networkResponse) => {
          // Cache only valid GET requests
          if (
            request.method === 'GET' &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Optional offline fallback
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

/* =======================
   PUSH NOTIFICATIONS
======================= */
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from BlissBloomly!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    }
  };

  event.waitUntil(
    self.registration.showNotification('BlissBloomly', options)
  );
});

/* =======================
   NOTIFICATION CLICK
======================= */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
