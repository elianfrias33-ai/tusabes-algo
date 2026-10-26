import './styles.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import manifest from './image-manifest.json';
import { BUSINESS, FLOWS, LOOKS, waLink, money, flowCode, shortDate, flowAvailable } from './data.js';

gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
ScrollTrigger.config({ ignoreMobileResize: true });
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const BASE = import.meta.env.BASE_URL;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ───────── Smooth scroll ───────── */
let lenis = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
let locks = 0;
const lockScroll = (lock) => {
  locks = Math.max(0, locks + (lock ? 1 : -1));
  const on = locks > 0;
  document.documentElement.style.overflow = on ? 'hidden' : '';
  if (lenis) (on ? lenis.stop() : lenis.start());
};
function scrollToTarget(hash) {
  const target = hash === '#inicio' || hash === '#' ? 0 : $(hash);
  if (target === null) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.6, offset: target === 0 ? 0 : -10, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else if (target === 0) window.scrollTo({ top: 0 });
  else target.scrollIntoView();
}

/* ───────── Images ───────── */
function photoTag(name, { sizes = '100vw', alt = '', cls = '', lazy = true } = {}) {
  const m = manifest[name];
  if (!m) return '';
  const srcset = m.widths.map((w) => `${BASE}img/${name}-${w}.webp ${w}w`).join(', ');
  const fallback = m.widths.find((w) => w >= 800) ?? m.widths[m.widths.length - 1];
  return `<img src="${BASE}img/${name}-${fallback}.webp" srcset="${srcset}" sizes="${sizes}" width="1000" height="${Math.round((m.h / m.w) * 1000)}" alt="${escapeHtml(alt)}" class="${cls}" style="background:${m.dominant}" ${lazy ? 'loading="lazy"' : ''} decoding="async">`;
}
const photoUrl = (name, w = 480) => {
  const m = manifest[name];
  if (!m) return '';
  return `${BASE}img/${name}-${m.widths.find((x) => x >= w) ?? m.widths[m.widths.length - 1]}.webp`;
};
const flowAlt = (f) => `${flowCode(f.n)}: ${f.pieces.map((p) => p.name).join(' y ')}`;

/* ───────── Toast ───────── */
const toastEl = $('[data-toast]');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2400);
}

/* ───────── WhatsApp links ───────── */
const GREETING = 'Hola TuSabeAlgo 👋';
function wireWhatsApp(root = document) {
  $$('[data-wa-text]', root).forEach((a) => {
    a.href = waLink(a.dataset.waText);
    a.target = '_blank';
    a.rel = 'noopener';
  });
}
const sizesText = (p) => (p.sizes.length > 1 ? `Tallas ${p.sizes.join(' / ')}` : `Talla ${p.sizes[0]}`);

/* ───────── Stats ───────── */
const availablePieces = FLOWS.flatMap((f) => f.pieces.filter((p) => !p.sold));
$('[data-stat="flows"]').textContent = String(FLOWS.length).padStart(2, '0');
$('[data-stat="pieces"]').textContent = String(availablePieces.length).padStart(2, '0');
$('[data-stat="from"]').textContent = money(Math.min(...availablePieces.map((p) => p.price)));
$('[data-catalog-count]').textContent = `${FLOWS.length} flows`;

/* ───────── Catalog ───────── */
const grid = $('[data-grid]');
const indexList = $('[data-index-list]');

function pieceRow(p) {
  const meta = `${p.label} · ${sizesText(p)}`;
  const price = p.sold ? '<span class="tag tag--sold">Agotado</span>' : money(p.price);
  return `<li class="piece${p.sold ? ' is-sold' : ''}">
    <span><span class="piece__name">${escapeHtml(p.name)}</span><span class="piece__meta mono">${escapeHtml(meta)}</span></span>
    <span class="piece__price">${price}</span>
  </li>`;
}

function renderCatalog() {
  grid.innerHTML = FLOWS.map((f) => {
    const soldOut = !flowAvailable(f);
    const avail = f.pieces.filter((p) => !p.sold);
    const total = avail.length > 1 ? `<span class="card__total mono">Las ${avail.length} piezas · ${money(avail.reduce((s, p) => s + p.price, 0))}</span>` : '<span></span>';
    return `<article class="card${soldOut ? ' is-soldout' : ''}" data-flow="${f.n}" data-kinds="${f.pieces.map((p) => p.kind).join(' ')}" data-avail-kinds="${avail.map((p) => p.kind).join(' ')}">
      <button class="card__media" type="button" data-open="${f.n}" data-cursor="${soldOut ? 'Agotado' : 'Ver flow'}" aria-label="Ver ${escapeHtml(flowCode(f.n))}">
        ${photoTag(f.post, { sizes: '(max-width: 560px) 92vw, (max-width: 1100px) 46vw, 31vw', alt: flowAlt(f) })}
        ${f.model ? photoTag(f.model, { sizes: '(max-width: 560px) 92vw, (max-width: 1100px) 46vw, 31vw', alt: '', cls: 'card__alt' }) : ''}
        <span class="card__badge mono"><span>${flowCode(f.n)}</span><span>${shortDate(f.date)}</span></span>
        ${soldOut ? '<span class="card__stamp">Agotado</span>' : ''}
      </button>
      <div class="card__body">
        <ul class="card__pieces">${f.pieces.map(pieceRow).join('')}</ul>
        <div class="card__foot">${total}<button class="card__open" type="button" data-open="${f.n}">${soldOut ? 'Ver flow' : 'Escoger talla'} →</button></div>
      </div>
    </article>`;
  }).join('');

  indexList.innerHTML = FLOWS.map((f) => {
    const soldOut = !flowAvailable(f);
    const names = f.pieces.map((p) => (p.sold ? `<s>${escapeHtml(p.name)}</s>` : escapeHtml(p.name))).join(' + ');
    const sizes = [...new Set(f.pieces.filter((p) => !p.sold).flatMap((p) => p.sizes))].join(' · ') || '—';
    const prices = f.pieces.filter((p) => !p.sold).map((p) => money(p.price)).join(' / ') || '—';
    return `<li class="index-item${soldOut ? ' is-soldout' : ''}" data-flow="${f.n}" data-kinds="${f.pieces.map((p) => p.kind).join(' ')}" data-avail-kinds="${f.pieces.filter((p) => !p.sold).map((p) => p.kind).join(' ')}">
      <button class="index-row" type="button" data-open="${f.n}" data-preview="${f.post}">
        <span class="index-item__n">${String(f.n).padStart(2, '0')}</span>
        <span class="index-item__names">${names}</span>
        <span class="mono">${sizes}</span>
        <span class="mono">${prices}</span>
        <span>${soldOut ? '<span class="tag tag--sold">Agotado</span>' : '<span class="tag tag--ok">Disponible</span>'}</span>
      </button>
    </li>`;
  }).join('');
}
renderCatalog();

const filters = { kind: 'all', onlyAvailable: false };
let view = 'grid';

function matches(el) {
  const kinds = (filters.onlyAvailable ? el.dataset.availKinds : el.dataset.kinds).split(' ').filter(Boolean);
  if (filters.onlyAvailable && kinds.length === 0) return false;
  return filters.kind === 'all' || kinds.includes(filters.kind);
}

function applyFilters() {
  const cards = $$('.card', grid);
  const rows = $$('.index-item', indexList);
  const state = !reduceMotion && view === 'grid' ? Flip.getState(cards) : null;
  let shown = 0;
  cards.forEach((c) => {
    const ok = matches(c);
    c.style.display = ok ? '' : 'none';
    if (ok) shown++;
  });
  rows.forEach((r) => (r.style.display = matches(r) ? '' : 'none'));
  $('[data-empty]').hidden = shown > 0;
  if (state) {
    Flip.from(state, {
      duration: 0.75,
      ease: 'power3.inOut',
      scale: true,
      absolute: true,
      stagger: 0.02,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.04 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.4, ease: 'power2.in' }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  } else {
    ScrollTrigger.refresh();
  }
}

$$('[data-filter]').forEach((b) =>
  b.addEventListener('click', () => {
    filters.kind = b.dataset.filter;
    $$('[data-filter]').forEach((x) => {
      x.classList.toggle('is-active', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    applyFilters();
  }),
);
$('[data-only-available]').addEventListener('change', (e) => {
  filters.onlyAvailable = e.target.checked;
  applyFilters();
});

$$('[data-view]').forEach((b) =>
  b.addEventListener('click', () => {
    if (b.dataset.view === view) return;
    view = b.dataset.view;
    $$('[data-view]').forEach((x) => {
      x.classList.toggle('is-active', x === b);
      x.setAttribute('aria-pressed', String(x === b));
    });
    const show = view === 'grid' ? grid : $('[data-index]');
    const hide = view === 'grid' ? $('[data-index]') : grid;
    gsap.to(hide, {
      opacity: 0,
      y: 16,
      duration: reduceMotion ? 0 : 0.3,
      ease: 'power2.in',
      onComplete: () => {
        hide.hidden = true;
        show.hidden = false;
        gsap.set(hide, { clearProps: 'all' });
        const items = view === 'grid' ? $$('.card', grid) : $$('.index-item', indexList);
        if (!reduceMotion) gsap.fromTo(items.filter((i) => i.style.display !== 'none'), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.04 });
        ScrollTrigger.refresh();
      },
    });
  }),
);

// Index hover preview follows the pointer
if (finePointer) {
  const preview = $('[data-index-preview]');
  const px = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3' });
  const py = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3' });
  let current = '';
  indexList.addEventListener('pointermove', (e) => {
    px(e.clientX + 24);
    py(e.clientY - 150);
    const btn = e.target.closest('[data-preview]');
    if (!btn) return;
    if (btn.dataset.preview !== current) {
      current = btn.dataset.preview;
      preview.innerHTML = `<img src="${photoUrl(current, 480)}" alt="">`;
      gsap.fromTo(preview.firstChild, { scale: 1.2 }, { scale: 1, duration: 0.7, ease: 'power3.out' });
    }
    preview.classList.add('is-on');
  });
  indexList.addEventListener('pointerleave', () => {
    preview.classList.remove('is-on');
    current = '';
  });
}

/* ───────── Bag ───────── */
const BAG_KEY = 'tsa-bag-v1';
let bag = [];
try {
  const saved = JSON.parse(localStorage.getItem(BAG_KEY) || '[]');
  // Only keep entries that still exist and are not sold out
  bag = saved.filter((it) => {
    const f = FLOWS.find((x) => x.post === it.post);
    const p = f?.pieces[it.piece];
    return p && !p.sold && p.sizes.includes(it.size);
  });
} catch {
  bag = [];
}
const saveBag = () => {
  try {
    localStorage.setItem(BAG_KEY, JSON.stringify(bag));
  } catch {
    /* storage unavailable: bag lives for this visit only */
  }
};
const bagKey = (post, piece, size) => `${post}|${piece}|${size}`;
const inBag = (post, piece, size) => bag.some((it) => bagKey(it.post, it.piece, it.size) === bagKey(post, piece, size));

function bagItems() {
  return bag.map((it) => {
    const f = FLOWS.find((x) => x.post === it.post);
    return { ...it, flow: f, p: f.pieces[it.piece] };
  });
}

function bagMessage() {
  const items = bagItems();
  const total = items.reduce((s, it) => s + it.p.price, 0);
  const name = $('[data-bag-name]').value.trim();
  const city = $('[data-bag-city]').value.trim();
  const lines = items.map((it) => `• ${flowCode(it.flow.n)} · ${it.p.name} · Talla ${it.size} · ${money(it.p.price)}`);
  return [
    `${GREETING} Quiero hacer este pedido desde el catálogo:`,
    '',
    ...lines,
    '',
    `Total: ${money(total)}`,
    name ? `Nombre: ${name}` : null,
    city ? `Entrega en: ${city}` : null,
    '',
    '¿Está disponible?',
  ]
    .filter((l) => l !== null)
    .join('\n');
}

function renderBag() {
  const items = bagItems();
  const total = items.reduce((s, it) => s + it.p.price, 0);
  $$('[data-bag-count]').forEach((el) => (el.textContent = items.length));
  $('.nav__bag-count').hidden = items.length === 0;
  $$('[data-bag-total]').forEach((el) => (el.textContent = money(total)));
  $('[data-bag-list]').innerHTML = items
    .map(
      (it, i) => `<li class="bag-item">
      <img src="${photoUrl(it.post, 480)}" alt="" width="64" height="85">
      <div><p class="bag-item__name">${escapeHtml(it.p.name)}</p><span class="bag-item__meta mono">${flowCode(it.flow.n)} · Talla ${escapeHtml(it.size)}</span></div>
      <div class="bag-item__side"><span class="bag-item__price">${money(it.p.price)}</span><button class="bag-item__remove mono" type="button" data-remove="${i}">Quitar</button></div>
    </li>`,
    )
    .join('');
  $('[data-bag-empty]').hidden = items.length > 0;
  $('[data-bag-list]').hidden = items.length === 0;
  $('[data-bag-foot]').hidden = items.length === 0;
  $('[data-bagbar]').hidden = items.length === 0 || !$('[data-bag]').hidden;
  $('[data-bag-send]').href = waLink(bagMessage());
}

function addToBag(post, piece, size, { silent = false } = {}) {
  if (inBag(post, piece, size)) return false;
  bag.push({ post, piece, size });
  saveBag();
  renderBag();
  if (!silent) {
    const f = FLOWS.find((x) => x.post === post);
    toast(`Añadido: ${f.pieces[piece].name} · ${size}`);
    $$('.nav__bag-count').forEach((el) => gsap.fromTo(el, { scale: 1.6 }, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' }));
  }
  return true;
}

$('[data-bag-list]').addEventListener('click', (e) => {
  const b = e.target.closest('[data-remove]');
  if (!b) return;
  bag.splice(Number(b.dataset.remove), 1);
  saveBag();
  renderBag();
  refreshDetailButtons();
});
$$('[data-bag-name], [data-bag-city]').forEach((el) => el.addEventListener('input', () => ($('[data-bag-send]').href = waLink(bagMessage()))));

const bagEl = $('[data-bag]');
const scrim = $('[data-scrim]');
let lastFocus = null;
function openBag() {
  if (!bagEl.hidden) return;
  lastFocus = document.activeElement;
  bagEl.hidden = false;
  scrim.hidden = false;
  $('[data-bagbar]').hidden = true;
  lockScroll(true);
  gsap.fromTo(bagEl, { xPercent: 100 }, { xPercent: 0, duration: reduceMotion ? 0 : 0.7, ease: 'expo.out' });
  gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: reduceMotion ? 0 : 0.4 });
  if (!reduceMotion) gsap.from($$('.bag-item', bagEl), { x: 40, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05, delay: 0.15 });
  $('[data-bag-close]').focus();
}
function closeBag() {
  if (bagEl.hidden) return;
  gsap.to(scrim, { opacity: 0, duration: reduceMotion ? 0 : 0.3 });
  gsap.to(bagEl, {
    xPercent: 100,
    duration: reduceMotion ? 0 : 0.5,
    ease: 'power3.in',
    onComplete: () => {
      bagEl.hidden = true;
      scrim.hidden = true;
      lockScroll(false);
      renderBag();
      lastFocus?.focus?.();
    },
  });
}
$$('[data-bag-open]').forEach((b) => b.addEventListener('click', openBag));
$('[data-bag-close]').addEventListener('click', closeBag);
scrim.addEventListener('click', closeBag);
renderBag();

/* ───────── Flow detail ───────── */
const detail = $('[data-detail]');
const detailBody = $('.detail__body', detail);
detailBody.setAttribute('data-lenis-prevent', '');
detail.setAttribute('data-lenis-prevent', '');
$('[data-bag-list]').setAttribute('data-lenis-prevent', '');
let openFlow = null;
let chosen = {}; // piece index -> size

function flowMessage(f) {
  const avail = f.pieces.filter((p) => !p.sold);
  const lines = avail.map((p, i) => {
    const idx = f.pieces.indexOf(p);
    const size = chosen[idx] ? `Talla ${chosen[idx]}` : sizesText(p);
    return `• ${p.name} · ${size} · ${money(p.price)}`;
  });
  return [`${GREETING} Me interesa el ${flowCode(f.n)} (${shortDate(f.date)}) del catálogo:`, ...lines, '', '¿Está disponible?'].join('\n');
}

function refreshDetailButtons() {
  if (!openFlow) return;
  $$('[data-add]', detail).forEach((b) => {
    const idx = Number(b.dataset.add);
    const size = chosen[idx];
    const added = size && inBag(openFlow.post, idx, size);
    b.classList.toggle('is-in', Boolean(added));
    if (!b.disabled) b.textContent = added ? 'En la bolsa ✓' : 'Añadir a la bolsa';
  });
  const wa = $('[data-flow-wa]', detail);
  if (wa) wa.href = waLink(flowMessage(openFlow));
}

function renderDetail(f) {
  const images = [f.post, f.model].filter(Boolean);
  $('[data-detail-media]').innerHTML =
    images.map((img, i) => photoTag(img, { sizes: '(max-width: 860px) 100vw, 55vw', alt: i === 0 ? flowAlt(f) : `${flowCode(f.n)} en modelo`, lazy: false, cls: i ? 'is-hidden' : '' })).join('') +
    (images.length > 1
      ? `<div class="detail__thumbs">${images.map((img, i) => `<button type="button" class="${i === 0 ? 'is-active' : ''}" data-thumb="${i}" aria-label="${i === 0 ? 'Foto del flow' : 'Foto en modelo'}"><img src="${photoUrl(img, 480)}" alt=""></button>`).join('')}</div>`
      : '');
  $$('[data-detail-media] > img').forEach((img, i) => (img.style.opacity = i === 0 ? 1 : 0));

  chosen = {};
  f.pieces.forEach((p, i) => {
    if (!p.sold && p.sizes.length === 1) chosen[i] = p.sizes[0];
  });
  const soldOut = !flowAvailable(f);
  const avail = f.pieces.filter((p) => !p.sold);
  $('[data-detail-content]').innerHTML = `
    <p class="detail__kicker mono"><span>${shortDate(f.date)}</span><span>${soldOut ? 'Agotado' : `${avail.length} de ${f.pieces.length} disponible${avail.length > 1 ? 's' : ''}`}</span></p>
    <h2 class="detail__title" id="detail-title">Flow <span>${String(f.n).padStart(2, '0')}</span></h2>
    ${f.pieces
      .map(
        (p, i) => `<div class="dpiece${p.sold ? ' is-sold' : ''}">
      <div class="dpiece__top">
        <div><p class="dpiece__name">${escapeHtml(p.name)}</p><span class="dpiece__label mono">${escapeHtml(p.label)}</span></div>
        <span class="dpiece__price">${p.sold ? '<span class="tag tag--sold">Agotado</span>' : money(p.price)}</span>
      </div>
      <div class="dpiece__row">
        <div class="sizes" role="group" aria-label="Talla de ${escapeHtml(p.name)}">
          ${p.sizes.map((s) => `<button class="size${chosen[i] === s ? ' is-active' : ''}" type="button" data-size="${i}" data-value="${escapeHtml(s)}" ${p.sold ? 'disabled' : ''} aria-pressed="${chosen[i] === s}">${escapeHtml(s)}</button>`).join('')}
        </div>
        <button class="add" type="button" data-add="${i}" ${p.sold ? 'disabled' : ''}>${p.sold ? 'Agotado' : 'Añadir a la bolsa'}</button>
      </div>
    </div>`,
      )
      .join('')}
    <div class="detail__actions">
      ${
        soldOut
          ? `<a class="btn btn--ghost btn--block" href="${waLink(`${GREETING} Vi el ${flowCode(f.n)} agotado en el catálogo. ¿Va a volver o tienen algo parecido?`)}" target="_blank" rel="noopener"><span>Preguntar si vuelve</span><span class="btn__arrow" aria-hidden="true">↗</span></a>`
          : `${avail.length > 1 ? `<button class="btn btn--light btn--block" type="button" data-add-all><span>Añadir las ${avail.length} piezas · ${money(avail.reduce((s, p) => s + p.price, 0))}</span><span class="btn__arrow" aria-hidden="true">+</span></button>` : ''}
             <a class="btn btn--red btn--block" href="#" data-flow-wa target="_blank" rel="noopener"><span>Pedir este flow por WhatsApp</span><span class="btn__arrow" aria-hidden="true">↗</span></a>`
      }
    </div>
    <a class="detail__ig mono" href="https://www.instagram.com/p/${f.post}/" target="_blank" rel="noopener">Ver el post en Instagram ↗</a>`;
  refreshDetailButtons();
}

function needSize(i) {
  const p = openFlow.pieces[i];
  toast(`Escoge tu talla: ${p.name}`);
  const group = $$('.dpiece', detail)[i].querySelector('.sizes');
  gsap.fromTo(group, { x: -8 }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.3)' });
}

detail.addEventListener('click', (e) => {
  const sizeBtn = e.target.closest('[data-size]');
  if (sizeBtn) {
    const i = Number(sizeBtn.dataset.size);
    chosen[i] = sizeBtn.dataset.value;
    $$(`[data-size="${i}"]`, detail).forEach((b) => {
      b.classList.toggle('is-active', b === sizeBtn);
      b.setAttribute('aria-pressed', String(b === sizeBtn));
    });
    refreshDetailButtons();
    return;
  }
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) {
    const i = Number(addBtn.dataset.add);
    if (!chosen[i]) return needSize(i);
    if (!addToBag(openFlow.post, i, chosen[i])) toast('Esa pieza ya está en tu bolsa');
    refreshDetailButtons();
    return;
  }
  if (e.target.closest('[data-add-all]')) {
    const missing = openFlow.pieces.findIndex((p, i) => !p.sold && !chosen[i]);
    if (missing !== -1) return needSize(missing);
    let added = 0;
    openFlow.pieces.forEach((p, i) => {
      if (!p.sold && addToBag(openFlow.post, i, chosen[i], { silent: true })) added++;
    });
    toast(added ? `Flow añadido a la bolsa (${added})` : 'Ese flow ya está en tu bolsa');
    refreshDetailButtons();
    return;
  }
  const thumb = e.target.closest('[data-thumb]');
  if (thumb) {
    const n = Number(thumb.dataset.thumb);
    $$('[data-thumb]', detail).forEach((t) => t.classList.toggle('is-active', t === thumb));
    $$('[data-detail-media] > img').forEach((img, i) => gsap.to(img, { opacity: i === n ? 1 : 0, duration: 0.5 }));
  }
});

function openDetail(n) {
  const f = FLOWS.find((x) => x.n === n);
  if (!f) return;
  openFlow = f;
  lastFocus = document.activeElement;
  renderDetail(f);
  detail.hidden = false;
  detailBody.scrollTop = 0;
  detail.scrollTop = 0;
  lockScroll(true);
  if (!reduceMotion) {
    const tl = gsap.timeline();
    tl.fromTo(detail, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.9, ease: 'expo.inOut' })
      .fromTo($$('[data-detail-media] > img'), { scale: 1.25 }, { scale: 1, duration: 1.4, ease: 'expo.out' }, 0.25)
      .from($$('.detail__kicker, .detail__title, .dpiece, .detail__actions, .detail__ig', detail), { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.06 }, 0.45);
  }
  $('[data-detail-close]').focus({ preventScroll: true });
}
function closeDetail() {
  if (detail.hidden) return;
  gsap.to(detail, {
    clipPath: 'inset(0 0 100% 0)',
    duration: reduceMotion ? 0 : 0.7,
    ease: 'expo.inOut',
    onComplete: () => {
      detail.hidden = true;
      gsap.set(detail, { clearProps: 'clipPath' });
      openFlow = null;
      lockScroll(false);
      lastFocus?.focus?.({ preventScroll: true });
    },
  });
}
document.addEventListener('click', (e) => {
  const opener = e.target.closest('[data-open]');
  if (opener) openDetail(Number(opener.dataset.open));
});
$('[data-detail-close]').addEventListener('click', closeDetail);
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!bagEl.hidden) closeBag();
  else if (!detail.hidden) closeDetail();
});

/* ───────── Lookbook ───────── */
$('[data-looks]').innerHTML = LOOKS.map((l, i) => {
  const msg = `${GREETING} Vi el look “${l.caption}” del ${shortDate(l.date)} en el catálogo. ¿Todavía está disponible? ¿En qué tallas?`;
  return `<article class="look">
    <div class="look__media" data-cursor="Look ${String(i + 1).padStart(2, '0')}">
      ${photoTag(l.post, { sizes: '(max-width: 860px) 92vw, 26vw', alt: `Look “${l.caption}”, junio 2026`, lazy: false })}
      <p class="look__quote">“${escapeHtml(l.caption)}”</p>
    </div>
    <div class="look__info">
      <p class="mono" style="margin:0 0 6px;color:rgba(12,12,11,.55)">Look ${String(i + 1).padStart(2, '0')} · ${shortDate(l.date)}</p>
      ${l.pieces.map((p) => `<div class="look__row"><span class="mono">${escapeHtml(p.label)}${p.size ? ` · Talla ${escapeHtml(p.size)}` : ''}</span><strong>${money(p.price)}</strong></div>`).join('')}
      ${l.outfit ? `<div class="look__row look__row--outfit"><span class="mono">Outfit completo</span><strong>${money(l.outfit)}</strong></div>` : ''}
      <a class="look__cta mono" href="${waLink(msg)}" target="_blank" rel="noopener">Consultar disponibilidad ↗</a>
    </div>
  </article>`;
}).join('');

/* ───────── Nav ───────── */
const nav = $('[data-nav]');
const progress = $('[data-progress]');
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  nav.classList.toggle('is-solid', y > 40);
  nav.classList.toggle('is-hidden', y > lastY + 4 && y > window.innerHeight * 0.9 && locks === 0);
  if (y < lastY - 4) nav.classList.remove('is-hidden');
  lastY = y;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}
if (lenis) lenis.on('scroll', onScroll);
else window.addEventListener('scroll', onScroll, { passive: true });

const clock = $('[data-clock]');
const fmt = new Intl.DateTimeFormat('es-DO', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santo_Domingo' });
const tick = () => (clock.textContent = `STI ${fmt.format(new Date())}`);
tick();
setInterval(tick, 15000);

$$('[data-scroll]').forEach((a) =>
  a.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToTarget(a.getAttribute('href'));
  }),
);

/* ───────── Cursor ───────── */
if (finePointer) {
  const cursor = $('.cursor');
  const label = $('.cursor__label');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.35, ease: 'power3' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.35, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    cx(e.clientX);
    cy(e.clientY);
    const withLabel = e.target.closest('[data-cursor]');
    if (withLabel) {
      label.textContent = withLabel.dataset.cursor;
      cursor.classList.add('is-label');
      cursor.classList.remove('is-link');
    } else {
      cursor.classList.remove('is-label');
      cursor.classList.toggle('is-link', Boolean(e.target.closest('a, button, label')));
    }
  });
  document.addEventListener('pointerleave', () => gsap.to(cursor, { opacity: 0, duration: 0.2 }));
  document.addEventListener('pointerenter', () => gsap.to(cursor, { opacity: 1, duration: 0.2 }));
}

/* ───────── Variable-font proximity (hero + footer wordmarks) ───────── */
function charify(el) {
  const text = el.textContent;
  el.innerHTML = [...text].map((c) => `<span class="ch">${escapeHtml(c)}</span>`).join('');
  return $$('.ch', el);
}
const heroChars = $$('[data-hero-word]').flatMap(charify);
const footerChars = charify($('.footer__word'));

if (finePointer && !reduceMotion) {
  const groups = [
    { chars: heroChars, radius: 260, maxW: 74, minWeight: 380 },
    { chars: footerChars, radius: 300, maxW: 66, minWeight: 420 },
  ];
  const state = new Map();
  [...heroChars, ...footerChars].forEach((c) => state.set(c, { w: 62, wt: 860 }));
  let mx = -9999;
  let my = -9999;
  window.addEventListener('pointermove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });
  gsap.ticker.add(() => {
    groups.forEach(({ chars, radius, maxW, minWeight }) => {
      const box = chars[0]?.parentElement?.closest('h1, p')?.getBoundingClientRect();
      if (!box || box.bottom < -200 || box.top > window.innerHeight + 200) return;
      chars.forEach((c) => {
        const r = c.getBoundingClientRect();
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2));
        const k = Math.max(0, 1 - d / radius);
        const ease = k * k * (3 - 2 * k);
        const s = state.get(c);
        const tw = 62 + (maxW - 62) * ease;
        const twt = 860 - (860 - minWeight) * ease;
        s.w += (tw - s.w) * 0.14;
        s.wt += (twt - s.wt) * 0.14;
        c.style.fontStretch = `${s.w.toFixed(2)}%`;
        c.style.fontWeight = Math.round(s.wt);
      });
    });
  });
}

/* ───────── Hero window: cycles the latest flows ───────── */
const heroWindow = $('[data-hero-window]');
const heroCaption = $('[data-hero-caption]');
const heroFlows = FLOWS.filter(flowAvailable);
heroWindow.innerHTML = heroFlows.map((f, i) => photoTag(f.post, { sizes: '30vw', alt: '', lazy: i > 1 })).join('');
const heroImgs = $$('img', heroWindow);
let heroIdx = 0;
gsap.set(heroImgs, { clipPath: 'inset(100% 0 0 0)', zIndex: 0 });
gsap.set(heroImgs[0], { clipPath: 'inset(0% 0 0 0)', zIndex: 1 });
const setCaption = (f) => (heroCaption.textContent = `${flowCode(f.n)} — ${shortDate(f.date)} — ${f.pieces.filter((p) => !p.sold).map((p) => money(p.price)).join(' / ')}`);
setCaption(heroFlows[0]);
function cycleHero() {
  const prev = heroImgs[heroIdx];
  heroIdx = (heroIdx + 1) % heroImgs.length;
  const next = heroImgs[heroIdx];
  gsap.set(prev, { zIndex: 1 });
  gsap.set(next, { zIndex: 2 });
  gsap.fromTo(next, { clipPath: 'inset(100% 0 0 0)', scale: 1.3 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.1, ease: 'expo.inOut', onComplete: () => gsap.set(prev, { clipPath: 'inset(100% 0 0 0)', zIndex: 0 }) });
  setCaption(heroFlows[heroIdx]);
}

/* ───────── Marquee (scroll-velocity aware) ───────── */
const track = $('.marquee__track');
track.innerHTML = track.innerHTML.repeat(4);
if (!reduceMotion) {
  let x = 0;
  let dir = 1;
  let boost = 0;
  if (lenis) lenis.on('scroll', ({ velocity }) => {
    boost = Math.min(Math.abs(velocity) * 0.9, 24);
    if (Math.abs(velocity) > 0.5) dir = velocity > 0 ? 1 : -1;
  });
  gsap.ticker.add((_, dt) => {
    const half = track.scrollWidth / 2;
    x -= dir * (0.9 + boost) * (dt / 16.6);
    boost *= 0.92;
    if (x <= -half) x += half;
    if (x > 0) x -= half;
    track.style.transform = `translate3d(${x}px,0,0) skewX(${(-dir * boost * 0.35).toFixed(2)}deg)`;
  });
}

/* ───────── Scroll reveals ───────── */
function setupReveals() {
  if (reduceMotion) return;

  $$('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines,chars', linesClass: 'line-mask', aria: 'auto' });
    gsap.from(split.chars, {
      yPercent: 110,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.025,
      scrollTrigger: { trigger: el, start: 'top 85%' },
    });
  });

  // Manifesto: words light up as you scroll
  const words = SplitText.create('[data-words]', { type: 'words', wordsClass: 'w', aria: 'auto' }).words;
  gsap.to(words, {
    opacity: 1,
    stagger: 0.08,
    ease: 'none',
    scrollTrigger: { trigger: '.manifesto', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
  });

  ScrollTrigger.batch('.card', {
    start: 'top 92%',
    onEnter: (els) => gsap.fromTo(els, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });
  gsap.set('.card', { opacity: 0 });
  $$('.card__media').forEach((m) =>
    gsap.fromTo(m, { clipPath: 'inset(12% 8% 12% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: m, start: 'top 100%', end: 'top 45%', scrub: true } }),
  );

  $$('[data-reveal]').forEach((el) =>
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } }),
  );


  gsap.from(footerChars, {
    yPercent: 100,
    duration: 1.2,
    ease: 'expo.out',
    stagger: 0.035,
    scrollTrigger: { trigger: '.footer', start: 'top 95%' },
  });

  // Hero drifts away on scroll
  gsap.to('.hero__title', { yPercent: 22, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero__window img', { scale: 1.15, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Lookbook: horizontal on desktop, stacked on mobile
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const lookTrack = $('[data-look-track]');
    const distance = () => lookTrack.scrollWidth - window.innerWidth;
    const tween = gsap.to(lookTrack, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: { trigger: '[data-look-pin]', start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    $$('.look__media img').forEach((img) =>
      gsap.fromTo(img, { xPercent: -8 }, { xPercent: 8, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } }),
    );
  });
  mm.add('(max-width: 860px)', () => {
    $$('.look__media img').forEach((img) =>
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }),
    );
  });
}

/* ───────── Loader → hero intro ───────── */
function heroIntro() {
  const words = $$('[data-hero-word]');
  if (reduceMotion) {
    gsap.delayedCall(3.2, function loop() {
      cycleHero();
      gsap.delayedCall(3.2, loop);
    });
    return;
  }
  words.forEach((w) => (w.style.overflow = 'hidden'));
  const tl = gsap.timeline({
    onComplete: () => {
      words.forEach((w) => (w.style.overflow = ''));
      gsap.delayedCall(2.4, function loop() {
        if (!document.hidden) cycleHero();
        gsap.delayedCall(2.6, loop);
      });
    },
  });
  tl.from(heroChars, { yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: 0.04 })
    .fromTo(heroWindow, { width: 0 }, { width: '0.92em', duration: 1.2, ease: 'expo.inOut', clearProps: 'width' }, 0.15)
    .from(heroImgs[0], { scale: 1.5, duration: 1.6, ease: 'expo.out' }, 0.3)
    .from('[data-hero-fade]', { y: 24, opacity: 0, duration: 1, ease: 'power3.out', stagger: 0.08 }, 0.5)
    .from('.hero__grid i', { scaleY: 0, transformOrigin: 'top', duration: 1.4, ease: 'expo.inOut', stagger: 0.06 }, 0)
    .from('.cross, .hero__caption', { opacity: 0, duration: 0.8 }, 0.9)
    .from(nav, { opacity: 0, duration: 1, ease: 'power2.out' }, 0.4); // opacity, not transform: the nav's CSS transform transition would fight GSAP
}

function runLoader() {
  const loader = $('[data-loader]');
  if (reduceMotion) {
    loader.classList.add('is-done');
    return Promise.resolve();
  }
  lockScroll(true);
  const stack = $('[data-loader-stack]');
  const picks = FLOWS.slice(0, 7);
  stack.innerHTML = picks.map((f) => `<img src="${photoUrl(f.post, 480)}" alt="">`).join('');
  const imgs = $$('img', stack);
  const decoded = Promise.race([Promise.all(imgs.map((i) => i.decode().catch(() => {}))), new Promise((r) => setTimeout(r, 2500))]);
  const counter = { v: 0 };
  const countEl = $('[data-loader-count]');

  return decoded.then(
    () =>
      new Promise((resolve) => {
        const tl = gsap.timeline({
          onComplete: () => {
            loader.classList.add('is-done');
            lockScroll(false);
            resolve();
          },
        });
        tl.from('.loader__word', { yPercent: 100, opacity: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 })
          .from('.loader__meta span', { opacity: 0, duration: 0.6 }, 0.2)
          .to(counter, { v: 100, duration: 2.3, ease: 'power2.inOut', onUpdate: () => (countEl.textContent = String(Math.round(counter.v)).padStart(3, '0')) }, 0.1);
        imgs.forEach((img, i) => {
          tl.fromTo(
            img,
            { opacity: 0, scale: 0.6, y: 40, rotate: gsap.utils.random(-22, 22) },
            { opacity: 1, scale: 1, y: 0, rotate: gsap.utils.random(-9, 9), duration: 0.55, ease: 'back.out(1.6)' },
            0.2 + i * 0.3,
          );
        });
        tl.to('.loader__word--l', { xPercent: -40, opacity: 0, duration: 0.8, ease: 'expo.in' }, '>-0.1')
          .to('.loader__word--r', { xPercent: 40, opacity: 0, duration: 0.8, ease: 'expo.in' }, '<')
          .to('.loader__count, .loader__meta', { opacity: 0, duration: 0.4 }, '<')
          .to(imgs, { rotate: 0, duration: 0.5, ease: 'power2.inOut' }, '<0.2')
          .to(stack, { scale: 1.6, duration: 0.7, ease: 'expo.in' }, '<')
          .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '>-0.2')
          .add(heroIntro, '<0.35');
      }),
  );
}

/* ───────── Boot ───────── */
wireWhatsApp();
setupReveals();
window.scrollTo(0, 0);
const ready = document.fonts?.ready ?? Promise.resolve();
// A shared link to a section (#catalogo, #lookbook…) skips the loader and lands there
const deepLink = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
ready.then(() => {
  ScrollTrigger.refresh();
  if (reduceMotion || deepLink) {
    $('[data-loader]').classList.add('is-done');
    heroIntro();
    if (deepLink) {
      // Wait for the browser's own fragment jump (made before pins/fonts settled), then correct it
      const jump = () =>
        setTimeout(() => {
          ScrollTrigger.refresh();
          const y = Math.round(deepLink.getBoundingClientRect().top + window.scrollY);
          window.scrollTo(0, y);
          lenis?.scrollTo(y, { immediate: true, force: true });
        }, 80);
      if (document.readyState === 'complete') jump();
      else window.addEventListener('load', jump, { once: true });
    }
    return;
  }
  return runLoader();
});
window.addEventListener('load', () => ScrollTrigger.refresh());
