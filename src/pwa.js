const CACHE_NAME = "0.1.0";

const waitCache = function(cache) {
    return cache.addAll([
        "/",
        "/style.css",
        "/script.js",
        "/icon.svg",
        "/apple-touch-iconx180.png",
        "/iconx96.png"
    ]);
};

const waitFetch = async function (request) {
    const response = await caches.match(request);
    if (response === undefined) {
        const netResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, netResponse.clone());
        return netResponse;
    }
    return response;
};

self.addEventListener("install", function (event) {
    console.info("INSTALLED")
    event.waitUntil(caches.open(CACHE_NAME).then(waitCache))
});
self.addEventListener("activate", function (event) {
    console.info("INSTALLED")
});

self.addEventListener("fetch", function (event) {
    event.respondWith(waitFetch(event.request));
});
