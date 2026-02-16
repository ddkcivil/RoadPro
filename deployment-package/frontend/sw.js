
const CACHE_NAME = 'roadmaster-v3'; // Updated version to clear old cache
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Skip Google Analytics requests to avoid blocking issues
  if (event.request.url.includes('google-analytics.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Skip TypeScript files in dev mode to avoid fetch errors
  if (event.request.url.includes('.ts') || event.request.url.includes('.tsx')) {
    return;
  }

  // Skip API requests to avoid caching and fetch errors
  if (event.request.url.includes('/api')) {
    return;
  }

  // Handle navigation requests separately from resource requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
    return;
  }

  // For other requests, try cache first then network
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background for static assets
          if (event.request.destination === 'script' || 
              event.request.destination === 'style' || 
              event.request.destination === 'image') {
            fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
            }).catch((error) => {
              console.warn('Background fetch failed for:', event.request.url, error);
            });
          }
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            // Only cache successful responses for appropriate content types
            if (event.request.destination === 'script' || 
                event.request.destination === 'style' || 
                event.request.destination === 'image' ||
                event.request.destination === 'font') {
              cache.put(event.request, networkResponse.clone());
            }
          }
          return networkResponse;
        }).catch((error) => {
          console.error('Network request failed:', event.request.url, error);
          throw error;
        });
      });
    }).catch((error) => {
      console.error('Cache operation failed:', event.request.url, error);
      return fetch(event.request.clone());
    })
  );
});
