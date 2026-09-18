/* RUTIN V43.16.6 — Calendar quick add + allowance quick action + category cards + grouped roads */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const N=v=>Number(v)||0;
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad');
const icon=c=>window.rutinCategoryIcon?window.rutinCategoryIcon(c):'✦';

function monthPrefix43166(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function roadGroups43166(items){
  if(window.groupRoadItemsV438)return window.groupRoadItemsV438(items);
  const normal=(items||[]).filter(x=>!isRoad(x)),map={};
  (items||[]).filter(isRoad).forEach(x=>{const k=`${x.date||''}__${x.workId||''}`;(map[k]||(map[k]=[])).push(x)});
  return {normal,groups:Object.values(map)};
}
function roadCard43166(a){
  if(window.roadGroupCardV438 && a?.length)return window.roadGroupCardV438(a[0].date,a[0].workId,a);
  const x=a?.[0]||{};return `<button class="roadGroupCardV438" onclick="openModal('roadGroupV438:${E(x.date)}:${E(x.workId)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small></div><strong>-${money(sum(a))}</strong><span>›</span></button>`;
}
function expenseRow43166(x){
 return `<button class="globalRecordRowV435 v43166ExpenseRow" onclick="openRecordV435('expense','${E(x.id)}')"><i>${icon(U(x.category||'DİĞER'))}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')}${x.recipient||x.person?' · '+E(x.recipient||x.person):''} · DETAY / DÜZENLE</small></div><strong class="red">-${money(x.amount)}</strong><span>›</span></button>`;
}

// 1) Home quick actions: add Allowance without removing existing actions.
const baseHome43166=window.home;
window.home=function(){
 let h=baseHome43166();
 if(!h.includes('quickAllowance43166')){
   const marker='</div>\n <div class="section"><b>BUGÜNÜN ÖZETİ</b>';
   const btn='<button id="quickAllowance43166" onclick="openModal(\'allowanceAdd43165\')"><i class="luxGlyph">₺</i><span>HARÇLIK</span></button>';
   if(h.includes(marker))h=h.replace(marker,btn+'</div>\n <div class="section"><b>BUGÜNÜN ÖZETİ</b>');
   else h=h.replace(/(<div class="quick[^>]*>)([\s\S]*?)(<\/div>)/,(_,a,b,c)=>a+b+btn+c);
 }
 return h;
};

// 2) Expense screen: all categories (including zero) + grouped road rows.
window.expensesScreen=function(){
 const all=Array.isArray(state.expenses)?state.expenses:[],p=monthPrefix43166(),mm=all.filter(x=>String(x.date||'').startsWith(p)),total=sum(mm);
 const card=mm.filter(x=>U(x.method).includes('KREDİ')).reduce((n,x)=>n+N(x.amount),0),flex=mm.filter(x=>U(x.method).includes('ESNEK')).reduce((n,x)=>n+N(x.amount),0),cash=total-card-flex;
 const cats=Array.from(new Set((state.categories||[]).map(U).filter(Boolean)));
 const catTotals={};mm.forEach(x=>{const c=U(x.category||'DİĞER');catTotals[c]=(catTotals[c]||0)+N(x.amount)});
 const catCards=cats.map(c=>`<button class="v43166CategoryCard" onclick="openModal('categoryDetail:${encodeURIComponent(c)}')"><i>${icon(c)}</i><b>${E(c)}</b><strong>${money(catTotals[c]||0)}</strong><small>${mm.filter(x=>U(x.category||'DİĞER')===c).length} KAYIT · DETAY ›</small></button>`).join('');
 const sorted=all.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),g=roadGroups43166(sorted);
 const rows=[...g.groups.map(a=>({date:a[0]?.date||'',html:roadCard43166(a)})),...g.normal.map(x=>({date:x.date||'',html:expenseRow43166(x)}))].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>x.html).join('');
 return `${header('HARCAMALAR',true)}
 <div class="expenseHero"><div><small>BU AY HARCAMA</small><strong class="red">${money(total)}</strong></div><button class="premiumAddBtn" onclick="openModal('expense')"><i>＋</i><span>HARCAMA EKLE</span></button></div>
 <div class="paymentSplit v43166PaySplit"><button onclick="openModal('paymentDetail:cash')"><b>₺ ${money(Math.max(0,cash))}</b><small>NAKİT</small></button><button onclick="openModal('paymentDetail:card')"><b>▰ ${money(card)}</b><small>KREDİ KARTI</small></button>${flex?`<button onclick="go('finance')"><b>▥ ${money(flex)}</b><small>ESNEK HESAP</small></button>`:''}</div>
 <div class="section"><b>KATEGORİLER</b><span>TÜMÜ · DOKUN → DETAY</span></div><div class="v43166CategoryGrid">${catCards}</div>
 <div class="section"><b>HARCAMA DÖKÜMÜ</b><span>YOL KAYITLARI GRUPLU</span></div><div class="v43166ExpenseList">${rows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}</div>`;
};

// 3) Calendar day menu: fast add work/expense/allowance + grouped road movements.
function dayPanel43166(ds){
 const w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds),g=roadGroups43166(ex);
 const workRows=w.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('work','${E(x.id)}')"><i>${x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'}</i><div><b>${E(x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ')}</b><small>${E(x.title||'')} · ${x.hours?E(x.hours)+' SAAT · ':''}DETAY / DÜZENLE</small></div><strong class="green">+${money(x.amount||N(x.hours)*N(x.rate))}</strong><span>›</span></button>`).join('');
 const expRows=[...g.groups.map(a=>roadCard43166(a)),...g.normal.map(expenseRow43166)].join('');
 const incRows=inc.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'GELİR')}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="green">+${money(x.amount)}</strong><span>›</span></button>`).join('');
 return `<div class="v432DayHead"><button onclick="shiftDay('${E(ds)}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>HIZLI KAYIT EKLE · KAYDA DOKUN → DETAY</small></div><button onclick="shiftDay('${E(ds)}',1)">›</button></div>
 <div class="v43166DayQuick"><button onclick="openModal('dailyDate:${E(ds)}')"><i>✓</i><span>GÜNLÜK</span></button><button onclick="openModal('hourlyDate:${E(ds)}')"><i>◷</i><span>SAATLİK</span></button><button onclick="openModal('overtimeDate:${E(ds)}')"><i>✦</i><span>MESAİ</span></button><button onclick="openModal('expenseDate:${E(ds)}')"><i>▤</i><span>HARCAMA</span></button><button onclick="openAllowanceDate43166('${E(ds)}')"><i>₺</i><span>HARÇLIK</span></button></div>
 <div class="v43166DayTotals"><span>ÇALIŞMA <b>${w.length}</b></span><span>GELİR <b>${money(sum(inc)+w.reduce((n,x)=>n+N(x.amount||N(x.hours)*N(x.rate)),0))}</b></span><span>HARCAMA <b>${money(sum(ex))}</b></span></div>
 <div class="section"><b>ÇALIŞMA / MESAİ</b></div>${workRows||'<div class="notice">ÇALIŞMA KAYDI YOK.</div>'}
 <div class="section"><b>HARCAMA / YOL</b><span>YOL TEK KART</span></div>${expRows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}
 <div class="section"><b>DİĞER GELİRLER</b></div>${incRows||'<div class="notice">GELİR KAYDI YOK.</div>'}`;
}

window.openAllowanceDate43166=function(ds){window.rutinAllowancePresetDate43166=ds;openModal('allowanceAdd43165');};

const prevModal43166=window.modalHtml;
window.modalHtml=function(k){
 if(k && k.startsWith('day:')){
   const ds=k.slice(4);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v432Sheet v43166DaySheet" data-day="${E(ds)}" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜN DETAYI</b><button class="close" onclick="closeModal()">×</button></div>${dayPanel43166(ds)}</div></div>`;
 }
 return prevModal43166(k);
};

// 4) Post-render enhancements: selected allowance date + clearer calendar indicators.
const baseRender43166=window.render;
window.render=function(){
 baseRender43166();
 if(window.rutinAllowancePresetDate43166 && String(modal||'')==='allowanceAdd43165'){
   const el=document.querySelector('.modal input[name="date"]');if(el)el.value=window.rutinAllowancePresetDate43166;window.rutinAllowancePresetDate43166='';
 }
 // Make calendar days with records more legible without changing their data logic.
 document.querySelectorAll('.premiumDay.hasData').forEach(b=>b.classList.add('v43166HasData'));
};

save();
})();
