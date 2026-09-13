const C='rutin-v6-27-3';
const STATIC=[
  './',
  './index.html',
  './styles.css?v=6.27.3',
  './app-v6-27.js?v=6.27.3',
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
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;

  const freshFirst=req.mode==='navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

  if(freshFirst){
    event.respondWith(
      fetch(req,{cache:'no-store'})
        .then(res=>{
          if(res && res.ok){
            const copy=res.clone();
            caches.open(C).then(cache=>cache.put(req,copy)).catch(()=>{});
          }
          return res;
        })
        .catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(caches.match(req).then(hit=>hit||fetch(req)));
});
