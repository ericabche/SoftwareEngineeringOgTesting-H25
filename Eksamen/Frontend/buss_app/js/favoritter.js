/* =========================================================
   Favoritter – enkel klient-lagring (localStorage)
   ========================================================= */
const LS_KEY = "favs:v1";

/* DOM */
const dlgSearch   = document.getElementById('dlg-search');
const btnOpen     = document.getElementById('btn-open');
const btnClose1   = document.getElementById('btn-close-1');
const inputQ      = document.getElementById('q');
const btnClr      = document.getElementById('clear-q');
const recentUL    = document.getElementById('recent');
const resultsUL   = document.getElementById('results');
const resTitle    = document.getElementById('res-title');

const dlgSave     = document.getElementById('dlg-save');
const formSave    = document.getElementById('form-save');
const btnBack     = document.getElementById('btn-back');
const btnCancel   = document.getElementById('btn-cancel');

const sectionEmpty = document.getElementById('empty');
const sectionLists = document.getElementById('fav-lists');
const ulAddresses  = document.getElementById('fav-addresses');
const ulStops      = document.getElementById('fav-stops');
const hAddr        = document.getElementById('addresses-title');
const hStops       = document.getElementById('stops-title');

/* State */
let state = loadState();
let pendingSelection = null; // {title, meta, type:'address'|'stop'}

function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return { addresses:[], stops:[] };
    const p = JSON.parse(raw);
    return {
      addresses: Array.isArray(p.addresses)? p.addresses : [],
      stops:     Array.isArray(p.stops)?     p.stops     : []
    };
  }catch{ return { addresses:[], stops:[] }; }
}
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

/* Render */
function render(){
  const hasA = state.addresses.length>0;
  const hasS = state.stops.length>0;
  const hasAny = hasA || hasS;

  sectionEmpty.hidden = hasAny;
  sectionLists.hidden = !hasAny;

  // Adresser
  hAddr.hidden = !hasA;
  ulAddresses.hidden = !hasA;
  ulAddresses.innerHTML = hasA ? state.addresses.map(rowHTML).join('') : "";

  // Stoppesteder
  hStops.hidden = !hasS;
  ulStops.hidden = !hasS;
  ulStops.innerHTML = hasS ? state.stops.map(rowHTML).join('') : "";
}
function rowHTML(item){
  return `
    <li>
      <a href="#" class="list-item" data-id="${item.id}">
        <div>
          <div class="title">${escapeHtml(item.title)}</div>
          ${item.meta ? `<div class="meta">${escapeHtml(item.meta)}</div>` : ""}
        </div>
      </a>
    </li>
  `;
}

/* Mock “Sist brukte” (stoppesteder) */
const recentData = [
  { title:'Sykehuset Østfold Kalnes', meta:'Sarpsborg, Østfold · 68.8 km', type:'stop' },
  { title:'Halden bussterminal',      meta:'Halden, Østfold · 95.8 km',   type:'stop' },
  { title:'Remmen Høgskolen',         meta:'Halden, Østfold · 94.2 km',   type:'stop' },
  { title:'Fredrikstad bussterminal', meta:'Fredrikstad, Østfold · 79.4 km', type:'stop' },
  { title:'Sarpsborg bussterminal',   meta:'Sarpsborg, Østfold · 73.6 km', type:'stop' },
  { title:'Remmen',                   meta:'Halden, Østfold · 94.5 km',   type:'stop' }
];
recentUL.innerHTML = recentData.map(i => `
  <li tabindex="0" data-title="${escapeHtml(i.title)}" data-meta="${escapeHtml(i.meta)}" data-type="${i.type}">
    <span class="title">${escapeHtml(i.title)}</span>
    <span class="meta">${escapeHtml(i.meta)}</span>
  </li>
`).join('');

/* Søk – enkel filter over recentData */
inputQ.addEventListener('input', () => {
  const q = inputQ.value.trim().toLowerCase();
  if(!q){
    resultsUL.innerHTML = ""; resTitle.hidden = true; return;
  }
  const found = recentData.filter(x => x.title.toLowerCase().includes(q));
  resultsUL.innerHTML = found.map(i => `
    <li tabindex="0" data-title="${escapeHtml(i.title)}" data-meta="${escapeHtml(i.meta)}" data-type="${i.type}">
      <span class="title">${escapeHtml(i.title)}</span>
      <span class="meta">${escapeHtml(i.meta)}</span>
    </li>
  `).join('');
  resTitle.hidden = found.length === 0;
});
btnClr.addEventListener('click', () => {
  inputQ.value = ''; inputQ.focus(); resultsUL.innerHTML = ''; resTitle.hidden = true;
});

/* Åpne/lukke dialoger */
btnOpen.addEventListener('click', () => dlgSearch.showModal());
btnClose1.addEventListener('click', () => dlgSearch.close());
dlgSearch.addEventListener('cancel', e => { e.preventDefault(); dlgSearch.close(); });

btnBack.addEventListener('click', () => { dlgSave.close(); dlgSearch.showModal(); });
btnCancel.addEventListener('click', () => dlgSave.close());
dlgSave.addEventListener('cancel', e => { e.preventDefault(); dlgSave.close(); });

/* Velg rad → åpne “lagre som” */
function handlePick(e){
  const li = e.target.closest('li'); if(!li) return;
  pendingSelection = {
    title: li.dataset.title || li.querySelector('.title')?.textContent?.trim() || '',
    meta:  li.dataset.meta  || li.querySelector('.meta') ?.textContent?.trim() || '',
    type: (li.dataset.type === 'stop') ? 'stop' : 'address'
  };
  dlgSave.showModal();
}
recentUL.addEventListener('click', handlePick);
resultsUL.addEventListener('click', handlePick);
recentUL.addEventListener('keydown', e => { if(e.key==='Enter') handlePick(e); });
resultsUL.addEventListener('keydown', e => { if(e.key==='Enter') handlePick(e); });

/* Lagre – lytt på submit (slipper id på knappen) */
formSave.addEventListener('submit', (e) => {
  e.preventDefault();
  if(!pendingSelection){ dlgSave.close(); return; }

  const id = cryptoRandomId();
  const entry = { id, title: pendingSelection.title, meta: pendingSelection.meta };

  if(pendingSelection.type === 'stop') state.stops.push(entry);
  else                                 state.addresses.push(entry);

  saveState();
  render();

  // rydd
  pendingSelection = null;
  dlgSave.close(); dlgSearch.close();
  inputQ.value = ''; resultsUL.innerHTML = ''; resTitle.hidden = true;
});

/* Init */
render();

/* Utils */
function cryptoRandomId(){
  if (window.crypto?.getRandomValues){
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return (a[0].toString(36)+a[1].toString(36)).slice(0,16);
  }
  return Math.random().toString(36).slice(2,10);
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}