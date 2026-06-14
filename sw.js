/* =========================================================
   ✅ sw.js v1.4 — TANPA KEDIP 100%
   ⛔ TIDAK ADA LAGI: hapus notif lama sebelum buat baru
   ✅ Pakai tag SAMA + renotify:true = UPDATE ANGKA DI TEMPAT
   ✅ ongoing:true = ditetapkan sistem Android
   ========================================================= */
const VERSI = 'v1.3-taximeter-ok';

const CACHE_ASSETS = [
  './', './index.html', './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com','https://fonts.gstatic.com',
  'https://i.ibb.co.com/5WgtxmZy/file-000000009040720cb7c1798a425f4a4e.png',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c=>c.addAll(CACHE_ASSETS)).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSI).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if(u.hostname.includes('firebase')||u.hostname.includes('firebasedatabase')||e.request.method!=='GET') return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
    caches.open(VERSI).then(c=>c.put(e.request,res.clone())).catch(()=>{});
    return res;
  })));
});

// 🔔 INTI PERBAIKAN
self.addEventListener('message', e => {
  const d = e.data; if(!d) return;
  if(d.type === 'UPDATE_NOTIF'){
    e.waitUntil(
      self.registration.showNotification(d.title, {
        body: d.body || '',
        tag: 'taximeter-running',
        icon: d.icon || 'https://i.ibb.co.com/5WgtxmZy/file-000000009040720cb7c1798a425f4a4e.png',
        badge:'https://i.ibb.co.com/5WgtxmZy/file-000000009040720cb7c1798a425f4a4e.png',
        silent: true,
        renotify: true,
        ongoing: true,
        requireInteraction: false
      })
    );
  }
  if(d.type === 'CLOSE_NOTIF'){
    e.waitUntil(
      self.registration.getNotifications({tag:d.tag}).then(ns=>ns.forEach(n=>n.close()))
    );
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({type:'window',includeUncontrolled:true}).then(ls=>{
      for(const c of ls) if(c.url.includes('index')||c.url.endsWith('/')) return c.focus();
      return self.clients.openWindow('./index.html');
    })
  );
});
