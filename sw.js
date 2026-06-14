/* =========================================================
   sw.js Taxi Meter Driver Kolaka
   ✅ Diganti TOTAL, bukan ditambah
   ✅ Notifikasi sistem jalan saat PWA diminimalkan
   ✅ Cache cerdas: cepat tapi data selalu akurat
   ========================================================= */
const VERSI = 'v1.2-taximeter-kolaka'; // ubah angka ini tiap update agar otomatis ter-refresh

// Daftar file yang disimpan di HP agar buka lebih cepat & bisa offline
const DAFTAR_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://i.ibb.co.com/5WgtxmZy/file-000000009040720cb7c1798a425f4a4e.png',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
];

// 🔽 SAAT PERTAMA KALI DIPASANG
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSI).then(cache => cache.addAll(DAFTAR_CACHE)).catch(()=>{})
  );
  self.skipWaiting(); // langsung aktif tanpa harus tutup-buka ulang
});

// 🔽 SAAT VERSI BARU ADA → HAPUS YANG LAMA
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(daftar => 
      Promise.all(daftar.filter(nama => nama !== VERSI).map(nama => caches.delete(nama)))
    )
  );
  self.clients.claim(); // kuasai semua tab yang terbuka
});

// 🔽 STRATEGI AMBIL DATA: CACHE DULU BARU UPDATE, KECUALI FIREBASE & LOKASI
self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);

  // ❌ JANGAN PERNAH CACHE: Firebase, database, lokasi, API — HARUS SELALU BARU
  if(
    url.hostname.includes('firebase') ||
    url.hostname.includes('firebasedatabase') ||
    url.hostname.includes('googleapis') && url.pathname.includes('maps') ||
    req.method !== 'GET'
  ) return;

  // ✅ LAINNYA: kasih yang ada di cache dulu, sambil diupdate di belakang
  e.respondWith(
    caches.match(req).then(ada => {
      const ambilBaru = fetch(req)
        .then(res => {
          // simpan yang baru ke cache
          const salinan = res.clone();
          caches.open(VERSI).then(c => c.put(req, salinan)).catch(()=>{});
          return res;
        })
        .catch(()=> ada);
      return ada || ambilBaru;
    })
  );
});

// =========================================================
// 🔔 INTI FITUR BARU: KENDALI NOTIFIKASI DARI INDEX.HTML
// =========================================================

// ✅ PERINTAH: BUAT / PERBARUI NOTIF DI ATAS
self.addEventListener('message', e => {
  const data = e.data;
  if(!data) return;

  // 🔄 Perbarui angka tarif di notifikasi yang sudah ada
  if(data.type === 'UPDATE_NOTIF'){
    e.waitUntil(
      self.registration.getNotifications({ tag: data.tag })
        .then(list => {
          // hapus yang lama biar tidak numpuk
          list.forEach(n => n.close());
          // tampilkan yang baru dengan angka terkini
          return self.registration.showNotification(data.title, {
            body: data.body || '',
            tag: data.tag || 'taximeter-running',
            icon: data.icon || 'https://i.ibb.co.com/5WgtxmZy/file-000000009040720cb7c1798a425f4a4e.png',
            badge: 'https://i.ibb.co.com/5WgtxmZy/file-000000009040720cb7c1798a425f4a4e.png',
            silent: true,    // ⚠️ PENTING: TIDAK BERBUNYI TIAP DETIK
            renotify: true,  // ⚠️ BOLEH DIPERBARUI TERUS
            requireInteraction: false // otomatis bisa hilang nanti
          });
        })
    );
  }

  // ❌ Perintah: HAPUS / HILANGKAN notifikasi
  if(data.type === 'CLOSE_NOTIF'){
    e.waitUntil(
      self.registration.getNotifications({ tag: data.tag })
        .then(list => list.forEach(n => n.close()))
    );
  }
});

// ✅ JIKA DIKLIK NOTIFNYA → LANGSUNG BUKA APLIKASI
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(daftar => {
        // kalau sudah terbuka, pindah ke sana
        for(const klien of daftar){
          if(klien.url && klien.url.includes('index.html') || klien.url === '/' || klien.url.endsWith('/')){
            return klien.focus();
          }
        }
        // kalau belum terbuka, buka baru
        if(self.clients.openWindow) return self.clients.openWindow('./index.html');
      })
  );
});
