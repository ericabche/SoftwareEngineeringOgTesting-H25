// Enkel klient-side registreringsflyt
// - Validerer per steg
// - Viser feilmeldinger
// - Lagrer data midlertidig i sessionStorage
// - Sender data til backend i siste steg

const REG_KEY = "registerDraft";

/* ---------------- Utils for draft ---------------- */

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(REG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDraft(patch) {
  const current = loadDraft();
  const next = { ...current, ...patch };
  sessionStorage.setItem(REG_KEY, JSON.stringify(next));
}

function toggleButton(btn, enabled) {
  if (!btn) return;
  if (enabled) {
    btn.classList.remove("btn--disabled");
    btn.setAttribute("aria-disabled", "false");
  } else {
    btn.classList.add("btn--disabled");
    btn.setAttribute("aria-disabled", "true");
  }
}

/* ---------------- Hovedlogikk ---------------- */

document.addEventListener("DOMContentLoaded", () => {
  const draft = loadDraft();

  /* ---------- Steg 1: Telefon ---------- */
  const phoneInput = document.getElementById("phone");
  const phoneError = document.getElementById("phone-error");
  const btnNextPhone = document.getElementById("btn-next-phone");

  if (phoneInput && phoneError && btnNextPhone) {
    if (draft.phone) phoneInput.value = draft.phone;

    const validatePhone = () => {
      const raw = phoneInput.value.replace(/\s+/g, "");
      // 8 sifre (norsk nummer uten +47)
      const ok = /^\d{8}$/.test(raw);

      toggleButton(btnNextPhone, ok);

      if (!ok && raw.length > 0) {
        phoneError.textContent =
          "Skriv et gyldig norsk mobilnummer med 8 sifre.";
        phoneError.hidden = false;
        phoneInput.closest(".input-phone")?.classList.add("field-error");
      } else {
        phoneError.hidden = true;
        phoneInput.closest(".input-phone")?.classList.remove("field-error");
      }
      return ok;
    };

    phoneInput.addEventListener("input", validatePhone);

    btnNextPhone.addEventListener("click", (e) => {
      if (!validatePhone()) {
        e.preventDefault();
        phoneInput.focus();
        return;
      }
      // Lagre tel.nr. før vi går til neste steg
      saveDraft({ phone: phoneInput.value });
    });

    validatePhone();
  }

  /* ---------- Steg 2: E-post ---------- */
  const emailInput = document.getElementById("email");
  const emailError = document.getElementById("email-error");
  const btnNextEmail = document.getElementById("btn-next-email");

  if (emailInput && emailError && btnNextEmail) {
    if (draft.email) emailInput.value = draft.email;

    const validateEmail = () => {
      const value = emailInput.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      toggleButton(btnNextEmail, ok);

      if (!ok && value.length > 0) {
        emailError.textContent = "Skriv en gyldig e-postadresse.";
        emailError.hidden = false;
        emailInput.classList.add("field-error");
      } else {
        emailError.hidden = true;
        emailInput.classList.remove("field-error");
      }
      return ok;
    };

    emailInput.addEventListener("input", validateEmail);

    btnNextEmail.addEventListener("click", (e) => {
      if (!validateEmail()) {
        e.preventDefault();
        emailInput.focus();
        return;
      }
      // Lagre e-post før vi går videre
      saveDraft({ email: emailInput.value });
    });

    validateEmail();
  }

  /* ---------- Steg 3: Navn + kall til backend ---------- */
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const nameError = document.getElementById("name-error");
  const btnSaveProfile = document.getElementById("btn-save-profile");

  if (firstNameInput && lastNameInput && nameError && btnSaveProfile) {
    if (draft.firstName) firstNameInput.value = draft.firstName;
    if (draft.lastName) lastNameInput.value = draft.lastName;

    const validateName = () => {
      const first = firstNameInput.value.trim();
      const last = lastNameInput.value.trim();
      const ok = first.length > 1 && last.length > 1;

      toggleButton(btnSaveProfile, ok);

      if (!ok && (first.length > 0 || last.length > 0)) {
        nameError.textContent = "Fyll inn både fornavn og etternavn.";
        nameError.hidden = false;
        firstNameInput.classList.add("field-error");
        lastNameInput.classList.add("field-error");
      } else {
        nameError.hidden = true;
        firstNameInput.classList.remove("field-error");
        lastNameInput.classList.remove("field-error");
      }
      return ok;
    };

    firstNameInput.addEventListener("input", validateName);
    lastNameInput.addEventListener("input", validateName);

    btnSaveProfile.addEventListener("click", async (e) => {
      e.preventDefault(); // stopp vanlig lenke-navigasjon

      if (!validateName()) {
        (firstNameInput.value.trim() ? lastNameInput : firstNameInput).focus();
        return;
      }

      // Hent alt vi har samlet opp fra tidligere steg
      const currentDraft = loadDraft();
      const payload = {
        phone: currentDraft.phone,
        email: currentDraft.email,
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
      };

      try {
        const res = await fetch("/api/register", {
          // TODO: bytt til riktig endpoint hos dere, f.eks. "http://localhost:8080/api/users"
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg =
            data.message || "Noe gikk galt ved opprettelse av bruker.";
          nameError.textContent = msg;
          nameError.hidden = false;
          return;
        }

        const data = await res.json().catch(() => ({}));

        // Hvis backend sender token / brukerinfo tilbake:
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }

        // Rydd ut kladd og gå videre til profil/hjem
        sessionStorage.removeItem(REG_KEY);
        window.location.href = "profil.html";
      } catch (err) {
        console.error(err);
        nameError.textContent =
          "Kunne ikke kontakte serveren. Prøv igjen senere.";
        nameError.hidden = false;
      }
    });

    // Kjør første validering for å sette korrekt knapp-state
    validateName();
  }
});