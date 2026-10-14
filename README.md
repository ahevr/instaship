# InstaShip · Moto Haber Postları

Fotoğrafı yükle, haberi yaz, Instagram'a hazır PNG'yi indir. Her şey bilgisayarında çalışır, internet gerekmez.

## Kurulum

Gereken tek şey **Node.js** (18 veya üstü, en güncel **LTS** sürümü önerilir). Kurulum bir kere yapılır; sonrasında uygulama internet olmadan çalışır.

### 1. Node.js'i kur

| Sistem | Nasıl |
|---|---|
| **Windows** | [nodejs.org](https://nodejs.org) adresinden **LTS** yükleyicisini (`.msi`) indir, varsayılan ayarlarla kur. Ya da PowerShell'de: `winget install OpenJS.NodeJS.LTS` |
| **macOS** | [nodejs.org](https://nodejs.org) adresinden **LTS** yükleyicisini (`.pkg`) indir ve kur. Homebrew kullanıyorsan: `brew install node` |
| **Linux** | Dağıtımının paket yöneticisindeki sürüm eski olabilir. En sağlamı [nodejs.org/en/download](https://nodejs.org/en/download) sayfasındaki talimatlar (nvm veya NodeSource). Ubuntu/Debian için örnek: `curl -fsSL https://deb.nodesource.com/setup_lts.x \| sudo -E bash - && sudo apt install -y nodejs` |

Kurulduğunu kontrol etmek için yeni bir terminal aç ve şunu yaz:

```bash
node -v   # v18 veya üstü görmelisin
```

### 2. Projeyi indir

**Git ile:**

```bash
git clone https://github.com/<kullanici-adin>/instaShip.git
cd instaShip
```

**Git olmadan:** GitHub sayfasında **Code → Download ZIP** ile indir ve bir klasöre çıkart.

### 3. Paketleri yükle (ilk seferde bir kere)

Proje klasöründe terminal açıp:

```bash
npm install
```

> Aşağıdaki başlatma dosyaları `node_modules` klasörü yoksa bu adımı kendileri de yapar.

## Çalıştırma

| Sistem | En kolay yol |
|---|---|
| **Windows** | `Baslat.bat` dosyasına çift tıkla. |
| **macOS** | `Baslat.command` dosyasına çift tıkla. |
| **Linux** | Terminalde proje klasöründe `./baslat.sh` |
| **Hepsi (terminalden)** | `npm run dev` |

Uygulama tarayıcıda kendiliğinden açılır (açılmazsa terminalde yazan `http://localhost:5173` adresine git). Kapatmak için terminal penceresini kapat ya da `Ctrl + C`'ye bas.

### Sık karşılaşılan sorunlar

- **macOS: "Baslat.command açılamıyor, geliştirici doğrulanamadı"** → Dosyaya sağ tıkla → **Aç** → tekrar **Aç**. Sadece ilk seferde gerekir. ZIP ile indirdiysen ve "izin yok" hatası alırsan terminalde proje klasöründe `chmod +x Baslat.command` çalıştır.
- **Linux: "Permission denied"** → `chmod +x baslat.sh`
- **Windows: "npm tanınmıyor" / "Node.js bulunamadı"** → Node.js kurulumundan sonra bilgisayarı yeniden başlat ya da açık terminalleri kapatıp yeniden aç.
- **Windows: PowerShell'de "running scripts is disabled"** → `Baslat.bat` kullan ya da komutları **Komut İstemi**'nde (cmd) çalıştır.
- **Port meşgul** → Uygulama başka bir port seçer; terminalde yazan adresi kullan.
- **Paketlerde garip hata** → `node_modules` klasörünü silip `npm install`'u tekrar çalıştır.

## Kullanım

1. **Fotoğraf:** Sürükle-bırak, tıklayıp seç ya da kopyalayıp yapıştır (Mac'te ⌘V, Windows/Linux'ta Ctrl+V). Kaydırıcılarla kadrajı ayarla.
2. **Şablon ve boyut:** Son Dakika / Bülten / Model Tanıtım · Dikey post, kare post veya story.
3. **Haber:** Başlıkta `*yıldız*` arasına aldığın kelimeler vurgu renginde çıkar. Boş bıraktığın alanlar posttan kaybolur. Etiket (Instagram) ve rozetin (YouTube) yanındaki **Göster** kutucuğuyla yazıyı silmeden gizleyebilirsin.
4. **Yazı konumu (sağ panel):** Önizlemede yazıyı fareyle sürükle ya da Yatay/Dikey kaydırıcılarını kullan. Konum her şablon ve boyut için ayrı kaydedilir.
4. **Tasarım (sağ panel):** Renk, font, başlık boyutu ve karartma. Her şablonun ayarları ayrı ayrı otomatik kaydedilir.
5. **PNG indir:** Tam boyutta (Instagram 1080 px, YouTube 1280×720 veya Shorts 1080×1920) dosya iner.

### YouTube kapakları
Sol üstteki **YouTube** sekmesine geç. Boyut olarak yatay kapak (1280×720) veya dikey Shorts (1080×1920) seçebilirsin. İki şablon var:
- **Sadece Yazı:** fotoğrafsız; `*yıldız*` arasındaki kelimeler renkli kutuda çıkar.
- **Resim + Yazı:** tam ekran fotoğraf, gölgeli başlık (yatayda solda, dikeyde altta).

Kapak yazısı ve rozet Instagram başlığından ayrı tutulur, birini değiştirmek diğerini bozmaz.

## Şablonları kendin düzenlemek

Her şablon `src/templates/` altındaki kendi klasöründe:

```
src/templates/
├── base.css              ← tüm şablonlarda ortak kurallar
├── index.js              ← şablon listesi ve varsayılan renkleri/fontları
├── son-dakika/
│   ├── template.html     ← yapı
│   └── style.css         ← görünüm
├── bulten/
├── model-tanitim/
├── yt-yazi/              ← YouTube · Sadece yazı
└── yt-resim/             ← YouTube · Resim + yazı
```

`npm run dev` açıkken bir dosyayı kaydettiğin anda önizleme güncellenir.

**template.html içinde:**
- `data-field="title"` gibi işaretli elemanlar formdaki alanlarla doldurulur. Kullanılabilen alanlar: `tag, title, thumbTitle, badge, summary, date, source, cta, handle`, ayrıca `photo` ve `logo` (img etiketi).
- Formda yalnızca şablonda kullandığın alanlar görünür.
- Fotoğraf için `<div class="photo"><img data-field="photo"></div>` kalıbını kullan.
- Taşınabilir yazı bloğu için ilgili kutuya `data-move` ekle. "Yazı konumu" ayarı ve sürükleme bu kutuyu kaydırır.
- **Çoğaltılabilen liste (teknik özellikler):** `data-list="specs"` olan kutunun içindeki `<template>` her özellik satırı için bir kez kopyalanır. Kopyanın içinde `data-item="label"` ve `data-item="value"` kullanılır. Bu yapıyı başka bir şablona da koyabilirsin; formda "+ Özellik ekle" kendiliğinden çıkar. Kutuya özellik sayısı `data-count="5"` ve `var(--count)` olarak gelir, CSS'te sayıya göre düzen kurabilirsin. En fazla kaç özellik eklenebileceği `config.js` içindeki `specs.max` ayarında (şu an 9).

**style.css içinde** sağ paneldeki ayarlara bağlı CSS değişkenleri:

| Değişken | Ayar |
|---|---|
| `var(--accent)` | Vurgu rengi |
| `var(--on-accent)` | Vurgu rengi üstündeki yazı (otomatik siyah/beyaz) |
| `var(--bg)` | Arka plan |
| `var(--text)` | Yazı rengi |
| `var(--font-head)` / `var(--font-body)` | Başlık / metin fontu |
| `var(--title-scale)` | Başlık boyutu çarpanı |
| `var(--overlay)` | Karartma / efekt yoğunluğu (0–1) |

Boyuta özel ayar için `.tpl-son-dakika.size-square`, `.size-story` veya YouTube'da `.size-shorts` kullan.

### Yeni şablon eklemek
1. Bir klasörü kopyala, örneğin `son-dakika` → `yaris-sonucu`.
2. `style.css` içindeki `.tpl-son-dakika` ifadelerini `.tpl-yaris-sonucu` yap.
3. `src/templates/index.js` dosyasında import edip listeye ekle (`id: 'yaris-sonucu'`, `group: 'instagram'` ya da `'youtube'`).

### Başka ayarlar (`src/config.js`)
- Form alanlarının etiketleri ve varsayılan metinleri (`FIELDS`), örneğin hesap adın
- Hazır renk paletleri (`PALETTES`)
- Post boyutları (`SIZES`)
- Font listesi (`FONTS`). Yeni font için: `npm i @fontsource/<font-adi>`, `src/fonts.js` içinde import et, sonra `FONTS`'a ekle.

## Notlar
- En iyi sonuç için Chrome kullan.
- iPhone'un HEIC fotoğrafları tarayıcıda açılmaz. JPG olarak dışa aktar ya da iPhone ayarlarında Kamera > Formatlar > "En Uyumlu"yu seç.
- Ayarlar tarayıcıda saklanır. Fotoğraf saklanmaz, her post için yeniden yüklenir.
