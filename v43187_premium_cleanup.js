/* RUTIN V43.18.7 — PREMIUM CLEANUP (UI ONLY, FEATURES PRESERVED) */
(function(){
'use strict';
function cleanup43187(){
  document.querySelectorAll('.finCompactSummary43186,.finInfoSummary43184,.platinumFinanceSummary43182,.emptyCategories43186').forEach(x=>x.remove());
  const grid=document.querySelector('.v43166CategoryGrid');
  if(grid){
    const visible=[...grid.querySelectorAll('.v43166CategoryCard')].filter(x=>!x.hidden && getComputedStyle(x).display!=='none');
    grid.classList.toggle('empty43186',visible.length===0);
  }
}
const prev=window.render;
if(typeof prev==='function') window.render=function(){const r=prev.apply(this,arguments);cleanup43187();return r;};
const st=document.createElement('style');
st.id='v43187style';
st.textContent=`
.finCompactSummary43186,.finInfoSummary43184,.platinumFinanceSummary43182,.emptyCategories43186{display:none!important}
.v43166CategoryGrid.empty43186{display:none!important}
.salaryCompact43187{min-height:auto!important}
`;
document.head.appendChild(st);
setTimeout(cleanup43187,0);
})();
