/* RUTIN V43.17.2 — definitive quick-grid + calendar cash-basis fix */
(function(){
'use strict';
const N=v=>Number(String(v??0).replace(',','.'))||0;

function paymentRowsFor43172(workId){return (state.workPayments||[]).filter(p=>String(p.workId)===String(workId));}
function immediatePaid43172(w){
  if(!w || w.type==='daily') return 0;
  // When explicit collection rows exist, those rows define the actual cash date.
  if(paymentRowsFor43172(w.id).length) return 0;
  return typeof workPaid==='function'?N(workPaid(w)):N(w.paidAmount);
}
function cashIncomeOn43172(ds){
  const other=(state.incomes||[]).filter(x=>String(x.date||'')===String(ds)).reduce((s,x)=>s+N(x.amount),0);
  const immediate=(state.work||[]).filter(w=>String(w.date||'')===String(ds)).reduce((s,w)=>s+immediatePaid43172(w),0);
  const collected=(state.workPayments||[]).filter(p=>String(p.date||'')===String(ds)).reduce((s,p)=>s+N(p.amount),0);
  return other+immediate+collected;
}
window.rutinCalendarIncome43172=cashIncomeOn43172;

// Replace the real calendar renderer so month totals use cash dates, not earned daily wages.
window.calendarScreen=function(){
 const d=new Date(calendarCursor),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7;
 let cells='';for(let i=0;i<offset;i++)cells+='<div class="daySpacer"></div>';
 for(let n=1;n<=days;n++){
  const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
  const w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds);
  const hasDaily=w.some(x=>x.type==='daily'),hasHourly=w.some(x=>x.type==='hourly'),hasOvertime=w.some(x=>x.type==='overtime');
  const hasRoad=ex.some(isWorkRoadExpense),hasExpense=ex.some(x=>!isWorkRoadExpense(x));
  const dots=[hasDaily?'daily':'',hasHourly?'hourly':'',hasOvertime?'overtime':'',hasRoad?'road':'',hasExpense?'expense':''].filter(Boolean);
  const isToday=ds===iso()?' today':'';
  cells+=`<button class="day calendarMultiDay${isToday}" onclick="openModal('day:${ds}')"><span class="calendarDayNo">${n}</span><span class="calendarDots">${dots.map(k=>`<i class="dot-${k}"></i>`).join('')}</span></button>`;
 }
 const prefix=`${y}-${String(m+1).padStart(2,'0')}`;
 const monthWork=(state.work||[]).filter(x=>x.date?.startsWith(prefix));
 const monthExpenses=(state.expenses||[]).filter(x=>x.date?.startsWith(prefix));
 const workedDates=new Set(monthWork.map(x=>x.date)).size;
 const hourlyHours=monthWork.filter(x=>x.type==='hourly').reduce((a,x)=>a+N(x.hours),0);
 const overtimeHours=monthWork.filter(x=>x.type==='overtime').reduce((a,x)=>a+N(x.hours),0);
 let totalIncome=0;
 for(let n=1;n<=days;n++){
   const ds=`${y}-${String(m+1).padStart(2,'0')}-${String(n).padStart(2,'0')}`;
   totalIncome+=cashIncomeOn43172(ds);
 }
 const totalExpense=monthExpenses.reduce((a,x)=>a+N(x.amount),0);
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
};
})();
