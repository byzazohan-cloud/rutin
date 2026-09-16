/* RUTIN V43.11.1 — bottom nav alignment + home quick actions + header actions */
(function(){
  // Header: keep reminder and settings as two independent buttons; never overlap.
  window.header=function(title='RUTİN',back=false){
    const left=back?`<button class="iconBtn luxuryIconBtn" onclick="goBackRutin()" aria-label="Geri">‹</button>`:`<button class="iconBtn luxuryIconBtn" onclick="openModal('menu')" aria-label="Menü">☰</button>`;
    const center=title==='RUTİN'&&window.rutinLogo?`${rutinLogo(30)}<span>RUTİN</span>`:title;
    return `<div class="topbar topbar43111">${left}<div class="title brandTitle">${center}</div><div class="topActions43111"><button class="iconBtn luxuryIconBtn reminderTopBtn" onclick="openModal('reminderCenter')" aria-label="Hatırlatmalar">◔</button><button class="iconBtn luxuryIconBtn settingsOnly" onclick="go('settings')" aria-label="Ayarlar"><span class="settingsGearV27">⚙</span></button></div></div>`;
  };

  // Remove the separate Investment shortcut from HOME quick actions.
  // Investment remains under FINANCE > YATIRIMLAR.
  const previousHome=window.home;
  if(typeof previousHome==='function'){
    window.home=function(){
      let html=previousHome();
      html=html.replace(/<button[^>]*onclick=["']go\(["']investments["']\)["'][^>]*>[\s\S]*?<\/button>/i,'');
      return html;
    };
  }
})();
