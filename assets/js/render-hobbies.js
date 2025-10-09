async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('Failed to load ' + path);
  return await res.json();
}
function videoCard(v){
  const el = document.createElement('div');
  el.className = 'video-card';
  const src = `https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1`;
  el.innerHTML = `
    <iframe class="video-frame" src="${src}" title="${v.title}" loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    <h3 class="video-title">${v.title}</h3>`;
  return el;
}
(async ()=>{
  try{
    const data = await loadJSON('data/hobbies.json');
    const list = document.getElementById('videos-list');
    (data.youtube || []).forEach(v => list.appendChild(videoCard(v)));
    const sp = data.spotify || {};
    const wrap = document.getElementById('spotify-embed');
    if(sp.id){
      const iframe = document.createElement('iframe');
      iframe.className = 'spotify-embed';
      iframe.loading = 'lazy';
      iframe.setAttribute('allow','autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
      iframe.src = `https://open.spotify.com/embed/${sp.type || 'playlist'}/${sp.id}?utm_source=generator`;
      iframe.title = sp.title || 'Spotify playlist';
      wrap.appendChild(iframe);
    } else {
      wrap.innerHTML = '<p class="subtitle">Add your Spotify playlist ID in <code>data/hobbies.json</code>.</p>';
    }
  }catch(e){ console.error(e); }
})();