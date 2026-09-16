/* RUTIN V43.3 - Expense detail/category integration layer */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const defaultsCats=[['YOL','⌁'],['YEMEK','◉'],['MARKET','▣'],['HARÇLIK','₺'],['CAFE','☕'],['FIRIN','🥖'],['PAZAR','◫'],['FATURA','▤'],['KİRA','⌂'],['SAĞLIK','♡'],['ULAŞIM','◈'],['EĞLENCE','★'],['YAKIT','◒'],['GİYİM','♢'],['DİĞER','•••']];
function normalizeCats(){
 if(!Array.isArray(state.categories)) state.categories=[];
 const old=state.categories;
 state.categories=old.map(x=>typeof x==='string'?{name:x,icon:(defaultsCats.find(y=>y[0]===x)||[])[1]||'•'}:x).filter(x=>x&&x.name);
 defaultsCats.forEach(([name,icon])=>{if(!state.categories.some(x=>x.name===name))state.categories.push({name,icon})});
}
normalizeCats(); try{save()}catch(e){}
function cats(){normalizeCats();return state.categories}
function catIcon(n){return cats().find(x=>x.name===n)?.icon||'•'}
function expenseCatsHtml(selected){return `<div class="categoryIcons">${cats().map((c,n)=>`<label class="catChip"><input type="radio" name="category" value="${esc(c.name)}" ${selected===c.name||(!selected&&n===0)?'checked':''} onchange="v433CatChange(this.form)"><i>${esc(c.icon)}</i><span>${esc(c.name)}</span></label>`).join('')}</div>`}
window.v433CatChange=function(form){const c=form?.querySelector('[name=category]:checked')?.value;const box=form?.querySelector('.v433Recipient');if(box)box.style.display=c==='HARÇLIK'?'block':'none'};
expenseForm=function(x={}){const sel=x.category||'YOL';return `<form onsubmit="${x.id?`submitEditExpense(event,'${x.id}','${x.date||''}')`:'submitExpense(event)'}">
 ${field('amount','TUTAR',x.amount||0,'number')}<div class="field"><label>KATEGORİ</label>${expenseCatsHtml(sel)}</div>
 <div class="v433Recipient field" style="display:${sel==='HARÇLIK'?'block':'none'}"><label>KİME VERİLDİ?</label><input name="recipient" value="${esc(x.recipient||x.person||'')}" placeholder="KİŞİ ADI"></div>
 <div class="field"><label>HESAPTAN</label><div class="payIcons"><label><input type="radio" name="method" value="NAKİT" ${!x.method||x.method==='NAKİT'?'checked':''}><i>₺</i><span>NAKİT</span></label><label><input type="radio" name="method" value="KREDİ KARTI" ${x.method==='KREDİ KARTI'?'checked':''}><i>▣</i><span>KREDİ KARTI</span></label><label><input type="radio" name="method" value="ESNEK HESAP" ${x.method==='ESNEK HESAP'?'checked':''}><i class="luxGlyph">▥</i><span>ESNEK HESAP</span></label></div></div>
 ${field('date','TARİH',x.date||iso(),'date')}<div class="field"><label>NOT (İSTEĞE BAĞLI)</label><textarea name="note">${esc(x.note||'')}</textarea></div><button class="primary">${x.id?'DEĞİŞİKLİĞİ KAYDET':'KAYDET'}</button></form>`};
submitExpense=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),c=upper(d.category||'DİĞER');state.expenses.push({id:uid(),date:d.date,title:c,amount:+d.amount||0,category:c,method:upper(d.method||'NAKİT'),recipient:c==='HARÇLIK'?upper(d.recipient||''):'',person:c==='HARÇLIK'?upper(d.recipient||''):'',note:d.note||''});save();modal=null;screen='finance';render()};
submitEditExpense=function(e,id,oldDs){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),x=state.expenses.find(z=>z.id===id);if(!x)return;const c=upper(d.category||x.category||'DİĞER');Object.assign(x,{amount:+d.amount||0,category:c,title:c,method:upper(d.method||x.method||'NAKİT'),recipient:c==='HARÇLIK'?upper(d.recipient||''):'',person:c==='HARÇLIK'?upper(d.recipient||''):'',date:d.date,note:d.note||''});save();modal='day:'+x.date;render()};
function expenseDetailHtml(period='all'){
 let arr=[...state.expenses].filter(x=>!isWorkRoadExpense(x)); if(period==='month'){const p=iso().slice(0,7);arr=arr.filter(x=>String(x.date||'').startsWith(p))}
 arr.sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 const groups={};arr.forEach(x=>{const c=x.category||x.title||'DİĞER';groups[c]=(groups[c]||0)+(+x.amount||0)});
 const total=arr.reduce((a,x)=>a+(+x.amount||0),0);
 const cards=Object.entries(groups).sort((a,b)=>b[1]-a[1]).map(([c,v])=>`<button class="v433CatTotal" onclick="v433FilterExpense('${esc(c)}')"><i>${esc(catIcon(c))}</i><span>${esc(c)}</span><b>${money(v)}</b></button>`).join('');
 const rows=arr.map(x=>`<div class="v433ExpenseRow" data-cat="${esc(x.category||x.title||'DİĞER')}"><button class="v433ExpenseMain" onclick="openModal('editExpense:${x.id}:${x.date}')"><i>${esc(catIcon(x.category))}</i><span><b>${esc(x.category||x.title||'HARCAMA')}${x.recipient||x.person?` · ${esc(x.recipient||x.person)}`:''}</b><small>${esc(x.date)} · ${esc(x.method||'NAKİT')}${x.note?' · '+esc(x.note):''}</small></span><strong>-${money(+x.amount||0)}</strong></button><div class="v433ExpenseActions"><button onclick="openModal('editExpense:${x.id}:${x.date}')">DÜZENLE</button><button class="dangerBtn" onclick="deleteExpense('${x.id}','${x.date}')">SİL</button></div></div>`).join('');
 return `<div class="v433ExpenseHero"><small>TOPLAM HARCAMA</small><strong>${money(total)}</strong><span>${arr.length} KAYIT</span></div><div class="v433CatGrid">${cards||'<div class="notice">KATEGORİ YOK.</div>'}</div><div class="section"><b>HARCAMA DÖKÜMÜ</b><span>TÜM KAYITLAR</span></div><div id="v433ExpenseRows">${rows||'<div class="notice">HARCAMA KAYDI YOK.</div>'}</div>`;
}
window.v433FilterExpense=function(c){document.querySelectorAll('.v433ExpenseRow').forEach(r=>r.style.display=(r.dataset.cat===c?'':'none'));};
window.v433ExpenseDetail=expenseDetailHtml;
const oldOpen=openModal;openModal=function(k){
 if(k==='expenseDetails'||k==='expenseDetail'){modal='v433ExpenseDetails';render();return}
 if(k==='categories'){modal='v433Categories';render();return}
 if(k&&k.startsWith('editExpense:')){const p=k.split(':'),x=state.expenses.find(z=>z.id===p[1]);if(x){modal='v433EditExpense:'+x.id;render();return}}
 oldOpen(k)
};
const oldModal=modalView;modalView=function(){
 if(modal==='v433ExpenseDetails')return `<div class="modal"><div class="modalCard v433Wide"><div class="modalHead"><b>HARCAMA DETAYI</b><button onclick="closeModal()">×</button></div>${expenseDetailHtml('all')}</div></div>`;
 if(modal&&modal.startsWith('v433EditExpense:')){const id=modal.split(':')[1],x=state.expenses.find(z=>z.id===id);return `<div class="modal"><div class="modalCard"><div class="modalHead"><b>HARCAMAYI DÜZENLE</b><button onclick="closeModal()">×</button></div>${x?expenseForm(x):'<div class="notice">KAYIT BULUNAMADI.</div>'}</div></div>`}
 if(modal==='v433Categories')return `<div class="modal"><div class="modalCard v433Wide"><div class="modalHead"><b>KATEGORİ YÖNETİMİ</b><button onclick="closeModal()">×</button></div><form onsubmit="v433AddCat(event)" class="v433CatForm"><input name="name" placeholder="YENİ KATEGORİ" required><select name="icon">${['•','🛒','☕','🥖','₺','🚗','🍽️','🏠','♡','★','◈','▤','♢','◫'].map(i=>`<option>${i}</option>`).join('')}</select><button class="primary">KATEGORİ EKLE</button></form><div>${cats().map(c=>`<div class="v433ManageCat"><i>${esc(c.icon)}</i><input value="${esc(c.name)}" onchange="v433RenameCat('${esc(c.name)}',this.value)"><select onchange="v433IconCat('${esc(c.name)}',this.value)">${['•','🛒','☕','🥖','₺','🚗','🍽️','🏠','♡','★','◈','▤','♢','◫'].map(i=>`<option ${i===c.icon?'selected':''}>${i}</option>`).join('')}</select></div>`).join('')}</div></div></div>`;
 return oldModal()
};
window.v433AddCat=function(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries()),n=upper(d.name);if(n&&!cats().some(x=>x.name===n)){state.categories.push({name:n,icon:d.icon||'•'});save()}render()};
window.v433RenameCat=function(old,n){n=upper(n);const c=cats().find(x=>x.name===old);if(!c||!n)return;state.expenses.forEach(x=>{if(x.category===old){x.category=n;x.title=n}});c.name=n;save();render()};
window.v433IconCat=function(name,icon){const c=cats().find(x=>x.name===name);if(c){c.icon=icon;save();render()}};
/* expose expense detail from finance/report totals without disturbing screens */
const oldRender=render;render=function(){oldRender();setTimeout(()=>{document.querySelectorAll('.summaryRow').forEach(r=>{if((r.textContent||'').includes('TOPLAM HARCAMA')){r.classList.add('v433Clickable');r.onclick=()=>openModal('expenseDetails')}})},0)};
})();
