/* Offline shell for the agenda. Every file of the app goes into one cache named after this build, so the app opens
   with no connection. A new build is a new sw.js: the browser installs it, it fetches the new files, and the page offers
   to reload. Only this site's own files are handled here: GitHub and anything else go straight to the network. */
const CACHE = "agenda-0e0337e119a2";
const FILES = ["./", "index.html", "manifest.webmanifest", "fondo.jpg", "icon-192.png", "icon-512.png", "icon-maskable.png", "apple-touch-icon.png"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('agenda-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = (await cache.match(req, { ignoreSearch: true }))
      || (req.mode === 'navigate' ? (await cache.match('./')) || (await cache.match('index.html')) : undefined);
    if (hit) return hit;
    try { return await fetch(req); }
    catch (err) { return Response.error(); }
  })());
});
