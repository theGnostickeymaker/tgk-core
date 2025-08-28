// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THE GNOSTIC KEY – UTILITY LIBRARY
// Common helpers for identity, access, and animation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 🔠 Extract first name from email */
export function getFirstName(email = "") {
  const name = email.split("@")[0].split(".")[0].replace(/\d+$/, "");
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/** 💎 Check if user is premium tier (or admin) */
export function isPremium(tier) {
  return ["premium", "admin"].includes(tier);
}

/** 🔐 Check if user is admin */
export function isAdmin(tier) {
  return tier === "admin";
}

/** 🏷️ Apply tier class to body (e.g., tier-free) */
export function setUserTierClass(tier) {
  const tiers = ["free", "premium", "admin"];
  updateBodyClass(tiers, `tier-${tier}`);
}

/** 📛 Apply role class to body (e.g., role-admin) */
export function setUserRoleClass(role) {
  const roles = ["reader", "admin"];
  updateBodyClass(roles, `role-${role}`);
  if (roles.includes(role)) {
    console.log(`🏷 Applied role class: role-${role}`);
  }
}

/** 🌈 Reveal elements with .reveal when in viewport */
export function activateScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    });
  });
  reveals.forEach(el => observer.observe(el));
  window.dispatchEvent(new Event("scroll"));
}

/** 📨 Temporarily display feedback message */
export function showFeedback(el, msg, cssClass = "highlight-success") {
  if (!el) return;
  el.textContent = msg;
  el.classList.add(cssClass);
  setTimeout(() => {
    el.classList.remove(cssClass);
  }, 2000);
}

/** 🔹 Show element only if user has required role */
export function showIfRole(requiredRole, selector) {
  const el = document.querySelector(selector);
  if (el && hasRole(requiredRole)) {
    el.style.display = "block";
  }
}

/** 🙈 Hide element if user has specific role */
export function hideIfRole(roleToHide, selector) {
  const el = document.querySelector(selector);
  if (el && hasRole(roleToHide)) {
    el.style.display = "none";
  }
}

/** 🥷 Check if current user has role (via body class) */
export function hasRole(role) {
  return document.body.classList.contains(`role-${role}`);
}

/** 🌟 Check if current user has tier (via body class) */
export function hasTier(tier) {
  return document.body.classList.contains(`tier-${tier}`);
}

/** 🛡 Guard access based on role or tier with redirect */
export function guardAccess({ role = null, tier = null, redirect = "/", silent = false }) {
  const allow = (!role || hasRole(role)) && (!tier || hasTier(tier));
  if (!allow) {
    if (!silent) alert("⛔ Access denied: You lack the required clearance.");
    window.location.href = redirect;
  }
}

/** 🧪 Debug current user's access level in console */
export function debugUserAccess() {
  const tier = ["free", "premium", "admin"].find(hasTier) || "none";
  const role = ["reader", "admin"].find(hasRole) || "none";
  console.log(`🧬 Tier: ${tier}, Role: ${role}`);
}

/** 🧼 Remove all old body classes in category and apply new */
function updateBodyClass(classList, activeClass) {
  classList.forEach(cls =>
    document.body.classList.remove(`${activeClass.split("-")[0]}-${cls}`)
  );
  document.body.classList.add(activeClass);
}
