
/* V22 GLOBAL SAFE HTML ESCAPE */
window.esc = window.esc || function(value){
 return String(value==null?'':value)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
};


const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(+n||0);
const iso=(d=new Date())=>{let z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
const ym=(d=new Date())=>iso(d).slice(0,7);
const uid=()=>crypto.randomUUID?.()||Date.now()+Math.random().toString(16).slice(2);
const upper=s=>String(s||'').toLocaleUpperCase('tr-TR');

const defaults={
 profile:{name:'ZAZOHAN',motto:'KÜÇÜK ADIMLAR, BÜYÜK ÖZGÜRLÜKLER GETİRİR.',photo:''},
 settings:{dailyRate:1250,hourlyRate:200,overtimeRate:250,pin:'',lock:true,securityVersion:2,reminders:true,reminderDays:2,morningReminder:true,morningReminderTime:'07:00',nightReminder:true,nightReminderTime:'22:00',appearance:'dark',theme:{bg:'#000000',panel:'#000000',gold:'#d7b45c',green:'#22c55e',red:'#ff4d5a',blue:'#3b82f6'}},
 work:[],expenses:[],incomes:[],notes:[],investments:[],
 cards:[],
 flexAccounts:[],
 accounts:{cash:{name:'NAKİT',balance:0}},
 categories:['YOL','YEMEK','MARKET','FATURA','KİRA','SAĞLIK','ULAŞIM','EĞLENCE','YAKIT','GİYİM','DİĞER']
};
const STORAGE_KEY='rutin-main';
function loadRutinState(){
  for(const k of [STORAGE_KEY,'rutin-v4','rutin-v3','rutin-v2','rutin-v1']){
    try{
      const raw=localStorage.getItem(k);
      if(raw){
        const parsed=JSON.parse(raw);
        if(parsed && typeof parsed==='object')return parsed;
      }
    }catch(e){}
  }
  return structuredClone(defaults);
}
let state=loadRutinState();
state.profile={...defaults.profile,...(state.profile||{})};

state.settings={...defaults.settings,...(state.settings||{}),theme:{...defaults.settings.theme,...(state.settings?.theme||{})}};
if((state.settings.securityBootstrapVersion||0)<1){
  state.settings.lock=true;
  state.settings.securityBootstrapVersion=1;
}

state.cards=Array.isArray(state.cards)?state.cards:[];
state.flexAccounts=Array.isArray(state.flexAccounts)?state.flexAccounts:[];
if(state.accounts?.card && !state.cards.length){
  state.cards.push({id:uid(),name:state.accounts.card.name||'KREDİ KARTI',balance:+state.accounts.card.balance||0,limit:+state.accounts.card.limit||0,dueDate:''});
}
if(state.accounts?.flex && !state.flexAccounts.length){
  state.flexAccounts.push({id:uid(),name:state.accounts.flex.name||'ESNEK HESAP',balance:+state.accounts.flex.balance||0,limit:+state.accounts.flex.limit||0,dueDate:''});
}
state.accounts={cash:{name:'NAKİT',balance:+(state.accounts?.cash?.balance||0)}};
save();
let screen='home', modal=null, reportPeriod='month', unlocked=false, calendarCursor=new Date(new Date().getFullYear(),new Date().getMonth(),1);


function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
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

function isWorkRoadExpense(x){
 return !!x && (
  !!x.workId ||
  x.sourceType==='workRoad' ||
  (x.category==='YOL' && (x.title==='YOL' || String(x.note||'').includes('ÇALIŞMA YOL')))
 );
}
function totalsForPeriod(period=reportPeriod){
 const inc=filterByPeriod(state.incomes,period).reduce((a,x)=>a+(+x.amount||0),0);
 let workInc=0;
 for(const w of filterByPeriod(state.work,period)){
   workInc+=w.type==='daily'?(+w.amount||state.settings.dailyRate):(+w.hours||0)*(+w.rate||0);
 }
 const exp=filterByPeriod(state.expenses,period).reduce((a,x)=>a+(+x.amount||0),0);
 const road=filterByPeriod(state.expenses,period).filter(isWorkRoadExpense).reduce((a,x)=>a+(+x.amount||0),0);
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
 const road=monthItems(state.expenses).filter(isWorkRoadExpense).reduce((a,x)=>a+x.amount,0);
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
   <button class="iconBtn luxuryIconBtn settingsOnly" onclick="go('settings')" aria-label="Ayarlar"><span class="settingsGearV27">⚙</span></button>
 </div>`;
}
function profileLine(){
 return `<div class="profileLine"><div class="avatar homeProfileAvatar" onclick="go('profile')">${state.profile.photo?`<img src="${state.profile.photo}">`:(state.profile.name||'R')[0]}</div><div><small>MERHABA</small><b>${state.profile.name}</b><div class="dateLine">${new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div></div>`;
}
function reminderBanner(){
 const a=reminderItems();if(!a.length)return'';
 return `<div class="reminderBanner"><b>◔ ÖDEME HATIRLATMASI</b>${a.map(x=>`<span>${x.type} · ${x.name} · ${x.date}</span>`).join('')}</div>`
}
function greetingByTime(){
 const h=new Date().getHours();
 if(h>=5 && h<12)return 'GÜNAYDIN';
 if(h>=12 && h<17)return 'TÜNAYDIN';
 if(h>=17 && h<23)return 'İYİ AKŞAMLAR';
 return 'İYİ GECELER';
}
function dailyQuote(){
 const quotes=[
  'BUGÜNÜ DÜZENLE, YARINI KOLAYLAŞTIR.',
  'KÜÇÜK ADIMLAR, BÜYÜK SONUÇLAR GETİRİR.',
  'DİSİPLİN, HEDEFİNE GİDEN EN KISA YOLDUR.',
  'KAZANDIĞINI BİL, HARCADIĞINI KONTROL ET.',
  'DÜZEN, ZAMANI VE PARAYI GÜÇLENDİRİR.',
  'HER GÜN BİR ADIM, HER AY BİR SONUÇ.',
  'PLANLI OL, KENDİNE DAHA ÇOK ZAMAN KAZANDIR.'
 ];
 const d=new Date(),seed=Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/86400000);
 return quotes[seed%quotes.length];
}
function applyAppearance(){
 const mode=state.settings.appearance||'dark';
 document.documentElement.dataset.appearance=mode;
}
function home(){
 const T=monthlyTotals(),W=workSummary();
 return `${header()}${profileLine()}${dailyReminderBanner()}${reminderBanner()}
 <div class="heroMsg"><b>${greetingByTime()}!</b><br>${dailyQuote()}</div>
 <div class="stats">
   <div class="stat"><small>BUGÜNKÜ GELİR</small><strong class="green">${money(todayIncome())}</strong></div>
   <div class="stat"><small>BUGÜNKÜ HARCAMA</small><strong class="red">${money(todayExpense())}</strong></div>
   <div class="stat"><small>BU AY GELİR</small><strong class="green">${money(T.income)}</strong></div>
   <div class="stat"><small>BU AY HARCAMA</small><strong class="red">${money(T.expense)}</strong></div>
 </div>
 <div class="section"><b>HIZLI İŞLEMLER</b></div>
 <div class="quick quickPremium quickSix">
   <button onclick="openModal('income')"><i class="luxGlyph quickLux">＋</i><span>GELİR EKLE</span></button>
   <button onclick="openModal('expense')"><i class="luxGlyph quickLux">▤</i><span>HARCAMA</span></button>
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
 const d=new Date(calendarCursor),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7;
 let cells='';for(let i=0;i<offset;i++)cells+='<div class="daySpacer"></div>';
 for(let n=1;n<=days;n++){
  const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
  const w=state.work.filter(x=>x.date===ds),ex=state.expenses.filter(x=>x.date===ds);
  const hasDaily=w.some(x=>x.type==='daily'),hasHourly=w.some(x=>x.type==='hourly'),hasOvertime=w.some(x=>x.type==='overtime');
  const hasRoad=ex.some(isWorkRoadExpense),hasExpense=ex.some(x=>!isWorkRoadExpense(x));
  const dots=[hasDaily?'daily':'',hasHourly?'hourly':'',hasOvertime?'overtime':'',hasRoad?'road':'',hasExpense?'expense':''].filter(Boolean);
  const isToday=ds===iso()?' today':'';
  cells+=`<button class="day calendarMultiDay${isToday}" onclick="openModal('day:${ds}')"><span class="calendarDayNo">${n}</span><span class="calendarDots">${dots.map(k=>`<i class="dot-${k}"></i>`).join('')}</span></button>`;
 }
 const prefix=`${y}-${String(m+1).padStart(2,'0')}`;
 const monthWork=state.work.filter(x=>x.date?.startsWith(prefix));
 const monthExpenses=state.expenses.filter(x=>x.date?.startsWith(prefix));
 const monthIncomes=state.incomes.filter(x=>x.date?.startsWith(prefix));
 const workedDates=new Set(monthWork.map(x=>x.date)).size;
 const hourlyHours=monthWork.filter(x=>x.type==='hourly').reduce((a,x)=>a+(+x.hours||0),0);
 const overtimeHours=monthWork.filter(x=>x.type==='overtime').reduce((a,x)=>a+(+x.hours||0),0);
 const workIncome=monthWork.reduce((a,x)=>a+(x.type==='daily'?(+x.amount||state.settings.dailyRate):((+x.hours||0)*(+x.rate||0))),0);
 const otherIncome=monthIncomes.reduce((a,x)=>a+(+x.amount||0),0);
 const totalIncome=workIncome+otherIncome,totalExpense=monthExpenses.reduce((a,x)=>a+(+x.amount||0),0);
 return `${header('TAKVİM',true)}
 <div class="calendarTitleRow" id="calendarSwipeArea">
   <button class="calendarArrow" onclick="moveCalendar(-1)" aria-label="Önceki ay">‹</button>
   <button class="calendarMonthPick" onclick="openModal('calendarPick')"><b>${d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase()}</b><small>AY / YIL SEÇMEK İÇİN DOKUN</small></button>
   <button class="calendarArrow" onclick="moveCalendar(1)" aria-label="Sonraki ay">›</button>
 </div>
 <div class="card compactCalendar referenceCalendar" ontouchstart="calendarTouchStart(event)" ontouchend="calendarTouchEnd(event)">
   <div class="calendarHead">${['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'].map(x=>`<div>${x}</div>`).join('')}</div>
   <div class="calendar">${cells}</div>
   <div class="calendarLegend multiLegend"><span><i class="dot-daily"></i>GÜNLÜK</span><span><i class="dot-hourly"></i>SAATLİK</span><span><i class="dot-overtime"></i>MESAİ</span><span><i class="dot-road"></i>YOL</span><span><i class="dot-expense"></i>HARCAMA</span></div>
 </div>
 <div class="goldMonthSummary"><div class="goldSummaryTitle">✦ AY ÖZETİ ✦</div>
  <div class="goldSummaryGrid">
   ${goldMonthItem('TOPLAM ÇALIŞILAN GÜN',workedDates+' GÜN')}
   ${goldMonthItem('SAATLİK ÇALIŞMA',hourlyHours+' SAAT')}
   ${goldMonthItem('TOPLAM MESAİ',overtimeHours+' SAAT')}
   ${goldMonthItem('TOPLAM GELİR',money(totalIncome))}
   ${goldMonthItem('TOPLAM HARCAMA',money(totalExpense))}
   ${goldMonthItem('KALAN',money(totalIncome-totalExpense))}
  </div>
 </div>`;
}
function goldMonthItem(label,value){return `<div class="goldSummaryItem"><small>${label}</small><strong>${value}</strong></div>`}
function moveCalendar(delta){calendarCursor=new Date(calendarCursor.getFullYear(),calendarCursor.getMonth()+delta,1);render()}
let calendarTouchX=0;
function calendarTouchStart(e){calendarTouchX=e.changedTouches?.[0]?.clientX||0}
function calendarTouchEnd(e){const x=e.changedTouches?.[0]?.clientX||0,d=x-calendarTouchX;if(Math.abs(d)>55)moveCalendar(d<0?1:-1)}
function shiftDayModal(ds,delta){const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+delta);openModal('day:'+iso(d))}
function calendarPickGo(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());calendarCursor=new Date(+d.year,+d.month,1);modal=null;render()}
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
   <div class="profileRing clickableAvatar" onclick="openModal('profile')"><div class="avatar">${state.profile.photo?`<img src="${state.profile.photo}">`:(state.profile.name||'R')[0]}</div><span class="avatarEditBadge">✎</span></div>
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
 return `${header('AYARLAR',true)}<div class="card settingsCard">
 <div class="setting clickable premiumSetting" onclick="go('profile')"><div class="settingIcon">●</div><b>PROFİL</b><span>›</span></div>
 <div class="setting clickable premiumSetting" onclick="openModal('categories')"><div class="settingIcon">▦</div><b>KATEGORİLER</b><span>›</span></div>
 <div class="setting clickable premiumSetting" onclick="go('finance')"><div class="settingIcon">▣</div><b>HESAPLAR</b><span>›</span></div>
 <div class="setting clickable premiumSetting" onclick="openModal('backup')"><div class="settingIcon">⇩</div><b>YEDEKLEME / GERİ YÜKLE</b><span>›</span></div>
 <div class="setting clickable premiumSetting" onclick="openModal('theme')"><div class="settingIcon">✧</div><b>TEMA STÜDYOSU</b><span>›</span></div>
 <div class="setting clickable premiumSetting" onclick="toggleAppearance()"><div class="settingIcon">◐</div><b>GÖRÜNÜM</b><span>${(state.settings.appearance||'dark')==='dark'?'KARANLIK MOD':'AÇIK MOD'} ›</span></div>
 <div class="setting clickable premiumSetting" onclick="openModal('reminders')"><div class="settingIcon">◔</div><b>HATIRLATICILAR</b><span>›</span></div>
 <div class="setting clickable premiumSetting" onclick="openModal('security')"><div class="settingIcon">⌾</div><b>UYGULAMA KİLİDİ</b><span>${state.settings.lock?'AÇIK':'KAPALI'} ›</span></div>
 <div class="setting clickable premiumSetting" onclick="document.getElementById('dataImportFile').click()"><div class="settingIcon">⇩</div><b>VERİ GERİ YÜKLE</b><span>›</span></div>
 <input id="dataImportFile" type="file" hidden onchange="importData(event)">
 <div class="setting premiumSetting"><div class="settingIcon">i</div><b>HAKKINDA</b><span>RUTİN V6.2</span></div>
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
function nav(){
 const items=[
  ['home','⌂','ANA SAYFA'],
  ['work','◈','İŞ'],
  ['calendar','◉','TAKVİM'],
  ['reports','▥','RAPOR'],
  ['investments','◆','YATIRIM'],
  ['more','⋯','DAHA FAZLA']
 ];
 return `<div class="nav navSix">${items.map(x=>`<button class="${screen===x[0]?'active':''}" onclick="go('${x[0]}')"><i class="luxGlyph navLux">${x[1]}</i><span>${x[2]}</span></button>`).join('')}</div>`;
}

let cleanPin = {
  mode: null,   // login | create | confirm
  buffer: '',
  first: ''
};

function initCleanPinMode(){
  if(cleanPin.mode===null){
    cleanPin.mode = state.settings.pin ? 'login' : 'create';
    cleanPin.buffer = '';
    cleanPin.first = '';
  }
}

function cleanPinInstruction(){
  if(cleanPin.mode==='create') return 'YENİ 4 HANELİ PINİNİ GİR';
  if(cleanPin.mode==='confirm') return 'PINİ TEKRAR GİR';
  return '4 HANELİ PINİNİ GİR';
}

function cleanPinScreen(){
  initCleanPinMode();

  const name = state.profile?.name || 'RUTİN';
  const photo = state.profile?.photo || '';

  return `<div class="premiumLock cleanPinScreen">
    <div class="lockAura"></div>

    <div class="lockTop">
      <div class="lockSideQuote">DİSİPLİN<br>BUGÜNÜ<br>YARINA TAŞIR</div>
      <div class="lockBrand"><img class="lockLogoV31" src="icon-180.png?v=v42" alt="RUTİN"><strong>RUTİN</strong><small>DAHA İYİ BİR SEN</small></div>
      <div class="lockSideQuote right">PLANLA<br>ÇALIŞ<br>BAŞAR</div>
    </div>

    <div class="lockProfile">${photo?`<img src="${photo}" alt="">`:`<div class="lockAvatar">${name.slice(0,1).toUpperCase()}</div>`}</div>
    <h1>${name}</h1>
    <div class="lockSub">RUTİN SENİNLE DAHA GÜÇLÜ</div>

    <div class="lockGreeting">${typeof greetingByTime==='function'?greetingByTime():'HOŞ GELDİN'}!</div>
    <div class="cleanPinInstruction">${cleanPinInstruction()}</div>

    <div class="pinDots cleanPinDots">
      ${[0,1,2,3].map((_,i)=>`<i class="${cleanPin.buffer.length>i?'filled':''}"></i>`).join('')}
    </div>

    <div class="pinPad cleanPinPad">
      ${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" class="cleanPinBtn" data-pin="${n}">${n}</button>`).join('')}
      <button type="button" class="cleanPinBtn pinGhost" data-pin="clear">C</button>
      <button type="button" class="cleanPinBtn" data-pin="0">0</button>
      <button type="button" class="cleanPinBtn" data-pin="del">⌫</button>
    </div>

    <button type="button" class="cleanPinOk">✓ TAMAM</button>

    ${cleanPin.mode==='login'
      ? `<button type="button" class="forgotPinBtn cleanForgotBtn">PAROLAMI UNUTTUM</button>`
      : `<div class="cleanPinHelp">4 HANELİ PINİNİ GİRİP TAMAM'A BAS.</div>`
    }

    <div class="lockVersion">CLEAN V2</div>
  </div>`;
}

function updateCleanPinUI(){
  const dots = document.querySelectorAll('.cleanPinDots i');
  dots.forEach((dot,i)=>dot.classList.toggle('filled', cleanPin.buffer.length>i));

  const inst = document.querySelector('.cleanPinInstruction');
  if(inst) inst.textContent = cleanPinInstruction();
}

function cleanPinKey(v){
  const val = String(v);

  if(val==='clear'){
    cleanPin.buffer = '';
    updateCleanPinUI();
    return;
  }

  if(val==='del'){
    cleanPin.buffer = cleanPin.buffer.slice(0,-1);
    updateCleanPinUI();
    return;
  }

  if(!/^\d$/.test(val) || cleanPin.buffer.length>=4) return;

  cleanPin.buffer += val;
  updateCleanPinUI();
}

function confirmCleanPin(){
  if(cleanPin.buffer.length!==4){
    alert('LÜTFEN 4 HANELİ PIN GİR.');
    return;
  }

  if(cleanPin.mode==='create'){
    cleanPin.first = cleanPin.buffer;
    cleanPin.buffer = '';
    cleanPin.mode = 'confirm';
    updateCleanPinUI();
    return;
  }

  if(cleanPin.mode==='confirm'){
    if(cleanPin.buffer!==cleanPin.first){
      cleanPin = {mode:'create',buffer:'',first:''};
      updateCleanPinUI();
      alert('PINLER AYNI DEĞİL. TEKRAR DENE.');
      return;
    }

    state.settings.lock = true;
    state.settings.pin = cleanPin.buffer;
    save();

    cleanPin = {mode:'login',buffer:'',first:''};
    unlocked = true;
    render();
    return;
  }

  if(cleanPin.buffer===String(state.settings.pin||'')){
    cleanPin.buffer = '';
    unlocked = true;
    render();
    return;
  }

  cleanPin.buffer = '';
  updateCleanPinUI();
  alert('PIN HATALI.');
}

function resetRutinPin(){
  const ok = confirm("RUTİN PIN'İ SIFIRLANSIN MI?");
  if(!ok) return;

  state.settings.lock = true;
  state.settings.pin = '';
  save();

  unlocked = false;
  cleanPin = {mode:'create',buffer:'',first:''};
  render();
}

function bindCleanPinControls(){
  document.querySelectorAll('.cleanPinBtn').forEach(btn=>{
    btn.onclick = (e)=>{
      e.preventDefault();
      e.stopPropagation();
      cleanPinKey(btn.dataset.pin);
    };
  });

  const ok = document.querySelector('.cleanPinOk');
  if(ok){
    ok.onclick = (e)=>{
      e.preventDefault();
      e.stopPropagation();
      confirmCleanPin();
    };
  }

  const forgot = document.querySelector('.cleanForgotBtn');
  if(forgot){
    forgot.onclick = (e)=>{
      e.preventDefault();
      e.stopPropagation();
      resetRutinPin();
    };
  }
}

document.addEventListener('keydown',(e)=>{
  if(!state.settings.lock || unlocked) return;

  if(/^\d$/.test(e.key)){
    e.preventDefault();
    cleanPinKey(e.key);
    return;
  }

  if(e.key==='Backspace' || e.key==='Delete'){
    e.preventDefault();
    cleanPinKey('del');
    return;
  }

  if(e.key==='Enter'){
    e.preventDefault();
    confirmCleanPin();
  }
});
function render(){
 if(state.settings.lock && !unlocked){
   $('#app').innerHTML=cleanPinScreen();
   requestAnimationFrame(()=>bindCleanPinControls());
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
function safeBackdropClose(e){
 if(e.target!==e.currentTarget)return;
 const active=document.activeElement;
 if(active && ['INPUT','TEXTAREA','SELECT'].includes(active.tagName))return;
 closeModal();
}
function openModal(k){modal=k;render()}
function closeModal(){modal=null;const m=document.querySelector('.modal');if(m)m.remove();try{render()}catch(e){console.error('MODAL CLOSE RENDER',e)}}

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
 if(k.startsWith('day:')){
  const ds=k.split(':')[1],items=state.work.filter(x=>x.date===ds),expenses=state.expenses.filter(x=>x.date===ds),roads=expenses.filter(isWorkRoadExpense),normalExpenses=expenses.filter(x=>!isWorkRoadExpense(x));
  const workRows=items.map(x=>`<div class="item"><div class="ico">${x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'}</div><div><b>${x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ'} · ${x.title||''}</b><small>${x.hours?x.hours+' SAAT · ':''}${money(x.amount||((x.hours||0)*(x.rate||0)))}</small></div><div class="dayItemActions"><button class="miniEdit" onclick="openModal('editWork:${x.id}:${ds}')">DÜZENLE</button><button class="miniDelete" onclick="deleteWork('${x.id}','${ds}')">SİL</button></div></div>`).join('');
  const expenseRows=expenses.map(x=>`<div class="item"><div class="ico">${isWorkRoadExpense(x)?'⌁':'▤'}</div><div><b>${isWorkRoadExpense(x)?'YOL GİDERİ':(x.category||x.title||'HARCAMA')}</b><small>${money(+x.amount||0)} · ${x.method||'BELİRTİLMEDİ'}${x.person?' · '+x.person:''}${x.note?' · '+x.note:''}</small></div><div class="dayItemActions"><button class="miniEdit" onclick="openModal('editExpense:${x.id}:${ds}')">DÜZENLE</button><button class="miniDelete" onclick="deleteExpense('${x.id}','${ds}')">SİL</button></div></div>`).join('');
  title=`${ds} · GÜN DETAYI`;
  body=`<div class="daySwipeNav" ontouchstart="dayTouchStart(event)" ontouchend="dayTouchEnd(event,'${ds}')"><button onclick="shiftDayModal('${ds}',-1)">‹ ÖNCEKİ</button><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'}).toUpperCase()}</b><button onclick="shiftDayModal('${ds}',1)">SONRAKİ ›</button></div>
  <div class="quick" style="grid-template-columns:repeat(4,1fr)"><button onclick="openModal('dailyDate:${ds}')"><i>✓</i>GÜNLÜK</button><button onclick="openModal('hourlyDate:${ds}')"><i>◷</i>SAATLİK</button><button onclick="openModal('overtimeDate:${ds}')"><i>✦</i>MESAİ</button><button onclick="openModal('expenseDate:${ds}')"><i>▤</i>HARCAMA</button></div>
  <div class="dayDetailSection"><b>ÇALIŞMA / MESAİ</b>${workRows||'<div class="notice">ÇALIŞMA KAYDI YOK.</div>'}</div>
  <div class="dayDetailSection"><b>YOL GİDERİ VE HARCAMALAR</b>${expenseRows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}</div>`;
 }
 if(k.startsWith('dailyDate:')){const ds=k.split(':')[1];title='GÜNLÜK ÇALIŞMA';body=dailyForm().replace(`value="${iso()}"`,`value="${ds}"`)}
 if(k.startsWith('hourlyDate:')){const ds=k.split(':')[1];title='SAATLİK ÇALIŞMA';body=hourlyForm().replace(`value="${iso()}"`,`value="${ds}"`)}
 if(k.startsWith('overtimeDate:')){const ds=k.split(':')[1];title='MESAİ';body=overtimeForm().replace(`value="${iso()}"`,`value="${ds}"`)}
 if(k.startsWith('expenseDate:')){const ds=k.split(':')[1];title='HARCAMA';body=expenseForm().replace(`value="${iso()}"`,`value="${ds}"`)}
 if(k.startsWith('editExpense:')){
  const parts=k.split(':'),id=parts[1],ds=parts[2],x=state.expenses.find(z=>z.id===id);
  if(x){title='HARCAMAYI DÜZENLE';body=`<form onsubmit="submitEditExpense(event,'${x.id}','${ds}')">${field('amount','TUTAR',x.amount||0,'number')}${field('category','KATEGORİ',x.category||x.title||'DİĞER')}${field('method','ÖDEME YÖNTEMİ',x.method||'NAKİT')}${field('person','KİŞİ ADI (GEREKİYORSA)',x.person||'')}${field('date','TARİH',x.date,'date')}<div class="field"><label>NOT</label><textarea name="note">${x.note||''}</textarea></div><button class="primary">DEĞİŞİKLİĞİ KAYDET</button></form>`}
 }
 if(k==='calendarPick'){
  const nowY=calendarCursor.getFullYear(),optsM=['OCAK','ŞUBAT','MART','NİSAN','MAYIS','HAZİRAN','TEMMUZ','AĞUSTOS','EYLÜL','EKİM','KASIM','ARALIK'].map((x,i)=>`<option value="${i}" ${i===calendarCursor.getMonth()?'selected':''}>${x}</option>`).join('');
  let optsY='';for(let yy=nowY-20;yy<=nowY+10;yy++)optsY+=`<option value="${yy}" ${yy===nowY?'selected':''}>${yy}</option>`;
  title='AY / YIL SEÇ';body=`<form onsubmit="calendarPickGo(event)"><div class="field"><label>AY</label><select name="month">${optsM}</select></div><div class="field"><label>YIL</label><select name="year">${optsY}</select></div><button class="primary">TAKVİME GİT</button></form>`
 }
 if(k.startsWith('editWork:')){
   const parts=k.split(':'),id=parts[1],ds=parts[2],x=state.work.find(z=>z.id===id);
   if(x){
     title='ÇALIŞMA KAYDINI DÜZENLE';
     body=`<form onsubmit="submitEditWork(event,'${x.id}','${ds}')">
       ${field('date','TARİH',x.date,'date')}
       ${field('title','İŞ / PROJE',x.title||'')}
       ${x.type==='daily'
         ? `${field('amount','GÜNLÜK ÜCRET',x.amount||state.settings.dailyRate,'number')}`
         : `${field('hours',x.type==='hourly'?'ÇALIŞILAN SAAT':'MESAİ SAATİ',x.hours||0,'number')}${field('rate','SAATLİK ÜCRET',x.rate||(x.type==='hourly'?state.settings.hourlyRate:state.settings.overtimeRate),'number')}`
       }
       ${textarea('note','NOT').replace('</textarea>',`${x.note||''}</textarea>`)}
       <button class="primary">DEĞİŞİKLİĞİ KAYDET</button>
     </form>`;
   }
 }
 if(k==='addCard'){title='KREDİ KARTI EKLE';body=`<form onsubmit="submitCard(event)">${field('name','KART ADI','ANA KART')}${field('balance','GÜNCEL BORÇ',0,'number')}${field('limit','LİMİT',0,'number')}${field('dueDate','SON ÖDEME TARİHİ','','date')}<button class="primary">KARTI EKLE</button></form>`}
 if(k.startsWith('editCard:')){const c=state.cards.find(x=>x.id===k.split(':')[1]);title='KREDİ KARTI';body=`<form onsubmit="submitCard(event,'${c.id}')">${field('name','KART ADI',c.name)}${field('balance','GÜNCEL BORÇ',c.balance,'number')}${field('limit','LİMİT',c.limit,'number')}${field('dueDate','SON ÖDEME TARİHİ',c.dueDate||'','date')}<button class="primary">KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteCard('${c.id}')">KARTI SİL</button></form>`}
 if(k==='addFlex'){title='ESNEK HESAP EKLE';body=`<form onsubmit="submitFlex(event)">${field('name','HESAP ADI','ESNEK HESAP')}${field('balance','KULLANILAN',0,'number')}${field('limit','LİMİT',0,'number')}${field('dueDate','ÖDEME TARİHİ','','date')}<button class="primary">HESABI EKLE</button></form>`}
 if(k.startsWith('editFlex:')){const c=state.flexAccounts.find(x=>x.id===k.split(':')[1]);title='ESNEK HESAP';body=`<form onsubmit="submitFlex(event,'${c.id}')">${field('name','HESAP ADI',c.name)}${field('balance','KULLANILAN',c.balance,'number')}${field('limit','LİMİT',c.limit,'number')}${field('dueDate','ÖDEME TARİHİ',c.dueDate||'','date')}<button class="primary">KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteFlex('${c.id}')">HESABI SİL</button></form>`}
 if(k==='cash'){title='NAKİT';body=`<form onsubmit="submitCash(event)">${field('cash','NAKİT BAKİYE',state.accounts.cash.balance,'number')}<button class="primary">KAYDET</button></form>`}
 if(k==='security'){title='UYGULAMA KİLİDİ';body=`<form onsubmit="submitSecurity(event)">
<div class="field"><label>KİLİT</label><select name="lock"><option value="0" ${!state.settings.lock?'selected':''}>KAPALI</option><option value="1" ${state.settings.lock?'selected':''}>AÇIK</option></select></div>
<div class="field"><label>4 HANELİ PIN</label><input name="pin" type="password" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" value="${state.settings.pin||''}" placeholder="••••"></div>
<div class="notice">KİLİDİ AÇIK SEÇİP 4 HANELİ PIN GİR. SONRA KAYDET.</div>
<button class="primary" type="submit">KAYDET</button></form>`}
 if(k==='reminders'){title='HATIRLATICILAR';body=`<form onsubmit="submitReminders(event)">
      <div class="field"><label>ÖDEME HATIRLATMALARI</label><select name="reminders"><option value="1" ${state.settings.reminders?'selected':''}>AÇIK</option><option value="0" ${!state.settings.reminders?'selected':''}>KAPALI</option></select></div>
      ${field('reminderDays','ÖDEMEDEN KAÇ GÜN ÖNCE?',state.settings.reminderDays,'number')}
      <div class="field"><label>SABAH HATIRLATMASI</label><select name="morningReminder"><option value="1" ${state.settings.morningReminder?'selected':''}>AÇIK</option><option value="0" ${!state.settings.morningReminder?'selected':''}>KAPALI</option></select></div>
      ${field('morningReminderTime','SABAH SAATİ',state.settings.morningReminderTime||'07:00','time')}
      <div class="field"><label>GECE HATIRLATMASI</label><select name="nightReminder"><option value="1" ${state.settings.nightReminder?'selected':''}>AÇIK</option><option value="0" ${!state.settings.nightReminder?'selected':''}>KAPALI</option></select></div>
      ${field('nightReminderTime','GECE SAATİ',state.settings.nightReminderTime||'22:00','time')}
      <div class="notice">VARSAYILAN: SABAH 07:00 · GECE 22:00. UYGULAMA AÇILDIĞINDA GÜNLÜK KAYITLARINI HATIRLATIR.</div>
      <button class="primary">KAYDET</button></form>`}
 if(k==='backup'){title='YEDEKLEME';body=`<button class="primary" onclick="downloadBackup()">YEDEK DOSYASI OLUŞTUR</button><button class="secondary" onclick="document.getElementById('restoreFile').click()">YEDEĞİ GERİ YÜKLE</button><input id="restoreFile" type="file" hidden onchange="restoreBackup(event)"><div class="notice">RUTİN VERİLERİNİ CİHAZIN DIŞINA YEDEKLEMEN ÖNERİLİR.</div>`}
 if(k==='categories'){title='KATEGORİLER';body=`<div class="card list">${state.categories.map(c=>`<div class="item"><div class="ico">•</div><div><b>${c}</b></div></div>`).join('')}</div>`}
 if(k==='theme'){const t=state.settings.theme||defaults.settings.theme;title='TEMA STÜDYOSU';body=`<form onsubmit="submitTheme(event)"><div class="themePreview"><div class="themePreviewTop">RUTİN</div><div class="themePreviewCard"><b>ÖNİZLEME</b><span>RENKLERİ KAYDETMEDEN DEĞİŞTİR</span></div></div><div class="themeGrid">${colorField('bg','ARKA PLAN',t.bg)}${colorField('panel','KART / PANEL',t.panel)}${colorField('gold','VURGU / GOLD',t.gold)}${colorField('green','GELİR',t.green)}${colorField('red','HARCAMA',t.red)}${colorField('blue','SAATLİK',t.blue)}</div><div class="appearanceSwitch">
     <button type="button" class="${(state.settings.appearance||'dark')==='dark'?'active':''}" onclick="setAppearance('dark')">KARANLIK MOD</button>
     <button type="button" class="${(state.settings.appearance||'dark')==='light'?'active':''}" onclick="setAppearance('light')">AÇIK MOD</button>
   </div>
   <button class="primary">TEMAYI KAYDET</button><button type="button" class="secondary" onclick="resetTheme()">VARSAYILANA DÖN</button></form>`}
 if(k==='profile'){title='PROFİL';body=`<form onsubmit="submitProfile(event)">
<div class="profilePhotoEditor">
  <div class="profilePhotoPreview">${state.profile.photo?`<img id="profilePhotoPreviewImg" src="${state.profile.photo}" alt="">`:`<div id="profilePhotoPreviewFallback">${(state.profile.name||'R')[0]}</div>`}</div>
  <div class="profilePhotoActions">
    <button type="button" class="secondary" onclick="document.getElementById('profilePhotoInput').click()">FOTOĞRAF SEÇ</button>
    ${state.profile.photo?`<button type="button" class="secondary dangerBtn" onclick="removeProfilePhoto()">FOTOĞRAFI KALDIR</button>`:''}
  </div>
  <input id="profilePhotoInput" type="file" accept="image/*" hidden onchange="previewProfilePhoto(event)">
</div>
${field('name','AD',state.profile.name)}
${field('motto','MOTTO',state.profile.motto)}
${field('dailyRate','GÜNLÜK ÜCRET',state.settings.dailyRate,'number')}
${field('hourlyRate','SAATLİK ÜCRET',state.settings.hourlyRate,'number')}
${field('overtimeRate','MESAİ SAATLİK ÜCRET',state.settings.overtimeRate,'number')}
<input type="hidden" name="photo" id="profilePhotoData" value="${state.profile.photo||''}">
<button class="primary">KAYDET</button></form>`}
 if(k==='range'){title='TARİH ARALIĞI';body=`${field('start','BAŞLANGIÇ',iso(new Date(new Date().getFullYear(),new Date().getMonth(),1)),'date')}${field('end','BİTİŞ',iso(),'date')}<button class="primary" onclick="closeModal()">UYGULA</button>`}
 if(k==='menu'){title='MENÜ';body=`<div class="quick" style="grid-template-columns:repeat(2,1fr)"><button onclick="go('calendar')"><i>▦</i>TAKVİM</button><button onclick="go('investments')"><i>↗</i>YATIRIM</button><button onclick="go('notes')"><i>✎</i>NOTLAR</button><button onclick="go('settings')"><i>⚙</i>AYARLAR</button></div>`}
 return `<div class="modal" onclick="safeBackdropClose(event)"><div class="sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${title}</b><button class="close" type="button" onclick="event.preventDefault();event.stopPropagation();closeModal();return false">×</button></div>${body}</div></div>`;
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
let cropState={src:'',zoom:1,x:0,y:0,dragging:false,startX:0,startY:0,lastX:0,lastY:0};

function previewProfilePhoto(e){
 const f=e.target.files?.[0];if(!f)return;
 if(!f.type.startsWith('image/')){alert('LÜTFEN BİR RESİM DOSYASI SEÇ.');return;}
 const reader=new FileReader();
 reader.onload=()=>{
   cropState={src:reader.result,zoom:1,x:0,y:0,dragging:false,startX:0,startY:0,lastX:0,lastY:0};
   openCropEditor();
 };
 reader.readAsDataURL(f);
}

function openCropEditor(){
 const overlay=document.createElement('div');
 overlay.id='cropOverlay';
 overlay.className='cropOverlay';
 overlay.innerHTML=`
   <div class="cropSheet">
     <div class="cropHead"><b>PROFİL FOTOĞRAFINI AYARLA</b><button type="button" onclick="closeCropEditor()">×</button></div>
     <div class="cropStageWrap">
       <canvas id="cropCanvas" width="320" height="320"></canvas>
       <div class="cropCircleGuide"></div>
     </div>
     <div class="cropControls">
       <label>YAKINLAŞTIR</label>
       <input id="cropZoom" type="range" min="1" max="3.5" step="0.01" value="1" oninput="setCropZoom(this.value)">
     </div>
     <div class="cropHint">RESMİ PARMAĞINLA / MOUSE İLE TAŞI · İSTEDİĞİN KAREYİ ORTALA</div>
     <div class="cropActions">
       <button type="button" class="secondary" onclick="closeCropEditor()">İPTAL</button>
       <button type="button" class="primary" onclick="useCrop()">KADRAJI KULLAN</button>
     </div>
   </div>`;
 document.body.appendChild(overlay);
 initCropCanvas();
}

function closeCropEditor(){
 document.getElementById('cropOverlay')?.remove();
 const input=$('#profilePhotoInput'); if(input)input.value='';
}

function initCropCanvas(){
 const canvas=document.getElementById('cropCanvas');
 if(!canvas)return;
 const img=new Image();
 img.onload=()=>{
   cropState.img=img;
   cropState.x=0;cropState.y=0;cropState.zoom=1;
   drawCrop();
 };
 img.src=cropState.src;

 const pos=(ev)=>{
   const r=canvas.getBoundingClientRect();
   const p=ev.touches?.[0]||ev.changedTouches?.[0]||ev;
   return {x:(p.clientX-r.left)*(canvas.width/r.width),y:(p.clientY-r.top)*(canvas.height/r.height)};
 };
 const down=(ev)=>{
   ev.preventDefault();
   const p=pos(ev);
   cropState.dragging=true;cropState.startX=p.x;cropState.startY=p.y;cropState.lastX=cropState.x;cropState.lastY=cropState.y;
 };
 const move=(ev)=>{
   if(!cropState.dragging)return;
   ev.preventDefault();
   const p=pos(ev);
   cropState.x=cropState.lastX+(p.x-cropState.startX);
   cropState.y=cropState.lastY+(p.y-cropState.startY);
   clampCrop();
   drawCrop();
 };
 const up=()=>{cropState.dragging=false};

 canvas.addEventListener('mousedown',down);
 canvas.addEventListener('mousemove',move);
 window.addEventListener('mouseup',up,{once:false});
 canvas.addEventListener('touchstart',down,{passive:false});
 canvas.addEventListener('touchmove',move,{passive:false});
 canvas.addEventListener('touchend',up,{passive:true});
}

function setCropZoom(v){
 cropState.zoom=+v||1;
 clampCrop();
 drawCrop();
}

function cropGeometry(){
 const c=320,img=cropState.img;
 if(!img)return null;
 const base=Math.max(c/img.width,c/img.height);
 const scale=base*cropState.zoom;
 const w=img.width*scale,h=img.height*scale;
 return {c,scale,w,h};
}

function clampCrop(){
 const g=cropGeometry();if(!g)return;
 const maxX=Math.max(0,(g.w-g.c)/2),maxY=Math.max(0,(g.h-g.c)/2);
 cropState.x=Math.max(-maxX,Math.min(maxX,cropState.x));
 cropState.y=Math.max(-maxY,Math.min(maxY,cropState.y));
}

function drawCrop(){
 const canvas=document.getElementById('cropCanvas'),img=cropState.img;if(!canvas||!img)return;
 const ctx=canvas.getContext('2d'),g=cropGeometry();
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#000';ctx.fillRect(0,0,canvas.width,canvas.height);
 const dx=(g.c-g.w)/2+cropState.x,dy=(g.c-g.h)/2+cropState.y;
 ctx.drawImage(img,dx,dy,g.w,g.h);

 // dim outside circular crop
 ctx.save();
 ctx.fillStyle='rgba(0,0,0,.52)';
 ctx.beginPath();ctx.rect(0,0,g.c,g.c);
 ctx.arc(g.c/2,g.c/2,g.c*.40,0,Math.PI*2,true);
 ctx.fill('evenodd');
 ctx.restore();

 ctx.beginPath();
 ctx.arc(g.c/2,g.c/2,g.c*.40,0,Math.PI*2);
 ctx.strokeStyle='#d7b45c';
 ctx.lineWidth=3;
 ctx.stroke();
}

function useCrop(){
 const srcCanvas=document.getElementById('cropCanvas');if(!srcCanvas||!cropState.img)return;
 const out=document.createElement('canvas');
 out.width=512;out.height=512;
 const ctx=out.getContext('2d');

 // reproduce image transform into a square, without dark mask
 const g=cropGeometry();
 const cropR=g.c*.40, cropSize=cropR*2;
 const sourceX=g.c/2-cropR,sourceY=g.c/2-cropR;

 const temp=document.createElement('canvas');
 temp.width=g.c;temp.height=g.c;
 const tctx=temp.getContext('2d');
 const dx=(g.c-g.w)/2+cropState.x,dy=(g.c-g.h)/2+cropState.y;
 tctx.drawImage(cropState.img,dx,dy,g.w,g.h);

 ctx.drawImage(temp,sourceX,sourceY,cropSize,cropSize,0,0,512,512);

 const data=out.toDataURL('image/jpeg',0.9);
 const hidden=$('#profilePhotoData');
 if(hidden)hidden.value=data;
 const wrap=document.querySelector('.profilePhotoPreview');
 if(wrap)wrap.innerHTML=`<img id="profilePhotoPreviewImg" src="${data}" alt="">`;
 closeCropEditor();
}

function removeProfilePhoto(){
 const hidden=$('#profilePhotoData');
 if(hidden)hidden.value='';
 const wrap=document.querySelector('.profilePhotoPreview');
 if(wrap)wrap.innerHTML=`<div id="profilePhotoPreviewFallback">${(state.profile.name||'R')[0]}</div>`;
}
function submitProfile(e){
 e.preventDefault();
 const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 state.profile.name=upper(d.name||'ZAZOHAN');
 state.profile.motto=upper(d.motto||'');
 state.profile.photo=d.photo||'';
 state.settings.dailyRate=+d.dailyRate||0;
 state.settings.hourlyRate=+d.hourlyRate||0;
 state.settings.overtimeRate=+d.overtimeRate||0;
 save();
 closeModal();
 render();
}
let dayTouchX=0;
function dayTouchStart(e){dayTouchX=e.changedTouches?.[0]?.clientX||0}
function dayTouchEnd(e,ds){const x=e.changedTouches?.[0]?.clientX||0,d=x-dayTouchX;if(Math.abs(d)>55)shiftDayModal(ds,d<0?1:-1)}
function submitEditWork(e,id,oldDs){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.work.find(z=>z.id===id);if(!x)return; x.date=d.date;x.title=upper(d.title||x.title||'');x.note=d.note||'';if(x.type==='daily'){x.amount=+d.amount||0}else{x.hours=+d.hours||0;x.rate=+d.rate||0;x.amount=x.hours*x.rate}save();modal='day:'+x.date;render()}
function submitEditExpense(e,id,oldDs){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.expenses.find(z=>z.id===id);if(!x)return;x.amount=+d.amount||0;x.category=upper(d.category||x.category||'DİĞER');x.title=x.category;x.method=upper(d.method||x.method||'NAKİT');x.person=d.person||'';x.date=d.date;x.note=d.note||'';save();modal='day:'+x.date;render()}
function deleteExpense(id,ds){state.expenses=state.expenses.filter(x=>x.id!==id);save();modal='day:'+ds;render()}
function deleteWork(id,ds){state.work=state.work.filter(x=>x.id!==id);save();modal=`day:${ds}`;render()}
function previewTheme(e){const f=e.currentTarget.form;if(!f)return;const d=Object.fromEntries(new FormData(f).entries()),r=document.documentElement.style;for(const k of ['bg','panel','gold','green','red','blue'])if(d[k])r.setProperty(`--${k}`,d[k]);r.setProperty('--gold2',d.gold||state.settings.theme.gold)}
function setAppearance(mode){
 state.settings.appearance=mode==='light'?'light':'dark';
 save();applyAppearance();render();
}
function toggleAppearance(){
 setAppearance((state.settings.appearance||'dark')==='dark'?'light':'dark');
}
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
 e.preventDefault();
 const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 const wantLock=d.lock==='1';

 if(!wantLock){
   state.settings.lock=false;
   state.settings.pin='';
   save();

   unlocked=true;
   modal=null;
   cleanPin={mode:null,buffer:'',first:''};

   alert('UYGULAMA KİLİDİ KAPATILDI.');
   render();
   return;
 }

 state.settings.lock=true;
 save();

 modal=null;
 unlocked=false;
 cleanPin={mode:state.settings.pin?'login':'create',buffer:'',first:''};
 render();
}
function submitReminders(e){
 e.preventDefault();
 const d=Object.fromEntries(new FormData(e.currentTarget).entries());
 state.settings.reminders=d.reminders==='1';
 state.settings.reminderDays=Math.max(0,+d.reminderDays||0);
 state.settings.morningReminder=d.morningReminder==='1';
 state.settings.morningReminderTime=d.morningReminderTime||'07:00';
 state.settings.nightReminder=d.nightReminder==='1';
 state.settings.nightReminderTime=d.nightReminderTime||'22:00';
 save();closeModal();render();
}


function downloadBackup(){
 const blob=new Blob([JSON.stringify({format:'RUTIN-BACKUP-V3',created:new Date().toISOString(),state},null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`RUTIN-YEDEK-${iso()}.rutin`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
function restoreBackup(e){
 const f=e.target.files?.[0];if(!f)return;
 const r=new FileReader();r.onload=()=>{try{const p=JSON.parse(r.result);if(p.format!=='RUTIN-BACKUP-V3'||!p.state)throw new Error('GEÇERSİZ YEDEK');state=p.state;save();location.reload()}catch(err){alert('YEDEK AÇILAMADI: '+err.message)}};r.readAsText(f)
}
function importData(e){
 const f=e.target.files?.[0];if(!f)return;
 const r=new FileReader();
 r.onload=()=>{
  try{
   const p=JSON.parse(r.result);
   const incoming=p?.state||p;
   if(!incoming || typeof incoming!=='object')throw new Error('GEÇERSİZ VERİ DOSYASI');
   state=incoming;
   save();
   e.target.value='';
   alert('VERİLER GERİ YÜKLENDİ. RUTİN YENİDEN AÇILIYOR.');
   location.reload();
  }catch(err){
   e.target.value='';
   alert('VERİ GERİ YÜKLENEMEDİ: '+(err?.message||err));
  }
 };
 r.readAsText(f);
}
function exportData(){
 const payload={format:'RUTIN-DATA-V6',created:new Date().toISOString(),state};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download=`RUTIN-VERI-${iso()}.json`;
 a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function dailyReminderMessageRaw(){
 const now=new Date();
 const hh=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
 const today=iso();
 const todaysWork=state.work.some(x=>x.date===today);
 const todaysExpense=state.expenses.some(x=>x.date===today);
 const msgs=[];
 if(state.settings.morningReminder && hh>=state.settings.morningReminderTime && hh<'12:00'){
   msgs.push('BUGÜNKÜ ÇALIŞMA VE HARCAMA KAYITLARINI EKLEMEYİ UNUTMA.');
 }
 if(state.settings.nightReminder && hh>=state.settings.nightReminderTime){
   if(!(todaysWork && todaysExpense)){
     msgs.push('BUGÜNÜ KAPATMADAN ÇALIŞMA, MESAİ VE HARCAMALARINI KONTROL ET.');
   }
 }
 return msgs;
}
function dailyReminderMessage(){return dailyReminderMessageRaw()}
function reminderItems(){return reminderItemsRaw()}
function dailyReminderBanner(){
 const a=dailyReminderMessage();if(!a.length)return'';
 return `<div class="reminderBanner dailyReminder"><b>◔ GÜNLÜK HATIRLATMA</b>${a.map(x=>`<span>${x}</span>`).join('')}</div>`;
}
function reminderItemsRaw(){
 if(!state.settings.reminders)return[];
 const today=new Date(iso()+'T12:00:00'),days=state.settings.reminderDays||0,all=[
  ...state.cards.filter(x=>x.dueDate).map(x=>({name:x.name,date:x.dueDate,type:'KART'})),
  ...state.flexAccounts.filter(x=>x.dueDate).map(x=>({name:x.name,date:x.dueDate,type:'ESNEK HESAP'}))
 ];
 return all.filter(x=>{const d=new Date(x.date+'T12:00:00'),diff=Math.ceil((d-today)/86400000);return diff>=0&&diff<=days})
}

let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='hidden'){
    hiddenAt=Date.now();
    return;
  }
  if(document.visibilityState==='visible'){
    if(state.settings.lock && hiddenAt && (Date.now()-hiddenAt)>=15000){
      unlocked=false;
      modal=null;
      render();
    }
    hiddenAt=0;
  }
});
window.addEventListener('pagehide',()=>{
  cropState.dragging=false;
},{passive:true});
applyTheme();
applyAppearance();
render();
if('serviceWorker' in navigator){
  let swRefreshing=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{
    if(swRefreshing) return;
    swRefreshing=true;
    location.reload();
  });
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('./sw.js?v=43.16.9.1-stable',{updateViaCache:'none'}).then(reg=>{
      const activateWaiting=()=>{
        if(reg.waiting) reg.waiting.postMessage({type:'SKIP_WAITING'});
      };
      activateWaiting();
      reg.addEventListener('updatefound',()=>{
        const worker=reg.installing;
        if(!worker) return;
        worker.addEventListener('statechange',()=>{
          if(worker.state==='installed' && navigator.serviceWorker.controller){
            worker.postMessage({type:'SKIP_WAITING'});
          }
        });
      });
      reg.update().catch(()=>{});
    }).catch(()=>{});
  });
}
