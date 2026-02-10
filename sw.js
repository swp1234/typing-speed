// Typing Speed Test - Service Worker
const CACHE_NAME = 'typing-speed-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/i18n.js',
    '/js/word-data.js',
    '/manifest.json',
    '/icon-192.svg',
    '/icon-512.svg',
    '/js/locales/ko.json',
    '/js/locales/en.json',
    '/js/locales/zh.json',
    '/js/locales/hi.json',
    '/js/locales/ru.json',
    '/js/locales/ja.json',
    '/js/locales/es.json',
    '/js/locales/pt.json',
    '/js/locales/id.json',
    '/js/locales/tr.json',
    '/js/locales/de.json',
    '/js/locales/fr.json'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Cache First strategy
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    // Cache hit - return cached version, but also fetch update
                    fetch(event.request).then(fetchResponse => {
                        if (fetchResponse && fetchResponse.status === 200) {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, fetchResponse);
                            });
                        }
                    }).catch(() => {});
                    return response;
                }
                return fetch(event.request).catch(() => {
                    return new Response('Offline', { status: 503 });
                });
            })
    );
});
