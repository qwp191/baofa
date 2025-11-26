const CACHE_NAME = 'bao-pwa-v1';
const BASE_PATH = '/baofa/';

// 使用絕對路徑
const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'icon-192.png',
  BASE_PATH + 'icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache).catch(err => {
            console.log('Cache addAll warning:', err);
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 只快取 GET 請求
  if (event.request.method !== 'GET') {
    return;
  }
  
  // 只處理同源請求
  if (!event.request.url.startsWith(self.location.origin + BASE_PATH)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Cache hit:', event.request.url);
          return response;
        }
        
        console.log('Fetching:', event.request.url);
        return fetch(event.request).then((fetchResponse) => {
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return fetchResponse;
        }).catch((error) => {
          console.log('Fetch failed:', error);
          return caches.match(event.request);
        });
      })
  );
});