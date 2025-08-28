// /scripts/navigation/theme.js
// ✨ TGK Theme Toggle + Scroll-to-Top Controls

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  const icon = toggleBtn?.querySelector(".icon");
  const scrollBtn = document.getElementById("scrollTopBtn");

  /* 🌗 Apply Theme on Load */
  const initTheme = () => {
    const savedTheme = localStorage.getItem("tgk-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = savedTheme || (prefersDark ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", theme);
    updateToggleIcon(theme);
  };

  /* 🌕 Update Toggle Icon */
  const updateToggleIcon = (theme) => {
    if (icon) {
      icon.textContent = theme === "dark" ? "🌙" : "☀️";
      toggleBtn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }
  };

  /* 🌘 Theme Toggle on Click */
  toggleBtn?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("tgk-theme", next);
    updateToggleIcon(next);
  });

  /* ⬆️ Scroll-to-Top Logic */
  const initScrollToTop = () => {
    if (!scrollBtn) return;

    const showOrHideScrollBtn = () => {
      scrollBtn.style.display = window.scrollY > 200 ? "inline-block" : "none";
    };

    scrollBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", showOrHideScrollBtn);
    showOrHideScrollBtn(); // Initial state
  };

  // 🧩 Run initialisers
  initTheme();
  initScrollToTop();
});
