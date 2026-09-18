/* RUTIN V43.16.9.1 STABLE — report road grouping + safe delete + calendar paid-income + allowance flex */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const SUM=a=>(a||[]).reduce((s,x)=>s+N(x.amount),0);
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad' || U(x.title)==='YOL' || U(x.note).includes('ÇALIŞMA YOL'));

function roadGroups(items){
 const map=new Map();
 (items||[]).filter(isRoad).forEach(x=>{const k=String(x.date||'');if(!map.has(k))map.set(k,[]);map.get(k).push(x)});
 return [...map.values()].sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')));
}
function payTotals(a){return{
 cash:SUM((a||[]).filter(x=>U(x.method).includes('NAKİT'))),
 card:SUM((a||[]).filter(x=>U(x.method).includes('KREDİ'))),
 flex:SUM((a||[]).filter(x=>U(x.method).includes('ESNEK')))
};}
function roadCard(a){
 const x=a?.[0]||{},p=payTotals(a),bits=[];
 if(p.card)bits.push(M(p.card)+' KART');if(p.cash)bits.push(M(p.cash)+' NAKİT');if(p.flex)bits.push(M(p.flex)+' ESNEK');
 return `<button class="roadGroupCardV438" onclick="openModal('roadDay431691:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${bits.join(' · ')}</em></div><strong>-${M(SUM(a))}</strong><span>›</span></button>`;
}
function expenseRow(x){return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('expense','${E(x.id)}')"><i>−</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function groupedExpenseRows(items){
 const rows=[...roadGroups(items).map(a=>({date:a[0]?.date||'',html:roadCard(a)})),...(items||[]).filter(x=>!isRoad(x)).map(x=>({date:x.date||'',html:expenseRow(x)}))];
 return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');
}
function workReceived(x){
 try{return typeof workPaid==='function'?N(workPaid(x)):(x.paid===true||x.paymentReceived===true||U(x.paymentStatus)==='ALINDI'?N(x.amount||N(x.hours)*N(x.rate)):0)}catch(_){return 0}
}

// REPORTS: render the actual collapsible expense section with road payments grouped strictly by date.
window.reports=function(){
 const T=accountingTotals(reportPeriod),R=dateRangeForPeriod(reportPeriod),w=filterByPeriod(state.work,reportPeriod),inc=filterByPeriod(state.incomes,reportPeriod),exp=filterByPeriod(state.expenses,reportPeriod);
 const incomes=[...w.filter(x=>workReceived(x)>0).map(x=>['work',x]),...inc.map(x=>['income',x])].sort((a,b)=>(b[1].date||'').localeCompare(a[1].date||''));
 const expenses=exp.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const displayExpenseCount=roadGroups(expenses).length+expenses.filter(x=>!isRoad(x)).length;
 const B=(k,l)=>`<button class="${reportPeriod===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`;
 const max=Math.max(1,T.income,T.expense),ip=Math.round(T.income/max*100),ep=Math.round(T.expense/max*100);
 const move=(kind,x)=>{const isEx=kind==='expense',isWork=kind==='work',val=isWork?workReceived(x):N(x.amount),label=isWork?(x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ'):(x.title||x.category||(isEx?'HARCAMA':'GELİR'));return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('${kind}','${E(x.id)}')"><i>${isEx?'−':isWork?'▣':'₺'}</i><div><b>${E(label)}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="${isEx?'red':'green'}">${isEx?'-':'+'}${M(val)}</strong><span>›</span></button>`};
 return `${header('RAPORLAR',true)}
 <div class="stableAccountingTop431642"><button onclick="go('receivables')"><small>HAK EDİLEN</small><strong>${M(T.earned)}</strong></button><button onclick="go('receivables')"><small>ALINAN</small><strong class="green">${M(T.workPaid)}</strong></button><button onclick="go('receivables')"><small>ALACAK</small><strong class="red">${M(T.receivable)}</strong></button></div>
 <div class="tabs stableReportTabs431642">${B('day','GÜNLÜK')}${B('week','HAFTALIK')}${B('month','AYLIK')}${B('year','YILLIK')}<button onclick="openModal('range')">ÖZEL</button></div>
 <div class="v43162SearchCompact stableReportSearch431642"><span>⌕</span><input type="search" placeholder="Hareket ara..." oninput="v431642Search(this.value)"><button type="button" onclick="this.previousElementSibling.value='';v431642Search('')">×</button></div><div id="v431642SearchResults"></div>
 <div class="section"><b>${E(R.label||'SEÇİLİ DÖNEM')}</b><span>GERÇEK PARA HAREKETİ</span></div>
 <div class="stableMoneySummary431642"><div><small>TOPLAM GELİR</small><strong class="green">${M(T.income)}</strong></div><div><small>TOPLAM HARCAMA</small><strong class="red">${M(T.expense)}</strong></div><div><small>NET</small><strong>${M(T.net)}</strong></div></div>
 <div class="dualDonutWrap stableDonuts431642"><button class="donutCard" onclick="typeof openReportIncome43101==='function'&&openReportIncome43101()"><div class="donutRing incomeRing" style="--pct:${ip}"><div class="donutCenter"><small>GELİR</small><strong class="green">${M(T.income)}</strong></div></div></button><button class="donutCard" onclick="typeof openReportExpense43101==='function'&&openReportExpense43101()"><div class="donutRing expenseRing" style="--pct:${ep}"><div class="donutCenter"><small>GİDER</small><strong class="red">${M(T.expense)}</strong></div></div></button></div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('income')"><span><b>GELİR HAREKETLERİ</b><small>${incomes.length} KAYIT</small></span><i>${rutinReportIncomeOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportIncomeOpen?'open':''}">${rutinReportIncomeOpen?(incomes.map(z=>move(z[0],z[1])).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('expense')"><span><b>GİDER HAREKETLERİ</b><small>${expenses.length} KAYIT · ${displayExpenseCount} SATIR</small></span><i>${rutinReportExpenseOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportExpenseOpen?'open':''}">${rutinReportExpenseOpen?(groupedExpenseRows(expenses)||'<div class="notice">KAYIT YOK.</div>'):''}</div>`;
};
window.detailReport=window.reports;

// Safe road delete, including Card/Flex reversal.
function safeDeleteExpense(id){
 const x=(state.expenses||[]).find(z=>String(z.id)===String(id));if(!x)return false;
 if(typeof window.rutinDetachFundingV431651==='function')window.rutinDetachFundingV431651(x);
 state.expenses=(state.expenses||[]).filter(z=>String(z.id)!==String(id));return true;
}
window.deleteExpenseSafe=safeDeleteExpense;

// Modal patches: report road detail, calendar paid-income, allowance Flex Account.
const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('roadDay431691:')){
  const date=k.slice('roadDay431691:'.length),a=(state.expenses||[]).filter(x=>String(x.date||'')===String(date)&&isRoad(x)),p=payTotals(a);
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${M(SUM(a))}</strong><div><span>💳 ${M(p.card)} KART</span><span>💵 ${M(p.cash)} NAKİT</span>${p.flex?`<span>▥ ${M(p.flex)} ESNEK</span>`:''}</div></div><div class="section"><b>YOL ÖDEMELERİ</b><span>TEK TEK DÜZENLE / SİL</span></div>${a.map((x,i)=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||((i%2)?'DÖNÜŞ':'GİDİŞ'))}</i><div><b>${E(x.direction||'YOL')} · ${M(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):x.flexName?' · '+E(x.flexName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay431691('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;
 }
 if(k&&k.startsWith('allowanceAdd43165')){
  const preset=k.includes(':')?decodeURIComponent(k.split(':').slice(1).join(':')):'';
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HARÇLIK EKLE</b><button class="close" onclick="closeModal()">×</button></div><form onsubmit="submitAllowanceV431691(event,'${E(preset)}')"><div class="field"><label>KİŞİ</label><input name="recipient" value="${E(preset)}" placeholder="KİME VERİLDİ?"></div>${field('amount','TUTAR',0,'number')}${field('date','TARİH',iso(),'date')}<div class="field"><label>ÖDEME</label><select name="method" onchange="toggleAllowanceFundingV431691(this.form)"><option value="NAKİT">NAKİT</option><option value="KREDİ KARTI">KREDİ KARTI</option><option value="ESNEK HESAP">ESNEK HESAP</option></select></div><div class="field allowanceCardPick431691" hidden><label>KART</label><select name="cardId"><option value="">KART SEÇ</option>${(state.cards||[]).map(c=>`<option value="${E(c.id)}">${E(c.name)}</option>`).join('')}</select></div><div class="field allowanceFlexPick431691" hidden><label>ESNEK HESAP</label><select name="flexId"><option value="">HESAP SEÇ</option>${(state.flexAccounts||[]).map(a=>`<option value="${E(a.id)}">${E(a.name)}</option>`).join('')}</select></div><div class="field"><label>AÇIKLAMA</label><textarea name="note" placeholder="İSTEĞE BAĞLI"></textarea></div><button class="primary">KAYDET</button></form></div></div>`;
 }
 const h=prevModal(k);
 if(k&&k.startsWith('day:')){
  const ds=k.slice(4),w=(state.work||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds),actual=SUM(inc)+w.reduce((s,x)=>s+workReceived(x),0);
  return String(h).replace(/<span>GELİR <b>[^<]*<\/b><\/span>/,`<span>GELİR <b>${M(actual)}</b></span>`);
 }
 return h;
};

window.deleteRoadDay431691=function(id,date){
 if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;
 if(safeDeleteExpense(id)){save();render();const left=(state.expenses||[]).some(x=>String(x.date||'')===String(date)&&isRoad(x));if(left)openModal('roadDay431691:'+date);else closeModal();}
};
window.toggleAllowanceFundingV431691=function(f){
 const m=U(f.method?.value||'NAKİT'),c=f.querySelector('.allowanceCardPick431691'),x=f.querySelector('.allowanceFlexPick431691');if(c)c.hidden=m!=='KREDİ KARTI';if(x)x.hidden=m!=='ESNEK HESAP';
};
window.submitAllowanceV431691=function(e,preset=''){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),amount=N(d.amount),recipient=U(d.recipient||preset),method=U(d.method||'NAKİT');
 if(!recipient)return alert('KİŞİ ADINI GİRİN.');if(amount<=0)return alert('TUTAR GİRİN.');
 const card=method==='KREDİ KARTI'?(state.cards||[]).find(c=>String(c.id)===String(d.cardId)):null,flex=method==='ESNEK HESAP'?(state.flexAccounts||[]).find(a=>String(a.id)===String(d.flexId)):null;
 if(method==='KREDİ KARTI'&&!card)return alert('KART SEÇİN.');if(method==='ESNEK HESAP'&&!flex)return alert('ESNEK HESAP SEÇİN.');
 const x={id:uid(),date:d.date||iso(),title:'HARÇLIK',category:'HARÇLIK',recipient,person:recipient,amount,method:'NAKİT',note:d.note||'',cardId:'',cardName:'',flexId:'',flexName:'',sourceType:'',sourceId:''};
 state.expenses.push(x);
 if(method==='KREDİ KARTI'){
   card.transactions=Array.isArray(card.transactions)?card.transactions:[];const t={id:uid(),expenseId:x.id,title:'HARÇLIK',category:'HARÇLIK',amount,date:x.date,type:'spend'};card.transactions.push(t);card.balance=N(card.balance)+amount;Object.assign(x,{method:'KREDİ KARTI',sourceType:'card',sourceId:t.id,cardId:card.id,cardName:card.name||'KREDİ KARTI'});
 }else if(method==='ESNEK HESAP'){
   if(typeof window.rutinAttachFlexV431651==='function')window.rutinAttachFlexV431651(x,flex.id);else{flex.transactions=Array.isArray(flex.transactions)?flex.transactions:[];const t={id:uid(),expenseId:x.id,title:'HARÇLIK',category:'HARÇLIK',amount,date:x.date,type:'spend'};flex.transactions.push(t);flex.balance=N(flex.balance)+amount;Object.assign(x,{method:'ESNEK HESAP',sourceType:'flex',sourceId:t.id,flexId:flex.id,flexName:flex.name||'ESNEK HESAP'});}
 } else x.method='NAKİT';
 save();modal=null;screen=preset?'allowancePerson':'allowance';window.rutinAllowancePerson=recipient;if(window.showToastV43162)showToastV43162('HARÇLIK KAYDEDİLDİ ✓');render();
};
})();
