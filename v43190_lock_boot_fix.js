/* RUTIN V43.18.10 — LOCK BOOT FIX
   Prevents the legacy PIN screen from flashing before the V43.18.8 lock override loads.
   No data model or feature behavior changes. */
(function(){
'use strict';

function finishBoot43190(){
  try{
    // Re-render once after every patch file has loaded so the final lock-screen renderer is used.
    if(typeof window.render==='function') window.render();
    else if(typeof render==='function') render();
  }catch(_){ /* keep the last successfully rendered UI */ }

  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      const guard=document.getElementById('rutinBootGuard');
      if(guard) guard.remove();
      const app=document.getElementById('app');
      if(app) app.style.visibility='visible';
      document.documentElement.classList.add('rutinBootReady');
    });
  });
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',finishBoot43190,{once:true});
}else{
  finishBoot43190();
}
})();
