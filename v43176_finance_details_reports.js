/* RUTIN V43.17.6 — finance details + reminders + report/home integration */
(function(){
'use strict';
const V='43.17.6';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(String(v??0).replace(',','.'))||0;
const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
function isoD(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function validDay(obj,key,fallback){const n=parseInt(obj?.[key]||fallback||0,10);return Math.max(1,Math.min(31,isFinite(n)?n:1));}
function dateAt(y,m,day){const last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(day,last),12)}
function nextMonthly(day){const now=new Date((typeof iso==='function'?iso():new Date().toISOString().slice(0,10))+'T12:00:00');let d=dateAt(now.getFullYear(),now.getMonth(),day);if(d<now)d=dateAt(now.getFullYear(),now.getMonth()+1,day);return isoD(d)}
function daysTo(ds){const a=new Date((typeof iso==='function'?iso():new Date().toISOString().slice(0,10))+'T12:00:00'),b=new Date(ds+'T12:00:00');return Math.ceil((b-a)/86400000)}
function fmtDate(ds){try{return new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'short',year:'numeric'})}catch(_){return ds}}
function range(){try{return dateRangeForPeriod(reportPeriod)}catch(_){return {start:'0000-01-01',end:'9999-12-31',label:'SEÇİLİ DÖNEM'}}}
function inRange(ds,r){return String(ds||'')>=String(r.start)&&String(ds||'')<=String(r.end)}
function txType(t){return t.type==='payment'||N(t.amount)<0?'payment':'spend'}
function financeAlert(obj){
 const sd=obj.statementDay?nextMonthly(validDay(obj,'statementDay')):'';
 const pd=obj.paymentDay?nextMonthly(validDay(obj,'paymentDay')):'';
 const arr=[];
 if(sd){const d=daysTo(sd);if(d>=0&&d<=5)arr.push({type:'KESİM',date:sd,days:d});}
 if(pd){const d=daysTo(pd);if(d>=0&&d<=5)arr.push({type:'SON ÖDEME',date:pd,days:d});}
 return arr.sort((a,b)=>a.days-b.days)[0]||null;
}
function usage(obj){const limit=N(obj.limit),bal=N(obj.balance);return {limit,bal,avail:Math.max(0,limit-bal),pct:limit?Math.min(100,Math.round(bal/limit*100)):0}}
function txRows(obj){const tx=[...A(obj.transactions)].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));return tx.map(t=>{const pay=txType(t)==='payment';return `<div class="finHistoryRow43176"><div><b>${E(t.title||(pay?'ÖDEME':'HARCAMA'))}</b><small>${E(t.date||'')} · ${pay?'ÖDEME':'HARCAMA'}</small></div><strong class="${pay?'green':'red'}">${pay?'-':'+'}${M(Math.abs(N(t.amount)))}</strong></div>`}).join('')||'<div class="notice">HAREKET YOK.</div>'}
window.openFinanceDetail43176=function(kind,id){openModal(`financeDetail43176:${kind}:${id}`)};

const prevCardMenu=window.openCardMenuV4310;
window.openCardMenuV4310=function(id){const c=state.cards.find(x=>String(x.id)===String(id));if(!c)return prevCardMenu&&prevCardMenu(id);showDrawer4310('KREDİ KARTI',c.name,M(c.balance),`<button onclick="closeDrawer4310();openFinanceDetail43176('card','${E(id)}')">▦ DETAY / GEÇMİŞ</button><button onclick="closeDrawer4310();openModal('cardSpend:${E(id)}')">＋ HARCAMA EKLE</button><button onclick="closeDrawer4310();openModal('cardPay4310:${E(id)}')">✓ ÖDEME YAPTIM</button><button onclick="closeDrawer4310();openModal('editCard:${E(id)}')">✎ DÜZENLE</button><button class="danger" onclick="deleteCardV39('${E(id)}')">× SİL</button>`)};
const prevFlexMenu=window.openFlexMenuV4310;
window.openFlexMenuV4310=function(id){const a=state.flexAccounts.find(x=>String(x.id)===String(id));if(!a)return prevFlexMenu&&prevFlexMenu(id);showDrawer4310('ESNEK HESAP',a.name,`Kullanılan ${M(a.balance)} · Kullanılabilir ${M(Math.max(0,N(a.limit)-N(a.balance)))}`,`<button onclick="closeDrawer4310();openFinanceDetail43176('flex','${E(id)}')">▦ DETAY / GEÇMİŞ</button><button onclick="closeDrawer4310();openModal('flexSpend4310:${E(id)}')">＋ HARCAMA EKLE</button><button onclick="closeDrawer4310();openModal('flexPay4310:${E(id)}')">✓ ÖDEME YAPTIM</button><button onclick="closeDrawer4310();openModal('editFlex:${E(id)}')">✎ DÜZENLE</button><button class="danger" onclick="deleteFlexV4310('${E(id)}')">× SİL</button>`)};

const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('financeDetail43176:')){
   const [,kind,id]=k.split(':'),obj=(kind==='card'?state.cards:state.flexAccounts).find(x=>String(x.id)===String(id));if(!obj)return prevModal(k);
   const u=usage(obj),al=financeAlert(obj),sd=obj.statementDay?nextMonthly(validDay(obj,'statementDay')):'',pd=obj.paymentDay?nextMonthly(validDay(obj,'paymentDay')):'';
   const spend=A(obj.transactions).filter(t=>txType(t)==='spend').reduce((s,t)=>s+Math.abs(N(t.amount)),0),pay=A(obj.transactions).filter(t=>txType(t)==='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0);
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet financeDetailSheet43176" onclick="event.stopPropagation()"><div class="sheetHead"><b>${kind==='card'?'KART DETAYI':'ESNEK HESAP DETAYI'}</b><button class="close" onclick="closeModal()">×</button></div><div class="financeDetailHero43176"><small>${E(obj.name)}</small><strong>${M(u.bal)}</strong><span>${kind==='card'?'GÜNCEL BORÇ':'KULLANILAN TUTAR'}</span><div class="financeUsageBar43176"><i style="width:${u.pct}%"></i></div><div class="financeUsageStats43176"><span>Limit <b>${M(u.limit)}</b></span><span>Kullanılabilir <b>${M(u.avail)}</b></span><span>Kullanım <b>%${u.pct}</b></span></div></div>${al?`<div class="financeAlert43176"><b>⚠ ${E(al.type)} YAKLAŞIYOR</b><span>${fmtDate(al.date)} · ${al.days===0?'BUGÜN':al.days+' GÜN KALDI'}</span></div>`:''}<div class="financeDatesGrid43176"><div><small>HESAP KESİM</small><b>${sd?fmtDate(sd):'—'}</b></div><div><small>SON ÖDEME</small><b>${pd?fmtDate(pd):'—'}</b></div></div><div class="financeTotals43176"><div><small>TÜM HARCAMALAR</small><b>${M(spend)}</b></div><div><small>TÜM ÖDEMELER</small><b>${M(pay)}</b></div></div><div class="financeDetailActions43176"><button onclick="closeModal();openModal('${kind==='card'?'editCard':'editFlex'}:${E(id)}')">✎ DÜZENLE</button>${kind==='card'?`<button onclick="closeModal();if(typeof openCardDetailV43163==='function')openCardDetailV43163('${E(id)}')">▥ EKSTRE</button>`:''}</div><div class="section"><b>HAREKET / ÖDEME GEÇMİŞİ</b><span>${A(obj.transactions).length} KAYIT</span></div><div class="finHistoryList43176">${txRows(obj)}</div></div></div>`;
 }
 if(k==='reminderCenter'){
   const a=typeof activeReminders==='function'?activeReminders():[];
   const rows=A(a).map(r=>{let action='';const m=String(r.id||'').match(/^v43175:(card|flex):([^:]+):/);if(m)action=`onclick="closeModal();go('finance');setTimeout(()=>openFinanceDetail43176('${m[1]}','${E(m[2])}'),50)"`;return `<div class="reminderCenterRow reminderClickable43176" ${action}><div><b>${E(r.title)}</b><small>${E(r.detail)}</small></div><button onclick="event.stopPropagation();completeReminder('${E(r.id)}','${E(r.rid||'')}')">${r.kind==='payment'?'ÖDEDİM':'YAPTIM'}</button><button onclick="event.stopPropagation();dismissReminder('${E(r.id)}')">×</button></div>`}).join('');
   const manual=A(state.manualReminders).map(r=>`<div class="reminderCenterRow ${r.done?'done':''}"><div><b>${E(r.title)}</b><small>${E(r.date)}${r.done?' · TAMAMLANDI':''}</small></div><button onclick="deleteManualReminder('${E(r.id)}')">SİL</button></div>`).join('');
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HATIRLATMALAR</b><button class="close" onclick="closeModal()">×</button></div><button class="premiumAddBtn full" onclick="openModal('addReminder')"><i>＋</i><span>MANUEL HATIRLATMA EKLE</span></button><div class="section"><b>AKTİF HATIRLATMALAR</b><span>KARTA DOKUN → DETAY</span></div>${rows||'<div class="notice">AKTİF HATIRLATMA YOK.</div>'}<div class="section"><b>MANUEL KAYITLAR</b></div>${manual}</div></div>`;
 }
 return prevModal(k);
};

function financeReportHtml(){const r=range();const cards=A(state.cards).map(c=>{const tx=A(c.transactions).filter(t=>inRange(t.date,r)),sp=tx.filter(t=>txType(t)==='spend').reduce((s,t)=>s+Math.abs(N(t.amount)),0),pa=tx.filter(t=>txType(t)==='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0);return {kind:'card',id:c.id,name:c.name,sp,pa,bal:N(c.balance)}}).filter(x=>x.sp||x.pa||x.bal);const flex=A(state.flexAccounts).map(a=>{const tx=A(a.transactions).filter(t=>inRange(t.date,r)),sp=tx.filter(t=>txType(t)==='spend').reduce((s,t)=>s+Math.abs(N(t.amount)),0),pa=tx.filter(t=>txType(t)==='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0);return {kind:'flex',id:a.id,name:a.name,sp,pa,bal:N(a.balance)}}).filter(x=>x.sp||x.pa||x.bal);const all=[...cards,...flex];if(!all.length)return'';return `<div class="section financeReportHead43176"><b>FİNANS DETAYLARI</b><span>${E(r.label||'SEÇİLİ DÖNEM')}</span></div><div class="financeReportGrid43176">${all.map(x=>`<button onclick="openFinanceDetail43176('${x.kind}','${E(x.id)}')"><small>${x.kind==='card'?'KREDİ KARTI':'ESNEK HESAP'}</small><b>${E(x.name)}</b><span>Harcama <strong>${M(x.sp)}</strong></span><span>Ödeme <strong>${M(x.pa)}</strong></span><span>Güncel Borç <strong>${M(x.bal)}</strong></span></button>`).join('')}</div>`}
const oldReports=window.reports;
window.reports=function(){const h=oldReports();return h+financeReportHtml()};
window.detailReport=window.reports;

function homeFinanceHtml(){const cb=A(state.cards).reduce((s,c)=>s+N(c.balance),0),fb=A(state.flexAccounts).reduce((s,a)=>s+N(a.balance),0);const upcoming=[...A(state.cards).map(c=>({o:c,k:'card'})),...A(state.flexAccounts).map(a=>({o:a,k:'flex'}))].map(x=>{const al=financeAlert(x.o);return al?{...x,...al}:null}).filter(Boolean).sort((a,b)=>a.days-b.days)[0];return `<div class="section homeFinanceHead43176"><b>FİNANS ÖZETİ</b><span>DOKUN → DETAY</span></div><div class="homeFinanceGrid43176"><button onclick="go('finance')"><small>TOPLAM KART BORCU</small><b>${M(cb)}</b></button><button onclick="go('finance');setTimeout(()=>{window.financeTabV4310='accounts';render()},0)"><small>ESNEK HESAP BORCU</small><b>${M(fb)}</b></button>${upcoming?`<button class="wide" onclick="go('finance');setTimeout(()=>openFinanceDetail43176('${upcoming.k}','${E(upcoming.o.id)}'),50)"><small>YAKLAŞAN ${E(upcoming.type)}</small><b>${E(upcoming.o.name)} · ${upcoming.days===0?'BUGÜN':upcoming.days+' GÜN'}</b></button>`:''}</div>`}
const oldHome=window.home;
window.home=function(){return oldHome()+homeFinanceHtml()};

state.meta=state.meta||{};state.meta.appDataVersion=V;try{save()}catch(_){}
})();
