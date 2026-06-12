/* ═══════════════════════════════════════════════════════════════
   Service Worker  |  Wayanad → Coimbatore PWA
   Strategy: Cache-first for assets, Network-first for tiles
═══════════════════════════════════════════════════════════════ */

const CACHE_NAME   = "cbe-wyd-v1.0";
const TILE_CACHE   = "wyd-tiles-v1";

/* Core app shell — always cached */
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

/* CDN assets — cached on first load */
const CDN_ASSETS = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
  "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
];

/* ─── Install ─────────────────────────────────────────────────── */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache static assets (critical)
      return cache.addAll(STATIC_ASSETS).then(() => {
        // Try CDN assets — don't fail install if CDN is unavailable
        return Promise.allSettled(
          CDN_ASSETS.map(url =>
            fetch(url, { mode: "cors" })
              .then(res => res.ok ? cache.put(url, res) : Promise.resolve())
              .catch(() => Promise.resolve())
          )
        );
      });
    }).then(() => self.skipWaiting())
  );
});

/* ─── Activate ────────────────────────────────────────────────── */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== TILE_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ─── Fetch ───────────────────────────────────────────────────── */
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // Map tiles — cache-then-network (stale-while-revalidate)
  if (
    url.hostname.includes("tile.openstreetmap.org") ||
    url.hostname.includes("basemaps.cartocdn.com") ||
    url.hostname.includes("cartodb-basemaps")
  ) {
    event.respondWith(tileStrategy(request));
    return;
  }

  // Bootstrap icons font files — cache first
  if (url.href.includes("bootstrap-icons") && (url.href.endsWith(".woff2") || url.href.endsWith(".woff"))) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // CDN assets — cache first
  if (
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("unpkg.com") ||
    url.hostname.includes("cdnjs.cloudflare.com")
  ) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // App shell — network first with cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Everything else — network first
  event.respondWith(networkFirst(request));
});

/* ─── Strategies ─────────────────────────────────────────────── */

/** Cache first → network fallback → cache update */
async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    return new Response("Offline – resource not cached.", { status: 503 });
  }
}

/** Network first → cache fallback */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (_) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Return offline page for navigation requests
    if (request.mode === "navigate") {
      const fallback = await caches.match("./index.html");
      if (fallback) return fallback;
    }
    return new Response("You are offline.", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

/** Map tile: return cached immediately, update in background */
async function tileStrategy(request) {
  const cache  = await caches.open(TILE_CACHE);
  const cached = await cache.match(request);

  const networkPromise = fetch(request).then(res => {
    if (res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);

  return cached || networkPromise || new Response("Tile unavailable offline", { status: 503 });
}

/* ─── Background sync message ─────────────────────────────────── */
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
