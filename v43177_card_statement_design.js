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
