// js/lang-select.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    // Kjør bare på språk-siden
    if (!document.body.classList.contains("page-language")) return;

    const buttons = document.querySelectorAll(".lang-btn");
    if (!buttons.length) return;

    function applyLang(lang) {
      // lagre språk
      localStorage.setItem("lang", lang);

      // sett lang-attributt på <html>
      document.documentElement.lang = lang;

      // kjør i18n på nytt hvis funksjonen finnes
      if (window.applyTranslations) {
        window.applyTranslations();
      }

      // oppdatér UI
      setActive(lang);
    }

    function setActive(lang) {
      buttons.forEach((btn) => {
        const isActive = btn.dataset.lang === lang;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    // Klikk på språk-knapp
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.dataset.lang || "nb";
        applyLang(lang);
      });
    });

    // Init – bruk lagret språk eller default nb
    const initial = localStorage.getItem("lang") || "nb";
    setActive(initial);
  });
})();
