import { initializeSubscriptionManager } from "./utils.js";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧠 TGK Main Script – Shared Logic for Scrolls
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

document.addEventListener("DOMContentLoaded", () => {
  // ✏️ Quiz logic
  document.querySelectorAll(".quiz-button").forEach((button) => {
    button.addEventListener("click", () => {
      const parent = button.closest(".quiz-question");
      const reveal = parent.querySelector(".quiz-reveal");
      const feedback = parent.querySelector(".quiz-feedback");

      if (!reveal || !feedback) return;

      const correctAnswer = reveal.getAttribute("data-correct");
      const isCorrect = button.getAttribute("data-answer") === correctAnswer;

      parent.querySelectorAll("button").forEach((btn) => {
        btn.disabled = true;
        btn.classList.remove("quiz-correct", "quiz-wrong");
      });

      if (isCorrect) {
        button.classList.add("quiz-correct");
        feedback.textContent = reveal.textContent;
      } else {
        button.classList.add("quiz-wrong");
        parent.querySelectorAll("button").forEach((btn) => {
          if (btn.getAttribute("data-answer") === correctAnswer) {
            btn.classList.add("quiz-correct");
          }
        });

        const answerText = reveal.textContent.replace(/^Correct:\s*/i, '');
        feedback.innerHTML = `✘ Incorrect.<br><em>Correct Answer:</em> ${answerText}`;
      }

      feedback.style.display = "block";
    });
  });

  // 🔗 Share buttons
  const twitterBtn = document.getElementById("share-twitter");
  const telegramBtn = document.getElementById("share-telegram");

  if (twitterBtn) {
    twitterBtn.addEventListener("click", () => {
      const title = encodeURIComponent(twitterBtn.getAttribute("data-title"));
      const url = encodeURIComponent(twitterBtn.getAttribute("data-url"));
      window.open(
        `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  if (telegramBtn) {
    telegramBtn.addEventListener("click", () => {
      const title = encodeURIComponent(telegramBtn.getAttribute("data-title"));
      const url = encodeURIComponent(telegramBtn.getAttribute("data-url"));
      window.open(
        `https://t.me/share/url?url=${url}&text=${title}`,
        "_blank",
        "noopener,noreferrer"
      );
    });
  }

  // ✍️ Discussion prompt fallback
  const q = document.getElementById("discussion-text");
  if (q && q.innerText.trim() === "") {
    q.innerText = "What does Gnosis mean to *you*, and how does it challenge the world you've been taught to trust?";
  }

  // 💼 Subscription Manager
  initializeSubscriptionManager();
});
