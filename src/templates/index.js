// Şablon listesi. Yeni şablon eklemek için:
// 1) Bir klasörü kopyala (ör. son-dakika → benim-sablonum)
// 2) template.html ve style.css'i düzenle (CSS sınıfı: .tpl-benim-sablonum)
// 3) Aşağıya import edip listeye ekle.
import './base.css';

import sonDakikaHtml from './son-dakika/template.html?raw';
import './son-dakika/style.css';
import bultenHtml from './bulten/template.html?raw';
import './bulten/style.css';
import modelHtml from './model-tanitim/template.html?raw';
import './model-tanitim/style.css';
import ytYaziHtml from './yt-yazi/template.html?raw';
import './yt-yazi/style.css';
import ytResimHtml from './yt-resim/template.html?raw';
import './yt-resim/style.css';

export const templates = [
  {
    id: 'son-dakika',
    group: 'instagram',
    name: 'Son Dakika',
    description: 'Tam ekran fotoğraf, büyük başlık',
    html: sonDakikaHtml,
    style: {
      accent: '#e10600',
      bg: '#0a0a0b',
      text: '#ffffff',
      fontHead: 'Oswald',
      fontBody: 'Inter',
      titleScale: 1,
      overlay: 0.9,
    },
  },
  {
    id: 'bulten',
    group: 'instagram',
    name: 'Bülten',
    description: 'Üstte fotoğraf, altta haber metni',
    html: bultenHtml,
    style: {
      accent: '#ff6a00',
      bg: '#111214',
      text: '#f5f5f5',
      fontHead: 'Barlow Condensed',
      fontBody: 'Inter',
      titleScale: 1,
      overlay: 0.4,
    },
  },
  {
    id: 'model-tanitim',
    group: 'instagram',
    name: 'Model Tanıtım',
    description: 'Yeni model ve teknik özellikler',
    html: modelHtml,
    style: {
      accent: '#f5c400',
      bg: '#0e0f12',
      text: '#ffffff',
      fontHead: 'Anton',
      fontBody: 'Inter',
      titleScale: 1,
      overlay: 0.6,
    },
  },

  // ---------- YouTube kapakları ----------
  {
    id: 'yt-yazi',
    group: 'youtube',
    name: 'Sadece Yazı',
    description: 'Düz arka plan, dev başlık',
    html: ytYaziHtml,
    style: {
      accent: '#f5c400',
      bg: '#0e0f12',
      text: '#ffffff',
      fontHead: 'Anton',
      fontBody: 'Inter',
      titleScale: 1,
      overlay: 0.7,
    },
  },
  {
    id: 'yt-resim',
    group: 'youtube',
    name: 'Resim + Yazı',
    description: 'Tam ekran fotoğraf, gölgeli başlık',
    html: ytResimHtml,
    style: {
      accent: '#e10600',
      bg: '#0a0a0b',
      text: '#ffffff',
      fontHead: 'Anton',
      fontBody: 'Inter',
      titleScale: 1,
      overlay: 0.85,
    },
  },
];
