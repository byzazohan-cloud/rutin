/* RUTIN V43.16.4 — Günlük ana iş maaş günü/alacak sistemi + eski kayıt entegrasyonu */
(function(){
 const MIG=2;
 state.meta=state.meta||{};
 state.workPayments=Array.isArray(state.workPayments)?state.workPayments:[];
 const earned=w=>typeof workEarned==='function'?workEarned(w):(+w.amount||((+w.hours||0)*(+w.rate||0)));
 // Eski günlük kayıtları yeni kurala geçir: çalışma günü gelir değildir.
 // Yalnız gerçekten kayıtlı tahsilat hareketleri günlük kaydın ödenen tutarını oluşturur.
 if((state.meta.dailySalaryMigration||0)<MIG){
   (state.work||[]).forEach(w=>{
     if(w.type!=='daily') return;
     const explicit=(state.workPayments||[]).filter(p=>String(p.workId)===String(w.id)).reduce((s,p)=>s+(+p.amount||0),0);
     w.paidAmount=Math.min(earned(w),Math.max(0,explicit));
     w.paymentStatus=w.paidAmount>=earned(w)&&earned(w)>0?'paid':(w.paidAmount>0?'partial':'unpaid');
     w.salaryBased=true;
   });
   state.meta.dailySalaryMigration=MIG;
   save();
 }
 // Günlük: ödeme seçimi yok. Her kayıt doğrudan hakediş/alacak.
 dailyForm=function(){return `<form onsubmit="submitDaily(event)">${field('date','TARİH',iso(),'date')}${field('title','İŞ / PROJE','ANA İŞ')}${field('amount','GÜNLÜK ÜCRET',state.settings.dailyRate,'number')}${typeof roadFields==='function'?roadFields():''}${textarea('note','NOT')}<div class="notice">GÜNLÜK ANA İŞ ÜCRETİ ÇALIŞMA GÜNÜNDE GELİR SAYILMAZ. HAKEDİŞ / ALACAK OLARAK KAYDEDİLİR; MAAŞ ÖDEMESİ ALACAKLARDAN İŞLENİR.</div><button class="primary">KAYDET</button></form>`};
 const oldSubmitDaily=window.submitDaily;
 submitDaily=function(e){
   e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());
   if((state.work||[]).some(x=>x.date===d.date)&&!confirm('BU TARİHTE ZATEN ÇALIŞMA KAYDI VAR.\nBAŞKA KAYIT EKLEMEK İSTİYOR MUSUN?'))return;
   const w={id:uid(),type:'daily',date:d.date,title:upper(d.title||'ANA İŞ'),amount:+d.amount||0,note:d.note||'',paidAmount:0,paymentStatus:'unpaid',salaryBased:true};
   state.work.push(w);
   // V43.16.2 yol sistemiyle aynı mantık; opsiyonel nakit/kart.
   if(d.road==='yes'&&+d.roadAmount>0){
     const method=d.roadMethod==='KREDİ KARTI'?'KREDİ KARTI':'NAKİT';let card=null;
     if(method==='KREDİ KARTI'){
       card=(state.cards||[]).find(c=>String(c.id)===String(d.roadCardId));
       if(!card){state.work=state.work.filter(x=>x.id!==w.id);alert('YOL GİDERİ İÇİN KREDİ KARTI SEÇ.');return;}
     }
     const ex={id:uid(),date:w.date,title:'YOL',amount:+d.roadAmount,category:'YOL',method,workId:w.id,sourceType:'workRoad',cardId:card?.id||'',cardName:card?.name||'',note:'ÇALIŞMA YOL GİDERİ'};
     state.expenses.push(ex);
     if(card){card.transactions=Array.isArray(card.transactions)?card.transactions:[];const t={id:uid(),title:'YOL',amount:ex.amount,date:ex.date,expenseId:ex.id,sourceType:'workRoad'};card.transactions.push(t);card.balance=(+card.balance||0)+ex.amount;ex.sourceId=t.id;}
   }
   save();closeModal();render();if(typeof rutinToast==='function')setTimeout(()=>rutinToast('GÜNLÜK İŞ HAKEDİŞ / ALACAK OLARAK KAYDEDİLDİ ✓'),30);
 };
 // Günlük satırları da yeni anlamı açıkça göstersin.
 const oldWorkRows=workRows;
 workRows=function(type){
   if(type!=='daily') return oldWorkRows(type);
   const a=(state.work||[]).filter(x=>x.type==='daily').sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,30);
   return a.length?a.map(x=>{const r=typeof workReceivable==='function'?workReceivable(x):Math.max(0,earned(x)-(+x.paidAmount||0));return `<div class="item v43162WorkRow" onclick="openModal('editWork:${x.id}')"><div class="ico">✓</div><div><b>${x.title||'ANA İŞ'}</b><small>${x.date} · ${r>0?'HAKEDİŞ / ALACAK':'MAAŞI ALINDI'}</small></div><div class="v43162WorkRight"><b class="amt ${r>0?'red':'gold'}">${money(earned(x))}</b><span>DÜZENLE ›</span></div></div>`}).join(''):'<div class="notice">HENÜZ KAYIT YOK.</div>';
 };
})();
