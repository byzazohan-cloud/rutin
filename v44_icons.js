/* RUTIN V44 - unified premium icon system. Inline SVG: no emoji/font dependency. */
(function(){
const S=(body,accent='gold')=>`<svg class="r44svg ${accent}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
const p='fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const I={
 home:S(`<path ${p} d="M3.5 11 12 4l8.5 7v8.5h-6v-5h-5v5h-6z"/>`),
 work:S(`<rect ${p} x="4" y="7" width="16" height="12" rx="3"/><path ${p} d="M9 7V5h6v2M4 12h16M10 12v2h4v-2"/>`,'blue'),
 expense:S(`<circle ${p} cx="12" cy="12" r="8"/><path ${p} d="M14.8 8.5H10a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H9M12 6.5v11"/>`,'red'),
 calendar:S(`<rect ${p} x="4" y="5" width="16" height="15" rx="3"/><path ${p} d="M8 3v4M16 3v4M4 9h16"/><text x="12" y="16.2" text-anchor="middle" font-size="7" font-weight="800" fill="currentColor" stroke="none">31</text>`,'purple'),
 report:S(`<rect ${p} x="4" y="4" width="16" height="16" rx="3"/><path ${p} d="M8 16v-4M12 16V8M16 16v-6"/>`,'cyan'),
 finance:S(`<rect ${p} x="3" y="6" width="18" height="12" rx="3"/><path ${p} d="M3 10h18M7 15h4"/>`,'gold'),
 invest:S(`<path ${p} d="M5 17 10 12l3 3 6-8M14 7h5v5"/>`,'green'),
 more:S(`<circle cx="6" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="18" cy="12" r="1.6" fill="currentColor"/>`),
 settings:S(`<circle ${p} cx="12" cy="12" r="3"/><path ${p} d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>`),
 reminder:S(`<path ${p} d="M6 16h12l-1.5-2V10a4.5 4.5 0 0 0-9 0v4zM10 19h4"/>`),
 notes:S(`<path ${p} d="M5 19h4l10-10-4-4L5 15zM13.5 6.5l4 4"/>`,'blue'),
 profile:S(`<circle ${p} cx="12" cy="8" r="3.5"/><path ${p} d="M5 20c.7-4 3-6 7-6s6.3 2 7 6"/>`),
 menu:S(`<path ${p} d="M5 7h14M5 12h14M5 17h14"/>`),
 back:S(`<path ${p} d="m15 5-7 7 7 7"/>`), next:S(`<path ${p} d="m9 5 7 7-7 7"/>`),
 add:S(`<path ${p} d="M12 5v14M5 12h14"/>`,'cyan'), edit:S(`<path ${p} d="M5 19h4l10-10-4-4L5 15z"/>`,'blue'),
 del:S(`<path ${p} d="M5 7h14M9 7V5h6v2M8 10v7M12 10v7M16 10v7M7 7l1 13h8l1-13"/>`,'red'),
 check:S(`<path ${p} d="m5 12 4 4L19 6"/>`,'green'),
 clock:S(`<circle ${p} cx="12" cy="12" r="8"/><path ${p} d="M12 7v5l3 2"/>`,'green'),
 overtime:S(`<path ${p} d="m12 3 1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8z"/>`,'gold'),
 road:S(`<path ${p} d="M7 20 10 4M17 20 14 4M12 6v3M12 12v3M12 18v2"/>`,'cyan'),
 cash:S(`<path ${p} d="M5 8h14v10H5zM8 8V6h8v2M8 13h8"/>`,'green'),
 bank:S(`<path ${p} d="m4 9 8-5 8 5M5 10h14M7 10v7M11 10v7M15 10v7M19 10v7M4 19h16"/>`,'cyan'),
 backup:S(`<path ${p} d="M7 17H6a4 4 0 0 1 0-8 6 6 0 0 1 11.5-1.5A4 4 0 0 1 18 17h-2M12 8v9m-3-3 3 3 3-3"/>`,'cyan'),
 theme:S(`<path ${p} d="M12 4a8 8 0 1 0 0 16h1.5a2 2 0 0 0 0-4H12a1.5 1.5 0 0 1 0-3h2a6 6 0 0 0-2-9z"/><circle cx="8" cy="9" r="1" fill="currentColor"/><circle cx="8" cy="14" r="1" fill="currentColor"/>`,'purple'),
 lock:S(`<rect ${p} x="6" y="10" width="12" height="10" rx="2"/><path ${p} d="M9 10V7a3 3 0 0 1 6 0v3"/>`), info:S(`<circle ${p} cx="12" cy="12" r="9"/><path ${p} d="M12 11v6M12 7h.01"/>`)
};
window.r44Icon=n=>I[n]||I.more;
const keyByText=t=>{t=(t||'').toUpperCase(); if(t.includes('ANA SAYFA'))return'home';if(t==='İŞ'||t.includes('ÇALIŞMA'))return'work';if(t.includes('HARCAMA'))return'expense';if(t.includes('TAKVİM'))return'calendar';if(t.includes('RAPOR'))return'report';if(t.includes('FİNANS')||t.includes('KREDİ KART'))return'finance';if(t.includes('YATIRIM'))return'invest';if(t.includes('DAHA FAZLA'))return'more';if(t.includes('AYAR'))return'settings';if(t.includes('HATIRLAT'))return'reminder';if(t.includes('NOT'))return'notes';if(t.includes('PROFİL'))return'profile';if(t.includes('YEDEK'))return'backup';if(t.includes('TEMA'))return'theme';if(t.includes('KİLİT'))return'lock';if(t.includes('HAKKINDA'))return'info';if(t.includes('SAATLİK'))return'clock';if(t.includes('MESAİ'))return'overtime';if(t.includes('YOL'))return'road';if(t.includes('NAKİT'))return'cash';if(t.includes('ESNEK HESAP')||t==='HESAPLAR')return'bank';if(t.includes('DÜZENLE'))return'edit';if(t.includes('SİL'))return'del';if(t.includes('EKLE'))return'add';if(t.includes('ÖDEME YAPTIM')||t.includes('KAYDET')||t.includes('ÖDENDİ'))return'check';return null};
function patch(root=document){
 root.querySelectorAll('button, .setting, .item, .detailRecord').forEach(el=>{const k=keyByText(el.innerText);if(!k)return;const slot=el.querySelector(':scope > i, :scope > .settingIcon, :scope > .ico, i.luxGlyph');if(slot&&!slot.dataset.r44){slot.innerHTML=I[k];slot.dataset.r44='1';slot.classList.add('r44IconSlot')}});
 root.querySelectorAll('.settingsGearV27').forEach(e=>{e.innerHTML=I.settings;e.dataset.r44='1';e.classList.add('r44IconSlot')});
}
const oldNav=window.nav;
window.nav=function(){const items=[['home','home','ANA SAYFA'],['work','work','İŞ'],['expenses','expense','HARCAMA'],['calendar','calendar','TAKVİM'],['reports','report','RAPOR'],['finance','finance','FİNANS'],['more','more','DAHA FAZLA']];return `<nav class="bottomNav v44Nav">${items.map(x=>`<button class="${screen===x[0]?'active':''}" onclick="go('${x[0]}')"><i class="r44IconSlot">${I[x[1]]}</i><span>${x[2]}</span></button>`).join('')}</nav>`};
const obs=new MutationObserver(()=>patch());obs.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>patch());setTimeout(()=>patch(),0);
})();
