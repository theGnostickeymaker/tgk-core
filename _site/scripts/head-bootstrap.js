// /scripts/head-bootstrap.js
(function () {
  var V = "v=4";
  var url = "/partials/head.html?" + V;
  var revealed = false;

  // Map of accent overlays (same paths as accents.css)
  var overlays = {
    lightgold: {
      light: "/TGK-assets/images/backgrounds/tgk-default-light-overlay.png",
      dark:  "/TGK-assets/images/backgrounds/tgk-default-dark-overlay.png",
    },
    gold: {
      light: "/TGK-assets/images/backgrounds/tgk-gold-light-overlay.png",
      dark:  "/TGK-assets/images/backgrounds/tgk-gold-dark-overlay.png",
    },
    eye: {
      light: "/TGK-assets/images/backgrounds/tgk-eye-light-overlay.png",
      dark:  "/TGK-assets/images/backgrounds/tgk-eye-dark-overlay.png",
    },
    obsidian: {
      light: "/TGK-assets/images/backgrounds/tgk-obsidian-light-overlay.png",
      dark:  "/TGK-assets/images/backgrounds/tgk-obsidian-dark-overlay.png",
    },
    vault: {
      light: "/TGK-assets/images/backgrounds/tgk-vault-light-overlay.png",
      dark:  "/TGK-assets/images/backgrounds/tgk-vault-dark-overlay.png",
    },
    resonant: {
      light: "/TGK-assets/images/backgrounds/tgk-resonant-light-overlay.png",
      dark:  "/TGK-assets/images/backgrounds/tgk-resonant-dark-overlay.png",
    }
  };

  function getPillar() {
    if (!document.body) return "lightgold";
    var cls = document.body.className.split(/\s+/);
    return cls.find(function (c) { return overlays.hasOwnProperty(c); }) || "lightgold";
  }
  function getTheme() {
    return (document.documentElement.dataset.theme || "dark").toLowerCase() === "light" ? "light" : "dark";
  }

  function paintEarlyOnHtml() {
    if (!document.body) { requestAnimationFrame(paintEarlyOnHtml); return; }
    var pillar = getPillar();
    var theme = getTheme();
    var src = overlays[pillar][theme];
    if (!src) return;

    // start image preload (cheap)
    var preload = document.createElement("link");
    preload.rel = "preload"; preload.as = "image"; preload.href = src;
    document.head.appendChild(preload);

    // Paint overlay directly on <html> so nothing can cover it
    var html = document.documentElement;
    html.style.backgroundImage = 'var(--overlay-bg-gradient, none), url("' + src + '")';
    html.style.backgroundPosition = "center";
    html.style.backgroundRepeat = "no-repeat";
    html.style.backgroundSize = "cover";
  }

  // Reveal body
  function reveal() {
    if (revealed) return;
    revealed = true;
    try { document.body.style.opacity = "1"; } catch(e){}
  }

  // When accents.css is loaded and #bg-overlay has a real background, clear the inline html background
  function handOffToAccents() {
    var tries = 0;
    (function check() {
      var overlayEl = document.getElementById("bg-overlay");
      var hasCss = !!document.querySelector('link[rel="stylesheet"][href*="/themes/accents.css"]');
      if (!overlayEl || !hasCss) { // wait a bit longer
        if (tries++ < 40) return setTimeout(check, 50);
        return; // give up silently
      }
      var bg = getComputedStyle(overlayEl).backgroundImage;
      if (bg && bg !== "none") {
        // clear the inline so accents.css owns it
        var html = document.documentElement;
        html.style.backgroundImage = "";
        html.style.backgroundPosition = "";
        html.style.backgroundRepeat = "";
        html.style.backgroundSize = "";
      } else if (tries++ < 40) {
        setTimeout(check, 50);
      }
    })();
  }

  paintEarlyOnHtml();

  // Fallback reveal in case styles are slow
  setTimeout(reveal, 900);

  // Fetch head partial to race CSS as before
  fetch(url, { cache: "no-cache" })
    .then(function (r) { return r.ok ? r.text() : ""; })
    .then(function (html) {
      if (!html) return;
      var tmp = document.createElement("template");
      tmp.innerHTML = html;

      // Inject CSS ASAP; reveal when core sheet lands
      tmp.content.querySelectorAll('link[rel="stylesheet"]').forEach(function (link) {
        var href = link.getAttribute("href") || "";
        var el = link.cloneNode();
        if (/\/css\/TGK-main-styles\/gnostic-core\.css/i.test(href)) {
          el.addEventListener("load", reveal, { once: true });
        }
        if (/\/css\/TGK-main-styles\/themes\/accents\.css/i.test(href)) {
          el.addEventListener("load", handOffToAccents, { once: true });
        }
        if (!document.querySelector('link[rel="stylesheet"][href="' + href + '"]')) {
          document.head.appendChild(el);
        }
      });

      // Preconnects/fonts quickly
      tmp.content.querySelectorAll('link[rel="preconnect"], link[rel="dns-prefetch"]').forEach(function (lnk) {
        var href = lnk.getAttribute("href");
        if (href && !document.querySelector('link[rel="' + lnk.getAttribute("rel") + '"][href="' + href + '"]')) {
          document.head.appendChild(lnk.cloneNode());
        }
      });
    })
    .catch(function(){ /* noop; fall back to timeout reveal */ });
})();
