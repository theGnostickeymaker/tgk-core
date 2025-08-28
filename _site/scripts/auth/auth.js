// /scripts/auth/auth.js
// 🔐 TGK Auth Logic – Session UI, Role Access, Login Flow

import { auth } from "./firebase-config.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const db = getFirestore();

/* 🌟 UI Setup Based on Auth State */
export async function setupUI(user) {
  const authLink = document.getElementById("authLink");
  const footerAuth = document.getElementById("footerLogout");
  const dashboardLink = document.getElementById("dashboardLink");

  const logoutHandler = async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.href = "/logout.html";
  };

  const updateLink = (el, isUser) => {
    if (!el) return;
    el.textContent = isUser ? "Logout" : "Login";
    el.href = isUser ? "#" : "/login.html";
    el.replaceWith(el.cloneNode(true));
    if (isUser) document.getElementById(el.id).addEventListener("click", logoutHandler);
  };

  updateLink(authLink, !!user);
  updateLink(footerAuth, !!user);

  if (dashboardLink) {
    dashboardLink.classList.toggle("hidden", !user);
  }

  await handleSubscribeButton(user);
}

async function handleSubscribeButton(user) {
  const { tier = "free", role = "user" } = user ? await getUserAccess(user.uid) : {};
  const isElevated = ["premium", "admin"].includes(tier) || role === "admin";

  // Hide entire section for premium/admin users
  if (isElevated) {
    const journeySection = document.querySelector(".fan-the-flame");
    if (journeySection) journeySection.remove();

    // Also remove nav subscribe for elevated users
    const navBtn = document.getElementById("subscribe-btn-nav");
    if (navBtn) navBtn.remove();
    return;
  }

  // Show subscribe buttons for free users
  const buttons = [
    document.getElementById("subscribe-btn"),
    document.getElementById("subscribe-btn-nav")
  ].filter(Boolean);

  for (const btn of buttons) {
    if (!btn) continue;

    if (btn.id === "subscribe-btn") {
      btn.innerHTML = "✨ Loved this scroll? Unlock more mystical journeys for £6/month!";
    } else if (btn.id === "subscribe-btn-nav") {
      btn.textContent = user ? "Upgrade" : "Subscribe";
    }

    btn.href = user ? "/upgrade.html" : "/subscribe.html";
    btn.classList.remove("hidden");
    btn.style.display = "inline-block";
  }
}


/* 🔍 Retrieve User Tier + Role */
export async function getUserAccess(uid) {
  try {
    const snap = await getDoc(doc(db, "users", uid));
    const data = snap.exists() ? snap.data() : {};
    return {
      tier: (data.tier || "free").toLowerCase(),
      role: (data.role || "user").toLowerCase()
    };
  } catch (err) {
    console.error("⚠️ getUserAccess failed:", err);
    return { tier: "free", role: "user" };
  }
}

/* 🧱 Premium Scroll Gate */
export async function enforcePremium(user) {
  if (!user) {
    redirectAfterLogin("/login.html");
    return;
  }

  const { tier, role } = await getUserAccess(user.uid);
  if (!["premium", "admin"].includes(tier) && role !== "admin") {
    redirectAfterLogin("/subscribe.html");
    return;
  }

  const vault = document.getElementById("vault-wrapper");
  if (vault) vault.style.display = "block";
}

/* 🧿 Admin Scroll Gate */
export async function enforceAdminAccess(user) {
  if (!user) {
    redirectAfterLogin("/login.html");
    return;
  }

  const { role } = await getUserAccess(user.uid);
  if (role !== "admin") {
    document.body.innerHTML = `
      <section class="locked-message">
        <h2>🔒 Scroll Locked</h2>
        <p>This scroll is currently under construction and restricted to administrators.</p>
        <a href="/index.html" class="btn">Return to Gateway</a>
      </section>
    `;
  }
}

/* 📩 Login Form Bind */
export function bindLoginForm() {
  const form = document.getElementById("loginform");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/index.html";
      sessionStorage.removeItem("redirectAfterLogin");
      setTimeout(() => window.location.href = redirectTo, 100);
    } catch (err) {
      console.error("❌ Login failed:", err);
      alert("Login failed. Check your credentials.");
    }
  });
}

/* 🔚 Trigger Logout + Message */
export async function triggerLogout() {
  try {
    await signOut(auth);
    document.body.innerHTML = `
      <p class="centered gold-subheading">
        ✨ You have been signed out. Returning to the Gateway...
      </p>
    `;
    setTimeout(() => window.location.href = "/index.html", 2500);
  } catch (err) {
    console.error("❌ Logout error:", err);
    alert("Error during logout.");
  }
}

/* 🚪 Auth Initialiser + Guards */
export function initializeAuth({ premiumGuard = false, upgradePage = false, adminGate = false } = {}) {
  document.addEventListener("DOMContentLoaded", () => {
    onAuthStateChanged(auth, async (user) => {
      await setupUI(user);

      // 🔐 Hide nav upgrade button for elevated users
      if (!upgradePage) {
        const upgradeBtn = document.getElementById("nav-upgrade");
        const { tier = "free", role = "user" } = user ? await getUserAccess(user.uid) : {};
        const isElevated = ["premium", "admin"].includes(tier) || role === "admin";

        if (upgradeBtn && isElevated) {
          upgradeBtn.remove();
        }
      }

      if (premiumGuard) await enforcePremium(user);
      if (adminGate) await enforceAdminAccess(user);

      if (upgradePage) {
        const upgradeBox = document.getElementById("upgrade-options");
        const { tier, role } = user ? await getUserAccess(user.uid) : {};
        if (upgradeBox) {
          upgradeBox.style.display = (tier === "premium" || role === "admin") ? "none" : "block";
        }
      }
    });
  });
}

/* 👁️ Toggle Password Visibility */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("togglePassword");
  const password = document.getElementById("password");

  if (toggle && password) {
    toggle.addEventListener("click", () => {
      const isHidden = password.type === "password";
      password.type = isHidden ? "text" : "password";
      toggle.textContent = isHidden ? "🙈" : "👁️";
      toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    });
  }
});

/* 🧭 Utility: Store redirect & route after login */
function redirectAfterLogin(path) {
  sessionStorage.setItem("redirectAfterLogin", window.location.href);
  window.location.href = path;
}

/* 🧪 Debug */
window.auth = auth;
