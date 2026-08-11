// Deliberately minimal: this app shows LIVE data from Google Sheets,
// so there's no real value in caching pages for offline use — an
// offline "installed app" would just show stale well data. This
// service worker exists mainly to satisfy the browser's installability
// criteria (an active SW with a fetch handler), passing every request
// straight through to the network.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
