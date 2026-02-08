// Service Worker for MyTehran Music Player PWA
// DISABLED: No cache for code files (HTML/CSS/JS) - only cache audio files
const CACHE_NAME = 'mytehran-music-v4-disabled';
const AUDIO_CACHE_NAME = 'mytehran-audio-v1';
const MAX_AUDIO_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit for audio cache

// Don't cache code files - always fetch from network
const urlsToCache = [];

// Install event - skip caching code files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install - Code caching disabled');
  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName.startsWith('mytehran-music-')) {
            console.log('Deleting old code cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip service worker for code files - let browser handle them directly
  const isCodeFile = url.pathname.match(/\.(html|css|js|json)$/i) || 
                     url.pathname === '/' ||
                     (url.pathname.endsWith('/') && url.hostname === self.location.hostname);
  
  // Don't intercept code files - let them load directly from network
  if (isCodeFile) {
    return; // Let browser handle it normally
  }
  
  // Check if it's an audio file
  const isAudioFile = url.pathname.match(/\.(mp3|m4a|ogg|wav)$/i) || 
                      url.hostname.includes('dl.mytehranmusic.com') ||
                      url.hostname.includes('mytehranmusic.com') && url.pathname.includes('.mp3');
  
  if (isAudioFile) {
    // Cache First strategy for audio files
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            // Return cached version
            return cachedResponse;
          }
          
          // Fetch from network and cache it
          return fetch(event.request).then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              // Clone the response before caching
              const responseToCache = response.clone();
              cache.put(event.request, responseToCache);
              
              // Clean up old cache if it gets too large
              cleanupAudioCache();
            }
            return response;
          }).catch(() => {
            // If network fails and no cache, return a placeholder or error
            return new Response('Audio not available offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        });
      })
    );
  } else {
    // For other files (images, etc.), use network first
    event.respondWith(
      fetch(event.request, {
        cache: 'no-store'
      }).catch(() => {
        // Try cache as fallback for non-code files
        return caches.match(event.request);
      })
    );
  }
});

// Clean up audio cache if it gets too large
async function cleanupAudioCache() {
  const cache = await caches.open(AUDIO_CACHE_NAME);
  const keys = await cache.keys();
  
  // Estimate cache size (rough calculation)
  let totalSize = 0;
  const entries = [];
  
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
      entries.push({ key, size: blob.size, timestamp: Date.now() });
    }
  }
  
  // If cache is too large, remove oldest entries
  if (totalSize > MAX_AUDIO_CACHE_SIZE) {
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest entries until we're under the limit
    for (const entry of entries) {
      if (totalSize <= MAX_AUDIO_CACHE_SIZE * 0.8) break; // Keep it at 80% of max
      await cache.delete(entry.key);
      totalSize -= entry.size;
    }
    
    console.log('Audio cache cleaned up. New size:', totalSize);
  }
}

// Activate event - clean up old code caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete all old code caches (keep only audio cache)
          if (cacheName.startsWith('mytehran-music-')) {
            console.log('Deleting old code cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients to ensure they use the new service worker
      return self.clients.claim();
    })
  );
});

