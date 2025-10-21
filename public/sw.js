// Service Worker для My Weekly Planner PWA

const CACHE_NAME = 'planner-v1.0.0'
const API_CACHE_NAME = 'planner-api-v1.0.0'
const STATIC_CACHE_NAME = 'planner-static-v1.0.0'

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/chunks/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
]

// API эндпоинты для кэширования
const API_ENDPOINTS = [
  '/api/tasks',
  '/api/ideas',
  '/api/auth/session'
]

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('📦 Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
  )
})

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => self.clients.claim())
  )
})

// Перехват запросов
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Пропускаем chrome-extension и другие не-http запросы
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Обработка API запросов
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Обработка статических ресурсов
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      url.pathname === '/') {
    event.respondWith(handleStaticRequest(request))
    return
  }

  // Для остальных запросов пробуем сеть, потом кэш
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  )
})

// Обработка API запросов с офлайн-поддержкой
async function handleApiRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Сначала пробуем получить данные из сети
    const networkResponse = await fetch(request)
    
    // Если GET запрос - кэшируем ответ
    if (request.method === 'GET' && networkResponse.ok) {
      const responseClone = networkResponse.clone()
      const cache = await caches.open(API_CACHE_NAME)
      cache.put(request, responseClone)
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 Service Worker: Network failed, trying cache for', request.url)
    
    // Если сеть недоступна, пробуем кэш
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Для GET запросов возвращаем офлайн-данные
    if (request.method === 'GET') {
      return getOfflineApiResponse(url.pathname)
    }
    
    // Для остальных запросов возвращаем ошибку
    return new Response(
      JSON.stringify({ 
        error: 'Offline - no cached data available',
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Обработка статических запросов
async function handleStaticRequest(request) {
  try {
    // Сначала пробуем сеть
    const networkResponse = await fetch(request)
    
    // Кэшируем успешные ответы
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 Service Worker: Static request failed, trying cache')
    
    // Пробуем получить из кэша
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Если это главная страница и нет кэша, возвращаем офлайн-страницу
    if (request.url === self.location.origin + '/') {
      return caches.match('/offline.html')
    }
    
    // Для остальных ресурсов возвращаем ошибку
    return new Response('Resource not available offline', { status: 503 })
  }
}

// Офлайн-ответы для API
function getOfflineApiResponse(pathname) {
  const offlineData = {
    '/api/tasks': {
      data: [],
      message: 'Офлайн режим: показаны сохраненные задачи',
      offline: true
    },
    '/api/ideas': {
      data: [],
      message: 'Офлайн режим: показаны сохраненные идеи',
      offline: true
    },
    '/api/auth/session': {
      user: null,
      message: 'Офлайн режим: требуется повторная авторизация',
      offline: true
    }
  }
  
  const data = offlineData[pathname] || { 
    error: 'No offline data available',
    offline: true 
  }
  
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Синхронизация фоновых данных
self.addEventListener('sync', event => {
  console.log('🔄 Service Worker: Background sync', event.tag)
  
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks())
  }
})

// Синхронизация задач
async function syncTasks() {
  try {
    // Получаем все несинхронизированные задачи из IndexedDB
    const unsyncedTasks = await getUnsyncedTasks()
    
    for (const task of unsyncedTasks) {
      try {
        const response = await fetch('/api/tasks', {
          method: task.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task.data)
        })
        
        if (response.ok) {
          // Удаляем задачу из очереди синхронизации
          await removeTaskFromSyncQueue(task.id)
        }
      } catch (error) {
        console.error('Failed to sync task:', error)
      }
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

// Push уведомления
self.addEventListener('push', event => {
  console.log('📢 Service Worker: Push received')
  
  const options = {
    body: event.data ? event.data.text() : 'У вас новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('My Weekly Planner', options)
  )
})

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', event => {
  console.log('🔔 Service Worker: Notification click received')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Обработка сообщений от клиента
self.addEventListener('message', event => {
  console.log('💬 Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_Tasks') {
    event.waitUntil(
      caches.open(API_CACHE_NAME)
        .then(cache => cache.add('/api/tasks'))
    )
  }
})

// Периодическая синхронизация (если поддерживается)
self.addEventListener('periodicsync', event => {
  console.log('⏰ Service Worker: Periodic sync')
  
  if (event.tag === 'sync-tasks-periodic') {
    event.waitUntil(syncTasks())
  }
})

// Функции для работы с IndexedDB (для офлайн-очереди)
async function getUnsyncedTasks() {
  // Здесь должна быть реализация работы с IndexedDB
  // Временно возвращаем пустой массив
  return []
}

async function removeTaskFromSyncQueue(taskId) {
  // Здесь должна быть реализация удаления из IndexedDB
  console.log('Task synced:', taskId)
}

console.log('🚀 Service Worker: Loaded successfully')