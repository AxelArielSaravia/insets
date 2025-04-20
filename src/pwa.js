const CACHE_NAME = "dev-2025-04";

const onInstall = async function () {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([
        "/",
        "/style.css",
        "/script.js",
        "/icon.svg",
        "/apple-touch-iconx180.png",
        "/iconx96.png"
    ]);
    self.skipWaiting();
};

const onActivate = async function () {
    const cachesName = await caches.keys();
    let p = [];
    for (let cache of cachesName) {
        if (cache !== CACHE_NAME) {
            p.push(caches.delete(cache));
        }
    }
    await Promise.all(p);
    self.clients.claim();
};

const updateCache = async function (request, response) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response);
};

const RESPONSE_500 = {
    status: 500,
    statusText: "Internal Server Error"
};

const onFetch = async function (request) {
    const response = await caches.match(request); 
    if (response === undefined) {
        try {
            const networkResponse = await fetch(request);
            updateCache(request, networkResponse.clone());
            return networkResponse;
        } catch (err) {
            console.error("ServiceWorker fetch failed:", err);
            return new Response(
                "Service Worker: Network and cache unavailable",
                RESPONSE_500
            );
        }
    } else {
        return response;
    }
};

self.addEventListener("install", function (event) {
    event.waitUntil(onInstall());
});

self.addEventListener("activate", function (event) {
    event.waitUntil(onActivate());
});

self.addEventListener("fetch", function (event) {
    event.respondWith(onFetch(event.request));
});
