/* RUTIN V43.16.7 — daily road grouping in reports + Home quick Allowance tab */
(function(){
'use strict';
const E=s=>window.esc?window.esc(String(s??'')):String(s??'');
const N=v=>Number(v)||0;
const U=s=>String(s??'').trim().toLocaleUpperCase('tr-TR');
const isRoad=x=>!!x && U(x.category)==='YOL' && (!!x.workId || x.sourceType==='workRoad' || U(x.title)==='YOL' || U(x.note).includes('ÇALIŞMA YOL'));
const sum=a=>(a||[]).reduce((n,x)=>n+N(x.amount),0);
const roadByDate=(items)=>{const map={};(items||[]).filter(isRoad).forEach(x=>{const k=String(x.date||'');(map[k]||(map[k]=[])).push(x)});return Object.values(map).sort((a,b)=>String(b[0]?.date||'').localeCompare(String(a[0]?.date||'')))};
const payTotals=a=>({
 cash:sum(a.filter(x=>U(x.method).includes('NAKİT'))),
 card:sum(a.filter(x=>U(x.method).includes('KREDİ'))),
 flex:sum(a.filter(x=>U(x.method).includes('ESNEK')))
});

function dailyRoadCard(a){
 const x=a?.[0]||{},p=payTotals(a),bits=[];
 if(p.card)bits.push(`${money(p.card)} KART`);if(p.cash)bits.push(`${money(p.cash)} NAKİT`);if(p.flex)bits.push(`${money(p.flex)} ESNEK`);
 return `<button class="roadGroupCardV438" onclick="openModal('roadDay43167:${E(x.date)}')"><div class="roadGroupIconV438">🚗</div><div><b>YOL GİDERİ</b><small>${E(x.date)} · ${a.length} ÖDEME</small><em>${bits.join(' · ')}</em></div><strong>-${money(sum(a))}</strong><span>›</span></button>`;
}

// HOME: Finance is already on bottom navigation. Replace it with Allowance CENTER, not Allowance Add.
const prevHome43167=window.home;
window.home=function(){
 let h=prevHome43167();
 const start=h.indexOf('<div class="section"><b>HIZLI İŞLEMLER</b>');
 const end=h.indexOf('<div class="section"><b>BUGÜNÜN ÖZETİ</b>',start);
 if(start>=0 && end>start){
   let block=h.slice(start,end);
   block=block.replace(/<button[^>]*id="quickAllowance43166"[\s\S]*?<\/button>/g,'');
   block=block.replace(/<button[^>]*onclick="go\('finance'\)"[\s\S]*?<\/button>/g,'');
   if(!block.includes("go('allowance')")){
     const btn=`<button id="quickAllowance43167" onclick="go('allowance')"><i class="qv32 qFinance">₺</i><span>HARÇLIK</span></button>`;
     const pos=block.lastIndexOf('</div>');
     if(pos>=0)block=block.slice(0,pos)+btn+block.slice(pos);
   }
   h=h.slice(0,start)+block+h.slice(end);
 }
 return h;
};

// REPORTS: group ALL work-road payments on the same date into one card, regardless of workId.
const prevReports43167=window.reports;
window.reports=function(){
 let h=prevReports43167();
 try{
   const marker='<div class="section"><b>AYRINTILI HAREKETLER</b>';
   const at=h.lastIndexOf(marker);if(at<0)return h;
   const base=h.slice(0,at),s=state.reportStart||monthStart(),e=state.reportEnd||monthEnd(),inP=d=>d>=s&&d<=e;
   const work=(state.work||[]).filter(x=>inP(x.date)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
   const inc=(state.incomes||[]).filter(x=>inP(x.date)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
   const exp=(state.expenses||[]).filter(x=>inP(x.date));
   const roads=roadByDate(exp),normal=exp.filter(x=>!isRoad(x)).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
   const wr=work.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('work','${E(x.id)}')"><i>▣</i><div><b>${E(x.title||'ÇALIŞMA')}</b><small>${E(x.date)} · AYRINTI / DÜZENLE / SİL</small></div><strong class="gold">+${money(x.amount||0)}</strong><span>›</span></button>`).join('');
   const ir=inc.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('income','${E(x.id)}')"><i>₺</i><div><b>${E(x.title||'DİĞER GELİR')}</b><small>${E(x.date)} · AYRINTI / DÜZENLE / SİL</small></div><strong class="green">+${money(x.amount||0)}</strong><span>›</span></button>`).join('');
   const er=normal.map(x=>`<button class="globalRecordRowV435" onclick="openRecordV435('expense','${E(x.id)}')"><i>${window.rutinCategoryIcon?window.rutinCategoryIcon(x.category||'DİĞER'):'₺'}</i><div><b>${E(x.category||x.title||'HARCAMA')}</b><small>${E(x.date)} · ${E(x.method||'NAKİT')} · AYRINTI / DÜZENLE / SİL</small></div><strong class="red">-${money(x.amount||0)}</strong><span>›</span></button>`).join('');
   const rg=roads.map(dailyRoadCard).join('');
   return base+`<div class="section"><b>AYRINTILI HAREKETLER</b><span>YOL TARİHE GÖRE GRUPLU</span></div><div class="reportGroupV435"><div class="section"><b>GELİR / ÇALIŞMA HAREKETLERİ</b><span>DOKUN → AYRINTI</span></div>${wr+ir||'<div class="notice">KAYIT YOK.</div>'}</div><div class="reportGroupV435"><div class="section"><b>HARCAMA / YOL HAREKETLERİ</b><span>AYNI GÜN TÜM YOL ÖDEMELERİ TEK KART</span></div>${rg+er||'<div class="notice">KAYIT YOK.</div>'}</div>`;
 }catch(err){return h;}
};
window.detailReport=window.reports;

const prevModal43167=window.modalHtml;
window.modalHtml=function(k){
 if(k&&k.startsWith('roadDay43167:')){
   const date=k.slice('roadDay43167:'.length),a=(state.expenses||[]).filter(x=>String(x.date||'')===date&&isRoad(x)),p=payTotals(a);
   return `<div class="modal v18Modal" onclick="safeBackdropClose(event)"><div class="sheet v18Sheet v438RoadSheet" onclick="event.stopPropagation()"><div class="sheetHead"><b>GÜNLÜK YOL GİDERİ</b><button class="close" onclick="closeModal()">×</button></div><div class="roadHeroV438"><small>${E(date)} · ${a.length} ÖDEME</small><strong>${money(sum(a))}</strong><div><span>💳 ${money(p.card)} KART</span><span>💵 ${money(p.cash)} NAKİT</span>${p.flex?`<span>▥ ${money(p.flex)} ESNEK</span>`:''}</div></div><div class="section"><b>YOL ÖDEMELERİ</b><span>TEK TEK DÜZENLE / SİL</span></div>${a.map((x,i)=>`<div class="roadItemV438"><button class="roadItemMainV438" onclick="openRecordV435('expense','${E(x.id)}')"><i>${E(x.direction||((i%2)?'DÖNÜŞ':'GİDİŞ'))}</i><div><b>${E(x.direction||'YOL')} · ${money(x.amount)}</b><small>${E(x.method||'NAKİT')}${x.cardName?' · '+E(x.cardName):''}</small></div><span>›</span></button><button class="roadItemDeleteV438" onclick="deleteRoadDay43167('${E(x.id)}','${E(date)}')">SİL</button></div>`).join('')||'<div class="notice">YOL ÖDEMESİ YOK.</div>'}</div></div>`;
 }
 return prevModal43167(k);
};
window.deleteRoadDay43167=function(id,date){if(!confirm('BU YOL ÖDEMESİ SİLİNSİN Mİ?'))return;let ok=false;if(window.deleteExpenseSafe)ok=deleteExpenseSafe(id);else{const n=(state.expenses||[]).length;state.expenses=(state.expenses||[]).filter(x=>String(x.id)!==String(id));ok=state.expenses.length<n;}if(ok){save();render();const left=(state.expenses||[]).some(x=>String(x.date||'')===String(date)&&isRoad(x));if(left)openModal('roadDay43167:'+date);else closeModal();}};
})();
