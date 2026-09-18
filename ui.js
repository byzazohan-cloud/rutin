
/* ===== v43101_reports_pwa_fix.js ===== */
(function(){
'use strict';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
const M=v=>typeof money==='function'?money(Number(v)||0):(Number(v)||0).toFixed(2)+' ₺';
const WA=x=>typeof workAmount==='function'?workAmount(x):(Number(x.amount)||((Number(x.hours)||0)*(Number(x.rate)||0))||0);
window.rutinReportCustom=window.rutinReportCustom||{start:'',end:''};
function today(){return typeof iso==='function'?iso(new Date()):new Date().toISOString().slice(0,10)}
function range(){
 const p=(typeof reportPeriod!=='undefined'?reportPeriod:'month');
 if(p==='custom'&&window.rutinReportCustom.start&&window.rutinReportCustom.end){let s=window.rutinReportCustom.start,e=window.rutinReportCustom.end;if(s>e)[s,e]=[e,s];return{start:s,end:e,label:'ÖZEL TARİH'};}
 const n=new Date(), y=n.getFullYear(), m=n.getMonth();
 if(p==='day'){const d=today();return{start:d,end:d,label:'BUGÜN'}}
 if(p==='week'){const d=new Date(n),q=(d.getDay()+6)%7,s=new Date(d);s.setDate(d.getDate()-q);const e=new Date(s);e.setDate(s.getDate()+6);return{start:iso(s),end:iso(e),label:'BU HAFTA'}}
 if(p==='year')return{start:y+'-01-01',end:y+'-12-31',label:String(y)};
 const last=new Date(y,m+1,0).getDate(),mm=String(m+1).padStart(2,'0');return{start:y+'-'+mm+'-01',end:y+'-'+mm+'-'+String(last).padStart(2,'0'),label:n.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase()};
}
function data(){const r=range(),inside=x=>x&&x.date>=r.start&&x.date<=r.end,w=(state.work||[]).filter(inside),i=(state.incomes||[]).filter(inside),e=(state.expenses||[]).filter(inside),d=w.filter(x=>x.type==='daily'),h=w.filter(x=>x.type==='hourly'),o=w.filter(x=>x.type==='overtime');return{r,w,i,e,d,h,o,dt:d.reduce((n,x)=>n+WA(x),0),ht:h.reduce((n,x)=>n+WA(x),0),ot:o.reduce((n,x)=>n+WA(x),0),it:i.reduce((n,x)=>n+(Number(x.amount)||0),0),et:e.reduce((n,x)=>n+(Number(x.amount)||0),0)}}
function row(kind,x){const amount=kind==='work'?WA(x):Number(x.amount)||0,label=kind==='work'?(x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ'):kind==='income'?(x.title||'DİĞER GELİR'):(x.category||'HARCAMA');return `<button class="globalRecordRowV435" onclick="openRecordV435('${kind}','${E(x.id)}')"><i>${kind==='expense'?'−':kind==='income'?'₺':'▣'}</i><div><b>${E(label)}</b><small>${E(x.date||'')}${x.hours?' · '+E(x.hours)+' SAAT':''}${kind==='expense'?' · '+E(x.method||'NAKİT'):''} · AYRINTI</small></div><strong class="${kind==='expense'?'red':kind==='income'?'green':'gold'}">${kind==='expense'?'-':'+'}${M(amount)}</strong><span>›</span></button>`}
function expenseGroups(a){const z={};a.forEach(x=>{const k=x.category||'DİĞER';(z[k]||(z[k]=[])).push(x)});return Object.entries(z).sort((a,b)=>b[1].reduce((n,x)=>n+(+x.amount||0),0)-a[1].reduce((n,x)=>n+(+x.amount||0),0));}
window.applyReportRangeV43101=function(){const s=document.getElementById('rrs43101')?.value,e=document.getElementById('rre43101')?.value;if(!s||!e){alert('BAŞLANGIÇ VE BİTİŞ TARİHİNİ SEÇ.');return}window.rutinReportCustom={start:s,end:e};reportPeriod='custom';closeModal();render();};
const oldModal=window.modalHtml;
window.modalHtml=function(k){if(k==='range'){const r=range();return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>TARİH ARALIĞI</b><button class="close" onclick="closeModal()">×</button></div><div class="rangeV439"><label>BAŞLANGIÇ<input id="rrs43101" type="date" value="${E(window.rutinReportCustom.start||r.start)}"></label><label>BİTİŞ<input id="rre43101" type="date" value="${E(window.rutinReportCustom.end||r.end)}"></label><button class="primary" onclick="applyReportRangeV43101()">RAPORU UYGULA</button></div></div></div>`}return oldModal(k)};
function tabs(){const p=reportPeriod,b=(k,l)=>`<button class="${p===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`;return `<div class="tabs">${b('day','GÜNLÜK')}${b('week','HAFTALIK')}${b('month','AYLIK')}${b('year','YILLIK')}<button class="${p==='custom'?'active':''}" onclick="openModal('range')">ÖZEL TARİH</button></div>`}
window.openReportIncome43101=function(){openModal('reportIncome43101')};window.openReportExpense43101=function(){openModal('reportExpense43101')};
const modal2=window.modalHtml;window.modalHtml=function(k){if(k==='reportIncome43101'){const b=data(),all=[...b.w.map(x=>['work',x]),...b.i.map(x=>['income',x])].sort((a,c)=>(c[1].date||'').localeCompare(a[1].date||''));return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GELİR DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="reportBreakGridV439"><div><small>GÜNLÜK</small><b>${M(b.dt)}</b><em>${b.d.length} KAYIT</em></div><div><small>SAATLİK</small><b>${M(b.ht)}</b><em>${b.h.reduce((n,x)=>n+(+x.hours||0),0)} SAAT</em></div><div><small>MESAİ</small><b>${M(b.ot)}</b><em>${b.o.reduce((n,x)=>n+(+x.hours||0),0)} SAAT</em></div><div><small>DİĞER</small><b>${M(b.it)}</b><em>${b.i.length} KAYIT</em></div></div>${all.map(z=>row(z[0],z[1])).join('')||'<div class="notice">KAYIT YOK.</div>'}</div></div>`}if(k==='reportExpense43101'){const b=data(),g=expenseGroups(b.e);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GİDER DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="reportCatsV439">${g.map(([k,a])=>`<div><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(k):'₺'}</i><span><small>${E(k)}</small><b>${M(a.reduce((n,x)=>n+(+x.amount||0),0))}</b></span><em>${a.length}</em></div>`).join('')||'<div class="notice">KAYIT YOK.</div>'}</div>${b.e.slice().sort((a,c)=>(c.date||'').localeCompare(a.date||'')).map(x=>row('expense',x)).join('')||'<div class="notice">KAYIT YOK.</div>'}</div></div>`}return modal2(k)};
window.reports=function(){const b=data(),income=b.dt+b.ht+b.ot+b.it,expense=b.et,net=income-expense,max=Math.max(1,income,expense),all=[...b.w.map(x=>['work',x]),...b.i.map(x=>['income',x])].sort((a,c)=>(c[1].date||'').localeCompare(a[1].date||''));return `${header('RAPORLAR',true)}${tabs()}<div class="section"><b>${E(b.r.label)}</b><span>${E(b.r.start)} / ${E(b.r.end)}</span></div><div class="reportGrid"><div class="reportBox"><small>TOPLAM GELİR</small><strong class="green">${M(income)}</strong></div><div class="reportBox"><small>TOPLAM HARCAMA</small><strong class="red">${M(expense)}</strong></div><div class="reportBox"><small>NET KAZANÇ</small><strong>${M(net)}</strong></div></div><div class="section"><b>GELİR / GİDER</b><span>GRAFİĞE DOKUN</span></div><div class="dualDonutWrap"><button class="donutCard reportChartBtnV439" onclick="openReportIncome43101()"><div class="donutRing incomeRing" style="--pct:${Math.round(income/max*100)}"><div class="donutCenter"><small>GELİR</small><strong class="green">${M(income)}</strong></div></div><div class="donutLegend"><i class="incomeDot"></i><span>GELİR DETAYI ›</span></div></button><button class="donutCard reportChartBtnV439" onclick="openReportExpense43101()"><div class="donutRing expenseRing" style="--pct:${Math.round(expense/max*100)}"><div class="donutCenter"><small>GİDER</small><strong class="red">${M(expense)}</strong></div></div><div class="donutLegend"><i class="expenseDot"></i><span>GİDER DETAYI ›</span></div></button></div><div class="section"><b>ÇALIŞMA ÖZETİ</b><span>AYRI HESAPLANIR</span></div><div class="summaryBox">${sumRow('GÜNLÜK ÇALIŞMA',b.d.length+' KAYIT · '+M(b.dt))}${sumRow('SAATLİK ÇALIŞMA',b.h.reduce((n,x)=>n+(+x.hours||0),0)+' SAAT · '+M(b.ht))}${sumRow('MESAİ',b.o.reduce((n,x)=>n+(+x.hours||0),0)+' SAAT · '+M(b.ot))}${sumRow('DİĞER GELİRLER',M(b.it))}</div><div class="section"><b>GELİR HAREKETLERİ</b><span>${all.length} KAYIT</span></div>${all.map(z=>row(z[0],z[1])).join('')||'<div class="notice">KAYIT YOK.</div>'}<div class="section"><b>GİDER HAREKETLERİ</b><span>${b.e.length} KAYIT</span></div>${b.e.slice().sort((a,c)=>(c.date||'').localeCompare(a.date||'')).map(x=>row('expense',x)).join('')||'<div class="notice">KAYIT YOK.</div>'}`};
window.detailReport=window.reports;
})();

;

/* ===== v4311_ui_navigation.js ===== */
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

;

/* ===== v43111_layout_hotfix.js ===== */
/* RUTIN V43.11.1 — bottom nav alignment + home quick actions + header actions */
(function(){
  // Header: keep reminder and settings as two independent buttons; never overlap.
  window.header=function(title='RUTİN',back=false){
    const left=back?`<button class="iconBtn luxuryIconBtn" onclick="goBackRutin()" aria-label="Geri">‹</button>`:`<button class="iconBtn luxuryIconBtn" onclick="openModal('menu')" aria-label="Menü">☰</button>`;
    const center=title==='RUTİN'&&window.rutinLogo?`${rutinLogo(30)}<span>RUTİN</span>`:title;
    return `<div class="topbar topbar43111">${left}<div class="title brandTitle">${center}</div><div class="topActions43111"><button class="iconBtn luxuryIconBtn reminderTopBtn" onclick="openModal('reminderCenter')" aria-label="Hatırlatmalar">◔</button><button class="iconBtn luxuryIconBtn settingsOnly" onclick="go('settings')" aria-label="Ayarlar"><span class="settingsGearV27">⚙</span></button></div></div>`;
  };

  // Remove the separate Investment shortcut from HOME quick actions.
  // Investment remains under FINANCE > YATIRIMLAR.
  const previousHome=window.home;
  if(typeof previousHome==='function'){
    window.home=function(){
      let html=previousHome();
      html=html.replace(/<button[^>]*onclick=["']go\(["']investments["']\)["'][^>]*>[\s\S]*?<\/button>/i,'');
      return html;
    };
  }
})();

;

/* ===== v43112_header_icons_fix.js ===== */
/* RUTIN V43.11.2 — clean large reminder + settings header icons */
(function(){
  window.header=function(title='RUTİN',back=false){
    const left=back
      ? `<button class="iconBtn luxuryIconBtn" onclick="goBackRutin()" aria-label="Geri">‹</button>`
      : `<button class="iconBtn luxuryIconBtn" onclick="openModal('menu')" aria-label="Menü">☰</button>`;
    const center=title==='RUTİN'&&window.rutinLogo?`${rutinLogo(30)}<span>RUTİN</span>`:title;
    return `<div class="topbar topbar43112">${left}<div class="title brandTitle">${center}</div><div class="topActions43112"><button class="headerBigAction reminderBig43112" onclick="openModal('reminderCenter')" aria-label="Hatırlatmalar"><span>🔔</span></button><button class="headerBigAction settingsBig43112" onclick="go('settings')" aria-label="Ayarlar"><span>⚙</span></button></div></div>`;
  };
})();

;

/* ===== v4312_quality_ui.js ===== */
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

;

/* ===== v4313_search_full_edit.js ===== */
/* RUTIN V43.13 — instant search + full expense editing (same ID) */
(function(){
'use strict';
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const norm=s=>String(s??'').toLocaleUpperCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
window.rutinSearchQuery=window.rutinSearchQuery||'';
function WA(x){return Number(x.amount)||((Number(x.hours)||0)*(Number(x.rate)||0))||0}
function searchRows(q){
 const n=norm(q).trim(); if(!n)return [];
 const rows=[...(state.expenses||[]).map(x=>['expense',x]),...(state.incomes||[]).map(x=>['income',x]),...(state.work||[]).map(x=>['work',x])];
 return rows.filter(([k,x])=>norm([k,x.title,x.category,x.note,x.person,x.recipient,x.method,x.cardName,x.date,x.amount,x.hours].join(' ')).includes(n)).sort((a,b)=>String(b[1].date||'').localeCompare(String(a[1].date||'')));
}
function srow(kind,x){const amount=kind==='work'?WA(x):Number(x.amount)||0,label=kind==='work'?(x.title||'ÇALIŞMA'):(kind==='expense'&&x.category==='DİĞER'?(x.customTitle||x.title||'DİĞER'):(x.title||x.category||(kind==='income'?'GELİR':'HARCAMA')));return `<button class="globalRecordRowV435 v4313SearchRow" onclick="openRecordV435('${kind}','${E(x.id)}')"><i>${kind==='expense'?'−':kind==='income'?'₺':'▣'}</i><div><b>${E(label)}</b><small>${E(x.date||'')} · ${kind==='expense'?E(x.method||'NAKİT')+' · ':''}DÜZENLE / SİL</small></div><strong class="${kind==='expense'?'red':kind==='income'?'green':'gold'}">${kind==='expense'?'-':'+'}${money(amount)}</strong><span>›</span></button>`}
window.v4313Search=function(v){window.rutinSearchQuery=v||'';const box=document.getElementById('v4313SearchResults');if(!box)return;const a=searchRows(v);box.innerHTML=!String(v||'').trim()?'<div class="notice">ARAMAK İÇİN YAZMAYA BAŞLA.</div>':(a.map(z=>srow(z[0],z[1])).join('')||'<div class="notice">EŞLEŞEN HAREKET BULUNAMADI.</div>')};
const oldReports=window.reports;
window.reports=function(){let h=oldReports();const q=window.rutinSearchQuery||'';const block=`<div class="v4313SearchCard"><div class="section"><b>HAREKET ARA</b><span>ANLIK ARAMA</span></div><div class="v4313SearchInput"><span>⌕</span><input type="search" value="${E(q)}" placeholder="Market, yol, tarih, not..." oninput="v4313Search(this.value)"><button type="button" onclick="this.previousElementSibling.value='';v4313Search('')">×</button></div><div id="v4313SearchResults">${q?(searchRows(q).map(z=>srow(z[0],z[1])).join('')||'<div class="notice">EŞLEŞEN HAREKET BULUNAMADI.</div>'):'<div class="notice">ARAMAK İÇİN YAZMAYA BAŞLA.</div>'}</div></div>`;const marker='<div class="section"><b>GELİR / GİDER</b>';const at=h.indexOf(marker);return at>=0?h.slice(0,at)+block+h.slice(at):h+block};
function catOptions(x){const a=Array.from(new Set([...(state.categories||[]),x.category||'DİĞER','DİĞER']));return a.map(c=>`<option value="${E(c)}" ${c===(x.category||'DİĞER')?'selected':''}>${E(c)}</option>`).join('')}
function cardOptions(id){return (state.cards||[]).map(c=>`<option value="${E(c.id)}" ${String(c.id)===String(id)?'selected':''}>${E(c.name||'KREDİ KARTI')}</option>`).join('')}
window.v4313PayToggle=function(sel){const row=sel.closest('form')?.querySelector('.v4313CardPick');if(row)row.style.display=sel.value==='KREDİ KARTI'?'block':'none'};
window.v4313CatToggle=function(sel){const f=sel.closest('form'),c=sel.value;const other=f?.querySelector('.v4313OtherName'),allow=f?.querySelector('.v4313AllowanceTo');if(other)other.style.display=c==='DİĞER'?'block':'none';if(allow)allow.style.display=c==='HARÇLIK'?'block':'none'};
const oldModal=window.modalHtml;
window.modalHtml=function(k){
 if(k.startsWith('editRecord:expense:')){const p=k.split(':'),id=p[2],x=(state.expenses||[]).find(z=>String(z.id)===String(id));if(x){const isCard=x.method==='KREDİ KARTI'||x.sourceType==='card'||!!x.cardId;return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HARCAMAYI DÜZENLE</b><button class="close" onclick="closeModal()">×</button></div><form onsubmit="v4313SaveExpense(event,'${E(x.id)}')"><div class="field"><label>KATEGORİ</label><select name="category" onchange="v4313CatToggle(this)">${catOptions(x)}</select></div><div class="field v4313OtherName" style="display:${x.category==='DİĞER'?'block':'none'}"><label>HARCAMA ADI</label><input name="customTitle" value="${E(x.customTitle||((x.category==='DİĞER'&&x.title!=='DİĞER')?x.title:''))}" placeholder="ÖRN. CEP TELEFON TAMİRİ"></div><div class="field v4313AllowanceTo" style="display:${x.category==='HARÇLIK'?'block':'none'}"><label>KİME VERİLDİ?</label><input name="recipient" value="${E(x.recipient||x.person||'')}" placeholder="ADI"></div><div class="field"><label>TUTAR</label><input name="amount" type="number" inputmode="decimal" step="0.01" value="${E(x.amount||0)}"></div><div class="field"><label>TARİH</label><input name="date" type="date" value="${E(x.date||iso())}"></div><div class="field"><label>ÖDEME ŞEKLİ</label><select name="method" onchange="v4313PayToggle(this)"><option value="NAKİT" ${!isCard?'selected':''}>NAKİT</option><option value="KREDİ KARTI" ${isCard?'selected':''}>KART</option></select></div><div class="field v4313CardPick" style="display:${isCard?'block':'none'}"><label>KULLANILAN KART</label><select name="cardId"><option value="">KART SEÇ</option>${cardOptions(x.cardId)}</select></div><div class="field"><label>AÇIKLAMA / NOT</label><textarea name="note">${E(x.note||'')}</textarea></div><button class="primary">DEĞİŞİKLİĞİ KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteRecord('expense','${E(x.id)}','${E(x.date||'')}')">KAYDI SİL</button></form></div></div>`}}
 return oldModal(k);
};
window.v4313SaveExpense=function(e,id){e.preventDefault();const x=(state.expenses||[]).find(z=>String(z.id)===String(id));if(!x)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries()),oldAmount=Number(x.amount)||0,oldCardId=x.cardId||'',oldSourceId=x.sourceId||'',wasCard=x.sourceType==='card'&&oldCardId&&oldSourceId;
 // Detach the previous linked card transaction first; the expense ID itself is never changed.
 if(wasCard){const c=(state.cards||[]).find(z=>String(z.id)===String(oldCardId)),t=c?.transactions?.find(z=>String(z.id)===String(oldSourceId));if(c&&t){c.balance=Math.max(0,(Number(c.balance)||0)-(Number(t.amount)||oldAmount));c.transactions=c.transactions.filter(z=>String(z.id)!==String(oldSourceId));}}
 const category=d.category||'DİĞER',amount=Number(d.amount)||0,customTitle=category==='DİĞER'?String(d.customTitle||'').trim().toLocaleUpperCase('tr-TR'):'',recipient=category==='HARÇLIK'?String(d.recipient||'').trim().toLocaleUpperCase('tr-TR'):'';Object.assign(x,{category,title:category==='DİĞER'?(customTitle||'DİĞER'):category,customTitle,recipient,person:recipient,amount,date:d.date||x.date,method:d.method==='KREDİ KARTI'?'KREDİ KARTI':'NAKİT',note:d.note||'',sourceType:'',sourceId:'',cardId:'',cardName:''});
 if(d.method==='KREDİ KARTI'){const c=(state.cards||[]).find(z=>String(z.id)===String(d.cardId));if(!c){alert('LÜTFEN KULLANILAN KARTI SEÇ.');return}c.transactions=Array.isArray(c.transactions)?c.transactions:[];const t={id:uid(),title:x.title||x.category||'HARCAMA',amount,date:x.date};c.transactions.push(t);c.balance=(Number(c.balance)||0)+amount;Object.assign(x,{sourceType:'card',sourceId:t.id,cardId:c.id,cardName:c.name||'KREDİ KARTI'});}
 save();modal=null;render();
};
})();

;

/* ===== v43132_data_delete.js ===== */
/* RUTIN V43.13.2 - Ayarlar > Verileri Sil */
(function(){
  const oldSettings = window.settings || settings;
  window.settings = settings = function(){
    let html = oldSettings();
    const row = `<div class="setting clickable premiumSetting dataDelete43132" onclick="deleteAllRutinDataV43132()"><div class="settingIcon">×</div><b>VERİLERİ SİL</b><span>TÜM KAYITLARI TEMİZLE ›</span></div>`;
    const about = '<div class="setting premiumSetting"><div class="settingIcon">i</div><b>HAKKINDA</b>';
    if(html.includes(about)) html = html.replace(about, row + about);
    else html = html.replace('</div>', row + '</div>');
    return html;
  };

  window.deleteAllRutinDataV43132 = function(){
    if(!confirm('TÜM UYGULAMA VERİLERİNİ SİLMEK İSTİYOR MUSUN?\n\nÇalışma, mesai, harcama, gelir, kart, esnek hesap, yatırım ve not kayıtları silinecek. Bu işlem geri alınamaz.')) return;
    if(!confirm('SON ONAY\n\nKayıtların tamamı kalıcı olarak silinecek. Devam edilsin mi?')) return;

    // Kullanıcının uygulama ayarlarını, profilini, temasını ve kategori düzenini koru.
    const keepSettings = structuredClone(state.settings || defaults.settings);
    const keepProfile = structuredClone(state.profile || defaults.profile);
    const keepCategories = structuredClone(state.categories || defaults.categories);
    const keepCategoryMeta = structuredClone(state.categoryMeta || {});

    state = structuredClone(defaults);
    state.settings = keepSettings;
    state.profile = keepProfile;
    state.categories = keepCategories;
    state.categoryMeta = keepCategoryMeta;
    state.work=[]; state.expenses=[]; state.incomes=[]; state.notes=[]; state.investments=[];
    state.cards=[]; state.flexAccounts=[];
    state.accounts={cash:{name:'NAKİT',balance:0}};

    try{
      ['rutin-v4','rutin-v3','rutin-v2','rutin-v1'].forEach(k=>localStorage.removeItem(k));
      save();
      alert('TÜM KAYITLAR SİLİNDİ. AYARLARIN VE PROFİLİN KORUNDU.');
      location.reload();
    }catch(err){
      alert('VERİLER SİLİNEMEDİ: '+(err && err.message ? err.message : err));
    }
  };
})();

;

/* ===== v4315_design_v3_icons.js ===== */
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

;
