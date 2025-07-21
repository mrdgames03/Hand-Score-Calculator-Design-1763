// Cache name with version - update version to force cache refresh
const CACHE_NAME = 'hand-score-calculator-v3';

// App shell and critical assets to cache
const APP_SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './logo192.png',
  './logo512.png'
];

// Font assets to cache with CORS support
const FONT_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap',
  'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-aXFmZw.woff2',
  'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hGA-aXFmZw.woff2',
  'https://fonts.gstatic.com/s/cairo/v28/SLXgc1nY6HkvangtZmpQdkhzfH5lkSs2SgRjCAGMQ1z0hOA-aXE.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4AMP6lQ.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2'
];

// External image assets
const EXTERNAL_IMAGES = [
  'https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1752690093494-maysalward-primary-logo-landscape.png'
];

// All content to cache
const CACHE_CONTENT = [...APP_SHELL_FILES, ...FONT_ASSETS, ...EXTERNAL_IMAGES];

// Install service worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();

  // Precache app shell and content
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Caching app shell and content');
      
      // Cache items individually to handle CORS issues
      const cachePromises = CACHE_CONTENT.map(async (url) => {
        try {
          // Set appropriate request mode based on URL
          const isCrossOrigin = !url.startsWith(self.location.origin) && 
                               !url.startsWith('./') && 
                               !url.startsWith('/');
          
          const requestOptions = {
            mode: isCrossOrigin ? 'cors' : 'same-origin',
            credentials: isCrossOrigin ? 'omit' : 'same-origin',
            cache: 'no-cache',
            redirect: 'follow'
          };
          
          // Special handling for Google Fonts and external images
          if (url.includes('fonts.googleapis.com') || 
              url.includes('fonts.gstatic.com') ||
              EXTERNAL_IMAGES.includes(url)) {
            requestOptions.mode = 'cors';
            requestOptions.credentials = 'omit';
          }
          
          const request = new Request(url, requestOptions);
          
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log(`[Service Worker] Cached: ${url}`);
          } else {
            console.warn(`[Service Worker] Failed to cache: ${url} - ${response.status}`);
          }
        } catch (error) {
          console.warn(`[Service Worker] Error caching: ${url}`, error);
        }
      });
      
      // Wait for all cache operations to complete
      await Promise.allSettled(cachePromises);
      console.log('[Service Worker] Initial caching complete');
      return;
    })
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Special handling for font requests
  if (url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('fonts.gstatic.com')) {
    
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('[SW] Serving cached font:', url.pathname);
          return response;
        }
        
        console.log('[SW] Fetching font:', url.pathname);
        return fetch(event.request.url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache'
        }).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch((error) => {
          console.error('[SW] Font fetch error:', error);
          // Return a fallback empty response for fonts
          return new Response('', { status: 200, statusText: 'OK' });
        });
      })
    );
    return;
  }

  // Special handling for external images
  if (EXTERNAL_IMAGES.some(img => event.request.url.includes(img))) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          console.log('[SW] Serving cached image:', url.pathname);
          return response;
        }
        
        console.log('[SW] Fetching image:', url.pathname);
        return fetch(event.request.url, {
          mode: 'cors',
          credentials: 'omit',
          cache: 'no-cache'
        }).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        }).catch(error => {
          console.error('[SW] Image fetch error:', error);
          return new Response('', { 
            status: 200, 
            statusText: 'OK',
            headers: new Headers({ 'Content-Type': 'image/png' })
          });
        });
      })
    );
    return;
  }

  // Standard cache strategy for other requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return from cache if found
      if (response) {
        return response;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache non-success responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache successful responses from our origin
        if (url.origin === self.location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }

        return networkResponse;
      }).catch(error => {
        console.error('[SW] Fetch error:', error);
        
        // For HTML navigation requests, return the offline page
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
        
        // Otherwise just fail
        throw error;
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event && event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || 'New update in Hand Score Calculator',
      icon: './logo192.png',
      badge: './logo192.png'
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Hand Score Calculator', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});