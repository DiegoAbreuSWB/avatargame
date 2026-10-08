/* Service worker (PWA): guarda os arquivos do jogo para jogar offline.
   Estratégia: arquivos locais em cache primeiro (cache-first); CDN (Three.js, fontes) em rede primeiro com cache de reserva.
   Só é registrado quando a página é servida por http(s); em file:// o navegador não permite. */
const VERSION = 'avatar-arena-v0.6.0';
const LOCAL = [
  './', './index.html', './css/style.css', './manifest.webmanifest',
  './js/config.js', './js/settings.js', './js/i18n.js', './js/audio.js', './js/music.js', './js/input.js', './js/gamepad.js', './js/touch.js',
  './js/particles.js', './js/characters.js', './js/draw.js', './js/stages.js', './js/projectiles.js', './js/fighter.js', './js/ai.js',
  './js/hud.js', './js/menus.js', './js/rig3d.js', './js/render3d.js', './js/game.js', './js/settings-ui.js', './js/modes.js', './js/content.js', './js/netplay.js', './js/online.js', './js/main.js',
  './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => Promise.allSettled(LOCAL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const sameOrigin = url.origin === self.location.origin;
  if (sameOrigin) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res; })));
  } else {
    e.respondWith(fetch(e.request).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return res; }).catch(() => caches.match(e.request)));
  }
});
