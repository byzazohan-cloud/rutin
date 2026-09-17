/* RUTIN V43.13.2 - Ayarlar > Verileri Sil */
(function(){
  const oldSettings = window.settings || settings;
  window.settings = settings = function(){
    let html = oldSettings();
    const row = `<div class="setting clickable premiumSetting dataDelete43132" onclick="deleteAllRutinDataV43132()"><div class="settingIcon">×</div><b>VERİLERİ SİL</b><span>TÜM KAYITLARI TEMİZLE ›</span></div>`;
    const about = '<div class="setting premiumSetting"><div class="settingIcon">i</div><b>HAKKINDA</b>';
    if(html.includes(about)) html = html.replace(about, row + about);
    else html = html.replace('</div>', row + '</div>');
    return html;
  };

  window.deleteAllRutinDataV43132 = function(){
    if(!confirm('TÜM UYGULAMA VERİLERİNİ SİLMEK İSTİYOR MUSUN?\n\nÇalışma, mesai, harcama, gelir, kart, esnek hesap, yatırım ve not kayıtları silinecek. Bu işlem geri alınamaz.')) return;
    if(!confirm('SON ONAY\n\nKayıtların tamamı kalıcı olarak silinecek. Devam edilsin mi?')) return;

    // Kullanıcının uygulama ayarlarını, profilini, temasını ve kategori düzenini koru.
    const keepSettings = structuredClone(state.settings || defaults.settings);
    const keepProfile = structuredClone(state.profile || defaults.profile);
    const keepCategories = structuredClone(state.categories || defaults.categories);
    const keepCategoryMeta = structuredClone(state.categoryMeta || {});

    state = structuredClone(defaults);
    state.settings = keepSettings;
    state.profile = keepProfile;
    state.categories = keepCategories;
    state.categoryMeta = keepCategoryMeta;
    state.work=[]; state.expenses=[]; state.incomes=[]; state.notes=[]; state.investments=[];
    state.cards=[]; state.flexAccounts=[];
    state.accounts={cash:{name:'NAKİT',balance:0}};

    try{
      ['rutin-v4','rutin-v3','rutin-v2','rutin-v1'].forEach(k=>localStorage.removeItem(k));
      save();
      alert('TÜM KAYITLAR SİLİNDİ. AYARLARIN VE PROFİLİN KORUNDU.');
      location.reload();
    }catch(err){
      alert('VERİLER SİLİNEMEDİ: '+(err && err.message ? err.message : err));
    }
  };
})();
