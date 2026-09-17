/* RUTIN V43.12.3 DATA GUARD — non-destructive backup/recovery */
(function(){
const SNAP='rutin-safety-snapshots-v1', MAIN='rutin-main';
const clone=x=>JSON.parse(JSON.stringify(x));
const counts=s=>({work:s?.work?.length||0,expenses:s?.expenses?.length||0,incomes:s?.incomes?.length||0,cards:s?.cards?.length||0,flex:s?.flexAccounts?.length||0,investments:s?.investments?.length||0,notes:s?.notes?.length||0});
function readState(k){try{const x=JSON.parse(localStorage.getItem(k)||'null');return x&&typeof x==='object'?x:null}catch(e){return null}}
function snapshots(){try{return JSON.parse(localStorage.getItem(SNAP)||'[]')}catch(e){return[]}}
function snapshot(label, s){if(!s)return;try{let a=snapshots();const raw=JSON.stringify(s),sig=raw.length+':'+JSON.stringify(counts(s));if(a[0]?.sig===sig)return;a.unshift({at:new Date().toISOString(),label,sig,counts:counts(s),state:clone(s)});a=a.slice(0,5);localStorage.setItem(SNAP,JSON.stringify(a))}catch(e){}}
// Capture what exists BEFORE any migration/save in app.js.
snapshot('GÜNCELLEME ÖNCESİ',readState(MAIN));
window.rutinSafety={SNAP,MAIN,counts,snapshots,snapshot,readState};
})();
