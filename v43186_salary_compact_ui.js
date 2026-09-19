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
  state.meta.appDataVersion='43.18.7';
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
