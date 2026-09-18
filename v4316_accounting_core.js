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
