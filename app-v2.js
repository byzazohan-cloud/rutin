
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY',maximumFractionDigits:0}).format(+n||0);
const iso=(d=new Date())=>{let z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)};
const ym=(d=new Date())=>iso(d).slice(0,7);
const uid=()=>crypto.randomUUID?.()||Date.now()+Math.random().toString(16).slice(2);
const upper=s=>String(s||'').toLocaleUpperCase('tr-TR');

const defaults={
 profile:{name:'ZAZOHAN',motto:'KÜÇÜK ADIMLAR, BÜYÜK ÖZGÜRLÜKLER GETİRİR.',photo:''},
 settings:{dailyRate:1250,hourlyRate:200,overtimeRate:250,pin:'',lock:false},
 work:[],expenses:[],incomes:[],notes:[],investments:[],
 accounts:{card:{name:'KREDİ KARTI',balance:0,limit:0},flex:{name:'ESNEK HESAP',balance:0,limit:0},cash:{name:'NAKİT',balance:0}},
 categories:['YOL','YEMEK','MARKET','FATURA','KİRA','SAĞLIK','ULAŞIM','EĞLENCE','YAKIT','GİYİM','DİĞER']
};
let state=JSON.parse(localStorage.getItem('rutin-v2')||'null')||structuredClone(defaults);
let screen='home', modal=null, reportPeriod='month';

function save(){localStorage.setItem('rutin-v2',JSON.stringify(state))}
function monthItems(a){return a.filter(x=>x.date?.startsWith(ym()))}
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
function header(title='RUTİN',back=false){
 return `<div class="topbar"><button class="iconBtn" onclick="${back?"go('home')":"openModal('menu')"}">${back?'‹':'☰'}</button><div class="title">${title}</div><button class="iconBtn" onclick="openModal('profile')">●</button></div>`;
}
function profileLine(){
 return `<div class="profileLine"><div class="avatar">${state.profile.photo?`<img src="${state.profile.photo}">`:(state.profile.name||'R')[0]}</div><div><small>MERHABA</small><b>${state.profile.name}</b><div class="dateLine">${new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div></div></div>`;
}
function home(){
 const T=monthlyTotals(),W=workSummary();
 return `${header()}${profileLine()}
 <div class="heroMsg"><b>GÜNAYDIN!</b><br>${state.profile.motto}</div>
 <div class="stats">
   <div class="stat"><small>BUGÜNKÜ GELİR</small><strong class="green">${money(todayIncome())}</strong></div>
   <div class="stat"><small>BUGÜNKÜ HARCAMA</small><strong class="red">${money(todayExpense())}</strong></div>
   <div class="stat"><small>BU AY GELİR</small><strong class="green">${money(T.income)}</strong></div>
   <div class="stat"><small>BU AY HARCAMA</small><strong class="red">${money(T.expense)}</strong></div>
 </div>
 <div class="section"><b>HIZLI İŞLEMLER</b></div>
 <div class="quick">
   <button onclick="openModal('income')"><i>＋</i>GELİR EKLE</button>
   <button onclick="openModal('expense')"><i>−</i>HARCAMA</button>
   <button onclick="openModal('daily')"><i>✓</i>ÇALIŞTIM</button>
   <button onclick="openModal('hourly')"><i>◷</i>SAATLİK</button>
   <button onclick="openModal('overtime')"><i>★</i>MESAİ</button>
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
 <div class="account goldBorder"><div class="accountHead"><b>KREDİ KARTI</b><span>›</span></div><strong>${money(state.accounts.card.balance)}</strong><small>LİMİT: ${money(state.accounts.card.limit)}</small></div>
 <div class="account"><div class="accountHead"><b>ESNEK HESAP</b><span>›</span></div><strong>${money(state.accounts.flex.balance)}</strong><small>KULLANILABİLİR: ${money(Math.max(0,state.accounts.flex.limit-state.accounts.flex.balance))}</small></div>
 <div class="account"><div class="accountHead"><b>NAKİT</b><span>›</span></div><strong>${money(state.accounts.cash.balance)}</strong></div>
 <div class="account"><div class="accountHead"><b>YATIRIMLAR</b><span onclick="go('investments')">›</span></div><strong class="green">${money(state.investments.reduce((a,x)=>a+x.amount,0))}</strong><small>TOPLAM DEĞER</small></div>
 <div class="section"><b>HIZLI İŞLEMLER</b></div><div class="quick" style="grid-template-columns:repeat(4,1fr)">
 <button onclick="openModal('expense')"><i>−</i>HARCAMA</button><button onclick="openModal('income')"><i>＋</i>GELİR</button><button onclick="openModal('accounts')"><i>▣</i>HESAPLAR</button><button onclick="go('investments')"><i>↗</i>YATIRIM</button>
 </div>`;
}
function calendarScreen(){
 const d=new Date(),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7;
 let cells='';for(let i=0;i<offset;i++)cells+='<div></div>';
 for(let n=1;n<=days;n++){
  const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
  const w=state.work.filter(x=>x.date===ds);
  const cl=w.some(x=>x.type==='overtime')?'overtime':w.some(x=>x.type==='hourly')?'hourly':w.some(x=>x.type==='daily')?'daily':'off';
  cells+=`<div class="day ${cl}">${n}</div>`;
 }
 const W=workSummary();
 return `${header('TAKVİM',true)}
 <div class="section"><b>${d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase()}</b></div>
 <div class="card"><div class="calendarHead">${['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar">${cells}</div>
 <div class="legend"><span><i style="background:#2f7148"></i>GÜNLÜK</span><span><i style="background:#2d587c"></i>SAATLİK</span><span><i style="background:#7b6128"></i>MESAİ</span><span><i style="background:#333"></i>ÇALIŞMADIM</span></div></div>
 <div class="section"><b>AYLIK ÖZET</b></div><div class="summaryBox">
 ${sumRow('ÇALIŞILAN GÜN',W.daily+' GÜN')}
 ${sumRow('SAATLİK ÇALIŞMA',W.hourlyDays+' GÜN / '+W.hourlyHours+' SAAT')}
 ${sumRow('MESAİ',W.overtimeDays+' GÜN / '+W.overtimeHours+' SAAT')}
 </div>`;
}
function reports(){
 const T=monthlyTotals(),W=workSummary();
 return `${header('RAPORLAR',true)}
 <div class="tabs"><button onclick="reportPeriod='day';render()">GÜNLÜK</button><button onclick="reportPeriod='week';render()">HAFTALIK</button><button class="active">AYLIK</button><button onclick="reportPeriod='year';render()">YILLIK</button><button onclick="openModal('range')">TARİH ARALIĞI</button></div>
 <div class="reportGrid"><div class="reportBox"><small>TOPLAM GELİR</small><strong class="green">${money(T.income)}</strong></div><div class="reportBox"><small>TOPLAM HARCAMA</small><strong class="red">${money(T.expense)}</strong></div><div class="reportBox"><small>NET KAZANÇ</small><strong>${money(T.net)}</strong></div></div>
 <div class="section"><b>ÇALIŞMA ÖZETİ</b><span onclick="go('detail')">DETAYLI RAPOR ›</span></div>
 <div class="summaryBox">${sumRow('GÜNLÜK ÇALIŞILAN',W.daily+' GÜN')}${sumRow('SAATLİK ÇALIŞMA',W.hourlyHours+' SAAT')}${sumRow('MESAİ',W.overtimeHours+' SAAT')}${sumRow('YOL MASRAFI',money(T.road))}</div>
 <div class="section"><b>HARCAMA DAĞILIMI</b></div><div class="card"><div class="donut"></div><div class="legend"><span><i style="background:#49d17d"></i>YEMEK</span><span><i style="background:#5ea6ff"></i>ULAŞIM</span><span><i style="background:#f2aa4c"></i>MARKET</span><span><i style="background:#ff5b62"></i>DİĞER</span></div></div>`;
}
function detailReport(){
 const T=monthlyTotals(),W=workSummary();
 return `${header('DETAYLI RAPOR',true)}
 <div class="tabs"><button class="active">GÜNLÜK</button><button>HAFTALIK</button><button>AYLIK</button><button>YILLIK</button><button onclick="openModal('range')">TARİH ARALIĞI</button></div>
 <div class="summaryBox">${sumRow('ÇALIŞILAN GÜN',W.daily+'')}${sumRow('SAATLİK ÇALIŞILAN GÜN',W.hourlyDays+'')}${sumRow('MESAİ YAPILAN GÜN',W.overtimeDays+'')}${sumRow('TOPLAM SAATLİK ÇALIŞMA',W.hourlyHours+' SAAT')}${sumRow('TOPLAM MESAİ',W.overtimeHours+' SAAT')}</div>
 <div class="section"><b>FİNANSAL ÖZET</b></div>
 <div class="summaryBox">${sumRow('TOPLAM GELİR',money(T.income))}${sumRow('TOPLAM HARCAMA',money(T.expense))}${sumRow('YOL GİDERİ',money(T.road))}${sumRow('NET KAZANÇ',money(T.net))}</div>
 <div class="section"><b>GRAFİK</b></div><div class="card"><div class="chartBars"><div class="bar g" style="height:${Math.min(100,T.income/100)}%"></div><div class="bar r" style="height:${Math.min(100,T.expense/100)}%"></div><div class="bar o" style="height:${Math.min(100,W.overtimeHours*10)}%"></div></div><div class="legend"><span><i style="background:#4bb874"></i>GELİR</span><span><i style="background:#d8575c"></i>HARCAMA</span><span><i style="background:#c08c38"></i>MESAİ</span></div></div>`;
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
 <div class="card profileCard"><div class="avatar">${state.profile.photo?`<img src="${state.profile.photo}">`:(state.profile.name||'R')[0]}</div><h2>${state.profile.name}</h2><small>${state.profile.motto}</small></div>
 <div class="card">
 ${setting('ÜCRET AYARLARI',money(state.settings.dailyRate))}
 ${setting('SAATLİK ÜCRET',money(state.settings.hourlyRate))}
 ${setting('MESAİ ÜCRETİ',money(state.settings.overtimeRate))}
 ${setting('HESAPLARIM','›')}
 ${setting('YEDEKLEME / GERİ YÜKLE','›')}
 ${setting('UYGULAMA KİLİDİ',state.settings.lock?'AÇIK':'KAPALI')}
 ${setting('TEMA','SİYAH GOLD')}
 </div><button class="primary" onclick="openModal('profile')">PROFİLİ DÜZENLE</button>`;
}
function settings(){
 return `${header('AYARLAR',true)}<div class="card">
 ${setting('PROFİL','›')}${setting('KATEGORİLER','›')}${setting('HESAPLAR','›')}${setting('YEDEKLEME / GERİ YÜKLE','›')}${setting('TEMA','SİYAH GOLD')}${setting('HATIRLATICILAR','›')}${setting('UYGULAMA KİLİDİ',state.settings.lock?'AÇIK':'KAPALI')}${setting('VERİ DIŞA AKTAR','›')}${setting('HAKKINDA','›')}
 </div>`;
}
function setting(a,b){return `<div class="setting"><div>•</div><b>${a}</b><span>${b}</span></div>`}
function sumRow(a,b){return `<div class="summaryRow"><div><b>${a}</b></div><strong>${b}</strong></div>`}
function field(n,l,v='',t='text'){return `<div class="field"><label>${l}</label><input name="${n}" type="${t}" value="${v}"></div>`}
function textarea(n,l){return `<div class="field"><label>${l}</label><textarea name="${n}"></textarea></div>`}
function expenseScreen(){
 return `${header('KAYIT EKLE',true)}<div class="workChoice"><button class="active">HARCAMA</button><button onclick="openModal('income')">GELİR</button></div>${expenseForm()}`;
}
function expenseForm(){return `<form onsubmit="submitExpense(event)">
 ${field('amount','TUTAR',0,'number')}
 <div class="field"><label>KATEGORİ</label><select name="category">${state.categories.map(x=>`<option>${x}</option>`).join('')}</select></div>
 <div class="field"><label>HESAPTAN</label><select name="method"><option>NAKİT</option><option>KREDİ KARTI</option><option>ESNEK HESAP</option></select></div>
 ${field('date','TARİH',iso(),'date')}
 ${textarea('note','NOT (İSTEĞE BAĞLI)')}
 <button class="primary">KAYDET</button></form>`}
function nav(){
 const items=[['home','⌂','ANA SAYFA'],['work','⌁','İŞ/ÇALIŞMA'],['finance','₺','FİNANS'],['reports','▥','RAPORLAR'],['more','•••','DAHA FAZLA']];
 return `<div class="nav">${items.map(x=>`<button class="${screen===x[0]?'active':''}" onclick="go('${x[0]}')"><i>${x[1]}</i>${x[2]}</button>`).join('')}</div>`;
}
function render(){
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
 else if(screen==='more')content=`${header('DAHA FAZLA',true)}<div class="card">${setting('TAKVİM','›')}${setting('YATIRIMLAR','›')}${setting('NOTLAR','›')}${setting('PROFİL','›')}${setting('AYARLAR','›')}</div><div class="quick" style="grid-template-columns:repeat(2,1fr)"><button onclick="go('calendar')"><i>▦</i>TAKVİM</button><button onclick="go('investments')"><i>↗</i>YATIRIM</button><button onclick="go('notes')"><i>✎</i>NOTLAR</button><button onclick="go('profile')"><i>●</i>PROFİL</button></div>`;
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
function submitAccounts(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.accounts.card.balance=+d.cardBalance||0;state.accounts.card.limit=+d.cardLimit||0;state.accounts.flex.balance=+d.flexBalance||0;state.accounts.flex.limit=+d.flexLimit||0;state.accounts.cash.balance=+d.cash||0;save();closeModal();render()}
function submitProfile(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.profile.name=upper(d.name||'ZAZOHAN');state.profile.motto=upper(d.motto||'');state.settings.dailyRate=+d.dailyRate||0;state.settings.hourlyRate=+d.hourlyRate||0;state.settings.overtimeRate=+d.overtimeRate||0;save();closeModal();render()}

render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
