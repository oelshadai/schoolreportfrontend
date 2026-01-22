// Production Service Worker for Elite Tech School Management
const CACHE_NAME = 'elite-tech-v1.2.0'
const API_CACHE_NAME = 'elite-tech-api-v1.1.0'

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/favicon.svg'
]

// API endpoints to cache (GET requests only)
const API_CACHE_PATTERNS = [
  /\/api\/schools\/dashboard\//,
  /\/api\/students\//,
  /\/api\/teachers\//,
  /\/api\/schools\/classes\//
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('SW: Installing service worker')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('SW: Activating service worker')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.startsWith('/icons/') ||
      STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(handleStaticAsset(request))
    return
  }

  // Handle navigation requests (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
})

// Cache-first strategy for static assets
async function handleStaticAsset(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('SW: Static asset fetch failed:', error)
    return new Response('Asset not available', { status: 404 })
  }
}

// Network-first strategy for API requests with cache fallback
async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request)
    
    // Cache successful GET responses for specific endpoints
    if (networkResponse.ok && shouldCacheApiResponse(request.url)) {
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('SW: API request failed, trying cache:', error)
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Network unavailable', 
        message: 'Please check your internet connection' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Network-first strategy for navigation
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    console.log('SW: Navigation failed, serving cached index.html')
    const cachedResponse = await caches.match('/index.html')
    return cachedResponse || new Response('App not available offline', { status: 404 })
  }
}

// Check if API response should be cached
function shouldCacheApiResponse(url) {
  return API_CACHE_PATTERNS.some(pattern => pattern.test(url))
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('SW: Background sync triggered')
    event.waitUntil(handleBackgroundSync())
  }
})

// Background sync handler
async function handleBackgroundSync() {
  // Implement offline action queue processing here
  console.log('SW: Processing offline actions')
}

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: data.actions || []
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  const urlToOpen = event.notification.data.url || '/dashboard'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})