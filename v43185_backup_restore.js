/* RUTIN V43.18.5 — Safe backup restore */
(function(){
  'use strict';

  const oldOpenModal = window.openModal;
  if(typeof oldOpenModal === 'function'){
    window.openModal = function(k){
      oldOpenModal(k);
      if(k === 'backup') setTimeout(enhanceBackupModal,0);
    };
  }

  function enhanceBackupModal(){
    const sheet = document.querySelector('.modal .sheet');
    if(!sheet || sheet.querySelector('#rutinRestoreFile43185')) return;
    const head = sheet.querySelector('.sheetHead');
    if(!head || !/YEDEKLEME/i.test(head.textContent||'')) return;
    const primary = sheet.querySelector('button.primary');
    if(!primary) return;

    const restoreBtn = document.createElement('button');
    restoreBtn.type = 'button';
    restoreBtn.className = 'secondary rutinRestoreBtn43185';
    restoreBtn.textContent = 'YEDEĞİ GERİ YÜKLE';
    restoreBtn.onclick = ()=>document.getElementById('rutinRestoreFile43185')?.click();
    primary.insertAdjacentElement('afterend', restoreBtn);

    const input = document.createElement('input');
    input.id = 'rutinRestoreFile43185';
    input.type = 'file';
    input.accept = '.rutin,.json,application/json,text/plain';
    input.hidden = true;
    input.addEventListener('change', handleRestoreFile43185);
    restoreBtn.insertAdjacentElement('afterend', input);

    const info = document.createElement('div');
    info.className = 'notice rutinRestoreNotice43185';
    info.innerHTML = '<b>GÜVENLİ GERİ YÜKLEME</b><br>RUTİN .rutin veya .json yedeğini seç. Dosya doğrulanır; mevcut verilerin güvenlik kopyası alınır ve sonra yedek geri yüklenir.';
    input.insertAdjacentElement('afterend', info);
  }

  function looksLikeRutinState43185(s){
    if(!s || typeof s !== 'object' || Array.isArray(s)) return false;
    const keys=['profile','settings','work','expenses','incomes','notes','investments','cards','flexAccounts','accounts','categories'];
    let score=0;
    for(const k of keys) if(Object.prototype.hasOwnProperty.call(s,k)) score++;
    if(score < 3) return false;
    for(const k of ['work','expenses','incomes','notes','investments','cards','flexAccounts']){
      if(s[k] != null && !Array.isArray(s[k])) return false;
    }
    return true;
  }

  function extractState43185(parsed){
    if(!parsed || typeof parsed!=='object') return null;
    const format=String(parsed.format||'');
    if(parsed.state && typeof parsed.state==='object'){
      if(format && !/^RUTIN-(?:BACKUP|DATA)-V\d+$/i.test(format)) return null;
      return parsed.state;
    }
    // Legacy raw-state files are accepted only if they clearly look like RUTIN data.
    return parsed;
  }

  async function handleRestoreFile43185(ev){
    const input=ev.currentTarget;
    const file=input.files && input.files[0];
    input.value='';
    if(!file) return;
    if(file.size > 25*1024*1024){ alert('YEDEK DOSYASI ÇOK BÜYÜK.'); return; }

    let parsed;
    try{
      const text=await file.text();
      parsed=JSON.parse(text);
    }catch(_){
      alert('DOSYA OKUNAMADI. GEÇERLİ BİR RUTİN YEDEĞİ SEÇ.');
      return;
    }

    const imported=extractState43185(parsed);
    if(!looksLikeRutinState43185(imported)){
      alert('BU DOSYA GEÇERLİ BİR RUTİN YEDEĞİ DEĞİL.');
      return;
    }

    const itemCounts={
      work:Array.isArray(imported.work)?imported.work.length:0,
      expenses:Array.isArray(imported.expenses)?imported.expenses.length:0,
      cards:Array.isArray(imported.cards)?imported.cards.length:0,
      flex:Array.isArray(imported.flexAccounts)?imported.flexAccounts.length:0
    };
    const created=parsed && parsed.created ? new Date(parsed.created) : null;
    const createdLabel=created && !Number.isNaN(created.getTime()) ? created.toLocaleString('tr-TR') : 'Bilinmiyor';
    const ok=confirm(
      'YEDEĞİ GERİ YÜKLEMEK İSTİYOR MUSUN?\n\n'+
      'Yedek tarihi: '+createdLabel+'\n'+
      'Çalışma: '+itemCounts.work+'\n'+
      'Harcama: '+itemCounts.expenses+'\n'+
      'Kart: '+itemCounts.cards+'\n'+
      'Esnek Hesap: '+itemCounts.flex+'\n\n'+
      'Mevcut verilerin önce güvenlik kopyası alınacak. Ardından uygulama yeniden açılacak.'
    );
    if(!ok) return;

    try{
      const currentRaw=localStorage.getItem('rutin-main');
      if(currentRaw){
        localStorage.setItem('rutin-pre-restore-backup',JSON.stringify({
          format:'RUTIN-PRE-RESTORE-V1',
          created:new Date().toISOString(),
          state:JSON.parse(currentRaw)
        }));
      }
      localStorage.setItem('rutin-main',JSON.stringify(imported));
      localStorage.setItem('rutin-last-restore-info',JSON.stringify({
        restoredAt:new Date().toISOString(),
        sourceName:file.name,
        sourceFormat:String(parsed?.format||'LEGACY')
      }));
      alert('YEDEK BAŞARIYLA YÜKLENDİ. UYGULAMA ŞİMDİ YENİDEN AÇILACAK.');
      location.reload();
    }catch(err){
      alert('GERİ YÜKLEME TAMAMLANAMADI. MEVCUT VERİLER KORUNDU.');
    }
  }

  // Fallback for any code path that renders the backup modal without calling window.openModal.
  const observer=new MutationObserver(()=>{
    if(document.querySelector('.modal .sheet')) enhanceBackupModal();
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  const css=document.createElement('style');
  css.textContent=`
    .rutinRestoreBtn43185{width:100%;margin-top:9px;min-height:48px;font-weight:800;letter-spacing:.06em}
    .rutinRestoreNotice43185{margin-top:12px!important;line-height:1.55}
    .rutinRestoreNotice43185 b{display:inline-block;margin-bottom:4px}
  `;
  document.head.appendChild(css);
})();
