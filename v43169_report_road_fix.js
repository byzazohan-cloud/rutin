/* RUTIN V43.16.9 — report road grouping fix: true date-based grouping in main report + expense detail */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const N=v=>Number(v)||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const M=v=>window.money?window.money(N(v)):N(v).toLocaleString('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2})+' ₺';
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad' || U(x.title)==='YOL' || U(x.note).includes('ÇALIŞMA YOL') || U(x.note).includes('YOL'));
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
function range43169(){
 const p=(typeof reportPeriod!=='undefined'?reportPeriod:'month');
 if(p==='custom'&&window.rutinReportCustom?.start&&window.rutinReportCustom?.end){let s=window.rutinReportCustom.start,e=window.rutinReportCustom.end;if(s>e)[s,e]=[e,s];return{start:s,end:e};}
 const n=new Date(),y=n.getFullYear(),m=n.getMonth(),iso2=d=>typeof iso==='function'?iso(d):d.toISOString().slice(0,10);
 if(p==='day'){const d=iso2(n);return{start:d,end:d};}
 if(p==='week'){const d=new Date(n),q=(d.getDay()+6)%7,s=new Date(d);s.setDate(d.getDate()-q);const e=new Date(s);e.setDate(s.getDate()+6);return{start:iso2(s),end:iso2(e)};}
 if(p==='year')return{start:y+'-01-01',end:y+'-12-31'};
 const mm=String(m+1).padStart(2,'0'),last=String(new Date(y,m+1,0).getDate()).padStart(2,'0');return{start:y+'-'+mm+'-01',end:y+'-'+mm+'-'+last};
}
function currentExpenses43169(){const r=range43169();return (state.expenses||[]).filter(x=>x&&x.date>=r.start&&x.date<=r.end);}
function groups43169(items){const map={};(items||[]).filter(isRoad).forEach(x=>{const k=String(x.date||'');(map[k]||(map[k]=[])).push(x)});return Object.values(map).sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')));}
function payTotals43169(a){return{cash:sum(a.filter(x=>U(x.method).includes('NAKİT'))),card:sum(a.filter(x=>U(x.method).includes('KREDİ'))),flex:sum(a.filter(x=>U(x.method).includes('ESNEK')))};}
function roadCard43169(a){const x=a?.[0]||{},p=payTotals43169(a),parts=[];if(p.card)parts.push(M(p.card)+' KART');if(p.cash)parts.push(M(p.cash)+' NAKİT');if(p.flex)parts.push(M(p.flex)+' ESNEK');return `<button class="roadGroupCardV438" onclick="openModal('roadDay43169:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${parts.join(' · ')}</em></div><strong>-${M(sum(a))}</strong><span>›</span></button>`;}
function expenseRow43169(x){return `<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'₺'}</i><div><b>${E(x.category||x.title||'HARCAMA')}</b><small>${E(x.date||'')} · ${E(x.method||'NAKİT')} · AYRINTI</small></div><strong class="red">-${M(x.amount)}</strong><span>›</span></button>`;}
function groupedExpenseRows43169(items){const roads=groups43169(items),normal=(items||[]).filter(x=>!isRoad(x)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));const rows=[...roads.map(a=>({date:a[0]?.date||'',html:roadCard43169(a)})),...normal.map(x=>({date:x.date||'',html:expenseRow43169(x)}))];return rows.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(x=>x.html).join('');}

// Main REPORTS screen: replace the actual "GİDER HAREKETLERİ" section used by current UI.
const prevReports43169=window.reports;
window.reports=function(){
 const h=prevReports43169();
 try{
  const marker='<div class="section"><b>GİDER HAREKETLERİ</b>';
  const at=h.lastIndexOf(marker); if(at<0)return h;
  const items=currentExpenses43169(),rows=groupedExpenseRows43169(items);
  return h.slice(0,at)+`<div class="section"><b>GİDER HAREKETLERİ</b><span>${items.length} KAYIT · YOL TARİHE GÖRE GRUPLU</span></div>${rows||'<div class="notice">KAYIT YOK.</div>'}`;
 }catch(e){return h;}
};
window.detailReport=window.reports;

// Expense-detail modal reached from the report chart: use the same grouped road logic.
const prevModal43169=window.modalHtml;
window.modalHtml=function(k){
 if(k==='reportExpense43101'){
  const items=currentExpenses43169(),cats={};items.forEach(x=>{const c=x.category||'DİĞER';(cats[c]||(cats[c]=[])).push(x)});
  const cg=Object.entries(cats).sort((a,b)=>sum(b[1])-sum(a[1]));
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GİDER DETAYI</b><button class="close" onclick="closeModal()">×</button></div><div class="reportCatsV439">${cg.map(([c,a])=>`<div><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(c):'₺'}</i><span><small>${E(c)}</small><b>${M(sum(a))}</b></span><em>${a.length}</em></div>`).join('')||'<div class="notice">KAYIT YOK.</div>'}</div><div class="section"><b>GİDER HAREKETLERİ</b><span>YOL TARİHE GÖRE GRUPLU</span></div>${groupedExpenseRows43169(items)||'<div class="notice">KAYIT YOK.</div>'}</div></div>`;
 }
 if(k&&k.startsWith('roadDay43169:')){
  const date=k.slice('roadDay43169:'.length),a=(state.expenses||[]).filter(x=>String(x.date||'')===String(date)&&isRoad(x)),p=payTotals43169(a);
  return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${M(sum(a))}</strong><div><span>💳 ${M(p.card)} KART</span><span>💵 ${M(p.cash)} NAKİT</span>${p.flex?`<span>▥ ${M(p.flex)} ESNEK</span>`:''}</div></div><div class="section"><b>YOL ÖDEMELERİ</b><span>TEK TEK DÜZENLE / SİL</span></div>${a.map((x,i)=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||((i%2)?'DÖNÜŞ':'GİDİŞ'))}</i><div><b>${E(x.direction||'YOL')} · ${M(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay43169('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;
 }
 return prevModal43169(k);
};
window.deleteRoadDay43169=function(id,date){if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;let ok=false;if(window.deleteExpenseSafe)ok=deleteExpenseSafe(id);else{const n=(state.expenses||[]).length;state.expenses=(state.expenses||[]).filter(x=>String(x.id)!==String(id));ok=state.expenses.length<n;}if(ok){save();render();const left=(state.expenses||[]).some(x=>String(x.date||'')===String(date)&&isRoad(x));if(left)openModal('roadDay43169:'+date);else closeModal();}};
})();
