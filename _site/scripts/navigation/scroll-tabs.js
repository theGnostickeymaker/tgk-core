document.addEventListener("DOMContentLoaded", () => {
  const tabLinks = document.querySelectorAll(".tab-link");
  const tabContents = document.querySelectorAll(".tab-content");

  const getOffset = () => {
    const header = document.querySelector("header");
    return header ? -header.offsetHeight : -80;
  };

  function activateTab(tabId, scroll = false) {
    const targetButton = document.querySelector(`.tab-link[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);

    if (!targetButton || !targetContent) return;

    tabLinks.forEach((btn) => btn.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    targetButton.classList.add("active");
    targetContent.classList.add("active");

    if (scroll) {
      setTimeout(() => {
        const yOffset = getOffset();
        const y = targetContent.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }, 100);
    }
  }

  const hash = window.location.hash.substring(1);
  const lastTab = hash || localStorage.getItem("tgk-active-tab");
  if (lastTab) activateTab(lastTab, false);

  tabLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-tab");
      localStorage.setItem("tgk-active-tab", targetId);
      window.location.hash = targetId;
      activateTab(targetId, true);
    });
  });

  window.addEventListener("hashchange", () => {
    const tabId = window.location.hash.substring(1);
    activateTab(tabId, false);
  });
});
