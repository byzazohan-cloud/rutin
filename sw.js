const CACHE='rutin-clean-v2-v43.16.4.1-clean';
const CORE=['./','./index.html','./styles.css','./app.js','./clean_v2_upgrade.js','./clean_v2_v13.js','./v18_upgrade.js','./v43_calendar_final.js','./v43_calendar_v432.js','./v434_home_details.js','./v4341_actions_fix.js','./v435_global_record_actions.js','./v436_work_premium.js','./v437_work_roads.js','./v438_road_grouping.js','./v4310_finance_investments.js','./v43101_reports_pwa_fix.js','./v4311_ui_navigation.js','./v43111_layout_hotfix.js','./v43112_header_icons_fix.js','./v4312_quality_ui.js','./v4313_search_full_edit.js','./v43132_data_delete.js','./v4315_design_v3_icons.js','./v4316_accounting_core.js','./v43162_work_reports.js','./v43163_cards_reports_fix.js','./v43164_daily_salary_migration.js','./manifest.json','./icon.svg','./icon-180.png','./icon-512.png'];
self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CACHE);
    await Promise.allSettled(CORE.map(url=>cache.add(url)));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  event.respondWith((async()=>{
    try{
      const fresh=await fetch(event.request,{cache:'no-store'});
      if(fresh && fresh.ok){
        const cache=await caches.open(CACHE);
        cache.put(event.request,fresh.clone()).catch(()=>{});
      }
      return fresh;
    }catch(_){
      return (await caches.match(event.request)) || (await caches.match('./index.html'));
    }
  })());
});
