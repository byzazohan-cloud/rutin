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
