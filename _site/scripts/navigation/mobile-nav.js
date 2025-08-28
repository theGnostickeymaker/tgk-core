// /scripts/navigation/mobile-nav.js
// 📱 TGK Mobile Menu Toggle + Overlay Control

document.addEventListener("DOMContentLoaded", () => {
  const mobileToggle = document.getElementById("mobileToggle");
  const mobileNav = document.getElementById("mobileNav");
  const overlay = document.getElementById("navOverlay");
  const body = document.body;

  if (!mobileToggle || !mobileNav) return;

  /* 🔒 Close Menu */
  const closeMobileMenu = () => {
    mobileNav.classList.remove("open");
    overlay?.classList.remove("visible");
    body.classList.remove("menu-open");
    mobileToggle.setAttribute("aria-expanded", "false");
  };

  /* 🔓 Open Menu */
  const openMobileMenu = () => {
    mobileNav.classList.add("open");
    overlay?.classList.add("visible");
    body.classList.add("menu-open");
    mobileToggle.setAttribute("aria-expanded", "true");
  };

  /* 🔁 Toggle Menu */
  const toggleMobileMenu = () => {
    if (mobileNav.classList.contains("open")) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  // Set initial state
  closeMobileMenu();
  mobileToggle.setAttribute("aria-controls", "mobileNav");
  mobileToggle.setAttribute("aria-expanded", "false");

  // 📱 Toggle button click
  mobileToggle.addEventListener("click", toggleMobileMenu);

  // ✨ Auto-close on nav item click
  mobileNav.querySelectorAll("a").forEach(link =>
    link.addEventListener("click", closeMobileMenu)
  );

  // 🌒 Overlay click closes menu
  overlay?.addEventListener("click", closeMobileMenu);

  // ⌨️ Escape key closes menu
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });
});
