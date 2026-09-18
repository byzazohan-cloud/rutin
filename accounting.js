
/* ===== v4316_accounting_core.js ===== */
/* RUTIN V43.16 - Accounting Core: Hakediş / Alacak / Gerçek Gelir */
(function(){
  const CORE_VERSION=1;
  state.workPayments=Array.isArray(state.workPayments)?state.workPayments:[];
  state.meta=state.meta||{};
  const earned=w=>+(w.amount!=null?w.amount:((+w.hours||0)*(+w.rate||0)))||0;
  if((state.meta.accountingCoreVersion||0)<CORE_VERSION){
    // Geriye dönük uyumluluk: V43.15'ten gelen eski çalışma kayıtlarının
    // önceki gelir toplamlarını değiştirmemek için tahsil edilmiş kabul edilir.
    state.work.forEach(w=>{
      const a=earned(w);
      if(w.paidAmount==null) w.paidAmount=a;
      if(!w.paymentStatus) w.paymentStatus=(+w.paidAmount>=a?'paid':(+w.paidAmount>0?'partial':'unpaid'));
    });
    state.meta.accountingCoreVersion=CORE_VERSION;
    save();
  }
  window.workEarned=earned;
  window.workPaid=w=>Math.max(0,Math.min(earned(w),+w.paidAmount||0));
  window.workReceivable=w=>Math.max(0,earned(w)-workPaid(w));
  window.accountingTotals=function(period=reportPeriod){
    const ws=filterByPeriod(state.work,period);
    const other=filterByPeriod(state.incomes,period).reduce((a,x)=>a+(+x.amount||0),0);
    const hak=ws.reduce((a,w)=>a+earned(w),0);
    const paid=ws.reduce((a,w)=>a+workPaid(w),0);
    const alacak=ws.reduce((a,w)=>a+workReceivable(w),0);
    const expense=filterByPeriod(state.expenses,period).reduce((a,x)=>a+(+x.amount||0),0);
    const road=filterByPeriod(state.expenses,period).filter(isWorkRoadExpense).reduce((a,x)=>a+(+x.amount||0),0);
    return {earned:hak,workPaid:paid,receivable:alacak,otherIncome:other,income:paid+other,expense,net:paid+other-expense,road};
  };
  totalsForPeriod=function(period=reportPeriod){return accountingTotals(period)};
  monthlyTotals=function(){return accountingTotals('month')};
  todayIncome=function(){
    return state.incomes.filter(x=>x.date===iso()).reduce((a,x)=>a+(+x.amount||0),0)+
      state.work.filter(x=>x.date===iso()).reduce((a,w)=>a+workPaid(w),0);
  };
  window.paymentChoice=function(){return `<div class="field"><label>ÖDEME DURUMU</label><div class="choiceRow"><label><input type="radio" name="payment" value="paid" checked>ÖDEME ALINDI</label><label><input type="radio" name="payment" value="unpaid">ALINMADI</label></div></div>`};
  dailyForm=function(){return `<form onsubmit="submitDaily(event)">
   ${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','ANA İŞ')}${field('amount','GÜNLÜK ÜCRET',state.settings.dailyRate,'number')}
   ${paymentChoice()}<div class="field"><label>YOL PARASI</label><div class="choiceRow"><label><input type="radio" name="road" value="yes">ÖDEDİM</label><label><input type="radio" name="road" value="no" checked>ÖDEMEDİM</label></div></div>
   ${field('roadAmount','YOL TUTARI (OPSİYONEL)',0,'number')}${textarea('note','NOT')}<button class="primary">KAYDET</button></form>`};
  hourlyForm=function(){return `<form onsubmit="submitHourly(event)">
   ${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','EK İŞ')}${field('hours','KAÇ SAAT ÇALIŞTIN?',0,'number')}${field('rate','SAATLİK ÜCRET',state.settings.hourlyRate,'number')}
   ${paymentChoice()}<div class="notice">SÜRE SAYACI YOK. O GÜN KAÇ SAAT ÇALIŞTIYSAN ELLE GİR.</div><div class="field"><label>YOL PARASI</label><div class="choiceRow"><label><input type="radio" name="road" value="yes">ÖDEDİM</label><label><input type="radio" name="road" value="no" checked>ÖDEMEDİM</label></div></div>
   ${field('roadAmount','YOL TUTARI (OPSİYONEL)',0,'number')}${textarea('note','NOT')}<button class="primary">KAYDET</button></form>`};
  overtimeForm=function(){return `<form onsubmit="submitOvertime(event)">
   ${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','ANA İŞ')}${field('hours','MESAİ SÜRESİ',0,'number')}${field('rate','MESAİ SAATLİK ÜCRET',state.settings.overtimeRate,'number')}
   ${paymentChoice()}${textarea('note','NOT')}<button class="primary">KAYDET</button></form>`};
  function pushWork(d,type){
    const amount=type==='daily'?(+d.amount||0):(+d.hours||0)*(+d.rate||0);
    const w={id:uid(),type,date:d.date,title:upper(d.title||(type==='hourly'?'EK İŞ':type==='overtime'?'MESAİ':'ANA İŞ')),amount,note:d.note||'',paidAmount:d.payment==='paid'?amount:0,paymentStatus:d.payment==='paid'?'paid':'unpaid'};
    if(type!=='daily'){w.hours=+d.hours||0;w.rate=+d.rate||0}
    state.work.push(w);
    if((type==='daily'||type==='hourly')&&d.road==='yes'&&+d.roadAmount>0) state.expenses.push({id:uid(),date:d.date,title:'YOL',amount:+d.roadAmount,category:'YOL',method:'NAKİT',workId:w.id,sourceType:'workRoad',note:'ÇALIŞMA YOL MASRAFI'});
    save();closeModal();render();
  }
  submitDaily=function(e){e.preventDefault();pushWork(Object.fromEntries(new FormData(e.currentTarget).entries()),'daily')};
  submitHourly=function(e){e.preventDefault();pushWork(Object.fromEntries(new FormData(e.currentTarget).entries()),'hourly')};
  submitOvertime=function(e){e.preventDefault();pushWork(Object.fromEntries(new FormData(e.currentTarget).entries()),'overtime')};
  workRows=function(type){
    const a=state.work.filter(x=>x.type===type).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);
    return a.length?a.map(x=>{const r=workReceivable(x),p=workPaid(x);return `<div class="item" onclick="openModal('editWork:${x.id}')"><div class="ico">${type==='daily'?'✓':type==='hourly'?'◷':'★'}</div><div><b>${x.title}</b><small>${x.date}${x.hours?' · '+x.hours+' SAAT':''} · ${r>0?(p>0?'KISMİ ÖDENDİ':'ALACAK'):'ÖDENDİ'}</small></div><div class="amt ${r>0?'red':'gold'}">${money(earned(x))}</div></div>`}).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>';
  };
  window.receivablesScreen=function(){
    const a=state.work.filter(w=>workReceivable(w)>0).sort((x,y)=>y.date.localeCompare(x.date));
    const total=a.reduce((n,w)=>n+workReceivable(w),0), hak=a.reduce((n,w)=>n+earned(w),0), paid=a.reduce((n,w)=>n+workPaid(w),0);
    return `${header('ALACAKLAR',true)}<div class="reportGrid"><div class="reportBox"><small>HAK EDİLEN</small><strong>${money(hak)}</strong></div><div class="reportBox"><small>ALINAN</small><strong class="green">${money(paid)}</strong></div><div class="reportBox"><small>KALAN ALACAK</small><strong class="red">${money(total)}</strong></div></div>
    <div class="section"><b>AÇIK ALACAKLAR</b><span>${a.length} KAYIT</span></div><div class="card list">${a.length?a.map(w=>`<div class="item"><div class="ico">₺</div><div><b>${w.title}</b><small>${w.date} · ${w.type==='daily'?'GÜNLÜK':w.type==='hourly'?'SAATLİK':'MESAİ'} · HAKEDİŞ ${money(earned(w))}</small></div><div><div class="amt red">${money(workReceivable(w))}</div><button class="miniEdit" onclick="event.stopPropagation();openReceivablePayment('${w.id}')">ÖDEME AL</button></div></div>`).join(''):'<div class="notice">AÇIK ALACAĞIN YOK.</div>'}</div>`;
  };
  window.openReceivablePayment=function(id){
    const w=state.work.find(x=>x.id===id);if(!w)return;const remain=workReceivable(w);
    const raw=prompt(`KALAN ALACAK: ${money(remain)}\nALINAN TUTARI GİR:`,String(remain));if(raw===null)return;
    const n=Math.max(0,Math.min(remain,+String(raw).replace(',','.')||0));if(!n)return;
    w.paidAmount=workPaid(w)+n;w.paymentStatus=workReceivable(w)<=0?'paid':'partial';state.workPayments.push({id:uid(),workId:w.id,date:iso(),amount:n});save();render();
  };
  const oldReports=reports;
  reports=function(){const T=accountingTotals(reportPeriod);return oldReports()+`<div class="section"><b>HAKEDİŞ / TAHSİLAT</b><span onclick="go('receivables')">ALACAKLAR ›</span></div><div class="reportGrid"><div class="reportBox"><small>HAK EDİLEN</small><strong>${money(T.earned)}</strong></div><div class="reportBox"><small>ALINAN</small><strong class="green">${money(T.workPaid)}</strong></div><div class="reportBox"><small>ALACAK</small><strong class="red">${money(T.receivable)}</strong></div></div>`};
  const baseRender=render;
  render=function(){
    if(screen==='receivables' && (!state.settings.lock||unlocked)){
      $('#app').innerHTML=`<main class="phone">${receivablesScreen()}${nav()}</main>${modal?modalHtml(modal):''}`;return;
    }
    baseRender();
  };
})();

;

/* ===== v43162_work_reports.js ===== */
/* RUTIN V43.16.2 — 6/7/8 + Reports UX + work road payment method */
(function(){
 const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const amountOf=w=>typeof workEarned==='function'?workEarned(w):(+w.amount||((+w.hours||0)*(+w.rate||0)));
 window.rutinToast=function(msg,type='ok'){
   let x=document.getElementById('rutinToast43162'); if(x)x.remove();
   x=document.createElement('div');x.id='rutinToast43162';x.className='rutinToast43162 '+type;x.textContent=msg;document.body.appendChild(x);
   requestAnimationFrame(()=>x.classList.add('show'));setTimeout(()=>{x.classList.remove('show');setTimeout(()=>x.remove(),250)},1800);
 };
 function paymentChoice(){return `<div class="field"><label>ANA İŞ ÜCRETİ</label><div class="choiceRow"><label><input type="radio" name="payment" value="paid" checked>ÖDEME ALDIM</label><label><input type="radio" name="payment" value="unpaid">ÖDEME ALMADIM</label></div></div>`}
 function roadFields(){return `<div class="field"><label>YOL PARASI <small>(OPSİYONEL)</small></label><div class="choiceRow"><label><input type="radio" name="road" value="yes" onchange="v43162RoadToggle(this.form)">YOL GİDERİ VAR</label><label><input type="radio" name="road" value="no" checked onchange="v43162RoadToggle(this.form)">YOK</label></div></div><div class="v43162RoadExtra" style="display:none">${field('roadAmount','YOL TUTARI',0,'number')}<div class="field"><label>YOL ÖDEME ŞEKLİ</label><select name="roadMethod" onchange="v43162RoadMethod(this.form)"><option value="NAKİT">NAKİT</option><option value="KREDİ KARTI">KREDİ KARTI</option></select></div><div class="field v43162RoadCard" style="display:none"><label>HANGİ KART?</label><select name="roadCardId"><option value="">KART SEÇ</option>${(state.cards||[]).map(c=>`<option value="${E(c.id)}">${E(c.name)}</option>`).join('')}</select></div></div>`}
 window.v43162RoadToggle=f=>{const b=f.querySelector('.v43162RoadExtra');if(b)b.style.display=f.road?.value==='yes'?'block':'none'};
 window.v43162RoadMethod=f=>{const b=f.querySelector('.v43162RoadCard');if(b)b.style.display=f.roadMethod?.value==='KREDİ KARTI'?'block':'none'};
 dailyForm=function(){return `<form onsubmit="submitDaily(event)">${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','ANA İŞ')}${field('amount','GÜNLÜK ÜCRET',state.settings.dailyRate,'number')}${paymentChoice()}${roadFields()}${textarea('note','NOT')}<button class="primary">KAYDET</button></form>`};
 hourlyForm=function(){return `<form onsubmit="submitHourly(event)">${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','EK İŞ')}${field('hours','KAÇ SAAT ÇALIŞTIN?',0,'number')}${field('rate','SAATLİK ÜCRET',state.settings.hourlyRate,'number')}${paymentChoice()}<div class="notice">SÜREYİ ELLE GİR.</div>${roadFields()}${textarea('note','NOT')}<button class="primary">KAYDET</button></form>`};
 overtimeForm=function(){return `<form onsubmit="submitOvertime(event)">${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','ANA İŞ')}${field('hours','MESAİ SÜRESİ',0,'number')}${field('rate','MESAİ SAATLİK ÜCRET',state.settings.overtimeRate,'number')}${paymentChoice()}${roadFields()}${textarea('note','NOT')}<button class="primary">KAYDET</button></form>`};
 function addRoad(d,w){
   if(d.road!=='yes'||!(+d.roadAmount>0))return true;
   let card=null,method=d.roadMethod==='KREDİ KARTI'?'KREDİ KARTI':'NAKİT';
   if(method==='KREDİ KARTI'){card=(state.cards||[]).find(c=>String(c.id)===String(d.roadCardId));if(!card){alert('YOL GİDERİ İÇİN KREDİ KARTI SEÇ.');return false}}
   const ex={id:uid(),date:w.date,title:'YOL',amount:+d.roadAmount,category:'YOL',method,workId:w.id,sourceType:'workRoad',cardId:card?.id||'',cardName:card?.name||'',note:'ÇALIŞMA YOL GİDERİ'};
   state.expenses.push(ex);
   if(card){card.transactions=Array.isArray(card.transactions)?card.transactions:[];const t={id:uid(),title:'YOL',amount:ex.amount,date:ex.date,expenseId:ex.id,sourceType:'workRoad'};card.transactions.push(t);card.balance=(+card.balance||0)+ex.amount;ex.sourceId=t.id}
   return true;
 }
 function addWork(e,type){
   e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
   if((state.work||[]).some(x=>x.date===d.date)&&!confirm('BU TARİHTE ZATEN ÇALIŞMA KAYDI VAR.\nBAŞKA KAYIT EKLEMEK İSTİYOR MUSUN?'))return;
   const amount=type==='daily'?(+d.amount||0):(+d.hours||0)*(+d.rate||0);
   const w={id:uid(),type,date:d.date,title:upper(d.title||(type==='hourly'?'EK İŞ':'ANA İŞ')),amount,note:d.note||'',paidAmount:d.payment==='paid'?amount:0,paymentStatus:d.payment==='paid'?'paid':'unpaid'};
   if(type!=='daily'){w.hours=+d.hours||0;w.rate=+d.rate||0}
   state.work.push(w);if(!addRoad(d,w)){state.work=state.work.filter(x=>x.id!==w.id);return}
   save();closeModal();render();setTimeout(()=>rutinToast('KAYIT EKLENDİ ✓'),30);
 }
 submitDaily=e=>addWork(e,'daily');submitHourly=e=>addWork(e,'hourly');submitOvertime=e=>addWork(e,'overtime');
 workRows=function(type){
   const a=(state.work||[]).filter(x=>x.type===type).sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,30);
   return a.length?a.map(x=>{const r=typeof workReceivable==='function'?workReceivable(x):0;return `<div class="item v43162WorkRow" onclick="openModal('editWork:${E(x.id)}')"><div class="ico">${type==='daily'?'✓':type==='hourly'?'◷':'★'}</div><div><b>${E(x.title)}</b><small>${E(x.date)}${x.hours?' · '+E(x.hours)+' SAAT':''} · ${r>0?'ALACAK':'ÖDENDİ'}</small></div><div class="v43162WorkRight"><b class="amt ${r>0?'red':'gold'}">${money(amountOf(x))}</b><span>DÜZENLE ›</span></div></div>`}).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>';
 };
 // Existing global edit/delete flows already recalculate totals from source records. Add visible feedback to common saves/deletes.
 const oldSave=window.save; // persistence itself remains untouched
 window.rutinReportIncomeOpen=true;window.rutinReportExpenseOpen=true;
 window.v43162Toggle=function(kind){if(kind==='income')window.rutinReportIncomeOpen=!window.rutinReportIncomeOpen;else window.rutinReportExpenseOpen=!window.rutinReportExpenseOpen;render()};
 function rangeLabel(){try{return dateRangeForPeriod(reportPeriod)}catch(e){return{label:'SEÇİLİ DÖNEM'}}}
 function periodRows(){const w=filterByPeriod(state.work,reportPeriod),i=filterByPeriod(state.incomes,reportPeriod),e=filterByPeriod(state.expenses,reportPeriod);return{w,i,e}}
 function movement(kind,x){const isEx=kind==='expense',isWork=kind==='work';const val=isWork?(typeof workPaid==='function'?workPaid(x):amountOf(x)):(+x.amount||0);const label=isWork?(x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ'):(x.title||x.category||(isEx?'HARCAMA':'GELİR'));return `<button class="globalRecordRowV435" onclick="openRecordV435('${kind}','${E(x.id)}')"><i>${isEx?'−':isWork?'▣':'₺'}</i><div><b>${E(label)}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="${isEx?'red':'green'}">${isEx?'-':'+'}${money(val)}</strong><span>›</span></button>`}
 window.v43162Search=function(v){window.rutinSearchQuery=v||'';const b=document.getElementById('v43162SearchResults');if(!b)return;const q=String(v||'').trim().toLocaleUpperCase('tr-TR');if(!q){b.innerHTML='';return}const d=periodRows(),all=[...d.w.map(x=>['work',x]),...d.i.map(x=>['income',x]),...d.e.map(x=>['expense',x])].filter(z=>JSON.stringify(z[1]).toLocaleUpperCase('tr-TR').includes(q)).slice(0,30);b.innerHTML=all.map(z=>movement(z[0],z[1])).join('')||'<div class="notice">EŞLEŞEN KAYIT YOK.</div>'};
 reports=function(){
   const T=accountingTotals(reportPeriod),R=rangeLabel(),d=periodRows();
   const B=(k,l)=>`<button class="${reportPeriod===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`;
   const incomes=[...d.w.filter(w=>(typeof workPaid==='function'?workPaid(w):amountOf(w))>0).map(x=>['work',x]),...d.i.map(x=>['income',x])].sort((a,b)=>(b[1].date||'').localeCompare(a[1].date||''));
   const expenses=d.e.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
   const max=Math.max(1,T.income,T.expense),ip=Math.round(T.income/max*100),ep=Math.round(T.expense/max*100);
   return `${header('RAPORLAR',true)}
   <div class="reportGrid v43162AccountingTop"><button class="reportBox" onclick="go('receivables')"><small>HAK EDİLEN</small><strong>${money(T.earned)}</strong></button><button class="reportBox" onclick="go('receivables')"><small>ALINAN</small><strong class="green">${money(T.workPaid)}</strong></button><button class="reportBox" onclick="go('receivables')"><small>ALACAK</small><strong class="red">${money(T.receivable)}</strong></button></div>
   <div class="tabs">${B('day','GÜNLÜK')}${B('week','HAFTALIK')}${B('month','AYLIK')}${B('year','YILLIK')}<button onclick="openModal('range')">ÖZEL</button></div>
   <div class="v43162SearchCompact"><span>⌕</span><input type="search" placeholder="Hareket ara..." oninput="v43162Search(this.value)"><button onclick="this.previousElementSibling.value='';v43162Search('')">×</button></div><div id="v43162SearchResults"></div>
   <div class="section"><b>${E(R.label||'SEÇİLİ DÖNEM')}</b><span>GERÇEK PARA HAREKETİ</span></div>
   <div class="reportGrid"><div class="reportBox"><small>TOPLAM GELİR</small><strong class="green">${money(T.income)}</strong></div><div class="reportBox"><small>TOPLAM HARCAMA</small><strong class="red">${money(T.expense)}</strong></div><div class="reportBox"><small>NET</small><strong>${money(T.net)}</strong></div></div>
   <div class="dualDonutWrap"><button class="donutCard" onclick="openReportIncome43101&&openReportIncome43101()"><div class="donutRing incomeRing" style="--pct:${ip}"><div class="donutCenter"><small>GELİR</small><strong class="green">${money(T.income)}</strong></div></div></button><button class="donutCard" onclick="openReportExpense43101&&openReportExpense43101()"><div class="donutRing expenseRing" style="--pct:${ep}"><div class="donutCenter"><small>GİDER</small><strong class="red">${money(T.expense)}</strong></div></div></button></div>
   <button class="v43162CollapseHead" onclick="v43162Toggle('income')"><span><b>GELİR HAREKETLERİ</b><small>${incomes.length} KAYIT</small></span><i>${rutinReportIncomeOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportIncomeOpen?'open':''}">${rutinReportIncomeOpen?(incomes.map(z=>movement(z[0],z[1])).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>
   <button class="v43162CollapseHead" onclick="v43162Toggle('expense')"><span><b>GİDER HAREKETLERİ</b><small>${expenses.length} KAYIT</small></span><i>${rutinReportExpenseOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportExpenseOpen?'open':''}">${rutinReportExpenseOpen?(expenses.map(x=>movement('expense',x)).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>`;
 };
 detailReport=reports;
})();

;

/* ===== v43163_cards_reports_fix.js ===== */
/* RUTIN V43.16.3 — REPORT COMPACT FIX + PERSONAL CARD FLOW (9-14) */
(function(){
const n=v=>Number(String(v??0).replace(',','.'))||0, E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function ensure(){state.cards=Array.isArray(state.cards)?state.cards:[];state.cards.forEach(c=>{c.transactions=Array.isArray(c.transactions)?c.transactions:[];c.statementDay=c.statementDay||'';c.paymentDay=c.paymentDay||'';});}
ensure();
// Expense form: cash/card + exact card. Preserve flexible account option.
const oldExpenseForm=expenseForm;
expenseForm=function(){ensure();return `<form onsubmit="submitExpenseV43163(event)">
 ${field('amount','TUTAR',0,'number')}
 <div class="field"><label>KATEGORİ</label><div class="categoryIcons">${[['YOL','⌁'],['YEMEK','◉'],['MARKET','▣'],['FATURA','▤'],['KİRA','⌂'],['SAĞLIK','♡'],['ULAŞIM','◈'],['EĞLENCE','★'],['YAKIT','◒'],['GİYİM','♢'],['DİĞER','•••']].map(([c,i],x)=>`<label class="catChip"><input type="radio" name="category" value="${c}" ${x===0?'checked':''}><i>${i}</i><span>${c}</span></label>`).join('')}</div></div>
 <div class="field"><label>ÖDEME YÖNTEMİ</label><div class="payIcons"><label><input type="radio" name="method" value="NAKİT" checked onchange="toggleExpenseCardV43163(this.form)"><i>₺</i><span>NAKİT</span></label><label><input type="radio" name="method" value="KREDİ KARTI" onchange="toggleExpenseCardV43163(this.form)"><i>▣</i><span>KREDİ KARTI</span></label><label><input type="radio" name="method" value="ESNEK HESAP" onchange="toggleExpenseCardV43163(this.form)"><i>▥</i><span>ESNEK HESAP</span></label></div></div>
 <div class="field v43163CardPick" hidden><label>HANGİ KART?</label><select name="cardId"><option value="">KART SEÇ</option>${state.cards.map(c=>`<option value="${c.id}">${E(c.name)}</option>`).join('')}</select></div>
 ${field('date','TARİH',iso(),'date')}${textarea('note','NOT (İSTEĞE BAĞLI)')}<button class="primary">KAYDET</button></form>`};
window.toggleExpenseCardV43163=function(f){const el=f.querySelector('.v43163CardPick');if(el)el.hidden=f.method?.value!=='KREDİ KARTI'};
window.submitExpenseV43163=function(e){e.preventDefault();ensure();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),amount=n(d.amount);if(!amount)return alert('TUTAR GİRİN.');if(d.method==='KREDİ KARTI'&&!d.cardId)return alert('HANGİ KREDİ KARTINI KULLANDIĞINIZI SEÇİN.');const id=uid(),x={id,date:d.date||iso(),title:upper(d.category||'HARCAMA'),amount,category:d.category||'DİĞER',method:d.method||'NAKİT',cardId:d.cardId||'',note:d.note||''};state.expenses.push(x);if(x.method==='KREDİ KARTI'){const c=state.cards.find(z=>z.id===x.cardId);if(c){c.balance=n(c.balance)+amount;c.transactions.push({id:uid(),expenseId:id,title:x.title,category:x.category,amount,date:x.date,type:'spend'});}}save();modal=null;screen='finance';if(window.showToastV43162)showToastV43162('HARCAMA KAYDEDİLDİ ✓');render()};
// Card detail page + payment history.
window.openCardDetailV43163=function(id){window.cardDetailIdV43163=id;screen='cardDetailV43163';render()};
const oldRender=render;render=function(){if(screen==='cardDetailV43163'){document.getElementById('app').innerHTML=cardDetailV43163()+nav();return;}oldRender()};
window.cardDetailV43163=function(){ensure();const c=state.cards.find(x=>x.id===window.cardDetailIdV43163);if(!c){screen='finance';return finance()}const tx=[...c.transactions].sort((a,b)=>(b.date||'').localeCompare(a.date||''));const spends=tx.filter(x=>x.type==='spend').reduce((a,x)=>a+n(x.amount),0),pays=Math.abs(tx.filter(x=>x.type==='payment').reduce((a,x)=>a+n(x.amount),0));return `${header('KART EKSTRESİ',true)}<div class="cardDetailHeroV13"><small>${E(c.name)}</small><strong>${money(c.balance)}</strong><span>GÜNCEL BORÇ</span></div><div class="v43163CardStats"><div><small>DÖNEM HARCAMA</small><b>${money(spends)}</b></div><div><small>ÖDEMELER</small><b>${money(pays)}</b></div></div><div class="card v43163Dates"><span>HESAP KESİM <b>${E(c.statementDay||'-')}</b></span><span>SON ÖDEME <b>${E(c.paymentDay||c.dueDate||'-')}</b></span></div><button class="primary" onclick="openModal('cardPay4310:${c.id}')">NE KADAR ÖDEDİM?</button><div class="section"><b>EKSTRE HAREKETLERİ</b></div><div class="card list">${tx.length?tx.map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')} · ${E(t.category|| (t.type==='payment'?'ÖDEME':''))}</small></div><strong class="${t.type==='payment'?'green':'red'}">${t.type==='payment'?'-':''}${money(Math.abs(n(t.amount)))}</strong></div>`).join(''):'<div class="notice">HENÜZ HAREKET YOK.</div>'}</div>`};
// Replace finance card tap with statement detail; keep menu on small action.
const oldFinance=finance;finance=function(){ensure();const html=oldFinance();return html.replace(/onclick="openCardMenuV4310\('([^']+)'\)"/g,`onclick="openCardDetailV43163('$1')"`)};
// Card add/edit: statement/payment dates. Use day-of-month to recur monthly.
const oldModal=modalHtml;modalHtml=function(k){ensure();if(k==='addCard'||k.startsWith('editCard:')){const id=k.split(':')[1]||'',c=state.cards.find(x=>x.id===id)||{};const title=id?'KREDİ KARTINI DÜZENLE':'KREDİ KARTI EKLE';const body=`<form onsubmit="submitCardV43163(event,'${id}')">${field('name','KART ADI',c.name||'')}${field('balance','GÜNCEL BORÇ',c.balance||0,'number')}${field('limit','LİMİT',c.limit||0,'number')}<div class="field"><label>HESAP KESİM GÜNÜ</label><input name="statementDay" type="number" min="1" max="31" value="${E(c.statementDay||'')}"></div><div class="field"><label>SON ÖDEME GÜNÜ</label><input name="paymentDay" type="number" min="1" max="31" value="${E(c.paymentDay||'')}"></div><button class="primary">KAYDET</button>${id?`<button type="button" class="secondary dangerBtn" onclick="deleteCard('${id}')">KARTI SİL</button>`:''}</form>`;return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${title}</b><button class="close" type="button" onclick="closeModal()">×</button></div>${body}</div></div>`;}return oldModal(k)};
window.submitCardV43163=function(e,id=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),c=id?state.cards.find(x=>x.id===id):null,x=c||{id:uid(),transactions:[]};x.name=upper(d.name||'KREDİ KARTI');x.balance=n(d.balance);x.limit=n(d.limit);x.statementDay=d.statementDay||'';x.paymentDay=d.paymentDay||'';if(!c)state.cards.push(x);save();closeModal();screen='finance';render()};
// Payment: preserve history + under/over warning before save.
window.submitCardPay4310=function(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget)),c=state.cards.find(x=>x.id===id);if(!c)return;const a=n(d.amount),due=n(c.balance),diff=a-due;let msg='';if(a<due)msg=`EKSİK ÖDEME: ${money(due-a)} BORÇ KALACAK.`;else if(a>due)msg=`FAZLA ÖDEME: ${money(diff)}.`;if(msg&&!confirm(msg+'\nDEVAM EDİLSİN Mİ?'))return;c.balance=Math.max(0,due-a);c.transactions=Array.isArray(c.transactions)?c.transactions:[];c.transactions.push({id:uid(),title:'KART ÖDEMESİ',amount:-a,date:d.date||iso(),type:'payment',dueBefore:due});save();closeModal();if(window.showToastV43162)showToastV43162('KART ÖDEMESİ KAYDEDİLDİ ✓');render()};
// Reports: only fix sizing/layout. Existing movement toggles remain untouched.
const oldReports=reports;reports=function(){let h=oldReports();h=h.replace('reportGrid v43162AccountingTop','v43163AccountingTop');return h};
save();
})();

;

/* ===== v43164_daily_salary_migration.js ===== */
/* RUTIN V43.16.4 — Günlük ana iş maaş günü/alacak sistemi + eski kayıt entegrasyonu */
(function(){
 const MIG=2;
 state.meta=state.meta||{};
 state.workPayments=Array.isArray(state.workPayments)?state.workPayments:[];
 const earned=w=>typeof workEarned==='function'?workEarned(w):(+w.amount||((+w.hours||0)*(+w.rate||0)));
 // Eski günlük kayıtları yeni kurala geçir: çalışma günü gelir değildir.
 // Yalnız gerçekten kayıtlı tahsilat hareketleri günlük kaydın ödenen tutarını oluşturur.
 if((state.meta.dailySalaryMigration||0)<MIG){
   (state.work||[]).forEach(w=>{
     if(w.type!=='daily') return;
     const explicit=(state.workPayments||[]).filter(p=>String(p.workId)===String(w.id)).reduce((s,p)=>s+(+p.amount||0),0);
     w.paidAmount=Math.min(earned(w),Math.max(0,explicit));
     w.paymentStatus=w.paidAmount>=earned(w)&&earned(w)>0?'paid':(w.paidAmount>0?'partial':'unpaid');
     w.salaryBased=true;
   });
   state.meta.dailySalaryMigration=MIG;
   save();
 }
 // Günlük: ödeme seçimi yok. Her kayıt doğrudan hakediş/alacak.
 dailyForm=function(){return `<form onsubmit="submitDaily(event)">${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','ANA İŞ')}${field('amount','GÜNLÜK ÜCRET',state.settings.dailyRate,'number')}${typeof roadFields==='function'?roadFields():''}${textarea('note','NOT')}<div class="notice">GÜNLÜK ANA İŞ ÜCRETİ ÇALIŞMA GÜNÜNDE GELİR SAYILMAZ. HAKEDİŞ / ALACAK OLARAK KAYDEDİLİR; MAAŞ ÖDEMESİ ALACAKLARDAN İŞLENİR.</div><button class="primary">KAYDET</button></form>`};
 const oldSubmitDaily=window.submitDaily;
 submitDaily=function(e){
   e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
   if((state.work||[]).some(x=>x.date===d.date)&&!confirm('BU TARİHTE ZATEN ÇALIŞMA KAYDI VAR.\nBAŞKA KAYIT EKLEMEK İSTİYOR MUSUN?'))return;
   const w={id:uid(),type:'daily',date:d.date,title:upper(d.title||'ANA İŞ'),amount:+d.amount||0,note:d.note||'',paidAmount:0,paymentStatus:'unpaid',salaryBased:true};
   state.work.push(w);
   // V43.16.2 yol sistemiyle aynı mantık; opsiyonel nakit/kart.
   if(d.road==='yes'&&+d.roadAmount>0){
     const method=d.roadMethod==='KREDİ KARTI'?'KREDİ KARTI':'NAKİT';let card=null;
     if(method==='KREDİ KARTI'){
       card=(state.cards||[]).find(c=>String(c.id)===String(d.roadCardId));
       if(!card){state.work=state.work.filter(x=>x.id!==w.id);alert('YOL GİDERİ İÇİN KREDİ KARTI SEÇ.');return;}
     }
     const ex={id:uid(),date:w.date,title:'YOL',amount:+d.roadAmount,category:'YOL',method,workId:w.id,sourceType:'workRoad',cardId:card?.id||'',cardName:card?.name||'',note:'ÇALIŞMA YOL GİDERİ'};
     state.expenses.push(ex);
     if(card){card.transactions=Array.isArray(card.transactions)?card.transactions:[];const t={id:uid(),title:'YOL',amount:ex.amount,date:ex.date,expenseId:ex.id,sourceType:'workRoad'};card.transactions.push(t);card.balance=(+card.balance||0)+ex.amount;ex.sourceId=t.id;}
   }
   save();closeModal();render();if(typeof rutinToast==='function')setTimeout(()=>rutinToast('GÜNLÜK İŞ HAKEDİŞ / ALACAK OLARAK KAYDEDİLDİ ✓'),30);
 };
 // Günlük satırları da yeni anlamı açıkça göstersin.
 const oldWorkRows=workRows;
 workRows=function(type){
   if(type!=='daily') return oldWorkRows(type);
   const a=(state.work||[]).filter(x=>x.type==='daily').sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,30);
   return a.length?a.map(x=>{const r=typeof workReceivable==='function'?workReceivable(x):Math.max(0,earned(x)-(+x.paidAmount||0));return `<div class="item v43162WorkRow" onclick="openModal('editWork:${x.id}')"><div class="ico">✓</div><div><b>${x.title||'ANA İŞ'}</b><small>${x.date} · ${r>0?'HAKEDİŞ / ALACAK':'MAAŞI ALINDI'}</small></div><div class="v43162WorkRight"><b class="amt ${r>0?'red':'gold'}">${money(earned(x))}</b><span>DÜZENLE ›</span></div></div>`}).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>';
 };
})();

;

/* ===== v431642_stability_fix.js ===== */
/* RUTIN V43.16.4.2 STABLE — road restore + report layout + card statement iPhone safe-area */
(function(){
  const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number(String(v??0).replace(',','.'))||0;
  const cards=()=>Array.isArray(state.cards)?state.cards:[];
  const roadsFor=id=>(state.expenses||[]).filter(x=>String(x.workId||'')===String(id)&&String(x.category||'').toUpperCase()==='YOL');
  const workValue=w=>typeof workEarned==='function'?workEarned(w):(w?.type==='daily'?num(w?.amount):num(w?.hours)*num(w?.rate));

  function cardOptions(selected=''){
    return `<option value="">KART SEÇ</option>${cards().map(c=>`<option value="${E(c.id)}" ${String(c.id)===String(selected)?'selected':''}>${E(c.name||'KREDİ KARTI')}</option>`).join('')}`;
  }
  function roadRow(r={}){
    const method=String(r.method||'NAKİT').includes('KREDİ')?'KREDİ KARTI':'NAKİT';
    return `<div class="stableRoadRow431642">
      <select class="stableRoadDirection431642" aria-label="Yol yönü"><option value="GİDİŞ" ${r.direction==='GİDİŞ'?'selected':''}>GİDİŞ</option><option value="DÖNÜŞ" ${r.direction==='DÖNÜŞ'?'selected':''}>DÖNÜŞ</option><option value="YOL" ${!r.direction||r.direction==='YOL'?'selected':''}>YOL</option></select>
      <input class="stableRoadAmount431642" type="number" inputmode="decimal" min="0" step="0.01" placeholder="TUTAR" value="${E(r.amount??'')}">
      <select class="stableRoadMethod431642" aria-label="Yol ödeme yöntemi" onchange="stableRoadMethod431642(this)"><option value="NAKİT" ${method==='NAKİT'?'selected':''}>NAKİT</option><option value="KREDİ KARTI" ${method==='KREDİ KARTI'?'selected':''}>KREDİ KARTI</option></select>
      <select class="stableRoadCard431642" aria-label="Yol kredi kartı" ${method==='KREDİ KARTI'?'':'hidden'}>${cardOptions(r.cardId||'')}</select>
      <button class="stableRoadRemove431642" type="button" aria-label="Yol giderini kaldır" onclick="this.closest('.stableRoadRow431642').remove()">×</button>
    </div>`;
  }
  function roadBox(existing=[]){
    return `<div class="stableRoadBox431642"><div class="stableRoadHead431642"><div><b>YOL GİDERİ</b><small>OPSİYONEL · NAKİT VEYA KREDİ KARTI</small></div><button type="button" onclick="stableAddRoad431642(this)">＋ YOL EKLE</button></div><div class="stableRoadList431642">${existing.map(roadRow).join('')}</div></div>`;
  }
  window.stableRoadMethod431642=function(sel){
    const card=sel.closest('.stableRoadRow431642')?.querySelector('.stableRoadCard431642');
    if(card)card.hidden=sel.value!=='KREDİ KARTI';
  };
  window.stableAddRoad431642=function(btn){
    const list=btn.closest('.stableRoadBox431642')?.querySelector('.stableRoadList431642');
    if(!list)return;
    const wrap=document.createElement('div');wrap.innerHTML=roadRow({});const row=wrap.firstElementChild;list.appendChild(row);
  };
  function collectRoadRows(form){
    const out=[];
    for(const row of form.querySelectorAll('.stableRoadRow431642')){
      const amount=num(row.querySelector('.stableRoadAmount431642')?.value);
      if(amount<=0)continue;
      const method=row.querySelector('.stableRoadMethod431642')?.value==='KREDİ KARTI'?'KREDİ KARTI':'NAKİT';
      const cardId=method==='KREDİ KARTI'?(row.querySelector('.stableRoadCard431642')?.value||''):'';
      if(method==='KREDİ KARTI'&&!cardId){alert('YOL GİDERİ İÇİN KREDİ KARTI SEÇ.');return null;}
      const card=cards().find(c=>String(c.id)===String(cardId));
      if(method==='KREDİ KARTI'&&!card){alert('SEÇİLEN KREDİ KARTI BULUNAMADI.');return null;}
      out.push({amount,method,cardId,cardName:card?.name||'',direction:row.querySelector('.stableRoadDirection431642')?.value||'YOL'});
    }
    return out;
  }
  function removeRoadCardEffect(exp){
    if(!exp||!exp.cardId)return;
    const c=cards().find(x=>String(x.id)===String(exp.cardId));if(!c)return;
    c.transactions=Array.isArray(c.transactions)?c.transactions:[];
    const before=c.transactions.length;
    let removed=0;
    c.transactions=c.transactions.filter(t=>{
      const match=(exp.sourceId&&String(t.id)===String(exp.sourceId))||String(t.expenseId||'')===String(exp.id);
      if(match){removed+=Math.abs(num(t.amount));return false;}return true;
    });
    // Only reverse balance when a linked card transaction was actually found.
    if(before!==c.transactions.length) c.balance=Math.max(0,num(c.balance)-removed);
  }
  function replaceRoads(work,newRoads){
    const old=roadsFor(work.id);
    old.forEach(removeRoadCardEffect);
    state.expenses=(state.expenses||[]).filter(x=>!(String(x.workId||'')===String(work.id)&&String(x.category||'').toUpperCase()==='YOL'));
    newRoads.forEach(r=>{
      const ex={id:uid(),date:work.date,title:'YOL',amount:r.amount,category:'YOL',method:r.method,workId:work.id,sourceType:'workRoad',cardId:r.cardId||'',cardName:r.cardName||'',direction:r.direction||'YOL',note:'ÇALIŞMA YOL GİDERİ'};
      state.expenses.push(ex);
      if(r.method==='KREDİ KARTI'){
        const c=cards().find(x=>String(x.id)===String(r.cardId));
        if(c){c.transactions=Array.isArray(c.transactions)?c.transactions:[];const t={id:uid(),expenseId:ex.id,title:'YOL',category:'YOL',amount:r.amount,date:work.date,type:'spend',sourceType:'workRoad'};c.transactions.push(t);c.balance=num(c.balance)+r.amount;ex.sourceId=t.id;}
      }
    });
  }
  function paymentChoiceFor(x=null){
    const earned=x?workValue(x):0, paid=x?(typeof workPaid==='function'?workPaid(x):num(x.paidAmount)):0;
    if(x&&paid>0&&paid<earned){
      return `<div class="field"><label>ÖDEME DURUMU</label><div class="choiceRow stablePayment3"><label><input type="radio" name="payment" value="keep" checked>KISMİYİ KORU</label><label><input type="radio" name="payment" value="paid">ÖDEME ALINDI</label><label><input type="radio" name="payment" value="unpaid">ALINMADI</label></div></div>`;
    }
    const paidChecked=!x||paid>=earned;
    return `<div class="field"><label>ÖDEME DURUMU</label><div class="choiceRow"><label><input type="radio" name="payment" value="paid" ${paidChecked?'checked':''}>ÖDEME ALINDI</label><label><input type="radio" name="payment" value="unpaid" ${paidChecked?'':'checked'}>ALINMADI</label></div></div>`;
  }
  function workFields(type,x=null){
    const daily=type==='daily', hourly=type==='hourly', ot=type==='overtime';
    let h=field('date','TARİH',x?.date||iso(),'date')+field('title','İŞ / PROJE',E(x?.title||(hourly?'EK İŞ':'ANA İŞ')));
    if(daily)h+=field('amount','GÜNLÜK ÜCRET',x?.amount??state.settings.dailyRate,'number');
    else h+=field('hours',ot?'MESAİ SÜRESİ':'KAÇ SAAT ÇALIŞTIN?',x?.hours??0,'number')+field('rate',ot?'MESAİ SAATLİK ÜCRET':'SAATLİK ÜCRET',x?.rate??(ot?state.settings.overtimeRate:state.settings.hourlyRate),'number');
    if(!daily)h+=paymentChoiceFor(x);
    h+=roadBox(x?roadsFor(x.id):[]);
    if(daily)h+=`<div class="notice stableSalaryNote431642">GÜNLÜK ANA İŞ ÇALIŞMA GÜNÜNDE GELİR SAYILMAZ; HAKEDİŞ / ALACAK OLARAK KAYDEDİLİR. MAAŞ ALINDIĞINDA ALACAKLARDAN TAHSİL EDİLİR.</div>`;
    h+=textarea('note','NOT',x?.note||'');
    return h;
  }
  window.dailyForm=function(){return `<form class="stableWorkForm431642" onsubmit="stableSubmitWork431642(event,'daily')">${workFields('daily')}<button class="primary">GÜNLÜK KAYDI EKLE</button></form>`};
  window.hourlyForm=function(){return `<form class="stableWorkForm431642" onsubmit="stableSubmitWork431642(event,'hourly')">${workFields('hourly')}<button class="primary">SAATLİK KAYDI EKLE</button></form>`};
  window.overtimeForm=function(){return `<form class="stableWorkForm431642" onsubmit="stableSubmitWork431642(event,'overtime')">${workFields('overtime')}<button class="primary">MESAİ KAYDI EKLE</button></form>`};
  window.stableSubmitWork431642=function(e,type,id=''){
    e.preventDefault();const form=e.currentTarget,d=Object.fromEntries(new FormData(form).entries());
    const roads=collectRoadRows(form);if(roads===null)return;
    let w=id?(state.work||[]).find(x=>String(x.id)===String(id)):null;
    if(!w&&(state.work||[]).some(x=>x.date===d.date)&&!confirm('BU TARİHTE ZATEN ÇALIŞMA KAYDI VAR.\nBAŞKA KAYIT EKLEMEK İSTİYOR MUSUN?'))return;
    const previousPaid=w?(typeof workPaid==='function'?workPaid(w):num(w.paidAmount)):0;
    if(!w){w={id:uid(),type};state.work.push(w)}
    w.type=type;w.date=d.date||iso();w.title=upper(d.title||(type==='hourly'?'EK İŞ':'ANA İŞ'));w.note=d.note||'';
    if(type==='daily'){w.amount=num(d.amount);w.salaryBased=true;w.paidAmount=Math.min(w.amount,previousPaid);w.paymentStatus=w.paidAmount>=w.amount&&w.amount>0?'paid':(w.paidAmount>0?'partial':'unpaid');}
    else{
      w.hours=num(d.hours);w.rate=num(d.rate);w.amount=w.hours*w.rate;
      if(d.payment==='paid')w.paidAmount=w.amount;else if(d.payment==='unpaid')w.paidAmount=0;else w.paidAmount=Math.min(w.amount,previousPaid);
      w.paymentStatus=w.paidAmount>=w.amount&&w.amount>0?'paid':(w.paidAmount>0?'partial':'unpaid');
    }
    replaceRoads(w,roads);save();modal=null;render();if(typeof rutinToast==='function')setTimeout(()=>rutinToast(id?'KAYIT GÜNCELLENDİ ✓':'KAYIT EKLENDİ ✓'),30);
  };

  // Editing a work record uses the same stable road/payment form as adding it.
  const prevModalHtml431642=window.modalHtml;
  window.modalHtml=function(k){
    let id='';
    if(k.startsWith('editWork:'))id=k.split(':')[1]||'';
    else if(k.startsWith('editRecord:work:'))id=k.split(':')[2]||'';
    if(id){
      const x=(state.work||[]).find(z=>String(z.id)===String(id));
      if(x){const label=x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ';return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet stableWorkSheet431642" onclick="event.stopPropagation()"><div class="sheetHead"><b>${label}</b><button class="close" type="button" onclick="closeModal()">×</button></div><form class="stableWorkForm431642" onsubmit="stableSubmitWork431642(event,'${E(x.type)}','${E(x.id)}')">${workFields(x.type,x)}<button class="primary">DEĞİŞİKLİĞİ KAYDET</button><button type="button" class="secondary dangerBtn" onclick="stableDeleteWork431642('${E(x.id)}')">KAYDI SİL</button></form></div></div>`;}
    }
    return prevModalHtml431642(k);
  };
  window.stableDeleteWork431642=function(id){
    if(!confirm('BU ÇALIŞMA KAYDI SİLİNSİN Mİ?'))return;
    roadsFor(id).forEach(removeRoadCardEffect);state.expenses=(state.expenses||[]).filter(x=>String(x.workId||'')!==String(id));state.work=(state.work||[]).filter(x=>String(x.id)!==String(id));
    state.workPayments=(state.workPayments||[]).filter(x=>String(x.workId)!==String(id));save();modal=null;render();if(typeof rutinToast==='function')setTimeout(()=>rutinToast('KAYIT SİLİNDİ ✓'),30);
  };

  // Reports: one clean layout, no inherited oversized report button collision.
  window.rutinReportIncomeOpen=window.rutinReportIncomeOpen!==false;
  window.rutinReportExpenseOpen=window.rutinReportExpenseOpen!==false;
  window.v43162Toggle=function(kind){if(kind==='income')window.rutinReportIncomeOpen=!window.rutinReportIncomeOpen;else window.rutinReportExpenseOpen=!window.rutinReportExpenseOpen;render()};
  function stableMovement(kind,x){
    const isEx=kind==='expense',isWork=kind==='work';const val=isWork?(typeof workPaid==='function'?workPaid(x):workValue(x)):num(x.amount);
    const label=isWork?(x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ'):(x.title||x.category||(isEx?'HARCAMA':'GELİR'));
    return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('${kind}','${E(x.id)}')"><i>${isEx?'−':isWork?'▣':'₺'}</i><div><b>${E(label)}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="${isEx?'red':'green'}">${isEx?'-':'+'}${money(val)}</strong><span>›</span></button>`;
  }
  window.v431642Search=function(v){
    const box=document.getElementById('v431642SearchResults');if(!box)return;const q=String(v||'').trim().toLocaleUpperCase('tr-TR');if(!q){box.innerHTML='';return;}
    const all=[...(filterByPeriod(state.work,reportPeriod)||[]).map(x=>['work',x]),...(filterByPeriod(state.incomes,reportPeriod)||[]).map(x=>['income',x]),...(filterByPeriod(state.expenses,reportPeriod)||[]).map(x=>['expense',x])].filter(z=>JSON.stringify(z[1]).toLocaleUpperCase('tr-TR').includes(q)).slice(0,40);
    box.innerHTML=all.map(z=>stableMovement(z[0],z[1])).join('')||'<div class="notice">EŞLEŞEN KAYIT YOK.</div>';
  };
  window.reports=function(){
    const T=accountingTotals(reportPeriod),R=dateRangeForPeriod(reportPeriod),w=filterByPeriod(state.work,reportPeriod),inc=filterByPeriod(state.incomes,reportPeriod),exp=filterByPeriod(state.expenses,reportPeriod);
    const incomes=[...w.filter(x=>(typeof workPaid==='function'?workPaid(x):workValue(x))>0).map(x=>['work',x]),...inc.map(x=>['income',x])].sort((a,b)=>(b[1].date||'').localeCompare(a[1].date||''));
    const expenses=exp.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    const B=(k,l)=>`<button class="${reportPeriod===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`;
    const max=Math.max(1,T.income,T.expense),ip=Math.round(T.income/max*100),ep=Math.round(T.expense/max*100);
    return `${header('RAPORLAR',true)}
      <div class="stableAccountingTop431642"><button onclick="go('receivables')"><small>HAK EDİLEN</small><strong>${money(T.earned)}</strong></button><button onclick="go('receivables')"><small>ALINAN</small><strong class="green">${money(T.workPaid)}</strong></button><button onclick="go('receivables')"><small>ALACAK</small><strong class="red">${money(T.receivable)}</strong></button></div>
      <div class="tabs stableReportTabs431642">${B('day','GÜNLÜK')}${B('week','HAFTALIK')}${B('month','AYLIK')}${B('year','YILLIK')}<button onclick="openModal('range')">ÖZEL</button></div>
      <div class="v43162SearchCompact stableReportSearch431642"><span>⌕</span><input type="search" placeholder="Hareket ara..." oninput="v431642Search(this.value)"><button type="button" onclick="this.previousElementSibling.value='';v431642Search('')">×</button></div><div id="v431642SearchResults"></div>
      <div class="section"><b>${E(R.label||'SEÇİLİ DÖNEM')}</b><span>GERÇEK PARA HAREKETİ</span></div>
      <div class="stableMoneySummary431642"><div><small>TOPLAM GELİR</small><strong class="green">${money(T.income)}</strong></div><div><small>TOPLAM HARCAMA</small><strong class="red">${money(T.expense)}</strong></div><div><small>NET</small><strong>${money(T.net)}</strong></div></div>
      <div class="dualDonutWrap stableDonuts431642"><button class="donutCard" onclick="typeof openReportIncome43101==='function'&&openReportIncome43101()"><div class="donutRing incomeRing" style="--pct:${ip}"><div class="donutCenter"><small>GELİR</small><strong class="green">${money(T.income)}</strong></div></div></button><button class="donutCard" onclick="typeof openReportExpense43101==='function'&&openReportExpense43101()"><div class="donutRing expenseRing" style="--pct:${ep}"><div class="donutCenter"><small>GİDER</small><strong class="red">${money(T.expense)}</strong></div></div></button></div>
      <button class="v43162CollapseHead" onclick="v43162Toggle('income')"><span><b>GELİR HAREKETLERİ</b><small>${incomes.length} KAYIT</small></span><i>${rutinReportIncomeOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse">${rutinReportIncomeOpen?(incomes.map(z=>stableMovement(z[0],z[1])).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>
      <button class="v43162CollapseHead" onclick="v43162Toggle('expense')"><span><b>GİDER HAREKETLERİ</b><small>${expenses.length} KAYIT</small></span><i>${rutinReportExpenseOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse">${rutinReportExpenseOpen?(expenses.map(x=>stableMovement('expense',x)).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>`;
  };
  window.detailReport=window.reports;

  // Card detail must use the normal phone shell. The old implementation rendered it outside .phone,
  // which caused width growth and put the back button under the iPhone status bar.
  window.openCardDetailV43163=function(id){
    if(screen!=='cardDetailV43163'){
      window.rutinNavHistory=window.rutinNavHistory||[];
      window.rutinNavHistory.push({screen:screen||'finance',financeTab:window.financeTabV4310||'cards'});
    }
    window.cardDetailIdV43163=id;screen='cardDetailV43163';modal=null;render();
  };
  const renderBeforeStable431642=window.render;
  window.render=function(){
    if(state.settings.lock&&!unlocked){
      const app=document.getElementById('app');app.innerHTML=cleanPinScreen();requestAnimationFrame(()=>{if(typeof bindCleanPinControls==='function')bindCleanPinControls();});return;
    }
    if(screen==='cardDetailV43163'){
      const app=document.getElementById('app');
      app.innerHTML=`<main class="phone stableCardPhone431642">${cardDetailV43163()}${nav()}</main>${modal?modalHtml(modal):''}`;
      requestAnimationFrame(()=>{if(typeof enhanceUI4312==='function')enhanceUI4312();if(typeof enhanceModal4312==='function')enhanceModal4312();});
      return;
    }
    renderBeforeStable431642();
  };
})();

;
