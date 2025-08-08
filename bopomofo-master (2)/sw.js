const CACHE_NAME = 'bopomofo-master-v2'; // Bump version
const urlsToCache = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/metadata.json',
  '/components/GameScreen.tsx',
  '/components/ModeSelector.tsx',
  '/components/Icons.tsx',
  '/services/geminiService.ts',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap',
  'https://esm.sh/react@^19.1.1',
  'https://esm.sh/react-dom@^19.1.1/client',
  'https://esm.sh/@google/genai@^1.13.0',
  'https://esm.sh/canvas-confetti@^1.9.3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Don't cache API calls or serverless function calls.
  if (
    event.request.method !== 'GET' ||
    requestUrl.origin.includes('generativelanguage.googleapis.com') ||
    requestUrl.pathname.startsWith('/.netlify/')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return from cache if available.
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise, fetch from the network.
        return fetch(event.request);
      })
  );
});