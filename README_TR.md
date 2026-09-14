# RUTİN CLEAN V2

CLEAN V1 temel alınmıştır.

Düzeltme:
- PIN doğrulamasından sonra ana sayfanın açılmasını engelleyen eksik
  `getReminderCache()` referansı kaldırıldı.
- Hatırlatma fonksiyonları doğrudan çalışan fonksiyonlara bağlandı.
- PIN sistemi değiştirilmedi.
- Tek app.js yapısı korunur.


## CLEAN V2 FULL12
Bu paket CLEAN V2 tabanı korunarak 12 maddelik geliştirme listesinin tamamını içerir: düzenle/sil altyapısı, ayrı Harcamalar sekmesi, yol gideri senkronizasyonu, takvim gün detayları, rapor hareketleri, hatırlatma merkezi, yatırım grafiği, kart harcamaları, nakit hareketleri ve kilit davranışı.

## CLEAN V2 V13 düzeltmesi
- Uygulama yalnızca arka plana geçti diye PIN yeniden istenmez. Aynı uygulama oturumu devam ettiği sürece açık kalır; yeni başlatmada kilit devrededir.
- Yatırımlar: tür, ad, yatırılan tutar, güncel değer, kâr/zarar, tür bazlı portföy grafiği, düzenle/sil.
- Kartlar: premium kart görünümü, hesap kesim/son ödeme tarihleri, kullanılabilir limit, kart detay ekranı, kart harcaması ekle/düzenle/sil.
- Esnek hesap: premium görünüm, hesap kesim/son ödeme tarihleri ve kullanılabilir limit.
