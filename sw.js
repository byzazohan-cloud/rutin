const C='rutin-v6-25';self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','./index.html','./styles.css?v=6.25','./app-v6-25.js?v=6.25','./manifest.json','./icon.svg','./icon-180.png','./icon-512.png'])))});self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k))))));
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  e.respondWith(
    caches.match(req).then(hit=>hit||fetch(req).then(res=>{
      if(res && res.ok){
        const copy=res.clone();
        caches.open(C).then(c=>c.put(req,copy));
      }
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
