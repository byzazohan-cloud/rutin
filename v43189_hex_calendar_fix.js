/* RUTIN V43.18.9 — HEX CALENDAR VISUAL FIX
   Presentation-only calendar patch. No data, record, modal, calculation or navigation logic is changed. */
(function(){
'use strict';
const st=document.createElement('style');
st.id='v43189HexCalendarFix';
st.textContent=`
/* Calendar shell: keep existing application width and behavior, only normalize geometry. */
.v43CalendarWrap{width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important}
.premiumCalendarCard{width:100%!important;box-sizing:border-box!important;padding:13px 10px 12px!important;overflow:hidden!important}
.premiumCalendarCard .calendarHead,
.premiumCalendarCard .premiumCalendarGrid{width:100%!important;box-sizing:border-box!important}

/* Exactly seven equal columns. Prevent accumulated width/gap drift on iPhone and desktop preview. */
.premiumCalendarGrid{
  display:grid!important;
  grid-template-columns:repeat(7,minmax(0,1fr))!important;
  column-gap:5px!important;
  row-gap:7px!important;
  justify-items:center!important;
  align-items:center!important;
}
.calendarHead{
  display:grid!important;
  grid-template-columns:repeat(7,minmax(0,1fr))!important;
  gap:5px!important;
  align-items:center!important;
  text-align:center!important;
}

/* Large true hexagons. Inline segmented background from the existing calendar logic remains untouched. */
.premiumCalendarGrid .premiumDay,
.premiumCalendarGrid .v432Day{
  width:min(100%,48px)!important;
  height:auto!important;
  min-width:0!important;
  min-height:0!important;
  aspect-ratio:1 / 1.08!important;
  padding:0!important;
  margin:0!important;
  border:0!important;
  border-radius:0!important;
  clip-path:polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)!important;
  outline:0!important;
  background-color:#0b1013!important;
  overflow:hidden!important;
  position:relative!important;
  isolation:isolate!important;
  box-shadow:inset 0 0 0 1.5px rgba(85,94,101,.68),inset 0 7px 13px rgba(255,255,255,.028)!important;
  transform:none!important;
}
.premiumCalendarGrid .premiumDay.hasData,
.premiumCalendarGrid .v432Day.hasData{
  filter:saturate(1.12) brightness(1.05)!important;
  box-shadow:inset 0 0 0 1.3px rgba(255,255,255,.16),inset 0 8px 16px rgba(255,255,255,.07)!important;
}
.premiumCalendarGrid .premiumDay.hasData:after,
.premiumCalendarGrid .v432Day.hasData:after{
  content:""!important;
  position:absolute!important;
  inset:0!important;
  z-index:1!important;
  pointer-events:none!important;
  background:linear-gradient(160deg,rgba(255,255,255,.15) 0%,rgba(255,255,255,.025) 38%,rgba(0,0,0,.13) 100%)!important;
}
.premiumCalendarGrid .premiumDay.today,
.premiumCalendarGrid .v432Day.today{
  box-shadow:inset 0 0 0 3px #e7c45f,inset 0 0 0 5px rgba(4,5,6,.72),0 0 12px rgba(231,196,95,.38)!important;
  filter:saturate(1.14) brightness(1.07) drop-shadow(0 0 2px rgba(231,196,95,.55))!important;
}

/* Day number floats directly over the large color fields, as in the approved design. */
.premiumCalendarGrid .v432DayNo{
  position:absolute!important;
  z-index:3!important;
  inset:0!important;
  transform:none!important;
  display:grid!important;
  place-items:center!important;
  width:100%!important;
  height:100%!important;
  min-width:0!important;
  margin:0!important;
  padding:0!important;
  border:0!important;
  border-radius:0!important;
  background:transparent!important;
  color:#fff!important;
  font-size:16px!important;
  line-height:1!important;
  font-weight:950!important;
  text-shadow:0 2px 5px rgba(0,0,0,.92),0 0 2px rgba(0,0,0,.9)!important;
  box-shadow:none!important;
}

/* Empty leading cells occupy the same hex footprint so weekday columns never shift. */
.premiumDaySpacer{
  width:min(100%,48px)!important;
  height:auto!important;
  min-width:0!important;
  aspect-ratio:1 / 1.08!important;
}

/* Keep all five legend colors visible and evenly spaced. */
.premiumLegend.v43Legend{
  display:flex!important;
  flex-wrap:wrap!important;
  align-items:center!important;
  justify-content:flex-start!important;
  gap:8px 12px!important;
  margin-top:12px!important;
}

/* Approved compact 3 x 2 monthly summary presentation; underlying six summary actions stay identical. */
.v432SumGrid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:7px!important}
.v432Sum{min-width:0!important;padding:10px 8px!important}
.v432Sum span{white-space:normal!important;line-height:1.2!important}
.v432Sum strong{line-height:1.15!important}

@media(max-width:390px){
  .premiumCalendarCard{padding-left:8px!important;padding-right:8px!important}
  .premiumCalendarGrid{column-gap:4px!important;row-gap:6px!important}
  .calendarHead{gap:4px!important}
  .premiumCalendarGrid .premiumDay,.premiumCalendarGrid .v432Day,.premiumDaySpacer{width:min(100%,44px)!important}
  .premiumCalendarGrid .v432DayNo{font-size:15px!important}
  .v432Sum{padding:9px 6px!important}
  .v432Sum span{font-size:5.5px!important}.v432Sum strong{font-size:9.5px!important}.v432Sum small{font-size:5px!important}
}
@media(max-width:350px){
  .premiumCalendarGrid{column-gap:3px!important;row-gap:5px!important}
  .premiumCalendarGrid .premiumDay,.premiumCalendarGrid .v432Day,.premiumDaySpacer{width:min(100%,40px)!important}
  .premiumCalendarGrid .v432DayNo{font-size:14px!important}
  .v432SumGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}
`;
document.head.appendChild(st);
})();
