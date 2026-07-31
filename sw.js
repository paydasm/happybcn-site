/* HappyBCN service worker — network-first for the app shell so live deploys always win;
   cache is only an offline fallback. Workspace data (Supabase) is handled by the app, not here. */
const CACHE = 'happybcn-v43';
const PRECACHE = [
  '/', '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never intercept Supabase REST/realtime — the app manages offline data + edit queue itself.
  if (url.hostname.endsWith('supabase.co')) return;
  // App shell / navigations: network-first (fresh deploy when online), cache fallback offline.
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('/', cp)); return r; })
        .catch(() => caches.match('/').then(r => r || caches.match('/index.html')))
    );
    return;
  }
  // Other assets (supabase-js lib, icons, manifest): cache-first, refresh in background.
  e.respondWith(
    caches.match(req).then(c => c || fetch(req).then(r => {
      const cp = r.clone();
      if (r.ok || r.type === 'opaque') caches.open(CACHE).then(cc => cc.put(req, cp));
      return r;
    }).catch(() => c))
  );
});
