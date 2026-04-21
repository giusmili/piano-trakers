const CACHE_NAME = 'piano-tracker-v1';

const STATIC_ASSETS = [
  '/',
  '/favicon/icon.svg',
];

// ── Install : précache les assets statiques ────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate : supprime les anciens caches ─────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch : stratégie selon le type de requête ─────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API → Network first, fallback cache (données fraîches si online)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Next.js chunks (_next/static) → Cache first (immutables, versionnés)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation (HTML) → Network first, fallback cache offline
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Tout le reste → Stale-while-revalidate
  event.respondWith(staleWhileRevalidate(request));
});

// ── Stratégies ─────────────────────────────────────────────────────────────

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached ?? new Response(JSON.stringify({ error: 'Hors ligne' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });
  return cached ?? networkPromise;
}
