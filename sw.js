const CACHE='rutin-clean-v2-v43.12.3';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('rutin-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  e.respondWith((async()=>{
    try{return await fetch(e.request,{cache:'no-store'});}
    catch(err){
      const cached=await caches.match(e.request);
      if(cached)return cached;
      return new Response('RUTİN şu anda ağ bağlantısına ulaşamıyor. İnternet bağlantısını kontrol edip tekrar deneyin.',{
        status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}
      });
    }
  })());
});
