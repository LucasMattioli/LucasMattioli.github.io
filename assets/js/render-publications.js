// render-publications.js: render publications and news from JSON
async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('Failed to load ' + path);
  return await res.json();
}

// Détection du ratio pour appliquer .is-wide / .is-tall
function flagAspect(img){
  const set = () => {
    const r = img.naturalWidth / img.naturalHeight;
    if (!isFinite(r) || !r) return;
    if (r >= 1.8) img.classList.add('is-wide');   // panoramique
    else if (r <= 0.7) img.classList.add('is-tall'); // très vertical
  };
  if (img.complete) set();
  else img.addEventListener('load', set, { once: true });
}

function pubCard(pub){
  const el = document.createElement('article');
  el.className = 'pub-card';
  el.innerHTML = `
    <img class="pub-card__img" src="${pub.thumbnail}" alt="Thumbnail of ${pub.title}">
    <div>
      <h3 class="pub-card__title">${pub.title}</h3>
      <div class="pub-card__meta">${pub.authors} · ${pub.venue}</div>
      ${pub.summary ? `<p class="pub-card__summary">${pub.summary}</p>` : ''}
      <div class="pub-card__links">
        ${pub.pdf ? `<a class="chip" href="${pub.pdf}">PDF</a>` : ''}
        ${pub.code ? `<a class="chip" href="${pub.code}">Code</a>` : ''}
      </div>
    </div>`;

  // Taguer l'image selon son ratio
  const img = el.querySelector('.pub-card__img');
  if (img) flagAspect(img);

  return el;
}

(async () => {
  // Publications
  try {
    const listEl = document.getElementById('publications-list');
    const pubs = await loadJSON('data/publications.json');
    pubs.forEach(p => listEl.appendChild(pubCard(p)));
  } catch(e){ console.error(e); }

  // News
  try {
    const newsEl = document.getElementById('news-list');
    const news = await loadJSON('data/news.json');
    news.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n.date + ': ' + n.text;
      newsEl.appendChild(li);
    });
  } catch(e){ console.error(e); }
})();
