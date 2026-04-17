const CACHE_NAME = 'trinetra-v5'; // Final Bump to clear all caches
const ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/app.js?v=2.0.1',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap'
];

// Install Event - skip waiting so new SW activates immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching static assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event - claim all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('Deleting old cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - NETWORK FIRST strategy
// Always go to the network for HTML pages so we get fresh content
// Fall back to cache only for static assets if network fails
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // For HTML navigation requests, always go NETWORK FIRST
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // For other requests (fonts, icons), use Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
