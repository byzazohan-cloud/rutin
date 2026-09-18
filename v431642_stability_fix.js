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
