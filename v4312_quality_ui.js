/* RUTIN V43.12 TEST — UI quality, modal/keyboard safety, no data migration */
(function(){
  // Keep every mutation on the existing state model. This layer is presentation/interaction only.
  const oldOpen=window.openModal;
  if(typeof oldOpen==='function') window.openModal=function(k){ oldOpen(k); requestAnimationFrame(()=>enhanceModal4312()); };
  const oldRender=window.render;
  if(typeof oldRender==='function') window.render=function(){ oldRender(); requestAnimationFrame(()=>{enhanceUI4312();enhanceModal4312();}); };

  window.enhanceUI4312=function(){
    document.querySelectorAll('.section > span[onclick], .chartTap, .fin4310Head > button, .finance42Head > button').forEach(el=>el.classList.add('miniPremiumBtn4312'));
    document.querySelectorAll('button, .section>b, .sheetHead>b, .title, .navLabelV37').forEach(el=>el.classList.add('caps4312'));
  };
  window.enhanceModal4312=function(){
    const modal=document.querySelector('.modal'); if(!modal)return;
    modal.classList.add('modal4312');
    const sheet=modal.querySelector('.sheet'); if(sheet)sheet.classList.add('sheet4312');
    const close=modal.querySelector('.sheetHead .close');
    if(close){ close.type='button'; close.setAttribute('aria-label','Kapat'); close.onclick=function(ev){ev.preventDefault();ev.stopPropagation(); if(typeof window.closeModal==='function')window.closeModal();}; }
    modal.querySelectorAll('input,select,textarea').forEach(el=>{
      if(el.dataset.kb4312)return; el.dataset.kb4312='1';
      el.addEventListener('focus',()=>setTimeout(()=>el.scrollIntoView({block:'center',behavior:'smooth'}),180));
    });
  };
  function fitKeyboard(){
    const vv=window.visualViewport; if(!vv)return;
    document.documentElement.style.setProperty('--vvh4312',Math.round(vv.height)+'px');
    const active=document.activeElement;
    if(active && /INPUT|SELECT|TEXTAREA/.test(active.tagName)) setTimeout(()=>active.scrollIntoView({block:'center',behavior:'smooth'}),40);
  }
  if(window.visualViewport){visualViewport.addEventListener('resize',fitKeyboard);visualViewport.addEventListener('scroll',fitKeyboard);fitKeyboard();}
  document.addEventListener('focusin',e=>{if(e.target&&/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))setTimeout(()=>e.target.scrollIntoView({block:'center',behavior:'smooth'}),160)});
  document.addEventListener('DOMContentLoaded',()=>{enhanceUI4312();enhanceModal4312();});
})();
