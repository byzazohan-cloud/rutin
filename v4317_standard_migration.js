/* RUTIN V43.17 — UI standard + legacy phone data migration + report consistency */
(function(){
'use strict';
const VERSION='43.17';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=v=>String(v??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>typeof money==='function'?money(N(v)):N(v).toLocaleString('tr-TR')+' ₺';
const arr=v=>Array.isArray(v)?v:[];
const isRoad=x=>!!x&&(U(x.category)==='YOL'||x.sourceType==='workRoad'||!!x.workId&&U(x.title)==='YOL');
const isAllowance=x=>!!x&&(U(x.category)==='HARÇLIK'||U(x.title)==='HARÇLIK');

/* ---------- SAFE, ONE-TIME LEGACY MIGRATION ---------- */
function migrateLegacy4317(){
 state.meta=state.meta||{};
 if(N(state.meta.v4317Migration)>=1)return false;
 try{
   if(!localStorage.getItem('rutin-pre-v4317-backup')) localStorage.setItem('rutin-pre-v4317-backup',JSON.stringify(state));
 }catch(_){ }
 state.work=arr(state.work);state.expenses=arr(state.expenses);state.incomes=arr(state.incomes);
 state.cards=arr(state.cards);state.flexAccounts=arr(state.flexAccounts);state.notes=arr(state.notes);state.investments=arr(state.investments);
 state.categories=arr(state.categories);
 if(!state.categories.some(c=>U(c)==='HARÇLIK'))state.categories.push('HARÇLIK');
 state.cards.forEach(c=>{c.id=c.id||uid();c.name=c.name||'KREDİ KARTI';c.transactions=arr(c.transactions);c.balance=N(c.balance);c.limit=N(c.limit);});
 state.flexAccounts.forEach(a=>{a.id=a.id||uid();a.name=a.name||'ESNEK HESAP';a.transactions=arr(a.transactions);a.balance=N(a.balance);a.limit=N(a.limit);});
 state.work.forEach(w=>{
   w.id=w.id||uid();w.date=w.date||iso();w.type=w.type||'daily';
   if(w.amount==null)w.amount=w.type==='daily'?N(state.settings?.dailyRate):N(w.hours)*N(w.rate);
   // Never reinterpret an existing paidAmount. Accounting core owns legacy payment semantics.
   if(w.paidAmount!=null){w.paidAmount=Math.max(0,Math.min(N(w.amount),N(w.paidAmount)));w.paymentStatus=w.paidAmount>=N(w.amount)&&N(w.amount)>0?'paid':(w.paidAmount>0?'partial':'unpaid');}
 });
 const cardById=id=>state.cards.find(c=>String(c.id)===String(id));
 const flexById=id=>state.flexAccounts.find(a=>String(a.id)===String(id));
 const cardTxFor=x=>state.cards.flatMap(c=>c.transactions.map(t=>({c,t}))).find(z=>String(z.t.expenseId||'')===String(x.id)||String(z.t.id||'')===String(x.sourceId||''));
 const flexTxFor=x=>state.flexAccounts.flatMap(a=>a.transactions.map(t=>({a,t}))).find(z=>String(z.t.expenseId||'')===String(x.id)||String(z.t.id||'')===String(x.sourceId||''));
 state.expenses.forEach(x=>{
   x.id=x.id||uid();x.date=x.date||iso();x.amount=N(x.amount);x.category=U(x.category||x.title||'DİĞER');x.title=x.title||x.category;
   x.method=U(x.method||'NAKİT');x.note=x.note||'';
   if(isAllowance(x)){
     x.category='HARÇLIK';x.title='HARÇLIK';x.recipient=U(x.recipient||x.person||x.allowanceTo||'');x.person=x.recipient;
   }
   if(isRoad(x)&&x.workId){x.category='YOL';x.title=x.title||'YOL';x.sourceType=x.sourceType||'workRoad';}
   if(x.method==='KREDİ KARTI'){
     let c=cardById(x.cardId);
     const linked=cardTxFor(x);
     if(!c&&linked)c=linked.c;
     if(!c&&x.cardName){const hits=state.cards.filter(z=>U(z.name)===U(x.cardName));if(hits.length===1)c=hits[0];}
     if(c){
       let t=c.transactions.find(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));
       if(!t){t={id:uid(),expenseId:x.id,title:x.title||x.category,category:x.category,amount:x.amount,date:x.date,type:'spend',migratedLink:true};c.transactions.push(t);}
       t.expenseId=x.id;x.cardId=c.id;x.cardName=c.name;x.sourceType='card';x.sourceId=t.id;x.flexId='';x.flexName='';
     }
   }else if(x.method==='ESNEK HESAP'){
     let a=flexById(x.flexId);const linked=flexTxFor(x);if(!a&&linked)a=linked.a;
     if(!a&&x.flexName){const hits=state.flexAccounts.filter(z=>U(z.name)===U(x.flexName));if(hits.length===1)a=hits[0];}
     if(a){
       let t=a.transactions.find(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));
       if(!t){t={id:uid(),expenseId:x.id,title:x.title||x.category,category:x.category,amount:x.amount,date:x.date,type:'spend',migratedLink:true};a.transactions.push(t);}
       t.expenseId=x.id;x.flexId=a.id;x.flexName=a.name;x.sourceType='flex';x.sourceId=t.id;x.cardId='';x.cardName='';
     }
   }else{x.method='NAKİT';}
 });
 // Reverse-link known transactions without changing current balances.
 state.cards.forEach(c=>c.transactions.forEach(t=>{if(t.expenseId){const x=state.expenses.find(e=>String(e.id)===String(t.expenseId));if(x&&U(x.method)==='KREDİ KARTI'){x.cardId=c.id;x.cardName=c.name;x.sourceType='card';x.sourceId=t.id;}}}));
 state.flexAccounts.forEach(a=>a.transactions.forEach(t=>{if(t.expenseId){const x=state.expenses.find(e=>String(e.id)===String(t.expenseId));if(x&&U(x.method)==='ESNEK HESAP'){x.flexId=a.id;x.flexName=a.name;x.sourceType='flex';x.sourceId=t.id;}}}));
 state.meta.v4317Migration=1;state.meta.v4317MigrationAt=new Date().toISOString();state.meta.appDataVersion=VERSION;
 save();return true;
}
window.rutinMigrateLegacy4317=migrateLegacy4317;
const migrated=migrateLegacy4317();

/* ---------- CONSISTENT STATUS / TOASTS ---------- */
function toast4317(message,type='ok'){
 let el=document.getElementById('rutinToast4317');
 if(!el){el=document.createElement('div');el.id='rutinToast4317';el.className='rutinToast4317';document.body.appendChild(el);}
 el.className='rutinToast4317 '+type;el.textContent=message;el.classList.add('show');clearTimeout(window.__toast4317);window.__toast4317=setTimeout(()=>el.classList.remove('show'),2200);
}
window.rutinToast=toast4317;window.showToastV43162=toast4317;
if(migrated)setTimeout(()=>toast4317('ESKİ VERİLER YENİ SÜRÜME UYUMLANDI ✓','ok'),350);

/* ---------- HOME / QUICK ACTION STANDARD ---------- */
const prevHome=window.home;
window.home=function(){
 let h=prevHome();
 const s=h.indexOf('<div class="section"><b>HIZLI İŞLEMLER</b>');
 if(s>=0){const q=h.indexOf('<div class="quick',s),e=q>=0?h.indexOf('</div>',q):-1;if(q>=0&&e>q){
   const quick=`<div class="quick quickPremium quickSix v4317Quick"><button onclick="openModal('income')"><i class="qv32 qIncome">＋₺</i><span>GELİR EKLE</span></button><button onclick="go('expenses')"><i class="qv32 qExpense">₺</i><span>HARCAMALAR</span></button><button onclick="openModal('daily')"><i class="qv32 qWork">✓</i><span>ÇALIŞTIM</span></button><button onclick="go('allowance')"><i class="qv32 qFinance">₺</i><span>HARÇLIK</span></button><button onclick="go('calendar')"><i class="qv32 qNotes">31</i><span>TAKVİM</span></button><button onclick="go('notes')"><i class="qv32 qNotes">✎</i><span>NOTLAR</span></button></div>`;
   h=h.slice(0,q)+quick+h.slice(e+6);
 }}
 return h;
};

/* ---------- REPORT ROW STANDARD + GROUPED ROAD IN EXPENSE DETAIL ---------- */
function reportRoadGroups(items){const m={};arr(items).filter(isRoad).forEach(x=>{const k=String(x.date||'');(m[k]||(m[k]=[])).push(x)});return Object.values(m).sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')));}
function normalExpenseRow(x){return `<button class="globalRecordRowV435 v4317ReportRow" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category):'−'}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')} · AYRINTI</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function roadReportRow(a){const x=a[0]||{},sum=a.reduce((s,z)=>s+N(z.amount),0);return `<button class="roadGroupCardV438 v4317ReportRow" onclick="openModal('roadDay431691:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME · AYRINTI</small></div><strong>-${M(sum)}</strong><span>›</span></button>`;}
const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k==='reportExpense43101'){
   const r=typeof dateRangeForPeriod==='function'?dateRangeForPeriod(reportPeriod):{start:'0000-01-01',end:'9999-12-31'};
   const items=arr(state.expenses).filter(x=>x.date>=r.start&&x.date<=r.end),roads=reportRoadGroups(items),normal=items.filter(x=>!isRoad(x));
   const cats={};items.forEach(x=>{const c=x.category||'DİĞER';cats[c]=(cats[c]||0)+N(x.amount)});
   const rows=[...roads.map(a=>({date:a[0]?.date||'',html:roadReportRow(a)})),...normal.map(x=>({date:x.date||'',html:normalExpenseRow(x)}))].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GİDER DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="reportCatsV439">${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,t])=>`<button onclick="go('expenses');closeModal()"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(c):'₺'}</i><span><small>${E(c)}</small><b>${M(t)}</b></span><em>›</em></button>`).join('')||'<div class="notice">KAYIT YOK.</div>'}</div><div class="section"><b>GİDER HAREKETLERİ</b><span>DOKUN → DETAY</span></div>${rows||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;
 }
 return prevModal(k);
};

/* ---------- MENU CLEANUP / CONSISTENT DESTINATIONS ---------- */
const modalAfterReports=window.modalHtml;
window.modalHtml=function(k){
 if(k==='menu'){
  const items=[['home','⌂','ANA SAYFA'],['work','✓','ÇALIŞMA'],['expenses','₺','HARCAMALAR'],['allowance','₺','HARÇLIK'],['calendar','31','TAKVİM'],['reports','▥','RAPORLAR'],['finance','▰','FİNANS / KARTLAR'],['notes','✎','NOTLAR'],['profile','●','PROFİL'],['settings','⚙','AYARLAR']];
  return `<div class="modal menu4311Modal" onclick="safeBackdropClose(event)"><div class="sheet menu4311Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>UYGULAMA MENÜSÜ</b><button class="close" onclick="closeModal()">×</button></div><div class="menu4311List v4317Menu">${items.map(x=>`<button onclick="closeModal();go('${x[0]}')"><i>${x[1]}</i><b>${x[2]}</b><span>›</span></button>`).join('')}</div></div></div>`;
 }
 return modalAfterReports(k);
};

/* ---------- LIGHTWEIGHT INTEGRITY AUDIT (NO BALANCE REWRITE) ---------- */
window.rutinIntegrity4317=function(){
 const issues=[];
 const ids=new Set();[...arr(state.work),...arr(state.expenses),...arr(state.incomes)].forEach(x=>{if(!x.id)issues.push('KİMLİKSİZ KAYIT');else if(ids.has(String(x.id)))issues.push('TEKRAR KAYIT ID: '+x.id);else ids.add(String(x.id));});
 arr(state.expenses).forEach(x=>{
  if(U(x.method)==='KREDİ KARTI'&&!state.cards.some(c=>String(c.id)===String(x.cardId)))issues.push('KARTA BAĞLANAMAYAN HARCAMA: '+(x.date||'')+' '+(x.title||''));
  if(U(x.method)==='ESNEK HESAP'&&!state.flexAccounts.some(a=>String(a.id)===String(x.flexId)))issues.push('ESNEK HESABA BAĞLANAMAYAN HARCAMA: '+(x.date||'')+' '+(x.title||''));
 });
 state.meta=state.meta||{};state.meta.lastIntegrity4317={at:new Date().toISOString(),issues:issues.length};save();return issues;
};
window.rutinIntegrity4317();

})();
