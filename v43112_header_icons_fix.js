/* RUTIN V43.11.2 — clean large reminder + settings header icons */
(function(){
  window.header=function(title='RUTİN',back=false){
    const left=back
      ? `<button class="iconBtn luxuryIconBtn" onclick="goBackRutin()" aria-label="Geri">‹</button>`
      : `<button class="iconBtn luxuryIconBtn" onclick="openModal('menu')" aria-label="Menü">☰</button>`;
    const center=title==='RUTİN'&&window.rutinLogo?`${rutinLogo(30)}<span>RUTİN</span>`:title;
    return `<div class="topbar topbar43112">${left}<div class="title brandTitle">${center}</div><div class="topActions43112"><button class="headerBigAction reminderBig43112" onclick="openModal('reminderCenter')" aria-label="Hatırlatmalar"><span>🔔</span></button><button class="headerBigAction settingsBig43112" onclick="go('settings')" aria-label="Ayarlar"><span>⚙</span></button></div></div>`;
  };
})();
