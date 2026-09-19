/* RUTIN V43.18.11 — GLASS ACTIVE FIX
   Visual-only active/selected/pressed state. No data or feature logic changes. */
(function(){
  'use strict';
  const STYLE_ID='v43191GlassActiveFix';
  if(!document.getElementById(STYLE_ID)){
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
:root{--ga-bg:rgba(255,255,255,.10);--ga-bg2:rgba(205,218,225,.055);--ga-line:rgba(225,233,237,.48);--ga-hi:rgba(255,255,255,.24);--ga-shadow:rgba(0,0,0,.34)}

/* Persistent selected/current states across the whole app. */
:is(button,.clickable,.premiumSetting,.catChip,.payIcons label,.choiceRow label).active,
:is(button,.clickable,.premiumSetting,.catChip,.payIcons label,.choiceRow label).selected,
button[aria-selected="true"],button[aria-current="page"],button[data-active="true"],
.tabs button.active,.workChoice button.active,
.financeTabs4310 button.active,.financeTabs42 button.active,.segmentedV41 button.active,
.allowanceTabs43165 button.active,.appearanceSwitch button.active,
.nav button.active,.nav4311Fixed button.active,.v3UnifiedNav button.active,
.catChip:has(input:checked),.payIcons label:has(input:checked),.choiceRow label:has(input:checked){
  background:linear-gradient(145deg,var(--ga-bg),var(--ga-bg2))!important;
  border-color:var(--ga-line)!important;
  color:#f4f6f7!important;
  box-shadow:inset 0 1px 0 var(--ga-hi),inset 0 -1px 0 rgba(255,255,255,.035),0 8px 22px var(--ga-shadow),0 0 0 1px rgba(255,255,255,.035)!important;
  backdrop-filter:blur(16px) saturate(125%)!important;
  -webkit-backdrop-filter:blur(16px) saturate(125%)!important;
}

/* Bottom navigation: show the glass on the visible icon tile, not as a solid gold fill. */
.nav button.active,.nav4311Fixed button.active,.v3UnifiedNav button.active{background:transparent!important;box-shadow:none!important;border-color:transparent!important}
.nav button.active :is(.navLux,.navIconV36,.navIconV37,.luxGlyph,i),
.nav4311Fixed button.active :is(.navLux,.navIconV36,.navIconV37,.luxGlyph,i),
.v3UnifiedNav button.active :is(.navLux,.navIconV36,.navIconV37,.luxGlyph,i){
  background:linear-gradient(145deg,rgba(255,255,255,.13),rgba(255,255,255,.045))!important;
  border:1px solid rgba(225,233,237,.55)!important;
  color:#f5d77b!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 8px 20px rgba(0,0,0,.32),0 0 14px rgba(255,255,255,.08)!important;
  backdrop-filter:blur(15px) saturate(120%)!important;
  -webkit-backdrop-filter:blur(15px) saturate(120%)!important;
}
.nav button.active span,.nav4311Fixed button.active span,.v3UnifiedNav button.active span{color:#f0f2f3!important;text-shadow:0 1px 8px rgba(0,0,0,.7)!important}

/* Touch/click feedback: temporary clear glass state. */
.v43191Pressed,
button:active,.clickable:active,.premiumSetting:active,.catChip:active,.payIcons label:active,.choiceRow label:active{
  background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.065))!important;
  border-color:rgba(238,244,247,.64)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.28),0 5px 16px rgba(0,0,0,.28)!important;
  backdrop-filter:blur(14px) saturate(130%)!important;
  -webkit-backdrop-filter:blur(14px) saturate(130%)!important;
  filter:brightness(1.06)!important;
}

/* Do not turn destructive buttons into a selected state; keep their semantic red color. */
.dangerBtn.active,.danger.active,.miniDelete.active{background:rgba(120,28,28,.28)!important;border-color:rgba(255,110,110,.50)!important}
`;
    document.head.appendChild(s);
  }

  // Adds a short visual glass press state without changing any click handlers.
  const selector='button,.clickable,.premiumSetting,.catChip,.payIcons label,.choiceRow label';
  document.addEventListener('pointerdown',function(e){
    const el=e.target.closest&&e.target.closest(selector);
    if(!el) return;
    el.classList.add('v43191Pressed');
  },true);
  const clear=function(e){
    const el=e.target.closest&&e.target.closest(selector);
    if(el) el.classList.remove('v43191Pressed');
    document.querySelectorAll('.v43191Pressed').forEach(n=>n.classList.remove('v43191Pressed'));
  };
  document.addEventListener('pointerup',clear,true);
  document.addEventListener('pointercancel',clear,true);
  document.addEventListener('pointerleave',clear,true);
})();
