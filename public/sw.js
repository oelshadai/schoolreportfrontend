// Service worker for development
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

// Remove no-op fetch handler to avoid navigation overhead