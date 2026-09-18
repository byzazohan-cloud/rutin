
/* ===== clean_v2_upgrade.js ===== */
/* RUTİN CLEAN V2 — 12 maddelik kilit paket yükseltmesi */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const catMeta={
 'YOL':['⌁','road'], 'YEMEK':['◉','food'], 'MARKET':['▣','market'], 'FATURA':['▤','bill'], 'KİRA':['⌂','rent'],
 'SAĞLIK':['♡','health'], 'ULAŞIM':['◈','transport'], 'EĞLENCE':['★','fun'], 'YAKIT':['◒','fuel'], 'GİYİM':['♢','wear'],
 'HARÇLIK':['₺','allowance'], 'FIRIN':['♨','bakery'], 'DİĞER':['•••','other']
};
function migrate(){
 state.work=Array.isArray(state.work)?state.work:[]; state.expenses=Array.isArray(state.expenses)?state.expenses:[];
 state.incomes=Array.isArray(state.incomes)?state.incomes:[]; state.investments=Array.isArray(state.investments)?state.investments:[];
 state.cards=Array.isArray(state.cards)?state.cards:[]; state.flexAccounts=Array.isArray(state.flexAccounts)?state.flexAccounts:[];
 state.manualReminders=Array.isArray(state.manualReminders)?state.manualReminders:[];
 state.reminderDismissed=state.reminderDismissed&&typeof state.reminderDismissed==='object'?state.reminderDismissed:{};
 state.cashTransactions=Array.isArray(state.cashTransactions)?state.cashTransactions:[];
 state.accounts=state.accounts||{}; state.accounts.cash=state.accounts.cash||{name:'NAKİT',balance:0};
 if(!state.cashTransactions.length && (+state.accounts.cash.balance||0)!==0) state.cashTransactions.push({id:uid(),type:'add',amount:+state.accounts.cash.balance||0,title:'DEVREDEN NAKİT',date:iso()});
 state.categories=Array.from(new Set([...(Array.isArray(state.categories)?state.categories:[]),'YOL','YEMEK','MARKET','FATURA','KİRA','SAĞLIK','ULAŞIM','EĞLENCE','YAKIT','GİYİM','HARÇLIK','FIRIN','DİĞER']));
 state.cards.forEach(c=>{c.transactions=Array.isArray(c.transactions)?c.transactions:[]; c.statementDate=c.statementDate||''; c.dueDate=c.dueDate||'';});
 state.flexAccounts.forEach(c=>{c.transactions=Array.isArray(c.transactions)?c.transactions:[]; c.statementDate=c.statementDate||''; c.dueDate=c.dueDate||'';});
 // Eski çalışma-yol kayıtlarını mümkün olduğunca ilgili işe bağla.
 state.work.forEach(w=>{
   if(w.roadExpenseId && !state.expenses.some(e=>e.id===w.roadExpenseId)) w.roadExpenseId='';
   if(!w.roadExpenseId){
     const r=state.expenses.find(e=>!e.workId&&e.date===w.date&&(e.category==='YOL'||e.title==='YOL')&&String(e.note||'').includes('ÇALIŞMA YOL'));
     if(r){r.workId=w.id;w.roadExpenseId=r.id;}
   }
 });
 save();
}
migrate();

function workAmount(x){return x.type==='daily'?(+x.amount||state.settings.dailyRate):(+x.hours||0)*(+x.rate||0)}
function roadForWork(id){return state.expenses.find(e=>e.workId===id && (e.category==='YOL'||e.sourceType==='workRoad'))||null}
function expenseMeta(x){return catMeta[x.category]||catMeta['DİĞER']}
function actionButtons(kind,id,ds=''){
 const edit=`openModal('editRecord:${kind}:${id}${ds?':'+ds:''}')`;
 const del=`deleteRecord('${kind}','${id}','${ds}')`;
 return `<div class="rowActions"><button class="miniEdit" onclick="${edit}">DÜZENLE</button><button class="miniDelete" onclick="${del}">SİL</button></div>`;
}

header=function(title='RUTİN',back=false){
 return `<div class="topbar premiumTopbar">
   <button class="iconBtn luxuryIconBtn" onclick="${back?"go('home')":"openModal('menu')"}">${back?'‹':'☰'}</button>
   <div class="title brandTitle">${title==='RUTİN'?`${rutinLogo(30)}<span>RUTİN</span>`:title}</div>
   <div class="topRightStack"><button class="iconBtn luxuryIconBtn settingsOnly" onclick="go('settings')" aria-label="Ayarlar"><span class="settingsGearV27">⚙</span></button><button class="iconBtn luxuryIconBtn reminderTopBtn" onclick="openModal('reminderCenter')" aria-label="Hatırlatma">◔</button></div>
 </div>`;
};

function activeReminders(){
 const out=[], today=iso(), todayD=new Date(today+'T12:00:00'), days=state.settings.reminderDays||2;
 for(const c of state.cards){if(c.dueDate){const diff=Math.ceil((new Date(c.dueDate+'T12:00:00')-todayD)/86400000);const id=`card:${c.id}:${c.dueDate}`;if(diff>=0&&diff<=days&&!state.reminderDismissed[id])out.push({id,title:`${c.name} SON ÖDEME`,detail:`${c.dueDate} · ${money(c.balance)}`,kind:'payment'});}}
 for(const c of state.flexAccounts){if(c.dueDate){const diff=Math.ceil((new Date(c.dueDate+'T12:00:00')-todayD)/86400000);const id=`flex:${c.id}:${c.dueDate}`;if(diff>=0&&diff<=days&&!state.reminderDismissed[id])out.push({id,title:`${c.name} ÖDEME`,detail:`${c.dueDate} · ${money(c.balance)}`,kind:'payment'});}}
 const hasWork=state.work.some(x=>x.date===today), hasExpense=state.expenses.some(x=>x.date===today);
 const autoId=`daily:${today}`;
 if(!state.reminderDismissed[autoId]&&(!hasWork||!hasExpense))out.push({id:autoId,title:'BUGÜNÜ TAMAMLA',detail:`${!hasWork?'Çalışma kaydı eksik. ':''}${!hasExpense?'Harcama kaydını kontrol et.':''}`,kind:'task'});
 for(const r of state.manualReminders.filter(x=>!x.done)){
   if(!r.date||r.date<=today)out.push({id:`manual:${r.id}`,title:r.title,detail:r.date||'MANUEL HATIRLATMA',kind:'manual',rid:r.id});
 }
 return out;
}
function reminderCards(){const a=activeReminders();if(!a.length)return'';return `<div class="homeReminderStack">${a.slice(0,3).map(r=>`<div class="homeReminderCard"><div><b>${esc(r.title)}</b><small>${esc(r.detail)}</small></div><div class="reminderActions"><button onclick="completeReminder('${r.id}','${r.rid||''}')">${r.kind==='payment'?'ÖDEDİM':'YAPTIM'}</button><button onclick="dismissReminder('${r.id}')">×</button></div></div>`).join('')}</div>`}
completeReminder=function(id,rid=''){if(rid){const r=state.manualReminders.find(x=>x.id===rid);if(r)r.done=true;}state.reminderDismissed[id]=true;save();render()}
dismissReminder=function(id){state.reminderDismissed[id]=true;save();render()}
submitManualReminder=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());state.manualReminders.push({id:uid(),title:upper(d.title||'HATIRLATMA'),date:d.date||iso(),done:false});save();modal='reminderCenter';render()}
deleteManualReminder=function(id){state.manualReminders=state.manualReminders.filter(x=>x.id!==id);save();modal='reminderCenter';render()}

home=function(){
 const T=monthlyTotals();
 return `${header()}${profileLine()}${reminderCards()}
 <div class="heroMsg"><b>${greetingByTime()}!</b><br>${dailyQuote()}</div>
 <div class="stats"><div class="stat"><small>BUGÜNKÜ GELİR</small><strong class="green">${money(todayIncome())}</strong></div><div class="stat"><small>BUGÜNKÜ HARCAMA</small><strong class="red">${money(todayExpense())}</strong></div><div class="stat"><small>BU AY GELİR</small><strong class="green">${money(T.income)}</strong></div><div class="stat"><small>BU AY HARCAMA</small><strong class="red">${money(T.expense)}</strong></div></div>
 <div class="section"><b>HIZLI İŞLEMLER</b></div><div class="quick quickPremium quickSix">
 <button onclick="openModal('income')"><i class="luxGlyph">＋</i><span>GELİR EKLE</span></button><button onclick="go('expenses')"><i class="luxGlyph">▤</i><span>HARCAMALAR</span></button><button onclick="openModal('daily')"><i class="luxGlyph">✓</i><span>ÇALIŞTIM</span></button><button onclick="go('notes')"><i class="luxGlyph">✦</i><span>NOTLAR</span></button><button onclick="go('investments')"><i class="luxGlyph">◇</i><span>YATIRIM</span></button><button onclick="go('finance')"><i class="luxGlyph">▣</i><span>FİNANS</span></button></div>
 <div class="section"><b>BUGÜNÜN ÖZETİ</b><span onclick="openModal('day:${iso()}')">AÇ / DÜZENLE ›</span></div>
 <div class="summaryBox clickableSummary" onclick="openModal('day:${iso()}')">
 ${sumRow('ÇALIŞMA',state.work.filter(x=>x.date===iso()&&x.type==='daily').length+' GÜN')}${sumRow('SAATLİK',state.work.filter(x=>x.date===iso()&&x.type==='hourly').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('MESAİ',state.work.filter(x=>x.date===iso()&&x.type==='overtime').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('TOPLAM KAZANÇ',money(todayIncome()))}${sumRow('TOPLAM HARCAMA',money(todayExpense()))}</div>`;
};

function expenseFormFor(x=null){
 const sel=x?.category||'YOL';
 return `<form onsubmit="${x?`submitEditExpense(event,'${x.id}')`:'submitExpense(event)'}">${field('amount','TUTAR',x?.amount||0,'number')}
 <div class="field"><label>KATEGORİ</label><div class="categoryIcons">${Object.entries(catMeta).map(([c,[i,cl]])=>`<label class="catChip ${cl}"><input type="radio" name="category" value="${c}" ${c===sel?'checked':''} onchange="toggleOtherName(this.form)"><i>${i}</i><span>${c}</span></label>`).join('')}</div></div>
 <div class="field otherNameField" style="${sel==='DİĞER'?'':'display:none'}"><label>HARCAMA ADI</label><input name="customTitle" value="${esc(x?.customTitle||((x?.category==='DİĞER'&&x?.title!=='DİĞER')?x.title:''))}" placeholder="ÖRN. TAMİRAT"></div>
 <div class="field"><label>HESAPTAN</label><div class="payIcons"><label><input type="radio" name="method" value="NAKİT" ${(x?.method||'NAKİT')==='NAKİT'?'checked':''}><i>₺</i><span>NAKİT</span></label><label><input type="radio" name="method" value="KREDİ KARTI" ${x?.method==='KREDİ KARTI'?'checked':''}><i>▣</i><span>KREDİ KARTI</span></label><label><input type="radio" name="method" value="ESNEK HESAP" ${x?.method==='ESNEK HESAP'?'checked':''}><i>▥</i><span>ESNEK HESAP</span></label></div></div>
 ${field('date','TARİH',x?.date||iso(),'date')}<div class="field"><label>NOT</label><textarea name="note">${esc(x?.note||'')}</textarea></div><button class="primary">${x?'DEĞİŞİKLİĞİ KAYDET':'HARCAMAYI KAYDET'}</button></form>`;
}
toggleOtherName=function(f){const v=f.querySelector('[name=category]:checked')?.value;const el=f.querySelector('.otherNameField');if(el)el.style.display=v==='DİĞER'?'block':'none'}
expenseForm=function(){return expenseFormFor(null)};
submitExpense=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const category=d.category||'DİĞER',title=category==='DİĞER'?upper(d.customTitle||'DİĞER'):category;state.expenses.push({id:uid(),date:d.date,title,customTitle:category==='DİĞER'?title:'',amount:+d.amount||0,category,method:d.method||'NAKİT',note:d.note||''});save();modal=null;screen='expenses';render()};
submitEditExpense=function(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const x=state.expenses.find(z=>z.id===id);if(!x)return;const oldAmount=+x.amount||0,category=d.category||'DİĞER';Object.assign(x,{date:d.date,category,title:category==='DİĞER'?upper(d.customTitle||'DİĞER'):category,customTitle:category==='DİĞER'?upper(d.customTitle||''):'' ,amount:+d.amount||0,method:d.method||'NAKİT',note:d.note||''});if(x.sourceType==='card'&&x.cardId&&x.sourceId){const c=state.cards.find(z=>z.id===x.cardId),t=c?.transactions?.find(z=>z.id===x.sourceId);if(c&&t){c.balance=(+c.balance||0)+((+x.amount||0)-oldAmount);Object.assign(t,{title:x.title,amount:x.amount,date:x.date});}}save();closeModal();render()};
expensesScreen=function(){const a=state.expenses.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));return `${header('HARCAMALAR',true)}<div class="expenseHero"><div><small>BU AY HARCAMA</small><strong class="red">${money(monthItems(state.expenses).reduce((n,x)=>n+(+x.amount||0),0))}</strong></div><button class="premiumAddBtn" onclick="openModal('expense')"><i>＋</i><span>HARCAMA EKLE</span></button></div><div class="section"><b>HARCAMA DETAYLARI</b></div><div class="card list expenseList">${a.length?a.map(x=>{const [ic,cl]=expenseMeta(x);return `<div class="item expenseItem"><div class="ico expenseIco ${cl}">${ic}</div><div><b>${esc(x.title||x.category)}</b><small>${x.date} · ${esc(x.method||'NAKİT')}</small></div><div class="expenseRight"><div class="amt red">-${money(x.amount)}</div>${actionButtons('expense',x.id,x.date)}</div></div>`}).join(''):'<div class="notice">HENÜZ HARCAMA YOK.</div>'}</div>`};

function roadFields(x){const r=roadForWork(x.id);return `<div class="field"><label>YOL PARASI</label><div class="choiceRow"><label><input type="radio" name="road" value="yes" ${r?'checked':''}>ÖDEDİM</label><label><input type="radio" name="road" value="no" ${!r?'checked':''}>ÖDEMEDİM</label></div></div>${field('roadAmount','YOL TUTARI',r?.amount||0,'number')}`}
function syncRoad(work,d){let r=roadForWork(work.id);const want=d.road==='yes'&&(+d.roadAmount||0)>0;if(want){if(!r){r={id:uid(),workId:work.id,sourceType:'workRoad',category:'YOL',title:'YOL',method:'NAKİT',note:'ÇALIŞMA YOL MASRAFI'};state.expenses.push(r);}Object.assign(r,{date:work.date,amount:+d.roadAmount||0,workId:work.id});work.roadExpenseId=r.id;}else if(r){state.expenses=state.expenses.filter(e=>e.id!==r.id);work.roadExpenseId='';}}
submitDaily=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const w={id:uid(),type:'daily',date:d.date,title:upper(d.title||'ANA İŞ'),amount:+d.amount||0,note:d.note||''};state.work.push(w);syncRoad(w,d);save();closeModal();render()};
submitHourly=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const w={id:uid(),type:'hourly',date:d.date,title:upper(d.title||'EK İŞ'),hours:+d.hours||0,rate:+d.rate||0,amount:(+d.hours||0)*(+d.rate||0),note:d.note||''};state.work.push(w);syncRoad(w,d);save();closeModal();render()};
submitOvertime=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const w={id:uid(),type:'overtime',date:d.date,title:upper(d.title||'MESAİ'),hours:+d.hours||0,rate:+d.rate||0,amount:(+d.hours||0)*(+d.rate||0),note:d.note||''};state.work.push(w);save();closeModal();render()};
submitEditWork=function(e,id,fromDs=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const w=state.work.find(x=>x.id===id);if(!w)return;w.date=d.date;w.title=upper(d.title||w.title);w.note=d.note||'';if(w.type==='daily')w.amount=+d.amount||0;else{w.hours=+d.hours||0;w.rate=+d.rate||0;w.amount=w.hours*w.rate;}if(w.type!=='overtime')syncRoad(w,d);save();modal=`day:${w.date}`;render()};
deleteWork=function(id,ds=''){const r=roadForWork(id);state.work=state.work.filter(x=>x.id!==id);if(r)state.expenses=state.expenses.filter(x=>x.id!==r.id);save();modal=ds?`day:${ds}`:null;render()};
workRows=function(type){const a=state.work.filter(x=>x.type===type).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,12);return a.length?a.map(x=>{const r=roadForWork(x.id);return `<div class="workRecord"><div class="item"><div class="ico">${type==='daily'?'✓':type==='hourly'?'◷':'★'}</div><div><b>${esc(x.title)}</b><small>${x.date}${x.hours?' · '+x.hours+' SAAT':''}</small></div><div class="amt gold">${money(workAmount(x))}</div></div>${r?`<div class="roadSub"><span>⌁ YOL ÜCRETİ · ${r.date}</span><b>${money(r.amount)}</b></div>`:''}<div class="recordActions">${actionButtons('work',x.id,x.date)}</div></div>`}).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>'};

function dayItems(ds){
 const items=[]; state.work.filter(x=>x.date===ds).forEach(x=>items.push({k:'work',x}));
 state.expenses.filter(x=>x.date===ds&&!x.workId).forEach(x=>items.push({k:'expense',x}));
 state.incomes.filter(x=>x.date===ds).forEach(x=>items.push({k:'income',x}));
 return items;
}
function dayModal(ds){const items=dayItems(ds);return `<div class="notice">BU GÜNÜN İŞ, MESAİ, HARCAMA, GELİR VE YOL KAYITLARINI BURADAN DÜZENLEYEBİLİRSİN.</div><div class="quick dayQuick"><button onclick="openModal('dailyDate:${ds}')"><i class="luxGlyph">✓</i>GÜNLÜK</button><button onclick="openModal('hourlyDate:${ds}')"><i class="luxGlyph">◷</i>SAATLİK</button><button onclick="openModal('overtimeDate:${ds}')"><i class="luxGlyph">✦</i>MESAİ</button><button onclick="openModal('expenseDate:${ds}')"><i class="luxGlyph">▤</i>HARCAMA</button></div><div class="card list dayFullList">${items.length?items.map(({k,x})=>{if(k==='work'){const r=roadForWork(x.id);return `<div class="dayRecord"><div class="item"><div class="ico">${x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'}</div><div><b>${esc(x.title)}</b><small>${x.type.toUpperCase()}${x.hours?' · '+x.hours+' SAAT':''}</small></div><div class="amt gold">${money(workAmount(x))}</div></div>${r?`<div class="roadSub"><span>⌁ YOL GİDERİ</span><b class="red">-${money(r.amount)}</b></div>`:''}${actionButtons('work',x.id,ds)}</div>`;} const [ic,cl]=k==='expense'?expenseMeta(x):['＋','income'];return `<div class="dayRecord"><div class="item"><div class="ico expenseIco ${cl}">${ic}</div><div><b>${esc(x.title)}</b><small>${k==='expense'?esc(x.category):'GELİR'}</small></div><div class="amt ${k==='expense'?'red':'green'}">${k==='expense'?'-':'+'}${money(x.amount)}</div></div>${actionButtons(k,x.id,ds)}</div>`}).join(''):'<div class="notice">BU GÜNDE KAYIT YOK.</div>'}</div>`}

calendarScreen=function(){
 const d=new Date(calendarCursor),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7;let cells='';for(let i=0;i<offset;i++)cells+='<div class="daySpacer premiumDaySpacer"></div>';
 for(let n=1;n<=days;n++){const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`,w=state.work.filter(x=>x.date===ds),e=state.expenses.some(x=>x.date===ds),inc=state.incomes.some(x=>x.date===ds),daily=w.some(x=>x.type==='daily'),hourly=w.some(x=>x.type==='hourly'),ot=w.some(x=>x.type==='overtime'),cls=daily?' daily':ot?' overtime':hourly?' hourly':e?' financeDay':inc?' incomeDay':' off',mark=daily?'▣':ot?'◷':hourly?'⌁':e?'●':inc?'＋':'';cells+=`<button class="day premiumDay${cls}${ds===iso()?' today':''}" onclick="openModal('day:${ds}')"><span class="dayNumber">${n}</span>${mark?`<span class="dayWorkIcon">${mark}</span>`:''}</button>`;}
 const prefix=`${y}-${String(m+1).padStart(2,'0')}`,mw=state.work.filter(x=>x.date?.startsWith(prefix)),me=state.expenses.filter(x=>x.date?.startsWith(prefix)),dn=mw.filter(x=>x.type==='daily').length,hn=mw.filter(x=>x.type==='hourly').length,on=mw.filter(x=>x.type==='overtime').length,road=me.filter(x=>x.workId||x.sourceType==='workRoad'||(x.category==='YOL'&&(x.title==='YOL'||String(x.note||'').includes('ÇALIŞMA YOL')))).reduce((a,x)=>a+(+x.amount||0),0),mn=d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'});
 return `${header('TAKVİM',true)}<div class="calendarBrandLine"><span class="calendarCrown">♛</span><div><b>RUTİN TAKVİM</b><small>PLANLA · KAYDET · BAŞAR</small></div></div><div class="calendarTitleRow premiumMonthRow"><button class="calendarArrow" onclick="moveCalendar(-1)">‹</button><div><b>${upper(mn)}</b><small>RENKLİ GÜNE DOKUN · DETAYI AÇ</small></div><button class="calendarArrow" onclick="moveCalendar(1)">›</button></div><div class="card compactCalendar referenceCalendar premiumCalendarCard"><div class="calendarHead">${['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar premiumCalendarGrid">${cells}</div><div class="calendarLegend premiumLegend"><span><i class="legendDaily"></i>TAM GÜN</span><span><i class="legendHourly"></i>SAATLİK</span><span><i class="legendOvertime"></i>MESAİ</span><span><i class="legendFinance"></i>HARCAMA</span></div></div><div class="section"><b>${upper(mn)} ÖZETİ</b><span>TOPLAM ${mw.length+me.length} KAYIT</span></div><div class="calendarSummaryGrid"><button onclick="go('daily')"><i class="sumIcon greenBox">▣</i><b>${dn}</b><small>TAM GÜN</small></button><button onclick="go('hourly')"><i class="sumIcon blueBox">◷</i><b>${hn}</b><small>SAATLİK</small></button><button onclick="go('overtime')"><i class="sumIcon goldBox">✦</i><b>${on}</b><small>MESAİ</small></button><button onclick="go('expenses')"><i class="sumIcon redBox">₺</i><b>${money(road)}</b><small>YOL</small></button></div><div class="calendarScenic"><div class="mountainLayer"></div><div class="scenicCopy"><b>Disiplin, hedeflerine giden yolu kısaltır.</b><small>Her renk, o gün yaptığın bir işi gösterir.</small></div></div>`;
};

function periodMovements(period){return [...filterByPeriod(state.incomes,period).map(x=>({...x,k:'income'})),...filterByPeriod(state.expenses,period).map(x=>({...x,k:'expense'})),...filterByPeriod(state.work,period).map(x=>({...x,k:'work'}))].sort((a,b)=>b.date.localeCompare(a.date))}
detailRows=function(period){const a=periodMovements(period);return a.length?a.map(x=>`<div class="movementRow item"><div class="ico">${x.k==='income'?'＋':x.k==='expense'?'−':'⌁'}</div><div><b>${esc(x.title||x.type)}</b><small>${x.date}${x.hours?` · ${x.hours} SAAT`:''}</small></div><div class="movementActions"><div class="amt ${x.k==='income'?'green':x.k==='expense'?'red':'gold'}">${x.k==='expense'?'-':x.k==='income'?'+':''}${money(x.k==='work'?workAmount(x):x.amount)}</div>${actionButtons(x.k,x.id,x.date)}</div></div>`).join(''):'<div class="notice">BU DÖNEMDE KAYIT YOK.</div>'};
function chartBreakdown(kind){const a=kind==='income'?filterByPeriod(state.incomes,reportPeriod):kind==='expense'?filterByPeriod(state.expenses,reportPeriod):filterByPeriod(state.work,reportPeriod);return `<div class="card list">${a.length?a.map(x=>`<div class="item"><div class="ico">${kind==='income'?'＋':kind==='expense'?'−':'⌁'}</div><div><b>${esc(x.title||x.type)}</b><small>${x.date}${x.category?' · '+x.category:''}</small></div><strong class="${kind==='expense'?'red':kind==='income'?'green':'gold'}">${money(kind==='work'?workAmount(x):x.amount)}</strong></div>`).join(''):'<div class="notice">KAYIT YOK.</div>'}</div>`}
reports=(function(old){return function(){return old().replace('onclick="go(\'detail\')">\n   <div class="donutCard">','onclick="openModal(\'chart:income\')">\n   <div class="donutCard">').replace('<div class="donutCard">\n     <div class="donutRing expenseRing"','<div class="donutCard" onclick="event.stopPropagation();openModal(\'chart:expense\')">\n     <div class="donutRing expenseRing"')}})(reports);
detailReport=(function(old){return function(){return old().replace('<div class="dualDonutWrap">','<div class="dualDonutWrap clickableChart" onclick="openModal(\'chart:income\')">').replace('<div class="chartBars">','<div class="chartBars clickableChart" onclick="openModal(\'chart:work\')">')}})(detailReport);

investments=function(){const a=state.investments.slice().sort((x,y)=>x.date.localeCompare(y.date)),max=Math.max(1,...a.map(x=>+x.amount||0));return `${header('YATIRIMLAR',true)}<div class="section"><b>TOPLAM DEĞER</b><span onclick="openModal('investment')">+ EKLE</span></div><div class="stat"><small>TOPLAM YATIRIM</small><strong class="green">${money(a.reduce((n,x)=>n+(+x.amount||0),0))}</strong></div><div class="section"><b>YATIRIM GRAFİĞİ</b><span>DEĞER DAĞILIMI</span></div><div class="card investmentChart">${a.length?a.map(x=>`<div class="investmentBarCol" onclick="openModal('editRecord:investment:${x.id}:${x.date}')"><div class="investmentBar" style="height:${Math.max(10,(+x.amount||0)/max*100)}%"></div><small>${esc(x.title).slice(0,8)}</small></div>`).join(''):'<div class="notice">GRAFİK İÇİN YATIRIM EKLE.</div>'}</div><div class="section"><b>YATIRIMLARIM</b></div><div class="card list">${a.length?a.slice().reverse().map(x=>`<div class="item"><div class="ico">↗</div><div><b>${esc(x.title)}</b><small>${x.date} · YATIRIM TÜRÜ</small></div><div class="investmentRight"><div class="amt green">${money(x.amount)}</div>${actionButtons('investment',x.id,x.date)}</div></div>`).join(''):'<div class="notice">HENÜZ YATIRIM KAYDI YOK.</div>'}</div>`};
submitEditInvestment=function(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const x=state.investments.find(z=>z.id===id);if(x)Object.assign(x,{title:upper(d.title||'YATIRIM'),amount:+d.amount||0,date:d.date});save();closeModal();render()};

finance=function(){return `${header('HESAPLARIM',true)}<div class="section"><b>KREDİ KARTLARIM</b><span onclick="openModal('addCard')">+ KART EKLE</span></div>${state.cards.length?state.cards.map(c=>`<div class="account premiumAccount goldBorder"><div class="accountHead"><b>${esc(c.name)}</b><button class="accountMenu" onclick="openModal('editCard:${c.id}')">⋯</button></div><strong>${money(c.balance)}</strong><small>LİMİT ${money(c.limit)}${c.statementDate?` · KESİM ${c.statementDate}`:''}${c.dueDate?` · SON ÖDEME ${c.dueDate}`:''}</small><button class="accountAction" onclick="openModal('cardSpend:${c.id}')">＋ KARTA HARCAMA EKLE</button><div class="miniTxnList">${(c.transactions||[]).slice(-3).reverse().map(t=>`<div><span>${esc(t.title)} · ${t.date}</span><b>${money(t.amount)}</b><button onclick="openModal('editCardSpend:${c.id}:${t.id}')">✎</button><button onclick="deleteCardSpend('${c.id}','${t.id}')">×</button></div>`).join('')}</div></div>`).join(''):'<div class="notice">HENÜZ KREDİ KARTI EKLENMEDİ.</div>'}<div class="section"><b>ESNEK HESAPLARIM</b><span onclick="openModal('addFlex')">+ HESAP EKLE</span></div>${state.flexAccounts.length?state.flexAccounts.map(c=>`<div class="account premiumAccount"><div class="accountHead"><b>${esc(c.name)}</b><button class="accountMenu" onclick="openModal('editFlex:${c.id}')">⋯</button></div><strong>${money(c.balance)}</strong><small>LİMİT ${money(c.limit)} · KULLANILABİLİR ${money(Math.max(0,c.limit-c.balance))}${c.statementDate?` · KESİM ${c.statementDate}`:''}${c.dueDate?` · SON ÖDEME ${c.dueDate}`:''}</small></div>`).join(''):'<div class="notice">HENÜZ ESNEK HESAP EKLENMEDİ.</div>'}<div class="section"><b>BAKİYE / NAKİT</b></div><div class="account cashAccount" onclick="openModal('cashCenter')"><div class="accountHead"><b>NAKİT PARA</b><span>›</span></div><strong>${money(state.accounts.cash.balance)}</strong><small>EKLE / ÇIKAR / HAREKETLERİ DÜZENLE</small></div><div class="account"><div class="accountHead"><b>YATIRIMLAR</b><span onclick="go('investments')">›</span></div><strong class="green">${money(state.investments.reduce((a,x)=>a+(+x.amount||0),0))}</strong></div>`};
submitCard=function(e,editId=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const prev=state.cards.find(z=>z.id===editId);const x={id:editId||uid(),name:upper(d.name||'KREDİ KARTI'),balance:+d.balance||0,limit:+d.limit||0,statementDate:d.statementDate||'',dueDate:d.dueDate||'',transactions:prev?.transactions||[]};if(editId){const i=state.cards.findIndex(z=>z.id===editId);state.cards[i]=x}else state.cards.push(x);save();closeModal();render()};
deleteCard=function(id){const c=state.cards.find(x=>x.id===id);if(c){const tids=new Set((c.transactions||[]).map(t=>t.id));state.expenses=state.expenses.filter(x=>!(x.sourceType==='card'&&x.cardId===id&&tids.has(x.sourceId)));}state.cards=state.cards.filter(x=>x.id!==id);save();closeModal();render()};
submitFlex=function(e,editId=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const prev=state.flexAccounts.find(z=>z.id===editId);const x={id:editId||uid(),name:upper(d.name||'ESNEK HESAP'),balance:+d.balance||0,limit:+d.limit||0,statementDate:d.statementDate||'',dueDate:d.dueDate||'',transactions:prev?.transactions||[]};if(editId){const i=state.flexAccounts.findIndex(z=>z.id===editId);state.flexAccounts[i]=x}else state.flexAccounts.push(x);save();closeModal();render()};
submitCardSpend=function(e,cid,tid=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),c=state.cards.find(x=>x.id===cid);if(!c)return;let t=(c.transactions||[]).find(x=>x.id===tid);if(t){const diff=(+d.amount||0)-(+t.amount||0);Object.assign(t,{title:upper(d.title||'KART HARCAMASI'),amount:+d.amount||0,date:d.date});c.balance=(+c.balance||0)+diff;const ex=state.expenses.find(x=>x.sourceType==='card'&&x.sourceId===t.id);if(ex)Object.assign(ex,{title:t.title,amount:t.amount,date:t.date});}else{t={id:uid(),title:upper(d.title||'KART HARCAMASI'),amount:+d.amount||0,date:d.date};c.transactions.push(t);c.balance=(+c.balance||0)+t.amount;state.expenses.push({id:uid(),sourceType:'card',sourceId:t.id,cardId:cid,date:t.date,title:t.title,amount:t.amount,category:'DİĞER',method:c.name,note:'KART HARCAMASI'});}save();closeModal();render()};
deleteCardSpend=function(cid,tid){const c=state.cards.find(x=>x.id===cid);if(!c)return;const t=c.transactions.find(x=>x.id===tid);if(t)c.balance=Math.max(0,(+c.balance||0)-(+t.amount||0));c.transactions=c.transactions.filter(x=>x.id!==tid);state.expenses=state.expenses.filter(x=>!(x.sourceType==='card'&&x.sourceId===tid));save();render()};
function recalcCash(){state.accounts.cash.balance=state.cashTransactions.reduce((n,t)=>n+(t.type==='add'?1:-1)*(+t.amount||0),0)}
submitCashTxn=function(e,id=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());let t=state.cashTransactions.find(x=>x.id===id);if(t)Object.assign(t,{type:d.type,amount:+d.amount||0,title:upper(d.title||'NAKİT HAREKETİ'),date:d.date});else state.cashTransactions.push({id:uid(),type:d.type,amount:+d.amount||0,title:upper(d.title||'NAKİT HAREKETİ'),date:d.date});recalcCash();save();modal='cashCenter';render()};
deleteCashTxn=function(id){state.cashTransactions=state.cashTransactions.filter(x=>x.id!==id);recalcCash();save();modal='cashCenter';render()};

submitEditIncome=function(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.incomes.find(z=>z.id===id);if(x)Object.assign(x,{title:upper(d.title||'GELİR'),amount:+d.amount||0,date:d.date});save();closeModal();render()};
deleteRecord=function(kind,id,ds=''){if(kind==='work')return deleteWork(id,ds);if(kind==='expense'){const ex=state.expenses.find(x=>x.id===id);if(ex?.sourceType==='card'&&ex.cardId&&ex.sourceId){deleteCardSpend(ex.cardId,ex.sourceId);return;}state.expenses=state.expenses.filter(x=>x.id!==id);}if(kind==='income')state.incomes=state.incomes.filter(x=>x.id!==id);if(kind==='investment')state.investments=state.investments.filter(x=>x.id!==id);save();if(ds&&modal?.startsWith('day:'))modal=`day:${ds}`;else modal=null;render()};

const oldModalHtml=modalHtml;
modalHtml=function(k){let title='',body='';
 if(k.startsWith('day:')){const ds=k.split(':')[1];title=`${ds} · GÜN DETAYI`;body=dayModal(ds);}
 else if(k.startsWith('expenseDate:')){const ds=k.split(':')[1];title='HARCAMA EKLE';body=expenseFormFor(null).replace(`value="${iso()}"`,`value="${ds}"`);}
 else if(k.startsWith('editRecord:')){const p=k.split(':'),kind=p[1],id=p[2],ds=p[3]||'';if(kind==='work'){const x=state.work.find(z=>z.id===id);if(x){title='ÇALIŞMA KAYDINI DÜZENLE';body=`<form onsubmit="submitEditWork(event,'${x.id}','${ds}')">${field('date','TARİH',x.date,'date')}${field('title','İŞ / PROJE',esc(x.title))}${x.type==='daily'?field('amount','GÜNLÜK ÜCRET',x.amount||state.settings.dailyRate,'number'):`${field('hours',x.type==='hourly'?'ÇALIŞILAN SAAT':'MESAİ SAATİ',x.hours||0,'number')}${field('rate','SAATLİK ÜCRET',x.rate||(x.type==='hourly'?state.settings.hourlyRate:state.settings.overtimeRate),'number')}`}${x.type!=='overtime'?roadFields(x):''}<div class="field"><label>NOT</label><textarea name="note">${esc(x.note||'')}</textarea></div><button class="primary">DEĞİŞİKLİĞİ KAYDET</button></form>`;}}
 else if(kind==='expense'){const x=state.expenses.find(z=>z.id===id);title='HARCAMAYI DÜZENLE';body=x?expenseFormFor(x):'';}
 else if(kind==='income'){const x=state.incomes.find(z=>z.id===id);title='GELİRİ DÜZENLE';body=x?`<form onsubmit="submitEditIncome(event,'${x.id}')">${field('title','AÇIKLAMA',esc(x.title))}${field('amount','TUTAR',x.amount,'number')}${field('date','TARİH',x.date,'date')}<button class="primary">KAYDET</button></form>`:'';}
 else if(kind==='investment'){const x=state.investments.find(z=>z.id===id);title='YATIRIMI DÜZENLE';body=x?`<form onsubmit="submitEditInvestment(event,'${x.id}')">${field('title','YATIRIM NEDİR?',esc(x.title))}${field('amount','TUTAR',x.amount,'number')}${field('date','TARİH',x.date,'date')}<button class="primary">KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteRecord('investment','${x.id}')">SİL</button></form>`:'';}}
 else if(k.startsWith('chart:')){const kind=k.split(':')[1];title=kind==='income'?'GELİR DÖKÜMÜ':kind==='expense'?'HARCAMA DÖKÜMÜ':'ÇALIŞMA DÖKÜMÜ';body=chartBreakdown(kind);}
 else if(k==='reminderCenter'){title='HATIRLATMALAR';const a=activeReminders();body=`<button class="premiumAddBtn full" onclick="openModal('addReminder')"><i>＋</i><span>MANUEL HATIRLATMA EKLE</span></button><div class="section"><b>AKTİF HATIRLATMALAR</b></div>${a.length?a.map(r=>`<div class="reminderCenterRow"><div><b>${esc(r.title)}</b><small>${esc(r.detail)}</small></div><button onclick="completeReminder('${r.id}','${r.rid||''}')">${r.kind==='payment'?'ÖDEDİM':'YAPTIM'}</button><button onclick="dismissReminder('${r.id}')">×</button></div>`).join(''):'<div class="notice">AKTİF HATIRLATMA YOK.</div>'}<div class="section"><b>MANUEL KAYITLAR</b></div>${state.manualReminders.map(r=>`<div class="reminderCenterRow ${r.done?'done':''}"><div><b>${esc(r.title)}</b><small>${r.date}${r.done?' · TAMAMLANDI':''}</small></div><button onclick="deleteManualReminder('${r.id}')">SİL</button></div>`).join('')}`;}
 else if(k==='addReminder'){title='MANUEL HATIRLATMA';body=`<form onsubmit="submitManualReminder(event)">${field('title','HATIRLATMA','')}${field('date','TARİH',iso(),'date')}<button class="primary">EKLE</button></form>`;}
 else if(k==='addCard'){title='KREDİ KARTI EKLE';body=`<form onsubmit="submitCard(event)">${field('name','KART ADI','ANA KART')}${field('balance','GÜNCEL BORÇ',0,'number')}${field('limit','LİMİT',0,'number')}${field('statementDate','HESAP KESİM TARİHİ','','date')}${field('dueDate','SON ÖDEME TARİHİ','','date')}<button class="primary">KARTI EKLE</button></form>`;}
 else if(k.startsWith('editCard:')){const c=state.cards.find(x=>x.id===k.split(':')[1]);title='KREDİ KARTI';body=c?`<form onsubmit="submitCard(event,'${c.id}')">${field('name','KART ADI',esc(c.name))}${field('balance','GÜNCEL BORÇ',c.balance,'number')}${field('limit','LİMİT',c.limit,'number')}${field('statementDate','HESAP KESİM TARİHİ',c.statementDate||'','date')}${field('dueDate','SON ÖDEME TARİHİ',c.dueDate||'','date')}<button class="primary">KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteCard('${c.id}')">KARTI SİL</button></form>`:'';}
 else if(k==='addFlex'){title='ESNEK HESAP EKLE';body=`<form onsubmit="submitFlex(event)">${field('name','HESAP ADI','ESNEK HESAP')}${field('balance','KULLANILAN',0,'number')}${field('limit','LİMİT',0,'number')}${field('statementDate','HESAP KESİM TARİHİ','','date')}${field('dueDate','SON ÖDEME TARİHİ','','date')}<button class="primary">HESABI EKLE</button></form>`;}
 else if(k.startsWith('editFlex:')){const c=state.flexAccounts.find(x=>x.id===k.split(':')[1]);title='ESNEK HESAP';body=c?`<form onsubmit="submitFlex(event,'${c.id}')">${field('name','HESAP ADI',esc(c.name))}${field('balance','KULLANILAN',c.balance,'number')}${field('limit','LİMİT',c.limit,'number')}${field('statementDate','HESAP KESİM TARİHİ',c.statementDate||'','date')}${field('dueDate','SON ÖDEME TARİHİ',c.dueDate||'','date')}<button class="primary">KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteFlex('${c.id}')">HESABI SİL</button></form>`:'';}
 else if(k.startsWith('cardSpend:')||k.startsWith('editCardSpend:')){const p=k.split(':'),cid=p[1],tid=p[2]||'',c=state.cards.find(x=>x.id===cid),t=c?.transactions?.find(x=>x.id===tid);title=t?'KART HARCAMASINI DÜZENLE':'KARTA HARCAMA EKLE';body=c?`<form onsubmit="submitCardSpend(event,'${cid}','${tid}')">${field('title','HARCAMA ADI',esc(t?.title||''))}${field('amount','TUTAR',t?.amount||0,'number')}${field('date','TARİH',t?.date||iso(),'date')}<button class="primary">KAYDET</button>${t?`<button type="button" class="secondary dangerBtn" onclick="deleteCardSpend('${cid}','${tid}');closeModal()">SİL</button>`:''}</form>`:'';}
 else if(k==='cashCenter'){title='NAKİT / BAKİYE';body=`<div class="cashBalanceHero"><small>MEVCUT NAKİT</small><strong>${money(state.accounts.cash.balance)}</strong></div><button class="premiumAddBtn full" onclick="openModal('cashTxn')"><i>＋</i><span>PARA EKLE / ÇIKAR</span></button><div class="section"><b>NAKİT HAREKETLERİ</b></div><div class="card list">${state.cashTransactions.slice().reverse().map(t=>`<div class="item"><div class="ico">${t.type==='add'?'＋':'−'}</div><div><b>${esc(t.title)}</b><small>${t.date}</small></div><div class="cashTxnRight"><b class="${t.type==='add'?'green':'red'}">${t.type==='add'?'+':'-'}${money(t.amount)}</b><button onclick="openModal('editCashTxn:${t.id}')">✎</button><button onclick="deleteCashTxn('${t.id}')">×</button></div></div>`).join('')||'<div class="notice">HENÜZ NAKİT HAREKETİ YOK.</div>'}</div>`;}
 else if(k==='cashTxn'||k.startsWith('editCashTxn:')){const id=k.split(':')[1]||'',t=state.cashTransactions.find(x=>x.id===id);title=t?'NAKİT HAREKETİNİ DÜZENLE':'NAKİT HAREKETİ';body=`<form onsubmit="submitCashTxn(event,'${id}')"><div class="field"><label>İŞLEM</label><select name="type"><option value="add" ${t?.type!=='remove'?'selected':''}>PARA EKLE</option><option value="remove" ${t?.type==='remove'?'selected':''}>PARA ÇIKAR</option></select></div>${field('title','AÇIKLAMA',esc(t?.title||'NAKİT'))}${field('amount','TUTAR',t?.amount||0,'number')}${field('date','TARİH',t?.date||iso(),'date')}<button class="primary">KAYDET</button></form>`;}
 else if(k==='investment'){title='YATIRIM EKLE';body=`<form onsubmit="submitInvestment(event)">${field('title','YATIRIM NEDİR?','')}${field('amount','TUTAR',0,'number')}${field('date','TARİH',iso(),'date')}<button class="primary">KAYDET</button></form>`;}
 else return oldModalHtml(k);
 return `<div class="modal" onclick="safeBackdropClose(event)"><div class="sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${title}</b><button class="close" type="button" onclick="event.preventDefault();event.stopPropagation();closeModal();return false">×</button></div>${body}</div></div>`;
};

nav=function(){const items=[['home','⌂','ANA SAYFA','navHome'],['work','✓','İŞ','navWork'],['expenses','₺','HARCAMA','navExpense'],['calendar','31','TAKVİM','navCalendar'],['reports','▥','RAPOR','navReport'],['investments','↗','YATIRIM','navInvest'],['more','•••','DAHA FAZLA','navMore']];return `<div class="navV36">${items.map(x=>`<button class="${screen===x[0]?'active ':''}${x[3]}" onclick="go('${x[0]}')"><span class="navIconV36">${x[1]}</span><span class="navLabelV36">${x[2]}</span></button>`).join('')}</div>`};
const oldRender=render;
render=function(){if(state.settings.lock&&!unlocked){$('#app').innerHTML=cleanPinScreen();requestAnimationFrame(()=>bindCleanPinControls());return;}let content='';if(screen==='expenses')content=expensesScreen();else{ // replicate original dispatch through temporarily mapped render-safe path
 if(screen==='home')content=home();else if(screen==='daily')content=workScreen('daily');else if(screen==='hourly')content=workScreen('hourly');else if(screen==='overtime')content=workScreen('overtime');else if(screen==='work')content=workScreen('daily');else if(screen==='finance')content=finance();else if(screen==='calendar')content=calendarScreen();else if(screen==='reports')content=reports();else if(screen==='detail')content=detailReport();else if(screen==='investments')content=investments();else if(screen==='notes')content=notes();else if(screen==='profile')content=profile();else if(screen==='settings')content=settings();else if(screen==='expense')content=expensesScreen();else if(screen==='more')content=`${header('DAHA FAZLA',true)}<div class="moreGrid"><button onclick="go('finance')"><i>▣</i><b>FİNANS / HESAPLAR</b><span>KARTLAR, ESNEK HESAP, NAKİT</span></button><button onclick="go('expenses')"><i>▤</i><b>HARCAMALAR</b><span>EKLE / DÜZENLE / SİL</span></button><button onclick="openModal('reminderCenter')"><i>◔</i><b>HATIRLATMALAR</b><span>MANUEL + OTOMATİK</span></button><button onclick="go('notes')"><i>✎</i><b>NOTLAR</b><span>KİŞİSEL VE İŞ NOTLARI</span></button><button onclick="go('profile')"><i>●</i><b>PROFİL</b><span>KİŞİSEL AYARLAR</span></button><button onclick="go('settings')"><i>⚙</i><b>AYARLAR</b><span>PIN, YEDEKLEME, TEMA</span></button></div>`;}
 $('#app').innerHTML=`<main class="phone">${content}${nav()}</main>${modal?modalHtml(modal):''}`;};

// Uygulamadan çıkar çıkmaz kilit hazırlanır; geri dönüldüğünde PIN ekranı açılır.
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&state.settings.lock){unlocked=false;modal=null;}else if(document.visibilityState==='visible'&&state.settings.lock&&!unlocked){render();}});
window.addEventListener('pagehide',()=>{if(state.settings.lock)unlocked=false;},{passive:true});
render();
})();

;

/* ===== clean_v2_v13.js ===== */
/* RUTIN CLEAN V2 - V13 focused corrections: lock lifecycle, investments, cards/flex */
(()=>{

// --- Lock lifecycle -------------------------------------------------------
// FULL12 locked as soon as the page became hidden. That makes app switching,
// notification shade, file picker, etc. request PIN again. Keep the unlocked
// state while the current app instance is alive; a true app reload/restart
// initializes `unlocked` as false in app.js and therefore asks for PIN.
// Capture-phase listeners below prevent the older FULL12 handlers from firing.
document.addEventListener('visibilitychange', ev=>{
  ev.stopImmediatePropagation();
  // no relock on ordinary background/foreground transitions
}, true);
window.addEventListener('pagehide', ev=>{
  ev.stopImmediatePropagation();
  // no relock here either; a restarted document starts locked by itself
}, true);

const invTypes={
  'ALTIN':['◈','ALTIN'],
  'DÖVİZ':['＄','DÖVİZ'],
  'HİSSE':['↗','HİSSE'],
  'FON':['◆','FON'],
  'KRİPTO':['₿','KRİPTO'],
  'MEVDUAT':['▥','MEVDUAT'],
  'DİĞER':['◇','DİĞER']
};
function invType(x){return (x.type&&invTypes[x.type])?x.type:'DİĞER'}
function invValue(x){return +(x.currentValue ?? x.amount ?? 0)||0}
function invCost(x){return +(x.cost ?? x.amount ?? 0)||0}
function invProfit(x){return invValue(x)-invCost(x)}
function invIcon(x){return invTypes[invType(x)][0]}
function invTypeOptions(sel){return Object.keys(invTypes).map(t=>`<option value="${t}" ${t===sel?'selected':''}>${t}</option>`).join('')}
function totalInvestmentValue(){return state.investments.reduce((n,x)=>n+invValue(x),0)}
function totalInvestmentCost(){return state.investments.reduce((n,x)=>n+invCost(x),0)}
function fmtPct(v){return `${v>=0?'+':''}${v.toLocaleString('tr-TR',{maximumFractionDigits:1})}%`}

// Normalize legacy investment records without dropping data.
state.investments=(state.investments||[]).map(x=>({
  ...x,
  type:invType(x),
  cost:invCost(x),
  currentValue:invValue(x),
  amount:invValue(x)
}));
(state.cards||[]).forEach(c=>{c.transactions=Array.isArray(c.transactions)?c.transactions:[];});
(state.flexAccounts||[]).forEach(c=>{c.transactions=Array.isArray(c.transactions)?c.transactions:[];});
save();

// --- Investments ---------------------------------------------------------
investments=function(){
  const a=state.investments.slice().sort((x,y)=>(y.date||'').localeCompare(x.date||''));
  const total=totalInvestmentValue(),cost=totalInvestmentCost(),profit=total-cost;
  const pct=cost?profit/cost*100:0;
  const grouped={};
  a.forEach(x=>{const t=invType(x);grouped[t]=(grouped[t]||0)+invValue(x)});
  const groups=Object.entries(grouped).sort((a,b)=>b[1]-a[1]);
  const max=Math.max(1,...groups.map(x=>x[1]));
  return `${header('YATIRIMLAR',true)}
  <div class="investmentHeroV13">
    <div><small>PORTFÖY DEĞERİ</small><strong>${money(total)}</strong><span class="${profit>=0?'green':'red'}">${profit>=0?'+':''}${money(profit)} · ${fmtPct(pct)}</span></div>
    <button class="premiumAddBtn" onclick="openModal('investment')"><i>＋</i><span>YATIRIM EKLE</span></button>
  </div>
  <div class="investmentStatsV13">
    <div><small>YATIRILAN</small><b>${money(cost)}</b></div>
    <div><small>GÜNCEL DEĞER</small><b>${money(total)}</b></div>
    <div><small>KÂR / ZARAR</small><b class="${profit>=0?'green':'red'}">${profit>=0?'+':''}${money(profit)}</b></div>
  </div>
  <div class="section"><b>PORTFÖY GRAFİĞİ</b><span>TÜRE GÖRE DAĞILIM</span></div>
  <div class="card invGraphV13">${groups.length?groups.map(([t,v])=>`<button onclick="openModal('investmentType:${t}')"><div class="invGraphLabel"><span>${invTypes[t]?.[0]||'◇'} ${t}</span><b>${money(v)}</b></div><div class="invTrack"><i style="width:${Math.max(5,v/max*100)}%"></i></div><small>%${total?Math.round(v/total*100):0}</small></button>`).join(''):'<div class="notice">GRAFİK İÇİN YATIRIM EKLE.</div>'}</div>
  <div class="section"><b>YATIRIMLARIM</b><span>${a.length} KAYIT</span></div>
  <div class="investmentListV13">${a.length?a.map(x=>{const p=invProfit(x),pc=invCost(x)?p/invCost(x)*100:0;return `<div class="investmentCardV13">
    <div class="investmentTypeIcon">${invIcon(x)}</div>
    <div class="investmentCardBody"><small>${invType(x)}</small><b>${esc(x.title||invType(x))}</b><span>${x.date||''}</span></div>
    <div class="investmentCardValue"><strong>${money(invValue(x))}</strong><small class="${p>=0?'green':'red'}">${p>=0?'+':''}${money(p)} · ${fmtPct(pc)}</small></div>
    <div class="investmentCardActions"><button onclick="openModal('editRecord:investment:${x.id}:${x.date||''}')">✎</button><button class="dangerBtn" onclick="deleteRecord('investment','${x.id}')">×</button></div>
  </div>`}).join(''):'<div class="notice">HENÜZ YATIRIM KAYDI YOK.</div>'}</div>`;
};

const previousSubmitInvestment=submitInvestment;
submitInvestment=function(e){
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  const current=+d.currentValue||+d.cost||0;
  state.investments.push({id:uid(),type:d.type||'DİĞER',title:upper(d.title||d.type||'YATIRIM'),cost:+d.cost||0,currentValue:current,amount:current,date:d.date||iso()});
  save();closeModal();screen='investments';render();
};
submitEditInvestment=function(e,id){
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  const x=state.investments.find(z=>z.id===id);if(!x)return;
  const current=+d.currentValue||0;
  Object.assign(x,{type:d.type||'DİĞER',title:upper(d.title||d.type||'YATIRIM'),cost:+d.cost||0,currentValue:current,amount:current,date:d.date||iso()});
  save();closeModal();render();
};

// --- Finance / cards -----------------------------------------------------
function cardUsedPct(c){return Math.min(100,Math.max(0,(+c.limit||0)?(+c.balance||0)/(+c.limit||0)*100:0))}
function cardAvailable(c){return Math.max(0,(+c.limit||0)-(+c.balance||0))}
function dateBadge(label,value){return `<div class="dateBadgeV13"><small>${label}</small><b>${value||'—'}</b></div>`}
function cardTile(c){const pct=cardUsedPct(c);return `<div class="creditCardV13" onclick="openModal('cardDetail:${c.id}')">
 <div class="creditCardTop"><span class="creditChipV13">▦</span><button onclick="event.stopPropagation();openModal('editCard:${c.id}')">•••</button></div>
 <small>KREDİ KARTI</small><h3>${esc(c.name)}</h3>
 <div class="creditCardBalance"><span>GÜNCEL BORÇ</span><strong>${money(c.balance)}</strong></div>
 <div class="creditLimitTrack"><i style="width:${pct}%"></i></div>
 <div class="creditCardBottom"><span>KULLANILABİLİR <b>${money(cardAvailable(c))}</b></span><span>LİMİT <b>${money(c.limit)}</b></span></div>
 <div class="cardDatesV13">${dateBadge('HESAP KESİM',c.statementDate)}${dateBadge('SON ÖDEME',c.dueDate)}</div>
 <button class="cardSpendMainBtn" onclick="event.stopPropagation();openModal('cardSpend:${c.id}')">＋ HARCAMA EKLE</button>
 </div>`}
function flexTile(c){const av=Math.max(0,(+c.limit||0)-(+c.balance||0));return `<div class="flexCardV13">
 <div class="accountHead"><div><small>ESNEK HESAP</small><b>${esc(c.name)}</b></div><button onclick="openModal('editFlex:${c.id}')">•••</button></div>
 <strong>${money(c.balance)}</strong><small>KULLANILAN TUTAR</small>
 <div class="flexMetaV13"><span>KULLANILABİLİR <b>${money(av)}</b></span><span>LİMİT <b>${money(c.limit)}</b></span></div>
 <div class="cardDatesV13">${dateBadge('HESAP KESİM',c.statementDate)}${dateBadge('SON ÖDEME',c.dueDate)}</div>
 </div>`}
finance=function(){return `${header('KARTLAR / HESAPLAR',true)}
 <div class="financeHeroV13"><div><small>TOPLAM KART BORCU</small><strong>${money(state.cards.reduce((n,c)=>n+(+c.balance||0),0))}</strong></div><button onclick="openModal('addCard')">＋ YENİ KART</button></div>
 <div class="section"><b>KREDİ KARTLARIM</b><span>${state.cards.length} KART</span></div>
 <div class="cardsScrollerV13">${state.cards.length?state.cards.map(cardTile).join(''):'<button class="emptyPremiumV13" onclick="openModal(\'addCard\')"><i>＋</i><b>İLK KARTINI EKLE</b><span>HESAP KESİMİ, SON ÖDEME VE HARCAMALARI TAKİP ET</span></button>'}</div>
 <div class="section"><b>ESNEK HESAPLARIM</b><span onclick="openModal('addFlex')">＋ HESAP EKLE</span></div>
 <div class="flexGridV13">${state.flexAccounts.length?state.flexAccounts.map(flexTile).join(''):'<div class="notice">HENÜZ ESNEK HESAP EKLENMEDİ.</div>'}</div>
 <div class="section"><b>BAKİYE / NAKİT</b></div>
 <div class="account cashAccount premiumAccount" onclick="openModal('cashCenter')"><div class="accountHead"><b>NAKİT PARA</b><span>›</span></div><strong>${money(state.accounts.cash.balance)}</strong><small>EKLE / ÇIKAR / HAREKETLERİ DÜZENLE</small></div>`};

// Extend modal renderer last so these focused modals are guaranteed visible.
const v12ModalHtml=modalHtml;
modalHtml=function(k){
 let title='',body='';
 if(k==='investment'){
  title='YATIRIM EKLE';
  body=`<form onsubmit="submitInvestment(event)"><div class="field"><label>YATIRIM TÜRÜ</label><select name="type">${invTypeOptions('ALTIN')}</select></div>${field('title','YATIRIMIN ADI','')}${field('cost','YATIRILAN TUTAR',0,'number')}${field('currentValue','GÜNCEL DEĞER',0,'number')}${field('date','TARİH',iso(),'date')}<button class="primary">YATIRIMI KAYDET</button></form>`;
 } else if(k.startsWith('editRecord:investment:')){
  const p=k.split(':'),id=p[2],x=state.investments.find(z=>z.id===id);title='YATIRIMI DÜZENLE';
  body=x?`<form onsubmit="submitEditInvestment(event,'${x.id}')"><div class="field"><label>YATIRIM TÜRÜ</label><select name="type">${invTypeOptions(invType(x))}</select></div>${field('title','YATIRIMIN ADI',esc(x.title||''))}${field('cost','YATIRILAN TUTAR',invCost(x),'number')}${field('currentValue','GÜNCEL DEĞER',invValue(x),'number')}${field('date','TARİH',x.date||iso(),'date')}<button class="primary">DEĞİŞİKLİĞİ KAYDET</button><button type="button" class="secondary dangerBtn" onclick="deleteRecord('investment','${x.id}')">YATIRIMI SİL</button></form>`:'';
 } else if(k.startsWith('investmentType:')){
  const t=k.split(':')[1],a=state.investments.filter(x=>invType(x)===t);title=`${t} DÖKÜMÜ`;
  body=`<div class="card list">${a.map(x=>`<div class="item"><div class="ico">${invIcon(x)}</div><div><b>${esc(x.title)}</b><small>${x.date}</small></div><strong>${money(invValue(x))}</strong></div>`).join('')||'<div class="notice">KAYIT YOK.</div>'}</div>`;
 } else if(k.startsWith('cardDetail:')){
  const id=k.split(':')[1],c=state.cards.find(x=>x.id===id);title=c?c.name:'KART';
  body=c?`<div class="cardDetailHeroV13"><small>GÜNCEL BORÇ</small><strong>${money(c.balance)}</strong><span>KULLANILABİLİR ${money(cardAvailable(c))}</span></div><div class="cardDatesV13">${dateBadge('HESAP KESİM',c.statementDate)}${dateBadge('SON ÖDEME',c.dueDate)}</div><button class="premiumAddBtn full" onclick="openModal('cardSpend:${c.id}')"><i>＋</i><span>KARTA HARCAMA EKLE</span></button><div class="section"><b>KART HAREKETLERİ</b><span>${(c.transactions||[]).length} KAYIT</span></div><div class="card list">${(c.transactions||[]).slice().reverse().map(t=>`<div class="item"><div class="ico">▣</div><div><b>${esc(t.title)}</b><small>${t.date}</small></div><div class="cardTxnActionsV13"><strong class="red">-${money(t.amount)}</strong><button onclick="openModal('editCardSpend:${c.id}:${t.id}')">✎</button><button onclick="deleteCardSpend('${c.id}','${t.id}');openModal('cardDetail:${c.id}')">×</button></div></div>`).join('')||'<div class="notice">HENÜZ KART HARCAMASI YOK.</div>'}</div><button class="secondary" onclick="openModal('editCard:${c.id}')">KART AYARLARINI DÜZENLE</button>`:'';
 } else return v12ModalHtml(k);
 return `<div class="modal" onclick="safeBackdropClose(event)"><div class="sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${title}</b><button class="close" type="button" onclick="event.preventDefault();event.stopPropagation();closeModal();return false">×</button></div>${body}</div></div>`;
};

render();
})();

;

/* ===== v18_upgrade.js ===== */
/* RUTİN V18 — interaction, categories, analytics, navigation, calendar detail */
(function(){
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ICONS=['🛒','☕','🥖','₺','🍽️','▤','⌂','❤️','🚕','🎉','⛽','👕','🚗','🎁','📚','🔧','💊','📱','💡','💧','🌐','✂️','🐾','🚌','✈️','🧹','🧺','🎯','▣','✦'];
state.categoryMeta=state.categoryMeta&&typeof state.categoryMeta==='object'?state.categoryMeta:{};
/* V43.3.1 recovery: failed V43.3 may have stored category objects. Restore the original V18 string + categoryMeta model safely. */
if(Array.isArray(state.categories)){state.categories=state.categories.map(c=>{if(c&&typeof c==='object'){const n=String(c.name||'').trim().toUpperCase();if(n&&c.icon)state.categoryMeta[n]={icon:c.icon};return n}return String(c||'').trim().toUpperCase()}).filter(Boolean)}
const base={PAZAR:'🥬',YOL:'🚗',YEMEK:'🍽️',MARKET:'🛒',FATURA:'▤',KİRA:'⌂',SAĞLIK:'❤️',ULAŞIM:'🚕',EĞLENCE:'🎉',YAKIT:'⛽',GİYİM:'👕',HARÇLIK:'₺',FIRIN:'🥖',CAFE:'☕',DİĞER:'✦'};
state.categories=Array.from(new Set([...(state.categories||[]),'HARÇLIK','FIRIN','CAFE','PAZAR','DİĞER']));
state.categories.forEach((c,i)=>{if(!state.categoryMeta[c])state.categoryMeta[c]={icon:base[c]||ICONS[i%ICONS.length]};});
state.cards=(state.cards||[]).filter(Boolean).map(c=>({...c,transactions:Array.isArray(c.transactions)?c.transactions:[],name:String(c.name||'KREDİ KARTI'),balance:Number(c.balance)||0,limit:Number(c.limit)||0}));
state.flexAccounts=(state.flexAccounts||[]).filter(Boolean).map(c=>({...c,transactions:Array.isArray(c.transactions)?c.transactions:[],name:String(c.name||'ESNEK HESAP'),balance:Number(c.balance)||0,limit:Number(c.limit)||0}));
save();
function ci(c){return state.categoryMeta[c]?.icon||base[c]||'✦'}
window.rutinCategoryIcon=ci;
function isCardMethod(x){const m=String(x.method||'').toUpperCase();return m.includes('KART')||state.cards.some(c=>String(c.name).toUpperCase()===m)}
function monthPrefix(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function mexp(){const p=monthPrefix();return state.expenses.filter(x=>String(x.date||'').startsWith(p))}
function minc(){const p=monthPrefix();return state.incomes.filter(x=>String(x.date||'').startsWith(p))}
function sum(a){return a.reduce((n,x)=>n+(+x.amount||0),0)}
let navStack=[];
const rawGo=go;
go=function(s){if(s!==screen && screen && !['home'].includes(s))navStack.push(screen);screen=s;modal=null;render()}
window.goBack=function(){const s=navStack.pop()||'home';screen=s;modal=null;render()}
header=function(title='RUTİN',back=false){return `<div class="topbar premiumTopbar v18Top"><button class="iconBtn luxuryIconBtn menuBig" onclick="${back?'goBack()':"openModal('menu')"}">${back?'‹':'☰'}</button><div class="title brandTitle">${title==='RUTİN'?`<img class="headerAppLogoV32" src="icon-180.png?v=v32" alt="RUTİN"><span>RUTİN</span>`:title}</div><div class="topRightInline"><button class="iconBtn luxuryIconBtn" onclick="go('settings')" aria-label="AYARLAR"><span class="settingsGearV31">⚙</span></button><button class="iconBtn luxuryIconBtn bellBtn" onclick="openModal('reminderCenter')" aria-label="HATIRLATMA" title="HATIRLATMA"><span class="bellGlyphV31">🔔</span></button></div></div>`}
home=function(){const T=monthlyTotals();return `${header()}<div class="brandStripV31"><img src="icon-180.png?v=v32" alt="RUTİN"><div><b>RUTİN</b><small>PLANLA · TAKİP ET · GELİŞ</small></div></div>${profileLine()}${typeof reminderCards==='function'?reminderCards():''}<div class="heroMsg"><b>${greetingByTime()}!</b><br>${dailyQuote()}</div><div class="stats v18Stats"><button class="stat" onclick="openModal('periodDetail:todayIncome')"><small>BUGÜNKÜ GELİR</small><strong class="green">${money(todayIncome())}</strong><span class="miniLuxBtnV33">DETAYLAR <b>›</b></span></button><button class="stat" onclick="openModal('periodDetail:todayExpense')"><small>BUGÜNKÜ HARCAMA</small><strong class="red">${money(todayExpense())}</strong><span class="miniLuxBtnV33">DETAYLAR <b>›</b></span></button><button class="stat" onclick="openModal('periodDetail:monthIncome')"><small>BU AY GELİR</small><strong class="green">${money(T.income)}</strong><span class="miniLuxBtnV33">DETAYLAR <b>›</b></span></button><button class="stat" onclick="openModal('periodDetail:monthExpense')"><small>BU AY HARCAMA</small><strong class="red">${money(T.expense)}</strong><span class="miniLuxBtnV33">DETAYLAR <b>›</b></span></button></div><div class="section"><b>HIZLI İŞLEMLER</b></div><div class="quick quickPremium quickSix"><button onclick="openModal('income')"><i class="qv32 qIncome">＋₺</i><span>GELİR EKLE</span></button><button onclick="go('expenses')"><i class="qv32 qExpense">₺</i><span>HARCAMALAR</span></button><button onclick="openModal('daily')"><i class="qv32 qWork">✓</i><span>ÇALIŞTIM</span></button><button onclick="go('notes')"><i class="qv32 qNotes">✎</i><span>NOTLAR</span></button><button onclick="go('investments')"><i class="qv32 qInvest">↗</i><span>YATIRIM</span></button><button onclick="go('finance')"><i class="qv32 qFinance">▰</i><span>FİNANS</span></button></div><div class="section"><b>BUGÜNÜN ÖZETİ</b><button type="button" class="miniLuxBtnV33 detailBtnV33" onclick="event.stopPropagation();openModal('day:${iso()}')">AYRINTILAR <b>›</b></button></div><div class="summaryBox clickableSummary" onclick="openModal('day:${iso()}')">${sumRow('TAM GÜN ÇALIŞMA',state.work.filter(x=>x.date===iso()&&x.type==='daily').length+' GÜN')}${sumRow('SAATLİK ÇALIŞMA',state.work.filter(x=>x.date===iso()&&x.type==='hourly').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('MESAİ',state.work.filter(x=>x.date===iso()&&x.type==='overtime').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('GELİR',money(todayIncome()))}${sumRow('HARCAMA',money(todayExpense()))}</div>`}
function expenseFormV18(x=null){const sel=x?.category||state.categories[0]||'DİĞER';return `<form onsubmit="${x?`submitEditExpenseV18(event,'${x.id}')`:'submitExpenseV18(event)'}">${field('amount','TUTAR',x?.amount||0,'number')}<div class="field"><label>KATEGORİ</label><div class="categoryIcons v18Cats">${state.categories.map(c=>`<label class="catChip"><input type="radio" name="category" value="${E(c)}" ${c===sel?'checked':''} onchange="toggleV18ExpenseFields(this.form)"><i>${ci(c)}</i><span>${E(c)}</span></label>`).join('')}</div></div><div class="field customExpenseName" style="${sel==='DİĞER'?'':'display:none'}"><label>HARCAMA ADI</label><input name="customTitle" value="${E(x?.customTitle||'')}" autocapitalize="characters"></div><div class="field allowanceTo" style="${sel==='HARÇLIK'?'':'display:none'}"><label>KİME VERİLDİ?</label><input name="recipient" value="${E(x?.recipient||'')}" placeholder="ADI" autocapitalize="characters"></div><div class="field"><label>ÖDEME YÖNTEMİ</label><div class="payIcons v18Pay"><label><input type="radio" name="method" value="NAKİT" ${(x?.method||'NAKİT')==='NAKİT'?'checked':''}><i>₺</i><span>NAKİT</span></label><label><input type="radio" name="method" value="KREDİ KARTI" ${isCardMethod(x||{})?'checked':''}><i>▰</i><span>KREDİ KARTI</span></label><label><input type="radio" name="method" value="ESNEK HESAP" ${x?.method==='ESNEK HESAP'?'checked':''}><i>🏦</i><span>ESNEK HESAP</span></label></div></div>${field('date','TARİH',x?.date||iso(),'date')}<div class="field"><label>NOT</label><textarea name="note">${E(x?.note||'')}</textarea></div><button class="primary">${x?'DEĞİŞİKLİĞİ KAYDET':'HARCAMAYI KAYDET'}</button></form>`}
window.toggleV18ExpenseFields=function(f){const c=f.querySelector('[name=category]:checked')?.value;f.querySelector('.customExpenseName').style.display=c==='DİĞER'?'block':'none';f.querySelector('.allowanceTo').style.display=c==='HARÇLIK'?'block':'none'}
window.submitExpenseV18=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),c=d.category||'DİĞER',title=c==='DİĞER'?upper(d.customTitle||'DİĞER'):c;state.expenses.push({id:uid(),date:d.date,title,customTitle:d.customTitle||'',recipient:c==='HARÇLIK'?upper(d.recipient||''):'',amount:+d.amount||0,category:c,method:d.method||'NAKİT',note:d.note||''});save();modal=null;screen='expenses';render()}
window.submitEditExpenseV18=function(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.expenses.find(z=>z.id===id);if(!x)return;const c=d.category||'DİĞER';Object.assign(x,{date:d.date,title:c==='DİĞER'?upper(d.customTitle||'DİĞER'):c,customTitle:d.customTitle||'',recipient:c==='HARÇLIK'?upper(d.recipient||''):'',amount:+d.amount||0,category:c,method:d.method||'NAKİT',note:d.note||''});save();closeModal();render()}
expenseForm=function(){return expenseFormV18()}

function expenseRowV24(x){
 const title=window.esc(x&&x.title||x&&x.category||'HARCAMA'),cat=window.esc(x&&x.category||'DİĞER'),method=window.esc(x&&x.method||x&&x.paymentMethod||'NAKİT'),date=window.esc(x&&x.date||'');
 return `<div class="expenseRowV24" onclick="openModal('expenseDetailV4332:${x.id}')"><i class="expenseIconV24">${ci(x&&x.category||'DİĞER')}</i><div class="expenseTextV24"><b>${title}${x&&x.recipient?' · '+window.esc(x.recipient):''}</b><small>${cat} · ${method} · ${date}${x&&x.note?' · '+window.esc(x.note):''}</small></div><div class="expenseAmountV4332"><strong>${money(Number(x&&x.amount)||0)}</strong><span>DETAY ›</span></div></div>`;
}
expenseAnalytics=function(){
 const all=Array.isArray(state.expenses)?state.expenses:[],p=monthPrefix(),mm=all.filter(x=>String(x&&x.date||'').startsWith(p)),totals={};
 mm.forEach(x=>{const c=upper(x&&x.category||'DİĞER');totals[c]=(totals[c]||0)+(Number(x&&x.amount)||0)});
 const rows=Object.entries(totals).sort((a,b)=>b[1]-a[1]);
 const total=rows.reduce((n,x)=>n+x[1],0);
 return `${header('HARCAMA ANALİZİ',true)}<div class="analysisHero"><small>BU AY TOPLAM HARCAMA</small><strong class="red">${money(total)}</strong></div><div class="section"><b>KATEGORİ TOPLAMLARI</b><span>${rows.length} KATEGORİ</span></div><div class="card list expenseAnalyticsList">${rows.length?rows.map(([c,n])=>`<button class="categoryAnalysisRow" onclick="openModal('categoryDetail:${encodeURIComponent(c)}')"><i>${ci(c)}</i><div><b>${window.esc(c)}</b><small>AYRINTIYI GÖR</small></div><strong>${money(n)}</strong><span>›</span></button>`).join(''):'<div class="notice">BU AY HARCAMA KAYDI YOK.</div>'}</div>`;
};
expensesScreen=function(){
 const all=Array.isArray(state.expenses)?state.expenses:[],a=all.slice().sort((x,y)=>(y.date||'').localeCompare(x.date||'')),now=new Date(),prefix=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`,mm=all.filter(x=>(x.date||'').startsWith(prefix));
 const total=mm.reduce((n,x)=>n+(+x.amount||0),0),cardMethods=['KREDİ KARTI','KART','CREDIT CARD'],isCard=x=>cardMethods.includes(String(x.method||x.paymentMethod||'').toUpperCase()),cash=mm.filter(x=>!isCard(x)).reduce((n,x)=>n+(+x.amount||0),0),card=mm.filter(isCard).reduce((n,x)=>n+(+x.amount||0),0);
 const catTotals={};mm.forEach(x=>{const raw=x.category||x.customTitle||x.title||'DİĞER',c=upper(String(raw).trim()||'DİĞER');catTotals[c]=(catTotals[c]||0)+(Number(x.amount)||0)});const catRows=Object.entries(catTotals).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]);
 return `${header('HARCAMALAR',true)}<div class="expenseHero"><div><small>BU AY HARCAMA</small><strong class="red">${money(total)}</strong></div><button class="premiumAddBtn" onclick="openModal('expense')"><i>＋</i><span>HARCAMA EKLE</span></button></div><div class="paymentSplit"><button><b>₺ ${money(cash)}</b><small>NAKİT</small></button><button><b>▰ ${money(card)}</b><small>KREDİ KARTI</small></button></div><div class="section"><b>KATEGORİ TOPLAMLARI</b><span>${catRows.length} KATEGORİ</span></div><div class="v4331CatTotals v4333CatTotals">${catRows.map(([c,n])=>`<button onclick="openModal('categoryDetail:${encodeURIComponent(c)}')" title="${window.esc(c)}"><i>${ci(c)}</i><span><b>${window.esc(c)}</b><small>BU AY · ${mm.filter(x=>upper(String(x.category||x.customTitle||x.title||'DİĞER').trim()||'DİĞER')===c).length} KAYIT</small></span><strong>${money(n)}</strong></button>`).join('')||'<div class="notice">BU AY HARCAMA YOK.</div>'}</div><div class="section"><b>HARCAMA DÖKÜMÜ</b><span>${a.length} KAYIT</span></div><div class="card list expenseList">${a.length?a.map(x=>expenseRowV24(x)).join(''):'<div class="empty">HARCAMA KAYDI YOK</div>'}</div>`};

function dateAdd(ds,n){const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
window.shiftDay=function(ds,n){modal='day:'+dateAdd(ds,n);render()}
window.jumpCalendar=function(v){if(!v)return;calendarCursor=new Date(v+'-01T12:00:00');closeModal();screen='calendar';render()}
function dayBody(ds){const w=state.work.filter(x=>x.date===ds),ex=state.expenses.filter(x=>x.date===ds),inc=state.incomes.filter(x=>x.date===ds);return `<div class="daySwipeHead"><button onclick="shiftDay('${ds}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>SAĞA / SOLA KAYDIR VEYA OKLARI KULLAN</small></div><button onclick="shiftDay('${ds}',1)">›</button></div><div class="dayDetailTotals">${sumRow('TAM GÜN',w.filter(x=>x.type==='daily').length+' GÜN')}${sumRow('SAATLİK',w.filter(x=>x.type==='hourly').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('MESAİ',w.filter(x=>x.type==='overtime').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('GELİR',money(sum(inc)+w.reduce((a,x)=>a+(+x.amount||0),0)))}${sumRow('HARCAMA',money(sum(ex)))}</div><div class="section"><b>ÇALIŞMA KAYITLARI</b></div>${w.map(x=>`<div class="detailRecord"><i>${x.type==='daily'?'▣':x.type==='hourly'?'⏱️':'✨'}</i><div><b>${E(x.title)}</b><small>${x.hours?x.hours+' SAAT · ':''}${money(x.amount||0)}</small></div><button onclick="openModal('editRecord:work:${x.id}:${ds}')">DÜZENLE</button></div>`).join('')||'<div class="notice">ÇALIŞMA KAYDI YOK.</div>'}<div class="section"><b>HARCAMA DETAYLARI</b></div>${ex.map(x=>`<div class="detailRecord"><i>${ci(x.category)}</i><div><b>${E(x.title)}</b><small>${E(x.category)} · ${E(x.method||'NAKİT')}${x.recipient?' · '+E(x.recipient):''}</small></div><strong class="red">-${money(x.amount)}</strong></div>`).join('')||'<div class="notice">HARCAMA YOK.</div>'}<div class="section"><b>GELİRLER</b></div>${inc.map(x=>`<div class="detailRecord"><i>💰</i><div><b>${E(x.title)}</b><small>${x.date}</small></div><strong class="green">${money(x.amount)}</strong></div>`).join('')||'<div class="notice">GELİR YOK.</div>'}`}
const oldModal=modalHtml;
modalHtml=function(k){let title='',body='';if(k.startsWith('day:')){const ds=k.slice(4);title='GÜN DETAYI';body=dayBody(ds)}else if(k==='dateJump'){title='HIZLI TARİH SEÇ';body=`<div class="dateJumpBox"><label>AY / YIL SEÇ</label><input id="jumpMonth" type="month" value="${monthPrefix(new Date(calendarCursor))}"><button class="primary" onclick="jumpCalendar(document.getElementById('jumpMonth').value)">AYA GİT</button><label>DOĞRUDAN GÜN SEÇ</label><input id="jumpDay" type="date" value="${iso()}"><button class="secondary" onclick="openModal('day:'+document.getElementById('jumpDay').value)">GÜNÜ AÇ</button></div>`}else if(k.startsWith('periodDetail:')){const t=k.split(':')[1],today=t.startsWith('today'),income=t.endsWith('Income'),arr=income?state.incomes:state.expenses,items=arr.filter(x=>today?x.date===iso():String(x.date||'').startsWith(monthPrefix()));title=income?'GELİR AYRINTISI':'HARCAMA AYRINTISI';body=`<div class="analysisHero"><small>TOPLAM</small><strong>${money(sum(items))}</strong></div>${items.map(x=>`<div class="detailRecord"><i>${income?'💰':ci(x.category)}</i><div><b>${E(x.title||x.category)}</b><small>${x.date}${!income?' · '+E(x.method||'NAKİT'):''}</small></div><strong>${money(x.amount)}</strong></div>`).join('')||'<div class="notice">KAYIT YOK.</div>'}`}else if(k.startsWith('paymentDetail:')){const card=k.endsWith('card'),items=mexp().filter(x=>card?isCardMethod(x):!isCardMethod(x));title=card?'KREDİ KARTI HARCAMALARI':'NAKİT HARCAMALAR';body=items.map(x=>`<div class="detailRecord"><i>${ci(x.category)}</i><div><b>${E(x.title)}</b><small>${x.date}</small></div><strong>${money(x.amount)}</strong></div>`).join('')||'<div class="notice">KAYIT YOK.</div>'}else if(k.startsWith('categoryDetail:')){const c=decodeURIComponent(k.split(':')[1]),items=mexp().filter(x=>x.category===c),total=items.reduce((n,x)=>n+(+x.amount||0),0);title=c+' HARCAMALARI';body=`<div class="categoryDetailHeroV4333"><i>${ci(c)}</i><div><small>KATEGORİ</small><b>${E(c)}</b></div><strong>${money(total)}</strong></div><div class="categoryDetailActionsV4333"><button onclick="openModal('editCategoryV18:${encodeURIComponent(c)}')">✎ KATEGORİYİ DÜZENLE</button>${c!=='DİĞER'?`<button class="dangerBtn" onclick="deleteCategoryV4333('${encodeURIComponent(c)}')">× KATEGORİYİ SİL</button>`:''}</div><div class="section"><b>BU AYIN HARCAMALARI</b><span>${items.length} KAYIT</span></div>`+(items.map(x=>`<button class="detailRecord categoryExpenseTapV4333" onclick="openModal('expenseDetailV4332:${x.id}')"><i>${ci(c)}</i><div><b>${E(x.title)}</b><small>${x.date} · ${E(x.method||'NAKİT')}${x.recipient?' · '+E(x.recipient):''}</small></div><strong>${money(x.amount)}</strong></button>`).join('')||'<div class="notice">BU AY BU KATEGORİDE HARCAMA YOK.</div>')}else if(k.startsWith('expenseDetailV4332:')){const id=k.split(':')[1],x=state.expenses.find(z=>String(z.id)===String(id));title='HARCAMA DETAYI';body=x?`<div class="expenseDetailHeroV4332"><i>${ci(x.category||'DİĞER')}</i><div><small>${E(x.category||'DİĞER')}</small><b>${E(x.title||x.category||'HARCAMA')}</b></div><strong>${money(x.amount||0)}</strong></div><div class="expenseDetailInfoV4332"><div><small>TARİH</small><b>${E(x.date||'-')}</b></div><div><small>ÖDEME</small><b>${E(x.method||'NAKİT')}</b></div>${(x.recipient||x.person)?`<div><small>KİME VERİLDİ?</small><b>${E(x.recipient||x.person)}</b></div>`:''}${x.note?`<div class="wide"><small>NOT</small><b>${E(x.note)}</b></div>`:''}</div><div class="expenseDetailActionsV4332"><button class="edit" onclick="openModal('editRecord:expense:${x.id}:${x.date||''}')">✎ DÜZENLE</button><button class="delete" onclick="deleteExpense('${x.id}','${x.date||''}')">× SİL</button></div>`:'<div class="notice">KAYIT BULUNAMADI.</div>'}else if(k==='categoriesV18'){title='KATEGORİLER VE İKONLAR';body=`<button class="premiumAddBtn full" onclick="openModal('addCategoryV18')"><i>＋</i><span>YENİ KATEGORİ EKLE</span></button><div class="categoryManage">${state.categories.map(c=>`<button onclick="openModal('editCategoryV18:${encodeURIComponent(c)}')"><i>${ci(c)}</i><b>${E(c)}</b><span>›</span></button>`).join('')}</div>`}else if(k==='addCategoryV18'||k.startsWith('editCategoryV18:')){const old=k.startsWith('edit')?decodeURIComponent(k.split(':')[1]):'',icon=ci(old||'DİĞER');title=old?'KATEGORİYİ DÜZENLE':'KATEGORİ EKLE';body=`<form onsubmit="saveCategoryV18(event,'${E(old)}')">${field('name','KATEGORİ ADI',E(old))}<div class="field"><label>İKON SEÇ</label><div class="iconPicker">${ICONS.map(i=>`<label><input type="radio" name="icon" value="${i}" ${i===icon?'checked':''}><i>${i}</i></label>`).join('')}</div></div><button class="primary">KAYDET</button>${old&&old!=='DİĞER'?`<button type="button" class="categoryDeleteV4333" onclick="deleteCategoryV4333('${encodeURIComponent(old)}')">× KATEGORİYİ SİL</button>`:''}</form>`}else if(k==='expense'||k.startsWith('editRecord:expense:')){if(k==='expense'){title='HARCAMA EKLE';body=expenseFormV18()}else{const id=k.split(':')[2],x=state.expenses.find(z=>z.id===id);title='HARCAMAYI DÜZENLE';body=x?expenseFormV18(x):''}}else if(k==='menu'){title='TÜM MENÜLER';body=`<div class="fullMenuList">${[['home','⌂','ANA SAYFA'],['work','▣','ÇALIŞMA'],['expenses','▤','HARCAMALAR'],['expenseAnalytics','▥','HARCAMA ANALİZİ'],['calendar','◉','TAKVİM'],['reports','◆','RAPORLAR'],['finance','▰','FİNANS / KARTLAR'],['investments','◆','YATIRIMLAR'],['notes','✎','NOTLAR'],['profile','●','PROFİL'],['settings','◆️','AYARLAR']].map(x=>`<button onclick="go('${x[0]}')"><i>${x[1]}</i><b>${x[2]}</b><span>›</span></button>`).join('')}</div>`}else return oldModal(k);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" data-day="${k.startsWith('day:')?k.slice(4):''}" onclick="event.stopPropagation()"><div class="sheetHead"><b>${title}</b><button class="close" type="button" onclick="event.preventDefault();event.stopPropagation();closeModal();return false">×</button></div>${body}</div></div>`}
window.deleteCategoryV4333=function(encoded){const c=decodeURIComponent(encoded||'');if(!c||c==='DİĞER')return;if(!confirm(c+' kategorisini silmek istiyor musun?\n\nBu kategorideki eski harcamalar DİĞER kategorisine aktarılacak.'))return;state.expenses.forEach(x=>{if(x.category===c){x.category='DİĞER';if(!x.customTitle)x.customTitle=x.title||c}});state.categories=(state.categories||[]).filter(x=>x!==c);delete state.categoryMeta[c];save();modal='categoriesV18';render()}
window.saveCategoryV18=function(e,old=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),name=upper(d.name||'DİĞER'),icon=d.icon||'✦';if(old&&old!==name){state.categories=state.categories.map(c=>c===old?name:c);state.expenses.forEach(x=>{if(x.category===old){x.category=name;if(x.title===old)x.title=name}});delete state.categoryMeta[old]}if(!state.categories.includes(name))state.categories.push(name);state.categoryMeta[name]={icon};save();modal='categoriesV18';render()}
const oldReports=reports;
reports=function(){let h=oldReports();const mm=mexp(),cash=sum(mm.filter(x=>!isCardMethod(x))),card=sum(mm.filter(isCardMethod));return h+`<div class="section"><b>ÖDEME YÖNTEMİ DAĞILIMI</b></div><div class="paymentSplit"><button onclick="openModal('paymentDetail:cash')"><i>₺</i><small>NAKİT HARCAMA</small><b>${money(cash)}</b></button><button onclick="openModal('paymentDetail:card')"><i>▰</i><small>KREDİ KARTI HARCAMA</small><b>${money(card)}</b></button></div>`};
const oldCalendar=calendarScreen;
calendarScreen=function(){let html=oldCalendar();html=html.replace(/<div class="calendarTitleRow premiumMonthRow">/,`<button class="dateJumpMini" onclick="openModal('dateJump')">◉ HIZLI AY / YIL SEÇ</button><div class="calendarTitleRow premiumMonthRow">`);return html}
/* V37 FINAL SINGLE BOTTOM NAV */
nav=function(){
 const items=[['home','⌂','ANA SAYFA','navHome'],['work','✓','İŞ','navWork'],['expenses','₺','HARCAMA','navExpense'],['calendar','31','TAKVİM','navCalendar'],['reports','▥','RAPOR','navReport'],['investments','↗','YATIRIM','navInvest'],['more','•••','DAHA FAZLA','navMore']];
 return `<div class="navV37">${items.map(x=>`<button class="${screen===x[0]?'active ':''}${x[3]}" onclick="go('${x[0]}')"><span class="navIconV37">${x[1]}</span><span class="navLabelV37">${x[2]}</span></button>`).join('')}</div>`;
};
const oldRender=render;
render=function(){if(state.settings.lock&&!unlocked){$('#app').innerHTML=cleanPinScreen();requestAnimationFrame(()=>bindCleanPinControls());return;}let content='';if(screen==='expenseAnalytics')content=expenseAnalytics();else if(screen==='expenses')content=expensesScreen();else if(screen==='home')content=home();else if(screen==='daily')content=workScreen('daily');else if(screen==='hourly')content=workScreen('hourly');else if(screen==='overtime')content=workScreen('overtime');else if(screen==='work')content=workScreen('daily');else if(screen==='finance')content=finance();else if(screen==='calendar')content=calendarScreen();else if(screen==='reports')content=reports();else if(screen==='detail')content=detailReport();else if(screen==='investments')content=investments();else if(screen==='notes')content=notes();else if(screen==='profile')content=profile();else if(screen==='settings')content=settings();else if(screen==='more')content=`${header('DAHA FAZLA',true)}<div class="fullMenuList"><button onclick="go('finance')"><i>▰</i><b>FİNANS / KARTLAR</b><span>›</span></button><button onclick="go('expenseAnalytics')"><i>▥</i><b>HARCAMA ANALİZİ</b><span>›</span></button><button onclick="go('settings')"><i>◆️</i><b>AYARLAR</b><span>›</span></button></div>`;$('#app').innerHTML=`<main class="phone v18Phone">${content}${nav()}</main>${modal?modalHtml(modal):''}`;bindDaySwipe()}
function bindDaySwipe(){const s=document.querySelector('.v18Sheet[data-day]:not([data-bound])');if(!s)return;s.dataset.bound='1';let x=0;s.addEventListener('touchstart',e=>x=e.touches[0].clientX,{passive:true});s.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-x;if(Math.abs(dx)>55)shiftDay(s.dataset.day,dx<0?1:-1)},{passive:true})}
// Kart kayıtlarını güvenli tut: bozuk/eksik veri finans ekranını çökertmesin.
submitCard=function(e,editId=''){
 e.preventDefault();
 try{
  if(!Array.isArray(state.cards))state.cards=[];
  const form=e.currentTarget,d=Object.fromEntries(new FormData(form).entries());
  const prev=state.cards.find(z=>z&&z.id===editId);
  const x={id:editId||uid(),name:upper(d.name||'KREDİ KARTI'),balance:Number(d.balance)||0,limit:Number(d.limit)||0,statementDate:d.statementDate||'',dueDate:d.dueDate||'',transactions:(prev&&Array.isArray(prev.transactions))?prev.transactions:[]};
  if(editId){const i=state.cards.findIndex(z=>z&&z.id===editId);if(i>=0)state.cards[i]=x;else state.cards.push(x)}else state.cards.push(x);
  save();
  modal=null;
  const ov=document.getElementById('modal');if(ov)ov.remove();
  screen='finance';render();
 }catch(err){console.error('CARD SAVE',err);alert('KART KAYDI TAMAMLANAMADI: '+(err&&err.message?err.message:'BİLİNMEYEN HATA'))}
};
// Form girişlerinde Türkçe büyük harf görünümü; sayı/tarih alanlarına dokunma.
document.addEventListener('input',e=>{if((e.target.matches('input[type=text], textarea'))&&!e.target.closest('.cropOverlay'))e.target.style.textTransform='uppercase'},{passive:true});
render();
})();


/* V39 CARD TOP ACTION DRAWER */
window.openCardMenuV39=function(id){
 const c=(state.cards||[]).find(x=>x&&x.id===id);if(!c)return;
 document.querySelectorAll('.cardTopDrawerV39').forEach(x=>x.remove());
 const el=document.createElement('div');el.className='cardTopDrawerV39';
 el.innerHTML=`<div class="v39DrawerGrip"></div><div class="v39DrawerHead"><div><small>KREDİ KARTI</small><b>${window.esc(c.name||'KREDİ KARTI')}</b></div><button onclick="closeCardMenuV39()">×</button></div><div class="v39DrawerDebt"><small>GÜNCEL BORÇ</small><strong>${money(Number(c.balance)||0)}</strong></div><div class="v39DrawerActions"><button class="spend" onclick="closeCardMenuV39();openModal('cardSpend:${c.id}')"><i>＋</i><span>HARCAMA EKLE</span></button><button class="pay" onclick="openCardPaymentV39('${c.id}')"><i>✓</i><span>ÖDEME YAPTIM</span></button><button class="edit" onclick="closeCardMenuV39();openModal('editCard:${c.id}')"><i>✎</i><span>DÜZENLE</span></button><button class="delete" onclick="deleteCardV39('${c.id}')"><i>×</i><span>SİL</span></button></div>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));
};
window.closeCardMenuV39=function(){document.querySelectorAll('.cardTopDrawerV39').forEach(x=>{x.classList.remove('show');setTimeout(()=>x.remove(),220)})};
window.openCardPaymentV39=function(id){
 const c=(state.cards||[]).find(x=>x&&x.id===id);if(!c)return;
 const raw=prompt('ÖDENEN TUTAR',String(Number(c.balance)||0));if(raw===null)return;
 const amount=Number(String(raw).replace(',','.'));if(!Number.isFinite(amount)||amount<=0)return alert('GEÇERLİ BİR TUTAR GİRİN.');
 c.balance=Math.max(0,(Number(c.balance)||0)-amount);
 c.transactions=Array.isArray(c.transactions)?c.transactions:[];
 c.transactions.push({id:uid(),title:'KART ÖDEMESİ',amount:-amount,date:iso(),type:'payment'});
 save();closeCardMenuV39();render();
};
window.deleteCardV39=function(id){
 const c=(state.cards||[]).find(x=>x&&x.id===id);if(!c)return;
 if(!confirm((c.name||'KREDİ KARTI')+' SİLİNSİN Mİ?'))return;
 closeCardMenuV39();
 if(typeof deleteCard==='function')deleteCard(id);else{state.cards=(state.cards||[]).filter(x=>x.id!==id);save();render();}
};


/* V41 FLEX ACCOUNT TOP DRAWER */
window.openFlexMenuV41=function(id){
 const arr=(state.flexAccounts||state.flex||[]);
 const a=arr.find(x=>x&&x.id===id);if(!a)return;
 document.querySelectorAll('.flexTopDrawerV41').forEach(x=>x.remove());
 const debt=Number(a.balance||a.debt)||0, limit=Number(a.limit)||0;
 const el=document.createElement('div');el.className='flexTopDrawerV41';
 el.innerHTML=`<div class="v41DrawerGrip"></div><div class="v41DrawerHead"><div><small>ESNEK HESAP</small><b>${window.esc(a.name||'ESNEK HESAP')}</b></div><button onclick="closeFlexMenuV41()">×</button></div><div class="v41DrawerStats"><span><small>BORÇ</small><strong>${money(debt)}</strong></span><span><small>KULLANILABİLİR</small><strong>${money(Math.max(0,limit-debt))}</strong></span></div><div class="v41DrawerActions"><button onclick="closeFlexMenuV41();openModal('editFlex:${a.id}')"><i>✎</i>DÜZENLE</button><button class="danger" onclick="deleteFlexV41('${a.id}')"><i>×</i>SİL</button></div>`;
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('show')); if(window.syncNavV40)syncNavV40();
};
window.closeFlexMenuV41=function(){document.querySelectorAll('.flexTopDrawerV41').forEach(x=>{x.classList.remove('show');setTimeout(()=>{x.remove();if(window.syncNavV40)syncNavV40()},220)})};
window.deleteFlexV41=function(id){
 const arr=(state.flexAccounts||state.flex||[]),a=arr.find(x=>x&&x.id===id);if(!a)return;
 if(!confirm((a.name||'ESNEK HESAP')+' SİLİNSİN Mİ?'))return;
 if(state.flexAccounts)state.flexAccounts=state.flexAccounts.filter(x=>x.id!==id);else state.flex=(state.flex||[]).filter(x=>x.id!==id);
 save();closeFlexMenuV41();render();
};

/* V42 FINANCE — REAL TWO TAB FINAL OVERRIDE */
(function(){
 const arr=v=>Array.isArray(v)?v:[];
 const sm=v=>money(Number(v)||0);
 window.financeTabV42=window.financeTabV42||'cards';

 finance=function(){
   state.cards=arr(state.cards).filter(x=>x&&typeof x==='object');
   state.flexAccounts=arr(state.flexAccounts).filter(x=>x&&typeof x==='object');

   const cards=state.cards.map(c=>`
     <div class="creditCardV42" onclick="openCardMenuV39('${c.id}')">
       <div class="card42Top"><span class="card42Logo">R</span><span class="card42Type">KREDİ KARTI</span></div>
       <div class="card42Chip"></div>
       <div class="card42Name">${window.esc(c.name||'KREDİ KARTI')}</div>
       <div class="card42Debt"><small>GÜNCEL BORÇ</small><strong>${sm(c.balance)}</strong></div>
       <div class="card42Meta">
         <span><small>LİMİT</small><b>${sm(c.limit)}</b></span>
         <span><small>KESİM</small><b>${window.esc(c.statementDate||'—')}</b></span>
         <span><small>SON ÖDEME</small><b>${window.esc(c.dueDate||'—')}</b></span>
       </div>
     </div>`).join('');

   const flex=state.flexAccounts.map(a=>{
     const debt=Number(a.balance||a.debt)||0, limit=Number(a.limit)||0;
     return `<div class="flexCardV42" onclick="openFlexMenuV42('${a.id}')">
       <div class="flex42Top"><span class="flex42Logo">R</span><span class="flex42Type">ESNEK HESAP</span></div>
       <div class="flex42Mark">◇</div>
       <div class="flex42Name">${window.esc(a.name||'ESNEK HESAP')}</div>
       <div class="flex42Debt"><small>KULLANILAN TUTAR</small><strong>${sm(debt)}</strong></div>
       <div class="flex42Meta">
         <span><small>LİMİT</small><b>${sm(limit)}</b></span>
         <span><small>KULLANILABİLİR</small><b>${sm(Math.max(0,limit-debt))}</b></span>
       </div>
     </div>`;
   }).join('');

   const tab=window.financeTabV42;
   return `${header('FİNANS',true)}
     <div class="financeV42">
       <div class="financeTabs42">
         <button class="${tab==='cards'?'active':''}" onclick="window.financeTabV42='cards';render()"><i>▰</i><span>KARTLAR</span></button>
         <button class="${tab==='accounts'?'active':''}" onclick="window.financeTabV42='accounts';render()"><i>◇</i><span>HESAPLAR</span></button>
       </div>
       ${tab==='cards'
         ? `<div class="finance42Head"><div><small>FİNANS</small><b>KREDİ KARTLARIM</b></div><button onclick="openModal('addCard')">＋ KART EKLE</button></div>
            <div class="financeCards42">${cards||'<div class="notice">HENÜZ KREDİ KARTI EKLENMEDİ.</div>'}</div>`
         : `<div class="finance42Head"><div><small>FİNANS</small><b>ESNEK HESAPLARIM</b></div><button onclick="openModal('addFlex')">＋ HESAP EKLE</button></div>
            <div class="financeCards42">${flex||'<div class="notice">HENÜZ ESNEK HESAP EKLENMEDİ.</div>'}</div>`
       }
     </div>`;
 };

 window.openFlexMenuV42=function(id){
   const a=(state.flexAccounts||[]).find(x=>x&&x.id===id); if(!a)return;
   document.querySelectorAll('.flexDrawerV42').forEach(x=>x.remove());
   const debt=Number(a.balance||a.debt)||0,limit=Number(a.limit)||0;
   const el=document.createElement('div'); el.className='flexDrawerV42';
   el.innerHTML=`<div class="drawer42Grip"></div>
     <div class="drawer42Head"><div><small>ESNEK HESAP</small><b>${window.esc(a.name||'ESNEK HESAP')}</b></div><button onclick="closeFlexMenuV42()">×</button></div>
     <div class="drawer42Stats"><span><small>BORÇ</small><strong>${sm(debt)}</strong></span><span><small>KULLANILABİLİR</small><strong>${sm(Math.max(0,limit-debt))}</strong></span></div>
     <div class="drawer42Actions"><button onclick="closeFlexMenuV42();openModal('editFlex:${a.id}')">✎ DÜZENLE</button><button class="danger" onclick="deleteFlexV42('${a.id}')">× SİL</button></div>`;
   document.body.appendChild(el); requestAnimationFrame(()=>el.classList.add('show'));
   if(window.syncNavV40)syncNavV40();
 };
 window.closeFlexMenuV42=function(){document.querySelectorAll('.flexDrawerV42').forEach(x=>{x.classList.remove('show');setTimeout(()=>{x.remove();if(window.syncNavV40)syncNavV40()},180)})};
 window.deleteFlexV42=function(id){
   const a=(state.flexAccounts||[]).find(x=>x&&x.id===id);if(!a)return;
   if(!confirm((a.name||'ESNEK HESAP')+' SİLİNSİN Mİ?'))return;
   state.flexAccounts=(state.flexAccounts||[]).filter(x=>x.id!==id);save();closeFlexMenuV42();render();
 };
})();
/* V23 MODAL CLOSE HARD FIX */
window.closeModal=function(){
 modal=null;
 document.querySelectorAll('.modal').forEach(function(el){el.remove()});
 try{render()}catch(e){console.error('CLOSE RENDER',e)}
};
document.addEventListener('click',function(e){
 const b=e.target.closest&&e.target.closest('.sheetHead .close');
 if(!b)return;
 e.preventDefault();e.stopImmediatePropagation();
 window.closeModal();
},true);


/* V40 NAV VISIBILITY FALLBACK */
(function(){
 function syncNavV40(){
   const nav=document.querySelector('.navV37');
   if(!nav)return;
   const overlay=document.querySelector('.modal,.modalOverlay,.sheetOverlay,.bottomSheet,.cropOverlay,.cardTopDrawerV39');
   nav.classList.toggle('navHiddenV40',!!overlay);
 }
 const obs=new MutationObserver(syncNavV40);
 obs.observe(document.documentElement,{childList:true,subtree:true});
 document.addEventListener('click',()=>requestAnimationFrame(syncNavV40),true);
 window.syncNavV40=syncNavV40;
 requestAnimationFrame(syncNavV40);
})();

;
