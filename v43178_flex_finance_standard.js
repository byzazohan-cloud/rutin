/* RUTIN V43.17.8 — FLEX ACCOUNT STATEMENT + FINANCE SUMMARY + REGRESSION-SAFE */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof fmt==='function'?fmt(N(x)):N(x).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
function day(v){const n=parseInt(v,10);return n>=1&&n<=31?n:0}
function dateLine(o){const s=day(o.statementDay||o.statementDate),p=day(o.paymentDay||o.dueDate);return `KESİM ${s?('HER AY '+s):'—'} · SON ÖDEME ${p?('HER AY '+p):'—'}`;}
function txType(t){return t?.type==='payment'||N(t?.amount)<0?'payment':'spend'}
function sortedTx(o){return [...A(o?.transactions)].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))}
function financeSummary(){
 const cards=A(state.cards),flex=A(state.flexAccounts);
 const cb=cards.reduce((s,x)=>s+N(x.balance),0),fb=flex.reduce((s,x)=>s+N(x.balance),0);
 const totalLimit=[...cards,...flex].reduce((s,x)=>s+N(x.limit),0),used=cb+fb,avail=Math.max(0,totalLimit-used);
 return `<div class="financeOverview43178"><div><small>TOPLAM BORÇ / KULLANIM</small><b>${M(used)}</b></div><div><small>TOPLAM LİMİT</small><b>${M(totalLimit)}</b></div><div><small>KULLANILABİLİR</small><b>${M(avail)}</b></div></div>`;
}

const financeBefore=window.finance;
window.finance=function(){
 let html=financeBefore();
 if(typeof html!=='string'||(window.financeTabV4310||'cards')==='investments')return html;
 const marker='<div class="financeTabs4310">';
 const ix=html.indexOf(marker);
 if(ix<0)return html;
 const end=html.indexOf('</div>',ix)+6;
 return html.slice(0,end)+financeSummary()+html.slice(end);
};

window.openFlexStatement43178=function(id){
 window.flexStatementId43178=String(id);
 openModal(`flexStatement43178:${id}`);
};

// Make flex cards open the account statement directly while preserving card statement flow.
const financeAfterSummary=window.finance;
window.finance=function(){
 let html=financeAfterSummary();
 if(typeof html!=='string')return html;
 html=html.replace(/openFinanceDetail43176\('flex','([^']+)'\)/g,"openFlexStatement43178('$1')")
          .replace(/DOKUN · HESAP DETAYI/g,'DOKUN · HESAP DÖKÜMÜ');
 return html;
};

const modalBefore=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('flexStatement43178:')){
   const id=k.split(':')[1],a=A(state.flexAccounts).find(x=>String(x.id)===String(id));
   if(!a)return modalBefore(k);
   const tx=sortedTx(a),spends=tx.filter(t=>txType(t)==='spend'),pays=tx.filter(t=>txType(t)==='payment');
   const spendTotal=spends.reduce((s,t)=>s+Math.abs(N(t.amount)),0),payTotal=pays.reduce((s,t)=>s+Math.abs(N(t.amount)),0);
   const limit=N(a.limit),bal=N(a.balance),avail=Math.max(0,limit-bal),pct=limit?Math.min(100,Math.round(bal/limit*100)):0;
   const rows=tx.slice(0,80).map(t=>{const pay=txType(t)==='payment';return `<div class="flexStatementRow43178"><div><b>${E(t.title||(pay?'HESAP ÖDEMESİ':'HARCAMA'))}</b><small>${E(t.date||'')} · ${pay?'ÖDEME':'HARCAMA'}</small></div><strong class="${pay?'green':'red'}">${pay?'-':'+'}${M(Math.abs(N(t.amount)))}</strong></div>`}).join('')||'<div class="notice">HAREKET YOK.</div>';
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet flexStatementSheet43178" onclick="event.stopPropagation()"><div class="sheetHead"><b>ESNEK HESAP DÖKÜMÜ</b><button class="close" onclick="closeModal()">×</button></div>
   <div class="flexHero43178"><small>${E(a.name||'ESNEK HESAP')}</small><strong>${M(bal)}</strong><span>KULLANILAN TUTAR</span><div class="financeUsageBar43176"><i style="width:${pct}%"></i></div><div class="flexStats43178"><span>LİMİT <b>${M(limit)}</b></span><span>KULLANILABİLİR <b>${M(avail)}</b></span><span>KULLANIM <b>%${pct}</b></span></div><em>${E(dateLine(a))}</em></div>
   <div class="statementActions43177 flexActions43178"><button onclick="closeModal();openModal('flexSpend4310:${E(id)}')">＋ HARCAMA EKLE</button><button onclick="closeModal();openModal('flexPay4310:${E(id)}')">✓ ÖDEME YAP</button><button onclick="openFlexEditor43178('${E(id)}')">✎ HESABI DÜZENLE</button><button class="danger43177" onclick="deleteFlexV4310('${E(id)}')">× HESABI SİL</button></div>
   <div class="financeTotals43176"><div><small>TÜM HARCAMALAR</small><b>${M(spendTotal)}</b></div><div><small>TÜM ÖDEMELER</small><b>${M(payTotal)}</b></div></div>
   <div class="section"><b>HAREKET / ÖDEME GEÇMİŞİ</b><span>${tx.length} KAYIT</span></div><div class="flexStatementList43178">${rows}</div></div></div>`;
 }
 return modalBefore(k);
};

window.openFlexEditor43178=function(id){window.rutinFlexEditReturn43178=String(id);closeModal();openModal(`editFlex:${id}`)};
const saveFlexBefore=window.saveFinanceFlex43175;
if(typeof saveFlexBefore==='function'){
 window.saveFinanceFlex43175=function(e,id=''){
   const ret=window.rutinFlexEditReturn43178;
   saveFlexBefore(e,id);
   if(ret&&String(ret)===String(id)){
     window.rutinFlexEditReturn43178='';
     setTimeout(()=>openFlexStatement43178(id),0);
   }
 };
}

// Reminder navigation should open the new flex statement; card reminders still use their existing detail/statement flow.
const openFinanceDetailBefore=window.openFinanceDetail43176;
window.openFinanceDetail43176=function(kind,id){
 if(kind==='flex')return openFlexStatement43178(id);
 return openFinanceDetailBefore(kind,id);
};

// Non-destructive style layer.
const st=document.createElement('style');st.id='v43178style';st.textContent=`
.financeOverview43178{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0 14px}.financeOverview43178>div{padding:12px 10px;border:1px solid rgba(255,207,91,.2);border-radius:14px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))}.financeOverview43178 small{display:block;font-size:9px;opacity:.62;margin-bottom:5px}.financeOverview43178 b{font-size:14px}.flexStatementSheet43178{max-height:92vh;overflow:auto}.flexHero43178{padding:18px;border-radius:20px;background:linear-gradient(145deg,#11191a,#090d0e);border:1px solid rgba(89,235,187,.24);margin-bottom:12px}.flexHero43178>small,.flexHero43178>span,.flexHero43178>em{display:block}.flexHero43178>strong{display:block;font-size:30px;margin:6px 0}.flexHero43178>span,.flexHero43178>em{font-size:10px;opacity:.62;font-style:normal;margin-top:5px}.flexStats43178{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.flexStats43178 span{font-size:9px;opacity:.75}.flexStats43178 b{display:block;font-size:11px;margin-top:3px}.flexActions43178{grid-template-columns:repeat(2,minmax(0,1fr))!important}.flexStatementList43178{display:flex;flex-direction:column;gap:7px}.flexStatementRow43178{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:11px 12px;border-radius:13px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}.flexStatementRow43178 b,.flexStatementRow43178 small{display:block}.flexStatementRow43178 small{opacity:.55;font-size:10px;margin-top:3px}@media(max-width:390px){.financeOverview43178{grid-template-columns:1fr 1fr}.financeOverview43178>div:first-child{grid-column:1/-1}}
`;document.head.appendChild(st);

// version marker only; no data mutation.
state.meta=state.meta||{};state.meta.appDataVersion='43.17.8';try{save()}catch(_){ }
})();
