/* RUTIN V43.18.12 — NEUTRAL GLASS ACTIVE FIX
   Visual-only: removes gold/yellow interaction states and replaces them with neutral smoke/gray glass.
   Does not change data, navigation logic, calendar colors, finance calculations, or feature behavior. */
(function(){
  'use strict';
  const id='v43192NeutralGlassFix';
  if(document.getElementById(id)) return;
  const s=document.createElement('style');
  s.id=id;
  s.textContent=`
:root{
  --ng-bg:rgba(255,255,255,.085);
  --ng-bg2:rgba(120,130,138,.075);
  --ng-line:rgba(210,218,224,.42);
  --ng-line2:rgba(255,255,255,.18);
  --ng-text:#f2f4f5;
  --ng-icon:#e6eaed;
  --ng-shadow:rgba(0,0,0,.34);
}

/* Persistent active/selected state = neutral transparent glass. */
:is(button,.clickable,.premiumSetting,.catChip,.payIcons label,.choiceRow label).active:not(.dangerBtn):not(.danger):not(.miniDelete),
:is(button,.clickable,.premiumSetting,.catChip,.payIcons label,.choiceRow label).selected:not(.dangerBtn):not(.danger):not(.miniDelete),
button[aria-selected="true"]:not(.dangerBtn),
button[aria-current="page"]:not(.dangerBtn),
button[data-active="true"]:not(.dangerBtn),
.tabs button.active,.workChoice button.active,
.financeTabs4310 button.active,.financeTabs42 button.active,.segmentedV41 button.active,
.allowanceTabs43165 button.active,.appearanceSwitch button.active,
.nav button.active,.nav4311Fixed button.active,.v3UnifiedNav button.active,
.catChip:has(input:checked),.payIcons label:has(input:checked),.choiceRow label:has(input:checked){
  background:linear-gradient(145deg,var(--ng-bg),var(--ng-bg2))!important;
  border-color:var(--ng-line)!important;
  color:var(--ng-text)!important;
  box-shadow:inset 0 1px 0 var(--ng-line2),inset 0 -1px 0 rgba(255,255,255,.025),0 7px 20px var(--ng-shadow)!important;
  text-shadow:none!important;
  backdrop-filter:blur(15px) saturate(108%)!important;
  -webkit-backdrop-filter:blur(15px) saturate(108%)!important;
}

/* Active icons/text never turn yellow. */
:is(button,.clickable,.premiumSetting,.catChip,.payIcons label,.choiceRow label).active :is(i,.luxGlyph,.navLux,.navIconV36,.navIconV37,svg,span),
:is(button,.clickable,.premiumSetting,.catChip,.payIcons label,.choiceRow label).selected :is(i,.luxGlyph,.navLux,.navIconV36,.navIconV37,svg,span),
button[aria-selected="true"] :is(i,.luxGlyph,.navLux,.navIconV36,.navIconV37,svg,span),
button[aria-current="page"] :is(i,.luxGlyph,.navLux,.navIconV36,.navIconV37,svg,span),
.tabs button.active :is(i,span),.workChoice button.active :is(i,span),
.financeTabs4310 button.active :is(i,span),.financeTabs42 button.active :is(i,span),
.segmentedV41 button.active :is(i,span),.allowanceTabs43165 button.active :is(i,span),
.appearanceSwitch button.active :is(i,span),
.nav button.active :is(i,span,.luxGlyph,.navLux,.navIconV36,.navIconV37),
.nav4311Fixed button.active :is(i,span,.luxGlyph,.navLux,.navIconV36,.navIconV37),
.v3UnifiedNav button.active :is(i,span,.luxGlyph,.navLux,.navIconV36,.navIconV37),
.catChip:has(input:checked) :is(i,span),.payIcons label:has(input:checked) :is(i,span),.choiceRow label:has(input:checked) :is(i,span){
  color:var(--ng-icon)!important;
  fill:currentColor!important;
  text-shadow:none!important;
}

/* Bottom nav: glass tile with silver/white icon, never gold. */
.nav button.active,.nav4311Fixed button.active,.v3UnifiedNav button.active{
  background:transparent!important;
  border-color:transparent!important;
  box-shadow:none!important;
}
.nav button.active :is(.navLux,.navIconV36,.navIconV37,.luxGlyph,i),
.nav4311Fixed button.active :is(.navLux,.navIconV36,.navIconV37,.luxGlyph,i),
.v3UnifiedNav button.active :is(.navLux,.navIconV36,.navIconV37,.luxGlyph,i){
  background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(120,130,138,.055))!important;
  border:1px solid rgba(218,225,230,.42)!important;
  color:#e9edef!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.17),0 6px 17px rgba(0,0,0,.32)!important;
  backdrop-filter:blur(14px) saturate(105%)!important;
  -webkit-backdrop-filter:blur(14px) saturate(105%)!important;
}
.nav button.active span,.nav4311Fixed button.active span,.v3UnifiedNav button.active span{color:#eef1f2!important}

/* Touch/hover feedback on normal controls = neutral glass, not yellow.
   Calendar day cells are excluded so their five semantic colors stay untouched. */
button:not(.premiumDay):not(.v432Day):not(.day):not(.dangerBtn):not(.danger):not(.miniDelete):hover,
button:not(.premiumDay):not(.v432Day):not(.day):not(.dangerBtn):not(.danger):not(.miniDelete):focus-visible,
button:not(.premiumDay):not(.v432Day):not(.day):not(.dangerBtn):not(.danger):not(.miniDelete):active,
.clickable:hover,.clickable:focus-visible,.clickable:active,
.premiumSetting:hover,.premiumSetting:focus-visible,.premiumSetting:active,
.catChip:hover,.catChip:active,.payIcons label:hover,.payIcons label:active,.choiceRow label:hover,.choiceRow label:active,
.v43191Pressed{
  background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(120,130,138,.065))!important;
  border-color:rgba(220,227,232,.44)!important;
  color:#f1f3f4!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 5px 15px rgba(0,0,0,.28)!important;
  filter:none!important;
  text-shadow:none!important;
  backdrop-filter:blur(13px) saturate(105%)!important;
  -webkit-backdrop-filter:blur(13px) saturate(105%)!important;
}
button:not(.premiumDay):not(.v432Day):not(.day):not(.dangerBtn):not(.danger):not(.miniDelete):hover :is(i,.luxGlyph,span),
button:not(.premiumDay):not(.v432Day):not(.day):not(.dangerBtn):not(.danger):not(.miniDelete):focus-visible :is(i,.luxGlyph,span),
button:not(.premiumDay):not(.v432Day):not(.day):not(.dangerBtn):not(.danger):not(.miniDelete):active :is(i,.luxGlyph,span),
.v43191Pressed :is(i,.luxGlyph,span){color:#eef1f2!important;text-shadow:none!important}

/* Preserve semantic danger styling. */
.dangerBtn.active,.dangerBtn:active,.danger.active,.danger:active,.miniDelete.active,.miniDelete:active{
  background:rgba(120,28,28,.28)!important;
  border-color:rgba(255,110,110,.50)!important;
  color:#ff9b9b!important;
}
`;
  document.head.appendChild(s);
})();
