// ===================== Felles konstanter =====================
const TKEY_TICKETS  = "mockTickets:v1";
const TKEY_HISTORY  = "mockTickets:history";
const TKEY_RECEIPTS = "mockTickets:receipts";
const LOGGED_KEY    = "mock:loggedIn";

// ===================== Felles helpers =====================
function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignorer feil, f.eks. full storage
  }
}

function formatDateTimeNo(d) {
  const datePart = d.toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${datePart} kl. ${timePart}`;
}

function formatMonthHeading(d) {
  const label = d.toLocaleDateString("no-NO", {
    month: "long",
    year: "numeric",
  }); // f.eks. "november 2025"
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// ===================== Flytt utløpte billetter til historikk =====================
function moveExpiredToHistory() {
  const now = new Date();
  const active = safeRead(TKEY_TICKETS, []);
  const history = safeRead(TKEY_HISTORY, []);

  const stillActive = [];
  active.forEach((t) => {
    const end = new Date(t.endISO);
    if (end <= now) {
      if (!t.expiredAtISO) {
        t.expiredAtISO = new Date().toISOString();
      }
      history.push(t);
    } else {
      stillActive.push(t);
    }
  });

  if (stillActive.length !== active.length) {
    safeWrite(TKEY_TICKETS, stillActive);
    history.sort((a, b) => new Date(b.endISO) - new Date(a.endISO));
    safeWrite(TKEY_HISTORY, history);
  }
}

// ===================== HISTORY: render kvitteringer =====================
function renderReceipts(container) {
  const receipts = safeRead(TKEY_RECEIPTS, []);

  container.innerHTML = "";

  if (!receipts.length) {
    container.innerHTML =
      `<p class="empty-text">Du har ingen kvitteringer.</p>`;
    return;
  }

  // sorter nyeste først
  receipts.sort(
    (a, b) => new Date(b.purchasedISO) - new Date(a.purchasedISO)
  );

  // grupper per måned
  const groups = new Map();
  receipts.forEach((r) => {
    const d = new Date(r.purchasedISO);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) {
      groups.set(key, {
        heading: formatMonthHeading(d),
        items: [],
      });
    }
    groups.get(key).items.push(r);
  });

  for (const [, group] of groups) {
    const h2 = document.createElement("h2");
    h2.className = "group-title";
    h2.textContent = group.heading;
    container.appendChild(h2);

    const ul = document.createElement("ul");
    ul.className = "cardlist";
    ul.setAttribute("aria-label", `Kvitteringer i ${group.heading}`);

    group.items.forEach((r) => {
      const d = new Date(r.purchasedISO);
      const li = document.createElement("li");

      li.innerHTML = `
        <article class="card receipt">
          <header class="card__header">
            <h3 class="card__title">${r.title || "Billett"}</h3>
            <div class="card__price">${r.amount || ""}</div>
          </header>
          <p class="card__meta">${formatDateTimeNo(d)}</p>
        </article>
      `;

      ul.appendChild(li);
    });

    container.appendChild(ul);
  }
}

// ===================== HISTORY: render utløpte billetter =====================
function renderExpiredTickets(container) {
  moveExpiredToHistory();
  const history = safeRead(TKEY_HISTORY, []);

  container.innerHTML = "";

  if (!history.length) {
    container.innerHTML =
      `<p class="empty-text">Du har ingen utløpte billetter ennå.</p>`;
    return;
  }

  history.sort((a, b) => new Date(b.endISO) - new Date(a.endISO));

  const groups = new Map();
  history.forEach((t) => {
    const end = new Date(t.endISO);
    const key = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) {
      groups.set(key, {
        heading: formatMonthHeading(end),
        items: [],
      });
    }
    groups.get(key).items.push(t);
  });

  for (const [, group] of groups) {
    const h2 = document.createElement("h2");
    h2.className = "group-title";
    h2.textContent = group.heading;
    container.appendChild(h2);

    const ul = document.createElement("ul");
    ul.className = "cardlist";
    ul.setAttribute("aria-label", `Billetter i ${group.heading}`);

    group.items.forEach((t) => {
      const end = new Date(t.endISO);

      const li = document.createElement("li");
      const article = document.createElement("article");
      article.className = "card ticket";

      const header = document.createElement("header");
      header.className = "card__header";

      const h3 = document.createElement("h3");
      h3.className = "card__title";

      const baseTitle =
        t.title && t.title.trim()
          ? t.title.trim()
          : t.type === "period"
          ? "Periodebillett"
          : "Enkeltbillett";

      h3.textContent = `Utløpt ${baseTitle.toLowerCase()}`;
      header.appendChild(h3);
      article.appendChild(header);

      const facts = document.createElement("ul");
      facts.className = "card__facts";

      const liArea = document.createElement("li");
      liArea.textContent = t.area ? `Gyldig i ${t.area}` : "Gyldig billett";

      const liTrav = document.createElement("li");
      liTrav.textContent = t.travelers || "Reisende ukjent";

      const liWhen = document.createElement("li");
      liWhen.textContent = formatDateTimeNo(end);

      facts.appendChild(liArea);
      facts.appendChild(liTrav);
      facts.appendChild(liWhen);

      article.appendChild(facts);
      li.appendChild(article);
      ul.appendChild(li);
    });

    container.appendChild(ul);
  }
}

// ===================== HISTORY: init =====================
function initHistoryPage() {
  const tabReceipts = document.getElementById("tab-receipts");
  const tabTickets  = document.getElementById("tab-tickets");
  const panelReceipts = document.getElementById("panel-receipts");
  const panelTickets  = document.getElementById("panel-tickets");

  if (!tabReceipts || !tabTickets || !panelReceipts || !panelTickets) return;

  function showPanel(which) {
    if (which === "receipts") {
      tabReceipts.setAttribute("aria-selected", "true");
      tabTickets.setAttribute("aria-selected", "false");
      panelReceipts.hidden = false;
      panelTickets.hidden  = true;
    } else {
      tabReceipts.setAttribute("aria-selected", "false");
      tabTickets.setAttribute("aria-selected", "true");
      panelReceipts.hidden = true;
      panelTickets.hidden  = false;
    }
  }

  tabReceipts.addEventListener("click", () => {
    showPanel("receipts");
    renderReceipts(panelReceipts);
  });

  tabTickets.addEventListener("click", () => {
    showPanel("tickets");
    renderExpiredTickets(panelTickets);
  });

  // Start-visning: Kvitteringer
  showPanel("receipts");
  renderReceipts(panelReceipts);
}

// ===================== Profil-side (logget inn/ut) =====================
function initProfilePage() {
  const guest  = document.getElementById("profile-guest");
  const logged = document.getElementById("profile-loggedin");
  const logoutSection = document.getElementById("logout-section");
  const logoutBtn = document.getElementById("btn-logout");

  const loggedIn = localStorage.getItem(LOGGED_KEY) === "1";

  if (guest)  guest.hidden  = loggedIn;
  if (logged) logged.hidden = !loggedIn;
  if (logoutSection) logoutSection.hidden = !loggedIn;

  logoutBtn?.addEventListener("click", () => {
    localStorage.removeItem(LOGGED_KEY);
    location.reload();
  });
}

// ===================== Hent-billett-side =====================
function initPickupPage() {
  const wrap = document.querySelector(".code-inputs");
  if (!wrap) return;

  const inputs = [...wrap.querySelectorAll("input")];
  const submit = document.querySelector('button[type="submit"]');
  const clearBtn = wrap.querySelector(".clear");

  const updateState = () => {
    const ok = inputs.every(i => i.value.length === i.maxLength);
    if (submit) submit.disabled = !ok;
  };

  inputs.forEach((el, idx) => {
    el.addEventListener("input", () => {
      el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (el.value.length === el.maxLength && inputs[idx + 1]) {
        inputs[idx + 1].focus();
      }
      updateState();
    });

    el.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !el.value && inputs[idx - 1]) {
        inputs[idx - 1].focus();
      }
    });
  });

  clearBtn?.addEventListener("click", () => {
    inputs.forEach(i => (i.value = ""));
    updateState();
    inputs[0]?.focus();
  });

  document.querySelector("form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = inputs.map(i => i.value).join("-");
    alert(`Henter billett for kode: ${code}`);
  });

  updateState();
}

// ===================== ENTRYPOINT =====================
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  if (body.classList.contains("page--history")) {
    initHistoryPage();
  }
  if (body.classList.contains("page-profil")) {
    initProfilePage();
  }
  if (body.classList.contains("page--pickup")) {
    initPickupPage();
  }
});
