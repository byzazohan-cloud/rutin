const C='rutin-v6-21';
const STATIC=['./','./index.html','./styles.css?v=6.21','./app-v6-21.js?v=6.21','./manifest.json','./icon.svg','./icon-180.png','./icon-512.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c=>c.addAll(STATIC)));
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;

  const freshFirst =
    e.request.mode==='navigate' ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css');

  if(freshFirst){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .then(res=>{
          if(res && res.ok){
            const copy=res.clone();
            caches.open(C).then(c=>c.put(e.request,copy));
          }
          return res;
        })
        .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
