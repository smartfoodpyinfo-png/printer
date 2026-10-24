'use strict';
// Modo sin conexion de la pagina de etiquetas. Primero la red, asi una version publicada se ve
// en la primera apertura; sin red, o si la red no contesta en ESPERA_RED_MS (un wifi sin
// internet), lo guardado. El catalogo no vive aca: va en localStorage.
var CACHE = 'etiquetas-eminent-v1';
var ESPERA_RED_MS = 3000;

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE).then(function(cache) { return cache.add('./'); }).then(function() { return self.skipWaiting(); }));
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  var pedido = event.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== self.location.origin) return;
  var guardando = null;
  var red = fetch(pedido).then(function(respuesta) {
    if (respuesta.ok) {
      var copia = respuesta.clone();
      guardando = caches.open(CACHE).then(function(cache) { return cache.put(pedido, copia); });
    }
    return respuesta;
  });
  event.waitUntil(red.then(function() { return guardando; }).catch(function() {}));
  var guardada = function() { return caches.match(pedido, { ignoreSearch: true }); };
  var tarde = new Promise(function(resolve) { setTimeout(resolve, ESPERA_RED_MS); }).then(guardada).then(function(r) { return r || red; });
  event.respondWith(Promise.race([red, tarde]).catch(function() {
    return guardada().then(function(r) { return r || Response.error(); });
  }));
});
