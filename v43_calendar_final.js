/* RUTIN V43 FINAL CALENDAR INTEGRATION — loaded last to avoid legacy overrides */
(function(){
const V43E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const V43sum=a=>(a||[]).reduce((n,x)=>n+(Number(x.amount)||0),0);
const V43road=x=>x&&(x.sourceType==='workRoad'||x.workId||(String(x.category||'').toUpperCase()==='YOL'&&String(x.note||'').toUpperCase().includes('YOL')));
const V43workIncome=x=>Number(x.amount)||((Number(x.hours)||0)*(Number(x.rate)||0));
function v43MonthPrefix(){const d=new Date(calendarCursor);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
function v43Icon(x){const c=String(x?.category||'').toUpperCase();return c==='YOL'?'🚗':c==='MARKET'?'🛒':c==='FIRIN'?'🥖':c==='HARÇLIK'?'₺':c==='YEMEK'?'🍽️':'▤'}
window.v43CalTouchStart=function(e){window.__v43CalX=e.touches?.[0]?.clientX||0};
window.v43CalTouchEnd=function(e){const dx=(e.changedTouches?.[0]?.clientX||0)-(window.__v43CalX||0);if(Math.abs(dx)>55)moveCalendar(dx<0?1:-1)};
window.v43JumpCalendar=function(v){if(!v)return;calendarCursor=new Date(v+'-01T12:00:00');modal=null;screen='calendar';render()};

calendarScreen=function(){
 const d=new Date(calendarCursor),y=d.getFullYear(),m=d.getMonth(),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7,prefix=`${y}-${String(m+1).padStart(2,'0')}`;
 let cells='';for(let i=0;i<offset;i++)cells+='<div class="daySpacer premiumDaySpacer"></div>';
 for(let n=1;n<=days;n++){
  const ds=`${prefix}-${String(n).padStart(2,'0')}`,w=state.work.filter(x=>x.date===ds),ex=state.expenses.filter(x=>x.date===ds);
  const flags={daily:w.some(x=>x.type==='daily'),hourly:w.some(x=>x.type==='hourly'),overtime:w.some(x=>x.type==='overtime'),road:ex.some(V43road),expense:ex.some(x=>!V43road(x))};
  const dots=[flags.daily?'daily':'',flags.hourly?'hourly':'',flags.overtime?'overtime':'',flags.road?'road':'',flags.expense?'expense':''].filter(Boolean).map(c=>`<i class="v43dot ${c}"></i>`).join('');
  cells+=`<button class="day premiumDay v43Day${ds===iso()?' today':''}" onclick="openModal('day:${ds}')"><span class="dayNumber">${n}</span><span class="v43Dots">${dots}</span></button>`;
 }
 const mw=state.work.filter(x=>String(x.date||'').startsWith(prefix)),me=state.expenses.filter(x=>String(x.date||'').startsWith(prefix)),mi=state.incomes.filter(x=>String(x.date||'').startsWith(prefix));
 const workedDays=new Set(mw.map(x=>x.date)).size,hours=mw.filter(x=>x.type==='hourly').reduce((n,x)=>n+(Number(x.hours)||0),0),ot=mw.filter(x=>x.type==='overtime').reduce((n,x)=>n+(Number(x.hours)||0),0),income=V43sum(mi)+mw.reduce((n,x)=>n+V43workIncome(x),0),expense=V43sum(me),remain=income-expense,mn=d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase();
 return `${header('TAKVİM',true)}<div class="v43CalendarWrap" ontouchstart="v43CalTouchStart(event)" ontouchend="v43CalTouchEnd(event)"><button class="dateJumpMini" onclick="openModal('dateJump')">◉ AY / YIL HIZLI SEÇ</button><div class="calendarTitleRow premiumMonthRow"><button class="calendarArrow" onclick="moveCalendar(-1)">‹</button><div><b>${mn}</b><small>SAĞA / SOLA KAYDIRARAK AY DEĞİŞTİR</small></div><button class="calendarArrow" onclick="moveCalendar(1)">›</button></div><div class="card compactCalendar referenceCalendar premiumCalendarCard"><div class="calendarHead">${['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar premiumCalendarGrid">${cells}</div><div class="calendarLegend premiumLegend v43Legend"><span><i class="v43dot daily"></i>GÜNLÜK</span><span><i class="v43dot hourly"></i>SAATLİK</span><span><i class="v43dot overtime"></i>MESAİ</span><span><i class="v43dot road"></i>YOL</span><span><i class="v43dot expense"></i>HARCAMA</span></div></div></div><div class="v43GoldSummary"><div class="v43GoldTitle">♛ ${mn} · AY ÖZETİ</div>${sumRow('TOPLAM ÇALIŞILAN GÜN',workedDays+' GÜN')}${sumRow('TOPLAM SAATLİK ÇALIŞMA SAATİ',hours+' SAAT')}${sumRow('TOPLAM MESAİ SAATİ',ot+' SAAT')}${sumRow('TOPLAM GELİR',money(income))}${sumRow('TOPLAM HARCAMA',money(expense))}${sumRow('KALAN',money(remain))}</div>`;
};

function v43DayBody(ds){
 const w=state.work.filter(x=>x.date===ds),ex=state.expenses.filter(x=>x.date===ds),roads=ex.filter(V43road),normal=ex.filter(x=>!V43road(x));
 const workRows=w.map(x=>`<div class="detailRecord"><i>${x.type==='daily'?'▣':x.type==='hourly'?'⏱':'✦'}</i><div><b>${V43E(x.title||'ÇALIŞMA')}</b><small>${x.type==='daily'?'GÜNLÜK':x.type==='hourly'?'SAATLİK':'MESAİ'}${x.hours?' · '+x.hours+' SAAT':''} · ${money(V43workIncome(x))}</small></div><div class="v43Actions"><button onclick="openModal('editRecord:work:${x.id}:${ds}')">DÜZENLE</button><button class="dangerBtn" onclick="deleteRecord('work','${x.id}','${ds}')">SİL</button></div></div>`).join('');
 const roadRows=roads.map(x=>`<div class="detailRecord"><i>🚗</i><div><b>YOL GİDERİ</b><small>${V43E(x.method||'NAKİT')}</small></div><strong class="red">-${money(x.amount)}</strong></div>`).join('');
 const expRows=normal.map(x=>`<div class="detailRecord"><i>${v43Icon(x)}</i><div><b>${V43E(x.title||x.category||'HARCAMA')}</b><small>${V43E(x.category||'DİĞER')} · ${V43E(x.method||'NAKİT')}${x.recipient?' · '+V43E(x.recipient):x.person?' · '+V43E(x.person):''}</small></div><strong class="red">-${money(x.amount)}</strong><div class="v43Actions"><button onclick="openModal('editRecord:expense:${x.id}:${ds}')">DÜZENLE</button><button class="dangerBtn" onclick="deleteRecord('expense','${x.id}','${ds}')">SİL</button></div></div>`).join('');
 return `<div class="daySwipeHead"><button onclick="shiftDay('${ds}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>SAĞA / SOLA KAYDIRARAK GÜN DEĞİŞTİR</small></div><button onclick="shiftDay('${ds}',1)">›</button></div><div class="section"><b>GÜNLÜK / SAATLİK / MESAİ</b></div>${workRows||'<div class="notice">ÇALIŞMA KAYDI YOK.</div>'}<div class="section"><b>YOL GİDERİ</b></div>${roadRows||'<div class="notice">YOL GİDERİ YOK.</div>'}<div class="section"><b>HARCAMA DETAYLARI</b></div>${expRows||'<div class="notice">HARCAMA YOK.</div>'}`;
}

const v43PrevModal=modalHtml;
modalHtml=function(k){
 if(k.startsWith('day:')){const ds=k.slice(4);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" data-day="${ds}" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜN DETAYI</b><button class="close" type="button" onclick="closeModal()">×</button></div>${v43DayBody(ds)}</div></div>`}
 if(k==='dateJump'){return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>AY / YIL HIZLI SEÇ</b><button class="close" type="button" onclick="closeModal()">×</button></div><div class="dateJumpBox"><label>AY / YIL</label><input id="v43JumpMonth" type="month" value="${v43MonthPrefix()}"><button class="primary" onclick="v43JumpCalendar(document.getElementById('v43JumpMonth').value)">AYA GİT</button></div></div></div>`}
 return v43PrevModal(k);
};

/* Keep card-linked expense integrity while returning to the selected day. */
submitEditExpense=function(e,id){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.expenses.find(z=>z.id===id);if(!x)return;const old=Number(x.amount)||0,c=d.category||x.category||'DİĞER';Object.assign(x,{date:d.date,category:c,title:c==='DİĞER'?upper(d.customTitle||x.customTitle||x.title||'DİĞER'):c,customTitle:c==='DİĞER'?upper(d.customTitle||''):'',recipient:d.recipient!==undefined?upper(d.recipient||''):(x.recipient||''),person:d.person!==undefined?d.person:(x.person||''),amount:Number(d.amount)||0,method:d.method||x.method||'NAKİT',note:d.note||''});if(x.sourceType==='card'&&x.cardId&&x.sourceId){const card=state.cards.find(z=>z.id===x.cardId),t=card?.transactions?.find(z=>z.id===x.sourceId);if(card&&t){card.balance=(Number(card.balance)||0)+(x.amount-old);Object.assign(t,{title:x.title,amount:x.amount,date:x.date});}}save();modal='day:'+x.date;render()};
})();
