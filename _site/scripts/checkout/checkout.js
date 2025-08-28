// /scripts/checkout/checkout.js
// TGK Stripe glue — resilient auth + API fallback

import { auth } from "/scripts/auth/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

/* ---------- API base detection ---------- */
const PROJECT_ID = "the-gnostic-key";
const REGION = "us-central1";
const CF_BASE = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/api`; // direct Cloud Functions
let API_BASE = "/api"; // pretty path via Hosting rewrite

async function pickApiBase() {
  try {
    const r = await fetch(`${API_BASE}/health`, { method: "GET" });
    if (r.ok) {
      console.info("[TGK] Using hosting rewrite API:", API_BASE);
      return;
    }
  } catch (_) {}
  API_BASE = CF_BASE;
  console.info("[TGK] Falling back to Cloud Functions API:", API_BASE);
}
pickApiBase();

/* ---------- Auth hydration ---------- */
const authReady = new Promise((resolve) => {
  let done = false;
  const unsub = onAuthStateChanged(
    auth,
    (u) => {
      if (!done) {
        done = true;
        resolve(u);
      }
      unsub();
    },
    () => {
      if (!done) {
        done = true;
        resolve(null);
      }
      unsub();
    }
  );
});

async function getSignedInUser(timeoutMs = 4000) {
  if (auth.currentUser) return auth.currentUser;
  const race = await Promise.race([
    authReady,
    new Promise((r) => setTimeout(() => r(auth.currentUser), timeoutMs)),
  ]);
  return race || null;
}

async function requireIdToken() {
  const user = await getSignedInUser();
  if (!user) {
    sessionStorage.setItem("redirectAfterLogin", window.location.href);
    window.location.href = "/login.html";
    throw new Error("Not signed in");
  }
  return await user.getIdToken();
}

/* ---------- Fetch helpers ---------- */
async function postJSON(path, body = {}) {
  const token = await requireIdToken();
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let err = {};
    try {
      err = await res.json();
    } catch {}
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ---------- Public initializers ---------- */
export function initializeSubscriptionFlow() {
  const premiumButtons = document.querySelectorAll(
    ".subscribe-action[data-tier='premium']"
  );
  const freeBtn = document.querySelector(
    ".subscribe-action[data-tier='free']"
  );
  const errorBox = document.getElementById("subscribe-error-msg");

  if (freeBtn) {
    freeBtn.addEventListener("click", async () => {
      const u = await getSignedInUser();
      window.location.href = u ? "/dashboard.html" : "/login.html";
    });
  }

  premiumButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        if (errorBox) errorBox.style.display = "none";
        const priceId = btn.dataset.priceId;
        if (!priceId) throw new Error("Missing priceId on button");
        const { url } = await postJSON("/create-checkout-session", { priceId });
        window.location.href = url;
      } catch (e) {
        console.error("[TGK] Checkout error:", e);
        if (errorBox) {
          errorBox.textContent =
            "Could not start checkout. Please log in and try again.";
          errorBox.style.display = "block";
        } else {
          alert("Checkout failed. Please log in and try again.");
        }
      }
    });
  });

  // Optional: global portal button (dashboard)
  const billingBtn = document.getElementById("manageBilling");
  if (billingBtn) {
    billingBtn.addEventListener("click", async () => {
      try {
        const { url } = await postJSON("/create-portal-link", {});
        window.location.href = url;
      } catch (e) {
        console.error("[TGK] Billing portal error:", e);
        alert(
          "Couldn't open the billing portal. Are you signed in with a premium account?"
        );
      }
    });
  }
}

export function initializeUpgradeFlow() {
  // same handler needed on the upgrade page
  initializeSubscriptionFlow();
}
