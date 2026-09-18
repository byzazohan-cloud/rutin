/* RUTIN V43.17.1 — quick actions one-row + calendar real cash-date income */
(function(){
'use strict';
const N=v=>Number(String(v??0).replace(',','.'))||0;
const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const SUM=a=>(a||[]).reduce((s,x)=>s+N(x.amount),0);

/* Actual money received on a calendar date.
   - Daily/main job is never income on the work date.
   - Hourly/overtime paid immediately is income on work date.
   - Any later collection is income on the collection/payment date. */
function paymentRowsFor(workId){return (state.workPayments||[]).filter(p=>String(p.workId)===String(workId));}
function immediatePaidOnWorkDate(w){
 if(!w || w.type==='daily') return 0;
 const pays=paymentRowsFor(w.id);
 // If collection rows exist, they are authoritative for the cash date.
 if(pays.length) return 0;
 return typeof workPaid==='function'?N(workPaid(w)):N(w.paidAmount);
}
function calendarIncomeOn(ds){
 const other=(state.incomes||[]).filter(x=>String(x.date||'')===String(ds)).reduce((s,x)=>s+N(x.amount),0);
 const immediate=(state.work||[]).filter(w=>String(w.date||'')===String(ds)).reduce((s,w)=>s+immediatePaidOnWorkDate(w),0);
 const collected=(state.workPayments||[]).filter(p=>String(p.date||'')===String(ds)).reduce((s,p)=>s+N(p.amount),0);
 return other+immediate+collected;
}
window.rutinCalendarIncome43171=calendarIncomeOn;

const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('day:')){
   const ds=k.slice(4),w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds);
   const road=x=>{const c=String(x.category||'').toLocaleUpperCase('tr-TR'),t=String(x.title||'').toLocaleUpperCase('tr-TR');return c==='YOL'&&(!!x.workId||x.sourceType==='workRoad'||t==='YOL')};
   const roads=ex.filter(road),normal=ex.filter(x=>!road(x));
   const roadHtml=roads.length?`<button class="roadGroupCardV438" onclick="openModal('roadDay431691:${E(ds)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(ds)} · ${roads.length} ÖDEME</small></div><strong>-${M(SUM(roads))}</strong><span>›</span></button>`:'';
   const workRows=w.map(x=>{const paidNow=immediatePaidOnWorkDate(x);const earned=typeof workEarned==='function'?N(workEarned(x)):N(x.amount||N(x.hours)*N(x.rate));const label=x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ';const status=x.type==='daily'?'HAKEDİŞ / ALACAK':paidNow>0?'ÖDEME ALINDI':'ALACAK';return `<button class="globalRecordRowV435" onclick="openRecordV435('work','${E(x.id)}')"><i>${x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'}</i><div><b>${E(label)}</b><small>${E(x.title||'')} · ${status} · DETAY</small></div><strong class="${paidNow>0?'green':'gold'}">${M(earned)}</strong><span>›</span></button>`}).join('');
   const expRows=normal.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category):'−'}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.method||'NAKİT')} · DETAY</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`).join('');
   const incRows=inc.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'GELİR')}</b><small>${E(x.date||'')} · DETAY</small></div><strong class="green">+${M(x.amount)}</strong><span>›</span></button>`).join('');
   const collected=(state.workPayments||[]).filter(p=>String(p.date||'')===String(ds));
   const collectedRows=collected.map(p=>{const ww=(state.work||[]).find(w=>String(w.id)===String(p.workId));return `<div class="globalRecordRowV435"><i>✓</i><div><b>${E(ww?.type==='daily'?'MAAŞ / ANA İŞ TAHSİLATI':'İŞ ÜCRETİ TAHSİLATI')}</b><small>${E(ww?.title||'ÇALIŞMA')} · TAHSİLAT</small></div><strong class="green">+${M(p.amount)}</strong><span></span></div>`}).join('');
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v432Sheet v43166DaySheet" data-day="${E(ds)}" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜN DETAYI</b><button class="close" onclick="closeModal()">×</button></div>
   <div class="v432DayHead"><button onclick="shiftDay('${E(ds)}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>HIZLI KAYIT EKLE · KAYDA DOKUN → DETAY</small></div><button onclick="shiftDay('${E(ds)}',1)">›</button></div>
   <div class="v43166DayQuick"><button onclick="openModal('dailyDate:${E(ds)}')"><i>✓</i><span>GÜNLÜK</span></button><button onclick="openModal('hourlyDate:${E(ds)}')"><i>◷</i><span>SAATLİK</span></button><button onclick="openModal('overtimeDate:${E(ds)}')"><i>✦</i><span>MESAİ</span></button><button onclick="openModal('expenseDate:${E(ds)}')"><i>▤</i><span>HARCAMA</span></button><button onclick="openAllowanceDate43166('${E(ds)}')"><i>₺</i><span>HARÇLIK</span></button></div>
   <div class="v43166DayTotals"><span>ÇALIŞMA <b>${w.length}</b></span><span>GELİR <b>${M(calendarIncomeOn(ds))}</b></span><span>HARCAMA <b>${M(SUM(ex))}</b></span></div>
   <div class="section"><b>ÇALIŞMA / MESAİ</b></div>${workRows||'<div class="notice">ÇALIŞMA KAYDI YOK.</div>'}
   <div class="section"><b>HARCAMA / YOL</b><span>YOL TEK KART</span></div>${roadHtml+expRows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}
   <div class="section"><b>GERÇEK GELİR / TAHSİLAT</b></div>${incRows+collectedRows||'<div class="notice">BU TARİHTE GELİR TAHSİLATI YOK.</div>'}</div></div>`;
 }
 return prevModal(k);
};
})();
