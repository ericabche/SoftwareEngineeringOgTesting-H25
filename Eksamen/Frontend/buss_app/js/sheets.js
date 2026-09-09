(() => {
  'use strict';

  // Kjør bare på reise-siden
  if (!document.body.classList.contains('page-reise')) return;

  /* ==========================================================
     DUMMYDATA
     ========================================================== */

  // Favoritter (bare frontend for nå)
  const dummyFavorites = [
    { id: 1, name: "Hjem", address: "Oscars gate 12, Fredrikstad" },
    { id: 2, name: "Jobb", address: "Remmen Høgskolen, Halden" },
    { id: 3, name: "Sarpsborg bussterminal", address: "Sarpsborg" }
  ];

  // Avganger – mappet per stoppnavn
  const dummyDepartures = {
    "Fredrikstad bussterminal": [
      { line: "3",   dest: "Kråkerøy",  in: "3 min", delay: "2 min forsinket"  },
      { line: "7",   dest: "Sarpsborg", in: "11 min", delay: "I rute"         },
      { line: "114", dest: "Moss",      in: "18 min", delay: "1 min forsinket"},
    ],
    "Sarpsborg bussterminal": [
      { line: "1",   dest: "Hafslundsøy", in: "5 min",  delay: "I rute" },
      { line: "3",   dest: "Fredrikstad", in: "12 min", delay: "3 min forsinket" },
      { line: "200", dest: "Halden",      in: "25 min", delay: "I rute" },
    ],
    "Remmen Høgskolen": [
      { line: "200", dest: "Sarpsborg", in: "7 min",  delay: "I rute" },
      { line: "300", dest: "Oslo",      in: "32 min", delay: "5 min forsinket" },
    ]
  };

  // Reiser – nøkkel "Fra→Til"
  const dummyJourneys = {
    "Fredrikstad bussterminal→Sarpsborg bussterminal": [
      {
        id: 1,
        time: "17:53 – 18:46",
        original: "17:41 – 18:46",
        duration: "53 min",
      },
      {
        id: 2,
        time: "18:36 – 19:35",
        original: "18:35 – 19:35",
        duration: "58 min",
      }
    ],

    "Sarpsborg bussterminal→Halden bussterminal": [
      {
        id: 1,
        time: "18:10 – 19:05",
        original: "18:00 – 19:05",
        duration: "55 min",
      },
      {
        id: 2,
        time: "19:05 – 20:00",
        original: "19:00 – 20:00",
        duration: "55 min",
      }
    ],

    "Remmen Høgskolen→Sarpsborg bussterminal": [
      {
        id: 1,
        time: "07:32 – 08:10",
        original: "07:30 – 08:10",
        duration: "38 min",
      }
    ]
  };

  /* ==========================================================
     SHEET / KART-DRAG
     ========================================================== */

  const MIN = 20;
  const MAX = 80;
  const SPEED = 0.12;
  const SNAP_POINTS = [20, 60, 80];
  const SNAP_THRESH = 6;

  const root  = document.documentElement;
  const map   = document.getElementById('map');
  const sheet = document.getElementById('sheet');
  const grab  = document.getElementById('grab');

  let mapH = 60;
  let dragging = false;
  let lastY = 0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const setMapH = (vh) => {
    mapH = clamp(vh, MIN, MAX);
    root.style.setProperty('--mapH', mapH + 'vh');
  };

  function snap() {
    let nearest = SNAP_POINTS[0], best = Infinity;
    for (const p of SNAP_POINTS) {
      const d = Math.abs(mapH - p);
      if (d < best) { best = d; nearest = p; }
    }
    if (best <= SNAP_THRESH) setMapH(nearest);
  }

  let idle;
  const requestSnap = () => { clearTimeout(idle); idle = setTimeout(snap, 120); };

  if (grab) {
    const startDrag = (y) => {
      dragging = true;
      lastY = y;
      map?.classList.add('dragging');
      sheet?.classList.add('dragging');
    };
    const moveDrag  = (y) => {
      if (!dragging) return;
      const dy = y - lastY;
      lastY = y;
      const deltaVh = (dy / window.innerHeight) * 100;
      setMapH(mapH + deltaVh);
    };
    const endDrag   = () => {
      if (!dragging) return;
      dragging = false;
      map?.classList.remove('dragging');
      sheet?.classList.remove('dragging');
      snap();
    };

    grab.addEventListener('touchstart', e => startDrag(e.touches[0].clientY), { passive: true });
    grab.addEventListener('touchmove',  e => moveDrag(e.touches[0].clientY),  { passive: true });
    grab.addEventListener('touchend', endDrag);
    grab.addEventListener('mousedown', e => startDrag(e.clientY));
    window.addEventListener('mousemove', e => moveDrag(e.clientY));
    window.addEventListener('mouseup', endDrag);
  }

  if (sheet) {
    sheet.addEventListener('wheel', (e) => {
      const atTop = sheet.scrollTop <= 0;

      if (atTop && e.deltaY < 0 && mapH < MAX) {
        setMapH(mapH + Math.abs(e.deltaY) * SPEED);
        requestSnap();
        e.preventDefault();
      } else if (atTop && e.deltaY > 0 && mapH > MIN) {
        setMapH(mapH - Math.abs(e.deltaY) * SPEED);
        requestSnap();
        e.preventDefault();
      } else if (!atTop && e.deltaY > 0 && mapH > MIN + 0.5) {
        setMapH(Math.max(MIN, mapH - Math.abs(e.deltaY) * SPEED * 0.4));
        requestSnap();
      }
    }, { passive: false });

    let touchStartY = 0;
    sheet.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    sheet.addEventListener('touchmove', (e) => {
      const y = e.touches[0].clientY;
      const dy = y - touchStartY;
      const atTop = sheet.scrollTop <= 0;

      if (atTop && dy > 0 && mapH < MAX) {
        setMapH(mapH + (dy / window.innerHeight) * 100 * 0.8);
        requestSnap();
        e.preventDefault();
      } else if (atTop && dy < 0 && mapH > MIN) {
        setMapH(mapH + (dy / window.innerHeight) * 100 * 0.8); // dy < 0
        requestSnap();
        e.preventDefault();
      } else if (!atTop && dy < 0 && mapH > MIN + 0.5) {
        setMapH(Math.max(MIN, mapH + (dy / window.innerHeight) * 100 * 0.3));
        requestSnap();
      }
    }, { passive: false });
  }

  /* ==========================================================
     DOM-REFERANSER
     ========================================================== */

  const btnJourney    = document.getElementById('btn-journey');
  const btnDepartures = document.getElementById('btn-departures');

  const nearbyBox     = document.getElementById('nearby');
  const favBox        = document.getElementById('favorites');
  const departuresBox = document.getElementById('departures');
  const inputFrom     = document.getElementById('from');
  const inputTo       = document.getElementById('to');
  const resultsBox    = document.getElementById('journey-results');
  const journeyList   = document.getElementById('journey-list');
  const searchBox     = document.getElementById('search-box');
  const swapBtn       = document.getElementById('btn-swap');

  // Sanntidsstripe
  const liveStatus      = document.getElementById('live-status');
  const liveStatusLine  = document.getElementById('live-status-line');
  const liveStatusExtra = document.getElementById('live-status-extra');

  let lastST = 0;
  let currentMode = 'journey';

  /* ==========================================================
     MODUS: FINN REISE / SE AVGANGER
     ========================================================== */

  function setMode(mode) {
    currentMode = mode;
    const isDepartures = mode === 'departures';

    // Aktiv fane + aria-pressed
    btnJourney.classList.toggle('active', !isDepartures);
    btnDepartures.classList.toggle('active', isDepartures);
    btnJourney.setAttribute('aria-pressed', String(!isDepartures));
    btnDepartures.setAttribute('aria-pressed', String(isDepartures));

    // Skjul "Til" + bytte-om-knappen i Se avganger
    const toWrap = document.getElementById('to-wrap');
    toWrap?.classList.toggle('hidden', isDepartures);
    swapBtn?.classList.toggle('hidden', isDepartures);

    // Skjul "I nærheten" og "Favoritter" i Se avganger
    nearbyBox.classList.toggle('hidden', isDepartures);
    favBox.classList.toggle('hidden', isDepartures);

    // Vis / skjul avganger-boksen
    departuresBox.hidden = !isDepartures;

    // Skjul reiseresultater i Se avganger
    if (resultsBox) resultsBox.hidden = isDepartures;

    // Sanntidsstripe: skjul i Finn reise, vises når vi har avganger
    if (!isDepartures && liveStatus) {
      liveStatus.hidden = true;
    }

    // Placeholder
    inputFrom.placeholder = isDepartures ? 'Velg stoppested' : 'Din posisjon';

    // Compact-modus bare i Finn reise
    if (searchBox && sheet) {
      const shouldCompact = !isDepartures && sheet.scrollTop > 120;
      searchBox.classList.toggle('compact', shouldCompact);
    }
  }

  btnJourney?.addEventListener('click', () => setMode('journey'));
  btnDepartures?.addEventListener('click', () => {
    setMode('departures');
    // i Se avganger bruker vi Fra-feltet som stopp
    renderDepartures(mockFetchDepartures(inputFrom.value || 'Sarpsborg bussterminal'));
  });

  setMode('journey');

  // Sticky/compact ved scroll – gjelder bare i Finn reise
  if (sheet && searchBox) {
    sheet.addEventListener('scroll', () => {
      const st = sheet.scrollTop;

      if (currentMode === 'journey') {
        if (st > lastST && st > 120) {
          searchBox.classList.add('compact');
        }
        if (st < lastST || st < 40) {
          searchBox.classList.remove('compact');
        }
      }
      lastST = st;
    });
  }

  /* ==========================================================
     AVGANGER (dummy) + SANNTIDSSTRIPE
     ========================================================== */

  function mockFetchDepartures(stopName) {
    return dummyDepartures[stopName] || [];
  }

  function updateLiveStatusFromDeparture(stopName, rows) {
    if (!liveStatus || !liveStatusLine || !liveStatusExtra) return;

    if (!rows || rows.length === 0) {
      liveStatus.hidden = true;
      return;
    }

    const first = rows[0];
    liveStatusLine.textContent  = `Buss ${first.line} fra ${stopName}`;
    liveStatusExtra.textContent = `Ankomst om ${first.in} · ${first.delay || 'I rute'}`;
    liveStatus.hidden = false;
  }

  function renderDepartures(rows, stopName = '') {
    const ul = departuresBox.querySelector('.departures');
    if (!ul) return;

    if (!rows || rows.length === 0) {
      ul.innerHTML = `<li><div class="dest">Ingen avganger funnet</div></li>`;
      updateLiveStatusFromDeparture(stopName, []);
      return;
    }

    ul.innerHTML = rows.map(r => `
      <li>
        <div class="line">Buss ${r.line}</div>
        <div class="dest">Mot: ${r.dest}</div>
        <div class="time">${r.in}</div>
      </li>
    `).join('');

    updateLiveStatusFromDeparture(stopName, rows);
  }

  /* ==========================================================
     REISERESULTATER (dummy)
     ========================================================== */

  function renderJourneys(fromName, toName) {
    if (!resultsBox || !journeyList) return;

    const key = `${fromName}→${toName}`;
    const journeys = dummyJourneys[key] || [];

    if (!journeys.length) {
      resultsBox.hidden = false;
      journeyList.innerHTML = `
        <li>
          <p class="placeholder">Ingen reiser funnet for ${fromName} → ${toName}</p>
        </li>
      `;
      const t = document.getElementById('results-title');
      if (t) t.textContent = `Reiser fra ${fromName} → ${toName}`;
      return;
    }

    resultsBox.hidden = false;

    journeyList.innerHTML = journeys.map(j => `
      <li class="journey-card" data-journey-id="${j.id}">
        <div class="journey-main">
          <div class="journey-time">${j.time}</div>
          <div class="journey-sub">Opprinnelig ${j.original}</div>
        </div>
        <div class="journey-meta">
          <div class="journey-duration">${j.duration}</div>
          <div class="journey-chevron">›</div>
        </div>
      </li>
    `).join('');

    const title = document.getElementById('results-title');
    if (title) title.textContent = `Reiser fra ${fromName} → ${toName}`;

    if (sheet) {
      const top = resultsBox.offsetTop - 24;
      sheet.scrollTo({ top, behavior: 'smooth' });
    }
  }

  function maybeRenderJourneys() {
    if (inputFrom.value && inputTo.value) {
      renderJourneys(inputFrom.value, inputTo.value);
    } else if (resultsBox) {
      resultsBox.hidden = true;
    }
  }
  
  // Bytte-om-knapp med 180° animasjon
  swapBtn.addEventListener('click', () => {
    // Restart animasjonen
    swapBtn.classList.remove('spin');
    void swapBtn.offsetWidth; // force reflow
    swapBtn.classList.add('spin');

    // Bytt om inputverdier
    const tmp = inputFrom.value;
    inputFrom.value = inputTo.value;
    inputTo.value = tmp;

    maybeRenderJourneys();
  });

  // Hvis du senere lar brukeren skrive selv:
  inputFrom?.addEventListener('change', maybeRenderJourneys);
  inputTo?.addEventListener('change', maybeRenderJourneys);

  /* ==========================================================
     FAVORITTER (dummy) – klikkbar
     ========================================================== */

  function renderFavoritesBox() {
    const favoritesSection = document.getElementById('favorites');
    if (!favoritesSection) return;
    if (!dummyFavorites.length) return;

    favoritesSection.innerHTML = `
      <h2 id="favorites-title">Favoritter</h2>
      <ul class="cardlist">
        ${dummyFavorites.map(f => `
          <li class="card" data-fav-id="${f.id}">
            <div class="card__header">
              <h3 class="card__title">${f.name}</h3>
            </div>
            <p class="card__meta">${f.address}</p>
          </li>
        `).join('')}
      </ul>
    `;

    // Klikk på favorittkort: bruk som "Fra"
    favoritesSection.addEventListener('click', (e) => {
      const card = e.target.closest('[data-fav-id]');
      if (!card) return;

      const id   = Number(card.dataset.favId);
      const fav  = dummyFavorites.find(f => f.id === id);
      if (!fav) return;

      // Sett "Fra" til favoritten
      inputFrom.value = fav.name;

      if (currentMode === 'departures') {
        // I Se avganger: vis avganger fra denne favoritten
        const rows = mockFetchDepartures(fav.name);
        renderDepartures(rows, fav.name);
      } else {
        // I Finn reise: prøv å vise reiser hvis Til er satt
        maybeRenderJourneys();
      }

      // Scroll litt ned til resultater / avganger
      if (sheet && (resultsBox || departuresBox)) {
        const target = currentMode === 'departures' ? departuresBox : resultsBox;
        if (target && !target.hidden) {
          const top = target.offsetTop - 16;
          sheet.scrollTo({ top, behavior: 'smooth' });
        }
      }
    });
  }

  renderFavoritesBox();
  

})();
