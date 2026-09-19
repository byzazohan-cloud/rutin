/* RUTIN V43.18.8 — DESIGN ONLY: lock screen, home header/profile, active glass state, hex calendar */
(function(){
'use strict';

/* ---------- HEADER / HOME BRAND ---------- */
window.header=function(title='RUTİN',back=false){
  const left=back
    ? `<button class="iconBtn luxuryIconBtn v43188ActiveAware" onclick="goBackRutin()" aria-label="Geri">‹</button>`
    : `<button class="iconBtn luxuryIconBtn v43188ActiveAware" onclick="openModal('menu')" aria-label="Menü">☰</button>`;

  if(title==='RUTİN'){
    return `<div class="topbar topbar43188">
      ${left}
      <button class="topBrand43188" type="button" onclick="go('home')" aria-label="RUTİN ana sayfa">
        <img src="rutin-mark.png?v=v43.18.8" alt="RUTİN">
        <span>PLANLA · TAKİP ET · GELİŞ</span>
      </button>
      <button class="headerBigAction reminderBig43112 v43188ActiveAware" onclick="openModal('reminderCenter')" aria-label="Hatırlatmalar"><span>🔔</span></button>
    </div>`;
  }

  return `<div class="topbar topbar43112">
    ${left}
    <div class="title brandTitle">${title}</div>
    <div class="topActions43112">
      <button class="headerBigAction reminderBig43112 v43188ActiveAware" onclick="openModal('reminderCenter')" aria-label="Hatırlatmalar"><span>🔔</span></button>
      <button class="headerBigAction settingsBig43112 v43188ActiveAware" onclick="go('settings')" aria-label="Ayarlar"><span>⚙</span></button>
    </div>
  </div>`;
};

const prevHome43188=window.home;
if(typeof prevHome43188==='function'){
  window.home=function(){
    let h=prevHome43188();
    /* Remove the old standalone brand strip only. */
    h=h.replace(/<div class="brandStripV31">[\s\S]*?<\/div><\/div>/i,'');
    h=h.replace(/<div class="brandStripV31">[\s\S]*?<\/div>/i,'');
    return h;
  };
}

/* ---------- LOCK SCREEN ---------- */
if(typeof window.cleanPinScreen==='function' || typeof cleanPinScreen==='function'){
  const lockScreen43188=function(){
    initCleanPinMode();
    const name=state.profile?.name || 'RUTİN';
    const photo=state.profile?.photo || '';
    const profileVisual=photo
      ? `<img src="${photo}" alt="${esc(name)}">`
      : `<div class="lockAvatarMinimal" aria-hidden="true"><i></i><b></b></div>`;

    return `<div class="premiumLock cleanPinScreen lockV43188">
      <div class="lock43188Shell">
        <main class="lock43188Left">
          <div class="lockProfile43188">${profileVisual}</div>
          <div class="lockWelcome43188">HOŞ GELDİN</div>
          <div class="lockPower43188">RUTİN SENİNLE DAHA GÜÇLÜ</div>
          <div class="lockProfileName43188">${esc(name)}</div>
          <div class="cleanPinInstruction lockInstruction43188">${cleanPinInstruction()}</div>
          <div class="pinDots cleanPinDots lockPinDots43188">
            ${[0,1,2,3].map((_,i)=>`<i class="${cleanPin.buffer.length>i?'filled':''}"></i>`).join('')}
          </div>
          <div class="pinPad cleanPinPad lockPad43188">
            ${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" class="cleanPinBtn lockKey43188" data-pin="${n}">${n}</button>`).join('')}
            <button type="button" class="cleanPinBtn lockKey43188 lockKeyUtility43188" data-pin="clear" aria-label="Temizle">×</button>
            <button type="button" class="cleanPinBtn lockKey43188" data-pin="0">0</button>
            <button type="button" class="cleanPinBtn lockKey43188 lockKeyUtility43188" data-pin="del" aria-label="Sil">⌫</button>
          </div>
          ${cleanPin.mode==='login'
            ? `<button type="button" class="forgotPinBtn cleanForgotBtn lockForgot43188">PAROLAMI UNUTTUM</button>`
            : `<div class="cleanPinHelp lockHelp43188">${cleanPin.mode==='confirm'?'PINİ TEKRAR GİR':'4 HANELİ PIN OLUŞTUR'}</div>`}
        </main>
        <aside class="lock43188Right">
          <div class="lockBrand43188"><img src="rutin-logo.png?v=v43.18.8" alt="RUTİN"></div>
          <div class="lockQuoteTop43188">DAHA İYİ<br>BİR SEN<br>HER GÜN<br>BAŞLAR.</div>
          <div class="lockQuoteMid43188">PLANLA<br>UYGULA<br>BAŞAR</div>
          <div class="lockQuoteBottom43188">HEDEFİNE<br>HER GÜN<br>BİR ADIM<br>DAHA YAKLAŞ.</div>
        </aside>
        <div class="lockTag43188">PLANLA, UYGULA, BAŞAR</div>
      </div>
    </div>`;
  };
  try{ window.cleanPinScreen=lockScreen43188; cleanPinScreen=lockScreen43188; }catch(_){ window.cleanPinScreen=lockScreen43188; }
}

/* ---------- ACTIVE / GLASS STATE ---------- */
function markActive43188(){
  document.querySelectorAll('.v43188Pressed').forEach(el=>el.classList.remove('v43188Pressed'));
}
document.addEventListener('pointerdown',function(e){
  const b=e.target.closest('button,.clickable,[onclick]');
  if(!b || b.closest('.premiumLock')) return;
  markActive43188(); b.classList.add('v43188Pressed');
},{passive:true});
document.addEventListener('pointerup',()=>setTimeout(markActive43188,120),{passive:true});
document.addEventListener('pointercancel',markActive43188,{passive:true});

/* ---------- PRESENTATION CSS ---------- */
const st=document.createElement('style');
st.id='v43188DesignOnly';
st.textContent=`
/* HOME header: no separate RUTIN title/logo, compact branded slogan between menu and reminder */
.topbar43188{display:grid!important;grid-template-columns:52px minmax(0,1fr) 52px!important;align-items:center!important;gap:10px!important}
.topBrand43188{justify-self:center!important;width:min(100%,210px)!important;height:46px!important;padding:5px 10px!important;border:1px solid rgba(195,158,84,.45)!important;border-radius:15px!important;background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018))!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;color:#cdb77e!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 7px 18px rgba(0,0,0,.25)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}
.topBrand43188 img{width:30px!important;height:30px!important;object-fit:cover!important;border-radius:8px!important;filter:saturate(.75) contrast(1.04)!important}
.topBrand43188 span{font-size:7.2px!important;letter-spacing:.9px!important;font-weight:800!important;white-space:nowrap!important}
.brandStripV31{display:none!important}

/* Home profile identity: larger and button-like, feature behavior unchanged */
.profileLine{position:relative!important;padding:12px!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.015))!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}
.homeProfileAvatar{width:64px!important;height:64px!important;min-width:64px!important;border-radius:17px!important;border:1px solid rgba(205,174,105,.58)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 6px 18px rgba(0,0,0,.24)!important;cursor:pointer!important}
.homeProfileAvatar img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:inherit!important}

/* Global active/selected state: translucent glass. */
button.active,.tabs button.active,.workChoice button.active,.nav button.active,.nav4311Fixed button.active,.v43188Pressed,.catChip:has(input:checked),.payIcons label:has(input:checked),.choiceRow label:has(input:checked){
 background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(215,180,92,.11))!important;
 border-color:rgba(228,198,126,.72)!important;
 box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 0 0 1px rgba(255,255,255,.035),0 8px 24px rgba(0,0,0,.28)!important;
 backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;
}

/* Calendar only: same data/logic, new large hexagon day shape. */
.premiumCalendarGrid{gap:7px 6px!important;align-items:center!important}
.premiumCalendarGrid .premiumDay,.premiumCalendarGrid .v432Day{
 width:100%!important;aspect-ratio:1.02/1!important;min-height:0!important;height:auto!important;border-radius:0!important;
 clip-path:polygon(25% 4%,75% 4%,96% 25%,96% 75%,75% 96%,25% 96%,4% 75%,4% 25%)!important;
 border:0!important;outline:1px solid rgba(74,83,91,.62)!important;outline-offset:-2px!important;
 background-color:#0d1114!important;overflow:hidden!important;position:relative!important;
 box-shadow:inset 0 0 0 2px rgba(255,255,255,.035),inset 0 9px 18px rgba(255,255,255,.03)!important;
}
.premiumCalendarGrid .premiumDay.hasData,.premiumCalendarGrid .v432Day.hasData{filter:saturate(1.08) brightness(1.03)!important}
.premiumCalendarGrid .premiumDay.today,.premiumCalendarGrid .v432Day.today{box-shadow:inset 0 0 0 3px #e1c064,inset 0 0 0 5px rgba(0,0,0,.5),0 0 12px rgba(225,192,100,.34)!important;outline:1px solid #e1c064!important}
.premiumCalendarGrid .v432DayNo{position:relative!important;z-index:2!important;display:grid!important;place-items:center!important;width:34px!important;height:30px!important;margin:auto!important;border-radius:10px!important;background:rgba(3,5,7,.62)!important;color:#fff!important;font-size:15px!important;font-weight:900!important;text-shadow:0 2px 5px rgba(0,0,0,.8)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.1)!important}
.premiumDaySpacer{aspect-ratio:1.02/1!important}
.premiumCalendarCard{padding:13px 10px 12px!important}
.premiumCalendarCard .calendarHead{margin-bottom:8px!important}

/* LOCK: black/silver metallic layout; PIN behavior unchanged. */
.premiumLock.lockV43188{position:fixed!important;inset:0!important;z-index:9999!important;overflow:auto!important;background:#020303!important;color:#eceff1!important;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
.lock43188Shell{position:relative;width:min(100%,480px)!important;min-height:100svh!important;margin:0 auto!important;padding:calc(env(safe-area-inset-top,0px) + 24px) 18px calc(env(safe-area-inset-bottom,0px) + 48px)!important;display:grid!important;grid-template-columns:minmax(0,1.62fr) minmax(112px,.78fr)!important;column-gap:18px!important;background:radial-gradient(circle at 28% 18%,rgba(255,255,255,.055),transparent 28%),linear-gradient(180deg,#080a0b,#010202)!important;overflow:hidden!important}
.lock43188Shell:before,.lock43188Shell:after{content:"";position:absolute;top:18%;bottom:15%;width:36px;background:linear-gradient(90deg,#060708,#22272a 45%,#8c959a 50%,#24282b 55%,#060708);opacity:.9;transform:skewY(-28deg);pointer-events:none}.lock43188Shell:before{left:-22px}.lock43188Shell:after{right:-22px;transform:skewY(28deg)}
.lock43188Left{min-width:0;display:flex!important;flex-direction:column!important;align-items:center!important;padding-top:54px!important;position:relative!important;z-index:2!important}
.lockProfile43188{width:min(100%,230px)!important;aspect-ratio:.90/1!important;display:grid!important;place-items:center!important;overflow:hidden!important;background:linear-gradient(145deg,#16191b,#050606)!important;border:2px solid #abb2b6!important;clip-path:polygon(13% 0,87% 0,100% 13%,100% 87%,87% 100%,13% 100%,0 87%,0 13%)!important;box-shadow:inset 0 0 0 6px rgba(255,255,255,.025),0 0 15px rgba(218,225,229,.15)!important}
.lockProfile43188 img{width:100%!important;height:100%!important;object-fit:cover!important;clip-path:inherit!important}
.lockProfile43188 .lockAvatarMinimal{width:100%!important;height:100%!important}.lockProfile43188 .lockAvatarMinimal i{top:27%!important;width:34%!important;height:30%!important;background:linear-gradient(145deg,#272a2c,#050606)!important;border:1px solid #b4bcc0!important}.lockProfile43188 .lockAvatarMinimal b{bottom:11%!important;width:68%!important;height:38%!important;background:linear-gradient(145deg,#202326,#050606)!important;border:1px solid #b4bcc0!important}
.lockWelcome43188{margin-top:18px!important;font-size:18px!important;font-weight:800!important;letter-spacing:4px!important;color:#e8ebed!important;text-align:center!important}
.lockPower43188{margin-top:7px!important;font-size:8.2px!important;letter-spacing:2.1px!important;color:#c8cdd0!important;text-align:center!important}
.lockProfileName43188{margin-top:7px!important;font-size:9px!important;letter-spacing:2.2px!important;color:#adb4b8!important;text-align:center!important;text-transform:uppercase!important;max-width:96%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
.lockInstruction43188{margin:13px 0 8px!important;color:#959da1!important;font-size:7.5px!important;letter-spacing:1.4px!important;text-align:center!important}
.lockPinDots43188{display:grid!important;grid-template-columns:repeat(4,31px)!important;gap:9px!important;margin:0 0 18px!important}
.lockPinDots43188 i{width:31px!important;height:29px!important;border-radius:0!important;border:1px solid #8d969b!important;background:linear-gradient(145deg,#151719,#070809)!important;clip-path:polygon(17% 0,83% 0,100% 17%,100% 83%,83% 100%,17% 100%,0 83%,0 17%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important;position:relative!important}
.lockPinDots43188 i:after{content:"";position:absolute;width:7px;height:7px;border-radius:50%;background:#7b8286;left:50%;top:50%;transform:translate(-50%,-50%)}
.lockPinDots43188 i.filled{background:linear-gradient(145deg,#2b2f32,#101214)!important;border-color:#d9dfe2!important}.lockPinDots43188 i.filled:after{background:#edf1f3!important;box-shadow:0 0 8px rgba(255,255,255,.38)!important}
.lockPad43188{display:grid!important;grid-template-columns:repeat(3,minmax(58px,74px))!important;gap:9px!important;justify-content:center!important;width:100%!important;margin-top:0!important}
.lockPad43188 .lockKey43188{width:100%!important;height:63px!important;padding:0!important;border-radius:0!important;border:1px solid #8a9398!important;background:linear-gradient(145deg,#171a1c,#08090a 58%,#111416)!important;color:#dce1e4!important;font-size:22px!important;font-weight:500!important;clip-path:polygon(12% 0,88% 0,100% 12%,100% 88%,88% 100%,12% 100%,0 88%,0 12%)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.09)!important}
.lockPad43188 .lockKey43188:active{background:linear-gradient(145deg,#343a3e,#111416)!important;transform:scale(.965)!important}.lockKeyUtility43188{font-size:23px!important;color:#c8ced1!important}
.lockForgot43188,.lockHelp43188{margin:10px 0 0!important;border:0!important;background:transparent!important;color:#7f898e!important;font-size:7px!important;letter-spacing:1.3px!important}
.lock43188Right{position:relative!important;z-index:2!important;border-left:1px solid rgba(188,197,202,.23)!important;padding:8px 0 0 18px!important;display:flex!important;flex-direction:column!important;min-width:0!important}
.lockBrand43188{align-self:flex-end!important;width:64px!important;height:64px!important;margin-bottom:74px!important}.lockBrand43188 img{width:100%!important;height:100%!important;object-fit:cover!important;border-radius:14px!important;filter:grayscale(1) saturate(0) contrast(1.08) brightness(.9)!important;border:1px solid #7d858a!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
.lockQuoteTop43188,.lockQuoteBottom43188{font-size:17px!important;line-height:1.55!important;letter-spacing:2px!important;color:#cbd0d3!important;font-weight:400!important}.lockQuoteTop43188:after,.lockQuoteBottom43188:after{content:"";display:block;width:42px;height:1px;background:#9ba2a6;margin:18px 0!important}
.lockQuoteMid43188{font-size:11px!important;line-height:1.9!important;letter-spacing:3px!important;color:#858e93!important;margin-top:12px!important}
.lockQuoteBottom43188{margin-top:auto!important;margin-bottom:78px!important;font-size:15px!important}
.lockTag43188{position:absolute!important;left:18px!important;right:18px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 18px)!important;text-align:center!important;color:#9ca4a8!important;font-size:8px!important;letter-spacing:2.8px!important;z-index:2!important}.lockTag43188:before,.lockTag43188:after{content:"";display:inline-block;width:62px;height:1px;background:#777f83;vertical-align:middle;margin:0 15px!important}

@media(max-width:390px){
 .topbar43188{grid-template-columns:44px minmax(0,1fr) 44px!important;gap:7px!important}.topBrand43188{height:42px!important;width:min(100%,185px)!important;padding:4px 7px!important}.topBrand43188 img{width:27px!important;height:27px!important}.topBrand43188 span{font-size:6.5px!important;letter-spacing:.55px!important}.homeProfileAvatar{width:58px!important;height:58px!important;min-width:58px!important}
 .lock43188Shell{grid-template-columns:minmax(0,1.55fr) minmax(104px,.72fr)!important;column-gap:12px!important;padding-left:12px!important;padding-right:12px!important}.lock43188Left{padding-top:48px!important}.lockProfile43188{width:min(100%,205px)!important}.lockBrand43188{width:56px!important;height:56px!important;margin-bottom:58px!important}.lockQuoteTop43188{font-size:15px!important}.lockQuoteBottom43188{font-size:13px!important}.lockPad43188{grid-template-columns:repeat(3,minmax(52px,68px))!important;gap:7px!important}.lockPad43188 .lockKey43188{height:58px!important;font-size:20px!important}.lockPinDots43188{grid-template-columns:repeat(4,28px)!important;gap:7px!important}.lockPinDots43188 i{width:28px!important;height:26px!important}
 .premiumCalendarGrid{gap:6px 4px!important}.premiumCalendarGrid .v432DayNo{width:29px!important;height:27px!important;font-size:13px!important}
}
@media(max-height:720px){.lock43188Left{padding-top:30px!important}.lockProfile43188{width:min(100%,158px)!important}.lockWelcome43188{margin-top:10px!important;font-size:14px!important}.lockInstruction43188{margin-top:8px!important}.lockPinDots43188{margin-bottom:10px!important}.lockPad43188 .lockKey43188{height:47px!important}.lockBrand43188{width:48px!important;height:48px!important;margin-bottom:36px!important}.lockQuoteTop43188{font-size:13px!important}.lockQuoteBottom43188{font-size:12px!important;margin-bottom:45px!important}.lockTag43188{font-size:6.5px!important}}
`;
document.head.appendChild(st);
})();
