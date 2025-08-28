// 🗝️ TGK User Dashboard + Bookmark Manager

import { auth } from "../auth/firebase-config.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  getFunctions,
  httpsCallable
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-functions.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getFirstName, isPremium } from "../root/utils.js";

const db = getFirestore();
const functions = getFunctions(undefined, "us-central1");

async function renderUserBookmarks(user) {
  const bookmarkList = document.getElementById("bookmark-list");
  if (!bookmarkList) return;

  try {
    const bookmarksRef = collection(db, `users/${user.uid}/bookmarks`);
    const snapshot = await getDocs(bookmarksRef);

    bookmarkList.innerHTML = snapshot.empty
      ? `<p class="text-muted centered">No saved scrolls yet.</p>`
      : "";

    snapshot.forEach((docSnap) => {
      const { title, path, excerpt, series } = docSnap.data();
      const card = document.createElement("div");
      card.className = "dashboard-bookmark-card";
      card.innerHTML = `
        <div class="gnostic-card-inner">
          <div class="bookmark-glyph">✦</div>
          <div class="bookmark-title">${title}</div>
          <p class="bookmark-description">${excerpt}</p>
          <div class="bookmark-meta">Series: ${series || "Unlabelled"}</div>
          <div class="card-actions">
            <a class="btn" href="${path}">Read</a>
            <button class="btn" data-id="${docSnap.id}">Remove</button>
          </div>
        </div>
      `;

      bookmarkList.appendChild(card);

      card.querySelector("button").addEventListener("click", async () => {
        try {
          await deleteDoc(doc(db, `users/${user.uid}/bookmarks/${docSnap.id}`));
          card.remove();
        } catch (err) {
          console.error("⚠️ Failed to remove bookmark:", err);
          alert("Failed to remove bookmark.");
        }
      });
    });
  } catch (err) {
    console.error("⚠️ Error loading bookmarks:", err);
  }
}

async function attachBookmarkToggle(user) {
  const bookmarkButton = document.getElementById("bookmark-button");
  if (!bookmarkButton) return;

  const { post: postId, title, excerpt, path, series } = bookmarkButton.dataset;
  const bookmarkRef = doc(db, `users/${user.uid}/bookmarks/${postId}`);

  bookmarkButton.addEventListener("click", async () => {
    try {
      bookmarkButton.disabled = true;
      const snap = await getDoc(bookmarkRef);
      if (snap.exists()) {
        await deleteDoc(bookmarkRef);
        bookmarkButton.classList.remove("saved");
        bookmarkButton.textContent = "🔖";
        alert("Bookmark removed.");
      } else {
        await setDoc(bookmarkRef, {
          title,
          excerpt,
          path,
          series,
          savedAt: serverTimestamp()
        });
        bookmarkButton.classList.add("saved");
        bookmarkButton.textContent = "✅ Saved";
        alert("Bookmark saved!");
      }
    } catch (err) {
      console.error("⚠️ Error toggling bookmark:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      bookmarkButton.disabled = false;
    }
  });
}

export function initializeDashboard() {
  document.addEventListener("DOMContentLoaded", () => {
    const emailDisplay = document.getElementById("user-email");
    const tierDisplay = document.getElementById("user-tier");
    const subscriptionBtn = document.getElementById("subscriptionbtn");

    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (emailDisplay) emailDisplay.textContent = "Guest";
        if (tierDisplay) tierDisplay.textContent = "None";
        if (subscriptionBtn) {
          subscriptionBtn.textContent = "Subscribe Now";
          subscriptionBtn.onclick = () => window.location.href = "/subscribe.html";
        }
        return;
      }

      if (emailDisplay) emailDisplay.textContent = getFirstName(user.email);

      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const { tier = "free" } = snap.exists() ? snap.data() : {};
        const displayTier = tier.charAt(0).toUpperCase() + tier.slice(1);
        if (tierDisplay) tierDisplay.textContent = displayTier;

        if (subscriptionBtn) {
          if (isPremium(tier)) {
            subscriptionBtn.textContent = "Manage Subscription";
            subscriptionBtn.onclick = async () => {
              try {
                const createPortalLink = httpsCallable(functions, "createPortalLink");
                const result = await createPortalLink({});
                if (result?.data?.url) {
                  window.location.href = result.data.url;
                } else {
                  console.error("No URL in callable result:", result);
                  alert("Could not open the subscription portal.");
                }
              } catch (err) {
                console.error("Failed to open portal:", err);
                alert("Unable to open the subscription portal.");
              }
            };
          } else {
            subscriptionBtn.textContent = "✨ Upgrade Now";
            subscriptionBtn.onclick = () => window.location.href = "/upgrade.html";
          }
        }

        await renderUserBookmarks(user);
        await attachBookmarkToggle(user);
      } catch (err) {
        console.error("⚠️ Error loading dashboard:", err);
      }
    });
  });
}
