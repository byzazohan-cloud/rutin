/* RUTIN V43.17.5 — finance edit + recurring statement/payment reminders */
(function(){
'use strict';
const A=v=>Array.isArray(v)?v:[];
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=v=>String(v??'').trim().toLocaleUpperCase('tr-TR');
const H=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmt=v=>typeof money==='function'?money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' TL';
function ensure(){
 state.cards=A(state.cards); state.flexAccounts=A(state.flexAccounts);
 state.cards.forEach(c=>normalize(c,false)); state.flexAccounts.forEach(a=>normalize(a,true));
}
function dayFrom(v){
 if(v===null||v===undefined||v==='')return '';
 const s=String(v); if(/^\d{4}-\d{2}-\d{2}$/.test(s))return String(Number(s.slice(8,10))||'');
 const n=parseInt(s,10); return n>=1&&n<=31?String(n):'';
}
function normalize(x,isFlex){
 x.id=x.id||uid(); x.name=x.name||(isFlex?'ESNEK HESAP':'KREDİ KARTI'); x.limit=N(x.limit); x.balance=N(x.balance); x.transactions=A(x.transactions);
 x.statementDay=dayFrom(x.statementDay||x.statementDate||'');
 x.paymentDay=dayFrom(x.paymentDay||x.dueDate||'');
 if(!x.statementDate&&x.statementDay)x.statementDate='';
 if(!x.dueDate&&x.paymentDay)x.dueDate='';
}
function clampDay(v){const n=parseInt(v,10);return n>=1&&n<=31?String(n):''}
function daysInMonth(y,m){return new Date(y,m+1,0).getDate()}
function dateForDay(y,m,d){const day=Math.min(Number(d)||1,daysInMonth(y,m));return `${y}-${String(m+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`}
function nextMonthlyDate(day,from=new Date()){if(!day)return'';const y=from.getFullYear(),m=from.getMonth();let s=dateForDay(y,m,day),dt=new Date(s+'T12:00:00');const base=new Date(from.getFullYear(),from.getMonth(),from.getDate(),12);if(dt<base){const nm=m===11?0:m+1,ny=m===11?y+1:y;s=dateForDay(ny,nm,day)}return s}
function detailText(x){const cut=x.statementDay?`KESİM HER AY ${x.statementDay}`:'KESİM —';const pay=x.paymentDay?`SON ÖDEME HER AY ${x.paymentDay}`:'SON ÖDEME —';return `${cut} · ${pay}`}

// Migration: preserve balances/transactions; only normalize editable metadata.
try{ensure();if(!state.meta)state.meta={};if(!state.meta.v43175FinanceMeta){state.meta.v43175FinanceMeta={at:new Date().toISOString()};save();}}catch(e){}

const prevModal=window.modalHtml;
window.modalHtml=function(k){ensure();
 if(k==='addCard'||k.startsWith('editCard:')){
   const id=k.split(':')[1]||'',c=state.cards.find(x=>String(x.id)===String(id))||{};
   const body=`<form onsubmit="saveFinanceCard43175(event,'${H(id)}')">
     <div class="financeEditReadOnly43175"><small>GÜNCEL BORÇ</small><b>${fmt(c.balance||0)}</b><span>BORÇ, HARCAMA VE ÖDEMELERDEN OTOMATİK HESAPLANIR.</span></div>
     ${field('name','KART ADI',c.name||'')}${field('limit','KART LİMİTİ',c.limit||0,'number')}
     <div class="field"><label>HESAP KESİM GÜNÜ</label><input name="statementDay" type="number" min="1" max="31" inputmode="numeric" value="${H(c.statementDay||dayFrom(c.statementDate)||'')}" placeholder="1-31"><small>HER AY AYNI GÜN · AY KISA İSE AYIN SON GÜNÜ</small></div>
     <div class="field"><label>SON ÖDEME GÜNÜ</label><input name="paymentDay" type="number" min="1" max="31" inputmode="numeric" value="${H(c.paymentDay||dayFrom(c.dueDate)||'')}" placeholder="1-31"><small>HER AY AYNI GÜN · AY KISA İSE AYIN SON GÜNÜ</small></div>
     <button class="primary">${id?'DEĞİŞİKLİKLERİ KAYDET':'KARTI EKLE'}</button>
   </form>`;
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${id?'KREDİ KARTINI DÜZENLE':'KREDİ KARTI EKLE'}</b><button class="close" type="button" onclick="closeModal()">×</button></div>${body}</div></div>`;
 }
 if(k==='addFlex'||k.startsWith('editFlex:')){
   const id=k.split(':')[1]||'',a=state.flexAccounts.find(x=>String(x.id)===String(id))||{};
   const body=`<form onsubmit="saveFinanceFlex43175(event,'${H(id)}')">
     <div class="financeEditReadOnly43175"><small>KULLANILAN TUTAR</small><b>${fmt(a.balance||0)}</b><span>KULLANILAN TUTAR, HARCAMA VE ÖDEMELERDEN OTOMATİK HESAPLANIR.</span></div>
     ${field('name','HESAP ADI',a.name||'')}${field('limit','ESNEK HESAP LİMİTİ',a.limit||0,'number')}
     <div class="field"><label>HESAP KESİM GÜNÜ</label><input name="statementDay" type="number" min="1" max="31" inputmode="numeric" value="${H(a.statementDay||dayFrom(a.statementDate)||'')}" placeholder="1-31"><small>HER AY AYNI GÜN</small></div>
     <div class="field"><label>SON ÖDEME GÜNÜ</label><input name="paymentDay" type="number" min="1" max="31" inputmode="numeric" value="${H(a.paymentDay||dayFrom(a.dueDate)||'')}" placeholder="1-31"><small>HER AY AYNI GÜN</small></div>
     <button class="primary">${id?'DEĞİŞİKLİKLERİ KAYDET':'HESABI EKLE'}</button>
   </form>`;
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${id?'ESNEK HESABI DÜZENLE':'ESNEK HESAP EKLE'}</b><button class="close" type="button" onclick="closeModal()">×</button></div>${body}</div></div>`;
 }
 return prevModal(k);
};
window.saveFinanceCard43175=function(e,id=''){e.preventDefault();ensure();const d=Object.fromEntries(new FormData(e.currentTarget).entries());let c=id?state.cards.find(x=>String(x.id)===String(id)):null;if(!c){c={id:uid(),balance:0,transactions:[]};state.cards.push(c)}c.name=U(d.name||'KREDİ KARTI');c.limit=Math.max(0,N(d.limit));c.statementDay=clampDay(d.statementDay);c.paymentDay=clampDay(d.paymentDay);c.statementDate='';c.dueDate='';save();closeModal();window.financeTabV4310='cards';screen='finance';if(typeof rutinToast==='function')rutinToast(id?'KART BİLGİLERİ GÜNCELLENDİ ✓':'KART EKLENDİ ✓');render()};
window.saveFinanceFlex43175=function(e,id=''){e.preventDefault();ensure();const d=Object.fromEntries(new FormData(e.currentTarget).entries());let a=id?state.flexAccounts.find(x=>String(x.id)===String(id)):null;if(!a){a={id:uid(),balance:0,transactions:[]};state.flexAccounts.push(a)}a.name=U(d.name||'ESNEK HESAP');a.limit=Math.max(0,N(d.limit));a.statementDay=clampDay(d.statementDay);a.paymentDay=clampDay(d.paymentDay);a.statementDate='';a.dueDate='';save();closeModal();window.financeTabV4310='accounts';screen='finance';if(typeof rutinToast==='function')rutinToast(id?'ESNEK HESAP GÜNCELLENDİ ✓':'ESNEK HESAP EKLENDİ ✓');render()};

// Finance cards: expose Edit directly and show statement/payment metadata.
window.finance=function(){ensure();state.investments=A(state.investments);const tab=window.financeTabV4310||'cards';
 const card=(c,isFlex)=>{const used=N(c.balance),limit=N(c.limit),avail=Math.max(0,limit-used),pct=limit?Math.min(100,Math.round(used/limit*100)):0;const open=isFlex?`openFlexMenuV4310('${H(c.id)}')`:`openCardMenuV4310('${H(c.id)}')`;const edit=isFlex?`editFlex:${H(c.id)}`:`editCard:${H(c.id)}`;return `<div class="titaniumVerticalCard financeCard43175 ${isFlex?'flexTitanium':'creditTitanium'}"><button class="financeCardMain43175" onclick="${open}"><div class="tvMetalLine"></div><div class="tvTop"><span class="tvChip">▦</span><span class="tvType">${isFlex?'ESNEK HESAP':'KREDİ KARTI'}</span><span class="tvContact">)))</span></div><div class="tvBrand"><small>${isFlex?'FİNANS HESABI':'PREMIUM CARD'}</small><b>${H(c.name||(isFlex?'ESNEK HESAP':'KREDİ KARTI'))}</b></div><div class="tvMetric main"><span>${isFlex?'KULLANILAN':'GÜNCEL BORÇ'}</span><strong>${fmt(used)}</strong></div><div class="tvMetricGrid"><div><span>TOPLAM LİMİT</span><b>${fmt(limit)}</b></div><div><span>KULLANILABİLİR</span><b>${fmt(avail)}</b></div></div><div class="tvProgress"><i style="width:${pct}%"></i></div><div class="financeDates43175"><span>${H(detailText(c))}</span></div><div class="tvTap">DOKUN · İŞLEMLER <span>›</span></div></button><button class="financeEditBtn43175" onclick="event.stopPropagation();openModal('${edit}')">✎ DÜZENLE</button></div>`};
 const cards=state.cards.map(c=>card(c,false)).join(''),flex=state.flexAccounts.map(a=>card(a,true)).join('');
 const invCost=x=>N(x.quantity)*N(x.unitPrice)+N(x.commission)+N(x.extraCost),inv=state.investments.map(x=>`<button class="inv4310Row" onclick="openModal('editInvestment4310:${H(x.id)}')"><span class="inv4310Icon">◆</span><span><small>${H(x.type||'DİĞER')} · ${H(x.date||'')}</small><b>${H(x.name||'YATIRIM')}</b><em>${N(x.quantity).toLocaleString('tr-TR')} × ${fmt(x.unitPrice)}</em></span><strong>${fmt(invCost(x))}</strong></button>`).join(''),invTotal=state.investments.reduce((a,x)=>a+invCost(x),0);
 return `${header('FİNANS',true)}<div class="finance4311"><div class="financeTabs4310"><button class="${tab==='cards'?'active':''}" onclick="setFinanceTabV4310('cards')">▰<span>KARTLAR</span></button><button class="${tab==='accounts'?'active':''}" onclick="setFinanceTabV4310('accounts')">◇<span>HESAPLAR</span></button><button class="${tab==='investments'?'active':''}" onclick="setFinanceTabV4310('investments')">◆<span>YATIRIMLAR</span></button></div>${tab==='cards'?`<div class="fin4310Head"><div><small>FİNANS</small><b>KREDİ KARTLARIM</b></div><button onclick="openModal('addCard')">＋ KART EKLE</button></div><div class="verticalFinanceDeck">${cards||'<div class="notice">HENÜZ KREDİ KARTI YOK.</div>'}</div>`:''}${tab==='accounts'?`<div class="fin4310Head"><div><small>FİNANS</small><b>ESNEK HESAPLAR</b></div><button onclick="openModal('addFlex')">＋ HESAP EKLE</button></div><div class="verticalFinanceDeck">${flex||'<div class="notice">HENÜZ ESNEK HESAP YOK.</div>'}</div>`:''}${tab==='investments'?`<div class="fin4310Head"><div><small>TOPLAM GERÇEK MALİYET</small><b>${fmt(invTotal)}</b></div><button onclick="openModal('investment4310')">＋ YATIRIM</button></div><div class="inv4310Note">CANLI FİYAT YOK · KÂR/ZARAR YOK · SADECE GERÇEK MALİYET</div><div class="inv4310List">${inv||'<div class="notice">HENÜZ YATIRIM KAYDI YOK.</div>'}</div>`:''}</div>`;
};

// Next step: include recurring statement and payment days in the existing reminder center.
const oldActive=window.activeReminders;
window.activeReminders=function(){ensure();let base=[];try{base=typeof oldActive==='function'?oldActive():[]}catch(e){}base=A(base).filter(r=>!String(r.id||'').startsWith('v43175:'));if(!state.settings?.reminders)return base;const today=new Date((typeof iso==='function'?iso():new Date().toISOString().slice(0,10))+'T12:00:00'),days=Math.max(0,N(state.settings.reminderDays||2));const add=(obj,type)=>{[['statementDay','HESAP KESİMİ'],['paymentDay','SON ÖDEME']].forEach(([key,label])=>{if(!obj[key])return;const date=nextMonthlyDate(obj[key],today),dt=new Date(date+'T12:00:00'),diff=Math.ceil((dt-today)/86400000),id=`v43175:${type}:${obj.id}:${key}:${date}`;if(diff>=0&&diff<=days&&!state.reminderDismissed?.[id])base.push({id,title:`${obj.name} ${label}`,detail:`${date} · ${key==='paymentDay'?fmt(obj.balance):'DÖNEM TARİHİ'}`,kind:'payment'});});};state.cards.forEach(c=>add(c,'card'));state.flexAccounts.forEach(a=>add(a,'flex'));return base.sort((a,b)=>String(a.detail||'').localeCompare(String(b.detail||'')))};

})();
