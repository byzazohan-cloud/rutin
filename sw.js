const C='rutin-v6-28-2';
const STATIC=[
  './',
  './index.html',
  './styles.css?v=6.28.2',
  './app-v6-28.js?v=6.28.2',
  './manifest.json',
  './icon.svg',
  './icon-180.png',
  './icon-512.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(C).then(cache=>cache.addAll(STATIC)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('rutin-') && k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  const freshFirst=event.request.mode==='navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if(freshFirst){
    event.respondWith(
      fetch(event.request,{cache:'no-store'})
        .then(res=>{
          if(res && res.ok){
            const copy=res.clone();
            caches.open(C).then(cache=>cache.put(event.request,copy)).catch(()=>{});
          }
          return res;
        })
        .catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
