(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }
  async function loadJSON(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (e) {
      console.warn("[hobbies] fetch failed, fallback to inline JSON:", e);
      const inline = document.getElementById("hobbies-data");
      if (inline) {
        try { return JSON.parse(inline.textContent); }
        catch (e2) { console.error("[hobbies] inline JSON invalid", e2); }
      }
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
    const id = ytIdFrom(raw);
    return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
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
        title="${(v.title || "YouTube video").replace(/"/g, "&quot;) }"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen>
      </iframe>
      <h3 class="video-title">${v.title || ""}</h3>`;
    return el;
  }
  ready(async () => {
    try {
      const data = await loadJSON("data/hobbies.json");
      const list = document.getElementById("videos-list");
      if (list) (data.youtube || []).forEach(v => list.appendChild(videoCard(v)));
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
          wrap.innerHTML = '<p class="subtitle">Ajoute l’URL complète (ou l’ID) de ta playlist dans <code>data/hobbies.json</code>.</p>';
        }
      }
    } catch (e) {
      console.error("[hobbies] fatal:", e);
      const list = document.getElementById("videos-list");
      if (list) list.innerHTML = '<p class="subtitle">Impossible de charger les vidéos. Vérifie le chemin de <code>data/hobbies.json</code>.</p>';
      const wrap = document.getElementById("spotify-embed");
      if (wrap) wrap.innerHTML = '<p class="subtitle">Impossible de charger la playlist Spotify.</p>';
    }
  });
})();