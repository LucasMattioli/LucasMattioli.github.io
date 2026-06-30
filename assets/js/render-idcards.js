// assets/js/render-idcards.js
(function () {
  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  function getInlineJSON() {
    const node = document.getElementById("idcards-data");
    if (!node) return null;
    try { return JSON.parse(node.textContent); }
    catch (e) {
      console.error("[idcards] inline JSON invalid", e);
      const list = document.getElementById("idcards-list");
      if (list) list.innerHTML =
        '<p class="subtitle" style="color:#c33">[idcards] Invalid inline JSON. Check the &lt;script id="idcards-data"&gt; block.</p>';
      return null;
    }
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function cardEl(c) {
    const el = document.createElement("article");
    el.className = "idcard";

    const tags = Array.isArray(c.tags) && c.tags.length
      ? `<div class="idcard__tags">${c.tags.map(t => `<span class="idcard__tag">${esc(t)}</span>`).join("")}</div>`
      : "";

    const links = Array.isArray(c.links) && c.links.length
      ? `<div class="idcard__links">${c.links.map(l =>
          `<a class="idcard__link" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || "Link")}</a>`
        ).join("")}</div>`
      : "";

    const summary = c.summary
      ? `<p class="idcard__summary">${esc(c.summary)}</p>`
      : "";

    el.innerHTML = `
      <figure class="idcard__figure">
        <img class="idcard__img" src="${esc(c.img)}" alt="${esc(c.title || "Method slide")}" loading="lazy" />
      </figure>
      <h3 class="idcard__title">${esc(c.title || "")}</h3>
      ${summary}
      ${tags}
      ${links}`;

    // Click image to open lightbox
    const img = el.querySelector(".idcard__img");
    if (img) img.addEventListener("click", () => openLightbox(c.img, c.title));

    return el;
  }

  function openLightbox(src, alt) {
    const box = document.getElementById("idcard-lightbox");
    if (!box) return;
    const img = box.querySelector(".idcard-lightbox__img");
    img.src = src;
    img.alt = alt || "";
    box.hidden = false;
  }

  function wireLightbox() {
    const box = document.getElementById("idcard-lightbox");
    if (!box) return;
    const close = () => { box.hidden = true; box.querySelector(".idcard-lightbox__img").src = ""; };
    box.querySelector(".idcard-lightbox__close").addEventListener("click", close);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.hidden) close(); });
  }

  ready(() => {
    wireLightbox();
    const data = getInlineJSON();
    if (!data) return;
    const list = document.getElementById("idcards-list");
    const cards = Array.isArray(data.cards) ? data.cards : [];
    if (!list) return;
    if (!cards.length) {
      list.innerHTML = '<p class="subtitle">No cards defined yet.</p>';
      return;
    }
    cards.forEach(c => list.appendChild(cardEl(c)));
  });
})();
