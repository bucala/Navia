// Replaced after each production build so every release installs a fresh SW.
const CACHE_NAME = 'navia-app-__NAVIA_BUILD_ID__';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-32.png'];
// Only build-hashed static assets are runtime-cached — arbitrary paths and
// query variants must never fill storage.
const RUNTIME_ASSET_PATH = /^\/(assets|icons)\/[^?]+$/;
const MAX_RUNTIME_ENTRIES = 100;

async function cachePut(cache, request, response) {
  await cache.put(request, response);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_RUNTIME_ENTRIES))) {
    await cache.delete(key);
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put('/', copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match('/')) ?? Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok && RUNTIME_ASSET_PATH.test(url.pathname)) {
            const copy = response.clone();
            event.waitUntil(
              caches.open(CACHE_NAME).then((cache) => cachePut(cache, request, copy)),
            );
          }
          return response;
        }),
    ),
  );
});
