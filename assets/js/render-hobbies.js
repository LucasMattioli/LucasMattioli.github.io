(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function showError(where, msg) {
    const el = document.getElementById(where);
    if (!el) return;
    el.insertAdjacentHTML("beforeend",
      `<p class="subtitle" style="color:#c33;margin-top:8px;">[hobbies] ${msg}</p>`);
  }

  function getInlineJSON() {
    const inline = document.getElementById("hobbies-data");
    if (!inline) return null;
    try { return JSON.parse(inline.textContent); }
    catch (e) {
      showError("videos-list", "JSON inline invalide.");
      console.error("[hobbies] inline JSON invalid", e);
      return null;
    }
  }

  async function loadJSON(path) {
    // 1) Préférez l'inline si présent (marche même en file://)
    const inline = getInlineJSON();
    if (inline) return inline;

    // 2) Sinon, tente le fetch (OK en prod GitHub Pages)
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      showError("videos-list", "Impossible de charger data/hobbies.json.");
      console.error("[hobbies] fetch failed", e);
      throw e;
    }
  }

  function ytIdFrom(input) {
    const s = (input || "").trim();
    if (/^[A-Za-z0-9_-]{10,}$/.test(s)) return s;
    try {
      const u = new URL(s.replace(/^http:\/\//, "https://"));
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.replace(/^\//, ""); if (id) return id;
      }
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v"); if (v) return v;
        const m = u.pathname.match(/\/(embed|shorts)\/([A-Za-z0-9_-]{10,})/);
        if (m) return m[2];
      }
    } catch (_) {}
    return s;
  }

  function youtubeEmbedUrl(urlOrId) {
    const raw = (urlOrId || "").trim();
    try {
      const u = new URL(raw.replace(/^http:\/\//, "https://"));
      if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
        const list = u.searchParams.get("list");
        const v = u.searchParams.get("v") || ytIdFrom(raw);
        if (list && (!v || /playlist/.test(u.pathname))) {
          return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}`;
        }
        const id = ytIdFrom(v || raw);
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
    } catch (_) {
      if (/^[A-Za-z0-9_-]{10,}$/.test(raw)) {
        return `https://www.youtube.com/embed/${raw}?rel=0&modestbranding=1`;
      }
    }
    const fallback = ytIdFrom(raw);
    return `https://www.youtube.com/embed/${fallback}?rel=0&modestbranding=1`;
  }

  function spotifyEmbedUrl(kind, value) {
    const val = (value || "").trim();
    let m = val.match(/^spotify:(album|playlist|track|artist):([A-Za-z0-9]+)$/);
    if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
    try {
      const u = new URL(val.replace(/^http:\/\//, "https://"));
      if (u.hostname.includes("open.spotify.com")) {
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
          return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?utm_source=generator`;
        }
      }
    } catch (_) {}
    return `https://open.spotify.com/embed/${kind || "playlist"}/${val}?utm_source=generator`;
  }

  function videoCard(v) {
    const el = document.createElement("div");
    el.className = "video-card";
    const src = youtubeEmbedUrl(v.url || v.id || "");
    el.innerHTML = `
      <iframe class="video-frame"
        src="${src}"
        title="${(v.title || "YouTube").replace(/"/g, "&quot;")}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>
      <h3 class="video-title">${v.title || ""}</h3>`;
    return el;
  }

  ready(async () => {
    try {
      const data = await loadJSON("data/hobbies.json");

      const list = document.getElementById("videos-list");
      if (list) {
        const arr = Array.isArray(data.youtube) ? data.youtube : [];
        if (!arr.length) showError("videos-list", "Aucune vidéo dans le JSON.");
        arr.forEach(v => list.appendChild(videoCard(v)));
      } else {
        console.warn("[hobbies] #videos-list introuvable");
      }

      const wrap = document.getElementById("spotify-embed");
      if (wrap) {
        const sp = data.spotify || {};
        if (sp.id || sp.url) {
          const url = spotifyEmbedUrl(sp.type || "playlist", sp.url || sp.id);
          const iframe = document.createElement("iframe");
          iframe.className = "spotify-embed";
          iframe.loading = "lazy";
          iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
          iframe.src = url;
          iframe.title = sp.title || "Spotify playlist";
          wrap.appendChild(iframe);
        } else {
          showError("spotify-embed", "Pas d’URL/ID Spotify dans le JSON.");
        }
      }
    } catch (e) {
      // Déjà signalé via showError
    }
  });
})();
