// render-publications.js — rend une section par article
async function loadJSON(path){
  const res = await fetch(path, { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to load '+path);
  return await res.json();
}

const slugify = s =>
  (s || '')
    .toLowerCase()
    .replace(/&/g,' and ')
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/(^-|-$)/g,'');

function flagAspect(img){
  const set = () => {
    const r = img.naturalWidth / img.naturalHeight;
    if (!isFinite(r) || !r) return;
    if (r >= 1.8) img.classList.add('is-wide');
    else if (r <= 0.7) img.classList.add('is-tall');
  };
  if (img.complete) set();
  else img.addEventListener('load', set, { once: true });
}

function pubSection(pub){
  const id = pub.id || slugify(pub.title);
  const el = document.createElement('section');
  el.className = 'card pub-section';
  el.id = id;

  el.innerHTML = `
    <header class="pub-header">
      <h3 class="pub-title">${pub.title}</h3>
      <div class="pub-meta">
        ${pub.authors ? `<span class="pub-authors">${pub.authors}</span>` : ''}
        ${pub.venue ? `<span class="sep">·</span><span class="pub-venue">${pub.venue}</span>` : ''}
        ${pub.year ? `<span class="sep">·</span><span class="pub-year">${pub.year}</span>` : ''}
        ${pub.summary ? `<p class="pub-summary">${pub.summary}</p>` : ''}
      </div>
    </header>

    <div class="pub-body">
      
      ${pub.thumbnail ? `<img class="pub-img" src="${pub.thumbnail}" alt="Thumbnail of ${pub.title}">` : ''}
      
    </div>

    <footer class="pub-links">
      ${pub.pdf ? `<a class="chip btn-pdf" href="${pub.pdf}" target="_blank" rel="noopener">PDF</a>` : ''}
      ${pub.code ? `<a class="chip" href="${pub.code}" target="_blank" rel="noopener">Code</a>` : ''}
      ${pub.page ? `<a class="chip" href="${pub.page}" target="_blank" rel="noopener">Project</a>` : ''}
    </footer>
  `;

  const img = el.querySelector('.pub-img');
  if (img) flagAspect(img);

  return { id, el, title: pub.title };
}

(async () => {
  try {
    const container = document.getElementById('works');
    const toc = document.getElementById('pubs-toc');
    if(!container) return;

    const pubs = await loadJSON('data/publications.json');

    // Option: tri du + récent au + ancien
    pubs.sort((a,b) => (b.year||0) - (a.year||0));

    const items = pubs.map(pubSection);
    items.forEach(({el}) => container.appendChild(el));

    // Mini sommaire (facultatif)
    if (toc){
      toc.innerHTML = items.map(i =>
        `<a href="#${i.id}" class="toc-link">${i.title}</a>`
      ).join('');
    }
  } catch(e){
    console.error(e);
  }
})();
