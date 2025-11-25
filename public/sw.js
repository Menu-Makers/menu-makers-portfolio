// Development-friendly service worker for Menu Makers portfolio
const CACHE_NAME = 'menu-makers-dev-v1';
const urlsToCache = [
  // Minimal caching for development
];

// Install event - skip caching in development
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all caches
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - always fetch from network (no caching)
self.addEventListener('fetch', (event) => {
  // Always fetch from network to get fresh content
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Only use cache as fallback for offline scenarios
        return caches.match(event.request);
      })
  );
});
