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
