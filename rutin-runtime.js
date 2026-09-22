/* RUTIN V43.18.9 — CONSOLIDATED RUNTIME + AUDIT FIXES
   Mechanical consolidation of legacy V43 patches in original load order.
   Functional code unchanged; design authority lives in theme-system.css. */


/* ===== BEGIN v43165_cards_allowance.js ===== */
/* RUTIN V43.16.5 — card sync + allowance center */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=s=>String(s||'').trim().toLocaleUpperCase('tr-TR');
state.cards=Array.isArray(state.cards)?state.cards:[];
state.expenses=Array.isArray(state.expenses)?state.expenses:[];
state.categories=Array.from(new Set([...(state.categories||[]),'HARÇLIK']));
state.settings=state.settings||{};
window.rutinAllowanceFilter=window.rutinAllowanceFilter||'month';
window.rutinAllowanceCustom=window.rutinAllowanceCustom||{start:'',end:''};
window.rutinAllowancePerson=window.rutinAllowancePerson||'';

function ensureCard(c){c.transactions=Array.isArray(c.transactions)?c.transactions:[];return c}
function linked(card,x){return ensureCard(card).transactions.find(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));}
function normalizeLinks(){
 state.cards.forEach(c=>{ensureCard(c);c.transactions.forEach(t=>{if(t.type==='expense')t.type='spend';});});
 state.expenses.forEach(x=>{
   if(x.method!=='KREDİ KARTI'&&!x.cardId)return;
   let c=(state.cards||[]).find(z=>String(z.id)===String(x.cardId));
   if(!c){
     c=state.cards.find(z=>ensureCard(z).transactions.some(t=>String(t.expenseId||'')===String(x.id)));
     if(c){x.cardId=c.id;x.cardName=c.name||'KREDİ KARTI';}
   }
   if(!c)return;
   const t=linked(c,x);
   if(t){t.expenseId=x.id;t.type='spend';t.title=x.title||x.category||'HARCAMA';t.category=x.category||'DİĞER';t.amount=N(x.amount);t.date=x.date;x.sourceType=x.sourceType||'card';x.sourceId=t.id;x.cardId=c.id;x.cardName=c.name||'KREDİ KARTI';}
 });
}
function detachCardExpense(x){
 if(!x)return;
 state.cards.forEach(c=>{
   ensureCard(c);
   const matches=c.transactions.filter(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));
   if(matches.length){
     const total=matches.filter(t=>t.type!=='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0);
     c.balance=Math.max(0,N(c.balance)-total);
     c.transactions=c.transactions.filter(t=>!matches.includes(t));
   }
 });
 x.sourceType='';x.sourceId='';x.cardId='';x.cardName='';
}
function attachCardExpense(x,cardId){
 const c=state.cards.find(z=>String(z.id)===String(cardId));
 if(!c)return false;
 ensureCard(c);
 const t={id:uid(),expenseId:x.id,title:x.title||x.category||'HARCAMA',category:x.category||'DİĞER',amount:N(x.amount),date:x.date,type:'spend'};
 c.transactions.push(t);c.balance=N(c.balance)+N(x.amount);
 Object.assign(x,{method:'KREDİ KARTI',sourceType:'card',sourceId:t.id,cardId:c.id,cardName:c.name||'KREDİ KARTI'});
 return true;
}
window.rutinDetachCardExpenseV43165=detachCardExpense;
window.rutinAttachCardExpenseV43165=attachCardExpense;
normalizeLinks();save();

// Central, safe delete paths for expense records.
function deleteExpenseCore(id){const x=state.expenses.find(z=>String(z.id)===String(id));if(!x)return false;detachCardExpense(x);state.expenses=state.expenses.filter(z=>String(z.id)!==String(id));return true;}
window.deleteRecord=function(kind,id,ds=''){if(kind==='expense'){if(!confirm('BU HARCAMA SİLİNSİN Mİ?'))return;if(deleteExpenseCore(id)){save();modal=ds&&String(modal||'').startsWith('day:')?'day:'+ds:null;render();}return;}if(kind==='work'&&window.deleteWork)return deleteWork(id,ds);if(kind==='income')state.incomes=state.incomes.filter(x=>String(x.id)!==String(id));if(kind==='investment')state.investments=state.investments.filter(x=>String(x.id)!==String(id));save();modal=null;render();};
const oldDeleteCardSpend=window.deleteCardSpend;
window.deleteCardSpend=function(cid,tid){const c=state.cards.find(x=>String(x.id)===String(cid));if(!c)return;ensureCard(c);const t=c.transactions.find(x=>String(x.id)===String(tid));if(!t)return;const ex=state.expenses.find(x=>String(x.id)===String(t.expenseId||'')||String(x.sourceId||'')===String(tid));if(ex){detachCardExpense(ex);state.expenses=state.expenses.filter(x=>String(x.id)!==String(ex.id));}else{c.balance=Math.max(0,N(c.balance)-Math.abs(N(t.amount)));c.transactions=c.transactions.filter(x=>String(x.id)!==String(tid));}save();render();};
const oldDeleteRecordV435=window.deleteRecordV435;
window.deleteRecordV435=function(k,id){if(k!=='expense')return oldDeleteRecordV435?oldDeleteRecordV435(k,id):undefined;if(!confirm('BU KAYIT SİLİNSİN Mİ?'))return;if(deleteExpenseCore(id)){save();modal=null;render();}};
window.deleteExpense=function(id,ds){if(!confirm('BU HARCAMA SİLİNSİN Mİ?'))return;if(deleteExpenseCore(id)){save();modal=ds?'day:'+ds:null;render();}};
const oldV4341Delete=window.v4341Delete;
window.v4341Delete=function(kind,id){if(kind!=='expense')return oldV4341Delete?oldV4341Delete(kind,id):undefined;if(!confirm('BU KAYIT SİLİNSİN Mİ?'))return;if(deleteExpenseCore(id)){save();modal=null;render();}};
const oldDeleteRoad=window.deleteRoadV438;
window.deleteRoadV438=function(id,date,workId){if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;if(deleteExpenseCore(id)){save();if(window.openRoadGroupV438)openRoadGroupV438(date,workId);render();}};

// Replace expense edit with transaction-safe save.
window.v4313SaveExpense=function(e,id){
 e.preventDefault();const x=state.expenses.find(z=>String(z.id)===String(id));if(!x)return;
 const d=Object.fromEntries(new FormData(e.currentTarget).entries()),category=d.category||'DİĞER',amount=N(d.amount);
 if(d.method==='KREDİ KARTI'&&!d.cardId)return alert('LÜTFEN KULLANILAN KARTI SEÇ.');
 detachCardExpense(x);
 const customTitle=category==='DİĞER'?U(d.customTitle||''):'';
 const recipient=category==='HARÇLIK'?U(d.recipient||''):'';
 Object.assign(x,{category,title:category==='DİĞER'?(customTitle||'DİĞER'):category,customTitle,recipient,person:recipient,amount,date:d.date||x.date,method:d.method==='KREDİ KARTI'?'KREDİ KARTI':'NAKİT',note:d.note||''});
 if(x.method==='KREDİ KARTI'&&!attachCardExpense(x,d.cardId))return alert('KART BULUNAMADI.');
 save();modal=null;if(window.showToastV43162)showToastV43162('HARCAMA GÜNCELLENDİ ✓');render();
};

// Legacy calendar/day edit path: keep the linked card in sync too.
window.submitEditExpense=function(e,id,oldDs=''){e.preventDefault();const x=state.expenses.find(z=>String(z.id)===String(id));if(!x)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries());const priorCard=x.cardId||'';detachCardExpense(x);const category=U(d.category||x.category||'DİĞER'),amount=N(d.amount);Object.assign(x,{amount,category,title:category,date:d.date||x.date,method:U(d.method||x.method||'NAKİT'),person:d.person!==undefined?d.person:(x.person||''),note:d.note||''});if(x.method==='KREDİ KARTI'){const cid=d.cardId||priorCard;if(!cid||!attachCardExpense(x,cid))return alert('KART SEÇİMİ BULUNAMADI. HARCAMAYI KARTTAN TEKRAR SEÇİN.');}save();modal=oldDs?'day:'+x.date:null;render();};

// New expense form includes every category + allowance recipient + card selector and creates a hard card link.
window.toggleExpenseV43165=function(f){
 const c=f.querySelector('[name=category]:checked')?.value||'';
 const a=f.querySelector('.allowance43165'); if(a)a.hidden=c!=='HARÇLIK';
 const o=f.querySelector('.other43165'); if(o)o.hidden=c!=='DİĞER';
 const m=f.querySelector('[name=method]:checked')?.value||'NAKİT';
 const cp=f.querySelector('.cardPick43165'); if(cp)cp.hidden=m!=='KREDİ KARTI';
};
window.expenseForm=function(){
 const cats=(state.categories||[]).map((c,i)=>`<label class="catChip"><input type="radio" name="category" value="${E(c)}" ${i===0?'checked':''} onchange="toggleExpenseV43165(this.form)"><i>${window.rutinCategoryIcon?rutinCategoryIcon(c):'₺'}</i><span>${E(c)}</span></label>`).join('');
 return `<form onsubmit="submitExpenseV43165(event)">${field('amount','TUTAR',0,'number')}<div class="field"><label>KATEGORİ</label><div class="categoryIcons v18Cats">${cats}</div></div><div class="field other43165" hidden><label>HARCAMA ADI</label><input name="customTitle" placeholder="HARCAMA ADI"></div><div class="field allowance43165" hidden><label>KİME VERİLDİ?</label><input name="recipient" placeholder="ADI"></div><div class="field"><label>ÖDEME YÖNTEMİ</label><div class="payIcons"><label><input type="radio" name="method" value="NAKİT" checked onchange="toggleExpenseV43165(this.form)"><i>₺</i><span>NAKİT</span></label><label><input type="radio" name="method" value="KREDİ KARTI" onchange="toggleExpenseV43165(this.form)"><i>▰</i><span>KREDİ KARTI</span></label><label><input type="radio" name="method" value="ESNEK HESAP" onchange="toggleExpenseV43165(this.form)"><i>▥</i><span>ESNEK HESAP</span></label></div></div><div class="field cardPick43165" hidden><label>HANGİ KART?</label><select name="cardId"><option value="">KART SEÇ</option>${state.cards.map(c=>`<option value="${E(c.id)}">${E(c.name)}</option>`).join('')}</select></div>${field('date','TARİH',iso(),'date')}${textarea('note','NOT (İSTEĞE BAĞLI)')}<button class="primary">KAYDET</button></form>`;
};
window.submitExpenseV43165=function(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),amount=N(d.amount),category=d.category||'DİĞER';
 if(amount<=0)return alert('TUTAR GİRİN.');if(d.method==='KREDİ KARTI'&&!d.cardId)return alert('HANGİ KREDİ KARTINI KULLANDIĞINIZI SEÇİN.');
 const customTitle=category==='DİĞER'?U(d.customTitle||''):'',recipient=category==='HARÇLIK'?U(d.recipient||''):'';
 if(category==='HARÇLIK'&&!recipient)return alert('HARÇLIK İÇİN KİŞİ ADINI GİRİN.');
 const x={id:uid(),date:d.date||iso(),title:category==='DİĞER'?(customTitle||'DİĞER'):category,customTitle,recipient,person:recipient,amount,category,method:d.method||'NAKİT',cardId:'',cardName:'',sourceType:'',sourceId:'',note:d.note||''};
 state.expenses.push(x);if(x.method==='KREDİ KARTI'&&!attachCardExpense(x,d.cardId)){state.expenses=state.expenses.filter(z=>z.id!==x.id);return alert('KART BULUNAMADI.');}
 save();modal=null;if(window.showToastV43162)showToastV43162('HARCAMA KAYDEDİLDİ ✓');render();
};
// accounting.js's last submit handler now routes to the safe one.
window.submitExpenseV43163=window.submitExpenseV43165;

function monthStartOffset(months){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-months);return iso(d)}
function allowanceRange(){const f=window.rutinAllowanceFilter,now=iso();if(f==='all')return{start:'0000-01-01',end:'9999-12-31',label:'TÜMÜ'};if(f==='3m')return{start:monthStartOffset(2),end:now,label:'SON 3 AY'};if(f==='1y')return{start:monthStartOffset(11),end:now,label:'SON 1 YIL'};if(f==='custom'){let s=window.rutinAllowanceCustom.start||monthStartOffset(0),e=window.rutinAllowanceCustom.end||now;if(s>e)[s,e]=[e,s];return{start:s,end:e,label:'ÖZEL TARİH'};}const d=new Date(),m=String(d.getMonth()+1).padStart(2,'0'),last=String(new Date(d.getFullYear(),d.getMonth()+1,0).getDate()).padStart(2,'0');return{start:`${d.getFullYear()}-${m}-01`,end:`${d.getFullYear()}-${m}-${last}`,label:'BU AY'};}
function allowanceItems(){const r=allowanceRange();return state.expenses.filter(x=>x.category==='HARÇLIK'&&x.date>=r.start&&x.date<=r.end).sort((a,b)=>String(b.date).localeCompare(String(a.date)));}
function personName(x){return U(x.recipient||x.person||'İSİMSİZ')||'İSİMSİZ'}
function setAllowanceFilter(f){window.rutinAllowanceFilter=f;render()} window.setAllowanceFilterV43165=setAllowanceFilter;
window.openAllowancePersonV43165=function(name){if(window.rutinNavHistory)window.rutinNavHistory.push({screen:'allowance',financeTab:window.financeTabV4310||'cards'});window.rutinAllowancePerson=name;screen='allowancePerson';modal=null;render()};
window.allowanceScreenV43165=function(){const a=allowanceItems(),r=allowanceRange(),map={};a.forEach(x=>{const p=personName(x);(map[p]||(map[p]=[])).push(x)});const people=Object.entries(map).sort((A,B)=>B[1].reduce((s,x)=>s+N(x.amount),0)-A[1].reduce((s,x)=>s+N(x.amount),0)),total=a.reduce((s,x)=>s+N(x.amount),0);const tab=(k,l)=>`<button class="${window.rutinAllowanceFilter===k?'active':''}" onclick="setAllowanceFilterV43165('${k}')">${l}</button>`;return `${header('HARÇLIK',true)}<div class="allowanceHero43165"><div><small>${E(r.label)} TOPLAM HARÇLIK</small><strong>${money(total)}</strong><span>${people.length} KİŞİ · ${a.length} İŞLEM</span></div><button onclick="openModal('allowanceAdd43165')">＋ HARÇLIK EKLE</button></div><div class="allowanceTabs43165">${tab('month','BU AY')}${tab('3m','SON 3 AY')}${tab('1y','SON 1 YIL')}${tab('all','TÜMÜ')}<button class="${window.rutinAllowanceFilter==='custom'?'active':''}" onclick="openModal('allowanceRange43165')">TARİH</button></div><div class="section"><b>KİŞİLER</b><span>DOKUN → DETAY</span></div><div class="allowancePeople43165">${people.map(([p,arr])=>`<button onclick="openAllowancePersonV43165('${E(p).replace(/'/g,'&#39;')}')"><i>₺</i><div><b>${E(p)}</b><small>${arr.length} İŞLEM · SON ${E(arr[0]?.date||'-')}</small></div><strong>${money(arr.reduce((s,x)=>s+N(x.amount),0))}</strong><span>›</span></button>`).join('')||'<div class="notice">BU DÖNEMDE HARÇLIK KAYDI YOK.</div>'}</div>`};
window.allowancePersonV43165=function(){const p=window.rutinAllowancePerson||'',a=allowanceItems().filter(x=>personName(x)===p),total=a.reduce((s,x)=>s+N(x.amount),0),avg=a.length?total/a.length:0;return `${header(p||'HARÇLIK',true)}<div class="allowancePersonHero43165"><i>₺</i><div><small>TOPLAM HARÇLIK</small><strong>${money(total)}</strong><span>${a.length} İŞLEM · ORT. ${money(avg)}</span></div></div><button class="primary" onclick="openModal('allowanceAdd43165:${encodeURIComponent(p)}')">＋ HARÇLIK EKLE</button><div class="section"><b>HAREKETLER</b><span>DÜZENLE / SİL</span></div>${a.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>₺</i><div><b>${E(x.note||'HARÇLIK')}</b><small>${E(x.date)} · ${E(x.method||'NAKİT')}</small></div><strong class="red">-${money(x.amount)}</strong><span>›</span></button>`).join('')||'<div class="notice">KAYIT YOK.</div>'}`};

window.toggleAllowanceCardV43165=function(f){const b=f.querySelector('.allowanceCardPick43165');if(b)b.hidden=f.method.value!=='KREDİ KARTI'};
window.submitAllowanceV43165=function(e,preset=''){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),amount=N(d.amount),recipient=U(d.recipient||preset);if(!recipient)return alert('KİŞİ ADINI GİRİN.');if(amount<=0)return alert('TUTAR GİRİN.');if(d.method==='KREDİ KARTI'&&!d.cardId)return alert('KART SEÇİN.');const x={id:uid(),date:d.date||iso(),title:'HARÇLIK',category:'HARÇLIK',recipient,person:recipient,amount,method:d.method||'NAKİT',note:d.note||'',cardId:'',cardName:'',sourceType:'',sourceId:''};state.expenses.push(x);if(x.method==='KREDİ KARTI'&&!attachCardExpense(x,d.cardId)){state.expenses=state.expenses.filter(z=>z.id!==x.id);return alert('KART BULUNAMADI.');}save();modal=null;screen=preset?'allowancePerson':'allowance';window.rutinAllowancePerson=recipient;if(window.showToastV43162)showToastV43162('HARÇLIK KAYDEDİLDİ ✓');render();};
window.applyAllowanceRangeV43165=function(){const s=document.getElementById('allowStart43165')?.value,e=document.getElementById('allowEnd43165')?.value;if(!s||!e)return alert('TARİHLERİ SEÇİN.');window.rutinAllowanceCustom={start:s,end:e};window.rutinAllowanceFilter='custom';closeModal();screen='allowance';render();};

// True statement period helpers and improved card page.
function dayVal(c){let d=parseInt(c.statementDay,10);return Math.max(1,Math.min(28,isFinite(d)?d:1));}
function fmtDate(ds){return new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'})}
function addDays(ds,n){const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)}
function statementPeriod(c,ref=new Date()){
 const day=dayVal(c),y=ref.getFullYear(),m=ref.getMonth();let end=new Date(y,m,day,12);
 if(ref<end)end=new Date(y,m-1,day,12);
 let prev=new Date(end.getFullYear(),end.getMonth()-1,day,12);return{start:addDays(iso(prev),1),end:iso(end)};
}
window.cardDetailV43163=function(){const c=state.cards.find(x=>x.id===window.cardDetailIdV43163);if(!c){screen='finance';return finance()}ensureCard(c);const p=statementPeriod(c),tx=[...c.transactions].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),periodTx=tx.filter(t=>t.date>=p.start&&t.date<=p.end),spends=periodTx.filter(t=>t.type!=='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0),pays=periodTx.filter(t=>t.type==='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0);return `${header('KART EKSTRESİ',true)}<div class="cardDetailHeroV13"><small>${E(c.name)}</small><strong>${money(c.balance)}</strong><span>GÜNCEL BORÇ</span></div><div class="statementPeriod43165"><small>SON KAPANAN EKSTRE DÖNEMİ</small><b>${fmtDate(p.start)} — ${fmtDate(p.end)}</b></div><div class="v43163CardStats"><div><small>DÖNEM HARCAMA</small><b>${money(spends)}</b></div><div><small>DÖNEM ÖDEME</small><b>${money(pays)}</b></div></div><div class="card v43163Dates"><span>HESAP KESİM <b>HER AY ${E(c.statementDay||'-')}</b></span><span>SON ÖDEME <b>${E(c.paymentDay||c.dueDate||'-')}</b></span></div><button class="primary" onclick="openModal('cardPay4310:${c.id}')">NE KADAR ÖDEDİM?</button><div class="section"><b>BU EKSTRE HAREKETLERİ</b><span>${periodTx.length} İŞLEM</span></div><div class="card list">${periodTx.length?periodTx.map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')} · ${E(t.category||(t.type==='payment'?'ÖDEME':''))}</small></div><strong class="${t.type==='payment'?'green':'red'}">${t.type==='payment'?'-':''}${money(Math.abs(N(t.amount)))}</strong></div>`).join(''):'<div class="notice">BU EKSTRE DÖNEMİNDE HAREKET YOK.</div>'}</div><div class="section"><b>TÜM KART HAREKETLERİ</b><span>${tx.length}</span></div><div class="card list compact43165">${tx.slice(0,40).map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')}</small></div><strong class="${t.type==='payment'?'green':'red'}">${t.type==='payment'?'-':''}${money(Math.abs(N(t.amount)))}</strong></div>`).join('')||'<div class="notice">HAREKET YOK.</div>'}</div>`};

const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k==='expense'||k.startsWith('expenseDate:')){const ds=k.startsWith('expenseDate:')?k.split(':')[1]:'';let form=expenseForm();if(ds)form=form.replace(`value="${iso()}"`,`value="${ds}"`);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HARCAMA EKLE</b><button class="close" onclick="closeModal()">×</button></div>${form}</div></div>`;}

 if(k==='allowanceAdd43165'||k.startsWith('allowanceAdd43165:')){const preset=k.includes(':')?decodeURIComponent(k.split(':').slice(1).join(':')):'';return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HARÇLIK EKLE</b><button class="close" onclick="closeModal()">×</button></div><form onsubmit="submitAllowanceV43165(event,'${E(preset)}')"><div class="field"><label>KİŞİ</label><input name="recipient" value="${E(preset)}" placeholder="KİME VERİLDİ?"></div>${field('amount','TUTAR',0,'number')}${field('date','TARİH',iso(),'date')}<div class="field"><label>ÖDEME</label><select name="method" onchange="toggleAllowanceCardV43165(this.form)"><option>NAKİT</option><option>KREDİ KARTI</option></select></div><div class="field allowanceCardPick43165" hidden><label>KART</label><select name="cardId"><option value="">KART SEÇ</option>${state.cards.map(c=>`<option value="${E(c.id)}">${E(c.name)}</option>`).join('')}</select></div><div class="field"><label>AÇIKLAMA</label><textarea name="note" placeholder="İSTEĞE BAĞLI"></textarea></div><button class="primary">KAYDET</button></form></div></div>`;}
 if(k==='allowanceRange43165'){const r=allowanceRange();return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>TARİH ARALIĞI</b><button class="close" onclick="closeModal()">×</button></div><div class="field"><label>BAŞLANGIÇ</label><input id="allowStart43165" type="date" value="${E(window.rutinAllowanceCustom.start||r.start)}"></div><div class="field"><label>BİTİŞ</label><input id="allowEnd43165" type="date" value="${E(window.rutinAllowanceCustom.end||r.end)}"></div><button class="primary" onclick="applyAllowanceRangeV43165()">UYGULA</button></div></div>`;}
 if(k==='menu'){
   const items=[['home','⌂','ANA SAYFA'],['work','▣','ÇALIŞMA'],['expenses','▤','HARCAMALAR'],['allowance','₺','HARÇLIK'],['expenseAnalytics','▥','HARCAMA ANALİZİ'],['calendar','◉','TAKVİM'],['reports','◆','RAPORLAR'],['finance','▰','FİNANS / KARTLAR'],['notes','✎','NOTLAR'],['profile','●','PROFİL'],['settings','⚙','AYARLAR']];
   return `<div class="modal menu4311Modal" onclick="safeBackdropClose(event)"><div class="sheet menu4311Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>UYGULAMA MENÜSÜ</b><button class="close" onclick="closeModal()">×</button></div><div class="menu4311List v3MenuList">${items.map(x=>`<button onclick="closeModal();go('${x[0]}')"><i>${x[1]}</i><b>${x[2]}</b><span>›</span></button>`).join('')}</div></div></div>`;
 }
 return prevModal(k);
};

const prevGo=window.go;
window.go=function(s){if(s==='allowance'||s==='allowancePerson'){const cur=screen||'home';if(s!==cur&&window.rutinNavHistory&&!window.__rutinBackNav){window.rutinNavHistory.push({screen:cur,financeTab:window.financeTabV4310||'cards'});}screen=s;modal=null;render();return;}return prevGo(s)};
const prevRender=window.render;
window.render=function(){if(screen==='allowance'){document.getElementById('app').innerHTML=`<main class="phone">${allowanceScreenV43165()}${nav()}</main>${modal?modalHtml(modal):''}`;return;}if(screen==='allowancePerson'){document.getElementById('app').innerHTML=`<main class="phone">${allowancePersonV43165()}${nav()}</main>${modal?modalHtml(modal):''}`;return;}prevRender();};

// Add allowance to "more" screen without replacing existing content.
const oldMoreRender=window.render;
// Settings cleanup: keep one backup entry and hide duplicate direct restore row.
const oldSettings=window.settings;
window.settings=function(){let h=oldSettings();h=h.replace('YEDEKLEME / GERİ YÜKLE','YEDEKLEME');h=h.replace(/<div class="setting clickable premiumSetting" onclick="document\.getElementById\('dataImportFile'\)\.click\(\)">[\s\S]*?<\/div>\s*<input id="dataImportFile"[^>]*>/,'');return h;};

save();
})();

/* ===== END v43165_cards_allowance.js ===== */
;

/* ===== BEGIN v431651_integrity_fix.js ===== */
/* RUTIN V43.16.5.1 — integrity fixes: card/flex atomic sync, 31-day statements, allowance person filters */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=s=>String(s||'').trim().toLocaleUpperCase('tr-TR');
state.cards=Array.isArray(state.cards)?state.cards:[];
state.flexAccounts=Array.isArray(state.flexAccounts)?state.flexAccounts:[];
state.expenses=Array.isArray(state.expenses)?state.expenses:[];
state.flexAccounts.forEach(a=>a.transactions=Array.isArray(a.transactions)?a.transactions:[]);
state.cards.forEach(a=>a.transactions=Array.isArray(a.transactions)?a.transactions:[]);

function cardById(id){return state.cards.find(x=>String(x.id)===String(id));}
function flexById(id){return state.flexAccounts.find(x=>String(x.id)===String(id));}
function expenseById(id){return state.expenses.find(x=>String(x.id)===String(id));}
function linkedTx(arr,x){return (arr||[]).find(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));}

function detachFunding(x){
 if(!x)return;
 if(x.sourceType==='card'||x.cardId||x.method==='KREDİ KARTI'){
   state.cards.forEach(c=>{
     c.transactions=Array.isArray(c.transactions)?c.transactions:[];
     const rm=c.transactions.filter(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));
     if(rm.length){c.balance=Math.max(0,N(c.balance)-rm.filter(t=>t.type!=='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0));c.transactions=c.transactions.filter(t=>!rm.includes(t));}
   });
 }
 if(x.sourceType==='flex'||x.flexId||x.method==='ESNEK HESAP'){
   state.flexAccounts.forEach(a=>{
     a.transactions=Array.isArray(a.transactions)?a.transactions:[];
     const rm=a.transactions.filter(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));
     if(rm.length){a.balance=Math.max(0,N(a.balance)-rm.filter(t=>t.type!=='payment').reduce((s,t)=>s+Math.abs(N(t.amount)),0));a.transactions=a.transactions.filter(t=>!rm.includes(t));}
   });
 }
 Object.assign(x,{sourceType:'',sourceId:'',cardId:'',cardName:'',flexId:'',flexName:''});
}
function attachCard(x,id){
 const c=cardById(id); if(!c)return false;
 c.transactions=Array.isArray(c.transactions)?c.transactions:[];
 const t={id:uid(),expenseId:x.id,title:x.title||x.category||'HARCAMA',category:x.category||'DİĞER',amount:N(x.amount),date:x.date,type:'spend'};
 c.transactions.push(t);c.balance=N(c.balance)+N(x.amount);
 Object.assign(x,{method:'KREDİ KARTI',sourceType:'card',sourceId:t.id,cardId:c.id,cardName:c.name||'KREDİ KARTI',flexId:'',flexName:''});return true;
}
function attachFlex(x,id){
 const a=flexById(id); if(!a)return false;
 a.transactions=Array.isArray(a.transactions)?a.transactions:[];
 const t={id:uid(),expenseId:x.id,title:x.title||x.category||'HARCAMA',category:x.category||'DİĞER',amount:N(x.amount),date:x.date,type:'spend'};
 a.transactions.push(t);a.balance=N(a.balance)+N(x.amount);
 Object.assign(x,{method:'ESNEK HESAP',sourceType:'flex',sourceId:t.id,flexId:a.id,flexName:a.name||'ESNEK HESAP',cardId:'',cardName:''});return true;
}
function validateFunding(method,cardId,flexId){
 if(method==='KREDİ KARTI'&&!cardById(cardId))return 'LÜTFEN KULLANILAN KREDİ KARTINI SEÇİN.';
 if(method==='ESNEK HESAP'&&!flexById(flexId))return 'LÜTFEN KULLANILAN ESNEK HESABI SEÇİN.';
 return '';
}
function updateExpenseAtomic(x,d){
 const method=U(d.method||x.method||'NAKİT');
 const priorCard=x.cardId||''; const priorFlex=x.flexId||'';
 const cardId=d.cardId||priorCard, flexId=d.flexId||priorFlex;
 const err=validateFunding(method,cardId,flexId); if(err){alert(err);return false;}
 const category=U(d.category||x.category||'DİĞER');
 const customTitle=category==='DİĞER'?U(d.customTitle||x.customTitle||x.title||'DİĞER'):'';
 const recipient=category==='HARÇLIK'?U(d.recipient!==undefined?d.recipient:(x.recipient||x.person||'')):'';
 const next={amount:N(d.amount),category,title:category==='DİĞER'?(customTitle||'DİĞER'):category,customTitle,recipient,person:recipient,date:d.date||x.date,method,note:d.note!==undefined?d.note:(x.note||'')};
 // All validation is complete before changing balances/links.
 detachFunding(x); Object.assign(x,next);
 if(method==='KREDİ KARTI'&&!attachCard(x,cardId))return false;
 if(method==='ESNEK HESAP'&&!attachFlex(x,flexId))return false;
 return true;
}
window.rutinDetachFundingV431651=detachFunding;
window.rutinAttachFlexV431651=attachFlex;

// Repair old flex-linked expenses where a transaction already contains expenseId.
state.expenses.forEach(x=>{
 if(x.sourceType==='flex'&&x.flexId)return;
 const a=state.flexAccounts.find(z=>linkedTx(z.transactions,x));
 if(a&&x.method==='ESNEK HESAP'){const t=linkedTx(a.transactions,x);Object.assign(x,{sourceType:'flex',sourceId:t.id,flexId:a.id,flexName:a.name||'ESNEK HESAP'});t.expenseId=x.id;}
});

window.toggleExpenseV43165=function(f){
 const c=f.querySelector('[name=category]:checked')?.value||'';
 const a=f.querySelector('.allowance43165');if(a)a.hidden=c!=='HARÇLIK';
 const o=f.querySelector('.other43165');if(o)o.hidden=c!=='DİĞER';
 const m=f.querySelector('[name=method]:checked')?.value||f.querySelector('[name=method]')?.value||'NAKİT';
 const cp=f.querySelector('.cardPick43165');if(cp)cp.hidden=m!=='KREDİ KARTI';
 const fp=f.querySelector('.flexPick431651');if(fp)fp.hidden=m!=='ESNEK HESAP';
};
function fundingFields(method='NAKİT',cardId='',flexId=''){
 return `<div class="field"><label>ÖDEME YÖNTEMİ</label><div class="payIcons"><label><input type="radio" name="method" value="NAKİT" ${method==='NAKİT'?'checked':''} onchange="toggleExpenseV43165(this.form)"><i>₺</i><span>NAKİT</span></label><label><input type="radio" name="method" value="KREDİ KARTI" ${method==='KREDİ KARTI'?'checked':''} onchange="toggleExpenseV43165(this.form)"><i>▰</i><span>KREDİ KARTI</span></label><label><input type="radio" name="method" value="ESNEK HESAP" ${method==='ESNEK HESAP'?'checked':''} onchange="toggleExpenseV43165(this.form)"><i>▥</i><span>ESNEK HESAP</span></label></div></div><div class="field cardPick43165" ${method==='KREDİ KARTI'?'':'hidden'}><label>HANGİ KART?</label><select name="cardId"><option value="">KART SEÇ</option>${state.cards.map(c=>`<option value="${E(c.id)}" ${String(c.id)===String(cardId)?'selected':''}>${E(c.name)}</option>`).join('')}</select></div><div class="field flexPick431651" ${method==='ESNEK HESAP'?'':'hidden'}><label>HANGİ ESNEK HESAP?</label><select name="flexId"><option value="">HESAP SEÇ</option>${state.flexAccounts.map(a=>`<option value="${E(a.id)}" ${String(a.id)===String(flexId)?'selected':''}>${E(a.name)}</option>`).join('')}</select></div>`;
}
window.expenseForm=function(){
 const cats=(state.categories||[]).map((c,i)=>`<label class="catChip"><input type="radio" name="category" value="${E(c)}" ${i===0?'checked':''} onchange="toggleExpenseV43165(this.form)"><i>${window.rutinCategoryIcon?rutinCategoryIcon(c):'₺'}</i><span>${E(c)}</span></label>`).join('');
 return `<form onsubmit="submitExpenseV43165(event)">${field('amount','TUTAR',0,'number')}<div class="field"><label>KATEGORİ</label><div class="categoryIcons v18Cats">${cats}</div></div><div class="field other43165" hidden><label>HARCAMA ADI</label><input name="customTitle" placeholder="HARCAMA ADI"></div><div class="field allowance43165" hidden><label>KİME VERİLDİ?</label><input name="recipient" placeholder="ADI"></div>${fundingFields()}${field('date','TARİH',iso(),'date')}${textarea('note','NOT (İSTEĞE BAĞLI)')}<button class="primary">KAYDET</button></form>`;
};
window.submitExpenseV43165=function(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),amount=N(d.amount),category=U(d.category||'DİĞER'),method=U(d.method||'NAKİT');
 if(amount<=0)return alert('TUTAR GİRİN.');const err=validateFunding(method,d.cardId,d.flexId);if(err)return alert(err);
 const customTitle=category==='DİĞER'?U(d.customTitle||''):'',recipient=category==='HARÇLIK'?U(d.recipient||''):'';if(category==='HARÇLIK'&&!recipient)return alert('HARÇLIK İÇİN KİŞİ ADINI GİRİN.');
 const x={id:uid(),date:d.date||iso(),title:category==='DİĞER'?(customTitle||'DİĞER'):category,customTitle,recipient,person:recipient,amount,category,method:'NAKİT',cardId:'',cardName:'',flexId:'',flexName:'',sourceType:'',sourceId:'',note:d.note||''};
 state.expenses.push(x);if(method==='KREDİ KARTI')attachCard(x,d.cardId);else if(method==='ESNEK HESAP')attachFlex(x,d.flexId);else x.method='NAKİT';save();modal=null;if(window.showToastV43162)showToastV43162('HARCAMA KAYDEDİLDİ ✓');render();
};
window.v4313SaveExpense=function(e,id){e.preventDefault();const x=expenseById(id);if(!x)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries());if(updateExpenseAtomic(x,d)){save();modal=null;if(window.showToastV43162)showToastV43162('HARCAMA GÜNCELLENDİ ✓');render();}};
window.submitEditExpense=function(e,id,oldDs=''){e.preventDefault();const x=expenseById(id);if(!x)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries());if(updateExpenseAtomic(x,d)){save();modal=oldDs?'day:'+x.date:null;if(window.showToastV43162)showToastV43162('HARCAMA GÜNCELLENDİ ✓');render();}};
window.submitEditExpenseV18=function(e,id){e.preventDefault();const x=expenseById(id);if(!x)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries());if(updateExpenseAtomic(x,d)){save();closeModal();render();}};

const prevV4341Save=window.v4341Save;
window.v4341Save=function(e,kind,id){if(kind!=='expense')return prevV4341Save(e,kind,id);e.preventDefault();const x=expenseById(id);if(!x)return;const d=Object.fromEntries(new FormData(e.currentTarget).entries());d.category=x.category||d.title||'DİĞER';d.customTitle=d.title||x.title;if(updateExpenseAtomic(x,d)){save();modal=null;if(window.showToastV43162)showToastV43162('HARCAMA GÜNCELLENDİ ✓');render();}};

// Statement dates support 29/30/31 by using the real last day of each month.
function desiredDay(c){let d=parseInt(c.statementDay,10);return Math.max(1,Math.min(31,isFinite(d)?d:1));}
function dateAt(y,m,day){const last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(day,last),12);}
function isoLocal(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function addDaysLocal(ds,n){const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return isoLocal(d);}
function fmtDate(ds){return new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'});}
function statementPeriod(c,ref=new Date()){
 const day=desiredDay(c),y=ref.getFullYear(),m=ref.getMonth();let end=dateAt(y,m,day);if(ref<end)end=dateAt(y,m-1,day);const prev=dateAt(end.getFullYear(),end.getMonth()-1,day);return{start:addDaysLocal(isoLocal(prev),1),end:isoLocal(end)};
}
window.cardDetailV43163=function(){
 const c=cardById(window.cardDetailIdV43163);if(!c){screen='finance';return finance()}c.transactions=Array.isArray(c.transactions)?c.transactions:[];const p=statementPeriod(c),tx=[...c.transactions].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),periodSpend=tx.filter(t=>t.type!=='payment'&&t.date>=p.start&&t.date<=p.end),spends=periodSpend.reduce((s,t)=>s+Math.abs(N(t.amount)),0);
 // Payments are shown separately after statement close; they usually happen after the cutoff date.
 const payWindowEnd=(()=>{const end=new Date(p.end+'T12:00:00'),pd=parseInt(c.paymentDay,10);if(!isFinite(pd))return new Date(end.getFullYear(),end.getMonth()+1,28,12);let d=dateAt(end.getFullYear(),end.getMonth()+1,Math.max(1,Math.min(31,pd)));if(d<=end)d=dateAt(end.getFullYear(),end.getMonth()+2,Math.max(1,Math.min(31,pd)));return d;})();
 const payStart=addDaysLocal(p.end,1),payEnd=isoLocal(payWindowEnd),payments=tx.filter(t=>t.type==='payment'&&t.date>=payStart&&t.date<=payEnd),pays=payments.reduce((s,t)=>s+Math.abs(N(t.amount)),0);
 return `${header('KART EKSTRESİ',true)}<div class="cardDetailHeroV13"><small>${E(c.name)}</small><strong>${money(c.balance)}</strong><span>GÜNCEL BORÇ</span></div><div class="statementPeriod43165"><small>SON KAPANAN EKSTRE DÖNEMİ</small><b>${fmtDate(p.start)} — ${fmtDate(p.end)}</b></div><div class="v43163CardStats"><div><small>DÖNEM HARCAMA</small><b>${money(spends)}</b></div><div><small>EKSTRE SONRASI ÖDEME</small><b>${money(pays)}</b></div></div><div class="card v43163Dates"><span>HESAP KESİM <b>HER AY ${E(c.statementDay||'-')}</b></span><span>SON ÖDEME <b>${E(c.paymentDay||c.dueDate||'-')}</b></span></div><button class="primary" onclick="openModal('cardPay4310:${c.id}')">NE KADAR ÖDEDİM?</button><div class="section"><b>BU EKSTRE HAREKETLERİ</b><span>${periodSpend.length} İŞLEM</span></div><div class="card list">${periodSpend.length?periodSpend.map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')} · ${E(t.category||'')}</small></div><strong class="red">${money(Math.abs(N(t.amount)))}</strong></div>`).join(''):'<div class="notice">BU EKSTRE DÖNEMİNDE HAREKET YOK.</div>'}</div><div class="section"><b>EKSTRE SONRASI ÖDEMELER</b><span>${payments.length} İŞLEM</span></div><div class="card list">${payments.length?payments.map(t=>`<div class="item"><div><b>${E(t.title||'KART ÖDEMESİ')}</b><small>${E(t.date||'')}</small></div><strong class="green">-${money(Math.abs(N(t.amount)))}</strong></div>`).join(''):'<div class="notice">BU EKSTRE İÇİN KAYITLI ÖDEME YOK.</div>'}</div><div class="section"><b>TÜM KART HAREKETLERİ</b><span>${tx.length}</span></div><div class="card list compact43165">${tx.slice(0,40).map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')}</small></div><strong class="${t.type==='payment'?'green':'red'}">${t.type==='payment'?'-':''}${money(Math.abs(N(t.amount)))}</strong></div>`).join('')||'<div class="notice">HAREKET YOK.</div>'}</div>`;
};

// Person detail gets its own period controls and an accurate period label.
function allowanceDateRange(){
 const f=window.rutinAllowanceFilter||'month',now=new Date(),end=isoLocal(now);let start='0000-01-01',label='TÜM ZAMANLAR';
 if(f==='month'){start=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;label='BU AY';}
 if(f==='3m'){const d=new Date(now);d.setMonth(d.getMonth()-2);d.setDate(1);start=isoLocal(d);label='SON 3 AY';}
 if(f==='1y'){const d=new Date(now);d.setFullYear(d.getFullYear()-1);d.setDate(d.getDate()+1);start=isoLocal(d);label='SON 1 YIL';}
 if(f==='custom'){start=window.rutinAllowanceCustom?.start||end;return{start,end:window.rutinAllowanceCustom?.end||end,label:'ÖZEL TARİH'};}
 return{start,end,label};
}
window.allowancePersonV43165=function(){
 const p=window.rutinAllowancePerson||'',r=allowanceDateRange(),all=state.expenses.filter(x=>U(x.category)==='HARÇLIK'&&U(x.recipient||x.person||'BELİRTİLMEDİ')===U(p)),a=all.filter(x=>(x.date||'')>=r.start&&(x.date||'')<=r.end).sort((x,y)=>String(y.date||'').localeCompare(String(x.date||''))),total=a.reduce((s,x)=>s+N(x.amount),0),avg=a.length?total/a.length:0;
 const tab=(k,l)=>`<button class="${window.rutinAllowanceFilter===k?'active':''}" onclick="setAllowanceFilterV43165('${k}')">${l}</button>`;
 return `${header(p||'HARÇLIK',true)}<div class="allowancePersonHero43165"><i>₺</i><div><small>${E(r.label)} HARÇLIK</small><strong>${money(total)}</strong><span>${a.length} İŞLEM · ORT. ${money(avg)} · TÜMÜ ${money(all.reduce((s,x)=>s+N(x.amount),0))}</span></div></div><div class="allowanceTabs43165">${tab('month','BU AY')}${tab('3m','SON 3 AY')}${tab('1y','SON 1 YIL')}${tab('all','TÜMÜ')}<button class="${window.rutinAllowanceFilter==='custom'?'active':''}" onclick="openModal('allowanceRange43165')">TARİH</button></div><button class="primary" onclick="openModal('allowanceAdd43165:${encodeURIComponent(p)}')">＋ HARÇLIK EKLE</button><div class="section"><b>HAREKETLER</b><span>DÜZENLE / SİL</span></div>${a.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>₺</i><div><b>${E(x.note||'HARÇLIK')}</b><small>${E(x.date)} · ${E(x.method||'NAKİT')}</small></div><strong class="red">-${money(x.amount)}</strong><span>›</span></button>`).join('')||'<div class="notice">BU DÖNEMDE KAYIT YOK.</div>'}`;
};

// Intercept legacy edit modals so card/flex choice is always available.
const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k.startsWith('editRecord:expense:')){const p=k.split(':'),id=p[2],x=expenseById(id);if(!x)return prevModal(k);const cat=U(x.category||'DİĞER');return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HARCAMA KAYDINI DÜZENLE</b><button class="close" onclick="closeModal()">×</button></div><form onsubmit="v4341Save(event,'expense','${E(id)}')">${field('title','HARCAMA',x.title||x.category)}${field('amount','TUTAR',x.amount,'number')}${field('date','TARİH',x.date,'date')}${fundingFields(x.method||'NAKİT',x.cardId||'',x.flexId||'')}${cat==='HARÇLIK'?field('recipient','KİME VERİLDİ?',x.recipient||x.person||''):''}<div class="field"><label>NOT</label><textarea name="note">${E(x.note||'')}</textarea></div><button class="primary">DEĞİŞİKLİĞİ KAYDET</button><button type="button" class="v4341Delete" onclick="v4341Delete('expense','${E(id)}')">KAYDI SİL</button></form></div></div>`;}
 if(k.startsWith('editExpense:')){const p=k.split(':'),id=p[1],ds=p[2]||'',x=expenseById(id);if(!x)return prevModal(k);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HARCAMAYI DÜZENLE</b><button class="close" onclick="closeModal()">×</button></div><form onsubmit="submitEditExpense(event,'${E(id)}','${E(ds)}')">${field('amount','TUTAR',x.amount||0,'number')}${field('category','KATEGORİ',x.category||x.title||'DİĞER')}${fundingFields(x.method||'NAKİT',x.cardId||'',x.flexId||'')}${field('person','KİŞİ ADI (GEREKİYORSA)',x.person||'')}${field('date','TARİH',x.date,'date')}<div class="field"><label>NOT</label><textarea name="note">${E(x.note||'')}</textarea></div><button class="primary">DEĞİŞİKLİĞİ KAYDET</button></form></div></div>`;}
 return prevModal(k);
};


// Every expense delete path also reverses Card/Flex balance and removes its linked transaction.
function deleteExpenseSafe(id){const x=expenseById(id);if(!x)return false;detachFunding(x);state.expenses=state.expenses.filter(z=>String(z.id)!==String(id));return true;}
const prevDeleteRecord651=window.deleteRecord;
window.deleteRecord=function(kind,id,ds=''){if(kind!=='expense')return prevDeleteRecord651?prevDeleteRecord651(kind,id,ds):undefined;if(!confirm('BU HARCAMA SİLİNSİN Mİ?'))return;if(deleteExpenseSafe(id)){save();modal=ds&&String(modal||'').startsWith('day:')?'day:'+ds:null;render();}};
window.deleteExpense=function(id,ds){if(!confirm('BU HARCAMA SİLİNSİN Mİ?'))return;if(deleteExpenseSafe(id)){save();modal=ds?'day:'+ds:null;render();}};
const prevDeleteRecordV435651=window.deleteRecordV435;
window.deleteRecordV435=function(kind,id){if(kind!=='expense')return prevDeleteRecordV435651?prevDeleteRecordV435651(kind,id):undefined;if(!confirm('BU KAYIT SİLİNSİN Mİ?'))return;if(deleteExpenseSafe(id)){save();modal=null;render();}};
const prevV4341Delete651=window.v4341Delete;
window.v4341Delete=function(kind,id){if(kind!=='expense')return prevV4341Delete651?prevV4341Delete651(kind,id):undefined;if(!confirm('BU KAYIT SİLİNSİN Mİ?'))return;if(deleteExpenseSafe(id)){save();modal=null;render();}};
const prevDeleteRoad651=window.deleteRoadV438;
window.deleteRoadV438=function(id,date,workId){if(!expenseById(id))return prevDeleteRoad651?prevDeleteRoad651(id,date,workId):undefined;if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;if(deleteExpenseSafe(id)){save();if(window.openRoadGroupV438)openRoadGroupV438(date,workId);render();}};

save();
})();

/* ===== END v431651_integrity_fix.js ===== */
;

/* ===== BEGIN v43166_calendar_categories.js ===== */
/* RUTIN V43.16.6 — Calendar quick add + allowance quick action + category cards + grouped roads */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const N=v=>Number(v)||0;
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad');
const icon=c=>window.rutinCategoryIcon?window.rutinCategoryIcon(c):'✦';

function monthPrefix43166(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function roadGroups43166(items){
  if(window.groupRoadItemsV438)return window.groupRoadItemsV438(items);
  const normal=(items||[]).filter(x=>!isRoad(x)),map={};
  (items||[]).filter(isRoad).forEach(x=>{const k=`${x.date||''}__${x.workId||''}`;(map[k]||(map[k]=[])).push(x)});
  return {normal,groups:Object.values(map)};
}
function roadCard43166(a){
  if(window.roadGroupCardV438 && a?.length)return window.roadGroupCardV438(a[0].date,a[0].workId,a);
  const x=a?.[0]||{};return `<button class="roadGroupCardV438" onclick="openModal('roadGroupV438:${E(x.date)}:${E(x.workId)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small></div><strong>-${money(sum(a))}</strong><span>›</span></button>`;
}
function expenseRow43166(x){
 return `<button class="globalRecordRowV435 v43166ExpenseRow" onclick="openRecordV435('expense','${E(x.id)}')"><i>${icon(U(x.category||'DİĞER'))}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')}${x.recipient||x.person?' · '+E(x.recipient||x.person):''} · DETAY / DÜZENLE</small></div><strong class="red">-${money(x.amount)}</strong><span>›</span></button>`;
}

// 1) Home quick actions: add Allowance without removing existing actions.
const baseHome43166=window.home;
window.home=function(){
 let h=baseHome43166();
 if(!h.includes('quickAllowance43166')){
   const marker='</div>\n <div class="section"><b>BUGÜNÜN ÖZETİ</b>';
   const btn='<button id="quickAllowance43166" onclick="openModal(\'allowanceAdd43165\')"><i class="luxGlyph">₺</i><span>HARÇLIK</span></button>';
   if(h.includes(marker))h=h.replace(marker,btn+'</div>\n <div class="section"><b>BUGÜNÜN ÖZETİ</b>');
   else h=h.replace(/(<div class="quick[^>]*>)([\s\S]*?)(<\/div>)/,(_,a,b,c)=>a+b+btn+c);
 }
 return h;
};

// 2) Expense screen: all categories (including zero) + grouped road rows.
window.expensesScreen=function(){
 const all=Array.isArray(state.expenses)?state.expenses:[],p=monthPrefix43166(),mm=all.filter(x=>String(x.date||'').startsWith(p)),total=sum(mm);
 const card=mm.filter(x=>U(x.method).includes('KREDİ')).reduce((n,x)=>n+N(x.amount),0),flex=mm.filter(x=>U(x.method).includes('ESNEK')).reduce((n,x)=>n+N(x.amount),0),cash=total-card-flex;
 const cats=Array.from(new Set((state.categories||[]).map(U).filter(Boolean)));
 const catTotals={};mm.forEach(x=>{const c=U(x.category||'DİĞER');catTotals[c]=(catTotals[c]||0)+N(x.amount)});
 const catCards=cats.map(c=>`<button class="v43166CategoryCard" onclick="openModal('categoryDetail:${encodeURIComponent(c)}')"><i>${icon(c)}</i><b>${E(c)}</b><strong>${money(catTotals[c]||0)}</strong><small>${mm.filter(x=>U(x.category||'DİĞER')===c).length} KAYIT · DETAY ›</small></button>`).join('');
 const sorted=all.slice().sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),g=roadGroups43166(sorted);
 const rows=[...g.groups.map(a=>({date:a[0]?.date||'',html:roadCard43166(a)})),...g.normal.map(x=>({date:x.date||'',html:expenseRow43166(x)}))].sort((a,b)=>b.date.localeCompare(a.date)).map(x=>x.html).join('');
 return `${header('HARCAMALAR',true)}
 <div class="expenseHero"><div><small>BU AY HARCAMA</small><strong class="red">${money(total)}</strong></div><button class="premiumAddBtn" onclick="openModal('expense')"><i>＋</i><span>HARCAMA EKLE</span></button></div>
 <div class="paymentSplit v43166PaySplit"><button onclick="openModal('paymentDetail:cash')"><b>₺ ${money(Math.max(0,cash))}</b><small>NAKİT</small></button><button onclick="openModal('paymentDetail:card')"><b>▰ ${money(card)}</b><small>KREDİ KARTI</small></button>${flex?`<button onclick="go('finance')"><b>▥ ${money(flex)}</b><small>ESNEK HESAP</small></button>`:''}</div>
 <div class="section"><b>KATEGORİLER</b><span>TÜMÜ · DOKUN → DETAY</span></div><div class="v43166CategoryGrid">${catCards}</div>
 <div class="section"><b>HARCAMA DÖKÜMÜ</b><span>YOL KAYITLARI GRUPLU</span></div><div class="v43166ExpenseList">${rows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}</div>`;
};

// 3) Calendar day menu: fast add work/expense/allowance + grouped road movements.
function dayPanel43166(ds){
 const w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds),g=roadGroups43166(ex);
 const workRows=w.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('work','${E(x.id)}')"><i>${x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'}</i><div><b>${E(x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ')}</b><small>${E(x.title||'')} · ${x.hours?E(x.hours)+' SAAT · ':''}DETAY / DÜZENLE</small></div><strong class="green">+${money(x.amount||N(x.hours)*N(x.rate))}</strong><span>›</span></button>`).join('');
 const expRows=[...g.groups.map(a=>roadCard43166(a)),...g.normal.map(expenseRow43166)].join('');
 const incRows=inc.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'GELİR')}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="green">+${money(x.amount)}</strong><span>›</span></button>`).join('');
 return `<div class="v432DayHead"><button onclick="shiftDay('${E(ds)}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>HIZLI KAYIT EKLE · KAYDA DOKUN → DETAY</small></div><button onclick="shiftDay('${E(ds)}',1)">›</button></div>
 <div class="v43166DayQuick"><button onclick="openModal('dailyDate:${E(ds)}')"><i>✓</i><span>GÜNLÜK</span></button><button onclick="openModal('hourlyDate:${E(ds)}')"><i>◷</i><span>SAATLİK</span></button><button onclick="openModal('overtimeDate:${E(ds)}')"><i>✦</i><span>MESAİ</span></button><button onclick="openModal('expenseDate:${E(ds)}')"><i>▤</i><span>HARCAMA</span></button><button onclick="openAllowanceDate43166('${E(ds)}')"><i>₺</i><span>HARÇLIK</span></button></div>
 <div class="v43166DayTotals"><span>ÇALIŞMA <b>${w.length}</b></span><span>GELİR <b>${money(sum(inc)+w.reduce((n,x)=>n+N(x.amount||N(x.hours)*N(x.rate)),0))}</b></span><span>HARCAMA <b>${money(sum(ex))}</b></span></div>
 <div class="section"><b>ÇALIŞMA / MESAİ</b></div>${workRows||'<div class="notice">ÇALIŞMA KAYDI YOK.</div>'}
 <div class="section"><b>HARCAMA / YOL</b><span>YOL TEK KART</span></div>${expRows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}
 <div class="section"><b>DİĞER GELİRLER</b></div>${incRows||'<div class="notice">GELİR KAYDI YOK.</div>'}`;
}

window.openAllowanceDate43166=function(ds){window.rutinAllowancePresetDate43166=ds;openModal('allowanceAdd43165');};

const prevModal43166=window.modalHtml;
window.modalHtml=function(k){
 if(k && k.startsWith('day:')){
   const ds=k.slice(4);return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v432Sheet v43166DaySheet" data-day="${E(ds)}" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜN DETAYI</b><button class="close" onclick="closeModal()">×</button></div>${dayPanel43166(ds)}</div></div>`;
 }
 return prevModal43166(k);
};

// 4) Post-render enhancements: selected allowance date + clearer calendar indicators.
const baseRender43166=window.render;
window.render=function(){
 baseRender43166();
 if(window.rutinAllowancePresetDate43166 && String(modal||'')==='allowanceAdd43165'){
   const el=document.querySelector('.modal input[name="date"]');if(el)el.value=window.rutinAllowancePresetDate43166;window.rutinAllowancePresetDate43166='';
 }
 // Make calendar days with records more legible without changing their data logic.
 document.querySelectorAll('.premiumDay.hasData').forEach(b=>b.classList.add('v43166HasData'));
};

save();
})();

/* ===== END v43166_calendar_categories.js ===== */
;

/* ===== BEGIN v43167_report_quickfix.js ===== */
/* RUTIN V43.16.7 — daily road grouping in reports + Home quick Allowance tab */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const N=v=>Number(v)||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad' || U(x.title)==='YOL' || U(x.note).includes('ÇALIŞMA YOL'));
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
const roadByDate=(items)=>{const map={};(items||[]).filter(isRoad).forEach(x=>{const k=String(x.date||'');(map[k]||(map[k]=[])).push(x)});return Object.values(map).sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')))};
const payTotals=a=>({
 cash:sum(a.filter(x=>U(x.method).includes('NAKİT'))),
 card:sum(a.filter(x=>U(x.method).includes('KREDİ'))),
 flex:sum(a.filter(x=>U(x.method).includes('ESNEK')))
});

function dailyRoadCard(a){
 const x=a?.[0]||{},p=payTotals(a),bits=[];
 if(p.card)bits.push(`${money(p.card)} KART`);if(p.cash)bits.push(`${money(p.cash)} NAKİT`);if(p.flex)bits.push(`${money(p.flex)} ESNEK`);
 return `<button class="roadGroupCardV438" onclick="openModal('roadDay43167:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${bits.join(' · ')}</em></div><strong>-${money(sum(a))}</strong><span>›</span></button>`;
}

// HOME: Finance is already on bottom navigation. Replace it with Allowance CENTER, not Allowance Add.
const prevHome43167=window.home;
window.home=function(){
 let h=prevHome43167();
 const start=h.indexOf('<div class="section"><b>HIZLI İŞLEMLER</b>');
 const end=h.indexOf('<div class="section"><b>BUGÜNÜN ÖZETİ</b>',start);
 if(start>=0 && end>start){
   let block=h.slice(start,end);
   block=block.replace(/<button[^>]*id="quickAllowance43166"[\s\S]*?<\/button>/g,'');
   block=block.replace(/<button[^>]*onclick="go\('finance'\)"[\s\S]*?<\/button>/g,'');
   if(!block.includes("go('allowance')")){
     const btn=`<button id="quickAllowance43167" onclick="go('allowance')"><i class="qv32 qFinance">₺</i><span>HARÇLIK</span></button>`;
     const pos=block.lastIndexOf('</div>');
     if(pos>=0)block=block.slice(0,pos)+btn+block.slice(pos);
   }
   h=h.slice(0,start)+block+h.slice(end);
 }
 return h;
};

// REPORTS: group ALL work-road payments on the same date into one card, regardless of workId.
const prevReports43167=window.reports;
window.reports=function(){
 let h=prevReports43167();
 try{
   const marker='<div class="section"><b>AYRINTILI HAREKETLER</b>';
   const at=h.lastIndexOf(marker);if(at<0)return h;
   const base=h.slice(0,at),s=state.reportStart||monthStart(),e=state.reportEnd||monthEnd(),inP=d=>d>=s&&d<=e;
   const work=(state.work||[]).filter(x=>inP(x.date)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
   const inc=(state.incomes||[]).filter(x=>inP(x.date)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
   const exp=(state.expenses||[]).filter(x=>inP(x.date));
   const roads=roadByDate(exp),normal=exp.filter(x=>!isRoad(x)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
   const wr=work.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('work','${E(x.id)}')"><i>▣</i><div><b>${E(x.title||'ÇALIŞMA')}</b><small>${E(x.date)} · AYRINTI / DÜZENLE / SİL</small></div><strong class="gold">+${money(x.amount||0)}</strong><span>›</span></button>`).join('');
   const ir=inc.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'DİĞER GELİR')}</b><small>${E(x.date)} · AYRINTI / DÜZENLE / SİL</small></div><strong class="green">+${money(x.amount||0)}</strong><span>›</span></button>`).join('');
   const er=normal.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'₺'}</i><div><b>${E(x.category||x.title||'HARCAMA')}</b><small>${E(x.date)} · ${E(x.method||'NAKİT')} · AYRINTI / DÜZENLE / SİL</small></div><strong class="red">-${money(x.amount||0)}</strong><span>›</span></button>`).join('');
   const rg=roads.map(dailyRoadCard).join('');
   return base+`<div class="section"><b>AYRINTILI HAREKETLER</b><span>YOL TARİHE GÖRE GRUPLU</span></div><div class="reportGroupV435"><div class="section"><b>GELİR / ÇALIŞMA HAREKETLERİ</b><span>DOKUN → AYRINTI</span></div>${wr+ir||'<div class="notice">KAYIT YOK.</div>'}</div><div class="reportGroupV435"><div class="section"><b>HARCAMA / YOL HAREKETLERİ</b><span>AYNI GÜN TÜM YOL ÖDEMELERİ TEK KART</span></div>${rg+er||'<div class="notice">KAYIT YOK.</div>'}</div>`;
 }catch(err){return h;}
};
window.detailReport=window.reports;

const prevModal43167=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('roadDay43167:')){
   const date=k.slice('roadDay43167:'.length),a=(state.expenses||[]).filter(x=>String(x.date||'')===date&&isRoad(x)),p=payTotals(a);
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${money(sum(a))}</strong><div><span>💳 ${money(p.card)} KART</span><span>💵 ${money(p.cash)} NAKİT</span>${p.flex?`<span>▥ ${money(p.flex)} ESNEK</span>`:''}</div></div><div class="section"><b>YOL ÖDEMELERİ</b><span>TEK TEK DÜZENLE / SİL</span></div>${a.map((x,i)=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||((i%2)?'DÖNÜŞ':'GİDİŞ'))}</i><div><b>${E(x.direction||'YOL')} · ${money(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay43167('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;
 }
 return prevModal43167(k);
};
window.deleteRoadDay43167=function(id,date){if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;let ok=false;if(window.deleteExpenseSafe)ok=deleteExpenseSafe(id);else{const n=(state.expenses||[]).length;state.expenses=(state.expenses||[]).filter(x=>String(x.id)!==String(id));ok=state.expenses.length<n;}if(ok){save();render();const left=(state.expenses||[]).some(x=>String(x.date||'')===String(date)&&isRoad(x));if(left)openModal('roadDay43167:'+date);else closeModal();}};
})();

/* ===== END v43167_report_quickfix.js ===== */
;

/* ===== BEGIN v43168_navigation_interaction.js ===== */
/* RUTIN V43.16.8 — swipe navigation + scroll/history memory + clickable home + longer recent records */
(function(){
'use strict';
const MAIN=['home','work','expenses','calendar','reports','finance','more'];
const screenScroll=window.rutinScreenScrollV43168=window.rutinScreenScrollV43168||{};
let lastRendered=(typeof screen!=='undefined'&&screen)||'home';
let restoring=false;
const y=()=>Math.max(0,window.scrollY||document.documentElement.scrollTop||document.body.scrollTop||0);
const rafScroll=(v)=>requestAnimationFrame(()=>requestAnimationFrame(()=>{restoring=true;window.scrollTo(0,Math.max(0,Number(v)||0));setTimeout(()=>restoring=false,30)}));
function saveScrollFor(s){if(!s||restoring)return;screenScroll[s]=y();}
function navEntry(s){return {screen:s,financeTab:window.financeTabV4310||'cards',scrollY:screenScroll[s]||0};}

// Render wrapper: keep the previous screen's position and restore the destination's remembered position.
const baseRender43168=window.render;
window.render=function(){
  try{saveScrollFor(lastRendered);}catch(_){ }
  const destination=(typeof screen!=='undefined'&&screen)||'home';
  baseRender43168();
  lastRendered=destination;
  const target=window.__rutinRestoreScrollV43168!=null?window.__rutinRestoreScrollV43168:(screenScroll[destination]||0);
  window.__rutinRestoreScrollV43168=null;
  rafScroll(target);
  requestAnimationFrame(()=>{bindSwipe43168();bindHomeClicks43168();});
};

// One navigation implementation at the final layer so earlier overrides cannot lose scroll state.
window.go=function(s){
  if(s==='investments'){window.financeTabV4310='investments';s='finance';}
  const cur=(typeof screen!=='undefined'&&screen)||'home';
  saveScrollFor(cur);
  if(s!==cur && !window.__rutinBackNav){
    window.rutinNavHistory=window.rutinNavHistory||[];
    window.rutinNavHistory.push(navEntry(cur));
    if(window.rutinNavHistory.length>40)window.rutinNavHistory.shift();
  }
  window.__rutinBackNav=false;
  screen=s;modal=null;
  window.__rutinRestoreScrollV43168=screenScroll[s]||0;
  window.render();
};
window.goBackRutin=function(){
  modal=null;
  const cur=(typeof screen!=='undefined'&&screen)||'home';saveScrollFor(cur);
  const prev=(window.rutinNavHistory||[]).pop();
  if(prev){
    window.__rutinBackNav=true;
    if(prev.financeTab)window.financeTabV4310=prev.financeTab;
    screen=prev.screen||'home';
    window.__rutinRestoreScrollV43168=Number(prev.scrollY??screenScroll[screen]??0)||0;
    window.render();
    window.__rutinBackNav=false;
    return;
  }
  screen='home';window.__rutinRestoreScrollV43168=screenScroll.home||0;window.render();
};

// Horizontal swipe between bottom-navigation screens. Ignore controls, sheets and horizontal scrollers.
let sx=0,sy=0,tracking=false,startedOnControl=false;
function bindSwipe43168(){
 const root=document.querySelector('main.phone'); if(!root||root.dataset.swipe43168)return; root.dataset.swipe43168='1';
 root.addEventListener('touchstart',e=>{
   if(!e.touches||e.touches.length!==1)return;
   const t=e.target;startedOnControl=!!t.closest('input,textarea,select,button,a,.modal,.sheet,.tabs,.workChoice,.v43166CategoryGrid,.quick,.navV37');
   sx=e.touches[0].clientX;sy=e.touches[0].clientY;tracking=true;
 },{passive:true});
 root.addEventListener('touchend',e=>{
   if(!tracking){return;} tracking=false;if(startedOnControl)return;
   const p=e.changedTouches&&e.changedTouches[0];if(!p)return;
   const dx=p.clientX-sx,dy=p.clientY-sy;if(Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.35)return;
   const cur=(typeof screen!=='undefined'&&screen)||'home',i=MAIN.indexOf(cur);if(i<0)return;
   const ni=dx<0?i+1:i-1;if(ni>=0&&ni<MAIN.length)window.go(MAIN[ni]);
 },{passive:true});
}

// Make home summaries explicitly interactive after render; preserve the existing HTML/CSS structure.
function bindHomeClicks43168(){
 if(((typeof screen!=='undefined'&&screen)||'')!=='home')return;
 const stats=[...document.querySelectorAll('.stats .stat')];
 stats.forEach((el,i)=>{
   if(el.dataset.click43168)return;el.dataset.click43168='1';el.classList.add('statClick43168');el.setAttribute('role','button');el.tabIndex=0;
   const act=()=>i<2?openModal('day:'+iso()):go('reports');
   el.addEventListener('click',act);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
 });
 document.querySelectorAll('.summaryBox .summaryRow').forEach(el=>{
   if(el.dataset.click43168)return;el.dataset.click43168='1';el.classList.add('summaryClick43168');el.setAttribute('role','button');el.tabIndex=0;
   const act=()=>openModal('day:'+iso());el.addEventListener('click',act);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}});
 });
}

// Longer recent work list (same record semantics, only 8 -> 30).
window.workRows=function(type){
 const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
 const a=(state.work||[]).filter(x=>x.type===type).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).slice(0,30);
 return a.length?a.map(x=>{const rc=(state.expenses||[]).filter(r=>String(r.workId||'')===String(x.id)&&String(r.category||'').toLocaleUpperCase('tr-TR')==='YOL'),rt=rc.reduce((n,r)=>n+(+r.amount||0),0);return `<button class="v436WorkRow" onclick="openRecordV435('work','${E(x.id)}')"><div class="ico">${type==='daily'?'✓':type==='hourly'?'◷':'★'}</div><div class="v436WorkText"><b>${E(x.title||'ÇALIŞMA')}</b><small>${E(x.date||'')}${x.hours?' · '+E(x.hours)+' SAAT':''}${rt?' · YOL '+money(rt):''}</small><em class="paid">KAZANÇ / ÖDEME DETAYI İÇİN DOKUN</em></div><strong>${money(x.amount||0)}</strong><span>›</span></button>`}).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>';
};

// Keep scroll value current while user moves around long lists.
let scrollTimer=0;window.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{const s=(typeof screen!=='undefined'&&screen)||lastRendered;screenScroll[s]=y();},80)},{passive:true});

requestAnimationFrame(()=>{bindSwipe43168();bindHomeClicks43168();});
})();

/* ===== END v43168_navigation_interaction.js ===== */
;

/* ===== BEGIN v43169_report_road_fix.js ===== */
/* RUTIN V43.16.9 — report road grouping fix: true date-based grouping in main report + expense detail */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const N=v=>Number(v)||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad' || U(x.title)==='YOL' || U(x.note).includes('ÇALIŞMA YOL') || U(x.note).includes('YOL'));
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
function range43169(){
 const p=(typeof reportPeriod!=='undefined'?reportPeriod:'month');
 if(p==='custom'&&window.rutinReportCustom?.start&&window.rutinReportCustom?.end){let s=window.rutinReportCustom.start,e=window.rutinReportCustom.end;if(s>e)[s,e]=[e,s];return{start:s,end:e};}
 const n=new Date(),y=n.getFullYear(),m=n.getMonth(),iso2=d=>typeof iso==='function'?iso(d):d.toISOString().slice(0,10);
 if(p==='day'){const d=iso2(n);return{start:d,end:d};}
 if(p==='week'){const d=new Date(n),q=(d.getDay()+6)%7,s=new Date(d);s.setDate(d.getDate()-q);const e=new Date(s);e.setDate(s.getDate()+6);return{start:iso2(s),end:iso2(e)};}
 if(p==='year')return{start:y+'-01-01',end:y+'-12-31'};
 const mm=String(m+1).padStart(2,'0'),last=String(new Date(y,m+1,0).getDate()).padStart(2,'0');return{start:y+'-'+mm+'-01',end:y+'-'+mm+'-'+last};
}
function currentExpenses43169(){const r=range43169();return (state.expenses||[]).filter(x=>x&&x.date>=r.start&&x.date<=r.end);}
function groups43169(items){const map={};(items||[]).filter(isRoad).forEach(x=>{const k=String(x.date||'');(map[k]||(map[k]=[])).push(x)});return Object.values(map).sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')));}
function payTotals43169(a){return{cash:sum(a.filter(x=>U(x.method).includes('NAKİT'))),card:sum(a.filter(x=>U(x.method).includes('KREDİ'))),flex:sum(a.filter(x=>U(x.method).includes('ESNEK')))};}
function roadCard43169(a){const x=a?.[0]||{},p=payTotals43169(a),parts=[];if(p.card)parts.push(M(p.card)+' KART');if(p.cash)parts.push(M(p.cash)+' NAKİT');if(p.flex)parts.push(M(p.flex)+' ESNEK');return `<button class="roadGroupCardV438" onclick="openModal('roadDay43169:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${parts.join(' · ')}</em></div><strong>-${M(sum(a))}</strong><span>›</span></button>`;}
function expenseRow43169(x){return `<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'₺'}</i><div><b>${E(x.category||x.title||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')} · AYRINTI</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function groupedExpenseRows43169(items){const roads=groups43169(items),normal=(items||[]).filter(x=>!isRoad(x)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));const rows=[...roads.map(a=>({date:a[0]?.date||'',html:roadCard43169(a)})),...normal.map(x=>({date:x.date||'',html:expenseRow43169(x)}))];return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');}

// Main REPORTS screen: replace the actual "GİDER HAREKETLERİ" section used by current UI.
const prevReports43169=window.reports;
window.reports=function(){
 const h=prevReports43169();
 try{
  const marker='<div class="section"><b>GİDER HAREKETLERİ</b>';
  const at=h.lastIndexOf(marker); if(at<0)return h;
  const items=currentExpenses43169(),rows=groupedExpenseRows43169(items);
  return h.slice(0,at)+`<div class="section"><b>GİDER HAREKETLERİ</b><span>${items.length} KAYIT · YOL TARİHE GÖRE GRUPLU</span></div>${rows||'<div class="notice">KAYIT YOK.</div>'}`;
 }catch(e){return h;}
};
window.detailReport=window.reports;

// Expense-detail modal reached from the report chart: use the same grouped road logic.
const prevModal43169=window.modalHtml;
window.modalHtml=function(k){
 if(k==='reportExpense43101'){
  const items=currentExpenses43169(),cats={};items.forEach(x=>{const c=x.category||'DİĞER';(cats[c]||(cats[c]=[])).push(x)});
  const cg=Object.entries(cats).sort((a,b)=>sum(b[1])-sum(a[1]));
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GİDER DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="reportCatsV439">${cg.map(([c,a])=>`<div><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(c):'₺'}</i><span><small>${E(c)}</small><b>${M(sum(a))}</b></span><em>${a.length}</em></div>`).join('')||'<div class="notice">KAYIT YOK.</div>'}</div><div class="section"><b>GİDER HAREKETLERİ</b><span>YOL TARİHE GÖRE GRUPLU</span></div>${groupedExpenseRows43169(items)||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;
 }
 if(k&&k.startsWith('roadDay43169:')){
  const date=k.slice('roadDay43169:'.length),a=(state.expenses||[]).filter(x=>String(x.date||'')===String(date)&&isRoad(x)),p=payTotals43169(a);
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${M(sum(a))}</strong><div><span>💳 ${M(p.card)} KART</span><span>💵 ${M(p.cash)} NAKİT</span>${p.flex?`<span>▥ ${M(p.flex)} ESNEK</span>`:''}</div></div><div class="section"><b>YOL ÖDEMELERİ</b><span>TEK TEK DÜZENLE / SİL</span></div>${a.map((x,i)=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||((i%2)?'DÖNÜŞ':'GİDİŞ'))}</i><div><b>${E(x.direction||'YOL')} · ${M(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay43169('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;
 }
 return prevModal43169(k);
};
window.deleteRoadDay43169=function(id,date){if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;let ok=false;if(window.deleteExpenseSafe)ok=deleteExpenseSafe(id);else{const n=(state.expenses||[]).length;state.expenses=(state.expenses||[]).filter(x=>String(x.id)!==String(id));ok=state.expenses.length<n;}if(ok){save();render();const left=(state.expenses||[]).some(x=>String(x.date||'')===String(date)&&isRoad(x));if(left)openModal('roadDay43169:'+date);else closeModal();}};
})();

/* ===== END v43169_report_road_fix.js ===== */
;

/* ===== BEGIN v431691_stable_fix.js ===== */
/* RUTIN V43.16.9.1 STABLE — report road grouping + safe delete + calendar paid-income + allowance flex */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const SUM=a=>(a||[]).reduce((s,x)=>s+N(x.amount),0);
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad' || U(x.title)==='YOL' || U(x.note).includes('ÇALIŞMA YOL'));

function roadGroups(items){
 const map=new Map();
 (items||[]).filter(isRoad).forEach(x=>{const k=String(x.date||'');if(!map.has(k))map.set(k,[]);map.get(k).push(x)});
 return [...map.values()].sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')));
}
function payTotals(a){return{
 cash:SUM((a||[]).filter(x=>U(x.method).includes('NAKİT'))),
 card:SUM((a||[]).filter(x=>U(x.method).includes('KREDİ'))),
 flex:SUM((a||[]).filter(x=>U(x.method).includes('ESNEK')))
};}
function roadCard(a){
 const x=a?.[0]||{},p=payTotals(a),bits=[];
 if(p.card)bits.push(M(p.card)+' KART');if(p.cash)bits.push(M(p.cash)+' NAKİT');if(p.flex)bits.push(M(p.flex)+' ESNEK');
 return `<button class="roadGroupCardV438" onclick="openModal('roadDay431691:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${bits.join(' · ')}</em></div><strong>-${M(SUM(a))}</strong><span>›</span></button>`;
}
function expenseRow(x){return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('expense','${E(x.id)}')"><i>−</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function groupedExpenseRows(items){
 const rows=[...roadGroups(items).map(a=>({date:a[0]?.date||'',html:roadCard(a)})),...(items||[]).filter(x=>!isRoad(x)).map(x=>({date:x.date||'',html:expenseRow(x)}))];
 return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');
}
function workReceived(x){
 try{return typeof workPaid==='function'?N(workPaid(x)):(x.paid===true||x.paymentReceived===true||U(x.paymentStatus)==='ALINDI'?N(x.amount||N(x.hours)*N(x.rate)):0)}catch(_){return 0}
}

// REPORTS: render the actual collapsible expense section with road payments grouped strictly by date.
window.reports=function(){
 const T=accountingTotals(reportPeriod),R=dateRangeForPeriod(reportPeriod),w=filterByPeriod(state.work,reportPeriod),inc=filterByPeriod(state.incomes,reportPeriod),exp=filterByPeriod(state.expenses,reportPeriod);
 const incomes=[...w.filter(x=>workReceived(x)>0).map(x=>['work',x]),...inc.map(x=>['income',x])].sort((a,b)=>(b[1].date||'').localeCompare(a[1].date||''));
 const expenses=exp.slice().sort((a,b)=>(b.date||'').localeCompare(a.date||''));
 const displayExpenseCount=roadGroups(expenses).length+expenses.filter(x=>!isRoad(x)).length;
 const B=(k,l)=>`<button class="${reportPeriod===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`;
 const max=Math.max(1,T.income,T.expense),ip=Math.round(T.income/max*100),ep=Math.round(T.expense/max*100);
 const move=(kind,x)=>{const isEx=kind==='expense',isWork=kind==='work',val=isWork?workReceived(x):N(x.amount),label=isWork?(x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ'):(x.title||x.category||(isEx?'HARCAMA':'GELİR'));return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('${kind}','${E(x.id)}')"><i>${isEx?'−':isWork?'▣':'₺'}</i><div><b>${E(label)}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="${isEx?'red':'green'}">${isEx?'-':'+'}${M(val)}</strong><span>›</span></button>`};
 return `${header('RAPORLAR',true)}
 <div class="stableAccountingTop431642"><button onclick="go('receivables')"><small>HAK EDİLEN</small><strong>${M(T.earned)}</strong></button><button onclick="go('receivables')"><small>ALINAN</small><strong class="green">${M(T.workPaid)}</strong></button><button onclick="go('receivables')"><small>ALACAK</small><strong class="red">${M(T.receivable)}</strong></button></div>
 <div class="tabs stableReportTabs431642">${B('day','GÜNLÜK')}${B('week','HAFTALIK')}${B('month','AYLIK')}${B('year','YILLIK')}<button onclick="openModal('range')">ÖZEL</button></div>
 <div class="v43162SearchCompact stableReportSearch431642"><span>⌕</span><input type="search" placeholder="Hareket ara..." oninput="v431642Search(this.value)"><button type="button" onclick="this.previousElementSibling.value='';v431642Search('')">×</button></div><div id="v431642SearchResults"></div>
 <div class="section"><b>${E(R.label||'SEÇİLİ DÖNEM')}</b><span>GERÇEK PARA HAREKETİ</span></div>
 <div class="stableMoneySummary431642"><div><small>TOPLAM GELİR</small><strong class="green">${M(T.income)}</strong></div><div><small>TOPLAM HARCAMA</small><strong class="red">${M(T.expense)}</strong></div><div><small>NET</small><strong>${M(T.net)}</strong></div></div>
 <div class="dualDonutWrap stableDonuts431642"><button class="donutCard" onclick="typeof openReportIncome43101==='function'&&openReportIncome43101()"><div class="donutRing incomeRing" style="--pct:${ip}"><div class="donutCenter"><small>GELİR</small><strong class="green">${M(T.income)}</strong></div></div></button><button class="donutCard" onclick="typeof openReportExpense43101==='function'&&openReportExpense43101()"><div class="donutRing expenseRing" style="--pct:${ep}"><div class="donutCenter"><small>GİDER</small><strong class="red">${M(T.expense)}</strong></div></div></button></div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('income')"><span><b>GELİR HAREKETLERİ</b><small>${incomes.length} KAYIT</small></span><i>${rutinReportIncomeOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportIncomeOpen?'open':''}">${rutinReportIncomeOpen?(incomes.map(z=>move(z[0],z[1])).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('expense')"><span><b>GİDER HAREKETLERİ</b><small>${expenses.length} KAYIT · ${displayExpenseCount} SATIR</small></span><i>${rutinReportExpenseOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportExpenseOpen?'open':''}">${rutinReportExpenseOpen?(groupedExpenseRows(expenses)||'<div class="notice">KAYIT YOK.</div>'):''}</div>`;
};
window.detailReport=window.reports;

// Safe road delete, including Card/Flex reversal.
function safeDeleteExpense(id){
 const x=(state.expenses||[]).find(z=>String(z.id)===String(id));if(!x)return false;
 if(typeof window.rutinDetachFundingV431651==='function')window.rutinDetachFundingV431651(x);
 state.expenses=(state.expenses||[]).filter(z=>String(z.id)!==String(id));return true;
}
window.deleteExpenseSafe=safeDeleteExpense;

// Modal patches: report road detail, calendar paid-income, allowance Flex Account.
const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('roadDay431691:')){
  const date=k.slice('roadDay431691:'.length),a=(state.expenses||[]).filter(x=>String(x.date||'')===String(date)&&isRoad(x)),p=payTotals(a);
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${M(SUM(a))}</strong><div><span>💳 ${M(p.card)} KART</span><span>💵 ${M(p.cash)} NAKİT</span>${p.flex?`<span>▥ ${M(p.flex)} ESNEK</span>`:''}</div></div><div class="section"><b>YOL ÖDEMELERİ</b><span>TEK TEK DÜZENLE / SİL</span></div>${a.map((x,i)=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||((i%2)?'DÖNÜŞ':'GİDİŞ'))}</i><div><b>${E(x.direction||'YOL')} · ${M(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):x.flexName?' · '+E(x.flexName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay431691('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;
 }
 if(k&&k.startsWith('allowanceAdd43165')){
  const preset=k.includes(':')?decodeURIComponent(k.split(':').slice(1).join(':')):'';
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>HARÇLIK EKLE</b><button class="close" onclick="closeModal()">×</button></div><form onsubmit="submitAllowanceV431691(event,'${E(preset)}')"><div class="field"><label>KİŞİ</label><input name="recipient" value="${E(preset)}" placeholder="KİME VERİLDİ?"></div>${field('amount','TUTAR',0,'number')}${field('date','TARİH',iso(),'date')}<div class="field"><label>ÖDEME</label><select name="method" onchange="toggleAllowanceFundingV431691(this.form)"><option value="NAKİT">NAKİT</option><option value="KREDİ KARTI">KREDİ KARTI</option><option value="ESNEK HESAP">ESNEK HESAP</option></select></div><div class="field allowanceCardPick431691" hidden><label>KART</label><select name="cardId"><option value="">KART SEÇ</option>${(state.cards||[]).map(c=>`<option value="${E(c.id)}">${E(c.name)}</option>`).join('')}</select></div><div class="field allowanceFlexPick431691" hidden><label>ESNEK HESAP</label><select name="flexId"><option value="">HESAP SEÇ</option>${(state.flexAccounts||[]).map(a=>`<option value="${E(a.id)}">${E(a.name)}</option>`).join('')}</select></div><div class="field"><label>AÇIKLAMA</label><textarea name="note" placeholder="İSTEĞE BAĞLI"></textarea></div><button class="primary">KAYDET</button></form></div></div>`;
 }
 const h=prevModal(k);
 if(k&&k.startsWith('day:')){
  const ds=k.slice(4),w=(state.work||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds),actual=SUM(inc)+w.reduce((s,x)=>s+workReceived(x),0);
  return String(h).replace(/<span>GELİR <b>[^<]*<\/b><\/span>/,`<span>GELİR <b>${M(actual)}</b></span>`);
 }
 return h;
};

window.deleteRoadDay431691=function(id,date){
 if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;
 if(safeDeleteExpense(id)){save();render();const left=(state.expenses||[]).some(x=>String(x.date||'')===String(date)&&isRoad(x));if(left)openModal('roadDay431691:'+date);else closeModal();}
};
window.toggleAllowanceFundingV431691=function(f){
 const m=U(f.method?.value||'NAKİT'),c=f.querySelector('.allowanceCardPick431691'),x=f.querySelector('.allowanceFlexPick431691');if(c)c.hidden=m!=='KREDİ KARTI';if(x)x.hidden=m!=='ESNEK HESAP';
};
window.submitAllowanceV431691=function(e,preset=''){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),amount=N(d.amount),recipient=U(d.recipient||preset),method=U(d.method||'NAKİT');
 if(!recipient)return alert('KİŞİ ADINI GİRİN.');if(amount<=0)return alert('TUTAR GİRİN.');
 const card=method==='KREDİ KARTI'?(state.cards||[]).find(c=>String(c.id)===String(d.cardId)):null,flex=method==='ESNEK HESAP'?(state.flexAccounts||[]).find(a=>String(a.id)===String(d.flexId)):null;
 if(method==='KREDİ KARTI'&&!card)return alert('KART SEÇİN.');if(method==='ESNEK HESAP'&&!flex)return alert('ESNEK HESAP SEÇİN.');
 const x={id:uid(),date:d.date||iso(),title:'HARÇLIK',category:'HARÇLIK',recipient,person:recipient,amount,method:'NAKİT',note:d.note||'',cardId:'',cardName:'',flexId:'',flexName:'',sourceType:'',sourceId:''};
 state.expenses.push(x);
 if(method==='KREDİ KARTI'){
   card.transactions=Array.isArray(card.transactions)?card.transactions:[];const t={id:uid(),expenseId:x.id,title:'HARÇLIK',category:'HARÇLIK',amount,date:x.date,type:'spend'};card.transactions.push(t);card.balance=N(card.balance)+amount;Object.assign(x,{method:'KREDİ KARTI',sourceType:'card',sourceId:t.id,cardId:card.id,cardName:card.name||'KREDİ KARTI'});
 }else if(method==='ESNEK HESAP'){
   if(typeof window.rutinAttachFlexV431651==='function')window.rutinAttachFlexV431651(x,flex.id);else{flex.transactions=Array.isArray(flex.transactions)?flex.transactions:[];const t={id:uid(),expenseId:x.id,title:'HARÇLIK',category:'HARÇLIK',amount,date:x.date,type:'spend'};flex.transactions.push(t);flex.balance=N(flex.balance)+amount;Object.assign(x,{method:'ESNEK HESAP',sourceType:'flex',sourceId:t.id,flexId:flex.id,flexName:flex.name||'ESNEK HESAP'});}
 } else x.method='NAKİT';
 save();modal=null;screen=preset?'allowancePerson':'allowance';window.rutinAllowancePerson=recipient;if(window.showToastV43162)showToastV43162('HARÇLIK KAYDEDİLDİ ✓');render();
};
})();

/* ===== END v431691_stable_fix.js ===== */
;

/* ===== BEGIN v4317_standard_migration.js ===== */
/* RUTIN V43.17 — UI standard + legacy phone data migration + report consistency */
(function(){
'use strict';
const VERSION='43.17';
const E=v=>typeof esc==='function'?esc(String(v??'')):String(v??'');
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=v=>String(v??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>typeof money==='function'?money(N(v)):N(v).toLocaleString('tr-TR')+' ₺';
const arr=v=>Array.isArray(v)?v:[];
const isRoad=x=>!!x&&(U(x.category)==='YOL'||x.sourceType==='workRoad'||!!x.workId&&U(x.title)==='YOL');
const isAllowance=x=>!!x&&(U(x.category)==='HARÇLIK'||U(x.title)==='HARÇLIK');

/* ---------- SAFE, ONE-TIME LEGACY MIGRATION ---------- */
function migrateLegacy4317(){
 state.meta=state.meta||{};
 if(N(state.meta.v4317Migration)>=1)return false;
 try{
   if(!localStorage.getItem('rutin-pre-v4317-backup')) localStorage.setItem('rutin-pre-v4317-backup',JSON.stringify(state));
 }catch(_){ }
 state.work=arr(state.work);state.expenses=arr(state.expenses);state.incomes=arr(state.incomes);
 state.cards=arr(state.cards);state.flexAccounts=arr(state.flexAccounts);state.notes=arr(state.notes);state.investments=arr(state.investments);
 state.categories=arr(state.categories);
 if(!state.categories.some(c=>U(c)==='HARÇLIK'))state.categories.push('HARÇLIK');
 state.cards.forEach(c=>{c.id=c.id||uid();c.name=c.name||'KREDİ KARTI';c.transactions=arr(c.transactions);c.balance=N(c.balance);c.limit=N(c.limit);});
 state.flexAccounts.forEach(a=>{a.id=a.id||uid();a.name=a.name||'ESNEK HESAP';a.transactions=arr(a.transactions);a.balance=N(a.balance);a.limit=N(a.limit);});
 state.work.forEach(w=>{
   w.id=w.id||uid();w.date=w.date||iso();w.type=w.type||'daily';
   if(w.amount==null)w.amount=w.type==='daily'?N(state.settings?.dailyRate):N(w.hours)*N(w.rate);
   // Never reinterpret an existing paidAmount. Accounting core owns legacy payment semantics.
   if(w.paidAmount!=null){w.paidAmount=Math.max(0,Math.min(N(w.amount),N(w.paidAmount)));w.paymentStatus=w.paidAmount>=N(w.amount)&&N(w.amount)>0?'paid':(w.paidAmount>0?'partial':'unpaid');}
 });
 const cardById=id=>state.cards.find(c=>String(c.id)===String(id));
 const flexById=id=>state.flexAccounts.find(a=>String(a.id)===String(id));
 const cardTxFor=x=>state.cards.flatMap(c=>c.transactions.map(t=>({c,t}))).find(z=>String(z.t.expenseId||'')===String(x.id)||String(z.t.id||'')===String(x.sourceId||''));
 const flexTxFor=x=>state.flexAccounts.flatMap(a=>a.transactions.map(t=>({a,t}))).find(z=>String(z.t.expenseId||'')===String(x.id)||String(z.t.id||'')===String(x.sourceId||''));
 state.expenses.forEach(x=>{
   x.id=x.id||uid();x.date=x.date||iso();x.amount=N(x.amount);x.category=U(x.category||x.title||'DİĞER');x.title=x.title||x.category;
   x.method=U(x.method||'NAKİT');x.note=x.note||'';
   if(isAllowance(x)){
     x.category='HARÇLIK';x.title='HARÇLIK';x.recipient=U(x.recipient||x.person||x.allowanceTo||'');x.person=x.recipient;
   }
   if(isRoad(x)&&x.workId){x.category='YOL';x.title=x.title||'YOL';x.sourceType=x.sourceType||'workRoad';}
   if(x.method==='KREDİ KARTI'){
     let c=cardById(x.cardId);
     const linked=cardTxFor(x);
     if(!c&&linked)c=linked.c;
     if(!c&&x.cardName){const hits=state.cards.filter(z=>U(z.name)===U(x.cardName));if(hits.length===1)c=hits[0];}
     if(c){
       let t=c.transactions.find(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));
       if(!t){t={id:uid(),expenseId:x.id,title:x.title||x.category,category:x.category,amount:x.amount,date:x.date,type:'spend',migratedLink:true};c.transactions.push(t);}
       t.expenseId=x.id;x.cardId=c.id;x.cardName=c.name;x.sourceType='card';x.sourceId=t.id;x.flexId='';x.flexName='';
     }
   }else if(x.method==='ESNEK HESAP'){
     let a=flexById(x.flexId);const linked=flexTxFor(x);if(!a&&linked)a=linked.a;
     if(!a&&x.flexName){const hits=state.flexAccounts.filter(z=>U(z.name)===U(x.flexName));if(hits.length===1)a=hits[0];}
     if(a){
       let t=a.transactions.find(t=>String(t.expenseId||'')===String(x.id)||String(t.id||'')===String(x.sourceId||''));
       if(!t){t={id:uid(),expenseId:x.id,title:x.title||x.category,category:x.category,amount:x.amount,date:x.date,type:'spend',migratedLink:true};a.transactions.push(t);}
       t.expenseId=x.id;x.flexId=a.id;x.flexName=a.name;x.sourceType='flex';x.sourceId=t.id;x.cardId='';x.cardName='';
     }
   }else{x.method='NAKİT';}
 });
 // Reverse-link known transactions without changing current balances.
 state.cards.forEach(c=>c.transactions.forEach(t=>{if(t.expenseId){const x=state.expenses.find(e=>String(e.id)===String(t.expenseId));if(x&&U(x.method)==='KREDİ KARTI'){x.cardId=c.id;x.cardName=c.name;x.sourceType='card';x.sourceId=t.id;}}}));
 state.flexAccounts.forEach(a=>a.transactions.forEach(t=>{if(t.expenseId){const x=state.expenses.find(e=>String(e.id)===String(t.expenseId));if(x&&U(x.method)==='ESNEK HESAP'){x.flexId=a.id;x.flexName=a.name;x.sourceType='flex';x.sourceId=t.id;}}}));
 state.meta.v4317Migration=1;state.meta.v4317MigrationAt=new Date().toISOString();state.meta.appDataVersion=VERSION;
 save();return true;
}
window.rutinMigrateLegacy4317=migrateLegacy4317;
const migrated=migrateLegacy4317();

/* ---------- CONSISTENT STATUS / TOASTS ---------- */
function toast4317(message,type='ok'){
 let el=document.getElementById('rutinToast4317');
 if(!el){el=document.createElement('div');el.id='rutinToast4317';el.className='rutinToast4317';document.body.appendChild(el);}
 el.className='rutinToast4317 '+type;el.textContent=message;el.classList.add('show');clearTimeout(window.__toast4317);window.__toast4317=setTimeout(()=>el.classList.remove('show'),2200);
}
window.rutinToast=toast4317;window.showToastV43162=toast4317;
if(migrated&&(state.work.length||state.expenses.length||state.incomes.length||state.cards.length||state.flexAccounts.length||state.notes.length||state.investments.length))setTimeout(()=>toast4317('ESKİ VERİLER YENİ SÜRÜME UYUMLANDI ✓','ok'),350);

/* ---------- HOME / QUICK ACTION STANDARD ---------- */
const prevHome=window.home;
window.home=function(){
 let h=prevHome();
 const s=h.indexOf('<div class="section"><b>HIZLI İŞLEMLER</b>');
 if(s>=0){const q=h.indexOf('<div class="quick',s),e=q>=0?h.indexOf('</div>',q):-1;if(q>=0&&e>q){
   const quick=`<div class="quick quickPremium quickSix v4317Quick"><button onclick="openModal('income')"><i class="qv32 qIncome">＋₺</i><span>GELİR EKLE</span></button><button onclick="go('expenses')"><i class="qv32 qExpense">₺</i><span>HARCAMALAR</span></button><button onclick="openModal('daily')"><i class="qv32 qWork">✓</i><span>ÇALIŞTIM</span></button><button onclick="go('allowance')"><i class="qv32 qFinance">₺</i><span>HARÇLIK</span></button><button onclick="go('calendar')"><i class="qv32 qNotes">31</i><span>TAKVİM</span></button><button onclick="go('notes')"><i class="qv32 qNotes">✎</i><span>NOTLAR</span></button></div>`;
   h=h.slice(0,q)+quick+h.slice(e+6);
 }}
 return h;
};

/* ---------- REPORT ROW STANDARD + GROUPED ROAD IN EXPENSE DETAIL ---------- */
function reportRoadGroups(items){const m={};arr(items).filter(isRoad).forEach(x=>{const k=String(x.date||'');(m[k]||(m[k]=[])).push(x)});return Object.values(m).sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')));}
function normalExpenseRow(x){return `<button class="globalRecordRowV435 v4317ReportRow" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category):'−'}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')} · AYRINTI</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function roadReportRow(a){const x=a[0]||{},sum=a.reduce((s,z)=>s+N(z.amount),0);return `<button class="roadGroupCardV438 v4317ReportRow" onclick="openModal('roadDay431691:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME · AYRINTI</small></div><strong>-${M(sum)}</strong><span>›</span></button>`;}
const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k==='reportExpense43101'){
   const r=typeof dateRangeForPeriod==='function'?dateRangeForPeriod(reportPeriod):{start:'0000-01-01',end:'9999-12-31'};
   const items=arr(state.expenses).filter(x=>x.date>=r.start&&x.date<=r.end),roads=reportRoadGroups(items),normal=items.filter(x=>!isRoad(x));
   const cats={};items.forEach(x=>{const c=x.category||'DİĞER';cats[c]=(cats[c]||0)+N(x.amount)});
   const rows=[...roads.map(a=>({date:a[0]?.date||'',html:roadReportRow(a)})),...normal.map(x=>({date:x.date||'',html:normalExpenseRow(x)}))].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GİDER DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="reportCatsV439">${Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([c,t])=>`<button onclick="go('expenses');closeModal()"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(c):'₺'}</i><span><small>${E(c)}</small><b>${M(t)}</b></span><em>›</em></button>`).join('')||'<div class="notice">KAYIT YOK.</div>'}</div><div class="section"><b>GİDER HAREKETLERİ</b><span>DOKUN → DETAY</span></div>${rows||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;
 }
 return prevModal(k);
};

/* ---------- MENU CLEANUP / CONSISTENT DESTINATIONS ---------- */
const modalAfterReports=window.modalHtml;
window.modalHtml=function(k){
 if(k==='menu'){
  const items=[['home','⌂','ANA SAYFA'],['work','✓','ÇALIŞMA'],['expenses','₺','HARCAMALAR'],['allowance','₺','HARÇLIK'],['calendar','31','TAKVİM'],['reports','▥','RAPORLAR'],['finance','▰','FİNANS / KARTLAR'],['notes','✎','NOTLAR'],['profile','●','PROFİL'],['settings','⚙','AYARLAR']];
  return `<div class="modal menu4311Modal" onclick="safeBackdropClose(event)"><div class="sheet menu4311Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>UYGULAMA MENÜSÜ</b><button class="close" onclick="closeModal()">×</button></div><div class="menu4311List v4317Menu">${items.map(x=>`<button onclick="closeModal();go('${x[0]}')"><i>${x[1]}</i><b>${x[2]}</b><span>›</span></button>`).join('')}</div></div></div>`;
 }
 return modalAfterReports(k);
};

/* ---------- LIGHTWEIGHT INTEGRITY AUDIT (NO BALANCE REWRITE) ---------- */
window.rutinIntegrity4317=function(){
 const issues=[];
 const ids=new Set();[...arr(state.work),...arr(state.expenses),...arr(state.incomes)].forEach(x=>{if(!x.id)issues.push('KİMLİKSİZ KAYIT');else if(ids.has(String(x.id)))issues.push('TEKRAR KAYIT ID: '+x.id);else ids.add(String(x.id));});
 arr(state.expenses).forEach(x=>{
  if(U(x.method)==='KREDİ KARTI'&&!state.cards.some(c=>String(c.id)===String(x.cardId)))issues.push('KARTA BAĞLANAMAYAN HARCAMA: '+(x.date||'')+' '+(x.title||''));
  if(U(x.method)==='ESNEK HESAP'&&!state.flexAccounts.some(a=>String(a.id)===String(x.flexId)))issues.push('ESNEK HESABA BAĞLANAMAYAN HARCAMA: '+(x.date||'')+' '+(x.title||''));
 });
 state.meta=state.meta||{};state.meta.lastIntegrity4317={at:new Date().toISOString(),issues:issues.length};save();return issues;
};
window.rutinIntegrity4317();

})();

/* ===== END v4317_standard_migration.js ===== */
;

/* ===== BEGIN v43171_quick_calendar_fix.js ===== */
/* RUTIN V43.17.1 — quick actions one-row + calendar real cash-date income */
(function(){
'use strict';
const N=v=>Number(String(v??0).replace(',','.'))||0;
const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const SUM=a=>(a||[]).reduce((s,x)=>s+N(x.amount),0);

/* Actual money received on a calendar date.
   - Daily/main job is never income on the work date.
   - Hourly/overtime paid immediately is income on work date.
   - Any later collection is income on the collection/payment date. */
function paymentRowsFor(workId){return (state.workPayments||[]).filter(p=>String(p.workId)===String(workId));}
function immediatePaidOnWorkDate(w){
 if(!w || w.type==='daily') return 0;
 const pays=paymentRowsFor(w.id);
 // If collection rows exist, they are authoritative for the cash date.
 if(pays.length) return 0;
 return typeof workPaid==='function'?N(workPaid(w)):N(w.paidAmount);
}
function calendarIncomeOn(ds){
 const other=(state.incomes||[]).filter(x=>String(x.date||'')===String(ds)).reduce((s,x)=>s+N(x.amount),0);
 const immediate=(state.work||[]).filter(w=>String(w.date||'')===String(ds)).reduce((s,w)=>s+immediatePaidOnWorkDate(w),0);
 const collected=(state.workPayments||[]).filter(p=>String(p.date||'')===String(ds)).reduce((s,p)=>s+N(p.amount),0);
 return other+immediate+collected;
}
window.rutinCalendarIncome43171=calendarIncomeOn;

const prevModal=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('day:')){
   const ds=k.slice(4),w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds);
   const road=x=>{const c=String(x.category||'').toLocaleUpperCase('tr-TR'),t=String(x.title||'').toLocaleUpperCase('tr-TR');return c==='YOL'&&(!!x.workId||x.sourceType==='workRoad'||t==='YOL')};
   const roads=ex.filter(road),normal=ex.filter(x=>!road(x));
   const roadHtml=roads.length?`<button class="roadGroupCardV438" onclick="openModal('roadDay431691:${E(ds)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(ds)} · ${roads.length} ÖDEME</small></div><strong>-${M(SUM(roads))}</strong><span>›</span></button>`:'';
   const workRows=w.map(x=>{const paidNow=immediatePaidOnWorkDate(x);const earned=typeof workEarned==='function'?N(workEarned(x)):N(x.amount||N(x.hours)*N(x.rate));const label=x.type==='daily'?'GÜNLÜK ÇALIŞMA':x.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ';const status=x.type==='daily'?'HAKEDİŞ / ALACAK':paidNow>0?'ÖDEME ALINDI':'ALACAK';return `<button class="globalRecordRowV435" onclick="openRecordV435('work','${E(x.id)}')"><i>${x.type==='daily'?'✓':x.type==='hourly'?'◷':'✦'}</i><div><b>${E(label)}</b><small>${E(x.title||'')} · ${status} · DETAY</small></div><strong class="${paidNow>0?'green':'gold'}">${M(earned)}</strong><span>›</span></button>`}).join('');
   const expRows=normal.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category):'−'}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.method||'NAKİT')} · DETAY</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`).join('');
   const incRows=inc.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'GELİR')}</b><small>${E(x.date||'')} · DETAY</small></div><strong class="green">+${M(x.amount)}</strong><span>›</span></button>`).join('');
   const collected=(state.workPayments||[]).filter(p=>String(p.date||'')===String(ds));
   const collectedRows=collected.map(p=>{const ww=(state.work||[]).find(w=>String(w.id)===String(p.workId));return `<div class="globalRecordRowV435"><i>✓</i><div><b>${E(ww?.type==='daily'?'MAAŞ / ANA İŞ TAHSİLATI':'İŞ ÜCRETİ TAHSİLATI')}</b><small>${E(ww?.title||'ÇALIŞMA')} · TAHSİLAT</small></div><strong class="green">+${M(p.amount)}</strong><span></span></div>`}).join('');
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v432Sheet v43166DaySheet" data-day="${E(ds)}" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜN DETAYI</b><button class="close" onclick="closeModal()">×</button></div>
   <div class="v432DayHead"><button onclick="shiftDay('${E(ds)}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>HIZLI KAYIT EKLE · KAYDA DOKUN → DETAY</small></div><button onclick="shiftDay('${E(ds)}',1)">›</button></div>
   <div class="v43166DayQuick"><button onclick="openModal('dailyDate:${E(ds)}')"><i>✓</i><span>GÜNLÜK</span></button><button onclick="openModal('hourlyDate:${E(ds)}')"><i>◷</i><span>SAATLİK</span></button><button onclick="openModal('overtimeDate:${E(ds)}')"><i>✦</i><span>MESAİ</span></button><button onclick="openModal('expenseDate:${E(ds)}')"><i>▤</i><span>HARCAMA</span></button><button onclick="openAllowanceDate43166('${E(ds)}')"><i>₺</i><span>HARÇLIK</span></button></div>
   <div class="v43166DayTotals"><span>ÇALIŞMA <b>${w.length}</b></span><span>GELİR <b>${M(calendarIncomeOn(ds))}</b></span><span>HARCAMA <b>${M(SUM(ex))}</b></span></div>
   <div class="section"><b>ÇALIŞMA / MESAİ</b></div>${workRows||'<div class="notice">ÇALIŞMA KAYDI YOK.</div>'}
   <div class="section"><b>HARCAMA / YOL</b><span>YOL TEK KART</span></div>${roadHtml+expRows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}
   <div class="section"><b>GERÇEK GELİR / TAHSİLAT</b></div>${incRows+collectedRows||'<div class="notice">BU TARİHTE GELİR TAHSİLATI YOK.</div>'}</div></div>`;
 }
 return prevModal(k);
};
})();

/* ===== END v43171_quick_calendar_fix.js ===== */
;

/* ===== BEGIN v43172_real_quick_calendar_fix.js ===== */
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

/* ===== END v43172_real_quick_calendar_fix.js ===== */
;

/* ===== BEGIN v43173_calendar_restore.js ===== */
/* RUTIN V43.17.3 — restore premium clickable calendar; keep cash-basis income only */
(function(){
'use strict';
const E=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(String(v??0).replace(',','.'))||0;
const road=x=>x&&(x.sourceType==='workRoad'||x.workId||(String(x.category||'').toUpperCase()==='YOL'&&String(x.note||'').toUpperCase().includes('YOL')));
const earned=x=>N(x.amount)||(N(x.hours)*N(x.rate));
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
const colors={daily:'#22c55e',hourly:'#3b82f6',overtime:'#d7b45c',road:'#a855f7',expense:'#ff4d5a',income:'#14b8a6'};
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
  const ds=`${p}-${String(n).padStart(2,'0')}`,w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds),types=[];
  if(w.some(x=>x.type==='daily'))types.push('daily');if(w.some(x=>x.type==='hourly'))types.push('hourly');if(w.some(x=>x.type==='overtime'))types.push('overtime');if(ex.some(road))types.push('road');if(ex.some(x=>!road(x)))types.push('expense');if(inc.length)types.push('income');
  const bg=segBg(types);cells+=`<button class="day premiumDay v432Day${ds===iso()?' today':''}${types.length?' hasData':''}" ${bg?`style="background:${bg}!important"`:''} onclick="openModal('day43173:${ds}')"><span class="v432DayNo">${n}</span></button>`;
 }
 const mw=(state.work||[]).filter(x=>String(x.date||'').startsWith(p)),me=(state.expenses||[]).filter(x=>String(x.date||'').startsWith(p));
 const dailyDays=new Set(mw.filter(x=>x.type==='daily').map(x=>x.date)).size,hourlyRows=mw.filter(x=>x.type==='hourly'),hourlyDays=new Set(hourlyRows.map(x=>x.date)).size,hour=hourlyRows.reduce((n,x)=>n+N(x.hours),0),otRows=mw.filter(x=>x.type==='overtime'),otDays=new Set(otRows.map(x=>x.date)).size,ot=otRows.reduce((n,x)=>n+N(x.hours),0),income=monthCashIncome(p),expense=sum(me),mn=d.toLocaleDateString('tr-TR',{month:'long',year:'numeric'}).toUpperCase();
 const S=(type,label,val,cls)=>`<button class="v432Sum ${cls}" onclick="openModal('monthDetail43173:${type}')"><span>${label}</span><strong>${val}</strong><small>DETAYLAR ›</small></button>`;
 return `${header('TAKVİM',true)}<div class="v43CalendarWrap" ontouchstart="v43CalTouchStart(event)" ontouchend="v43CalTouchEnd(event)"><button class="dateJumpMini" onclick="openModal('dateJump')">◉ AY / YIL HIZLI SEÇ</button><div class="calendarTitleRow premiumMonthRow"><button class="calendarArrow" onclick="moveCalendar(-1)">‹</button><div><b>${mn}</b><small>GÜN KUTUSUNDAKİ HER RENK AYRI BİR KAYDI GÖSTERİR</small></div><button class="calendarArrow" onclick="moveCalendar(1)">›</button></div><div class="card compactCalendar referenceCalendar premiumCalendarCard"><div class="calendarHead">${['PZT','SAL','ÇAR','PER','CUM','CMT','PAZ'].map(x=>`<div>${x}</div>`).join('')}</div><div class="calendar premiumCalendarGrid">${cells}</div><div class="calendarLegend premiumLegend v43Legend"><span><i class="v43dot daily"></i>GÜNLÜK</span><span><i class="v43dot hourly"></i>SAATLİK</span><span><i class="v43dot overtime"></i>MESAİ</span><span><i class="v43dot road"></i>YOL</span><span><i class="v43dot expense"></i>HARCAMA</span><span><i class="v43dot income" style="background:#14b8a6"></i>GELİR</span></div></div></div><div class="v432Month"><div class="v432MonthTitle">♛ ${mn} · AY ÖZETİ <small>HER KARTA DOKUN · AYRINTIYI AÇ</small></div><div class="v432SumGrid">${S('worked','TAM GÜN ÇALIŞMA',dailyDays+' GÜN','daily')}${S('hourly','SAATLİK ÇALIŞMA',hourlyDays+' GÜN · '+hour+' SAAT','hourly')}${S('overtime','MESAİ',otDays+' GÜN · '+ot+' SAAT','overtime')}${S('income','TOPLAM GELİR',money(income),'income')}${S('expense','TOPLAM HARCAMA',money(expense),'expense')}${S('remain','KALAN',money(income-expense),'remain')}</div></div>`;
};

function dayMenu(ds){
 const w=(state.work||[]).filter(x=>x.date===ds),ex=(state.expenses||[]).filter(x=>x.date===ds),inc=(state.incomes||[]).filter(x=>x.date===ds);
 const incomeRows=inc.map(x=>`<button class="v432Record income" onclick="openModal('editRecord:income:${E(x.id)}:${E(ds)}')"><span class="v432RecordIcon">₺</span><span><b>${E(x.title||'DİĞER GELİR')}</b><small>${money(x.amount)} · GELİR</small></span><strong>›</strong></button>`).join('');
 return `<div class="v432DayHead"><button onclick="shiftDay('${ds}',-1)">‹</button><div><b>${new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()}</b><small>KAYDA DOKUN → DETAY / DÜZENLE / SİL</small></div><button onclick="shiftDay('${ds}',1)">›</button></div><div class="v43166DayQuick"><button onclick="openModal('dailyDate:${E(ds)}')"><i>✓</i><span>GÜNLÜK</span></button><button onclick="openModal('hourlyDate:${E(ds)}')"><i>◷</i><span>SAATLİK</span></button><button onclick="openModal('overtimeDate:${E(ds)}')"><i>✦</i><span>MESAİ</span></button><button onclick="openModal('expenseDate:${E(ds)}')"><i>▤</i><span>HARCAMA</span></button><button onclick="openAllowanceDate43166('${E(ds)}')"><i>₺</i><span>HARÇLIK</span></button></div><div class="v432DayMenu">${w.map(x=>recordButton(x,'work',ds)).join('')}${ex.map(x=>recordButton(x,'expense',ds)).join('')}${incomeRows||(!w.length&&!ex.length?'<div class="notice">BU GÜN KAYIT YOK.</div>':'')}</div>`;
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

/* ===== END v43173_calendar_restore.js ===== */
;

/* ===== BEGIN v43174_integrity_reports.js ===== */
/* RUTIN V43.17.4 — Reports + Allowance + Card/Flex integrity; calendar UI untouched */
(function(){
'use strict';
const VERSION='43.17.4';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const N=v=>Number(String(v??0).replace(',','.'))||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const arr=v=>Array.isArray(v)?v:[];
const sum=(a,fn=x=>N(x.amount))=>arr(a).reduce((s,x)=>s+N(fn(x)),0);
state.meta=state.meta||{};
state.cards=arr(state.cards);state.flexAccounts=arr(state.flexAccounts);state.expenses=arr(state.expenses);state.work=arr(state.work);state.workPayments=arr(state.workPayments);state.incomes=arr(state.incomes);
state.cards.forEach(c=>c.transactions=arr(c.transactions));state.flexAccounts.forEach(a=>a.transactions=arr(a.transactions));

function isRoad(x){return !!x&&U(x.category)==='YOL'&&(!!x.workId||x.sourceType==='workRoad'||U(x.title)==='YOL'||U(x.note).includes('YOL'));}
function isAllowance(x){return !!x&&U(x.category||x.title)==='HARÇLIK';}
function earned(w){return typeof workEarned==='function'?N(workEarned(w)):N(w.amount!=null?w.amount:N(w.hours)*N(w.rate));}
function paid(w){return typeof workPaid==='function'?N(workPaid(w)):Math.max(0,Math.min(earned(w),N(w.paidAmount)));}
function receivable(w){return typeof workReceivable==='function'?N(workReceivable(w)):Math.max(0,earned(w)-paid(w));}
function range(){try{return dateRangeForPeriod(reportPeriod)}catch(_){return{start:'0000-01-01',end:'9999-12-31',label:'SEÇİLİ DÖNEM'}}}
function inRange(ds,r){return String(ds||'')>=String(r.start||'0000-01-01')&&String(ds||'')<=String(r.end||'9999-12-31');}
function workType(w){return w.type==='daily'?'GÜNLÜK ÇALIŞMA':w.type==='hourly'?'SAATLİK ÇALIŞMA':'MESAİ';}
function workStatus(w){const r=receivable(w),p=paid(w);return r<=0?'ALINDI':p>0?'KISMİ ALINDI':'ALACAK';}

/* ---------- V43.17.4 SAFE LEGACY INTEGRATION ----------
   Links old finance transactions to expense records without rewriting balances. */
function migrate43174(){
 if(state.meta.v43174Migration)return false;
 const findExpenseForTx=(kind,account,t)=>state.expenses.find(x=>String(x.sourceId||'')===String(t.id)||
   (kind==='card'&&String(x.cardId||'')===String(account.id)&&String(x.date||'')===String(t.date||'')&&Math.abs(N(x.amount)-Math.abs(N(t.amount)))<0.001&&U(x.title)===U(t.title))||
   (kind==='flex'&&String(x.flexId||'')===String(account.id)&&String(x.date||'')===String(t.date||'')&&Math.abs(N(x.amount)-Math.abs(N(t.amount)))<0.001&&U(x.title)===U(t.title)));
 const link=(kind,account,t,x)=>{
   t.type=t.type==='payment'?'payment':'spend'; if(t.type==='payment')return;
   t.expenseId=x.id;x.sourceId=t.id;x.sourceType=kind;x.method=kind==='card'?'KREDİ KARTI':'ESNEK HESAP';
   if(kind==='card'){x.cardId=account.id;x.cardName=account.name||'KREDİ KARTI';x.flexId='';x.flexName='';}
   else{x.flexId=account.id;x.flexName=account.name||'ESNEK HESAP';x.cardId='';x.cardName='';}
 };
 state.cards.forEach(c=>arr(c.transactions).forEach(t=>{
   if(t.type==='payment'||N(t.amount)<0)return;
   let x=findExpenseForTx('card',c,t);
   if(!x){x={id:uid(),date:t.date||iso(),title:t.title||'KART HARCAMASI',category:t.category||'DİĞER',amount:Math.abs(N(t.amount)),method:'KREDİ KARTI',cardId:c.id,cardName:c.name||'KREDİ KARTI',sourceType:'card',sourceId:t.id,note:'ESKİ KART HAREKETİ · V43.17.4 UYUMLAMA',migrated43174:true};state.expenses.push(x);}
   link('card',c,t,x);
 }));
 state.flexAccounts.forEach(a=>arr(a.transactions).forEach(t=>{
   if(t.type==='payment'||N(t.amount)<0)return;
   let x=findExpenseForTx('flex',a,t);
   if(!x){x={id:uid(),date:t.date||iso(),title:t.title||'ESNEK HESAP HARCAMASI',category:t.category||'DİĞER',amount:Math.abs(N(t.amount)),method:'ESNEK HESAP',flexId:a.id,flexName:a.name||'ESNEK HESAP',sourceType:'flex',sourceId:t.id,note:'ESKİ ESNEK HESAP HAREKETİ · V43.17.4 UYUMLAMA',migrated43174:true};state.expenses.push(x);}
   link('flex',a,t,x);
 }));
 state.expenses.forEach(x=>{
   if(x.sourceType==='card'||x.cardId){const c=state.cards.find(z=>String(z.id)===String(x.cardId))||state.cards.find(z=>arr(z.transactions).some(t=>String(t.id)===String(x.sourceId)));if(c){x.method='KREDİ KARTI';x.cardId=c.id;x.cardName=c.name||'KREDİ KARTI';const t=arr(c.transactions).find(t=>String(t.id)===String(x.sourceId)||String(t.expenseId||'')===String(x.id));if(t){t.expenseId=x.id;t.type=t.type==='payment'?'payment':'spend';x.sourceId=t.id;x.sourceType='card';}}}
   if(x.sourceType==='flex'||x.flexId){const a=state.flexAccounts.find(z=>String(z.id)===String(x.flexId))||state.flexAccounts.find(z=>arr(z.transactions).some(t=>String(t.id)===String(x.sourceId)));if(a){x.method='ESNEK HESAP';x.flexId=a.id;x.flexName=a.name||'ESNEK HESAP';const t=arr(a.transactions).find(t=>String(t.id)===String(x.sourceId)||String(t.expenseId||'')===String(x.id));if(t){t.expenseId=x.id;t.type=t.type==='payment'?'payment':'spend';x.sourceId=t.id;x.sourceType='flex';}}}
   if(isAllowance(x)){x.category='HARÇLIK';x.title='HARÇLIK';x.recipient=U(x.recipient||x.person||x.allowanceTo||'BELİRTİLMEDİ');x.person=x.recipient;}
 });
 state.meta.v43174Migration=1;state.meta.v43174MigrationAt=new Date().toISOString();state.meta.appDataVersion=VERSION;save();return true;
}
const migrated=migrate43174();
if(migrated&&typeof rutinToast==='function'&&(state.expenses.length||state.cards.length||state.flexAccounts.length))setTimeout(()=>rutinToast('ESKİ FİNANS VERİLERİ YENİ SİSTEME BAĞLANDI ✓'),400);

/* ---------- FUTURE DIRECT CARD/FLEX SPENDS: always create one linked expense ---------- */
window.submitCardSpend=function(e,cid,tid=''){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),c=state.cards.find(x=>String(x.id)===String(cid));if(!c)return;
 c.transactions=arr(c.transactions);const amount=Math.max(0,N(d.amount));if(!amount)return alert('TUTAR GİRİN.');let t=c.transactions.find(x=>String(x.id)===String(tid));
 if(t){const old=Math.abs(N(t.amount)),diff=amount-old;t.title=U(d.title||t.title||'KART HARCAMASI');t.amount=amount;t.date=d.date||t.date||iso();t.type='spend';c.balance=Math.max(0,N(c.balance)+diff);let x=state.expenses.find(z=>String(z.id)===String(t.expenseId||'')||String(z.sourceId||'')===String(t.id));if(!x){x={id:uid()};state.expenses.push(x);}Object.assign(x,{date:t.date,title:t.title,amount,category:x.category||t.category||'DİĞER',method:'KREDİ KARTI',cardId:c.id,cardName:c.name||'KREDİ KARTI',sourceType:'card',sourceId:t.id,note:x.note||'KART HARCAMASI'});t.expenseId=x.id;
 }else{t={id:uid(),title:U(d.title||'KART HARCAMASI'),amount,date:d.date||iso(),type:'spend'};const x={id:uid(),date:t.date,title:t.title,amount,category:'DİĞER',method:'KREDİ KARTI',cardId:c.id,cardName:c.name||'KREDİ KARTI',sourceType:'card',sourceId:t.id,note:'KART HARCAMASI'};t.expenseId=x.id;c.transactions.push(t);state.expenses.push(x);c.balance=N(c.balance)+amount;}
 save();if(typeof closeModal==='function')closeModal();if(typeof rutinToast==='function')rutinToast('KART HARCAMASI KAYDEDİLDİ ✓');render();
};
window.submitFlexSpend4310=function(e,id){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),a=state.flexAccounts.find(x=>String(x.id)===String(id));if(!a)return;const amount=Math.max(0,N(d.amount));if(!amount)return alert('TUTAR GİRİN.');a.transactions=arr(a.transactions);const t={id:uid(),title:U(d.title||'HARCAMA'),amount,date:d.date||iso(),type:'spend'};const x={id:uid(),date:t.date,title:t.title,amount,category:'DİĞER',method:'ESNEK HESAP',flexId:a.id,flexName:a.name||'ESNEK HESAP',sourceType:'flex',sourceId:t.id,note:'ESNEK HESAP HARCAMASI'};t.expenseId=x.id;a.transactions.push(t);state.expenses.push(x);a.balance=N(a.balance)+amount;save();closeModal();if(typeof rutinToast==='function')rutinToast('ESNEK HESAP HARCAMASI KAYDEDİLDİ ✓');render();
};

/* ---------- ACTUAL CASH EVENTS FOR REPORTS ---------- */
function workCashEvents(){
 const paymentsByWork={};state.workPayments.forEach(p=>{const k=String(p.workId||'');(paymentsByWork[k]||(paymentsByWork[k]=[])).push(p)});
 const out=[];
 state.work.forEach(w=>{
   const ps=paymentsByWork[String(w.id)]||[],explicit=sum(ps),implicit=Math.max(0,paid(w)-explicit);
   if(implicit>0)out.push({kind:'workCash',id:w.id,date:w.date,amount:implicit,label:workType(w),sub:'PEŞİN ALINDI'});
   ps.forEach(p=>{if(N(p.amount)>0)out.push({kind:'workCash',id:w.id,date:p.date||w.date,amount:N(p.amount),label:workType(w)+' TAHSİLATI',sub:(w.title||'')});});
 });
 return out;
}
function actualReport(r=range()){
 const works=state.work.filter(w=>inRange(w.date,r));
 const workCash=workCashEvents().filter(x=>inRange(x.date,r));
 const incomes=state.incomes.filter(x=>inRange(x.date,r));
 const expenses=state.expenses.filter(x=>inRange(x.date,r));
 const earnedTotal=sum(works,earned),receivedTotal=sum(workCash),recvOpen=sum(works,receivable),other=sum(incomes),expense=sum(expenses);
 return{r,works,workCash,incomes,expenses,earned:earnedTotal,received:receivedTotal,receivable:recvOpen,other,income:receivedTotal+other,expense,net:receivedTotal+other-expense};
}
function workRow(w){return `<button class="globalRecordRowV435 stableReportRow431642 v43174WorkRow" onclick="openRecordV435('work','${E(w.id)}')"><i>▣</i><div><b>${E(workType(w))}</b><small>${E(w.date||'')} · ${E(workStatus(w))}${w.hours?' · '+E(w.hours)+' SAAT':''}</small></div><strong class="${receivable(w)>0?'gold':'green'}">${M(earned(w))}</strong><span>›</span></button>`;}
function incomeEventRow(x){if(x.kind==='workCash')return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('work','${E(x.id)}')"><i>₺</i><div><b>${E(x.label)}</b><small>${E(x.date)} · ${E(x.sub||'ALINDI')}</small></div><strong class="green">+${M(x.amount)}</strong><span>›</span></button>`;return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'DİĞER GELİR')}</b><small>${E(x.date||'')} · DETAY / DÜZENLE</small></div><strong class="green">+${M(x.amount)}</strong><span>›</span></button>`;}
function expenseRow(x){return `<button class="globalRecordRowV435 stableReportRow431642" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'−'}</i><div><b>${E(x.title||x.category||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')} · DETAY</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function roadGroups(items){const m={};arr(items).filter(isRoad).forEach(x=>(m[String(x.date||'')]||(m[String(x.date||'')]=[])).push(x));return Object.values(m);}
function roadRow(a){const x=a[0]||{},tot=sum(a),card=sum(a.filter(z=>U(z.method).includes('KREDİ'))),cash=sum(a.filter(z=>U(z.method).includes('NAKİT'))),flex=sum(a.filter(z=>U(z.method).includes('ESNEK'))),bits=[];if(card)bits.push(M(card)+' KART');if(cash)bits.push(M(cash)+' NAKİT');if(flex)bits.push(M(flex)+' ESNEK');return `<button class="roadGroupCardV438 v43174RoadRow" onclick="openModal('roadDay43174:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${bits.join(' · ')}</em></div><strong>-${M(tot)}</strong><span>›</span></button>`;}
function expenseRows(items){const rows=[...roadGroups(items).map(a=>({date:a[0]?.date||'',html:roadRow(a)})),...arr(items).filter(x=>!isRoad(x)).map(x=>({date:x.date||'',html:expenseRow(x)}))];return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');}

window.rutinReportWorkOpen=window.rutinReportWorkOpen!==false;
const prevToggle=window.v43162Toggle;
window.v43174Toggle=function(kind){if(kind==='work')window.rutinReportWorkOpen=!window.rutinReportWorkOpen;else if(typeof prevToggle==='function')prevToggle(kind);else render();if(kind==='work')render();};
window.reports=function(){
 const A=actualReport(),r=A.r,B=(k,l)=>`<button class="${reportPeriod===k?'active':''}" onclick="reportPeriod='${k}';render()">${l}</button>`,max=Math.max(1,A.income,A.expense),ip=Math.round(A.income/max*100),ep=Math.round(A.expense/max*100);
 const incomeRows=[...A.workCash,...A.incomes.map(x=>({...x,kind:'income'}))].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))).map(incomeEventRow).join('');
 const dispExpense=roadGroups(A.expenses).length+A.expenses.filter(x=>!isRoad(x)).length;
 return `${header('RAPORLAR',true)}
 <div class="stableAccountingTop431642"><button onclick="go('receivables')"><small>HAK EDİLEN</small><strong>${M(A.earned)}</strong></button><button onclick="go('receivables')"><small>ALINAN</small><strong class="green">${M(A.received)}</strong></button><button onclick="go('receivables')"><small>ALACAK</small><strong class="red">${M(A.receivable)}</strong></button></div>
 <div class="tabs stableReportTabs431642">${B('day','GÜNLÜK')}${B('week','HAFTALIK')}${B('month','AYLIK')}${B('year','YILLIK')}<button onclick="openModal('range')">ÖZEL</button></div>
 <div class="section"><b>${E(r.label||'SEÇİLİ DÖNEM')}</b><span>GERÇEK PARA HAREKETİ</span></div>
 <div class="stableMoneySummary431642"><div><small>TOPLAM GELİR</small><strong class="green">${M(A.income)}</strong></div><div><small>TOPLAM HARCAMA</small><strong class="red">${M(A.expense)}</strong></div><div><small>NET</small><strong>${M(A.net)}</strong></div></div>
 <div class="dualDonutWrap stableDonuts431642"><button class="donutCard" onclick="openModal('reportIncome43174')"><div class="donutRing incomeRing" style="--pct:${ip}"><div class="donutCenter"><small>GELİR</small><strong class="green">${M(A.income)}</strong></div></div></button><button class="donutCard" onclick="openModal('reportExpense43174')"><div class="donutRing expenseRing" style="--pct:${ep}"><div class="donutCenter"><small>GİDER</small><strong class="red">${M(A.expense)}</strong></div></div></button></div>
 <button class="v43162CollapseHead" onclick="v43174Toggle('work')"><span><b>ÇALIŞMA / HAKEDİŞ</b><small>${A.works.length} KAYIT</small></span><i>${rutinReportWorkOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportWorkOpen?'open':''}">${rutinReportWorkOpen?(A.works.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(workRow).join('')||'<div class="notice">KAYIT YOK.</div>'):''}</div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('income')"><span><b>GERÇEK GELİR HAREKETLERİ</b><small>${A.workCash.length+A.incomes.length} KAYIT</small></span><i>${rutinReportIncomeOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportIncomeOpen?'open':''}">${rutinReportIncomeOpen?(incomeRows||'<div class="notice">KAYIT YOK.</div>'):''}</div>
 <button class="v43162CollapseHead" onclick="v43162Toggle('expense')"><span><b>GİDER HAREKETLERİ</b><small>${A.expenses.length} KAYIT · ${dispExpense} SATIR</small></span><i>${rutinReportExpenseOpen?'⌃':'⌄'}</i></button><div class="v43162Collapse ${rutinReportExpenseOpen?'open':''}">${rutinReportExpenseOpen?(expenseRows(A.expenses)||'<div class="notice">KAYIT YOK.</div>'):''}</div>`;
};
window.detailReport=window.reports;

/* ---------- ALLOWANCE FINAL INTEGRATION ---------- */
window.rutinAllowanceFilter=window.rutinAllowanceFilter||'month';
function allowanceRange43174(){const f=window.rutinAllowanceFilter||'month',now=new Date(),today=typeof iso==='function'?iso(now):now.toISOString().slice(0,10),mk=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;if(f==='today')return{start:today,end:today,label:'BUGÜN'};if(f==='3m'){const d=new Date(now);d.setMonth(d.getMonth()-2);d.setDate(1);return{start:mk(d),end:today,label:'SON 3 AY'};}if(f==='1y'){const d=new Date(now);d.setFullYear(d.getFullYear()-1);d.setDate(d.getDate()+1);return{start:mk(d),end:today,label:'SON 1 YIL'};}if(f==='all')return{start:'0000-01-01',end:'9999-12-31',label:'TÜMÜ'};if(f==='custom'){let s=window.rutinAllowanceCustom?.start||today,e=window.rutinAllowanceCustom?.end||today;if(s>e)[s,e]=[e,s];return{start:s,end:e,label:'ÖZEL TARİH'};}return{start:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`,end:`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(new Date(now.getFullYear(),now.getMonth()+1,0).getDate()).padStart(2,'0')}`,label:'BU AY'};}
function allowanceItems43174(person=''){const r=allowanceRange43174(),p=U(person);return state.expenses.filter(x=>isAllowance(x)&&inRange(x.date,r)&&(!p||U(x.recipient||x.person||'BELİRTİLMEDİ')===p)).sort((a,b)=>String(b.date).localeCompare(String(a.date)));}
function allowanceTabs43174(){const tab=(k,l)=>`<button class="${window.rutinAllowanceFilter===k?'active':''}" onclick="setAllowanceFilterV43165('${k}')">${l}</button>`;return `${tab('today','BUGÜN')}${tab('month','BU AY')}${tab('3m','3 AY')}${tab('1y','1 YIL')}${tab('all','TÜMÜ')}<button class="${window.rutinAllowanceFilter==='custom'?'active':''}" onclick="openModal('allowanceRange43165')">TARİH</button>`;}
function fundingTotals(a){return{cash:sum(a.filter(x=>U(x.method)==='NAKİT')),card:sum(a.filter(x=>U(x.method)==='KREDİ KARTI')),flex:sum(a.filter(x=>U(x.method)==='ESNEK HESAP'))};}
window.allowanceScreenV43165=function(){const a=allowanceItems43174(),r=allowanceRange43174(),map={};a.forEach(x=>{const p=U(x.recipient||x.person||'BELİRTİLMEDİ')||'BELİRTİLMEDİ';(map[p]||(map[p]=[])).push(x)});const people=Object.entries(map).sort((A,B)=>sum(B[1])-sum(A[1])),total=sum(a),f=fundingTotals(a);return `${header('HARÇLIK',true)}<div class="allowanceHero43165"><div><small>${E(r.label)} TOPLAM HARÇLIK</small><strong>${M(total)}</strong><span>${people.length} KİŞİ · ${a.length} İŞLEM</span></div><button onclick="openModal('allowanceAdd43165')">＋ HARÇLIK EKLE</button></div><div class="allowanceFunding43174"><span>💵 NAKİT <b>${M(f.cash)}</b></span><span>💳 KART <b>${M(f.card)}</b></span><span>▥ ESNEK <b>${M(f.flex)}</b></span></div><div class="allowanceTabs43165">${allowanceTabs43174()}</div><div class="section"><b>KİŞİLER</b><span>DOKUN → DETAY</span></div><div class="allowancePeople43165">${people.map(([p,z])=>`<button onclick="openAllowancePersonV43165('${E(p).replace(/'/g,'&#39;')}')"><i>₺</i><div><b>${E(p)}</b><small>${z.length} İŞLEM · SON ${E(z[0]?.date||'-')}</small></div><strong>${M(sum(z))}</strong><span>›</span></button>`).join('')||'<div class="notice">BU DÖNEMDE HARÇLIK KAYDI YOK.</div>'}</div>`;};
window.allowancePersonV43165=function(){const p=window.rutinAllowancePerson||'',a=allowanceItems43174(p),all=state.expenses.filter(x=>isAllowance(x)&&U(x.recipient||x.person||'BELİRTİLMEDİ')===U(p)),r=allowanceRange43174(),total=sum(a),avg=a.length?total/a.length:0,f=fundingTotals(a);return `${header(p||'HARÇLIK',true)}<div class="allowancePersonHero43165"><i>₺</i><div><small>${E(r.label)} HARÇLIK</small><strong>${M(total)}</strong><span>${a.length} İŞLEM · ORT. ${M(avg)} · TÜMÜ ${M(sum(all))}</span></div></div><div class="allowanceFunding43174"><span>💵 ${M(f.cash)}</span><span>💳 ${M(f.card)}</span><span>▥ ${M(f.flex)}</span></div><div class="allowanceTabs43165">${allowanceTabs43174()}</div><button class="primary" onclick="openModal('allowanceAdd43165:${encodeURIComponent(p)}')">＋ HARÇLIK EKLE</button><div class="section"><b>HAREKETLER</b><span>DÜZENLE / SİL</span></div>${a.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>₺</i><div><b>${E(x.note||'HARÇLIK')}</b><small>${E(x.date)} · ${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):x.flexName?' · '+E(x.flexName):''}</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`).join('')||'<div class="notice">BU DÖNEMDE KAYIT YOK.</div>'}`;};

/* ---------- CARD STATEMENT PERIOD NAVIGATION ---------- */
window.rutinStatementOffset43174=window.rutinStatementOffset43174||0;
function desiredDay(c){let d=parseInt(c.statementDay,10);return Math.max(1,Math.min(31,isFinite(d)?d:1));}
function dateAt(y,m,day){const last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(day,last),12);}
function isoD(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function addDays(ds,n){const d=new Date(ds+'T12:00:00');d.setDate(d.getDate()+n);return isoD(d);}
function fmt(ds){return new Date(ds+'T12:00:00').toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit',year:'numeric'});}
function statementPeriod(c,offset=0){const day=desiredDay(c),now=new Date();let end=dateAt(now.getFullYear(),now.getMonth(),day);if(now<end)end=dateAt(now.getFullYear(),now.getMonth()-1,day);if(offset){end=dateAt(end.getFullYear(),end.getMonth()+offset,day);}const prev=dateAt(end.getFullYear(),end.getMonth()-1,day);return{start:addDays(isoD(prev),1),end:isoD(end)};}
window.changeCardStatement43174=function(delta){window.rutinStatementOffset43174=Math.min(0,(window.rutinStatementOffset43174||0)+delta);render();};
const openCardPrev=window.openCardDetailV43163;
window.openCardDetailV43163=function(id){window.rutinStatementOffset43174=0;return openCardPrev(id);};
window.cardDetailV43163=function(){const c=state.cards.find(x=>String(x.id)===String(window.cardDetailIdV43163));if(!c){screen='finance';return finance()}c.transactions=arr(c.transactions);const p=statementPeriod(c,window.rutinStatementOffset43174||0),tx=[...c.transactions].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))),spend=tx.filter(t=>t.type!=='payment'&&inRange(t.date,p)),spends=sum(spend,x=>Math.abs(N(x.amount))),afterStart=addDays(p.end,1),nextEnd=statementPeriod(c,(window.rutinStatementOffset43174||0)+1).end,pays=tx.filter(t=>t.type==='payment'&&String(t.date||'')>=afterStart&&String(t.date||'')<=nextEnd),paidTotal=sum(pays,x=>Math.abs(N(x.amount)));return `${header('KART EKSTRESİ',true)}<div class="cardDetailHeroV13"><small>${E(c.name)}</small><strong>${M(c.balance)}</strong><span>GÜNCEL BORÇ</span></div><div class="statementNav43174"><button onclick="changeCardStatement43174(-1)">‹ ÖNCEKİ</button><div><small>EKSTRE DÖNEMİ</small><b>${fmt(p.start)} — ${fmt(p.end)}</b></div><button ${window.rutinStatementOffset43174>=0?'disabled':''} onclick="changeCardStatement43174(1)">SONRAKİ ›</button></div><div class="v43163CardStats"><div><small>DÖNEM HARCAMA</small><b>${M(spends)}</b></div><div><small>SONRAKİ ÖDEMELER</small><b>${M(paidTotal)}</b></div></div><div class="card v43163Dates"><span>HESAP KESİM <b>HER AY ${E(c.statementDay||'-')}</b></span><span>SON ÖDEME <b>${E(c.paymentDay||c.dueDate||'-')}</b></span></div><button class="primary" onclick="openModal('cardPay4310:${c.id}')">NE KADAR ÖDEDİM?</button><div class="section"><b>EKSTRE HAREKETLERİ</b><span>${spend.length} İŞLEM</span></div><div class="card list">${spend.map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')} · ${E(t.category||'')}</small></div><strong class="red">${M(Math.abs(N(t.amount)))}</strong></div>`).join('')||'<div class="notice">BU DÖNEMDE HAREKET YOK.</div>'}</div><div class="section"><b>DÖNEM SONRASI ÖDEMELER</b><span>${pays.length}</span></div><div class="card list">${pays.map(t=>`<div class="item"><div><b>${E(t.title||'KART ÖDEMESİ')}</b><small>${E(t.date||'')}</small></div><strong class="green">-${M(Math.abs(N(t.amount)))}</strong></div>`).join('')||'<div class="notice">KAYITLI ÖDEME YOK.</div>'}</div>`;};

/* ---------- SAFE ACCOUNT DELETE GUARDS ---------- */
function linkedToCard(id){return state.expenses.filter(x=>String(x.cardId||'')===String(id)|| (x.sourceType==='card'&&String(x.cardId||'')===String(id)));}
function linkedToFlex(id){return state.expenses.filter(x=>String(x.flexId||'')===String(id)|| (x.sourceType==='flex'&&String(x.flexId||'')===String(id)));}
const rawDeleteCard=window.deleteCard;
window.deleteCard=function(id){const links=linkedToCard(id);if(links.length)return alert(`BU KARTA BAĞLI ${links.length} HARCAMA VAR. ÖNCE HARCAMALARI DÜZENLEYİN / SİLİN.`);if(!confirm('KREDİ KARTI SİLİNSİN Mİ?'))return;return rawDeleteCard?rawDeleteCard(id):undefined;};
window.deleteCardV39=function(id){return window.deleteCard(id);};
const rawDeleteFlex=window.deleteFlex;
window.deleteFlex=function(id){const links=linkedToFlex(id);if(links.length)return alert(`BU ESNEK HESABA BAĞLI ${links.length} HARCAMA VAR. ÖNCE HARCAMALARI DÜZENLEYİN / SİLİN.`);if(!confirm('ESNEK HESAP SİLİNSİN Mİ?'))return;return rawDeleteFlex?rawDeleteFlex(id):undefined;};
window.deleteFlexV4310=function(id){return window.deleteFlex(id);};window.deleteFlexV41=function(id){return window.deleteFlex(id);};window.deleteFlexV42=function(id){return window.deleteFlex(id);};

/* ---------- MODALS: report details; road delete remains funding-safe ---------- */
const modalPrev43174=window.modalHtml;
window.modalHtml=function(k){
 if(k==='reportIncome43174'){const A=actualReport(),rows=[...A.workCash,...A.incomes.map(x=>({...x,kind:'income'}))].sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(incomeEventRow).join('');return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GELİR DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="stableMoneySummary431642"><div><small>ÇALIŞMA TAHSİLATI</small><strong class="green">${M(A.received)}</strong></div><div><small>DİĞER GELİR</small><strong class="green">${M(A.other)}</strong></div><div><small>TOPLAM</small><strong>${M(A.income)}</strong></div></div>${rows||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;}
 if(k==='reportExpense43174'){const A=actualReport();return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GİDER DETAYI</b><button class="close" onclick="closeModal()">×</button></div>${expenseRows(A.expenses)||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;}
 if(k&&k.startsWith('roadDay43174:')){const date=k.slice('roadDay43174:'.length),a=state.expenses.filter(x=>String(x.date||'')===String(date)&&isRoad(x));return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${M(sum(a))}</strong></div><div class="section"><b>YOL ÖDEMELERİ</b><span>DÜZENLE / SİL</span></div>${a.map(x=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||'YOL')}</i><div><b>${E(x.direction||'YOL')} · ${M(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):x.flexName?' · '+E(x.flexName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay43174('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;}
 return modalPrev43174(k);
};
window.deleteRoadDay43174=function(id,date){if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;const x=state.expenses.find(z=>String(z.id)===String(id));if(!x)return;if(typeof window.rutinDetachFundingV431651==='function')window.rutinDetachFundingV431651(x);state.expenses=state.expenses.filter(z=>String(z.id)!==String(id));save();const left=state.expenses.some(z=>String(z.date||'')===String(date)&&isRoad(z));if(left)openModal('roadDay43174:'+date);else closeModal();render();};

/* ---------- NON-DESTRUCTIVE INTEGRITY AUDIT ---------- */
window.rutinIntegrity43174=function(){const issues=[];const ids=new Set();[...state.work,...state.expenses,...state.incomes].forEach(x=>{if(!x.id)issues.push('KİMLİKSİZ KAYIT');else if(ids.has(String(x.id)))issues.push('TEKRAR ID: '+x.id);else ids.add(String(x.id));});state.expenses.forEach(x=>{if(U(x.method)==='KREDİ KARTI'){const c=state.cards.find(z=>String(z.id)===String(x.cardId));if(!c)issues.push('KARTI BULUNAMAYAN HARCAMA: '+x.id);else if(!arr(c.transactions).some(t=>String(t.expenseId||'')===String(x.id)||String(t.id)===String(x.sourceId)))issues.push('KART HAREKETİ EKSİK: '+x.id);}if(U(x.method)==='ESNEK HESAP'){const a=state.flexAccounts.find(z=>String(z.id)===String(x.flexId));if(!a)issues.push('ESNEK HESABI BULUNAMAYAN HARCAMA: '+x.id);else if(!arr(a.transactions).some(t=>String(t.expenseId||'')===String(x.id)||String(t.id)===String(x.sourceId)))issues.push('ESNEK HESAP HAREKETİ EKSİK: '+x.id);}});state.meta.lastIntegrity43174={at:new Date().toISOString(),issues:issues.length};save();return issues;};
window.rutinIntegrity43174();
})();

/* ===== END v43174_integrity_reports.js ===== */
;

/* ===== BEGIN v43175_finance_edit_reminders.js ===== */
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

/* ===== END v43175_finance_edit_reminders.js ===== */
;

/* ===== BEGIN v43176_finance_details_reports.js ===== */
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

/* ===== END v43176_finance_details_reports.js ===== */
;

/* ===== BEGIN v43177_card_statement_design.js ===== */
/* RUTIN V43.17.7 — preserve statement workflow; premium card refresh; edit from statement */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof fmt==='function'?fmt(N(x)):N(x).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
function day(v){const n=parseInt(v,10);return n>=1&&n<=31?n:0}
function dateLine(o){const s=day(o.statementDay||o.statementDate),p=day(o.paymentDay||o.dueDate);return `KESİM ${s?('HER AY '+s):'—'} · SON ÖDEME ${p?('HER AY '+p):'—'}`;}

// Preserve the established Finance layout/tabs; only refresh the card surface and click targets.
const financeBefore43177=window.finance;
window.finance=function(){
  if(typeof ensure==='function')ensure();
  const tab=window.financeTabV4310||'cards';
  const cardHtml=(o,isFlex)=>{
    const used=N(o.balance),limit=N(o.limit),avail=Math.max(0,limit-used),pct=limit?Math.min(100,Math.round((used/limit)*100)):0;
    const click=isFlex
      ? `openFinanceDetail43176('flex','${E(o.id)}')`
      : `openCardDetailV43163('${E(o.id)}')`;
    const label=isFlex?'ESNEK HESAP':'KREDİ KARTI';
    const action=isFlex?'DOKUN · HESAP DETAYI':'DOKUN · EKSTREYİ AÇ';
    return `<button class="financeCard43177 ${isFlex?'flex43177':'credit43177'}" onclick="${click}">
      <span class="financeCardGlow43177"></span>
      <div class="financeCardTop43177"><span class="financeCardChip43177">▦</span><span>${label}</span><i>)))</i></div>
      <div class="financeCardName43177"><small>${isFlex?'FİNANS HESABI':'PREMIUM CARD'}</small><b>${E(o.name||(isFlex?'ESNEK HESAP':'KREDİ KARTI'))}</b></div>
      <div class="financeCardDebt43177"><small>${isFlex?'KULLANILAN TUTAR':'GÜNCEL BORÇ'}</small><strong>${M(used)}</strong></div>
      <div class="financeCardStats43177"><span><small>LİMİT</small><b>${M(limit)}</b></span><span><small>KULLANILABİLİR</small><b>${M(avail)}</b></span></div>
      <div class="financeCardBar43177"><i style="width:${pct}%"></i></div>
      <div class="financeCardDates43177">${E(dateLine(o))}</div>
      <div class="financeCardTap43177"><span>${action}</span><b>›</b></div>
    </button>`;
  };
  const cards=A(state.cards).map(c=>cardHtml(c,false)).join('');
  const flex=A(state.flexAccounts).map(a=>cardHtml(a,true)).join('');
  // Keep the existing Investments area by extracting it from the current finance implementation.
  if(tab==='investments') return financeBefore43177();
  return `${header('FİNANS',true)}<div class="finance4311 finance43177"><div class="financeTabs4310"><button class="${tab==='cards'?'active':''}" onclick="setFinanceTabV4310('cards')">▰<span>KARTLAR</span></button><button class="${tab==='accounts'?'active':''}" onclick="setFinanceTabV4310('accounts')">◇<span>HESAPLAR</span></button><button class="${tab==='investments'?'active':''}" onclick="setFinanceTabV4310('investments')">◆<span>YATIRIMLAR</span></button></div>${tab==='cards'?`<div class="fin4310Head"><div><small>FİNANS</small><b>KREDİ KARTLARIM</b></div><button onclick="openModal('addCard')">＋ KART EKLE</button></div><div class="verticalFinanceDeck financeDeck43177">${cards||'<div class="notice">HENÜZ KREDİ KARTI YOK.</div>'}</div>`:''}${tab==='accounts'?`<div class="fin4310Head"><div><small>FİNANS</small><b>ESNEK HESAPLAR</b></div><button onclick="openModal('addFlex')">＋ HESAP EKLE</button></div><div class="verticalFinanceDeck financeDeck43177">${flex||'<div class="notice">HENÜZ ESNEK HESAP YOK.</div>'}</div>`:''}</div>`;
};

// Statement remains the primary card screen. Add edit entry without replacing statement content.
const statementBefore43177=window.cardDetailV43163;
window.cardDetailV43163=function(){
  let html=statementBefore43177();
  const c=state.cards.find(x=>String(x.id)===String(window.cardDetailIdV43163));
  if(!c||typeof html!=='string')return html;
  const edit=`<div class="statementEdit43177"><div class="statementActions43177"><button onclick="openModal('cardSpend:${E(c.id)}')">＋ HARCAMA EKLE</button><button onclick="openCardEditor43177('${E(c.id)}')">✎ KARTI DÜZENLE</button><button class="danger43177" onclick="deleteCardV39('${E(c.id)}')">× KARTI SİL</button></div><span>AD · LİMİT · HESAP KESİM · SON ÖDEME bilgileri buradan değiştirilebilir. Ödeme işlemi için mevcut “NE KADAR ÖDEDİM?” butonu korunur.</span></div>`;
  const anchor='<div class="statementNav43174">';
  if(html.includes(anchor)) html=html.replace(anchor,edit+anchor);
  else html=html.replace(/(<div class="cardDetailHeroV13"[\s\S]*?<\/div>)/,`$1${edit}`);
  return html;
};

window.openCardEditor43177=function(id){window.rutinEditReturn43177=String(id);openModal(`editCard:${id}`)};
const saveCardBefore43177=window.saveFinanceCard43175;
if(typeof saveCardBefore43177==='function'){
  window.saveFinanceCard43175=function(e,id=''){
    const ret=window.rutinEditReturn43177;
    saveCardBefore43177(e,id);
    if(ret&&String(ret)===String(id)){
      window.rutinEditReturn43177='';
      window.cardDetailIdV43163=id;
      window.rutinStatementOffset43174=window.rutinStatementOffset43174||0;
      screen='cardDetailV43163';
      render();
    }
  };
}

})();

/* ===== END v43177_card_statement_design.js ===== */
;

/* ===== BEGIN v43178_flex_finance_standard.js ===== */
/* RUTIN V43.17.8 — FLEX ACCOUNT STATEMENT + FINANCE SUMMARY + REGRESSION-SAFE */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof fmt==='function'?fmt(N(x)):N(x).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
function day(v){const n=parseInt(v,10);return n>=1&&n<=31?n:0}
function dateLine(o){const s=day(o.statementDay||o.statementDate),p=day(o.paymentDay||o.dueDate);return `KESİM ${s?('HER AY '+s):'—'} · SON ÖDEME ${p?('HER AY '+p):'—'}`;}
function txType(t){return t?.type==='payment'||N(t?.amount)<0?'payment':'spend'}
function sortedTx(o){return [...A(o?.transactions)].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))}
function financeSummary(){
 const cards=A(state.cards),flex=A(state.flexAccounts);
 const cb=cards.reduce((s,x)=>s+N(x.balance),0),fb=flex.reduce((s,x)=>s+N(x.balance),0);
 const totalLimit=[...cards,...flex].reduce((s,x)=>s+N(x.limit),0),used=cb+fb,avail=Math.max(0,totalLimit-used);
 return `<div class="financeOverview43178"><div><small>TOPLAM BORÇ / KULLANIM</small><b>${M(used)}</b></div><div><small>TOPLAM LİMİT</small><b>${M(totalLimit)}</b></div><div><small>KULLANILABİLİR</small><b>${M(avail)}</b></div></div>`;
}

const financeBefore=window.finance;
window.finance=function(){
 let html=financeBefore();
 if(typeof html!=='string'||(window.financeTabV4310||'cards')==='investments')return html;
 const marker='<div class="financeTabs4310">';
 const ix=html.indexOf(marker);
 if(ix<0)return html;
 const end=html.indexOf('</div>',ix)+6;
 return html.slice(0,end)+financeSummary()+html.slice(end);
};

window.openFlexStatement43178=function(id){
 window.flexStatementId43178=String(id);
 openModal(`flexStatement43178:${id}`);
};

// Make flex cards open the account statement directly while preserving card statement flow.
const financeAfterSummary=window.finance;
window.finance=function(){
 let html=financeAfterSummary();
 if(typeof html!=='string')return html;
 html=html.replace(/openFinanceDetail43176\('flex','([^']+)'\)/g,"openFlexStatement43178('$1')")
          .replace(/DOKUN · HESAP DETAYI/g,'DOKUN · HESAP DÖKÜMÜ');
 return html;
};

const modalBefore=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('flexStatement43178:')){
   const id=k.split(':')[1],a=A(state.flexAccounts).find(x=>String(x.id)===String(id));
   if(!a)return modalBefore(k);
   const tx=sortedTx(a),spends=tx.filter(t=>txType(t)==='spend'),pays=tx.filter(t=>txType(t)==='payment');
   const spendTotal=spends.reduce((s,t)=>s+Math.abs(N(t.amount)),0),payTotal=pays.reduce((s,t)=>s+Math.abs(N(t.amount)),0);
   const limit=N(a.limit),bal=N(a.balance),avail=Math.max(0,limit-bal),pct=limit?Math.min(100,Math.round(bal/limit*100)):0;
   const rows=tx.slice(0,80).map(t=>{const pay=txType(t)==='payment';return `<div class="flexStatementRow43178"><div><b>${E(t.title||(pay?'HESAP ÖDEMESİ':'HARCAMA'))}</b><small>${E(t.date||'')} · ${pay?'ÖDEME':'HARCAMA'}</small></div><strong class="${pay?'green':'red'}">${pay?'-':'+'}${M(Math.abs(N(t.amount)))}</strong></div>`}).join('')||'<div class="notice">HAREKET YOK.</div>';
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet flexStatementSheet43178" onclick="event.stopPropagation()"><div class="sheetHead"><b>ESNEK HESAP DÖKÜMÜ</b><button class="close" onclick="closeModal()">×</button></div>
   <div class="flexHero43178"><small>${E(a.name||'ESNEK HESAP')}</small><strong>${M(bal)}</strong><span>KULLANILAN TUTAR</span><div class="financeUsageBar43176"><i style="width:${pct}%"></i></div><div class="flexStats43178"><span>LİMİT <b>${M(limit)}</b></span><span>KULLANILABİLİR <b>${M(avail)}</b></span><span>KULLANIM <b>%${pct}</b></span></div><em>${E(dateLine(a))}</em></div>
   <div class="statementActions43177 flexActions43178"><button onclick="closeModal();openModal('flexSpend4310:${E(id)}')">＋ HARCAMA EKLE</button><button onclick="closeModal();openModal('flexPay4310:${E(id)}')">✓ ÖDEME YAP</button><button onclick="openFlexEditor43178('${E(id)}')">✎ HESABI DÜZENLE</button><button class="danger43177" onclick="deleteFlexV4310('${E(id)}')">× HESABI SİL</button></div>
   <div class="financeTotals43176"><div><small>TÜM HARCAMALAR</small><b>${M(spendTotal)}</b></div><div><small>TÜM ÖDEMELER</small><b>${M(payTotal)}</b></div></div>
   <div class="section"><b>HAREKET / ÖDEME GEÇMİŞİ</b><span>${tx.length} KAYIT</span></div><div class="flexStatementList43178">${rows}</div></div></div>`;
 }
 return modalBefore(k);
};

window.openFlexEditor43178=function(id){window.rutinFlexEditReturn43178=String(id);closeModal();openModal(`editFlex:${id}`)};
const saveFlexBefore=window.saveFinanceFlex43175;
if(typeof saveFlexBefore==='function'){
 window.saveFinanceFlex43175=function(e,id=''){
   const ret=window.rutinFlexEditReturn43178;
   saveFlexBefore(e,id);
   if(ret&&String(ret)===String(id)){
     window.rutinFlexEditReturn43178='';
     setTimeout(()=>openFlexStatement43178(id),0);
   }
 };
}

// Reminder navigation should open the new flex statement; card reminders still use their existing detail/statement flow.
const openFinanceDetailBefore=window.openFinanceDetail43176;
window.openFinanceDetail43176=function(kind,id){
 if(kind==='flex')return openFlexStatement43178(id);
 return openFinanceDetailBefore(kind,id);
};

// Non-destructive style layer.
const st=document.createElement('style');st.id='v43178style';st.textContent=`
.financeOverview43178{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0 14px}.financeOverview43178>div{padding:12px 10px;border:1px solid rgba(126,194,221,.20);border-radius:14px;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))}.financeOverview43178 small{display:block;font-size:9px;opacity:.62;margin-bottom:5px}.financeOverview43178 b{font-size:14px}.flexStatementSheet43178{max-height:92vh;overflow:auto}.flexHero43178{padding:18px;border-radius:20px;background:linear-gradient(145deg,#11191a,#090d0e);border:1px solid rgba(89,235,187,.24);margin-bottom:12px}.flexHero43178>small,.flexHero43178>span,.flexHero43178>em{display:block}.flexHero43178>strong{display:block;font-size:30px;margin:6px 0}.flexHero43178>span,.flexHero43178>em{font-size:10px;opacity:.62;font-style:normal;margin-top:5px}.flexStats43178{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}.flexStats43178 span{font-size:9px;opacity:.75}.flexStats43178 b{display:block;font-size:11px;margin-top:3px}.flexActions43178{grid-template-columns:repeat(2,minmax(0,1fr))!important}.flexStatementList43178{display:flex;flex-direction:column;gap:7px}.flexStatementRow43178{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:11px 12px;border-radius:13px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.06)}.flexStatementRow43178 b,.flexStatementRow43178 small{display:block}.flexStatementRow43178 small{opacity:.55;font-size:10px;margin-top:3px}@media(max-width:390px){.financeOverview43178{grid-template-columns:1fr 1fr}.financeOverview43178>div:first-child{grid-column:1/-1}}
`;document.head.appendChild(st);

// version marker only; no data mutation.
state.meta=state.meta||{};state.meta.appDataVersion='43.17.8';try{save()}catch(_){ }
})();

/* ===== END v43178_flex_finance_standard.js ===== */
;

/* ===== BEGIN v43179_final_integrity.js ===== */
/* RUTIN V43.18.0 — safe integrity guard; explicit links only; no heuristic record creation */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const U=x=>String(x??'').trim();
const H=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const ID=()=>typeof uid==='function'?uid():('r'+Date.now()+Math.random().toString(36).slice(2));
function ensure43179(){
  if(!window.state)return;
  state.cards=A(state.cards);state.flexAccounts=A(state.flexAccounts);state.expenses=A(state.expenses);state.work=A(state.work);state.incomes=A(state.incomes);state.meta=state.meta||{};
  state.cards.forEach(c=>c.transactions=A(c.transactions));state.flexAccounts.forEach(a=>a.transactions=A(a.transactions));
}
function isSpend(t){return U(t?.type).toLowerCase()!=='payment'&&N(t?.amount)>=0}
function sameMoney(a,b){return Math.abs(N(a)-N(b))<0.01}
function findExpenseForTx(kind,owner,t){
  // Only use explicit stable links. Never guess by date/title/amount.
  return state.expenses.find(x=>String(x.id)===String(t.expenseId||'')) ||
    state.expenses.find(x=>U(x.sourceType)===kind&&String(x.sourceId||'')===String(t.id||''));
}
function repairLinks43179(){
  ensure43179();let repairs=0;
  // Safe link completion only when one side already carries an explicit identifier.
  state.expenses.forEach(x=>{
    const method=U(x.method).toLocaleUpperCase('tr-TR');
    if(method==='KREDİ KARTI'&&x.cardId){
      const c=state.cards.find(z=>String(z.id)===String(x.cardId));if(!c)return;
      let t=null;
      if(x.sourceId)t=A(c.transactions).find(z=>String(z.id)===String(x.sourceId));
      if(!t)t=A(c.transactions).find(z=>String(z.expenseId||'')===String(x.id));
      if(t){
        if(!t.expenseId){t.expenseId=x.id;repairs++;}
        if(!x.sourceId){x.sourceId=t.id;repairs++;}
        if(x.sourceType!=='card'){x.sourceType='card';repairs++;}
        if(!x.cardName&&c.name){x.cardName=c.name;repairs++;}
      }
    }
    if(method==='ESNEK HESAP'&&x.flexId){
      const a=state.flexAccounts.find(z=>String(z.id)===String(x.flexId));if(!a)return;
      let t=null;
      if(x.sourceId)t=A(a.transactions).find(z=>String(z.id)===String(x.sourceId));
      if(!t)t=A(a.transactions).find(z=>String(z.expenseId||'')===String(x.id));
      if(t){
        if(!t.expenseId){t.expenseId=x.id;repairs++;}
        if(!x.sourceId){x.sourceId=t.id;repairs++;}
        if(x.sourceType!=='flex'){x.sourceType='flex';repairs++;}
        if(!x.flexName&&a.name){x.flexName=a.name;repairs++;}
      }
    }
    if(U(x.category).toLocaleUpperCase('tr-TR')==='HARÇLIK'){
      const p=U(x.recipient||x.person||x.allowanceTo);if(p){if(x.recipient!==p){x.recipient=p;repairs++;}if(x.person!==p){x.person=p;repairs++;}}
    }
  });
  // Transaction -> expense: only complete an explicit expenseId/sourceId relation; do not fabricate records.
  state.cards.forEach(c=>A(c.transactions).forEach(t=>{
    if(!isSpend(t))return;
    const x=findExpenseForTx('card',c,t);
    if(x){if(!t.expenseId){t.expenseId=x.id;repairs++;}if(!x.sourceId){x.sourceId=t.id;repairs++;}if(x.sourceType!=='card'){x.sourceType='card';repairs++;}}
  }));
  state.flexAccounts.forEach(a=>A(a.transactions).forEach(t=>{
    if(!isSpend(t))return;
    const x=findExpenseForTx('flex',a,t);
    if(x){if(!t.expenseId){t.expenseId=x.id;repairs++;}if(!x.sourceId){x.sourceId=t.id;repairs++;}if(x.sourceType!=='flex'){x.sourceType='flex';repairs++;}}
  }));
  state.meta.lastRepair43179={at:new Date().toISOString(),repairs};state.meta.appDataVersion='43.18.0';return repairs;
}
function scan43179(){
  ensure43179();const issues=[];const ids=new Map();
  [...state.work,...state.expenses,...state.incomes].forEach(x=>{const id=U(x.id);if(!id)issues.push('Kimliği olmayan kayıt');else{ids.set(id,(ids.get(id)||0)+1);}});ids.forEach((n,id)=>{if(n>1)issues.push(`Tekrar kullanılan kayıt ID: ${id}`)});
  state.expenses.forEach(x=>{const m=U(x.method).toLocaleUpperCase('tr-TR');if(m==='KREDİ KARTI'){
    const c=state.cards.find(z=>String(z.id)===String(x.cardId||''));if(!c)issues.push(`Kartı bulunamayan harcama: ${x.date||'-'} / ${x.title||x.category||x.id}`);else{const t=A(c.transactions).find(z=>String(z.expenseId||'')===String(x.id)||String(z.id)===String(x.sourceId||''));if(!t)issues.push(`Ekstre bağlantısı olmayan kart harcaması: ${x.date||'-'} / ${x.title||x.id}`);else if(!sameMoney(t.amount,x.amount))issues.push(`Kart tutarı farklı: ${x.date||'-'} / ${x.title||x.id}`);}
  }else if(m==='ESNEK HESAP'){
    const a=state.flexAccounts.find(z=>String(z.id)===String(x.flexId||''));if(!a)issues.push(`Esnek hesabı bulunamayan harcama: ${x.date||'-'} / ${x.title||x.category||x.id}`);else{const t=A(a.transactions).find(z=>String(z.expenseId||'')===String(x.id)||String(z.id)===String(x.sourceId||''));if(!t)issues.push(`Hesap dökümü bağlantısı olmayan harcama: ${x.date||'-'} / ${x.title||x.id}`);else if(!sameMoney(t.amount,x.amount))issues.push(`Esnek hesap tutarı farklı: ${x.date||'-'} / ${x.title||x.id}`);}
  }});
  state.cards.forEach(c=>A(c.transactions).forEach(t=>{if(isSpend(t)&&!findExpenseForTx('card',c,t))issues.push(`Harcamalar listesine bağlı olmayan kart hareketi: ${c.name||'Kart'} / ${t.date||'-'}`);}));
  state.flexAccounts.forEach(a=>A(a.transactions).forEach(t=>{if(isSpend(t)&&!findExpenseForTx('flex',a,t))issues.push(`Harcamalar listesine bağlı olmayan Esnek Hesap hareketi: ${a.name||'Esnek Hesap'} / ${t.date||'-'}`);}));
  state.meta.lastIntegrity43179={at:new Date().toISOString(),issues:issues.length};return issues;
}
window.rutinFinalIntegrity43179=function(show=true){
  const repaired=repairLinks43179();const issues=scan43179();
  try{if(typeof save==='function')save();}catch(_){ }
  if(show){window.rutinIntegrityResult43179={issues,repaired,at:new Date().toISOString()};openModal('integrity43179');}
  return {issues,repaired};
};

// Run once per data version; this is deliberately non-destructive and never recalculates balances.
try{ensure43179();if(state.meta.integrityMigration43179!=='done'){const r=repairLinks43179();state.meta.integrityMigration43179='done';state.meta.integrityMigration43179Repairs=r;state.meta.integrityMigration43179At=new Date().toISOString();if(typeof save==='function')save();}}catch(_){ }

// Add an explicit user-visible system check without replacing the existing Settings UI.
const settingsBefore43179=window.settings;
if(typeof settingsBefore43179==='function')window.settings=function(){let h=settingsBefore43179();const last=state?.meta?.lastIntegrity43179;const badge=last?`${last.issues||0} UYARI`:'KONTROL EDİLMEDİ';return `${h}<div class="card settingsCard integrityCard43179"><div class="setting clickable premiumSetting" onclick="rutinFinalIntegrity43179(true)"><div class="settingIcon">✓</div><b>SİSTEM BÜTÜNLÜĞÜ</b><span>${H(badge)} ›</span></div><div class="notice">Kart, Esnek Hesap ve Harcama bağlantılarını kontrol eder. Yalnız açık ID bağlantılarını tamamlar; tahminle yeni kayıt oluşturmaz ve borç/limit toplamlarını değiştirmez.</div></div>`;};
const modalBefore43179=window.modalHtml;
window.modalHtml=function(k){if(k==='integrity43179'){
 const r=window.rutinIntegrityResult43179||{issues:scan43179(),repaired:0};const ok=!r.issues.length;const rows=r.issues.slice(0,60).map(x=>`<div class="integrityIssue43179">⚠ ${H(x)}</div>`).join('');
 return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet integritySheet43179" onclick="event.stopPropagation()"><div class="sheetHead"><b>SİSTEM BÜTÜNLÜĞÜ</b><button class="close" onclick="closeModal()">×</button></div><div class="integrityHero43179 ${ok?'ok':'warn'}"><strong>${ok?'✓':'!'}</strong><div><b>${ok?'SİSTEM TUTARLI':'KONTROL GEREKİYOR'}</b><small>${r.repaired||0} AÇIK BAĞLANTI TAMAMLANDI · ${r.issues.length} UYARI</small></div></div>${rows||'<div class="notice">Kart / Esnek Hesap / Harcama bağlantılarında sorun bulunmadı.</div>'}<div class="notice">Uyarılar otomatik veri silmez veya borç tutarını değiştirmez.</div></div></div>`;
 }return modalBefore43179(k);};

const st=document.createElement('style');st.id='v43179style';st.textContent=`
.integrityCard43179{margin-top:12px}.integritySheet43179{max-height:90vh;overflow:auto}.integrityHero43179{display:flex;gap:12px;align-items:center;padding:15px;border-radius:16px;margin-bottom:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035)}.integrityHero43179>strong{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;font-size:24px;background:rgba(255,255,255,.08)}.integrityHero43179 b,.integrityHero43179 small{display:block}.integrityHero43179 small{opacity:.62;font-size:10px;margin-top:4px}.integrityHero43179.ok{border-color:rgba(74,222,128,.28)}.integrityHero43179.warn{border-color:rgba(251,191,36,.35)}.integrityIssue43179{padding:10px 11px;border-bottom:1px solid rgba(255,255,255,.06);font-size:11px;line-height:1.35}
`;document.head.appendChild(st);
})();

/* ===== END v43179_final_integrity.js ===== */
;

/* ===== BEGIN v43182_finance_platinum_cards.js ===== */
/* RUTIN V43.18.2 — PLATINUM VERTICAL CARDS + SYMMETRIC STATEMENT ACTIONS */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof fmt==='function'?fmt(N(x)):N(x).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});

function summaryHtml(){
  const cards=A(state.cards), flex=A(state.flexAccounts);
  const cardDebt=cards.reduce((s,x)=>s+N(x.balance),0), flexDebt=flex.reduce((s,x)=>s+N(x.balance),0);
  const totalLimit=[...cards,...flex].reduce((s,x)=>s+N(x.limit),0);
  const used=cardDebt+flexDebt, avail=Math.max(0,totalLimit-used);
  return `<div class="platinumFinanceSummary43182"><div><small>TOPLAM KULLANIM</small><b>${M(used)}</b></div><div><small>TOPLAM LİMİT</small><b>${M(totalLimit)}</b></div><div><small>KULLANILABİLİR</small><b>${M(avail)}</b></div></div>`;
}

function itemHtml(o,isFlex){
  const used=N(o.balance),limit=N(o.limit),avail=Math.max(0,limit-used),pct=limit?Math.min(100,Math.round(used/limit*100)):0;
  const label=isFlex?'ESNEK HESAP':'KREDİ KARTI';
  const title=E(o.name||(isFlex?'RUTİN FLEX':'RUTİN ELITE'));
  const click=isFlex?`openFlexStatement43178('${E(o.id)}')`:`openCardDetailV43163('${E(o.id)}')`;
  const action=isFlex?'HESAP DÖKÜMÜ':'EKSTREYİ AÇ';
  return `<div class="platinumFinanceItem43182 ${isFlex?'isFlex43182':'isCard43182'}">
    <button class="platinumCard43182" onclick="${click}" aria-label="${title} ${action}">
      <span class="platinumSweep43182"></span>
      <img class="platinumLogo43182" src="rutin-logo.png" alt="RUTİN">
      <div class="platinumCardTitle43182"><small>${label}</small><b>${title}</b></div>
      <div class="platinumCardTag43182">${isFlex?'RUTİN FLEX':'RUTİN ELITE'}</div>
      <div class="platinumCardArrow43182">›</div>
    </button>
    <div class="platinumStats43182">
      <div><small>${isFlex?'KREDİ LİMİTİ':'LİMİT'}</small><b>${M(limit)}</b></div>
      <div><small>${isFlex?'KULLANILAN':'BORÇ'}</small><b>${M(used)}</b></div>
      <div><small>KALAN LİMİT</small><b>${M(avail)}</b></div>
      <div class="platinumProgressRow43182"><i><span style="width:${pct}%"></span></i><em>%${pct}</em></div>
      <button class="platinumOpen43182" onclick="${click}"><span>${action}</span><b>›</b></button>
    </div>
  </div>`;
}

const financeBefore43182=window.finance;
window.finance=function(){
  if(typeof ensure==='function')ensure();
  const tab=window.financeTabV4310||'cards';
  if(tab==='investments')return financeBefore43182();
  const list=tab==='cards'?A(state.cards):A(state.flexAccounts);
  const body=list.map(x=>itemHtml(x,tab==='accounts')).join('');
  const title=tab==='cards'?'KREDİ KARTLARIM':'ESNEK HESAPLAR';
  const add=tab==='cards'?`openModal('addCard')`:`openModal('addFlex')`;
  const addText=tab==='cards'?'KART EKLE':'HESAP EKLE';
  const empty=tab==='cards'?'HENÜZ KREDİ KARTI YOK.':'HENÜZ ESNEK HESAP YOK.';
  return `${header('FİNANS',true)}<div class="finance4311 platinumFinance43182">
    <div class="financeTabs4310"><button class="${tab==='cards'?'active':''}" onclick="setFinanceTabV4310('cards')">▰<span>KARTLAR</span></button><button class="${tab==='accounts'?'active':''}" onclick="setFinanceTabV4310('accounts')">◇<span>HESAPLAR</span></button><button onclick="setFinanceTabV4310('investments')">◆<span>YATIRIMLAR</span></button></div>
    ${summaryHtml()}
    <div class="fin4310Head platinumHead43182"><div><small>FİNANS</small><b>${title}</b></div><button onclick="${add}">＋ ${addText}</button></div>
    <div class="platinumDeck43182">${body||`<div class="notice">${empty}</div>`}</div>
  </div>`;
};

// Card statement already has exactly the requested 3 actions from V43.17.7.
// This layer only standardizes them into one symmetric row and leaves all statement logic intact.
const st=document.createElement('style');
st.id='v43182style';
st.textContent=`
.platinumFinance43182{padding:8px 12px 110px!important;background:linear-gradient(180deg,#050607,#090a0c 35%,#050607)}
.platinumFinanceSummary43182{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:11px 0 15px}
.platinumFinanceSummary43182>div{min-width:0;padding:10px 8px;border:1px solid rgba(220,225,230,.13);border-radius:12px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012))}
.platinumFinanceSummary43182 small{display:block;font-size:7.5px;letter-spacing:.5px;color:#858b91;margin-bottom:4px}.platinumFinanceSummary43182 b{font-size:11px;color:#e7e9eb;white-space:nowrap}
.platinumHead43182 small{color:#8f959a!important}.platinumHead43182>button{border-color:#44494e!important;background:#111315!important;color:#e5e8ea!important}
.platinumDeck43182{display:grid;grid-template-columns:1fr;gap:16px;width:100%;max-width:520px;margin:0 auto}
.platinumFinanceItem43182{display:grid;gap:8px}
.platinumCard43182{position:relative;width:100%;aspect-ratio:1.58/1;border-radius:22px;overflow:hidden;text-align:left;border:1px solid rgba(224,228,232,.34);background:linear-gradient(145deg,#090a0b 0%,#24272a 35%,#0a0b0c 62%,#181b1e 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 12px 26px rgba(0,0,0,.42);color:#f1f3f4;padding:16px;display:block}
.platinumCard43182:before{content:"";position:absolute;right:-5%;top:-12%;width:50%;height:130%;transform:rotate(18deg);background:repeating-linear-gradient(90deg,rgba(255,255,255,.055) 0 1px,transparent 1px 7px);opacity:.33}
.platinumCard43182:after{content:"";position:absolute;left:-20%;bottom:-50%;width:105%;height:75%;border:1px solid rgba(230,233,235,.36);border-radius:52%;transform:rotate(-10deg);box-shadow:0 0 0 1px rgba(255,255,255,.02)}
.isFlex43182 .platinumCard43182{background:linear-gradient(145deg,#0d0f11,#202328 38%,#090a0c 66%,#15171a);border-color:rgba(197,203,210,.28)}
.platinumSweep43182{position:absolute;inset:-30% 28% 48% -22%;transform:rotate(-18deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.075),transparent);pointer-events:none}
.platinumLogo43182{position:absolute;left:14px;top:13px;width:76px;height:76px;object-fit:cover;border-radius:18px;filter:grayscale(1) brightness(1.55) contrast(1.08);opacity:.95;mix-blend-mode:screen}
.platinumCardTitle43182{position:absolute;left:16px;bottom:18px;z-index:2}.platinumCardTitle43182 small{display:block;font-size:7px;letter-spacing:1.45px;color:#9ca2a7}.platinumCardTitle43182 b{display:block;margin-top:5px;max-width:230px;font-size:18px;letter-spacing:.7px;color:#f5f6f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.platinumCardTag43182{position:absolute;right:16px;top:17px;font-size:7px;letter-spacing:1.8px;color:#aeb3b8}.platinumCardArrow43182{position:absolute;right:17px;bottom:15px;font-size:26px;font-weight:200;color:#d9dde0}
.platinumStats43182{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:10px;border-radius:16px;border:1px solid rgba(220,225,230,.14);background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.012))}
.platinumStats43182>div:not(.platinumProgressRow43182){min-width:0;padding:3px 5px}.platinumStats43182 small{display:block;font-size:7px;letter-spacing:.45px;color:#80868c}.platinumStats43182 b{display:block;margin-top:4px;font-size:11px;color:#e7e9eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.platinumProgressRow43182{grid-column:1/-1;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:2px 5px}.platinumProgressRow43182 i{height:5px;border-radius:99px;background:#151719;border:1px solid #303337;overflow:hidden}.platinumProgressRow43182 i span{display:block;height:100%;background:linear-gradient(90deg,#70767b,#e2e5e7,#7b8187);border-radius:inherit}.platinumProgressRow43182 em{font-style:normal;font-size:8px;color:#9ba0a5}
.platinumOpen43182{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;width:100%;padding:9px 7px 2px;border:0;border-top:1px solid rgba(255,255,255,.08);background:transparent;color:#afb4b8;font-size:8px;font-weight:800;letter-spacing:1.1px;text-align:left}.platinumOpen43182 b{font-size:18px;font-weight:300;margin:0;color:#dce0e2}
/* exact symmetric card-statement actions: 3 equal buttons, no full-row delete */
.statementEdit43177{margin:10px 14px 8px!important;padding:10px!important;border:1px solid rgba(220,225,230,.16)!important;border-radius:14px!important;background:linear-gradient(145deg,#111315,#090a0b)!important;display:block!important}
.statementActions43177{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important;align-items:stretch!important}
.statementActions43177 button{grid-column:auto!important;width:100%!important;min-width:0!important;min-height:48px!important;padding:8px 5px!important;border:1px solid #3f4448!important;border-radius:11px!important;background:linear-gradient(145deg,#181b1e,#0d0f11)!important;color:#e2e5e7!important;font-size:8px!important;line-height:1.2!important;font-weight:800!important;text-align:center!important}
.statementActions43177 .danger43177{grid-column:auto!important;border-color:#5a3033!important;background:linear-gradient(145deg,#201113,#100a0b)!important;color:#f2a3aa!important}
.statementEdit43177>span{display:none!important}
@media(max-width:390px){.platinumFinance43182{padding-left:10px!important;padding-right:10px!important}.platinumCard43182{padding:13px;border-radius:19px}.platinumLogo43182{width:68px;height:68px}.platinumCardTitle43182 b{font-size:16px}.platinumFinanceSummary43182 b{font-size:10px}.statementActions43177{gap:5px!important}.statementActions43177 button{font-size:7px!important;padding:7px 3px!important}}
@media(max-width:340px){.platinumFinanceSummary43182{grid-template-columns:1fr 1fr}.platinumFinanceSummary43182>div:first-child{grid-column:1/-1}.statementActions43177{grid-template-columns:1fr!important}.statementActions43177 .danger43177{grid-column:auto!important}}
`;
document.head.appendChild(st);

state.meta=state.meta||{};state.meta.appDataVersion='43.18.2';try{save()}catch(_){ }
})();

/* ===== END v43182_finance_platinum_cards.js ===== */
;

/* ===== BEGIN v43183_vertical_card_statement_fix.js ===== */
/* RUTIN V43.18.3 — TRUE PORTRAIT FINANCE CARDS + CARD INFO + DIRECT STATEMENT */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof fmt==='function'?fmt(N(x)):N(x).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
const D=v=>{const n=parseInt(v,10);return n>=1&&n<=31?n:0};

window.openCreditStatement43183=function(id){
  window.cardDetailIdV43163=String(id);
  window.rutinStatementOffset43174=0;
  window.financeTabV4310='cards';
  screen='cardDetailV43163';
  render();
};
window.openFlexStatementDirect43183=function(id){
  window.financeTabV4310='accounts';
  if(typeof openFlexStatement43178==='function') return openFlexStatement43178(String(id));
  if(typeof openFinanceDetail43176==='function') return openFinanceDetail43176('flex',String(id));
};

function summaryHtml(){
  const cards=A(state.cards), flex=A(state.flexAccounts);
  const used=[...cards,...flex].reduce((s,x)=>s+N(x.balance),0);
  const limit=[...cards,...flex].reduce((s,x)=>s+N(x.limit),0);
  const avail=Math.max(0,limit-used);
  return `<div class="portraitFinanceSummary43183"><div><small>TOPLAM KULLANIM</small><b>${M(used)}</b></div><div><small>TOPLAM LİMİT</small><b>${M(limit)}</b></div><div><small>KULLANILABİLİR</small><b>${M(avail)}</b></div></div>`;
}

function faceInfo(o,isFlex){
  const s=D(o.statementDay||o.statementDate), p=D(o.paymentDay||o.dueDate);
  return `<div class="portraitFaceInfo43183">
    <div><small>LİMİT</small><b>${M(o.limit)}</b></div>
    <div><small>HESAP KESİM</small><b>${s?`HER AY ${s}`:'—'}</b></div>
    <div><small>SON ÖDEME</small><b>${p?`HER AY ${p}`:'—'}</b></div>
  </div>`;
}

function itemHtml(o,isFlex){
  const used=N(o.balance), limit=N(o.limit), avail=Math.max(0,limit-used), pct=limit?Math.min(100,Math.round(used/limit*100)):0;
  const title=E(o.name||(isFlex?'ESNEK HESAP':'KREDİ KARTI'));
  const click=isFlex?`openFlexStatementDirect43183('${E(o.id)}')`:`openCreditStatement43183('${E(o.id)}')`;
  const type=isFlex?'ESNEK HESAP':'KREDİ KARTI';
  const action=isFlex?'HESAP DÖKÜMÜ':'EKSTRE';
  return `<article class="portraitFinanceItem43183 ${isFlex?'portraitFlex43183':'portraitCredit43183'}">
    <button type="button" class="portraitCard43183" onclick="${click}" aria-label="${title} ${action}">
      <span class="portraitCardLayer43183 layerA"></span><span class="portraitCardLayer43183 layerB"></span>
      <img class="portraitCardMark43183" src="rutin-mark.png" alt="RUTİN">
      <div class="portraitBrand43183"><b>RUTİN</b><small>${type}</small></div>
      <div class="portraitName43183"><small>${isFlex?'HESAP ADI':'KART ADI'}</small><strong>${title}</strong></div>
      ${faceInfo(o,isFlex)}
      <div class="portraitTap43183"><span>${action} İÇİN DOKUN</span><b>›</b></div>
    </button>
    <div class="portraitStats43183">
      <div><small>${isFlex?'KULLANILAN':'GÜNCEL BORÇ'}</small><b>${M(used)}</b></div>
      <div><small>KALAN LİMİT</small><b>${M(avail)}</b></div>
      <div class="portraitProgress43183"><i><span style="width:${pct}%"></span></i><em>%${pct}</em></div>
    </div>
  </article>`;
}

const financeBefore43183=window.finance;
window.finance=function(){
  if(typeof ensure==='function')ensure();
  const tab=window.financeTabV4310||'cards';
  if(tab==='investments')return financeBefore43183();
  const isCards=tab==='cards';
  const list=isCards?A(state.cards):A(state.flexAccounts);
  const body=list.map(x=>itemHtml(x,!isCards)).join('');
  return `${header('FİNANS',true)}<div class="finance4311 portraitFinance43183">
    <div class="financeTabs4310"><button class="${isCards?'active':''}" onclick="setFinanceTabV4310('cards')">▰<span>KARTLAR</span></button><button class="${!isCards?'active':''}" onclick="setFinanceTabV4310('accounts')">◇<span>HESAPLAR</span></button><button onclick="setFinanceTabV4310('investments')">◆<span>YATIRIMLAR</span></button></div>
    ${summaryHtml()}
    <div class="fin4310Head portraitHead43183"><div><small>FİNANS</small><b>${isCards?'KREDİ KARTLARIM':'ESNEK HESAPLAR'}</b></div><button onclick="openModal('${isCards?'addCard':'addFlex'}')">＋ ${isCards?'KART EKLE':'HESAP EKLE'}</button></div>
    <div class="portraitDeck43183">${body||`<div class="notice">${isCards?'HENÜZ KREDİ KARTI YOK.':'HENÜZ ESNEK HESAP YOK.'}</div>`}</div>
  </div>`;
};

const st=document.createElement('style');
st.id='v43183style';
st.textContent=`
.portraitFinance43183{padding:8px 12px 110px!important;background:linear-gradient(180deg,#050607,#0a0b0d 38%,#050607)}
.portraitFinanceSummary43183{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:11px 0 15px}.portraitFinanceSummary43183>div{min-width:0;padding:10px 8px;border:1px solid rgba(215,220,225,.12);border-radius:12px;background:rgba(255,255,255,.025)}.portraitFinanceSummary43183 small{display:block;font-size:7px;letter-spacing:.45px;color:#7f858b;margin-bottom:4px}.portraitFinanceSummary43183 b{font-size:10.5px;color:#e6e8ea;white-space:nowrap}
.portraitHead43183>button{border-color:#3d4247!important;background:#101214!important;color:#e8eaec!important}
.portraitDeck43183{display:grid;grid-template-columns:1fr;gap:22px;width:100%;max-width:520px;margin:0 auto}.portraitFinanceItem43183{display:grid;gap:9px;justify-items:center;width:100%}
.portraitCard43183{position:relative;width:min(78vw,300px);aspect-ratio:.72/1;border-radius:28px;overflow:hidden;border:1px solid rgba(224,228,232,.34);background:linear-gradient(155deg,#171a1d 0%,#08090a 42%,#1d2023 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 18px 34px rgba(0,0,0,.5);color:#f2f4f5;text-align:left;padding:18px;display:block}
.portraitFlex43183 .portraitCard43183{background:linear-gradient(155deg,#111418,#20242a 26%,#08090b 63%,#171a1f 100%)}
.portraitCard43183:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(115deg,transparent 0 13px,rgba(255,255,255,.025) 13px 14px);opacity:.35;pointer-events:none}.portraitCard43183:after{content:"";position:absolute;left:-42%;bottom:18%;width:120%;height:31%;border:1px solid rgba(220,225,230,.28);border-radius:50%;transform:rotate(-30deg);pointer-events:none}
.portraitCardLayer43183{position:absolute;pointer-events:none}.portraitCardLayer43183.layerA{right:-26%;top:18%;width:82%;height:28%;transform:rotate(35deg);background:linear-gradient(90deg,transparent,rgba(225,229,233,.10),rgba(255,255,255,.02));border-top:1px solid rgba(235,238,240,.22)}.portraitCardLayer43183.layerB{left:-36%;bottom:-2%;width:95%;height:26%;transform:rotate(-29deg);background:repeating-linear-gradient(90deg,rgba(255,255,255,.04) 0 1px,transparent 1px 7px);opacity:.55}
.portraitCardMark43183{position:absolute;left:18px;top:18px;width:70px;height:70px;object-fit:contain;filter:grayscale(1) brightness(1.65) contrast(1.08);opacity:.96;z-index:2}.portraitBrand43183{position:absolute;left:18px;top:90px;z-index:2}.portraitBrand43183 b{display:block;font-size:20px;letter-spacing:4px;color:#e9ecee}.portraitBrand43183 small{display:block;margin-top:5px;font-size:7px;letter-spacing:1.9px;color:#878e94}
.portraitName43183{position:absolute;left:18px;right:18px;top:146px;z-index:2;padding-top:14px;border-top:1px solid rgba(225,229,233,.13)}.portraitName43183 small{display:block;font-size:7px;letter-spacing:1.2px;color:#858b91}.portraitName43183 strong{display:block;margin-top:6px;font-size:18px;letter-spacing:.6px;color:#f4f5f6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.portraitFaceInfo43183{position:absolute;left:18px;right:18px;bottom:58px;display:grid;gap:9px;z-index:2}.portraitFaceInfo43183>div{display:flex;align-items:center;justify-content:space-between;gap:10px;padding-bottom:7px;border-bottom:1px solid rgba(230,233,235,.10)}.portraitFaceInfo43183 small{font-size:7px;letter-spacing:1px;color:#7f858b}.portraitFaceInfo43183 b{font-size:10px;letter-spacing:.3px;color:#dfe2e4;text-align:right}
.portraitTap43183{position:absolute;left:18px;right:18px;bottom:18px;display:flex;align-items:center;justify-content:space-between;z-index:2;color:#9fa5aa;font-size:7px;letter-spacing:1.2px}.portraitTap43183 b{font-size:20px;font-weight:300;color:#dfe2e4}
.portraitStats43183{width:min(88vw,390px);display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:10px;border:1px solid rgba(220,225,230,.13);border-radius:15px;background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012))}.portraitStats43183>div:not(.portraitProgress43183){padding:3px 6px;min-width:0}.portraitStats43183>div+div:not(.portraitProgress43183){border-left:1px solid rgba(255,255,255,.08)}.portraitStats43183 small{display:block;font-size:7px;letter-spacing:.5px;color:#7e858a}.portraitStats43183 b{display:block;margin-top:4px;font-size:11px;color:#e7e9eb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.portraitProgress43183{grid-column:1/-1;display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:4px 6px 1px}.portraitProgress43183 i{height:5px;border-radius:99px;background:#111315;border:1px solid #2d3135;overflow:hidden}.portraitProgress43183 i span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#737980,#dfe3e6,#747a80)}.portraitProgress43183 em{font-style:normal;font-size:8px;color:#8e9499}
/* Statement must stay the direct destination and its three actions stay symmetric. */
.statementEdit43177{display:block!important;margin:10px 14px 8px!important;padding:10px!important;border:1px solid rgba(220,225,230,.15)!important;border-radius:14px!important;background:#0d0f11!important}.statementActions43177{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}.statementActions43177 button{grid-column:auto!important;width:100%!important;min-width:0!important;min-height:48px!important;padding:8px 5px!important;border-radius:11px!important;text-align:center!important;font-size:8px!important;line-height:1.15!important}.statementActions43177 .danger43177{grid-column:auto!important}.statementEdit43177>span{display:none!important}
@media(max-width:390px){.portraitCard43183{width:min(80vw,286px);border-radius:25px}.portraitFaceInfo43183{bottom:55px}.portraitBrand43183 b{font-size:18px}.portraitName43183 strong{font-size:16px}.statementActions43177{gap:5px!important}.statementActions43177 button{font-size:7px!important;padding:7px 3px!important}}
@media(max-width:340px){.portraitFinanceSummary43183{grid-template-columns:1fr 1fr}.portraitFinanceSummary43183>div:first-child{grid-column:1/-1}.portraitCard43183{width:min(84vw,270px)}.statementActions43177{grid-template-columns:1fr!important}}
`;
document.head.appendChild(st);
state.meta=state.meta||{};state.meta.appDataVersion='43.18.3';try{save()}catch(_){}
})();

/* ===== END v43183_vertical_card_statement_fix.js ===== */
;

/* ===== BEGIN v43184_card_info_design.js ===== */
/* RUTIN V43.18.4 — VERTICAL INFO CARD DESIGN + DIRECT STATEMENT */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof fmt==='function'?fmt(N(x)):N(x).toLocaleString('tr-TR',{style:'currency',currency:'TRY'});
const D=v=>{const n=parseInt(v,10);return n>=1&&n<=31?n:0};

function openCard(id){
  window.cardDetailIdV43163=String(id);
  window.rutinStatementOffset43174=0;
  window.financeTabV4310='cards';
  screen='cardDetailV43163';
  render();
}
function openFlex(id){
  window.financeTabV4310='accounts';
  if(typeof openFlexStatement43178==='function') return openFlexStatement43178(String(id));
  if(typeof openFinanceDetail43176==='function') return openFinanceDetail43176('flex',String(id));
}
window.openCreditStatement43184=openCard;
window.openFlexStatement43184=openFlex;

function summaryHtml(){
  const cards=A(state.cards), flex=A(state.flexAccounts);
  const used=[...cards,...flex].reduce((s,x)=>s+N(x.balance),0);
  const limit=[...cards,...flex].reduce((s,x)=>s+N(x.limit),0);
  const avail=Math.max(0,limit-used);
  return `<div class="finInfoSummary43184"><div><small>TOPLAM KULLANIM</small><b>${M(used)}</b></div><div><small>TOPLAM LİMİT</small><b>${M(limit)}</b></div><div><small>KULLANILABİLİR</small><b>${M(avail)}</b></div></div>`;
}

function infoBox(icon,label,value){
  return `<div class="finCardInfoBox43184"><span class="finCardInfoIcon43184">${icon}</span><div><small>${label}</small><b>${value}</b></div></div>`;
}

function cardHtml(o,isFlex){
  const id=E(o.id), title=E(o.name||(isFlex?'ESNEK HESAP':'KREDİ KARTI'));
  const limit=N(o.limit), used=N(o.balance), avail=Math.max(0,limit-used);
  const statement=D(o.statementDay||o.statementDate), due=D(o.paymentDay||o.dueDate);
  const type=isFlex?'ESNEK HESAP':'KREDİ KARTI';
  const click=isFlex?`openFlexStatement43184('${id}')`:`openCreditStatement43184('${id}')`;
  const last4=String(o.last4||o.cardLast4||o.lastFour||'').replace(/\D/g,'').slice(-4);
  return `<button type="button" class="finInfoCard43184 ${isFlex?'flex':''}" onclick="${click}" aria-label="${title} ${isFlex?'hesap dökümü':'ekstre'}">
    <span class="finCardMetal43184 finMetalA43184"></span>
    <span class="finCardMetal43184 finMetalB43184"></span>
    <div class="finCardTop43184">
      <img src="rutin-mark.png" alt="RUTİN" class="finCardLogo43184">
      <div class="finCardBrand43184"><strong>RUTİN</strong><small>PLANLA, UYGULA, BAŞAR</small></div>
    </div>
    <div class="finCardIdentity43184">
      <span>${type}</span>
      <small>${isFlex?'HESAP ADI':'KART ADI'}</small>
      <b>${title}</b>
      ${last4?`<em>•••• &nbsp;•••• &nbsp;•••• &nbsp;${E(last4)}</em>`:''}
    </div>
    <div class="finCardGrid43184">
      ${infoBox('▥',isFlex?'KREDİ LİMİTİ':'TOPLAM LİMİT',M(limit))}
      ${infoBox('↗','KULLANILABİLİR LİMİT',M(avail))}
      ${infoBox('▣','HESAP KESİM TARİHİ',statement?`HER AY ${statement}`:'—')}
      ${infoBox('◷','SON ÖDEME TARİHİ',due?`HER AY ${due}`:'—')}
    </div>
    <span class="finCardChevron43184">›</span>
  </button>`;
}

const financeBefore43184=window.finance;
window.finance=function(){
  if(typeof ensure==='function') ensure();
  const tab=window.financeTabV4310||'cards';
  if(tab==='investments') return financeBefore43184();
  const isCards=tab==='cards';
  const list=isCards?A(state.cards):A(state.flexAccounts);
  return `${header('FİNANS',true)}<div class="finance4311 finInfoFinance43184">
    <div class="financeTabs4310"><button class="${isCards?'active':''}" onclick="setFinanceTabV4310('cards')">▰<span>KARTLAR</span></button><button class="${!isCards?'active':''}" onclick="setFinanceTabV4310('accounts')">◇<span>HESAPLAR</span></button><button onclick="setFinanceTabV4310('investments')">◆<span>YATIRIMLAR</span></button></div>
    ${summaryHtml()}
    <div class="fin4310Head finInfoHead43184"><div><small>FİNANS</small><b>${isCards?'KREDİ KARTLARIM':'ESNEK HESAPLAR'}</b></div><button onclick="openModal('${isCards?'addCard':'addFlex'}')">＋ ${isCards?'KART EKLE':'HESAP EKLE'}</button></div>
    <div class="finInfoDeck43184">${list.map(x=>cardHtml(x,!isCards)).join('')||`<div class="notice">${isCards?'HENÜZ KREDİ KARTI YOK.':'HENÜZ ESNEK HESAP YOK.'}</div>`}</div>
  </div>`;
};

const st=document.createElement('style');
st.id='v43184style';
st.textContent=`
.finInfoFinance43184{padding:8px 12px 110px!important;background:linear-gradient(180deg,#050607,#090a0c 40%,#050607)}
.finInfoSummary43184{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:11px 0 15px}.finInfoSummary43184>div{min-width:0;padding:10px 8px;border:1px solid rgba(210,216,222,.11);border-radius:12px;background:rgba(255,255,255,.022)}.finInfoSummary43184 small{display:block;font-size:7px;letter-spacing:.45px;color:#7d8388;margin-bottom:4px}.finInfoSummary43184 b{font-size:10.5px;color:#e4e7e9;white-space:nowrap}
.finInfoHead43184>button{border-color:#3a3f43!important;background:#0e1012!important;color:#e7e9eb!important}
.finInfoDeck43184{display:grid;gap:22px;justify-items:center;width:100%;max-width:520px;margin:0 auto}
.finInfoCard43184{position:relative;width:min(83vw,330px);aspect-ratio:.79/1;border:1px solid rgba(225,230,234,.34);border-radius:30px;overflow:hidden;padding:0;background:linear-gradient(155deg,#191c1f 0%,#08090a 48%,#171a1d 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.15),0 18px 38px rgba(0,0,0,.55);color:#edf0f2;text-align:left;display:block}
.finInfoCard43184.flex{background:linear-gradient(155deg,#111417 0%,#20242a 24%,#07090a 60%,#15191d 100%)}
.finInfoCard43184:before{content:"";position:absolute;inset:0;background:repeating-linear-gradient(112deg,transparent 0 14px,rgba(255,255,255,.02) 14px 15px);opacity:.34;pointer-events:none}.finInfoCard43184:after{content:"";position:absolute;right:-32%;top:28%;width:88%;height:36%;transform:rotate(28deg);background:repeating-linear-gradient(90deg,rgba(255,255,255,.035) 0 1px,transparent 1px 8px);border-left:1px solid rgba(230,234,237,.18);opacity:.85;pointer-events:none}
.finCardMetal43184{position:absolute;pointer-events:none}.finMetalA43184{left:-18%;top:-4%;width:110%;height:34%;transform:rotate(-9deg);background:linear-gradient(150deg,rgba(235,238,240,.10),rgba(15,17,19,.0) 62%);border-bottom:1px solid rgba(238,241,243,.16)}.finMetalB43184{right:-34%;bottom:5%;width:100%;height:24%;transform:rotate(-27deg);background:linear-gradient(180deg,rgba(230,233,236,.045),transparent);border-top:1px solid rgba(232,236,239,.13)}
.finCardTop43184{position:absolute;left:18px;right:18px;top:18px;display:flex;align-items:center;gap:10px;z-index:2}.finCardLogo43184{width:58px;height:58px;object-fit:contain;filter:grayscale(1) brightness(1.72) contrast(1.08)}.finCardBrand43184 strong{display:block;font-size:21px;letter-spacing:4px;color:#edf0f2}.finCardBrand43184 small{display:block;margin-top:3px;font-size:6px;letter-spacing:1.45px;color:#838a90}
.finCardIdentity43184{position:absolute;left:18px;right:18px;top:92px;z-index:2;padding-top:13px;border-top:1px solid rgba(225,230,234,.12)}.finCardIdentity43184>span{display:block;font-size:11px;letter-spacing:2.4px;color:#cfd3d6;margin-bottom:11px}.finCardIdentity43184 small{display:block;font-size:7px;letter-spacing:1.25px;color:#7e858a}.finCardIdentity43184 b{display:block;margin-top:4px;font-size:18px;letter-spacing:.6px;color:#f5f6f7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.finCardIdentity43184 em{display:block;margin-top:10px;font-style:normal;font-size:12px;letter-spacing:2.5px;color:#cfd3d6}
.finCardGrid43184{position:absolute;left:14px;right:14px;bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:8px;z-index:2}.finCardInfoBox43184{min-width:0;min-height:64px;padding:10px 9px;border:1px solid rgba(221,226,230,.17);border-radius:14px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.012));display:grid;grid-template-columns:22px 1fr;gap:8px;align-items:center}.finCardInfoIcon43184{font-size:15px;color:#cfd4d8;text-align:center}.finCardInfoBox43184 small{display:block;font-size:6.3px;letter-spacing:.75px;color:#7e858b;line-height:1.25}.finCardInfoBox43184 b{display:block;margin-top:5px;font-size:10px;letter-spacing:.15px;color:#e8ebed;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.finCardChevron43184{position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:0;color:transparent}
/* No duplicate under-card debt/limit card; everything needed is inside the vertical card. */
.portraitStats43183{display:none!important}
/* Keep statement actions symmetric and direct statement behavior intact. */
.statementEdit43177{display:block!important;margin:10px 14px 8px!important;padding:10px!important;border:1px solid rgba(220,225,230,.15)!important;border-radius:14px!important;background:#0d0f11!important}.statementActions43177{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}.statementActions43177 button{grid-column:auto!important;width:100%!important;min-width:0!important;min-height:48px!important;padding:8px 5px!important;border-radius:11px!important;text-align:center!important;font-size:8px!important;line-height:1.15!important}.statementActions43177 .danger43177{grid-column:auto!important}.statementEdit43177>span{display:none!important}
@media(max-width:390px){.finInfoCard43184{width:min(85vw,315px);border-radius:27px}.finCardLogo43184{width:52px;height:52px}.finCardBrand43184 strong{font-size:19px}.finCardIdentity43184{top:86px}.finCardGrid43184{gap:7px}.finCardInfoBox43184{min-height:60px;padding:8px 7px}.finCardInfoBox43184 b{font-size:9.4px}.statementActions43177{gap:5px!important}.statementActions43177 button{font-size:7px!important;padding:7px 3px!important}}
@media(max-width:340px){.finInfoSummary43184{grid-template-columns:1fr 1fr}.finInfoSummary43184>div:first-child{grid-column:1/-1}.finInfoCard43184{width:min(88vw,290px)}.finCardBrand43184 small{display:none}.statementActions43177{grid-template-columns:1fr!important}}
`;
document.head.appendChild(st);
state.meta=state.meta||{};state.meta.appDataVersion='43.18.4';try{save()}catch(_){}
})();

/* ===== END v43184_card_info_design.js ===== */
;

/* ===== BEGIN v43185_backup_restore.js ===== */
/* RUTIN V43.18.5 — Safe backup restore */
(function(){
  'use strict';

  const oldOpenModal = window.openModal;
  if(typeof oldOpenModal === 'function'){
    window.openModal = function(k){
      oldOpenModal(k);
      if(k === 'backup') setTimeout(enhanceBackupModal,0);
    };
  }

  function enhanceBackupModal(){
    const sheet = document.querySelector('.modal .sheet');
    if(!sheet || sheet.querySelector('#rutinRestoreFile43185')) return;
    const head = sheet.querySelector('.sheetHead');
    if(!head || !/YEDEKLEME/i.test(head.textContent||'')) return;
    const primary = sheet.querySelector('button.primary');
    if(!primary) return;

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'secondary rutinRestoreBtn43185';
    restoreBtn.textContent = 'YEDEĞİ GERİ YÜKLE';
    restoreBtn.onclick = ()=>document.getElementById('rutinRestoreFile43185')?.click();
    primary.insertAdjacentElement('afterend', restoreBtn);

    const input = document.createElement('input');
    input.id = 'rutinRestoreFile43185';
    input.type = 'file';
    input.accept = '.rutin,.json,application/json,text/plain';
    input.hidden = true;
    input.addEventListener('change', handleRestoreFile43185);
    restoreBtn.insertAdjacentElement('afterend', input);

    const info = document.createElement('div');
    info.className = 'notice rutinRestoreNotice43185';
    info.innerHTML = '<b>GÜVENLİ GERİ YÜKLEME</b><br>RUTİN .rutin veya .json yedeğini seç. Dosya doğrulanır; mevcut verilerin güvenlik kopyası alınır ve sonra yedek geri yüklenir.';
    input.insertAdjacentElement('afterend', info);
  }

  function looksLikeRutinState43185(s){
    if(!s || typeof s !== 'object' || Array.isArray(s)) return false;
    const keys=['profile','settings','work','expenses','incomes','notes','investments','cards','flexAccounts','accounts','categories'];
    let score=0;
    for(const k of keys) if(Object.prototype.hasOwnProperty.call(s,k)) score++;
    if(score < 3) return false;
    for(const k of ['work','expenses','incomes','notes','investments','cards','flexAccounts']){
      if(s[k] != null && !Array.isArray(s[k])) return false;
    }
    return true;
  }

  function extractState43185(parsed){
    if(!parsed || typeof parsed!=='object') return null;
    const format=String(parsed.format||'');
    if(parsed.state && typeof parsed.state==='object'){
      if(format && !/^RUTIN-(?:BACKUP|DATA)-V\d+$/i.test(format)) return null;
      return parsed.state;
    }
    // Legacy raw-state files are accepted only if they clearly look like RUTIN data.
    return parsed;
  }

  async function handleRestoreFile43185(ev){
    const input=ev.currentTarget;
    const file=input.files && input.files[0];
    input.value='';
    if(!file) return;
    if(file.size > 25*1024*1024){ alert('YEDEK DOSYASI ÇOK BÜYÜK.'); return; }

    let parsed;
    try{
      const text=await file.text();
      parsed=JSON.parse(text);
    }catch(_){
      alert('DOSYA OKUNAMADI. GEÇERLİ BİR RUTİN YEDEĞİ SEÇ.');
      return;
    }

    const imported=extractState43185(parsed);
    if(!looksLikeRutinState43185(imported)){
      alert('BU DOSYA GEÇERLİ BİR RUTİN YEDEĞİ DEĞİL.');
      return;
    }

    const itemCounts={
      work:Array.isArray(imported.work)?imported.work.length:0,
      expenses:Array.isArray(imported.expenses)?imported.expenses.length:0,
      cards:Array.isArray(imported.cards)?imported.cards.length:0,
      flex:Array.isArray(imported.flexAccounts)?imported.flexAccounts.length:0
    };
    const created=parsed && parsed.created ? new Date(parsed.created) : null;
    const createdLabel=created && !Number.isNaN(created.getTime()) ? created.toLocaleString('tr-TR') : 'Bilinmiyor';
    const ok=confirm(
      'YEDEĞİ GERİ YÜKLEMEK İSTİYOR MUSUN?\n\n'+
      'Yedek tarihi: '+createdLabel+'\n'+
      'Çalışma: '+itemCounts.work+'\n'+
      'Harcama: '+itemCounts.expenses+'\n'+
      'Kart: '+itemCounts.cards+'\n'+
      'Esnek Hesap: '+itemCounts.flex+'\n\n'+
      'Mevcut verilerin önce güvenlik kopyası alınacak. Ardından uygulama yeniden açılacak.'
    );
    if(!ok) return;

    try{
      const currentRaw=localStorage.getItem('rutin-main');
      if(currentRaw){
        localStorage.setItem('rutin-pre-restore-backup',JSON.stringify({
          format:'RUTIN-PRE-RESTORE-V1',
          created:new Date().toISOString(),
          state:JSON.parse(currentRaw)
        }));
      }
      localStorage.setItem('rutin-main',JSON.stringify(imported));
      localStorage.setItem('rutin-last-restore-info',JSON.stringify({
        restoredAt:new Date().toISOString(),
        sourceName:file.name,
        sourceFormat:String(parsed?.format||'LEGACY')
      }));
      alert('YEDEK BAŞARIYLA YÜKLENDİ. UYGULAMA ŞİMDİ YENİDEN AÇILACAK.');
      location.reload();
    }catch(err){
      alert('GERİ YÜKLEME TAMAMLANAMADI. MEVCUT VERİLER KORUNDU.');
    }
  }

  // Fallback for any code path that renders the backup modal without calling window.openModal.
  const observer=new MutationObserver(()=>{
    if(document.querySelector('.modal .sheet')) enhanceBackupModal();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  const css=document.createElement('style');
  css.textContent=`
    .rutinRestoreBtn43185{width:100%;margin-top:9px;min-height:48px;font-weight:800;letter-spacing:.06em}
    .rutinRestoreNotice43185{margin-top:12px!important;line-height:1.55}
    .rutinRestoreNotice43185 b{display:inline-block;margin-bottom:4px}
  `;
  document.head.appendChild(css);
})();

/* ===== END v43185_backup_restore.js ===== */
;

/* ===== BEGIN v43186_salary_compact_ui.js ===== */
/* RUTIN V43.18.6 — SALARY AUTO DAY + COMPACT FINANCE/CATEGORIES + LEGACY RECORD INTEGRATION */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof money==='function'?money(N(x)):(typeof fmt==='function'?fmt(N(x)):N(x).toLocaleString('tr-TR',{style:'currency',currency:'TRY'}));
const U=x=>String(x??'').trim().toLocaleUpperCase('tr-TR');
const todayMonth=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`};

function ensureV43186(){
  state.meta=state.meta||{};
  state.profile=state.profile||{};
  state.settings=state.settings||{};
  state.work=A(state.work);state.expenses=A(state.expenses);state.incomes=A(state.incomes);state.categories=A(state.categories);

  // Monthly salary becomes the single source for the main-job daily amount.
  if(!(N(state.settings.monthlySalary)>0)){
    const oldDaily=N(state.settings.dailyRate);
    state.settings.monthlySalary=oldDaily>0?oldDaily*30:0;
  }
  if(N(state.settings.monthlySalary)>0) state.settings.dailyRate=Math.round((N(state.settings.monthlySalary)/30)*100)/100;

  // Legacy records: keep them, normalize only missing structure and surface their categories automatically.
  const known=new Set(state.categories.map(U).filter(Boolean));
  state.expenses.forEach(x=>{
    if(!x.id && typeof uid==='function')x.id=uid();
    if(!x.category)x.category=U(x.title||'DİĞER')||'DİĞER';
    x.category=U(x.category)||'DİĞER';
    if(!x.title)x.title=x.category;
    if(x.category&&!known.has(x.category)){state.categories.push(x.category);known.add(x.category);}
  });
  state.work.forEach(w=>{
    if(!w.id && typeof uid==='function')w.id=uid();
    if(w.type==='daily'){
      // Preserve legacy daily record amounts exactly as stored; salary automation applies to new entries only.
      if(w.paidAmount===undefined||w.paidAmount===null) w.paidAmount=0;
      if(!w.paymentStatus) w.paymentStatus=N(w.paidAmount)>=N(w.amount)&&N(w.amount)>0?'paid':(N(w.paidAmount)>0?'partial':'unpaid');
    }
  });
  state.meta.v43186LegacyIntegrated=true;
  state.meta.appDataVersion='43.18.9';
  try{save()}catch(_){ }
}
ensureV43186();

// PROFILE: monthly salary + automatically calculated daily amount.
const profileBefore43186=window.profile;
window.profile=function(){
  ensureV43186();
  let h=profileBefore43186();
  const monthly=M(state.settings.monthlySalary);
  const daily=M(state.settings.dailyRate);
  h=h.replace(/<div class="profileInfoRow"><span>VARSAYILAN GÜNLÜK ÜCRET<\/span><b>[\s\S]*?<\/b><\/div>/,
    `<div class="profileInfoRow salaryCompact43187"><span>AYLIK MAAŞ<small>GÜNLÜK: ${daily} · MAAŞ ÷ 30</small></span><b>${monthly}</b></div>`);
  return h;
};

const modalBefore43186=window.modalHtml;
window.modalHtml=function(k){
  ensureV43186();
  let h=modalBefore43186(k);
  if(k==='profile'){
    const monthly=N(state.settings.monthlySalary);
    const daily=N(state.settings.dailyRate);
    h=h.replace(/<div class="field"><label>GÜNLÜK ÜCRET<\/label><input name="dailyRate" type="number" value="[^"]*"><\/div>/,
      `<div class="field"><label>AYLIK MAAŞ</label><input name="monthlySalary" type="number" min="0" step="0.01" value="${monthly}" oninput="updateSalaryPreview43186(this.value)"></div><div class="field"><label>OTOMATİK GÜNLÜK ÜCRET (MAAŞ ÷ 30)</label><input id="autoDailyRate43186" name="dailyRate" type="number" value="${daily}" readonly></div>`);
  }
  return h;
};
window.updateSalaryPreview43186=function(v){
  const daily=Math.round((N(v)/30)*100)/100;
  const el=document.getElementById('autoDailyRate43186');if(el)el.value=daily;
};
window.submitProfile=function(e){
  e.preventDefault();
  const d=Object.fromEntries(new FormData(e.currentTarget).entries());
  state.profile.name=typeof upper==='function'?upper(d.name||'ZAZOHAN'):U(d.name||'ZAZOHAN');
  state.profile.motto=typeof upper==='function'?upper(d.motto||''):U(d.motto||'');
  state.profile.photo=d.photo||'';
  state.settings.monthlySalary=N(d.monthlySalary);
  state.settings.dailyRate=Math.round((state.settings.monthlySalary/30)*100)/100;
  state.settings.hourlyRate=N(d.hourlyRate);
  state.settings.overtimeRate=N(d.overtimeRate);
  try{save()}catch(_){ }
  closeModal();render();
};

// FINANCE: remove total limit / total available clutter. Keep only actual usage for current tab.
const financeBefore43186=window.finance;
window.finance=function(){
  ensureV43186();
  let h=financeBefore43186();
  const tab=window.financeTabV4310||'cards';
  if(tab==='cards'||tab==='accounts'){
    h=h.replace(/<div class="finInfoSummary43184">[\s\S]*?(?=<div class="fin4310Head)/,'');
    // Older finance summary layer fallback.
    h=h.replace(/<div class="platinumFinanceSummary43182">[\s\S]*?(?=<div class="fin4310Head)/,'');
  }
  return h;
};

// Post-render: hide unused category cards, make finance selected tab glass/transparent,
// lock daily main-job amount to salary-derived rate, and keep old category movements visible.
const renderBefore43186=window.render;
window.render=function(){
  ensureV43186();
  renderBefore43186();

  const month=todayMonth();
  const usedCats=new Set(A(state.expenses).filter(x=>String(x.date||'').startsWith(month)).map(x=>U(x.category||'DİĞER')));
  document.querySelectorAll('.v43166CategoryCard').forEach(btn=>{
    const c=U(btn.querySelector('b')?.textContent||'');
    btn.hidden=!usedCats.has(c);
  });
  const grid=document.querySelector('.v43166CategoryGrid');
  if(grid){
    const visible=[...grid.querySelectorAll('.v43166CategoryCard')].filter(x=>!x.hidden);
    grid.classList.toggle('empty43186',visible.length===0);
    grid.querySelectorAll('.emptyCategories43186').forEach(x=>x.remove());
  }

  // Daily main-job forms use the automatically calculated daily wage.
  document.querySelectorAll('.stableWorkForm431642 input[name="amount"], form input[name="amount"]').forEach(inp=>{
    const form=inp.closest('form');
    if(!form)return;
    const action=form.getAttribute('onsubmit')||'';
    if(action.includes("'daily'")||action.includes('submitDaily')){
      inp.value=N(state.settings.dailyRate);
      inp.readOnly=true;
      inp.setAttribute('aria-label','Otomatik günlük ücret');
      const label=inp.closest('.field')?.querySelector('label');if(label)label.textContent='GÜNLÜK ÜCRET · OTOMATİK';
    }
  });

  document.querySelectorAll('.financeTabs4310 button').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false'));
};

const st=document.createElement('style');
st.id='v43186style';
st.textContent=`
/* Compact finance summary: no total-limit / available-limit duplicate tiles */
.finCompactSummary43186{margin:11px 0 15px;padding:12px 14px;border:1px solid rgba(220,225,230,.13);border-radius:14px;background:rgba(255,255,255,.025);display:flex;align-items:center;justify-content:space-between;gap:12px}.finCompactSummary43186 small{font-size:8px;letter-spacing:.8px;color:#858b91}.finCompactSummary43186 b{font-size:15px;color:#f0f2f3;white-space:nowrap}
.finInfoSummary43184,.platinumFinanceSummary43182{display:none!important}
/* Selected finance tab is visibly transparent/glass, not a solid block. */
.financeTabs4310 button{transition:.18s ease;background:#070809!important;border:1px solid rgba(215,220,224,.16)!important;color:#b8bdc1!important;box-shadow:none!important}.financeTabs4310 button.active{background:rgba(255,255,255,.055)!important;border-color:rgba(235,238,240,.48)!important;color:#f4f5f6!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.045)!important;backdrop-filter:blur(12px)}.financeTabs4310 button.active span{color:#fff!important}.financeTabs4310 button[aria-pressed="true"]{transform:translateY(-1px)}
/* Unused categories take no room at all. */
.v43166CategoryCard[hidden]{display:none!important}.v43166CategoryGrid.empty43186{display:none!important}.emptyCategories43186{display:none!important}
/* Profile salary auto calculation */
.profileInfoRow small{display:block;margin-top:3px;font-size:7px;letter-spacing:.6px;color:#7d8388}.salaryCompact43187 span{display:flex;flex-direction:column;gap:2px}.field input[readonly][name="dailyRate"]{opacity:.82;background:rgba(255,255,255,.025)!important;border-style:dashed!important}
`;
document.head.appendChild(st);

// First DOM pass after this final layer loads.
setTimeout(()=>{try{render()}catch(_){ }},0);
})();

/* ===== END v43186_salary_compact_ui.js ===== */
;

/* ===== BEGIN v43187_premium_cleanup.js ===== */
/* RUTIN V43.18.7 — PREMIUM CLEANUP (UI ONLY, FEATURES PRESERVED) */
(function(){
'use strict';
function cleanup43187(){
  document.querySelectorAll('.finCompactSummary43186,.finInfoSummary43184,.platinumFinanceSummary43182,.emptyCategories43186').forEach(x=>x.remove());
  const grid=document.querySelector('.v43166CategoryGrid');
  if(grid){
    const visible=[...grid.querySelectorAll('.v43166CategoryCard')].filter(x=>!x.hidden && getComputedStyle(x).display!=='none');
    grid.classList.toggle('empty43186',visible.length===0);
  }
}
const prev=window.render;
if(typeof prev==='function') window.render=function(){const r=prev.apply(this,arguments);cleanup43187();return r;};
const st=document.createElement('style');
st.id='v43187style';
st.textContent=`
.finCompactSummary43186,.finInfoSummary43184,.platinumFinanceSummary43182,.emptyCategories43186{display:none!important}
.v43166CategoryGrid.empty43186{display:none!important}
.salaryCompact43187{min-height:auto!important}
`;
document.head.appendChild(st);
setTimeout(cleanup43187,0);
})();

/* ===== END v43187_premium_cleanup.js ===== */
;

/* ===== BEGIN hane_design_structural.js ===== */
/* RUTIN V43.18.7 — HANE STRUCTURAL DESIGN PORT (NO HANE BRANDING) */
(function(){'use strict';
const E=s=>typeof esc==='function'?esc(String(s??'')):String(s??'');
const M=n=>typeof money==='function'?money(Number(n)||0):(Number(n)||0).toLocaleString('tr-TR')+' ₺';
function homeHane(){
 const T=typeof monthlyTotals==='function'?monthlyTotals():{income:0,expense:0};
 const ti=typeof todayIncome==='function'?todayIncome():0, te=typeof todayExpense==='function'?todayExpense():0;
 const remain=(+T.income||0)-(+T.expense||0), name=state.profile?.name||'RUTİN', photo=state.profile?.photo||'';
 const date=new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 return `${header()}<main class="hanePortHome">
 <section class="hpHero"><button class="hpAvatar" onclick="go('profile')">${photo?`<img src="${photo}" alt="">`:E(name[0]||'R')}</button><div><small>MERHABA</small><h2>${E(name)}</h2><p>${E(date)}</p></div></section>
 <section class="hpSummary"><button onclick="openModal('homeIncomeToday')"><small>BUGÜNKÜ GELİR</small><strong class="green">${M(ti)}</strong><span>AYRINTI ›</span></button><button onclick="openModal('homeExpenseToday')"><small>BUGÜNKÜ HARCAMA</small><strong class="red">${M(te)}</strong><span>AYRINTI ›</span></button><button onclick="openModal('homeIncomeMonth')"><small>BU AY GELİR</small><strong class="green">${M(T.income)}</strong><span>AYRINTI ›</span></button><button onclick="openModal('homeExpenseMonth')"><small>BU AY HARCAMA</small><strong class="red">${M(T.expense)}</strong><span>AYRINTI ›</span></button></section>
 <section class="hpQuote"><small>BUGÜNÜN SÖZÜ</small><b>“${E(typeof dailyQuote==='function'?dailyQuote():(state.profile?.motto||'Planla · Takip Et · Geliş'))}”</b></section>
 <div class="hpSection"><b>HIZLI İŞLEMLER</b></div><section class="hpQuick"><button onclick="openModal('income')"><i class="qIncome">＋₺</i><span>GELİR EKLE</span></button><button onclick="go('expenses')"><i class="qExpense">₺</i><span>HARCAMA</span></button><button onclick="openModal('daily')"><i class="qWork">✓</i><span>ÇALIŞTIM</span></button><button onclick="go('calendar')"><i class="qCalendar">31</i><span>TAKVİM</span></button><button onclick="go('notes')"><i class="qNotes">✎</i><span>NOTLAR</span></button><button onclick="go('finance')"><i class="qFinance">▰</i><span>FİNANS</span></button></section>
 <div class="hpSection"><b>AYLIK DURUM</b></div><section class="hpFlow"><button onclick="openModal('homeIncomeMonth')"><small>GELİR</small><b class="green">${M(T.income)}</b></button><button onclick="openModal('homeExpenseMonth')"><small>HARCAMA</small><b class="red">${M(T.expense)}</b></button><button onclick="go('reports')"><small>KALAN</small><b>${M(remain)}</b></button></section>
 <div class="hpSection"><b>BUGÜNÜN ÖZETİ</b><button onclick="openModal('day:${iso()}')">TÜMÜ ›</button></div><section class="hpList" onclick="openModal('day:${iso()}')">${sumRow('TAM GÜN ÇALIŞMA',state.work.filter(x=>x.date===iso()&&x.type==='daily').length+' GÜN')}${sumRow('SAATLİK ÇALIŞMA',state.work.filter(x=>x.date===iso()&&x.type==='hourly').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('MESAİ',state.work.filter(x=>x.date===iso()&&x.type==='overtime').reduce((a,x)=>a+(+x.hours||0),0)+' SAAT')}${sumRow('GELİR',M(ti))}${sumRow('HARCAMA',M(te))}</section>
 </main>`;
}
window.home=homeHane;
function haneCard(o,isFlex){
 const used=Number(o.balance)||0, limit=Number(o.limit)||0, avail=Math.max(0,limit-used), pct=limit?Math.min(100,Math.round(used/limit*100)):0;
 const click=isFlex?`openFlexStatement43178('${E(o.id)}')`:`openCardDetailV43163('${E(o.id)}')`;
 const title=E(o.name||(isFlex?'ESNEK HESAP':'KREDİ KARTI'));
 return `<div class="hpCardWrap"><button class="hpVerticalCard ${isFlex?'hpFlex':'hpCredit'}" onclick="${click}"><span class="hpCardGlow"></span><span class="hpCardPattern"></span><div class="hpCardBrand"><img src="rutin-mark.png" alt="RUTİN"><div><strong>RUTİN</strong><small>PLANLA · TAKİP ET · GELİŞ</small></div><em>${isFlex?'ESNEK HESAP':'FİNANS'}</em></div><div class="hpBank"><div><b>${title}</b><small>${isFlex?'FİNANS HESABI':'KREDİ KARTI'}</small></div><span>RUTİN</span></div><div class="hpChip"></div><div class="hpDigits">•••• •••• •••• <b>${E(o.last4||'0000')}</b></div><div class="hpCardGrid"><div><small>TOPLAM LİMİT</small><b>${M(limit)}</b></div><div><small>KULLANILABİLİR</small><b>${M(avail)}</b></div><div><small>${isFlex?'KULLANILAN':'GÜNCEL BORÇ'}</small><b>${M(used)}</b></div><div><small>KULLANIM ORANI</small><b>%${pct}</b></div></div><div class="hpCardFoot"><span>${title}</span><small>DOKUN · ${isFlex?'HESAP DÖKÜMÜ':'EKSTRE'}</small></div></button></div>`;
}
const oldFinance=window.finance;
window.finance=function(){
 const tab=window.financeTabV4310||'cards'; if(tab==='investments')return oldFinance();
 const list=tab==='cards'?(state.cards||[]):(state.flexAccounts||[]), isFlex=tab==='accounts';
 const used=[...(state.cards||[]),...(state.flexAccounts||[])].reduce((s,x)=>s+(Number(x.balance)||0),0), lim=[...(state.cards||[]),...(state.flexAccounts||[])].reduce((s,x)=>s+(Number(x.limit)||0),0);
 return `${header('FİNANS',true)}<main class="hpFinance"><div class="financeTabs4310 hpTabs"><button class="${tab==='cards'?'active':''}" onclick="setFinanceTabV4310('cards')">▰<span>KARTLAR</span></button><button class="${tab==='accounts'?'active':''}" onclick="setFinanceTabV4310('accounts')">◇<span>HESAPLAR</span></button><button onclick="setFinanceTabV4310('investments')">◆<span>YATIRIMLAR</span></button></div><section class="hpFinSummary"><div><small>TOPLAM KULLANIM</small><b>${M(used)}</b></div><div><small>TOPLAM LİMİT</small><b>${M(lim)}</b></div><div><small>KULLANILABİLİR</small><b>${M(Math.max(0,lim-used))}</b></div></section><div class="hpFinHead"><div><small>FİNANS</small><b>${isFlex?'ESNEK HESAPLAR':'KREDİ KARTLARIM'}</b></div><button onclick="${isFlex?"openModal('addFlex')":"openModal('addCard')"}">＋ ${isFlex?'HESAP':'KART'} EKLE</button></div><div class="hpCardCarousel">${list.map(x=>haneCard(x,isFlex)).join('')||'<div class="notice">HENÜZ KAYIT YOK.</div>'}</div></main>`;
};
})();

/* ===== END hane_design_structural.js ===== */
;

/* RUTIN V43.18.9 — canonical post-consolidation version stamp */
(function(){
 'use strict';
 try{
  state.meta=state.meta&&typeof state.meta==='object'?state.meta:{};
  state.meta.appDataVersion='43.18.9';
  state.meta.consolidatedRuntime=true;
  if(typeof save==='function')save();
 }catch(_){ }
})();

/* RUTIN V43.18.9 S8 FIX2 — card expense -> statement/current period visibility */
(function(){
'use strict';
const A=x=>Array.isArray(x)?x:[];
const N=x=>Number(x)||0;
const E=x=>typeof esc==='function'?esc(String(x??'')):String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const M=x=>typeof money==='function'?money(N(x)):N(x).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const pad=n=>String(n).padStart(2,'0');
const isoDate=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const at=(y,m,d)=>{const last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(Math.max(1,N(d)||1),last));};
const add=(s,n)=>{const [y,m,d]=String(s).split('-').map(Number),x=new Date(y,m-1,d);x.setDate(x.getDate()+n);return isoDate(x)};
function period(card,offset=0){const day=Math.min(31,Math.max(1,N(card.statementDay)||1)),now=new Date();let end=at(now.getFullYear(),now.getMonth(),day);if(now<end)end=at(now.getFullYear(),now.getMonth()-1,day);if(offset)end=at(end.getFullYear(),end.getMonth()+offset,day);const prev=at(end.getFullYear(),end.getMonth()-1,day);return{start:add(isoDate(prev),1),end:isoDate(end)}}
function fmt(s){if(typeof fmtDate==='function')return fmtDate(s);const [y,m,d]=String(s).split('-');return `${d}.${m}.${y}`}
function repairLinks(card){
 card.transactions=A(card.transactions);
 A(state.expenses).forEach(x=>{
  if(String(x.method||'').toLocaleUpperCase('tr-TR')!=='KREDİ KARTI'||String(x.cardId||'')!==String(card.id))return;
  // An expense must never be attached to a payment transaction. Prefer a spend transaction with the same expenseId/sourceId.
  let t=card.transactions.find(z=>z.type!=='payment'&&(String(z.expenseId||'')===String(x.id)||String(z.id||'')===String(x.sourceId||'')));
  if(t){
   t.expenseId=x.id;t.type='spend';
   // Keep the statement row synchronized with the expense record without touching the card balance.
   t.title=x.title||x.category||t.title||'KART HARCAMASI';t.category=x.category||t.category||'DİĞER';t.amount=Math.abs(N(x.amount));t.date=x.date||t.date||isoDate(new Date());
   x.sourceId=t.id;x.sourceType='card';x.cardName=x.cardName||card.name||'KREDİ KARTI';
   // Remove only duplicate repaired spend rows for this same expense; never remove payments or unrelated legacy rows.
   let kept=false;card.transactions=card.transactions.filter(z=>{if(z.type==='payment'||String(z.expenseId||'')!==String(x.id))return true;if(String(z.id)===String(t.id)){if(kept)return false;kept=true;return true;}return false;});
   return;
  }
  // Link historical orphan expenses without changing balance: the expense was already counted when saved.
  t={id:(typeof uid==='function'?uid():'tx_'+Date.now()+'_'+Math.random().toString(36).slice(2)),expenseId:x.id,title:x.title||x.category||'KART HARCAMASI',category:x.category||'DİĞER',amount:Math.abs(N(x.amount)),date:x.date||isoDate(new Date()),type:'spend',sourceType:'expenseRepair'};
  card.transactions.push(t);x.sourceId=t.id;x.sourceType='card';x.cardName=x.cardName||card.name||'KREDİ KARTI';
 });
}
window.cardDetailV43163=function(){
 const c=A(state.cards).find(x=>String(x.id)===String(window.cardDetailIdV43163));if(!c){screen='finance';return typeof finance==='function'?finance():''}
 repairLinks(c);try{if(typeof save==='function')save()}catch(_){}
 const off=window.rutinStatementOffset43174||0,p=period(c,off),tx=[...A(c.transactions)].sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
 const closed=tx.filter(t=>t.type!=='payment'&&String(t.date||'')>=p.start&&String(t.date||'')<=p.end),closedTotal=closed.reduce((s,t)=>s+Math.abs(N(t.amount)),0);
 const currentStart=add(p.end,1),today=isoDate(new Date()),current=off===0?tx.filter(t=>t.type!=='payment'&&String(t.date||'')>=currentStart&&String(t.date||'')<=today):[],currentTotal=current.reduce((s,t)=>s+Math.abs(N(t.amount)),0);
 const nextEnd=period(c,off+1).end,pays=tx.filter(t=>t.type==='payment'&&String(t.date||'')>=currentStart&&String(t.date||'')<=nextEnd),paid=pays.reduce((s,t)=>s+Math.abs(N(t.amount)),0);
 const rows=list=>list.map(t=>`<div class="item"><div><b>${E(t.title||'HAREKET')}</b><small>${E(t.date||'')} · ${E(t.category||'')}</small></div><strong class="red">${M(Math.abs(N(t.amount)))}</strong></div>`).join('');
 return `${header('KART EKSTRESİ',true)}<div class="cardDetailHeroV13"><small>${E(c.name)}</small><strong>${M(c.balance)}</strong><span>GÜNCEL BORÇ</span></div><div class="statementNav43174"><button onclick="changeCardStatement43174(-1)">‹ ÖNCEKİ</button><div><small>EKSTRE DÖNEMİ</small><b>${fmt(p.start)} — ${fmt(p.end)}</b></div><button ${off>=0?'disabled':''} onclick="changeCardStatement43174(1)">SONRAKİ ›</button></div><div class="v43163CardStats"><div><small>KAPANAN DÖNEM</small><b>${M(closedTotal)}</b></div><div><small>${off===0?'GÜNCEL DÖNEM':'SONRAKİ ÖDEMELER'}</small><b>${off===0?M(currentTotal):M(paid)}</b></div></div><div class="card v43163Dates"><span>HESAP KESİM <b>HER AY ${E(c.statementDay||'-')}</b></span><span>SON ÖDEME <b>${E(c.paymentDay||c.dueDate||'-')}</b></span></div><button class="primary" onclick="openModal('cardPay4310:${E(c.id)}')">NE KADAR ÖDEDİM?</button><div class="section"><b>KAPANAN EKSTRE HAREKETLERİ</b><span>${closed.length} İŞLEM</span></div><div class="card list">${rows(closed)||'<div class="notice">BU DÖNEMDE HAREKET YOK.</div>'}</div>${off===0?`<div class="section"><b>GÜNCEL DÖNEM / BEKLEYEN HARCAMALAR</b><span>${current.length} İŞLEM</span></div><div class="card list">${rows(current)||'<div class="notice">YENİ HARCAMA YOK.</div>'}</div>`:''}<div class="section"><b>DÖNEM SONRASI ÖDEMELER</b><span>${pays.length}</span></div><div class="card list">${pays.map(t=>`<div class="item"><div><b>${E(t.title||'KART ÖDEMESİ')}</b><small>${E(t.date||'')}</small></div><strong class="green">-${M(Math.abs(N(t.amount)))}</strong></div>`).join('')||'<div class="notice">KAYITLI ÖDEME YOK.</div>'}</div>`;
};
})();
