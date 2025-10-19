self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Pass-through fetch (placeholder for future caching)
self.addEventListener('fetch', () => {
  // No-op
});

