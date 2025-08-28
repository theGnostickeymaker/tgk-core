// /scripts/auth/firebase-config.js
// 🔥 THE GNOSTIC KEY – Firebase Config & Auth Setup

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// 🔑 Core Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYrFIw9I3hManf1TqvP6FARZTC-MlMuz0",
  authDomain: "the-gnostic-key.firebaseapp.com",
  projectId: "the-gnostic-key",
  storageBucket: "the-gnostic-key.appspot.com",
  messagingSenderId: "903609435224",
  appId: "1:903609435224:web:3031fc94c9fbbe78f8762d",
  measurementId: "G-KD96SXX3JY"
};

// ⚙️ Safe Init + Guarded Fallback
let appInstance;
try {
  appInstance = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
} catch (err) {
  console.error("🔥 Firebase failed to initialize:", err);
}

const auth = getAuth(appInstance);

// 🧪 Local Debug Tools
function initDebugTools() {
  console.log("🌱 Firebase Dev Mode");
  window.firebaseConfig = firebaseConfig;
  window.firebaseApp = appInstance;
  window.firebaseAuth = auth;
}

// 📱 Optional UI Behaviour (can be moved elsewhere)
function attachMobileToggle() {
  const toggle = document.getElementById("mobileToggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      document.body.classList.toggle("menu-open");
    });
  }
}

// 🚀 DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  if (location.hostname === "localhost") initDebugTools();
  attachMobileToggle();
});

// ✅ Export Auth + App
export { auth, appInstance as app };
