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
