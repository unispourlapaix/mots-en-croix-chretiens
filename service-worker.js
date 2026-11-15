// Service Worker pour Mots En Croix Chrétiens
const CACHE_NAME = 'mots-croix-v1.1.0';
const urlsToCache = [
  './',
  'index.html',
  'css/styles.css',
  'js/config.js',
  'js/i18n.js',
  'js/gameData.js',
  'js/game.js',
  'js/google-drive-save.js',
  'js/private-room.js',
  'js/realtime-lobby.js',
  'manifest.json'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
  // Ne pas skipWaiting automatiquement pour éviter les boucles infinies
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim seulement après nettoyage du cache
      return self.clients.claim();
    })
  );
});

// Stratégie de cache: Network First, fallback to Cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone la réponse
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Si le réseau échoue, utilise le cache
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              return response;
            }
            // Si pas dans le cache, retourne une page offline simple
            if (event.request.mode === 'navigate') {
              return caches.match(new URL('index.html', self.registration.scope).href);
            }
          });
      })
  );
});

// Gestion des messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
