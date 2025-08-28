// /scripts/partials.js
// TGK partials + theme bootstrap + auth refresh hooks

(async () => {
  const V = "v=7";
  const THEME_KEY = "tgk_theme";

  /* --- Apply saved theme ASAP (prevents flash) --- */
  try {
    let saved = localStorage.getItem(THEME_KEY);
    if (!saved) {
      saved = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      localStorage.setItem(THEME_KEY, saved);
    }
    document.documentElement.dataset.theme = saved;
    document.documentElement.style.colorScheme = saved;

    window.__tgkSetTheme = function (next) {
      document.documentElement.dataset.theme = next;
      document.documentElement.style.colorScheme = next;
      localStorage.setItem(THEME_KEY, next);
      window.dispatchEvent(new CustomEvent("tgk:theme", { detail: { theme: next } }));
    };
  } catch (e) {
    console.warn("[TGK] Theme init failed:", e);
  }

  /* --- Generic inject with sessionStorage (session-scoped cache) --- */
  async function inject(selector, url) {
    const host = document.querySelector(selector);
    if (!host) return null;
    const key = `TGK_ss_${url}`;
    const cached = sessionStorage.getItem(key);

    if (cached) {
      host.innerHTML = cached;
      // background refresh
      fetch(`${url}?${V}`, { cache: "no-cache" })
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(html => {
          if (html && html !== cached) {
            host.innerHTML = html;
            sessionStorage.setItem(key, html);
            postInject(selector, host);
          }
        })
        .catch(err => console.warn("[TGK] inject refresh failed:", url, err));
      return host;
    }

    try {
      const res = await fetch(`${url}?${V}`, { cache: "no-cache" });
      const html = await res.text();
      host.innerHTML = html;
      sessionStorage.setItem(key, html);
      return host;
    } catch (e) {
      console.error("[TGK] inject failed:", url, e);
      return host;
    }
  }

  /* --- After a partial is injected, bind behaviors --- */
  function postInject(selector, host) {
    if (selector === '[data-include="header"]') applyHeaderOverrides(host);
    if (selector === '[data-include="nav"]')     bindNav();
    if (selector === '[data-include="footer"]')  bindFloatingToggles();
  }

  /* --- Helpers --- */
  function applyHeaderOverrides(headerHost) {
    const { headerTitle, headerSubtitle, headerGlyphs } = document.body.dataset;

    const logoEl = headerHost.querySelector(".main-logo-scroll");
    if (headerTitle && logoEl) logoEl.textContent = headerTitle;

    const taglineEl = headerHost.querySelector(".main-tagline-scroll");
    if (headerSubtitle && taglineEl) taglineEl.textContent = headerSubtitle;

    if (headerGlyphs) {
      const wrap = headerHost.querySelector(".glyphs");
      if (wrap) {
        wrap.innerHTML = headerGlyphs.split(",")
          .map(g => `<span class="glyph-scroll">${g.trim()}</span>`)
          .join("");
      }
    }
  }

  function bindNav() {
    const toggleButton = document.getElementById("mobileToggle");
    const navMenu      = document.getElementById("mobileNav");
    const navOverlay   = document.getElementById("navOverlay");
    const path = location.pathname.replace(/\/+$/, "");

    document.querySelectorAll('#mobileNav a[href]').forEach(a => {
      const aPath = a.getAttribute("href").replace(/\/+$/, "");
      if (path === aPath || (aPath && path.startsWith(aPath))) {
        a.classList.add("active");
        a.setAttribute("aria-current", "page");
      }
    });

    if (!toggleButton || !navMenu || !navOverlay) return;

    function closeNav() {
      navMenu.classList.remove("open");
      navOverlay.classList.remove("active");
    }

    toggleButton.onclick = (e) => {
      e.stopPropagation();
      navMenu.classList.toggle("open");
      navOverlay.classList.toggle("active");
    };

    navOverlay.onclick = closeNav;
    navMenu.querySelectorAll("a").forEach(link => link.addEventListener("click", closeNav));
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && e.target !== toggleButton) closeNav();
    }, { passive: true });
  }

  function bindFloatingToggles() {
    const themeBtn  = document.getElementById("theme-toggle");
    const scrollBtn = document.getElementById("scrollTopBtn");

    if (themeBtn) {
      const setIcon = () => {
        const t = document.documentElement.dataset.theme || "dark";
        const icon = themeBtn.querySelector(".icon");
        if (icon) icon.textContent = (t === "dark" ? "☀️" : "🌙");
        themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
      };
      setIcon();

      themeBtn.onclick = () => {
        const current = document.documentElement.dataset.theme || "dark";
        const next = current === "dark" ? "light" : "dark";
        if (window.__tgkSetTheme) window.__tgkSetTheme(next);
        else {
          document.documentElement.dataset.theme = next;
          try { localStorage.setItem("tgk_theme", next); } catch(e){}
        }
        setIcon();
      };

      window.addEventListener("tgk:theme", setIcon);
    }

    if (scrollBtn) {
      scrollBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
      window.addEventListener("scroll", () => {
        if (window.scrollY > 200) scrollBtn.classList.add("visible");
        else scrollBtn.classList.remove("visible");
      }, { passive: true });
    }
  }

  /* --- 1) HEAD injection (base + overrides) --- */
  const headMarker = document.querySelector('meta[data-include-head]');
  if (headMarker) {
    try {
      const res  = await fetch(`/partials/head.html?${V}`, { cache: "no-cache" });
      const html = await res.text();
      const tmp  = document.createElement("template");
      tmp.innerHTML = html;

      tmp.content.querySelectorAll('link[rel="stylesheet"], link[rel="preconnect"], link[rel="dns-prefetch"]').forEach(link => {
        const href = link.getAttribute("href");
        if (href && document.querySelector(`link[rel="${link.getAttribute("rel")}"][href="${href}"]`)) {
          link.remove();
        }
      });

      const baseTitle = tmp.content.querySelector("title");
      if (baseTitle) baseTitle.remove();

      document.head.append(...tmp.content.childNodes);

      const pageMetaEl = document.getElementById("pageMeta");
      const meta = pageMetaEl ? JSON.parse(pageMetaEl.textContent || "{}") : {};
      const ds   = document.body.dataset;

      const title  = meta.title || ds.title || "The Gnostic Key";
      const desc   = meta.description || ds.description;
      const image  = meta.ogImage || ds.ogImage;
      const access = meta.access || ds.access || "free";

      document.title = title;

      const ensure = (selector, attrs) => {
        let el = document.head.querySelector(selector);
        if (!el) el = document.createElement("meta");
        Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
        document.head.appendChild(el);
      };

      if (desc)  ensure('meta[name="description"]', { name: "description", content: desc });
      if (image) ensure('meta[property="og:image"]', { property: "og:image", content: image });
      ensure('meta[property="og:title"]', { property: "og:title", content: title });
      if (desc) ensure('meta[property="og:description"]', { property: "og:description", content: desc });

      let accessMeta = document.head.querySelector('meta[name="tgk-access"]');
      if (!accessMeta) {
        accessMeta = document.createElement("meta");
        accessMeta.setAttribute("name","tgk-access");
        document.head.appendChild(accessMeta);
      }
      accessMeta.setAttribute("content", access);

      try {
        const { initializeAuth } = await import('/scripts/auth/auth.js');
        initializeAuth({
          premiumGuard: access === 'premium',
          vaultGate:    access === 'vault',
          adminGate:    access === 'admin'
        });
      } catch (e) {
        console.error("Auth init failed:", e);
      }
    } catch (e) {
      console.error("[TGK] Head injection failed:", e);
    }
  }

  // After injecting the HEADER partial:
const headerHost = await inject('[data-include="header"]', '/partials/header.html');
if (headerHost) {
  applyHeaderOverrides(headerHost);

  // Insert breadcrumbs into site-brand
  const siteBrand = headerHost.querySelector(".site-brand");
  const breadcrumbJSON = document.getElementById("pageBreadcrumbs");
  if (siteBrand && breadcrumbJSON) {
    try {
      const crumbs = JSON.parse(breadcrumbJSON.textContent || "[]");
      const nav = document.createElement("nav");
      nav.className = "breadcrumb-slot";
      nav.innerHTML = crumbs.map((c, i) => `
        <a href="${c.href}" class="header-link">${c.label}</a>
        ${i < crumbs.length - 1 ? '<span> | </span>' : ''}
      `).join("");
      siteBrand.appendChild(nav);
    } catch (e) {
      console.warn("[TGK] Failed to parse breadcrumbs:", e);
    }
  }
}


  /* --- 3) NAV injection --- */
  const navHost = await inject('[data-include="nav"]', '/partials/nav.html');
if (navHost) {
  bindNav();
  const repaint = () => window.__tgkAuthRefresh && window.__tgkAuthRefresh();
  if (window.__tgkAuthRefresh) {
    console.log("[TGK AUTH DEBUG] Refreshing nav immediately");
    repaint();
  } else {
    console.log("[TGK AUTH DEBUG] Auth not ready; will refresh nav on tgk:auth-ready");
    window.__tgkPendingAuthRefresh = true;
    window.addEventListener("tgk:auth-ready", repaint, { once: true });
    // tiny safety retry in case event fires early
    setTimeout(repaint, 400);
  }
}

  /* --- 4) FOOTER injection --- */
  const footerHost = await inject('[data-include="footer"]', '/partials/footer.html');
if (footerHost) {
  bindFloatingToggles();
  const repaint = () => window.__tgkAuthRefresh && window.__tgkAuthRefresh();
  if (window.__tgkAuthRefresh) {
    console.log("[TGK AUTH DEBUG] Refreshing footer immediately");
    repaint();
  } else {
    console.log("[TGK AUTH DEBUG] Auth not ready; will refresh footer on tgk:auth-ready");
    window.__tgkPendingAuthRefresh = true;
    window.addEventListener("tgk:auth-ready", repaint, { once: true });
    setTimeout(repaint, 400);
  }
}

})();

document.body.style.opacity='1'