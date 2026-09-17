/* RUTIN V43.15 — TASARIM V3: canonical icon + interaction language. Visual only. */
(function(){
'use strict';
const CAT={PAZAR:'🥬',YOL:'🚗',YEMEK:'🍽️',MARKET:'🛒',FATURA:'🧾',KİRA:'🏠',SAĞLIK:'❤️',ULAŞIM:'🚕',EĞLENCE:'🎉',YAKIT:'⛽',GİYİM:'👕',HARÇLIK:'₺',FIRIN:'🥖',CAFE:'☕',DİĞER:'✦'};
const FN={home:'⌂',work:'✓',expenses:'₺',calendar:'31',reports:'▥',finance:'▰',investments:'◆',notes:'✎',profile:'●',settings:'⚙',income:'＋₺',daily:'✓',hourly:'◷',overtime:'✦',cash:'₺',card:'▰',flex:'▥',menu:'☰',bell:'◔',backup:'⇩',theme:'✧',categories:'▦',search:'⌕',delete:'×'};
window.RUTIN_V3_ICONS={category:CAT,action:FN};
if(window.state){state.categoryMeta=state.categoryMeta&&typeof state.categoryMeta==='object'?state.categoryMeta:{};Object.keys(CAT).forEach(k=>{state.categoryMeta[k]=Object.assign({},state.categoryMeta[k]||{},{icon:CAT[k]})});}
window.rutinCategoryIcon=c=>CAT[String(c||'DİĞER').toLocaleUpperCase('tr-TR')]||'✦';

// Canonical fixed navigation. Destinations and click behavior are unchanged.
window.nav=function(){const items=[['home',FN.home,'ANA SAYFA','navHome'],['work',FN.work,'İŞ','navWork'],['expenses',FN.expenses,'HARCAMA','navExpense'],['calendar',FN.calendar,'TAKVİM','navCalendar'],['reports',FN.reports,'RAPOR','navReport'],['finance',FN.finance,'FİNANS','navInvest'],['more','•••','DAHA FAZLA','navMore']];return `<div class="navV37 nav4311Fixed v3UnifiedNav">${items.map(x=>`<button class="${screen===x[0]?'active ':''}${x[3]}" onclick="go('${x[0]}')"><span class="navIconV37">${x[1]}</span><span class="navLabelV37">${x[2]}</span></button>`).join('')}</div>`};

const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k==='menu'){
  const items=[['home',FN.home,'ANA SAYFA'],['work',FN.work,'ÇALIŞMA'],['expenses',FN.expenses,'HARCAMALAR'],['calendar',FN.calendar,'TAKVİM'],['reports',FN.reports,'RAPORLAR'],['finance',FN.finance,'FİNANS'],['notes',FN.notes,'NOTLAR'],['profile',FN.profile,'PROFİL'],['settings',FN.settings,'AYARLAR']];
  return `<div class="modal menu4311Modal" onclick="safeBackdropClose(event)"><div class="sheet menu4311Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>UYGULAMA MENÜSÜ</b><button class="close" type="button" onclick="closeModal()">×</button></div><div class="menu4311List v3MenuList">${items.map(x=>`<button onclick="closeModal();go('${x[0]}')"><i>${x[1]}</i><b>${x[2]}</b><span>›</span></button>`).join('')}<button onclick="closeModal();financeTabV4310='investments';go('finance')"><i>${FN.investments}</i><b>YATIRIMLAR</b><span>›</span></button></div></div></div>`;
 }
 return prevModal(k);
};

function canonicalize(root=document){
 const buttons=root.querySelectorAll?root.querySelectorAll('button,label,.premiumSetting,.expenseRowV24,.categoryAnalysisRow'):[];
 buttons.forEach(el=>{
  const t=(el.innerText||'').replace(/\s+/g,' ').trim().toLocaleUpperCase('tr-TR');
  let icon=null, cls='';
  const rules=[
   [/GELİR EKLE|GELİR$/,FN.income,'v3-income'],[/HARCAMA/,FN.expenses,'v3-expense'],[/SAATLİK/,FN.hourly,'v3-hourly'],[/MESAİ/,FN.overtime,'v3-overtime'],[/ÇALIŞTIM|GÜNLÜK ÇALIŞMA|ÇALIŞMA$/,FN.work,'v3-work'],[/TAKVİM/,FN.calendar,'v3-calendar'],[/RAPOR/,FN.reports,'v3-reports'],[/YATIRIM/,FN.investments,'v3-invest'],[/FİNANS|HESAPLAR/,FN.finance,'v3-finance'],[/NOTLAR?/,FN.notes,'v3-notes'],[/PROFİL/,FN.profile,'v3-profile'],[/AYARLAR/,FN.settings,'v3-settings'],[/YEDEK|GERİ YÜKLE/,FN.backup,'v3-backup'],[/TEMA/,FN.theme,'v3-theme'],[/KATEGORİLER/,FN.categories,'v3-categories']
  ];
  for(const r of rules){if(r[0].test(t)){icon=r[1];cls=r[2];break}}
  if(icon){const i=el.querySelector('i,.settingIcon,.qv32,.navIconV37');if(i && !i.classList.contains('expenseIconV24')){i.textContent=icon;i.classList.add('v3CanonicalIcon');el.classList.add(cls)}}
 });
 // Category icons: data/value or adjacent label text decides identity.
 root.querySelectorAll&&root.querySelectorAll('.catChip,.categoryAnalysisRow').forEach(el=>{const inp=el.querySelector('input[name="category"]');const name=(inp?.value||el.querySelector('span,b')?.textContent||'').trim().toLocaleUpperCase('tr-TR');const i=el.querySelector('i');if(i&&CAT[name]){i.textContent=CAT[name];i.classList.add('v3CatIcon','v3cat-'+name.replace(/[^A-ZÇĞİÖŞÜ0-9]/g,''));}});
 // Payment method icon consistency.
 root.querySelectorAll&&root.querySelectorAll('.payIcons label,.v18Pay label').forEach(el=>{const v=el.querySelector('input')?.value||'';const i=el.querySelector('i');if(!i)return;if(v==='NAKİT')i.textContent=FN.cash;else if(v==='KREDİ KARTI')i.textContent=FN.card;else if(v==='ESNEK HESAP')i.textContent=FN.flex;i.classList.add('v3CanonicalIcon')});
}
let queued=false;const run=()=>{queued=false;canonicalize(document)};new MutationObserver(()=>{if(!queued){queued=true;requestAnimationFrame(run)}}).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',run);setTimeout(run,0);
})();
