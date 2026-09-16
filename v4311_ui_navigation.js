/* RUTIN V43.11 — TITANIUM FINANCE CARDS + NAVIGATION BEHAVIOR */
(function(){
const esc2=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const n2=v=>Number(String(v??0).replace(',','.'))||0;
const m2=v=>money(n2(v));
window.rutinNavHistory=window.rutinNavHistory||[];
window.rutinCurrentScreen=window.rutinCurrentScreen||screen||'home';
const baseGo=go;
window.go=function(s){
  if(s==='investments'){window.financeTabV4310='investments';s='finance'}
  const cur=screen||'home';
  if(s!==cur && !window.__rutinBackNav){window.rutinNavHistory.push({screen:cur,financeTab:window.financeTabV4310||'cards'});if(window.rutinNavHistory.length>30)window.rutinNavHistory.shift()}
  window.__rutinBackNav=false;
  screen=s;modal=null;render();
};
window.goBackRutin=function(){
  modal=null;
  const prev=window.rutinNavHistory.pop();
  if(prev){window.__rutinBackNav=true;if(prev.financeTab)window.financeTabV4310=prev.financeTab;screen=prev.screen;render();return}
  screen='home';render();
};
// Premium header: back means actual previous screen; non-back is hamburger.
window.header=function(title='RUTİN',back=false){return `<div class="topbar"><button class="iconBtn luxuryIconBtn" onclick="${back?'goBackRutin()':"openModal('menu')"}">${back?'‹':'☰'}</button><div class="title brandTitle">${title==='RUTİN'&&window.rutinLogo?`${rutinLogo(30)}<span>RUTİN</span>`:title}</div><button class="iconBtn luxuryIconBtn settingsOnly" onclick="go('settings')" aria-label="Ayarlar"><span class="settingsGearV27">⚙</span></button></div>`};
function cardHTML(c,type){
 const isFlex=type==='flex', used=n2(c.balance), limit=n2(c.limit), avail=Math.max(0,limit-used), pct=limit?Math.min(100,Math.round(used/limit*100)):0;
 const title=esc2(c.name||(isFlex?'ESNEK HESAP':'KREDİ KARTI'));
 const click=isFlex?`openFlexMenuV4310('${c.id}')`:`openCardMenuV4310('${c.id}')`;
 return `<button class="titaniumVerticalCard ${isFlex?'flexTitanium':'creditTitanium'}" onclick="${click}">
   <div class="tvMetalLine"></div><div class="tvTop"><span class="tvChip">▦</span><span class="tvType">${isFlex?'ESNEK HESAP':'KREDİ KARTI'}</span><span class="tvContact">)))</span></div>
   <div class="tvBrand"><small>${isFlex?'FİNANS HESABI':'PREMIUM CARD'}</small><b>${title}</b></div>
   <div class="tvNumber">•••• &nbsp;•••• &nbsp;•••• &nbsp;0000</div>
   <div class="tvMetric main"><span>${isFlex?'KULLANILAN':'GÜNCEL BORÇ'}</span><strong>${m2(used)}</strong></div>
   <div class="tvMetricGrid"><div><span>TOPLAM LİMİT</span><b>${m2(limit)}</b></div><div><span>KULLANILABİLİR</span><b>${m2(avail)}</b></div></div>
   <div class="tvProgress"><i style="width:${pct}%"></i></div>
   ${!isFlex?`<div class="tvDates"><span>SON ÖDEME</span><b>${esc2(c.dueDate||'—')}</b></div>`:`<div class="tvDates"><span>KULLANIM ORANI</span><b>%${pct}</b></div>`}
   <div class="tvTap">DOKUN · İŞLEMLER <span>›</span></div>
 </button>`;
}
window.finance=function(){
 if(typeof state==='undefined')return '';
 state.cards=Array.isArray(state.cards)?state.cards:[];state.flexAccounts=Array.isArray(state.flexAccounts)?state.flexAccounts:[];state.investments=Array.isArray(state.investments)?state.investments:[];
 const tab=window.financeTabV4310||'cards';
 const cards=state.cards.map(c=>cardHTML(c,'card')).join('');
 const flex=state.flexAccounts.map(a=>cardHTML(a,'flex')).join('');
 const invCost=x=>n2(x.quantity)*n2(x.unitPrice)+n2(x.commission)+n2(x.extraCost);
 const inv=state.investments.map(x=>`<button class="inv4310Row" onclick="openModal('editInvestment4310:${x.id}')"><span class="inv4310Icon">◆</span><span><small>${esc2(x.type||'DİĞER')} · ${esc2(x.date||'')}</small><b>${esc2(x.name||'YATIRIM')}</b><em>${n2(x.quantity).toLocaleString('tr-TR')} × ${m2(x.unitPrice)}</em></span><strong>${m2(invCost(x))}</strong></button>`).join('');
 const invTotal=state.investments.reduce((a,x)=>a+invCost(x),0);
 return `${header('FİNANS',true)}<div class="finance4311"><div class="financeTabs4310"><button class="${tab==='cards'?'active':''}" onclick="setFinanceTabV4310('cards')">▰<span>KARTLAR</span></button><button class="${tab==='accounts'?'active':''}" onclick="setFinanceTabV4310('accounts')">◇<span>HESAPLAR</span></button><button class="${tab==='investments'?'active':''}" onclick="setFinanceTabV4310('investments')">◆<span>YATIRIMLAR</span></button></div>
 ${tab==='cards'?`<div class="fin4310Head"><div><small>FİNANS</small><b>KREDİ KARTLARIM</b></div><button onclick="openModal('addCard')">＋ KART EKLE</button></div><div class="verticalFinanceDeck">${cards||'<div class="notice">HENÜZ KREDİ KARTI YOK.</div>'}</div>`:''}
 ${tab==='accounts'?`<div class="fin4310Head"><div><small>FİNANS</small><b>ESNEK HESAPLAR</b></div><button onclick="openModal('addFlex')">＋ HESAP EKLE</button></div><div class="verticalFinanceDeck">${flex||'<div class="notice">HENÜZ ESNEK HESAP YOK.</div>'}</div>`:''}
 ${tab==='investments'?`<div class="fin4310Head"><div><small>TOPLAM GERÇEK MALİYET</small><b>${m2(invTotal)}</b></div><button onclick="openModal('investment4310')">＋ YATIRIM</button></div><div class="inv4310Note">CANLI FİYAT YOK · KÂR/ZARAR YOK · SADECE GERÇEK MALİYET</div><div class="inv4310List">${inv||'<div class="notice">HENÜZ YATIRIM KAYDI YOK.</div>'}</div>`:''}</div>`;
};
// Full hamburger list, all primary app areas.
const prevModalHtml=modalHtml;
window.modalHtml=function(k){
 if(k==='menu'){
  const items=[['home','⌂','ANA SAYFA'],['work','✓','ÇALIŞMA'],['expenses','₺','HARCAMALAR'],['calendar','31','TAKVİM'],['reports','▥','RAPORLAR'],['finance','▰','FİNANS'],['notes','✎','NOTLAR'],['profile','●','PROFİL'],['settings','⚙','AYARLAR']];
  return `<div class="modal menu4311Modal" onclick="safeBackdropClose(event)"><div class="sheet menu4311Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>UYGULAMA MENÜSÜ</b><button class="close" type="button" onclick="closeModal()">×</button></div><div class="menu4311List">${items.map(x=>`<button onclick="closeModal();go('${x[0]}')"><i>${x[1]}</i><b>${x[2]}</b><span>›</span></button>`).join('')}<button onclick="closeModal();financeTabV4310='investments';go('finance')"><i>◆</i><b>YATIRIMLAR</b><span>›</span></button></div></div></div>`;
 }
 return prevModalHtml(k);
};
// Seven primary destinations remain in one fixed row.
window.nav=function(){const items=[['home','⌂','ANA SAYFA','navHome'],['work','✓','İŞ','navWork'],['expenses','₺','HARCAMA','navExpense'],['calendar','31','TAKVİM','navCalendar'],['reports','▥','RAPOR','navReport'],['finance','▰','FİNANS','navInvest'],['more','•••','DAHA FAZLA','navMore']];return `<div class="navV37 nav4311Fixed">${items.map(x=>`<button class="${screen===x[0]?'active ':''}${x[3]}" onclick="go('${x[0]}')"><span class="navIconV37">${x[1]}</span><span class="navLabelV37">${x[2]}</span></button>`).join('')}</div>`};
})();
