// theme.js: simple light/dark toggle using localStorage
(function(){
  const root = document.documentElement;
  const btn = document.getElementById('themeBtn');
  const stored = localStorage.getItem('theme');
  if(stored === 'dark'){ root.classList.add('dark'); }
  if(btn){
    btn.addEventListener('click', ()=>{
      const isDark = root.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
  // Optional dark overrides (kept minimal for simplicity)
  const apply = () => {
    const dark = root.classList.contains('dark');
    if(dark){
      root.style.setProperty('--bg','#0b0e14');
      root.style.setProperty('--surface','#0f1420');
      root.style.setProperty('--text','#F3F3E0');
      root.style.setProperty('--muted','#CBDCEB');
    } else {
      root.style.removeProperty('--bg');
      root.style.removeProperty('--surface');
      root.style.removeProperty('--text');
      root.style.removeProperty('--muted');
    }
  };
  new MutationObserver(apply).observe(root,{attributes:true,attributeFilter:['class']});
  apply();
})();