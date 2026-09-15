const CACHE='rutin-clean-v2-v35';
const FILES=[
  './',
  './index.html',
  './styles.css?v=v35',
  './app.js?v=v35',
  './clean_v2_upgrade.js?v=v35',
  './clean_v2_v13.js?v=v35',
  './v18_upgrade.js?v=v35',
  './manifest.json',
  './icon.svg',
  './icon-180.png',
  './icon-512.png'
];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).catch(()=>{}));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message',event=>{
  if(event.data&&event.data.type==='SKIP_WAITING') self.skipWaiting();
  if(event.data&&event.data.type==='CLEAR_OLD_CACHES'){
    event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  }
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;

  const freshFirst = event.request.mode==='navigate' || /\.(?:js|css|html)$/.test(url.pathname);
  if(freshFirst){
    event.respondWith((async()=>{
      try{
        const res=await fetch(event.request,{cache:'no-store'});
        if(res&&res.ok){
          const cache=await caches.open(CACHE);
          cache.put(event.request,res.clone()).catch(()=>{});
        }
        return res;
      }catch(e){
        return (await caches.match(event.request)) || (await caches.match('./index.html'));
      }
    })());
    return;
  }

  event.respondWith((async()=>{
    const hit=await caches.match(event.request);
    if(hit) return hit;
    try{return await fetch(event.request,{cache:'no-store'});}catch(e){return hit;}
  })());
});
