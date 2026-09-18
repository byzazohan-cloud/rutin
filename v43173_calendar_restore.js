/* RUTIN V43.17.3 — restore premium clickable calendar; keep cash-basis income only */
(function(){
'use strict';
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(String(v??0).replace(',','.'))||0;
const road=x=>x&&(x.sourceType==='workRoad'||x.workId||(String(x.category||'').toUpperCase()==='YOL'&&String(x.note||'').toUpperCase().includes('YOL')));
const earned=x=>N(x.amount)||(N(x.hours)*N(x.rate));
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
const colors={daily:'#22c55e',hourly:'#3b82f6',overtime:'#d7b45c',road:'#a855f7',expense:'#ff4d5a'};
function prefix(){const d=new Date(calendarCursor);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function segBg(types){if(!types.length)return '';const step=100/types.length;return `linear-gradient(90deg,${types.map((t,i)=>`${colors[t]} ${i*step}% ${(i+1)*step}%`).join(',')})`}
function cashIncomeOn(ds){
 if(typeof window.rutinCalendarIncome43172==='function') return N(window.rutinCalendarIncome43172(ds));
 if(typeof window.rutinCalendarIncome43171==='function') return N(window.rutinCalendarIncome43171(ds));
 const other=(state.incomes||[]).filter(x=>x.date===ds).reduce((s,x)=>s+N(x.amount),0);
 const collected=(state.workPayments||[]).filter(x=>x.date===ds).reduce((s,x)=>s+N(x.amount),0);
 const immediate=(state.work||[]).filter(x=>x.date===ds&&x.type!=='daily').reduce((s,w)=>{
   const hasRows=(state.workPayments||[]).some(p=>String(p.workId)===String(w.id));
   return s+(hasRows?0:(typeof workPaid==='function'?N(workPaid(w)):N(w.paidAmount)));
 },0);
 return other+collected+immediate;
}
function monthCashIncome(p){
 const d=new Date(calendarCursor),days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();let total=0;
 for(let n=1;n<=days;n++) total+=cashIncomeOn(`${p}-${String(n).padStart(2,'0')}`);
 return total;
}
function recType(x,kind){if(kind==='expense')return road(x)?'road':'expense';return x.type||'daily'}
function recLabel(x,kind){if(kind==='expense')return road(x)?'YOL GİDERİ':(x.title||x.category||'HARCAMA');return x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ'}
function paidOnWorkDate(x){
 if(!x||x.type==='daily') return 0;
 if((state.workPayments||[]).some(p=>String(p.workId)===String(x.id))) return 0;
 return typeof workPaid==='function'?N(workPaid(x)):N(x.paidAmount);
}
function recSub(x,kind){
 if(kind==='expense')return `${E(x.category||'DİĞER')} · ${E(x.method||'NAKİT')}${x.recipient?' · '+E(x.recipient):x.person?' · '+E(x.person):''} · ${money(x.amount)}`;
 const status=x.type==='daily'?'HAKEDİŞ / ALACAK':paidOnWorkDate(x)>0?'ÖDEME ALINDI':'ALACAK';
 return `${x.hours?E(x.hours)+' SAAT · ':''}${money(earned(x))} · ${status}`;
}
function recordButton(x,kind,ds){const t=recType(x,kind);return `<button class="v432Record ${t}" onclick="openModal('calRecord43173:${kind}:${x.id}:${ds}')"><span class="v432RecordIcon">${t==='daily'?'▣':t==='hourly'?'⏱':t==='overtime'?'✦':t==='road'?(window.rutinCategoryIcon?window.rutinCategoryIcon('YOL'):'🚗'):(window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'▤')}</span><span><b>${E(recLabel(x,kind))}</b><small>${recSub(x,kind)}</small></span><strong>›</strong></button>`}

window.calendarScreen=function(){
 const d=new Date(calendarCursor),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7,p=`${y}-${String(m+1).padStart(2,'0')}`;let cells='';
 for(let i=0;i<offset;i++)cells+='<div class="daySpacer premiumDaySpacer"></div>';
 for(let n=1;n<=days;n++){
  const ds=`${p}-${String(n).padStart(2,'0')}`,w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds),types=[];
  if(w.some(x=>x.type==='daily'))types.push('daily');if(w.some(x=>x.type==='hourly'))types.push('hourly');if(w.some(x=>x.type==='overtime'))types.push('overtime');if(ex.some(road))types.push('road');if(ex.some(x=>!road(x)))types.push('expense');
  const bg=segBg(types);cells+=`<button class="day premiumDay v432Day${ds===iso()?' today':''}${types.length?' hasData':''}" ${bg?`style="background:${bg}!important"`:''} onclick="openModal('day43173:${ds}')"><span class="v432DayNo">${n}</span></button>`;
 }
 const mw=(state.work||[]).filter(x=>String(x.date||'').startsWith(p)),me=(state.expenses||[]).filter(x=>String(x.date||'').startsWith(p));
 const dailyDays=new Set(mw.filter(x=>x.type==='daily').map(x=>x.date)).size,hourlyRows=mw.filter(x=>x.type==='hourly'),hourlyDays=new Set(hourlyRows.map(x=>x.date)).size,hour=hourlyRows.reduce((n,x)=>n+N(x.hours),0),otRows=mw.filter(x=>x.type==='overtime'),otDays=new Set(otRows.map(x=>x.date)).size,ot=otRows.reduce((n,x)=>n+N(x.hours),0),income=monthCashIncome(p),expense=sum(me),mn=d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase();
 const S=(type,label,val,cls)=>`<button class="v432Sum ${cls}" onclick="openModal('monthDetail43173:${type}')"><span>${label}</span><strong>${val}</strong><small>DETAYLAR ›</small></button>`;
 return `${header('TAKVİM',true)}<div class="v43CalendarWrap" ontouchstart="v43CalTouchStart(event)" ontouchend="v43CalTouchEnd(event)"><button class="dateJumpMini" onclick="openModal('dateJump')">◉ AY / YIL HIZLI SEÇ</button><div class="calendarTitleRow premiumMonthRow"><button class="calendarArrow" onclick="moveCalendar(-1)">‹</button><div><b>${mn}</b><small>GÜN KUTUSUNDAKİ HER RENK AYRI BİR KAYDI GÖSTERİR</small></div><button class="calendarArrow" onclick="moveCalendar(1)">›</button></div><div class="card compactCalendar referenceCalendar premiumCalendarCard"><div class="calendarHead">${['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar premiumCalendarGrid">${cells}</div><div class="calendarLegend premiumLegend v43Legend"><span><i class="v43dot daily"></i>GÜNLÜK</span><span><i class="v43dot hourly"></i>SAATLİK</span><span><i class="v43dot overtime"></i>MESAİ</span><span><i class="v43dot road"></i>YOL</span><span><i class="v43dot expense"></i>HARCAMA</span></div></div></div><div class="v432Month"><div class="v432MonthTitle">♛ ${mn} · AY ÖZETİ <small>HER KARTA DOKUN · AYRINTIYI AÇ</small></div><div class="v432SumGrid">${S('worked','TAM GÜN ÇALIŞMA',dailyDays+' GÜN','daily')}${S('hourly','SAATLİK ÇALIŞMA',hourlyDays+' GÜN · '+hour+' SAAT','hourly')}${S('overtime','MESAİ',otDays+' GÜN · '+ot+' SAAT','overtime')}${S('income','TOPLAM GELİR',money(income),'income')}${S('expense','TOPLAM HARCAMA',money(expense),'expense')}${S('remain','KALAN',money(income-expense),'remain')}</div></div>`;
};

function dayMenu(ds){
 const w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds);
 return `<div class="v432DayHead"><button onclick="shiftDay('${ds}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>KAYDA DOKUN → DETAY / DÜZENLE / SİL</small></div><button onclick="shiftDay('${ds}',1)">›</button></div><div class="v43166DayQuick"><button onclick="openModal('dailyDate:${E(ds)}')"><i>✓</i><span>GÜNLÜK</span></button><button onclick="openModal('hourlyDate:${E(ds)}')"><i>◷</i><span>SAATLİK</span></button><button onclick="openModal('overtimeDate:${E(ds)}')"><i>✦</i><span>MESAİ</span></button><button onclick="openModal('expenseDate:${E(ds)}')"><i>▤</i><span>HARCAMA</span></button><button onclick="openAllowanceDate43166('${E(ds)}')"><i>₺</i><span>HARÇLIK</span></button></div><div class="v432DayMenu">${w.map(x=>recordButton(x,'work',ds)).join('')}${ex.map(x=>recordButton(x,'expense',ds)).join('')||(!w.length?'<div class="notice">BU GÜN KAYIT YOK.</div>':'')}</div>`;
}
function monthDetail(type){
 const p=prefix(),mw=(state.work||[]).filter(x=>String(x.date||'').startsWith(p)),me=(state.expenses||[]).filter(x=>String(x.date||'').startsWith(p));let title='',body='';
 if(type==='worked'){
  title='TAM GÜN ÇALIŞMA DETAYI';const dates=[...new Set(mw.filter(x=>x.type==='daily').map(x=>x.date))].sort();
  body=dates.map(ds=>`<button class="v432DetailLine" onclick="openModal('day43173:${ds}')"><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{day:'numeric',month:'long',weekday:'short'})}</b><span>${mw.filter(x=>x.date===ds&&x.type==='daily').length} tam gün kayıt</span><strong>›</strong></button>`).join('');
 }else if(type==='hourly'||type==='overtime'){
  title=type==='hourly'?'SAATLİK ÇALIŞMA DETAYI':'MESAİ DETAYI';body=mw.filter(x=>x.type===type).sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<button class="v432DetailLine" onclick="openModal('calRecord43173:work:${x.id}:${x.date}')"><b>${x.date}</b><span>${x.hours||0} saat · ${money(earned(x))}</span><strong>›</strong></button>`).join('');
 }else if(type==='expense'){
  title='AYLIK HARCAMA DETAYI';const cats={};me.forEach(x=>{const c=x.category||'DİĞER';cats[c]=(cats[c]||0)+N(x.amount)});body=`<div class="v432Breakdown">${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<div><b>${E(c)}</b><strong>${money(v)}</strong></div>`).join('')}</div>`+me.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>`<button class="v432DetailLine" onclick="openModal('calRecord43173:expense:${x.id}:${x.date}')"><b>${E(x.title||x.category)}</b><span>${x.date} · ${E(x.method||'NAKİT')}</span><strong>${money(x.amount)}</strong></button>`).join('');
 }else if(type==='income'||type==='remain'){
  const d=new Date(calendarCursor),days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate(),rows=[];
  for(let n=1;n<=days;n++){const ds=`${p}-${String(n).padStart(2,'0')}`,v=cashIncomeOn(ds);if(v>0)rows.push([ds,v]);}
  const inc=rows.reduce((s,r)=>s+r[1],0),exp=sum(me);
  if(type==='income'){title='AYLIK GELİR DETAYI';body=`<div class="v432Breakdown"><div><b>GERÇEK TAHSİLAT</b><strong>${money(inc)}</strong></div></div>`+rows.map(([ds,v])=>`<button class="v432DetailLine" onclick="openModal('day43173:${ds}')"><b>${ds}</b><span>TAHSİL EDİLEN GELİR</span><strong>${money(v)}</strong></button>`).join('');}
  else {title='KALAN DETAYI';body=`<div class="v432Breakdown"><div><b>TOPLAM GELİR</b><strong>${money(inc)}</strong></div><div><b>TOPLAM HARCAMA</b><strong>${money(exp)}</strong></div><div><b>KALAN</b><strong>${money(inc-exp)}</strong></div></div>`;}
 }
 return {title,body:body||'<div class="notice">BU AY KAYIT YOK.</div>'};
}

const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k&&(k.startsWith('day43173:')||k.startsWith('day:'))){const ds=k.startsWith('day43173:')?k.slice('day43173:'.length):k.slice(4);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v432Sheet" data-day="${E(ds)}" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜN MENÜSÜ</b><button class="close" onclick="closeModal()">×</button></div>${dayMenu(ds)}</div></div>`;}
 if(k&&k.startsWith('calRecord43173:')){
  const parts=k.split(':'),kind=parts[1],id=parts[2],ds=parts[3],arr=kind==='work'?(state.work||[]):(state.expenses||[]),x=arr.find(z=>String(z.id)===String(id));if(!x)return prevModal('day:'+ds);const t=recType(x,kind);
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v432Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>KAYIT DETAYI</b><button class="close" onclick="openModal('day43173:${E(ds)}')">×</button></div><div class="v432RecordHero ${t}"><span>${t==='daily'?'▣':t==='hourly'?'⏱':t==='overtime'?'✦':t==='road'?(window.rutinCategoryIcon?window.rutinCategoryIcon('YOL'):'🚗'):(window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'▤')}</span><b>${E(recLabel(x,kind))}</b><small>${recSub(x,kind)}</small></div><div class="v432RecordActions"><button onclick="openModal('editRecord:${kind}:${E(x.id)}:${E(ds)}')">DÜZENLE</button><button class="dangerBtn" onclick="deleteRecord('${kind}','${E(x.id)}','${E(ds)}')">SİL</button></div></div></div>`;
 }
 if(k&&k.startsWith('monthDetail43173:')){const d=monthDetail(k.split(':')[1]);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v432Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${d.title}</b><button class="close" onclick="closeModal()">×</button></div>${d.body}</div></div>`;}
 return prevModal(k);
};
})();
