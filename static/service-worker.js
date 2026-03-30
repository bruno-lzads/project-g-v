
// const CACHE_NAME = "gestao-cache-v4";
const STATIC_CACHE = "static-v4"

// Arquivos essenciais (app shell)
const urlsToCache = [
    "/",
    "/encarregado/",
    "/static/icon-192.png",
    "/static/icon-512.png",
    "/static/js/api.js",
    "/static/js/db.js",
    "/static/js/sync.js",
    "/static/js/dashboard.js",
];

// Instalação
self.addEventListener("install", event => {
    console.log("Service worker: Instalando...");

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(urlsToCache))
    );
    

    // event.waitUntil(
    //     caches.open(STATIC_CACHE)
    //         .then(cache => {
    //             console.log("Cache criado")
    //             return cache.addAll(urlsToCache)
    //         })  
    // );

    self.skipWaiting(); //ativa imediatamente
});

// ACTIVATE (limpa cache antigo)
self.addEventListener("activate", event => {
    console.log("Service worker: Ativado!")

    event.waitUntil(
        caches.keys().then(keys => {
            Promise.all(
                keys.map(key => {
                    if (key !== STATIC_CACHE) {
                        console.log("Removendo cache antigo:", key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    self.clients.claim();
});

// FETCH STRATEGIES

self.addEventListener("fetch", event => {
    const url = event.request.url;

    // API -> Network first (dados sempre atualizados)
    if (url.includes("/api/")) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    // OUTROS -> Cache First ( rápido + offline)
    event.respondWith(cacheFirst(event.request));

});

// STRATEGY: NETWORK FIRST

async function networkFirst(request) {
    try {
        return await fetch(request);
        //const response = await fetch(request);

        //const cache = await caches.open(STATIC_CACHE);
        //cache.put(request, response.clone());

        //return response;
    } catch (error) {
        console.log("Offline (API). Tentando cache...");

        return caches.match(request);

        //const cached = await caches.match(request);
        //return cached || new Response(JSON.stringify([]), {
            //headers: {"Content-Type": "application/json"}
        //});
    }
}

// STRATEGY: CACHE FIRST

async function cacheFirst(request) {
    const cached = await caches.match(request);

    if (cached) return cached;

    try {
        const response = await fetch(request);

        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());

        return response;
    } catch (error) {
        console.log("Offline total");

        // falback simples
        if (request.destination === "document") {
            return caches.match("/");
        }
    }
}











// self.addEventListener("fetch", event => {
//     event.respondWith(
//         caches.match(event.request)
//             .then(response => {
//                 return response || fetch(event.request);
//         })
//     );
// });