const CACHE_NAME = "task-tracker-v1";
const PRECACHE_URLS = ["/dashboard", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache Supabase auth, API routes, or external requests
  if (
    url.hostname.includes("supabase") ||
    url.pathname.startsWith("/auth/") ||
    url.pathname.startsWith("/api/")
  ) {
    return;
  }

  // Navigation requests: network-first, fall back to cached /dashboard
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/dashboard"))
    );
    return;
  }

  // Static assets: cache-first
  if (
    url.pathname.includes("/_next/static/") ||
    url.pathname.match(/\.(svg|png|ico|woff2?|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
    return;
  }

  // Everything else: network only
  event.respondWith(fetch(request));
});
