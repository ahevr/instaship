import { toPng } from 'html-to-image';
import './fonts.js';
import './style.css';
import { templates } from './templates/index.js';
import { FIELDS, SIZES, FONTS, STYLE_CONTROLS, PALETTES, GROUPS } from './config.js';

const STORAGE_KEY = 'instaship:v1';
const $ = (sel) => document.querySelector(sel);
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// ---------- Durum ----------

const fieldDefault = (f) => (typeof f.default === 'function' ? f.default() : f.default ?? '');
const defaultValues = () =>
  Object.fromEntries(Object.entries(FIELDS).map(([k, f]) => [k, fieldDefault(f)]));

function loadState() {
  const base = { templateId: templates[0].id, sizeId: 'portrait', values: defaultValues(), styles: {}, logo: null, lastByGroup: {}, hidden: {}, textPos: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      const values = { ...base.values, ...saved.values };
      // Eski sürümdeki 3 sabit özellik alanını yeni listeye taşı
      if (!saved.values?.specs && saved.values?.spec1Label !== undefined) {
        values.specs = [1, 2, 3].map((i) => ({ label: values[`spec${i}Label`] ?? '', value: values[`spec${i}Value`] ?? '' }));
      }
      // Tarih gibi alanlar her açılışta güncel değerle başlar
      for (const [k, f] of Object.entries(FIELDS)) if (f.persist === false) values[k] = fieldDefault(f);
      return { ...base, ...saved, values, styles: saved.styles || {}, lastByGroup: saved.lastByGroup || {}, hidden: saved.hidden || {}, textPos: saved.textPos || {} };
    }
  } catch {}
  return base;
}

const state = loadState();
let photo = null; // fotoğraf kaydedilmez, sadece bu oturumda tutulur
const photoPos = { x: 50, y: 50, zoom: 1 };

let saveTimer;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Ayarlar kaydedilemedi', e);
    }
  }, 250);
}

const tplById = (id) => templates.find((t) => t.id === id) || templates[0];
const currentTemplate = () => tplById(state.templateId);
const styleFor = (tpl) => ({ ...tpl.style, ...state.styles[tpl.id] });
// Yazı konumu her şablon + boyut için ayrı tutulur (yatay ve dikeyde düzen farklı)
const posKey = (tpl) => `${tpl.id}:${state.sizeId}`;
const textPosFor = (tpl) => state.textPos[posKey(tpl)] || { x: 0, y: 0 };
const groupOf = (tpl) => tpl.group || 'instagram';
const currentGroup = () => groupOf(currentTemplate());
const templatesIn = (group) => templates.filter((t) => groupOf(t) === group);
const sizesIn = (group) => Object.keys(SIZES).filter((id) => (SIZES[id].group || 'instagram') === group);

// Seçili boyut şablonun grubuna uymuyorsa (ör. YouTube'a geçince) o grubun boyutuna geç
function syncSize() {
  const sizes = sizesIn(currentGroup());
  if (!sizes.includes(state.sizeId)) state.sizeId = state.lastByGroup[currentGroup()]?.sizeId ?? sizes[0];
}
function rememberGroup() {
  state.lastByGroup[currentGroup()] = { templateId: state.templateId, sizeId: state.sizeId };
}
syncSize();

// ---------- Şablonu doldurma ----------

const PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3a3d44"/><stop offset="1" stop-color="#16171a"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#g)"/>
    <text x="600" y="460" fill="#8a8f99" font-family="sans-serif" font-size="44" font-weight="700"
      text-anchor="middle" letter-spacing="6">FOTOĞRAF YÜKLE</text></svg>`);

// Kutucuğu kaldırılmış alanlar boş sayılır, böylece posttan kaybolur
const fieldValue = (key) => (state.hidden[key] ? '' : (state.values[key] ?? '').trim());

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const richText = (s) => escapeHtml(s).replace(/\*([^*]+)\*/g, '<span class="hl">$1</span>');

function onAccentColor(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? '#111111' : '#ffffff';
}

function renderPost(node, tpl) {
  const size = SIZES[state.sizeId];
  const s = styleFor(tpl);
  node.className = `post tpl-${tpl.id} size-${state.sizeId}`;
  node.lang = 'tr'; // büyük harfte i → İ doğru çevrilsin
  node.style.width = `${size.w}px`;
  node.style.height = `${size.h}px`;
  const vars = {
    '--accent': s.accent,
    '--on-accent': onAccentColor(s.accent),
    '--bg': s.bg,
    '--text': s.text,
    '--font-head': `'${s.fontHead}', sans-serif`,
    '--font-body': `'${s.fontBody}', sans-serif`,
    '--title-scale': s.titleScale,
    '--overlay': s.overlay,
    '--photo-x': `${photoPos.x}%`,
    '--photo-y': `${photoPos.y}%`,
    '--photo-zoom': photoPos.zoom,
    '--text-x': `${textPosFor(tpl).x}px`,
    '--text-y': `${textPosFor(tpl).y}px`,
  };
  for (const [k, v] of Object.entries(vars)) node.style.setProperty(k, v);

  node.innerHTML = tpl.html;
  for (const el of node.querySelectorAll('[data-field]')) {
    const key = el.dataset.field;
    if (key === 'photo') {
      el.src = photo || PLACEHOLDER;
    } else if (key === 'logo') {
      // Boş src'li img PNG oluşturmayı bozduğu için logo yoksa tamamen kaldırılır
      if (state.logo) el.src = state.logo;
      else el.remove();
    } else {
      const value = fieldValue(key);
      el.innerHTML = richText(value);
      if (!value) el.dataset.empty = '';
    }
  }
  // Liste alanları: <template> içindeki eleman her satır için kopyalanır
  for (const el of node.querySelectorAll('[data-list]')) {
    const tplEl = el.querySelector('template');
    const items = (state.values[el.dataset.list] || []).filter((item) =>
      Object.values(item).some((v) => v.trim()),
    );
    tplEl.remove();
    for (const item of items) {
      const clone = tplEl.content.cloneNode(true);
      for (const part of clone.querySelectorAll('[data-item]')) {
        const value = (item[part.dataset.item] ?? '').trim();
        part.innerHTML = richText(value);
        if (!value) part.dataset.empty = '';
      }
      el.append(clone);
    }
    el.dataset.count = items.length; // CSS'te sayıya göre düzen için: [data-count="5"]
    el.style.setProperty('--count', items.length);
    if (!items.length) el.dataset.empty = '';
  }
  for (const el of node.querySelectorAll('[data-hide-if-empty]')) {
    if (!fieldValue(el.dataset.hideIfEmpty)) el.dataset.empty = '';
  }
}

// ---------- Önizleme ----------

const THUMB_W = 96;

function renderPreview() {
  renderPost($('#post'), currentTemplate());
  fitStage();
  syncTextPosControls();
  for (const thumb of document.querySelectorAll('.thumb')) {
    const size = SIZES[state.sizeId];
    const scale = THUMB_W / size.w;
    thumb.style.height = `${size.h * scale}px`;
    const inner = thumb.firstElementChild;
    renderPost(inner, tplById(thumb.dataset.id));
    inner.style.transform = `scale(${scale})`;
  }
}

function fitStage() {
  const size = SIZES[state.sizeId];
  const stage = $('#stage');
  const pad = 40;
  const scale = Math.min((stage.clientWidth - pad * 2) / size.w, (stage.clientHeight - pad * 2) / size.h);
  $('#stageInner').style.width = `${size.w * scale}px`;
  $('#stageInner').style.height = `${size.h * scale}px`;
  $('#post').style.transform = `scale(${scale})`;
  stageScale = scale;
}
let stageScale = 1;
new ResizeObserver(fitStage).observe($('#stage'));

// ---------- Sol panel ----------

function buildGroupTabs() {
  const tabs = $('#groupTabs');
  tabs.innerHTML = '';
  for (const [id, g] of Object.entries(GROUPS)) {
    const btn = Object.assign(document.createElement('button'), { textContent: g.label });
    if (id === currentGroup()) btn.className = 'active';
    btn.addEventListener('click', () => {
      if (id === currentGroup()) return;
      rememberGroup();
      const last = state.lastByGroup[id];
      state.templateId = templatesIn(id).some((t) => t.id === last?.templateId) ? last.templateId : templatesIn(id)[0].id;
      syncSize();
      save();
      buildAll();
    });
    tabs.append(btn);
  }
}

function buildTemplateList() {
  const list = $('#templateList');
  list.innerHTML = '';
  for (const t of templatesIn(currentGroup())) {
    const btn = document.createElement('button');
    btn.className = 'tpl-btn' + (t.id === state.templateId ? ' active' : '');
    btn.innerHTML = `<div class="thumb" data-id="${t.id}"><div></div></div>
      <div><strong>${t.name}</strong><span>${t.description}</span></div>`;
    btn.addEventListener('click', () => {
      state.templateId = t.id;
      rememberGroup();
      save();
      buildAll();
    });
    list.append(btn);
  }
}

function buildSizeSelect() {
  const sel = $('#sizeSelect');
  sel.innerHTML = sizesIn(currentGroup())
    .map((id) => `<option value="${id}">${SIZES[id].label}</option>`)
    .join('');
  sel.value = state.sizeId;
  sel.disabled = sel.options.length < 2;
}
$('#sizeSelect').addEventListener('change', (e) => {
  state.sizeId = e.target.value;
  save();
  renderPreview();
});

function fieldsIn(tpl) {
  const used = new Set([...tpl.html.matchAll(/data-(?:field|list)="([^"]+)"/g)].map((m) => m[1]));
  return Object.keys(FIELDS).filter((k) => used.has(k));
}

function buildFieldForm() {
  const form = $('#fieldForm');
  form.innerHTML = '';
  const fields = fieldsIn(currentTemplate());
  // Fotoğrafsız şablonda fotoğraf bölümü gizlenir
  $('#photoSection').hidden = !/data-field="photo"/.test(currentTemplate().html);
  const n = $('#photoSection').hidden ? 2 : 3;
  $('#fieldsTitle').textContent = `${n} · ${GROUPS[currentGroup()].fieldsTitle}`;
  $('#templateList').closest('section').querySelector('h2').textContent = `${n - 1} · Şablon`;
  for (const key of fields) {
    const f = FIELDS[key];
    if (f.type === 'list') {
      form.append(buildListField(key, f));
      continue;
    }
    // Kutucuklu alanda dış kap label olamaz (iç içe label), div kullanılır
    const wrap = document.createElement(f.toggle ? 'div' : 'label');
    wrap.className = 'field' + (f.half ? ' half' : '');
    wrap.innerHTML = `<span>${f.label}</span>`;
    const input = document.createElement(f.type === 'textarea' ? 'textarea' : 'input');
    if (f.rows) input.rows = f.rows;
    input.value = state.values[key] ?? '';
    if (f.toggle) {
      const toggle = document.createElement('label');
      toggle.className = 'toggle';
      toggle.innerHTML = `<input type="checkbox" ${state.hidden[key] ? '' : 'checked'} /> Göster`;
      toggle.firstElementChild.addEventListener('change', (e) => {
        state.hidden[key] = !e.target.checked;
        input.disabled = state.hidden[key];
        save();
        renderPreview();
      });
      input.disabled = !!state.hidden[key];
      wrap.querySelector('span').append(toggle);
    }
    input.addEventListener('input', () => {
      state.values[key] = input.value;
      save();
      renderPreview();
    });
    wrap.append(input);
    if (f.hint) wrap.insertAdjacentHTML('beforeend', `<small class="hint">${f.hint}</small>`);
    form.append(wrap);
  }
}

function buildListField(key, f) {
  const wrap = document.createElement('div');
  wrap.className = 'field list-field';
  const items = (state.values[key] ??= []);
  const changed = () => {
    save();
    renderPreview();
  };
  const rebuild = () => {
    const fresh = buildListField(key, f);
    wrap.replaceWith(fresh);
    return fresh;
  };

  wrap.innerHTML = `<span>${f.label} <output>${items.length}${f.max ? ' / ' + f.max : ''}</output></span>`;
  items.forEach((item, i) => {
    const row = document.createElement('div');
    row.className = 'list-row';
    for (const col of f.columns) {
      const input = Object.assign(document.createElement('input'), {
        value: item[col.key] ?? '',
        placeholder: col.placeholder ?? '',
      });
      input.addEventListener('input', () => {
        item[col.key] = input.value;
        changed();
      });
      row.append(input);
    }
    const up = Object.assign(document.createElement('button'), { className: 'icon', textContent: '↑', title: 'Yukarı taşı' });
    up.disabled = i === 0;
    up.addEventListener('click', () => {
      [items[i - 1], items[i]] = [items[i], items[i - 1]];
      changed();
      rebuild();
    });
    const del = Object.assign(document.createElement('button'), { className: 'icon', textContent: '×', title: 'Sil' });
    del.addEventListener('click', () => {
      items.splice(i, 1);
      changed();
      rebuild();
    });
    row.append(up, del);
    wrap.append(row);
  });

  const add = Object.assign(document.createElement('button'), { className: 'ghost add', textContent: f.addLabel || '+ Ekle' });
  add.disabled = f.max && items.length >= f.max;
  add.addEventListener('click', () => {
    items.push(Object.fromEntries(f.columns.map((c) => [c.key, ''])));
    changed();
    rebuild().querySelector('.list-row:last-of-type input')?.focus(); // yeni satıra odaklan
  });
  wrap.append(add);
  return wrap;
}

// ---------- Sağ panel: tasarım ----------

function setStyle(patch) {
  state.styles[state.templateId] = { ...state.styles[state.templateId], ...patch };
  save();
  renderPreview();
}

function buildStyleForm() {
  const tpl = currentTemplate();
  const s = styleFor(tpl);
  const form = $('#styleForm');
  $('#styleFor').textContent = tpl.name;
  form.innerHTML = '';

  const palettes = document.createElement('div');
  palettes.className = 'palettes';
  for (const p of PALETTES) {
    const b = document.createElement('button');
    b.className = 'swatch';
    b.title = p.name;
    b.style.background = `linear-gradient(135deg, ${p.bg} 0 55%, ${p.accent} 55%)`;
    b.style.borderColor = p.text === '#141414' ? '#ccc' : 'transparent';
    b.addEventListener('click', () => {
      setStyle({ accent: p.accent, bg: p.bg, text: p.text });
      buildStyleForm();
    });
    palettes.append(b);
  }
  form.append(Object.assign(document.createElement('span'), { className: 'label', textContent: 'Hazır paletler' }), palettes);

  for (const c of STYLE_CONTROLS) {
    const wrap = document.createElement('label');
    wrap.className = 'field';
    wrap.innerHTML = `<span>${c.label}</span>`;

    if (c.type === 'color') {
      const row = document.createElement('div');
      row.className = 'color-row';
      const picker = Object.assign(document.createElement('input'), { type: 'color', value: s[c.key] });
      const hex = Object.assign(document.createElement('input'), { type: 'text', value: s[c.key], spellcheck: false });
      picker.addEventListener('input', () => {
        hex.value = picker.value;
        setStyle({ [c.key]: picker.value });
      });
      hex.addEventListener('input', () => {
        if (/^#[0-9a-f]{6}$/i.test(hex.value)) {
          picker.value = hex.value;
          setStyle({ [c.key]: hex.value.toLowerCase() });
        }
      });
      row.append(picker, hex);
      wrap.append(row);
    } else if (c.type === 'font') {
      const sel = document.createElement('select');
      sel.innerHTML = FONTS.map((f) => `<option style="font-family:'${f}'">${f}</option>`).join('');
      sel.value = s[c.key];
      sel.addEventListener('change', () => setStyle({ [c.key]: sel.value }));
      wrap.append(sel);
    } else if (c.type === 'range') {
      const out = document.createElement('output');
      const fmt = (v) => (c.pct ? `${Math.round(v * 100)}%` : v);
      out.textContent = fmt(s[c.key]);
      wrap.querySelector('span').append(out);
      const range = Object.assign(document.createElement('input'), {
        type: 'range', min: c.min, max: c.max, step: c.step, value: s[c.key],
      });
      range.addEventListener('input', () => {
        out.textContent = fmt(range.value);
        setStyle({ [c.key]: Number(range.value) });
      });
      wrap.append(range);
    }
    form.append(wrap);
  }
}

$('#resetStyle').addEventListener('click', () => {
  delete state.styles[state.templateId];
  save();
  buildStyleForm();
  renderPreview();
});

// ---------- Yazı konumu ----------

function setTextPos(pos, { rerender = true } = {}) {
  const tpl = currentTemplate();
  if (pos.x === 0 && pos.y === 0) delete state.textPos[posKey(tpl)];
  else state.textPos[posKey(tpl)] = pos;
  save();
  if (rerender) renderPreview();
}

function syncTextPosControls() {
  const movable = /data-move/.test(currentTemplate().html);
  $('#textPosSection').hidden = !movable;
  if (!movable) return;
  const size = SIZES[state.sizeId];
  const pos = textPosFor(currentTemplate());
  Object.assign($('#textX'), { min: -size.w / 2, max: size.w / 2, value: pos.x });
  Object.assign($('#textY'), { min: -size.h / 2, max: size.h / 2, value: pos.y });
}

$('#textX').addEventListener('input', (e) => setTextPos({ ...textPosFor(currentTemplate()), x: Number(e.target.value) }));
$('#textY').addEventListener('input', (e) => setTextPos({ ...textPosFor(currentTemplate()), y: Number(e.target.value) }));
$('#resetTextPos').addEventListener('click', () => setTextPos({ x: 0, y: 0 }));

// Önizlemede sürükleme. Sürüklerken sadece CSS değişkeni güncellenir (yeniden çizim yok),
// bırakınca küçük önizlemeler de yenilenir.
$('#post').addEventListener('pointerdown', (e) => {
  if (!e.target.closest('[data-move]') || e.button !== 0) return;
  e.preventDefault();
  const post = $('#post');
  const start = { ...textPosFor(currentTemplate()), px: e.clientX, py: e.clientY };
  let pos = start;
  document.body.classList.add('moving-text');
  const move = (ev) => {
    pos = {
      x: Math.round(start.x + (ev.clientX - start.px) / stageScale),
      y: Math.round(start.y + (ev.clientY - start.py) / stageScale),
    };
    post.style.setProperty('--text-x', `${pos.x}px`);
    post.style.setProperty('--text-y', `${pos.y}px`);
    $('#textX').value = pos.x;
    $('#textY').value = pos.y;
  };
  const up = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    document.body.classList.remove('moving-text');
    setTextPos({ x: pos.x, y: pos.y });
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
});

// ---------- Fotoğraf ve logo ----------

function readFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Telefon fotoğrafları çok büyük olabilir; uygulamayı hızlı tutmak için küçültülür
async function downscale(dataUrl, max = 2400, type = 'image/jpeg') {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const ratio = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  if (ratio === 1) return dataUrl;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * ratio);
  canvas.height = Math.round(img.naturalHeight * ratio);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(type, 0.92);
}

async function setPhoto(file) {
  if (!file || !file.type.startsWith('image/')) return;
  try {
    photo = await downscale(await readFile(file));
  } catch {
    alert('Bu fotoğraf açılamadı. HEIC ise JPG/PNG olarak dışa aktarıp tekrar dene.');
    return;
  }
  Object.assign(photoPos, { x: 50, y: 50, zoom: 1 });
  syncPhotoControls();
  const drop = $('#drop');
  drop.classList.add('has-photo');
  drop.style.backgroundImage = `url(${photo})`;
  renderPreview();
}

function syncPhotoControls() {
  $('#photoX').value = photoPos.x;
  $('#photoY').value = photoPos.y;
  $('#photoZoom').value = photoPos.zoom;
}

for (const [id, key] of [['#photoX', 'x'], ['#photoY', 'y'], ['#photoZoom', 'zoom']]) {
  $(id).addEventListener('input', (e) => {
    photoPos[key] = Number(e.target.value);
    renderPreview();
  });
}

$('#photoInput').addEventListener('change', (e) => setPhoto(e.target.files[0]));

window.addEventListener('dragover', (e) => {
  e.preventDefault();
  document.body.classList.add('dragging');
});
window.addEventListener('dragleave', (e) => {
  if (!e.relatedTarget) document.body.classList.remove('dragging');
});
window.addEventListener('drop', (e) => {
  e.preventDefault();
  document.body.classList.remove('dragging');
  setPhoto(e.dataTransfer.files[0]);
});
window.addEventListener('paste', (e) => {
  const item = [...e.clipboardData.items].find((i) => i.type.startsWith('image/'));
  if (item) setPhoto(item.getAsFile());
});

$('#logoInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  state.logo = await downscale(await readFile(file), 600, 'image/png').catch(() => null); // PNG: şeffaflık korunur
  e.target.value = '';
  save();
  renderPreview();
});
$('#removeLogo').addEventListener('click', () => {
  state.logo = null;
  save();
  renderPreview();
});

// ---------- Dışa aktarma ----------

const slug = (s) =>
  s.toLocaleLowerCase('tr-TR')
    .replace(/\*/g, '')
    .replace(/[çğıöşü]/g, (c) => ({ ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' })[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

async function exportTemplate(tpl) {
  const size = SIZES[state.sizeId];
  const holder = document.createElement('div');
  holder.className = 'export-holder';
  const node = document.createElement('div');
  holder.append(node);
  document.body.append(holder);
  renderPost(node, tpl);
  try {
    await document.fonts.ready;
    await Promise.all([...node.querySelectorAll('img[src]')].map((i) => i.decode().catch(() => {})));
    const opts = { width: size.w, height: size.h, pixelRatio: 1 };
    if (isSafari) await toPng(node, opts); // Safari ilk denemede görselleri atlayabiliyor
    const url = await toPng(node, opts);
    const a = document.createElement('a');
    a.href = url;
    const titleKey = fieldsIn(tpl).includes('thumbTitle') ? 'thumbTitle' : 'title';
    a.download = `${tpl.id}-${slug(state.values[titleKey] || 'post') || 'post'}.png`;
    a.click();
  } finally {
    holder.remove();
  }
}

async function withBusy(btn, fn) {
  const label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'Hazırlanıyor…';
  try {
    await fn();
  } catch (e) {
    console.error('PNG hatası', e?.message || e?.type || e);
    alert('PNG oluşturulamadı: ' + (e?.message || 'görsel yüklenemedi'));
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
}

$('#downloadBtn').addEventListener('click', (e) => withBusy(e.currentTarget, () => exportTemplate(currentTemplate())));
$('#downloadAll').addEventListener('click', (e) =>
  withBusy(e.currentTarget, async () => {
    for (const t of templatesIn(currentGroup())) {
      await exportTemplate(t);
      await new Promise((r) => setTimeout(r, 400));
    }
  }),
);

// ---------- Başlat ----------

function buildAll() {
  buildGroupTabs();
  buildTemplateList();
  buildSizeSelect();
  buildFieldForm();
  buildStyleForm();
  renderPreview();
}

syncPhotoControls();
buildAll();
document.fonts.ready.then(renderPreview);
