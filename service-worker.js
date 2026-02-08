// Service Worker for MyTehran Music Player PWA
const CACHE_NAME = 'mytehran-music-v3';
const AUDIO_CACHE_NAME = 'mytehran-audio-v1';
const MAX_AUDIO_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit for audio cache

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
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
    // For other files, use Network First strategy
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request);
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

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

