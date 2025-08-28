// /scripts/ui/bookmark-toggle.js
import { auth } from "../auth/firebase-config.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const db = getFirestore();

export function initializeBookmarkToggle() {
  const bookmarkButton = document.getElementById("bookmark-button");
  if (!bookmarkButton) return;

  const { post, title, excerpt, path, series } = bookmarkButton.dataset;

  if (!post || !title || !path) {
    console.warn("⚠️ Missing required bookmark data attributes.");
    return;
  }

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      bookmarkButton.classList.add("disabled");
      bookmarkButton.title = "Login to save scrolls";
      return;
    }

    const bookmarkRef = doc(db, `users/${user.uid}/bookmarks/${post}`);

    try {
      const snap = await getDoc(bookmarkRef);
      const saved = snap.exists();
      bookmarkButton.classList.toggle("saved", saved);
      bookmarkButton.textContent = saved ? "✅" : "🔖";
    } catch (err) {
      console.error("⚠️ Error checking bookmark:", err);
    }

    bookmarkButton.addEventListener("click", async () => {
      try {
        const snap = await getDoc(bookmarkRef);
        if (snap.exists()) {
          await deleteDoc(bookmarkRef);
          bookmarkButton.classList.remove("saved");
          bookmarkButton.textContent = "🔖";
          toast("Bookmark removed");
        } else {
          await setDoc(bookmarkRef, {
            title,
            excerpt,
            path,
            series,
            savedAt: new Date()
          });
          bookmarkButton.classList.add("saved");
          bookmarkButton.textContent = "✅";
          toast("Bookmark saved");
        }
      } catch (err) {
        console.error("⚠️ Error toggling bookmark:", err);
        toast("Something went wrong.");
      }
    });
  });
}

// ✅ Replace blocking alerts with non-blocking toasts
function toast(msg = "Done") {
  const el = document.createElement("div");
  el.className = "tgk-toast";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

// 🚀 Auto-run when DOM ready
document.addEventListener("DOMContentLoaded", () => {
  initializeBookmarkToggle();
});
