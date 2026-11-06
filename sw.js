/* People — offline support.
   The app shell is cached on install; fonts and the spreadsheet reader are cached the first time they load. */
const CACHE = "people-v17";
const SHARE_CACHE = "people-share";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./config.js",
  "./privacy.html",
  "./terms.html"
];
const RUNTIME_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdnjs.cloudflare.com"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== SHARE_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // A contact shared to People from another app (Android share menu): keep it, then open the app to import it.
  if (req.method === "POST" && url.pathname.endsWith("/share-target")) {
    event.respondWith((async () => {
      try {
        const data = await req.formData();
        const cache = await caches.open(SHARE_CACHE);
        for (const k of await cache.keys()) await cache.delete(k);
        let i = 0;
        for (const f of data.getAll("contacts")) {
          if (f && typeof f !== "string") await cache.put(new URL("./__shared/file" + (i++), self.registration.scope).href, new Response(await f.text()));
        }
        const text = ["title", "text", "url"].map((k) => data.get(k)).filter((v) => typeof v === "string" && v.trim()).join("\n");
        if (text) await cache.put(new URL("./__shared/text", self.registration.scope).href, new Response(text));
      } catch (e) {}
      return Response.redirect(new URL("./?shared=1", self.registration.scope).href, 303);
    })());
    return;
  }
  if (req.method !== "GET") return;

  // Pages: try the network for the latest version, fall back to the cached app offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put("./index.html", copy)); return res; })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Settings file: always try the network first, so a new Client ID takes effect right after redeploying.
  if (url.origin === self.location.origin && url.pathname.endsWith("/config.js")) {
    event.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
    return;
  }

  // Our own files: cache first.
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })));
    return;
  }

  // Fonts and the spreadsheet library: serve the cached copy, refresh it in the background.
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(caches.open(CACHE).then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { if (res.ok || res.type === "opaque") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
