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
