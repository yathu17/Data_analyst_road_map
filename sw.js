/* Bump this version whenever any locally cached application file changes. */
const CACHE = 'daily-data-offline-v1';
const APP_FILES = [
  './', './index.html', './style.css', './app.js', './content.js', './pwa.js',
  './icon.svg', './manifest.webmanifest', './icons/icon-192.png',
  './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png'
];
const FILE_URLS = new Set(APP_FILES.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('install', event => {
  // Install atomically: keep the old working version if a required file fails.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('daily-data-offline-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' && url.href.startsWith(self.registration.scope)) {
    // Keep HTML and its scripts from the same cached release. An updated worker
    // activates after existing app windows close, avoiding mixed-version lessons.
    event.respondWith(caches.open(CACHE).then(async cache =>
      (await cache.match('./index.html')) || fetch(request)
    ));
    return;
  }
  if (FILE_URLS.has(url.href)) {
    event.respondWith(caches.open(CACHE).then(async cache =>
      (await cache.match(request)) || fetch(request)
    ));
  }
});
