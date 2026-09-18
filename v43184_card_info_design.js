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
