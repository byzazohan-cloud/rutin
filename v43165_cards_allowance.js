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
