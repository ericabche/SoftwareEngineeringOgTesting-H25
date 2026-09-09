// js/billett.js
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-billett')) return;

  /* ===========================================================
   *  KONSTANTER / HJELPERE
   * =========================================================== */
  const MAX_DAYS_AHEAD = 21;
  const MS_PER_DAY     = 24 * 60 * 60 * 1000;

  // localStorage-nøkler
  const TKEY         = 'mockTickets:v1';
  const TKEY_HISTORY = 'mockTickets:history';
  const RECENTS_KEY  = 'mockTickets:recents';
  const PKEY         = 'mockTickets:pickups';   // hentekoder (“Kjøp til andre”)
  const RKEY         = 'mockTickets:receipts';  // kvitteringer

  // Enkle DOM-hjelpere
  const qs  = (s, el=document) => el.querySelector(s);
  const qsa = (s, el=document) => [...el.querySelectorAll(s)];
  const show = el => { if (el) el.hidden = false; };
  const hide = el => { if (el) el.hidden = true; };
  const nok  = n => `${n} kr`;
  const debounce = (fn, ms) => { let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); }; };

  // i18n-hjelpere
  const t =
    (window.t)
      ? window.t
      : (key => key);

  const getLang = () =>
    document.documentElement.lang === 'en' ? 'en' : 'nb';

  const getLocale = () =>
    getLang() === 'en' ? 'en-GB' : 'nb-NO';

  // Dato/tid
  const maxStart = () => new Date(Date.now() + MAX_DAYS_AHEAD * MS_PER_DAY);
  const clampToLimit = d => d > maxStart() ? maxStart() : d;
  const sameDay = (a,b) =>
    a.getFullYear()===b.getFullYear() &&
    a.getMonth()===b.getMonth() &&
    a.getDate()===b.getDate();

  function buildDates() {
    const out = [];
    const now = new Date();
    const locale = getLocale();
    const lang = getLang();

    for (let i = 0; i <= MAX_DAYS_AHEAD; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);

      const label =
        i === 0 ? (lang === 'en' ? 'Today'   : 'I dag') :
        i === 1 ? (lang === 'en' ? 'Tomorrow': 'I morgen') :
        d.toLocaleDateString(locale, {
          weekday:'short', day:'numeric', month:'short'
        });

      out.push({ date: d, label });
    }
    return out;
  }

 function fmtDateHuman(d) {
    const locale = getLocale();
    const wd = d.toLocaleDateString(locale, { weekday:'long' });
    const ds = d.toLocaleDateString(locale, {
      day:'numeric', month:'long', year:'numeric'
    });
    const sep = getLang() === 'en' ? ', ' : ' ';
    return `${wd}${sep}${ds}`;
  }

  function fmtCompact(d) {
    const locale = getLocale();
    const datePart = d.toLocaleDateString(locale, {
      day:'2-digit', month:'short', year:'numeric'
    });
    const timePart = d.toLocaleTimeString(locale, {
      hour:'2-digit', minute:'2-digit'
    });
    const sep = getLang() === 'en' ? ' at ' : ' kl. ';
    return `${datePart}${sep}${timePart}`;
  }

  function scrollToValue(col, predicate) {
    const opts = [...col.querySelectorAll('.opt')];
    const el = opts.find(predicate) || opts[0];
    if (!el) return;
    const rowH = 44;
    const top  = el.offsetTop - (col.clientHeight/2 - rowH/2);
    col.scrollTo({ top, behavior:'instant' });
  }

  function nearest(col, getVal) {
    const rowH = 44;
    const center = col.scrollTop + col.clientHeight/2;
    let best = null;
    let bestDist = Infinity;
    col.querySelectorAll('.opt').forEach(opt => {
      const mid = opt.offsetTop + rowH/2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = opt;
      }
    });
    return getVal(best);
  }

  // Kvitteringer
  function loadReceipts() {
    try {
      return JSON.parse(localStorage.getItem(RKEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveReceipts(arr) {
    localStorage.setItem(RKEY, JSON.stringify(arr));
  }

  // ID/kode-generatorer
  function genId() {
    return Math.random().toString(36).slice(2, 10);
  }
  const genCode = () => {
    const A = () => String.fromCharCode(65 + Math.floor(Math.random() * 26));
    return `${A()}${A()}-${A()}${A()}-${A()}${A()}${A()}`;
  };

  /* ===========================================================
   *  DOM-REFERANSER
   * =========================================================== */
  // Billetter
  const ticketList = qs('#ticket-list');
  const emptyCard  = qs('#empty-card');

  // Karusell
  const ticketCarousel = qs('#ticket-carousel');
  const tcViewport     = qs('#tc-viewport');
  const tcTrack        = qs('#tc-track');
  const tcDots         = qs('#tc-dots');

  // Sheet & paneler
  const sheet   = qs('#sheet');
  const btnNew  = qs('#btn-new');
  const titleEl = qs('#sheet-title');

  const panelType         = qs('[data-panel="type"]');
  const panelSingle       = qs('[data-panel="single"]');
  const panelTrav         = qs('[data-panel="single-travelers"]');
  const panelSum          = qs('[data-panel="summary"]');
  const panelPeriodTrav   = qs('[data-panel="period-traveler"]');
  const panelPeriodProd   = qs('[data-panel="period-products"]');
  const panelTicketDetail = qs('[data-panel="ticket-detail"]');
  const panelTimePicker   = qs('[data-panel="timepicker"]');
  const panelQuickAll     = qs('[data-panel="quick-all"]');
  const buyOthersPanel    = qs('[data-panel="buy-others"]');
  const pickupDetailPanel = qs('[data-panel="pickup-detail"]');

  // Timepicker
  const colDate   = qs('#col-date');
  const colHour   = qs('#col-hour');
  const colMinute = qs('#col-minute');
  const tpConfirm = qs('#tp-confirm');
  const tpLimit   = qs('#tp-limit-text');
  const tpNow     = qs('#tp-now');

  // Detalj
  const tdTitle   = qs('#td-title');
  const tdStatus  = qs('#td-status');
  const tdTrav    = qs('#td-travelers');
  const tdArea    = qs('#td-area');
  const tdStart   = qs('#td-start');
  const tdEnd     = qs('#td-end');
  const tdQR      = qs('#td-qr');
  const tdStartNow    = qs('#td-start-now');
  const tdChangeStart = qs('#td-change-start');
  const tdCancel      = qs('#td-cancel');

  // Enkeltbillett (reisende)
  const chosenSingle = qs('#chosen-single');
  const countersUL   = qs('#traveler-counters');
  const totalAmount  = qs('#total-amount');
  const btnNextSum   = qs('#btn-next-summary');
  const btnConfirm   = qs('#btn-confirm');

  // Oppsummering
  const sumPriceEl   = qs('#sum-price');
  const sumTitleEl   = qs('#sum-title');
  const sumAreaEl    = qs('#sum-area');
  const sumTravEl    = qs('#sum-travelers');
  const startdateBtn = qs('#startdate-btn');

  // Navigasjon
  const backBtn  = qs('[data-nav="back"]');
  const closeBtn = qs('[data-nav="close"]');

  // Periodebillett
  const periodTravList   = qs('#period-traveler-list');
  const periodProdList   = qs('#period-products-list');
  const periodChosenTrav = qs('#period-chosen-trav');

  // Hurtigkjøp (forside + “Se alle”)
  const quickList     = qs('#quick-list');
  const quickAllList  = qs('#quick-all-list');
  const seeAllBtn     = qs('[data-action="see-all"]');

  // Hentekoder + kjøp-til-andre
  const pickupSection = qs('#pickup-section');
  const pickupList    = qs('#pickup-list');
  const pdTitle  = qs('#pd-title');
  const pdCode   = qs('#pd-code');
  const pdProduct= qs('#pd-product');
  const pdWhen   = qs('#pd-when');
  const pdShare  = qs('#pd-share');
  const pdCancel = qs('#pd-cancel');
  const btnBuyOthers = qs('#btn-buy-others');

  /* ===========================================================
   *  DATA (PRIS/VARIGHET)
   * =========================================================== */
  const PRICES_SINGLE = {
    osf: { name:'Enkeltbillett', area:'hele Østfold', rules:[
      { key:'adult',  label:'Voksen', price:45, min:0, max:10 },
      { key:'child',  label:'Barn',   price:22, min:0, max:10, hint:'6–17 år. Under 6 år gratis' },
      { key:'senior', label:'Honnør', price:22, min:0, max:10, hint:'Fra 67 år / uføretrygd' },
    ]},
    ng: { name:'Enkeltbillett Nedre Glomma', area:'Sarpsborg og Fredrikstad', rules:[
      { key:'adult',  label:'Voksen', price:35, min:0, max:10 },
      { key:'child',  label:'Barn',   price:18, min:0, max:10 },
      { key:'senior', label:'Honnør', price:18, min:0, max:10 },
    ]},
    'ng-fritid': { name:'Enkeltbillett fritid Nedre Glomma', area:'hverdager fra 17 / helg – kun buss', rules:[
      { key:'child',  label:'Barn',   price:10, min:0, max:10 },
      { key:'senior', label:'Honnør', price:10, min:0, max:10 },
    ]},
  };

  const SINGLE_VALIDITY_MIN = 90;
  const PERIOD_VALIDITY_MS = {
    '24-osf':  24*60*60*1000, '24-ng':  24*60*60*1000,
    '7-osf':   7*24*60*60*1000,'7-ng':   7*24*60*60*1000,
    '30-osf': 30*24*60*60*1000,'30-ng': 30*24*60*60*1000,
    '365-osf':365*24*60*60*1000,'365-ng':365*24*60*60*1000
  };

  const PERIOD_TRAVELERS = [
    { key:'adult',   label:'Voksen',  hint:'' },
    { key:'child',   label:'Barn',    hint:'6–17 år. Barn under 6 år reiser gratis' },
    { key:'senior',  label:'Honnør',  hint:'Fra 67 år og personer med norsk uføretrygd' },
    { key:'youth',   label:'Ungdom',  hint:'Under 20 år' },
    { key:'student', label:'Student', hint:'Heltidsstudenter under 30 år' },
  ];

  const PRICES_PERIOD = {
    adult: [
      { id:'24-osf',  name:'24-timersbillett Østfold',       area:'Østfold',      price:150 },
      { id:'24-ng',   name:'24-timersbillett Nedre Glomma',  area:'Nedre Glomma', price:75  },
      { id:'7-osf',   name:'7-dagersbillett Østfold',        area:'Østfold',      price:290 },
      { id:'7-ng',    name:'7-dagersbillett Nedre Glomma',   area:'Nedre Glomma', price:150 },
      { id:'30-osf',  name:'30-dagersbillett Østfold',       area:'Østfold',      price:870 },
      { id:'30-ng',   name:'30-dagersbillett Nedre Glomma',  area:'Nedre Glomma', price:450 },
      { id:'365-osf', name:'365-dagersbillett Østfold',      area:'Østfold',      price:8700 },
      { id:'365-ng',  name:'365-dagersbillett Nedre Glomma', area:'Nedre Glomma', price:4500 },
    ],
    child: [
      { id:'24-osf', name:'24-timersbillett Østfold', area:'Østfold', price:75  },
      { id:'7-osf',  name:'7-dagersbillett Østfold',  area:'Østfold', price:140 },
      { id:'30-osf', name:'30-dagersbillett Østfold', area:'Østfold', price:390 },
    ],
    senior: [
      { id:'24-osf', name:'24-timersbillett Østfold', area:'Østfold', price:75   },
      { id:'7-osf',  name:'7-dagersbillett Østfold',  area:'Østfold', price:140  },
      { id:'30-osf', name:'30-dagersbillett Østfold', area:'Østfold', price:420  },
      { id:'365-osf',name:'365-dagersbillett Østfold',area:'Østfold', price:4200 },
    ],
    youth: [
      { id:'7-osf',  name:'7-dagersbillett Østfold',  area:'Østfold', price:140 },
      { id:'30-osf', name:'30-dagersbillett Østfold', area:'Østfold', price:390 },
    ],
    student: [
      { id:'30-osf', name:'30-dagersbillett Østfold', area:'Østfold', price:500 },
    ],
  };

  const BUY_OTHERS_PRODUCTS = [
    { id: 'single-ng-adult',  title: 'Enkeltbillett Nedre Glomma', sub: '1 Voksen', payload: { kind:'single', product:'ng', travelers:{ adult:1 } } },
    { id: 'single-osf-adult', title: 'Enkeltbillett',              sub: '1 Voksen • hele Østfold', payload: { kind:'single', product:'osf', travelers:{ adult:1 } } },
    { id: 'period-24-osf',    title: '24-timersbillett Østfold',   sub: '1 Voksen', payload: { kind:'period', product:'24-osf' } },
  ];

  /* ===========================================================
   *  STATE
   * =========================================================== */
  let current         = null;
  let chosenProduct   = null;    // single: 'osf' | 'ng' | 'ng-fritid'
  let quantities      = {};      // single: antall per kategori
  let periodTraveler  = null;    // period: 'adult' | 'student' ...
  let periodProduct   = null;    // period: {id, name, area, price}
  let customStart     = null;    // valgt starttid

  // Karusell
  let tcIndex   = 0;
  let tcTickets = [];
  let carouselBound = false;

  // Detalj/redigering
  let editingTicketId = null;
  let timepickerFor   = null;    // 'new' | 'edit'

  // Kjøp til andre
  let pendingPickup = null;      // valgt forslag
  let buyForOthers  = false;     // modus

  /* ===========================================================
   *  PANELVISNING
   * =========================================================== */
  const ALL_PANELS = [
    panelType, panelSingle, panelTrav, panelSum,
    panelPeriodTrav, panelPeriodProd, panelTimePicker,
    panelTicketDetail, panelQuickAll,
    buyOthersPanel, pickupDetailPanel
  ].filter(Boolean);

  const setPanels  = (...toShow) => { ALL_PANELS.forEach(hide); toShow.filter(Boolean).forEach(show); };
  const openSheet  = (label='Velg billett') => { titleEl.textContent = label; sheet.hidden = false; };
  const closeSheet = () => { sheet.hidden = true; current = null; };

  /* ===========================================================
   *  HURTIGKJØP – STORAGE & RENDER
   * =========================================================== */
  function loadRecents(){ try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch { return []; } }
  function saveRecents(arr){ localStorage.setItem(RECENTS_KEY, JSON.stringify(arr)); }

  function buildRecentFromCurrent(){
    const title    = sumTitleEl.textContent.trim();
    const subtitle = `${sumTravEl.textContent.trim()} • ${sumAreaEl.textContent.trim()}`;
    if (chosenProduct) {
      return { kind:'single', singleId: chosenProduct, preset: { ...quantities }, title, subtitle, ts: Date.now() };
    }
    if (periodTraveler && periodProduct) {
      return { kind:'period', traveler: periodTraveler, productId: periodProduct.id, title, subtitle, ts: Date.now() };
    }
    return null;
  }

  function addRecent(r){
    if (!r) return;
    const key = JSON.stringify({k:r.kind, a:r.singleId, b:r.traveler, c:r.productId, p:r.preset});
    const items = loadRecents();
    const filtered = items.filter(x => JSON.stringify({k:x.kind,a:x.singleId,b:x.traveler,c:x.productId,p:x.preset}) !== key);
    const next = [{...r}, ...filtered].slice(0, 10);
    saveRecents(next);
    renderQuickShort();
  }

  function renderQuickItem(r){
    const payload = encodeURIComponent(JSON.stringify(r));
    return `
      <li>
        <div class="list-item" role="group" aria-label="${r.title}">
          <div class="li-main">
            <div class="li-title">${r.title}</div>
            <div class="li-sub">${r.subtitle}</div>
          </div>
          <button class="row-cta" type="button" data-replay="${payload}">Kjøp</button>
        </div>
      </li>
    `;
  }

  function renderQuickShort(){
    if (!quickList) return;
    const rec = loadRecents().slice(0,3);
    quickList.innerHTML = rec.length ? rec.map(renderQuickItem).join('') : '';
    quickList.querySelectorAll('[data-replay]').forEach(btn => {
      btn.addEventListener('click', () => replayRecent(JSON.parse(decodeURIComponent(btn.dataset.replay))));
    });
  }

  function renderQuickAll(){
    if (!quickAllList) return;
    const rec = loadRecents();
    quickAllList.innerHTML = rec.length
      ? rec.map(renderQuickItem).join('')
      : `<li><div class="card card--empty">Ingen tidligere kjøp ennå</div></li>`;
    quickAllList.querySelectorAll('[data-replay]').forEach(btn => {
      btn.addEventListener('click', () => replayRecent(JSON.parse(decodeURIComponent(btn.dataset.replay))));
    });
  }

  seeAllBtn?.addEventListener('click', () => {
    openSheet('Hurtigkjøp');
    renderQuickAll();
    current = 'quick-all';
    setPanels(panelQuickAll);
  });

  function replayRecent(r){
    if (r.kind === 'single'){
      openSheet('Enkeltbillett');
      selectSingle(r.singleId, r.preset || {});
      const p = PRICES_SINGLE[r.singleId];
      const sum = p.rules.reduce((acc, rule) => acc + (r.preset?.[rule.key] || 0) * rule.price, 0);
      sumPriceEl.textContent = nok(sum);
      sumTitleEl.textContent = p.name;
      sumAreaEl.textContent  = p.area;
      sumTravEl.textContent  = travelerSummary(p.rules, r.preset || {});
      current = 'summary'; titleEl.textContent = ''; setPanels(panelSum);
      return;
    }
    if (r.kind === 'period'){
      periodTraveler = r.traveler;
      const travObj  = PERIOD_TRAVELERS.find(t => t.key === periodTraveler);
      periodProduct  = (PRICES_PERIOD[periodTraveler] || []).find(x => x.id === r.productId);
      openSheet('Periodebillett');
      sumPriceEl.textContent = periodProduct ? nok(periodProduct.price) : '0 kr';
      sumTitleEl.textContent = periodProduct ? periodProduct.name : 'Periodebillett';
      sumAreaEl.textContent  = periodProduct ? periodProduct.area : '—';
      sumTravEl.textContent  = travObj ? travObj.label : '—';
      current = 'summary'; titleEl.textContent = ''; setPanels(panelSum);
    }
  }

  /* ===========================================================
   *  ENKELTBILLETT-FLYT
   * =========================================================== */
  qsa('[data-single]', panelSingle).forEach(btn => {
    btn.addEventListener('click', () => selectSingle(btn.getAttribute('data-single')));
  });

  function selectSingle(id, preset = null){
    chosenProduct = id;
    const p = PRICES_SINGLE[id];
    titleEl.textContent = 'Enkeltbillett';

    countersUL.innerHTML = '';
    quantities = {};
    p.rules.forEach(r => {
      const label = t(`traveler.${r.key}_label`) || r.label;
      const hint  = t(`traveler.${r.key}_sub`)   || r.hint || "";

      quantities[r.key] = (preset && preset[r.key]) ?? 0;

      const li = document.createElement('li');
      li.className = 'counter';
      li.innerHTML = `
        <div class="meta">
          <span class="title">${label}</span>
          ${hint ? `<span class="hint">${hint}</span>` : ''}
        </div>
        <div class="stepper">
          <button type="button" data-dec="${r.key}" aria-label="Mindre ${label}">–</button>
          <span class="qty" data-qty="${r.key}">${quantities[r.key]}</span>
          <button type="button" data-inc="${r.key}" aria-label="Flere ${label}">+</button>
        </div>
      `;
      countersUL.appendChild(li);
    });

    chosenSingle.textContent = p.name;
    updateSingleTotal();

    current = 'single-travelers';
    setPanels(panelTrav);
  }

  countersUL.addEventListener('click', (e) => {
    const inc = e.target.getAttribute('data-inc');
    const dec = e.target.getAttribute('data-dec');
    if (!inc && !dec) return;

    const id = inc || dec;
    const p = PRICES_SINGLE[chosenProduct];
    const rule = p.rules.find(r => r.key === id);
    if (!rule) return;

    let next = quantities[id] + (inc ? 1 : -1);
    next = Math.max(rule.min, Math.min(rule.max, next));
    if (next === quantities[id]) return;

    quantities[id] = next;
    qs(`[data-qty="${id}"]`, countersUL).textContent = next;
    updateSingleTotal();
  });

  function updateSingleTotal(){
    const p = PRICES_SINGLE[chosenProduct];
    const sum = p.rules.reduce((acc, r) => acc + (quantities[r.key] || 0) * r.price, 0);
    totalAmount.textContent = nok(sum);
    btnNextSum.disabled = sum <= 0;
  }

  btnNextSum.addEventListener('click', () => {
    const p = PRICES_SINGLE[chosenProduct];
    const sum = p.rules.reduce((acc, r) => acc + (quantities[r.key] || 0) * r.price, 0);

    sumPriceEl.textContent = nok(sum);
    sumTitleEl.textContent = p.name;
    sumAreaEl.textContent  = p.area;
    sumTravEl.textContent  = travelerSummary(p.rules, quantities);

    current = 'summary';
    titleEl.textContent = ''; // unngå dobbel tittel
    setPanels(panelSum);
  });

  function travelerSummary(rules, qty){
    const parts = [];
    rules.forEach(r => {
      const n = qty[r.key] || 0;
      if (n > 0) {
        const label = (t(`traveler.${r.key}_label`) || r.label || '').toLowerCase();
        parts.push(`${n} ${label}`);
      }
    });
    return parts.length ? parts.join(', ') : '—';
  }

  /* ===========================================================
   *  PERIODEBILLETT-FLYT
   * =========================================================== */
  function travelerLabel(key) {
    return t(`traveler.${key}_label`) ||
          (PERIOD_TRAVELERS.find(x => x.key === key)?.label || key);
  }

  function travelerHint(key) {
    return t(`traveler.${key}_sub`) ||
          (PERIOD_TRAVELERS.find(x => x.key === key)?.hint || '');
  }

  function renderPeriodTravelers(){
    if (!periodTravList) return;

    periodTravList.innerHTML = PERIOD_TRAVELERS.map(info => {
      const label = travelerLabel(info.key);
      const hint  = travelerHint(info.key);

      return `
        <li>
          <button class="list-item" type="button" data-period-trav="${info.key}">
            <div class="li-main">
              <div class="li-title">${label}</div>
              ${hint ? `<div class="li-sub">${hint}</div>` : ''}
            </div>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        </li>
      `;
    }).join('');

    periodTravList.querySelectorAll('[data-period-trav]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        periodTraveler = btn.dataset.periodTrav;
        periodChosenTrav.textContent = travelerLabel(periodTraveler);
        renderPeriodProducts();
        current = 'period-products';
        setPanels(panelPeriodProd);
      });
    });
  }

  /* ===========================================================
   *  HENTEKODER (KJØP TIL ANDRE)
   * =========================================================== */
  const loadPickups = () => { try { return JSON.parse(localStorage.getItem(PKEY) || '[]'); } catch { return []; } };
  const savePickups = (arr) => localStorage.setItem(PKEY, JSON.stringify(arr));

  function createPickupFromProduct(prod) {
    const code = genCode();
    const now  = new Date();
    const item = {
      id: genId(),
      code,
      title: prod.title,
      subtitle: prod.sub,
      createdISO: now.toISOString(),
      payload: prod.payload
    };
    const list = loadPickups();
    list.unshift(item);
    savePickups(list);
  }

  function renderPickups() {
    const picks = loadPickups();
    if (!picks.length) {
      pickupSection.hidden = true;
      pickupList.innerHTML = '';
      return;
    }
    pickupSection.hidden = false;
    pickupList.innerHTML = picks.map(p => `
      <li>
        <article class="list-item" data-pickup="${p.id}">
          <div class="li-main">
            <div class="li-title">${p.title}</div>
            <div class="li-sub">Hentekode: <strong>${p.code}</strong></div>
          </div>
          <span class="chevron" aria-hidden="true">›</span>
        </article>
      </li>
    `).join('');

    pickupList.querySelectorAll('[data-pickup]').forEach(el => {
      el.addEventListener('click', () => openPickupDetail(el.dataset.pickup));
    });
  }

  let editingPickupId = null;

  function openPickupDetail(id) {
    const p = loadPickups().find(x => x.id === id);
    if (!p) return;
    editingPickupId = p.id;

    pdTitle.textContent   = 'Til henting';
    pdCode.textContent    = p.code;
    pdProduct.textContent = p.title + (p.subtitle ? ` – ${p.subtitle}` : '');
    pdWhen.textContent    = `Kjøpt ${fmtCompact(new Date(p.createdISO))}`;

    titleEl.textContent = 'Hentekode';
    current = 'pickup-detail';
    setPanels(pickupDetailPanel);
    sheet.hidden = false;
  }

  pdShare?.addEventListener('click', async () => {
    const p = loadPickups().find(x => x.id === editingPickupId);
    if (!p) return;
    try {
      await navigator.clipboard.writeText(p.code);
      showToast('Hentekode kopiert');
    } catch {
      showToast('Kunne ikke kopiere kode');
    }
  });

  pdCancel?.addEventListener('click', () => {
    const next = loadPickups().filter(x => x.id !== editingPickupId);
    savePickups(next);
    renderPickups();
    closeSheet();
  });

  function showToast(msg) {
    const t = qs('#toast'); if (!t) return;
    t.textContent = msg; t.hidden = false;
    setTimeout(() => t.hidden = true, 2000);
  }

  // Hjelpere for “kjøp til andre”
  function buildBuyForOthersPayload() {
    if (chosenProduct) {
      return { kind:'single', product: chosenProduct, travelers: { ...quantities } };
    }
    if (periodTraveler && periodProduct) {
      return { kind:'period', traveler: periodTraveler, product: periodProduct.id };
    }
    return null;
  }
  function buildTitleSubtitleFromState() {
    return {
      title:    sumTitleEl.textContent.trim(),
      subtitle: `${sumTravEl.textContent.trim()} • ${sumAreaEl.textContent.trim()}`
    };
  }
  function createPickupFromState() {
    const payload = buildBuyForOthersPayload();
    if (!payload) return null;
    const { title, subtitle } = buildTitleSubtitleFromState();
    const prod = { title, sub: subtitle, payload };
    createPickupFromProduct(prod);
    return loadPickups()[0] || null; // sist opprettede
  }

  // Panel for kjøp-til-andre (ferdig kuratert liste)
  function ensureBuyOthersMarkup() {
    if (!buyOthersPanel) return null;
    let list = buyOthersPanel.querySelector('#buy-others-list');
    if (!list) {
      const wrapper = document.createElement('div');
      wrapper.className = 'section';
      wrapper.innerHTML = `<ul id="buy-others-list" class="list list--cards" role="list"></ul>`;
      (buyOthersPanel.querySelector('.sheet__body') || buyOthersPanel).appendChild(wrapper);
      list = wrapper.querySelector('#buy-others-list');
    }
    return list;
  }

  function renderBuyForOthers(filter = 'single') {
    const list = ensureBuyOthersMarkup();
    if (!list) return;

    const filtered = BUY_OTHERS_PRODUCTS.filter(p =>
      filter === 'single' ? p.payload?.kind === 'single'
      : filter === 'period' ? p.payload?.kind === 'period'
      : true
    );

    list.innerHTML = filtered.map(p => `
      <li>
        <button class="list-item" type="button" data-buy-others="${p.id}">
          <div class="li-main">
            <div class="li-title">${p.title}</div>
            <div class="li-sub">${p.sub}</div>
          </div>
        </button>
      </li>
    `).join('');

    list.querySelectorAll('[data-buy-others]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = BUY_OTHERS_PRODUCTS.find(x => x.id === btn.dataset.buyOthers);
        if (!p) return;
        pendingPickup = p;
        openSheet('Bekreft kjøp');
        sumTitleEl.textContent = p.title;
        sumAreaEl.textContent  = p.sub;
        sumPriceEl.textContent = '—';
        sumTravEl.textContent  = 'Kjøp til andre';
        current = 'summary';
        setPanels(panelSum);
      });
    });
  }

    qs('#btn-buy-others')?.addEventListener('click', () => {
    buyForOthers = true;

    document.body.classList.add('is-buying-for-others'); // <— NYTT

    // (valgfritt) beholde denne for safety, men CSS'en håndterer skjul:
    if (btnBuyOthers) btnBuyOthers.hidden = true;

    openSheet('Kjøp til andre');
    current = 'type';
    setPanels(panelType);
});

    /* ===========================================================
   *  KJØP (lagre billett / hentekode + recent + kvittering)
   * =========================================================== */
  btnConfirm.addEventListener('click', () => {
    // KJØP TIL ANDRE → hentekode
    if (buyForOthers) {
      const latest = createPickupFromState();
      buyForOthers = false;
      pendingPickup = null;
      renderPickups();
      renderTickets();

      document.body.classList.remove('is-buying-for-others');
      if (btnBuyOthers) btnBuyOthers.hidden = false;

      if (latest) openPickupDetail(latest.id);
      else closeSheet();
      return;
    }

    // VANLIG KJØP → billett + kvittering
    const title     = sumTitleEl.textContent.trim();
    const area      = sumAreaEl.textContent.trim();
    const travelers = sumTravEl.textContent.trim();
    const start     = customStart ? new Date(customStart) : new Date();

    let type = 'single';
    let durationMs;
    if (periodProduct) {
      type = 'period';
      durationMs = PERIOD_VALIDITY_MS[periodProduct.id] ?? (7 * 24 * 60 * 60 * 1000);
    } else {
      durationMs = SINGLE_VALIDITY_MIN * 60 * 1000;
    }
    const end = new Date(start.getTime() + durationMs);

    // 1) Lagre billett
    const ticket = {
      id: genId(),
      type,
      title,
      area,
      travelers,
      startISO: start.toISOString(),
      endISO:   end.toISOString(),
      durMs:    durationMs,
    };

    const all = loadTickets();
    all.push(ticket);
    saveTickets(all);

    // 2) Lagre kvittering
    const receipt = {
      id: genId(),
      title,
      amount: sumPriceEl.textContent.trim(), // f.eks. "45 kr"
      area,
      travelers,
      purchasedISO: new Date().toISOString(),
    };

    const receipts = loadReceipts();
    receipts.push(receipt);
    saveReceipts(receipts);

    
    addRecent(buildRecentFromCurrent());
    renderTickets();
    customStart = null;
    closeSheet();
    btnBuyOthers.hidden = false;
  });

  

  /* ===========================================================
   *  STORAGE (billetter/historikk)
   * =========================================================== */
  function loadTickets(){ try { return JSON.parse(localStorage.getItem(TKEY) || '[]'); } catch { return []; } }
  function saveTickets(arr){ localStorage.setItem(TKEY, JSON.stringify(arr)); }
  function loadHistory(){ try { return JSON.parse(localStorage.getItem(TKEY_HISTORY) || '[]'); } catch { return []; } }
  function saveHistory(arr){ localStorage.setItem(TKEY_HISTORY, JSON.stringify(arr)); }

  function moveExpiredToHistory(){
    const now = new Date();
    const all = loadTickets();
    const still = [];
    const hist = loadHistory();
    all.forEach(t=>{
      const ended = new Date(t.endISO) <= now;
      if (ended){
        if (!t.expiredAtISO) t.expiredAtISO = new Date().toISOString();
        hist.push(t);
      } else {
        still.push(t);
      }
    });
    if (still.length !== all.length){
      saveTickets(still);
      saveHistory(hist.sort((a,b)=> new Date(b.endISO)-new Date(a.endISO)));
    }
  }

  /* ===========================================================
   *  STATEVISNING / TICKET-DETALJ
   * =========================================================== */
    function formatLeft(ms) {
      if (ms <= 0) return 'Utløpt';

    const totalSec = Math.floor(ms / 1000);
    const totalMin = Math.floor(totalSec / 60);
    const totalHrs = Math.floor(totalMin / 60);
    const days     = Math.floor(totalHrs / 24);

  if (days >= 1) {
    const hrs = totalHrs % 24;
    return `${days} ${days === 1 ? 'dag' : 'dager'}${hrs > 0 ? ` ${hrs} t` : ''} igjen`;
  }

  if (totalHrs >= 1) {
    const min = totalMin % 60;
    return `${totalHrs} t${min > 0 ? ` ${min} min` : ''} igjen`;
  }

  // Under 1 time: vis minutter + sekunder
  if (totalMin >= 1) {
    const sec = totalSec % 60;
    return `${totalMin} min ${sec} s igjen`;
  }

  // Under 1 minutt: vis kun sekunder
  return `${totalSec} s igjen`;
}

  function ticketDurationMs(t) {
    return t?.durMs ?? (new Date(t.endISO) - new Date(t.startISO));
  }
  function ticketState(t, now = new Date()) {
    const start = new Date(t.startISO);
    const end   = new Date(t.endISO);
    if (now < start) return { kind: 'future',  msg: `Billetten din starter om ${formatLeft(start - now).replace(' igjen','')}` };
    if (now >= end)  return { kind: 'expired', msg: 'Utløpt' };
    return { kind: 'active', msg: `${formatLeft(end - now)}` };
  }

  function lockDetailActionsByState(t) {
    const st = ticketState(t);
    const isFuture = st.kind === 'future';

    if (tdStartNow)    { tdStartNow.hidden    = !isFuture; tdStartNow.disabled    = !isFuture; }
    if (tdChangeStart) { tdChangeStart.hidden = !isFuture; tdChangeStart.disabled = !isFuture; }
    if (tdCancel)      { tdCancel.hidden      = !isFuture; tdCancel.disabled      = !isFuture; }

    if (tdQR) tdQR.hidden = st.kind !== 'active';

    const end = new Date(t.endISO);
    if (tdEnd) {
      tdEnd.hidden = st.kind !== 'active';
      if (!tdEnd.hidden) tdEnd.textContent = `Gyldig til ${fmtCompact(end)}`;
    }
  }

  function openTicketDetail(ticketId) {
    const list = loadTickets();
    const t = list.find(x => x.id === ticketId);
    if (!t) return;

    editingTicketId = t.id;

    const start = new Date(t.startISO);
    const st    = ticketState(t);

    titleEl.textContent = 'Billetten din';
    if (tdTitle)  tdTitle.textContent  = t.title || (t.type === 'period' ? 'Periodebillett' : 'Enkeltbillett');
    if (tdStatus) tdStatus.textContent = st.msg;
    if (tdTrav)   tdTrav.textContent   = t.travelers || '—';
    if (tdArea)   tdArea.textContent   = t.area || '—';
    if (tdStart)  tdStart.textContent  = `Starter ${fmtCompact(start)}`;

    lockDetailActionsByState(t);

    openSheet('Billetten din');
    current = 'ticket-detail';
    setPanels(panelTicketDetail);
  }

  tdStartNow?.addEventListener('click', () => {
    const list = loadTickets();
    const ix = list.findIndex(x => x.id === editingTicketId);
    if (ix < 0) return;
    if (ticketState(list[ix]).kind !== 'future') return;

    const dur = ticketDurationMs(list[ix]);
    const now = new Date();
    list[ix].startISO = now.toISOString();
    list[ix].endISO   = new Date(now.getTime() + dur).toISOString();
    saveTickets(list);
    renderTickets();
    openTicketDetail(editingTicketId);
  });

  tdChangeStart?.addEventListener('click', () => {
    const t = loadTickets().find(x => x.id === editingTicketId);
    if (!t || ticketState(t).kind !== 'future') return;
    timepickerFor = 'edit';
    openTimePicker();
  });

  tdCancel?.addEventListener('click', () => {
    const list = loadTickets();
    const ix   = list.findIndex(x => x.id === editingTicketId);
    if (ix < 0) return;
    if (ticketState(list[ix]).kind !== 'future') return;

    saveTickets(list.filter(x => x.id !== editingTicketId));
    renderTickets();
    closeSheet();
  });

  /* ===========================================================
   *  TIDSVELGER
   * =========================================================== */
  startdateBtn?.addEventListener('click', () => {
    timepickerFor = 'new';
    openTimePicker();
  });

  function openTimePicker(){
  titleEl.textContent = t("ticket.time_heading"); // nøkkel finnes i LANG
  populatePicker();
  current = 'timepicker';
  setPanels(panelTimePicker);
  }

  function populatePicker(){
    const dates = buildDates();
    colDate.innerHTML   = dates.map(d => `<div class="opt" data-date="${d.date.toISOString()}">${d.label}</div>`).join('');
    colHour.innerHTML   = Array.from({length:24}, (_,h)=>`<div class="opt" data-hour="${h}">${String(h).padStart(2,'0')}</div>`).join('');
    colMinute.innerHTML = Array.from({length:60}, (_,m)=>`<div class="opt" data-minute="${m}">${String(m).padStart(2,'0')}</div>`).join('');

    const base = (timepickerFor === 'edit' && editingTicketId)
      ? new Date(loadTickets().find(x => x.id === editingTicketId)?.startISO || Date.now())
      : (customStart ? new Date(customStart) : new Date());

    scrollToValue(colDate,   el => sameDay(new Date(el.dataset.date), base));
    scrollToValue(colHour,   el => Number(el.dataset.hour)   === base.getHours());
    scrollToValue(colMinute, el => Number(el.dataset.minute) === base.getMinutes());

    renderLimitText();
  }

  tpNow?.addEventListener('click', () => {
    const now = new Date();
    scrollToValue(colDate,   el => sameDay(new Date(el.dataset.date), now));
    scrollToValue(colHour,   el => Number(el.dataset.hour)   === now.getHours());
    scrollToValue(colMinute, el => Number(el.dataset.minute) === now.getMinutes());
    renderLimitText();
  });

    function renderLimitText(){
    const max = maxStart();
    const locale = getLocale();
    const time = max.toLocaleTimeString(locale, {
      hour:'2-digit', minute:'2-digit'
    });

    tpLimit.textContent =
      `${t("ticket.time_limit_prefix")} ${fmtDateHuman(max)} ${time}`;
  }

  function updateCountdownsTick() {
  const now = new Date();
  const items = loadTickets();

  // Oppdater status i karusellen (aktive billetter)
  const active = items.filter(t => now >= new Date(t.startISO) && now < new Date(t.endISO));
  active.forEach(t => {
    const statusEl = tcTrack?.querySelector(`.carousel__slide[data-id="${t.id}"] .ticket__status`);
    if (statusEl) {
      const ms = new Date(t.endISO) - now;
      statusEl.textContent = formatLeft(ms);
    }
  });

  // Oppdater detaljvisning hvis den er åpen
  if (current === 'ticket-detail' && editingTicketId) {
    const t = items.find(x => x.id === editingTicketId);
    if (t) {
      const st = ticketState(t, now);
      if (tdStatus) tdStatus.textContent = st.msg;
      lockDetailActionsByState(t); // viser/skjuler QR / knapper korrekt
    }
  }
}

  function getSelectedDateTime(){
    const date = nearest(colDate,   v => new Date(v.dataset.date));
    const hour = nearest(colHour,   v => Number(v.dataset.hour));
    const min  = nearest(colMinute, v => Number(v.dataset.minute));
    const d = new Date(date);
    d.setHours(hour); d.setMinutes(min); d.setSeconds(0); d.setMilliseconds(0);
    return clampToLimit(d);
  }

  [colDate, colHour, colMinute].forEach(col=>{
    col.addEventListener('scroll', debounce(renderLimitText, 120), {passive:true});
  });

  tpConfirm?.addEventListener('click', ()=>{
    const picked = getSelectedDateTime();

    if (timepickerFor === 'edit' && editingTicketId) {
      const list = loadTickets();
      const ix = list.findIndex(x => x.id === editingTicketId);
      if (ix >= 0) {
        const dur = list[ix].durMs || (new Date(list[ix].endISO) - new Date(list[ix].startISO));
        list[ix].startISO = picked.toISOString();
        list[ix].endISO   = new Date(picked.getTime() + dur).toISOString();
        saveTickets(list);
        renderTickets();
        openTicketDetail(editingTicketId);
      }
      timepickerFor = null;
      return;
    }

    customStart = picked;
    startdateBtn.textContent = fmtCompact(customStart);
    titleEl.textContent = '';
    current = 'summary';
    setPanels(panelSum);
  });

  /* ===========================================================
   *  RENDER AV BILLETTER / KARUSELL
   * =========================================================== */
  function tcGoTo(i) {
    if (!tcTickets.length) return;
    tcIndex = Math.max(0, Math.min(i, tcTickets.length - 1));
    tcTrack.style.transform = `translateX(-${tcIndex * 100}%)`;
    [...tcDots.children].forEach((b, ix) => b.setAttribute('aria-selected', String(ix === tcIndex)));
  }

  function buildActiveCarousel(tickets) {
    tcTickets = tickets.slice();

    tcTrack.innerHTML = tcTickets.map((t, ix) => {
      const start = new Date(t.startISO);
      const end   = new Date(t.endISO);
      const left  = formatLeft(end - new Date());
      return `
        <article class="carousel__slide" data-id="${t.id}" aria-roledescription="slide" aria-label="Billett ${ix+1} av ${tcTickets.length}">
          <div class="ticket__row">
            <div>
              <div class="ticket__title">${t.title}</div>
              <div class="ticket__meta">${t.travelers} • ${t.area}</div>
            </div>
            <div class="ticket__qr">QR</div>
          </div>
          <div class="ticket__row">
            <div class="ticket__meta">Gyldig fra ${fmtCompact(start)}</div>
            <div class="ticket__status">${left}</div>
          </div>
        </article>
      `;
    }).join('');

    tcTrack.onclick = (e) => {
      const slide = e.target.closest('.carousel__slide');
      if (slide?.dataset.id) openTicketDetail(slide.dataset.id);
    };

    tcDots.innerHTML = tcTickets
      .map((_,ix)=>`<button class="carousel__dot" role="tab" aria-selected="${ix===0?'true':'false'}" data-ix="${ix}" aria-label="Billett ${ix+1}"></button>`)
      .join('');

    tcTrack.style.transition = 'transform 220ms ease-out';
    tcGoTo(0);
  }

  function bindCarouselListenersOnce() {
    if (carouselBound) return;

    tcDots.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ix]');
      if (!b) return;
      tcGoTo(Number(b.dataset.ix));
    });

    // Touch swipe
    let sx = 0, dx = 0, dragging = false;
    tcViewport.addEventListener('touchstart', (e) => {
      if (!tcTickets.length) return;
      dragging = true;
      sx = e.touches[0].clientX; dx = 0;
      tcTrack.style.transition = 'none';
    }, { passive: true });

    tcViewport.addEventListener('touchmove', (e) => {
      if (!dragging) return;
      dx = e.touches[0].clientX - sx;
      tcTrack.style.transform = `translateX(calc(${-tcIndex*100}% + ${dx}px))`;
    }, { passive: true });

    tcViewport.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      tcTrack.style.transition = '';
      if (Math.abs(dx) > 40) tcGoTo(tcIndex + (dx < 0 ? 1 : -1));
      else tcGoTo(tcIndex);
    });

    carouselBound = true;
  }

  function renderTickets(){
    moveExpiredToHistory();

    const items = loadTickets().sort((a,b)=> new Date(a.startISO) - new Date(b.startISO));
    const now = new Date();

    const active   = items.filter(t => now >= new Date(t.startISO) && now < new Date(t.endISO));
    const upcoming = items.filter(t => now <  new Date(t.startISO));

    if (active.length) {
      ticketCarousel.hidden = false;
      emptyCard.hidden = true;
      buildActiveCarousel(active);
    } else {
      ticketCarousel.hidden = true;
      emptyCard.hidden = false;
      tcTrack.innerHTML = ''; tcDots.innerHTML = '';
    }

    ticketList.innerHTML = '';
    const toList = [...upcoming].sort((a,b)=> new Date(b.startISO) - new Date(a.startISO));

    toList.forEach(t=>{
      const start = new Date(t.startISO);
      const status = `Starter ${fmtCompact(start)}`;
      const el = document.createElement('article');
      el.className = 'ticket';
      el.innerHTML = `
        <div class="ticket__row">
          <div>
            <div class="ticket__title">${t.title}</div>
            <div class="ticket__meta">${t.travelers} • ${t.area}</div>
          </div>
          <div class="ticket__qr">QR</div>
        </div>
        <div class="ticket__row">
          <div class="ticket__meta">Gyldig fra ${fmtCompact(start)}</div>
          <div class="ticket__status">${status}</div>
        </div>
      `;
      el.dataset.id = t.id;
      el.addEventListener('click', () => openTicketDetail(t.id));
      ticketList.appendChild(el);
    });
  }

  /* ===========================================================
   *  NAVIGASJON (Back / Close / Esc / Overlay)
   * =========================================================== */
    function closeSheetAndReset() {
    sheet.hidden = true;
    current = null;
    titleEl.textContent = 'Velg billett';
    timepickerFor = null;
    buyForOthers = false;
    pendingPickup = null;

    document.body.classList.remove('is-buying-for-others'); // <— NYTT

    if (btnBuyOthers) {
        btnBuyOthers.hidden = false;
        btnBuyOthers.style.display = ''; // rydder bort evt. inline display
    }
    }

  function handleBack() {
    if (current === 'timepicker'){ setPanels(panelSum); current='summary'; titleEl.textContent=''; return; }
    if (current === 'period-products'){ setPanels(panelPeriodTrav); current='period-traveler'; titleEl.textContent='Periodebillett'; return; }
    if (current === 'period-traveler'){ setPanels(panelType); current='type'; titleEl.textContent='Velg billett'; return; }
    if (current === 'single-travelers'){ setPanels(panelSingle); current='single'; titleEl.textContent='Enkeltbillett'; return; }
    if (current === 'single'){ setPanels(panelType); current='type'; titleEl.textContent='Velg billett'; return; }

    if (current === 'summary') {
      if (pendingPickup) {
        setPanels(buyOthersPanel);
        current = 'buy-others';
        titleEl.textContent = 'Kjøp til andre';
        return;
      }
      if (chosenProduct) { setPanels(panelTrav); current='single-travelers'; titleEl.textContent='Enkeltbillett'; return; }
      if (periodProduct || periodTraveler) { setPanels(panelPeriodProd); current='period-products'; titleEl.textContent='Periodebillett'; return; }
    }
    if (current === 'quick-all'){ setPanels(panelType); current='type'; titleEl.textContent='Velg billett'; return; }
    if (current === 'ticket-detail'){ closeSheetAndReset(); return; }
    if (current === 'buy-others'){ setPanels(panelType); current='type'; titleEl.textContent='Velg billett'; return; }
    closeSheetAndReset();
  }

  backBtn?.addEventListener('click', handleBack);
  closeBtn?.addEventListener('click', closeSheetAndReset);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) closeSheetAndReset(); });
  sheet.addEventListener('click', (e) => {
    const body = sheet.querySelector('.sheet__body');
    if (body && !body.contains(e.target)) closeSheetAndReset();
  });

  /* ===========================================================
   *  TYPE-PANEL START / “KJØP TIL ANDRE” OPPLEVELSE
   * =========================================================== */
  qs('[data-type="single"]', panelType)?.addEventListener('click', () => {
    titleEl.textContent = 'Enkeltbillett';
    current = 'single';
    setPanels(panelSingle);
  });
  qs('[data-type="period"]', panelType)?.addEventListener('click', () => {
    titleEl.textContent = 'Periodebillett';
    renderPeriodTravelers();
    current = 'period-traveler';
    setPanels(panelPeriodTrav);
  });

  // (Valgfri demo)
  qsa('[data-quick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-quick');
      if (key === 'single-osf') {
        openSheet('Enkeltbillett');
        selectSingle('osf', { adult:1 });
      } else if (key === 'single-ng') {
        openSheet('Enkeltbillett');
        selectSingle('ng', { adult:1 });
      } else if (key === 'period-30-student') {
        openSheet('Periodebillett');
        renderPeriodTravelers();
        current = 'period-traveler';
        setPanels(panelPeriodTrav);
      }
    });
  });

  btnNew?.addEventListener('click', () => {
    openSheet('Velg billett');
    current = 'type';
    setPanels(panelType);
  });

  /* ===========================================================
   *  INIT
   * =========================================================== */
  bindCarouselListenersOnce();
  renderPickups();
  renderTickets();
  renderQuickShort();
  setInterval(renderTickets, 30_000);
  setInterval(updateCountdownsTick, 1000);
});
