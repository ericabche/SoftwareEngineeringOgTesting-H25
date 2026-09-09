// js/i18n.js
(function () {
  "use strict";

  if (!window.LANG) {
    console.warn("LANG dictionary not found");
    return;
  }

  const DEFAULT_LANG = "nb";

  function getSavedLang() {
    return localStorage.getItem("lang") || DEFAULT_LANG;
  }

  function tInternal(lang, key) {
    const dict = LANG[lang] || LANG[DEFAULT_LANG];
    return (
      (dict && dict[key]) ||
      (LANG[DEFAULT_LANG] && LANG[DEFAULT_LANG][key]) ||
      key
    );
  }

  function applyLanguage(lang) {
    const dict = LANG[lang] || LANG[DEFAULT_LANG];

    // Oppdater <html lang="…"> og data-lang på body
    document.documentElement.lang = lang === "en" ? "en" : "nb";
    document.body.dataset.lang = lang;
    localStorage.setItem("lang", lang);

    // Vanlig tekst
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });

    // Placeholder
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });

    // aria-label
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (dict[key]) el.setAttribute("aria-label", dict[key]);
    });
  }

  // Globale helpers hvis du vil bruke t() andre steder
  window.getCurrentLanguage = getSavedLang;
  window.applyLanguage = applyLanguage;
  window.t = function (key) {
    const lang = getSavedLang();
    return tInternal(lang, key);
  };

  document.addEventListener("DOMContentLoaded", () => {
    // 1) Sett språk ved oppstart
    const currentLang = getSavedLang();
    applyLanguage(currentLang);

    // 2) Sett opp språk-knappen (hvis den finnes på siden)
    const btnLang = document.getElementById("btn-language");
    const langMeta = document.getElementById("current-language");

    function updateLanguageMeta(lang) {
      if (!langMeta) return;
      if (lang === "en") {
        langMeta.textContent =
          LANG.en["settings.language_value"] || "English";
      } else {
        langMeta.textContent =
          LANG.nb["settings.language_value"] || "Norsk bokmål";
      }
    }

    updateLanguageMeta(currentLang);

    if (btnLang) {
      btnLang.addEventListener("click", () => {
        const newLang = getSavedLang() === "nb" ? "en" : "nb";
        applyLanguage(newLang);
        updateLanguageMeta(newLang);
      });
    }
  });
})();
