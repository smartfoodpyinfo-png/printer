'use strict';
// Modo sin conexion de la pagina de etiquetas. Responde con lo guardado, asi
// abre al instante aunque el wifi no tenga internet, y en segundo plano baja la
// version nueva para la proxima vez. El catalogo no vive aca: va en localStorage.
var CACHE = 'etiquetas-eminent-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE).then(function(cache) { return cache.add('./'); }).then(function() { return self.skipWaiting(); }));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  var pedido = event.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  var red = fetch(pedido).then(function(respuesta) {
    if (!respuesta.ok) return respuesta;
    var copia = respuesta.clone();
    return caches.open(CACHE).then(function(cache) { return cache.put(pedido, copia); })
      .then(function() { return respuesta; }, function() { return respuesta; });
  });
  event.waitUntil(red.catch(function() {}));
  event.respondWith(caches.match(pedido, { ignoreSearch: true }).then(function(guardada) { return guardada || red; }));
});
