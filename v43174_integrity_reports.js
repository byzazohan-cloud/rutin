/* RUTIN V43.17.4 — Reports + Allowance + Card/Flex integrity; calendar UI untouched */
(function(){
'use strict';
const VERSION='43.17.4';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const arr=v=>Array.isArray(v)?v:[];
const sum=(a,fn=x=>N(x.amount))=>arr(a).reduce((s,x)=>s+N(fn(x)),0);
state.meta=state.meta||{};
state.cards=arr(state.cards);state.flexAccounts=arr(state.flexAccounts);state.expenses=arr(state.expenses);state.work=arr(state.work);state.workPayments=arr(state.workPayments);state.incomes=arr(state.incomes);
state.cards.forEach(c=>c.transactions=arr(c.transactions));state.flexAccounts.forEach(a=>a.transactions=arr(a.transactions));

function isRoad(x){return !!x&&U(x.category)==='YOL'&&(!!x.workId||x.sourceType==='workRoad'||U(x.title)==='YOL'||U(x.note).includes('YOL'));}
function isAllowance(x){return !!x&&U(x.category||x.title)==='HARÇLIK';}
function earned(w){return typeof workEarned==='function'?N(workEarned(w)):N(w.amount!=null?w.amount:N(w.hours)*N(w.rate));}
function paid(w){return typeof workPaid==='function'?N(workPaid(w)):Math.max(0,Math.min(earned(w),N(w.paidAmount)));}
function receivable(w){return typeof workReceivable==='function'?N(workReceivable(w)):Math.max(0,earned(w)-paid(w));}
function range(){try{return dateRangeForPeriod(reportPeriod)}catch(_){return{start:'0000-01-01',end:'9999-12-31',label:'SEÇİLİ DÖNEM'}}}
function inRange(ds,r){return String(ds||'')>=String(r.start||'0000-01-01')&&String(ds||'')<=String(r.end||'9999-12-31');}
function workType(w){return w.type==='daily'?'GÜNLÜK ÇALIŞMA':w.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ';}
function workStatus(w){const r=receivable(w),p=paid(w);return r<=0?'ALINDI':p>0?'KISMİ ALINDI':'ALACAK';}

/* ---------- V43.17.4 SAFE LEGACY INTEGRATION ----------
   Links old finance transactions to expense records without rewriting balances. */
function migrate43174(){
 if(state.meta.v43174Migration)return false;
 const findExpenseForTx=(kind,account,t)=>state.expenses.find(x=>String(x.sourceId||'')===String(t.id)||
   (kind==='card'&&String(x.cardId||'')===String(account.id)&&String(x.date||'')===String(t.date||'')&&Math.abs(N(x.amount)-Math.abs(N(t.amount)))<0.001&&U(x.title)===U(t.title))||
   (kind==='flex'&&String(x.flexId||'')===String(account.id)&&String(x.date||'')===String(t.date||'')&&Math.abs(N(x.amount)-Math.abs(N(t.amount)))<0.001&&U(x.title)===U(t.title)));
 const link=(kind,account,t,x)=>{
   t.type=t.type==='payment'?'payment':'spend'; if(t.type==='payment')return;
   t.expenseId=x.id;x.sourceId=t.id;x.sourceType=kind;x.method=kind==='card'?'KREDİ KARTI':'ESNEK HESAP';
   if(kind==='card'){x.cardId=account.id;x.cardName=account.name||'KREDİ KARTI';x.flexId='';x.flexName='';}
   else{x.flexId=account.id;x.flexName=account.name||'ESNEK HESAP';x.cardId='';x.cardName='';}
 };
 state.cards.forEach(c=>arr(c.transactions).forEach(t=>{
   if(t.type==='payment'||N(t.amount)<0)return;
   let x=findExpenseForTx('card',c,t);
   if(!x){x={id:uid(),date:t.date||iso(),title:t.title||'KART HARCAMASI',category:t.category||'DİĞER',amount:Math.abs(N(t.amount)),method:'KREDİ KARTI',cardId:c.id,cardName:c.name||'KREDİ KARTI',sourceType:'card',sourceId:t.id,note:'ESKİ KART HAREKETİ · V43.17.4 UYUMLAMA',migrated43174:true};state.expenses.push(x);}
   link('card',c,t,x);
 }));
 state.flexAccounts.forEach(a=>arr(a.transactions).forEach(t=>{
   if(t.type==='payment'||N(t.amount)<0)return;
   let x=findExpenseForTx('flex',a,t);
   if(!x){x={id:uid(),date:t.date||iso(),title:t.title||'ESNEK HESAP HARCAMASI',category:t.category||'DİĞER',amount:Math.abs(N(t.amount)),method:'ESNEK HESAP',flexId:a.id,flexName:a.name||'ESNEK HESAP',sourceType:'flex',sourceId:t.id,note:'ESKİ ESNEK HESAP HAREKETİ · V43.17.4 UYUMLAMA',migrated43174:true};state.expenses.push(x);}
   link('flex',a,t,x);
 }));
 state.expenses.forEach(x=>{
   if(x.sourceType==='card'||x.cardId){const c=state.cards.find(z=>String(z.id)===String(x.cardId))||state.cards.find(z=>arr(z.transactions).some(t=>String(t.id)===String(x.sourceId)));if(c){x.method='KREDİ KARTI';x.cardId=c.id;x.cardName=c.name||'KREDİ KARTI';const t=arr(c.transactions).find(t=>String(t.id)===String(x.sourceId)||String(t.expenseId||'')===String(x.id));if(t){t.expenseId=x.id;t.type=t.type==='payment'?'payment':'spend';x.sourceId=t.id;x.sourceType='card';}}}
   if(x.sourceType==='flex'||x.flexId){const a=state.flexAccounts.find(z=>String(z.id)===String(x.flexId))||state.flexAccounts.find(z=>arr(z.transactions).some(t=>String(t.id)===String(x.sourceId)));if(a){x.method='ESNEK HESAP';x.flexId=a.id;x.flexName=a.name||'ESNEK HESAP';const t=arr(a.transactions).find(t=>String(t.id)===String(x.sourceId)||String(t.expenseId||'')===String(x.id));if(t){t.expenseId=x.id;t.type=t.type==='payment'?'payment':'spend';x.sourceId=t.id;x.sourceType='flex';}}}
   if(isAllowance(x)){x.category='HARÇLIK';x.title='HARÇLIK';x.recipient=U(x.recipient||x.person||x.allowanceTo||'BELİRTİLMEDİ');x.person=x.recipient;}
 });
 state.meta.v43174Migration=1;state.meta.v43174MigrationAt=new Date().toISOString();state.meta.appDataVersion=VERSION;save();return true;
}
const migrated=migrate43174();
if(migrated&&typeof rutinToast==='function')setTimeout(()=>rutinToast('ESKİ FİNANS VERİLERİ YENİ SİSTEME BAĞLANDI ✓'),400);

/* ---------- FUTURE DIRECT CARD/FLEX SPENDS: always create one linked expense ---------- */
window.submitCardSpend=function(e,cid,tid=''){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),c=state.cards.find(x=>String(x.id)===String(cid));if(!c)return;
 c.transactions=arr(c.transactions);const amount=Math.max(0,N(d.amount));if(!amount)return alert('TUTAR GİRİN.');let t=c.transactions.find(x=>String(x.id)===String(tid));
 if(t){const old=Math.abs(N(t.amount)),diff=amount-old;t.title=U(d.title||t.title||'KART HARCAMASI');t.amount=amount;t.date=d.date||t.date||iso();t.type='spend';c.balance=Math.max(0,N(c.balance)+diff);let x=state.expenses.find(z=>String(z.id)===String(t.expenseId||'')||String(z.sourceId||'')===String(t.id));if(!x){x={id:uid()};state.expenses.push(x);}Object.assign(x,{date:t.date,title:t.title,amount,category:x.category||t.category||'DİĞER',method:'KREDİ KARTI',cardId:c.id,cardName:c.name||'KREDİ KARTI',sourceType:'card',sourceId:t.id,note:x.note||'KART HARCAMASI'});t.expenseId=x.id;
 }else{t={id:uid(),title:U(d.title||'KART HARCAMASI'),amount,date:d.date||iso(),type:'spend'};const x={id:uid(),date:t.date,title:t.title,amount,category:'DİĞER',method:'KREDİ KARTI',cardId:c.id,cardName:c.name||'KREDİ KARTI',sourceType:'card',sourceId:t.id,note:'KART HARCAMASI'};t.expenseId=x.id;c.transactions.push(t);state.expenses.push(x);c.balance=N(c.balance)+amount;}
 save();if(typeof closeModal==='function')closeModal();if(typeof rutinToast==='function')rutinToast('KART HARCAMASI KAYDEDİLDİ ✓');render();
};
window.submitFlexSpend4310=function(e,id){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),a=state.flexAccounts.find(x=>String(x.id)===String(id));if(!a)return;const amount=Math.max(0,N(d.amount));if(!amount)return alert('TUTAR GİRİN.');a.transactions=arr(a.transactions);const t={id:uid(),title:U(d.title||'HARCAMA'),amount,date:d.date||iso(),type:'spend'};const x={id:uid(),date:t.date,title:t.title,amount,category:'DİĞER',method:'ESNEK HESAP',flexId:a.id,flexName:a.name||'ESNEK HESAP',sourceType:'flex',sourceId:t.id,note:'ESNEK HESAP HARCAMASI'};t.expenseId=x.id;a.transactions.push(t);state.expenses.push(x);a.balance=N(a.balance)+amount;save();closeModal();if(typeof rutinToast==='function')rutinToast('ESNEK HESAP HARCAMASI KAYDEDİLDİ ✓');render();
};

/* ---------- ACTUAL CASH EVENTS FOR REPORTS ---------- */
function workCashEvents(){
 const paymentsByWork={};state.workPayments.forEach(p=>{const k=String(p.workId||'');(paymentsByWork[k]||(paymentsByWork[k]=[])).push(p)});
 const out=[];
 state.work.forEach(w=>{
   const ps=paymentsByWork[String(w.id)]||[],explicit=sum(ps),implicit=Math.max(0,paid(w)-explicit);
   if(implicit>0)out.push({kind:'workCash',id:w.id,date:w.date,amount:implicit,label:workType(w),sub:'PEŞİN ALINDI'});
   ps.forEach(p=>{if(N(p.amount)>0)out.push({kind:'workCash',id:w.id,date:p.date||w.date,amount:N(p.amount),label:workType(w)+' TAHSİLATI',sub:(w.title||'')});});
 });
 return out;
}
function actualReport(r=range()){
 const works=state.work.filter(w=>inRange(w.date,r));
 const workCash=workCashEvents().filter(x=>inRange(x.date,r));
 const incomes=state.incomes.filter(x=>inRange(x.date,r));
 const expenses=state.expenses.filter(x=>inRange(x.date,r));
 const earnedTotal=sum(works,earned),receivedTotal=sum(workCash),recvOpen=sum(works,receivable),other=sum(incomes),expense=sum(expenses);
 return{r,works,workCash,incomes,expenses,earned:earnedTotal,received:receivedTotal,receivable:recvOpen,other,income:receivedTotal+other,expense,net:receivedTotal+other-expense};
}
function workRow(w){return `<button class="globalRecordRowV435 stableReportRow431642 v43174WorkRow" onclick="openRecordV435('work','${E(w.id)}')"><i>▣</i><div><b>${E(workType(w))}</b><small>${E(w.date||'')} · ${E(workStatus(w))}${w.hours?' · '+E(w.hours)+' SAAT':''}</small></div><strong class="${receivable(w)>0?'gold':'green'}">${M(earned(w))}</strong><span>›</span></button>`;}
function incomeEventRow(x){if(x.kind==='workCash')return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('work','${E(x.id)}')"><i>₺</i><div><b>${E(x.label)}</b><small>${E(x.date)} · ${E(x.sub||'ALINDI')}</small></div><strong class="green">+${M(x.amount)}</strong><span>›</span></button>`;return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'DİĞER GELİR')}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="green">+${M(x.amount)}</strong><span>›</span></button>`;}
function expenseRow(x){return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'−'}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')} · DETAY</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function roadGroups(items){const m={};arr(items).filter(isRoad).forEach(x=>(m[String(x.date||'')]||(m[String(x.date||'')]=[])).push(x));return Object.values(m);}
function roadRow(a){const x=a[0]||{},tot=sum(a),card=sum(a.filter(z=>U(z.method).includes('KREDİ'))),cash=sum(a.filter(z=>U(z.method).includes('NAKİT'))),flex=sum(a.filter(z=>U(z.method).includes('ESNEK'))),bits=[];if(card)bits.push(M(card)+' KART');if(cash)bits.push(M(cash)+' NAKİT');if(flex)bits.push(M(flex)+' ESNEK');return `<button class="roadGroupCardV438 v43174RoadRow" onclick="openModal('roadDay43174:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${bits.join(' · ')}</em></div><strong>-${M(tot)}</strong><span>›</span></button>`;}
function expenseRows(items){const rows=[...roadGroups(items).map(a=>({date:a[0]?.date||'',html:roadRow(a)})),...arr(items).filter(x=>!isRoad(x)).map(x=>({date:x.date||'',html:expenseRow(x)}))];return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');}

window.rutinReportWorkOpen=window.rutinReportWorkOpen!==false;
const prevToggle=window.v43162Toggle;
window.v43174Toggle=function(kind){if(kind==='work')window.rutinReportWorkOpen=!window.rutinReportWorkOpen;else if(typeof prevToggle==='function')prevToggle(kind);else render();if(kind==='work')render();};
window.reports=function(){
 const A=actualReport(),r=A.r,B=(k,l)=>`<button class="${reportPeriod===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`,max=Math.max(1,A.income,A.expense),ip=Math.round(A.income/max*100),ep=Math.round(A.expense/max*100);
 const incomeRows=[...A.workCash,...A.incomes.map(x=>({...x,kind:'income'}))].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).map(incomeEventRow).join('');
 const dispExpense=roadGroups(A.expenses).length+A.expenses.filter(x=>!isRoad(x)).length;
 return `${header('RAPORLAR',true)}
 <div class="stableAccountingTop431642"><button onclick="go('receivables')"><small>HAK EDİLEN</small><strong>${M(A.earned)}</strong></button><button onclick="go('receivables')"><small>ALINAN</small><strong class="green">${M(A.received)}</strong></button><button onclick="go('receivables')"><small>ALACAK</small><strong class="red">${M(A.receivable)}</strong></button></div>
 <div class="tabs stableReportTabs431642">${B('day','GÜNLÜK')}${B('week','HAFTALIK')}${B('month','AYLIK')}${B('year','YILLIK')}<button onclick="openModal('range')">ÖZEL</button></div>
 <div class="section"><b>${E(r.label||'SEÇİLİ DÖNEM')}</b><span>GERÇEK PARA HAREKETİ</span></div>
 <div class="stableMoneySummary431642"><div><small>TOPLAM GELİR</small><strong class="green">${M(A.income)}</strong></div><div><small>TOPLAM HARCAMA</small><strong class="red">${M(A.expense)}</strong></div><div><small>NET</small><strong>${M(A.net)}</strong></div></div>
 <div class="dualDonutWrap stableDonuts431642"><button class="donutCard" onclick="openModal('reportIncome43174')"><div class="donutRing incomeRing" style="--pct:${ip}"><div class="donutCenter"><small>GELİR</small><strong class="green">${M(A.income)}</strong></div></div></button><button class="donutCard" onclick="openModal('reportExpense43174')"><div class="donutRing expenseRing" style="--pct:${ep}"><div class="donutCenter"><small>GİDER</small><strong class="red">${M(A.expense)}</strong></div></div></button></div>
 <button class="v43162CollapseHead" onclick="v43174Toggle('work')"><span><b>ÇALIŞMA / HAKEDİŞ</b><small>${A.works.length} KAYIT</small></span><i>${rutinReportWorkOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportWorkOpen?'open':''}">${rutinReportWorkOpen?(A.works.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(workRow).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('income')"><span><b>GERÇEK GELİR HAREKETLERİ</b><small>${A.workCash.length+A.incomes.length} KAYIT</small></span><i>${rutinReportIncomeOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportIncomeOpen?'open':''}">${rutinReportIncomeOpen?(incomeRows||'<div class="notice">KAYIT YOK.</div>'):''}</div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('expense')"><span><b>GİDER HAREKETLERİ</b><small>${A.expenses.length} KAYIT · ${dispExpense} SATIR</small></span><i>${rutinReportExpenseOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportExpenseOpen?'open':''}">${rutinReportExpenseOpen?(expenseRows(A.expenses)||'<div class="notice">KAYIT YOK.</div>'):''}</div>`;
};
window.detailReport=window.reports;

/* ---------- ALLOWANCE FINAL INTEGRATION ---------- */
window.rutinAllowanceFilter=window.rutinAllowanceFilter||'month';
function allowanceRange43174(){const f=window.rutinAllowanceFilter||'month',now=new Date(),today=typeof iso==='function'?iso(now):now.toISOString().slice(0,10),mk=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(f==='today')return{start:today,end:today,label:'BUGÜN'};if(f==='3m'){const d=new Date(now);d.setMonth(d.getMonth()-2);d.setDate(1);return{start:mk(d),end:today,label:'SON 3 AY'};}if(f==='1y'){const d=new Date(now);d.setFullYear(d.getFullYear()-1);d.setDate(d.getDate()+1);return{start:mk(d),end:today,label:'SON 1 YIL'};}if(f==='all')return{start:'0000-01-01',end:'9999-12-31',label:'TÜMÜ'};if(f==='custom'){let s=window.rutinAllowanceCustom?.start||today,e=window.rutinAllowanceCustom?.end||today;if(s>e)[s,e]=[e,s];return{start:s,end:e,label:'ÖZEL TARİH'};}return{start:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`,end:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(new Date(now.getFullYear(),now.getMonth()+1,0).getDate()).padStart(2,'0')}`,label:'BU AY'};}
function allowanceItems43174(person=''){const r=allowanceRange43174(),p=U(person);return state.expenses.filter(x=>isAllowance(x)&&inRange(x.date,r)&&(!p||U(x.recipient||x.person||'BELİRTİLMEDİ')===p)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));}
function allowanceTabs43174(){const tab=(k,l)=>`<button class="${window.rutinAllowanceFilter===k?'active':''}" onclick="setAllowanceFilterV43165('${k}')">${l}</button>`;return `${tab('today','BUGÜN')}${tab('month','BU AY')}${tab('3m','3 AY')}${tab('1y','1 YIL')}${tab('all','TÜMÜ')}<button class="${window.rutinAllowanceFilter==='custom'?'active':''}" onclick="openModal('allowanceRange43165')">TARİH</button>`;}
function fundingTotals(a){return{cash:sum(a.filter(x=>U(x.method)==='NAKİT')),card:sum(a.filter(x=>U(x.method)==='KREDİ KARTI')),flex:sum(a.filter(x=>U(x.method)==='ESNEK HESAP'))};}
window.allowanceScreenV43165=function(){const a=allowanceItems43174(),r=allowanceRange43174(),map={};a.forEach(x=>{const p=U(x.recipient||x.person||'BELİRTİLMEDİ')||'BELİRTİLMEDİ';(map[p]||(map[p]=[])).push(x)});const people=Object.entries(map).sort((A,B)=>sum(B[1])-sum(A[1])),total=sum(a),f=fundingTotals(a);return `${header('HARÇLIK',true)}<div class="allowanceHero43165"><div><small>${E(r.label)} TOPLAM HARÇLIK</small><strong>${M(total)}</strong><span>${people.length} KİŞİ · ${a.length} İŞLEM</span></div><button onclick="openModal('allowanceAdd43165')">＋ HARÇLIK EKLE</button></div><div class="allowanceFunding43174"><span>💵 NAKİT <b>${M(f.cash)}</b></span><span>💳 KART <b>${M(f.card)}</b></span><span>▥ ESNEK <b>${M(f.flex)}</b></span></div><div class="allowanceTabs43165">${allowanceTabs43174()}</div><div class="section"><b>KİŞİLER</b><span>DOKUN → DETAY</span></div><div class="allowancePeople43165">${people.map(([p,z])=>`<button onclick="openAllowancePersonV43165('${E(p).replace(/'/g,'&#39;')}')"><i>₺</i><div><b>${E(p)}</b><small>${z.length} İŞLEM · SON ${E(z[0]?.date||'-')}</small></div><strong>${M(sum(z))}</strong><span>›</span></button>`).join('')||'<div class="notice">BU DÖNEMDE HARÇLIK KAYDI YOK.</div>'}</div>`;};
window.allowancePersonV43165=function(){const p=window.rutinAllowancePerson||'',a=allowanceItems43174(p),all=state.expenses.filter(x=>isAllowance(x)&&U(x.recipient||x.person||'BELİRTİLMEDİ')===U(p)),r=allowanceRange43174(),total=sum(a),avg=a.length?total/a.length:0,f=fundingTotals(a);return `${header(p||'HARÇLIK',true)}<div class="allowancePersonHero43165"><i>₺</i><div><small>${E(r.label)} HARÇLIK</small><strong>${M(total)}</strong><span>${a.length} İŞLEM · ORT. ${M(avg)} · TÜMÜ ${M(sum(all))}</span></div></div><div class="allowanceFunding43174"><span>💵 ${M(f.cash)}</span><span>💳 ${M(f.card)}</span><span>▥ ${M(f.flex)}</span></div><div class="allowanceTabs43165">${allowanceTabs43174()}</div><button class="primary" onclick="openModal('allowanceAdd43165:${encodeURIComponent(p)}')">＋ HARÇLIK EKLE</button><div class="section"><b>HAREKETLER</b><span>DÜZENLE / SİL</span></div>${a.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>₺</i><div><b>${E(x.note||'HARÇLIK')}</b><small>${E(x.date)} · ${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):x.flexName?' · '+E(x.flexName):''}</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`).join('')||'<div class="notice">BU DÖNEMDE KAYIT YOK.</div>'}`;};

/* ---------- CARD STATEMENT PERIOD NAVIGATION ---------- */
window.rutinStatementOffset43174=window.rutinStatementOffset43174||0;
function desiredDay(c){let d=parseInt(c.statementDay,10);return Math.max(1,Math.min(31,isFinite(d)?d:1));}
function dateAt(y,m,day){const last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(day,last),12);}
function isoD(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function addDays(ds,n){const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return isoD(d);}
function fmt(ds){return new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'});}
function statementPeriod(c,offset=0){const day=desiredDay(c),now=new Date();let end=dateAt(now.getFullYear(),now.getMonth(),day);if(now<end)end=dateAt(now.getFullYear(),now.getMonth()-1,day);if(offset){end=dateAt(end.getFullYear(),end.getMonth()+offset,day);}const prev=dateAt(end.getFullYear(),end.getMonth()-1,day);return{start:addDays(isoD(prev),1),end:isoD(end)};}
window.changeCardStatement43174=function(delta){window.rutinStatementOffset43174=Math.min(0,(window.rutinStatementOffset43174||0)+delta);render();};
const openCardPrev=window.openCardDetailV43163;
window.openCardDetailV43163=function(id){window.rutinStatementOffset43174=0;return openCardPrev(id);};
window.cardDetailV43163=function(){const c=state.cards.find(x=>String(x.id)===String(window.cardDetailIdV43163));if(!c){screen='finance';return finance()}c.transactions=arr(c.transactions);const p=statementPeriod(c,window.rutinStatementOffset43174||0),tx=[...c.transactions].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),spend=tx.filter(t=>t.type!=='payment'&&inRange(t.date,p)),spends=sum(spend,x=>Math.abs(N(x.amount))),afterStart=addDays(p.end,1),nextEnd=statementPeriod(c,(window.rutinStatementOffset43174||0)+1).end,pays=tx.filter(t=>t.type==='payment'&&String(t.date||'')>=afterStart&&String(t.date||'')<=nextEnd),paidTotal=sum(pays,x=>Math.abs(N(x.amount)));return `${header('KART EKSTRESİ',true)}<div class="cardDetailHeroV13"><small>${E(c.name)}</small><strong>${M(c.balance)}</strong><span>GÜNCEL BORÇ</span></div><div class="statementNav43174"><button onclick="changeCardStatement43174(-1)">‹ ÖNCEKİ</button><div><small>EKSTRE DÖNEMİ</small><b>${fmt(p.start)} — ${fmt(p.end)}</b></div><button ${window.rutinStatementOffset43174>=0?'disabled':''} onclick="changeCardStatement43174(1)">SONRAKİ ›</button></div><div class="v43163CardStats"><div><small>DÖNEM HARCAMA</small><b>${M(spends)}</b></div><div><small>SONRAKİ ÖDEMELER</small><b>${M(paidTotal)}</b></div></div><div class="card v43163Dates"><span>HESAP KESİM <b>HER AY ${E(c.statementDay||'-')}</b></span><span>SON ÖDEME <b>${E(c.paymentDay||c.dueDate||'-')}</b></span></div><button class="primary" onclick="openModal('cardPay4310:${c.id}')">NE KADAR ÖDEDİM?</button><div class="section"><b>EKSTRE HAREKETLERİ</b><span>${spend.length} İŞLEM</span></div><div class="card list">${spend.map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')} · ${E(t.category||'')}</small></div><strong class="red">${M(Math.abs(N(t.amount)))}</strong></div>`).join('')||'<div class="notice">BU DÖNEMDE HAREKET YOK.</div>'}</div><div class="section"><b>DÖNEM SONRASI ÖDEMELER</b><span>${pays.length}</span></div><div class="card list">${pays.map(t=>`<div class="item"><div><b>${E(t.title||'KART ÖDEMESİ')}</b><small>${E(t.date||'')}</small></div><strong class="green">-${M(Math.abs(N(t.amount)))}</strong></div>`).join('')||'<div class="notice">KAYITLI ÖDEME YOK.</div>'}</div>`;};

/* ---------- SAFE ACCOUNT DELETE GUARDS ---------- */
function linkedToCard(id){return state.expenses.filter(x=>String(x.cardId||'')===String(id)|| (x.sourceType==='card'&&String(x.cardId||'')===String(id)));}
function linkedToFlex(id){return state.expenses.filter(x=>String(x.flexId||'')===String(id)|| (x.sourceType==='flex'&&String(x.flexId||'')===String(id)));}
const rawDeleteCard=window.deleteCard;
window.deleteCard=function(id){const links=linkedToCard(id);if(links.length)return alert(`BU KARTA BAĞLI ${links.length} HARCAMA VAR. ÖNCE HARCAMALARI DÜZENLEYİN / SİLİN.`);if(!confirm('KREDİ KARTI SİLİNSİN Mİ?'))return;return rawDeleteCard?rawDeleteCard(id):undefined;};
window.deleteCardV39=function(id){return window.deleteCard(id);};
const rawDeleteFlex=window.deleteFlex;
window.deleteFlex=function(id){const links=linkedToFlex(id);if(links.length)return alert(`BU ESNEK HESABA BAĞLI ${links.length} HARCAMA VAR. ÖNCE HARCAMALARI DÜZENLEYİN / SİLİN.`);if(!confirm('ESNEK HESAP SİLİNSİN Mİ?'))return;return rawDeleteFlex?rawDeleteFlex(id):undefined;};
window.deleteFlexV4310=function(id){return window.deleteFlex(id);};window.deleteFlexV41=function(id){return window.deleteFlex(id);};window.deleteFlexV42=function(id){return window.deleteFlex(id);};

/* ---------- MODALS: report details; road delete remains funding-safe ---------- */
const modalPrev43174=window.modalHtml;
window.modalHtml=function(k){
 if(k==='reportIncome43174'){const A=actualReport(),rows=[...A.workCash,...A.incomes.map(x=>({...x,kind:'income'}))].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(incomeEventRow).join('');return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GELİR DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="stableMoneySummary431642"><div><small>ÇALIŞMA TAHSİLATI</small><strong class="green">${M(A.received)}</strong></div><div><small>DİĞER GELİR</small><strong class="green">${M(A.other)}</strong></div><div><small>TOPLAM</small><strong>${M(A.income)}</strong></div></div>${rows||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;}
 if(k==='reportExpense43174'){const A=actualReport();return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GİDER DETAYI</b><button class="close" onclick="closeModal()">×</button></div>${expenseRows(A.expenses)||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;}
 if(k&&k.startsWith('roadDay43174:')){const date=k.slice('roadDay43174:'.length),a=state.expenses.filter(x=>String(x.date||'')===String(date)&&isRoad(x));return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${M(sum(a))}</strong></div><div class="section"><b>YOL ÖDEMELERİ</b><span>DÜZENLE / SİL</span></div>${a.map(x=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||'YOL')}</i><div><b>${E(x.direction||'YOL')} · ${M(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):x.flexName?' · '+E(x.flexName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay43174('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;}
 return modalPrev43174(k);
};
window.deleteRoadDay43174=function(id,date){if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;const x=state.expenses.find(z=>String(z.id)===String(id));if(!x)return;if(typeof window.rutinDetachFundingV431651==='function')window.rutinDetachFundingV431651(x);state.expenses=state.expenses.filter(z=>String(z.id)!==String(id));save();const left=state.expenses.some(z=>String(z.date||'')===String(date)&&isRoad(z));if(left)openModal('roadDay43174:'+date);else closeModal();render();};

/* ---------- NON-DESTRUCTIVE INTEGRITY AUDIT ---------- */
window.rutinIntegrity43174=function(){const issues=[];const ids=new Set();[...state.work,...state.expenses,...state.incomes].forEach(x=>{if(!x.id)issues.push('KİMLİKSİZ KAYIT');else if(ids.has(String(x.id)))issues.push('TEKRAR ID: '+x.id);else ids.add(String(x.id));});state.expenses.forEach(x=>{if(U(x.method)==='KREDİ KARTI'){const c=state.cards.find(z=>String(z.id)===String(x.cardId));if(!c)issues.push('KARTI BULUNAMAYAN HARCAMA: '+x.id);else if(!arr(c.transactions).some(t=>String(t.expenseId||'')===String(x.id)||String(t.id)===String(x.sourceId)))issues.push('KART HAREKETİ EKSİK: '+x.id);}if(U(x.method)==='ESNEK HESAP'){const a=state.flexAccounts.find(z=>String(z.id)===String(x.flexId));if(!a)issues.push('ESNEK HESABI BULUNAMAYAN HARCAMA: '+x.id);else if(!arr(a.transactions).some(t=>String(t.expenseId||'')===String(x.id)||String(t.id)===String(x.sourceId)))issues.push('ESNEK HESAP HAREKETİ EKSİK: '+x.id);}});state.meta.lastIntegrity43174={at:new Date().toISOString(),issues:issues.length};save();return issues;};
window.rutinIntegrity43174();
})();
