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
 return `<div class="modal" onclick="safeBackdropClose(event)"><div class="sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>${title}</b><button class="close" onclick="closeModal()">×</button></div>${body}</div></div>`;
};

render();
})();
