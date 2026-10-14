// Uygulamanın ayarları. Buradaki her şeyi değiştirebilirsin.

// Üstteki sekmeler. Her şablon ve boyut bir gruba aittir (group: 'instagram' | 'youtube').
export const GROUPS = {
  instagram: { label: 'Instagram', fieldsTitle: 'Haber' },
  youtube: { label: 'YouTube', fieldsTitle: 'Kapak yazısı' },
};

export const SIZES = {
  portrait: { label: 'Dikey post · 1080×1350', w: 1080, h: 1350, group: 'instagram' },
  square: { label: 'Kare post · 1080×1080', w: 1080, h: 1080, group: 'instagram' },
  story: { label: 'Story · 1080×1920', w: 1080, h: 1920, group: 'instagram' },
  youtube: { label: 'YouTube kapak · 1280×720', w: 1280, h: 720, group: 'youtube' },
  shorts: { label: 'Shorts / dikey · 1080×1920', w: 1080, h: 1920, group: 'youtube' },
};

// fonts.js içinde yüklü olan fontlar
export const FONTS = ['Oswald', 'Barlow Condensed', 'Anton', 'Bebas Neue', 'Inter'];

// Şablon HTML'inde data-field="..." ile kullanılan alanlar.
// Formda yalnızca seçili şablonun kullandığı alanlar görünür.
const today = () =>
  new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export const FIELDS = {
  // toggle: true → alanın yanında göster/gizle kutucuğu çıkar
  tag: { label: 'Etiket', default: 'Son Dakika', toggle: true },
  title: {
    label: 'Başlık',
    type: 'textarea',
    rows: 3,
    default: 'Yeni modeller\n*resmen tanıtıldı*',
    hint: '*yıldız* arasındaki kelimeler vurgu renginde yazılır. Enter ile alt satıra geçebilirsin.',
  },
  // YouTube kapakları için ayrı yazılar (Instagram başlığını bozmasın diye)
  thumbTitle: {
    label: 'Kapak yazısı',
    type: 'textarea',
    rows: 3,
    default: 'Bu motor\n*her şeyi değiştirdi*',
    hint: 'Kısa tut: 2-5 kelime en iyi okunur. *yıldız* arasındakiler vurgulanır.',
  },
  badge: { label: 'Rozet', default: 'Yeni', toggle: true, hint: 'Başlığın üstündeki küçük etiket. Kutucuğu kaldırırsan görünmez.' },
  summary: {
    label: 'Özet',
    type: 'textarea',
    rows: 3,
    default: 'Üretici, yeni sezon için motor, elektronik ve tasarım tarafındaki tüm yenilikleri açıkladı.',
  },
  // Liste alanı: şablonda data-list="specs" ile kullanılır, satır ekleyip çıkarabilirsin
  specs: {
    label: 'Teknik özellikler',
    type: 'list',
    max: 9,
    addLabel: '+ Özellik ekle',
    columns: [
      { key: 'label', placeholder: 'Özellik (ör. Tork)' },
      { key: 'value', placeholder: 'Değer (ör. 93 Nm)' },
    ],
    default: () => [
      { label: 'Motor', value: '890 cc' },
      { label: 'Güç', value: '119 HP' },
      { label: 'Tork', value: '93 Nm' },
      { label: 'Ağırlık', value: '195 kg' },
    ],
  },
  date: { label: 'Tarih', half: true, default: today, persist: false },
  source: { label: 'Kaynak', half: true, default: '' },
  cta: { label: 'Alt çağrı', default: 'Detaylar için kaydır →' },
  handle: { label: 'Hesap adı', default: '@motohaber' },
};

// Sağ paneldeki tasarım kontrolleri. Her biri şablona CSS değişkeni olarak gider:
// accent → --accent, bg → --bg, text → --text, fontHead → --font-head,
// fontBody → --font-body, titleScale → --title-scale, overlay → --overlay
export const STYLE_CONTROLS = [
  { key: 'accent', label: 'Vurgu rengi', type: 'color' },
  { key: 'bg', label: 'Arka plan', type: 'color' },
  { key: 'text', label: 'Yazı rengi', type: 'color' },
  { key: 'fontHead', label: 'Başlık fontu', type: 'font' },
  { key: 'fontBody', label: 'Metin fontu', type: 'font' },
  { key: 'titleScale', label: 'Başlık boyutu', type: 'range', min: 0.6, max: 1.4, step: 0.02, pct: true },
  { key: 'overlay', label: 'Karartma / efekt', type: 'range', min: 0, max: 1, step: 0.05, pct: true },
];

export const PALETTES = [
  { name: 'Yarış kırmızısı', accent: '#e10600', bg: '#0a0a0b', text: '#ffffff' },
  { name: 'Turuncu', accent: '#ff6a00', bg: '#111214', text: '#f5f5f5' },
  { name: 'Sarı', accent: '#f5c400', bg: '#0e0f12', text: '#ffffff' },
  { name: 'Yeşil', accent: '#3ddc84', bg: '#0b1410', text: '#f0fff6' },
  { name: 'Mavi', accent: '#1e6bff', bg: '#0a0f1c', text: '#ffffff' },
  { name: 'Açık', accent: '#e10600', bg: '#f4f1ec', text: '#141414' },
];
