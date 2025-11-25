const CACHE_NAME = 'bao-pwa-v1';

// 使用相對路徑，但不快取 .tsx 檔案（因為它需要編譯）
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  // 跳過等待，立即啟動
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
      // 立即控制所有頁面
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // 只快取 GET 請求
  if (event.request.method !== 'GET') {
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
        // 網路優先策略：先嘗試從網路獲取
        return fetch(event.request).then((fetchResponse) => {
          // 如果是有效的回應，複製並快取它
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return fetchResponse;
        }).catch((error) => {
          console.log('Fetch failed:', error);
          // 如果網路失敗，嘗試從快取獲取
          return caches.match(event.request);
        });
      })
  );
});