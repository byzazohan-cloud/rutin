/* RUTIN V43.16.8 — swipe navigation + scroll/history memory + clickable home + longer recent records */
(function(){
'use strict';
const MAIN=['home','work','expenses','calendar','reports','finance','more'];
const screenScroll=window.rutinScreenScrollV43168=window.rutinScreenScrollV43168||{};
let lastRendered=(typeof screen!=='undefined'&&screen)||'home';
let restoring=false;
const y=()=>Math.max(0,window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0);
const rafScroll=(v)=>requestAnimationFrame(()=>requestAnimationFrame(()=>{restoring=true;window.scrollTo(0,Math.max(0,Number(v)||0));setTimeout(()=>restoring=false,30)}));
function saveScrollFor(s){if(!s||restoring)return;screenScroll[s]=y();}
function navEntry(s){return {screen:s,financeTab:window.financeTabV4310||'cards',scrollY:screenScroll[s]||0};}

// Render wrapper: keep the previous screen's position and restore the destination's remembered position.
const baseRender43168=window.render;
window.render=function(){
  try{saveScrollFor(lastRendered);}catch(_){ }
  const destination=(typeof screen!=='undefined'&&screen)||'home';
  baseRender43168();
  lastRendered=destination;
  const target=window.__rutinRestoreScrollV43168!=null?window.__rutinRestoreScrollV43168:(screenScroll[destination]||0);
  window.__rutinRestoreScrollV43168=null;
  rafScroll(target);
  requestAnimationFrame(()=>{bindSwipe43168();bindHomeClicks43168();});
};

// One navigation implementation at the final layer so earlier overrides cannot lose scroll state.
window.go=function(s){
  if(s==='investments'){window.financeTabV4310='investments';s='finance';}
  const cur=(typeof screen!=='undefined'&&screen)||'home';
  saveScrollFor(cur);
  if(s!==cur && !window.__rutinBackNav){
    window.rutinNavHistory=window.rutinNavHistory||[];
    window.rutinNavHistory.push(navEntry(cur));
    if(window.rutinNavHistory.length>40)window.rutinNavHistory.shift();
  }
  window.__rutinBackNav=false;
  screen=s;modal=null;
  window.__rutinRestoreScrollV43168=screenScroll[s]||0;
  window.render();
};
window.goBackRutin=function(){
  modal=null;
  const cur=(typeof screen!=='undefined'&&screen)||'home';saveScrollFor(cur);
  const prev=(window.rutinNavHistory||[]).pop();
  if(prev){
    window.__rutinBackNav=true;
    if(prev.financeTab)window.financeTabV4310=prev.financeTab;
    screen=prev.screen||'home';
    window.__rutinRestoreScrollV43168=Number(prev.scrollY??screenScroll[screen]??0)||0;
    window.render();
    window.__rutinBackNav=false;
    return;
  }
  screen='home';window.__rutinRestoreScrollV43168=screenScroll.home||0;window.render();
};

// Horizontal swipe between bottom-navigation screens. Ignore controls, sheets and horizontal scrollers.
let sx=0,sy=0,tracking=false,startedOnControl=false;
function bindSwipe43168(){
 const root=document.querySelector('main.phone'); if(!root||root.dataset.swipe43168)return; root.dataset.swipe43168='1';
 root.addEventListener('touchstart',e=>{
   if(!e.touches||e.touches.length!==1)return;
   const t=e.target;startedOnControl=!!t.closest('input,textarea,select,button,a,.modal,.sheet,.tabs,.workChoice,.v43166CategoryGrid,.quick,.navV37');
   sx=e.touches[0].clientX;sy=e.touches[0].clientY;tracking=true;
 },{passive:true});
 root.addEventListener('touchend',e=>{
   if(!tracking){return;} tracking=false;if(startedOnControl)return;
   const p=e.changedTouches&&e.changedTouches[0];if(!p)return;
   const dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.35)return;
   const cur=(typeof screen!=='undefined'&&screen)||'home',i=MAIN.indexOf(cur);if(i<0)return;
   const ni=dx<0?i+1:i-1;if(ni>=0&&ni<MAIN.length)window.go(MAIN[ni]);
 },{passive:true});
}

// Make home summaries explicitly interactive after render; preserve the existing HTML/CSS structure.
function bindHomeClicks43168(){
 if(((typeof screen!=='undefined'&&screen)||'')!=='home')return;
 const stats=[...document.querySelectorAll('.stats .stat')];
 stats.forEach((el,i)=>{
   if(el.dataset.click43168)return;el.dataset.click43168='1';el.classList.add('statClick43168');el.setAttribute('role','button');el.tabIndex=0;
   const act=()=>i<2?openModal('day:'+iso()):go('reports');
   el.addEventListener('click',act);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
 });
 document.querySelectorAll('.summaryBox .summaryRow').forEach(el=>{
   if(el.dataset.click43168)return;el.dataset.click43168='1';el.classList.add('summaryClick43168');el.setAttribute('role','button');el.tabIndex=0;
   const act=()=>openModal('day:'+iso());el.addEventListener('click',act);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
 });
}

// Longer recent work list (same record semantics, only 8 -> 30).
window.workRows=function(type){
 const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
 const a=(state.work||[]).filter(x=>x.type===type).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,30);
 return a.length?a.map(x=>{const rc=(state.expenses||[]).filter(r=>String(r.workId||'')===String(x.id)&&String(r.category||'').toLocaleUpperCase('tr-TR')==='YOL'),rt=rc.reduce((n,r)=>n+(+r.amount||0),0);return `<button class="v436WorkRow" onclick="openRecordV435('work','${E(x.id)}')"><div class="ico">${type==='daily'?'✓':type==='hourly'?'◷':'★'}</div><div class="v436WorkText"><b>${E(x.title||'ÇALIŞMA')}</b><small>${E(x.date||'')}${x.hours?' · '+E(x.hours)+' SAAT':''}${rt?' · YOL '+money(rt):''}</small><em class="paid">KAZANÇ / ÖDEME DETAYI İÇİN DOKUN</em></div><strong>${money(x.amount||0)}</strong><span>›</span></button>`}).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>';
};

// Keep scroll value current while user moves around long lists.
let scrollTimer=0;window.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const s=(typeof screen!=='undefined'&&screen)||lastRendered;screenScroll[s]=y();},80)},{passive:true});

requestAnimationFrame(()=>{bindSwipe43168();bindHomeClicks43168();});
})();
