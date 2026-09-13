
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(+n||0);
const iso=(d=new Date())=>{let z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
const ym=(d=new Date())=>iso(d).slice(0,7);
const uid=()=>crypto.randomUUID?.()||Date.now()+Math.random().toString(16).slice(2);
const upper=s=>String(s||'').toLocaleUpperCase('tr-TR');

const defaults={
 profile:{name:'ZAZOHAN',motto:'KÜÇÜK ADIMLAR, BÜYÜK ÖZGÜRLÜKLER GETİRİR.',photo:''},
 settings:{dailyRate:1250,hourlyRate:200,overtimeRate:250,pin:'',lock:false,reminders:true,reminderDays:2,theme:{bg:'#000000',panel:'#090b0d',gold:'#d7b45c',green:'#49d17d',red:'#ff5b62',blue:'#5ea6ff'}},
 work:[],expenses:[],incomes:[],notes:[],investments:[],
 cards:[],
 flexAccounts:[],
 accounts:{cash:{name:'NAKİT',balance:0}},
 categories:['YOL','YEMEK','MARKET','FATURA','KİRA','SAĞLIK','ULAŞIM','EĞLENCE','YAKIT','GİYİM','DİĞER']
};
let state=JSON.parse(localStorage.getItem('rutin-v3')||localStorage.getItem('rutin-v2')||'null')||structuredClone(defaults);
state.profile={...defaults.profile,...(state.profile||{})};
state.settings={...defaults.settings,...(state.settings||{}),theme:{...defaults.settings.theme,...(state.settings?.theme||{})}};
state.cards=Array.isArray(state.cards)?state.cards:[];
state.flexAccounts=Array.isArray(state.flexAccounts)?state.flexAccounts:[];
if(state.accounts?.card && !state.cards.length){
  state.cards.push({id:uid(),name:state.accounts.card.name||'KREDİ KARTI',balance:+state.accounts.card.balance||0,limit:+state.accounts.card.limit||0,dueDate:''});
}
if(state.accounts?.flex && !state.flexAccounts.length){
  state.flexAccounts.push({id:uid(),name:state.accounts.flex.name||'ESNEK HESAP',balance:+state.accounts.flex.balance||0,limit:+state.accounts.flex.limit||0,dueDate:''});
}
state.accounts={cash:{name:'NAKİT',balance:+(state.accounts?.cash?.balance||0)}};
let screen='home', modal=null, reportPeriod='month', unlocked=!state.settings.lock;


function save(){localStorage.setItem('rutin-v4',JSON.stringify(state))}
function applyTheme(){const t=state.settings.theme||defaults.settings.theme,r=document.documentElement.style;r.setProperty('--bg',t.bg);r.setProperty('--panel',t.panel);r.setProperty('--gold',t.gold);r.setProperty('--gold2',t.gold);r.setProperty('--green',t.green);r.setProperty('--red',t.red);r.setProperty('--blue',t.blue)}
function monthItems(a){return a.filter(x=>x.date?.startsWith(ym()))}
function dateRangeForPeriod(period=reportPeriod){
 const now=new Date();
 if(period==='day'){
  const d=iso(now); return {start:d,end:d,label:'BUGÜN'};
 }
 if(period==='week'){
  const x=new Date(now),n=(x.getDay()+6)%7,start=new Date(x);start.setDate(x.getDate()-n);
  const end=new Date(start);end.setDate(start.getDate()+6);
  return{start:iso(start),end:iso(end),label:'BU HAFTA'};
 }
 if(period==='year'){
  const y=now.getFullYear();return{start:`${y}-01-01`,end:`${y}-12-31`,label:String(y)};
 }
 const y=now.getFullYear(),m=now.getMonth()+1,last=new Date(y,m,0).getDate();
 return{start:`${y}-${String(m).padStart(2,'0')}-01`,end:`${y}-${String(m).padStart(2,'0')}-${String(last).padStart(2,'0')}`,label:now.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase()};
}
function filterByPeriod(a,period=reportPeriod){
 const r=dateRangeForPeriod(period);
 return a.filter(x=>x.date>=r.start&&x.date<=r.end);
}
function totalsForPeriod(period=reportPeriod){
 const inc=filterByPeriod(state.incomes,period).reduce((a,x)=>a+(+x.amount||0),0);
 let workInc=0;
 for(const w of filterByPeriod(state.work,period)){
   workInc+=w.type==='daily'?(+w.amount||state.settings.dailyRate):(+w.hours||0)*(+w.rate||0);
 }
 const exp=filterByPeriod(state.expenses,period).reduce((a,x)=>a+(+x.amount||0),0);
 const road=filterByPeriod(state.expenses,period).filter(x=>x.category==='YOL'||x.category==='ULAŞIM').reduce((a,x)=>a+(+x.amount||0),0);
 return{income:inc+workInc,expense:exp,net:inc+workInc-exp,road};
}
function workSummaryForPeriod(period=reportPeriod){
 const a=filterByPeriod(state.work,period);
 return{
  daily:new Set(a.filter(x=>x.type==='daily').map(x=>x.date)).size,
  hourlyDays:new Set(a.filter(x=>x.type==='hourly').map(x=>x.date)).size,
  hourlyHours:a.filter(x=>x.type==='hourly').reduce((n,x)=>n+(+x.hours||0),0),
  overtimeDays:new Set(a.filter(x=>x.type==='overtime').map(x=>x.date)).size,
  overtimeHours:a.filter(x=>x.type==='overtime').reduce((n,x)=>n+(+x.hours||0),0)
 }
}
function monthlyTotals(){
 let income=monthItems(state.incomes).reduce((a,x)=>a+x.amount,0);
 for(const w of monthItems(state.work)){
   if(w.type==='daily') income+=w.amount||state.settings.dailyRate;
   if(w.type==='hourly') income+=(w.hours||0)*(w.rate||state.settings.hourlyRate);
   if(w.type==='overtime') income+=(w.hours||0)*(w.rate||state.settings.overtimeRate);
 }
 const expense=monthItems(state.expenses).reduce((a,x)=>a+x.amount,0);
 const road=monthItems(state.expenses).filter(x=>x.category==='YOL'||x.category==='ULAŞIM').reduce((a,x)=>a+x.amount,0);
 return{income,expense,net:income-expense,road};
}
function workSummary(items=monthItems(state.work)){
 return{
  daily:items.filter(x=>x.type==='daily').length,
  hourlyDays:new Set(items.filter(x=>x.type==='hourly').map(x=>x.date)).size,
  hourlyHours:items.filter(x=>x.type==='hourly').reduce((a,x)=>a+(x.hours||0),0),
  overtimeDays:new Set(items.filter(x=>x.type==='overtime').map(x=>x.date)).size,
  overtimeHours:items.filter(x=>x.type==='overtime').reduce((a,x)=>a+(x.hours||0),0),
 };
}

function rutinLogo(size=34){
  return `<span class="rutinLogo" style="--logoSize:${size}px" aria-label="RUTİN">
    <span class="rLogoR">R</span><span class="rLogoCheck">✓</span>
  </span>`;
}

function header(title='RUTİN',back=false){
 return `<div class="topbar">
   <button class="iconBtn luxuryIconBtn" onclick="${back?"go('home')":"openModal('menu')"}">${back?'‹':'☰'}</button>
   <div class="title brandTitle">${title==='RUTİN'?`${rutinLogo(30)}<span>RUTİN</span>`:title}</div>
   <button class="iconBtn luxuryIconBtn settingsOnly" onclick="go('settings')" aria-label="Ayarlar">⚙</button>
 </div>`;
}
function profileLine(){
 return `<div class="profileLine"><div class="avatar">${state.profile.photo?`<img src="${state.profile.photo}">`:(state.profile.name||'R')[0]}</div><div><small>MERHABA</small><b>${state.profile.name}</b><div class="dateLine">${new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div></div>`;
}
function reminderBanner(){
 const a=reminderItems();if(!a.length)return'';
 return `<div class="reminderBanner"><b>◔ ÖDEME HATIRLATMASI</b>${a.map(x=>`<span>${x.type} · ${x.name} · ${x.date}</span>`).join('')}</div>`
}
function home(){
 const T=monthlyTotals(),W=workSummary();
 return `${header()}${profileLine()}${reminderBanner()}
 <div class="heroMsg"><b>GÜNAYDIN!</b><br>${state.profile.motto}</div>
 <div class="stats">
   <div class="stat"><small>BUGÜNKÜ GELİR</small><strong class="green">${money(todayIncome())}</strong></div>
   <div class="stat"><small>BUGÜNKÜ HARCAMA</small><strong class="red">${money(todayExpense())}</strong></div>
   <div class="stat"><small>BU AY GELİR</small><strong class="green">${money(T.income)}</strong></div>
   <div class="stat"><small>BU AY HARCAMA</small><strong class="red">${money(T.expense)}</strong></div>
 </div>
 <div class="section"><b>HIZLI İŞLEMLER</b></div>
 <div class="quick quickPremium quickSix">
   <button onclick="openModal('income')"><i>◈＋</i><span>GELİR EKLE</span></button>
   <button onclick="openModal('expense')"><i>▤</i><span>HARCAMA</span></button>
   <button onclick="openModal('daily')"><i class="luxGlyph">✓</i><span>ÇALIŞTIM</span></button>
   <button onclick="go('notes')"><i class="luxGlyph">✦</i><span>NOTLAR</span></button>
   <button onclick="go('investments')"><i class="luxGlyph">◇</i><span>YATIRIM</span></button>
   <button onclick="go('finance')"><i class="luxGlyph">▣</i><span>FİNANS</span></button>
 </div>
 <div class="heroMsg" style="margin-top:10px">“DİSİPLİN, HAYAL ETTİĞİN HAYATIN KÖPRÜSÜDÜR.”</div>
 <div class="section"><b>BUGÜNÜN ÖZETİ</b><span onclick="go('reports')">DETAY ›</span></div>
 <div class="summaryBox">
   <div class="summaryRow"><div><b>ÇALIŞMA</b><small>GÜNLÜK</small></div><strong>${state.work.filter(x=>x.date===iso()&&x.type==='daily').length?'1 GÜN':'0 GÜN'}</strong></div>
   <div class="summaryRow"><div><b>SAATLİK</b><small>BUGÜN</small></div><strong>${state.work.filter(x=>x.date===iso()&&x.type==='hourly').reduce((a,x)=>a+(x.hours||0),0)} SAAT</strong></div>
   <div class="summaryRow"><div><b>MESAİ</b><small>BUGÜN</small></div><strong>${state.work.filter(x=>x.date===iso()&&x.type==='overtime').reduce((a,x)=>a+(x.hours||0),0)} SAAT</strong></div>
   <div class="summaryRow"><div><b>TOPLAM KAZANÇ</b><small>BUGÜN</small></div><strong class="green">${money(todayIncome())}</strong></div>
   <div class="summaryRow"><div><b>TOPLAM HARCAMA</b><small>BUGÜN</small></div><strong class="red">${money(todayExpense())}</strong></div>
 </div>`;
}
function todayIncome(){
 let x=state.incomes.filter(i=>i.date===iso()).reduce((a,b)=>a+b.amount,0);
 for(const w of state.work.filter(i=>i.date===iso())){
  if(w.type==='daily')x+=w.amount||state.settings.dailyRate;
  else x+=(w.hours||0)*(w.rate||0);
 }
 return x;
}
function todayExpense(){return state.expenses.filter(i=>i.date===iso()).reduce((a,b)=>a+b.amount,0)}
function workScreen(type='daily'){
 const title=type==='daily'?'GÜNLÜK ÇALIŞMA':type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ';
 return `${header('ÇALIŞMA',true)}
 <div class="workChoice">
  <button class="${type==='daily'?'active':''}" onclick="go('daily')">GÜNLÜK</button>
  <button class="${type==='hourly'?'active':''}" onclick="go('hourly')">SAATLİK</button>
  <button class="${type==='overtime'?'active':''}" onclick="go('overtime')">MESAİ</button>
 </div>
 ${type==='daily'?dailyForm():type==='hourly'?hourlyForm():overtimeForm()}
 <div class="section"><b>SON KAYITLAR</b></div><div class="card list">${workRows(type)}</div>`;
}
function dailyForm(){return `<form onsubmit="submitDaily(event)">
 ${field('date','TARİH',iso(),'date')}
 ${field('title','İŞ / PROJE','ANA İŞ')}
 ${field('amount','GÜNLÜK ÜCRET',state.settings.dailyRate,'number')}
 <div class="field"><label>YOL PARASI</label><div class="choiceRow"><label><input type="radio" name="road" value="yes">ÖDEDİM</label><label><input type="radio" name="road" value="no" checked>ÖDEMEDİM</label></div></div>
 ${field('roadAmount','YOL TUTARI (OPSİYONEL)',0,'number')}
 ${textarea('note','NOT')}
 <button class="primary">BUGÜN ÇALIŞTIM</button></form>`}
function hourlyForm(){return `<form onsubmit="submitHourly(event)">
 ${field('date','TARİH',iso(),'date')}
 ${field('title','İŞ / PROJE','EK İŞ')}
 ${field('hours','KAÇ SAAT ÇALIŞTIN?',0,'number')}
 ${field('rate','SAATLİK ÜCRET',state.settings.hourlyRate,'number')}
 <div class="notice">SÜRE SAYACI YOK. O GÜN KAÇ SAAT ÇALIŞTIYSAN ELLE GİR.</div>
 <div class="field"><label>YOL PARASI</label><div class="choiceRow"><label><input type="radio" name="road" value="yes">ÖDEDİM</label><label><input type="radio" name="road" value="no" checked>ÖDEMEDİM</label></div></div>
 ${field('roadAmount','YOL TUTARI (OPSİYONEL)',0,'number')}
 ${textarea('note','NOT')}
 <button class="primary">KAYDET</button></form>`}
function overtimeForm(){return `<form onsubmit="submitOvertime(event)">
 ${field('date','TARİH',iso(),'date')}
 ${field('title','İŞ / PROJE','ANA İŞ')}
 ${field('hours','MESAİ SÜRESİ',0,'number')}
 ${field('rate','MESAİ SAATLİK ÜCRET',state.settings.overtimeRate,'number')}
 ${textarea('note','NOT')}
 <button class="primary">KAYDET</button></form>`}
function workRows(type){
 const a=state.work.filter(x=>x.type===type).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
 return a.length?a.map(x=>`<div class="item"><div class="ico">${type==='daily'?'✓':type==='hourly'?'◷':'★'}</div><div><b>${x.title}</b><small>${x.date}${x.hours?' · '+x.hours+' SAAT':''}</small></div><div class="amt gold">${money(x.amount||((x.hours||0)*(x.rate||0)))}</div></div>`).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>';
}
function finance(){
 return `${header('HESAPLARIM',true)}
 <div class="section"><b>KREDİ KARTLARIM</b><span onclick="openModal('addCard')">+ KART EKLE</span></div>
 ${state.cards.length?state.cards.map(c=>`<div class="account goldBorder"><div class="accountHead"><b>${c.name}</b><span onclick="openModal('editCard:${c.id}')">⋯</span></div><strong>${money(c.balance)}</strong><small>LİMİT: ${money(c.limit)}${c.dueDate?` · SON ÖDEME ${c.dueDate}`:''}</small></div>`).join(''):'<div class="notice">HENÜZ KREDİ KARTI EKLENMEDİ.</div>'}
 <div class="section"><b>ESNEK HESAPLARIM</b><span onclick="openModal('addFlex')">+ HESAP EKLE</span></div>
 ${state.flexAccounts.length?state.flexAccounts.map(c=>`<div class="account"><div class="accountHead"><b>${c.name}</b><span onclick="openModal('editFlex:${c.id}')">⋯</span></div><strong>${money(c.balance)}</strong><small>LİMİT: ${money(c.limit)} · KULLANILABİLİR ${money(Math.max(0,c.limit-c.balance))}${c.dueDate?` · ÖDEME ${c.dueDate}`:''}</small></div>`).join(''):'<div class="notice">HENÜZ ESNEK HESAP EKLENMEDİ.</div>'}
 <div class="account"><div class="accountHead"><b>NAKİT</b><span>›</span></div><strong>${money(state.accounts.cash.balance)}</strong></div>
 <div class="account"><div class="accountHead"><b>YATIRIMLAR</b><span onclick="go('investments')">›</span></div><strong class="green">${money(state.investments.reduce((a,x)=>a+x.amount,0))}</strong><small>TOPLAM DEĞER</small></div>
 <div class="section"><b>HIZLI İŞLEMLER</b></div><div class="quick" style="grid-template-columns:repeat(4,1fr)">
 <button onclick="openModal('expense')"><i class="luxGlyph">▤</i>HARCAMA</button><button onclick="openModal('income')"><i class="luxGlyph">＋</i>GELİR</button><button onclick="openModal('cash')"><i>₺</i>NAKİT</button><button onclick="go('investments')"><i>◆</i>YATIRIM</button>
 </div>`;
}
function calendarScreen(){
 const d=new Date(),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7;
 let cells='';for(let i=0;i<offset;i++)cells+='<div></div>';
 for(let n=1;n<=days;n++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;const w=state.work.filter(x=>x.date===ds);const cl=w.some(x=>x.type==='overtime')?'overtime':w.some(x=>x.type==='hourly')?'hourly':w.some(x=>x.type==='daily')?'daily':'off';cells+=`<button class="day ${cl}" onclick="openModal('day:${ds}')">${n}</button>`}
 const W=workSummary(),mw=monthItems(state.work),di=mw.filter(x=>x.type==='daily').reduce((a,x)=>a+(+x.amount||state.settings.dailyRate),0),hi=mw.filter(x=>x.type==='hourly').reduce((a,x)=>a+((+x.hours||0)*(+x.rate||0)),0),oi=mw.filter(x=>x.type==='overtime').reduce((a,x)=>a+((+x.hours||0)*(+x.rate||0)),0),wd=new Set(mw.map(x=>x.date)).size;
 return `${header('TAKVİM',true)}<div class="section"><b>${d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase()}</b><span>GÜNE DOKUN → DÜZENLE</span></div><div class="card compactCalendar"><div class="calendarHead">${['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar">${cells}</div><div class="legend"><span><i style="background:#2f7148"></i>GÜNLÜK</span><span><i style="background:#2d587c"></i>SAATLİK</span><span><i style="background:#7b6128"></i>MESAİ</span><span><i style="background:#333"></i>ÇALIŞMADIM</span></div></div><div class="section"><b>DETAYLI ÇALIŞMA ÖZETİ</b></div><div class="summaryBox">${sumRow('TOPLAM ÇALIŞILAN GÜN',wd+' GÜN')}${sumRow('GÜNLÜK ÇALIŞMA',W.daily+' GÜN')}${sumRow('SAATLİK ÇALIŞMA',W.hourlyDays+' GÜN / '+W.hourlyHours+' SAAT')}${sumRow('MESAİ',W.overtimeDays+' GÜN / '+W.overtimeHours+' SAAT')}${sumRow('GÜNLÜK KAZANÇ',money(di))}${sumRow('SAATLİK KAZANÇ',money(hi))}${sumRow('MESAİ KAZANCI',money(oi))}</div>`;
}
function reports(){
 const T=totalsForPeriod(reportPeriod),W=workSummaryForPeriod(reportPeriod),R=dateRangeForPeriod(reportPeriod);
 const B=(k,l)=>`<button class="${reportPeriod===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`;
 const max=Math.max(1,T.income,T.expense);
 const incomePct=Math.round((T.income/max)*100);
 const expensePct=Math.round((T.expense/max)*100);
 return `${header('RAPORLAR',true)}
 <div class="tabs">${B('day','GÜNLÜK')}${B('week','HAFTALIK')}${B('month','AYLIK')}${B('year','YILLIK')}<button onclick="openModal('range')">TARİH ARALIĞI</button></div>
 <div class="section"><b>${R.label}</b><span onclick="go('detail')">DETAYLI RAPOR ›</span></div>
 <div class="reportGrid"><div class="reportBox"><small>TOPLAM GELİR</small><strong class="green">${money(T.income)}</strong></div><div class="reportBox"><small>TOPLAM HARCAMA</small><strong class="red">${money(T.expense)}</strong></div><div class="reportBox"><small>NET KAZANÇ</small><strong>${money(T.net)}</strong></div></div>

 <div class="section"><b>GELİR / HARCAMA DAĞILIMI</b><span>GRAFİĞE DOKUN</span></div>
 <div class="dualDonutWrap clickableChart" onclick="go('detail')">
   <div class="donutCard">
     <div class="donutRing incomeRing" style="--pct:${incomePct}">
       <div class="donutCenter"><small>GELİR</small><strong class="green">${money(T.income)}</strong></div>
     </div>
     <div class="donutLegend"><i class="incomeDot"></i><span>TOPLAM GELİR</span></div>
   </div>
   <div class="donutCard">
     <div class="donutRing expenseRing" style="--pct:${expensePct}">
       <div class="donutCenter"><small>HARCAMA</small><strong class="red">${money(T.expense)}</strong></div>
     </div>
     <div class="donutLegend"><i class="expenseDot"></i><span>TOPLAM HARCAMA</span></div>
   </div>
 </div>

 <div class="section"><b>ÇALIŞMA ÖZETİ</b></div>
 <div class="summaryBox">${sumRow('GÜNLÜK ÇALIŞILAN',W.daily+' GÜN')}${sumRow('SAATLİK ÇALIŞMA',W.hourlyDays+' GÜN / '+W.hourlyHours+' SAAT')}${sumRow('MESAİ',W.overtimeDays+' GÜN / '+W.overtimeHours+' SAAT')}${sumRow('YOL MASRAFI',money(T.road))}</div>
 <div class="chartTap" onclick="go('detail')">AYRINTILI RAPORU AÇ ›</div>`;
}
function detailReport(){
 const T=totalsForPeriod(reportPeriod),W=workSummaryForPeriod(reportPeriod),R=dateRangeForPeriod(reportPeriod);
 return `${header('DETAYLI RAPOR',true)}
 <div class="tabs">
  <button class="${reportPeriod==='day'?'active':''}" onclick="reportPeriod='day';render()">GÜNLÜK</button>
  <button class="${reportPeriod==='week'?'active':''}" onclick="reportPeriod='week';render()">HAFTALIK</button>
  <button class="${reportPeriod==='month'?'active':''}" onclick="reportPeriod='month';render()">AYLIK</button>
  <button class="${reportPeriod==='year'?'active':''}" onclick="reportPeriod='year';render()">YILLIK</button>
  <button onclick="openModal('range')">TARİH ARALIĞI</button>
 </div>
 <div class="section"><b>${R.label}</b></div>
 <div class="detailHero">
   <div><small>NET KAZANÇ</small><strong class="${T.net>=0?'green':'red'}">${money(T.net)}</strong></div>
   <div><small>TOPLAM ÇALIŞMA</small><strong>${W.daily+W.hourlyDays+W.overtimeDays} KAYIT GÜNÜ</strong></div>
 </div>
 <div class="section"><b>GELİR / HARCAMA</b></div>
 <div class="dualDonutWrap">
   <div class="donutCard"><div class="donutRing incomeRing" style="--pct:${Math.round((T.income/Math.max(1,T.income,T.expense))*100)}"><div class="donutCenter"><small>GELİR</small><strong class="green">${money(T.income)}</strong></div></div></div>
   <div class="donutCard"><div class="donutRing expenseRing" style="--pct:${Math.round((T.expense/Math.max(1,T.income,T.expense))*100)}"><div class="donutCenter"><small>HARCAMA</small><strong class="red">${money(T.expense)}</strong></div></div></div>
 </div>
 <div class="section"><b>ÇALIŞMA ÖZETİ</b></div>
 <div class="summaryBox">
   ${sumRow('GÜNLÜK ÇALIŞILAN GÜN',W.daily+'')}
   ${sumRow('SAATLİK ÇALIŞILAN GÜN',W.hourlyDays+'')}
   ${sumRow('TOPLAM SAATLİK ÇALIŞMA',W.hourlyHours+' SAAT')}
   ${sumRow('MESAİ YAPILAN GÜN',W.overtimeDays+'')}
   ${sumRow('TOPLAM MESAİ',W.overtimeHours+' SAAT')}
 </div>
 <div class="section"><b>FİNANSAL ÖZET</b></div>
 <div class="summaryBox">
   ${sumRow('TOPLAM GELİR',money(T.income))}
   ${sumRow('TOPLAM HARCAMA',money(T.expense))}
   ${sumRow('YOL GİDERİ',money(T.road))}
   ${sumRow('NET KAZANÇ',money(T.net))}
 </div>
 <div class="section"><b>AYRINTILI GRAFİK</b></div>
 <div class="card"><div class="chartBars">
   <div class="bar g" style="height:${Math.max(8,Math.min(100,T.income/Math.max(1,T.income,T.expense)*100))}%"></div>
   <div class="bar r" style="height:${Math.max(8,Math.min(100,T.expense/Math.max(1,T.income,T.expense)*100))}%"></div>
   <div class="bar o" style="height:${Math.max(8,Math.min(100,W.overtimeHours*8))}%"></div>
 </div><div class="legend"><span><i style="background:#4bb874"></i>GELİR</span><span><i style="background:#d8575c"></i>HARCAMA</span><span><i style="background:#c08c38"></i>MESAİ</span></div></div>
 <div class="section"><b>HAREKETLER</b></div>
 <div class="card list">${detailRows(reportPeriod)}</div>`;
}
function detailRows(period){
 const a=[
  ...filterByPeriod(state.incomes,period).map(x=>({...x,k:'income'})),
  ...filterByPeriod(state.expenses,period).map(x=>({...x,k:'expense'})),
  ...filterByPeriod(state.work,period).map(x=>({...x,k:'work'}))
 ].sort((a,b)=>b.date.localeCompare(a.date));
 return a.length?a.slice(0,30).map(x=>`<div class="item"><div class="ico">${x.k==='income'?'＋':x.k==='expense'?'−':'⌁'}</div><div><b>${x.title||x.type}</b><small>${x.date}${x.hours?` · ${x.hours} SAAT`:''}</small></div><div class="amt ${x.k==='income'?'green':x.k==='expense'?'red':'gold'}">${x.k==='expense'?'-':x.k==='income'?'+':''}${money(x.amount||((x.hours||0)*(x.rate||0)))}</div></div>`).join(''):'<div class="notice">BU DÖNEMDE KAYIT YOK.</div>';
}
function investments(){
 return `${header('YATIRIMLAR',true)}
 <div class="section"><b>TOPLAM DEĞER</b><span onclick="openModal('investment')">+ EKLE</span></div>
 <div class="stat"><small>TOPLAM YATIRIM</small><strong class="green">${money(state.investments.reduce((a,x)=>a+x.amount,0))}</strong></div>
 <div class="section"><b>YATIRIMLARIM</b></div><div class="card list">${state.investments.length?state.investments.map(x=>`<div class="item"><div class="ico">↗</div><div><b>${x.title}</b><small>${x.date}</small></div><div class="amt green">${money(x.amount)}</div></div>`).join(''):'<div class="notice">HENÜZ YATIRIM KAYDI YOK.</div>'}</div>`;
}
function notes(){
 return `${header('NOTLAR',true)}<div class="section"><b>NOTLARIM</b><span onclick="openModal('note')">+ NOT EKLE</span></div>${state.notes.length?state.notes.slice().reverse().map(n=>`<div class="note"><b>${n.title}</b><p>${n.text}</p><small>${n.date}</small></div>`).join(''):'<div class="notice">HENÜZ NOT YOK.</div>'}`;
}
function profile(){
 return `${header('PROFİL',true)}
 <div class="profileShowcase">
   <div class="profileRing"><div class="avatar">${state.profile.photo?`<img src="${state.profile.photo}">`:(state.profile.name||'R')[0]}</div></div>
   <h2>${state.profile.name}</h2>
   <p>${state.profile.motto}</p>
   <div class="profileBadge">${rutinLogo(22)}<span>RUTİN · KİŞİSEL PANEL</span></div>
 </div>
 <div class="card">
   <div class="profileInfoRow"><span>VARSAYILAN GÜNLÜK ÜCRET</span><b>${money(state.settings.dailyRate)}</b></div>
   <div class="profileInfoRow"><span>SAATLİK ÜCRET</span><b>${money(state.settings.hourlyRate)}</b></div>
   <div class="profileInfoRow"><span>MESAİ ÜCRETİ</span><b>${money(state.settings.overtimeRate)}</b></div>
 </div>
 <div class="card">
   <div class="setting clickable" onclick="openModal('profile')"><div>●</div><b>PROFİLİ DÜZENLE</b><span>›</span></div>
   <div class="setting clickable" onclick="openModal('security')"><div>⌾</div><b>UYGULAMA KİLİDİ / PIN</b><span>${state.settings.lock?'AÇIK':'KAPALI'} ›</span></div>
   <div class="setting clickable" onclick="openModal('reminders')"><div>◔</div><b>HATIRLATICILAR</b><span>${state.settings.reminders?'AÇIK':'KAPALI'} ›</span></div>
   <div class="setting clickable" onclick="openModal('backup')"><div>⇩</div><b>YEDEKLEME / GERİ YÜKLE</b><span>›</span></div>
   <div class="setting clickable" onclick="go('settings')"><div>⚙</div><b>AYARLAR</b><span>›</span></div>
 </div>`;
}
function settings(){
 return `${header('AYARLAR',true)}<div class="card">
 <div class="setting clickable" onclick="go('profile')"><div>●</div><b>PROFİL</b><span>›</span></div>
 <div class="setting clickable" onclick="openModal('categories')"><div>▦</div><b>KATEGORİLER</b><span>›</span></div>
 <div class="setting clickable" onclick="go('finance')"><div>▣</div><b>HESAPLAR</b><span>›</span></div>
 <div class="setting clickable" onclick="openModal('backup')"><div>⇩</div><b>YEDEKLEME / GERİ YÜKLE</b><span>›</span></div>
 <div class="setting clickable" onclick="openModal('theme')"><div>✧</div><b>TEMA STÜDYOSU</b><span>›</span></div>
 <div class="setting clickable" onclick="openModal('reminders')"><div>◔</div><b>HATIRLATICILAR</b><span>›</span></div>
 <div class="setting clickable" onclick="openModal('security')"><div>⌾</div><b>UYGULAMA KİLİDİ</b><span>${state.settings.lock?'AÇIK':'KAPALI'} ›</span></div>
 <div class="setting clickable" onclick="exportData()"><div>⇧</div><b>VERİ DIŞA AKTAR</b><span>›</span></div>
 <div class="setting"><div>i</div><b>HAKKINDA</b><span>RUTİN V3</span></div>
 </div>`;
}
function setting(a,b){return `<div class="setting"><div>•</div><b>${a}</b><span>${b}</span></div>`}
function sumRow(a,b){return `<div class="summaryRow"><div><b>${a}</b></div><strong>${b}</strong></div>`}
function colorField(n,l,v){return `<div class="field colorField"><label>${l}</label><div class="colorRow"><input name="${n}" type="color" value="${v}" oninput="previewTheme(event)"><span>${v}</span></div></div>`}
function field(n,l,v='',t='text'){return `<div class="field"><label>${l}</label><input name="${n}" type="${t}" value="${v}"></div>`}
function textarea(n,l){return `<div class="field"><label>${l}</label><textarea name="${n}"></textarea></div>`}
function expenseScreen(){
 return `${header('KAYIT EKLE',true)}
 <div class="recordHero"><div class="recordIcon">✦</div><div><b>YENİ KAYIT</b><small>GELİRİNİ VE HARCAMANI HIZLICA EKLE</small></div></div>
 <div class="workChoice"><button class="active">HARCAMA</button><button onclick="openModal('income')">GELİR</button></div>${expenseForm()}`;
}
function expenseForm(){return `<form onsubmit="submitExpense(event)">
 ${field('amount','TUTAR',0,'number')}
 <div class="field"><label>KATEGORİ</label>
   <div class="categoryIcons">
   ${[
    ['YOL','⌁'],['YEMEK','◉'],['MARKET','▣'],['FATURA','▤'],['KİRA','⌂'],['SAĞLIK','♡'],['ULAŞIM','◈'],['EĞLENCE','★'],['YAKIT','◒'],['GİYİM','♢'],['DİĞER','•••']
   ].map(([c,i],n)=>`<label class="catChip"><input type="radio" name="category" value="${c}" ${n===0?'checked':''}><i>${i}</i><span>${c}</span></label>`).join('')}
   </div>
 </div>
 <div class="field"><label>HESAPTAN</label>
  <div class="payIcons">
    <label><input type="radio" name="method" value="NAKİT" checked><i>₺</i><span>NAKİT</span></label>
    <label><input type="radio" name="method" value="KREDİ KARTI"><i>▣</i><span>KREDİ KARTI</span></label>
    <label><input type="radio" name="method" value="ESNEK HESAP"><i class="luxGlyph">▥</i><span>ESNEK HESAP</span></label>
  </div>
 </div>
 ${field('date','TARİH',iso(),'date')}
 ${textarea('note','NOT (İSTEĞE BAĞLI)')}
 <button class="primary">KAYDET</button></form>`}
function nav(){const items=[['home','⌂','ANA'],['work','⌁','İŞ'],['calendar','◌','TAKVİM'],['reports','▥','RAPOR'],['investments','◇','YATIRIM'],['more','•••','DAHA FAZLA']];return `<div class="nav navSix">${items.map(x=>`<button class="${screen===x[0]?'active':''}" onclick="go('${x[0]}')"><i>${x[1]}</i>${x[2]}</button>`).join('')}</div>`;}
function render(){
 if(state.settings.lock && !unlocked){
   $('#app').innerHTML=lockScreen();
   return;
 }
 let content='';
 if(screen==='home')content=home();
 else if(screen==='daily')content=workScreen('daily');
 else if(screen==='hourly')content=workScreen('hourly');
 else if(screen==='overtime')content=workScreen('overtime');
 else if(screen==='work')content=workScreen('daily');
 else if(screen==='finance')content=finance();
 else if(screen==='calendar')content=calendarScreen();
 else if(screen==='reports')content=reports();
 else if(screen==='detail')content=detailReport();
 else if(screen==='investments')content=investments();
 else if(screen==='notes')content=notes();
 else if(screen==='profile')content=profile();
 else if(screen==='settings')content=settings();
 else if(screen==='expense')content=expenseScreen();
 else if(screen==='more')content=`${header('DAHA FAZLA',true)}
 <div class="moreGrid">
   <button onclick="go('finance')"><i>▣</i><b>FİNANS / HESAPLAR</b><span>KARTLAR VE ESNEK HESAPLAR</span></button>
   <button onclick="go('investments')"><i>◆</i><b>YATIRIMLAR</b><span>KÜÇÜK YATIRIMLARINI TAKİP ET</span></button>
   <button onclick="go('notes')"><i>✎</i><b>NOTLAR</b><span>KİŞİSEL VE İŞ NOTLARI</span></button>
   <button onclick="go('profile')"><i>●</i><b>PROFİL</b><span>ÜCRET VE KİŞİSEL AYARLAR</span></button>
   <button onclick="go('settings')"><i>⚙</i><b>AYARLAR</b><span>PIN, YEDEKLEME, HATIRLATMA</span></button><button onclick="openModal('theme')"><i>✧</i><b>TEMA STÜDYOSU</b><span>RENKLERİ KENDİN AYARLA</span></button>
   <button onclick="openModal('expense')"><i class="luxGlyph">▤</i><b>KAYIT EKLE</b><span>GELİR / HARCAMA</span></button>
 </div>`;
 $('#app').innerHTML=`<main class="phone">${content}${nav()}</main>${modal?modalHtml(modal):''}`;
}
function go(s){screen=s;modal=null;render()}
function openModal(k){modal=k;render()}
function closeModal(){modal=null;render()}

function modalHtml(k){
 let title='',body='';
 if(k==='income'){title='GELİR EKLE';body=`<form onsubmit="submitIncome(event)">${field('title','AÇIKLAMA','GELİR')}${field('amount','TUTAR',0,'number')}${field('date','TARİH',iso(),'date')}<button class="primary">KAYDET</button></form>`}
 if(k==='expense'){title='HARCAMA EKLE';body=expenseForm()}
 if(k==='daily'){title='GÜNLÜK ÇALIŞMA';body=dailyForm()}
 if(k==='hourly'){title='SAATLİK ÇALIŞMA';body=hourlyForm()}
 if(k==='overtime'){title='MESAİ';body=overtimeForm()}
 if(k==='note'){title='NOT EKLE';body=`<form onsubmit="submitNote(event)">${field('title','BAŞLIK','NOT')}${textarea('text','NOT') }<button class="primary">KAYDET</button></form>`}
 if(k==='investment'){title='YATIRIM EKLE';body=`<form onsubmit="submitInvestment(event)">${field('title','YATIRIM ADI','YATIRIM')}${field('amount','TUTAR',0,'number')}${field('date','TARİH',iso(),'date')}<button class="primary">KAYDET</button></form>`}
 if(k==='accounts'){title='HESAPLAR';body=`<form onsubmit="submitAccounts(event)">${field('cardBalance','KREDİ KARTI BORCU',state.accounts.card.balance,'number')}${field('cardLimit','KREDİ KARTI LİMİTİ',state.accounts.card.limit,'number')}${field('flexBalance','ESNEK HESAP BORCU',state.accounts.flex.balance,'number')}${field('flexLimit','ESNEK HESAP LİMİTİ',state.accounts.flex.limit,'number')}${field('cash','NAKİT',state.accounts.cash.balance,'number')}<button class="primary">KAYDET</button></form>`}
 if(k.startsWith('day:')){const ds=k.split(':')[1],items=state.work.filter(x=>x.date===ds);title=`${ds} · GÜN KAYDI`;body=`<div class="notice">BU GÜNE YENİ ÇALIŞMA EKLEYEBİLİR VE MEVCUT KAYITLARI SİLEBİLİRSİN.</div><div class="quick" style="grid-template-columns:repeat(3,1fr)"><button onclick="closeModal();setTimeout(()=>openModal('dailyDate:${ds}'),0)"><i class="luxGlyph">✓</i>GÜNLÜK</button><button onclick="closeModal();setTimeout(()=>openModal('hourlyDate:${ds}'),0)"><i>◷</i>SAATLİK</button><button onclick="closeModal();setTimeout(()=>openModal('overtimeDate:${ds}'),0)"><i class="luxGlyph">✦</i>MESAİ</button></div><div class="card list" style="margin-top:10px">${items.length?items.map(x=>`<div class="item"><div class="ico">${x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'}</div><div><b>${x.title}</b><small>${x.hours?x.hours+' SAAT':''}</small></div><button type="button" class="miniDelete" onclick="deleteWork('${x.id}','${ds}')">SİL</button></div>`).join(''):'<div class="notice">BU GÜNDE KAYIT YOK.</div>'}</div>`}
 if(k.startsWith('dailyDate:')){const ds=k.split(':')[1];title='GÜNLÜK ÇALIŞMA';body=dailyForm().replace(`value="${iso()}"`,`value="${ds}"`)}
 if(k.startsWith('hourlyDate:')){const ds=k.split(':')[1];title='SAATLİK ÇALIŞMA';body=hourlyForm().replace(`value="${iso()}"`,`value="${ds}"`)}
 if(k.startsWith('overtimeDate:')){const ds=k.split(':')[1];title='MESAİ';body=overtimeForm().replace(`value="${iso()}"`,`value="${ds}"`)}
 if(k==='addCard'){title='KREDİ KARTI EKLE';body=`<form onsubmit="submitCard(event)">${field('name','KART ADI','ANA KART')}${field('balance','GÜNCEL BORÇ',0,'number')}${field('limit','LİMİT',0,'number')}${field('dueDate','SON ÖDEME TARİHİ','','date')}<button class="primary">KARTI EKLE</button></form>`}
 if(k.startsWith('editCard:')){const c=state.cards.find(x=>x.id===k.split(':')[1]);title='KREDİ KARTI';body=`<form onsubmit="submitCard(event,'${c.id}')">${field('name','KART ADI',c.name)}${field('balance','GÜNCEL BORÇ',c.balance,'number')}${field('limit','LİMİT',c.limit,'number')}${field('dueDate','SON ÖDEME TARİHİ',c.dueDate||'','date')}<button class="primary">KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteCard('${c.id}')">KARTI SİL</button></form>`}
 if(k==='addFlex'){title='ESNEK HESAP EKLE';body=`<form onsubmit="submitFlex(event)">${field('name','HESAP ADI','ESNEK HESAP')}${field('balance','KULLANILAN',0,'number')}${field('limit','LİMİT',0,'number')}${field('dueDate','ÖDEME TARİHİ','','date')}<button class="primary">HESABI EKLE</button></form>`}
 if(k.startsWith('editFlex:')){const c=state.flexAccounts.find(x=>x.id===k.split(':')[1]);title='ESNEK HESAP';body=`<form onsubmit="submitFlex(event,'${c.id}')">${field('name','HESAP ADI',c.name)}${field('balance','KULLANILAN',c.balance,'number')}${field('limit','LİMİT',c.limit,'number')}${field('dueDate','ÖDEME TARİHİ',c.dueDate||'','date')}<button class="primary">KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteFlex('${c.id}')">HESABI SİL</button></form>`}
 if(k==='cash'){title='NAKİT';body=`<form onsubmit="submitCash(event)">${field('cash','NAKİT BAKİYE',state.accounts.cash.balance,'number')}<button class="primary">KAYDET</button></form>`}
 if(k==='security'){title='UYGULAMA KİLİDİ';body=`<form onsubmit="submitSecurity(event)"><div class="field"><label>KİLİT</label><select name="lock"><option value="0" ${!state.settings.lock?'selected':''}>KAPALI</option><option value="1" ${state.settings.lock?'selected':''}>AÇIK</option></select></div>${field('pin','4 HANELİ PIN',state.settings.pin||'','password')}<button class="primary">KAYDET</button></form>`}
 if(k==='reminders'){title='HATIRLATICILAR';body=`<form onsubmit="submitReminders(event)"><div class="field"><label>HATIRLATMALAR</label><select name="reminders"><option value="1" ${state.settings.reminders?'selected':''}>AÇIK</option><option value="0" ${!state.settings.reminders?'selected':''}>KAPALI</option></select></div>${field('reminderDays','KAÇ GÜN ÖNCE?',state.settings.reminderDays,'number')}<div class="notice">KREDİ KARTI VE ESNEK HESAP ÖDEME TARİHLERİNE YAKLAŞINCA UYGULAMA İÇİNDE UYARI GÖSTERİLİR.</div><button class="primary">KAYDET</button></form>`}
 if(k==='backup'){title='YEDEKLEME';body=`<button class="primary" onclick="downloadBackup()">YEDEK DOSYASI OLUŞTUR</button><button class="secondary" onclick="document.getElementById('restoreFile').click()">YEDEĞİ GERİ YÜKLE</button><input id="restoreFile" type="file" hidden onchange="restoreBackup(event)"><div class="notice">RUTİN VERİLERİNİ CİHAZIN DIŞINA YEDEKLEMEN ÖNERİLİR.</div>`}
 if(k==='categories'){title='KATEGORİLER';body=`<div class="card list">${state.categories.map(c=>`<div class="item"><div class="ico">•</div><div><b>${c}</b></div></div>`).join('')}</div>`}
 if(k==='theme'){const t=state.settings.theme||defaults.settings.theme;title='TEMA STÜDYOSU';body=`<form onsubmit="submitTheme(event)"><div class="themePreview"><div class="themePreviewTop">RUTİN</div><div class="themePreviewCard"><b>ÖNİZLEME</b><span>RENKLERİ KAYDETMEDEN DEĞİŞTİR</span></div></div><div class="themeGrid">${colorField('bg','ARKA PLAN',t.bg)}${colorField('panel','KART / PANEL',t.panel)}${colorField('gold','VURGU / GOLD',t.gold)}${colorField('green','GELİR',t.green)}${colorField('red','HARCAMA',t.red)}${colorField('blue','SAATLİK',t.blue)}</div><button class="primary">TEMAYI KAYDET</button><button type="button" class="secondary" onclick="resetTheme()">VARSAYILANA DÖN</button></form>`}
 if(k==='profile'){title='PROFİL';body=`<form onsubmit="submitProfile(event)">${field('name','AD',state.profile.name)}${field('motto','MOTTO',state.profile.motto)}${field('dailyRate','GÜNLÜK ÜCRET',state.settings.dailyRate,'number')}${field('hourlyRate','SAATLİK ÜCRET',state.settings.hourlyRate,'number')}${field('overtimeRate','MESAİ SAATLİK ÜCRET',state.settings.overtimeRate,'number')}<button class="primary">KAYDET</button></form>`}
 if(k==='range'){title='TARİH ARALIĞI';body=`${field('start','BAŞLANGIÇ',iso(new Date(new Date().getFullYear(),new Date().getMonth(),1)),'date')}${field('end','BİTİŞ',iso(),'date')}<button class="primary" onclick="closeModal()">UYGULA</button>`}
 if(k==='menu'){title='MENÜ';body=`<div class="quick" style="grid-template-columns:repeat(2,1fr)"><button onclick="go('calendar')"><i>▦</i>TAKVİM</button><button onclick="go('investments')"><i>↗</i>YATIRIM</button><button onclick="go('notes')"><i>✎</i>NOTLAR</button><button onclick="go('settings')"><i>⚙</i>AYARLAR</button></div>`}
 return `<div class="modal" onclick="if(event.target===this)closeModal()"><div class="sheet"><div class="sheetHead"><b>${title}</b><button class="close" onclick="closeModal()">×</button></div>${body}</div></div>`;
}

function submitDaily(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 state.work.push({id:uid(),type:'daily',date:d.date,title:upper(d.title||'ANA İŞ'),amount:+d.amount||0,note:d.note||''});
 if(d.road==='yes'&&+d.roadAmount>0)state.expenses.push({id:uid(),date:d.date,title:'YOL',amount:+d.roadAmount,category:'YOL',method:'NAKİT',note:'ÇALIŞMA YOL MASRAFI'});
 save();closeModal();render()
}
function submitHourly(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 state.work.push({id:uid(),type:'hourly',date:d.date,title:upper(d.title||'EK İŞ'),hours:+d.hours||0,rate:+d.rate||0,amount:(+d.hours||0)*(+d.rate||0),note:d.note||''});
 if(d.road==='yes'&&+d.roadAmount>0)state.expenses.push({id:uid(),date:d.date,title:'YOL',amount:+d.roadAmount,category:'YOL',method:'NAKİT',note:'ÇALIŞMA YOL MASRAFI'});
 save();closeModal();render()
}
function submitOvertime(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 state.work.push({id:uid(),type:'overtime',date:d.date,title:upper(d.title||'MESAİ'),hours:+d.hours||0,rate:+d.rate||0,amount:(+d.hours||0)*(+d.rate||0),note:d.note||''});
 save();closeModal();render()
}
function submitExpense(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.expenses.push({id:uid(),date:d.date,title:upper(d.category),amount:+d.amount||0,category:d.category,method:d.method,note:d.note||''});save();modal=null;screen='finance';render()}
function submitIncome(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.incomes.push({id:uid(),date:d.date,title:upper(d.title||'GELİR'),amount:+d.amount||0});save();closeModal();render()}
function submitNote(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.notes.push({id:uid(),date:iso(),title:upper(d.title||'NOT'),text:d.text||''});save();closeModal();render()}
function submitInvestment(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.investments.push({id:uid(),date:d.date,title:upper(d.title||'YATIRIM'),amount:+d.amount||0});save();closeModal();render()}
function submitProfile(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.profile.name=upper(d.name||'ZAZOHAN');state.profile.motto=upper(d.motto||'');state.settings.dailyRate=+d.dailyRate||0;state.settings.hourlyRate=+d.hourlyRate||0;state.settings.overtimeRate=+d.overtimeRate||0;save();closeModal();render()}


function deleteWork(id,ds){state.work=state.work.filter(x=>x.id!==id);save();modal=`day:${ds}`;render()}
function previewTheme(e){const f=e.currentTarget.form;if(!f)return;const d=Object.fromEntries(new FormData(f).entries()),r=document.documentElement.style;for(const k of ['bg','panel','gold','green','red','blue'])if(d[k])r.setProperty(`--${k}`,d[k]);r.setProperty('--gold2',d.gold||state.settings.theme.gold)}
function submitTheme(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.settings.theme={bg:d.bg,panel:d.panel,gold:d.gold,green:d.green,red:d.red,blue:d.blue};save();applyTheme();closeModal();render()}
function resetTheme(){state.settings.theme=structuredClone(defaults.settings.theme);save();applyTheme();closeModal();render()}
function submitCard(e,editId=''){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 const x={id:editId||uid(),name:upper(d.name||'KREDİ KARTI'),balance:+d.balance||0,limit:+d.limit||0,dueDate:d.dueDate||''};
 if(editId){const i=state.cards.findIndex(z=>z.id===editId);state.cards[i]=x}else state.cards.push(x);
 save();closeModal();render()
}
function deleteCard(id){state.cards=state.cards.filter(x=>x.id!==id);save();closeModal();render()}
function submitFlex(e,editId=''){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 const x={id:editId||uid(),name:upper(d.name||'ESNEK HESAP'),balance:+d.balance||0,limit:+d.limit||0,dueDate:d.dueDate||''};
 if(editId){const i=state.flexAccounts.findIndex(z=>z.id===editId);state.flexAccounts[i]=x}else state.flexAccounts.push(x);
 save();closeModal();render()
}
function deleteFlex(id){state.flexAccounts=state.flexAccounts.filter(x=>x.id!==id);save();closeModal();render()}
function submitCash(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.accounts.cash.balance=+d.cash||0;save();closeModal();render()}
function submitSecurity(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 state.settings.lock=d.lock==='1';
 if(state.settings.lock){
   if(!/^\d{4}$/.test(d.pin||''))return alert('PIN 4 HANELİ OLMALI');
   state.settings.pin=d.pin;
 }else state.settings.pin='';
 save();unlocked=!state.settings.lock;closeModal();render()
}
function submitReminders(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.settings.reminders=d.reminders==='1';state.settings.reminderDays=Math.max(0,+d.reminderDays||0);save();closeModal();render()}
function lockScreen(){
 return `<main class="phone lockPage"><div class="lockLogo">RUTİN</div><div class="lockCard"><div class="lockIcon">⌾</div><h2>UYGULAMA KİLİTLİ</h2><p>4 HANELİ PIN'İNİ GİR</p><input id="pinUnlock" type="password" inputmode="numeric" maxlength="4" placeholder="••••"><button class="primary" onclick="unlockApp()">AÇ</button></div></main>`
}
function unlockApp(){const v=$('#pinUnlock')?.value||'';if(v===state.settings.pin){unlocked=true;render()}else alert('PIN HATALI')}
function downloadBackup(){
 const blob=new Blob([JSON.stringify({format:'RUTIN-BACKUP-V3',created:new Date().toISOString(),state},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RUTIN-YEDEK-${iso()}.rutin`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
function restoreBackup(e){
 const f=e.target.files?.[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(p.format!=='RUTIN-BACKUP-V3'||!p.state)throw new Error('GEÇERSİZ YEDEK');state=p.state;save();location.reload()}catch(err){alert('YEDEK AÇILAMADI: '+err.message)}};r.readAsText(f)
}
function exportData(){
 const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RUTIN-VERI-${iso()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
function reminderItems(){
 if(!state.settings.reminders)return[];
 const today=new Date(iso()+'T12:00:00'),days=state.settings.reminderDays||0,all=[
  ...state.cards.filter(x=>x.dueDate).map(x=>({name:x.name,date:x.dueDate,type:'KART'})),
  ...state.flexAccounts.filter(x=>x.dueDate).map(x=>({name:x.name,date:x.dueDate,type:'ESNEK HESAP'}))
 ];
 return all.filter(x=>{const d=new Date(x.date+'T12:00:00'),diff=Math.ceil((d-today)/86400000);return diff>=0&&diff<=days})
}

applyTheme();
render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
