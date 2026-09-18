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
