# RUTİN V2
Bu sürüm, kullanıcı tarafından seçilen referans tasarıma göre sıfırdan kurulmuştur.

## Ekranlar
- Ana Sayfa
- Gelir / Harcama Ekle
- Günlük Çalışma
- Saatlik Çalışma
- Mesai
- Finans / Hesaplar
- Takvim
- Rapor / Analiz
- Detaylı Rapor
- Yatırımlar
- Notlar
- Profil
- Ayarlar

## Temel mantık
- Günlük çalışma: tek kayıt
- Saatlik çalışma: kronometre yok, saat elle girilir
- Mesai: saatlik çalışmadan ayrı tutulur
- Yol masrafı isteğe bağlı
- Kredi kartı, esnek hesap ve nakit
- Küçük yatırım kayıtları
- Notlar
- Çalışma takviminde günlük/saatlik/mesai/çalışılmayan gün renkleri
- Aylık rapor ve detaylı rapor
- Veriler cihazda localStorage içinde tutulur

## Not
Bu V2 tasarım ve işlev omurgasıdır. Kullanıcı geri bildirimine göre sonraki sürümlerde birebir ince ayar yapılacaktır.


## V3
- DAHA FAZLA ekranındaki tüm seçenekler tıklanabilir.
- Profil ekranı referans RUTİN görseline daha yakın premium yapıda yenilendi.
- Kayıt Ekle ekranı ikonlu kategori ve ödeme yöntemi kartlarıyla premium hale getirildi.
- Raporlarda Günlük / Haftalık / Aylık / Yıllık gerçekten çalışır.
- Rapor grafiğine dokununca Detaylı Rapor açılır.
- Detaylı raporda çalışma özeti, finansal özet, grafik ve hareket listesi vardır.
- Alt menü: Ana Sayfa / İş / Takvim / Raporlar / Daha Fazla.
- Ana sayfa hızlı işlemlerinde Saatlik ve Mesai kaldırıldı; Notlar ve Yatırım eklendi.
- Birden fazla kredi kartı eklenebilir/düzenlenebilir/silinebilir.
- Birden fazla esnek hesap eklenebilir/düzenlenebilir/silinebilir.
- PIN uygulama kilidi eklendi.
- Ödeme tarihi yaklaşan kart/esnek hesaplar için uygulama içi hatırlatma eklendi.
- RUTİN yedek dosyası oluşturma ve geri yükleme eklendi.
- Veri dışa aktarma eklendi.

## V5
- Seçilen R✓ siyah-altın RUTİN logosu eklendi.
- Web/PWA uygulama ikonu ve Apple ana ekran ikonu eklendi.
- Sağ üstteki profil/nokta ikonu kaldırıldı; sağ üstte Ayarlar kaldı.
- Raporlar ekranında Gelir ve Harcama ayrı ayrı yuvarlak grafik olarak gösterilir.
- Detaylı raporda da ayrı Gelir/Harcama yuvarlak grafikleri bulunur.
- Uygulama içi ikonlar daha büyük, sade ve lüks/premium görünüme çekildi.
- V4.1 takvim, Tema Stüdyosu, yedekleme, PIN ve diğer işlevler korunmuştur.

## V6
- Uygulama genel yüzeyi tam siyah yapıldı.
- Soluk/gri metinler beyaza çevrildi.
- Aktif, seçili ve basılan butonlar gold görünür.
- Takvim referans RUTİN tasarımına yaklaştırıldı.
- Takvim günleri yuvarlak ve daha kompakt.
- Günlük / Saatlik / Mesai takvim renkleri artık solid/saydam olmayan renklerdir.
- Bugünün tarihi beyaz çerçeve ile vurgulanır.
- Takvim altındaki detaylı çalışma özeti korunur.
- Premium ikonlar biraz büyütüldü ve daha net hale getirildi.
- R✓ logo, ayrı Gelir/Harcama yuvarlak grafikleri, Tema Stüdyosu ve V5 özellikleri korunmuştur.

## V6.1
- Alt menüde ANA yerine ANA SAYFA yazısı kullanılır.
- Alt menü ikonları büyütüldü.
- İkonlar daha temiz ve premium sembollerle yenilendi.
- Aktif sekmenin ikonu gold dolgu ve hafif parlama ile vurgulanır.

## V6.2
- Ayarlar ekranındaki ikonlar büyütüldü ve premium gold çerçeveli hale getirildi.
- Veri Dışa Aktar yanında Veri Geri Yükle eklendi.
- Dışa aktarılan JSON dosyası yeniden içe aktarılabilir.
- HANE benzeri dosyadan geri yükleme akışı eklendi.
- Hızlı İşlemler'deki Gelir Ekle ve Harcama ikonları diğer hızlı işlem ikonlarıyla aynı büyük premium ölçüye getirildi.

## V6.3
- Harcama Ekle ekranındaki kategori ve ödeme ikonları büyütüldü.
- Harcama formundaki yazılar biraz büyütüldü; butonlar biraz küçültüldü.
- Takvim gün sayıları büyütüldü.
- Aynı gün Günlük + Saatlik + Mesai varsa takvim dairesi 3 renge bölünür.
- İki çalışma türü varsa daire iki renge bölünür.
- Takvimde önceki/sonraki aylara geçilebilir.
- Geçmiş aylardaki çalışma kayıtları açılıp düzenlenebilir ve silinebilir.

## V6.4
- Selamlama saate göre otomatik değişir:
  - Sabah: GÜNAYDIN
  - Öğle: TÜNAYDIN
  - Akşam: İYİ AKŞAMLAR
  - Gece: İYİ GECELER
- Günün sözü her gün otomatik değişir.
- Ayarlarda KARANLIK MOD / AÇIK MOD aktif hale getirildi.
- Tema Stüdyosu içinde de görünüm modu seçilebilir.
- Açık mod gerçek açık renk temaya, karanlık mod tam siyah temaya geçer.
