/// <reference lib="webworker" />

const CACHE_NAME = "balray-autos-v1";
const STATIC_CACHE = "balray-static-v1";

// Only cache truly static assets — NOT pages, NOT API, NOT Supabase
const STATIC_PATTERNS = [
  /\/_next\/static\//,
  /\.(?:png|jpg|jpeg|webp|avif|svg|gif|ico)$/i,
  /\.(?:woff|woff2|ttf|otf|eot)$/i,
  /\/manifest\.json$/,
];

function isStaticAsset(url) {
  return STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname));
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache: non-GET requests, cross-origin, Supabase, Google Analytics
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Cache static assets — cache-first, fall back to network
  if (isStaticAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (response.ok && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch (err) {
          return cached || Response.error();
        }
      })()
    );
    return;
  }

  // Everything else: network only (never cache HTML / RSC / Supabase)
});

// Allow the page to trigger an update
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});