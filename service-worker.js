// Nombre de la caché (cámbialo cuando hagas una nueva versión)
const CACHE_NAME = "anime-lol-cache-v1";

// Archivos básicos que se precachean para funcionar offline
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./manifest.json",
  "./1000371388.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// Instalación: precache del app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // Activa el SW nuevo inmediatamente
  self.skipWaiting();
});

// Activación: limpieza de cachés viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first con fallback a red
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // Solo manejamos GET
  if (request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).catch(() => {
        // Si falla la red y no está en caché, devolvemos nada
        return cachedResponse;
      });
    })
  );
});
