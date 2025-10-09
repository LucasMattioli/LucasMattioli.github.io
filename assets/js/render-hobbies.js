// assets/js/render-hobbies.js
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function show(where, html) {
    const el = document.getElementById(where);
    if (!el) return;
    el.insertAdjacentHTML("beforeend", html);
  }

  // 1) Si un JSON inline <script id="hobbies-data" type="application/json"> existe, on le préfère.
  function getInlineJSON() {
    const node = document.getElementById("hobbies-data");
    if (!node) return null;
    try { return JSON.parse(node.textContent); }
    catch (e) {
      show("videos-list", `<p class="subtitle" style="color:#c33">[hobbies] JSON inline invalide.</p>`);
      console.error("[hobbies] inline JSON invalid", e);
      return null;
    }
  }

  // Construit une URL ABSOLUE en même origine, évite les surprises de basePath
  function jsonURL() {
    // hobbies.html est à la racine → on résout par rapport à l’URL courante (même origine)
    return new URL("./data/hobbies.json?ts=" + Date.now(), window.location.href).toString();
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
        title="${(v.title || "YouTube").replace(/"/g, "&quot;")}"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen></iframe>
      <h3 class="video-title">${v.title || ""}</h3>`;
    return el;
  }

  ready(async () => {
    try {
      // 1) JSON inline si présent (marche même en file://)
      const inline = getInlineJSON();
      if (inline) {
        render(inline);
        return;
      }

      // 2) Sinon, JSON externe en même origine (pas de CORS), no-cache
      const url = jsonURL();
      const res = await fetch(url, {
        cache: "no-store",
        mode: "same-origin",
        credentials: "same-origin"
      });
      console.log("[hobbies] fetch", res.status, res.type, res.url);
      if (!res.ok) {
        show("videos-list", `<p class="subtitle" style="color:#c33">[hobbies] HTTP ${res.status} sur <code>${url}</code></p>`);
        return;
      }
      const data = await res.json();
      render(data);
    } catch (e) {
      console.error("[hobbies] fetch/parse error", e);
      show("videos-list", `<p class="subtitle" style="color:#c33">[hobbies] Erreur de chargement/JSON. Voir console.</p>`);
    }
  });

  function render(data){
    // YouTube
    const list = document.getElementById("videos-list");
    const arr = Array.isArray(data.youtube) ? data.youtube : [];
    if (list) {
      if (!arr.length) show("videos-list", `<p class="subtitle">Aucune vidéo dans <code>data/hobbies.json</code>.</p>`);
      arr.forEach(v => list.appendChild(videoCard(v)));
    }

    // Spotify
    const wrap = document.getElementById("spotify-embed");
    const sp = data.spotify || {};
    if (wrap) {
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
        show("spotify-embed", `<p class="subtitle">Pas d’URL/ID Spotify dans le JSON.</p>`);
      }
    }
  }
  /* ===== Chess rendering ===== */
function lichessEmbedFromUrl(url){
  try{
    const u = new URL(url);
    const parts = u.pathname.split('/').filter(Boolean); // e.g. ["study","abc123","chapter1"] ou ["abcdef"]
    // Study (avec ou sans chapitre)
    if (parts[0] === "study"){
      const id = parts[1] || "";
      const chapter = parts[2] ? `/${parts[2]}` : "";
      if (id) return `https://lichess.org/study/embed/${id}${chapter}?theme=auto&bg=auto`;
    }
    // Partie unique
    if (parts.length === 1 && /^[A-Za-z0-9]{6,8}$/.test(parts[0])) {
      return `https://lichess.org/embed/game/${parts[0]}?theme=auto&bg=auto`;
    }
    // Si l'URL est déjà un /embed/ on la garde
    if (u.pathname.includes("/embed/")) return url;
  }catch(_){}
  return url; // fallback: laisse tel quel si déjà correct
}

function chesscomEmbedFromUrl(url){
  try{
    const u = new URL(url);
    if (u.hostname.includes("chess.com")){
      // Ex: https://www.chess.com/game/live/1234567890  → id = dernier segment numérique
      const parts = u.pathname.split('/').filter(Boolean);
      const last = parts[parts.length-1];
      const id = /^\d+$/.test(last) ? last : u.searchParams.get("id");
      if (id) return `https://www.chess.com/emboard?id=${id}`;
    }
    // Si on te donne déjà une URL emboard, garde-la.
    if (u.hostname.includes("chess.com") && u.pathname.includes("/emboard")) return url;
  }catch(_){}
  return url;
}

function buildChessEmbed(embed){
  if (!embed) return null;
  // Laisse passer un HTML custom si tu le fournis un jour.
  if (embed.html) {
    const wrapper = document.createElement("div");
    wrapper.className = "chess-embed";
    wrapper.innerHTML = embed.html;
    return wrapper;
  }
  let src = (embed.url || "").trim();
  if (!src) return null;

  if ((embed.platform||"").toLowerCase().includes("lichess")){
    src = lichessEmbedFromUrl(src);
  } else if ((embed.platform||"").toLowerCase().includes("chess")){
    src = chesscomEmbedFromUrl(src);
  }
  const iframe = document.createElement("iframe");
  iframe.className = "chess-frame";
  iframe.loading = "lazy";
  iframe.setAttribute("allow", "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
  iframe.src = src;
  iframe.title = embed.title || "Chess viewer";
  const wrap = document.createElement("div");
  wrap.className = "chess-embed";
  wrap.appendChild(iframe);
  return wrap;
}

function renderChessSection(data){
  const chess = data.chess || {};
  // Embed
  const embedWrap = document.getElementById("chess-embed");
  if (embedWrap && chess.embed){
    const el = buildChessEmbed(chess.embed);
    if (el) embedWrap.appendChild(el);
  }
  // Photos
  const grid = document.getElementById("chess-photos");
  if (grid && Array.isArray(chess.photos)){
    chess.photos.forEach(p => {
      const a = document.createElement("a");
      a.href = p.src; a.target = "_blank"; a.rel = "noopener";
      const img = document.createElement("img");
      img.className = "chess-photo";
      img.src = p.src;
      img.alt = p.alt || "Chess photo";
      a.appendChild(img);
      grid.appendChild(a);
    });
  }
}

})();
