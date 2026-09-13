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

## V6.5
- Günlük kayıt hatırlatmaları eklendi.
- Sabah varsayılan hatırlatma: 07:00.
- Gece varsayılan hatırlatma: 22:00.
- Hatırlatma saatleri Ayarlar > Hatırlatıcılar içinden değiştirilebilir.
- Harcama Ekle ekranında kategori ve ödeme butonları küçültüldü.
- Harcama Ekle ikonları ve yazıları daha büyük ve okunaklı hale getirildi.

## V6.9
- Uygulama kilidi yeni kurulumlarda varsayılan AÇIK.
- PIN yoksa uygulama ilk açılışta 4 haneli PIN oluşturma ekranı gösterir.
- PIN oluşturulduktan sonra her sayfa yenileme / uygulama yeniden açılışında parola ekranı gelir.
- Doğru PIN yalnız o açık oturum için kilidi açar; yenilemede tekrar PIN gerekir.
- Ayarlar > Uygulama Kilidi bölümünden kilit sonradan kapatılabilir.
- Kilit kapatılırsa PIN temizlenir.

## V6.10
- Eski kurulumlarda kalmış `lock:false` ayarı için tek seferlik güvenlik göçü eklendi.
- V6.10 ilk açılışta uygulama kilidini zorunlu olarak açar.
- PIN yoksa PIN oluşturma ekranı gelir; PIN varsa mevcut PIN istenir.
- Kullanıcı daha sonra Ayarlar'dan kilidi kapatırsa bu tercih korunur.
- Uygulama arka plana geçtiğinde kilitliysa oturum tekrar kilitlenir.
- Service Worker yeni sürümü bekletmeden aktive olacak şekilde güncellendi.

## V6.11 — Kilit ve kayıt kalıcılığı kesin düzeltme
- Uygulama artık tek bir kalıcı depolama anahtarı (`rutin-main`) kullanır.
- Eski `rutin-v4`, `rutin-v3`, `rutin-v2`, `rutin-v1` verileri otomatik okunup yeni depoya taşınır.
- PIN ve kilit ayarı sayfa yenilemede kaybolmaz.
- Eksik olan `pinKey()` rakam tuşu doğrulama fonksiyonu eklendi.
- V6.11'e ilk geçişte kilit bir kez zorunlu açılır; PIN varsa ister, yoksa oluşturma ekranı gelir.
- Kullanıcı Ayarlar'dan daha sonra kilidi kapatırsa bu tercih kalıcıdır.

## V6.12
- Profil sayfasındaki profil fotoğrafına dokununca Profil Düzenle açılır.
- Ana sayfadaki profil fotoğrafına dokununca Profil sayfası açılır.
- Profil Düzenle ekranına Fotoğraf Seç eklendi.
- Fotoğraf telefondan/dosyadan seçilebilir ve kaydedilir.
- Seçilen fotoğraf profil ekranında ve premium kilit ekranında kullanılır.
- Fotoğraf kaldırma seçeneği eklendi.

## V6.14
- Profil fotoğrafı seçildikten sonra kadraj editörü açılır.
- Fotoğraf yakınlaştırılıp / uzaklaştırılabilir.
- Fotoğraf parmak veya mouse ile sağa-sola / yukarı-aşağı taşınabilir.
- Yuvarlak profil alanının içine istenen bölüm ortalanabilir.
- KADRAJI KULLAN seçildiğinde seçilen bölüm 512x512 profil fotoğrafı olarak kaydedilir.

## V6.16
- Mobil klavye açılırken çalışan yanlış visibility kilidi kaldırıldı.
- Yazı/tutar/not/PIN alanına dokununca form artık kapanmaz veya kilit ekranına atmaz.
- Uygulama yalnız 15 saniye veya daha uzun gerçek arka plan süresinden sonra tekrar kilitlenir.
- Sayfa yenileme / uygulama yeniden açma zaten PIN ister.
- Parola ekranı ve ilk PIN oluşturma ekranı artık ana uygulamadaki aynı R✓ RUTİN logosunu kullanır.
- Modal dışına dokunma davranışı input odaklıyken güvenli hale getirildi.

## V6.17 — Pil Optimizasyonu
- Arka planda sürekli çalışan interval/polling kullanılmaz.
- Hatırlatma kontrolleri aynı dakika içinde tekrar hesaplanmaz.
- Uygulama görünür değilken gereksiz render yapılmaz.
- Service Worker sade cache-first yapıya geçirildi; periyodik kontrol yapmaz.
- Mobilde pahalı blur/gölge efektleri azaltıldı; tasarım dili korunur.
- Uygulama kapalıyken arka planda işlem çalıştırmaz.
- Mevcut kilit, profil, tema, takvim ve rapor özellikleri korunur.

## V6.19
- Mobil PIN tuşları render sonrasında doğrudan her tuşa bağlanır.
- Click + touchend desteklenir.
- Eski Service Worker / JavaScript kalmasını önlemek için navigasyon, JS ve CSS network-first güncellenir.
- Parola ekranında V6.19 sürüm etiketi görünür; böylece telefonda yeni sürümün gerçekten yüklendiği kontrol edilebilir.

## V6.21
- PIN girerken her rakamda ekranın tamamı yeniden çizilmez.
- Sadece PIN noktaları güncellenir.
- 4. rakam dokunma sorunu giderildi.
- Mobilde click ve touch çift tetikleme riski kaldırıldı.
- Silme tuşu yalnız noktaları günceller.
- Doğru 4 haneli PIN girildiğinde uygulama açılır.

## V6.22
- İlk PIN oluşturma ekranı artık metin kutusu kullanmaz.
- Premium parola ekranıyla aynı 0-9 tuş takımı kullanılır.
- Önce yeni 4 haneli PIN girilir, sonra ikinci kez tekrar girilir.
- Eşleşirse PIN kaydedilir ve uygulama açılır.
- Telefon klavyesi hiç açılmaz.
