
/* ===== v434_home_details.js ===== */
/* RUTIN V43.4 — Home income/expense interactive details */
(function(){
 const E=s=>typeof window.esc==='function'?window.esc(String(s??'')):String(s??'');
 const mp=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};
 const workVal=x=>typeof window.workAmount==='function'?workAmount(x):(+x.amount||((+x.hours||0)*(+x.rate||0))||0);
 const inMonth=x=>String(x.date||'').startsWith(mp());
 const incomeParts=(today=false)=>{
  const f=x=>today?x.date===iso():inMonth(x);
  const w=state.work.filter(f), extra=state.incomes.filter(f);
  return {daily:w.filter(x=>x.type==='daily'),hourly:w.filter(x=>x.type==='hourly'),overtime:w.filter(x=>x.type==='overtime'),other:extra};
 };
 const sumWork=a=>a.reduce((n,x)=>n+workVal(x),0), sumAmt=a=>a.reduce((n,x)=>n+(+x.amount||0),0);
 function incomeRow(x,kind){const isWork=kind!=='other';return `<button class="homeDetailRow" onclick="openModal('editRecord:${isWork?'work':'income'}:${x.id}:${x.date||''}')"><div class="hdrIcon ${kind}">${kind==='daily'?'✓':kind==='hourly'?'◷':kind==='overtime'?'✦':'＋'}</div><div class="hdrText"><b>${E(x.title||({daily:'GÜNLÜK İŞ',hourly:'SAATLİK İŞ',overtime:'MESAİ',other:'DİĞER GELİR'}[kind]))}</b><small>${E(x.date||'')}${x.hours?' · '+E(x.hours)+' SAAT':''} · DOKUN VE DÜZENLE</small></div><strong class="green">${money(isWork?workVal(x):x.amount)}</strong></button>`}
 function incomeDetail(today){const p=incomeParts(today), groups=[['daily','GÜNLÜK İŞ',p.daily],['hourly','SAATLİK İŞ',p.hourly],['overtime','MESAİ',p.overtime],['other','DİĞER GELİRLER',p.other]], grand=groups.reduce((n,g)=>n+(g[0]==='other'?sumAmt(g[2]):sumWork(g[2])),0);return `<div class="homeAnalysisHero income"><small>${today?'BUGÜN':'BU AY'} TOPLAM GELİR</small><strong>${money(grand)}</strong><span>4 GELİR KAYNAĞI AYRI AYRI HESAPLANIR</span></div><div class="incomeSourceGrid">${groups.map(([k,t,a])=>`<button onclick="document.getElementById('inc-${k}').scrollIntoView({behavior:'smooth',block:'start'})"><i class="${k}">${k==='daily'?'✓':k==='hourly'?'◷':k==='overtime'?'✦':'＋'}</i><span>${t}</span><b>${money(k==='other'?sumAmt(a):sumWork(a))}</b><small>${a.length} KAYIT</small></button>`).join('')}</div>${groups.map(([k,t,a])=>`<div class="homeDetailSection" id="inc-${k}"><div class="section"><b>${t}</b><span>${a.length} KAYIT · ${money(k==='other'?sumAmt(a):sumWork(a))}</span></div>${a.length?a.slice().sort((x,y)=>(y.date||'').localeCompare(x.date||'')).map(x=>incomeRow(x,k)).join(''):'<div class="notice">KAYIT YOK.</div>'}</div>`).join('')}`}
 function expenseDetail(today){const items=state.expenses.filter(x=>today?x.date===iso():inMonth(x)).slice().sort((a,b)=>(b.date||'').localeCompare(a.date||'')), map={};items.forEach(x=>{const c=String(x.category||'DİĞER').toUpperCase();(map[c]||(map[c]=[])).push(x)});const cats=Object.entries(map).sort((a,b)=>sumAmt(b[1])-sumAmt(a[1])),total=sumAmt(items);return `<div class="homeAnalysisHero expense"><small>${today?'BUGÜN':'BU AY'} TOPLAM HARCAMA</small><strong>${money(total)}</strong><span>${items.length} HAREKET · ${cats.length} KATEGORİ</span></div><div class="expenseCatDetailGrid">${cats.map(([c,a])=>`<button onclick="openModal('categoryDetail:${encodeURIComponent(c)}')"><i>${typeof ci==='function'?ci(c):'₺'}</i><span>${E(c)}</span><b>${money(sumAmt(a))}</b><small>${a.length} KAYIT</small></button>`).join('')||'<div class="notice">HARCAMA YOK.</div>'}</div><div class="section"><b>TÜM HARCAMA HAREKETLERİ</b><span>${items.length} KAYIT</span></div>${items.map(x=>`<button class="homeDetailRow" onclick="openModal('expenseDetailV4332:${x.id}')"><div class="hdrIcon expense">${typeof ci==='function'?ci(x.category||'DİĞER'):'₺'}</div><div class="hdrText"><b>${E(x.category==='DİĞER'?(x.customTitle||x.title||'DİĞER'):(x.title||x.category||'HARCAMA'))}${(x.recipient||x.person)?' · '+E(x.recipient||x.person):''}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')} · DOKUN VE DÜZENLE/SİL</small></div><strong class="red">-${money(x.amount)}</strong></button>`).join('')||'<div class="notice">KAYIT YOK.</div>'}`}
 const oldModal=window.modalHtml;
 window.modalHtml=function(k){if(k==='homeIncomeMonth'||k==='homeIncomeToday'||k==='homeExpenseMonth'||k==='homeExpenseToday'){const inc=k.includes('Income'),today=k.includes('Today'),title=inc?'GELİR DETAYI':'HARCAMA DETAYI',body=inc?incomeDetail(today):expenseDetail(today);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet homeDetailSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${title}</b><button class="close" type="button" onclick="closeModal()">×</button></div>${body}</div></div>`}return oldModal(k)};
 const oldHome=window.home;
 window.home=function(){let h=oldHome();h=h.replaceAll("periodDetail:todayIncome","homeIncomeToday").replaceAll("periodDetail:todayExpense","homeExpenseToday").replaceAll("periodDetail:monthIncome","homeIncomeMonth").replaceAll("periodDetail:monthExpense","homeExpenseMonth");return h};
})();

;

/* ===== v4341_actions_fix.js ===== */
(()=>{
const prevModal=window.modalHtml;
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
function findRec(kind,id){const a=kind==='work'?state.work:kind==='expense'?state.expenses:state.incomes;return a.find(x=>String(x.id)===String(id));}
window.v4341Save=function(e,kind,id){e.preventDefault();const x=findRec(kind,id);if(!x)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries());if(kind==='work'){x.date=d.date||x.date;x.title=(d.title||x.title||'ÇALIŞMA').toUpperCase();if(x.type==='daily')x.amount=+d.amount||0;else{x.hours=+d.hours||0;x.rate=+d.rate||0;x.amount=(+x.hours||0)*(+x.rate||0);}x.note=d.note||'';}else if(kind==='income'){x.title=(d.title||'GELİR').toUpperCase();x.amount=+d.amount||0;x.date=d.date||x.date;}else{x.title=(d.title||x.title||x.category||'HARCAMA').toUpperCase();x.amount=+d.amount||0;x.date=d.date||x.date;x.method=d.method||x.method||'NAKİT';x.note=d.note||'';if(d.recipient!==undefined)x.recipient=d.recipient||'';}save();modal=null;render();};
window.v4341Delete=function(kind,id){const x=findRec(kind,id);if(!x)return;if(!confirm('BU KAYIT SİLİNSİN Mİ?'))return;if(kind==='work')state.work=state.work.filter(z=>String(z.id)!==String(id));else if(kind==='income')state.incomes=state.incomes.filter(z=>String(z.id)!==String(id));else state.expenses=state.expenses.filter(z=>String(z.id)!==String(id));save();modal=null;render();};
function fld(n,l,v,t='text'){return `<div class="field"><label>${l}</label><input name="${n}" type="${t}" value="${E(v)}" required></div>`}
window.modalHtml=function(k){
 if(k.startsWith('editRecord:')){const p=k.split(':'),kind=p[1],id=p[2],x=findRec(kind,id);if(!x)return prevModal(k);let body='';
  if(kind==='work')body=`<form onsubmit="v4341Save(event,'work','${E(id)}')">${fld('date','TARİH',x.date,'date')}${fld('title','İŞ / PROJE',x.title)}${x.type==='daily'?fld('amount','GÜNLÜK ÜCRET',x.amount||0,'number'):fld('hours',x.type==='hourly'?'ÇALIŞILAN SAAT':'MESAİ SAATİ',x.hours||0,'number')+fld('rate','SAATLİK ÜCRET',x.rate||0,'number')}<div class="field"><label>NOT</label><textarea name="note">${E(x.note||'')}</textarea></div><button class="primary">DEĞİŞİKLİĞİ KAYDET</button><button type="button" class="v4341Delete" onclick="v4341Delete('work','${E(id)}')">KAYDI SİL</button></form>`;
  else if(kind==='income')body=`<form onsubmit="v4341Save(event,'income','${E(id)}')">${fld('title','AÇIKLAMA',x.title)}${fld('amount','TUTAR',x.amount,'number')}${fld('date','TARİH',x.date,'date')}<button class="primary">DEĞİŞİKLİĞİ KAYDET</button><button type="button" class="v4341Delete" onclick="v4341Delete('income','${E(id)}')">KAYDI SİL</button></form>`;
  else {const harclik=String(x.category||'').toUpperCase()==='HARÇLIK';body=`<form onsubmit="v4341Save(event,'expense','${E(id)}')">${fld('title','HARCAMA',x.title||x.category)}${fld('amount','TUTAR',x.amount,'number')}${fld('date','TARİH',x.date,'date')}<div class="field"><label>ÖDEME</label><select name="method"><option ${x.method==='NAKİT'?'selected':''}>NAKİT</option><option ${x.method==='KREDİ KARTI'?'selected':''}>KREDİ KARTI</option></select></div>${harclik?fld('recipient','KİME VERİLDİ?',x.recipient||x.person||''):''}<div class="field"><label>NOT</label><textarea name="note">${E(x.note||'')}</textarea></div><button class="primary">DEĞİŞİKLİĞİ KAYDET</button><button type="button" class="v4341Delete" onclick="v4341Delete('expense','${E(id)}')">KAYDI SİL</button></form>`;}
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${kind==='work'?'ÇALIŞMA':kind==='income'?'GELİR':'HARCAMA'} KAYDINI DÜZENLE</b><button class="close" onclick="closeModal()">×</button></div>${body}</div></div>`;
 }
 return prevModal(k);
};
})();

;

/* ===== v435_global_record_actions.js ===== */
/* RUTIN V43.5 — application-wide record detail / edit / delete */
(function(){
 const E=s=>typeof window.esc==='function'?window.esc(String(s??'')):String(s??'');
 const W=x=>typeof window.workAmount==='function'?workAmount(x):(+x.amount||((+x.hours||0)*(+x.rate||0))||0);
 const arrFor=k=>k==='work'?state.work:k==='income'?state.incomes:state.expenses;
 const find=(k,id)=>arrFor(k).find(x=>String(x.id)===String(id));
 const typeName=x=>x.type==='daily'?'GÜNLÜK İŞ':x.type==='hourly'?'SAATLİK İŞ':x.type==='overtime'?'MESAİ':'ÇALIŞMA';
 const kindName=(k,x)=>k==='work'?typeName(x):k==='income'?'DİĞER GELİR':(typeof isWorkRoadExpense==='function'&&isWorkRoadExpense(x)?'YOL GİDERİ':'HARCAMA');
 const icon=(k,x)=>k==='work'?(x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'):k==='income'?'＋':(typeof ci==='function'?ci(x.category||'DİĞER'):'₺');
 const amount=(k,x)=>k==='work'?W(x):(+x.amount||0);
 window.openRecordV435=(k,id)=>openModal(`recordV435:${k}:${id}`);
 window.deleteRecordV435=function(k,id){const x=find(k,id);if(!x)return;if(!confirm('BU KAYIT SİLİNSİN Mİ?'))return;if(k==='work')state.work=state.work.filter(z=>String(z.id)!==String(id));else if(k==='income')state.incomes=state.incomes.filter(z=>String(z.id)!==String(id));else state.expenses=state.expenses.filter(z=>String(z.id)!==String(id));save();modal=null;render();};
 function row(k,x){const meta=[x.date,x.hours?`${x.hours} SAAT`:'',k==='expense'?(x.method||'NAKİT'):'',x.recipient||x.person||''].filter(Boolean).join(' · ');return `<button class="globalRecordRowV435" onclick="openRecordV435('${k}','${E(x.id)}')"><i>${icon(k,x)}</i><div><b>${E(x.title||x.category||kindName(k,x))}</b><small>${E(meta)} · AYRINTI / DÜZENLE / SİL</small></div><strong class="${k==='expense'?'red':k==='income'?'green':'gold'}">${k==='expense'?'-':'+'}${money(amount(k,x))}</strong><span>›</span></button>`}
 function detail(k,x){const road=k==='expense'&&typeof isWorkRoadExpense==='function'&&isWorkRoadExpense(x);return `<div class="recordHeroV435 ${k}"><i>${icon(k,x)}</i><div><small>${kindName(k,x)}</small><b>${E(x.title||x.category||kindName(k,x))}</b></div><strong>${k==='expense'?'-':'+'}${money(amount(k,x))}</strong></div><div class="recordInfoV435"><div><small>TARİH</small><b>${E(x.date||'-')}</b></div>${k==='work'&&x.hours?`<div><small>SAAT</small><b>${E(x.hours)} SAAT</b></div>`:''}${k==='work'&&x.rate?`<div><small>ÜCRET</small><b>${money(x.rate)} / SAAT</b></div>`:''}${k==='expense'?`<div><small>KATEGORİ</small><b>${E(x.category||'DİĞER')}</b></div><div><small>ÖDEME</small><b>${E(x.method||'NAKİT')}</b></div>`:''}${(x.recipient||x.person)?`<div><small>KİME VERİLDİ?</small><b>${E(x.recipient||x.person)}</b></div>`:''}${x.note?`<div class="wide"><small>NOT</small><b>${E(x.note)}</b></div>`:''}${road?`<div class="wide"><small>KAYIT TÜRÜ</small><b>ÇALIŞMA YOL GİDERİ</b></div>`:''}</div><div class="recordActionsV435"><button class="edit" onclick="openModal('editRecord:${k}:${E(x.id)}:${E(x.date||'')}')">✎ DÜZENLE</button><button class="delete" onclick="deleteRecordV435('${k}','${E(x.id)}')">× SİL</button></div>`}
 const oldModal=window.modalHtml;
 window.modalHtml=function(k){if(k.startsWith('recordV435:')){const p=k.split(':'),kind=p[1],id=p[2],x=find(kind,id);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet recordSheetV435" onclick="event.stopPropagation()"><div class="sheetHead"><b>KAYIT AYRINTISI</b><button class="close" onclick="closeModal()">×</button></div>${x?detail(kind,x):'<div class="notice">KAYIT BULUNAMADI.</div>'}</div></div>`}return oldModal(k)};
 function periodRows(){const p=window.reportPeriod||'month';return [...filterByPeriod(state.work,p).map(x=>({k:'work',x})),...filterByPeriod(state.incomes,p).map(x=>({k:'income',x})),...filterByPeriod(state.expenses,p).map(x=>({k:'expense',x}))].sort((a,b)=>String(b.x.date||'').localeCompare(String(a.x.date||'')));}
 window.detailRows=function(period){const a=[...filterByPeriod(state.incomes,period).map(x=>({k:'income',x})),...filterByPeriod(state.expenses,period).map(x=>({k:'expense',x})),...filterByPeriod(state.work,period).map(x=>({k:'work',x}))].sort((a,b)=>String(b.x.date||'').localeCompare(String(a.x.date||'')));return a.length?a.map(o=>row(o.k,o.x)).join(''):'<div class="notice">BU DÖNEMDE KAYIT YOK.</div>'};
 const oldReports=window.reports;
 window.reports=function(){let h=oldReports();const a=periodRows(),wi=a.filter(o=>o.k==='work'),ii=a.filter(o=>o.k==='income'),ee=a.filter(o=>o.k==='expense');const section=`<div class="section"><b>AYRINTILI HAREKETLER</b><span>${a.length} KAYIT</span></div><div class="reportMovementTabsV435"><button onclick="document.getElementById('v435-income').scrollIntoView({behavior:'smooth'})">GELİR <b>${wi.length+ii.length}</b></button><button onclick="document.getElementById('v435-expense').scrollIntoView({behavior:'smooth'})">GİDER <b>${ee.length}</b></button></div><div id="v435-income" class="reportGroupV435"><div class="section"><b>GELİR / ÇALIŞMA HAREKETLERİ</b><span>DOKUN → AYRINTI</span></div>${[...wi,...ii].map(o=>row(o.k,o.x)).join('')||'<div class="notice">KAYIT YOK.</div>'}</div><div id="v435-expense" class="reportGroupV435"><div class="section"><b>HARCAMA / YOL HAREKETLERİ</b><span>DOKUN → AYRINTI</span></div>${ee.map(o=>row(o.k,o.x)).join('')||'<div class="notice">KAYIT YOK.</div>'}</div>`;return h+section};
 const oldDetail=window.detailReport;
 window.detailReport=function(){return oldDetail()};
 // Convert home detail rows and expense detail entry points to the same global detail layer.
 const oldHomeModal=window.modalHtml;
 window.modalHtml=function(k){if(k.startsWith('expenseDetailV4332:')){const id=k.split(':')[1];return oldHomeModal(`recordV435:expense:${id}`)}return oldHomeModal(k)};
})();

;
