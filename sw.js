const CACHE_NAME = 'anime-lol-core-v2';
const OFFLINE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './1000371388.png'
];

// 1. Instalación: Guardar archivos base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activación: Limpieza total de basura técnica
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Estrategia de Red: Evitar que el caché bloquee la API
self.addEventListener('fetch', (event) => {
  // Si la petición es a la API de Jikan o YouTube, que vaya directo a internet
  if (event.request.url.includes('jikan.moe') || event.request.url.includes('youtube')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  } else {
    // Para archivos locales (CSS, Imágenes propias), usar caché si existe
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
