async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('Failed to load ' + path);
  return await res.json();
}
function ytIdFrom(input){
  const s = (input||'').trim();
  if(/^[A-Za-z0-9_-]{10,}$/.test(s)) return s;
  try{
    const u = new URL(s);
    if(u.hostname.includes('youtu.be')){
      const id = u.pathname.replace(/^\//,''); if(id) return id;
    }
    if(u.hostname.includes('youtube.com')){
      const v = u.searchParams.get('v'); if(v) return v;
      const m = u.pathname.match(/\/(embed|shorts)\/([A-Za-z0-9_-]{10,})/);
      if(m) return m[2];
    }
  }catch(e){}
  return s;
}
function spotifyEmbed(kind, value){
  const val = (value||'').trim();
  let m = val.match(/^spotify:(album|playlist|track|artist):([A-Za-z0-9]+)$/);
  if(m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}?utm_source=generator`;
  try{
    const u = new URL(val);
    if(u.hostname.includes('open.spotify.com')){
      const parts = u.pathname.split('/').filter(Boolean);
      if(parts.length>=2) return `https://open.spotify.com/embed/${parts[0]}/${parts[1]}?utm_source=generator`;
    }
  }catch(e){}
  return `https://open.spotify.com/embed/${kind||'playlist'}/${val}?utm_source=generator`;
}
function videoCard(v){
  const el = document.createElement('div');
  el.className = 'video-card';
  const id = ytIdFrom(v.id || v.url || '');
  const src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
  el.innerHTML = `
    <iframe class="video-frame"
      src="${src}"
      title="${v.title||'YouTube video'}"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>
    <h3 class="video-title">${v.title||''}</h3>`;
  return el;
}
(async ()=>{
  try{
    const data = await loadJSON('data/hobbies.json');
    const list = document.getElementById('videos-list');
    (data.youtube||[]).forEach(v => list.appendChild(videoCard(v)));
    const sp = data.spotify||{};
    const wrap = document.getElementById('spotify-embed');
    if(sp.id || sp.url){
      const url = spotifyEmbed(sp.type||'playlist', sp.id||sp.url);
      const iframe = document.createElement('iframe');
      iframe.className = 'spotify-embed';
      iframe.loading = 'lazy';
      iframe.setAttribute('allow','autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture');
      iframe.src = url;
      iframe.title = sp.title || 'Spotify playlist';
      wrap.appendChild(iframe);
    } else {
      wrap.innerHTML = '<p class="subtitle">Add your Spotify playlist ID or URL in <code>data/hobbies.json</code>.</p>';
    }
  }catch(e){ console.error(e); }
})();