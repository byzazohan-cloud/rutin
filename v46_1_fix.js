/* RUTIN V46.1 — report + finance/investment integration repair */
(function(){
'use strict';
const N=v=>Number(v)||0;
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const WA=x=>N(x.amount)||(N(x.hours)*N(x.rate));
function range(){
 if(reportPeriod==='rangeV46' && window.reportRangeV46) return window.reportRangeV46;
 return dateRangeForPeriod(reportPeriod);
}
function between(a,r){return (a||[]).filter(x=>String(x.date||'')>=r.start&&String(x.date||'')<=r.end)}
function groups(items,keyFn,valFn){const g={};items.forEach(x=>{const k=keyFn(x);g[k]=(g[k]||0)+valFn(x)});return Object.entries(g).sort((a,b)=>b[1]-a[1])}

/* Reports: independent renderer, so custom range cannot break the old report code. */
reports=function(){
 const r=range(), inc=between(state.incomes,r), exp=between(state.expenses,r), work=between(state.work,r);
 const workIncome=work.reduce((a,x)=>a+WA(x),0), directIncome=inc.reduce((a,x)=>a+N(x.amount),0), expense=exp.reduce((a,x)=>a+N(x.amount),0), income=directIncome+workIncome;
 const daily=new Set(work.filter(x=>x.type==='daily').map(x=>x.date)).size;
 const hh=work.filter(x=>x.type==='hourly').reduce((a,x)=>a+N(x.hours),0), oh=work.filter(x=>x.type==='overtime').reduce((a,x)=>a+N(x.hours),0);
 const eg=groups(exp,x=>upper(x.category||'DİĞER'),x=>N(x.amount));
 const ig=groups(inc,x=>upper(x.title||'DİĞER'),x=>N(x.amount));
 const label=reportPeriod==='rangeV46'?`${r.start} — ${r.end}`:(r.label||'SEÇİLİ DÖNEM');
 return `${header('RAPORLAR',true)}
 <div class="reportPeriod"><button class="${reportPeriod==='day'?'active':''}" onclick="reportPeriod='day';render()">GÜNLÜK</button><button class="${reportPeriod==='week'?'active':''}" onclick="reportPeriod='week';render()">HAFTALIK</button><button class="${reportPeriod==='month'?'active':''}" onclick="reportPeriod='month';render()">AYLIK</button><button class="${reportPeriod==='year'?'active':''}" onclick="reportPeriod='year';render()">YILLIK</button><button class="${reportPeriod==='rangeV46'?'active':''}" onclick="openModal('rangeV46')">TARİH ARALIĞI</button></div>
 <div class="section"><b>${E(label)}</b></div>
 <div class="reportGrid"><button class="reportBox" onclick="openModal('reportBreakV46:income')"><small>TOPLAM GELİR</small><strong class="green">${money(income)}</strong></button><button class="reportBox" onclick="openModal('reportBreakV46:expense')"><small>TOPLAM HARCAMA</small><strong class="red">${money(expense)}</strong></button><div class="reportBox"><small>KALAN</small><strong>${money(income-expense)}</strong></div></div>
 <div class="card list">${sumRow('ÇALIŞILAN GÜN',daily+' GÜN')}${sumRow('SAATLİK ÇALIŞMA',hh+' SAAT')}${sumRow('MESAİ',oh+' SAAT')}${sumRow('İŞTEN KAZANÇ',money(workIncome))}</div>
 <div class="section"><b>HARCAMA KATEGORİLERİ</b><span>DOKUN · DETAY</span></div><div class="card list">${eg.map(([k,v])=>`<button class="v46ListBtn" onclick="openModal('reportBreakV46:expense')"><span>${E(k)}</span><strong>${money(v)}</strong><b>›</b></button>`).join('')||'<div class="notice">KAYIT YOK.</div>'}</div>
 <div class="section"><b>DİĞER GELİRLER</b></div><div class="card list">${ig.map(([k,v])=>sumRow(k,money(v))).join('')||'<div class="notice">KAYIT YOK.</div>'}</div>`;
};

/* Finance: real three-tab renderer. Investments are no longer a separate screen. */
function cardsHtml(){
 const a=Array.isArray(state.cards)?state.cards:[];
 return `<div class="finance42Head"><div><small>FİNANS</small><b>KREDİ KARTLARIM</b></div><button onclick="openModal('addCard')">＋ KART EKLE</button></div><div class="financeCards42">${a.map(c=>`<div class="creditCardV42" onclick="openCardMenuV39('${c.id}')"><div class="card42Top"><span class="card42Logo">R</span><span class="card42Type">KREDİ KARTI</span></div><div class="card42Chip"></div><div class="card42Name">${E(c.name||'KREDİ KARTI')}</div><div class="card42Debt"><small>GÜNCEL BORÇ</small><strong>${money(N(c.balance))}</strong></div><div class="card42Meta"><span><small>LİMİT</small><b>${money(N(c.limit))}</b></span><span><small>KESİM</small><b>${E(c.statementDate||'—')}</b></span><span><small>SON ÖDEME</small><b>${E(c.dueDate||'—')}</b></span></div></div>`).join('')||'<div class="notice">HENÜZ KREDİ KARTI EKLENMEDİ.</div>'}</div>`;
}
function flexHtml(){
 const a=Array.isArray(state.flexAccounts)?state.flexAccounts:[];
 return `<div class="finance42Head"><div><small>FİNANS</small><b>ESNEK HESAPLARIM</b></div><button onclick="openModal('addFlex')">＋ HESAP EKLE</button></div><div class="financeCards42">${a.map(x=>{const debt=N(x.balance||x.debt),limit=N(x.limit);return `<div class="flexCardV42" onclick="openFlexMenuV42('${x.id}')"><div class="flex42Top"><span class="flex42Logo">R</span><span class="flex42Type">ESNEK HESAP</span></div><div class="flex42Mark">◇</div><div class="flex42Name">${E(x.name||'ESNEK HESAP')}</div><div class="flex42Debt"><small>KULLANILAN TUTAR</small><strong>${money(debt)}</strong></div><div class="flex42Meta"><span><small>LİMİT</small><b>${money(limit)}</b></span><span><small>KULLANILABİLİR</small><b>${money(Math.max(0,limit-debt))}</b></span></div></div>`}).join('')||'<div class="notice">HENÜZ ESNEK HESAP EKLENMEDİ.</div>'}</div>`;
}
finance=function(){
 const tab=window.financeTabV42||'cards';
 return `${header('FİNANS',true)}<div class="financeV42"><div class="financeTabs42"><button class="${tab==='cards'?'active':''}" onclick="window.financeTabV42='cards';render()"><i>▰</i><span>KARTLAR</span></button><button class="${tab==='accounts'?'active':''}" onclick="window.financeTabV42='accounts';render()"><i>◇</i><span>HESAPLAR</span></button><button class="${tab==='investments'?'active':''}" onclick="window.financeTabV42='investments';render()"><i>↗</i><span>YATIRIMLAR</span></button></div>${tab==='cards'?cardsHtml():tab==='accounts'?flexHtml():investmentPanel()}</div>`;
};
investments=function(){window.financeTabV42='investments';screen='finance';return finance()};
const goBase=go;
go=function(s){if(s==='investments'){window.financeTabV42='investments';s='finance'}goBase(s)};
nav=function(){const items=[['home','⌂','ANA SAYFA','navHome'],['work','✓','İŞ','navWork'],['expenses','₺','HARCAMA','navExpense'],['calendar','31','TAKVİM','navCalendar'],['reports','▥','RAPOR','navReport'],['finance','▰','FİNANS','navFinance'],['more','•••','DAHA FAZLA','navMore']];return `<div class="navV37">${items.map(x=>`<button class="${screen===x[0]?'active ':''}${x[3]}" onclick="go('${x[0]}')"><span class="navIconV37">${x[1]}</span><span class="navLabelV37">${x[2]}</span></button>`).join('')}</div>`};

/* Repair report detail modal without calling the older broken range helper. */
const modalBase461=modalHtml;
modalHtml=function(k){
 if(k.startsWith('reportBreakV46:')){
  const kind=k.split(':')[1],r=range(), direct=kind==='expense'?between(state.expenses,r):between(state.incomes,r), work=kind==='income'?between(state.work,r):[];
  const all=kind==='income'?direct.concat(work):direct;
  const g=groups(all,x=>kind==='expense'?upper(x.category||'DİĞER'):(x.type?(x.type==='daily'?'GÜNLÜK İŞ':x.type==='hourly'?'SAATLİK İŞ':'MESAİ'):upper(x.title||'DİĞER')),x=>x.type?WA(x):N(x.amount));
  return `<div class="modal"><div class="sheet"><div class="sheetHead"><b>${kind==='expense'?'HARCAMA':'GELİR'} AYRINTISI</b><button class="close" onclick="closeModal()">×</button></div><div class="card list">${g.map(([a,b])=>sumRow(a,money(b))).join('')||'<div class="notice">KAYIT YOK.</div>'}</div>${all.map(x=>`<div class="detailRecord"><div><b>${E(x.title||x.type||x.category)}</b><small>${E(x.date||'')}${x.category?' · '+E(x.category):''}${x.recipient?' · '+E(x.recipient):''}</small></div><strong>${money(x.type?WA(x):N(x.amount))}</strong></div>`).join('')}</div></div>`;
 }
 return modalBase461(k);
};
})();
